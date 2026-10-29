'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Gift } from 'lucide-react'
import { useCart, CartItem } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useCurrency } from '@/context/CurrencyContext'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { SendGiftModal } from '@/components/gifts/SendGiftModal'

// Instant In-Place Checkout Modal
const GlobalCheckoutModal = dynamic(
  () => import('@/components/checkout/GlobalCheckoutModal').then((mod) => mod.GlobalCheckoutModal),
  { ssr: false }
)

function WindowsIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="-2 -2 28 28" fill="currentColor">
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
    </svg>
  )
}

function AppleIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="1.5 2.5 20 20.5" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 1.01-2.87-.96.04-2.08.64-2.73 1.4-.57.65-1.07 1.73-.93 2.77 1.05.08 2.05-.55 2.65-1.3z" />
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
  const [enrichedMeta, setEnrichedMeta] = useState<Record<string, {
    license_type?: string
    has_win?: boolean
    has_mac?: boolean
  }>>({})

  // Fetch real database license_type & OS download compatibility directly from Supabase
  useEffect(() => {
    if (items.length === 0) return
    const ids = items.map((i) => i.id).filter(Boolean)
    if (ids.length === 0) return

    try {
      const supabase = getSupabaseBrowserClient()
      supabase
        .from('products')
        .select('id, slug, license_type, download_url, download_url_win, download_url_mac, product_type')
        .in('id', ids)
        .then(({ data }) => {
          if (data && data.length > 0) {
            const metaMap: Record<string, { license_type?: string; has_win?: boolean; has_mac?: boolean }> = {}
            for (const p of data) {
              const hasWin = Boolean(p.download_url_win || p.download_url || p.product_type === 'plugin' || p.product_type === 'sample_pack' || p.product_type === 'preset' || p.product_type === 'sound_kit')
              const hasMac = Boolean(p.download_url_mac || p.download_url || p.slug === 'proverb' || p.product_type === 'sample_pack' || p.product_type === 'preset' || p.product_type === 'sound_kit')
              metaMap[p.id] = {
                license_type: p.license_type || undefined,
                has_win: hasWin,
                has_mac: hasMac,
              }
            }
            setEnrichedMeta(metaMap)
          }
        })
    } catch {}
  }, [items])

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
      {/* Wide Container matching Epic Games Store desktop canvas */}
      <div className="w-full max-w-[1600px] xl:max-w-[1680px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-8 sm:pt-12">
        
        {/* ========================================================================= */}
        {/* HEADER: Clean "My Cart" Title with exact 1:1 Epic Games layout            */}
        {/* ========================================================================= */}
        <div className="pb-6 sm:pb-8 flex items-center justify-between">
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-white tracking-tight leading-tight">
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
              
              {/* Left Column: Cart Items List */}
              <div className="lg:col-span-8 space-y-6">
                {items.map((item) => {
                  const dbMeta = enrichedMeta[item.id]
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

                  // Real database license_type
                  const resolvedLicense =
                    dbMeta?.license_type ||
                    item.license_type ||
                    (item.product_type === 'plugin' ? 'Single User Perpetual' : '100% Royalty-Free')

                  // Clean uppercase badge text
                  const badgeText = resolvedLicense.toLowerCase().includes('perpetual')
                    ? 'PERPETUAL'
                    : resolvedLicense.toLowerCase().includes('100%') || resolvedLicense.toLowerCase().includes('royalty')
                    ? '100%'
                    : 'LICENSE'

                  // Descriptive spec text replacing generic "instant digital cloud"
                  const specSubtitle =
                    item.product_type === 'plugin'
                      ? 'Lifetime Updates & Commercial Release Rights Included'
                      : 'Cleared for Commercial Releases, Streaming & Sync Licensing'

                  // Platform compatibility (Windows and Apple macOS)
                  const hasWin = dbMeta?.has_win ?? item.has_win ?? true
                  const hasMac = dbMeta?.has_mac ?? item.has_mac ?? (item.slug === 'proverb' || item.product_type !== 'plugin')

                  return (
                    <div
                      key={item.id}
                      className="bg-[#202020] rounded-2xl p-6 sm:p-7 transition-all shadow-lg flex flex-col sm:flex-row gap-6 relative border border-transparent hover:border-[#2e2e2e]"
                    >
                      {/* Left: Product Poster Image + Windows/Apple OS icons */}
                      <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2.5 flex-shrink-0">
                        <div className="w-24 h-32 sm:w-[124px] sm:h-[165px] bg-[#161616] rounded-xl overflow-hidden relative flex-shrink-0 border border-[#2c2c2c] shadow-sm">
                          <Image
                            src={item.cover_image}
                            alt={item.name}
                            fill
                            unoptimized
                            className="object-cover"
                          />
                        </div>

                        {/* OS Logos (Windows + Apple side by side when both supported) */}
                        <div className="flex items-center gap-2 text-zinc-400 pl-0.5 pt-0.5">
                          {hasWin && (
                            <span title="Windows compatible" aria-label="Windows">
                              <WindowsIcon className="w-3.5 h-3.5 fill-current" />
                            </span>
                          )}
                          {hasMac && (
                            <span title="macOS compatible" aria-label="macOS">
                              <AppleIcon className="w-3.5 h-3.5 fill-current" />
                            </span>
                          )}
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
                              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug mt-1.5">
                                {item.name}
                              </h3>
                            </div>

                            <div className="text-right flex-shrink-0">
                              <span className="text-lg sm:text-xl font-bold text-white tracking-tight">
                                {formatPrice(item.price_inr, item.price_usd)}
                              </span>
                            </div>
                          </div>

                          {/* Classification / Specs Box (Exact DB License & Subtitle) */}
                          <div className="border border-[#303030] rounded-xl p-3.5 sm:p-4 mt-4 bg-transparent space-y-2.5">
                            <div className="flex items-center gap-2.5">
                              <span className="inline-flex items-center font-bold bg-[#303030] text-white border border-[#444444] px-2 py-0.5 rounded text-[11px] tracking-wider uppercase">
                                {badgeText}
                              </span>
                              <span className="text-xs sm:text-[13px] font-semibold text-zinc-200">
                                {resolvedLicense}
                              </span>
                            </div>
                            <div className="w-full h-[1px] bg-[#2a2a2a]" />
                            <div className="text-xs text-zinc-400">
                              {specSubtitle}
                            </div>
                          </div>
                        </div>

                        {/* Bottom Actions Row (Remove, Gift, Move to wishlist - No Refundable) */}
                        <div className="pt-4 flex items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-xs sm:text-sm font-medium text-zinc-400 hover:text-[#ff4053] no-underline transition-colors cursor-pointer mr-1"
                          >
                            Remove
                          </button>

                          {/* Gift Button */}
                          {(Number(item.price_usd || 0) > 0 || Number(item.price_inr || 0) > 0) && (
                            <button
                              type="button"
                              onClick={() => handleOpenGiftModal(item)}
                              className="w-9 h-9 rounded-lg bg-[#2b2b2b] hover:bg-[#353535] border border-[#383838] flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
                              title="Gift this product"
                              aria-label="Gift item"
                            >
                              <Gift className="w-4 h-4" />
                            </button>
                          )}

                          {/* Move to Wishlist Button */}
                          <button
                            type="button"
                            onClick={() => handleMoveToWishlist(item)}
                            className="px-4 py-2 rounded-lg bg-[#2b2b2b] hover:bg-[#353535] border border-[#383838] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                          >
                            Move to wishlist
                          </button>
                        </div>

                      </div>
                    </div>
                  )
                })}

                {/* Bottom Disclaimer (Exact Screenshot Match) */}
                <p className="text-xs text-zinc-500 pt-3">
                  * The lowest price offered on Producer Toy in the last 30 days before discount
                </p>
              </div>

              {/* Right Column: Games and Apps Summary (Exact Screenshot Match) */}
              <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    Games and Apps Summary
                  </h2>

                  <div className="space-y-4 text-sm sm:text-base">
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

                    <div className="border-t border-[#262626] pt-4 flex items-center justify-between text-base sm:text-lg font-bold text-white">
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
                      className="w-full h-13 py-3.5 bg-[#34363d] hover:bg-[#42454e] border border-white/10 text-white font-bold text-sm sm:text-base rounded-lg transition-all shadow-md active:scale-[0.99] cursor-pointer flex items-center justify-center"
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
