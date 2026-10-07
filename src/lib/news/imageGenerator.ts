/**
 * Provides high-res real product cover images for news articles.
 * 1. Uses the extracted RSS / OpenGraph image if available.
 * 2. Fetches og:image from the merchant / developer deal URL.
 * 3. Searches Plugin Boutique for matching product and extracts banners.pluginboutique.com image.
 * 4. Fallbacks to high-res synthesized audio graphic.
 */
import { getTopicFallbackImage } from './topicDeduplication'

const PB_EXCLUDED_BANNER_HASHES = [
  '62597tdwpbuqa4wb3ytyr780r83o', // Academy Award plaque banner (unrelated to products)
  '8703u6x0lrzyjlnucnb396u4m6qb', // Melodyne 5 Essential gift
  'tvs4y0670451blh7j6l511bu5xkp', // StereoSavage 2 Elements gift
  '9c1dgrwexwywq4u6fmiohx0cp4j5', // ChordAXE Lite gift
  '6q6mdbwd6rrypcnclj408wlnof78', // Gorilla Drive gift
  '2ep2agbp9vny6vj9diyozlnb89ih', // Synthesizer V gift
  'dewmln806vd6wz4nk36dvawze3rc', // Moogerfooger gift
  'rkm6y6yradsul5g58j58q8ludc4r', // Warren Sokol testimonial headshot
  'os8m6mahsfku7pzwoym0d2g90i6c', // Maor Appelbaum testimonial headshot
]

export function isForbiddenCoverImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string' || url.length < 15) return true
  const lower = url.toLowerCase().trim()
  if (!lower.startsWith('http://') && !lower.startsWith('https://')) return true

  // Strictly block transparent spacers, 1x1 pixels, empty placeholders, and invisible black logos
  if (
    lower.includes('spacer') ||
    lower.includes('1x1') ||
    lower.includes('pixel') ||
    lower.includes('transparent') ||
    lower.includes('empty') ||
    lower.includes('blank') ||
    lower.includes('content_spacer') ||
    lower.includes('logo_black') ||
    lower.includes('logo_dark') ||
    lower.includes('logo_preview')
  ) {
    return true
  }

  // Strictly block any Google News / Google account / Google usercontent / gstatic logos
  if (
    lower.includes('googleusercontent.com') ||
    lower.includes('gstatic.com') ||
    lower.includes('news.google.com') ||
    lower.includes('google.com/rss') ||
    lower.includes('google.com/logos') ||
    lower.includes('google.com/favicon') ||
    lower.includes('lh3.google') ||
    lower.includes('lh4.google') ||
    lower.includes('lh5.google') ||
    lower.includes('lh6.google') ||
    lower.includes('google.com')
  ) {
    return true
  }

  // Strictly block Telegram channel images and CDNs (they contain channel watermarks / overlay stamps like @LEGALVST)
  if (
    lower.includes('telesco.pe') ||
    lower.includes('telegram') ||
    lower.includes('t.me')
  ) {
    return true
  }

  // Block placeholders, avatars, tracking pixels, generic stock images
  if (
    lower.includes('placeholder') ||
    lower.includes('avatar') ||
    lower.includes('photo-1598488035139-bdbb2231ce04') ||
    lower.includes('default_image') ||
    lower.includes('no-image') ||
    lower.includes('no_image') ||
    lower.includes('default-thumbnail') ||
    lower.includes('favicon')
  ) {
    return true
  }

  // Block hotlink-protected, anti-leech, or known 404 domains
  if (
    lower.includes('bedroomproducersblog.com') ||
    lower.includes('ujam.com/fileadmin')
  ) {
    return true
  }

  // Strictly block internal OG placeholder banners and generic store covers
  if (
    lower.includes('/api/og') ||
    lower.includes('api/og') ||
    lower.includes('free%20toys') ||
    lower.includes('free-toys') ||
    lower.includes('producertoy.com')
  ) {
    return true
  }

  // Strictly block generic store / marketplace logo graphics (Gumroad pink logo, Patreon logo, BuyMeACoffee, etc.)
  if (
    lower.includes('assets.gumroad.com/images/opengraph_image.png') ||
    lower.includes('opengraph_image.png') ||
    lower.includes('gumroad.com/images/') ||
    lower.includes('ppy1r0hgbq0o7t4qesbjl7ifihd8') ||
    lower.includes('patreon.com/user/avatar') ||
    lower.includes('buymeacoffee.com/assets') ||
    lower.includes('ko-fi.com')
  ) {
    return true
  }

  // Block excluded gift banners & headshots
  if (PB_EXCLUDED_BANNER_HASHES.some(h => lower.includes(h))) {
    return true
  }

  return false
}

