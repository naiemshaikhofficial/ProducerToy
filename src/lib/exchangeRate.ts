/**
 * Real-time Currency Exchange Rate Service
 * Sources:
 * 1. Open ExchangeRate API (open.er-api.com) - Primary (Real-time, No key needed)
 * 2. Frankfurter API (api.frankfurter.dev) - Secondary Fallback (ECB open-source)
 */

interface CachedRate {
  rate: number
  timestamp: number
}

let memoryCache: CachedRate | null = null
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour cache

export async function getUsdToInrRate(): Promise<number> {
  const now = Date.now()

  // 1. Return in-memory cached rate if fresh (< 1 hour old)
  if (memoryCache && now - memoryCache.timestamp < CACHE_TTL_MS && memoryCache.rate > 50) {
    return memoryCache.rate
  }

  // 2. Fetch from Primary API (open.er-api.com)
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)

    const res = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: controller.signal,
      next: { revalidate: 3600 },
    })
    clearTimeout(timeout)

    if (res.ok) {
      const data = await res.json()
      const inr = Number(data?.rates?.INR)
      if (inr && inr > 50 && inr < 200) {
        memoryCache = { rate: inr, timestamp: now }
        return inr
      }
    }
  } catch (primaryErr) {
    console.warn('[EXCHANGE_RATE] Primary API failed, trying fallback:', primaryErr)
  }

  // 3. Fallback to Secondary API (Frankfurter ECB)
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)

    const res = await fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=INR', {
      signal: controller.signal,
      next: { revalidate: 3600 },
    })
    clearTimeout(timeout)

    if (res.ok) {
      const data = await res.json()
      const inr = Number(data?.rates?.INR)
      if (inr && inr > 50 && inr < 200) {
        memoryCache = { rate: inr, timestamp: now }
        return inr
      }
    }
  } catch (fallbackErr) {
    console.warn('[EXCHANGE_RATE] Fallback API failed:', fallbackErr)
  }

  // 4. Return last known cache or safe baseline
  if (memoryCache?.rate) {
    return memoryCache.rate
  }

  return 90.0 // Conservative baseline fallback
}

export function convertUsdToInr(amountUsd: number, rate: number = 90.0): number {
  return Math.round(amountUsd * rate)
}

export function convertInrToUsd(amountInr: number, rate: number = 90.0): number {
  if (rate <= 0) return 0
  return Math.round((amountInr / rate) * 100) / 100
}
