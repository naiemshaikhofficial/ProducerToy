'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  Gift,
  Info
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useCurrency } from '@/context/CurrencyContext'
import { SendGiftModal } from '@/components/gifts/SendGiftModal'

// Instant In-Place Checkout Modal
const GlobalCheckoutModal = dynamic(
  () => import('@/components/checkout/GlobalCheckoutModal').then((mod) => mod.GlobalCheckoutModal),
  { ssr: false }
)

function WindowsIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
    </svg>
  )
}

export function CartPageClient() {
  const { items, removeItem, openCheckout } = useCart()
  const { toggleWishlist } = useWishlist()
  const { formatPrice, exchangeRate } = useCurrency()

  const [giftModalOpen, setGiftModalOpen] = useState(false)
  const [selectedGiftItem, setSelectedGiftItem] = useState<any>(null)
  const [, setGiftRecipient] = useState('')
  const [, setGiftSuccess] = useState(false)

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
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        
        {/* ========================================================================= */}
        {/* HEADER: Clean "My Cart" Title matching Epic Games layout                  */}
        {/* ========================================================================= */}
        <div className="pb-6 sm:pb-8 flex items-center justify-between">
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-white tracking-tight leading-tight">
            My Cart
          </h1>
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
              className="mt-2 bg-[#34363d] hover:bg-[#42454e] border border-white/10 text-white font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-lg uppercase tracking-wider transition-all shadow-lg shadow-black/40 active:scale-95 cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>Shop Sound Kits &amp; Plugins</span>
            </Link>

          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: FILLED CART STATE (1:1 Epic Games Store Layout Match)             */
          /* ========================================================================= */
          <div className="pt-2 sm:pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              
              {/* Left Column: Cart Items List */}
              <div className="lg:col-span-8 space-y-5">
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
                      : 'Add-On'

                  return (
                    <div
                      key={item.id}
                      className="bg-[#202020] rounded-2xl p-5 sm:p-6 transition-all shadow-md flex flex-col sm:flex-row gap-5 relative border border-transparent hover:border-[#2d2d2d]"
                    >
                      {/* Left: Product Poster Image + Platform OS icon */}
                      <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 flex-shrink-0">
                        <div className="w-20 h-28 sm:w-[110px] sm:h-[146px] bg-[#161616] rounded-xl overflow-hidden relative flex-shrink-0 border border-[#2c2c2c] shadow-sm">
                          <Image
                            src={item.cover_image}
                            alt={item.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-400 pl-0.5">
                          <WindowsIcon className="w-3.5 h-3.5 fill-current" />
                        </div>
                      </div>

                      {/* Right: Product Details & Actions */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        
                        {/* Top: Category Tag, Title & Price */}
                        <div>
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <span className="inline-block bg-[#2b2b2b] text-zinc-300 text-[11px] font-semibold px-2 py-0.5 rounded border border-[#383838]">
                                {categoryLabel}
                              </span>
                              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug mt-1.5 truncate">
                                {item.name}
                              </h3>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <span className="text-base sm:text-lg font-bold text-white tracking-tight">
                                {formatPrice(item.price_inr, item.price_usd)}
                              </span>
                            </div>
                          </div>

                          {/* Classification / Specs Box (Exact Screenshot Match) */}
                          <div className="border border-[#333333] rounded-xl p-3 sm:p-3.5 mt-3.5 bg-transparent space-y-2.5">
                            <div className="flex items-center gap-2.5">
                              <span className="inline-flex items-center font-bold bg-[#303030] text-white border border-[#444444] px-1.5 py-0.5 rounded text-[11px] tracking-wider">
                                100%
                              </span>
                              <span className="text-xs font-semibold text-zinc-200">
                                Royalty-Free Commercial License
                              </span>
                            </div>
                            <div className="w-full h-[1px] bg-[#2d2d2d]" />
                            <div className="text-[11px] text-zinc-400">
                              Instant Digital Cloud Download
                            </div>
                          </div>
                        </div>

                        {/* Bottom Row: Refundable + Actions (Remove, Gift, Move to wishlist) */}
                        <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                            <span>Refundable</span>
                            <Info className="w-3.5 h-3.5 text-zinc-400" />
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-xs font-medium text-zinc-400 hover:text-white underline underline-offset-2 transition-colors cursor-pointer hover:text-red-400 mr-1"
                            >
                              Remove
                            </button>

                            {/* Gift Button */}
                            {(Number(item.price_usd || 0) > 0 || Number(item.price_inr || 0) > 0) && (
                              <button
                                type="button"
                                onClick={() => handleOpenGiftModal(item)}
                                className="w-8 h-8 rounded-lg bg-[#2b2b2b] hover:bg-[#353535] border border-[#383838] flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
                                title="Gift this product"
                                aria-label="Gift item"
                              >
                                <Gift className="w-3.5 h-3.5" />
                              </button>
                            )}

                            {/* Move to Wishlist Button */}
                            <button
                              type="button"
                              onClick={() => handleMoveToWishlist(item)}
                              className="px-3.5 py-1.5 rounded-lg bg-[#2b2b2b] hover:bg-[#353535] border border-[#383838] text-white text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Move to wishlist
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  )
                })}

                {/* Bottom Disclaimer (Exact Screenshot Match) */}
                <p className="text-[11.5px] text-zinc-500 pt-3">
                  * The lowest price offered on Producer Toy in the last 30 days before discount
                </p>
              </div>

              {/* Right Column: Games and Apps Summary (Exact Screenshot Match) */}
              <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
                <div className="space-y-5">
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Games and Apps Summary
                  </h2>

                  <div className="space-y-3.5 text-sm">
                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Price</span>
                      <span className="text-white font-normal">
                        {formatPrice(rawSubtotalInr, rawSubtotalUsd)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-zinc-400">
                      <span>Taxes</span>
                      <span className="text-zinc-400">Calculated at Checkout</span>
                    </div>

                    <div className="border-t border-[#262626] pt-4 flex items-center justify-between text-base font-bold text-white">
                      <span>Subtotal</span>
                      <span className="font-bold">
                        {formatPrice(rawSubtotalInr, rawSubtotalUsd)}
                      </span>
                    </div>
                  </div>

                  {/* Check Out Button - Non-blue solid charcoal accent */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => openCheckout()}
                      className="w-full h-12 bg-[#34363d] hover:bg-[#42454e] border border-white/10 text-white font-bold text-sm rounded-lg transition-all shadow-md active:scale-[0.99] cursor-pointer flex items-center justify-center"
                    >
                      <span>Check Out</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 1:1 SEND GIFT MODAL POPUP                                                 */}
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
