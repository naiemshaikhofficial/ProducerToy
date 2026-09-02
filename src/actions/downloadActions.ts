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
      const isDev = process.env.NODE_ENV === 'development'

      // 1. Direct match: user_id + product_id (via user's client first, respecting RLS)
      const { data: userPurchases } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', activeProduct.id)
        .limit(1)

      if (userPurchases && userPurchases.length > 0) {
        isOwner = true
      }

      // 2. If not found via user client, check admin client
      if (!isOwner) {
        const { data: adminPurchases } = await adminSupabase
          .from('purchases')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_id', activeProduct.id)
          .limit(1)

        if (adminPurchases && adminPurchases.length > 0) {
          isOwner = true
        }
      }

      // 3. If still not found, check by customer_email
      if (!isOwner && userEmail) {
        const { data: emailPurchases } = await adminSupabase
          .from('purchases')
          .select('id')
          .ilike('customer_email', userEmail)
          .eq('product_id', activeProduct.id)
          .limit(1)

        if (emailPurchases && emailPurchases.length > 0) {
          isOwner = true
        }
      }

      // 4. Check claimed gifts table
      if (!isOwner) {
        const { data: userGift } = await adminSupabase
          .from('gifts')
          .select('id')
          .eq('recipient_user_id', user.id)
          .eq('status', 'claimed')
          .eq('product_id', activeProduct.id)
          .limit(1)

        if (userGift && userGift.length > 0) {
          isOwner = true
        }

        if (!isOwner && userEmail) {
          const { data: emailGift } = await adminSupabase
            .from('gifts')
            .select('id')
            .ilike('recipient_email', userEmail)
            .eq('status', 'claimed')
            .eq('product_id', activeProduct.id)
            .limit(1)

          if (emailGift && emailGift.length > 0) {
            isOwner = true
          }
        }
      }

      // 5. Development mode bypass
      if (!isOwner && isDev) {
        console.warn(`[DEV_BYPASS] Allowing download in development mode for user: ${user.id}`)
        isOwner = true
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
