import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')

    const admin = getAdminClient()

    let query = admin
      .from('device_activations')
      .select('id, product_id, device_name, os, activated_at, last_seen_at, is_active, products(id, name, slug, max_activation_seats)')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('activated_at', { ascending: false })

    if (productId) {
      query = query.eq('product_id', productId)
    }

    const { data: devices, error } = await query

    if (error) {
      console.error('Error fetching devices:', error)
      return NextResponse.json(
        { success: false, error: 'Error fetching active devices' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      devices: devices || [],
    })
  } catch (err: any) {
    console.error('Devices list exception:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
