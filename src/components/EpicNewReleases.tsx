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
    <section className="w-full select-none my-10 sm:my-16 lg:my-20" aria-label="New Releases">
      {/* Desktop Header Row with Navigation Controls */}
      {productColumns.length > 1 && (
        <div className="hidden lg:flex items-center justify-end mb-4 sm:mb-5">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleScroll('left')}
              className="w-9 h-9 rounded-full bg-[#202020] hover:bg-[#303030] text-zinc-300 hover:text-white flex items-center justify-center transition-colors shadow-md active:scale-95 cursor-pointer border border-white/15"
              aria-label="Previous releases"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-9 h-9 rounded-full bg-[#202020] hover:bg-[#303030] text-zinc-300 hover:text-white flex items-center justify-center transition-colors shadow-md active:scale-95 cursor-pointer border border-white/15"
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
        
        {/* Main Grid: Left Featured Card (3 cols) + Right Side-Scrollable 3-Item Columns (9 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 xl:gap-10 items-stretch">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: Featured "NEW RELEASES" Visual Card                          */}
          {/* ========================================================================= */}
          <div className="lg:col-span-3 xl:col-span-3 flex flex-col">
            <Link
              href="/store?sort=newest"
              prefetch={true}
              className="relative w-full aspect-square rounded-none lg:rounded-2xl lg:aspect-auto lg:h-full overflow-hidden p-6 sm:p-8 flex flex-col justify-between items-center text-center shadow-2xl select-none cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #150600 0%, #2b0e02 30%, #581d03 65%, #180701 100%)',
              }}
            >
              {/* 3D Glowing Crystal Prisms Background */}
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

              {/* Typography */}
              <div className="relative z-10 w-full flex-1 flex items-center justify-center pt-2 sm:pt-4">
                <div className="space-y-2">
                  <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black uppercase tracking-tight text-white leading-[0.92] drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] font-sans">
                    NEW<br />RELEASES
                  </h2>
                </div>
              </div>

              {/* "See All" Action Button */}
              <div className="relative z-10 w-full flex justify-center pb-2">
                <span className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs sm:text-sm px-7 py-2 sm:py-2.5 rounded-xl shadow-xl transition-colors active:scale-95">
                  See All
                </span>
              </div>
            </Link>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: Side-Scrollable Horizontal Carousel (3 Items Per Column)    */}
          {/* ========================================================================= */}
          <div className="lg:col-span-9 xl:col-span-9 p-3.5 sm:p-4 lg:p-0">
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
                    const priceUsd = Number(item.price_usd) || 0
                    const priceInr = item.price_inr ? Number(item.price_inr) : convertUsdToInr(priceUsd)
                    const originalPriceUsd = item.original_price_usd ? Number(item.original_price_usd) : 0
                    const originalPriceInr = item.original_price_inr ? Number(item.original_price_inr) : (originalPriceUsd ? convertUsdToInr(originalPriceUsd) : undefined)
                    const isFree = priceUsd === 0
                    const isSaved = isWishlisted(item.id)
                    const hasDiscount = originalPriceUsd > priceUsd
                    const discountPercent = hasDiscount
                      ? Math.round(((originalPriceUsd - priceUsd) / originalPriceUsd) * 100)
                      : 0

                    return (
                      <Link
                        key={item.id}
                        href={`/product/${item.slug}`}
                        prefetch={true}
                        className="group flex items-center gap-4 p-2 sm:p-2.5 rounded-xl hover:bg-white/[0.04] transition-colors duration-150 cursor-pointer select-none"
                      >
                        {/* Square Thumbnail with Bookmark Icon Overlay */}
                        <div className="relative w-[60px] h-[60px] sm:w-[68px] sm:h-[68px] rounded-xl overflow-hidden bg-[#202020] border border-white/[0.08] flex-shrink-0 shadow-md">
                          <Image
                            src={getCdnImageUrl(item.cover_image, { width: 240 })}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover object-center group-hover:brightness-110 transition-all duration-200"
                          />
                          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                          
                          {/* Wishlist Bookmark Button Overlay on Thumbnail */}
                          <button
                            type="button"
                            onClick={(e) => handleBookmarkClick(e, item)}
                            aria-label={isSaved ? "Remove from Wishlist" : "Save to Wishlist"}
                            className={`absolute top-1 right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full backdrop-blur-md flex items-center justify-center transition-all border border-white/20 z-10 ${
                              isSaved
                                ? 'bg-white text-black opacity-100 shadow-md'
                                : 'bg-black/75 text-white/90 hover:text-white hover:bg-white hover:text-black opacity-0 group-hover:opacity-100 shadow-sm'
                            }`}
                            title={isSaved ? 'Saved in Wishlist' : 'Save to Wishlist'}
                          >
                            <Bookmark className={`w-3 h-3 ${isSaved ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        {/* Meta & Price Info */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1">
                          {/* Product Title */}
                          <h3 className="font-bold text-white text-sm sm:text-base leading-normal line-clamp-1">
                            {item.name}
                          </h3>

                          {/* Dynamic Category / Brand metadata */}
                          <div>
                            <span className="text-zinc-400 text-xs font-medium inline-block truncate max-w-full">
                              {item.subcategory_name || (item as any).category_name || item.brand || (item.product_type ? item.product_type.replace('_', ' ') : 'Audio Tool')}
                            </span>
                          </div>

                          {/* Pricing Row */}
                          <div className="flex items-center gap-2 pt-0.5">
                            {isFree ? (
                              <span className="text-white font-bold text-xs sm:text-sm tracking-tight">
                                Free
                              </span>
                            ) : hasDiscount ? (
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <span className="bg-[#FA742B] text-white font-extrabold text-xs px-1.5 py-0.5 rounded">
                                  -{discountPercent}%
                                </span>
                                <span className="line-through text-zinc-500 text-xs font-normal">
                                  {formatPrice(originalPriceInr, originalPriceUsd)}
                                </span>
                                <span className="text-white font-bold text-xs sm:text-sm">
                                  {formatPrice(priceInr, priceUsd)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-white font-bold text-xs sm:text-sm">
                                {formatPrice(priceInr, priceUsd)}
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
