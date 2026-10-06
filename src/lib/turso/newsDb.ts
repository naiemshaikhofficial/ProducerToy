import { getTursoClient } from './client'

export interface NewsArticle {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: 'Free VSTs' | 'Deals & Sales' | 'Guides' | 'Tech & Gear' | string
  badge: 'FREEWARE' | 'HOT DEAL' | 'GUIDE' | 'NEW RELEASE' | string
  cover_image: string
  author_name: string
  author_role: string
  reading_time: string
  source_name: string
  source_url: string
  deal_price?: string | null
  deal_regular_price?: string | null
  deal_expires_at?: string | null
  published_at: string
  created_at: string
  is_featured: number
  specs?: Record<string, string> | null
  related_products?: any[] | null
  seo_keywords?: string | null
}

let isInitialized = false

// In-Memory L1 Cache: Keeps Turso DB read usage at 0 during high-traffic bursts and background revalidation
const NEWS_MEMORY_CACHE = new Map<string, { data: any; expiry: number }>()
const NEWS_MEMORY_TTL_MS = 5 * 60 * 1000 // 5 minutes in-memory TTL

export function clearNewsMemoryCache() {
  NEWS_MEMORY_CACHE.clear()
}

/**
 * Ensures the news_articles table and indexes exist in Turso / SQLite
 */
export async function initNewsSchema(): Promise<void> {
  if (isInitialized) return

  const client = getTursoClient()
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS news_articles (
        id TEXT PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        badge TEXT NOT NULL,
        cover_image TEXT NOT NULL,
        author_name TEXT NOT NULL,
        author_role TEXT NOT NULL,
        reading_time TEXT NOT NULL,
        source_name TEXT NOT NULL,
        source_url TEXT,
        deal_price TEXT,
        deal_regular_price TEXT,
        published_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        is_featured INTEGER DEFAULT 0,
        specs TEXT,
        related_products TEXT,
        seo_keywords TEXT
      );
    `)

    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_news_published ON news_articles (published_at DESC);
    `)
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_news_category ON news_articles (category);
    `)
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_news_featured ON news_articles (is_featured DESC, published_at DESC);
    `)

    isInitialized = true
  } catch (err) {
    console.error('[initNewsSchema] Error initializing schema:', err)
  }
}

export {
  TOPIC_STOPWORDS,
  getTitleKeywords,
  getTopicSignature,
  calculateTitleSimilarity,
  deduplicateArticlesByTopic,
} from '@/lib/news/topicDeduplication'

import {
  getTitleKeywords,
  getTopicSignature,
  calculateTitleSimilarity,
  deduplicateArticlesByTopic,
} from '@/lib/news/topicDeduplication'

/**
 * Retrieve news articles with optional filters & automatic topic deduplication
 */
export async function getNewsArticles(options?: {
  category?: string
  limit?: number
  offset?: number
  featuredOnly?: boolean
}): Promise<NewsArticle[]> {
  const cacheKey = `articles_${options?.category || 'all'}_${options?.limit ?? 30}_${options?.offset ?? 0}_${Boolean(options?.featuredOnly)}`
  const cached = NEWS_MEMORY_CACHE.get(cacheKey)
  if (cached && Date.now() < cached.expiry) {
    const hasForbidden =
      Array.isArray(cached.data) &&
      cached.data.some(
        (a: any) =>
          a.cover_image &&
          (a.cover_image.includes('telesco.pe') ||
            a.cover_image.includes('telegram') ||
            a.cover_image.includes('t.me'))
      )
    if (!hasForbidden) {
      return cached.data
    }
  }

  await initNewsSchema()
  const client = getTursoClient()

  const limit = options?.limit ?? 30
  const offset = options?.offset ?? 0
  const args: any[] = []

  let query = `SELECT * FROM news_articles`
  const conditions: string[] = []

  if (options?.category && options.category !== 'All' && options.category !== 'All News') {
    conditions.push(`category = ?`)
    args.push(options.category)
  }

  if (options?.featuredOnly) {
    conditions.push(`is_featured = 1`)
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(' AND ')
  }

  // Fetch with buffer so deduplication yields complete desired limit
  const fetchLimit = limit > 0 ? Math.ceil(limit * 1.5) + 15 : limit
  query += ` ORDER BY published_at DESC LIMIT ? OFFSET ?`
  args.push(fetchLimit, offset)

  try {
    const result = await client.execute({ sql: query, args })
    const parsed = result.rows.map((row) => parseArticleRow(row))
    const deduplicated = deduplicateArticlesByTopic(parsed)
    const finalArticles = limit > 0 ? deduplicated.slice(0, limit) : deduplicated

    NEWS_MEMORY_CACHE.set(cacheKey, {
      data: finalArticles,
      expiry: Date.now() + NEWS_MEMORY_TTL_MS,
    })

    return finalArticles
  } catch (err) {
    console.error('[getNewsArticles] Error querying news:', err)
    return []
  }
}

