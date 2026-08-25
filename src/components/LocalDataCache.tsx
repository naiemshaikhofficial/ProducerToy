'use client'

import { useEffect } from 'react'

interface CacheData {
  categories?: any[]
  subcategories?: any[]
  brands?: any[]
}

const CACHE_KEY = 'pt_store_meta_v1'
const CACHE_TTL = 30 * 60 * 1000 // 30 minutes

export function LocalDataCache({ data }: { data: CacheData }) {
  useEffect(() => {
    if (!data || typeof window === 'undefined') return

    try {
      const existing = sessionStorage.getItem(CACHE_KEY)
      let parsed = existing ? JSON.parse(existing) : {}

      // Update cache if new data provided
      parsed = {
        ...parsed,
        ...data,
        timestamp: Date.now(),
      }

      sessionStorage.setItem(CACHE_KEY, JSON.stringify(parsed))
    } catch (e) {
      console.warn('SessionStorage caching disabled or full:', e)
    }
  }, [data])

  return null
}

export function getCachedStoreMetadata(): CacheData | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (Date.now() - parsed.timestamp > CACHE_TTL) {
      sessionStorage.removeItem(CACHE_KEY)
      return null
    }

    return parsed
  } catch {
    return null
  }
}
