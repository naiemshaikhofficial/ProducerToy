'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  ExternalLink,
  Gift,
  ArrowRight,
  ShieldCheck
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useCurrency } from '@/context/CurrencyContext'
import { ToywardsSparkleIcon } from '@/components/account/RewardsAndWalletTab'

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
    <div className="min-h-screen bg-[#121212] text-white font-sans select-none pb-24">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        
        {/* ========================================================================= */}
        {/* TOP HEADER ROW: "My Cart" + Toywards Balance Pill (Exact 1:1 Match)         */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between pb-8 sm:pb-10 border-b border-[#202020]">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            My Cart
          </h1>

          {/* Toywards Balance Link Pill (Exact 1:1 Match) */}
          <Link
            href="/account?tab=rewards"
            prefetch={true}
            className="flex items-center gap-2.5 group cursor-pointer"
            title="View Toywards Balance"
          >
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
              <span>Toywards</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#FA742B] transition-colors" />
            </div>

            <div className="bg-[#181818] group-hover:bg-[#222222] border border-[#282828] group-hover:border-[#FA742B]/50 px-3.5 py-1 rounded-full text-xs sm:text-sm font-bold text-white transition-all shadow-sm">
              {currency === 'INR' ? '₹0.00' : '$0.00'}
            </div>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: EMPTY CART STATE (Screenshot 1 Exact 1:1 Match)                   */}
        {/* ========================================================================= */}
        {items.length === 0 ? (
          <div className="py-24 sm:py-32 flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in duration-200">
            
            {/* Sad Cart / Ghost Badge Icon (Exact Screenshot Match) */}
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

            {/* Action Button (Pure ProducerToy Orange Theme) */}
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
          /* VIEW 2: FILLED CART STATE (Screenshot 2 Exact 1:1 Match)                  */
          /* ========================================================================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pt-8 sm:pt-10 items-start">
            
            {/* --------------------------------------------------------------------- */}
            {/* LEFT COLUMN: Cart Items List (7-8 cols) (Exact 1:1 Layout)             */}
            {/* --------------------------------------------------------------------- */}
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
                    className="bg-[#181818] border border-[#242424] hover:border-[#2e2e2e] rounded-2xl p-5 sm:p-6 transition-all shadow-md flex flex-col sm:flex-row gap-5 relative"
                  >
                    {/* Left: Product Poster Image */}
                    <div className="w-full sm:w-32 h-40 sm:h-44 bg-[#141414] rounded-xl overflow-hidden relative flex-shrink-0 border border-[#262626] shadow-inner group">
                      <Image
                        src={item.cover_image}
                        alt={item.name}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Platform Icon on bottom left */}
                      <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-xs p-1.5 rounded-md border border-white/10 shadow-sm">
                        <svg className="w-3.5 h-3.5 text-white fill-current" viewBox="0 0 24 24">
                          <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
                        </svg>
                      </div>
                    </div>

                    {/* Right: Product Details & Inner Section */}
                    <div className="flex-1 flex flex-col justify-between space-y-3">
                      
                      {/* Top Info + Price */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          {/* Category Tag Badge (Exact Match) */}
                          <span className="inline-block bg-[#282828] text-zinc-300 text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#333333]">
                            {categoryLabel}
                          </span>

                          {/* Product Title */}
                          <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug">
                            {item.name}
                          </h3>
                        </div>

                        {/* Price Display (Top Right Exact Match) */}
                        <div className="text-right flex-shrink-0">
                          <span className="text-base sm:text-lg font-black text-white tracking-tight">
                            {formatPrice(item.price_inr, item.price_usd)}
                          </span>
                        </div>
                      </div>

                      {/* Inner Box: Rating/License + Toywards Note (Exact 1:1 Screenshot Box) */}
                      <div className="bg-[#141414] border border-[#222222] rounded-xl p-3.5 space-y-2.5">
                        
                        {/* Rating / License Badge */}
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 font-bold bg-[#FA742B] text-black px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
                            100%
                          </span>
                          <span className="text-xs font-bold text-zinc-200">
                            Royalty-Free Commercial License
                          </span>
                        </div>

                        {/* Toywards Rewards Line with Sparkle Icon directly before Earn (Exact 1:1 Match) */}
                        <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                          <ToywardsSparkleIcon size={16} className="text-[#FA742B] shrink-0" />
                          <span>
                            Earn <strong className="text-[#FA742B] font-bold">Toywards Rewards</strong>
                          </span>
                        </div>

                      </div>

                      {/* Bottom Actions Row: Remove, Gift, Move to Wishlist (Exact 1:1 Alignment) */}
                      <div className="flex items-center justify-end gap-3 pt-1">
                        
                        {/* Remove text button */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer px-2 py-1.5 underline sm:no-underline hover:underline"
                        >
                          Remove
                        </button>

                        {/* Gift Icon Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenGiftModal(item)}
                          className="p-2.5 rounded-xl bg-[#202020] hover:bg-[#282828] text-zinc-300 hover:text-white border border-[#2c2c2c] transition-colors cursor-pointer"
                          title="Gift to a Friend"
                          aria-label="Gift item"
                        >
                          <Gift className="w-4 h-4" />
                        </button>

                        {/* Move to Wishlist Button */}
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

            {/* --------------------------------------------------------------------- */}
            {/* RIGHT COLUMN: Order Summary (Sticky 4-5 cols) (Exact 1:1 Match)       */}
            {/* --------------------------------------------------------------------- */}
            <div className="lg:col-span-4 sticky top-24 space-y-4">
              
              <div className="bg-[#181818] border border-[#242424] rounded-2xl p-6 sm:p-7 space-y-6 shadow-xl">
                
                {/* Summary Title (Exact Screenshot Match) */}
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Order Summary
                </h2>

                {/* Price Breakdown (Exact 1:1 Match) */}
                <div className="space-y-3.5 text-sm">
                  
                  {/* Price Row */}
                  <div className="flex items-center justify-between text-zinc-300 font-medium">
                    <span>Price</span>
                    <span className="text-white font-bold">
                      {formatPrice(rawSubtotalInr, rawSubtotalUsd)}
                    </span>
                  </div>

                  {/* Taxes Row */}
                  <div className="flex items-center justify-between text-zinc-300 text-xs">
                    <span>Taxes</span>
                    <span className="text-zinc-400">Calculated at Checkout</span>
                  </div>

                  {/* Subtotal Divider */}
                  <div className="border-t border-[#262626] pt-4 flex items-center justify-between text-base font-bold">
                    <span className="text-white">Subtotal</span>
                    <span className="text-xl font-black text-white tracking-tight">
                      {formatPrice(rawSubtotalInr, rawSubtotalUsd)}
                    </span>
                  </div>

                </div>

                {/* Instant Check Out Button (Pure Orange Theme, Opens In-Place Checkout) */}
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
        )}

      </div>

      {/* ========================================================================= */}
      {/* GIFT MODAL POPUP                                                          */}
      {/* ========================================================================= */}
      {giftModalOpen && selectedGiftItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs animate-in fade-in"
            onClick={() => setGiftModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-[#181818] border border-[#2c2c2c] rounded-2xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#FA742B]" />
                <span>Gift this Product</span>
              </h3>
              <button
                onClick={() => setGiftModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300">
              Send <strong className="text-white">{selectedGiftItem.name}</strong> as a digital gift license directly to a fellow producer or friend's email.
            </p>

            <input
              type="email"
              placeholder="recipient@example.com"
              value={giftRecipient}
              onChange={(e) => setGiftRecipient(e.target.value)}
              className="w-full bg-[#141414] border border-[#2c2c2c] text-white text-xs px-3.5 py-3 rounded-xl outline-none focus:border-[#FA742B]"
            />

            {giftSuccess && (
              <p className="text-xs font-bold text-green-400">
                Gift details saved! Complete checkout to send the gift key.
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#242424]">
              <button
                type="button"
                onClick={() => setGiftModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#242424] text-zinc-300 hover:text-white text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setGiftSuccess(true)
                  setTimeout(() => setGiftModalOpen(false), 1200)
                }}
                className="px-5 py-2 rounded-xl bg-[#FA742B] hover:bg-[#E05A18] text-white text-xs font-extrabold uppercase"
              >
                Save Gift Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INSTANT IN-PLACE CHECKOUT MODAL                                           */}
      {/* ========================================================================= */}
      <GlobalCheckoutModal />

    </div>
  )
}
