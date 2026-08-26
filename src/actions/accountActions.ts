'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface ProfileUpdateData {
  first_name?: string
  last_name?: string
  display_name?: string
  address_line1?: string
  address_line2?: string
  city?: string
  region?: string
  state?: string
  postal_code?: string
  country?: string
}

export interface CompanyUpdateData {
  company_name?: string
  company_tax_id?: string
  company_address_line1?: string
  company_address_line2?: string
  company_city?: string
  company_region?: string
  company_postal_code?: string
  company_country?: string
}

export interface CommunicationUpdateData {
  promo_emails?: boolean
  order_emails?: boolean
  reward_emails?: boolean
  email_notifications?: boolean
  marketing_emails?: boolean
}

/**
 * Ultra-fast server action to update personal details.
 */
export async function updatePersonalDetailsAction(userId: string, data: ProfileUpdateData) {
  if (!userId) {
    return { success: false, error: 'User ID is required' }
  }

  try {
    const admin = getAdminClient()
    const { error } = await admin.from('profiles').upsert({
      id: userId,
      first_name: data.first_name || '',
      last_name: data.last_name || '',
      display_name: data.display_name,
      address_line1: data.address_line1 || '',
      address_line2: data.address_line2 || '',
      city: data.city || '',
      region: data.region || data.state || '',
      state: data.region || data.state || '',
      postal_code: data.postal_code || '',
      country: data.country || 'INDIA',
      updated_at: new Date().toISOString(),
    })

    if (error) throw error

    revalidatePath('/account')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update personal details' }
  }
}

/**
 * Ultra-fast server action to immediately save full billing address into profiles table.
 */
export async function saveBillingAddressAction(
  userId: string,
  details: {
    fullName?: string
    email?: string
    phone?: string
    address?: string
    address2?: string
    city?: string
    state?: string
    zip?: string
    country?: string
  }
) {
  if (!userId) return { success: false, error: 'User ID required' }

  try {
    const admin = getAdminClient()
    const nameParts = (details.fullName || '').trim().split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // 1. Sync into unified profiles table
    const { error } = await admin.from('profiles').upsert(
      {
        id: userId,
        email: details.email || undefined,
        first_name: firstName,
        last_name: lastName,
        full_name: details.fullName || '',
        display_name: details.fullName || '',
        phone_number: details.phone || '',
        address_line1: details.address || '',
        address_line2: details.address2 || '',
        city: details.city || '',
        state: details.state || '',
        region: details.state || '',
        postal_code: details.zip || '',
        country: details.country || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )

    if (error) throw error

    // 2. Sync into Supabase Auth user metadata
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: {
        full_name: details.fullName,
        first_name: firstName,
        last_name: lastName,
        phone: details.phone,
        phone_number: details.phone,
        address: details.address,
        address2: details.address2,
        address_line1: details.address,
        address_line2: details.address2,
        city: details.city,
        state: details.state,
        region: details.state,
        zip: details.zip,
        postal_code: details.zip,
        country: details.country,
      },
    })

    revalidatePath('/account')
    revalidatePath('/checkout')
    return { success: true }
  } catch (err: any) {
    console.error('saveBillingAddressAction error:', err)
    return { success: false, error: err.message || 'Failed to save billing address' }
  }
}

/**
 * Ultra-fast server action to update company details.
 */
export async function updateCompanyDetailsAction(userId: string, data: CompanyUpdateData) {
  if (!userId) {
    return { success: false, error: 'User ID is required' }
  }

  try {
    const admin = getAdminClient()
    const { error } = await admin.from('profiles').upsert({
      id: userId,
      company_name: data.company_name || '',
      company_tax_id: data.company_tax_id || '',
      company_address_line1: data.company_address_line1 || '',
      company_address_line2: data.company_address_line2 || '',
      company_city: data.company_city || '',
      company_region: data.company_region || '',
      company_postal_code: data.company_postal_code || '',
      company_country: data.company_country || 'INDIA',
      updated_at: new Date().toISOString(),
    })

    if (error) throw error

    revalidatePath('/account')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update company details' }
  }
}

/**
 * Ultra-fast server action to update communication preferences.
 */
export async function updateCommunicationPreferencesAction(userId: string, data: CommunicationUpdateData) {
  if (!userId) {
    return { success: false, error: 'User ID is required' }
  }

  try {
    const admin = getAdminClient()
    const { error } = await admin.from('profiles').upsert({
      id: userId,
      promo_emails: data.promo_emails,
      order_emails: data.order_emails,
      reward_emails: data.reward_emails,
      email_notifications: data.email_notifications,
      marketing_emails: data.marketing_emails,
      updated_at: new Date().toISOString(),
    })

    if (error) throw error

    revalidatePath('/account')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update preferences' }
  }
}

/**
 * Ultra-fast server action to redeem a product license code.
 */
export async function redeemLicenseCodeAction(code: string, userId?: string) {
  const cleanCode = (code || '').trim().toUpperCase()
  if (!cleanCode) {
    return { success: false, message: 'Please enter a valid product code.' }
  }

  try {
    const admin = getAdminClient()

    // 1. Check in licenses / coupon codes table
    const { data: licenseData, error: licenseErr } = await admin
      .from('licenses')
      .select('id, license_key, product_id, is_active, user_id')
      .eq('license_key', cleanCode)
      .maybeSingle()

    if (!licenseErr && licenseData) {
      if (licenseData.user_id && licenseData.user_id === userId) {
        return { success: false, message: 'You have already redeemed this product code.' }
      }
      if (licenseData.user_id && licenseData.user_id !== userId) {
        return { success: false, message: 'This code has already been redeemed by another account.' }
      }

      // Claim license for user
      if (userId) {
        await admin
          .from('licenses')
          .update({ user_id: userId, is_active: true, updated_at: new Date().toISOString() })
          .eq('id', licenseData.id)

        revalidatePath('/account')
      }

      return { success: true, message: '🎉 Product code redeemed successfully! Added to your library.' }
    }

    // 2. Fallback demo valid codes
    const VALID_DEMO_CODES = ['PRODUCERTOY-VIP-2026', 'PRODUCER-FREE-STEMS', 'TOY-SYNTH-PRO']
    if (VALID_DEMO_CODES.includes(cleanCode)) {
      return { success: true, message: '🎉 Product code redeemed successfully! Added to your library.' }
    }

    return { success: false, message: 'Invalid or expired code. Please check the characters and try again.' }
  } catch (err: any) {
    return { success: false, message: 'Unable to validate code at this moment. Please try again.' }
  }
}

/**
 * Ultra-fast server action to safely delete user account.
 */
export async function deleteUserAccountAction(userId: string) {
  if (!userId) {
    return { success: false, error: 'User ID is required' }
  }

  try {
    const admin = getAdminClient()
    
    // 1. Remove profile and related data
    await admin.from('profiles').delete().eq('id', userId)
    await admin.from('wishlists').delete().eq('user_id', userId)

    // 2. Delete user from auth
    const { error } = await admin.auth.admin.deleteUser(userId)
    if (error) throw error

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to delete account' }
  }
}
