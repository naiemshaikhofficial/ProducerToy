'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
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
  const wishlistIds = React.useMemo(() => new Set(wishlist.map((item) => item.id)), [wishlist])

  // Load from localStorage or Supabase
  const loadWishlist = useCallback(async () => {
    setIsLoading(true)
    try {
      if (user?.id) {
        // Fetch from Supabase
        const { success, items } = await getWishlistAction(user.id)
        if (success && items) {
          setWishlist(items)
          // Also sync to local storage cache
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items))
          } catch {}
        }
      } else {
        // Guest: Read from localStorage
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
        if (stored) {
          setWishlist(JSON.parse(stored))
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
      return wishlistIds.has(id)
    },
    [wishlistIds]
  )

  const toggleWishlist = useCallback(
    async (product: WishlistProduct) => {
      const alreadySaved = wishlistIds.has(product.id)
      
      // Optimistic state update
      if (alreadySaved) {
        setWishlist((prev) => prev.filter((item) => item.id !== product.id))
      } else {
        setWishlist((prev) => [product, ...prev])
      }

      // Sync local storage
      try {
        const next = alreadySaved
          ? wishlist.filter((item) => item.id !== product.id)
          : [product, ...wishlist]
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next))
      } catch {}

      // If user logged in, call server action
      if (user?.id) {
        await toggleWishlistAction(product.id, user.id)
      }
    },
    [wishlist, wishlistIds, user?.id]
  )

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      // Optimistic update
      setWishlist((prev) => prev.filter((item) => item.id !== productId))
      
      try {
        const next = wishlist.filter((item) => item.id !== productId)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next))
      } catch {}

      if (user?.id) {
        await toggleWishlistAction(productId, user.id)
      }
    },
    [wishlist, user?.id]
  )

  const bulkAdd = useCallback(
    async (products: WishlistProduct[]) => {
      if (!products.length) return
      
      // Optimistic update merging unique items
      setWishlist((prev) => {
        const existingIds = new Set(prev.map((i) => i.id))
        const newItems = products.filter((p) => !existingIds.has(p.id))
        const combined = [...newItems, ...prev]
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(combined))
        } catch {}
        return combined
      })

      if (user?.id) {
        const ids = products.map((p) => p.id)
        await bulkAddToWishlistAction(ids, user.id)
      }
    },
    [user?.id]
  )

  const bulkRemove = useCallback(
    async (productIds: string[]) => {
      if (!productIds.length) return
      const removeSet = new Set(productIds)

      setWishlist((prev) => {
        const remaining = prev.filter((item) => !removeSet.has(item.id))
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remaining))
        } catch {}
        return remaining
      })

      if (user?.id) {
        await bulkRemoveFromWishlistAction(productIds, user.id)
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
