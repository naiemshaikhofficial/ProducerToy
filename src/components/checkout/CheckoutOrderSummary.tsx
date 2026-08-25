'use client'

import React, { useRef, useEffect } from 'react'
import Link from 'next/link'
import { Tag, Zap, CheckCircle2, Percent } from 'lucide-react'

// --- ANIMATED COUNTER HOOK ---
function useAnimatedCounter(targetValue: number, prefix: string = '') {
  const ref = useRef<HTMLElement>(null)
  const prevValueRef = useRef(targetValue)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    const startValue = prevValueRef.current
    const duration = 350
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
    <div className="bg-[#181818] border border-[#282828] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl">
      <div className="flex items-center justify-between border-b border-[#282828] pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-4 bg-[#FC6301] rounded-sm" />
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
            Order Summary
          </h3>
        </div>
        <span className="text-xs text-zinc-400 font-medium">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Price Calculation Breakdown */}
      <div className="space-y-3 text-xs">
        <div className="flex justify-between text-zinc-400">
          <span>Subtotal</span>
          <span ref={subtotalRef} className="font-semibold text-zinc-200">
            {formatPrice(rawSubtotalInr, rawSubtotalUsd)}
          </span>
        </div>

        {bundleDiscountPercent > 0 && (
          <div className="flex justify-between text-emerald-400 font-bold">
            <span className="flex items-center gap-1">
              <Percent size={12} /> Bundle Discount (10%)
            </span>
            <span>
              -{currencySymbol}
              {(currentSubtotal * 0.1).toFixed(2)}
            </span>
          </div>
        )}

        {discountPercent > 0 && (
          <div className="flex justify-between text-[#FC6301] font-bold">
            <span className="flex items-center gap-1">
              <Tag size={12} /> Coupon ({discountPercent}%)
            </span>
            <span>
              -{currencySymbol}
              {((currentSubtotal * discountPercent) / 100).toFixed(2)}
            </span>
          </div>
        )}

        <div className="pt-3 border-t border-[#282828] flex justify-between items-end">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">
              Total Due
            </span>
            <span className="text-[10px] text-zinc-500">Includes all digital licenses</span>
          </div>
          <span ref={totalRef} className="text-2xl sm:text-3xl font-extrabold text-white">
            {currencySymbol}
            {finalTotal.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Coupon Code Input */}
      <div className="space-y-2 pt-2 border-t border-[#282828]">
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
            <input
              type="text"
              placeholder="COUPON CODE (e.g. PRODUCER10)"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              className="w-full h-10 bg-[#202020] border border-[#333333] pl-9 pr-3 text-xs font-bold uppercase tracking-wider text-white rounded-xl focus:border-[#FC6301] outline-none transition-all placeholder:text-zinc-600"
            />
          </div>
          <button
            type="button"
            onClick={onApplyCoupon}
            disabled={couponLoading || !coupon.trim()}
            className="px-4 bg-[#282828] hover:bg-[#333333] text-white border border-[#383838] rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
          >
            {couponLoading ? '...' : 'Apply'}
          </button>
        </div>

        {couponError && (
          <p className="text-[10px] font-semibold text-red-400">{couponError}</p>
        )}
        {couponSuccessMsg && (
          <p className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={12} /> {couponSuccessMsg}
          </p>
        )}
      </div>

      {/* Pay Now Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onCheckout}
          disabled={loading || paymentStatus === 'processing'}
          className="w-full bg-[#FC6301] hover:bg-[#E05800] text-white font-extrabold text-xs sm:text-sm py-4 px-6 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-[#FC6301]/25 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Authorizing Order...</span>
            </div>
          ) : finalTotal === 0 ? (
            <>
              <CheckCircle2 size={16} />
              <span>Claim Free Download (Instant Access)</span>
            </>
          ) : (
            <>
              <Zap size={16} className="text-white fill-white" />
              <span>
                Pay Now &bull; {currencySymbol}
                {finalTotal.toFixed(2)}
              </span>
            </>
          )}
        </button>

        <p className="text-[10px] text-zinc-500 text-center mt-3 leading-relaxed">
          By clicking Pay Now, you agree to our{' '}
          <Link href="/terms" className="text-zinc-400 hover:text-white underline">
            Terms
          </Link>
          ,{' '}
          <Link href="/refund-policy" className="text-zinc-400 hover:text-white underline">
            Refund Policy
          </Link>{' '}
          &amp;{' '}
          <Link href="/privacy" className="text-zinc-400 hover:text-white underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
