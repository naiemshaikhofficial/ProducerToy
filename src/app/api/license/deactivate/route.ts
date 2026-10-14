import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { sha256 } from '@/lib/licensing/crypto'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await req.json().catch(() => ({}))
    const { activationId, deviceHash, productId } = body

    const admin = getAdminClient()

    let query = admin
      .from('device_activations')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)

    if (activationId) {
      query = query.eq('id', activationId)
    } else if (deviceHash && productId) {
      query = query.eq('product_id', productId).eq('device_id_hash', sha256(deviceHash))
    } else {
      return NextResponse.json(
        { success: false, error: 'Must provide activationId or (deviceHash and productId)' },
        { status: 400 }
      )
    }

    const { error } = await query

    if (error) {
      console.error('Error deactivating device seat:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to deactivate device seat' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Device seat deactivated successfully. A license seat has been freed.',
    })
  } catch (err: any) {
    console.error('Deactivation exception:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
