import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, email, userId } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    // 1. Get authenticated user directly from request cookie session
    const serverSupabase = await createClient()
    const {
      data: { user: authUser },
    } = await serverSupabase.auth.getUser()

    let targetUserId: string | null = authUser?.id || userId || null

    const adminSupabase = getAdminClient()

    // 2. If no targetUserId, attempt to find user by email
    if (!targetUserId && email) {
      try {
        const { data: usersData } = await adminSupabase.auth.admin.listUsers()
        const existingUser = usersData?.users?.find(
          (u: any) => u.email?.toLowerCase() === email.toLowerCase()
        )

        if (existingUser) {
          targetUserId = existingUser.id
        }
      } catch (userErr) {
        console.warn('User lookup warning:', userErr)
      }
    }

    // 3. Verify products in database & ensure no paid products can be claimed for free
    const productIds = items.map((i: any) => i.id)
    const { data: dbProducts } = await adminSupabase
      .from('products')
      .select('id, name, price_usd, price_inr, product_type, delivery_method, license_type')
      .in('id', productIds)

    // Check if any product in database is paid
    const hasPaidProduct = (dbProducts || []).some(
      (p) => Number(p.price_usd || 0) > 0 || Number(p.price_inr || 0) > 0
    )
    if (hasPaidProduct) {
      return NextResponse.json(
        { error: 'Paid products must be purchased through payment gateway' },
        { status: 400 }
      )
    }

    const productMap = new Map((dbProducts || []).map((p) => [p.id, p]))

    // 4. Insert purchase records
    const purchaseRecords = items.map((item: any) => {
      const dbProduct = productMap.get(item.id) || item

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
        product_id: item.id,
        amount_paid: item.price_usd || item.price_inr || 0,
        currency: 'USD',
        serial_key: serialKey,
        razorpay_order_id: `ord_${crypto.randomBytes(6).toString('hex')}`,
        razorpay_payment_id: `pay_${crypto.randomBytes(6).toString('hex')}`,
        purchased_at: new Date().toISOString(),
      }
    })

    const { data: inserted, error: insertErr } = await adminSupabase
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
