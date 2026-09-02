import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { signDownloadToken } from '@/lib/security'
import { EpicLibraryClient } from '@/components/library/EpicLibraryClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LibraryPage() {
  const supabase = await createClient()

  let user = null
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    user = authUser
  } catch (err) {
    console.warn('SSR auth check note:', err)
  }

  let purchases: any[] = []
  const downloadTokens: Record<string, string> = {}

  if (user) {
    // Fetch all verified purchases for this user
    const adminSupabase = getAdminClient()
    const { data: userPurchases, error } = await adminSupabase
      .from('purchases')
      .select('*, products(*, brands(name))')
      .eq('user_id', user.id)
      .order('purchased_at', { ascending: false })

    if (error) {
      console.error('Error fetching library purchases:', error)
    }

    purchases = userPurchases || []

    // Generate secure download tokens for each product
    if (purchases.length > 0) {
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
            3600 // 1 hour token
          )
        }
      })
    }
  }

  const userName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Producer'

  return (
    <EpicLibraryClient
      purchases={purchases}
      userEmail={user?.email || ''}
      userName={userName}
      downloadTokens={downloadTokens}
      initialUser={user}
    />
  )
}
