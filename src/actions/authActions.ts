'use server'

import { getAdminClient } from '@/lib/supabase/admin'

export interface UserStatusResult {
  exists: boolean
  isConfirmed: boolean
}

/**
 * Ultra-fast server action to check if an account exists and whether email is confirmed.
 * Uses indexed direct DB lookups for sub-50ms response times.
 */
export async function checkUserStatusAction(email: string): Promise<UserStatusResult> {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return { exists: false, isConfirmed: false }
  }

  const cleanEmail = email.trim().toLowerCase()
  const admin = getAdminClient()

  try {
    // 1. Lightning fast single-row DB query on profiles
    const { data: prof } = await admin
      .from('profiles')
      .select('id, email')
      .ilike('email', cleanEmail)
      .limit(1)
      .maybeSingle()

    if (prof) {
      return { exists: true, isConfirmed: true }
    }

    // 2. Fallback: Quick batch list for non-profile users
    const { data: listData, error } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 100,
    })

    if (!error && listData?.users) {
      const matched = (listData.users as any[]).find(
        (u: any) => u.email?.toLowerCase() === cleanEmail
      )

      if (matched) {
        const isConfirmed = Boolean(matched.email_confirmed_at || matched.confirmed_at)
        return { exists: true, isConfirmed }
      }
    }

    return { exists: false, isConfirmed: false }
  } catch (err) {
    console.warn('checkUserStatusAction note:', err)
    return { exists: false, isConfirmed: false }
  }
}

/**
 * Validates Cloudflare Turnstile token on the server
 */
export async function validateTurnstileAction(token: string): Promise<{ success: boolean; error?: string }> {
  const { verifyTurnstileToken } = await import('@/lib/turnstile')
  const isValid = await verifyTurnstileToken(token)
  if (!isValid) {
    return { success: false, error: 'Security verification failed. Please try again.' }
  }
  return { success: true }
}

