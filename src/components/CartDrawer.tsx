'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, Trash2, ArrowRight, ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import { useAuth } from '@/context/AuthContext'
import { validateCouponAction } from '@/actions/couponActions'

export function CartDrawer() {
  const { items, removeItem, isCartOpen, setIsCartOpen } = useCart()
  const { formatPrice } = useCurrency()
  const { user } = useAuth()
  const [coupon, setCoupon] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [couponError, setCouponError] = useState('')

  if (!isCartOpen) return null

  const rawSubtotalInr = items.reduce((sum, item) => sum + Number(item.price_inr || 0), 0)
  const rawSubtotalUsd = items.reduce((sum, item) => sum + Number(item.price_usd || (item.price_inr / 85)), 0)

  // Bundle Discount: 10% off for 3+ items
  const bundleDiscountInr = items.length >= 3 ? Math.round(rawSubtotalInr * 0.1) : 0
  const bundleDiscountUsd = items.length >= 3 ? (rawSubtotalUsd * 0.1) : 0

  const couponDiscountInr = Math.round((rawSubtotalInr - bundleDiscountInr) * (discountPercent / 100))
  const couponDiscountUsd = (rawSubtotalUsd - bundleDiscountUsd) * (discountPercent / 100)

  const finalTotalInr = Math.max(0, rawSubtotalInr - bundleDiscountInr - couponDiscountInr)
  const finalTotalUsd = Math.max(0, rawSubtotalUsd - bundleDiscountUsd - couponDiscountUsd)

  const applyCoupon = async () => {
    const res = await validateCouponAction(coupon)
    if (res.success) {
      setDiscountPercent(res.discountPercent)
      setCouponError(res.message)
    } else {
      setCouponError(res.message)
      setDiscountPercent(0)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#161616] text-white border-l border-[#262626] flex flex-col justify-between shadow-2xl">
          
          {/* Header */}
          <div className="p-4 bg-[#121212] text-white flex items-center justify-between border-b border-[#262626]">
            <div className="flex items-center gap-2">
              <Image
                src="/icons8-cart-96.png"
                alt="Cart"
                width={18}
                height={18}
                className="w-4.5 h-4.5 object-contain filter brightness-0 invert"
              />
              <span className="font-extrabold text-sm uppercase tracking-wider">
                Your Cart ({items.length})
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 hover:bg-[#202020] rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-20 text-zinc-500">
                <Image
                  src="/icons8-cart-96.png"
                  alt="Cart"
                  width={48}
                  height={48}
                  className="w-12 h-12 mx-auto mb-3 object-contain filter brightness-0 invert opacity-40"
                />
                <p className="text-sm font-bold text-white">Your cart is empty.</p>
                <p className="text-xs text-zinc-400 mt-1">Browse our VST plugins and sample packs.</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#262626] bg-[#202020]"
                >
                  <div className="relative w-12 h-12 bg-[#121212] rounded-lg border border-[#2e2e2e] flex-shrink-0 overflow-hidden">
                    <Image
                      src={item.cover_image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                      {item.brand}
                    </div>
                    <div className="text-xs font-bold text-white truncate">
                      {item.name}
                    </div>
                    <div className="text-xs font-bold text-zinc-300 mt-0.5">
                      {formatPrice(item.price_inr, item.price_usd)}
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-4 border-t border-[#262626] bg-[#121212] space-y-3">
              
              {/* Bundle Discount Banner */}
              {items.length >= 3 && (
                <div className="bg-[#202020] text-white text-[11px] font-bold p-2 text-center rounded-lg border border-[#2e2e2e]">
                  🎉 10% Bundle Discount Applied!
                </div>
              )}

              {/* Coupon Box */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code (e.g. PRODUCER10)"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-[#202020] border border-[#2e2e2e] rounded-lg text-white uppercase placeholder-zinc-500 focus:outline-none"
                />
                <button
                  onClick={applyCoupon}
                  className="bg-white hover:bg-zinc-200 text-black text-xs font-bold px-4 rounded-lg transition-colors"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="text-[11px] text-zinc-400 font-medium">{couponError}</p>}

              {/* Price Calculation */}
              <div className="space-y-1.5 text-xs border-t border-[#262626] pt-3">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(rawSubtotalInr, rawSubtotalUsd)}</span>
                </div>
                {bundleDiscountInr > 0 && (
                  <div className="flex justify-between text-white font-bold">
                    <span>Bundle Discount (10%)</span>
                    <span>-{formatPrice(bundleDiscountInr, bundleDiscountUsd)}</span>
                  </div>
                )}
                {discountPercent > 0 && (
                  <div className="flex justify-between text-white font-bold">
                    <span>Coupon ({discountPercent}%)</span>
                    <span>-{formatPrice(couponDiscountInr, couponDiscountUsd)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-white border-t border-[#262626] pt-2">
                  <span>Total</span>
                  <span>{formatPrice(finalTotalInr, finalTotalUsd)}</span>
                </div>
              </div>

              {/* Checkout Link */}
              <Link
                href={user ? '/checkout' : '/auth?next=/checkout'}
                onClick={() => setIsCartOpen(false)}
                className="w-full bg-white hover:bg-zinc-200 text-black font-extrabold text-xs py-3.5 rounded-full uppercase tracking-wider flex items-center justify-center gap-2 mt-2 transition-all shadow-lg cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}
