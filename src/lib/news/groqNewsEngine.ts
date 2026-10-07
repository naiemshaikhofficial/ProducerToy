import { RawFeedItem, sanitizeDealUrl, PLUGIN_BOUTIQUE_AFFILIATE_ID, isFreePluginItem } from './newsSources'
import { NewsArticle } from '../turso/newsDb'
import { getArticleCoverImage, resolveProductBannerImage } from './imageGenerator'
import { detectDealExpiry } from './dealExpiry'

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
  expiry_date?: string
  product_url?: string
  specs: Record<string, string>
  seo_keywords: string
}

export function sanitizeScrapedText(text: string): string {
  if (!text) return ''
  return text
    // Decode HTML entities
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'")
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
    // Strip raw HTML elements (e.g. <a href="...">, <font ...>, <span>, <p>, <div>, etc.)
    .replace(/<\/?(?:a|font|span|p|div|br|strong|em|b|i|img|table|tr|td|th|ul|ol|li)[^>]*>/gi, ' ')
    // Strip raw Google News redirects
    .replace(/https?:\/\/news\.google\.com\/[^\s)\]"']*/gi, '')
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
    // Strip trailing source attribution tags like '- studio insights', '- Guitar World', '- MusicTech'
    .replace(/\s*[-–—]\s*(?:studio insights|guitar world|musictech|bedroom producers blog|rekkerd|audiopluginguy|kvr audio|gearnews)\s*$/i, '')
    .replace(/^(News|Deal|Review):\s*/i, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Uses Groq Cloud AI (Llama 3.3 70B) to transform a raw RSS item
 * into an original, SEO-optimized, Epic Games style news story.
 */
export async function rewriteNewsWithGroq(item: RawFeedItem): Promise<NewsArticle> {
  const apiKey = process.env.GROQ_API_KEY?.trim()
  const geminiApiKey = process.env.GEMINI_API_KEY?.trim()
  const coverImage = await resolveProductBannerImage(
    item.title,
    item.imageUrl,
    item.directDealUrl || item.link
  )

  let rewritten: GroqRewriteResponse | null = null

  if (apiKey) {
    try {
      rewritten = await callGroqLlama(item, apiKey)
    } catch (err) {
      console.warn('[rewriteNewsWithGroq] Groq rewrite error, attempting Gemini fallback:', err)
    }
  }

  if (!rewritten && geminiApiKey) {
    try {
      rewritten = await callGeminiFlash(item, geminiApiKey)
    } catch (err) {
      console.warn('[rewriteNewsWithGroq] Gemini rewrite error:', err)
    }
  }

  if (rewritten) {
        // STRICT ANTI-HALLUCINATION FOR COUPON CODES:
        // A coupon code can ONLY be accepted if it explicitly exists in the feed item or raw source text.
        // If the AI invented/hallucinated a code (e.g. "TRUE100", "FREE100", "SAVE50") not in source, discard it!
        let detectedCoupon: string | null = (item as any).couponCode || null
        if (!detectedCoupon && rewritten.coupon_code) {
          const rawSource = `${item.title} ${item.contentSnippet || ''}`.toUpperCase()
          const candidate = rewritten.coupon_code.toUpperCase().trim()
          if (
            rawSource.includes(candidate) &&
            candidate.length >= 3 &&
            !['FREE', 'DEAL', 'CODE', 'SALE', 'TRUE', 'NONE', 'NULL'].includes(candidate)
          ) {
            detectedCoupon = rewritten.coupon_code.trim()
          } else {
            console.warn(`[Anti-Hallucination] Discarding fabricated coupon code: "${rewritten.coupon_code}"`)
            rewritten.coupon_code = undefined
          }
        }

        const specs = rewritten.specs || {}
        if (detectedCoupon) {
          specs['Coupon Code'] = detectedCoupon
        } else {
          delete specs['Coupon Code']
        }

        // Clean hallucinated coupon code patterns from title if no verified code exists
        if (!detectedCoupon && rewritten.title) {
          rewritten.title = rewritten.title
            .replace(/\b(?:with\s+code\s*:?|code\s*:?)\s*[A-Z0-9_-]+\b/gi, '')
            .replace(/\s{2,}/g, ' ')
            .trim()
        }

        // Enforce verified ground-truth values from source feed
        const verifiedDealPrice = (item as any).dealPrice
        const verifiedRegularPrice = (item as any).regularPrice
        const verifiedDiscount = (item as any).discount
        const verifiedExpiry = (item as any).expiryTimeline

        if (verifiedDealPrice) {
          rewritten.deal_price = verifiedDealPrice
          if (!specs['Price']) {
            specs['Price'] = verifiedRegularPrice ? `${verifiedDealPrice} (Regular ${verifiedRegularPrice})` : verifiedDealPrice
          }
        }
        if (verifiedRegularPrice) {
          rewritten.deal_regular_price = verifiedRegularPrice
        }
        if (verifiedDiscount) {
          specs['Discount'] = verifiedDiscount
          if (rewritten.title) {
            // Correct any hallucinated percentage in title (e.g. 88% OFF -> 80% OFF)
            rewritten.title = rewritten.title.replace(/\b\d+%\s*(?:off|discount)\b/gi, verifiedDiscount)
          }
        }

        // Enforce brand and exact product name integrity (prevent AI from inventing fictional titles)
        const verifiedBrand = (item as any).brand
        const verifiedProductName = (item as any).productName
        if (verifiedBrand && rewritten.title && !rewritten.title.toUpperCase().includes(verifiedBrand.toUpperCase())) {
          rewritten.title = `${verifiedBrand} ${rewritten.title}`
        }
        if (verifiedProductName && rewritten.title && !rewritten.title.toLowerCase().includes(verifiedProductName.toLowerCase())) {
          rewritten.title = `${verifiedBrand ? verifiedBrand + ' ' : ''}${verifiedProductName} Deal: ${verifiedDiscount ? verifiedDiscount + ' ' : ''}(${rewritten.deal_price || 'Special Offer'})`
        }

        // Deal Expiry / Validity Timeline detection (feed ground-truth takes highest priority)
        const detectedExpiry = verifiedExpiry || rewritten.expiry_date || null
        if (detectedExpiry) {
          specs['Valid Until'] = detectedExpiry
        } else if (!specs['Valid Until'] && !specs['Expiry Date']) {
          const autoDetect = detectDealExpiry({
            title: rewritten.title || item.title,
            content: rewritten.content || item.contentSnippet,
            published_at: item.pubDate,
          })
          if (autoDetect.expiryTimeline) {
            specs['Valid Until'] = autoDetect.expiryTimeline
          }
        }

        // Generate deterministic ID so subsequent runs update instead of duplicating
        const canonicalKey = (item.directDealUrl || item.link || item.title).toLowerCase().trim()
        let hash = 0
        for (let i = 0; i < canonicalKey.length; i++) {
          hash = (hash << 5) - hash + canonicalKey.charCodeAt(i)
          hash |= 0
        }
        const deterministicId = `news_${Math.abs(hash).toString(36)}`

        // Check for verified paid price or partial discount
        const hasPaidPriceIndicator = Boolean(
          (rewritten.deal_price && /\$[1-9]/.test(rewritten.deal_price)) ||
          ((item as any).dealPrice && /\$[1-9]/.test((item as any).dealPrice)) ||
          /\(\s*\$[1-9]/.test(rewritten.title || '') ||
          /\b(?:[1-9]\d?)%\s*off\b/i.test(rewritten.title || '') ||
          /\b(?:[1-9]\d?)%\s*off\b/i.test((item as any).discount || '')
        )

        const isFree = !hasPaidPriceIndicator && (
          rewritten.deal_price === '$0' ||
          rewritten.deal_price?.toLowerCase() === 'free' ||
          isFreePluginItem(item)
        )

        const isPb =
          item.sourceName?.toLowerCase().includes('plugin boutique') ||
          Boolean(item.directDealUrl?.toLowerCase().includes('pluginboutique.com')) ||
          Boolean(item.link?.toLowerCase().includes('pluginboutique.com')) ||
          Boolean(rewritten.product_url?.toLowerCase().includes('pluginboutique.com'))

        const safeSourceUrl = resolveSafeDealUrl(
          rewritten.product_url,
          item.directDealUrl,
          item.link,
          isFree,
          isPb
        )
        let finalContent = splitMergedHeadings(sanitizeScrapedText(rewritten.content))
        if (safeSourceUrl) {
          finalContent = finalContent.replace(/\]\(\s*#?[^)]*\)/g, (match) => {
            if (match === '](#)' || match === ']()' || match.startsWith('](#')) {
              return `](${safeSourceUrl})`
            }
            return match
          })
          // Strip any trailing CTA links from content so NewsArticleClient renders the sole dedicated action button
          finalContent = finalContent
            .replace(/\s*\[(?:Get Official Deal|Download Free Plugin|Get Deal|Claim Deal|Buy Plugin|Download Now|Redeem Deal|Official Deal)[^\]]*\]\([^)]*\)\s*$/i, '')
            .trim()
        }

        const finalCategory = isFree ? 'Free VSTs' : rewritten.category || 'Deals & Sales'
        const finalBadge = detectedCoupon
          ? 'COUPON CODE'
          : isFree
          ? 'FREEWARE'
          : rewritten.badge || 'HOT DEAL'
        const finalDealPrice = isFree
          ? (rewritten.deal_price || '$0')
          : rewritten.deal_price || (item as any).dealPrice || null

        return {
          id: deterministicId,
          slug: slugify(rewritten.slug || rewritten.title),
          title: sanitizeScrapedText(rewritten.title),
          excerpt: sanitizeScrapedText(rewritten.excerpt),
          content: finalContent,
          category: finalCategory,
          badge: finalBadge,
          cover_image: coverImage,
          author_name: 'ProducerToy Editorial',
          author_role: 'Audio Technology Editor',
          reading_time: rewritten.reading_time || '3 MIN READ',
          source_name: 'ProducerToy',
          source_url: safeSourceUrl,
          deal_price: finalDealPrice,
          deal_regular_price: rewritten.deal_regular_price || (item as any).regularPrice || null,
          published_at: new Date(item.pubDate).toISOString(),
          created_at: new Date().toISOString(),
          is_featured: isFree || item.isPrimary ? 1 : 0,
          specs,
          related_products: [],
          seo_keywords: rewritten.seo_keywords || '',
        }
      }

  // Graceful Fallback if neither Groq nor Gemini is available
  return buildFallbackArticle(item, coverImage)
}

