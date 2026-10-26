import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { activationId, deviceId } = body

    if (activationId || deviceId) {
      const admin = getAdminClient()
      const cleanDevId = (deviceId || '').trim().toLowerCase().replace(/[^0-9a-f]/g, '')

      let query = admin
        .from('device_activations')
        .update({ is_active: false, revoked_at: new Date().toISOString() })

      if (activationId) {
        query = query.eq('id', activationId)
      } else if (cleanDevId) {
        query = query.eq('device_id_hash', cleanDevId)
      }

      await query
    }

    return NextResponse.json({
      success: true,
      message: 'Device deactivated successfully.',
    })
  } catch (err: any) {
    console.error('Deactivation exception:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error deactivating device.' },
      { status: 500 }
    )
  }
}
