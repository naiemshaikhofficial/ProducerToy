'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  ExternalLink,
  Gift,
  ArrowRight,
  ShieldCheck,
  Info
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useCurrency } from '@/context/CurrencyContext'
import { ToywardsSparkleIcon } from '@/components/account/RewardsAndWalletTab'

import { SendGiftModal } from '@/components/gifts/SendGiftModal'

// Instant In-Place Checkout Modal
const GlobalCheckoutModal = dynamic(
  () => import('@/components/checkout/GlobalCheckoutModal').then((mod) => mod.GlobalCheckoutModal),
  { ssr: false }
)

export function CartPageClient() {
  const { items, removeItem, openCheckout } = useCart()
  const { toggleWishlist } = useWishlist()
  const { formatPrice, currency, exchangeRate } = useCurrency()

  const [giftModalOpen, setGiftModalOpen] = useState(false)
  const [selectedGiftItem, setSelectedGiftItem] = useState<any>(null)
  const [giftRecipient, setGiftRecipient] = useState('')
  const [giftSuccess, setGiftSuccess] = useState(false)

  // Calculations
  const rawSubtotalUsd = items.reduce((sum, item) => sum + Number(item.price_usd || 0), 0)
  const rawSubtotalInr = Math.round(rawSubtotalUsd * (exchangeRate || 95.0))

  const handleMoveToWishlist = async (item: any) => {
    await toggleWishlist({
      id: item.id,
      name: item.name,
      price_usd: item.price_usd,
      price_inr: item.price_inr,
      cover_image: item.cover_image,
      slug: item.slug,
      product_type: item.product_type,
      brand: item.brand,
    })
    removeItem(item.id)
  }

  const handleOpenGiftModal = (item: any) => {
    setSelectedGiftItem(item)
    setGiftModalOpen(true)
    setGiftSuccess(false)
    setGiftRecipient('')
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans select-none pb-28">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14">
        
        {/* ========================================================================= */}
        {/* 1. MOBILE HEADER (< lg) (Exact Screenshot 2 Match: Large & Bold)          */}
        {/* ========================================================================= */}
        <div className="block lg:hidden pb-7 border-b border-[#202020] space-y-4">
          {/* Top Row: Toywards Balance Link Pill */}
          <div className="flex items-center justify-start">
            <Link
              href="/account?tab=rewards"
              prefetch={true}
              className="flex items-center gap-2.5 group cursor-pointer"
              title="View Toywards Balance"
            >
              <div className="flex items-center gap-1.5 text-sm font-semibold text-zinc-300 group-hover:text-white transition-colors">
                <span>Toywards</span>
                <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-[#FA742B] transition-colors" />
              </div>

              <div className="bg-[#181818] group-hover:bg-[#222222] border border-[#333333] group-hover:border-[#FA742B]/50 px-4 py-1 rounded-full text-sm font-black text-white transition-all shadow-sm">
                {currency === 'INR' ? '₹0.00' : '$0.00'}
              </div>
            </Link>
          </div>

          {/* Large Bold Title (Exact Screenshot Match) */}
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none">
            My Cart
          </h1>
        </div>

        {/* ========================================================================= */}
        {/* 2. DESKTOP HEADER (>= lg) (Exact 1:1 Match)                               */}
        {/* ========================================================================= */}
        <div className="hidden lg:flex items-center justify-between pb-8 sm:pb-10 border-b border-[#202020]">
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight">
            My Cart
          </h1>

          {/* Toywards Balance Link Pill */}
          <Link
            href="/account?tab=rewards"
            prefetch={true}
            className="flex items-center gap-2.5 group cursor-pointer"
            title="View Toywards Balance"
          >
            <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
              <span>Toywards</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#FA742B] transition-colors" />
            </div>

            <div className="bg-[#181818] group-hover:bg-[#222222] border border-[#282828] group-hover:border-[#FA742B]/50 px-3.5 py-1 rounded-full text-sm font-bold text-white transition-all shadow-sm">
              {currency === 'INR' ? '₹0.00' : '$0.00'}
            </div>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: EMPTY CART STATE                                                  */}
        {/* ========================================================================= */}
        {items.length === 0 ? (
          <div className="py-24 sm:py-32 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-200">
            
            {/* Sad Cart / Ghost Badge Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#1e1e1e] border border-[#2c2c2c] flex items-center justify-center text-zinc-400 shadow-xl">
              <svg
                className="w-9 h-9 sm:w-10 sm:h-10 text-zinc-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M9 10v.01" />
                <path d="M15 10v.01" />
                <path d="M9.5 15.5a3.5 3.5 0 0 1 5 0" />
              </svg>
            </div>

            {/* Empty Heading */}
            <div className="space-y-2 max-w-md">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Your cart is empty.
              </h2>
              <p className="text-sm text-zinc-400">
                Explore our catalog of audio plugins, sample packs, presets, and sound kits.
              </p>
            </div>

            {/* Action Button */}
            <Link
              href="/store"
              prefetch={true}
              className="mt-2 bg-[#FA742B] hover:bg-[#E05A18] text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-lg uppercase tracking-wider transition-all shadow-lg shadow-[#FA742B]/20 active:scale-95 cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>Shop Sound Kits & Plugins</span>
            </Link>

          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: FILLED CART STATE                                                 */
          /* ========================================================================= */
          <div className="pt-6 sm:pt-10">
            
            {/* --------------------------------------------------------------------- */}
            {/* A. MOBILE FILLED CART VIEW (< lg ONLY - EXACT SCREENSHOT 1 & 2 MATCH)  */}
            {/* --------------------------------------------------------------------- */}
            <div className="block lg:hidden space-y-6">
              
              {/* Mobile Cart Items List */}
              <div className="space-y-5">
                {items.map((item) => {
                  const categoryLabel =
                    item.product_type === 'sample_pack'
                      ? 'Sample Pack'
                      : item.product_type === 'preset'
                      ? 'Preset Bank'
                      : item.product_type === 'sound_kit'
                      ? 'Drum Kit'
                      : item.product_type === 'daw_template'
                      ? 'DAW Project'
                      : 'Audio Plugin'

                  return (
                    <div
                      key={item.id}
                      className="bg-[#181818] border border-[#242424] rounded-2xl p-5 space-y-4 shadow-lg"
                    >
                      {/* Top Row: Thumbnail + Category Tag & Large Title (Screenshot 2 Match) */}
                      <div className="flex items-start gap-4">
                        {/* Cover Image */}
                        <div className="w-16 h-22 bg-[#141414] rounded-xl overflow-hidden relative flex-shrink-0 border border-[#262626] shadow-sm">
                          <Image
                            src={item.cover_image}
                            alt={item.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>

                        {/* Category & Large Title */}
                        <div className="flex-1 space-y-1.5">
                          <span className="inline-block bg-[#242424] text-zinc-300 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border border-[#333333]">
                            {categoryLabel}
                          </span>
                          <h3 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug">
                            {item.name}
                          </h3>
                        </div>
                      </div>

                      {/* Inner Box: Rating / License Tag (Screenshot 2 Match) */}
                      <div className="bg-[#141414] border border-[#222222] rounded-xl p-3.5 flex items-center gap-3">
                        <span className="inline-flex items-center font-black bg-[#FA742B] text-black px-2 py-0.5 rounded text-[11px] uppercase tracking-wider">
                          100%
                        </span>
                        <span className="text-xs font-bold text-zinc-200">
                          Royalty-Free Commercial License
                        </span>
                      </div>

                      {/* Price Row + Toywards Note (Screenshot 2 Match: Large Price) */}
                      <div className="space-y-1.5 pt-1">
                        <div className="text-2xl font-black text-white tracking-tight">
                          {formatPrice(item.price_inr, item.price_usd)}
                        </div>

                        <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-300 font-medium">
                          <ToywardsSparkleIcon size={16} className="text-[#FA742B] shrink-0" />
                          <span>
                            Earn <strong className="text-[#FA742B] font-bold">Toywards Rewards</strong>
                          </span>
                        </div>
                      </div>

                      {/* Actions Row: Gift Icon Button + Move to Wishlist (Screenshot 2 Match) */}
                      <div className="space-y-2.5 pt-1">
                        <div className="flex items-center gap-3">
                          {/* Gift Button (Only for paid items) */}
                          {(Number(item.price_usd || 0) > 0 || Number(item.price_inr || 0) > 0) && (
                            <button
                              type="button"
                              onClick={() => handleOpenGiftModal(item)}
                              className="w-12 h-12 rounded-xl bg-[#202020] hover:bg-[#282828] text-zinc-200 border border-[#2c2c2c] transition-colors cursor-pointer flex items-center justify-center flex-shrink-0"
                              title="Gift this product"
                              aria-label="Gift item"
                            >
                              <Gift className="w-5 h-5" />
                            </button>
                          )}

                          {/* Move to Wishlist Button */}
                          <button
                            type="button"
                            onClick={() => handleMoveToWishlist(item)}
                            className="flex-1 h-12 px-4 rounded-xl bg-[#202020] hover:bg-[#282828] text-zinc-200 hover:text-white border border-[#2c2c2c] text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                          >
                            <span>Move to wishlist</span>
                          </button>
                        </div>

                        {/* Remove Link on bottom right */}
                        <div className="text-right pt-1">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer underline hover:text-red-400"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Device Compatibility / Instant Delivery Info Pill (Screenshot 2 Match) */}
                      <div className="bg-[#141414] border border-[#242424] rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-zinc-400">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FA742B] flex-shrink-0" />
                        <span>Instant digital cloud delivery to your ProducerToy account</span>
                      </div>

                    </div>
                  )
                })}
              </div>

              {/* Mobile Summary Card (Screenshot 1 Match: Large Typography) */}
              <div className="bg-[#181818] border border-[#242424] rounded-2xl p-6 space-y-6 shadow-2xl">
                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Order Summary
                </h2>

                {/* Price Breakdown */}
                <div className="space-y-3.5 text-sm">
                  <div className="flex items-center justify-between text-zinc-300 font-medium">
                    <span>Price</span>
                    <span className="text-white font-bold text-base">
                      {formatPrice(rawSubtotalInr, rawSubtotalUsd)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-zinc-300 text-xs">
                    <span>Taxes</span>
                    <span className="text-zinc-400">Calculated at Checkout</span>
                  </div>

                  {/* Subtotal Divider */}
                  <div className="border-t border-[#262626] pt-4 flex items-center justify-between text-base font-bold">
                    <span className="text-white">Subtotal</span>
                    <span className="text-2xl font-black text-white tracking-tight">
                      {formatPrice(rawSubtotalInr, rawSubtotalUsd)}
                    </span>
                  </div>
                </div>

                {/* Check Out Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => openCheckout()}
                    className="w-full bg-[#FA742B] hover:bg-[#E05A18] text-white font-black text-base py-4 rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-[#FA742B]/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Check Out</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-xs text-zinc-500 text-center mt-3 leading-relaxed">
                    * All products cleared for commercial use with instant download access after checkout.
                  </p>
                </div>
              </div>

            </div>

            {/* --------------------------------------------------------------------- */}
            {/* B. DESKTOP FILLED CART VIEW (>= lg ONLY - 2-COLUMN LAYOUT)            */}
            {/* --------------------------------------------------------------------- */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              
              {/* Left Column: Cart Items List */}
              <div className="lg:col-span-8 space-y-4">
                {items.map((item) => {
                  const categoryLabel =
                    item.product_type === 'sample_pack'
                      ? 'Sample Pack'
                      : item.product_type === 'preset'
                      ? 'Preset Bank'
                      : item.product_type === 'sound_kit'
                      ? 'Drum Kit'
                      : item.product_type === 'daw_template'
                      ? 'DAW Project'
                      : 'Audio Plugin'

                  return (
                    <div
                      key={item.id}
                      className="bg-[#181818] border border-[#242424] hover:border-[#2e2e2e] rounded-2xl p-5 sm:p-6 transition-all shadow-md flex flex-row gap-5 relative"
                    >
                      {/* Product Poster Image */}
                      <div className="w-32 h-44 bg-[#141414] rounded-xl overflow-hidden relative flex-shrink-0 border border-[#262626] shadow-inner group">
                        <Image
                          src={item.cover_image}
                          alt={item.name}
                          fill
                          unoptimized
                          className="object-cover group-hover:brightness-110 transition-all duration-200"
                        />
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                        <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-xs p-1.5 rounded-md border border-white/10 shadow-sm">
                          <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24">
                            <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
                          </svg>
                        </div>
                      </div>

                      {/* Product Details & Inner Section */}
                      <div className="flex-1 flex flex-col justify-between space-y-3">
                        
                        {/* Top Info + Price */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <span className="inline-block bg-[#282828] text-zinc-300 text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#333333]">
                              {categoryLabel}
                            </span>

                            <h3 className="text-lg font-extrabold text-white tracking-tight leading-snug">
                              {item.name}
                            </h3>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className="text-lg font-black text-white tracking-tight">
                              {formatPrice(item.price_inr, item.price_usd)}
                            </span>
                          </div>
                        </div>

                        {/* Inner Box: Rating/License + Toywards Note */}
                        <div className="bg-[#141414] border border-[#222222] rounded-xl p-3.5 space-y-2.5">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 font-bold bg-[#FA742B] text-black px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
                              100%
                            </span>
                            <span className="text-xs font-bold text-zinc-200">
                              Royalty-Free Commercial License
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                            <ToywardsSparkleIcon size={16} className="text-[#FA742B] shrink-0" />
                            <span>
                              Earn <strong className="text-[#FA742B] font-bold">Toywards Rewards</strong>
                            </span>
                          </div>
                        </div>

                        {/* Bottom Actions Row: Remove, Gift, Move to Wishlist */}
                        <div className="flex items-center justify-end gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer px-2 py-1.5 underline hover:text-red-400"
                          >
                            Remove
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenGiftModal(item)}
                            className="p-2.5 rounded-xl bg-[#202020] hover:bg-[#282828] text-zinc-300 hover:text-white border border-[#2c2c2c] transition-colors cursor-pointer"
                            title="Gift to a Friend"
                            aria-label="Gift item"
                          >
                            <Gift className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMoveToWishlist(item)}
                            className="px-4 py-2.5 rounded-xl bg-[#202020] hover:bg-[#282828] text-zinc-200 hover:text-white border border-[#2c2c2c] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <span>Move to wishlist</span>
                          </button>
                        </div>

                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Right Column: Order Summary (Sticky 4-5 cols) */}
              <div className="lg:col-span-4 sticky top-24 space-y-4">
                <div className="bg-[#181818] border border-[#242424] rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl">
                  
                  <h2 className="text-xl font-extrabold text-white tracking-tight">
                    Order Summary
                  </h2>

                  <div className="space-y-3.5 text-sm">
                    <div className="flex items-center justify-between text-zinc-300 font-medium">
                      <span>Price</span>
                      <span className="text-white font-bold">
                        {formatPrice(rawSubtotalInr, rawSubtotalUsd)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-zinc-300 text-xs">
                      <span>Taxes</span>
                      <span className="text-zinc-400">Calculated at Checkout</span>
                    </div>

                    <div className="border-t border-[#262626] pt-4 flex items-center justify-between text-base font-bold">
                      <span className="text-white">Subtotal</span>
                      <span className="text-xl font-black text-white tracking-tight">
                        {formatPrice(rawSubtotalInr, rawSubtotalUsd)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => openCheckout()}
                      className="w-full bg-[#FA742B] hover:bg-[#E05A18] text-white font-extrabold text-sm py-4 rounded-xl uppercase tracking-wider transition-all shadow-lg shadow-[#FA742B]/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Check Out</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <p className="text-[11px] text-zinc-500 text-center mt-2.5">
                      Instant 1-click checkout with PayPal, Cards, UPI, or Toywards credits.
                    </p>
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 1:1 SEND GIFT MODAL POPUP (Exact Screenshots 1 & 2 Match)                 */}
      {/* ========================================================================= */}
      <SendGiftModal
        isOpen={giftModalOpen}
        onClose={() => setGiftModalOpen(false)}
        product={selectedGiftItem}
      />

      {/* ========================================================================= */}
      {/* INSTANT IN-PLACE CHECKOUT MODAL                                           */}
      {/* ========================================================================= */}
      <GlobalCheckoutModal />

    </div>
  )
}