function buildArticlePrompt(item: RawFeedItem): string {
  const directUrlNote = item.directDealUrl ? `Direct Official Product / Deal URL: ${item.directDealUrl}` : ''
  const detectedCouponNote = (item as any).couponCode ? `Detected Promo / Coupon Code: ${(item as any).couponCode}` : ''
  const verifiedPriceNote = (item as any).dealPrice ? `Verified Sale / Deal Price: ${(item as any).dealPrice}` : ''
  const verifiedRegularNote = (item as any).regularPrice ? `Verified Original / List Price: ${(item as any).regularPrice}` : ''
  const verifiedDiscountNote = (item as any).discount ? `Verified Official Discount: ${(item as any).discount}` : ''
  const verifiedExpiryNote = (item as any).expiryTimeline ? `Verified Sale End Date / Expiry Deadline: ${(item as any).expiryTimeline}` : ''

  return `You are the lead editor for Producer Toy (the premier digital audio workstation store for music producers, beatmakers, and audio engineers).
Rewrite the following audio news item from "${item.sourceName}" into a high-authority, original, engaging news article for music producers.

ORIGINAL SOURCE:
Title: ${item.title}
Link: ${item.link}
Content Snippet: ${item.contentSnippet}
${directUrlNote}
${detectedCouponNote}
${verifiedPriceNote}
${verifiedRegularNote}
${verifiedDiscountNote}
${verifiedExpiryNote}

REQUIREMENTS:
1. OPTIMIZE FOR GOOGLE #1 RANKING (HIGH-INTENT SEO):
   - Write titles that match what active music producers and audio engineers search for on Google: e.g. "[Brand] [Product] [Category/Feature] Deal: [X]% Off ($[Price] VST)".
   - NEVER use repetitive, spammy formulas like "Record Low Price on Industry Standard Audio Plugin" on multiple products! Every title must be unique, high-intent, and specific to the actual plugin.
   - Target top ranking search keywords: free VST plugins, synth VST deals, vocal compressor plugins, audio plugin sales, coupon codes, and 2026 DAW essentials.
2. STRICT ACCURACY ON PRICING, DISCOUNT, EXPIRY & PRODUCT NAME (ZERO FABRICATION):
   - EXACT PRODUCT NAME INTEGRITY: You MUST preserve the exact real product name and brand. If the product is "UAD Mix Tape Pro", do NOT change it to "Analog Tape Bundle"! If the product is "ZENOLOGY PRO", do not change it! Keep the exact product identity: "${item.title}".
   - If Verified Official Discount (e.g. 80% OFF) is provided above, you MUST use that EXACT discount in the title, excerpt, and specs. NEVER guess or invent different percentages (e.g. do NOT write 88% if it is 80%)!
   - If Verified Sale Price ($39) and Regular Price ($199) are provided, use them exactly: deal_price="${(item as any).dealPrice || '$XX'}", deal_regular_price="${(item as any).regularPrice || '$XX'}".
   - If Verified Sale End Date / Expiry Deadline (e.g. 'until Nov 01' or 'Nov 01') is provided:
     a) Set "expiry_date": "Nov 01" (clean date).
     b) Add "Valid Until": "Nov 01" inside "specs".
     c) Mention clearly in the article narrative that this deal runs until Nov 01!
   - NEVER invent or hallucinate arbitrary prices. If a price is unspecified, leave deal_price null or write "Special Offer".
3. FORMATTING & TECHNICAL PROSE:
   - Format the "content" into distinct, engaging multi-paragraph journalistic prose with informative topic headings (e.g. ### Synth Architecture & FM Engine).
   - CRITICAL MARKDOWN STRUCTURE: Always put headings on their own isolated line followed by a blank line before the paragraph:
     CORRECT:
     ### Synth Architecture & FM Engine
     
     This synthesizer features a dual-core DSP engine...
     
     NEVER put heading and body text on the same line! Never bold the entire paragraph.
   - Cover real DSP architecture, circuit modeling, sound character, and DAW workflows (Ableton Live, FL Studio, Logic Pro, Studio One).
4. BRAND FOCUS:
   - If this article features a big audio brand (such as Native Instruments, FabFilter, iZotope, Universal Audio, Arturia, Soundtoys, Slate Digital, Softube, Klevgrand), prominently feature the brand name, product name, and format in the title and excerpt.
5. COUPON CODES & CLAIM INSTRUCTIONS (ZERO FABRICATION):
   - CRITICAL: NEVER GUESS, INVENT, OR FABRICATE COUPON CODES! If an explicit promo or voucher code is NOT provided word-for-word in the source snippet above, set "coupon_code": null and DO NOT include "Coupon Code" in specs. Never invent fictional codes like 'TRUE100', 'SAVE50', or 'FREE100'.
   - If an authentic coupon code IS detected or provided above:
     a) Set "coupon_code" to the exact verified code.
     b) Set "badge": "COUPON CODE".
     c) Add "Coupon Code": code inside "specs".
     d) Clearly explain how to enter this code at checkout.
   - HOW TO CLAIM / GIVEAWAY REQUIREMENTS:
     - If a freebie requires newsletter signup, entering an email, or creating a free user account (e.g. Rapid Flow anniversary giveaway), explain this REAL procedure clearly (e.g. "Enter your email in the newsletter signup form on the developer's official site to receive your unique code / license via email").
     - NEVER instruct users to apply an imaginary public coupon code if the deal actually requires email signup.
6. MEGA DEAL & BADGE CLASSIFICATION:
   - If a verified coupon code is required: set "badge": "COUPON CODE".
   - If discount is 70%+, 80%+, 90%+, price drop, or record-low: set "badge": "MEGA DEAL".
   - If it's a 100% free giveaway / freeware: set "badge": "FREEWARE".
   - If it's a 24h-48h flash sale: set "badge": "FLASH SALE".
   - Otherwise: set "badge": "HOT DEAL" or "NEW RELEASE".
7. NEVER mention third-party blogs, sources, or third-party stores (Bedroom Producers Blog, AudioPlugin Guy, Rekkerd, KVR, Gearnews, Plugin Boutique). Write strictly as the Producer Toy official editorial newsroom. Do NOT say "on Plugin Boutique" or "at Plugin Boutique" - write "now", "today", or "official deal".
8. EXACT DEEP PRODUCT OR DEAL OFFER LINK (NEVER IMAGES OR ROOT DOMAINS):
   - Set "product_url" to the exact official product download/store/offer landing page (e.g. "https://syncaudio.io/megamorph/", "https://audija.com/oscope/", "https://safari-pedals.com/products/the-camel-strip-wildin-channel-strip", or specific Plugin Boutique product deal page).
   - In music blogs (BPB, GearNews, Rekkerd), this is consistently placed at the bottom of the article after "More info: [Product Name ($XX)](url)" or "Product page:". Always extract this exact deep product page link.
   - NEVER use image URLs (e.g. .jpg, .png, ytimg), NEVER link to YouTube, and NEVER link to competitor blogs or empty placeholder anchors.
   - If a specific product slug exists on the developer's website, always include the deep path (e.g. /megamorph/ or /oscope/), not just the root domain.
9. MULTI-PLUGIN DEALS, CURATED GUIDES & ROUNDUPS:
   - If this article covers MULTIPLE plugins, sample packs, or is a curated listicle/guide (e.g. "Best Free Kontakt Libraries", "Top Synth Plugins", "Free VST Essentials"):
     a) Name and showcase EACH recommended software, library, or tool with its own dedicated ### heading.
     b) For EACH featured item, include an authentic preview image (developer screenshot, official UI graphic, or authentic resource URL).
     c) For EACH featured item, include its direct official download or deal link right under its section, formatted as a clear action button: e.g. [Download Free Plugin](url) or [Get Official Deal](url).
     d) NEVER output vague abstract commentary without showcasing the actual tools, their resource images, and direct download links! Every featured item must have its own action button.
10. ZERO BOILERPLATE: NEVER generate generic boilerplate phrases like "### Key Highlights & Features", "Audio Production Excellence", "Workflow Integration", "### How to Get It", or "[here](#)". Every detail must be genuine, accurate, and specific to the actual software.
11. DEAL EXPIRY & VALIDITY TIMELINE:
   - If the source mentions an end date, expiration date, or limited-time sale deadline (e.g. "40% off until Nov 01", "sale ends Oct 31", "until November 1", "runs through Nov 1st"):
     a) Set "expiry_date": "Nov 01" (or the exact timeline).
     b) Add "Valid Until": "Nov 01" (or exact timeline) inside "specs".
   - If no deadline or expiry date is mentioned, leave "expiry_date" empty.
12. FREE PLUGINS & FREEWARE TOP PRIORITY:
   - If this software is 100% Free, Freeware, or a Free Giveaway ($0):
     a) Set "category": "Free VSTs".
     b) Set "badge": "FREEWARE" (or "COUPON CODE" if a promo code is required).
     c) Set "deal_price": "$0" or "Free".
     d) Highlight prominently in the title and excerpt that it is FREE / 100% Free / Freeware for music producers!

OUTPUT FORMAT:
Return ONLY a valid JSON object without markdown code blocks, matching this exact schema:
{
  "title": "Compelling Title Here (e.g. Native Instruments Flash Sale: 85% OFF Massive X)",
  "slug": "url-friendly-slug-here",
  "excerpt": "1-2 sentence compelling summary for search engines.",
  "content": "Full markdown content with ## headings and paragraphs.",
  "category": "Deals & Sales",
  "badge": "MEGA DEAL",
  "coupon_code": null,
  "expiry_date": "Nov 01",
  "reading_time": "3 MIN READ",
  "deal_price": "$19",
  "deal_regular_price": "$199",
  "product_url": "https://developer-site.com/product-page",
  "specs": {
    "Brand": "Native Instruments",
    "Discount": "90% OFF",
    "Valid Until": "Nov 01",
    "Format": "VST3, AU, AAX",
    "Compatibility": "Windows & macOS (Apple Silicon native)",
    "Price": "$19 (Regular $199)"
  },
  "seo_keywords": "native instruments sale, massive x deal, vst discount"
}`
}

