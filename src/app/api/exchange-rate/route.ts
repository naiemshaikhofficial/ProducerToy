import { NextResponse } from 'next/server'
import { getUsdToInrRate } from '@/lib/exchangeRate'

export const revalidate = 3600 // Cache for 1 hour

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
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    )
  } catch (error: any) {
    console.error('[EXCHANGE_RATE_API_ERROR]', error)
    return NextResponse.json({ rate: 90.0, base: 'USD', target: 'INR' })
  }
}
