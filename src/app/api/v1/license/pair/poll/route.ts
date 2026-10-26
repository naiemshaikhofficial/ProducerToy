import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { sha256 } from '@/lib/licensing/crypto'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const deviceId = searchParams.get('deviceId')

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'code query parameter is required.' },
        { status: 400 }
      )
    }

    const cleanDevId = (deviceId || '').trim().toLowerCase().replace(/[^0-9a-f]/g, '')
    const cleanCode = code.trim().toUpperCase()
    const codeHash = sha256(cleanCode)

    const admin = getAdminClient()

    const { data: challenge, error } = await admin
      .from('activation_challenges')
      .select('id, device_id_hash, status, entitlement_token, expires_at')
      .eq('challenge_code_hash', codeHash)
      .maybeSingle()

    if (error || !challenge) {
      return NextResponse.json(
        { success: false, error: 'Pairing code not found or expired.' },
        { status: 404 }
      )
    }

    if (cleanDevId && challenge.device_id_hash !== cleanDevId) {
      return NextResponse.json(
        { success: false, error: 'Device fingerprint mismatch for pairing session.' },
        { status: 403 }
      )
    }

    if (challenge.status === 'claimed') {
      return NextResponse.json({
        success: true,
        status: 'claimed',
        token: challenge.entitlement_token,
      })
    }

    if (challenge.status === 'pending' && new Date(challenge.expires_at).getTime() < Date.now()) {
      await admin
        .from('activation_challenges')
        .update({ status: 'expired' })
        .eq('id', challenge.id)

      return NextResponse.json({
        success: true,
        status: 'expired',
        error: 'Pairing challenge has expired.',
      })
    }

    return NextResponse.json({
      success: true,
      status: challenge.status,
      expiresAt: challenge.expires_at,
    })
  } catch (err: any) {
    console.error('Pair polling exception:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error during pairing poll.' },
      { status: 500 }
    )
  }
}
