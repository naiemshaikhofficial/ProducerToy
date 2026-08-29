'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ProductRatingStats {
  averageRating: number
  totalReviews: number
  userRating?: number
  userCanRate: boolean
}

/**
 * Fetch average rating, total ratings, and logged in user rating for a product
 */
export async function getProductRatingStatsAction(productId: string): Promise<ProductRatingStats> {
  try {
    const adminSupabase = getAdminClient()

    // 1. Fetch all real reviews for this product using admin client (static-safe)
    const { data: reviews, error } = await adminSupabase
      .from('product_reviews')
      .select('rating, user_id')
      .eq('product_id', productId)

    if (error) {
      console.error('Error fetching product reviews:', error)
    }

    const reviewList = reviews || []
    const totalReviews = reviewList.length

    let userRating: number | undefined = undefined
    let currentUser: any = null

    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      currentUser = user
    } catch {
      // Safe fallback during SSG / static prerender
    }

    if (currentUser) {
      const existing = reviewList.find((r) => r.user_id === currentUser.id)
      if (existing) {
        userRating = Number(existing.rating)
      }
    }

    // Exact real average calculation from database
    let averageRating = 0
    if (totalReviews > 0) {
      const sum = reviewList.reduce((acc, r) => acc + Number(r.rating || 5), 0)
      averageRating = Math.round((sum / totalReviews) * 10) / 10
    }

    return {
      averageRating,
      totalReviews,
      userRating,
      userCanRate: Boolean(currentUser),
    }
  } catch (err) {
    console.error('Error in getProductRatingStatsAction:', err)
    return {
      averageRating: 0,
      totalReviews: 0,
      userCanRate: false,
    }
  }
}

/**
 * Submit or update user's rating for a product
 */
export async function submitProductRatingAction({
  productId,
  productSlug,
  rating,
  reviewText = '',
}: {
  productId: string
  productSlug: string
  rating: number
  reviewText?: string
}): Promise<{ success: boolean; message?: string; stats?: ProductRatingStats }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: 'Please sign in to rate this product.' }
    }

    // Validate rating value (1 to 5)
    const cleanRating = Math.max(1, Math.min(5, Math.round(rating)))

    // Upsert review record using authenticated client (passes RLS auth.uid() = user_id)
    const { error: upsertError } = await supabase
      .from('product_reviews')
      .upsert(
        {
          product_id: productId,
          user_id: user.id,
          rating: cleanRating,
          review_text: reviewText.trim() || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'product_id,user_id' }
      )

    if (upsertError) {
      console.error('Failed to save rating:', upsertError)
      return { success: false, message: `Failed to save rating: ${upsertError.message}` }
    }

    // Revalidate product page cache
    if (productSlug) {
      revalidatePath(`/product/${productSlug}`)
    }

    const updatedStats = await getProductRatingStatsAction(productId)

    return {
      success: true,
      message: 'Rating saved successfully!',
      stats: updatedStats,
    }
  } catch (err: any) {
    console.error('Error submitting rating:', err)
    return { success: false, message: err.message || 'An unexpected error occurred.' }
  }
}
