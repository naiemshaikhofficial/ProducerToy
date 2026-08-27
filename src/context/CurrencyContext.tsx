'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export interface RegionOption {
  id: string
  name: string
  flag: string
  currency: 'INR' | 'USD'
  symbol: string
  tag: string
}

export const REGIONS: RegionOption[] = [
  { id: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', symbol: '₹', tag: 'INR (₹)' },
  { id: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', symbol: '$', tag: 'USD ($)' },
  { id: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'USD', symbol: '$', tag: 'USD ($)' },
  { id: 'EU', name: 'European Union', flag: '🇪🇺', currency: 'USD', symbol: '$', tag: 'USD ($)' },
  { id: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'USD', symbol: '$', tag: 'USD ($)' },
  { id: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'USD', symbol: '$', tag: 'USD ($)' },
  { id: 'JP', name: 'Japan', flag: '🇯🇵', currency: 'USD', symbol: '$', tag: 'USD ($)' },
  { id: 'GLOBAL', name: 'International', flag: '🌐', currency: 'USD', symbol: '$', tag: 'USD ($)' },
]

interface CurrencyContextType {
  currency: 'USD' | 'INR'
  setCurrency: (currency: 'USD' | 'INR') => void
  region: RegionOption
  setRegion: (regionId: string) => void
  regions: RegionOption[]
  toggleCurrency: () => void
  exchangeRate: number
  formatPrice: (priceInrOrUsd?: number, priceUsd?: number) => string
  convertUsdToInr: (usd: number) => number
  convertInrToUsd: (inr: number) => number
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

const DEFAULT_RATE = 95.0

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [region, setRegionState] = useState<RegionOption>(REGIONS[0])
  const [currency, setCurrencyState] = useState<'USD' | 'INR'>('INR')
  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_RATE)

  // 1. Auto-detect default location or load saved preference
  useEffect(() => {
    try {
      const savedRegionId = localStorage.getItem('pt_region')
      const savedCurrency = localStorage.getItem('pt_currency') as 'USD' | 'INR'

      if (savedRegionId) {
        const found = REGIONS.find((r) => r.id === savedRegionId)
        if (found) {
          setRegionState(found)
          setCurrencyState(found.currency)
        }
      } else if (savedCurrency === 'USD' || savedCurrency === 'INR') {
        const matching = REGIONS.find((r) => r.currency === savedCurrency) || REGIONS[0]
        setRegionState(matching)
        setCurrencyState(savedCurrency)
      } else {
        // Auto-detect based on client timezone / locale
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
          const lang = (navigator.language || '').toLowerCase()
          const isIndia =
            tz.includes('Calcutta') ||
            tz.includes('Kolkata') ||
            tz === 'Asia/Calcutta' ||
            tz === 'Asia/Kolkata' ||
            lang === 'en-in' ||
            lang === 'hi'

          const initialRegion = isIndia ? REGIONS[0] : REGIONS[7] // India (INR) or International (USD)
          setRegionState(initialRegion)
          setCurrencyState(initialRegion.currency)
          localStorage.setItem('pt_region', initialRegion.id)
          localStorage.setItem('pt_currency', initialRegion.currency)
        } catch {
          // Default to India
          setRegionState(REGIONS[0])
          setCurrencyState('INR')
        }
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

  const setRegion = useCallback((regionId: string) => {
    const selected = REGIONS.find((r) => r.id === regionId) || REGIONS[0]
    setRegionState(selected)
    setCurrencyState(selected.currency)
    try {
      localStorage.setItem('pt_region', selected.id)
      localStorage.setItem('pt_currency', selected.currency)
    } catch {}
  }, [])

  const setCurrency = useCallback((newCurrency: 'USD' | 'INR') => {
    setCurrencyState(newCurrency)
    const matching = REGIONS.find((r) => r.currency === newCurrency)
    if (matching) {
      setRegionState(matching)
      try {
        localStorage.setItem('pt_region', matching.id)
      } catch {}
    }
    try {
      localStorage.setItem('pt_currency', newCurrency)
    } catch {}
  }, [])

  const toggleCurrency = useCallback(() => {
    const nextCurrency = currency === 'INR' ? 'USD' : 'INR'
    setCurrency(nextCurrency)
  }, [currency, setCurrency])

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
        region,
        setRegion,
        regions: REGIONS,
        toggleCurrency,
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
