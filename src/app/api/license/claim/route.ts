import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { sha256, maskEmail, signEntitlementToken, EntitlementPayload } from '@/lib/licensing/crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required. Please sign in to claim plugin activation.' },
        { status: 401 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const rawCode = body.pairingCode || body.code

    if (!rawCode || typeof rawCode !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid pairing challenge code.' },
        { status: 400 }
      )
    }

    const cleanCode = rawCode.trim().toUpperCase()
    const codeHash = sha256(cleanCode)

    const admin = getAdminClient()

    // 1. Find pending activation challenge
    const { data: challenge, error: chErr } = await admin
      .from('activation_challenges')
      .select('*, products(id, name, slug, plugin_identifier, max_activation_seats, offline_grace_days)')
      .eq('challenge_code_hash', codeHash)
      .maybeSingle()

    if (chErr || !challenge) {
      return NextResponse.json(
        { success: false, error: 'Invalid or unrecognized pairing code. Please generate a new code in the plugin.' },
        { status: 404 }
      )
    }

    if (challenge.status === 'claimed') {
      return NextResponse.json(
        { success: false, error: 'This pairing code has already been claimed and used.' },
        { status: 409 }
      )
    }

    if (new Date(challenge.expires_at).getTime() < Date.now()) {
      await admin
        .from('activation_challenges')
        .update({ status: 'expired' })
        .eq('id', challenge.id)

      return NextResponse.json(
        { success: false, error: 'This pairing code has expired. Please click Activate in the plugin again to get a fresh code.' },
        { status: 410 }
      )
    }

    const product = challenge.products
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product catalog entry not found for this challenge.' },
        { status: 500 }
      )
    }

    // 2. Verify account purchase entitlement in existing `purchases` table
    const { data: purchase, error: purchErr } = await admin
      .from('purchases')
      .select('id, user_id, product_id, purchased_at')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .order('purchased_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (purchErr || !purchase) {
      return NextResponse.json({
        success: false,
        error: `No active license found for ${product.name} on this Producer Toy account (${user.email}).`,
        needsPurchase: true,
        productName: product.name,
        productSlug: product.slug,
        productId: product.id,
      })
    }

    // 3. Strict Single-Device Seat Policy ("ek hi device ek time pe connect rahega")
    const maxSeats = 1

    // Automatically deactivate any previously active devices for this user & product so only 1 device is connected
    await admin
      .from('device_activations')
      .update({ is_active: false, revoked_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .neq('device_id_hash', challenge.device_id_hash)

    const { data: activeDevices, error: devErr } = await admin
      .from('device_activations')
      .select('id, device_id_hash, device_name, os, activated_at')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .eq('is_active', true)

    if (devErr) {
      console.error('Error querying device activations:', devErr)
    }

    const currentDevices = activeDevices || []

    // 4. Record / upsert device activation seat
    let activationId: string = ''
    const existingActivation = currentDevices.find(
      (d) => d.device_id_hash === challenge.device_id_hash
    )

    if (existingActivation) {
      activationId = existingActivation.id
      await admin
        .from('device_activations')
        .update({
          device_name: challenge.device_name || existingActivation.device_name,
          os: challenge.os || existingActivation.os,
          last_seen_at: new Date().toISOString(),
          is_active: true,
        })
        .eq('id', existingActivation.id)
    } else {
      const { data: newAct, error: actInsertErr } = await admin
        .from('device_activations')
        .insert({
          user_id: user.id,
          product_id: product.id,
          purchase_id: purchase.id,
          device_id_hash: challenge.device_id_hash,
          device_name: challenge.device_name || 'Audio Workstation',
          os: challenge.os || 'Windows',
          is_active: true,
          activated_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (actInsertErr || !newAct) {
        console.error('Failed to create device activation record:', actInsertErr)
        return NextResponse.json(
          { success: false, error: 'Database error assigning device seat.' },
          { status: 500 }
        )
      }
      activationId = newAct.id
    }

    // 5. Sign Asymmetric Entitlement Token
    const userName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Producer'

    const maskedUserEmail = maskEmail(user.email || '')

    const payload: EntitlementPayload = {
      v: 1,
      pid: product.id,
      plugin_id: product.plugin_identifier || 'com.producertoy.proverb',
      aid: activationId,
      uid_hash: sha256(user.id),
      dev_hash: challenge.device_id_hash,
      user_name: userName,
      user_email_masked: maskedUserEmail,
      tier: 'perpetual',
      iat: Math.floor(Date.now() / 1000),
      grace_days: product.offline_grace_days || 14,
    }

    const signedToken = signEntitlementToken(payload)

    // 6. Complete challenge
    await admin
      .from('activation_challenges')
      .update({
        status: 'claimed',
        user_id: user.id,
        entitlement_token: signedToken,
        claimed_at: new Date().toISOString(),
      })
      .eq('id', challenge.id)

    return NextResponse.json({
      success: true,
      message: `🎉 Successfully unlocked ${product.name} on "${challenge.device_name}"!`,
      productName: product.name,
      deviceName: challenge.device_name,
      maskedEmail: maskedUserEmail,
      seatsUsed: existingActivation ? currentDevices.length : currentDevices.length + 1,
      maxSeats,
      entitlementToken: signedToken,
    })
  } catch (err: any) {
    console.error('Claim pairing code exception:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error claiming activation code.' },
      { status: 500 }
    )
  }
}
