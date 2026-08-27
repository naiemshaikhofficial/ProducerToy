import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createPayPalOrderOnServer } from '@/lib/paypal'

export async function POST(request: Request) {
  try {
    const { items, couponCode } = await request.json()
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Please login to complete your purchase' }, { status: 401 })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // 1. Fetch tamper-proof product prices in USD
    const adminSupabase = createAdminClient()
    const productIds = items.map((i: any) => i.id)
    const { data: dbProducts, error: prodErr } = await adminSupabase
      .from('products')
      .select('id, name, price_usd, price_inr')
      .in('id', productIds)

    if (prodErr || !dbProducts || dbProducts.length === 0) {
      return NextResponse.json({ error: 'Failed to verify items' }, { status: 404 })
    }

    // 2. Server-side price calculation in USD
    const rawSubtotalUsd = dbProducts.reduce(
      (sum, p) => sum + Number(p.price_usd || (p.price_inr ? p.price_inr / 85 : 0)),
      0
    )

    // Coupon discount verification
    let couponDiscountPercent = 0
    if (couponCode) {
      const { data: couponData } = await adminSupabase
        .from('coupons')
        .select('discount_percent')
        .eq('code', couponCode.trim().toUpperCase())
        .eq('is_active', true)
        .or(`expires_at.gt.${new Date().toISOString()},expires_at.is.null`)
        .maybeSingle()

      if (couponData?.discount_percent) {
        couponDiscountPercent = couponData.discount_percent
      }
    }

    const couponDiscountUsd = (rawSubtotalUsd * couponDiscountPercent) / 100
    const finalTotalUsd = Math.max(0, rawSubtotalUsd - couponDiscountUsd)

    // 3. Create PayPal order
    const paypalOrder = await createPayPalOrderOnServer(
      finalTotalUsd,
      `ProducerToy Order - ${items.length} ${items.length === 1 ? 'item' : 'items'}`
    )

    return NextResponse.json({ id: paypalOrder.id })
  } catch (error: any) {
    console.error('[PAYPAL_CREATE_ORDER_ERROR]', error)
    return NextResponse.json({ error: error.message || 'Failed to create PayPal order' }, { status: 500 })
  }
}
