import { parseExpiryDateText, detectDealExpiry } from '@/lib/news/dealExpiry'

export interface RawFeedItem {
  title: string
  link: string
  pubDate: string
  creator: string
  contentSnippet: string
  imageUrl?: string
  sourceName: string
  isPrimary?: boolean
  categoryDefault?: string
  directDealUrl?: string
  dealPrice?: string | null
  regularPrice?: string | null
  discount?: string | null
  expiryTimeline?: string | null
  couponCode?: string | null
  brand?: string | null
  productName?: string | null
}

export const PLUGIN_BOUTIQUE_AFFILIATE_ID = '68affa2b94f43'

/**
 * Validates deal links: excludes blog scrapers/social media,
 * preserves developer websites, and attaches user's referral tag to Plugin Boutique product slugs.
 */
export function sanitizeDealUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim().replace(/&amp;/g, '&')
  const lower = trimmed.toLowerCase()

  if (!lower.startsWith('http://') && !lower.startsWith('https://')) {
    return null
  }

  // Block competitor blogs, social media, Telegram channel URLs, tracking pixels
  if (
    lower.includes('gearnews.com') ||
    lower.includes('bedroomproducersblog.com') ||
    lower.includes('audiopluginguy.com') ||
    lower.includes('rekkerd.org') ||
    lower.includes('kvraudio.com') ||
    lower.includes('musictech.com') ||
    lower.includes('cdm.link') ||
    lower.includes('news.google.com') ||
    lower.includes('producertoy.com') ||
    lower.includes('t.me') ||
    lower.includes('telegram.org') ||
    lower.includes('telesco.pe') ||
    lower.includes('facebook.com') ||
    lower.includes('twitter.com') ||
    lower.includes('x.com') ||
    lower.includes('instagram.com') ||
    lower.includes('youtube.com') ||
    lower.includes('youtu.be') ||
    lower.includes('ytimg.com') ||
    lower.includes('gravatar.com') ||
    lower.includes('wordpress.org') ||
    lower.includes('w3.org') ||
    lower.includes('schema.org')
  ) {
    return null
  }

  // Block any image/media files (.jpg, .jpeg, .png, .webp, .gif, .svg, .avif, etc.)
  if (/\.(jpg|jpeg|png|webp|gif|svg|avif|bmp|ico|mp4|webm|mp3|wav)(\?.*)?$/i.test(trimmed)) {
    return null
  }

  // If it's a Plugin Boutique URL, preserve exact product slug and attach/replace user's referral ID
  if (lower.includes('pluginboutique.com')) {
    try {
      const parsed = new URL(trimmed)
      Array.from(parsed.searchParams.keys()).forEach(key => {
        if (key !== 'a_aid') {
          parsed.searchParams.delete(key)
        }
      })
      parsed.searchParams.set('a_aid', PLUGIN_BOUTIQUE_AFFILIATE_ID)
      return parsed.toString()
    } catch {
      let clean = trimmed.replace(/[?&].*$/gi, '')
      return `${clean}?a_aid=${PLUGIN_BOUTIQUE_AFFILIATE_ID}`
    }
  }

  // Auto-correct deprecated or moved vendor URLs
  if (lower.includes('native-instruments.com')) {
    if (lower.includes('/innovations/kontakt-player')) {
      return 'https://www.native-instruments.com/en/products/komplete/samplers/kontakt-player/'
    }
    if (lower.includes('/products/software')) {
      return 'https://www.native-instruments.com/collections/music-creation'
    }
    if (lower.includes('/specials/deals')) {
      return 'https://www.native-instruments.com/collections/komplete-bundles'
    }
  }

  return trimmed
}

/**
 * Extracts the exact outbound product/deal URL and any promo/coupon code from an article web page.
 * Uses reader proxy with timeout to reliably parse through Cloudflare blocks.
 */
export interface LiveProductDetails {
  title: string
  brand: string
  dealPrice: string | null
  regularPrice: string | null
  discount: string | null
  expiryTimeline: string | null
  coverImage: string | null
  isDealActive: boolean
}

/**
 * Scrapes live product details directly from Plugin Boutique product page:
 * Verifies exact current price, regular price, discount %, expiry date, and Full HD master graphic.
 */
