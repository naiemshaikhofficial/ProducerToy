import { NextResponse } from 'next/server'
import { fetchMusicNewsFeedItems, extractDirectDealInfo } from '@/lib/news/newsSources'
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

      // Automatically extract direct developer/merchant deal URL & coupon code first
      if (!item.directDealUrl) {
        const dealInfo = await extractDirectDealInfo(item.link)
        if (dealInfo?.bestUrl) {
          item.directDealUrl = dealInfo.bestUrl
        }
        if (dealInfo?.couponCode && !(item as any).couponCode) {
          (item as any).couponCode = dealInfo.couponCode
        }
        if (dealInfo?.expiryTimeline && !(item as any).expiryTimeline) {
          (item as any).expiryTimeline = dealInfo.expiryTimeline
        }
      }

      // Check if this product or deal already exists in the database
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

      // Strict Quality Gate: Future articles MUST have a valid, non-empty, non-placeholder image
      if (
        !article.cover_image ||
        article.cover_image.includes('placeholder') ||
        article.cover_image.includes('photo-1598488035139-bdbb2231ce04')
      ) {
        console.warn(`[News Sync] Skipping article without valid image: "${article.title}"`)
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
