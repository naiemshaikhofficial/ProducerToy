'use client'

import React, { createContext, useContext, useState } from 'react'

interface CurrencyContextType {
  currency: 'USD' | 'INR'
  setCurrency: (currency: 'USD' | 'INR') => void
  formatPrice: (priceInrOrUsd?: number, priceUsd?: number) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency] = useState<'USD' | 'INR'>('USD')

  const formatPrice = (inrOrUsd?: number, usd?: number) => {
    if (usd !== undefined && usd !== null && usd > 0) {
      return `$${Number(usd).toFixed(2)}`
    }
    if (inrOrUsd !== undefined && inrOrUsd !== null && inrOrUsd > 0) {
      const val = inrOrUsd > 150 ? inrOrUsd / 85 : inrOrUsd
      return `$${Number(val).toFixed(2)}`
    }
    return '$0.00'
  }

  const setCurrency = () => {}

  return (
    <CurrencyContext.Provider value={{ currency: 'USD', setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider')
  return context
}