export async function fetchPluginBoutiqueProductLiveDetails(productUrl: string): Promise<LiveProductDetails | null> {
  if (!productUrl || !productUrl.includes('pluginboutique.com/product/')) return null
  try {
    const cleanUrl = productUrl.split('?')[0]
    const res = await fetch(cleanUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return null
    const html = await res.text()

    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
    const title = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : ''

    const brandMatch = html.match(/href=["']\/manufacturers\/[^"']+["'][^>]*>(.*?)<\/a>/i)
    const brand = brandMatch ? brandMatch[1].replace(/<[^>]+>/g, '').trim() : ''

    const dealPriceMatch = html.match(
      /<span[^>]*class=["'][^"']*text-gray-800[^"']*["'][^>]*>\s*(\$[0-9]+(?:\.[0-9]{2})?)\s*<\/span>/i
    )
    const regularPriceMatch = html.match(
      /<span[^>]*class=["'][^"']*line-through[^"']*["'][^>]*>\s*(\$[0-9]+(?:\.[0-9]{2})?)\s*<\/span>/i
    )
    const discountMatch = html.match(/(\d+%\s*off(?:\s*until\s*[a-zA-Z]+\s+\d{1,2})?)/i)

    const dealPrice = dealPriceMatch ? dealPriceMatch[1] : null
    const regularPrice = regularPriceMatch ? regularPriceMatch[1] : null

    let discount: string | null = null
    let expiryTimeline: string | null = null

    if (discountMatch) {
      const parts = discountMatch[1].split(/\s+until\s+/i)
      discount = parts[0].toUpperCase()
      if (parts[1]) {
        expiryTimeline = `until ${parts[1].trim()}`
      }
    }

    if (!discount && dealPrice && regularPrice) {
      const dNum = parseFloat(dealPrice.replace('$', ''))
      const rNum = parseFloat(regularPrice.replace('$', ''))
      if (rNum > dNum && rNum > 0) {
        discount = `${Math.round(((rNum - dNum) / rNum) * 100)}% OFF`
      }
    }

    let coverImage: string | null = null
    const masterBlobs = [
      ...html.matchAll(/https:\/\/www\.pluginboutique\.com\/rails\/active_storage\/blobs\/redirect\/[^\s"']+/gi),
      ...html.matchAll(/https:\/\/www\.pluginboutique\.com\/ckeditor_assets\/pictures\/[^\s"']+/gi),
    ].map((m) => m[0])

    for (const b of masterBlobs) {
      const lowerB = b.toLowerCase()
      if (
        lowerB.includes('spacer') ||
        lowerB.includes('transparent') ||
        lowerB.includes('empty') ||
        lowerB.includes('1x1') ||
        lowerB.includes('pixel') ||
        lowerB.includes('logo_black') ||
        lowerB.includes('logo_dark') ||
        lowerB.includes('logo_preview') ||
        lowerB.includes('8703u6x0') ||
        lowerB.includes('62597t') ||
        lowerB.includes('2ep2ag') ||
        lowerB.includes('dewmln') ||
        lowerB.includes('tvs4y0') ||
        lowerB.includes('icon') ||
        lowerB.includes('avatar')
      ) {
        continue
      }
      coverImage = b
      break
    }

    const isDealActive = Boolean(dealPrice && regularPrice && dealPrice !== regularPrice)

    return {
      title,
      brand,
      dealPrice,
      regularPrice,
      discount,
      expiryTimeline,
      coverImage,
      isDealActive,
    }
  } catch {
    return null
  }
}

/**
 * Extracts the exact outbound product/deal URL and any promo/coupon code from an article web page.
 * Uses reader proxy with timeout to reliably parse through Cloudflare blocks.
 */
export async function extractDirectDealInfo(articleUrl: string): Promise<{
  bestUrl?: string
  couponCode?: string
  expiryTimeline?: string
  dealPrice?: string | null
  regularPrice?: string | null
  discount?: string | null
  brand?: string | null
  productName?: string | null
  coverImage?: string | null
  isDealActive?: boolean
} | null> {
  if (!articleUrl || typeof articleUrl !== 'string') return null

  // Fast direct resolution for Plugin Boutique product URLs (skips Jina reader)
  if (articleUrl.includes('pluginboutique.com/product/')) {
    const cleanUrl = sanitizeDealUrl(articleUrl) || articleUrl
    const live = await fetchPluginBoutiqueProductLiveDetails(articleUrl)
    if (live) {
      return {
        bestUrl: cleanUrl,
        dealPrice: live.dealPrice,
        regularPrice: live.regularPrice,
        discount: live.discount,
        expiryTimeline: live.expiryTimeline,
        brand: live.brand,
        productName: live.title,
        coverImage: live.coverImage,
        isDealActive: live.isDealActive,
      }
    }
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3500)

    const jinaUrl = `https://r.jina.ai/${articleUrl}`
    const res = await fetch(jinaUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'text/plain',
      },
    })
    clearTimeout(timeout)

    if (!res.ok) return null
    const text = await res.text()
    if (text.includes('Security Verification') || text.includes('error 403')) {
      return null
    }

    let bestUrl: string | undefined
    let couponCode: string | undefined

    // 1. HIGHEST PRIORITY: Explicit "More info: [Product Name ($XX)](url)" or "Product page:" pattern
    const moreInfoMatches = [
      ...text.matchAll(
        /(?:\*{0,2}(?:more\s+info|more\s+information|product\s+page|official\s+page|get\s+it\s+here|available\s+at|check\s+out|visit|buy\s+now|download|link)\*{0,2}\s*(?::|—|-)?\s*)\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/gi
      ),
    ]

    for (const match of moreInfoMatches) {
      const candidateUrl = sanitizeDealUrl(match[2])
      if (candidateUrl) {
        bestUrl = candidateUrl
        break
      }
    }

    // 2. SECONDARY SCAN: Search all markdown links, giving precedence to deep product/deal pages
    if (!bestUrl) {
      const parsedLinks = [...text.matchAll(/\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/gi)].map((m) => ({
        label: m[1].trim(),
        url: m[2].trim(),
      }))

      // Score links: deep product pages & price labels get highest score
      let highestScore = -1
      for (const item of parsedLinks) {
        const cleaned = sanitizeDealUrl(item.url)
        if (!cleaned) continue

        let score = 0
        const lowerLabel = item.label.toLowerCase()
        const lowerCleaned = cleaned.toLowerCase()

        // Exact Plugin Boutique product or deal slug
        if (lowerCleaned.includes('pluginboutique.com/product/') || lowerCleaned.includes('pluginboutique.com/deals/')) {
          score += 100
        }
        // Has price in label e.g. "($79)" or "FREE"
        if (/\(\s*\$?\d+/.test(item.label) || lowerLabel.includes('free') || lowerLabel.includes('download')) {
          score += 50
        }
        // Deep product slug (has a path beyond root domain like /megamorph/ or /products/...)
        try {
          const u = new URL(cleaned)
          if (u.pathname && u.pathname !== '/' && u.pathname.length > 2) {
            score += 30
          }
        } catch {}

        // Trusted developer/marketplace platforms
        if (
          lowerCleaned.includes('gumroad.com') ||
          lowerCleaned.includes('github.com') ||
          lowerCleaned.includes('safari-pedals.com') ||
          lowerCleaned.includes('celestdsp.com') ||
          lowerCleaned.includes('syncaudio.io') ||
          lowerCleaned.includes('leitaudio.com') ||
          lowerCleaned.includes('abyzor.space')
        ) {
          score += 25
        }

        if (score > highestScore) {
          highestScore = score
          bestUrl = cleaned
        }
      }
    }

    // Extract coupon code if present in article text (e.g. BPB100OFF, SAVE50, etc.)
    const couponMatch = text.match(
      /(?:coupon|promo|voucher)\s*(?:code)?\s*(?:is|:)?\s*[\*\"\'\`]?([A-Z0-9_-]{4,20})[\*\"\'\`]?/i
    )
    if (
      couponMatch &&
      !['FREE', 'DEAL', 'SALE', 'CODE', 'REQUIRED', 'NONE', 'APPLY'].includes(couponMatch[1].toUpperCase())
    ) {
      couponCode = couponMatch[1].toUpperCase()
    }

    // Extract expiry timeline if present in page text (e.g. "40% off until Nov 01", "until November 1", "sale ends Oct 31")
    let expiryTimeline: string | undefined
    const expiryMatch = text.match(
      /(?:\d{1,2}%\s+off\s+until|\buntil|\bends\s+on|\bsale\s+ends|\bdeal\s+ends|\bvalid\s+until|\bvalid\s+through)\s+([a-zA-Z]+\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s*\d{4})?|\d{1,2}(?:st|nd|rd|th)?\s+[a-zA-Z]+(?:,?\s*\d{4})?)/i
    )
    if (expiryMatch) {
      expiryTimeline = expiryMatch[0].trim()
    }

    // If destination is a Plugin Boutique product page, verify live pricing & active status
    if (bestUrl && bestUrl.includes('pluginboutique.com/product/')) {
      const pbLive = await fetchPluginBoutiqueProductLiveDetails(bestUrl)
      if (pbLive) {
        return {
          bestUrl,
          couponCode,
          expiryTimeline: pbLive.expiryTimeline || expiryTimeline,
          dealPrice: pbLive.dealPrice,
          regularPrice: pbLive.regularPrice,
          discount: pbLive.discount,
          brand: pbLive.brand,
          productName: pbLive.title,
          coverImage: pbLive.coverImage,
          isDealActive: pbLive.isDealActive,
        }
      }
    }

    return { bestUrl, couponCode, expiryTimeline }
  } catch {
    return null
  }
}


export const MUSIC_NEWS_FEEDS: Array<{
  name: string
  url: string
  fallbackUrl?: string
  categoryDefault: string
  isPrimary: boolean
}> = [
  {
    name: 'Rekkerd (Latest Music News & Deals)',
    url: 'https://rekkerd.org/feed/',
    fallbackUrl: 'https://news.google.com/rss/search?q=site:rekkerd.org&hl=en-US&gl=US&ceid=US:en',
    categoryDefault: 'Deals & Sales',
    isPrimary: true,
  },
  {
    name: 'AudioPlugin Guy (Latest News & Deals)',
    url: 'https://www.audiopluginguy.com/feed/',
    categoryDefault: 'Deals & Sales',
    isPrimary: true,
  },
  {
    name: 'Bedroom Producers Blog',
    url: 'https://bedroomproducersblog.com/feed/',
    categoryDefault: 'Free VSTs',
    isPrimary: true,
  },
  {
    name: 'Rekkerd (Free VSTs & Freeware)',
    url: 'https://rekkerd.org/tag/free/feed/',
    categoryDefault: 'Free VSTs',
    isPrimary: true,
  },
  {
    name: 'AudioPlugin Guy (Exclusive Deals)',
    url: 'https://www.audiopluginguy.com/deals/feed/',
    categoryDefault: 'Deals & Sales',
    isPrimary: true,
  },
  {
    name: 'KVR Audio',
    url: 'https://www.kvraudio.com/news/rss.xml',
    categoryDefault: 'Tech & Gear',
    isPrimary: false,
  },
  {
    name: 'Gearnews',
    url: 'https://www.gearnews.com/feed/',
    categoryDefault: 'Tech & Gear',
    isPrimary: false,
  },
]

/**
 * Fetches official deals directly from Plugin Boutique:
 * 1. Hot Deals (https://www.pluginboutique.com/deals) - IRON 2, Roland, MODO BASS 2, etc.
 * 2. Vocal Processing (https://www.pluginboutique.com/categories/54-Vocal-Processing) - Waves Tune Real-Time, Little AlterBoy, etc.
 * Parses exact product name, brand, category, direct deal slug, high-res banner, discount %, pricing, and expiry timeline ("Ends [date]").
 * Automatically appends ProducerToy's referral tag (68affa2b94f43).
 */
export async function fetchPluginBoutiqueDealsFeedItems(): Promise<RawFeedItem[]> {
  const items: RawFeedItem[] = []
  const seenUrls = new Set<string>()

  const sourcePages = [
    'https://www.pluginboutique.com/deals?featured=true&sort=hot',
    'https://www.pluginboutique.com/deals?sort=hot',
  ]

  const results = await Promise.allSettled(
    sourcePages.map(async (pageUrl) => {
      const res = await fetch(`https://r.jina.ai/${pageUrl}`, {
        headers: {
          Accept: 'text/plain',
        },
        signal: AbortSignal.timeout(3500),
        next: { revalidate: 1800 },
      })
      if (!res.ok) return ''
      return res.text()
    })
  )

  for (const r of results) {
    if (r.status !== 'fulfilled' || !r.value) continue
    const text = r.value

    const productBlocks = text.split(/(?=\[!\[Image \d+: Product image\])/)
    for (const block of productBlocks) {
      const imgMatch = block.match(
        /\[!\[Image \d+: Product image\]\((https:\/\/banners\.pluginboutique\.com\/[^\)]+)\)\]\((https:\/\/www\.pluginboutique\.com\/product\/[^\)]+)\)/
      )
      if (!imgMatch) continue

      const imageUrl = imgMatch[1]
      const rawProductUrl = imgMatch[2]
      const cleanUrl = sanitizeDealUrl(rawProductUrl) || rawProductUrl

      // Deduplicate across pages
      const urlKey = cleanUrl.toLowerCase().split('?')[0]
      if (seenUrls.has(urlKey)) continue
      seenUrls.add(urlKey)

      // Ends date: e.g. [Ends 11 Oct Hot!], 'until Nov 01', 'Ends Nov 01', etc.
      const endsMatch = block.match(/(?:\[?\s*(?:Ends|until|runs through|valid through|sale ends)\s+([a-zA-Z]+\s+\d{1,2}|\d{1,2}\s+[a-zA-Z]+[^\]\n\r]*?)\]?)/i)
      const expiry = endsMatch ? endsMatch[1].replace(/Hot!|New!/gi, '').trim() : ''

      // STRICT CHECK: If the deal date has already expired, skip immediately!
      if (expiry) {
        const expCheck = parseExpiryDateText(expiry)
        if (expCheck && expCheck.isExpired) {
          continue
        }
      }

      // Category & Manufacturer e.g. [Virtual Instruments](...) by [UJAM](...)
      const byMatch = block.match(/\[([^\]]+)\]\([^\)]+\)\s*by\s*\[([^\]]+)\]/i)
      const category = byMatch ? byMatch[1].trim() : 'Deals & Sales'
      const brand = byMatch ? byMatch[2].trim() : ''

      // Name: appears before 'by' or right after the links
      const nameMatch = block.match(/\n\s*([^\n\[\]]{2,60})\s*\n\s*\[[^\]]+\]\([^\)]+\)\s*by/)
      const name = nameMatch ? cleanText(nameMatch[1].trim()) : ''

      // Prices & discount: Parse accurately (deal price is ALWAYS the lower amount)
      const priceMatches = [...block.matchAll(/\$([0-9]+(?:\.[0-9]{2})?)/g)].map((m) => m[1])
      const discountMatch = block.match(/(\d+%\s*off)/i)

      let regularPrice: string | null = null
      let dealPrice: string | null = null
      if (priceMatches.length >= 2) {
        const num0 = parseFloat(priceMatches[0])
        const num1 = parseFloat(priceMatches[1])
        if (num0 < num1) {
          dealPrice = '$' + priceMatches[0]
          regularPrice = '$' + priceMatches[1]
        } else {
          dealPrice = '$' + priceMatches[1]
          regularPrice = '$' + priceMatches[0]
        }
      } else if (priceMatches.length === 1) {
        dealPrice = '$' + priceMatches[0]
      }

      let discount = discountMatch ? discountMatch[1].toUpperCase() : ''
      if (!discount && dealPrice && regularPrice) {
        const dVal = parseFloat(dealPrice.replace('$', ''))
        const rVal = parseFloat(regularPrice.replace('$', ''))
        if (rVal > dVal && rVal > 0) {
          discount = `${Math.round(((rVal - dVal) / rVal) * 100)}% OFF`
        }
      }

      if (name && cleanUrl) {
        const fullTitle = brand
          ? `${brand} ${name} Deal: ${discount ? discount + ' ' : ''}(${dealPrice || 'Special Offer'})`
          : `${name} Sale: ${discount ? discount + ' ' : ''}(${dealPrice || 'Special Offer'})`

        const snippet = `${brand ? brand + ' ' : ''}${name} is currently on sale${discount ? ` at ${discount}` : ''}. Official verified deal price is ${dealPrice || 'discounted'}${regularPrice ? ` (regularly ${regularPrice})` : ''}.${expiry ? ` Limited-time offer ${expiry}.` : ''}`

        const item: RawFeedItem = {
          title: fullTitle,
          link: cleanUrl,
          pubDate: new Date().toUTCString(),
          creator: brand || 'Plugin Boutique',
          contentSnippet: snippet,
          imageUrl,
          sourceName: 'Plugin Boutique Deals',
          isPrimary: true,
          directDealUrl: cleanUrl,
        }

        if (expiry) {
          ;(item as any).expiryTimeline = expiry
        }
        if (dealPrice) {
          ;(item as any).dealPrice = dealPrice
        }
        if (regularPrice) {
          ;(item as any).regularPrice = regularPrice
        }
        if (brand) {
          ;(item as any).brand = brand
        }
        if (name) {
          ;(item as any).productName = name
        }
        if (discount) {
          ;(item as any).discount = discount
        }

        items.push(item)
      }
    }
  }
  return items
}

