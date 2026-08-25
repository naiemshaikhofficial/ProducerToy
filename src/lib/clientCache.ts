'use client'

/**
 * ProducerToy Client-Side High-Speed Memory & LocalStorage Cache Engine
 * Provides 0ms instant client rendering, zero duplicate network requests, and automatic 5-minute TTL cache expiration.
 */

const CACHE_PREFIX = 'producertoy_v1_'
const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5 Minutes TTL

export interface CacheEnvelope<T = any> {
  data: T
  expiry: number
}

export const clientCache = {
  /**
   * Save item in localStorage with an expiration timestamp
   */
  set: <T = any>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void => {
    if (typeof window === 'undefined') return

    try {
      const item: CacheEnvelope<T> = {
        data,
        expiry: Date.now() + ttlMs,
      }
      const serialized = JSON.stringify(item)
      localStorage.setItem(CACHE_PREFIX + key, serialized)
    } catch (e) {
      console.warn('clientCache.set error (localStorage quota or restricted):', e)
    }
  },

  /**
   * Retrieve item from localStorage. Automatically deletes expired items and returns null.
   */
  get: <T = any>(key: string): T | null => {
    if (typeof window === 'undefined') return null

    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key)
      if (!raw) return null

      const item: CacheEnvelope<T> = JSON.parse(raw)
      
      // Check if cache has expired
      if (Date.now() > item.expiry) {
        localStorage.removeItem(CACHE_PREFIX + key)
        return null
      }

      return item.data
    } catch (e) {
      console.warn('clientCache.get error:', e)
      return null
    }
  },

  /**
   * Manually remove a specific cache key
   */
  remove: (key: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(CACHE_PREFIX + key)
    } catch (e) {
      console.warn('clientCache.remove error:', e)
    }
  },

  /**
   * Purge all expired ProducerToy cache keys
   */
  clearExpired: (): void => {
    if (typeof window === 'undefined') return
    try {
      const now = Date.now()
      Object.keys(localStorage).forEach((storageKey) => {
        if (storageKey.startsWith(CACHE_PREFIX)) {
          try {
            const raw = localStorage.getItem(storageKey)
            if (raw) {
              const item: CacheEnvelope = JSON.parse(raw)
              if (now > item.expiry) {
                localStorage.removeItem(storageKey)
              }
            }
          } catch {
            localStorage.removeItem(storageKey)
          }
        }
      })
    } catch (e) {
      console.warn('clientCache.clearExpired error:', e)
    }
  },
}
