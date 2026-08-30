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
    id?: string
    name?: string
    product_type?: string
    vst_format?: string
    format?: string
    supported_daws?: string
    operating_system?: string
    license_type?: string
    file_size?: string
    sample_rate?: string
    bit_depth?: string
    category_name?: string
    subcategory_name?: string
    categories?: { name?: string; slug?: string } | null
    subcategories?: { name?: string; slug?: string } | null
    brands?: { name?: string; slug?: string } | null
    brand?: string
    [key: string]: any
  }
  ratingStats?: {
    averageRating: number
    totalReviews: number
    userRating?: number
  }
  onOpenRatingModal?: () => void
}

export type ProductKind = 'plugin' | 'sample_pack' | 'preset' | 'template' | 'bundle'

export function detectProductCategory(product: any): ProductKind {
  const pType = (product?.product_type || '').toLowerCase().trim()
  const name = (product?.name || '').toLowerCase()
  const cat = (
    product?.category_name ||
    product?.categories?.name ||
    product?.categories?.slug ||
    product?.category ||
    ''
  ).toLowerCase()
  const subcat = (
    product?.subcategory_name ||
    product?.subcategories?.name ||
    product?.subcategories?.slug ||
    ''
  ).toLowerCase()

  // 1. Explicit Product Types (Strict DB match)
  if (
    pType === 'sample_pack' ||
    pType === 'samplepack' ||
    pType === 'sound_kit' ||
    pType === 'soundkit' ||
    pType === 'sounds' ||
    pType === 'samples' ||
    pType === 'drum_kit' ||
    pType === 'loop_kit'
  ) {
    return 'sample_pack'
  }

  if (pType === 'preset' || pType === 'presets' || pType === 'soundbank' || pType === 'patches') {
    return 'preset'
  }

  if (pType === 'template' || pType === 'templates' || pType === 'project' || pType === 'daw_template') {
    return 'template'
  }

  if (pType === 'bundle' || pType === 'bundles' || pType === 'suite') {
    return 'bundle'
  }

  if (pType === 'plugin' || pType === 'vst' || pType === 'effect' || pType === 'instrument') {
    return 'plugin'
  }

  // 2. Category / Subcategory inferences
  if (
    cat.includes('sound') ||
    cat.includes('sample') ||
    cat.includes('drum') ||
    subcat.includes('sample') ||
    subcat.includes('drum') ||
    subcat.includes('loops') ||
    subcat.includes('808')
  ) {
    return 'sample_pack'
  }

  if (cat.includes('preset') || subcat.includes('preset')) {
    return 'preset'
  }

  if (cat.includes('template') || subcat.includes('template') || cat.includes('studio-tools')) {
    return 'template'
  }

  if (cat.includes('bundle') || subcat.includes('bundle')) {
    return 'bundle'
  }

  // 3. Name-based heuristics
  if (
    name.includes('sample pack') ||
    name.includes('drum kit') ||
    name.includes('sound kit') ||
    name.includes('wav kit') ||
    name.includes('loop kit') ||
    name.includes('melody kit') ||
    name.includes('one shot') ||
    name.includes('rhythm') ||
    name.includes('808 kit') ||
    name.includes('samples')
  ) {
    return 'sample_pack'
  }

  if (name.includes('preset') || name.includes('soundbank') || name.includes('patches')) {
    return 'preset'
  }

  if (name.includes('template') || name.includes('project file') || name.includes('flp')) {
    return 'template'
  }

  if (name.includes('bundle') || name.includes('collection')) {
    return 'bundle'
  }

  if (
    name.includes('vst') ||
    name.includes('plugin') ||
    name.includes('effect') ||
    name.includes('synthesizer') ||
    name.includes('saturat') ||
    name.includes('reverb') ||
    name.includes('delay') ||
    name.includes('compress') ||
    name.includes('eq') ||
    cat.includes('effects') ||
    cat.includes('instruments')
  ) {
    return 'plugin'
  }

  return 'sample_pack'
}

