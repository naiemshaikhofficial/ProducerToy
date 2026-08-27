'use server'

import { getAdminClient } from '@/lib/supabase/admin'

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
    const { data } = await supabase
      .from('products')
      .select('id, name, slug, cover_image, price_usd, product_type, brands(name)')
      .eq('is_active', true)
      .ilike('name', `%${cleanQuery}%`)
      .limit(6)

    if (data && data.length > 0) {
      return data.map((item: any) => {
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
