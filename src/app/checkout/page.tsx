'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, CheckCircle2, ShoppingBag, ChevronLeft, Lock, ArrowRight, Zap, Check } from 'lucide-react'

import { processCheckoutAction } from '@/actions/checkoutActions'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, clearCart } = useCart()
  const { formatPrice } = useCurrency()
  const { user } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState(user?.email || '')
  const [errorMsg, setErrorMsg] = useState('')

  const rawSubtotalInr = items.reduce((sum, item) => sum + Number(item.price_inr || 0), 0)
  const rawSubtotalUsd = items.reduce((sum, item) => sum + Number(item.price_usd || (item.price_inr / 85)), 0)

  const bundleDiscountInr = items.length >= 3 ? Math.round(rawSubtotalInr * 0.1) : 0
  const bundleDiscountUsd = items.length >= 3 ? (rawSubtotalUsd * 0.1) : 0

  const finalTotalInr = Math.max(0, rawSubtotalInr - bundleDiscountInr)
  const finalTotalUsd = Math.max(0, rawSubtotalUsd - bundleDiscountUsd)

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return

    setLoading(true)
    setErrorMsg('')

    try {
      const res = await processCheckoutAction(
        items.map(item => ({
          id: item.id,
          name: item.name,
          price_inr: item.price_inr,
          price_usd: item.price_usd,
          product_type: item.product_type,
        })),
        email || user?.email || '',
        user?.id
      )

      if (!res.success || res.error) {
        throw new Error(res.error || 'Checkout failed. Please try again.')
      }

      clearCart()
      setSuccess(true)
    } catch (err: any) {
      console.error('Checkout error:', err)
      setErrorMsg(err.message || 'Payment processing failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // SUCCESS CONFIRMATION SCREEN
  if (success) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 text-center">
        <div className="w-full max-w-lg bg-[#181818] border border-[#282828] rounded-2xl p-8 sm:p-12 shadow-2xl space-y-6 flex flex-col items-center animate-in fade-in">
          <div className="w-16 h-16 bg-[#222222] border border-[#333333] rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-[#FC6301] stroke-2" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-[#FC6301] uppercase tracking-widest">Order Confirmed</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Order Complete!</h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md leading-relaxed">
              Thank you for your order. Your products and VST license keys have been permanently attached to your library.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 w-full">
            <Link
              href="/library"
              prefetch={true}
              className="w-full bg-[#FC6301] hover:bg-[#E05800] text-white font-extrabold text-xs py-3.5 px-6 rounded-xl uppercase tracking-wider transition-all text-center cursor-pointer active:scale-[0.99]"
            >
              Go to Library
            </Link>
            <Link
              href="/store"
              prefetch={true}
              className="w-full bg-[#222222] hover:bg-[#2a2a2a] text-white font-bold text-xs py-3.5 px-6 rounded-xl border border-[#333333] uppercase tracking-wider transition-all text-center cursor-pointer"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // EMPTY CART SCREEN
  if (items.length === 0) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-20 text-center">
        <div className="w-full max-w-md bg-[#181818] border border-[#282828] rounded-2xl p-8 sm:p-10 shadow-2xl space-y-4 flex flex-col items-center">
          <div className="w-16 h-16 bg-[#222222] border border-[#333333] rounded-full flex items-center justify-center mb-2">
            <ShoppingBag className="w-7 h-7 text-zinc-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Your Cart is Empty</h2>
          <p className="text-xs text-zinc-400">Add plugins, presets, or sample packs to proceed with checkout.</p>
          <div className="pt-3 w-full">
            <Link
              href="/store"
              prefetch={true}
              className="w-full bg-[#FC6301] hover:bg-[#E05800] text-white font-extrabold text-xs py-3.5 px-6 rounded-xl inline-block uppercase tracking-wider transition-all shadow-lg shadow-[#FC6301]/25 text-center cursor-pointer"
            >
              Browse Store Catalog
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // MAIN CHECKOUT SCREEN (100% ProducerToy & Epic Games Store Aesthetic)
  return (
    <div className="w-full min-h-screen bg-[#121212] text-white py-8 sm:py-12 select-none">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Back Link */}
        <div>
          <Link
            href="/store"
            prefetch={true}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT COLUMN: CHECKOUT FORM ================= */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Header Title */}
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Checkout</h1>
              <p className="text-xs text-zinc-400 font-medium">Instant Digital Authorization & Direct Download</p>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="bg-[#241818] border border-[#382020] text-red-300 p-3.5 text-xs rounded-xl text-center">
                {errorMsg}
              </div>
            )}

            {/* Account Status Card */}
            {!user ? (
              <div className="bg-[#181818] border border-[#282828] rounded-2xl p-5 flex items-center justify-between shadow-md">
                <div className="space-y-1">
                  <span className="text-xs font-extrabold text-white block">Already have a ProducerToy Account?</span>
                  <span className="text-xs text-zinc-400 leading-relaxed block">
                    Sign in with Google or Email to link your downloads & serial keys.
                  </span>
                </div>
                <Link
                  href="/auth?next=/checkout"
                  prefetch={true}
                  className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs px-5 py-2.5 rounded-full uppercase tracking-wider transition-all flex-shrink-0 shadow-md ml-4 cursor-pointer"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <div className="bg-[#181818] border border-[#282828] rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Logged in as <strong className="text-white font-bold">{user.email}</strong></span>
                </div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-[#222222] px-2.5 py-1 rounded-full border border-[#2e2e2e]">
                  Linked Account
                </span>
              </div>
            )}

            {/* Main Form Container */}
            <form onSubmit={handleSimulatePayment} className="bg-[#181818] border border-[#282828] rounded-2xl p-6 sm:p-8 space-y-6">
              
              {/* Account Email Field */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Delivery Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email || user?.email || ''}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="producer@studio.com"
                  className="w-full bg-[#222222] border border-[#333333] text-white text-xs px-4 py-3.5 rounded-xl focus:outline-none focus:border-zinc-400 placeholder:text-zinc-500 transition-colors"
                />
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Your direct download links and VST license keys will be delivered to this email.
                </p>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3 pt-2 border-t border-[#282828]">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Payment Method
                </label>
                
                <div className="bg-[#222222] border border-[#333333] p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-[#FC6301] rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                    <div>
                      <span className="font-bold text-xs uppercase tracking-wide block text-white">
                        Razorpay / Cards / UPI / NetBanking
                      </span>
                      <span className="text-[11px] text-zinc-400 font-normal">
                        Instant digital authorization with 256-bit SSL encryption
                      </span>
                    </div>
                  </div>
                  <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FC6301] hover:bg-[#E05800] text-white font-extrabold text-xs sm:text-sm py-4 rounded-xl uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <span className="animate-pulse">Processing Order...</span>
                ) : finalTotalUsd === 0 ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-white" />
                    <span>Claim Free Download (Instant Access)</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Complete Purchase ({formatPrice(finalTotalInr, finalTotalUsd)})</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* ================= RIGHT COLUMN: ORDER SUMMARY ================= */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#181818] border border-[#282828] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-300 border-b border-[#282828] pb-3.5 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-zinc-400 font-normal">({items.length} {items.length === 1 ? 'item' : 'items'})</span>
              </h3>

              {/* Cart Items List */}
              <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="relative w-12 h-12 bg-[#222222] border border-[#333333] rounded-xl overflow-hidden flex-shrink-0">
                      <Image
                        src={item.cover_image}
                        alt={item.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-white block truncate text-xs">{item.name}</span>
                      <span className="text-[11px] text-zinc-400 block truncate uppercase tracking-wider font-medium">
                        {item.brand}
                      </span>
                    </div>

                    <span className="font-extrabold text-white text-xs flex-shrink-0">
                      {formatPrice(item.price_inr, item.price_usd)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculation Breakdown */}
              <div className="border-t border-[#282828] pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-300">{formatPrice(rawSubtotalInr, rawSubtotalUsd)}</span>
                </div>
                {bundleDiscountInr > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Bundle Discount (10%)</span>
                    <span>-{formatPrice(bundleDiscountInr, bundleDiscountUsd)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-extrabold text-white border-t border-[#282828] pt-3">
                  <span>Total Due</span>
                  <span>{formatPrice(finalTotalInr, finalTotalUsd)}</span>
                </div>
              </div>

            </div>

            {/* Trust Badges */}
            <div className="bg-[#181818] border border-[#282828] rounded-2xl p-4 text-xs text-zinc-400 space-y-2">
              <div className="flex items-center gap-2 text-zinc-300">
                <Zap className="w-4 h-4 text-[#FC6301]" />
                <span className="font-medium">Instant Digital Delivery after payment</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-medium">100% Cleared for Commercial Use & Royalty-Free</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