/**
 * Retrieve a single news article by its slug, with legacy duplicate alias fallback
 */
export async function getNewsArticleBySlug(slug: string): Promise<NewsArticle | null> {
  const cacheKey = `article_slug_${slug}`
  const cached = NEWS_MEMORY_CACHE.get(cacheKey)
  if (cached && Date.now() < cached.expiry) {
    return cached.data
  }

  await initNewsSchema()
  const client = getTursoClient()

  try {
    const result = await client.execute({
      sql: `SELECT * FROM news_articles WHERE slug = ? LIMIT 1`,
      args: [slug],
    })

    if (result.rows.length > 0) {
      const article = parseArticleRow(result.rows[0])
      NEWS_MEMORY_CACHE.set(cacheKey, {
        data: article,
        expiry: Date.now() + NEWS_MEMORY_TTL_MS,
      })
      return article
    }

    // Historical superseded slug redirects to canonical URLs
    const legacyRedirects: Record<string, string> = {
      'get-up-to-62-off-eastwest-sounds-modern-producer-bundle-synth-month-sale':
        'native-instruments-synths-80-off-plugin-boutique-synth-month',
      'native-instruments-inmusic-brands-acquisition-news':
        'native-instruments-inmusic-brands-acquisition-news',
      'inmusic-acquires-native-instruments-traktor-implications':
        'inmusic-acquires-native-instruments-izotope-plugin-alliance-and-brainworx-mixonline',
      'inmusic-acquires-native-instruments-traktor-future':
        'inmusic-acquires-native-instruments-izotope-plugin-alliance-and-brainworx-mixonline',
    }

    if (legacyRedirects[slug]) {
      const aliasResult = await client.execute({
        sql: `SELECT * FROM news_articles WHERE slug = ? LIMIT 1`,
        args: [legacyRedirects[slug]],
      })
      if (aliasResult.rows.length > 0) {
        const article = parseArticleRow(aliasResult.rows[0])
        NEWS_MEMORY_CACHE.set(cacheKey, {
          data: article,
          expiry: Date.now() + NEWS_MEMORY_TTL_MS,
        })
        return article
      }
    }

    return null
  } catch (err) {
    console.error('[getNewsArticleBySlug] Error:', err)
    return null
  }
}

export interface ArticleExistsOptions {
  sourceUrl?: string
  slug?: string
  feedLink?: string
  directDealUrl?: string
  coverImage?: string
  publishedAt?: string
  title?: string
}

/**
 * Find an existing article by source URL, deal URL, slug, cover image or title keywords
 */
export async function findExistingArticle(
  optionsOrUrl: string | ArticleExistsOptions,
  legacySlug?: string,
  legacyExtra?: { coverImage?: string; publishedAt?: string }
): Promise<NewsArticle | null> {
  await initNewsSchema()
  const client = getTursoClient()

  try {
    const opts: ArticleExistsOptions =
      typeof optionsOrUrl === 'string'
        ? {
            sourceUrl: optionsOrUrl,
            slug: legacySlug,
            coverImage: legacyExtra?.coverImage,
            publishedAt: legacyExtra?.publishedAt,
          }
        : optionsOrUrl

    const conditions: string[] = []
    const args: any[] = []

    // 1. Check exact URLs (feed link, direct deal URL, source URL)
    const urlsToCheck = [opts.sourceUrl, opts.directDealUrl, opts.feedLink].filter(
      Boolean
    ) as string[]
    for (const u of urlsToCheck) {
      conditions.push('source_url = ?')
      args.push(u)

      // Match normalized hostname + pathname to catch query param differences
      try {
        const parsed = new URL(u)
        const cleanPath = `${parsed.hostname}${parsed.pathname}`.replace(/\/+$/, '')
        if (
          cleanPath &&
          cleanPath.length > 8 &&
          !cleanPath.includes('bedroomproducersblog.com') &&
          !cleanPath.includes('producertoy.com')
        ) {
          conditions.push('source_url LIKE ?')
          args.push(`%${cleanPath}%`)
        }
      } catch {}
    }

    // 2. Check exact slug
    if (opts.slug) {
      conditions.push('slug = ?')
      args.push(opts.slug)
    }

    // 3. Check cover image (if external URL, e.g. from original publisher upload)
    if (
      opts.coverImage &&
      !opts.coverImage.includes('pollinations.ai') &&
      opts.coverImage.startsWith('http')
    ) {
      conditions.push('cover_image = ?')
      args.push(opts.coverImage)
    }

    // 4. Check core product title match (e.g. "Pizza Bagel Plugins Schmear", "Native Instruments Synths")
    if (opts.title) {
      const words = getTitleKeywords(opts.title)
      if (words.length >= 2) {
        const pattern = `%${words.slice(0, 2).join('%')}%`
        conditions.push('LOWER(title) LIKE ?')
        args.push(pattern)
      }
    }

    if (conditions.length === 0) return null

    const result = await client.execute({
      sql: `SELECT * FROM news_articles WHERE ${conditions.join(' OR ')} ORDER BY published_at DESC LIMIT 5`,
      args,
    })
    if (result.rows.length === 0) return null

    const candidates = result.rows.map((row) => parseArticleRow(row))

    // If matching by title, verify topic similarity to avoid false positives
    if (opts.title) {
      const targetSig = getTopicSignature(opts.title)
      for (const candidate of candidates) {
        const candSig = getTopicSignature(candidate.title)
        const sim = calculateTitleSimilarity(opts.title, candidate.title)
        if ((targetSig && candSig && targetSig === candSig) || sim >= 0.5) {
          return candidate
        }
      }
    }

    return candidates[0]
  } catch {
    return null
  }
}

