'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { X, Trash2, ArrowRight, Gift } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import { useAuth } from '@/context/AuthContext'
import { validateCouponAction } from '@/actions/couponActions'

const GlobalCheckoutModal = dynamic(
  () => import('./checkout/GlobalCheckoutModal').then((mod) => mod.GlobalCheckoutModal),
  { ssr: false }
)

export function CartDrawer() {
  const { items, removeItem, isCartOpen, setIsCartOpen, openCheckout } = useCart()
  const { formatPrice, exchangeRate } = useCurrency()
  const { user } = useAuth()
  const [coupon, setCoupon] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [couponError, setCouponError] = useState('')

  const rawSubtotalUsd = items.reduce((sum, item) => sum + Number(item.price_usd || 0), 0)
  const rawSubtotalInr = Math.round(rawSubtotalUsd * exchangeRate)

  const couponDiscountUsd = rawSubtotalUsd * (discountPercent / 100)
  const couponDiscountInr = Math.round(couponDiscountUsd * exchangeRate)

  const finalTotalUsd = Math.max(0, rawSubtotalUsd - couponDiscountUsd)
  const finalTotalInr = Math.max(0, rawSubtotalInr - couponDiscountInr)

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
    <>
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden select-none">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsCartOpen(false)}
          />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-[#121212] text-white border-l border-[#222222] flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
          
          {/* Header */}
          <div className="px-5 py-4 bg-[#141414] text-white flex items-center justify-between border-b border-[#222222]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs uppercase tracking-wider text-zinc-200">
                Cart ({items.length})
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
            {items.length === 0 ? (
              <div className="text-center py-20 text-zinc-500 space-y-1.5">
                <p className="text-xs font-semibold text-zinc-300">Your cart is empty</p>
                <p className="text-[11px] text-zinc-500">Add plugins or sample packs to start.</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-[#222222] bg-[#161616]"
                >
                  <div className="relative w-10 h-10 bg-[#1c1c1c] rounded border border-[#282828] flex-shrink-0 overflow-hidden">
                    <Image
                      src={item.cover_image}
                      alt={item.name}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-zinc-200 truncate">
                      {item.name}
                    </div>
                    {item.is_gift && (
                      <div className="flex items-center gap-1 text-[10px] text-[#FA742B] font-bold mt-0.5">
                        <Gift className="w-3 h-3" />
                        <span className="truncate">Gift {item.gift_recipient_email ? `for ${item.gift_recipient_email}` : ''}</span>
                      </div>
                    )}
                    <div className="text-[11px] text-zinc-400 font-semibold mt-0.5">
                      {formatPrice(undefined, item.price_usd)}
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-4 border-t border-[#222222] bg-[#141414] space-y-3">
              
              {/* Coupon Box */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code"
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-[#181818] border border-[#262626] rounded-lg text-white uppercase placeholder-zinc-600 focus:outline-none focus:border-zinc-400"
                />
                <button
                  onClick={applyCoupon}
                  className="bg-[#222222] hover:bg-[#2a2a2a] text-white border border-[#2e2e2e] text-xs font-medium px-3.5 rounded-lg transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="text-[10px] text-zinc-400">{couponError}</p>}

              {/* Price Calculation */}
              <div className="space-y-1 text-xs border-t border-[#222222] pt-2.5">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-zinc-200">{formatPrice(rawSubtotalInr, rawSubtotalUsd)}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-zinc-300">
                    <span>Coupon ({discountPercent}%)</span>
                    <span>-{formatPrice(couponDiscountInr, couponDiscountUsd)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-white border-t border-[#222222] pt-2">
                  <span>Total</span>
                  <span>{formatPrice(finalTotalInr, finalTotalUsd)}</span>
                </div>
              </div>

              {/* Checkout Trigger (Opens In-Place Modal) */}
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false)
                  openCheckout()
                }}
                className="w-full h-10 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-lg uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  )}

  {/* In-Place Epic Games Checkout Modal */}
  <GlobalCheckoutModal />
</>
)
}
