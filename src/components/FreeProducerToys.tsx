'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Gift } from 'lucide-react'
import { Product } from '@/components/ProductCard'
import { getCdnImageUrl } from '@/lib/cdn'

interface FreeProducerToysProps {
  products?: Product[]
}

interface FreeItemDisplay {
  id: string
  name: string
  slug: string
  cover_image: string
  status: 'free_now' | 'coming_soon'
  badge_text: string
  subtitle: string
  brand?: string
}

export function FreeProducerToys({ products = [] }: FreeProducerToysProps) {
  // 1. Find all active free products from the database (price_usd === 0)
  const freeProductsFromDb = products.filter(
    (p) => Number(p.price_usd) === 0
  )

  // Default curated fallback showcase if DB has fewer items
  const defaultFreeShowcase: FreeItemDisplay[] = [
    {
      id: 'free-1',
      name: 'TDR Nova Dynamic Precision EQ',
      slug: 'tdr-nova',
      cover_image: 'https://imagizer.imageshack.com/img922/4266/oEGOCb.png',
      status: 'free_now',
      badge_text: 'FREE NOW',
      subtitle: 'Free Now - 100% Royalty Free',
      brand: 'Tokyo Dawn Labs',
    },
    {
      id: 'free-2',
      name: 'Valhalla Supermassive Space Echo',
      slug: 'supermassive',
      cover_image: 'https://imagizer.imageshack.com/img924/8785/ZZlWA9.png',
      status: 'free_now',
      badge_text: 'FREE NOW',
      subtitle: 'Free Now - Instant Download',
      brand: 'Valhalla DSP',
    },
    {
      id: 'free-3',
      name: 'Fresh Air Dynamic High Exciter',
      slug: 'fresh-air',
      cover_image: 'https://imagizer.imageshack.com/img921/4770/lbZQ86.png',
      status: 'coming_soon',
      badge_text: 'COMING SOON',
      subtitle: 'Free Next Week - Studio Grade',
      brand: 'Slate Digital',
    },
    {
      id: 'free-4',
      name: 'Ample Guitar M Lite Acoustic VST',
      slug: 'Ample-Guitar-M-Lite-II',
      cover_image: 'https://imagizer.imageshack.com/img924/3264/Qym6pY.png',
      status: 'coming_soon',
      badge_text: 'COMING SOON',
      subtitle: 'Free Next Week - Multi-Sampled',
      brand: 'Ample Sound',
    },
  ]

  // Merge DB free products with showcase items to ensure exactly 4 cards
  const displayItems: FreeItemDisplay[] = (() => {
    if (freeProductsFromDb.length >= 4) {
      return freeProductsFromDb.slice(0, 4).map((p, idx) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        cover_image: p.cover_image,
        status: idx >= 2 ? 'coming_soon' : 'free_now',
        badge_text: idx >= 2 ? 'COMING SOON' : 'FREE NOW',
        subtitle: idx >= 2 ? 'Free Next Week' : 'Free Now - Always Free',
        brand: p.brand || 'Producer Toy',
      }))
    }

    // Fill in from default showcase
    const items: FreeItemDisplay[] = freeProductsFromDb.map((p, idx) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      cover_image: p.cover_image,
      status: (idx >= 2 ? 'coming_soon' : 'free_now') as 'free_now' | 'coming_soon',
      badge_text: idx >= 2 ? 'COMING SOON' : 'FREE NOW',
      subtitle: idx >= 2 ? 'Free Next Week' : 'Free Now - Always Free',
      brand: p.brand || 'Producer Toy',
    }))

    for (const def of defaultFreeShowcase) {
      if (items.length >= 4) break
      if (!items.some((it) => it.slug === def.slug)) {
        items.push(def)
      }
    }

    return items.slice(0, 4)
  })()

  return (
    <section className="w-full select-none">
      {/* Outer Epic Games Container Box */}
      <div className="w-full bg-[#181818] border border-[#262626] rounded-2xl p-5 sm:p-7 md:p-8 shadow-2xl">
        
        {/* Section Header: Gift Icon + Free Producer Toys + View More */}
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <div className="flex items-center gap-3">
            {/* White Line Art Gift Box Icon */}
            <div className="text-white flex-shrink-0">
              <Gift className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Free Producer Toys
            </h2>
          </div>

          {/* View More Bordered Action Button */}
          <Link
            href="/store?free=true"
            prefetch={true}
            className="px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white hover:text-white bg-transparent hover:bg-white/10 border border-white/20 hover:border-white rounded-lg transition-all cursor-pointer inline-flex items-center justify-center active:scale-95"
          >
            View More
          </Link>
        </div>

        {/* 4 Cards Grid (Exact Epic Games Store Layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {displayItems.map((item) => {
            const isFreeNow = item.status === 'free_now'

            return (
              <Link
                key={item.id}
                href={`/product/${item.slug}`}
                prefetch={true}
                className="group flex flex-col select-none cursor-pointer"
              >
                {/* 3:4 Poster Image Container */}
                <div className="relative w-full aspect-[3/4] rounded-t-xl overflow-hidden bg-[#202020] border-t border-x border-[#282828]">
                  <Image
                    src={getCdnImageUrl(item.cover_image, { width: 600 })}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-300 ease-out"
                  />

                  {/* Subtle Light Glow on Hover */}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                </div>

                {/* Flush Bottom Action Bar (Brand Orange for FREE NOW, Dark for COMING SOON) */}
                {isFreeNow ? (
                  <div className="bg-[#FA742B] group-hover:bg-[#FC6301] text-black font-black text-[11.5px] sm:text-[12px] py-2 px-3 text-center uppercase tracking-wider rounded-b-xl shadow-md transition-colors">
                    {item.badge_text || 'FREE NOW'}
                  </div>
                ) : (
                  <div className="bg-[#111111] text-zinc-400 font-bold text-[11.5px] sm:text-[12px] py-2 px-3 text-center uppercase tracking-wider rounded-b-xl border border-t-0 border-[#262626]">
                    {item.badge_text || 'COMING SOON'}
                  </div>
                )}

                {/* Product Title & Timing/Subtitle Details */}
                <div className="flex flex-col mt-2.5 px-0.5">
                  <h3 className="font-bold text-white text-sm sm:text-[15px] tracking-tight leading-snug line-clamp-1 group-hover:text-zinc-200 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-1 font-medium">
                    {item.subtitle}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>

      </div>
    </section>
  )
}
