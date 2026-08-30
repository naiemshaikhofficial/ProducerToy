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

    // 1. Verify Product exists in catalog (support both UUID id and slug)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId)
    
    let productQuery = adminSupabase
      .from('products')
      .select('id, name, slug, product_type, price_usd')

    if (isUuid) {
      productQuery = productQuery.eq('id', productId)
    } else {
      productQuery = productQuery.eq('slug', productId)
    }

    const { data: product, error: productError } = await productQuery.maybeSingle()
    let activeProduct = product

    if (productError || !activeProduct) {
      // Fallback try opposite field or direct lookup
      const { data: fallbackProduct } = await adminSupabase
        .from('products')
        .select('id, name, slug, product_type, price_usd')
        .or(`id.eq.${productId},slug.eq.${productId}`)
        .maybeSingle()

      if (!fallbackProduct) {
        return { success: false, error: 'Product not found in store catalog' }
      }
      activeProduct = fallbackProduct
    }

    const isFree = Number(activeProduct.price_usd || 0) <= 0

    // 2. If not free, verify ownership in purchases OR claimed gifts
    if (!isFree) {
      let isOwner = false
      const userEmail = user.email?.trim().toLowerCase()

      // Check purchases table (matching user_id OR customer_email)
      let purchaseQuery = adminSupabase
        .from('purchases')
        .select('id')
        .or(`product_id.eq.${activeProduct.id},product_id.eq.${activeProduct.slug}`)

      if (userEmail) {
        purchaseQuery = purchaseQuery.or(`user_id.eq.${user.id},customer_email.ilike.${userEmail}`)
      } else {
        purchaseQuery = purchaseQuery.eq('user_id', user.id)
      }

      const { data: purchaseRecord } = await purchaseQuery.maybeSingle()
      if (purchaseRecord) {
        isOwner = true
      }

      if (!isOwner && userEmail) {
        // Check claimed gifts table
        const { data: giftRecord } = await adminSupabase
          .from('gifts')
          .select('id')
          .or(`product_id.eq.${activeProduct.id},product_id.eq.${activeProduct.slug}`)
          .eq('status', 'claimed')
          .or(`recipient_user_id.eq.${user.id},recipient_email.ilike.${userEmail}`)
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
        pid: activeProduct.id,
        type: activeProduct.product_type,
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
