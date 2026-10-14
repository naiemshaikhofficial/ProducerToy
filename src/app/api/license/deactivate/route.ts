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

    const body = await req.json().catch(() => ({}))
    const { activationId, deviceHash, productId } = body

    const admin = getAdminClient()

    let query = admin
      .from('device_activations')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
      })

    if (user) {
      // Authenticated web user deactivating from account library
      query = query.eq('user_id', user.id)
      if (activationId) {
        query = query.eq('id', activationId)
      } else if (deviceHash && productId) {
        const cleanHash = (deviceHash || '').toLowerCase().trim()
        query = query.eq('product_id', productId).or(`device_id_hash.eq.${cleanHash},device_id_hash.eq.${sha256(cleanHash)}`)
      } else {
        return NextResponse.json(
          { success: false, error: 'Must provide activationId or (deviceHash and productId)' },
          { status: 400 }
        )
      }
    } else {
      // Unauthenticated direct machine deactivation from plugin client
      if (!deviceHash || !productId) {
        return NextResponse.json(
          { success: false, error: 'Authentication required, or specify deviceHash and productId' },
          { status: 401 }
        )
      }
      const cleanHash = (deviceHash || '').toLowerCase().trim()
      query = query.eq('product_id', productId).or(`device_id_hash.eq.${cleanHash},device_id_hash.eq.${sha256(cleanHash)}`)
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
