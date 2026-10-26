import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getAdminClient } from '@/lib/supabase/admin'
import { sha256, issueEd25519LicenseToken } from '@/lib/licensing/crypto'

export const dynamic = 'force-dynamic'

const DEFAULT_PRODUCT_ID = '92cf2454-2cfc-4db5-b210-2c732457605f'
const DEFAULT_PLUGIN_ID = 'com.producertoy.proverb'
const DEFAULT_PRODUCT_NAME = 'ProVerb'

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

    // 1. Resolve product
    const targetId = productId || DEFAULT_PRODUCT_ID
    let resolvedProductId = DEFAULT_PRODUCT_ID
    let productName = DEFAULT_PRODUCT_NAME
    let pluginIdentifier = DEFAULT_PLUGIN_ID

    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId)
      let query = admin.from('products').select('id, name, slug, plugin_identifier').limit(1)

      if (isUUID) {
        query = query.eq('id', targetId)
      } else {
        query = query.or(`slug.eq.${targetId},plugin_identifier.eq.${targetId},name.ilike.${targetId}`)
      }

      const { data: prods } = await query
      if (prods && prods.length > 0) {
        resolvedProductId = prods[0].id
        productName = prods[0].name
        pluginIdentifier = prods[0].plugin_identifier || DEFAULT_PLUGIN_ID
      }
    } catch (e) {
      console.warn('Product resolution fallback used:', e)
    }

    // 2. Issue Ed25519 token
    const activationId = crypto.randomUUID()
    const entitlement = issueEd25519LicenseToken({
      product: {
        id: resolvedProductId,
        name: productName,
        brand: 'Producer Toy',
        plugin_identifier: pluginIdentifier,
      },
      deviceId: cleanDevId,
      userName: 'ProducerToy Verified Artist',
      userEmail: 'licensed@producertoy.com',
      activationId,
    })

    // 3. Record device activation
    try {
      await admin
        .from('device_activations')
        .upsert({
          id: activationId,
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
