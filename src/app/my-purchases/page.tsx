import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signDownloadToken } from '@/lib/security'
import { EpicLibraryClient } from '@/components/library/EpicLibraryClient'

export const dynamic = 'force-dynamic'

export default async function MyPurchasesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth?next=/my-purchases')
  }

  // Fetch purchases with joined products
  const { data: purchases } = await supabase
    .from('purchases')
    .select('*, products(*)')
    .eq('user_id', user.id)
    .order('purchased_at', { ascending: false })

  // Pre-generate secure HMAC-SHA256 download tokens
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

  const userName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0]

  return (
    <EpicLibraryClient
      purchases={(purchases as any) || []}
      userEmail={user.email || ''}
      userName={userName}
      downloadTokens={downloadTokens}
    />
  )
}