export function ProductSpecsOverview({
  product,
  ratingStats,
  onOpenRatingModal,
}: ProductTypeProps) {
  const [activePlatform, setActivePlatform] = useState<'windows' | 'mac'>('windows')
  const kind = detectProductCategory(product)

  const score = ratingStats && ratingStats.totalReviews > 0 ? ratingStats.averageRating : 0
  const fullStars = Math.floor(score)
  const hasHalf = score - fullStars >= 0.5
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalf ? 1 : 0))

  const dbFormat = product.vst_format || product.format
  const dbStorage = product.file_size || (kind === 'sample_pack' ? '500 MB' : kind === 'preset' ? '100 MB' : '500 MB')
  const isPlugin = kind === 'plugin'

  return (
    <div className="space-y-8 pt-2 font-sans select-none">
      {/* ========================================================================= */}
      {/* 1. PRODUCER RATINGS                                                       */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          Producer Ratings
        </h3>

        <div className="flex items-center gap-3">
          {ratingStats && ratingStats.totalReviews > 0 ? (
            <>
              <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {score.toFixed(1)}
              </span>

              <div className="flex items-center text-white text-xl sm:text-2xl tracking-[-2px] select-none">
                {'★'.repeat(fullStars)}
                {hasHalf && '★'}
                <span className="text-zinc-700">{'★'.repeat(emptyStars)}</span>
              </div>

              <span className="text-xs text-zinc-500 font-normal">
                ({ratingStats.totalReviews})
              </span>
            </>
          ) : (
            <>
              <span className="text-2xl sm:text-3xl font-extrabold text-zinc-500 tracking-tight">
                0.0
              </span>
              <div className="flex items-center text-zinc-700 text-xl sm:text-2xl tracking-[-2px] select-none">
                ★★★★★
              </div>
              <span className="text-xs text-zinc-400">No ratings yet</span>
            </>
          )}

          {onOpenRatingModal && (
            <button
              type="button"
              onClick={onOpenRatingModal}
              className="ml-1 text-xs text-zinc-400 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
            >
              {ratingStats?.userRating ? `Your rating: ${ratingStats.userRating}★` : 'Rate Product'}
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SPECIFICATIONS / REQUIREMENTS CARD (CLEAN & MINIMALIST)                */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
          {isPlugin ? 'System Requirements' : 'Specifications'}
        </h3>

        <div className="bg-[#181818] border border-[#242424] rounded-2xl p-5 sm:p-6">
          {/* A. VST PLUGIN: CLEAN 2-COLUMN MINIMUM VS RECOMMENDED */}
          {isPlugin ? (
            <div className="space-y-5">
              {/* Windows / Mac Tabs */}
              <div className="border-b border-[#282828] flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => setActivePlatform('windows')}
                  className={`pb-2.5 text-xs sm:text-sm font-semibold relative transition-colors cursor-pointer ${
                    activePlatform === 'windows' ? 'text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <WindowsIcon className="w-3.5 h-3.5" />
                    <span>Windows</span>
                  </div>
                  {activePlatform === 'windows' && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActivePlatform('mac')}
                  className={`pb-2.5 text-xs sm:text-sm font-semibold relative transition-colors cursor-pointer ${
                    activePlatform === 'mac' ? 'text-white font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <AppleIcon className="w-3.5 h-3.5" />
                    <span>Mac</span>
                  </div>
                  {activePlatform === 'mac' && (
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full" />
                  )}
                </button>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                    Minimum
                  </span>
                  <div>
                    <span className="text-xs text-zinc-500 block">OS</span>
                    <span className="text-white font-medium">
                      {activePlatform === 'windows' ? 'Windows 10 (64-Bit)' : 'macOS 10.15+ (Intel & Silicon)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500 block">CPU & RAM</span>
                    <span className="text-white font-medium">Dual Core CPU • 4 GB RAM</span>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500 block">Plugin Format</span>
                    <span className="text-white font-medium">
                      {dbFormat || (activePlatform === 'windows' ? 'VST3, AAX (64-Bit)' : 'VST3, AU, AAX')}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                    Recommended
                  </span>
                  <div>
                    <span className="text-xs text-zinc-500 block">OS</span>
                    <span className="text-white font-medium">
                      {activePlatform === 'windows' ? 'Windows 11 (64-Bit)' : 'macOS 14 Sonoma / 15 Sequoia'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500 block">CPU & RAM</span>
                    <span className="text-white font-medium">Intel i5 / Ryzen 5 / Apple M-Series • 8 GB RAM</span>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-500 block">DAW Compatibility</span>
                    <span className="text-white font-medium">FL Studio, Ableton, Logic, Cubase, Studio One</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* B. SAMPLE PACK / PRESET / TEMPLATE: SLEEK COMPACT 2x3 GRID */
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 sm:gap-y-5 gap-x-4 text-xs sm:text-sm">
              {/* 1. Format */}
              <div>
                <span className="text-xs text-zinc-500 block">Format</span>
                <span className="text-white font-semibold block">
                  {dbFormat || (kind === 'sample_pack' ? '24-Bit WAV / STEMS' : kind === 'preset' ? 'Synth Presets (.FXP)' : 'DAW Project File')}
                </span>
              </div>

              {/* 2. Compatibility */}
              <div>
                <span className="text-xs text-zinc-500 block">Compatibility</span>
                <span className="text-white font-semibold block">
                  {kind === 'preset'
                    ? product.name?.toLowerCase().includes('serum')
                      ? 'Xfer Serum v1.357+'
                      : product.name?.toLowerCase().includes('vital')
                      ? 'Vital Synth v1.5+'
                      : 'All Compatible DAWs'
                    : 'All DAWs & Samplers'}
                </span>
              </div>

              {/* 3. Platform */}
              <div>
                <span className="text-xs text-zinc-500 block">Platform</span>
                <span className="text-white font-semibold block">
                  Windows & macOS
                </span>
              </div>

              {/* 4. File Size */}
              <div>
                <span className="text-xs text-zinc-500 block">Download Size</span>
                <span className="text-white font-semibold block">{dbStorage}</span>
              </div>

              {/* 5. License */}
              <div>
                <span className="text-xs text-zinc-500 block">License</span>
                <span className="text-[#FA742B] font-semibold block">
                  100% Royalty-Free
                </span>
              </div>

              {/* 6. Delivery */}
              <div>
                <span className="text-xs text-zinc-500 block">Delivery</span>
                <span className="text-white font-semibold block">
                  Instant Download (.ZIP)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
