import { RawFeedItem, sanitizeDealUrl, PLUGIN_BOUTIQUE_AFFILIATE_ID } from './newsSources'
import { NewsArticle } from '../turso/newsDb'
import { getArticleCoverImage } from './imageGenerator'

interface GroqRewriteResponse {
  title: string
  slug: string
  excerpt: string
  content: string
  category: string
  badge: string
  reading_time: string
  deal_price?: string
  deal_regular_price?: string
  coupon_code?: string
  product_url?: string
  specs: Record<string, string>
  seo_keywords: string
}

export function sanitizeScrapedText(text: string): string {
  if (!text) return ''
  return text
    // Decode HTML entities
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&#228;/g, 'ä')
    .replace(/&#246;/g, 'ö')
    .replace(/&#252;/g, 'ü')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    // Remove ellipses and snippet cutoffs
    .replace(/\[\.\.\.?\]/gi, '')
    .replace(/\[\.\.\./gi, '')
    .replace(/\.\.\./gi, '')
    // Remove generic boilerplate sections like "How to Get It" or placeholder links
    .replace(/###?\s*How to Get It[\s\S]*?(?=###?|##|$)/gi, '')
    .replace(/###?\s*Key Highlights\s*&?\s*Features[\s\S]*?(?=###?|##|$)/gi, '')
    // Replace BPB & AudioPlugin Guy mentions
    .replace(/\bBPB\s+readers\b/gi, 'music producers')
    .replace(/\bBPB\b/gi, 'Producer Toy')
    .replace(/Bedroom\s+Producers?\s+Blog/gi, 'Producer Toy')
    .replace(/Audio\s*Plugin\s*Guy/gi, 'Producer Toy')
    .replace(/https?:\/\/(?:www\.)?(?:bedroomproducersblog\.com|audiopluginguy\.com)[^\s)\]"]*/gi, '#')
    // Ensure all Plugin Boutique URLs use Producer Toy's affiliate referral ID and remove all competitor tracking
    .replace(/https?:\/\/(?:www\.)?pluginboutique\.com\/[^\s)\]"]+/gi, (matchedUrl) => {
      try {
        const u = new URL(matchedUrl)
        Array.from(u.searchParams.keys()).forEach(key => {
          if (key !== 'a_aid') {
            if (/^data\d*$/i.test(key) || /^utm_/i.test(key) || key.toLowerCase() === 'affiliate') {
              u.searchParams.delete(key)
            }
          }
        })
        u.searchParams.set('a_aid', PLUGIN_BOUTIQUE_AFFILIATE_ID)
        return u.toString()
      } catch {
        let clean = matchedUrl.replace(/[?&]data\d*=[^&]*/gi, '')
        return clean.includes('a_aid=')
          ? clean.replace(/a_aid=[a-zA-Z0-9_-]+/g, `a_aid=${PLUGIN_BOUTIQUE_AFFILIATE_ID}`)
          : `${clean}?a_aid=${PLUGIN_BOUTIQUE_AFFILIATE_ID}`
      }
    })
    // External music scrapers & blogs
    .replace(/rekkerd(?:\.org)?/gi, 'our partners')
    .replace(/gearnews(?:\.com)?/gi, 'audio tech news')
    .replace(/kvraudio(?:\.com)?/gi, 'community reports')
    .replace(/musictech(?:\.com)?/gi, 'studio insights')
    .replace(/^(News|Deal|Review):\s*/i, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Uses Groq Cloud AI (Llama 3.3 70B) to transform a raw RSS item
 * into an original, SEO-optimized, Epic Games style news story.
 */
export async function rewriteNewsWithGroq(item: RawFeedItem): Promise<NewsArticle> {
  const apiKey = process.env.GROQ_API_KEY?.trim()
  const coverImage = getArticleCoverImage(item.title, 'Audio News', item.imageUrl)

  if (apiKey) {
    try {
      const rewritten = await callGroqLlama(item, apiKey)
      if (rewritten) {
        const detectedCoupon = rewritten.coupon_code || (item as any).couponCode || null
        const specs = rewritten.specs || {}
        if (detectedCoupon && !specs['Coupon Code']) {
          specs['Coupon Code'] = detectedCoupon
        }

        // Generate deterministic ID so subsequent runs update instead of duplicating
        const canonicalKey = (item.directDealUrl || item.link || item.title).toLowerCase().trim()
        let hash = 0
        for (let i = 0; i < canonicalKey.length; i++) {
          hash = (hash << 5) - hash + canonicalKey.charCodeAt(i)
          hash |= 0
        }
        const deterministicId = `news_${Math.abs(hash).toString(36)}`

        return {
          id: deterministicId,
          slug: slugify(rewritten.slug || rewritten.title),
          title: sanitizeScrapedText(rewritten.title),
          excerpt: sanitizeScrapedText(rewritten.excerpt),
          content: sanitizeScrapedText(rewritten.content),
          category: rewritten.category || 'Free VSTs',
          badge: detectedCoupon ? 'COUPON CODE' : rewritten.badge || 'FREEWARE',
          cover_image: coverImage,
          author_name: 'ProducerToy Editorial',
          author_role: 'Audio Technology Editor',
          reading_time: rewritten.reading_time || '3 MIN READ',
          source_name: 'ProducerToy',
          source_url: resolveSafeDealUrl(rewritten.product_url, item.directDealUrl, item.link),
          deal_price: rewritten.deal_price || null,
          deal_regular_price: rewritten.deal_regular_price || null,
          published_at: new Date(item.pubDate).toISOString(),
          created_at: new Date().toISOString(),
          is_featured: item.isPrimary ? 1 : 0,
          specs,
          related_products: [],
          seo_keywords: rewritten.seo_keywords || '',
        }
      }
    } catch (err) {
      console.warn('[rewriteNewsWithGroq] Groq rewrite error, using fallback:', err)
    }
  }

  // Graceful Fallback if Groq is unavailable
  return buildFallbackArticle(item, coverImage)
}

async function callGroqLlama(item: RawFeedItem, apiKey: string): Promise<GroqRewriteResponse | null> {
  const directUrlNote = item.directDealUrl ? `Direct Official Product / Deal URL: ${item.directDealUrl}` : ''
  const detectedCouponNote = (item as any).couponCode ? `Detected Promo / Coupon Code: ${(item as any).couponCode}` : ''

  const prompt = `You are the lead editor for Producer Toy (the premier digital audio workstation store for music producers, beatmakers, and audio engineers).
Rewrite the following audio news item from "${item.sourceName}" into a high-authority, original, engaging news article for music producers.

ORIGINAL SOURCE:
Title: ${item.title}
Link: ${item.link}
Content Snippet: ${item.contentSnippet}
${directUrlNote}
${detectedCouponNote}

REQUIREMENTS:
1. Optimize for Google #1 ranking with high-intent keywords (free VST plugins, DAW deals, mixing plugins, synthesizers, coupon codes).
2. Format the "content" into distinct, engaging multi-paragraph journalistic prose with informative topic headings (e.g. ### Synth Architecture, ### Analog Saturation Circuit, ### How to Claim with Coupon Code). Never output a single run-on wall of text. Separate concepts into clean, digestible paragraphs.
3. If this article features a big audio brand (such as Native Instruments, FabFilter, iZotope, Waves, Arturia, Soundtoys, Universal Audio, Plugin Alliance), prominently feature the brand name and the discount in the title.
4. COUPON CODE DETECTION & NARRATIVE:
   - If any coupon code, promo code, or voucher code is mentioned in the source or detected above (e.g. 'BPB100OFF', 'SUMMER90'):
     a) Set "coupon_code" to the exact code.
     b) Set "badge": "COUPON CODE".
     c) Add "Coupon Code": code inside "specs".
     d) In the article narrative, include a clear section explaining step-by-step how users enter this coupon code at checkout to drop the price (for example, dropping from $49.00 to $0.00 / FREE).
   - If no coupon code is required, leave "coupon_code" empty. Do NOT invent fake coupon codes.
5. MEGA DEAL & BADGE CLASSIFICATION:
   - If a coupon code is required: set "badge": "COUPON CODE".
   - If discount is 70%+, 80%+, 90%+, price drop, or record-low: set "badge": "MEGA DEAL".
   - If it's a 100% free giveaway / freeware: set "badge": "FREEWARE".
   - If it's a 24h-48h flash sale: set "badge": "FLASH SALE".
   - Otherwise: set "badge": "HOT DEAL" or "NEW RELEASE".
6. NEVER mention third-party blogs, sources, or third-party stores (Bedroom Producers Blog, AudioPlugin Guy, Rekkerd, KVR, Gearnews, Plugin Boutique). Write strictly as the Producer Toy official editorial newsroom. Do NOT say "on Plugin Boutique" or "at Plugin Boutique" - write "now", "today", or "official deal".
7. EXACT DEEP PRODUCT OR DEAL OFFER LINK (NEVER IMAGES OR ROOT DOMAINS):
   - Set "product_url" to the exact official product download/store/offer landing page (e.g. "https://syncaudio.io/megamorph/", "https://audija.com/oscope/", "https://safari-pedals.com/products/the-camel-strip-wildin-channel-strip", or specific Plugin Boutique product deal page).
   - In music blogs (BPB, GearNews, Rekkerd), this is consistently placed at the bottom of the article after "More info: [Product Name ($XX)](url)" or "Product page:". Always extract this exact deep product page link.
   - NEVER use image URLs (e.g. .jpg, .png, ytimg), NEVER link to YouTube, and NEVER link to competitor blogs or empty placeholder anchors.
   - If a specific product slug exists on the developer's website, always include the deep path (e.g. /megamorph/ or /oscope/), not just the root domain.
8. MULTI-PLUGIN DEALS & ROUNDUPS:
   - If this article covers MULTIPLE plugins or deals (e.g. Roland JD-800, Native Instruments FM8, Slate Digital MetaTune):
     a) Give EACH plugin its own dedicated ### section with in-depth features, discounts, and pricing.
     b) For EACH plugin, include its direct deal link right under its section, formatted as a clear action button: e.g. [Get Roland JD-800 Deal (€68.43)](url). NEVER include retailer names like "at Plugin Boutique" in the button label.
     c) NEVER omit any plugin or only provide one link when multiple are featured! Every single featured product must have its own deal link and pricing details.
9. ZERO BOILERPLATE: NEVER generate generic boilerplate phrases like "### Key Highlights & Features", "Audio Production Excellence", "Workflow Integration", "### How to Get It", or "[here](#)". Every detail must be genuine, accurate, and specific to the actual software.

OUTPUT FORMAT:
Return ONLY a valid JSON object without markdown code blocks, matching this exact schema:
{
  "title": "Compelling Title Here (e.g. Native Instruments Flash Sale: 85% OFF Massive X)",
  "slug": "url-friendly-slug-here",
  "excerpt": "1-2 sentence compelling summary for search engines.",
  "content": "Full markdown content with ## headings and paragraphs.",
  "category": "Deals & Sales",
  "badge": "MEGA DEAL",
  "coupon_code": "SUMMER90",
  "reading_time": "3 MIN READ",
  "deal_price": "$19",
  "deal_regular_price": "$199",
  "product_url": "https://native-instruments.com/deal",
  "specs": {
    "Brand": "Native Instruments",
    "Discount": "90% OFF",
    "Coupon Code": "SUMMER90",
    "Format": "VST3, AU, AAX",
    "Compatibility": "Windows & macOS (Apple Silicon native)",
    "Price": "$19 (Regular $199)"
  },
  "seo_keywords": "native instruments sale, massive x deal, coupon code, vst discount"
}`

  const modelsToTry = [
    'qwen/qwen3.8-27b',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
  ]

  for (const model of modelsToTry) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert audio software journalist. Return ONLY clean, valid JSON without backticks.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: 0.4,
          max_tokens: 1800,
        }),
      })

      if (!response.ok) {
        continue
      }

      const json = await response.json()
      const rawText = json.choices?.[0]?.message?.content?.trim() || ''

      // Clean JSON output in case model added code block markers
      const cleanJson = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim()

      return JSON.parse(cleanJson) as GroqRewriteResponse
    } catch {
      continue
    }
  }

  return null
}