/**
 * Fetches and parses deals from PluginDeals.net via reader proxy.
 * Replaces competitor affiliate tags with ProducerToy's Plugin Boutique affiliate tag (68affa2b94f43).
 */
export async function fetchPluginDealsFeedItems(): Promise<RawFeedItem[]> {
  const items: RawFeedItem[] = []
  try {
    const res = await fetch('https://r.jina.ai/https://plugindeals.net/', {
      headers: {
        Accept: 'text/plain',
      },
      signal: AbortSignal.timeout(3500),
      next: { revalidate: 1800 },
    })
    if (!res.ok) return items
    const text = await res.text()

    // 1. Ending Soon Deals
    const bulletRegex = /\*\s+\*\*\[([^\]]+)\]\(([^)]+)\)\*\*([^\n]*)/g
    let match: RegExpExecArray | null
    while ((match = bulletRegex.exec(text)) !== null) {
      const title = cleanText(match[1].trim())
      const rawUrl = match[2].trim()
      const expiry = match[3].replace(/_Expiry:\s*/i, '').replace(/_/g, '').trim()
      if (expiry) {
        const expCheck = parseExpiryDateText(expiry)
        if (expCheck && expCheck.isExpired) {
          continue
        }
      }
      const cleanUrl = sanitizeDealUrl(rawUrl) || rawUrl

      items.push({
        title,
        link: cleanUrl,
        pubDate: new Date().toUTCString(),
        creator: 'Plugin Deals',
        contentSnippet: `${title}. Expiry: ${expiry || 'Limited time'}. Available with verified discounts.`,
        sourceName: 'PluginDeals',
        isPrimary: true,
        directDealUrl: cleanUrl,
      })
    }

    // 2. Top Record Low Products (instant in-memory parsing without blocking in loop)
    const topDealsRegex = /\[!\[[^\]]*\]\((https:\/\/plugindeals\.net\/deal-graphics\/[^)]+)\)\]\([^)]+\)\s*([^\n\r]+)/g
    while ((match = topDealsRegex.exec(text)) !== null) {
      const imageUrl = match[1].trim()
      const productName = cleanText(match[2].trim())
      const fallbackUrl = `https://www.pluginboutique.com/deals?a_aid=${PLUGIN_BOUTIQUE_AFFILIATE_ID}`

      items.push({
        title: `${productName} on Sale (Exclusive Deal)`,
        link: fallbackUrl,
        pubDate: new Date().toUTCString(),
        creator: 'Plugin Deals',
        contentSnippet: `${productName} is currently on sale at an exceptional discount. Official release with lifetime licensing and instant download.`,
        imageUrl,
        sourceName: 'PluginDeals',
        isPrimary: true,
        directDealUrl: fallbackUrl,
      })
    }
  } catch (err) {
    console.warn('[fetchPluginDealsFeedItems] Error fetching PluginDeals:', err)
  }
  return items
}

