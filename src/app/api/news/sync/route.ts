import { NextResponse, after } from 'next/server'
import { revalidatePath } from 'next/cache'
import {
  fetchMusicNewsFeedItems,
  extractDirectDealInfo,
  verifyArticleQuality,
  resolvePluginBoutiqueProductUrl,
  resolveAuthenticProductDealUrl,
  isFreePluginItem,
  RawFeedItem,
} from '@/lib/news/newsSources'
import { rewriteNewsWithGroq } from '@/lib/news/groqNewsEngine'
import { findExistingArticle, saveNewsArticle, getNewsArticles } from '@/lib/turso/newsDb'
import { detectDealExpiry, parseExpiryDateText } from '@/lib/news/dealExpiry'
import { getTopicSignature } from '@/lib/news/topicDeduplication'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 60 seconds

let isSyncing = false
let syncStartTime = 0
const SYNC_LOCK_TTL_MS = 120_000 // 2 minutes auto-expiration

export async function GET(req: Request) {
  return handleSync(req)
}

export async function POST(req: Request) {
  return handleSync(req)
}

async function handleSync(req: Request) {
  const url = new URL(req.url)
  const secret = url.searchParams.get('secret')
  const authHeader = req.headers.get('authorization')
  const limitParam = parseInt(url.searchParams.get('limit') || '2', 10)
  const shouldWait = url.searchParams.get('wait') === 'true'

  // Optional auth check: if CRON_SECRET is set, verify either query param or Bearer header
  if (process.env.CRON_SECRET) {
    const bearerSecret = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null
    const providedSecret = secret || bearerSecret
    if (providedSecret && providedSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // Prevent concurrent overlapping sync runs (auto-expire after 2 mins if a previous run crashed or timed out)
  const isCurrentlySyncing = isSyncing && Date.now() - syncStartTime < SYNC_LOCK_TTL_MS
  if (isCurrentlySyncing) {
    return NextResponse.json({
      success: true,
      status: 'already_syncing',
      message: 'A news synchronization job is already running in the background.',
      timestamp: new Date().toISOString(),
    })
  }

  // Synchronous mode (if explicitly requested with ?wait=true)
  if (shouldWait) {
    isSyncing = true
    syncStartTime = Date.now()
    try {
      const result = await executeSyncJob(limitParam)
      return NextResponse.json(result)
    } catch (err: any) {
      console.error('[News Sync Error]:', err)
      return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 })
    } finally {
      isSyncing = false
      syncStartTime = 0
    }
  }

  // Asynchronous Background Mode (Default):
  // Return instant 200 OK response to browser/Cloudflare to prevent 504 Gateway Timeouts,
  // then execute the full synchronization in Next.js after() background lifecycle.
  isSyncing = true
  syncStartTime = Date.now()
  after(async () => {
    try {
      await executeSyncJob(limitParam)
    } catch (err: any) {
      console.error('[Background News Sync Error]:', err)
    } finally {
      isSyncing = false
      syncStartTime = 0
    }
  })

  return NextResponse.json({
    success: true,
    status: 'sync_started',
    message: `Producer Toy News Sync started in background (target: ${limitParam} articles). Fresh deals will appear on /news shortly.`,
    timestamp: new Date().toISOString(),
  })
}

