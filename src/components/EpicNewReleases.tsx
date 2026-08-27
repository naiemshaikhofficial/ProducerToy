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
      {/* Desktop Header Row with Navigation Controls */}
      {productColumns.length > 1 && (
        <div className="hidden lg:flex items-center justify-end mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScroll('left')}
              className="w-8 h-8 rounded-full bg-[#202020] hover:bg-[#303030] text-zinc-300 hover:text-white flex items-center justify-center transition-colors shadow-md active:scale-95 cursor-pointer border border-white/[0.06]"
              aria-label="Previous releases"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-8 h-8 rounded-full bg-[#202020] hover:bg-[#303030] text-zinc-300 hover:text-white flex items-center justify-center transition-colors shadow-md active:scale-95 cursor-pointer border border-white/[0.06]"
              aria-label="Next releases"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Outer Container (Flush with poster on mobile with border extending downwards from poster edges) */}
      <div className="w-full bg-[#121212] border border-white/[0.08] rounded-2xl overflow-hidden lg:bg-transparent lg:border-none lg:rounded-none lg:overflow-visible">
        
        {/* Main Grid: Left Featured Card + Right Side-Scrollable 3-Item Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-6 items-stretch">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: Featured "NEW RELEASES" Visual Card (Exact 1:1 Flush Match)  */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 xl:col-span-4 flex flex-col">
            <Link
              href="/store?sort=newest"
              prefetch={true}
              className="relative w-full aspect-square rounded-none lg:rounded-2xl lg:aspect-auto lg:h-full overflow-hidden p-6 sm:p-8 flex flex-col justify-between items-center text-center shadow-2xl select-none cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #150600 0%, #2b0e02 30%, #581d03 65%, #180701 100%)',
              }}
            >
              {/* 3D Glowing Crystal Prisms Background (Exact Epic Games Aesthetic in Producer Toy Orange) */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Prism 1: Top Right Diamond Crystal */}
                <div 
                  className="absolute -top-6 -right-6 w-36 h-36 border border-[#FA742B]/40 bg-gradient-to-br from-[#FA742B]/25 via-[#FF9933]/15 to-transparent rotate-45 backdrop-blur-[2px] shadow-[0_0_30px_rgba(250,116,43,0.3)]"
                  style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
                />
                
                {/* Prism 2: Bottom Left Reflective Crystal */}
                <div 
                  className="absolute -bottom-8 -left-6 w-44 h-44 border border-[#FF8C38]/40 bg-gradient-to-tr from-[#FA742B]/30 via-[#E05800]/20 to-transparent rotate-12 backdrop-blur-[2px] shadow-[0_0_40px_rgba(250,116,43,0.4)]"
                  style={{ clipPath: 'polygon(30% 0%, 90% 20%, 100% 80%, 20% 100%)' }}
                />

                {/* Starry Dust & Neon Ambient Lighting */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#FA742B]/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-8 left-1/3 w-1.5 h-1.5 bg-white rounded-full blur-[0.5px] shadow-[0_0_8px_#ffffff]" />
                <div className="absolute bottom-16 right-1/4 w-2 h-2 bg-[#FFAE74] rounded-full blur-[0.5px] shadow-[0_0_10px_#FFAE74]" />
              </div>

              {/* Glowing Polygonal Prisms Decor & Huge Condensed Typography */}
              <div className="relative z-10 w-full flex-1 flex items-center justify-center pt-2 sm:pt-4">
                <div className="space-y-2">
                  {/* 1:1 Exact Epic Games Condensed Tall Bold Typography */}
                  <h2 className="text-[44px] sm:text-[52px] lg:text-[54px] font-black uppercase tracking-tight text-white leading-[0.88] drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] font-sans">
                    NEW<br />RELEASES
                  </h2>
                </div>
              </div>

              {/* "See All" Action Button (Exact Epic Games Solid White Pill) */}
              <div className="relative z-10 w-full flex justify-center pb-2">
                <span className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs sm:text-sm px-8 sm:px-9 py-2 sm:py-2.5 rounded-lg shadow-xl transition-colors active:scale-95">
                  See All
                </span>
              </div>
            </Link>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: Side-Scrollable Horizontal Carousel (3 Items Per Column)    */}
          {/* ========================================================================= */}
          <div className="lg:col-span-8 xl:col-span-8 p-3.5 sm:p-4 lg:p-0">
            <div 
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {productColumns.map((colItems, colIndex) => (
                <div
                  key={colIndex}
                  className="w-[calc(100%-48px)] sm:w-[320px] lg:w-[calc(50%-8px)] flex-shrink-0 snap-start flex flex-col gap-3.5"
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
                        className="group flex items-center gap-3.5 p-1.5 sm:p-2 rounded-xl hover:bg-white/[0.04] transition-colors duration-150 cursor-pointer select-none"
                      >
                        {/* Square Thumbnail with Bookmark Icon Overlay */}
                        <div className="relative w-[58px] h-[58px] sm:w-[64px] sm:h-[64px] rounded-xl overflow-hidden bg-[#202020] border border-white/[0.08] flex-shrink-0 shadow-md">
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
                          <h3 className="font-bold text-white text-[13.5px] sm:text-[15px] leading-snug line-clamp-1">
                            {item.name}
                          </h3>

                          {/* "Now on Producer Toy" Pill Badge */}
                          <div>
                            <span className="bg-[#242424] text-zinc-300 text-[10.5px] sm:text-[11px] font-medium px-2 py-0.5 rounded inline-block truncate max-w-full">
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

        </div>
      </div>
    </section>
  )
}
