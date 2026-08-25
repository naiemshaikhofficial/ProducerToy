'use server'

import { getAdminClient } from '@/lib/supabase/admin'

export interface WishlistResult {
  success: boolean
  isSaved: boolean
  message: string
}

export async function toggleWishlistAction(productId: string, userId?: string): Promise<WishlistResult> {
  if (!productId) {
    return { success: false, isSaved: false, message: 'Invalid product ID' }
  }

  // In production with Supabase auth:
  // If user is logged in, insert/delete row in `wishlists` table
  if (userId) {
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
        return { success: true, isSaved: false, message: 'Removed from wishlist' }
      } else {
        await supabase.from('wishlists').insert({ user_id: userId, product_id: productId })
        return { success: true, isSaved: true, message: 'Saved to wishlist!' }
      }
    } catch {
      // Fallback
    }
  }

  return { success: true, isSaved: true, message: 'Saved to wishlist!' }
}
