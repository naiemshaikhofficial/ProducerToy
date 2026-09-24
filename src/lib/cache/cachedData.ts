import { unstable_cache } from 'next/cache'
import { getAdminClient } from '@/lib/supabase/admin'

/**
 * ⚡ Ultra-Low Resource Server-Side Data Cache
 * Wraps Supabase queries in Next.js persistent Data Cache (RAM/Edge).
 * Drastically reduces Vercel Function execution and cuts Supabase Database hits to near-zero.
 *
 * Cache is instantly invalidated on-demand via /api/revalidate?tag=...
 */

// 1. All Active Brands List (24h Cache)
export const getCachedBrands = unstable_cache(
  async () => {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('brands')
      .select('id, name, slug, logo_url, description')
      .order('name')

    if (error) {
      console.warn('[getCachedBrands] query notice:', error.message)
      return []
    }
    return data || []
  },
  ['producertoy-all-brands-list'],
  { revalidate: 86400, tags: ['brands'] }
)

// 2. Single Brand by Slug (24h Cache)
export const getCachedBrandBySlug = (slug: string) => {
  const cleanSlug = decodeURIComponent(slug).trim().toLowerCase()
  return unstable_cache(
    async () => {
      const supabase = getAdminClient()
      const { data, error } = await supabase
        .from('brands')
        .select('id, name, slug, logo_url, description')
        .eq('slug', cleanSlug)
        .maybeSingle()

      if (error) {
        console.warn(`[getCachedBrandBySlug:${cleanSlug}] notice:`, error.message)
        return null
      }
      return data
    },
    [`producertoy-brand-${cleanSlug}`],
    { revalidate: 86400, tags: ['brands', `brand-${cleanSlug}`] }
  )()
}

// 3. Top Brands (for recommendations & footer)
export const getCachedTopBrands = unstable_cache(
  async (limit: number = 10) => {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('brands')
      .select('id, name, slug, logo_url')
      .limit(limit)

    if (error) {
      console.warn('[getCachedTopBrands] notice:', error.message)
      return []
    }
    return data || []
  },
  ['producertoy-top-brands-list'],
  { revalidate: 86400, tags: ['brands'] }
)

// 4. Categories & Subcategories (24h Cache)
export const getCachedCategories = unstable_cache(
  async () => {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug')

    if (error) {
      console.warn('[getCachedCategories] notice:', error.message)
      return []
    }
    return data || []
  },
  ['producertoy-all-categories-list'],
  { revalidate: 86400, tags: ['categories'] }
)

export const getCachedSubcategories = unstable_cache(
  async () => {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('subcategories')
      .select('id, name, slug')

    if (error) {
      console.warn('[getCachedSubcategories] notice:', error.message)
      return []
    }
    return data || []
  },
  ['producertoy-all-subcategories-list'],
  { revalidate: 86400, tags: ['categories', 'subcategories'] }
)

// 5. Product Detail by Slug (24h Cache)
export const getCachedProductBySlug = (slug: string) => {
  const cleanSlug = decodeURIComponent(slug).trim().toLowerCase()
  return unstable_cache(
    async () => {
      const supabase = getAdminClient()
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name, slug), subcategories!subcategory_id(name, slug), brands!brand_id(name, slug, logo_url)')
        .eq('slug', cleanSlug)
        .eq('is_active', true)
        .maybeSingle()

      if (error) {
        console.warn(`[getCachedProductBySlug:${cleanSlug}] notice:`, error.message)
        return null
      }
      return data
    },
    [`producertoy-product-${cleanSlug}`],
    { revalidate: 86400, tags: ['products', `product-${cleanSlug}`] }
  )()
}

// 6. Active Product Slugs for Static Generation (24h Cache)
export const getCachedActiveProductSlugs = unstable_cache(
  async () => {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('products')
      .select('slug')
      .eq('is_active', true)

    if (error || !data) return []
    return data.filter((p) => p && p.slug).map((p) => ({ slug: p.slug }))
  },
  ['producertoy-active-product-slugs'],
  { revalidate: 86400, tags: ['products'] }
)

// 7. All Active Products for Hubs & Curated Lists (24h Cache)
export const getCachedActiveProducts = unstable_cache(
  async () => {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, brands!brand_id(name, slug, logo_url), categories(name, slug), subcategories(name, slug)')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('[getCachedActiveProducts] notice:', error.message)
      return []
    }
    return (data || []) as any[]
  },
  ['producertoy-all-active-products-list'],
  { revalidate: 86400, tags: ['products'] }
)

