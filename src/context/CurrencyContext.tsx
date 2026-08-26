'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface CurrencyContextType {
  currency: 'USD' | 'INR'
  setCurrency: (currency: 'USD' | 'INR') => void
  exchangeRate: number
  formatPrice: (priceInrOrUsd?: number, priceUsd?: number) => string
  convertUsdToInr: (usd: number) => number
  convertInrToUsd: (inr: number) => number
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

const DEFAULT_RATE = 95.0

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<'USD' | 'INR'>('USD')
  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_RATE)

  // 1. Load saved currency preference and fetch live exchange rate
  useEffect(() => {
    try {
      const savedCurrency = localStorage.getItem('pt_currency') as 'USD' | 'INR'
      if (savedCurrency === 'USD' || savedCurrency === 'INR') {
        setCurrencyState(savedCurrency)
      }

      const savedRate = localStorage.getItem('pt_exchange_rate')
      if (savedRate) {
        const parsed = Number(savedRate)
        if (parsed > 50 && parsed < 200) {
          setExchangeRate(parsed)
        }
      }
    } catch {
      // LocalStorage fallback
    }

    // Fetch live rate in background
    const fetchLiveRate = async () => {
      try {
        const res = await fetch('/api/exchange-rate')
        if (res.ok) {
          const data = await res.json()
          if (data.rate && Number(data.rate) > 50) {
            const liveRate = Number(data.rate)
            setExchangeRate(liveRate)
            try {
              localStorage.setItem('pt_exchange_rate', String(liveRate))
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Could not fetch live exchange rate:', err)
      }
    }

    fetchLiveRate()
  }, [])

  const setCurrency = useCallback((newCurrency: 'USD' | 'INR') => {
    setCurrencyState(newCurrency)
    try {
      localStorage.setItem('pt_currency', newCurrency)
    } catch {}
  }, [])

  const convertUsdToInr = useCallback(
    (usd: number) => Math.round(usd * exchangeRate),
    [exchangeRate]
  )

  const convertInrToUsd = useCallback(
    (inr: number) => (exchangeRate > 0 ? Math.round((inr / exchangeRate) * 100) / 100 : 0),
    [exchangeRate]
  )

  const formatPrice = useCallback(
    (inrOrUsd?: number, usd?: number) => {
      if (currency === 'INR') {
        // 1. If explicit INR price is provided, use it directly (1:1 match with checkout & db)
        if (inrOrUsd !== undefined && inrOrUsd !== null && Number(inrOrUsd) > 0) {
          return `₹${Math.round(Number(inrOrUsd)).toLocaleString('en-IN')}`
        }
        // 2. Fallback: Convert USD to INR using exchange rate
        if (usd !== undefined && usd !== null && Number(usd) >= 0) {
          return `₹${Math.round(Number(usd) * exchangeRate).toLocaleString('en-IN')}`
        }
        return '₹0'
      }

      // Default USD mode:
      // 1. If explicit USD price is provided, use it directly
      if (usd !== undefined && usd !== null && Number(usd) >= 0) {
        return `$${Number(usd).toFixed(2)}`
      }
      // 2. Fallback: Convert INR to USD using exchange rate
      if (inrOrUsd !== undefined && inrOrUsd !== null && Number(inrOrUsd) > 0 && exchangeRate > 0) {
        return `$${(Number(inrOrUsd) / exchangeRate).toFixed(2)}`
      }
      return '$0.00'
    },
    [currency, exchangeRate]
  )

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        exchangeRate,
        formatPrice,
        convertUsdToInr,
        convertInrToUsd,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) throw new Error('useCurrency must be used within CurrencyProvider')
  return context
}
