'use server'

import { getAdminClient } from '@/lib/supabase/admin'

import { matchesSearchQuery } from '@/lib/search'

export interface SearchProductResult {
  id: string
  name: string
  slug: string
  brand: string
  cover_image: string
  price_usd: number
  product_type: string
}

export async function liveSearchAction(query: string): Promise<SearchProductResult[]> {
  const cleanQuery = (query || '').trim().toLowerCase()
  if (!cleanQuery || cleanQuery.length < 2) return []

  try {
    const supabase = getAdminClient()
    // First try exact ilike on name for speed
    const { data: quickMatches } = await supabase
      .from('products')
      .select('id, name, slug, cover_image, price_usd, product_type, brands(name), categories(name), tags')
      .eq('is_active', true)
      .ilike('name', `%${cleanQuery}%`)
      .limit(6)

    if (quickMatches && quickMatches.length >= 4) {
      return quickMatches.map((item: any) => {
        const brandName = Array.isArray(item.brands)
          ? item.brands[0]?.name
          : item.brands?.name || item.brand || 'Producer Toy'
        return {
          id: item.id,
          name: item.name,
          slug: item.slug,
          brand: brandName,
          cover_image: item.cover_image,
          price_usd: Number(item.price_usd || 0),
          product_type: item.product_type || 'plugin',
        }
      })
    }

    // Fallback to rich fuzzy multi-field & synonym search
    const { data: allActive } = await supabase
      .from('products')
      .select('id, name, slug, cover_image, price_usd, product_type, brands(name), categories(name), tags, short_description')
      .eq('is_active', true)
      .limit(80)

    if (allActive && allActive.length > 0) {
      const filtered = allActive.filter((product: any) => matchesSearchQuery(product, cleanQuery))
      return filtered.slice(0, 6).map((item: any) => {
        const brandName = Array.isArray(item.brands)
          ? item.brands[0]?.name
          : item.brands?.name || item.brand || 'Producer Toy'
        return {
          id: item.id,
          name: item.name,
          slug: item.slug,
          brand: brandName,
          cover_image: item.cover_image,
          price_usd: Number(item.price_usd || 0),
          product_type: item.product_type || 'plugin',
        }
      })
    }
  } catch (err) {
    console.error('Live search error:', err)
  }

  return []
}