async function extractUltraHdFromProductHtml(html: string, title?: string): Promise<string | null> {
  const cleanTitle = (title || '').toLowerCase()

  // 1. Direct official brand CDNs for top tier brands
  if (cleanTitle.includes('waves tune real-time') || cleanTitle.includes('waves tune realtime')) {
    return 'https://media.wavescdn.com/images/products/plugins/share/waves-tune-real-time.jpg'
  }
  if (cleanTitle.includes('iron 2')) {
    return 'https://banners.pluginboutique.com/wh70xwmo9aeynmum40t249dd7jd3'
  }

  // 2. HIGHEST PRIORITY: Official developer & PB active_storage master graphic blobs
  const allMasterBlobs = [
    ...html.matchAll(
      /https:\/\/www\.pluginboutique\.com\/rails\/active_storage\/blobs\/redirect\/[^\s"'<>]+/gi
    ),
  ].map((m) => m[0])

  for (const blob of allMasterBlobs) {
    if (!isForbiddenCoverImageUrl(blob)) {
      return blob
    }
  }

  // 3. Product page official social card (og:image)
  const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
  if (ogMatch && !isForbiddenCoverImageUrl(ogMatch[1])) {
    return ogMatch[1]
  }

  // 4. High-res ckeditor pictures (only if NOT a spacer or logo)
  const allCkeditor = [
    ...html.matchAll(/https:\/\/www\.pluginboutique\.com\/ckeditor_assets\/pictures\/[^\s"'<>]+/gi),
  ].map((m) => m[0])

  for (const ck of allCkeditor) {
    if (!isForbiddenCoverImageUrl(ck)) {
      return ck
    }
  }

  // 5. Full UI Screenshot (UI 1 / UI 2 / Main Interface / Screenshot)
  const uiMatch =
    html.match(/<img[^>]+alt=["'][^"']*(?:UI\s*1|UI\s*2|Interface|Screenshot)[^"']*["'][^>]+src=["'](https:\/\/banners\.pluginboutique\.com\/[a-z0-9]+)["']/i) ||
    html.match(/<img[^>]+src=["'](https:\/\/banners\.pluginboutique\.com\/[a-z0-9]+)["'][^>]+alt=["'][^"']*(?:UI\s*1|UI\s*2|Interface|Screenshot)[^"']*["']/i)

  if (uiMatch && !isForbiddenCoverImageUrl(uiMatch[1])) {
    return uiMatch[1]
  }

  // 6. Main Product Hardware / GUI Image
  const mainImgMatch =
    html.match(/<img[^>]+alt=["']Main Image["'][^>]+src=["'](https:\/\/banners\.pluginboutique\.com\/[a-z0-9]+)["']/i) ||
    html.match(/<img[^>]+src=["'](https:\/\/banners\.pluginboutique\.com\/[a-z0-9]+)["'][^>]+alt=["']Main Image["']/i)

  if (mainImgMatch && !isForbiddenCoverImageUrl(mainImgMatch[1])) {
    return mainImgMatch[1]
  }

  // 7. High-res banner master screenshot
  const candidateUrls = [...new Set([...html.matchAll(/https:\/\/banners\.pluginboutique\.com\/[a-z0-9]+/gi)].map((m) => m[0]))]
  const validCandidates = candidateUrls.filter((u) => !isForbiddenCoverImageUrl(u))
  if (validCandidates.length > 0) {
    return validCandidates[0]
  }

  return null
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
        if (ultraHd && !isForbiddenCoverImageUrl(ultraHd)) {
          return ultraHd
        }
      }
    } catch {}
  }

  // 2. If existing valid image is provided and NOT forbidden or a low-res Plugin Boutique thumbnail, use it
  if (
    existingImageUrl &&
    !isForbiddenCoverImageUrl(existingImageUrl) &&
    !existingImageUrl.includes('banners.pluginboutique.com')
  ) {
    return existingImageUrl.replace(/-\d+x\d+(\.[a-zA-Z0-9]+(?:\?.*)?)$/i, '$1')
  }

  // 3. Try extracting high-res og:image from direct merchant/developer dealUrl (excluding Google & internal store)
  if (
    dealUrl &&
    dealUrl.startsWith('http') &&
    !dealUrl.includes('google.com') &&
    !dealUrl.includes('news.google') &&
    !dealUrl.includes('producertoy.com')
  ) {
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
        if (ogMatch) {
          const rawImg = ogMatch[1].trim()
          let resolvedImg = rawImg
          if (rawImg.startsWith('/')) {
            try {
              resolvedImg = new URL(rawImg, dealUrl).toString()
            } catch {}
          }
          if (!isForbiddenCoverImageUrl(resolvedImg)) {
            return resolvedImg.replace(/-\d+x\d+(\.[a-zA-Z0-9]+(?:\?.*)?)$/i, '$1')
          }
        }

        // Secondary: check prominent GUI / product <img> on developer page
        const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)].map((m) => m[1])
        for (const candidate of imgMatches) {
          let resolvedImg = candidate.trim()
          if (candidate.startsWith('/')) {
            try {
              resolvedImg = new URL(candidate, dealUrl).toString()
            } catch {}
          }
          if (
            (resolvedImg.toLowerCase().includes('gui') ||
              resolvedImg.toLowerCase().includes('product') ||
              resolvedImg.toLowerCase().includes('ui') ||
              resolvedImg.toLowerCase().includes('screenshot') ||
              resolvedImg.toLowerCase().includes('sample-packs') ||
              resolvedImg.toLowerCase().includes('/vst/') ||
              resolvedImg.toLowerCase().includes('wp-content/uploads/20')) &&
            !isForbiddenCoverImageUrl(resolvedImg)
          ) {
            return resolvedImg.replace(/-\d+x\d+(\.[a-zA-Z0-9]+(?:\?.*)?)$/i, '$1')
          }
        }
      }
    } catch {}
  }

  // 4. Search Plugin Boutique and navigate to product page for Ultra HD UI screenshot / banner
  try {
    const searchQueries: string[] = []
    const lowerTitle = title.toLowerCase()

    // If this is an editorial guide, roundup, industry news, or acquisition story, do NOT search Plugin Boutique for random individual products
    const isEditorialOrRoundup =
      /acquires|acquisition|industry|guide|roundup|best|top \d+|overview|opinion|roadmap|vs\b|libraries|collection|bundles/i.test(
        title
      )

    if (!isEditorialOrRoundup) {
      if (lowerTitle.includes('massive x')) {
        searchQueries.push('Native Instruments Massive X')
      } else if (lowerTitle.includes('reaktor')) {
        searchQueries.push('Native Instruments Reaktor')
      } else if (lowerTitle.includes('guitar rig')) {
        searchQueries.push('Native Instruments Guitar Rig')
      } else if (lowerTitle.includes('minimal audio')) {
        searchQueries.push('Minimal Audio')
      } else if (lowerTitle.includes('fabfilter')) {
        searchQueries.push('FabFilter')
      } else if (lowerTitle.includes('arturia')) {
        searchQueries.push('Arturia')
      } else if (lowerTitle.includes('soundtoys')) {
        searchQueries.push('Soundtoys')
      } else if (lowerTitle.includes('cubase')) {
        searchQueries.push('Cubase Pro')
      }

      const cleanSearchQuery = title
        .replace(/^(?:get|grab|save|up to|\d+%\s*off|deal|sale|flash deal|free)\b/gi, '')
        .replace(
          /\b(?:by|from|for|\$\d+|€\d+|off|discount|bestsellers|sale|deal|bundle|free|major savings|this week|limited time)\b/gi,
          ' '
        )
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 45)

      if (cleanSearchQuery.length >= 3 && !searchQueries.includes(cleanSearchQuery)) {
        searchQueries.push(cleanSearchQuery)
      }
    }

    for (const q of searchQueries) {
      const searchRes = await fetch(
        `https://www.pluginboutique.com/search?qs=match&q=${encodeURIComponent(q)}`,
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
              if (ultraHd && !isForbiddenCoverImageUrl(ultraHd)) {
                return ultraHd
              }
            }
          } catch {}
        }
      }
    }
  } catch {}

  // 5. If not on Plugin Boutique (e.g. freeware / independent developer plugins), resolve authentic GUI render from audio web search
  try {
    const cleanSearch = title
      .replace(/^(?:get|grab|save|up to|\d+%\s*off|deal|sale|flash deal|free)\b/gi, '')
      .replace(/\b(?:by|from|for|\$\d+|€\d+|off|discount|bestsellers|sale|deal|bundle|free|vst3?|au|aax|windows|mac)\b/gi, ' ')
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 45)

    if (cleanSearch.length >= 4) {
      const ddgRes = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(cleanSearch)}`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(3500),
      })
      if (ddgRes.ok) {
        const ddgHtml = await ddgRes.text()
        const rawUrls = [...ddgHtml.matchAll(/class="result__url"[^>]*>([^<]+)/gi)].map(m => m[1].trim())
        for (const u of rawUrls.slice(0, 6)) {
          const fullUrl = u.startsWith('http') ? u : `https://${u}`
          if (
            fullUrl.includes('patreon') ||
            fullUrl.includes('reddit') ||
            fullUrl.includes('youtube') ||
            /(?:^|\/|\.)x\.com(?:\/|$)/.test(fullUrl) ||
            fullUrl.includes('facebook')
          ) {
            continue
          }
          try {
            const pageRes = await fetch(fullUrl, {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              },
              signal: AbortSignal.timeout(3000),
            })
            if (pageRes.ok) {
              const pageHtml = await pageRes.text()
              const og =
                pageHtml.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                pageHtml.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
              if (og && !isForbiddenCoverImageUrl(og[1])) {
                return og[1].replace(/-\d+x\d+(\.[a-zA-Z0-9]+(?:\?.*)?)$/i, '$1')
              }
            }
          } catch {}
        }
      }
    }
  } catch {}

  // 6. Genuine Product Image (No generic Unsplash fallbacks, No AI generated images)
  return existingImageUrl && !isForbiddenCoverImageUrl(existingImageUrl) ? existingImageUrl : '/icon.png'
}