/**
 * Check if an article already exists by source URL, deal URL, slug, cover image or title keywords
 */
export async function articleExists(
  optionsOrUrl: string | ArticleExistsOptions,
  legacySlug?: string,
  legacyExtra?: { coverImage?: string; publishedAt?: string }
): Promise<boolean> {
  const article = await findExistingArticle(optionsOrUrl, legacySlug, legacyExtra)
  return article !== null
}

/**
 * Insert or replace a news article
 */
export async function saveNewsArticle(article: NewsArticle): Promise<boolean> {
  await initNewsSchema()
  const client = getTursoClient()

  try {
    await client.execute({
      sql: `
        INSERT OR REPLACE INTO news_articles (
          id, slug, title, excerpt, content, category, badge,
          cover_image, author_name, author_role, reading_time,
          source_name, source_url, deal_price, deal_regular_price,
          published_at, created_at, is_featured, specs,
          related_products, seo_keywords
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?, ?, ?,
          ?, ?
        )
      `,
      args: [
        article.id,
        article.slug,
        article.title,
        article.excerpt,
        article.content,
        article.category,
        article.badge,
        article.cover_image,
        article.author_name,
        article.author_role,
        article.reading_time,
        article.source_name,
        article.source_url,
        article.deal_price ?? null,
        article.deal_regular_price ?? null,
        article.published_at,
        article.created_at,
        article.is_featured,
        article.specs ? JSON.stringify(article.specs) : null,
        article.related_products ? JSON.stringify(article.related_products) : null,
        article.seo_keywords ?? null,
      ],
    })
    clearNewsMemoryCache()
    return true
  } catch (err) {
    console.error('[saveNewsArticle] Error saving article:', err)
    return false
  }
}

/**
 * Get related articles for the "Read More" carousel
 */
export async function getRelatedNews(excludeSlug: string, category: string, limit = 3): Promise<NewsArticle[]> {
  await initNewsSchema()
  const client = getTursoClient()

  try {
    const result = await client.execute({
      sql: `SELECT * FROM news_articles WHERE slug != ? AND badge != 'EXPIRED' ORDER BY CASE WHEN category = ? THEN 0 ELSE 1 END, published_at DESC LIMIT ?`,
      args: [excludeSlug, category, limit * 2],
    })
    const parsed = result.rows.map((row) => parseArticleRow(row))
    const { detectDealExpiry } = await import('@/lib/news/dealExpiry')
    const activeOnly = parsed.filter((a) => !detectDealExpiry(a).isExpired)
    return activeOnly.slice(0, limit)
  } catch {
    return []
  }
}

function parseArticleRow(row: any): NewsArticle {
  let specs = null
  let relatedProducts = null

  if (row.specs) {
    try {
      specs = typeof row.specs === 'string' ? JSON.parse(row.specs) : row.specs
    } catch {}
  }

  if (row.related_products) {
    try {
      relatedProducts = typeof row.related_products === 'string' ? JSON.parse(row.related_products) : row.related_products
    } catch {}
  }

  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    excerpt: String(row.excerpt || ''),
    content: String(row.content || ''),
    category: String(row.category || 'Free VSTs'),
    badge: String(row.badge || 'FREEWARE'),
    cover_image: String(row.cover_image || ''),
    author_name: String(row.author_name || 'ProducerToy Editorial'),
    author_role: String(row.author_role || 'Audio Technology Editor'),
    reading_time: String(row.reading_time || '4 MIN READ'),
    source_name: String(row.source_name || 'Bedroom Producers Blog'),
    source_url: String(row.source_url || ''),
    deal_price: row.deal_price ? String(row.deal_price) : null,
    deal_regular_price: row.deal_regular_price ? String(row.deal_regular_price) : null,
    deal_expires_at: row.deal_expires_at
      ? String(row.deal_expires_at)
      : (specs?.['Valid Until'] || specs?.['Expiry Date'] || specs?.['Expires'] || null),
    published_at: String(row.published_at || new Date().toISOString()),
    created_at: String(row.created_at || new Date().toISOString()),
    is_featured: Number(row.is_featured || 0),
    specs,
    related_products: relatedProducts,
    seo_keywords: row.seo_keywords ? String(row.seo_keywords) : null,
  }
}
