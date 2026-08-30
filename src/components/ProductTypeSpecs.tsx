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
    delivery_method?: string
    license_type?: string
    file_size?: string
    sample_rate?: string
    bit_depth?: string
    total_files?: string | number
    total_samples?: string | number
    total_presets?: string | number
    synth_name?: string
    daw_name?: string
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

  if (
    pType === 'preset' ||
    pType === 'presets' ||
    pType === 'soundbank' ||
    pType === 'patches'
  ) {
    return 'preset'
  }

  if (
    pType === 'template' ||
    pType === 'templates' ||
    pType === 'project' ||
    pType === 'daw_template' ||
    pType === 'daw_project'
  ) {
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

  if (
    cat.includes('template') ||
    subcat.includes('template') ||
    cat.includes('studio-tools') ||
    subcat.includes('mix-chains')
  ) {
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

  if (name.includes('preset') || name.includes('soundbank') || name.includes('patches') || name.includes('bank')) {
    return 'preset'
  }

  if (name.includes('template') || name.includes('project file') || name.includes('flp') || name.includes('als')) {
    return 'template'
  }

  if (name.includes('bundle') || name.includes('collection') || name.includes('toolkit')) {
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
  const titleName = product.name || 'Product'

  const score = ratingStats && ratingStats.totalReviews > 0 ? ratingStats.averageRating : 0
  const fullStars = Math.floor(score)
  const hasHalf = score - fullStars >= 0.5
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalf ? 1 : 0))

  // Smart Section Title based on Product Type
  const sectionTitle = (() => {
    switch (kind) {
      case 'sample_pack':
        return `${titleName} Technical Specifications & Compatibility`
      case 'preset':
        return `${titleName} Software Requirements & Compatibility`
      case 'template':
        return `${titleName} Project Specifications & Requirements`
      case 'bundle':
        return `${titleName} Package Specifications & Contents`
      case 'plugin':
      default:
        return `${titleName} System Requirements`
    }
  })()

  // Helper values derived from DB or dynamic defaults
  const dbFormat = product.vst_format || product.format
  const dbDaws =
    product.supported_daws ||
    'FL Studio, Ableton Live, Logic Pro, Cubase, Studio One, Pro Tools, Reaper, Bitwig Studio'
  const dbStorage =
    product.file_size ||
    (kind === 'sample_pack' ? '500 MB available space' : kind === 'preset' ? '100 MB available space' : '500 MB available space')

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
      {/* 2. DYNAMIC SYSTEM REQUIREMENTS & SPECIFICATIONS BY PRODUCT TYPE          */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {sectionTitle}
        </h3>

        <div className="bg-[#181818] border border-[#242424] rounded-2xl p-6 sm:p-8 space-y-6">
          {/* Windows / Mac Platform Tabs */}
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

          {/* ========================================================================= */}
          {/* SPECIFICATIONS CONTENT (DYNAMICALLY TAILORED FOR SAMPLE PACK / PRESET / PLUGIN) */}
          {/* ========================================================================= */}
          
          {/* TYPE A: SAMPLE PACK / SOUND KIT / DRUM KIT */}
          {kind === 'sample_pack' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              {/* Left Column: Minimum Requirements */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white tracking-wide">Minimum Requirements</h4>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Operating System</span>
                  <span className="text-sm text-white font-medium block">
                    {activePlatform === 'windows'
                      ? 'Windows 7, 8, 10 or 11 (64-Bit / 32-Bit)'
                      : 'macOS 10.12 Sierra or higher (Intel & Apple Silicon)'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Host & Software</span>
                  <span className="text-sm text-white font-medium block">
                    Any DAW, Audio Editor or Hardware Sampler (FL Studio, Ableton, Logic, MPC, etc.)
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Audio Format</span>
                  <span className="text-sm text-white font-medium block">
                    {dbFormat || '24-Bit / 44.1kHz Lossless WAV Audio'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Memory (RAM)</span>
                  <span className="text-sm text-white font-medium block">2 GB RAM</span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Disk Space</span>
                  <span className="text-sm text-white font-medium block">{dbStorage}</span>
                </div>
              </div>

              {/* Right Column: Recommended & Features */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white tracking-wide">Recommended & Compatibility</h4>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">DAW Compatibility</span>
                  <span className="text-sm text-white font-medium block">
                    100% Universal — Drag & Drop into FL Studio, Ableton Live, Logic Pro, Cubase, Studio One, Reaper & MPC
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Audio Quality</span>
                  <span className="text-sm text-white font-medium block">
                    {product.bit_depth && product.sample_rate
                      ? `${product.bit_depth} / ${product.sample_rate} Mastered & Normalized Audio`
                      : '24-Bit / 44.1kHz High Definition Mastered WAV'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Storage Type</span>
                  <span className="text-sm text-white font-medium block">
                    Solid State Drive (SSD) for instant sample auditioning
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Royalty Status</span>
                  <span className="text-sm text-[#FA742B] font-bold block">
                    100% Royalty-Free for Commercial Streaming & Beat Sales
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Delivery Method</span>
                  <span className="text-sm text-white font-medium block">
                    Instant Cloud Download (.ZIP Archive with full stems & one-shots)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TYPE B: SYNTH PRESETS & SOUNDBANKS */}
          {kind === 'preset' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white tracking-wide">Minimum Requirements</h4>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Required Synthesizer</span>
                  <span className="text-sm text-[#FA742B] font-bold block">
                    {dbFormat || (titleName.toLowerCase().includes('serum') ? 'Xfer Records Serum v1.357+' : titleName.toLowerCase().includes('vital') ? 'Vital Synth v1.5+' : 'Target Synth VST / AU Plugin')}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Operating System</span>
                  <span className="text-sm text-white font-medium block">
                    {activePlatform === 'windows'
                      ? 'Windows 10 / 11 64-Bit'
                      : 'macOS 10.15+ (Intel & Apple Silicon M1/M2/M3/M4)'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Preset Format</span>
                  <span className="text-sm text-white font-medium block">
                    {dbFormat || '.FXP / .VITALBANK / Native Preset Files'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Memory (RAM)</span>
                  <span className="text-sm text-white font-medium block">4 GB RAM</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white tracking-wide">Recommended Specifications</h4>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Host DAW</span>
                  <span className="text-sm text-white font-medium block">
                    Works in any DAW that can host the target synth (FL Studio, Ableton, Logic, etc.)
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Macro Controls</span>
                  <span className="text-sm text-white font-medium block">
                    Custom Macro Controls & Velocity Modulations Assigned
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Licensing</span>
                  <span className="text-sm text-[#FA742B] font-bold block">
                    100% Royalty-Free Commercial Usage
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Storage</span>
                  <span className="text-sm text-white font-medium block">{dbStorage}</span>
                </div>
              </div>
            </div>
          )}

          {/* TYPE C: DAW TEMPLATES & PROJECT FILES */}
          {kind === 'template' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white tracking-wide">Minimum Requirements</h4>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Required DAW</span>
                  <span className="text-sm text-[#FA742B] font-bold block">
                    {dbFormat || (titleName.toLowerCase().includes('fl studio') ? 'FL Studio 21 or higher' : titleName.toLowerCase().includes('ableton') ? 'Ableton Live 11 / 12 Suite' : 'Modern 64-Bit DAW')}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Operating System</span>
                  <span className="text-sm text-white font-medium block">
                    {activePlatform === 'windows' ? 'Windows 10 / 11 64-Bit' : 'macOS 10.15+ (Apple Silicon & Intel)'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Project Contents</span>
                  <span className="text-sm text-white font-medium block">
                    Arrangement, Mixer Routing, Master Bus Chain & Audio Stems
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Memory</span>
                  <span className="text-sm text-white font-medium block">8 GB RAM</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white tracking-wide">Recommended Specifications</h4>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Plugins Required</span>
                  <span className="text-sm text-white font-medium block">
                    Stock DAW Plugins + Pre-Rendered Audio Stems (No 3rd-party required)
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Audio Stems</span>
                  <span className="text-sm text-white font-medium block">
                    24-Bit WAV Stems Included (Usable in ANY DAW)
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Storage</span>
                  <span className="text-sm text-white font-medium block">{dbStorage}</span>
                </div>
              </div>
            </div>
          )}

          {/* TYPE D: VST PLUGINS & AUDIO SOFTWARE */}
          {kind === 'plugin' && (
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
                  <span className="text-sm text-white font-medium block">{dbStorage}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Plugin Format</span>
                  <span className="text-sm text-white font-medium block">
                    {dbFormat ||
                      (activePlatform === 'windows'
                        ? 'VST3, AAX (64-Bit)'
                        : 'VST3, AU, AAX (Universal 64-Bit)')}
                  </span>
                </div>
              </div>

              {/* Recommended Specs */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white tracking-wide">Recommended</h4>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">OS version</span>
                  <span className="text-sm text-white font-medium block">
                    {activePlatform === 'windows'
                      ? 'Windows 11 64-Bit'
                      : 'macOS 14 Sonoma / macOS 15 Sequoia'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">CPU</span>
                  <span className="text-sm text-white font-medium block">
                    {activePlatform === 'windows'
                      ? 'Intel Core i5 / AMD Ryzen 5 or higher'
                      : 'Apple Silicon M1 Pro / M2 / M3 / M4 Native'}
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
                  <span className="text-sm text-white font-medium block">{dbDaws}</span>
                </div>
              </div>
            </div>
          )}

          {/* TYPE E: BUNDLES & COLLECTIONS */}
          {kind === 'bundle' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white tracking-wide">Bundle Overview</h4>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Package Type</span>
                  <span className="text-sm text-[#FA742B] font-bold block">
                    Complete Producer Collection & Audio Toolkit
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Operating System</span>
                  <span className="text-sm text-white font-medium block">
                    {activePlatform === 'windows' ? 'Windows 10 / 11 64-Bit' : 'macOS 10.15+ (Apple Silicon & Intel)'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Included Content</span>
                  <span className="text-sm text-white font-medium block">
                    {dbFormat || 'Full Plugins, Sample Packs, Presets & Templates Bundle'}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-white tracking-wide">Compatibility & License</h4>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Host DAWs</span>
                  <span className="text-sm text-white font-medium block">{dbDaws}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">License</span>
                  <span className="text-sm text-[#FA742B] font-bold block">
                    Commercial Clearance for Worldwide Music Release
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 block">Total Storage</span>
                  <span className="text-sm text-white font-medium block">{dbStorage}</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
