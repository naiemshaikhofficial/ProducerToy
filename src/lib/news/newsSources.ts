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

    // Direct merchant / store deal URL extraction (Plugin Boutique, Thomann, Roland, Native Instruments, etc.)
    let directDealUrl: string | undefined
    const rawLinks = rawContent.match(/href="([^"]+)"/gi) || []
    for (const l of rawLinks) {
      const hrefMatch = l.match(/href="([^"]+)"/i)
      if (!hrefMatch) continue
      const href = hrefMatch[1]
      if (
        href.includes('pluginboutique.com') ||
        href.includes('thomann.de') ||
        href.includes('native-instruments.com') ||
        href.includes('roland.com') ||
        href.includes('slatedigital.com') ||
        href.includes('fabfilter.com') ||
        href.includes('waves.com') ||
        href.includes('arturia.com') ||
        href.includes('celestdsp.com') ||
        href.includes('soundtoys.com') ||
        href.includes('izotope.com')
      ) {
        directDealUrl = href
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
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
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
