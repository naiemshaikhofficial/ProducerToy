/**
 * Provides high-res real product cover images for news articles.
 * 1. Uses the extracted RSS / OpenGraph image if available.
 * 2. Fetches og:image from the merchant / developer deal URL.
 * 3. Searches Plugin Boutique for matching product and extracts banners.pluginboutique.com image.
 * 4. Fallbacks to high-res synthesized audio graphic.
 */
export async function resolveProductBannerImage(
  title: string,
  existingImageUrl?: string | null,
  dealUrl?: string | null
): Promise<string> {
  // 1. Existing valid image
  if (
    existingImageUrl &&
    existingImageUrl.startsWith('http') &&
    !existingImageUrl.includes('placeholder') &&
    !existingImageUrl.includes('photo-1598488035139-bdbb2231ce04')
  ) {
    return existingImageUrl.replace(/-\d+x\d+(\.[a-zA-Z0-9]+(?:\?.*)?)$/i, '$1')
  }

  // 2. Try extracting og:image or banner from direct dealUrl
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

        // Check if page contains banners.pluginboutique.com image
        const pbBannerMatch = html.match(/https:\/\/banners\.pluginboutique\.com\/[a-z0-9]+/i)
        if (pbBannerMatch) {
          return pbBannerMatch[0]
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

        // Inspect top product page for authentic product screenshots
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

              // 1. Highest Priority: Full UI Screenshot (UI 1 / UI 2 / Main Interface)
              const uiMatch =
                pHtml.match(/<img[^>]+alt=["'][^"']*(?:UI\s*1|UI\s*2|Interface|Screenshot)[^"']*["'][^>]+src=["'](https:\/\/banners\.pluginboutique\.com\/[a-z0-9]+)["']/i) ||
                pHtml.match(/<img[^>]+src=["'](https:\/\/banners\.pluginboutique\.com\/[a-z0-9]+)["'][^>]+alt=["'][^"']*(?:UI\s*1|UI\s*2|Interface|Screenshot)[^"']*["']/i)

              if (uiMatch && !PB_EXCLUDED_BANNER_HASHES.some(h => uiMatch[1].includes(h))) {
                return uiMatch[1]
              }

              // 2. Main Product Hardware / GUI Image
              const mainImgMatch =
                pHtml.match(/<img[^>]+alt=["']Main Image["'][^>]+src=["'](https:\/\/banners\.pluginboutique\.com\/[a-z0-9]+)["']/i) ||
                pHtml.match(/<img[^>]+src=["'](https:\/\/banners\.pluginboutique\.com\/[a-z0-9]+)["'][^>]+alt=["']Main Image["']/i)

              if (mainImgMatch && !PB_EXCLUDED_BANNER_HASHES.some(h => mainImgMatch[1].includes(h))) {
                return mainImgMatch[1]
              }

              // 3. Extract all image tags and filter out circular testimonial avatars / human headshots
              const imgTags = pHtml.match(/<img[^>]+>/gi) || []
              const validCandidates: string[] = []

              for (const tag of imgTags) {
                // Skip circular avatars, testimonials, user review headshots
                if (/rounded-full|avatar|testimonial|review|quote|border-gray-300/i.test(tag)) continue
                const srcMatch = tag.match(/src=["'](https:\/\/banners\.pluginboutique\.com\/[a-z0-9]+)["']/i)
                if (srcMatch) {
                  const url = srcMatch[1]
                  if (!PB_EXCLUDED_BANNER_HASHES.some(h => url.includes(h))) {
                    validCandidates.push(url)
                  }
                }
              }

              // Find the highest resolution image (> 35KB, skip small icons)
              let bestBanner: string | null = null
              let maxLen = 0

              for (const b of [...new Set(validCandidates)].slice(0, 8)) {
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

              if (bestBanner) {
                return bestBanner
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
