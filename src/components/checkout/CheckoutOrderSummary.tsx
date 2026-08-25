'use client'

import React, { useRef, useEffect } from 'react'
import Link from 'next/link'
import { Tag, CheckCircle2 } from 'lucide-react'

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
  onCheckout: () => void
  loading: boolean
  paymentStatus: string
  formatPrice: (inr?: number, usd?: number) => string
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
  onCheckout,
  loading,
  paymentStatus,
  formatPrice,
}: CheckoutOrderSummaryProps) {
  const subtotalRef = useAnimatedCounter(currentSubtotal, currencySymbol)
  const totalRef = useAnimatedCounter(finalTotal, currencySymbol)

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
            {formatPrice(rawSubtotalInr, rawSubtotalUsd)}
          </span>
        </div>

        {bundleDiscountPercent > 0 && (
          <div className="flex justify-between text-zinc-300">
            <span>Bundle Discount (10%)</span>
            <span>
              -{currencySymbol}
              {(currentSubtotal * 0.1).toFixed(2)}
            </span>
          </div>
        )}

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
            className="px-3.5 h-9 bg-[#202020] hover:bg-[#282828] text-white border border-[#2e2e2e] rounded-lg text-xs font-medium transition-colors disabled:opacity-40 cursor-pointer"
          >
            {couponLoading ? '...' : 'Apply'}
          </button>
        </div>

        {couponError && (
          <p className="text-[10px] text-red-400">{couponError}</p>
        )}
        {couponSuccessMsg && (
          <p className="text-[10px] text-zinc-300 flex items-center gap-1">
            <CheckCircle2 size={11} className="text-white" /> {couponSuccessMsg}
          </p>
        )}
      </div>

      {/* Checkout Action Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onCheckout}
          disabled={loading || paymentStatus === 'processing'}
          className="w-full h-11 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-colors active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </div>
          ) : finalTotal === 0 ? (
            <span>Claim Free Download</span>
          ) : (
            <span>
              Pay {currencySymbol}{finalTotal.toFixed(2)}
            </span>
          )}
        </button>

        <p className="text-[10px] text-zinc-500 text-center mt-2.5">
          Secure payment &bull; Instant delivery to your vault &bull;{' '}
          <Link href="/terms" className="text-zinc-400 hover:underline">
            Terms
          </Link>
        </p>
      </div>
    </div>
  )
}