/**
 * Searches Plugin Boutique and extracts the exact product URL slug (/product/...)
 * with Producer Toy's affiliate referral ID attached.
 */
export async function resolvePluginBoutiqueProductUrl(productName: string): Promise<string> {
  const candidates: string[] = []

  // 1. Base clean without deal/pricing suffixes
  const stripped = productName
    .replace(/(?:deal|sale|flash sale|limited time)?\s*:\s*\d+%.*$/i, '')
    .replace(/(?:deal|sale)?\s*:\s*\(\s*\$[\d.]+\s*(?:vst)?\s*\).*$/i, '')
    .replace(/\s*\(\s*\$[\d.]+\s*(?:vst)?\s*\).*$/i, '')
    .replace(/^(?:get|grab|save|up to|\d+%\s*off|deal|sale|flash deal|free)\b/gi, '')
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (stripped.length >= 3) {
    candidates.push(stripped)
  }

  // 2. If title has "by" (e.g. "VM-COMP by Pulsar Audio")
  const byMatch = productName.match(/([^.]+?)\s+by\s+([^.]+)/i)
  if (byMatch) {
    const model = byMatch[1].replace(/^(?:get|grab|free)\s+/i, '').trim()
    const brand = byMatch[2].replace(/(?:deal|sale|\d+%).*$/i, '').trim()
    candidates.push(`${brand} ${model}`)
    candidates.push(model)
  }

  // 3. Remove common audio descriptor nouns (Tube Compressor, EQ, VST, Plugin, Synth, Audio)
  const coreOnly = stripped
    .replace(/\b(?:tube|compressor|limiter|equalizer|eq|reverb|delay|synth|synthesizer|workstation|plugin|vst3?|au|aax|bundle|audio)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (coreOnly.length >= 3 && !candidates.includes(coreOnly)) {
    candidates.push(coreOnly)
  }

  // 4. Fallback clean query
  const cleanQuery = productName
    .replace(/^(?:get|grab|save|up to|\d+%\s*off|deal|sale|flash deal|free)\b/gi, '')
    .replace(/\b(?:by|from|for|\$\d+|€\d+|off|discount|bestsellers|sale|deal|bundle)\b/gi, ' ')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 45)
  if (cleanQuery.length >= 3 && !candidates.includes(cleanQuery)) {
    candidates.push(cleanQuery)
  }

  for (const q of candidates) {
    if (q.length < 3) continue
    try {
      const searchRes = await fetch(
        `https://www.pluginboutique.com/search?qs=match&q=${encodeURIComponent(q)}`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          },
          signal: AbortSignal.timeout(3500),
        }
      )
      if (searchRes.ok) {
        const html = await searchRes.text()
        const prodMatch = html.match(/href=["'](\/product\/[^"']+)["']/i)
        if (prodMatch) {
          return `https://www.pluginboutique.com${prodMatch[1]}?a_aid=${PLUGIN_BOUTIQUE_AFFILIATE_ID}`
        }
      }
    } catch {}
  }

  // Fallback: direct deals section with referral
  return `https://www.pluginboutique.com/deals?a_aid=${PLUGIN_BOUTIQUE_AFFILIATE_ID}`
}

