'use client'

import React, { useRef, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Bookmark } from 'lucide-react'
import { Product } from '@/components/ProductCard'
import { useCurrency } from '@/context/CurrencyContext'
import { useWishlist } from '@/context/WishlistContext'
import { getCdnImageUrl } from '@/lib/cdn'

interface EpicNewReleasesProps {
  products: Product[]
}

export function EpicNewReleases({ products = [] }: EpicNewReleasesProps) {
  const { formatPrice, convertUsdToInr } = useCurrency()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // 1. Sort products strictly by created_at (newest releases first)
  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })
  }, [products])

  // 2. Group products into columns of exactly 3 products per vertical slide
  const productColumns = useMemo(() => {
    const cols: Product[][] = []
    for (let i = 0; i < sortedProducts.length; i += 3) {
      cols.push(sortedProducts.slice(i, i + 3))
    }
    return cols
  }, [sortedProducts])

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  const handleBookmarkClick = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    e.stopPropagation()
    const priceUsd = Number(product.price_usd) || 0
    const priceInr = product.price_inr ? Number(product.price_inr) : convertUsdToInr(priceUsd)
    const originalPriceInr = product.original_price_usd ? convertUsdToInr(Number(product.original_price_usd)) : undefined

    await toggleWishlist({
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brands?.name || product.brand || 'Producer Toy',
      product_type: product.product_type,
      price_inr: priceInr,
      price_usd: priceUsd,
      original_price_inr: originalPriceInr,
      original_price_usd: product.original_price_usd ? Number(product.original_price_usd) : undefined,
      cover_image: product.cover_image,
      demo_audio_url: product.demo_audio_url,
      vst_format: product.vst_format,
      short_description: product.short_description,
      is_featured: product.is_featured,
    })
  }

  if (sortedProducts.length === 0) return null

  return (
    <section className="w-full select-none my-6 sm:my-10">
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

      {/* Main Grid: Left Featured Card + Right Side-Scrollable 3-Item Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Featured "NEW RELEASES" Visual Card                          */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 xl:col-span-4 flex flex-col">
          <Link
            href="/store?sort=newest"
            prefetch={true}
            className="relative w-full aspect-[4/5] sm:aspect-square lg:aspect-auto lg:h-full min-h-[300px] sm:min-h-[360px] lg:min-h-[400px] rounded-2xl overflow-hidden p-6 sm:p-8 flex flex-col justify-between items-center text-center shadow-2xl select-none cursor-pointer border border-[#2d1b10]/60"
            style={{
              background: 'linear-gradient(135deg, #140701 0%, #290e02 25%, #521c04 60%, #140701 100%)',
            }}
          >
            {/* Background Producer Toy Brand Fiery / Crystal Accents */}
            <div className="absolute inset-0 opacity-60 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#FA742B]/40 via-[#E05A18]/25 to-transparent pointer-events-none" />
            <div className="absolute -top-16 -left-16 w-56 h-56 bg-[#FA742B]/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-[#FF9933]/30 rounded-full blur-3xl pointer-events-none" />

            {/* Glowing Polygonal Prisms Decor */}
            <div className="relative z-10 w-full flex-1 flex items-center justify-center">
              <div className="space-y-3">
                {/* Condensed Tall Bold Typography (Exact 1:1 Match) */}
                <h2 className="text-4xl sm:text-5xl lg:text-[46px] font-black uppercase tracking-wider text-white leading-[0.92] drop-shadow-[0_8px_24px_rgba(0,0,0,0.9)] font-sans">
                  NEW<br />RELEASES
                </h2>
                <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-[#FA742B] to-[#FFB074] mx-auto rounded-full shadow-[0_0_12px_#FA742B]" />
              </div>
            </div>

            {/* "See All" Action Button (Exact Epic Games Style Solid White Pill) */}
            <div className="relative z-10 w-full flex justify-center pt-3 sm:pt-4">
              <span className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs sm:text-sm px-7 sm:px-9 py-2.5 rounded-lg shadow-xl transition-colors active:scale-95">
                See All
              </span>
            </div>
          </Link>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Side-Scrollable Horizontal Carousel (3 Items Per Column)    */}
        {/* ========================================================================= */}
        <div 
          ref={scrollContainerRef}
          className="lg:col-span-8 xl:col-span-8 flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {productColumns.map((colItems, colIndex) => (
            <div
              key={colIndex}
              className="w-[88vw] max-w-[340px] sm:w-[320px] lg:w-[calc(50%-8px)] flex-shrink-0 snap-start flex flex-col gap-3"
            >
              {colItems.map((item) => {
                const isFree = Number(item.price_usd) === 0
                const isSaved = isWishlisted(item.id)
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
                    className="group flex items-center gap-3.5 p-2 rounded-xl hover:bg-[#1c1c1c] transition-colors duration-150 cursor-pointer select-none"
                  >
                    {/* Square Thumbnail with Bookmark Icon Overlay */}
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-[#202020] border border-[#2a2a2a] flex-shrink-0 shadow-md">
                      <Image
                        src={getCdnImageUrl(item.cover_image, { width: 240 })}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover object-center"
                      />
                      
                      {/* Wishlist Bookmark Button Overlay on Thumbnail */}
                      <button
                        type="button"
                        onClick={(e) => handleBookmarkClick(e, item)}
                        className={`absolute top-1 right-1 w-5 h-5 rounded-full backdrop-blur-md flex items-center justify-center transition-all border border-white/10 z-10 ${
                          isSaved
                            ? 'bg-white text-black opacity-100'
                            : 'bg-black/60 text-white/80 hover:text-white hover:bg-black/80'
                        }`}
                        title={isSaved ? 'Saved in Wishlist' : 'Save to Wishlist'}
                      >
                        <Bookmark className={`w-2.5 h-2.5 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Meta & Price Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1">
                      {/* Product Title */}
                      <h3 className="font-bold text-white text-[13px] sm:text-sm leading-snug line-clamp-1">
                        {item.name}
                      </h3>

                      {/* "Now on Producer Toy" Pill Badge */}
                      <div>
                        <span className="bg-[#242424] text-zinc-300 text-[10px] sm:text-[11px] font-medium px-2 py-0.5 rounded inline-block truncate max-w-full">
                          Now On Producer Toy
                        </span>
                      </div>

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
