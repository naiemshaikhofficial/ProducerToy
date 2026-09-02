'use client'

import React, { useState, useRef, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight, Bookmark } from 'lucide-react'
import { Product } from '@/components/ProductCard'
import { useCurrency } from '@/context/CurrencyContext'
import { useWishlist } from '@/context/WishlistContext'
import { getCdnImageUrl } from '@/lib/cdn'

interface EpicStorefrontListsProps {
  products: Product[]
}

interface ListItemProduct {
  id: string
  name: string
  slug: string
  brand: string
  product_type: string
  price_usd: number
  price_inr?: number
  original_price_usd?: number | null
  original_price_inr?: number | null
  cover_image: string
  demo_audio_url?: string
  vst_format?: string
  short_description?: string
  statusBadge?: string
  statusType?: 'coming_soon' | 'new' | 'discount' | 'free' | 'regular'
  releaseDate?: string
}

export function EpicStorefrontLists({ products = [] }: EpicStorefrontListsProps) {
  const { formatPrice, convertUsdToInr } = useCurrency()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0)
  const mobileScrollRef = useRef<HTMLDivElement>(null)

  // 1. Column 1: Top Sellers / New Releases (Excluding Coming Soon)
  const topSellersList = useMemo<ListItemProduct[]>(() => {
    return products
      .filter((p) => !p.is_coming_soon)
      .slice(0, 5)
      .map((p, idx) => {
        const priceUsd = Number(p.price_usd) || 0
        const isFree = priceUsd === 0
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          brand: p.brands?.name || p.brand || 'Producer Toy',
          product_type: p.product_type,
          price_usd: priceUsd,
          price_inr: p.price_inr ? Number(p.price_inr) : convertUsdToInr(priceUsd),
          original_price_usd: p.original_price_usd ? Number(p.original_price_usd) : undefined,
          original_price_inr: p.original_price_inr ? Number(p.original_price_inr) : undefined,
          cover_image: p.cover_image,
          demo_audio_url: p.demo_audio_url,
          vst_format: p.vst_format,
          short_description: p.short_description,
          statusBadge: isFree ? 'Free' : (p.subcategory_name || (p as any).category_name || (p.product_type ? p.product_type.replace('_', ' ') : 'Audio Tool')),
          statusType: isFree ? 'free' : 'new',
          releaseDate: `Available 08/${24 + idx}/26`,
        }
      })
  }, [products, convertUsdToInr])

  // 2. Column 2: Coming Soon (Dynamically pulled strictly from Database is_coming_soon)
  const comingSoonList = useMemo<ListItemProduct[]>(() => {
    return products
      .filter((p) => Boolean(p.is_coming_soon))
      .map((p) => {
        const priceUsd = Number(p.price_usd) || 0
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          brand: p.brands?.name || p.brand || 'Producer Toy',
          product_type: p.product_type,
          price_usd: priceUsd,
          price_inr: p.price_inr ? Number(p.price_inr) : convertUsdToInr(priceUsd),
          cover_image: p.cover_image,
          demo_audio_url: p.demo_audio_url,
          vst_format: p.vst_format,
          short_description: p.short_description,
          statusBadge: p.release_date ? `Available ${p.release_date}` : 'Coming Soon',
          statusType: 'coming_soon',
        }
      })
  }, [products, convertUsdToInr])

  // 3. Column 3: Top Deals & Free (Excluding Coming Soon)
  const topDealsList = useMemo<ListItemProduct[]>(() => {
    return products
      .filter((p) => !p.is_coming_soon)
      .slice(0, 5)
      .map((p) => {
        const priceUsd = Number(p.price_usd) || 0
        const isFree = priceUsd === 0
        const originalPriceUsd = p.original_price_usd ? Number(p.original_price_usd) : (priceUsd > 0 ? priceUsd * 1.35 : 0)
        const hasDiscount = originalPriceUsd > priceUsd && !isFree
      const discountPercent = hasDiscount
        ? Math.round(((originalPriceUsd - priceUsd) / originalPriceUsd) * 100)
        : 0

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        brand: p.brands?.name || p.brand || 'Producer Toy',
        product_type: p.product_type,
        price_usd: priceUsd,
        price_inr: p.price_inr ? Number(p.price_inr) : convertUsdToInr(priceUsd),
        original_price_usd: originalPriceUsd,
        original_price_inr: originalPriceUsd ? convertUsdToInr(originalPriceUsd) : undefined,
        cover_image: p.cover_image,
        demo_audio_url: p.demo_audio_url,
        vst_format: p.vst_format,
        short_description: p.short_description,
        statusBadge: hasDiscount ? `-${discountPercent}%` : isFree ? 'Free' : (p.subcategory_name || (p as any).category_name || 'Original'),
        statusType: hasDiscount ? 'discount' : isFree ? 'free' : 'regular',
      }
    })
  }, [products, convertUsdToInr])

  const columnsData = [
    { title: 'Top Sellers', href: '/store?sort=popular', items: topSellersList },
    { title: 'Coming Soon', href: '/store?coming_soon=true', items: comingSoonList },
    { title: 'Top Deals', href: '/store?on_sale=true', items: topDealsList },
  ]

  const handleBookmarkClick = async (e: React.MouseEvent, item: ListItemProduct) => {
    e.preventDefault()
    e.stopPropagation()
    const priceUsd = item.price_usd || 0
    const priceInr = item.price_inr ? item.price_inr : convertUsdToInr(priceUsd)

    await toggleWishlist({
      id: item.id,
      name: item.name,
      slug: item.slug,
      brand: item.brand,
      product_type: item.product_type,
      price_inr: priceInr,
      price_usd: priceUsd,
      original_price_inr: item.original_price_inr || undefined,
      original_price_usd: item.original_price_usd || undefined,
      cover_image: item.cover_image,
      demo_audio_url: item.demo_audio_url,
      vst_format: item.vst_format,
      short_description: item.short_description,
    })
  }

  const handleMobileScroll = () => {
    if (mobileScrollRef.current) {
      const scrollLeft = mobileScrollRef.current.scrollLeft
      const width = mobileScrollRef.current.offsetWidth
      const newIndex = Math.round(scrollLeft / (width * 0.85))
      setMobileActiveIndex(newIndex)
    }
  }

  if (products.length === 0) return null

  return (
    <section className="w-full my-10 sm:my-16 lg:my-20 select-none">
      
      {/* ========================================================================= */}
      {/* 1. DESKTOP 3-COLUMN GRID (>= 1024px) (Exact 1:1 Epic Games Store Layout)  */}
      {/* ========================================================================= */}
      <div className="hidden lg:grid grid-cols-3 gap-8 xl:gap-12 items-start">
        {columnsData.map((col, colIdx) => (
          <div key={colIdx} className="flex flex-col space-y-4">
            
            {/* Column Header with Link */}
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <Link 
                href={col.href}
                prefetch={true}
                className="group inline-flex items-center gap-1.5 text-[17px] font-bold text-white hover:text-zinc-300 transition-colors"
              >
                <span>{col.title}</span>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* 5 Stacked Item Rows */}
            <div className="flex flex-col gap-2">
              {col.items.map((item) => {
                const isSaved = isWishlisted(item.id)
                const isComingSoon = item.statusType === 'coming_soon'
                const isDiscount = item.statusType === 'discount'
                const isFree = item.statusType === 'free' || item.price_usd === 0
                const originalPriceUsd = item.original_price_usd ? Number(item.original_price_usd) : 0
                const originalPriceInr = item.original_price_inr || (originalPriceUsd ? convertUsdToInr(originalPriceUsd) : undefined)

                return (
                  <Link
                    key={item.id}
                    href={isComingSoon ? `/store?coming_soon=true` : `/product/${item.slug}`}
                    prefetch={true}
                    className="group flex items-center gap-4 p-2.5 sm:p-3 rounded-xl hover:bg-white/[0.04] transition-colors duration-150 cursor-pointer select-none"
                  >
                    {/* Square Thumbnail with Bookmark Icon */}
                    <div className="relative w-[62px] h-[62px] sm:w-[66px] sm:h-[66px] rounded-xl overflow-hidden bg-[#1e1e1e] border border-white/[0.08] flex-shrink-0 shadow-sm">
                      <Image
                        src={getCdnImageUrl(item.cover_image, { width: 160 })}
                        alt={item.name}
                        fill
                        sizes="70px"
                        className="object-cover object-center group-hover:brightness-110 transition-all duration-200"
                      />
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

                      {/* Wishlist Bookmark Button Overlay on Thumbnail */}
                      <button
                        type="button"
                        onClick={(e) => handleBookmarkClick(e, item)}
                        aria-label={isSaved ? "Remove from Wishlist" : "Save to Wishlist"}
                        className={`absolute top-1 right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-200 z-10 active:scale-95 ${
                          isSaved
                            ? 'bg-[#FC6301] text-white border border-[#FC6301] shadow-[0_0_10px_rgba(252,99,1,0.4)] opacity-100 hover:bg-[#e05700]'
                            : 'bg-[#121214]/80 text-zinc-300 border border-white/15 hover:border-[#FC6301]/70 hover:text-[#FC6301] hover:bg-[#1c1c20] opacity-0 group-hover:opacity-100 shadow-sm hover:scale-105'
                        }`}
                        title={isSaved ? 'Saved in Wishlist' : 'Save to Wishlist'}
                      >
                        <Bookmark className={`w-3 h-3 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Metadata & Price Row */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1">
                      {/* Product Title */}
                      <h3 className="font-bold text-white text-sm sm:text-base leading-normal line-clamp-1 group-hover:text-zinc-200 transition-colors">
                        {item.name}
                      </h3>

                      {/* Status / Badge / Price Details */}
                      {isComingSoon ? (
                        <div className="flex items-center gap-2">
                          <span className="text-zinc-400 text-xs font-normal">
                            {item.statusBadge || 'Coming Soon'}
                          </span>
                        </div>
                      ) : isDiscount ? (
                        <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                          <span className="bg-[#FA742B] text-white font-extrabold text-xs px-1.5 py-0.5 rounded">
                            {item.statusBadge}
                          </span>
                          <span className="line-through text-zinc-500 text-xs font-normal">
                            {formatPrice(originalPriceInr, originalPriceUsd)}
                          </span>
                          <span className="text-white font-bold text-xs">
                            {formatPrice(item.price_inr, item.price_usd)}
                          </span>
                        </div>
                      ) : isFree ? (
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-white font-bold text-xs">
                            Free
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="text-white font-bold text-xs">
                            {formatPrice(item.price_inr, item.price_usd)}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>

          </div>
        ))}
      </div>


      {/* ========================================================================= */}
      {/* 2. MOBILE HORIZONTAL SLIDER (< 1024px) (Exact 1:1 Mobile Screenshot Match) */}
      {/* ========================================================================= */}
      <div className="block lg:hidden w-full">
        {/* Horizontal Track of 3 Column Lists */}
        <div
          ref={mobileScrollRef}
          onScroll={handleMobileScroll}
          className="flex gap-5 overflow-x-auto scrollbar-none snap-x snap-mandatory px-4 pb-3"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {columnsData.map((col, colIdx) => (
            <div
              key={colIdx}
              className="w-[88vw] max-w-[360px] flex-shrink-0 snap-start flex flex-col space-y-3"
            >
              {/* Column Title with Chevron */}
              <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08]">
                <Link
                  href={col.href}
                  prefetch={true}
                  className="group inline-flex items-center gap-1.5 text-[16px] font-bold text-white hover:text-zinc-300"
                >
                  <span>{col.title}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </Link>
              </div>

              {/* 5 Stacked Item Rows */}
              <div className="flex flex-col gap-1.5">
                {col.items.map((item) => {
                  const isSaved = isWishlisted(item.id)
                  const isComingSoon = item.statusType === 'coming_soon'
                  const isDiscount = item.statusType === 'discount'
                  const isFree = item.statusType === 'free' || item.price_usd === 0
                  const originalPriceUsd = item.original_price_usd ? Number(item.original_price_usd) : 0
                  const originalPriceInr = item.original_price_inr || (originalPriceUsd ? convertUsdToInr(originalPriceUsd) : undefined)

                  return (
                    <Link
                      key={item.id}
                      href={isComingSoon ? `/store?coming_soon=true` : `/product/${item.slug}`}
                      prefetch={true}
                      className="group flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer select-none"
                    >
                      {/* Square Thumbnail */}
                      <div className="relative w-[56px] h-[56px] rounded-xl overflow-hidden bg-[#1e1e1e] border border-white/[0.08] flex-shrink-0 shadow-sm">
                        <Image
                          src={getCdnImageUrl(item.cover_image, { width: 160 })}
                          alt={item.name}
                          fill
                          sizes="60px"
                          className="object-cover object-center"
                        />

                        {/* Wishlist Bookmark Button */}
                        <button
                          type="button"
                          onClick={(e) => handleBookmarkClick(e, item)}
                          className={`absolute top-1 right-1 w-5 h-5 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-150 z-10 active:scale-95 ${
                            isSaved
                              ? 'bg-[#FC6301] text-white border border-[#FC6301] opacity-100 shadow-xs'
                              : 'bg-[#121214]/80 text-zinc-300 border border-white/10 hover:border-[#FC6301]/70 hover:text-[#FC6301] hover:bg-[#1c1c20]'
                          }`}
                          title={isSaved ? 'Saved in Wishlist' : 'Save to Wishlist'}
                        >
                          <Bookmark className={`w-2.5 h-2.5 ${isSaved ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Meta & Price Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center space-y-0.5">
                        <h3 className="font-bold text-white text-[13.5px] leading-snug line-clamp-1">
                          {item.name}
                        </h3>

                        {isComingSoon ? (
                          <span className="text-zinc-400 text-[11.5px] font-normal">
                            {item.statusBadge || 'Coming Soon'}
                          </span>
                        ) : isDiscount ? (
                          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                            <span className="bg-[#FA742B] text-white font-black text-[10px] px-1.5 py-0.5 rounded">
                              {item.statusBadge}
                            </span>
                            <span className="line-through text-zinc-500 text-[11px] font-normal">
                              {formatPrice(originalPriceInr, originalPriceUsd)}
                            </span>
                            <span className="text-white font-bold text-[11.5px]">
                              {formatPrice(item.price_inr, item.price_usd)}
                            </span>
                          </div>
                        ) : isFree ? (
                          <span className="text-white font-bold text-[11.5px] pt-0.5">
                            Free
                          </span>
                        ) : (
                          <span className="text-white font-bold text-[11.5px] pt-0.5">
                            {formatPrice(item.price_inr, item.price_usd)}
                          </span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>

            </div>
          ))}
        </div>

        {/* Mobile Pagination Indicator Dots */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {columnsData.map((_, dotIdx) => (
            <div
              key={dotIdx}
              className={`w-[5px] h-[5px] rounded-full transition-colors duration-200 ${
                dotIdx === mobileActiveIndex ? 'bg-white' : 'bg-[#787880]'
              }`}
            />
          ))}
        </div>
      </div>

    </section>
  )
}
