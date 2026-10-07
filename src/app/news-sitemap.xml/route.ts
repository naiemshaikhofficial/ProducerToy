import { NextResponse } from 'next/server'
import { getNewsArticles } from '@/lib/turso/newsDb'

export const dynamic = 'force-dynamic'
export const revalidate = 600 // Cache for 10 minutes

function escapeXml(unsafe: string): string {
  if (!unsafe) return ''
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Official Google News XML Sitemap Endpoint (/news-sitemap.xml)
 * Conforms to Google News Sitemap protocol (xmlns:news="http://www.google.com/schemas/sitemap-news/0.9").
 * Informs Google News & Google Discover crawlers of newly published stories within minutes.
 */
export async function GET() {
  const baseUrl = 'https://producertoy.com'

  try {
    const articles = await getNewsArticles({ limit: 100 })
    
    // Google News sitemap standard focuses on articles published within the last 48 hours,
    // or the latest active articles.
    const now = Date.now()
    const twoDaysMs = 48 * 60 * 60 * 1000
    let eligible = articles.filter((a) => {
      const pubTime = new Date(a.published_at || a.created_at).getTime()
      return !isNaN(pubTime) && now - pubTime <= twoDaysMs
    })

    // If fewer than 15 articles in the last 48 hours, include the latest 25 articles
    if (eligible.length < 15) {
      eligible = articles.slice(0, 25)
    }

    const xmlItems = eligible
      .map((article) => {
        const articleUrl = `${baseUrl}/news/${encodeURIComponent(article.slug)}`
        const pubDate = new Date(article.published_at || article.created_at).toISOString()
        const title = escapeXml(article.title)
        const coverImage = article.cover_image && !article.cover_image.includes('placeholder')
          ? escapeXml(article.cover_image)
          : null

        return `  <url>
    <loc>${escapeXml(articleUrl)}</loc>
    <news:news>
      <news:publication>
        <news:name>Producer Toy</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
${coverImage ? `    <image:image>
      <image:loc>${coverImage}</image:loc>
      <image:title>${title}</image:title>
    </image:image>` : ''}
  </url>`
      })
      .join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${xmlItems}
</urlset>`

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    })
  } catch (err: any) {
    console.error('[Google News Sitemap Error]:', err)
    return new NextResponse('Error generating Google News sitemap', { status: 500 })
  }
}
