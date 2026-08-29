'use server'

import { createClient } from '@/lib/supabase/server'
import { getAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

export interface GiftRecord {
  id: string
  product_id: string
  product_name?: string
  product_slug?: string
  cover_image?: string
  sender_id?: string
  sender_email: string
  sender_name?: string
  recipient_id?: string
  recipient_email: string
  message?: string
  claim_code: string
  status: 'unopened' | 'claimed' | 'rejected'
  price_usd?: number
  price_inr?: number
  rejection_reason?: string
  created_at: string
  claimed_at?: string
  rejected_at?: string
  product?: any
}

/**
 * Validate whether a sender can gift a specific product to a recipient email.
 * Rule:
 * 1. Cannot gift to recipient if recipient already owns the product.
 * 2. Cannot gift to recipient if an active/unopened or claimed gift already exists from sender.
 * 3. CAN gift if previous gift was 'rejected'.
 */
export async function validateGiftEligibilityAction({
  productId,
  recipientEmail,
  senderEmail,
}: {
  productId: string
  recipientEmail: string
  senderEmail?: string
}): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const adminSupabase = getAdminClient()
    const cleanRecipient = recipientEmail.trim().toLowerCase()
    const cleanSender = (senderEmail || '').trim().toLowerCase()

    if (!cleanRecipient) {
      return { allowed: false, reason: 'Please enter a valid recipient email address.' }
    }

    if (cleanSender && cleanRecipient === cleanSender) {
      return { allowed: false, reason: 'You cannot gift a product to your own account.' }
    }

    // 1. Check if recipient already owns the product in purchases
    const { data: existingPurchases } = await adminSupabase
      .from('purchases')
      .select('id, user_id, customer_email')
      .eq('product_id', productId)
      .ilike('customer_email', cleanRecipient)
      .limit(1)

    if (existingPurchases && existingPurchases.length > 0) {
      return {
        allowed: false,
        reason: `${cleanRecipient} already owns this product in their library.`,
      }
    }

    // Also check if recipient registered user ID owns it
    try {
      const { data: usersData } = await adminSupabase.auth.admin.listUsers()
      const recipientUser = usersData?.users?.find(
        (u: any) => u.email?.toLowerCase() === cleanRecipient
      )
      if (recipientUser) {
        const { data: userPurchases } = await adminSupabase
          .from('purchases')
          .select('id')
          .eq('product_id', productId)
          .eq('user_id', recipientUser.id)
          .limit(1)

        if (userPurchases && userPurchases.length > 0) {
          return {
            allowed: false,
            reason: `${cleanRecipient} already owns this product in their library.`,
          }
        }
      }
    } catch (e) {
      console.warn('Recipient check warning:', e)
    }

    // 2. Check if an active/unopened or claimed gift already exists
    const { data: existingGifts } = await adminSupabase
      .from('gifts')
      .select('id, status')
      .eq('product_id', productId)
      .ilike('recipient_email', cleanRecipient)
      .in('status', ['unopened', 'claimed'])
      .limit(1)

    if (existingGifts && existingGifts.length > 0) {
      const gift = existingGifts[0]
      if (gift.status === 'unopened') {
        return {
          allowed: false,
          reason: `${cleanRecipient} already has an unopened gift for this product waiting in their account. Once they claim or reject it, you can send another.`,
        }
      } else if (gift.status === 'claimed') {
        return {
          allowed: false,
          reason: `${cleanRecipient} already claimed a gift of this product and has it in their library.`,
        }
      }
    }

    // If status is 'rejected' or no previous gift exists, it is allowed!
    return { allowed: true }
  } catch (err: any) {
    console.error('Error validating gift eligibility:', err)
    return { allowed: true } // Fallback to avoid blocking on network error
  }
}

/**
 * Fetch all gifts for current user (both sent and received) from Supabase.
 */
export async function getUserGiftsAction(): Promise<{
  success: boolean
  gifts: GiftRecord[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, gifts: [], error: 'Not authenticated' }
    }

    const adminSupabase = getAdminClient()
    const userEmail = (user.email || '').toLowerCase()

    // Fetch gifts where user is sender or recipient (by ID or email)
    const { data: giftsData, error } = await adminSupabase
      .from('gifts')
      .select('*, product:products(*)')
      .or(
        `sender_id.eq.${user.id},recipient_id.eq.${user.id},sender_email.ilike.${userEmail},recipient_email.ilike.${userEmail}`
      )
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching gifts:', error)
      return { success: false, gifts: [], error: error.message }
    }

    const formattedGifts: GiftRecord[] = (giftsData || []).map((g: any) => ({
      id: g.id,
      product_id: g.product_id,
      product_name: g.product?.name || 'Audio Product',
      product_slug: g.product?.slug || '',
      cover_image: g.product?.cover_image || '',
      sender_id: g.sender_id,
      sender_email: g.sender_email,
      sender_name: g.sender_name || g.sender_email?.split('@')[0] || 'Producer',
      recipient_id: g.recipient_id,
      recipient_email: g.recipient_email,
      message: g.message || 'Enjoy the gift!',
      claim_code: g.claim_code,
      status: g.status as any,
      price_usd: Number(g.price_usd || g.product?.price_usd || 0),
      price_inr: Number(g.price_inr || g.product?.price_inr || 0),
      rejection_reason: g.rejection_reason,
      created_at: g.created_at,
      claimed_at: g.claimed_at,
      rejected_at: g.rejected_at,
      product: g.product,
    }))

    return { success: true, gifts: formattedGifts }
  } catch (err: any) {
    console.error('Error in getUserGiftsAction:', err)
    return { success: false, gifts: [], error: err.message }
  }
}