function resolveSafeDealUrl(productUrl?: string, directDealUrl?: string, itemLink?: string): string {
  // 1. If direct deal URL from HTML exists (Thomann, Plugin Boutique, developer sites, etc.)
  const cleanDirect = sanitizeDealUrl(directDealUrl)
  if (cleanDirect) {
    return cleanDirect
  }
  // 2. If explicit productUrl from Groq AI is valid and NOT a scraper blog
  const cleanProduct = sanitizeDealUrl(productUrl)
  if (cleanProduct) {
    return cleanProduct
  }
  // 3. If itemLink is NOT a scraper blog, check it
  const cleanItem = sanitizeDealUrl(itemLink)
  if (cleanItem) {
    return cleanItem
  }
  // 4. Default fallback: Plugin Boutique Deals with user's affiliate referral ID
  return `https://www.pluginboutique.com/deals?a_aid=${PLUGIN_BOUTIQUE_AFFILIATE_ID}`
}

function buildFallbackArticle(item: RawFeedItem, coverImage: string): NewsArticle {
  const isFree = item.title.toLowerCase().includes('free')
  const isDeal = item.title.toLowerCase().includes('sale') || item.title.toLowerCase().includes('off') || item.title.toLowerCase().includes('deal')

  const category = isFree ? 'Free VSTs' : isDeal ? 'Deals & Sales' : 'Tech & Gear'
  const badge = isFree ? 'FREEWARE' : isDeal ? 'HOT DEAL' : 'NEW RELEASE'

  const cleanedSnippet = sanitizeScrapedText(item.contentSnippet || item.title)

  // Clean narrative editorial content without any artificial headings or bullet points
  const content = `${cleanedSnippet}

This audio release brings refined sound design and practical mixing utility directly to music creators. Built with high precision processing, it slots seamlessly into modern DAW production workflows across FL Studio, Ableton Live, Logic Pro, and Studio One.

To explore this deal or find more audio production essentials, visit the Producer Toy catalog below.`

  const canonicalKey = (item.directDealUrl || item.link || item.title).toLowerCase().trim()
  let hash = 0
  for (let i = 0; i < canonicalKey.length; i++) {
    hash = (hash << 5) - hash + canonicalKey.charCodeAt(i)
    hash |= 0
  }
  const deterministicId = `news_${Math.abs(hash).toString(36)}`

  return {
    id: deterministicId,
    slug: slugify(item.title),
    title: sanitizeScrapedText(item.title),
    excerpt: cleanedSnippet.slice(0, 160) + '...',
    content,
    category,
    badge,
    cover_image: coverImage,
    author_name: 'ProducerToy Editorial',
    author_role: 'Audio Technology Editor',
    reading_time: '3 MIN READ',
    source_name: 'ProducerToy',
    source_url: resolveSafeDealUrl(undefined, item.directDealUrl, item.link),
    deal_price: isFree ? 'FREE' : null,
    deal_regular_price: null,
    published_at: new Date(item.pubDate).toISOString(),
    created_at: new Date().toISOString(),
    is_featured: item.isPrimary ? 1 : 0,
    specs: {
      Category: category,
      License: 'Official Freeware / Release',
      Status: 'Active',
    },
    related_products: [],
    seo_keywords: 'music production, vst plugins, sample packs, audio news',
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 90)
}
