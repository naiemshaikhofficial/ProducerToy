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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth?next=/library')
  }

  // Fetch all verified purchases for this user
  const adminSupabase = getAdminClient()
  const { data: purchases, error } = await adminSupabase
    .from('purchases')
    .select('*, products(*)')
    .eq('user_id', user.id)
    .order('purchased_at', { ascending: false })

  if (error) {
    console.error('Error fetching library purchases:', error)
  }

  // Generate secure download tokens for each product
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
          3600 // 1 hour token
        )
      }
    })
  }

  const userName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Producer'

  return (
    <EpicLibraryClient
      purchases={(purchases as any) || []}
      userEmail={user.email || ''}
      userName={userName}
      downloadTokens={downloadTokens}
    />
  )
}
