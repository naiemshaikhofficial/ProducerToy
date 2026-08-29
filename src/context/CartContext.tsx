'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useCurrency } from './CurrencyContext'

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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { exchangeRate } = useCurrency()
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
      const saved = localStorage.getItem('pt_cart')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          const normalized = parsed.map(normalizeItem)
          setItems(normalized)
        }
      }
    } catch {
      // JSON parse fallback
    }
  }, [])

  const saveCart = (newItems: CartItem[]) => {
    const normalized = newItems.map(normalizeItem)
    setItems(normalized)
    localStorage.setItem('pt_cart', JSON.stringify(normalized))
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
      if (existingIndex >= 0) {
        const updated = [...items]
        updated[existingIndex] = normalized
        saveCart(updated)
      } else {
        const updated = [...items, normalized]
        saveCart(updated)
      }
    }
    setIsCartOpen(false)
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
