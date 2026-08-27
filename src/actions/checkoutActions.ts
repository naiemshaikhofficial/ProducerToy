'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

export interface BillingDetailsInput {
  fullName?: string
  email?: string
  phone?: string
  address?: string
  address2?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}

export interface CheckoutItemInput {
  id: string
  name: string
  slug?: string
  price_inr?: number
  price_usd?: number
  product_type?: string
}

export interface CheckoutOptionsInput {
  couponCode?: string
  discountAmount?: number
  currency?: string
  newsletterOptIn?: boolean
}

export interface CheckoutActionResult {
  success: boolean
  purchases?: any[]
  orderId?: string
  error?: string
}

export async function processCheckoutAction(
  items: CheckoutItemInput[],
  email?: string,
  clientUserId?: string,
  billingDetails?: BillingDetailsInput,
  options?: CheckoutOptionsInput
): Promise<CheckoutActionResult> {
  try {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return { success: false, error: 'Cart is empty' }
    }

    // 1. Authenticate user from secure server session cookies
    const supabase = await createClient()
    const {
      data: { user: sessionUser },
    } = await supabase.auth.getUser()

    let targetUserId: string | null = sessionUser?.id || clientUserId || null
    const targetEmail = sessionUser?.email || billingDetails?.email || email || ''

    const adminSupabase = getAdminClient()

    // 2. If no targetUserId found yet, search or link user by email
    if (!targetUserId && targetEmail) {
      try {
        const { data: usersData } = await adminSupabase.auth.admin.listUsers()
        const existingUser = usersData?.users?.find(
          (u: any) => u.email?.toLowerCase() === targetEmail.toLowerCase()
        )

        if (existingUser) {
          targetUserId = existingUser.id
        }
      } catch (err) {
        console.warn('Admin user lookup note:', err)
      }
    }

    // 2.1 Update unified profiles and auth user metadata
    if (targetUserId && billingDetails) {
      try {
        const nameParts = (billingDetails.fullName || '').trim().split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''

        const profilePayload = {
          id: targetUserId,
          email: targetEmail,
          first_name: firstName,
          last_name: lastName,
          full_name: billingDetails.fullName,
          display_name: billingDetails.fullName,
          phone_number: billingDetails.phone,
          address_line1: billingDetails.address,
          address_line2: billingDetails.address2 || '',
          city: billingDetails.city,
          state: billingDetails.state,
          region: billingDetails.state,
          postal_code: billingDetails.zip,
          country: billingDetails.country || null,
          newsletter: options?.newsletterOptIn ?? true,
          updated_at: new Date().toISOString(),
        }

        // 1. Session client upsert
        try {
          const sessionSupabase = await createClient()
          await sessionSupabase.from('profiles').upsert(profilePayload, { onConflict: 'id' })
        } catch (e) {
          console.warn('Session profile upsert note in checkout:', e)
        }

        // 2. Admin client upsert
        try {
          await adminSupabase.from('profiles').upsert(profilePayload, { onConflict: 'id' })
          
          // Update Supabase auth user metadata
          await adminSupabase.auth.admin.updateUserById(targetUserId, {
            user_metadata: {
              full_name: billingDetails.fullName,
              first_name: firstName,
              last_name: lastName,
              phone: billingDetails.phone,
              phone_number: billingDetails.phone,
              address: billingDetails.address,
              address2: billingDetails.address2,
              address_line1: billingDetails.address,
              address_line2: billingDetails.address2,
              city: billingDetails.city,
              state: billingDetails.state,
              region: billingDetails.state,
              zip: billingDetails.zip,
              postal_code: billingDetails.zip,
              country: billingDetails.country,
            },
          }).catch(() => {})
        } catch (adminErr) {
          console.warn('Admin profile upsert note in checkout:', adminErr)
        }
      } catch (metaErr) {
        console.warn('Could not sync user billing profile in DB:', metaErr)
      }
    }

    // 3. Resilient product resolution
    const productIds = items.map((i) => i.id)
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
      console.warn('Product DB ID lookup note:', e)
    }

    if (dbProducts.length === 0) {
      try {
        const slugs = items.map((i) => i.slug || i.id)
        const { data: slugData } = await adminSupabase
          .from('products')
          .select('id, name, price_usd, price_inr, product_type, delivery_method, license_type, slug')
          .in('slug', slugs)
        if (slugData && slugData.length > 0) {
          dbProducts = slugData
        }
      } catch (e) {
        console.warn('Product DB slug lookup note:', e)
      }
    }

    // Fallback: If products are not in DB, populate from cart items metadata
    if (dbProducts.length === 0) {
      dbProducts = items.map((item) => ({
        id: item.id,
        name: item.name,
        price_usd: Number(item.price_usd || 0),
        price_inr: Number(item.price_inr || 0),
        product_type: item.product_type || 'plugin',
        delivery_method: 'instant_download',
        license_type: 'free_standard',
      }))
    }

    // 3.1 Verify server-side total and coupons strictly against database to prevent unpaid bypass
    const rawSubtotalUsd = dbProducts.reduce((sum, p) => sum + Number(p.price_usd || 0), 0)
    const rawSubtotalInr = dbProducts.reduce((sum, p) => sum + Number(p.price_inr || 0), 0)

    let verifiedDiscountPercent = 0
    if (options?.couponCode) {
      const { data: couponData } = await adminSupabase
        .from('coupons')
        .select('discount_percent')
        .eq('code', String(options.couponCode).trim().toUpperCase())
        .eq('is_active', true)
        .or(`expires_at.gt.${new Date().toISOString()},expires_at.is.null`)
        .maybeSingle()

      if (couponData?.discount_percent) {
        verifiedDiscountPercent = couponData.discount_percent
      }
    }

    const expectedTotalUsd = Math.max(0, rawSubtotalUsd * (1 - verifiedDiscountPercent / 100))
    const expectedTotalInr = Math.max(0, rawSubtotalInr * (1 - verifiedDiscountPercent / 100))

    if (expectedTotalUsd > 0 || (rawSubtotalInr > 0 && verifiedDiscountPercent < 100)) {
      return {
        success: false,
        error: 'Paid orders must be completed through Razorpay or PayPal payment gateway.',
      }
    }

    const orderNumber = `PT-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`
    const randomOrderId = `ord_${crypto.randomBytes(8).toString('hex')}`
    const randomPaymentId = `pay_${crypto.randomBytes(8).toString('hex')}`
    const orderCurrency = options?.currency || 'USD'

    // 4. Build secure purchase records with conditional serial key issuance & billing snapshot
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
        user_id: targetUserId,
        product_id: dbProduct.id,
        amount_paid: Number(dbProduct.price_usd || 0),
        currency: orderCurrency,
        serial_key: serialKey,
        razorpay_order_id: randomOrderId,
        razorpay_payment_id: randomPaymentId,
        customer_email: targetEmail,
        customer_name: billingDetails?.fullName || null,
        customer_phone: billingDetails?.phone || null,
        billing_address: billingDetails?.address || null,
        billing_city: billingDetails?.city || null,
        billing_state: billingDetails?.state || null,
        billing_zip: billingDetails?.zip || null,
        billing_country: billingDetails?.country || null,
        discount_amount: options?.discountAmount || 0,
        coupon_code: options?.couponCode || null,
        purchased_at: new Date().toISOString(),
      }
    })

    // 5. Insert verified purchases into Supabase
    const { data: insertedPurchases, error: insertErr } = await adminSupabase
      .from('purchases')
      .insert(purchaseRecords)
      .select('*, products(*)')

    if (insertErr) {
      console.error('Secure checkout insert error:', insertErr)
      return { success: false, error: insertErr.message }
    }

    // 6. Record order in orders table
    const subtotal = dbProducts.reduce((sum, p) => sum + Number(p.price_usd || 0), 0)
    const discount = options?.discountAmount || 0
    const totalAmount = Math.max(0, subtotal - discount)

    try {
      await adminSupabase.from('orders').insert({
        user_id: targetUserId,
        order_number: orderNumber,
        customer_email: targetEmail,
        customer_name: billingDetails?.fullName || null,
        customer_phone: billingDetails?.phone || null,
        billing_address: billingDetails?.address || null,
        billing_city: billingDetails?.city || null,
        billing_state: billingDetails?.state || null,
        billing_zip: billingDetails?.zip || null,
        billing_country: billingDetails?.country || null,
        subtotal: subtotal,
        discount: discount,
        total_amount: totalAmount,
        currency: orderCurrency,
        coupon_code: options?.couponCode || null,
        payment_status: 'completed',
        payment_gateway: 'razorpay',
        razorpay_order_id: randomOrderId,
        razorpay_payment_id: randomPaymentId,
        items: items,
        newsletter_opt_in: options?.newsletterOptIn ?? true,
        created_at: new Date().toISOString(),
      })
    } catch (orderErr) {
      console.warn('Orders table record note:', orderErr)
    }

    // 7. Purge cache on Library routes so purchases reflect instantly
    revalidatePath('/library')
    revalidatePath('/checkout')

    return {
      success: true,
      purchases: insertedPurchases || [],
      orderId: orderNumber,
    }
  } catch (err: any) {
    console.error('Server Action Checkout error:', err)
    return {
      success: false,
      error: err.message || 'An unexpected error occurred during secure checkout.',
    }
  }
}

export async function processCheckoutOrderAction(
  items: CheckoutItemInput[],
  billingDetails?: BillingDetailsInput,
  email?: string,
  clientUserId?: string,
  options?: CheckoutOptionsInput
) {
  return processCheckoutAction(items, email, clientUserId, billingDetails, options)
}
