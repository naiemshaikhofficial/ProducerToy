'use server'

import { getAdminClient } from '@/lib/supabase/admin'

interface CouponResult {
  success: boolean
  discountPercent: number
  code: string
  message: string
}

const FALLBACK_COUPONS: Record<string, number> = {
  PRODUCER10: 10,
  TOY20: 20,
  EPIC30: 30,
  BEATMAKER50: 50,
}

export async function validateCouponAction(code: string): Promise<CouponResult> {
  const cleanCode = (code || '').trim().toUpperCase()

  if (!cleanCode) {
    return { success: false, discountPercent: 0, code: '', message: 'Please enter a coupon code.' }
  }

  // 1. Try querying Supabase coupons table
  try {
    const adminSupabase = getAdminClient()
    const { data: dbCoupon } = await adminSupabase
      .from('coupons')
      .select('code, discount_percent, is_active, expires_at')
      .eq('code', cleanCode)
      .eq('is_active', true)
      .maybeSingle()

    if (dbCoupon) {
      if (dbCoupon.expires_at && new Date(dbCoupon.expires_at) < new Date()) {
        return {
          success: false,
          discountPercent: 0,
          code: cleanCode,
          message: 'This coupon code has expired.',
        }
      }

      return {
        success: true,
        discountPercent: Number(dbCoupon.discount_percent),
        code: dbCoupon.code,
        message: `🎉 Coupon applied! ${dbCoupon.discount_percent}% OFF`,
      }
    }
  } catch (err) {
    console.warn('Coupon DB lookup note:', err)
  }

  // 2. Fallback to hardcoded coupons
  const discount = FALLBACK_COUPONS[cleanCode]

  if (discount) {
    return {
      success: true,
      discountPercent: discount,
      code: cleanCode,
      message: `🎉 Coupon applied! ${discount}% OFF`,
    }
  }

  return {
    success: false,
    discountPercent: 0,
    code: cleanCode,
    message: 'Invalid or expired coupon code.',
  }
}
