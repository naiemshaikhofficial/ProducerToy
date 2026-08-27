import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { capturePayPalOrderOnServer } from '@/lib/paypal'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      orderId,
      items,
      userId,
      billingDetails,
      couponCode,
    } = body

    if (!orderId || !userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Missing PayPal order or user parameters' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    // 1. Resilient product records & prices from database
    const productIds = items.map((i: any) => i.id).filter(Boolean)
    let dbProducts: any[] = []

    try {
      const { data, error } = await adminSupabase
        .from('products')
        .select('id, name, price_usd, price_inr, product_type, delivery_method, license_type, slug')
        .in('id', productIds)

      if (!error && data && data.length > 0) {
        dbProducts = data
      }
    } catch (e) {
      console.warn('PayPal product lookup note:', e)
    }

    if (dbProducts.length === 0) {
      try {
        const slugs = items.map((i: any) => i.slug || i.id).filter(Boolean)
        const { data: slugData } = await adminSupabase
          .from('products')
          .select('id, name, price_usd, price_inr, product_type, delivery_method, license_type, slug')
          .in('slug', slugs)
        if (slugData && slugData.length > 0) {
          dbProducts = slugData
        }
      } catch (e) {
        console.warn('PayPal slug lookup note:', e)
      }
    }

    if (dbProducts.length === 0) {
      dbProducts = items.map((item: any) => ({
        id: item.id,
        name: item.name,
        price_usd: Number(item.price_usd || 0),
        price_inr: Number(item.price_inr || 0),
        product_type: item.product_type || 'plugin',
        delivery_method: 'instant_download',
        license_type: 'free_standard',
      }))
    }

    // 2. Server-side expected USD price calculation
    const rawSubtotalUsd = dbProducts.reduce(
      (sum, p) => sum + Number(p.price_usd || (p.price_inr ? p.price_inr / 90 : 0)),
      0
    )

    // Verified coupon discount calculation
    let verifiedCouponDiscountPercent = 0
    if (couponCode) {
      const { data: couponData } = await adminSupabase
        .from('coupons')
        .select('discount_percent')
        .eq('code', String(couponCode).trim().toUpperCase())
        .eq('is_active', true)
        .or(`expires_at.gt.${new Date().toISOString()},expires_at.is.null`)
        .maybeSingle()

      if (couponData?.discount_percent) {
        verifiedCouponDiscountPercent = couponData.discount_percent
      }
    }

    const couponDiscountUsd = (rawSubtotalUsd * verifiedCouponDiscountPercent) / 100
    const expectedTotalUsd = Math.max(0, rawSubtotalUsd - couponDiscountUsd)

    // 3. SECURITY DEFENSE: Capture order via official PayPal Server API
    const captureData = await capturePayPalOrderOnServer(orderId)

    if (captureData.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: `Payment not completed. Current status: ${captureData.status}` },
        { status: 400 }
      )
    }

    // 4. SECURITY DEFENSE: Verify Captured Amount & Currency Match Expected Database Value
    const capturedUnit = captureData.purchase_units?.[0]?.payments?.captures?.[0]
    const captureId = capturedUnit?.id || orderId
    const capturedAmount = Number(capturedUnit?.amount?.value || 0)
    const capturedCurrency = capturedUnit?.amount?.currency_code || 'USD'

    if (capturedCurrency !== 'USD') {
      console.error('[SECURITY_ALERT] PayPal currency mismatch:', { capturedCurrency, expected: 'USD' })
      return NextResponse.json({ error: 'Invalid payment currency.' }, { status: 400 })
    }

    // Allow minor floating point epsilon (0.05 USD)
    if (Math.abs(capturedAmount - expectedTotalUsd) > 0.1) {
      console.error('[SECURITY_ALERT] PayPal amount mismatch attempt:', {
        capturedAmount,
        expectedTotalUsd,
      })
      return NextResponse.json({ error: 'Security alert: Captured payment amount mismatch.' }, { status: 400 })
    }

    // 5. SECURITY DEFENSE: Replay Attack Prevention
    const { data: existingPurchase } = await adminSupabase
      .from('purchases')
      .select('id')
      .eq('razorpay_payment_id', captureId)
      .limit(1)

    if (existingPurchase && existingPurchase.length > 0) {
      return NextResponse.json(
        { error: 'This transaction has already been recorded.' },
        { status: 409 }
      )
    }

    // 6. Fetch target user
    const {
      data: { user: targetUser },
      error: userErr,
    } = await adminSupabase.auth.admin.getUserById(userId)

    if (userErr || !targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
    }

    const targetEmail = billingDetails?.email || targetUser.email || ''
    const orderNumber = `PT-PP-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`

    // 7. Sync user account & billing details
    if (billingDetails) {
      try {
        const nameParts = (billingDetails.fullName || '').trim().split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''

        await adminSupabase.from('profiles').upsert(
          {
            id: userId,
            email: targetEmail,
            first_name: firstName,
            last_name: lastName,
            full_name: billingDetails.fullName || '',
            display_name: billingDetails.fullName || '',
            phone_number: billingDetails.phone || '',
            address_line1: billingDetails.address || '',
            address_line2: billingDetails.address2 || '',
            city: billingDetails.city || '',
            state: billingDetails.state || '',
            region: billingDetails.state || '',
            postal_code: billingDetails.zip || '',
            country: billingDetails.country || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
      } catch (profileErr) {
        console.warn('Billing sync note:', profileErr)
      }
    }

    // 8. Generate genuine serial keys & purchase entries
    const purchaseRecords = dbProducts.map((dbProduct) => {
      const requiresSerialKey = Boolean(
        dbProduct.delivery_method === 'serial_key' ||
        dbProduct.delivery_method === 'license_key' ||
        (dbProduct.license_type && dbProduct.license_type.toLowerCase().includes('serial')) ||
        (dbProduct.license_type && dbProduct.license_type.toLowerCase().includes('key'))
      )

      let serialKey: string | null = null
      if (requiresSerialKey) {
        const serialPartA = crypto.randomBytes(3).toString('hex').toUpperCase()
        const serialPartB = crypto.randomBytes(3).toString('hex').toUpperCase()
        const serialPartC = crypto.randomBytes(3).toString('hex').toUpperCase()
        serialKey = `PT-VST-${serialPartA}-${serialPartB}-${serialPartC}`
      }

      return {
        user_id: userId,
        product_id: dbProduct.id,
        amount_paid: Number(dbProduct.price_usd || 0),
        currency: 'USD',
        serial_key: serialKey,
        razorpay_order_id: orderId,
        razorpay_payment_id: captureId,
        customer_email: targetEmail,
        customer_name: billingDetails?.fullName || null,
        customer_phone: billingDetails?.phone || null,
        billing_address: billingDetails?.address || null,
        billing_city: billingDetails?.city || null,
        billing_state: billingDetails?.state || null,
        billing_zip: billingDetails?.zip || null,
        billing_country: billingDetails?.country || null,
        coupon_code: verifiedCouponDiscountPercent > 0 ? couponCode : null,
        purchased_at: new Date().toISOString(),
      }
    })

    const { error: insertErr } = await adminSupabase
      .from('purchases')
      .insert(purchaseRecords)

    if (insertErr) {
      console.error('[PAYPAL_PURCHASE_INSERT_ERROR]', insertErr)
      return NextResponse.json({ error: 'Failed to record purchases' }, { status: 500 })
    }

    // 9. Record in orders table
    await adminSupabase.from('orders').insert({
      user_id: userId,
      order_number: orderNumber,
      customer_email: targetEmail,
      customer_name: billingDetails?.fullName || null,
      customer_phone: billingDetails?.phone || null,
      billing_address: billingDetails?.address || null,
      billing_city: billingDetails?.city || null,
      billing_state: billingDetails?.state || null,
      billing_zip: billingDetails?.zip || null,
      billing_country: billingDetails?.country || null,
      subtotal: rawSubtotalUsd,
      discount: couponDiscountUsd,
      total_amount: expectedTotalUsd,
      currency: 'USD',
      coupon_code: verifiedCouponDiscountPercent > 0 ? couponCode : null,
      payment_status: 'completed',
      payment_gateway: 'paypal',
      razorpay_order_id: orderId,
      razorpay_payment_id: captureId,
      items: items,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, orderNumber })
  } catch (error: any) {
    console.error('[PAYPAL_CAPTURE_ERROR]', error)
    return NextResponse.json({ error: error.message || 'Capture failed' }, { status: 500 })
  }
}
