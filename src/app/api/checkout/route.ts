import { NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, email, userId } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    const supabase = getAdminClient()

    let targetUserId = userId

    // If user is not logged in, search or create user by email
    if (!targetUserId && email) {
      const { data: usersData } = await supabase.auth.admin.listUsers()
      const existingUser = usersData?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase())

      if (existingUser) {
        targetUserId = existingUser.id
      } else {
        // Create user silently with admin client
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

    // Insert purchase records securely using admin client
    const purchaseRecords = items.map((item: any) => ({
      user_id: targetUserId || null,
      product_id: item.id,
      amount_paid: item.price_inr || 0,
      currency: 'INR',
      serial_key: item.product_type === 'plugin' || item.product_type === 'vst' || item.type === 'plugin' 
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
      console.error('Purchase insert error:', insertErr)
      return NextResponse.json({ error: insertErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, purchases: inserted })
  } catch (err: any) {
    console.error('Checkout API error:', err)
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 })
  }
}