export function generateThemedCoverPrompt(title: string): string {
  const clean = title
    .replace(/&#?[a-z0-9]+;/gi, ' ')
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const lower = clean.toLowerCase()

  if (
    lower.includes('free vst') ||
    lower.includes('free plugin') ||
    lower.includes('freeware') ||
    lower.includes('essential list') ||
    lower.includes('best free')
  ) {
    return `futuristic music production studio audio workstation with glowing synthesizer rack, mixing console, and audio vst plugin interfaces on screens, professional music technology editorial visual for "${clean.slice(0, 65)}", 8k render, modern neon amber studio lighting`
  }
  if (lower.includes('kontakt') || lower.includes('library') || lower.includes('sample')) {
    return `high end virtual instrument sampler workstation with sound library rack, orchestral and synth sample visualizer on studio display, audio software header for "${clean.slice(0, 65)}", 8k render`
  }
  if (lower.includes('vocal') || lower.includes('pitch') || lower.includes('autotune') || lower.includes('tune')) {
    return `modern vocal production recording studio with studio microphone, vocal waveform visualizer, audio pitch correction plugin interface on monitor, neon lighting 8k render for "${clean.slice(0, 65)}"`
  }
  if (
    lower.includes('acquire') ||
    lower.includes('acquisition') ||
    lower.includes('ownership') ||
    lower.includes('industry') ||
    lower.includes('inmusic') ||
    lower.includes('boris fx')
  ) {
    return `futuristic audio software technology headquarters with illuminated holographic DAW sound console and audio engineering displays, professional music technology corporate news header for "${clean.slice(0, 65)}", 8k render, cinematic dark cyan lighting`
  }
  if (lower.includes('sound design') || lower.includes('software deals') || lower.includes('plugin roundup')) {
    return `cutting edge audio software sound design laboratory with visual harmonic spectrum analyzer, futuristic synthesizer modules, and plugin interfaces on ultra-wide screens, 8k render for "${clean.slice(0, 65)}", neon violet studio lighting`
  }
  if (
    lower.includes('synth') ||
    lower.includes('synthesizer') ||
    lower.includes('wavetable') ||
    lower.includes('fm8') ||
    (lower.includes('massive') && !lower.includes('massive discounts'))
  ) {
    return `sleek modular analog synthesizer workstation with patch cables, illuminated oscilloscopes, and wavetable displays, professional audio tech editorial header for "${clean.slice(0, 65)}", 8k render, cinematic ambient lighting`
  }
  if (lower.includes('guitar') || lower.includes('amp') || lower.includes('pedal') || lower.includes('distortion')) {
    return `boutique tube amplifier guitar pedals and virtual audio effect plugin interface in high-end sound studio, 8k render for "${clean.slice(0, 65)}"`
  }
  if (lower.includes('drum') || lower.includes('beat') || lower.includes('percussion') || lower.includes('808')) {
    return `modern drum machine groovebox sequencer with glowing velocity pads and dynamic beat visualizer, music production gear 8k render for "${clean.slice(0, 65)}"`
  }
  if (lower.includes('mixing') || lower.includes('mastering') || lower.includes('compressor') || lower.includes('eq') || lower.includes('reverb')) {
    return `mastering studio console with analog VU meters, stereo mastering equalizer and compressor interfaces, pristine studio acoustics, 8k render for "${clean.slice(0, 65)}"`
  }
  return `sleek futuristic music production synthesizer daw studio vst plugin neon amber lighting high resolution 8k render, professional audio technology article header for ${clean.slice(0, 75)}`
}

export function getArticleCoverImage(
  title: string,
  category: string,
  existingImageUrl?: string
): string {
  if (existingImageUrl && !isForbiddenCoverImageUrl(existingImageUrl)) {
    return existingImageUrl.replace(/-\d+x\d+(\.[a-zA-Z0-9]+(?:\?.*)?)$/i, '$1')
  }

  return '/icon.png'
}
