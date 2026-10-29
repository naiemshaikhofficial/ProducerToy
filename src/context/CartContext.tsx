'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrency } from './CurrencyContext'
import { useAuth } from './AuthContext'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'

export interface CartItem {
  id: string
  name: string
  slug: string
  price_inr: number
  price_usd: number
  cover_image: string
  product_type: string
  brand: string
  is_gift?: boolean
  gift_recipient_email?: string
  gift_message?: string
  gift_send_date?: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: any, openDrawer?: boolean) => void
  removeItem: (id: string) => void
  clearCart: () => void
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  isCheckoutOpen: boolean
  setIsCheckoutOpen: (open: boolean) => void
  openCheckout: (itemToBuyNow?: any) => void
  closeCheckout: () => void
  isInCart: (id: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function getCartCookie(): CartItem[] | null {
  if (typeof document === 'undefined') return null
  try {
    const match = document.cookie.match(/(?:^|;\s*)pt_cart=([^;]*)/)
    if (!match) return null
    const parsed = JSON.parse(decodeURIComponent(match[1]))
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

function setCartCookie(items: CartItem[]) {
  if (typeof document === 'undefined') return
  try {
    const isProd = window.location.hostname.includes('producertoy.com')
    const domainPart = isProd ? '; domain=.producertoy.com' : ''
    if (items.length === 0) {
      document.cookie = `pt_cart=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainPart}; SameSite=Lax`
      return
    }
    const expires = new Date(Date.now() + 30 * 864e5).toUTCString()
    const json = JSON.stringify(items)
    if (json.length < 3800) {
      document.cookie = `pt_cart=${encodeURIComponent(json)}; expires=${expires}; path=/${domainPart}; SameSite=Lax${window.location.protocol === 'https:' ? '; Secure' : ''}`
    }
  } catch {
    // Non-blocking cookie error
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { exchangeRate } = useCurrency()
  const { user } = useAuth()
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

  const normalizeItem = (item: any): CartItem => {
    const priceUsd = Number(item.price_usd || 0)
    const priceInr = Number(item.price_inr || 0)
    const rate = exchangeRate > 0 ? exchangeRate : 95.0

    const resolvedInr = priceInr > 0 ? priceInr : (priceUsd > 0 ? Math.round(priceUsd * rate) : 0)
    const resolvedUsd = priceUsd > 0 ? priceUsd : (priceInr > 0 ? Math.round((priceInr / rate) * 100) / 100 : 0)

    return {
      id: item.id,
      name: item.name || '',
      slug: item.slug || '',
      price_inr: resolvedInr,
      price_usd: resolvedUsd,
      cover_image: item.cover_image || '',
      product_type: item.product_type || 'plugin',
      brand: item.brand || item.brands?.name || 'Producer Toy',
      is_gift: Boolean(item.is_gift),
      gift_recipient_email: item.gift_recipient_email || '',
      gift_message: item.gift_message || '',
      gift_send_date: item.gift_send_date || '',
    }
  }

  useEffect(() => {
    try {
      let loaded: any[] | null = null
      const saved = localStorage.getItem('pt_cart')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          loaded = parsed
        }
      }

      // If localStorage is empty, recover from cross-domain cookie
      if (!loaded || loaded.length === 0) {
        const fromCookie = getCartCookie()
        if (fromCookie && fromCookie.length > 0) {
          loaded = fromCookie
          localStorage.setItem('pt_cart', JSON.stringify(fromCookie.map(normalizeItem)))
        }
      }

      if (loaded && Array.isArray(loaded)) {
        const normalized = loaded.map(normalizeItem)
        setItems(normalized)
        setCartCookie(normalized)
      }

      // Sync across open browser tabs
      const handleStorage = (e: StorageEvent) => {
        if (e.key === 'pt_cart') {
          try {
            if (e.newValue) {
              const parsed = JSON.parse(e.newValue)
              if (Array.isArray(parsed)) {
                setItems(parsed.map(normalizeItem))
              }
            } else {
              setItems([])
            }
          } catch {}
        }
      }
      window.addEventListener('storage', handleStorage)
      return () => window.removeEventListener('storage', handleStorage)
    } catch {
      // JSON parse fallback
    }
  }, [])

  const saveCart = (newItems: CartItem[]) => {
    const normalized = newItems.map(normalizeItem)
    setItems(normalized)
    try {
      localStorage.setItem('pt_cart', JSON.stringify(normalized))
    } catch {}
    setCartCookie(normalized)
  }

  const addItem = (item: any, openDrawer: boolean = false) => {
    const normalized = normalizeItem(item)
    const existingIndex = items.findIndex((i) => i.id === normalized.id)
    if (existingIndex >= 0) {
      const updated = [...items]
      updated[existingIndex] = normalized
      saveCart(updated)
    } else {
      const updated = [...items, normalized]
      saveCart(updated)
    }
    if (openDrawer) {
      setIsCartOpen(true)
    }

    // Record real verified cart addition telemetry
    try {
      const supabase = getSupabaseBrowserClient()
      const bId = item.brand_id || item.brands?.id || item.brandId
      if (item.id && bId) {
        supabase.from('product_analytics').insert({
          product_id: item.id,
          brand_id: bId,
          event_type: 'cart_add',
          referrer: typeof window !== 'undefined' ? window.location.pathname : '',
        }).then(() => {})
      }
    } catch {
      // Non-blocking telemetry
    }
  }

  const removeItem = (id: string) => {
    const updated = items.filter(i => i.id !== id)
    saveCart(updated)
  }

  const clearCart = () => {
    saveCart([])
  }

  const openCheckout = (itemToBuyNow?: any) => {
    if (itemToBuyNow) {
      const normalized = normalizeItem(itemToBuyNow)
      const existingIndex = items.findIndex((i) => i.id === normalized.id)
      let updated: CartItem[]
      if (existingIndex >= 0) {
        updated = [...items]
        updated[existingIndex] = normalized
      } else {
        updated = [...items, normalized]
      }
      saveCart(updated)
    }

    setIsCartOpen(false)

    if (!user) {
      router.push('/auth?next=/checkout')
      return
    }

    setIsCheckoutOpen(true)
  }

  const closeCheckout = () => {
    setIsCheckoutOpen(false)
  }

  const isInCart = (id: string) => items.some(i => i.id === id)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        openCheckout,
        closeCheckout,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
