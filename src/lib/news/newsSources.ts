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
      parsed.searchParams.set('a_aid', PLUGIN_BOUTIQUE_AFFILIATE_ID)
      return parsed.toString()
    } catch {
      if (trimmed.includes('a_aid=')) {
        return trimmed.replace(/a_aid=[a-zA-Z0-9_-]+/g, `a_aid=${PLUGIN_BOUTIQUE_AFFILIATE_ID}`)
      }
      return trimmed.includes('?')
        ? `${trimmed}&a_aid=${PLUGIN_BOUTIQUE_AFFILIATE_ID}`
        : `${trimmed}?a_aid=${PLUGIN_BOUTIQUE_AFFILIATE_ID}`
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

    return { bestUrl, couponCode }
  } catch {
    return null
  }
}


export const MUSIC_NEWS_FEEDS = [
  {
    name: 'Google News (Audio Brands Deals)',
    url: 'https://news.google.com/rss/search?q=(Native+Instruments+OR+FabFilter+OR+iZotope+OR+Arturia+OR+Soundtoys+OR+Universal+Audio)+AND+(deal+OR+sale+OR+discount+OR+free+OR+vst+OR+coupon)&hl=en-US&gl=US&ceid=US:en',
    categoryDefault: 'Deals & Sales',
    isPrimary: true,
  },
  {
    name: 'Google News (Mega VST Deals & Coupons)',
    url: 'https://news.google.com/rss/search?q=(VST+OR+plugin)+AND+(deal+OR+discount+OR+coupon+OR+giveaway+OR+%22price+drop%22)&hl=en-US&gl=US&ceid=US:en',
    categoryDefault: 'Deals & Sales',
    isPrimary: false,
  },
  {
    name: 'AudioPlugin Guy (Coupons & Sales)',
    url: 'https://audiopluginguy.com/feed/',
    categoryDefault: 'Deals & Sales',
    isPrimary: false,
  },
  {
    name: 'Bedroom Producers Blog',
    url: 'https://bedroomproducersblog.com/feed/',
    categoryDefault: 'Free VSTs',
    isPrimary: true,
  },
  {
    name: 'Rekkerd Deals',
    url: 'https://rekkerd.org/category/deals/feed/',
    categoryDefault: 'Deals & Sales',
    isPrimary: false,
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
 * Fetch and parse RSS items from music production feeds
 * Prioritizes Bedroom Producers Blog items first
 */
export async function fetchMusicNewsFeedItems(): Promise<RawFeedItem[]> {
  const allItems: RawFeedItem[] = []

  for (const feed of MUSIC_NEWS_FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'application/rss+xml, application/xml, text/xml, */*',
        },
        next: { revalidate: 1800 }, // 30 mins
      })

      if (!res.ok) {
        console.warn(`[fetchMusicNewsFeedItems] Feed ${feed.name} returned status ${res.status}`)
        continue
      }

      const xml = await res.text()
      const items = parseRssItems(xml, feed.name, feed.isPrimary)

      if (feed.isPrimary) {
        // Prepend BPB items so they are always processed first
        allItems.unshift(...items)
      } else {
        allItems.push(...items)
      }
    } catch (err) {
      console.warn(`[fetchMusicNewsFeedItems] Error fetching feed ${feed.name}:`, err)
    }
  }

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
    .trim()
}

function cleanHtmlSnippet(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 3000)
}

function isValidImageUrl(url: string): boolean {
  if (!url) return false
  const lower = url.toLowerCase()
  // Skip tracking pixels or gravatars
  if (lower.includes('avatar') || lower.includes('pixel') || lower.includes('1x1')) return false
  return (
    lower.startsWith('http') &&
    (lower.includes('.jpg') ||
      lower.includes('.jpeg') ||
      lower.includes('.png') ||
      lower.includes('.webp') ||
      lower.includes('wp-content/uploads'))
  )
}
