'use client'

import React, { useRef, useEffect } from 'react'
import Link from 'next/link'
import { Tag, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react'
import { PayPalPaymentButton } from './PayPalPaymentButton'
import { BillingDetails } from './types'
import { ButtonSpinner } from '@/components/ui/ButtonSpinner'
import { PaymentAccepted } from '@/components/ui/PaymentAccepted'

// --- ANIMATED COUNTER HOOK ---
function useAnimatedCounter(targetValue: number, prefix: string = '') {
  const ref = useRef<HTMLElement>(null)
  const prevValueRef = useRef(targetValue)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const startValue = prevValueRef.current
    const duration = 300
    let startTime: number | null = null

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const currentValue = startValue + (targetValue - startValue) * progress

      if (ref.current) {
        ref.current.textContent = `${prefix}${currentValue.toFixed(2)}`
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate)
      } else {
        prevValueRef.current = targetValue
      }
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [targetValue, prefix])

  return ref
}

interface CheckoutOrderSummaryProps {
  itemCount: number
  currentSubtotal: number
  rawSubtotalInr: number
  rawSubtotalUsd: number
  bundleDiscountPercent: number
  discountPercent: number
  finalTotal: number
  currencySymbol: string
  coupon: string
  setCoupon: (val: string) => void
  onApplyCoupon: () => void
  couponLoading: boolean
  couponError: string
  couponSuccessMsg: string
  onRazorpayCheckout: () => void
  onFreeCheckout: () => void
  onPayPalSuccess: (orderNumber: string) => void
  onPayPalError: (err: string) => void
  onPayPalProcessing: () => void
  loading: boolean
  paymentStatus: string
  formatPrice: (inr?: number, usd?: number) => string
  isIndia: boolean
  billingDetails: BillingDetails
  items: any[]
  userId?: string
}

export function CheckoutOrderSummary({
  itemCount,
  currentSubtotal,
  rawSubtotalInr,
  rawSubtotalUsd,
  bundleDiscountPercent,
  discountPercent,
  finalTotal,
  currencySymbol,
  coupon,
  setCoupon,
  onApplyCoupon,
  couponLoading,
  couponError,
  couponSuccessMsg,
  onRazorpayCheckout,
  onFreeCheckout,
  onPayPalSuccess,
  onPayPalError,
  onPayPalProcessing,
  loading,
  paymentStatus,
  formatPrice,
  isIndia,
  billingDetails,
  items,
  userId,
}: CheckoutOrderSummaryProps) {
  const subtotalRef = useAnimatedCounter(currentSubtotal, currencySymbol)
  const totalRef = useAnimatedCounter(finalTotal, currencySymbol)

  const isFree = finalTotal === 0

  return (
    <div className="bg-[#141414] border border-[#222222] rounded-xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-[#222222] pb-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
          Summary
        </h3>
        <span className="text-[11px] text-zinc-500">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Pricing Lines */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between text-zinc-400">
          <span>Subtotal</span>
          <span ref={subtotalRef} className="font-medium text-zinc-200">
            {formatPrice(undefined, rawSubtotalUsd)}
          </span>
        </div>



        {discountPercent > 0 && (
          <div className="flex justify-between text-zinc-300">
            <span>Coupon ({discountPercent}%)</span>
            <span>
              -{currencySymbol}
              {((currentSubtotal * discountPercent) / 100).toFixed(2)}
            </span>
          </div>
        )}

        <div className="pt-3 border-t border-[#222222] flex justify-between items-center">
          <span className="text-xs font-medium text-zinc-300">Total</span>
          <span ref={totalRef} className="text-xl font-bold text-white">
            {currencySymbol}
            {finalTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Coupon Code Input */}
      <div className="space-y-1.5 pt-2 border-t border-[#222222]">
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={13} />
            <input
              type="text"
              placeholder="Promo code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              className="w-full h-9 bg-[#181818] border border-[#262626] pl-8 pr-3 text-xs uppercase font-medium text-white rounded-lg focus:border-zinc-400 outline-none placeholder:text-zinc-600 transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={onApplyCoupon}
            disabled={couponLoading || !coupon.trim()}
            className="px-3.5 h-9 bg-[#202020] hover:bg-[#282828] text-white border border-[#2e2e2e] rounded-lg text-xs font-medium transition-colors disabled:opacity-40 cursor-pointer flex items-center justify-center min-w-[54px]"
          >
            {couponLoading ? <ButtonSpinner size={14} variant="light" /> : 'Apply'}
          </button>
        </div>

        {couponError && (
          <div className="bg-[#ff4053] text-black font-extrabold px-3 py-2 rounded-xl text-[11px] flex items-center gap-1.5 shadow-sm">
            <AlertCircle size={13} className="text-black flex-shrink-0" />
            <span>{couponError}</span>
          </div>
        )}
        {couponSuccessMsg && (
          <div className="bg-[#00df81] text-black font-extrabold px-3 py-2 rounded-xl text-[11px] flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 size={13} className="text-black flex-shrink-0" />
            <span>{couponSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Payment Gateway Actions */}
      <div className="pt-2 space-y-2">
        {/* Gateway Identifier Tag */}
        <div className="flex items-center justify-between text-[11px] text-zinc-400 px-0.5">
          <span className="font-medium">Payment Method</span>
          <span className="text-zinc-300 font-semibold">
            {isFree
              ? 'Instant Free Access'
              : isIndia
              ? 'Razorpay (UPI / Cards / NetBanking)'
              : 'PayPal (Global / USD)'}
          </span>
        </div>

        {isFree ? (
          /* Free Instant Activation Button */
          <button
            type="button"
            onClick={onFreeCheckout}
            disabled={loading || paymentStatus === 'processing'}
            className="w-full h-11 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-colors active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <ButtonSpinner size={16} variant="dark" />
                <span>Claiming License...</span>
              </div>
            ) : (
              <span>Claim Free Download</span>
            )}
          </button>
        ) : isIndia ? (
          /* Razorpay Gateway Button (for India / INR) */
          <button
            type="button"
            onClick={onRazorpayCheckout}
            disabled={loading || paymentStatus === 'processing'}
            className="w-full h-11 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-colors active:scale-[0.99] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <ButtonSpinner size={16} variant="dark" />
                <span>Opening Payment Gateway...</span>
              </div>
            ) : (
              <span>
                Pay {currencySymbol}{finalTotal.toFixed(2)} with UPI / Cards
              </span>
            )}
          </button>
        ) : (
          /* PayPal Gateway Buttons (for International / USD) */
          userId ? (
            <PayPalPaymentButton
              finalTotalUsd={finalTotal}
              items={items}
              couponCode={coupon}
              userId={userId}
              billingDetails={billingDetails}
              onSuccess={onPayPalSuccess}
              onError={onPayPalError}
              onProcessing={onPayPalProcessing}
            />
          ) : (
            <button
              type="button"
              onClick={onRazorpayCheckout}
              className="w-full h-11 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-lg uppercase tracking-wider transition-colors"
            >
              Sign In to Pay with PayPal
            </button>
          )
        )}

        <p className="text-[10px] text-zinc-500 text-center mt-2">
          Encrypted 256-bit SSL • Instant vault delivery •{' '}
          <Link href="/terms" className="text-zinc-400 hover:underline">
            Terms
          </Link>
        </p>

        {/* Accepted Payment Methods Vector Logos */}
        <div className="pt-3 border-t border-[#222222]/80 mt-3 space-y-2">
          <p className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider text-center select-none">
            We Accept Domestic &amp; Global Payments
          </p>
          <PaymentAccepted variant="compact" />
        </div>
      </div>
    </div>
  )
}