/**
 * Claim a gift and add the product to recipient's library.
 */
export async function claimUserGiftAction(giftId: string): Promise<{
  success: boolean
  error?: string
  productSlug?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Please log in to claim this gift.' }
    }

    const adminSupabase = getAdminClient()
    const userEmail = (user.email || '').toLowerCase()

    // 1. Fetch gift record
    const { data: gift, error: fetchErr } = await adminSupabase
      .from('gifts')
      .select('*, product:products(*)')
      .eq('id', giftId)
      .maybeSingle()

    if (fetchErr || !gift) {
      return { success: false, error: 'Gift not found.' }
    }

    // Verify recipient email or user_id
    if (
      gift.recipient_email?.toLowerCase() !== userEmail &&
      gift.recipient_id !== user.id
    ) {
      return {
        success: false,
        error: `This gift was sent to ${gift.recipient_email}. Please log in with that account to claim it.`,
      }
    }

    if (gift.status === 'claimed') {
      return { success: true, productSlug: gift.product?.slug }
    }

    // 2. Mark gift as claimed
    await adminSupabase
      .from('gifts')
      .update({
        status: 'claimed',
        recipient_id: user.id,
        claimed_at: new Date().toISOString(),
      })
      .eq('id', giftId)

    // 3. Create or attach verified purchase in library
    const { data: existingPurchase } = await adminSupabase
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', gift.product_id)
      .limit(1)
      .maybeSingle()

    if (!existingPurchase) {
      const prod = gift.product
      const requiresSerialKey = Boolean(
        prod?.delivery_method === 'serial_key' ||
        prod?.delivery_method === 'license_key' ||
        (prod?.license_type && prod.license_type.toLowerCase().includes('serial')) ||
        (prod?.license_type && prod.license_type.toLowerCase().includes('key'))
      )

      let serialKey: string | null = null
      if (requiresSerialKey) {
        const partA = crypto.randomBytes(3).toString('hex').toUpperCase()
        const partB = crypto.randomBytes(3).toString('hex').toUpperCase()
        const partC = crypto.randomBytes(3).toString('hex').toUpperCase()
        serialKey = `PT-GIFT-${partA}-${partB}-${partC}`
      }

      await adminSupabase.from('purchases').insert({
        user_id: user.id,
        product_id: gift.product_id,
        amount_paid: 0,
        currency: 'USD',
        serial_key: serialKey,
        customer_email: userEmail,
        customer_name: user.user_metadata?.full_name || 'Gift Recipient',
        purchased_at: new Date().toISOString(),
      })
    }

    revalidatePath('/gifts')
    revalidatePath('/library')
    revalidatePath('/account')

    return { success: true, productSlug: gift.product?.slug }
  } catch (err: any) {
    console.error('Error claiming gift:', err)
    return { success: false, error: err.message || 'Failed to claim gift' }
  }
}

/**
 * Reject / Decline a gift.
 * Allows the sender to send that same product again in the future.
 */
export async function rejectUserGiftAction(
  giftId: string,
  reason = 'Declined by recipient'
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Please log in to decline this gift.' }
    }

    const adminSupabase = getAdminClient()
    const userEmail = (user.email || '').toLowerCase()

    // 1. Fetch gift record
    const { data: gift, error: fetchErr } = await adminSupabase
      .from('gifts')
      .select('*')
      .eq('id', giftId)
      .maybeSingle()

    if (fetchErr || !gift) {
      return { success: false, error: 'Gift not found.' }
    }

    if (
      gift.recipient_email?.toLowerCase() !== userEmail &&
      gift.recipient_id !== user.id
    ) {
      return { success: false, error: 'Unauthorized to decline this gift.' }
    }

    // 2. Mark as rejected
    await adminSupabase
      .from('gifts')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejection_reason: reason,
      })
      .eq('id', giftId)

    revalidatePath('/gifts')
    revalidatePath('/library')

    return { success: true }
  } catch (err: any) {
    console.error('Error rejecting gift:', err)
    return { success: false, error: err.message || 'Failed to decline gift' }
  }
}
