import { RawFeedItem } from './newsSources'
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
  product_url?: string
  specs: Record<string, string>
  seo_keywords: string
}

export function sanitizeScrapedText(text: string): string {
  if (!text) return ''
  return text
    // Remove ellipses and snippet cutoffs
    .replace(/\[\.\.\.?\]/gi, '')
    .replace(/\[\.\.\./gi, '')
    .replace(/\.\.\./gi, '')
    // Remove generic boilerplate sections like "How to Get It" or placeholder links
    .replace(/###?\s*How to Get It[\s\S]*?(?=##|$)/gi, '')
    .replace(/###?\s*Key Highlights & Features[\s\S]*?(?=##|$)/gi, '')
    .replace(/\[here\]\([^)]*\)/gi, 'the official developer site')
    .replace(/\[here\]/gi, '')
    .replace(/[-*•]?\s*\*\*Source Coverage:\*\*.*$/gim, '')
    .replace(/Originally reported via.*$/gim, '')
    .replace(/View post:\s*\[?[^\]\n]+\]?(\([^)]+\))?/gi, '')
    // Replace BPB readers / Bedroom Producers Blog
    .replace(/\bBPB\s+readers\b/gi, 'music producers')
    .replace(/\bBPB\b/gi, 'Producer Toy')
    .replace(/Bedroom\s+Producers?\s+Blog/gi, 'Producer Toy')
    .replace(/https?:\/\/(?:www\.)?bedroomproducersblog\.com[^\s)\]"]*/gi, '#')
    // External music scrapers & blogs
    .replace(/rekkerd(?:\.org)?/gi, 'our partners')
    .replace(/gearnews(?:\.com)?/gi, 'audio tech news')
    .replace(/kvraudio(?:\.com)?/gi, 'community reports')
    .replace(/musictech(?:\.com)?/gi, 'studio insights')
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
        return {
          id: `news_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          slug: slugify(rewritten.slug || rewritten.title),
          title: sanitizeScrapedText(rewritten.title),
          excerpt: sanitizeScrapedText(rewritten.excerpt),
          content: sanitizeScrapedText(rewritten.content),
          category: rewritten.category || 'Free VSTs',
          badge: rewritten.badge || 'FREEWARE',
          cover_image: coverImage,
          author_name: 'ProducerToy Editorial',
          author_role: 'Audio Technology Editor',
          reading_time: rewritten.reading_time || '3 MIN READ',
          source_name: 'ProducerToy',
          source_url: rewritten.product_url || item.link,
          deal_price: rewritten.deal_price || null,
          deal_regular_price: rewritten.deal_regular_price || null,
          published_at: new Date(item.pubDate).toISOString(),
          created_at: new Date().toISOString(),
          is_featured: item.isPrimary ? 1 : 0,
          specs: rewritten.specs || {},
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
  const prompt = `You are the lead editor for Producer Toy (the premier digital audio workstation store for music producers, beatmakers, and audio engineers).
Rewrite the following audio news item from "${item.sourceName}" into a high-authority, original, engaging news article for music producers.

ORIGINAL SOURCE:
Title: ${item.title}
Link: ${item.link}
Content Snippet: ${item.contentSnippet}

REQUIREMENTS:
1. Optimize for Google #1 ranking with high-intent keywords (free VST plugins, DAW deals, mixing plugins, synthesizers).
2. Format the "content" in clean Markdown with headings (##, ###), bullet points, sound design insights, and step-by-step instructions on how to claim/install.
3. NEVER mention third-party blogs or external sources (such as Bedroom Producers Blog, Rekkerd, KVR, Gearnews, etc.). Write strictly as the Producer Toy official editorial newsroom.
4. Determine whether this is 'Free VSTs', 'Deals & Sales', 'Guides', or 'Tech & Gear'.
5. Determine the badge: 'FREEWARE', 'HOT DEAL', 'GUIDE', or 'NEW RELEASE'.
6. Extract or estimate specs: Format (VST3, AU, AAX), OS compatibility, Value/Price.
7. Extract or construct the official developer product download/promo link ("product_url"), such as the developer's official domain (e.g. https://celestdsp.com/drum-spice-promo/ or similar official landing page).

OUTPUT FORMAT:
Return ONLY a valid JSON object without markdown code blocks, matching this exact schema:
{
  "title": "Compelling Title Here",
  "slug": "url-friendly-slug-here",
  "excerpt": "1-2 sentence compelling summary for search engines.",
  "content": "Full markdown content with ## headings and paragraphs.",
  "category": "Free VSTs",
  "badge": "FREEWARE",
  "reading_time": "3 MIN READ",
  "deal_price": "FREE",
  "deal_regular_price": "$79",
  "product_url": "https://celestdsp.com/drum-spice-promo/",
  "specs": {
    "Format": "VST3, AU, AAX",
    "Compatibility": "Windows & macOS (Apple Silicon native)",
    "Price": "100% Free",
    "Download": "Available now"
  },
  "seo_keywords": "free vst, music production, audio plugin, daw"
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

function buildFallbackArticle(item: RawFeedItem, coverImage: string): NewsArticle {
  const isFree = item.title.toLowerCase().includes('free')
  const isDeal = item.title.toLowerCase().includes('sale') || item.title.toLowerCase().includes('off') || item.title.toLowerCase().includes('deal')

  const category = isFree ? 'Free VSTs' : isDeal ? 'Deals & Sales' : 'Tech & Gear'
  const badge = isFree ? 'FREEWARE' : isDeal ? 'HOT DEAL' : 'NEW RELEASE'

  const cleanedSnippet = sanitizeScrapedText(item.contentSnippet || item.title)

  const content = `## Overview

${cleanedSnippet}

### Key Highlights & Features

- **Audio Production Excellence:** Engineered for modern music producers, beatmakers, and audio engineers looking to elevate their mixes.
- **Workflow Integration:** Compatible with major digital audio workstations including FL Studio, Ableton Live, Logic Pro, and Studio One.
- **Tested & Verified:** Validated for performance and reliability across production environments.

### How to Get It

Head over to the official developer download link to claim this release before the promotion expires.`

  return {
    id: `news_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
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
    source_url: item.link,
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
