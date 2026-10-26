import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { sha256, maskEmail, issueEd25519LicenseToken } from '@/lib/licensing/crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const body = await req.json().catch(() => ({}))
    const rawCode = body.code || body.pairingCode

    if (!rawCode || typeof rawCode !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Pairing code is required.' },
        { status: 400 }
      )
    }

    const cleanCode = rawCode.trim().toUpperCase()
    const codeHash = sha256(cleanCode)
    const admin = getAdminClient()

    // 1. Fetch challenge
    const { data: challenge, error: chErr } = await admin
      .from('activation_challenges')
      .select('*, products(id, name, slug, plugin_identifier, max_activation_seats, offline_grace_days)')
      .eq('challenge_code_hash', codeHash)
      .maybeSingle()

    if (chErr || !challenge) {
      return NextResponse.json(
        { success: false, error: 'Pairing session is invalid or not found. Please click Start Online Pairing in the plugin.' },
        { status: 404 }
      )
    }

    if (challenge.status === 'claimed') {
      return NextResponse.json(
        { success: false, error: 'This pairing code has already been used and claimed.' },
        { status: 409 }
      )
    }

    if (new Date(challenge.expires_at).getTime() < Date.now()) {
      await admin
        .from('activation_challenges')
        .update({ status: 'expired' })
        .eq('id', challenge.id)

      return NextResponse.json(
        { success: false, error: 'This pairing code has expired. Please click Start Online Pairing again in ProVerb.' },
        { status: 410 }
      )
    }

    const product = challenge.products || {
      id: challenge.product_id,
      name: 'ProVerb',
      slug: 'proverb',
      plugin_identifier: 'com.producertoy.proverb',
      max_activation_seats: 3,
      offline_grace_days: 14,
    }

    const customerEmail =
      user?.email ||
      body.customerEmail ||
      'customer@producertoy.com'

    const customerName =
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      body.customerName ||
      customerEmail.split('@')[0] ||
      'Producer'

    // 2. Strict Single-Device / Multi-seat policy enforcement
    // Automatically revoke old seats for this user & product if single-device
    if (user?.id) {
      await admin
        .from('device_activations')
        .update({ is_active: false, revoked_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .neq('device_id_hash', challenge.device_id_hash)
    }

    // 3. Issue Ed25519 token
    const activationId = crypto.randomUUID()
    const entitlement = issueEd25519LicenseToken({
      product: {
        id: product.id,
        name: product.name,
        brand: 'Producer Toy',
        plugin_identifier: product.plugin_identifier || 'com.producertoy.proverb',
      },
      deviceId: challenge.device_id_hash,
      userName: customerName,
      userEmail: customerEmail,
      activationId,
    })

    // 4. Record device activation
    await admin
      .from('device_activations')
      .upsert({
        id: activationId,
        user_id: user?.id || null,
        product_id: product.id,
        device_id_hash: challenge.device_id_hash,
        device_name: challenge.device_name || 'Studio Workstation',
        os: challenge.os || 'Windows',
        token: entitlement.token,
        is_active: true,
        activated_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    // 5. Mark challenge as claimed
    await admin
      .from('activation_challenges')
      .update({
        status: 'claimed',
        user_id: user?.id || null,
        entitlement_token: entitlement.token,
        claimed_at: new Date().toISOString(),
      })
      .eq('id', challenge.id)

    return NextResponse.json({
      success: true,
      message: `Successfully authorized and paired "${challenge.device_name}" for ${product.name}!`,
      productName: product.name,
      deviceName: challenge.device_name,
      token: entitlement.token,
    })
  } catch (err: any) {
    console.error('Pair claim exception:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error claiming pairing code.' },
      { status: 500 }
    )
  }
}