/**
 * Resolves the genuine product / offer URL.
 * 1. Checks if the product is on Plugin Boutique (/product/...).
 * 2. If not on Plugin Boutique (e.g. freeware, developer-direct plugins), searches DuckDuckGo for the authentic developer/product page.
 * 3. Falls back to Plugin Boutique deals only as last resort.
 */
export async function resolveAuthenticProductDealUrl(productName: string): Promise<string> {
  try {
    const cleanQuery = productName
      .replace(/^(?:get|grab|save|up to|\d+%\s*off|deal|sale|flash deal|free)\b/gi, '')
      .replace(/\b(?:by|from|for|\$\d+|€\d+|off|discount|bestsellers|sale|deal|bundle|free|vst3?|au|aax|windows|mac)\b/gi, ' ')
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 45)

    if (cleanQuery.length >= 3) {
      // 1. Try Plugin Boutique first
      const searchRes = await fetch(
        `https://www.pluginboutique.com/search?qs=match&q=${encodeURIComponent(cleanQuery)}`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          },
          signal: AbortSignal.timeout(3500),
        }
      )
      if (searchRes.ok) {
        const html = await searchRes.text()
        const prodMatch = html.match(/href=["'](\/product\/[^"']+)["']/i)
        if (prodMatch) {
          return `https://www.pluginboutique.com${prodMatch[1]}?a_aid=${PLUGIN_BOUTIQUE_AFFILIATE_ID}`
        }
      }

      // 2. Search DuckDuckGo for official developer product / download page
      const ddgRes = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(cleanQuery)}`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
        signal: AbortSignal.timeout(3500),
      })
      if (ddgRes.ok) {
        const ddgHtml = await ddgRes.text()
        const rawUrls = [...ddgHtml.matchAll(/class="result__url"[^>]*>([^<]+)/gi)].map(m => m[1].trim())
        for (const u of rawUrls) {
          const fullUrl = u.startsWith('http') ? u : `https://${u}`
          const sanitized = sanitizeDealUrl(fullUrl)
          if (sanitized) {
            return sanitized
          }
        }
      }
    }
  } catch {}

  return `https://www.pluginboutique.com/deals?a_aid=${PLUGIN_BOUTIQUE_AFFILIATE_ID}`
}

/**
 * Fetches real-time verified audio plugin news and releases from curated Telegram channels
 * (e.g. https://t.me/s/legalvst).
 * Prioritizes official hardware/GUI master graphics, verified discounts, and referral link rewriting.
 * Performs fast zero-blocking in-memory parsing over post data.
 */
