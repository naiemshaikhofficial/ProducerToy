'use server'

interface CouponResult {
  success: boolean
  discountPercent: number
  code: string
  message: string
}

const VALID_COUPONS: Record<string, number> = {
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

  const discount = VALID_COUPONS[cleanCode]

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
