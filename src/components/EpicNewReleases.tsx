'use client'

import React, { useRef, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Product } from '@/components/ProductCard'
import { useCurrency } from '@/context/CurrencyContext'
import { getCdnImageUrl } from '@/lib/cdn'

interface EpicNewReleasesProps {
  products: Product[]
}

export function EpicNewReleases({ products = [] }: EpicNewReleasesProps) {
  const { formatPrice } = useCurrency()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // 1. Sort products strictly by created_at (newest releases first)
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })
  }, [products])

  // 2. Chunk products into columns of exactly 3 products per vertical slide
  const productColumns = useMemo(() => {
    const cols: Product[][] = []
    for (let i = 0; i < sortedProducts.length; i += 3) {
      cols.push(sortedProducts.slice(i, i + 3))
    }
    return cols
  }, [sortedProducts])

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      // Scroll by 1 column width on mobile, 2 columns on desktop
      const scrollAmount = direction === 'left' ? -340 : 340
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (sortedProducts.length === 0) return null

  return (
    <section className="w-full select-none my-8 sm:my-12">
      {/* Top Header Row with Navigation Controls */}
      <div className="flex items-center justify-end mb-3 sm:mb-4">
        {productColumns.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScroll('left')}
              className="w-8 h-8 rounded-full bg-[#202020] hover:bg-[#303030] text-zinc-300 hover:text-white flex items-center justify-center transition-colors shadow-md active:scale-95 cursor-pointer"
              aria-label="Previous releases"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-8 h-8 rounded-full bg-[#202020] hover:bg-[#303030] text-zinc-300 hover:text-white flex items-center justify-center transition-colors shadow-md active:scale-95 cursor-pointer"
              aria-label="Next releases"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Container: Left Featured Card + Right Side-Scrollable 3-Item Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Featured "NEW RELEASES" Visual Card (Static Orange Theme)    */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 xl:col-span-4 flex flex-col">
          <Link
            href="/store?sort=newest"
            prefetch={true}
            className="relative w-full h-[220px] sm:h-[300px] lg:h-full min-h-0 lg:min-h-[380px] rounded-2xl overflow-hidden p-5 sm:p-8 flex flex-col justify-between items-center text-center shadow-2xl select-none cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #180902 0%, #301305 25%, #5e2105 60%, #180902 100%)',
            }}
          >
            {/* Background Producer Toy Brand Fiery / Crystal Accents */}
            <div className="absolute inset-0 opacity-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#FA742B]/35 via-[#E05A18]/20 to-transparent pointer-events-none" />
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#FA742B]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#FF9933]/25 rounded-full blur-3xl pointer-events-none" />

            {/* Glowing Polygonal Prisms Decor */}
            <div className="relative z-10 w-full flex-1 flex items-center justify-center">
              <div className="space-y-2 sm:space-y-3">
                {/* 3D-Style Bold Typography (Exact Epic Games Match) */}
                <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-black uppercase tracking-wider text-white leading-none drop-shadow-[0_8px_24px_rgba(0,0,0,0.85)] font-sans">
                  NEW<br />RELEASES
                </h2>
                <div className="w-10 sm:w-14 h-0.5 sm:h-1 bg-gradient-to-r from-[#FA742B] to-[#FFB074] mx-auto rounded-full shadow-[0_0_10px_#FA742B]" />
              </div>
            </div>

            {/* "See All" Action Button (Exact Epic Games Style Solid White Pill) */}
            <div className="relative z-10 w-full flex justify-center pt-2 sm:pt-4">
              <span className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs sm:text-sm px-6 sm:px-8 py-2 sm:py-2.5 rounded-lg shadow-xl transition-colors active:scale-95">
                See All
              </span>
            </div>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Side-Scrollable Horizontal Carousel (3 Products per Column) */}
        {/* ========================================================================= */}
        <div 
          ref={scrollContainerRef}
          className="lg:col-span-8 xl:col-span-8 flex gap-3 sm:gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {productColumns.map((colItems, colIndex) => (
            <div
              key={colIndex}
              className="w-[86vw] max-w-[340px] sm:w-[320px] lg:w-[calc(50%-8px)] flex-shrink-0 snap-start flex flex-col gap-2.5 sm:gap-3"
            >
              {colItems.map((item) => {
                const isFree = Number(item.price_usd) === 0
                const hasDiscount =
                  item.original_price_usd &&
                  Number(item.original_price_usd) > Number(item.price_usd)
                const discountPercent = hasDiscount
                  ? Math.round(
                      ((Number(item.original_price_usd) - Number(item.price_usd)) /
                        Number(item.original_price_usd)) *
                        100
                    )
                  : 0

                return (
                  <Link
                    key={item.id}
                    href={`/product/${item.slug}`}
                    prefetch={true}
                    className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl bg-[#181818] hover:bg-[#202020] border border-[#262626] transition-colors duration-150 cursor-pointer select-none"
                  >
                    {/* Square Thumbnail */}
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-[#202020] border border-[#2e2e2e] flex-shrink-0 shadow-md">
                      <Image
                        src={getCdnImageUrl(item.cover_image, { width: 240 })}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover object-center"
                      />
                    </div>

                    {/* Meta & Price Info (Static Solid White Text) */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center space-y-0.5 sm:space-y-1">
                      {/* Product Title */}
                      <h3 className="font-bold text-white text-xs sm:text-sm leading-snug line-clamp-1">
                        {item.name}
                      </h3>

                      {/* "Now on Producer Toy" Badge */}
                      <span className="text-[10px] sm:text-[11px] text-zinc-400 font-medium truncate block">
                        Now On Producer Toy
                      </span>

                      {/* Pricing Row */}
                      <div className="flex items-center gap-2 pt-0.5">
                        {isFree ? (
                          <span className="text-white font-extrabold text-xs sm:text-sm tracking-tight">
                            Free
                          </span>
                        ) : hasDiscount ? (
                          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <span className="bg-[#0074e4] text-white font-black text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded">
                              -{discountPercent}%
                            </span>
                            <span className="line-through text-zinc-500 text-[11px] sm:text-xs font-normal">
                              {formatPrice(item.original_price_inr, Number(item.original_price_usd))}
                            </span>
                            <span className="text-white font-extrabold text-xs sm:text-sm">
                              {formatPrice(item.price_inr, item.price_usd)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-white font-extrabold text-xs sm:text-sm">
                            {formatPrice(item.price_inr, item.price_usd)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
