import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getAdminClient } from '@/lib/supabase/admin'
import { sha256, issueEd25519LicenseToken } from '@/lib/licensing/crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { productId, serialKey, deviceId, deviceName, os } = body

    if (!serialKey || typeof serialKey !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid serial key.' },
        { status: 400 }
      )
    }

    const cleanDevId = (deviceId || '').trim().toLowerCase().replace(/[^0-9a-f]/g, '')
    if (cleanDevId.length !== 64) {
      return NextResponse.json(
        { success: false, error: 'Invalid 64-character hardware device ID format.' },
        { status: 400 }
      )
    }

    const cleanSerial = serialKey.trim().toUpperCase()
    const admin = getAdminClient()

    // 1. Resolve product dynamically
    let resolvedProduct: any = null

    if (productId && typeof productId === 'string') {
      const targetId = productId.trim()
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId)
      let query = admin.from('products').select('id, name, slug, plugin_identifier, max_activation_seats, brands(name)').limit(1)

      if (isUUID) {
        query = query.eq('id', targetId)
      } else {
        query = query.or(`slug.eq.${targetId},plugin_identifier.eq.${targetId},name.ilike.${targetId}`)
      }

      const { data: prods } = await query
      if (prods && prods.length > 0) {
        resolvedProduct = prods[0]
      }
    }

    // If productId wasn't provided or didn't match, resolve dynamically from the purchase row by serial_key
    if (!resolvedProduct) {
      const { data: directPurchase } = await admin
        .from('purchases')
        .select('*, products(id, name, slug, plugin_identifier, max_activation_seats, brands(name))')
        .ilike('serial_key', cleanSerial)
        .limit(1)
        .maybeSingle()

      if (directPurchase?.products) {
        resolvedProduct = directPurchase.products
      }
    }

    if (!resolvedProduct) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or unregistered serial key. Please copy the genuine serial key from your ProducerToy Library.',
        },
        { status: 403 }
      )
    }

    const resolvedProductId = resolvedProduct.id
    const productName = resolvedProduct.name
    const pluginIdentifier = resolvedProduct.plugin_identifier || `com.producertoy.${resolvedProduct.slug}`
    const brandName = resolvedProduct.brands?.name || 'Producer Toy'

    // 2. Strict Database Verification: Serial MUST exist in purchases or serial_keys for this product
    const { data: purchase, error: pErr } = await admin
      .from('purchases')
      .select('id, user_id, customer_email, customer_name, product_id, serial_key')
      .eq('product_id', resolvedProductId)
      .eq('serial_key', cleanSerial)
      .limit(1)
      .maybeSingle()

    let verifiedPurchase = purchase

    if (pErr || !verifiedPurchase) {
      // Also check case-insensitive match on purchases
      const { data: ilikePurchase } = await admin
        .from('purchases')
        .select('id, user_id, customer_email, customer_name, product_id, serial_key')
        .eq('product_id', resolvedProductId)
        .ilike('serial_key', cleanSerial)
        .limit(1)
        .maybeSingle()

      if (ilikePurchase) {
        verifiedPurchase = ilikePurchase
      }
    }

    if (!verifiedPurchase) {
      // Check preloaded serial_keys pool
      const { data: poolKey } = await admin
        .from('serial_keys')
        .select('id, product_id, serial_key, is_used, assigned_to_user_id')
        .eq('product_id', resolvedProductId)
        .eq('serial_key', cleanSerial)
        .limit(1)
        .maybeSingle()

      if (!poolKey) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid or unregistered serial key. Please check your ProducerToy Library for your official serial key.',
          },
          { status: 403 }
        )
      }
    }

    const customerEmail = verifiedPurchase?.customer_email || 'licensed@producertoy.com'
    const customerName =
      verifiedPurchase?.customer_name ||
      customerEmail.split('@')[0] ||
      'Producer'
    const ownerUserId = verifiedPurchase?.user_id || null

    // 3. Multi-seat management (max 3 devices per customer)
    if (ownerUserId) {
      const { data: activeSeats } = await admin
        .from('device_activations')
        .select('id, activated_at')
        .eq('user_id', ownerUserId)
        .eq('product_id', resolvedProductId)
        .eq('is_active', true)
        .order('activated_at', { ascending: true })

      const maxAllowedSeats = Number(resolvedProduct.max_activation_seats) || 3
      if (activeSeats && activeSeats.length >= maxAllowedSeats) {
        // Automatically cycle oldest seat
        await admin
          .from('device_activations')
          .update({ is_active: false, revoked_at: new Date().toISOString() })
          .eq('id', activeSeats[0].id)
      }
    }

    // 4. Issue Ed25519 token
    const activationId = crypto.randomUUID()
    const entitlement = issueEd25519LicenseToken({
      product: {
        id: resolvedProductId,
        name: productName,
        brand: brandName,
        plugin_identifier: pluginIdentifier,
      },
      deviceId: cleanDevId,
      userName: customerName,
      userEmail: customerEmail,
      activationId,
    })

    // 5. Record device activation
    try {
      await admin
        .from('device_activations')
        .upsert({
          id: activationId,
          user_id: ownerUserId,
          purchase_id: verifiedPurchase?.id || null,
          product_id: resolvedProductId,
          device_id_hash: cleanDevId,
          device_name: (deviceName || 'Studio Workstation').slice(0, 64),
          os: (os || 'Windows').slice(0, 32),
          token: entitlement.token,
          is_active: true,
          activated_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
        }, { onConflict: 'id' })
    } catch (dbErr) {
      console.warn('Device activation record note:', dbErr)
    }

    return NextResponse.json({
      success: true,
      token: entitlement.token,
      seatsUsed: 1,
      maxSeats: 3,
      message: 'Serial key redeemed successfully!',
    })
  } catch (err: any) {
    console.error('Serial activation exception:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error during serial activation.' },
      { status: 500 }
    )
  }
}
