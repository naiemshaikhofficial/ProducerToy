import { MetadataRoute } from 'next'
import { getAdminClient } from '@/lib/supabase/admin'

export const revalidate = 21600 // Revalidate sitemap every 6 hours automatically

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

  // 1. Core Static Pages & High-Value SEO Hub Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/store`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.85 },
    { url: `${baseUrl}/manufacturers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.85 },

    // Main High-Traffic Categories
    { url: `${baseUrl}/categories/plugins`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/categories/sounds`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/categories/presets`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/categories/templates`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/categories/effects`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/categories/instruments`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },

    // High-Intent SEO Landing Hubs
    { url: `${baseUrl}/free-vst-plugins`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/categories/plugins?free=true`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/categories/sounds?free=true`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/categories/presets?free=true`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },

    // Programmatic "Best Of" Roundups (Google Position 0 Target)
    { url: `${baseUrl}/best/free-autotune-vst-plugins`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.98 },
    { url: `${baseUrl}/best/free-saturation-plugins`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.98 },
    { url: `${baseUrl}/best/free-compressor-vst-plugins`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.98 },
    { url: `${baseUrl}/best/free-reverb-vst-plugins`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.98 },
    { url: `${baseUrl}/best/free-delay-vst-plugins`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.98 },
    { url: `${baseUrl}/best/free-eq-vst-plugins`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.98 },
    { url: `${baseUrl}/best/free-trap-drum-kits-808`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.98 },

    // Dedicated DAW Landing Hubs
    { url: `${baseUrl}/daw/fl-studio`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/daw/ableton-live`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/daw/logic-pro`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/daw/cubase`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/daw/studio-one`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/daw/reaper`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },

    // Features & Programs
    { url: `${baseUrl}/features/toywards`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/brands`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.85 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },

    // Institutional, Support & Legal Pages
    { url: `${baseUrl}/support`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/licensing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/eula`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/refund-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${baseUrl}/purchase-policy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ]

  let productEntries: MetadataRoute.Sitemap = []
  let categoryEntries: MetadataRoute.Sitemap = []
  let brandEntries: MetadataRoute.Sitemap = []
  let blogEntries: MetadataRoute.Sitemap = []

  try {
    // 2. Fetch ALL Active Products, Categories, Subcategories, Brands, and Blogs from Database
    const [productsRes, categoriesRes, subcategoriesRes, brandsRes, blogsRes] = await Promise.all([
      supabase.from('products').select('slug, name, cover_image, updated_at, created_at').eq('is_active', true),
      supabase.from('categories').select('slug, created_at'),
      supabase.from('subcategories').select('slug, created_at'),
      supabase.from('brands').select('slug, created_at'),
      supabase.from('blogs').select('slug, cover_image, updated_at, published_at, created_at').eq('is_published', true),
    ])

    // 3. Dynamic Products URLs with Direct Image Linking (Priority: 1.0)
    if (productsRes.data && productsRes.data.length > 0) {
      productEntries = productsRes.data.map((p) => {
        const sanitizedImg = sanitizeXmlUrl(p.cover_image)
        return {
          url: `${baseUrl}/product/${encodeURIComponent(p.slug)}`,
          lastModified: new Date(p.updated_at || p.created_at || new Date()),
          changeFrequency: 'daily' as const,
          priority: 1.0,
          images: sanitizedImg ? [sanitizedImg] : undefined,
        }
      })
    }

    // 4. Dynamic Categories & Subcategories URLs (Priority: 0.85)
    const allCatSlugs = new Set<string>()
    if (categoriesRes.data) categoriesRes.data.forEach((c) => allCatSlugs.add(c.slug))
    if (subcategoriesRes.data) subcategoriesRes.data.forEach((s) => allCatSlugs.add(s.slug))

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

    // 5. Dynamic Brand & Manufacturer URLs (Priority: 0.8)
    if (brandsRes.data && brandsRes.data.length > 0) {
      brandEntries = brandsRes.data.flatMap((b) => [
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

    // 6. Dynamic Blog Article URLs (Priority: 0.85)
    if (blogsRes.data && blogsRes.data.length > 0) {
      blogEntries = blogsRes.data.map((b) => {
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
  } catch (err) {
    console.error('ProducerToy Sitemap generation error:', err)
  }

  // Combine all routes cleanly without duplicates and sanitize all XML entries
  const allEntries = [...staticRoutes, ...productEntries, ...categoryEntries, ...brandEntries, ...blogEntries]
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
