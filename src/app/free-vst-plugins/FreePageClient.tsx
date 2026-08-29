'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Gift, Download, Sparkles, Filter, CheckCircle2, Music, Sliders, Waves, Layers } from 'lucide-react'
import { ProductCard, Product } from '@/components/ProductCard'
import { getCdnImageUrl } from '@/lib/cdn'

interface FreePageClientProps {
  products: Product[]
}

const SUBCATEGORY_LABELS: Record<string, string> = {
  'saturation': 'Saturation & Tape',
  'harmonic-exciter': 'Harmonic Exciter',
  'tape-saturation': 'Tape Saturation',
  'eq': 'Equalizers (EQ)',
  'dynamic-eq': 'Dynamic EQ',
  'parallel-eq': 'Parallel EQ',
  'surgical-eq': 'Surgical EQ',
  'reverb': 'Reverb & Space',
  'space-reverb': 'Space Reverb',
  'delay': 'Delay & Echo',
  'tape-delay': 'Tape Delay',
  'echo': 'Echo Effects',
  'mastering': 'Mastering Tools',
  'auto-tune': 'Pitch & Auto-Tune',
  'drum-kits': 'Drum Kits',
  'sample-packs': 'Sample Packs',
  'trap-drums': 'Trap Drums',
  '808-bass': '808 Sub Bass',
  'sounds': 'Sounds & Loops',
  'effects': 'Audio Effects',
}

