'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './AuthContext'
import {
  WishlistProduct,
  getWishlistAction,
  toggleWishlistAction,
  bulkAddToWishlistAction,
  bulkRemoveFromWishlistAction
} from '@/actions/wishlistActions'

interface WishlistContextType {
  wishlist: WishlistProduct[]
  wishlistIds: Set<string>
  isLoading: boolean
  isWishlisted: (id: string) => boolean
  toggleWishlist: (product: WishlistProduct) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  bulkAdd: (products: WishlistProduct[]) => Promise<void>
  bulkRemove: (productIds: string[]) => Promise<void>
  refreshWishlist: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

const LOCAL_STORAGE_KEY = 'pt_wishlist_v1'

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [wishlist, setWishlist] = useState<WishlistProduct[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Fast Set lookup for O(1) checks
  const wishlistIds = useMemo(() => new Set(wishlist.map((item) => String(item.id))), [wishlist])

  // Load from localStorage first (0ms instant), then merge with Supabase if logged in
  const loadWishlist = useCallback(async () => {
    setIsLoading(true)
    try {
      let localItems: WishlistProduct[] = []
      try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (stored) {
          localItems = JSON.parse(stored)
          setWishlist(localItems)
        }
      } catch {}

      if (user?.id) {
        // Fetch from Supabase
        const { success, items } = await getWishlistAction(user.id)
        if (success && items) {
          // If local items exist, merge any new ones to Supabase
          if (localItems.length > 0) {
            const dbIds = new Set(items.map((i) => i.id))
            const unSynced = localItems.filter((i) => !dbIds.has(i.id))
            if (unSynced.length > 0) {
              await bulkAddToWishlistAction(unSynced.map((i) => i.id), user.id)
            }
          }
          
          setWishlist(items)
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items))
          } catch {}
        }
      }
    } catch (err) {
      console.error('Error loading wishlist:', err)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadWishlist()
  }, [loadWishlist])

  const isWishlisted = useCallback(
    (id: string) => {
      if (!id) return false
      return wishlistIds.has(String(id))
    },
    [wishlistIds]
  )

  const toggleWishlist = useCallback(
    async (product: WishlistProduct) => {
      if (!product || !product.id) return
      const targetId = String(product.id)
      const alreadySaved = wishlistIds.has(targetId)

      // 0ms Instant Optimistic State Update
      setWishlist((prev) => {
        const updated = alreadySaved
          ? prev.filter((item) => String(item.id) !== targetId)
          : [product, ...prev.filter((item) => String(item.id) !== targetId)]
        
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
        } catch {}
        
        return updated
      })

      // Sync with Supabase if logged in
      if (user?.id) {
        try {
          await toggleWishlistAction(targetId, user.id)
        } catch (e) {
          console.error('Failed to sync toggle with Supabase:', e)
        }
      }
    },
    [wishlistIds, user?.id]
  )

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (!productId) return
      const targetId = String(productId)

      setWishlist((prev) => {
        const updated = prev.filter((item) => String(item.id) !== targetId)
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
        } catch {}
        return updated
      })

      if (user?.id) {
        try {
          await toggleWishlistAction(targetId, user.id)
        } catch (e) {
          console.error('Failed to sync remove with Supabase:', e)
        }
      }
    },
    [user?.id]
  )

  const bulkAdd = useCallback(
    async (products: WishlistProduct[]) => {
      if (!products.length) return
      
      setWishlist((prev) => {
        const existingIds = new Set(prev.map((i) => String(i.id)))
        const newItems = products.filter((p) => !existingIds.has(String(p.id)))
        const combined = [...newItems, ...prev]
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(combined))
        } catch {}
        return combined
      })

      if (user?.id) {
        try {
          const ids = products.map((p) => String(p.id))
          await bulkAddToWishlistAction(ids, user.id)
        } catch (e) {
          console.error('Failed to bulk add to Supabase:', e)
        }
      }
    },
    [user?.id]
  )

  const bulkRemove = useCallback(
    async (productIds: string[]) => {
      if (!productIds.length) return
      const removeSet = new Set(productIds.map(String))

      setWishlist((prev) => {
        const remaining = prev.filter((item) => !removeSet.has(String(item.id)))
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remaining))
        } catch {}
        return remaining
      })

      if (user?.id) {
        try {
          await bulkRemoveFromWishlistAction(productIds, user.id)
        } catch (e) {
          console.error('Failed to bulk remove from Supabase:', e)
        }
      }
    },
    [user?.id]
  )

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        isLoading,
        isWishlisted,
        toggleWishlist,
        removeFromWishlist,
        bulkAdd,
        bulkRemove,
        refreshWishlist: loadWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}
