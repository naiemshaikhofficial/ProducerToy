import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUsdToInrRate } from '@/lib/exchangeRate'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      userId,
      billingDetails,
      couponCode,
      isFree,
    } = body

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid order parameters' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    // 1. Fetch tamper-proof product records & prices from database
    const productIds = items.map((i: any) => i.id).filter(Boolean)
    const { data: dbProducts, error: prodErr } = await adminSupabase
      .from('products')
      .select('id, name, price_inr, price_usd, product_type, delivery_method, license_type')
      .in('id', productIds)

    if (prodErr || !dbProducts || dbProducts.length === 0) {
      return NextResponse.json({ error: 'Failed to verify items in database' }, { status: 404 })
    }

    // 2. Server-side accurate price and coupon verification
    const liveRate = await getUsdToInrRate()
    const rawSubtotalInr = dbProducts.reduce((sum, p) => {
      const inr = Number(p.price_inr || 0)
      const usd = Number(p.price_usd || 0)
      if (inr > 0) return sum + inr
      if (usd > 0) return sum + Math.round(usd * liveRate)
      return sum
    }, 0)

    // Server-side bundle discount calculation
    const bundleDiscountPercent = dbProducts.length >= 3 ? 10 : 0
    const bundleDiscountInr = Math.round((rawSubtotalInr * bundleDiscountPercent) / 100)
    const subtotalAfterBundle = rawSubtotalInr - bundleDiscountInr

    // Server-side coupon verification
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

    const couponDiscountInr = Math.round((subtotalAfterBundle * verifiedCouponDiscountPercent) / 100)
    const expectedTotalInr = Math.max(0, subtotalAfterBundle - couponDiscountInr)

    // 3. SECURITY DEFENSE: Anti-Free-Order Spoofing
    if (isFree) {
      if (expectedTotalInr > 0) {
        console.error('[SECURITY_ALERT] Attempted free order spoofing on paid cart:', {
          userId,
          expectedTotalInr,
          items,
        })
        return NextResponse.json(
          { error: 'Security verification failed: Cannot checkout paid products as free.' },
          { status: 403 }
        )
      }
    } else {
      // 4. SECURITY DEFENSE: Razorpay Cryptographic HMAC-SHA256 Signature Verification
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json(
          { error: 'Missing Razorpay cryptographic signature verification data' },
          { status: 400 }
        )
      }

      const keySecret = process.env.RAZORPAY_KEY_SECRET
      if (!keySecret) {
        return NextResponse.json({ error: 'Razorpay Secret Key missing on server' }, { status: 500 })
      }

      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex')

      if (expectedSignature !== razorpay_signature) {
        console.error('[SECURITY_ALERT] Invalid Razorpay payment signature attempt:', {
          razorpay_order_id,
          razorpay_payment_id,
        })
        return NextResponse.json({ error: 'Invalid Razorpay payment signature.' }, { status: 400 })
      }

      // 5. SECURITY DEFENSE: Replay Attack Prevention (Check if payment ID already used)
      const { data: existingPayment } = await adminSupabase
        .from('purchases')
        .select('id')
        .eq('razorpay_payment_id', razorpay_payment_id)
        .limit(1)

      if (existingPayment && existingPayment.length > 0) {
        return NextResponse.json(
          { error: 'This transaction has already been processed.' },
          { status: 409 }
        )
      }
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
    const finalOrderId = isFree ? `PT_FREE_${Date.now()}` : razorpay_order_id
    const finalPaymentId = isFree ? `PAY_FREE_${Date.now()}` : razorpay_payment_id
    const orderNumber = `PT-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`

    // 7. Sync user account & billing details
    if (billingDetails) {
        await adminSupabase.from('profiles').upsert(
          {
            id: userId,
            email: targetEmail,
            full_name: billingDetails.fullName || '',
            display_name: billingDetails.fullName || '',
            phone_number: billingDetails.phone || '',
            address_line1: billingDetails.address || '',
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

      const itemInr = Number(dbProduct.price_inr || 0) > 0
        ? Number(dbProduct.price_inr)
        : Math.round(Number(dbProduct.price_usd || 0) * liveRate)

      return {
        user_id: userId,
        product_id: dbProduct.id,
        amount_paid: isFree ? 0 : itemInr,
        currency: 'INR',
        serial_key: serialKey,
        razorpay_order_id: finalOrderId,
        razorpay_payment_id: finalPaymentId,
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
      console.error('[PURCHASE_INSERT_ERROR]', insertErr)
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
      subtotal: rawSubtotalInr,
      discount: bundleDiscountInr + couponDiscountInr,
      total_amount: expectedTotalInr,
      currency: 'INR',
      coupon_code: verifiedCouponDiscountPercent > 0 ? couponCode : null,
      payment_status: 'completed',
      payment_gateway: isFree ? 'free_access' : 'razorpay',
      razorpay_order_id: finalOrderId,
      razorpay_payment_id: finalPaymentId,
      items: items,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, orderNumber })
  } catch (error: any) {
    console.error('[RAZORPAY_VERIFY_ERROR]', error)
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 })
  }
}
