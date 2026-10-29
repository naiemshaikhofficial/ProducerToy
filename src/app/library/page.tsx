import React from 'react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Sound & Plugin Library | Producer Toy',
  description: 'Access your purchased VST plugins, serial keys, and sound libraries.',
  robots: {
    index: false,
    follow: false,
  },
}
import crypto from 'crypto'
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

  if (!user) {
    redirect('/auth?next=/library')
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

    // Generate secure download tokens & auto-issue missing serial keys for plugins
    if (purchases.length > 0) {
      for (const item of purchases as any[]) {
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

          // Auto-repair missing serial key for plugins so user can activate immediately
          const isPlugin =
            product.product_type === 'plugin' ||
            Boolean(product.plugin_identifier) ||
            String(product.name || '').toLowerCase().includes('plugin') ||
            String(product.slug || '').toLowerCase().includes('proverb')

          if (isPlugin && (!item.serial_key || typeof item.serial_key !== 'string' || !item.serial_key.trim())) {
            const rawPrefix = product.slug || product.name || 'PLUG'
            const cleanPrefix = String(rawPrefix).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5) || 'PLUG'
            const partA = crypto.randomBytes(3).toString('hex').toUpperCase()
            const partB = crypto.randomBytes(3).toString('hex').toUpperCase()
            const partC = crypto.randomBytes(3).toString('hex').toUpperCase()
            const generatedKey = `PT-${cleanPrefix}-${partA}-${partB}-${partC}`

            item.serial_key = generatedKey
            adminSupabase
              .from('purchases')
              .update({ serial_key: generatedKey })
              .eq('id', item.id)
              .then(
                () => {},
                (e) => console.warn('Serial auto-repair update note:', e)
              )
          }
        }
      }
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
