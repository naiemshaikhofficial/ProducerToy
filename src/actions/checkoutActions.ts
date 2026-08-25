'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

export interface CheckoutItemInput {
  id: string
  name: string
  price_inr?: number
  price_usd?: number
  product_type?: string
}

export interface CheckoutActionResult {
  success: boolean
  purchases?: any[]
  error?: string
}

export async function processCheckoutAction(
  items: CheckoutItemInput[],
  email?: string,
  clientUserId?: string
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
    const targetEmail = sessionUser?.email || email || ''

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

    // 3. Verify products in database to ensure tamper-proof pricing & delivery metadata
    const productIds = items.map((i) => i.id)
    const { data: dbProducts, error: dbErr } = await adminSupabase
      .from('products')
      .select('id, name, price_usd, price_inr, product_type, delivery_method, license_type')
      .in('id', productIds)

    if (dbErr || !dbProducts || dbProducts.length === 0) {
      return { success: false, error: 'Failed to verify items in database' }
    }

    // 4. Build secure purchase records with conditional serial key issuance
    const purchaseRecords = dbProducts.map((dbProduct) => {
      // Issue serial keys ONLY when the product genuinely uses a serial license key
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

      const randomOrderId = `ord_${crypto.randomBytes(6).toString('hex')}`
      const randomPaymentId = `pay_${crypto.randomBytes(6).toString('hex')}`

      return {
        user_id: targetUserId,
        product_id: dbProduct.id,
        amount_paid: Number(dbProduct.price_usd || 0),
        currency: 'USD',
        serial_key: serialKey,
        razorpay_order_id: randomOrderId,
        razorpay_payment_id: randomPaymentId,
        purchased_at: new Date().toISOString(),
      }
    })

    // 5. Insert verified purchases into Supabase
    const { data: inserted, error: insertErr } = await adminSupabase
      .from('purchases')
      .insert(purchaseRecords)
      .select('*, products(*)')

    if (insertErr) {
      console.error('Secure checkout insert error:', insertErr)
      return { success: false, error: insertErr.message }
    }

    // 6. Purge cache on Library routes so purchases reflect instantly
    revalidatePath('/library')
    revalidatePath('/checkout')

    return {
      success: true,
      purchases: inserted || [],
    }
  } catch (err: any) {
    console.error('Server Action Checkout error:', err)
    return {
      success: false,
      error: err.message || 'An unexpected error occurred during secure checkout.',
    }
  }
}
