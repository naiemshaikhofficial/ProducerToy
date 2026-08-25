import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

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

    // 1. Verify Payment Signature (or check if free order)
    if (!isFree) {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json({ error: 'Missing Razorpay signature verification data' }, { status: 400 })
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
        return NextResponse.json({ error: 'Invalid Razorpay payment signature' }, { status: 400 })
      }
    }

    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid order parameters' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    // 2. Fetch authenticated target user
    const {
      data: { user: targetUser },
      error: userErr,
    } = await adminSupabase.auth.admin.getUserById(userId)

    if (userErr || !targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
    }

    const targetEmail = billingDetails?.email || targetUser.email || ''

    // 3. Fetch product records
    const productIds = items.map((i: any) => i.id)
    const { data: dbProducts, error: prodErr } = await adminSupabase
      .from('products')
      .select('id, name, price_inr, price_usd, product_type, delivery_method, license_type')
      .in('id', productIds)

    if (prodErr || !dbProducts || dbProducts.length === 0) {
      return NextResponse.json({ error: 'Failed to verify items in database' }, { status: 404 })
    }

    const finalOrderId = isFree ? `PT_FREE_${Date.now()}` : razorpay_order_id
    const finalPaymentId = isFree ? `PAY_FREE_${Date.now()}` : razorpay_payment_id
    const orderNumber = `PT-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`

    // 4. Update/Upsert user profile with billing details
    if (billingDetails) {
      try {
        await adminSupabase.from('user_accounts').upsert(
          {
            user_id: userId,
            full_name: billingDetails.fullName || '',
            email: targetEmail,
            phone_number: billingDetails.phone || '',
            address_line1: billingDetails.address || '',
            city: billingDetails.city || '',
            state: billingDetails.state || '',
            postal_code: billingDetails.zip || '',
            country: billingDetails.country || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )

        await adminSupabase.from('profiles').upsert(
          {
            id: userId,
            email: targetEmail,
            full_name: billingDetails.fullName || '',
            phone_number: billingDetails.phone || '',
            address_line1: billingDetails.address || '',
            city: billingDetails.city || '',
            state: billingDetails.state || '',
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

    // 5. Generate serial keys & purchase entries
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
        amount_paid: Number(dbProduct.price_inr || 0),
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
        coupon_code: couponCode || null,
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

    // 6. Record in orders table
    const subtotalInr = dbProducts.reduce((sum, p) => sum + Number(p.price_inr || 0), 0)

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
      subtotal: subtotalInr,
      total_amount: subtotalInr,
      currency: 'INR',
      coupon_code: couponCode || null,
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