async function executeSyncJob(limitParam: number) {
  console.log(`[News Sync] Starting news synchronization job (target: ${limitParam} articles)...`)
  const rawFeedItems = await fetchMusicNewsFeedItems()
  let processedCount = 0
  let skippedCount = 0
  const processedTitles: string[] = []
  const savedSlugs: string[] = []
  const postedSignaturesInRun = new Set<string>()

  // DEDUPLICATION: Eliminate duplicate items across different RSS feeds covering the exact same plugin
  const seenFeedKeys = new Set<string>()
  const feedItems: RawFeedItem[] = []
  for (const item of rawFeedItems) {
    const sig = getTopicSignature(item.title)
    const normUrl = (item.directDealUrl || item.link || '').toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '')
    const key = sig || normUrl
    if (key && seenFeedKeys.has(key)) {
      continue
    }
    if (key) seenFeedKeys.add(key)
    feedItems.push(item)
  }

  // CANDIDATE ALLOCATION:
  // Prioritize FREE PLUGINS mostly (~70%), while allowing top verified DEALS that follow our rules
  const freeCandidates = feedItems.filter((it) => isFreePluginItem(it))
  const dealCandidates = feedItems.filter((it) => !isFreePluginItem(it))

  let targetFree = 1
  if (limitParam === 1) {
    targetFree = freeCandidates.length > 0 ? 1 : 0
  } else if (limitParam === 2) {
    targetFree = freeCandidates.length > 0 ? 1 : 0
  } else {
    targetFree = Math.min(freeCandidates.length, Math.ceil(limitParam * 0.7))
  }

  const candidates: RawFeedItem[] = []
  let fIdx = 0
  let dIdx = 0

  // 1. Pick target free candidates first
  while (candidates.length < targetFree && fIdx < freeCandidates.length) {
    candidates.push(freeCandidates[fIdx++])
  }

  // 2. Pick target verified deal candidates
  const targetDeals = limitParam - candidates.length
  let dealsAdded = 0
  while (dealsAdded < targetDeals && dIdx < dealCandidates.length) {
    candidates.push(dealCandidates[dIdx++])
    dealsAdded++
  }

  // 3. Fallbacks to guarantee enough items to reach limitParam
  while (candidates.length < limitParam && fIdx < freeCandidates.length) {
    candidates.push(freeCandidates[fIdx++])
  }
  while (candidates.length < limitParam && dIdx < dealCandidates.length) {
    candidates.push(dealCandidates[dIdx++])
  }

  // 4. Append remaining candidates in priority order as backup in case any items get skipped
  while (fIdx < freeCandidates.length) {
    candidates.push(freeCandidates[fIdx++])
  }
  while (dIdx < dealCandidates.length) {
    candidates.push(dealCandidates[dIdx++])
  }

  for (const item of candidates) {
    if (processedCount >= limitParam) break

    const isFree = isFreePluginItem(item)

    // STRICT RULES FOR DEALS:
    // If item is a paid deal, check that it is NOT expired
    if (!isFree && item.expiryTimeline) {
      const expCheck = parseExpiryDateText(item.expiryTimeline)
      if (expCheck && expCheck.isExpired) {
        console.log(`[News Sync] Skipping expired deal: "${item.title}"`)
        skippedCount++
        continue
      }
    }

    const slug = item.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .slice(0, 90)

    // 1. FAST CHECK: If this product/article already exists and is fresh (<24h), skip scraping & LLM entirely!
    const existingArticle = await findExistingArticle({
      feedLink: item.link,
      directDealUrl: item.directDealUrl,
      sourceUrl: item.directDealUrl || item.link,
      coverImage: item.imageUrl,
      title: item.title,
      slug,
    })

    if (existingArticle) {
      const existingExpiry = detectDealExpiry(existingArticle)
      const isOlderThan24h =
        Date.now() - new Date(existingArticle.published_at).getTime() > 24 * 60 * 60 * 1000

      // If it's already active and fresh (within 24h), skip redundant LLM rewrite
      if (!existingExpiry.isExpired && !isOlderThan24h) {
        skippedCount++
        continue
      }

      console.log(
        `[News Sync] Reactivating / Replacing existing deal for "${existingArticle.title}" with new offer`
      )
    }

    // 1. ALWAYS extract direct developer / merchant deal URL, cover image & pricing from article link (item.link) FIRST!
    if (!item.dealPrice || !item.imageUrl || !item.directDealUrl) {
      const dealInfo = await extractDirectDealInfo(item.link || item.directDealUrl)
      if (dealInfo) {
        if (dealInfo.bestUrl) {
          item.directDealUrl = dealInfo.bestUrl
        }
        if (dealInfo.couponCode && !(item as any).couponCode) {
          (item as any).couponCode = dealInfo.couponCode
        }
        if (dealInfo.expiryTimeline && !(item as any).expiryTimeline) {
          (item as any).expiryTimeline = dealInfo.expiryTimeline
        }
        if (dealInfo.dealPrice && !(item as any).dealPrice) {
          (item as any).dealPrice = dealInfo.dealPrice
        }
        if (dealInfo.regularPrice && !(item as any).regularPrice) {
          (item as any).regularPrice = dealInfo.regularPrice
        }
        if (dealInfo.discount && !(item as any).discount) {
          (item as any).discount = dealInfo.discount
        }
        if (dealInfo.coverImage && !item.imageUrl) {
          item.imageUrl = dealInfo.coverImage
        }
        // Strict: If verified as NOT an active deal (e.g. regular price only), skip it!
        if (!isFree && dealInfo.isDealActive === false) {
          console.log(`[News Sync] Skipping non-discounted product: "${item.title}"`)
          skippedCount++
          continue
        }
      }
    }

    // 2. Only if item STILL has no direct deal URL after extracting from the article page:
    if (!item.directDealUrl && item.title) {
      item.directDealUrl = await resolveAuthenticProductDealUrl(item.title, isFree)
    } else if (
      !isFree &&
      item.directDealUrl &&
      (item.directDealUrl.includes('/deals/') ||
        item.directDealUrl.includes('/manufacturers/') ||
        item.directDealUrl.includes('/articles/')) &&
      item.title
    ) {
      // If deal URL points to a generic deals collection hub or promo article, resolve exact product page
      const exactProduct = await resolvePluginBoutiqueProductUrl(item.title)
      if (exactProduct && exactProduct.includes('/product/')) {
        item.directDealUrl = exactProduct
      }
    }

    // Strict deal rule: If it's a paid product with no discount or verified sale, skip it!
    if (
      !isFree &&
      !item.discount &&
      !item.dealPrice &&
      !item.title.toLowerCase().includes('deal') &&
      !item.title.toLowerCase().includes('sale')
    ) {
      console.log(`[News Sync] Skipping non-deal product lacking verified discount: "${item.title}"`)
      skippedCount++
      continue
    }

    // Rewrite with Groq AI Llama 3.3 & save to Turso
    const article = await rewriteNewsWithGroq(item)

    // Post-rewrite deduplication check: If an article covering this exact topic already exists, merge in-place
    let canonicalTarget = existingArticle
    if (!canonicalTarget) {
      canonicalTarget = await findExistingArticle({ title: article.title })
    }

    if (canonicalTarget) {
      article.id = canonicalTarget.id
      article.slug = canonicalTarget.slug
      article.created_at = canonicalTarget.created_at
      article.published_at = new Date().toISOString()
    } else {
      const cleanSlug = article.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80)
        .replace(/-$/, '')
      if (cleanSlug.length >= 5) {
        article.slug = cleanSlug
      }
    }

    // Strict Quality Gate: ONLY accept articles with verified, working deal links and authentic HD images
    const qualityCheck = await verifyArticleQuality(article)
    if (!qualityCheck.isValid) {
      console.warn(`[News Sync Quality Gate] Rejecting article "${article.title}": ${qualityCheck.reason}`)
      skippedCount++
      continue
    }

    const saved = await saveNewsArticle(article)

    if (saved) {
      processedCount++
      processedTitles.push(article.title)
      savedSlugs.push(article.slug)

      // Automatically dispatch newly saved article to Telegram channel (deduplicated by topic)
      const topicSig = getTopicSignature(article.title)
      if (topicSig && postedSignaturesInRun.has(topicSig)) {
        console.log(`[News Sync] Skipping duplicate Telegram post for "${article.title}" in current sync run`)
      } else {
        if (topicSig) postedSignaturesInRun.add(topicSig)
        try {
          const { postArticleToTelegram } = await import('@/lib/telegram/newsPoster')
          await postArticleToTelegram(article)
        } catch (tgErr: any) {
          console.warn('[News Sync Telegram Dispatch Error]:', tgErr?.message || tgErr)
        }
      }
    }
  }

  // Automated Expiry Sweep: Detect any active deals in DB whose validity period has elapsed and mark as EXPIRED
  let expiredSweptCount = 0
  try {
    const recentArticles = await getNewsArticles({ limit: 60 })
    const expiredUpdates = recentArticles
      .filter((existingItem) => {
        if (existingItem.badge?.toUpperCase() === 'EXPIRED') return false
        const exp = detectDealExpiry(existingItem)
        return exp.isExpired
      })
      .map(async (existingItem) => {
        existingItem.badge = 'EXPIRED'
        existingItem.specs = { ...(existingItem.specs || {}), Status: 'Expired' }
        await saveNewsArticle(existingItem)
        expiredSweptCount++
      })

    if (expiredUpdates.length > 0) {
      await Promise.allSettled(expiredUpdates)
      console.log(`[News Sync] Automated Expiry Sweep marked ${expiredSweptCount} deals as EXPIRED in DB`)
    }
  } catch (sweepErr: any) {
    console.warn('[News Sync Expiry Sweep Warning]:', sweepErr?.message || sweepErr)
  }

  // Automatically submit new article URLs to IndexNow & search engine crawlers for instantaneous indexing
  let indexNowResult: any = null
  if (savedSlugs.length > 0) {
    try {
      const { submitIndexNowUrls } = await import('@/lib/seo/indexing')
      const urlsToPing = [
        'https://producertoy.com/news',
        'https://producertoy.com/sitemap.xml',
        'https://producertoy.com/news-sitemap.xml',
        ...savedSlugs.map((s) => `https://producertoy.com/news/${s}`),
      ]
      indexNowResult = await submitIndexNowUrls(urlsToPing)
      console.log(`[News Sync] Successfully submitted ${urlsToPing.length} URLs to IndexNow & search engines`)
    } catch (indexErr: any) {
      console.warn('[News Sync] Failed to ping IndexNow:', indexErr?.message || indexErr)
    }
  }

  // On-Demand Edge Cache Purge: Only purge static CDN cache if new articles were added or deals expired
  if (processedCount > 0 || expiredSweptCount > 0) {
    try {
      revalidatePath('/news')
      revalidatePath('/sitemap.xml')
      revalidatePath('/news-sitemap.xml')
      for (const slug of savedSlugs) {
        revalidatePath(`/news/${slug}`)
      }
      console.log(`[News Sync] Successfully purged edge cache for /news, sitemaps, and ${savedSlugs.length} articles`)
    } catch (revErr: any) {
      console.warn('[News Sync] Cache revalidation warning:', revErr?.message || revErr)
    }
  }

  return {
    success: true,
    processed: processedCount,
    skipped: skippedCount,
    newArticles: processedTitles,
    indexedUrls: savedSlugs.length,
    indexNow: indexNowResult,
    feedCountTotal: feedItems.length,
  }
}
