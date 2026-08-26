'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface WishlistProduct {
  id: string
  name: string
  slug: string
  brand: string
  product_type: string
  price_inr: number
  price_usd: number
  original_price_inr?: number
  original_price_usd?: number
  cover_image: string
  demo_audio_url?: string
  vst_format?: string
  short_description?: string
  is_featured?: boolean
  created_at?: string
}

export interface WishlistResult {
  success: boolean
  isSaved?: boolean
  message: string
  items?: WishlistProduct[]
}

/**
 * Fetch all wishlisted products for a user
 */
export async function getWishlistAction(userId?: string): Promise<{ success: boolean; items: WishlistProduct[] }> {
  if (!userId) {
    return { success: true, items: [] }
  }

  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('wishlists')
      .select(`
        id,
        created_at,
        products:product_id (
          id,
          name,
          slug,
          brand,
          product_type,
          price_inr,
          price_usd,
          original_price_inr,
          original_price_usd,
          cover_image,
          demo_audio_url,
          vst_format,
          short_description,
          is_featured,
          created_at,
          brands(name)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching wishlist:', error)
      return { success: false, items: [] }
    }

    const items: WishlistProduct[] = (data || [])
      .map((row: any) => {
        const p = row.products
        if (!p) return null
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          brand: p.brands?.name || p.brand || 'Producer Toy',
          product_type: p.product_type,
          price_inr: Number(p.price_inr) || 0,
          price_usd: Number(p.price_usd) || 0,
          original_price_inr: p.original_price_inr ? Number(p.original_price_inr) : undefined,
          original_price_usd: p.original_price_usd ? Number(p.original_price_usd) : undefined,
          cover_image: p.cover_image,
          demo_audio_url: p.demo_audio_url,
          vst_format: p.vst_format,
          short_description: p.short_description,
          is_featured: p.is_featured,
          created_at: p.created_at,
        }
      })
      .filter(Boolean) as WishlistProduct[]

    return { success: true, items }
  } catch (err: any) {
    console.error('Failed to get wishlist:', err)
    return { success: false, items: [] }
  }
}

/**
 * Toggle single product in wishlist
 */
export async function toggleWishlistAction(productId: string, userId?: string): Promise<WishlistResult> {
  if (!productId) {
    return { success: false, isSaved: false, message: 'Invalid product ID' }
  }

  if (!userId) {
    // Guest optimistic response (handled locally in client context)
    return { success: true, isSaved: true, message: 'Updated wishlist locally' }
  }

  try {
    const supabase = getAdminClient()
    const { data: existing } = await supabase
      .from('wishlists')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single()

    if (existing) {
      await supabase.from('wishlists').delete().eq('id', existing.id)
      revalidatePath('/wishlist')
      return { success: true, isSaved: false, message: 'Removed from wishlist' }
    } else {
      await supabase.from('wishlists').insert({ user_id: userId, product_id: productId })
      revalidatePath('/wishlist')
      return { success: true, isSaved: true, message: 'Saved to wishlist!' }
    }
  } catch (err: any) {
    console.error('Error toggling wishlist:', err)
    return { success: false, message: err.message || 'Failed to update wishlist' }
  }
}

/**
 * Bulk add multiple products to wishlist
 */
export async function bulkAddToWishlistAction(productIds: string[], userId?: string): Promise<WishlistResult> {
  if (!productIds || productIds.length === 0) {
    return { success: false, message: 'No products provided' }
  }

  if (!userId) {
    return { success: true, message: 'Added to local wishlist' }
  }

  try {
    const supabase = getAdminClient()
    const rows = productIds.map((id) => ({
      user_id: userId,
      product_id: id,
    }))

    // Upsert or ignore duplicates
    await supabase.from('wishlists').upsert(rows, { onConflict: 'user_id,product_id', ignoreDuplicates: true })
    revalidatePath('/wishlist')
    return { success: true, message: `Added ${productIds.length} items to wishlist` }
  } catch (err: any) {
    console.error('Error in bulkAddToWishlistAction:', err)
    return { success: false, message: err.message || 'Failed bulk add' }
  }
}

/**
 * Bulk remove multiple products from wishlist
 */
export async function bulkRemoveFromWishlistAction(productIds: string[], userId?: string): Promise<WishlistResult> {
  if (!productIds || productIds.length === 0) {
    return { success: false, message: 'No products provided' }
  }

  if (!userId) {
    return { success: true, message: 'Removed from local wishlist' }
  }

  try {
    const supabase = getAdminClient()
    await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', userId)
      .in('product_id', productIds)

    revalidatePath('/wishlist')
    return { success: true, message: `Removed ${productIds.length} items from wishlist` }
  } catch (err: any) {
    console.error('Error in bulkRemoveFromWishlistAction:', err)
    return { success: false, message: err.message || 'Failed bulk remove' }
  }
}