export async function fetchTelegramChannelFeedItems(channelUsername = 'legalvst'): Promise<RawFeedItem[]> {
  const items: RawFeedItem[] = []
  try {
    const res = await fetch(`https://t.me/s/${channelUsername}`, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(3500),
      next: { revalidate: 900 },
    })
    if (!res.ok) return items
    const html = await res.text()

    // Match each message wrapper cleanly, capturing the full post including inline keyboard buttons
    const fullMsgs = [
      ...html.matchAll(
        /<div class="tgme_widget_message\b[^>]*data-post="([^"]+)"[^>]*>([\s\S]*?)(?=(?:<div class="tgme_widget_message\b|<\/body|$))/gi
      ),
    ]

    for (const post of fullMsgs.slice(-15)) {
      const postId = post[1]
      const content = post[2]
      const textMatch = content.match(/<div class="tgme_widget_message_text[^>]*>([\s\S]*?)<\/div>/i)
      if (!textMatch) continue

      const cleanContent = textMatch[1].replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim()
      const lines = cleanContent.split('\n').map((l) => l.trim()).filter(Boolean)
      if (lines.length === 0) continue

      const rawTitle = lines[0]
      if (rawTitle.toLowerCase().includes('pinned a photo') || rawTitle.length < 5) continue

      // IMPORTANT: Strictly do NOT use the Telegram channel's photo (telesco.pe) because it has channel watermarks / overlay stamps (@LEGALVST).
      // Leave imageUrl undefined so our crawler resolves the genuine, unwatermarked high-res product GUI/banner from the offer page!
      const imageUrl = undefined

      // Extract links from inline keyboard buttons (placed right below the post)
      const inlineButtons = [...content.matchAll(/<a[^>]+class="[^"]*tgme_widget_message_inline_button[^"]*"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)]
        .map((m) => ({
          url: m[1],
          label: m[2].replace(/<[^>]+>/g, '').trim(),
        }))
        .filter((b) => !b.url.includes('t.me/') && !b.url.includes('telegram.org') && !b.url.includes('telesco.pe'))

      // Extract in-text outbound links
      const rawTextLinks = [...textMatch[1].matchAll(/href="([^"]+)"/gi)]
        .map((m) => m[1])
        .filter((l) => !l.includes('t.me/') && !l.includes('telegram.org') && !l.includes('telesco.pe'))

      // Prioritize specific product / deal links:
      // 1. Inline button with /product/ or /deals/ or merchant/developer link (Patreon, dev site)
      // 2. In-text links
      // Ignore generic articles/2073 free-gift promotion if a specific product link exists!
      let directDealUrl: string | undefined

      const allCandidates: string[] = [
        ...inlineButtons.map((b) => b.url),
        ...rawTextLinks,
      ]

      // Filter out PB article gift links if a specific product or deal page is available
      const nonGiftCandidates = allCandidates.filter((u) => !u.includes('pluginboutique.com/articles/'))
      const candidatesToTest = nonGiftCandidates.length > 0 ? nonGiftCandidates : allCandidates

      for (const l of candidatesToTest) {
        const cleaned = sanitizeDealUrl(l)
        if (cleaned) {
          directDealUrl = cleaned
          break
        }
      }

      // In-memory extraction of discount, pricing, and expiry from post text
      let dealPrice: string | null = null
      let regularPrice: string | null = null
      let discount: string | null = null
      let expiryTimeline: string | null = null

      const discountMatch = cleanContent.match(/(\d+%\s*off)/i)
      if (discountMatch) {
        discount = discountMatch[1].toUpperCase()
      }

      const priceMatches = [...cleanContent.matchAll(/\$([0-9]+(?:\.[0-9]{2})?)/g)].map((m) => m[1])
      if (priceMatches.length >= 2) {
        const p1 = parseFloat(priceMatches[0])
        const p2 = parseFloat(priceMatches[1])
        if (p1 < p2) {
          dealPrice = `$${priceMatches[0]}`
          regularPrice = `$${priceMatches[1]}`
        } else {
          dealPrice = `$${priceMatches[1]}`
          regularPrice = `$${priceMatches[0]}`
        }
      } else if (priceMatches.length === 1) {
        dealPrice = `$${priceMatches[0]}`
      }

      const expMatch = cleanContent.match(/(?:until|ends|valid through)\s+([a-zA-Z]+\s+\d{1,2}|\d{1,2}\s+[a-zA-Z]+[^.\n]*)/i)
      if (expMatch) {
        expiryTimeline = expMatch[1].trim()
      }

      let formattedTitle = rawTitle
      if (discount && dealPrice) {
        formattedTitle = `${rawTitle} Deal: ${discount} (${dealPrice})`
      } else if (dealPrice) {
        formattedTitle = `${rawTitle} Deal: (${dealPrice})`
      }

      const item: RawFeedItem = {
        title: formattedTitle,
        link: directDealUrl || '',
        pubDate: new Date().toUTCString(),
        creator: 'Legal VST VIP',
        contentSnippet: cleanContent.slice(0, 1000),
        imageUrl,
        sourceName: 'Legal VST (Telegram VIP)',
        isPrimary: true,
        directDealUrl,
      }

      if (dealPrice) (item as any).dealPrice = dealPrice
      if (regularPrice) (item as any).regularPrice = regularPrice
      if (discount) (item as any).discount = discount
      if (expiryTimeline) (item as any).expiryTimeline = expiryTimeline

      items.push(item)
    }
  } catch (err) {
    console.warn('[fetchTelegramChannelFeedItems] Error:', err)
  }
  return items
}

/**
 * Concurrently fetches and parses all RSS feeds with timeout protection
 */
async function fetchRssFeedsConcurrently(): Promise<RawFeedItem[]> {
  const feedPromises = MUSIC_NEWS_FEEDS.map(async (feed) => {
    try {
      let res = await fetch(feed.url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
        },
        signal: AbortSignal.timeout(3000),
        next: { revalidate: 1800 },
      })

      if (!res.ok && feed.fallbackUrl) {
        res = await fetch(feed.fallbackUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'application/rss+xml, application/xml, text/xml, */*',
          },
          signal: AbortSignal.timeout(3000),
          next: { revalidate: 1800 },
        })
      }

      if (!res.ok) return []
      const xml = await res.text()
      return parseRssItems(xml, feed.name, feed.isPrimary, feed.categoryDefault)
    } catch {
      return []
    }
  })

  const results = await Promise.allSettled(feedPromises)
  const items: RawFeedItem[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') {
      items.push(...r.value)
    }
  }
  return items
}

/**
 * Detects whether an item is a Free Plugin, Freeware, or 100% Free Giveaway.
 */
export function isFreePluginItem(item: RawFeedItem): boolean {
  if (item.categoryDefault === 'Free VSTs') {
    const titleLower = (item.title || '').toLowerCase()
    // If tagged under Free VSTs, ensure it's not a paid sale item with % off
    if (!titleLower.includes('% off') && !titleLower.includes('sale') && !titleLower.includes('deal: $')) {
      return true
    }
  }

  const titleLower = (item.title || '').toLowerCase()
  const snippetLower = (item.contentSnippet || '').toLowerCase()
  const priceLower = (item.dealPrice || '').toLowerCase().trim()

  if (priceLower === '$0' || priceLower === 'free' || priceLower === '$0.00' || priceLower === '0$') {
    return true
  }

  const freePattern =
    /\b(free|freeware|giveaway|100%\s*free|free\s*vst|free\s*plugin|free\s*download|for\s*free|free\s*sample|free\s*synth|free\s*reverb|free\s*instrument|free\s*pack|gratis|freebie)\b/i

  if (freePattern.test(titleLower)) return true
  if (item.sourceName.toLowerCase().includes('bedroom producers blog') && freePattern.test(snippetLower)) {
    return true
  }

  return false
}

/**
 * Calculates priority score for feed ingestion:
 * - Free plugins receive the HIGHEST priority (+200 pts)
 * - Deep verified deals (80%+ off / <= $19) receive secondary priority (+90 pts)
 * - Solid verified deals (50%+ off / <= $39) receive +60 pts
 * - Minor deals receive +30 pts
 * - Recency factor: items published in the last 24-72 hours receive up to +50 pts
 */
