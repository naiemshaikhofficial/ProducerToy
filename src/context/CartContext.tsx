'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
  id: string
  name: string
  slug: string
  price_inr: number
  price_usd: number
  cover_image: string
  product_type: string
  brand: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem, openDrawer?: boolean) => void
  removeItem: (id: string) => void
  clearCart: () => void
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  isInCart: (id: string) => boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const normalizeItem = (item: any): CartItem => {
    const priceUsd = Number(item.price_usd || 0)
    const priceInr = Number(item.price_inr || 0)

    const resolvedInr = priceInr > 0 ? priceInr : (priceUsd > 0 ? Math.round(priceUsd * 85) : 0)
    const resolvedUsd = priceUsd > 0 ? priceUsd : (priceInr > 0 ? Math.round((priceInr / 85) * 100) / 100 : 0)

    return {
      id: item.id,
      name: item.name || '',
      slug: item.slug || '',
      price_inr: resolvedInr,
      price_usd: resolvedUsd,
      cover_image: item.cover_image || '',
      product_type: item.product_type || 'plugin',
      brand: item.brand || item.brands?.name || 'Producer Toy',
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
    if (!items.some((i) => i.id === normalized.id)) {
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

  const isInCart = (id: string) => items.some(i => i.id === id)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, isCartOpen, setIsCartOpen, isInCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