async function callGroqLlama(item: RawFeedItem, apiKey: string): Promise<GroqRewriteResponse | null> {
  const prompt = buildArticlePrompt(item)
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

async function callGeminiFlash(item: RawFeedItem, apiKey: string): Promise<GroqRewriteResponse | null> {
  const prompt = buildArticlePrompt(item)
  const modelsToTry = ['gemini-flash-lite-latest', 'gemini-flash-latest']

  for (const model of modelsToTry) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          }),
        }
      )

      if (!response.ok) {
        continue
      }

      const json = await response.json()
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
      if (!rawText) continue

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

function resolveSafeDealUrl(
  productUrl?: string,
  directDealUrl?: string,
  itemLink?: string,
  isFree?: boolean,
  isPbDeal?: boolean
): string {
  // 1. If direct deal URL from HTML exists (Thomann, Plugin Boutique, developer sites, etc.)
  const cleanDirect = sanitizeDealUrl(directDealUrl)
  if (cleanDirect && !cleanDirect.includes('producertoy.com')) {
    return cleanDirect
  }
  // 2. If explicit productUrl from Groq AI is valid and NOT a scraper blog
  const cleanProduct = sanitizeDealUrl(productUrl)
  if (cleanProduct && !cleanProduct.includes('producertoy.com')) {
    return cleanProduct
  }
  // 3. If itemLink is NOT a scraper blog, check it
  const cleanItem = sanitizeDealUrl(itemLink)
  if (cleanItem && !cleanItem.includes('producertoy.com')) {
    return cleanItem
  }
  // 4. Default fallback for Plugin Boutique deals
  if (isPbDeal) {
    return `https://www.pluginboutique.com/deals?a_aid=${PLUGIN_BOUTIQUE_AFFILIATE_ID}`
  }
  // 5. Fallback: preserve original feed item link if external so the user reaches the actual product/article
  if (itemLink && itemLink.startsWith('http') && !itemLink.includes('producertoy.com')) {
    return itemLink
  }
  return directDealUrl || productUrl || itemLink || ''
}