export function calculateItemPriority(item: RawFeedItem): number {
  let score = 0
  const isFree = isFreePluginItem(item)

  if (isFree) {
    score += 200 // Free plugins get top priority!
  } else {
    // For deals, apply strict quality scoring based on real verified discounts
    const discount = (item.discount || '').toUpperCase()
    const dealPrice = item.dealPrice ? parseFloat(item.dealPrice.replace('$', '')) : null

    if (
      discount.includes('80%') ||
      discount.includes('85%') ||
      discount.includes('90%') ||
      discount.includes('95%') ||
      (dealPrice !== null && dealPrice > 0 && dealPrice <= 19)
    ) {
      score += 90 // Mega deals / deep budget steals
    } else if (
      discount.includes('50%') ||
      discount.includes('60%') ||
      discount.includes('70%') ||
      (dealPrice !== null && dealPrice <= 39)
    ) {
      score += 60 // Solid deals
    } else {
      score += 30 // Minor deals
    }

    // Penalize deals missing discount or pricing info
    if (!item.discount && !item.dealPrice && !item.title.toLowerCase().includes('deal')) {
      score -= 20
    }
  }

  // Recency bonus
  const time = new Date(item.pubDate).getTime() || 0
  if (time > 0) {
    const hoursAgo = Math.max(0, (Date.now() - time) / (1000 * 60 * 60))
    const recencyBoost = Math.max(0, 50 - hoursAgo * 0.5)
    score += recencyBoost
  }

  return score
}

/**
 * Fetch and parse RSS items from music production feeds in parallel.
 * Runs Telegram VIP (@legalvst), official Plugin Boutique Deals, and RSS feeds concurrently.
 * Applies priority scoring: FREE plugins rank first, followed by verified top deals.
 */
export async function fetchMusicNewsFeedItems(): Promise<RawFeedItem[]> {
  const [tgResult, pbResult, pdResult, rssResult] = await Promise.allSettled([
    fetchTelegramChannelFeedItems('legalvst'),
    fetchPluginBoutiqueDealsFeedItems(),
    fetchPluginDealsFeedItems(),
    fetchRssFeedsConcurrently(),
  ])

  const allItems: RawFeedItem[] = []
  if (tgResult.status === 'fulfilled') allItems.push(...tgResult.value)
  if (pbResult.status === 'fulfilled') allItems.push(...pbResult.value)
  if (pdResult.status === 'fulfilled') allItems.push(...pdResult.value)
  if (rssResult.status === 'fulfilled') allItems.push(...rssResult.value)

  // Prioritize items: Free plugins get top priority, followed by deep high-value deals with strict rules
  allItems.sort((a, b) => {
    const scoreA = calculateItemPriority(a)
    const scoreB = calculateItemPriority(b)
    if (scoreB !== scoreA) {
      return scoreB - scoreA
    }
    const timeA = new Date(a.pubDate).getTime() || 0
    const timeB = new Date(b.pubDate).getTime() || 0
    return timeB - timeA
  })

  return allItems
}

/**
 * Robust regex-based RSS item parser (works in Edge and Node runtimes)
 */
function parseRssItems(
  xml: string,
  sourceName: string,
  isPrimary = false,
  categoryDefault?: string
): RawFeedItem[] {
  const items: RawFeedItem[] = []
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) || []

  for (const block of itemBlocks.slice(0, 15)) {
    // Title
    const titleMatch =
      block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) ||
      block.match(/<title>([\s\S]*?)<\/title>/i)
    const title = cleanText(titleMatch ? titleMatch[1] : '')

    // Link
    const linkMatch =
      block.match(/<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>/i) ||
      block.match(/<link>([\s\S]*?)<\/link>/i)
    const link = (linkMatch ? linkMatch[1] : '').trim()

    if (!title || !link) continue

    // PubDate
    const dateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)
    const pubDate = dateMatch ? dateMatch[1].trim() : new Date().toUTCString()

    // Creator / Author
    const creatorMatch =
      block.match(/<dc:creator><!\[CDATA\[([\s\S]*?)\]\]><\/dc:creator>/i) ||
      block.match(/<dc:creator>([\s\S]*?)<\/dc:creator>/i) ||
      block.match(/<author>([\s\S]*?)<\/author>/i)
    const creator = cleanText(creatorMatch ? creatorMatch[1] : 'ProducerToy Editorial')

    // Content or Description snippet
    const contentMatch =
      block.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/i) ||
      block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) ||
      block.match(/<description>([\s\S]*?)<\/description>/i)
    const rawContent = contentMatch ? contentMatch[1] : ''
    const contentSnippet = cleanHtmlSnippet(rawContent)

    // Image URL extraction
    let imageUrl: string | undefined

    // 1. media:content
    const mediaMatch = block.match(/<media:content[^>]*url="([^"]+)"/i)
    if (mediaMatch && isValidImageUrl(mediaMatch[1])) {
      imageUrl = mediaMatch[1]
    }

    // 2. enclosure
    if (!imageUrl) {
      const encMatch = block.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image\//i)
      if (encMatch && isValidImageUrl(encMatch[1])) {
        imageUrl = encMatch[1]
      }
    }

    // 3. First <img> tag in content
    if (!imageUrl) {
      const imgTagMatch = block.match(/<img[^>]+src="([^">]+)"/i)
      if (imgTagMatch && isValidImageUrl(imgTagMatch[1])) {
        imageUrl = imgTagMatch[1]
      }
    }

    // UPGRADE TO FULL HD: Strip WordPress thumbnail dimension suffixes (-128x71, -300x169, -768x432)
    if (imageUrl) {
      imageUrl = imageUrl.replace(/-\d+x\d+(\.[a-zA-Z0-9]+(?:\?.*)?)$/i, '$1')
    }

    // Direct merchant / store / developer deal URL extraction
    let directDealUrl: string | undefined
    const rawLinks = (rawContent + ' ' + block).match(/href="([^"#]+)"/gi) || []
    for (const l of rawLinks) {
      const hrefMatch = l.match(/href="([^"#]+)"/i)
      if (!hrefMatch) continue
      const cleaned = sanitizeDealUrl(hrefMatch[1])
      if (cleaned) {
        directDealUrl = cleaned
        break
      }
    }

    items.push({
      title,
      link: directDealUrl || link,
      pubDate,
      creator,
      contentSnippet,
      imageUrl,
      sourceName,
      isPrimary,
      categoryDefault,
      directDealUrl,
    })
  }

  return items
}

