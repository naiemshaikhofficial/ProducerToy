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

    // 1. Strict Authentication Check: Anonymous pairing is prohibited
    if (!user || !user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please sign in to your ProducerToy account to pair your workstation.',
          needsAuth: true,
        },
        { status: 401 }
      )
    }

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

    // 2. Fetch challenge
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
        { success: false, error: 'This pairing code has expired. Please click Start Online Pairing again in your plugin.' },
        { status: 410 }
      )
    }

    let product = challenge.products
    if (!product) {
      const { data: dbProd } = await admin
        .from('products')
        .select('id, name, slug, plugin_identifier, max_activation_seats, offline_grace_days')
        .eq('id', challenge.product_id)
        .maybeSingle()
      product = dbProd
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product associated with this pairing challenge could not be found.' },
        { status: 404 }
      )
    }

    const userEmail = (user.email || '').trim().toLowerCase()

    // 3. Strict Library Entitlement Check:
    // User MUST own the product in purchases or have claimed it as a gift
    let matchingPurchase: any = null

    // Check purchases table by user_id
    const { data: userPurchases } = await admin
      .from('purchases')
      .select('id, user_id, product_id, customer_email')
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .limit(1)

    if (userPurchases && userPurchases.length > 0) {
      matchingPurchase = userPurchases[0]
    } else if (userEmail) {
      // Fallback check purchases table by customer_email (e.g. bought before signing in)
      const { data: emailPurchases } = await admin
        .from('purchases')
        .select('id, user_id, product_id, customer_email')
        .ilike('customer_email', userEmail)
        .eq('product_id', product.id)
        .limit(1)

      if (emailPurchases && emailPurchases.length > 0) {
        matchingPurchase = emailPurchases[0]
        // Link user_id to this purchase record if not linked
        if (!matchingPurchase.user_id) {
          await admin
            .from('purchases')
            .update({ user_id: user.id })
            .eq('id', matchingPurchase.id)
        }
      }
    }

    // If still not found, check claimed gifts
    if (!matchingPurchase) {
      const { data: userGift } = await admin
        .from('gifts')
        .select('id, product_id')
        .eq('status', 'claimed')
        .eq('product_id', product.id)
        .or(`recipient_user_id.eq.${user.id}${userEmail ? `,recipient_email.ilike.${userEmail}` : ''}`)
        .limit(1)

      const cleanProductName = (product.name || '').split('–')[0].split('-')[0].trim() || 'Plugin'
      if (!userGift || userGift.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Please purchase this plugin to authorize your workstation.',
            needsPurchase: true,
            productSlug: product.slug || 'proverb',
            productName: cleanProductName,
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

    // 4. Strict Single-Device / Multi-seat policy enforcement
    // Automatically revoke old seats for this user & product
    await admin
      .from('device_activations')
      .update({ is_active: false, revoked_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('product_id', product.id)
      .neq('device_id_hash', challenge.device_id_hash)

    // 5. Issue Ed25519 token
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

    // 6. Record device activation
    await admin
      .from('device_activations')
      .upsert({
        id: activationId,
        user_id: user.id,
        product_id: product.id,
        purchase_id: matchingPurchase?.id || null,
        device_id_hash: challenge.device_id_hash,
        device_name: challenge.device_name || 'Studio Workstation',
        os: challenge.os || 'Windows',
        token: entitlement.token,
        is_active: true,
        activated_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
      }, { onConflict: 'id' })

    // 7. Mark challenge as claimed
    await admin
      .from('activation_challenges')
      .update({
        status: 'claimed',
        user_id: user.id,
        entitlement_token: entitlement.token,
        claimed_at: new Date().toISOString(),
      })
      .eq('id', challenge.id)

    const cleanProductName = (product.name || '').split('–')[0].split('-')[0].trim() || 'Plugin'
    return NextResponse.json({
      success: true,
      message: `Successfully authorized and paired "${challenge.device_name}" for ${cleanProductName}!`,
      productName: cleanProductName,
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
