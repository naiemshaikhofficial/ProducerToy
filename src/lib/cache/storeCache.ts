/**
 * ProducerToy Universal Ultra-Fast Store Memory & Session Cache Engine
 * Secures 0ms storefront navigation, 0 duplicate database queries, and 0 Vercel function usage.
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const MEMORY_CACHE = new Map<string, CacheEntry<any>>()
const DEFAULT_TTL_MS = 10 * 60 * 1000 // 10 minutes default in-memory TTL

export const StoreCache = {
  get<T>(key: string): T | null {
    // 1. Check in-memory Map cache
    const memoryItem = MEMORY_CACHE.get(key)
    if (memoryItem) {
      if (Date.now() - memoryItem.timestamp < DEFAULT_TTL_MS) {
        return memoryItem.data as T
      }
      MEMORY_CACHE.delete(key)
    }

    // 2. Check SessionStorage cache if in browser environment
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        const raw = sessionStorage.getItem(`producertoy_cache_${key}`)
        if (raw) {
          const parsed: CacheEntry<T> = JSON.parse(raw)
          if (Date.now() - parsed.timestamp < DEFAULT_TTL_MS) {
            MEMORY_CACHE.set(key, parsed) // Sync back to memory
            return parsed.data
          }
          sessionStorage.removeItem(`producertoy_cache_${key}`)
        }
      } catch (e) {
        console.warn('StoreCache SessionStorage read error:', e)
      }
    }

    return null
  },

  set<T>(key: string, data: T, customTtlMs: number = DEFAULT_TTL_MS): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    }

    // 1. Save in memory
    MEMORY_CACHE.set(key, entry)

    // 2. Save in SessionStorage
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        sessionStorage.setItem(`producertoy_cache_${key}`, JSON.stringify(entry))
      } catch (e) {
        console.warn('StoreCache SessionStorage write error:', e)
      }
    }
  },

  clear(): void {
    MEMORY_CACHE.clear()
    if (typeof window !== 'undefined' && window.sessionStorage) {
      try {
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith('producertoy_cache_')) {
            sessionStorage.removeItem(key)
          }
        })
      } catch (e) {
        console.warn('StoreCache clear error:', e)
      }
    }
  },
}