function cleanText(text: string): string {
  return text
    // Decode HTML entities
    .replace(/&#038;/g, '&')
    .replace(/&#38;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#160;/g, ' ')
    .replace(/&nbsp;/g, ' ')
    // Strip any HTML tags that may be embedded in titles
    .replace(/<[^>]+>/g, '')
    // Strip trailing source attribution tags like '- studio insights', '- Guitar World', '- MusicTech'
    .replace(/\s*[-–—]\s*(?:studio insights|guitar world|musictech|bedroom producers blog|bpb|rekkerd|audiopluginguy|kvr audio|gearnews)\s*$/i, '')
    .trim()
}

function cleanHtmlSnippet(html: string): string {
  return html
    // Decode escaped entities first so embedded tags can be stripped
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    // Strip all HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Strip raw Google News redirects
    .replace(/https?:\/\/news\.google\.com\/[^\s)\]"']*/gi, '')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 3000)
}

function isValidImageUrl(url: string): boolean {
  if (!url) return false
  const lower = url.toLowerCase().trim()
  // Skip tracking pixels, gravatars, avatars, or google usercontent/logos
  if (
    lower.includes('avatar') ||
    lower.includes('pixel') ||
    lower.includes('1x1') ||
    lower.includes('googleusercontent.com') ||
    lower.includes('gstatic.com') ||
    lower.includes('news.google.com') ||
    lower.includes('google.com') ||
    lower.includes('placeholder') ||
    lower.includes('favicon')
  ) {
    return false
  }
  return (
    lower.startsWith('http') &&
    (lower.includes('.jpg') ||
      lower.includes('.jpeg') ||
      lower.includes('.png') ||
      lower.includes('.webp') ||
      lower.includes('wp-content/uploads'))
  )
}

/**
 * Strict Quality Gate Verification:
 * Validates that an article has a working, verified 200 OK deal link and authentic HD image.
 * If either link (e.g. 404/410/broken) or image verification fails, the article is rejected.
 */
export async function verifyArticleQuality(article: {
  title?: string
  content?: string
  excerpt?: string
  source_url?: string | null
  cover_image?: string | null
  category?: string | null
  badge?: string | null
  specs?: Record<string, string> | null
  deal_price?: string | null
  deal_regular_price?: string | null
  deal_expires_at?: string | null
}): Promise<{ isValid: boolean; reason?: string }> {
  // 1. Strict Expiry Verification: NEVER publish an expired deal!
  const expiryCheck = detectDealExpiry(article)
  if (expiryCheck.isExpired) {
    return {
      isValid: false,
      reason: `Deal has already ended or expired (${expiryCheck.expiryTimeline || 'Deadline passed'})`,
    }
  }

  // 2. Strict Genuine HD Image Verification (Zero AI, Zero Stock Fallbacks, Zero Spacers)
  const img = article.cover_image
  if (
    !img ||
    typeof img !== 'string' ||
    img.length < 15 ||
    img.toLowerCase().includes('spacer') ||
    img.toLowerCase().includes('1x1') ||
    img.toLowerCase().includes('transparent') ||
    img.toLowerCase().includes('empty') ||
    img.toLowerCase().includes('logo_black') ||
    img.toLowerCase().includes('logo_dark') ||
    img.includes('placeholder') ||
    img.includes('pollinations.ai') ||
    img.includes('images.unsplash.com') ||
    img.includes('news.google.com') ||
    img.includes('googleusercontent.com') ||
    img.includes('gstatic.com') ||
    img.includes('telesco.pe') ||
    img.includes('telegram') ||
    img.includes('t.me') ||
    img.includes('photo-1598488035139-bdbb2231ce04') ||
    img.includes('62597tdwpbuqa4wb3ytyr780r83o') ||
    img.includes('8703u6x0lrzyjlnucnb396u4m6qb')
  ) {
    return { isValid: false, reason: 'Invalid, low-res, placeholder, spacer, telegram watermarked, or non-authentic image URL' }
  }

  // 3. Strict Genuine Pricing Verification (Zero Fake Pricing, Zero Inactive Deals)
  if (article.category === 'Deals & Sales') {
    if (!article.deal_price || article.deal_price === 'Special Offer' || !article.deal_price.startsWith('$')) {
      return { isValid: false, reason: 'Deals & Sales article missing verified deal price ($XX.XX)' }
    }
    if (!article.deal_regular_price || !article.deal_regular_price.startsWith('$')) {
      return { isValid: false, reason: 'Deals & Sales article missing verified regular price ($YY.YY)' }
    }
    if (article.deal_price === article.deal_regular_price) {
      return { isValid: false, reason: 'Product is at full price, not an active deal' }
    }
  }

  // 4. Strict Deal Link Verification
  let dealUrl = article.source_url
  if (!dealUrl || !dealUrl.startsWith('http')) {
    return { isValid: false, reason: 'Missing or malformed deal link' }
  }

  const lower = dealUrl.toLowerCase()

  // Block competitor scraper blog links or Telegram links from ever being published as the deal link
  if (
    lower.includes('news.google.com') ||
    lower.includes('bedroomproducersblog.com') ||
    lower.includes('rekkerd.org') ||
    lower.includes('audiopluginguy.com') ||
    lower.includes('gearnews.com') ||
    lower.includes('t.me') ||
    lower.includes('telegram.org') ||
    lower.includes('telesco.pe')
  ) {
    return { isValid: false, reason: 'Deal link points to aggregator, telegram channel, or scraper blog instead of official product' }
  }

  // Auto-correct known moved URLs
  if (lower.includes('native-instruments.com')) {
    if (lower.includes('/innovations/kontakt-player')) {
      dealUrl = 'https://www.native-instruments.com/en/products/komplete/samplers/kontakt-player/'
    } else if (lower.includes('/products/software')) {
      dealUrl = 'https://www.native-instruments.com/collections/music-creation'
    } else if (lower.includes('/specials/deals')) {
      dealUrl = 'https://www.native-instruments.com/collections/komplete-bundles'
    }
  }

  // Probe the link to verify it is NOT 404 or dead
  try {
    const probe = await fetch(dealUrl, {
      method: 'HEAD',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(3500),
    })

    if (probe.status === 405) {
      // Retry with GET if server blocks HEAD
      const getProbe = await fetch(dealUrl, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Range: 'bytes=0-100',
        },
        signal: AbortSignal.timeout(3500),
      })
      if (getProbe.status === 404 || getProbe.status === 410) {
        return { isValid: false, reason: `Deal link returned HTTP ${getProbe.status} (Page Not Found)` }
      }
    } else if (probe.status === 404 || probe.status === 410) {
      return { isValid: false, reason: `Deal link returned HTTP ${probe.status} (Page Not Found)` }
    }
  } catch (err: any) {
    // If external site timed out, log warning but do not hard-crash
    console.warn(`[verifyArticleQuality] Link probe timeout/error for ${dealUrl}:`, err?.message || err)
  }

  return { isValid: true }
}
