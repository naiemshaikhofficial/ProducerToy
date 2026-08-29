'use client'

import React, { useState } from 'react'
import Image from 'next/image'

export function WindowsIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <Image
      src="/icons8-windows-100.png"
      alt="Windows"
      width={20}
      height={20}
      className={`${className} object-contain inline-block`}
    />
  )
}

export function AppleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <Image
      src="/icons8-apple-100.png"
      alt="macOS"
      width={20}
      height={20}
      className={`${className} object-contain inline-block`}
    />
  )
}

export interface ProductTypeProps {
  product: {
    name?: string
    product_type?: string
    vst_format?: string
    supported_daws?: string
    operating_system?: string
    delivery_method?: string
    license_type?: string
    category_name?: string
    subcategory_name?: string
  }
  ratingStats?: {
    averageRating: number
    totalReviews: number
    userRating?: number
  }
  onOpenRatingModal?: () => void
}

export function detectProductCategory(
  product: ProductTypeProps['product']
): 'plugin' | 'sample_pack' | 'midi' | 'bundle' {
  const pType = (product?.product_type || '').toLowerCase()
  const name = (product?.name || '').toLowerCase()
  const cat = (product?.category_name || '').toLowerCase()

  if (
    pType === 'plugin' ||
    pType === 'vst' ||
    pType === 'preset' ||
    name.includes('vst') ||
    name.includes('plugin') ||
    name.includes('synth') ||
    cat.includes('plugin') ||
    cat.includes('effects') ||
    cat.includes('instruments')
  ) {
    return 'plugin'
  }
  if (name.includes('midi') || cat.includes('midi')) {
    return 'midi'
  }
  if (name.includes('bundle') || cat.includes('bundle')) {
    return 'bundle'
  }
  return 'sample_pack'
}

export function ProductSpecsOverview({
  product,
  ratingStats,
  onOpenRatingModal,
}: ProductTypeProps) {
  const [activePlatform, setActivePlatform] = useState<'windows' | 'mac'>('windows')
  const cat = detectProductCategory(product)
  const titleName = product.name || 'Product'

  const formats = product.vst_format || 'VST3, AU, AAX (64-Bit)'
  const daws = product.supported_daws || 'FL Studio, Ableton Live, Logic Pro, Cubase, Studio One, Pro Tools, Reaper'

  const score = ratingStats && ratingStats.totalReviews > 0 ? ratingStats.averageRating : 0
  const fullStars = Math.floor(score)
  const hasHalf = score - fullStars >= 0.5
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalf ? 1 : 0))

  return (
    <div className="space-y-10 pt-4 font-sans select-none">
      {/* ========================================================================= */}
      {/* 1. PRODUCER RATINGS (EXACT 1:1 EPIC GAMES STORE MATCH)                    */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Producer Ratings
          </h3>
          <p className="text-xs text-zinc-400">
            Captured from verified producers in the Producer Toy ecosystem.
          </p>
        </div>

        <div className="flex items-center gap-4 pt-1">
          {ratingStats && ratingStats.totalReviews > 0 ? (
            <>
              <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {score.toFixed(1)}
              </span>

              {/* Exact Minimalist Star Glyphs */}
              <div className="flex items-center text-white text-2xl sm:text-3xl tracking-[-3px] select-none">
                {'★'.repeat(fullStars)}
                {hasHalf && '★'}
                <span className="text-zinc-700">{'★'.repeat(emptyStars)}</span>
              </div>

              <span className="text-xs text-zinc-500 font-normal">
                ({ratingStats.totalReviews} {ratingStats.totalReviews === 1 ? 'rating' : 'ratings'})
              </span>
            </>
          ) : (
            <>
              <span className="text-3xl sm:text-4xl font-extrabold text-zinc-500 tracking-tight">
                0.0
              </span>
              <div className="flex items-center text-zinc-700 text-2xl sm:text-3xl tracking-[-3px] select-none">
                ★★★★★
              </div>
              <span className="text-xs text-zinc-400">No ratings yet</span>
            </>
          )}

          {onOpenRatingModal && (
            <button
              type="button"
              onClick={onOpenRatingModal}
              className="ml-2 text-xs text-zinc-400 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
            >
              {ratingStats?.userRating ? `Your rating: ${ratingStats.userRating}★` : 'Rate Product'}
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SYSTEM REQUIREMENTS (EXACT 1:1 EPIC GAMES STORE MATCH)                */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {titleName} System Requirements
        </h3>

        <div className="bg-[#181818] border border-[#242424] rounded-2xl p-6 sm:p-8 space-y-6">
          {/* Windows / Mac Tabs */}
          <div className="border-b border-[#282828] flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActivePlatform('windows')}
              className={`pb-3 text-sm font-semibold relative transition-colors cursor-pointer ${
                activePlatform === 'windows' ? 'text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <WindowsIcon className="w-4 h-4" />
                <span>Windows</span>
              </div>
              {activePlatform === 'windows' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActivePlatform('mac')}
              className={`pb-3 text-sm font-semibold relative transition-colors cursor-pointer ${
                activePlatform === 'mac' ? 'text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <AppleIcon className="w-4 h-4" />
                <span>Mac</span>
              </div>
              {activePlatform === 'mac' && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full" />
              )}
            </button>
          </div>

          {/* Specifications Columns (Minimum vs Recommended) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            {/* Minimum Specs */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white tracking-wide">Minimum</h4>

              <div className="space-y-1">
                <span className="text-xs text-zinc-400 block">OS version</span>
                <span className="text-sm text-white font-medium block">
                  {activePlatform === 'windows' ? 'Windows 10 64-Bit' : 'macOS 10.15 Catalina or higher'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-zinc-400 block">CPU</span>
                <span className="text-sm text-white font-medium block">
                  {activePlatform === 'windows'
                    ? '64-Bit Intel / AMD Dual Core Processor'
                    : 'Apple Silicon (M1/M2/M3/M4) or Intel Core i5'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-zinc-400 block">Memory</span>
                <span className="text-sm text-white font-medium block">4 GB RAM</span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-zinc-400 block">Storage</span>
                <span className="text-sm text-white font-medium block">
                  500 MB available space
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-zinc-400 block">Plugin Format</span>
                <span className="text-sm text-white font-medium block">
                  {cat === 'plugin'
                    ? activePlatform === 'windows'
                      ? 'VST3, AAX (64-Bit)'
                      : 'VST3, AU, AAX (Universal 64-Bit)'
                    : '24-Bit / 44.1kHz WAV Audio'}
                </span>
              </div>
            </div>

            {/* Recommended Specs */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-white tracking-wide">Recommended</h4>

              <div className="space-y-1">
                <span className="text-xs text-zinc-400 block">OS version</span>
                <span className="text-sm text-white font-medium block">
                  {activePlatform === 'windows' ? 'Windows 11 64-Bit' : 'macOS 14 Sonoma / macOS 15 Sequoia'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-zinc-400 block">CPU</span>
                <span className="text-sm text-white font-medium block">
                  {activePlatform === 'windows'
                    ? 'Intel Core i5 / AMD Ryzen 5 or higher'
                    : 'Apple Silicon M1 Pro / M2 / M3 / M4'}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-zinc-400 block">Memory</span>
                <span className="text-sm text-white font-medium block">8 GB RAM or more</span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-zinc-400 block">Storage</span>
                <span className="text-sm text-white font-medium block">
                  Solid State Drive (SSD) Recommended
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-zinc-400 block">Host Compatibility</span>
                <span className="text-sm text-white font-medium block">{daws}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
