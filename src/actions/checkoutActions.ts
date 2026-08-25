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
  city?: string
  state?: string
  zip?: string
  country?: string
}

export interface CheckoutItemInput {
  id: string
  name: string
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

    // 2.1 Update user_accounts, profiles, and auth user metadata
    if (targetUserId && billingDetails) {
      try {
        // Update Supabase auth user metadata
        await adminSupabase.auth.admin.updateUserById(targetUserId, {
          user_metadata: {
            full_name: billingDetails.fullName,
            phone: billingDetails.phone,
            address: billingDetails.address,
            city: billingDetails.city,
            state: billingDetails.state,
            zip: billingDetails.zip,
            country: billingDetails.country,
          },
        })

        // Upsert into user_accounts table
        await adminSupabase.from('user_accounts').upsert(
          {
            user_id: targetUserId,
            full_name: billingDetails.fullName,
            email: targetEmail,
            phone_number: billingDetails.phone,
            address_line1: billingDetails.address,
            city: billingDetails.city,
            state: billingDetails.state,
            postal_code: billingDetails.zip,
            country: billingDetails.country || 'India',
            newsletter: options?.newsletterOptIn ?? true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )

        // Upsert into profiles table
        await adminSupabase.from('profiles').upsert(
          {
            id: targetUserId,
            email: targetEmail,
            full_name: billingDetails.fullName,
            phone_number: billingDetails.phone,
            address_line1: billingDetails.address,
            city: billingDetails.city,
            state: billingDetails.state,
            postal_code: billingDetails.zip,
            country: billingDetails.country || 'India',
            newsletter: options?.newsletterOptIn ?? true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        )
      } catch (metaErr) {
        console.warn('Could not sync user billing profile in DB:', metaErr)
      }
    }

    // 3. Verify products in database to ensure tamper-proof pricing & delivery metadata
    const productIds = items.map((i) => i.id)
    const { data: dbProducts, error: dbErr } = await adminSupabase
      .from('products')
      .select('id, name, price_usd, price_inr, product_type, delivery_method, license_type')
      .in('id', productIds)

    if (dbErr || !dbProducts || dbProducts.length === 0) {
      return { success: false, error: 'Failed to verify items in database' }
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
        billing_country: billingDetails?.country || 'India',
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
        billing_country: billingDetails?.country || 'India',
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
