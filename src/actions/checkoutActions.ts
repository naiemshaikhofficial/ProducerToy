'use server'

import { getAdminClient } from '@/lib/supabase/admin'

export interface CheckoutItemInput {
  id: string
  name: string
  price_inr: number
  price_usd: number
  product_type: string
}

export interface CheckoutActionResult {
  success: boolean
  purchases?: any[]
  error?: string
}

export async function processCheckoutAction(
  items: CheckoutItemInput[],
  email?: string,
  userId?: string
): Promise<CheckoutActionResult> {
  try {
    if (!items || items.length === 0) {
      return { success: false, error: 'Cart is empty' }
    }

    const supabase = getAdminClient()
    let targetUserId = userId

    if (!targetUserId && email) {
      const { data: usersData } = await supabase.auth.admin.listUsers()
      const existingUser = usersData?.users?.find(
        (u: any) => u.email?.toLowerCase() === email.toLowerCase()
      )

      if (existingUser) {
        targetUserId = existingUser.id
      } else {
        const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { role: 'customer' }
        })

        if (!createErr && newUser?.user) {
          targetUserId = newUser.user.id
        }
      }
    }

    const purchaseRecords = items.map((item) => ({
      user_id: targetUserId || null,
      product_id: item.id,
      amount_paid: item.price_usd || item.price_inr || 0,
      currency: 'USD',
      serial_key:
        item.product_type === 'plugin' || item.product_type === 'vst'
          ? `PT-VST-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
          : null,
      razorpay_order_id: `order_${Math.random().toString(36).substring(2, 12)}`,
      razorpay_payment_id: `pay_${Math.random().toString(36).substring(2, 12)}`,
    }))

    const { data: inserted, error: insertErr } = await supabase
      .from('purchases')
      .insert(purchaseRecords)
      .select()

    if (insertErr) {
      return { success: false, error: insertErr.message }
    }

    return { success: true, purchases: inserted }
  } catch (err: any) {
    return { success: false, error: err.message || 'Checkout failed' }
  }
}
