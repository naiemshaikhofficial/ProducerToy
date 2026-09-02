'use server'

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { signDownloadToken } from '@/lib/security'

export interface LibraryDataResult {
  success: boolean
  error?: string
  user?: {
    id: string
    email: string
    name: string
  } | null
  purchases: any[]
  downloadTokens: Record<string, string>
}

/**
 * Fetch verified purchases and download tokens for authenticated user
 */
export async function getUserLibraryAction(): Promise<LibraryDataResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      success: false,
      error: 'Not authenticated',
      user: null,
      purchases: [],
      downloadTokens: {},
    }
  }

  const adminSupabase = getAdminClient()
  const { data: purchases, error } = await adminSupabase
    .from('purchases')
    .select('*, products(*, brands(name))')
    .eq('user_id', user.id)
    .order('purchased_at', { ascending: false })

  if (error) {
    console.error('Error fetching purchases in library action:', error)
  }

  const downloadTokens: Record<string, string> = {}
  if (purchases && purchases.length > 0) {
    purchases.forEach((item: any) => {
      const product = item.products
      if (product) {
        downloadTokens[product.id] = signDownloadToken(
          {
            uid: user.id,
            pid: product.id,
            type: product.product_type,
            ip: '127.0.0.1',
          },
          3600
        )
      }
    })
  }

  const userName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Producer'

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email || '',
      name: userName,
    },
    purchases: (purchases as any[]) || [],
    downloadTokens,
  }
}
