'use client'

import { useEffect } from 'react'
import { clientCache } from '@/lib/clientCache'

interface CacheData {
  products?: any[]
  categories?: any[]
  subcategories?: any[]
  brands?: any[]
}

const FIVE_MINUTES_MS = 5 * 60 * 1000 // 5 Minutes TTL

export function LocalDataCache({ data }: { data: CacheData }) {
  useEffect(() => {
    if (!data || typeof window === 'undefined') return

    try {
      // 1. Cache Product List (5-minute TTL)
      if (data.products && data.products.length > 0) {
        clientCache.set('products_catalog', data.products, FIVE_MINUTES_MS)

        // 2. Cache individual products by slug for instant 0ms detail page loads
        data.products.forEach((prod) => {
          if (prod && prod.slug) {
            clientCache.set(`product_${prod.slug.toLowerCase()}`, prod, FIVE_MINUTES_MS)
          }
        })
      }

      // 3. Cache store metadata (categories & brands)
      if (data.categories || data.subcategories || data.brands) {
        const existing = clientCache.get('store_metadata') || {}
        const updated = {
          ...existing,
          categories: data.categories || existing.categories,
          subcategories: data.subcategories || existing.subcategories,
          brands: data.brands || existing.brands,
        }
        clientCache.set('store_metadata', updated, FIVE_MINUTES_MS)
      }

      // Clean up any stale expired cache entries
      clientCache.clearExpired()
    } catch (e) {
      console.warn('LocalDataCache write error:', e)
    }
  }, [data])

  return null
}

export function getCachedProductBySlug(slug: string): any | null {
  if (!slug) return null
  return clientCache.get(`product_${slug.toLowerCase()}`)
}

export function getCachedStoreMetadata(): CacheData | null {
  return clientCache.get('store_metadata')
}
