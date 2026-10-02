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

/**
 * Retrieve news articles with optional filters
 */
export async function getNewsArticles(options?: {
  category?: string
  limit?: number
  offset?: number
  featuredOnly?: boolean
}): Promise<NewsArticle[]> {
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

  query += ` ORDER BY published_at DESC LIMIT ? OFFSET ?`
  args.push(limit, offset)

  try {
    const result = await client.execute({ sql: query, args })
    return result.rows.map((row) => parseArticleRow(row))
  } catch (err) {
    console.error('[getNewsArticles] Error querying news:', err)
    return []
  }
}

/**
 * Retrieve a single news article by its slug
 */
export async function getNewsArticleBySlug(slug: string): Promise<NewsArticle | null> {
  await initNewsSchema()
  const client = getTursoClient()

  try {
    const result = await client.execute({
      sql: `SELECT * FROM news_articles WHERE slug = ? LIMIT 1`,
      args: [slug],
    })

    if (result.rows.length === 0) return null
    return parseArticleRow(result.rows[0])
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
 * Check if an article already exists by source URL, deal URL, slug, cover image or title keywords
 */
export async function articleExists(
  optionsOrUrl: string | ArticleExistsOptions,
  legacySlug?: string,
  legacyExtra?: { coverImage?: string; publishedAt?: string }
): Promise<boolean> {
  await initNewsSchema()
  const client = getTursoClient()

  try {
    const opts: ArticleExistsOptions = typeof optionsOrUrl === 'string'
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
    const urlsToCheck = [opts.sourceUrl, opts.directDealUrl, opts.feedLink].filter(Boolean) as string[]
    for (const u of urlsToCheck) {
      conditions.push('source_url = ?')
      args.push(u)

      // Match normalized hostname + pathname to catch query param differences
      try {
        const parsed = new URL(u)
        const cleanPath = `${parsed.hostname}${parsed.pathname}`.replace(/\/+$/, '')
        if (cleanPath && cleanPath.length > 8 && !cleanPath.includes('bedroomproducersblog.com') && !cleanPath.includes('producertoy.com')) {
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
    if (opts.coverImage && !opts.coverImage.includes('pollinations.ai') && opts.coverImage.startsWith('http')) {
      conditions.push('cover_image = ?')
      args.push(opts.coverImage)
    }

    // 4. Check core product title match (e.g. "Pizza Bagel Plugins Schmear", "Airwindows ConsoleX3")
    if (opts.title) {
      const words = opts.title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length >= 4 && !['free', 'plugin', 'plugins', 'vsts', 'vst', 'audio', 'deals', 'deal', 'with', 'from', 'every', 'down', 'giveaway', 'drop', 'drops', 'release', 'releases', 'sale', 'massive'].includes(w))
      
      if (words.length >= 2) {
        const pattern = `%${words.slice(0, 2).join('%')}%`
        conditions.push('LOWER(title) LIKE ?')
        args.push(pattern)
      }
    }

    if (conditions.length === 0) return false

    const result = await client.execute({
      sql: `SELECT 1 FROM news_articles WHERE ${conditions.join(' OR ')} LIMIT 1`,
      args,
    })
    return result.rows.length > 0
  } catch {
    return false
  }
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
      sql: `SELECT * FROM news_articles WHERE slug != ? ORDER BY CASE WHEN category = ? THEN 0 ELSE 1 END, published_at DESC LIMIT ?`,
      args: [excludeSlug, category, limit],
    })
    return result.rows.map((row) => parseArticleRow(row))
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
