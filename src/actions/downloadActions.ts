'use server'

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { headers } from 'next/headers'
import { signDownloadToken } from '@/lib/security'

/**
 * High-Speed Server Action to verify purchase ownership and issue a 5-minute secure download token.
 */
export async function getSecureDownloadUrlAction(
  productId: string,
  platform?: 'windows' | 'mac' | 'all'
) {
  try {
    if (!productId) {
      return { success: false, error: 'Product ID is required' }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Please login to download files from your library' }
    }

    const headerList = await headers()
    const rawIp =
      headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headerList.get('x-real-ip') ||
      'unknown'

    const adminSupabase = getAdminClient()

    // 1. Verify Product exists in catalog
    const { data: product, error: productError } = await adminSupabase
      .from('products')
      .select('id, name, product_type, price_usd, price_inr, is_free')
      .eq('id', productId)
      .maybeSingle()

    if (productError || !product) {
      return { success: false, error: 'Product not found' }
    }

    const isFree =
      Boolean(product.is_free) ||
      (Number(product.price_usd || 0) <= 0 && Number(product.price_inr || 0) <= 0)

    // 2. If not free, verify ownership in purchases OR claimed gifts
    if (!isFree) {
      // Check purchases table
      const { data: purchaseRecord } = await adminSupabase
        .from('purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle()

      let isOwner = Boolean(purchaseRecord)

      if (!isOwner && user.email) {
        // Check claimed gifts table
        const { data: giftRecord } = await adminSupabase
          .from('gifts')
          .select('id')
          .eq('product_id', productId)
          .eq('status', 'claimed')
          .or(`recipient_user_id.eq.${user.id},recipient_email.ilike.${user.email.toLowerCase()}`)
          .maybeSingle()

        if (giftRecord) {
          isOwner = true
        }
      }

      if (!isOwner) {
        return {
          success: false,
          error: 'Access Denied: Product has not been purchased by this account',
        }
      }
    }

    // 3. Issue signed database-less token (5-minute expiration)
    const token = signDownloadToken(
      {
        uid: user.id,
        pid: product.id,
        type: product.product_type,
        platform: platform || 'windows',
        ip: rawIp,
      },
      300 // 5 minutes
    )

    return {
      success: true,
      downloadUrl: `/api/download/${token}`,
    }
  } catch (error: any) {
    console.error('[GET_SECURE_DOWNLOAD_URL_ERROR]', error)
    return { success: false, error: error.message || 'Failed to generate secure download link' }
  }
}
