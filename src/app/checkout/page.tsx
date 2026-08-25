'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import { useAuth } from '@/context/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { ShieldCheck, CheckCircle2, ShoppingBag, ArrowLeft, Lock } from 'lucide-react'

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
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          email: email || user?.email,
          userId: user?.id
        })
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Checkout failed. Please try again.')
      }

      clearCart()
      setSuccess(true)
    } catch (err: any) {
      console.error('Checkout error:', err)
      setErrorMsg(err.message || 'Payment simulation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-[#161616] border border-[#262626] rounded-2xl p-8 sm:p-10 shadow-2xl space-y-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-[#202020] border border-[#2e2e2e] rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-white stroke-2" />
          </div>

          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Order Confirmed</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Order Complete!</h1>
          
          <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
            Thank you for your purchase. Your products and serial keys have been added to your account library.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 w-full">
            <Link href="/my-purchases" prefetch={true} className="w-full bg-white hover:bg-zinc-200 text-black font-extrabold text-xs py-3.5 px-6 rounded-full uppercase tracking-wider transition-all shadow-lg text-center">
              View My Purchases
            </Link>
            <Link href="/store" prefetch={true} className="w-full bg-[#202020] hover:bg-[#282828] text-white font-bold text-xs py-3.5 px-6 rounded-full border border-[#2e2e2e] uppercase tracking-wider transition-all text-center">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="bg-[#161616] border border-[#262626] rounded-2xl p-8 sm:p-10 shadow-2xl space-y-4 flex flex-col items-center">
          <div className="w-14 h-14 bg-[#202020] border border-[#2e2e2e] rounded-full flex items-center justify-center mb-2">
            <ShoppingBag className="w-6 h-6 text-zinc-400" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Your Cart is Empty</h2>
          <p className="text-xs text-zinc-400">Add VST plugins or sample packs to proceed with checkout.</p>
          <div className="pt-2 w-full">
            <Link href="/store" prefetch={true} className="w-full bg-white hover:bg-zinc-200 text-black font-extrabold text-xs py-3.5 px-6 rounded-full inline-block uppercase tracking-wider transition-all shadow-lg">
              Browse Store Catalog
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white">
      
      {/* Back Link */}
      <div>
        <Link href="/store" prefetch={true} className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase hover:underline text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form & Payment Method */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border-b border-[#24242e] pb-3">
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">Checkout</h1>
            <p className="text-xs font-mono text-zinc-400">Secure Instant Digital Delivery</p>
          </div>

          {errorMsg && (
            <div className="bg-red-950/40 border border-red-800 text-red-300 p-3 text-xs font-mono rounded-lg">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSimulatePayment} className="space-y-6">
            
            {/* Account Info */}
            <div className="space-y-3">
              <label className="block text-xs font-mono font-bold uppercase text-zinc-300">
                Account Email for Delivery
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="producer@studio.com"
                className="w-full px-3.5 py-3 text-xs font-mono bg-[#16161a] border border-[#24242e] rounded-xl text-white focus:outline-none focus:border-zinc-500"
              />
              <p className="text-[11px] font-mono text-zinc-400">
                Your download link and VST serial key will be linked to this account.
              </p>
            </div>

            {/* Payment Method Option (Razorpay / Instant Download) */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-mono font-bold uppercase text-zinc-300">
                Select Payment Method
              </label>
              
              <div className="bg-[#141418] p-4 flex items-center justify-between border border-[#24242e] rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-black rounded-full" />
                  </div>
                  <div>
                    <span className="font-bold text-xs uppercase font-mono block text-white">Razorpay / Credit Card / UPI</span>
                    <span className="text-[11px] text-zinc-400 font-mono">Instant digital authorization</span>
                  </div>
                </div>
                <Lock className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-zinc-200 text-black rounded-xl py-4 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {loading ? (
                <span>Processing Order...</span>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Complete Purchase ({formatPrice(finalTotalInr, finalTotalUsd)})</span>
                </>
              )}
            </button>

          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#141418] border border-[#24242e] rounded-xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider border-b border-[#24242e] pb-3 text-white">
              Order Summary ({items.length} items)
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="relative w-10 h-10 bg-[#1c1c24] border border-[#2c2c3a] rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.cover_image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-white block line-clamp-1">{item.name}</span>
                    <span className="text-[10px] text-zinc-400 font-mono uppercase">{item.brand}</span>
                  </div>

                  <span className="font-mono font-bold text-white">
                    {formatPrice(item.price_inr, item.price_usd)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#24242e] pt-3 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>{formatPrice(rawSubtotalInr, rawSubtotalUsd)}</span>
              </div>
              {bundleDiscountInr > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Bundle Discount (10%)</span>
                  <span>-{formatPrice(bundleDiscountInr, bundleDiscountUsd)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-white border-t border-[#24242e] pt-2">
                <span>Total Due</span>
                <span>{formatPrice(finalTotalInr, finalTotalUsd)}</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  )
}
