/**
 * Provides high-res real product cover images for news articles.
 * 1. Uses the extracted RSS / OpenGraph image if available.
 * 2. Fetches og:image from the merchant / developer deal URL.
 * 3. Searches Plugin Boutique for matching product and extracts banners.pluginboutique.com image.
 * 4. Fallbacks to high-res synthesized audio graphic.
 */
const PB_EXCLUDED_BANNER_HASHES = [
  '8703u6x0lrzyjlnucnb396u4m6qb', // Melodyne 5 Essential gift
  'tvs4y0670451blh7j6l511bu5xkp', // StereoSavage 2 Elements gift
  '9c1dgrwexwywq4u6fmiohx0cp4j5', // ChordAXE Lite gift
  '6q6mdbwd6rrypcnclj408wlnof78', // Gorilla Drive gift
  '2ep2agbp9vny6vj9diyozlnb89ih', // Synthesizer V gift
  'dewmln806vd6wz4nk36dvawze3rc', // Moogerfooger gift
  'rkm6y6yradsul5g58j58q8ludc4r', // Warren Sokol testimonial headshot
  'os8m6mahsfku7pzwoym0d2g90i6c', // Maor Appelbaum testimonial headshot
]

async function extractUltraHdFromProductHtml(html: string, title?: string): Promise<string | null> {
  const cleanTitle = (title || '').toLowerCase()

  // 1. Direct official brand CDNs for top tier brands
  if (cleanTitle.includes('waves tune real-time') || cleanTitle.includes('waves tune realtime')) {
    return 'https://media.wavescdn.com/images/products/plugins/share/waves-tune-real-time.jpg'
  }
  if (cleanTitle.includes('iron 2')) {
    return 'https://www.ujam.com/fileadmin/_processed_/b/c/csm_vg-iron2_307c7d8d5d.jpg'
  }

  // 2. High-res gallery developer banner / news banner blob
  const bannerBlob = html.match(
    /https:\/\/www\.pluginboutique\.com\/rails\/active_storage\/blobs\/redirect\/[^\s"']+(?:NewsPage|Banner|Artwork|gui|plugin)[^\s"']*/i
  )
  if (bannerBlob) return bannerBlob[0]

  // 3. Any active storage developer blob in the gallery
  const anyBlob = html.match(
    /https:\/\/www\.pluginboutique\.com\/rails\/active_storage\/blobs\/redirect\/[^\s"']+/i
  )
  if (anyBlob) return anyBlob[0]

  // 4. Product page official social card (og:image)
  const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
  if (ogMatch && ogMatch[1].startsWith('http') && !PB_EXCLUDED_BANNER_HASHES.some(h => ogMatch[1].includes(h))) {
    return ogMatch[1]
  }

  // 5. Full UI Screenshot (UI 1 / UI 2 / Main Interface / Screenshot)
  const uiMatch =
    html.match(/<img[^>]+alt=["'][^"']*(?:UI\s*1|UI\s*2|Interface|Screenshot)[^"']*["'][^>]+src=["'](https:\/\/banners\.pluginboutique\.com\/[a-z0-9]+)["']/i) ||
    html.match(/<img[^>]+src=["'](https:\/\/banners\.pluginboutique\.com\/[a-z0-9]+)["'][^>]+alt=["'][^"']*(?:UI\s*1|UI\s*2|Interface|Screenshot)[^"']*["']/i)

  if (uiMatch && !PB_EXCLUDED_BANNER_HASHES.some(h => uiMatch[1].includes(h))) {
    return uiMatch[1]
  }

  // 6. Main Product Hardware / GUI Image
  const mainImgMatch =
    html.match(/<img[^>]+alt=["']Main Image["'][^>]+src=["'](https:\/\/banners\.pluginboutique\.com\/[a-z0-9]+)["']/i) ||
    html.match(/<img[^>]+src=["'](https:\/\/banners\.pluginboutique\.com\/[a-z0-9]+)["'][^>]+alt=["']Main Image["']/i)

  if (mainImgMatch && !PB_EXCLUDED_BANNER_HASHES.some(h => mainImgMatch[1].includes(h))) {
    return mainImgMatch[1]
  }

  // 7. Extract all banner tags and find the largest resolution master screenshot (> 35KB)
  const candidateUrls = [...new Set([...html.matchAll(/https:\/\/banners\.pluginboutique\.com\/[a-z0-9]+/gi)].map(m => m[0]))]
  const validCandidates = candidateUrls.filter(u => !PB_EXCLUDED_BANNER_HASHES.some(h => u.includes(h)))

  let bestBanner: string | null = null
  let maxLen = 0

  for (const b of validCandidates.slice(0, 10)) {
    try {
      const bRes = await fetch(b, { method: 'HEAD', signal: AbortSignal.timeout(2500) })
      const ct = bRes.headers.get('content-type') || ''
      if (!ct.startsWith('image/')) continue
      const len = parseInt(bRes.headers.get('content-length') || '0', 10)
      if (len > 35000 && len > maxLen) {
        maxLen = len
        bestBanner = b
      }
    } catch {}
  }

  return bestBanner
}

export async function resolveProductBannerImage(
  title: string,
  existingImageUrl?: string | null,
  dealUrl?: string | null
): Promise<string> {
  // 1. If dealUrl is a direct Plugin Boutique product page, ALWAYS extract the authentic Ultra HD master UI screenshot
  if (dealUrl && dealUrl.includes('pluginboutique.com/product/')) {
    try {
      const pRes = await fetch(dealUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(5000),
      })
      if (pRes.ok) {
        const html = await pRes.text()
        const ultraHd = await extractUltraHdFromProductHtml(html, title)
        if (ultraHd) {
          return ultraHd
        }
      }
    } catch {}
  }

  // 2. If existing valid image is provided and NOT a low-res Plugin Boutique thumbnail, use it
  if (
    existingImageUrl &&
    existingImageUrl.startsWith('http') &&
    !existingImageUrl.includes('placeholder') &&
    !existingImageUrl.includes('photo-1598488035139-bdbb2231ce04') &&
    !existingImageUrl.includes('banners.pluginboutique.com')
  ) {
    return existingImageUrl.replace(/-\d+x\d+(\.[a-zA-Z0-9]+(?:\?.*)?)$/i, '$1')
  }

  // 3. Try extracting high-res og:image from direct merchant/developer dealUrl
  if (dealUrl && dealUrl.startsWith('http')) {
    try {
      const res = await fetch(dealUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(4500),
      })
      if (res.ok) {
        const html = await res.text()
        const ogMatch =
          html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
          html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
        if (
          ogMatch &&
          ogMatch[1].startsWith('http') &&
          !ogMatch[1].includes('placeholder') &&
          !ogMatch[1].includes('default') &&
          !ogMatch[1].includes('logo-')
        ) {
          return ogMatch[1].replace(/-\d+x\d+(\.[a-zA-Z0-9]+(?:\?.*)?)$/i, '$1')
        }
      }
    } catch {}
  }

  // 3. Search Plugin Boutique and navigate to product page for Ultra HD UI screenshot / banner
  try {
    const cleanSearchQuery = title
      .replace(/^(?:get|grab|save|up to|\d+%\s*off|deal|sale|flash deal|free)\b/gi, '')
      .replace(/\b(?:by|from|for|\$\d+|€\d+|off|discount|bestsellers|sale|deal|bundle|free)\b/gi, ' ')
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 45)

    if (cleanSearchQuery.length >= 3) {
      const searchRes = await fetch(
        `https://www.pluginboutique.com/search?qs=match&q=${encodeURIComponent(cleanSearchQuery)}`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          },
          signal: AbortSignal.timeout(4500),
        }
      )
      if (searchRes.ok) {
        const searchHtml = await searchRes.text()
        const prodLinks = [...new Set([...searchHtml.matchAll(/href=["'](\/product\/[^"']+)["']/gi)].map(m => m[1]))]

        for (const pl of prodLinks.slice(0, 2)) {
          try {
            const pRes = await fetch('https://www.pluginboutique.com' + pl, {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              },
              signal: AbortSignal.timeout(4500),
            })
            if (pRes.ok) {
              const pHtml = await pRes.text()
              const ultraHd = await extractUltraHdFromProductHtml(pHtml, title)
              if (ultraHd) {
                return ultraHd
              }
            }
          } catch {}
        }

        // If product page didn't yield a high-res banner, check search results for banner
        const bannerMatch = searchHtml.match(/https:\/\/banners\.pluginboutique\.com\/[a-z0-9]+/i)
        if (bannerMatch && !PB_EXCLUDED_BANNER_HASHES.some(h => bannerMatch[0].includes(h))) {
          return bannerMatch[0]
        }
      }
    }
  } catch {}

  // 4. Guaranteed 1080p Ultra HD synthesized audio workstation graphic
  const cleanTitle = title.replace(/&#?[a-z0-9]+;/gi, ' ').slice(0, 80)
  const prompt = `sleek futuristic music production synthesizer daw studio vst plugin neon amber lighting high resolution 8k render, professional audio technology article header for ${cleanTitle}`
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1920&height=1080&nologo=true&seed=${Math.floor(
    Math.random() * 99999
  )}`
}

export function getArticleCoverImage(
  title: string,
  category: string,
  existingImageUrl?: string
): string {
  if (
    existingImageUrl &&
    existingImageUrl.startsWith('http') &&
    !existingImageUrl.includes('placeholder') &&
    !existingImageUrl.includes('photo-1598488035139-bdbb2231ce04')
  ) {
    return existingImageUrl.replace(/-\d+x\d+(\.[a-zA-Z0-9]+(?:\?.*)?)$/i, '$1')
  }

  const cleanTitle = title.replace(/&#?[a-z0-9]+;/gi, ' ').slice(0, 80)
  const prompt = `sleek futuristic music production synthesizer daw studio vst plugin neon amber lighting high resolution 8k render, professional audio technology article header for ${cleanTitle}`
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1920&height=1080&nologo=true&seed=${Math.floor(
    Math.random() * 99999
  )}`
}
