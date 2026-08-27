import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUsdToInrRate } from '@/lib/exchangeRate'

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

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: 'Razorpay credentials not configured' }, { status: 500 })
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    // 1. Fetch tamper-proof product prices from database & live exchange rate
    const liveRate = await getUsdToInrRate()
    const adminSupabase = createAdminClient()
    const productIds = items.map((i: any) => i.id)
    const { data: dbProducts, error: prodErr } = await adminSupabase
      .from('products')
      .select('id, name, price_inr, price_usd')
      .in('id', productIds)

    if (prodErr || !dbProducts || dbProducts.length === 0) {
      return NextResponse.json({ error: 'Failed to verify items' }, { status: 404 })
    }

    // 2. Server-side price calculation in INR
    const rawSubtotalInr = dbProducts.reduce((sum, p) => {
      const inr = Number(p.price_inr || 0)
      const usd = Number(p.price_usd || 0)
      if (inr > 0) return sum + inr
      if (usd > 0) return sum + Math.round(usd * liveRate)
      return sum
    }, 0)

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

    const couponDiscountInr = Math.round((rawSubtotalInr * couponDiscountPercent) / 100)
    const finalTotalInr = Math.max(0, rawSubtotalInr - couponDiscountInr)

    // 3. Create Razorpay order in INR (amount in paise)
    const amountInPaise = Math.round(finalTotalInr * 100)

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `pt_inr_${user.id.slice(0, 8)}_${Date.now().toString(36)}`,
      notes: {
        userId: user.id,
        userEmail: user.email || '',
        itemCount: items.length,
        couponDiscountPercent,
      },
    })

    return NextResponse.json(order)
  } catch (error: any) {
    console.error('[RAZORPAY_CREATE_ORDER_ERROR]', error)
    return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 })
  }
}
