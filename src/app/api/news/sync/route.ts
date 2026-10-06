import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import {
  fetchMusicNewsFeedItems,
  extractDirectDealInfo,
  verifyArticleQuality,
  resolvePluginBoutiqueProductUrl,
  resolveAuthenticProductDealUrl,
} from '@/lib/news/newsSources'
import { rewriteNewsWithGroq } from '@/lib/news/groqNewsEngine'
import { findExistingArticle, saveNewsArticle, getNewsArticles } from '@/lib/turso/newsDb'
import { detectDealExpiry } from '@/lib/news/dealExpiry'

export const dynamic = 'force-dynamic'
export const maxDuration = 60 // 60 seconds

export async function GET(req: Request) {
  return handleSync(req)
}

export async function POST(req: Request) {
  return handleSync(req)
}

async function handleSync(req: Request) {
  try {
    const url = new URL(req.url)
    const secret = url.searchParams.get('secret')
    const authHeader = req.headers.get('authorization')
    const limitParam = parseInt(url.searchParams.get('limit') || '2', 10)

    // Optional auth check: if CRON_SECRET is set, verify either query param or Bearer header
    if (process.env.CRON_SECRET) {
      const bearerSecret = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null
      const providedSecret = secret || bearerSecret
      if (providedSecret && providedSecret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const feedItems = await fetchMusicNewsFeedItems()
    let processedCount = 0
    let skippedCount = 0
    const processedTitles: string[] = []
    const savedSlugs: string[] = []

    for (const item of feedItems) {
      if (processedCount >= limitParam) break

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

      // 2. If item is from Telegram and has no direct deal URL, resolve authentic product deal URL
      if (item.sourceName.includes('Telegram') && !item.directDealUrl && item.title) {
        item.directDealUrl = await resolveAuthenticProductDealUrl(item.title)
      }

      // 3. Extract direct developer/merchant deal URL & live pricing ONLY if needed
      if (!item.dealPrice || !item.imageUrl || !item.directDealUrl) {
        const dealInfo = await extractDirectDealInfo(item.directDealUrl || item.link)
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
          if (dealInfo.coverImage) {
            item.imageUrl = dealInfo.coverImage
          }
          // Strict: If verified as NOT an active deal (e.g. regular price only), skip it!
          if (dealInfo.isDealActive === false) {
            console.log(`[News Sync] Skipping non-discounted product: "${item.title}"`)
            skippedCount++
            continue
          }
        }
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
        // Re-timestamp to current time so the refreshed deal bubbles to the top of the feed
        article.published_at = new Date().toISOString()
      } else {
        // Genuinely new article: ensure slug accurately reflects the rewritten clean headline
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
      }
    }

    // Automated Expiry Sweep: Detect any active deals in DB whose validity period has elapsed and mark as EXPIRED
    let expiredSweptCount = 0
    try {
      const recentArticles = await getNewsArticles({ limit: 60 })
      for (const existingItem of recentArticles) {
        if (existingItem.badge?.toUpperCase() !== 'EXPIRED') {
          const exp = detectDealExpiry(existingItem)
          if (exp.isExpired) {
            existingItem.badge = 'EXPIRED'
            existingItem.specs = { ...(existingItem.specs || {}), Status: 'Expired' }
            await saveNewsArticle(existingItem)
            expiredSweptCount++
          }
        }
      }
      if (expiredSweptCount > 0) {
        console.log(`[News Sync] Automated Expiry Sweep marked ${expiredSweptCount} deals as EXPIRED in DB`)
      }
    } catch (sweepErr: any) {
      console.warn('[News Sync Expiry Sweep Warning]:', sweepErr?.message || sweepErr)
    }

    // Automatically submit new article URLs to IndexNow for instantaneous search engine indexing
    let indexNowResult: any = null
    if (savedSlugs.length > 0) {
      try {
        const { submitIndexNowUrls } = await import('@/lib/seo/indexing')
        const urlsToPing = [
          'https://producertoy.com/news',
          ...savedSlugs.map((s) => `https://producertoy.com/news/${s}`),
        ]
        indexNowResult = await submitIndexNowUrls(urlsToPing)
        console.log(`[News Sync] Successfully submitted ${urlsToPing.length} URLs to IndexNow`)
      } catch (indexErr: any) {
        console.warn('[News Sync] Failed to ping IndexNow:', indexErr?.message || indexErr)
      }
    }

    // On-Demand Edge Cache Purge: Only purge static CDN cache if new articles were added or deals expired
    // Keeps Vercel Edge & Turso DB usage at 0 for all regular visitors
    if (processedCount > 0 || expiredSweptCount > 0) {
      try {
        revalidatePath('/news')
        for (const slug of savedSlugs) {
          revalidatePath(`/news/${slug}`)
        }
        console.log(`[News Sync] Successfully purged edge cache for /news and ${savedSlugs.length} articles`)
      } catch (revErr: any) {
        console.warn('[News Sync] Cache revalidation warning:', revErr?.message || revErr)
      }
    }

    // Get current total count
    const existing = await getNewsArticles({ limit: 1 })

    return NextResponse.json({
      success: true,
      processed: processedCount,
      skipped: skippedCount,
      newArticles: processedTitles,
      indexedUrls: savedSlugs.length,
      indexNow: indexNowResult,
      feedCountTotal: feedItems.length,
    })
  } catch (err: any) {
    console.error('[News Sync Error]:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
