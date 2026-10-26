'use server'

import crypto from 'crypto'
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
          3600
        )

        // Automatically generate and persist genuine serial key if missing for any marketplace plugin
        const isLicensedPlugin =
          product.product_type === 'plugin' ||
          Boolean(product.plugin_identifier) ||
          Boolean(product.license_delivery_type) ||
          Boolean(product.delivery_method && String(product.delivery_method).toLowerCase().includes('serial')) ||
          Boolean(product.delivery_method && String(product.delivery_method).toLowerCase().includes('license'))

        if (isLicensedPlugin && (!item.serial_key || typeof item.serial_key !== 'string' || !item.serial_key.trim())) {
          const rawPrefix =
            product.serial_prefix ||
            product.brands?.name ||
            product.brand ||
            product.slug ||
            product.name ||
            'PLUG'

          const cleanPrefix =
            String(rawPrefix)
              .toUpperCase()
              .replace(/[^A-Z0-9]/g, '')
              .slice(0, 4) || 'PLUG'

          const partA = crypto.randomBytes(2).toString('hex').toUpperCase()
          const partB = crypto.randomBytes(2).toString('hex').toUpperCase()
          const partC = crypto.randomBytes(2).toString('hex').toUpperCase()
          const partD = crypto.randomBytes(2).toString('hex').toUpperCase()
          const generatedSerial = `PT-${cleanPrefix}-${partA}-${partB}-${partC}-${partD}`

          try {
            await adminSupabase
              .from('purchases')
              .update({ serial_key: generatedSerial })
              .eq('id', item.id)
            item.serial_key = generatedSerial
          } catch (e) {
            console.warn(`[LIBRARY] Error auto-persisting serial for ${product.slug || product.id}:`, e)
          }
        }
      }
    }
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
