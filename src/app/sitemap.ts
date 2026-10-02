import { MetadataRoute } from 'next'
import { getAdminClient } from '@/lib/supabase/admin'
import { ENABLE_BRANDS } from '@/config/features'
import { categoryData } from '@/components/header/categoryData'

export const revalidate = 3600 // Revalidate sitemap dynamically every 1 hour

/**
 * Escapes XML entities in URLs/locs to ensure valid XML sitemap output
 * according to Google Sitemaps and XML 1.0 standard.
 */
function sanitizeXmlUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string' || !url.trim()) return null
  const trimmed = url.trim()
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return null
  }
  return trimmed
    .replace(/&amp;/g, '&')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
      ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
      : 'https://producertoy.com'
  const supabase = getAdminClient()

  // 1. Core High-Value Static Pages & SEO Landing Hubs
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/store`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/free-vst-plugins`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/distribute`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.85 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/support`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/licensing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/eula`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/refund-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/purchase-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    ...(ENABLE_BRANDS ? [
      { url: `${baseUrl}/brands`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.85 },
      { url: `${baseUrl}/manufacturers`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.85 },
    ] : []),

    // Programmatic "Best Of" Curated Roundups
    { url: `${baseUrl}/best/free-autotune-vst-plugins`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/best/free-saturation-plugins`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/best/free-compressor-vst-plugins`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/best/free-reverb-vst-plugins`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/best/free-delay-vst-plugins`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/best/free-eq-vst-plugins`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/best/free-trap-drum-kits-808`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/best/free-guitar-vst-plugins`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/best/free-piano-vst-plugins`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/best/free-synth-vst-plugins`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },

    // Dedicated DAW Landing Hubs
    { url: `${baseUrl}/daw/fl-studio`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/daw/ableton-live`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/daw/logic-pro`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/daw/cubase`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/daw/studio-one`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/daw/reaper`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
  ]

  let productEntries: MetadataRoute.Sitemap = []
  let categoryEntries: MetadataRoute.Sitemap = []
  let brandEntries: MetadataRoute.Sitemap = []
  let blogEntries: MetadataRoute.Sitemap = []
  let newsEntries: MetadataRoute.Sitemap = []

  // Concurrently fetch dynamic database entries with safe error isolation
  const [
    newsResult,
    productsResult,
    categoriesResult,
    subcategoriesResult,
    brandsResult,
    blogsResult
  ] = await Promise.allSettled([
    (async () => {
      const { getNewsArticles } = await import('@/lib/turso/newsDb')
      return await getNewsArticles({ limit: 5000 })
    })(),
    supabase.from('products').select('slug, name, cover_image, updated_at, created_at').eq('is_active', true),
    supabase.from('categories').select('slug, created_at'),
    supabase.from('subcategories').select('slug, created_at'),
    ENABLE_BRANDS ? supabase.from('brands').select('slug, created_at') : Promise.resolve({ data: [] }),
    supabase.from('blogs').select('slug, cover_image, updated_at, published_at, created_at').eq('is_published', true),
  ])

  // 2. Process Dynamic News Articles from Turso
  if (newsResult.status === 'fulfilled' && newsResult.value && newsResult.value.length > 0) {
    newsEntries = newsResult.value.map((n) => {
      const highResImg = (n.cover_image || '').replace(/-\d+x\d+(\.[a-zA-Z0-9]+(?:\?.*)?)$/i, '$1')
      const sanitizedImg = sanitizeXmlUrl(highResImg || n.cover_image)
      return {
        url: `${baseUrl}/news/${encodeURIComponent(n.slug)}`,
        lastModified: new Date(n.published_at || n.created_at || new Date()),
        changeFrequency: 'daily' as const,
        priority: 0.95,
        images: sanitizedImg ? [sanitizedImg] : undefined,
      }
    })
  } else if (newsResult.status === 'rejected') {
    console.error('Sitemap news fetch error:', newsResult.reason)
  }

  // 3. Process Dynamic Active Products from Supabase
  if (productsResult.status === 'fulfilled' && productsResult.value.data && productsResult.value.data.length > 0) {
    productEntries = productsResult.value.data.map((p) => {
      const sanitizedImg = sanitizeXmlUrl(p.cover_image)
      return {
        url: `${baseUrl}/product/${encodeURIComponent(p.slug)}`,
        lastModified: new Date(p.updated_at || p.created_at || new Date()),
        changeFrequency: 'daily' as const,
        priority: 1.0,
        images: sanitizedImg ? [sanitizedImg] : undefined,
      }
    })
  } else if (productsResult.status === 'rejected') {
    console.error('Sitemap products fetch error:', productsResult.reason)
  }

  // 4. Process Dynamic Categories & Subcategories (Supabase + Catalog Knowledge)
  const allCatSlugs = new Set<string>([
    'plugins',
    'sounds',
    'presets',
    'templates',
    'effects',
    'instruments',
    'sample-packs',
    'sample-pack',
    'vst-plugins',
    'drum-kits',
    '808-bass',
    'synthesizers',
    'bundles',
    'studio-tools',
  ])

  // Add DB categories
  if (categoriesResult.status === 'fulfilled' && categoriesResult.value.data) {
    categoriesResult.value.data.forEach((c) => {
      if (c.slug) allCatSlugs.add(c.slug.trim().toLowerCase())
    })
  }

  // Add DB subcategories
  if (subcategoriesResult.status === 'fulfilled' && subcategoriesResult.value.data) {
    subcategoriesResult.value.data.forEach((s) => {
      if (s.slug) allCatSlugs.add(s.slug.trim().toLowerCase())
    })
  }

  // Add standard catalog categories and subcategories
  Object.keys(categoryData).forEach((key) => {
    const cat = categoryData[key]
    if (cat.slug) allCatSlugs.add(cat.slug.toLowerCase())
    cat.items.forEach((item) => {
      if (item.slug) allCatSlugs.add(item.slug.toLowerCase())
    })
  })

  categoryEntries = Array.from(allCatSlugs).flatMap((slug) => [
    {
      url: `${baseUrl}/categories/${encodeURIComponent(slug)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/store/${encodeURIComponent(slug)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    },
  ])

  // 5. Process Dynamic Blog Articles from Supabase
  if (blogsResult.status === 'fulfilled' && blogsResult.value.data && blogsResult.value.data.length > 0) {
    blogEntries = blogsResult.value.data.map((b) => {
      const sanitizedImg = sanitizeXmlUrl(b.cover_image)
      return {
        url: `${baseUrl}/blog/${encodeURIComponent(b.slug)}`,
        lastModified: new Date(b.updated_at || b.published_at || b.created_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.85,
        images: sanitizedImg ? [sanitizedImg] : undefined,
      }
    })
  }

  // 6. Process Dynamic Brands if feature enabled
  if (ENABLE_BRANDS && brandsResult.status === 'fulfilled' && brandsResult.value.data && brandsResult.value.data.length > 0) {
    brandEntries = brandsResult.value.data.flatMap((b: any) => [
      {
        url: `${baseUrl}/manufacturers/${encodeURIComponent(b.slug)}`,
        lastModified: new Date(b.created_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/store?brand=${encodeURIComponent(b.slug)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.78,
      },
    ])
  }

  // 7. Combine all dynamic routes cleanly and de-duplicate
  const allEntries = [
    ...staticRoutes,
    ...newsEntries,
    ...productEntries,
    ...categoryEntries,
    ...brandEntries,
    ...blogEntries,
  ]

  const uniqueUrlsMap = new Map<string, MetadataRoute.Sitemap[number]>()

  allEntries.forEach((entry) => {
    const cleanUrl = sanitizeXmlUrl(entry.url)
    if (cleanUrl && !uniqueUrlsMap.has(cleanUrl)) {
      const cleanImages = entry.images
        ?.map((img) => sanitizeXmlUrl(img))
        .filter((img): img is string => Boolean(img))

      uniqueUrlsMap.set(cleanUrl, {
        ...entry,
        url: cleanUrl,
        images: cleanImages && cleanImages.length > 0 ? cleanImages : undefined,
      })
    }
  })

  return Array.from(uniqueUrlsMap.values())
}
