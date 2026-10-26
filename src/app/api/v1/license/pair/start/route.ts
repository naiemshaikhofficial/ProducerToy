import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getAdminClient } from '@/lib/supabase/admin'
import { sha256 } from '@/lib/licensing/crypto'

export const dynamic = 'force-dynamic'

const DEFAULT_PRODUCT_ID = '92cf2454-2cfc-4db5-b210-2c732457605f'
const DEFAULT_PLUGIN_ID = 'com.producertoy.proverb'
const DEFAULT_PRODUCT_NAME = 'ProVerb'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { productId, deviceId, deviceName, os } = body

    const cleanDevId = (deviceId || '').trim().toLowerCase().replace(/[^0-9a-f]/g, '')
    if (cleanDevId.length !== 64) {
      return NextResponse.json(
        { success: false, error: 'Invalid 64-character hardware device ID format.' },
        { status: 400 }
      )
    }

    const admin = getAdminClient()

    // 1. Resolve product from Supabase catalog
    const targetId = productId || DEFAULT_PRODUCT_ID
    let resolvedProductId = DEFAULT_PRODUCT_ID
    let productName = DEFAULT_PRODUCT_NAME

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
      }
    } catch (e) {
      console.warn('Product resolution fallback used:', e)
    }

    // 2. Generate short-lived pairing code (e.g. PV-7B9A-2K4F)
    const part1 = crypto.randomBytes(2).toString('hex').toUpperCase()
    const part2 = crypto.randomBytes(2).toString('hex').toUpperCase()
    const code = `PV-${part1}-${part2}`
    const codeHash = sha256(code)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 mins TTL

    // 3. Store challenge in activation_challenges table
    const { error: insertErr } = await admin
      .from('activation_challenges')
      .insert({
        challenge_code_hash: codeHash,
        product_id: resolvedProductId,
        device_id_hash: cleanDevId,
        device_name: (deviceName || 'Studio Workstation').slice(0, 64),
        os: (os || 'Windows').slice(0, 32),
        status: 'pending',
        expires_at: expiresAt,
      })

    if (insertErr) {
      console.error('Error inserting activation challenge:', insertErr)
      return NextResponse.json(
        { success: false, error: 'Database error creating pairing challenge session.' },
        { status: 500 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
      ? process.env.NEXT_PUBLIC_SITE_URL
      : 'https://producertoy.com'

    return NextResponse.json({
      success: true,
      code,
      claimUrl: `${baseUrl}/pair?code=${code}`,
      expiresAt,
      productName,
    })
  } catch (err: any) {
    console.error('Pair start exception:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error starting pairing flow.' },
      { status: 500 }
    )
  }
}
