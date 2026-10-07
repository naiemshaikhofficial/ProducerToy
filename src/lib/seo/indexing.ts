/**
 * Instant Search Engine Indexing Engine (IndexNow Protocol + Google/Bing Ping)
 * Supported by Microsoft Bing, Google, Yandex, Seznam, Naver.
 * Propagates updated and new product & news URLs directly to search crawlers within minutes.
 */

export const INDEXNOW_KEY = '8b3a7492c10b48c0864e432c69d84631'
export const HOST_DOMAIN = 'producertoy.com'

const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
]

export async function submitIndexNowUrls(urlList: string[]): Promise<{ success: boolean; count: number; error?: string }> {
  if (!urlList || urlList.length === 0) {
    return { success: false, count: 0, error: 'No URLs provided' }
  }

  const cleanUrls = Array.from(
    new Set(
      urlList.map((u) => (u.startsWith('http') ? u : `https://${HOST_DOMAIN}${u.startsWith('/') ? u : `/${u}`}`))
    )
  )

  const payload = {
    host: HOST_DOMAIN,
    key: INDEXNOW_KEY,
    keyLocation: `https://${HOST_DOMAIN}/${INDEXNOW_KEY}.txt`,
    urlList: cleanUrls,
  }

  // 1. Concurrently submit to IndexNow engines (Bing, Yandex, IndexNow gateway)
  const indexNowPromises = INDEXNOW_ENDPOINTS.map(async (endpoint) => {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000),
      })
      return { endpoint, ok: res.ok || res.status === 200 || res.status === 202 }
    } catch {
      return { endpoint, ok: false }
    }
  })

  // 2. Concurrently ping Google & Bing sitemaps
  const sitemapPings = [
    `https://www.google.com/ping?sitemap=https://${HOST_DOMAIN}/sitemap.xml`,
    `https://www.google.com/ping?sitemap=https://${HOST_DOMAIN}/news-sitemap.xml`,
    `https://www.bing.com/ping?sitemap=https://${HOST_DOMAIN}/sitemap.xml`,
  ].map(async (pingUrl) => {
    try {
      await fetch(pingUrl, { signal: AbortSignal.timeout(4000) })
    } catch {}
  })

  try {
    const [indexNowResults] = await Promise.all([
      Promise.all(indexNowPromises),
      Promise.allSettled(sitemapPings),
    ])

    const anySuccess = indexNowResults.some((r) => r.ok)
    if (anySuccess) {
      console.log(`[Instant SEO IndexNow] Successfully submitted ${cleanUrls.length} URLs to search engines`)
      return { success: true, count: cleanUrls.length }
    }

    return { success: false, count: cleanUrls.length, error: 'IndexNow endpoints returned non-200' }
  } catch (err: any) {
    console.warn('[Instant SEO IndexNow Error]:', err?.message || err)
    return { success: false, count: cleanUrls.length, error: err.message }
  }
}
