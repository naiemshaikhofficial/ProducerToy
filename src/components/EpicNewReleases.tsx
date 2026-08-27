'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Product } from '@/components/ProductCard'
import { useCurrency } from '@/context/CurrencyContext'
import { getCdnImageUrl } from '@/lib/cdn'

interface EpicNewReleasesProps {
  products: Product[]
}

const ITEMS_PER_PAGE = 6

export function EpicNewReleases({ products = [] }: EpicNewReleasesProps) {
  const { formatPrice } = useCurrency()
  const [currentPage, setCurrentPage] = useState(0)

  // 1. Sort products strictly by created_at (newest releases first)
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })
  }, [products])

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE))

  const currentItems = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE
    return sortedProducts.slice(start, start + ITEMS_PER_PAGE)
  }, [sortedProducts, currentPage])

  const handlePrev = () => {
    setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1))
  }

  const handleNext = () => {
    setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0))
  }

  if (sortedProducts.length === 0) return null

  return (
    <section className="w-full select-none my-8 sm:my-12">
      {/* Top Header Row with Pagination Controls */}
      <div className="flex items-center justify-end mb-4">
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="w-8 h-8 rounded-full bg-[#202020] hover:bg-[#303030] text-zinc-300 hover:text-white flex items-center justify-center transition-colors shadow-md active:scale-95 cursor-pointer"
              aria-label="Previous releases page"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="w-8 h-8 rounded-full bg-[#202020] hover:bg-[#303030] text-zinc-300 hover:text-white flex items-center justify-center transition-colors shadow-md active:scale-95 cursor-pointer"
              aria-label="Next releases page"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Left Featured Card (1:1 / 4:5 aspect) + Right 2-Column List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Featured "NEW RELEASES" Visual Card (Static Orange Theme)    */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 xl:col-span-4 flex flex-col">
          <Link
            href="/store?sort=newest"
            prefetch={true}
            className="relative w-full h-[320px] sm:h-[380px] lg:h-full min-h-[360px] rounded-2xl overflow-hidden p-6 sm:p-8 flex flex-col justify-between items-center text-center shadow-2xl select-none cursor-pointer"
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
              <div className="space-y-3">
                {/* 3D-Style Bold Typography (Exact Epic Games Match) */}
                <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black uppercase tracking-wider text-white leading-none drop-shadow-[0_8px_24px_rgba(0,0,0,0.85)] font-sans">
                  NEW<br />RELEASES
                </h2>
                <div className="w-14 h-1 bg-gradient-to-r from-[#FA742B] to-[#FFB074] mx-auto rounded-full shadow-[0_0_10px_#FA742B]" />
              </div>
            </div>

            {/* "See All" Action Button (Exact Epic Games Style Solid White Pill) */}
            <div className="relative z-10 w-full flex justify-center pt-4">
              <span className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs sm:text-sm px-8 py-2.5 rounded-lg shadow-xl transition-colors active:scale-95">
                See All
              </span>
            </div>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: 2-Column x 3-Row List (Static Clean Cards, Exact Epic Match)*/}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 sm:gap-y-4">
          {currentItems.map((item) => {
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
                className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-[#202020] transition-colors duration-150 cursor-pointer select-none"
              >
                {/* 3:4 or Square Thumbnail (Static, Exact 1:1 Epic Games Match) */}
                <div className="relative w-14 h-16 sm:w-16 sm:h-20 rounded-xl overflow-hidden bg-[#202020] border border-[#282828] flex-shrink-0 shadow-md">
                  <Image
                    src={getCdnImageUrl(item.cover_image, { width: 240 })}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover object-center"
                  />
                </div>

                {/* Meta & Price Info (Static Solid White Text, No Color Change on Hover) */}
                <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1">
                  {/* Product Title */}
                  <h3 className="font-bold text-white text-sm sm:text-[15px] leading-snug line-clamp-1">
                    {item.name}
                  </h3>

                  {/* "Now on Producer Toy" Badge */}
                  <span className="text-[11px] sm:text-xs text-zinc-400 font-medium truncate block">
                    Now On Producer Toy
                  </span>

                  {/* Pricing Row */}
                  <div className="flex items-center gap-2 pt-0.5">
                    {isFree ? (
                      <span className="text-white font-extrabold text-xs sm:text-sm tracking-tight">
                        Free
                      </span>
                    ) : hasDiscount ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-[#0074e4] text-white font-black text-[11px] px-1.5 py-0.5 rounded">
                          -{discountPercent}%
                        </span>
                        <span className="line-through text-zinc-500 text-xs font-normal">
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

      </div>
    </section>
  )
}