function buildFallbackArticle(item: RawFeedItem, coverImage: string): NewsArticle {
  const isFree = isFreePluginItem(item)
  const isDeal =
    item.title.toLowerCase().includes('sale') ||
    item.title.toLowerCase().includes('off') ||
    item.title.toLowerCase().includes('deal')

  const category = isFree ? 'Free VSTs' : isDeal ? 'Deals & Sales' : 'Tech & Gear'
  const badge = isFree ? 'FREEWARE' : isDeal ? 'HOT DEAL' : 'NEW RELEASE'

  const cleanedTitle = sanitizeScrapedText(item.title)
    .replace(/\s*[-–—]\s*(?:studio insights|guitar world|musictech|bedroom producers blog|rekkerd|audiopluginguy|kvr audio|gearnews)\s*$/i, '')
    .trim()

  const cleanedSnippet = sanitizeScrapedText(item.contentSnippet || item.title)

  const isPb =
    item.sourceName?.toLowerCase().includes('plugin boutique') ||
    Boolean(item.directDealUrl?.toLowerCase().includes('pluginboutique.com')) ||
    Boolean(item.link?.toLowerCase().includes('pluginboutique.com'))

  const safeSourceUrl = resolveSafeDealUrl(
    undefined,
    item.directDealUrl,
    item.link,
    isFree,
    isPb
  )

  const ctaLabel = isFree ? 'Download Free Plugin' : 'Get Official Deal'
  const content = `### Editorial Overview

${cleanedSnippet}

### Production Workflow & Integration

Designed for modern music producers, sound designers, and mixing engineers, this release integrates seamlessly into popular digital audio workstations including FL Studio, Ableton Live, Logic Pro, and Studio One.

[${ctaLabel}](${safeSourceUrl})`

  const canonicalKey = (item.directDealUrl || item.link || item.title).toLowerCase().trim()
  let hash = 0
  for (let i = 0; i < canonicalKey.length; i++) {
    hash = (hash << 5) - hash + canonicalKey.charCodeAt(i)
    hash |= 0
  }
  const deterministicId = `news_${Math.abs(hash).toString(36)}`

  return {
    id: deterministicId,
    slug: slugify(cleanedTitle),
    title: cleanedTitle,
    excerpt: cleanedSnippet.slice(0, 160) + '...',
    content,
    category,
    badge,
    cover_image: coverImage,
    author_name: 'ProducerToy Editorial',
    author_role: 'Audio Technology Editor',
    reading_time: '3 MIN READ',
    source_name: 'ProducerToy',
    source_url: safeSourceUrl,
    deal_price: (item as any).dealPrice || (isFree ? 'FREE' : null),
    deal_regular_price: (item as any).regularPrice || null,
    published_at: new Date(item.pubDate).toISOString(),
    created_at: new Date().toISOString(),
    is_featured: item.isPrimary ? 1 : 0,
    specs: {
      Category: category,
      License: 'Official Freeware / Release',
      Status: 'Active',
      ...((): Record<string, string> => {
        const auto = (item as any).expiryTimeline || detectDealExpiry({ title: item.title, content: cleanedSnippet, published_at: item.pubDate }).expiryTimeline
        return auto ? { 'Valid Until': auto } : {}
      })(),
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

export function splitMergedHeadings(text: string): string {
  if (!text) return ''
  const sentenceStarters = new Set([
    'the', 'this', 'these', 'that', 'a', 'an',
    'engineered', 'designed', 'featuring', 'equipped', 'built', 'crafted', 'powered',
    'whether', 'with', 'without', 'from', 'as', 'in', 'for', 'if', 'when', 'while',
    'take', 'grab', 'get', 'claim', 'download', 'visit', 'check', 'producers', 'engineers', 'musicians', 'users'
  ])

  const headingKeywords = new Set([
    'overview', 'features', 'highlights', 'integration', 'compatibility', 'workflow',
    'requirements', 'specs', 'specifications', 'architecture', 'engine', 'eq', 'dynamics',
    'processing', 'metering', 'synthesis', 'sound', 'design', 'controls', 'details',
    'hardware', 'software', 'discount', 'deal', 'offer', 'pricing', 'summary'
  ])

  let processed = text.replace(/([^\n#])\s*(#{1,6}\s+)/g, '$1\n\n$2')

  processed = processed.replace(/^(#{1,6})\s+(.+)$/gm, (lineMatch, hashes, rest) => {
    // If line has a list dash right in it: e.g. "### Key Features - **4-Band..." or "### System Requirements - **OS:**"
    const dashListMatch = rest.match(/^([A-Za-z0-9\s&/,]+?)\s*[-–—]\s*(.+)$/)
    if (dashListMatch && dashListMatch[1].trim().length <= 40) {
      const heading = dashListMatch[1].trim()
      const firstListItem = dashListMatch[2].trim()
      return `${hashes} ${heading}\n\n- ${firstListItem}`
    }

    if (rest.length <= 50 && !rest.includes('. ')) {
      return lineMatch
    }

    const words = rest.split(/\s+/)
    let bestSplitIndex = -1

    for (let i = 0; i < Math.min(words.length - 2, 8); i++) {
      const currentWordClean = words[i].toLowerCase().replace(/[^a-z]/g, '')
      const nextWord = words[i + 1]
      const nextWordClean = nextWord.toLowerCase().replace(/[^a-z]/g, '')

      // Never split directly after prepositions, articles, or conjunctions
      if (['how', 'to', 'for', 'and', 'with', 'in', 'of', 'your', 'the', 'a', 'an'].includes(currentWordClean)) {
        continue
      }

      // Check if next word is a list bullet
      if (/^[-*•]/.test(nextWord)) {
        bestSplitIndex = i + 1
        break
      }

      // Check if next word is an unambiguous sentence starter
      if (sentenceStarters.has(nextWordClean) && /^[A-Z]/.test(nextWord)) {
        bestSplitIndex = i + 1
        break
      }

      // If next word is also a heading keyword (e.g. "Workflow Integration", "System Requirements"), keep going
      if (headingKeywords.has(nextWordClean)) {
        continue
      }

      // Check if current word is a known heading keyword and next word is capitalized/acronym
      if (headingKeywords.has(currentWordClean) && /^[A-Z]/.test(nextWord)) {
        bestSplitIndex = i + 1
        break
      }
    }

    if (bestSplitIndex > 0) {
      const headingTitle = words.slice(0, bestSplitIndex).join(' ')
      const paragraphBody = words.slice(bestSplitIndex).join(' ')
      return `${hashes} ${headingTitle}\n\n${paragraphBody}`
    }

    return lineMatch
  })

  return processed.replace(/(#{1,6}[^\n]+)\n([^\n#])/g, '$1\n\n$2')
}
