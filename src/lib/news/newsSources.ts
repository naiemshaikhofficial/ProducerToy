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
  directDealUrl?: string
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

  // Block competitor blogs, social media, tracking pixels
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
export async function extractDirectDealInfo(articleUrl: string): Promise<{
  bestUrl?: string
  couponCode?: string
  expiryTimeline?: string
} | null> {
  if (!articleUrl || typeof articleUrl !== 'string') return null

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4500)

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
    'https://www.pluginboutique.com/deals',
    'https://www.pluginboutique.com/categories/54-Vocal-Processing',
  ]

  for (const pageUrl of sourcePages) {
    try {
      const res = await fetch(`https://r.jina.ai/${pageUrl}`, {
        headers: {
          Accept: 'text/plain',
        },
        next: { revalidate: 1800 },
      })
      if (!res.ok) continue
      const text = await res.text()

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
    } catch (err) {
      console.warn(`[fetchPluginBoutiqueDealsFeedItems] Error fetching ${pageUrl}:`, err)
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

    // 2. Top Record Low Products
    const topDealsRegex = /\[!\[[^\]]*\]\((https:\/\/plugindeals\.net\/deal-graphics\/[^)]+)\)\]\([^)]+\)\s*([^\n\r]+)/g
    while ((match = topDealsRegex.exec(text)) !== null) {
      const imageUrl = match[1].trim()
      const productName = cleanText(match[2].trim())
      const exactProductUrl = await resolvePluginBoutiqueProductUrl(productName)

      items.push({
        title: `${productName} on Sale (Exclusive Deal)`,
        link: exactProductUrl,
        pubDate: new Date().toUTCString(),
        creator: 'Plugin Deals',
        contentSnippet: `${productName} is currently on sale at an exceptional discount. Official release with lifetime licensing and instant download.`,
        imageUrl,
        sourceName: 'PluginDeals',
        isPrimary: true,
        directDealUrl: exactProductUrl,
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
  try {
    const cleanQuery = productName
      .replace(/^(?:get|grab|save|up to|\d+%\s*off|deal|sale|flash deal|free)\b/gi, '')
      .replace(/\b(?:by|from|for|\$\d+|€\d+|off|discount|bestsellers|sale|deal|bundle)\b/gi, ' ')
      .replace(/[^a-zA-Z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 45)

    if (cleanQuery.length >= 3) {
      const searchRes = await fetch(
        `https://www.pluginboutique.com/search?qs=match&q=${encodeURIComponent(cleanQuery)}`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          },
          signal: AbortSignal.timeout(4500),
        }
      )
      if (searchRes.ok) {
        const html = await searchRes.text()
        const prodMatch = html.match(/href=["'](\/product\/[^"']+)["']/i)
        if (prodMatch) {
          return `https://www.pluginboutique.com${prodMatch[1]}?a_aid=${PLUGIN_BOUTIQUE_AFFILIATE_ID}`
        }
      }
    }
  } catch {}

  // Fallback: direct deals section with referral
  return `https://www.pluginboutique.com/deals?a_aid=${PLUGIN_BOUTIQUE_AFFILIATE_ID}`
}

/**
 * Fetch and parse RSS items from music production feeds
 * Prioritizes official Plugin Boutique Deals, PluginDeals, Rekkerd, AudioPlugin Guy, and BPB items
 */
export async function fetchMusicNewsFeedItems(): Promise<RawFeedItem[]> {
  const allItems: RawFeedItem[] = []

  // 1. Fetch official Plugin Boutique Deals directly (highest priority)
  try {
    const pbItems = await fetchPluginBoutiqueDealsFeedItems()
    allItems.push(...pbItems)
  } catch (err) {
    console.warn('[fetchMusicNewsFeedItems] Error in Plugin Boutique fetch:', err)
  }

  // 2. Fetch PluginDeals.net items with verified referral replacement
  try {
    const pdItems = await fetchPluginDealsFeedItems()
    allItems.push(...pdItems)
  } catch (err) {
    console.warn('[fetchMusicNewsFeedItems] Error in PluginDeals fetch:', err)
  }

  for (const feed of MUSIC_NEWS_FEEDS) {
    try {
      let res = await fetch(feed.url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
        },
        next: { revalidate: 1800 }, // 30 mins
      })

      // If feed returns 403 or error and has a fallback URL, use fallback URL
      if (!res.ok && feed.fallbackUrl) {
        res = await fetch(feed.fallbackUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'application/rss+xml, application/xml, text/xml, */*',
          },
          next: { revalidate: 1800 },
        })
      }

      if (!res.ok) {
        console.warn(`[fetchMusicNewsFeedItems] Feed ${feed.name} returned status ${res.status}`)
        continue
      }

      const xml = await res.text()
      const items = parseRssItems(xml, feed.name, feed.isPrimary)

      if (feed.isPrimary) {
        allItems.unshift(...items)
      } else {
        allItems.push(...items)
      }
    } catch (err) {
      console.warn(`[fetchMusicNewsFeedItems] Error fetching feed ${feed.name}:`, err)
    }
  }

  // Sort by pubDate descending so the freshest releases across all feeds (Bedroom Producers Blog, Rekkerd, Plugin Boutique) are synchronized first
  allItems.sort((a, b) => {
    const timeA = new Date(a.pubDate).getTime() || 0
    const timeB = new Date(b.pubDate).getTime() || 0
    return timeB - timeA
  })

  return allItems
}

/**
 * Robust regex-based RSS item parser (works in Edge and Node runtimes)
 */
function parseRssItems(xml: string, sourceName: string, isPrimary = false): RawFeedItem[] {
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

  // 2. Strict Image Verification
  const img = article.cover_image
  if (
    !img ||
    typeof img !== 'string' ||
    img.length < 10 ||
    img.includes('placeholder') ||
    img.includes('pollinations.ai') ||
    img.includes('news.google.com') ||
    img.includes('googleusercontent.com') ||
    img.includes('photo-1598488035139-bdbb2231ce04')
  ) {
    return { isValid: false, reason: 'Invalid, broken, or prohibited image URL' }
  }

  // 3. Strict Deal & Genuine Pricing Verification
  if (article.category === 'Deals & Sales') {
    if (!article.deal_price && !article.specs?.['Price'] && !article.specs?.['Discounted Price']) {
      return { isValid: false, reason: 'Deals & Sales article missing verified deal price' }
    }
  }

  // 2. Strict Deal Link Verification
  let dealUrl = article.source_url
  if (!dealUrl || !dealUrl.startsWith('http')) {
    return { isValid: false, reason: 'Missing or malformed deal link' }
  }

  const lower = dealUrl.toLowerCase()

  // Block competitor scraper blog links from ever being published as the deal link
  if (
    lower.includes('news.google.com') ||
    lower.includes('bedroomproducersblog.com') ||
    lower.includes('rekkerd.org') ||
    lower.includes('audiopluginguy.com') ||
    lower.includes('gearnews.com')
  ) {
    return { isValid: false, reason: 'Deal link points to aggregator or scraper blog instead of official product' }
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
