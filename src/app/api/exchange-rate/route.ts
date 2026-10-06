import { NextResponse } from 'next/server'
import { getUsdToInrRate } from '@/lib/exchangeRate'

export const revalidate = 86400 // Cache for 24 hours

export async function GET() {
  try {
    const rate = await getUsdToInrRate()
    return NextResponse.json(
      {
        base: 'USD',
        target: 'INR',
        rate: rate,
        timestamp: Date.now(),
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
          'CDN-Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
          'Vercel-CDN-Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        },
      }
    )
  } catch (error: any) {
    console.error('[EXCHANGE_RATE_API_ERROR]', error)
    return NextResponse.json({ rate: 90.0, base: 'USD', target: 'INR' })
  }
}
