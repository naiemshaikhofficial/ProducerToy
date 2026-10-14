import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { sha256 } from '@/lib/licensing/crypto'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const challengeId = searchParams.get('challengeId')
    const deviceHash = searchParams.get('deviceHash')

    if (!challengeId || !deviceHash) {
      return NextResponse.json(
        { success: false, error: 'Missing challengeId or deviceHash query parameters' },
        { status: 400 }
      )
    }

    const admin = getAdminClient()
    const cleanDeviceHash = sha256(deviceHash)

    const { data: challenge, error } = await admin
      .from('activation_challenges')
      .select('id, device_id_hash, status, entitlement_token, expires_at')
      .eq('id', challengeId)
      .maybeSingle()

    if (error || !challenge) {
      return NextResponse.json(
        { success: false, error: 'Challenge not found' },
        { status: 404 }
      )
    }

    // Security check: Must match the hardware device that originally initiated the challenge
    if (challenge.device_id_hash !== cleanDeviceHash) {
      return NextResponse.json(
        { success: false, error: 'Device fingerprint mismatch' },
        { status: 403 }
      )
    }

    // Check expiration if still pending
    if (challenge.status === 'pending' && new Date(challenge.expires_at).getTime() < Date.now()) {
      await admin
        .from('activation_challenges')
        .update({ status: 'expired' })
        .eq('id', challengeId)

      return NextResponse.json({
        success: true,
        status: 'expired',
        error: 'Pairing challenge has expired',
      })
    }

    if (challenge.status === 'claimed') {
      return NextResponse.json({
        success: true,
        status: 'claimed',
        entitlementToken: challenge.entitlement_token,
      })
    }

    return NextResponse.json({
      success: true,
      status: challenge.status,
      expiresAt: challenge.expires_at,
    })
  } catch (err: any) {
    console.error('Polling exception:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
