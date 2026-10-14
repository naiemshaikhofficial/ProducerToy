import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { generatePairingCode, sha256 } from '@/lib/licensing/crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { productId, deviceHash, deviceName, os } = body

    if (!productId || !deviceHash) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters: productId and deviceHash' },
        { status: 400 }
      )
    }

    const admin = getAdminClient()

    // 1. Resolve product by UUID, slug, or plugin_identifier
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId)
    let productQuery = admin.from('products').select('id, name, slug, is_active').limit(1)

    if (isUUID) {
      productQuery = productQuery.eq('id', productId)
    } else {
      productQuery = productQuery.or(
        `slug.eq.${productId},plugin_identifier.eq.${productId},name.ilike.${productId}`
      )
    }

    const { data: products, error: prodErr } = await productQuery
    const product = products?.[0]

    if (prodErr || !product || !product.is_active) {
      return NextResponse.json(
        { success: false, error: 'Product not found or inactive in Producer Toy marketplace catalog' },
        { status: 404 }
      )
    }

    // 2. Generate short-lived pairing challenge code
    const pairingCode = generatePairingCode()
    const codeHash = sha256(pairingCode)
    const cleanDeviceHash = sha256(deviceHash)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 mins

    // 3. Store challenge in activation_challenges
    const { data: challenge, error: insertErr } = await admin
      .from('activation_challenges')
      .insert({
        challenge_code_hash: codeHash,
        product_id: product.id,
        device_id_hash: cleanDeviceHash,
        device_name: deviceName || 'Audio Workstation',
        os: os || 'Windows',
        status: 'pending',
        expires_at: expiresAt,
      })
      .select('id')
      .single()

    if (insertErr || !challenge) {
      console.error('Error creating activation challenge:', insertErr)
      return NextResponse.json(
        { success: false, error: 'Database error creating pairing challenge' },
        { status: 500 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://producertoy.com'
    const activateUrl = `${baseUrl}/library?claim=${pairingCode}`

    return NextResponse.json({
      success: true,
      challengeId: challenge.id,
      pairingCode,
      expiresAt,
      activateUrl,
      productName: product.name,
      productId: product.id,
    })
  } catch (err: any) {
    console.error('Activation challenge exception:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