export function FreePageClient({ products }: FreePageClientProps) {
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all')

  // Filter out non-free items unless coming soon
  const freeProducts = useMemo(() => {
    return products.filter((p) => Number(p.price_usd) === 0 && !p.is_coming_soon)
  }, [products])

  const comingSoonProducts = useMemo(() => {
    return products.filter((p) => p.is_coming_soon)
  }, [products])

  // Featured flagship giveaway (e.g. Fresh Air or first free item)
  const featuredGiveaway = useMemo(() => {
    return freeProducts.find((p) => p.slug === 'fresh-air') || freeProducts[0] || products[0]
  }, [freeProducts, products])

  // Weekly Free Cards (3-Column layout matching 1:1 Epic Games Store)
  const weeklyFreeCards = useMemo(() => {
    return [
      ...freeProducts.slice(0, 2),
      ...comingSoonProducts.slice(0, 1),
      ...freeProducts.slice(2, 3),
    ].slice(0, 3)
  }, [freeProducts, comingSoonProducts])

  // Secondary Free Banners (2-Column layout)
  const secondaryFreeBanners = useMemo(() => {
    return freeProducts.filter((p) => p.slug !== featuredGiveaway?.slug).slice(0, 2)
  }, [freeProducts, featuredGiveaway])

  // Dynamically extract all available categories / product types from DB products
  const dynamicTypes = useMemo(() => {
    const types = new Set<string>()
    freeProducts.forEach((p) => {
      if (p.product_type) types.add(p.product_type)
    })
    return Array.from(types)
  }, [freeProducts])

  // Dynamically extract all unique subcategories from DB products
  const dynamicSubcategories = useMemo(() => {
    const slugs = new Set<string>()
    freeProducts.forEach((p) => {
      if (Array.isArray(p.category_slugs)) {
        p.category_slugs.forEach((slug) => {
          if (slug && slug !== 'all' && slug !== 'plugins' && slug !== 'sounds') {
            slugs.add(slug)
          }
        })
      }
      if (p.subcategories?.slug) {
        slugs.add(p.subcategories.slug)
      }
    })
    return Array.from(slugs)
  }, [freeProducts])

  // Dynamically filter products based on selected type and subcategory
  const filteredCatalog = useMemo(() => {
    return freeProducts.filter((p) => {
      // Type match
      if (selectedType !== 'all' && p.product_type !== selectedType) {
        return false
      }
      // Subcategory match
      if (selectedSubcategory !== 'all') {
        const hasSlug =
          (Array.isArray(p.category_slugs) && p.category_slugs.includes(selectedSubcategory)) ||
          p.subcategories?.slug === selectedSubcategory
        if (!hasSlug) return false
      }
      return true
    })
  }, [freeProducts, selectedType, selectedSubcategory])

  return (
    <div className="space-y-12">
      
      {/* ========================================================================= */}
      {/* 1. HERO HEADER (1:1 Epic Games Store Layout)                              */}
      {/* ========================================================================= */}
      <div className="space-y-2 max-w-3xl">
        <div className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-400">
          Produce More
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
          Free Producer Toys
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed pt-1">
          Producer Toy gives you free VST plugins, sample packs, synths, and audio tools every week. Download 100% royalty-free tools to produce professional music on FL Studio, Ableton Live, Logic Pro & Cubase.
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 2. FEATURED WEEKLY GIVEAWAY BANNER (1:1 Split Hero Box)                   */}
      {/* ========================================================================= */}
      {featuredGiveaway && (
        <div className="w-full bg-[#18181c] border border-[#26262a] rounded-2xl p-4 sm:p-8 shadow-2xl overflow-hidden group">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            
            {/* Left Column: Big Artwork Image */}
            <div className="lg:col-span-7 relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-[#202024] shadow-xl border border-[#2c2c30]">
              <Image
                src={getCdnImageUrl(featuredGiveaway.cover_image, { width: 1200 })}
                alt={featuredGiveaway.name}
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-300 ease-out"
                priority
              />
              <div className="absolute top-3.5 left-3.5 bg-[#FA742B] text-black font-black text-xs px-3.5 py-1 rounded-md uppercase tracking-wider shadow-md">
                Featured Free Toy
              </div>
            </div>

            {/* Right Column: Giveaway Copy & CTA */}
            <div className="lg:col-span-5 flex flex-col justify-center space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <span className="text-xs sm:text-sm font-bold text-[#FA742B] tracking-wide uppercase">
                  Weekly Free Plugin Giveaway
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                  {featuredGiveaway.name}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Get premium music production software for free! Direct downloads available globally for 64-bit Windows & macOS with instant cloud library sync.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <Link
                  href={`/product/${featuredGiveaway.slug}`}
                  prefetch={true}
                  className="h-12 px-6 rounded-xl bg-[#FA742B] hover:bg-[#E05A18] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FA742B]/20 transition-all active:scale-[0.98]"
                >
                  <Download className="w-4 h-4 stroke-[3]" />
                  <span>Claim Free Plugin</span>
                </Link>

                <Link
                  href="/store"
                  prefetch={true}
                  className="h-12 px-5 rounded-xl bg-transparent hover:bg-[#222226] text-white border border-[#383840] hover:border-zinc-400 font-bold text-sm flex items-center justify-center transition-all"
                >
                  Browse Store
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. WEEKLY FREE TOYS (1:1 Epic Games Store 3-Col Landscape Grid)           */}
      {/* ========================================================================= */}
      <div className="space-y-5">
        <div className="flex items-center gap-2.5">
          <Gift className="w-5 h-5 text-[#FA742B]" />
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Weekly Free Drops
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weeklyFreeCards.map((product) => {
            const isComingSoon = product.is_coming_soon
            const brandName = (product.brands as any)?.name || product.brand || 'Producer Toy'

            return (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                prefetch={true}
                className="group flex flex-col cursor-pointer select-none"
              >
                {/* 16:9 Landscape Card with Attached Bottom Status Bar */}
                <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-[#202024] border border-[#2c2c30] shadow-lg flex flex-col justify-end">
                  <Image
                    src={getCdnImageUrl(product.cover_image, { width: 800 })}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 group-hover:brightness-110 transition-all duration-300 ease-out"
                  />

                  {/* Flush Bottom Status Bar on the Image */}
                  <div
                    className={`relative z-10 w-full py-2 px-3 text-center text-xs font-black tracking-wider uppercase transition-colors ${
                      isComingSoon
                        ? 'bg-[#000000]/95 text-white border-t border-white/10'
                        : 'bg-[#FA742B] text-black shadow-md'
                    }`}
                  >
                    {isComingSoon ? 'COMING SOON' : 'FREE NOW'}
                  </div>
                </div>

                {/* Text Details Below Card */}
                <div className="mt-3 space-y-0.5">
                  <h3 className="font-bold text-base sm:text-[17px] text-white group-hover:text-[#FA742B] transition-colors leading-snug line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-400 font-normal">
                    {isComingSoon
                      ? 'Coming Soon — Next Drop'
                      : 'Free Now — Unlimited Download'}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TOP FREEWARE BANNERS (2-Column Wide Grid)                              */}
      {/* ========================================================================= */}
      {secondaryFreeBanners.length > 0 && (
        <div className="space-y-5 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Top Free-to-Use Audio Tools
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {secondaryFreeBanners.map((product) => {
              const brandName = (product.brands as any)?.name || product.brand || 'Producer Toy'

              return (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  prefetch={true}
                  className="group relative w-full aspect-[2/1] rounded-2xl overflow-hidden bg-[#18181c] border border-[#28282c] shadow-xl flex flex-col justify-end p-5 sm:p-6"
                >
                  <Image
                    src={getCdnImageUrl(product.cover_image, { width: 1000 })}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-center group-hover:scale-105 group-hover:brightness-90 transition-all duration-300 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                  <div className="relative z-10 space-y-1.5">
                    <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                      Free Freeware
                    </span>
                    <h3 className="text-lg sm:text-2xl font-black text-white group-hover:text-[#FA742B] transition-colors leading-tight">
                      {product.name}
                    </h3>
                    <p className="text-xs text-zinc-300 font-medium">
                      By {brandName} • 100% Free VST3 / AU
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. DYNAMIC CATALOG: MAIN CATEGORIES & SUBCATEGORIES FILTER                */}
      {/* ========================================================================= */}
      <div className="space-y-6 pt-6 border-t border-[#222226]">
        
        {/* Dynamic Header & Category Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Explore All Free Audio Tools ({filteredCatalog.length})
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Instant direct downloads for FL Studio, Ableton Live, Logic Pro, Cubase & Studio One.
            </p>
          </div>

          {/* Dynamic Product Type Tabs */}
          <div className="flex items-center gap-1.5 bg-[#18181c] p-1.5 rounded-xl border border-[#28282c] shrink-0 overflow-x-auto custom-scrollbar">
            <button
              type="button"
              onClick={() => {
                setSelectedType('all')
                setSelectedSubcategory('all')
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedType === 'all'
                  ? 'bg-[#FA742B] text-white shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-[#222226]'
              }`}
            >
              All Tools
            </button>
            {dynamicTypes.map((type) => {
              const label =
                type === 'plugin'
                  ? 'Plugins (VST3/AU)'
                  : type === 'sample_pack'
                  ? 'Sample Packs & Sounds'
                  : type === 'preset'
                  ? 'Synth Presets'
                  : type === 'template'
                  ? 'DAW Templates'
                  : type
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setSelectedType(type)
                    setSelectedSubcategory('all')
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedType === type
                      ? 'bg-[#FA742B] text-white shadow-md'
                      : 'text-zinc-400 hover:text-white hover:bg-[#222226]'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Dynamic Subcategory Filter Chips */}
        {dynamicSubcategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setSelectedSubcategory('all')}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl border whitespace-nowrap transition-all cursor-pointer ${
                selectedSubcategory === 'all'
                  ? 'bg-white text-black border-white shadow-sm'
                  : 'bg-[#18181c] hover:bg-[#222226] text-zinc-400 hover:text-white border-[#2c2c30]'
              }`}
            >
              All Subcategories
            </button>
            {dynamicSubcategories.map((slug) => {
              const label =
                SUBCATEGORY_LABELS[slug] ||
                slug
                  .split('-')
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ')

              const isSelected = selectedSubcategory === slug
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => setSelectedSubcategory(isSelected ? 'all' : slug)}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl border whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white text-black border-white shadow-sm'
                      : 'bg-[#18181c] hover:bg-[#222226] text-zinc-400 hover:text-white border-[#2c2c30]'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        )}

        {/* Filtered Products Grid */}
        {filteredCatalog.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
            {filteredCatalog.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-zinc-400 bg-[#18181c] rounded-2xl border border-[#26262a] space-y-3">
            <p className="text-sm font-medium">No free tools match your selected filter.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedType('all')
                setSelectedSubcategory('all')
              }}
              className="text-xs text-[#FA742B] hover:underline font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>

    </div>
  )
}
