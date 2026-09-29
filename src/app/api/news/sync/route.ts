import { NextResponse } from 'next/server'
import { fetchMusicNewsFeedItems } from '@/lib/news/newsSources'
import { rewriteNewsWithGroq } from '@/lib/news/groqNewsEngine'
import { articleExists, saveNewsArticle, getNewsArticles } from '@/lib/turso/newsDb'

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
    const limitParam = parseInt(url.searchParams.get('limit') || '5', 10)

    // Optional auth check: if CRON_SECRET is set, verify
    if (process.env.CRON_SECRET && secret && secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const feedItems = await fetchMusicNewsFeedItems()
    let processedCount = 0
    let skippedCount = 0
    const processedTitles: string[] = []

    for (const item of feedItems.slice(0, 15)) {
      if (processedCount >= limitParam) break

      const slug = item.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
        .slice(0, 90)

      const alreadyExists = await articleExists(item.link, slug)
      if (alreadyExists) {
        skippedCount++
        continue
      }

      // Rewrite with Groq AI Llama 3.3 & save to Turso
      const article = await rewriteNewsWithGroq(item)
      const saved = await saveNewsArticle(article)

      if (saved) {
        processedCount++
        processedTitles.push(article.title)
      }
    }

    // Get current total count
    const existing = await getNewsArticles({ limit: 1 })

    return NextResponse.json({
      success: true,
      processed: processedCount,
      skipped: skippedCount,
      newArticles: processedTitles,
      feedCountTotal: feedItems.length,
    })
  } catch (err: any) {
    console.error('[News Sync Error]:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
