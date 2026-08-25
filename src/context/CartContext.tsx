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

  useEffect(() => {
    try {
      const saved = localStorage.getItem('pt_cart')
      if (saved) setItems(JSON.parse(saved))
    } catch {
      // JSON parse fallback
    }
  }, [])

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems)
    localStorage.setItem('pt_cart', JSON.stringify(newItems))
  }

  const addItem = (item: CartItem, openDrawer: boolean = false) => {
    if (!items.some(i => i.id === item.id)) {
      const updated = [...items, item]
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
