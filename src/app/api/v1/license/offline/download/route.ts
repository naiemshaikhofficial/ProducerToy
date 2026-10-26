import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { issueEd25519LicenseToken } from '@/lib/licensing/crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, error: 'Please sign in to your ProducerToy account to download an offline license.' },
        { status: 401 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const { productId, deviceId, deviceName } = body

    const cleanDevId = (deviceId || '').trim().toLowerCase().replace(/[^0-9a-f]/g, '')
    if (cleanDevId.length !== 64) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid 64-character hardware Device ID. You can copy it from your plugin under the "Offline File" tab.',
        },
        { status: 400 }
      )
    }

    if (!productId || typeof productId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Product ID or slug is required.' },
        { status: 400 }
      )
    }

    const admin = getAdminClient()
    const targetId = productId.trim()

    // 1. Resolve product
    const { data: product } = await admin
      .from('products')
      .select('id, name, slug, plugin_identifier')
      .or(`id.eq.${targetId},slug.eq.${targetId}`)
      .limit(1)
      .maybeSingle()

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found in catalog.' },
        { status: 404 }
      )
    }

    // 2. Strict Library Entitlement Check: User must own this product in purchases or claimed gifts
    const userEmail = (user.email || '').trim().toLowerCase()
    const { data: userPurchases } = await admin
      .from('purchases')
      .select('id, user_id, product_id, customer_email, serial_key')
      .eq('product_id', product.id)
      .or(`user_id.eq.${user.id}${userEmail ? `,customer_email.ilike.${userEmail}` : ''}`)
      .limit(1)

    let matchingPurchase = userPurchases && userPurchases.length > 0 ? userPurchases[0] : null

    if (!matchingPurchase) {
      const { data: userGift } = await admin
        .from('gifts')
        .select('id, product_id')
        .eq('status', 'claimed')
        .eq('product_id', product.id)
        .or(`recipient_user_id.eq.${user.id}${userEmail ? `,recipient_email.ilike.${userEmail}` : ''}`)
        .limit(1)

      if (!userGift || userGift.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: `${product.name} is not in your ProducerToy library. Please add it to your library first.`,
            needsPurchase: true,
          },
          { status: 403 }
        )
      }
    }

    const customerEmail = user.email || 'customer@producertoy.com'
    const customerName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      customerEmail.split('@')[0] ||
      'Producer'

    // 3. Multi-seat management (max 3 devices per customer)
    const { data: activeSeats } = await admin
      .from('device_activations')
      .select('id, activated_at')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .eq('is_active', true)
      .neq('device_id_hash', cleanDevId)
      .order('activated_at', { ascending: true })

    if (activeSeats && activeSeats.length >= 3) {
      await admin
        .from('device_activations')
        .update({ is_active: false, revoked_at: new Date().toISOString() })
        .eq('id', activeSeats[0].id)
    }

    // 4. Issue Ed25519 token bound to this device
    const activationId = crypto.randomUUID()
    const entitlement = issueEd25519LicenseToken({
      product: {
        id: product.id,
        name: product.name,
        brand: 'Producer Toy',
        plugin_identifier: product.plugin_identifier || 'com.producertoy.proverb',
      },
      deviceId: cleanDevId,
      userName: customerName,
      userEmail: customerEmail,
      activationId,
    })

    // 5. Record device activation
    await admin
      .from('device_activations')
      .upsert({
        id: activationId,
        user_id: user.id,
        purchase_id: matchingPurchase?.id || null,
        product_id: product.id,
        device_id_hash: cleanDevId,
        device_name: (deviceName || 'Studio Workstation (Offline)').slice(0, 64),
        os: 'Offline Workstation',
        token: entitlement.token,
        is_active: true,
        activated_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    const filename = `${(product.slug || 'proverb').toLowerCase()}.ptlic`

    return new NextResponse(entitlement.token, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Filename': filename,
      },
    })
  } catch (err: any) {
    console.error('Offline license download exception:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error generating offline license file.' },
      { status: 500 }
    )
  }
}
