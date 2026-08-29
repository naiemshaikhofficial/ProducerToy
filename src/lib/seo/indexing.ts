/**
 * Instant Search Engine Indexing Engine (IndexNow Protocol)
 * Supported by Microsoft Bing, Yandex, Seznam, Naver.
 * Propagates updated and new product URLs directly to search crawlers.
 */

export const INDEXNOW_KEY = '8b3a7492c10b48c0864e432c69d84631'
export const HOST_DOMAIN = 'producertoy.com'

export async function submitIndexNowUrls(urlList: string[]): Promise<{ success: boolean; count: number; error?: string }> {
  if (!urlList || urlList.length === 0) {
    return { success: false, count: 0, error: 'No URLs provided' }
  }

  const cleanUrls = urlList.map((u) => (u.startsWith('http') ? u : `https://${HOST_DOMAIN}${u.startsWith('/') ? u : `/${u}`}`))

  const payload = {
    host: HOST_DOMAIN,
    key: INDEXNOW_KEY,
    keyLocation: `https://${HOST_DOMAIN}/${INDEXNOW_KEY}.txt`,
    urlList: cleanUrls,
  }

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    })

    if (response.ok || response.status === 200 || response.status === 202) {
      return { success: true, count: cleanUrls.length }
    }

    const text = await response.text()
    return { success: false, count: cleanUrls.length, error: `Status ${response.status}: ${text}` }
  } catch (err: any) {
    return { success: false, count: cleanUrls.length, error: err.message }
  }
}
