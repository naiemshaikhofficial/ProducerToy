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
      .select('code, discount_percent, is_active, expires_at, discount_type, discount_amount_usd, max_redemptions, times_redeemed, product_id')
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

      if (dbCoupon.max_redemptions && (dbCoupon.times_redeemed || 0) >= dbCoupon.max_redemptions) {
        return {
          success: false,
          discountPercent: 0,
          code: cleanCode,
          message: 'This coupon has reached its maximum redemption limit.',
        }
      }

      const isFixed = dbCoupon.discount_type === 'fixed'
      const label = isFixed
        ? `$${Number(dbCoupon.discount_amount_usd || 0).toFixed(2)} OFF`
        : `${dbCoupon.discount_percent}% OFF`

      return {
        success: true,
        discountPercent: Number(dbCoupon.discount_percent) || 0,
        code: dbCoupon.code,
        message: `🎉 Coupon applied! ${label}`,
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
