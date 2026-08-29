import { MetadataRoute } from 'next'
import { getAdminClient } from '@/lib/supabase/admin'

export const revalidate = 21600 // Revalidate sitemap every 6 hours automatically

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://producertoy.com'
  const supabase = getAdminClient()

  // 1. Core Static Pages & High-Value SEO Hub Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/store`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/store?free=true`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.95 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.85 },
    { url: `${baseUrl}/manufacturers`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.85 },

    // Main High-Traffic Categories
    { url: `${baseUrl}/categories/plugins`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/categories/sounds`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/categories/presets`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/categories/templates`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/categories/effects`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/categories/instruments`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },

    // Special SEO Landing Filters
    { url: `${baseUrl}/categories/plugins?free=true`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.88 },
    { url: `${baseUrl}/categories/sounds?free=true`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.88 },
    { url: `${baseUrl}/categories/presets?free=true`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.88 },

    // Features & Programs
    { url: `${baseUrl}/features/toywards`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/brands`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.85 },

    // Institutional & Legal Pages
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

  try {
    // 2. Fetch ALL Active Products, Categories, Subcategories, and Brands from Database
    const [productsRes, categoriesRes, subcategoriesRes, brandsRes] = await Promise.all([
      supabase.from('products').select('slug, name, cover_image, updated_at, created_at').eq('is_active', true),
      supabase.from('categories').select('slug, created_at'),
      supabase.from('subcategories').select('slug, created_at'),
      supabase.from('brands').select('slug, created_at'),
    ])

    // 3. Dynamic Products URLs with Direct Image Linking (Priority: 1.0)
    if (productsRes.data && productsRes.data.length > 0) {
      productEntries = productsRes.data.map((p) => ({
        url: `${baseUrl}/product/${encodeURIComponent(p.slug)}`,
        lastModified: new Date(p.updated_at || p.created_at || new Date()),
        changeFrequency: 'daily' as const,
        priority: 1.0,
        images: p.cover_image ? [p.cover_image] : undefined,
      }))
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
  } catch (err) {
    console.error('ProducerToy Sitemap generation error:', err)
  }

  // Combine all routes cleanly without duplicates
  const allEntries = [...staticRoutes, ...productEntries, ...categoryEntries, ...brandEntries]
  const uniqueUrlsMap = new Map<string, MetadataRoute.Sitemap[number]>()

  allEntries.forEach((entry) => {
    if (!uniqueUrlsMap.has(entry.url)) {
      uniqueUrlsMap.set(entry.url, entry)
    }
  })

  return Array.from(uniqueUrlsMap.values())
}
