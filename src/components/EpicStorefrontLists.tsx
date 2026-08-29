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

  // 1. Column 1: Top Sellers / New Releases (5 products)
  const topSellersList = useMemo<ListItemProduct[]>(() => {
    return products.slice(0, 5).map((p, idx) => {
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
        statusBadge: isFree ? 'Free' : 'Now On Producer Toy',
        statusType: isFree ? 'free' : 'new',
        releaseDate: `Available 08/${24 + idx}/26`,
      }
    })
  }, [products, convertUsdToInr])

  // 2. Column 2: Coming Soon (Dynamically pulled from Database + curated upcoming flagship products)
  const comingSoonList = useMemo<ListItemProduct[]>(() => {
    const dbComingSoon: ListItemProduct[] = products
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

    const upcomingPresets: ListItemProduct[] = [
      {
        id: 'cs-1',
        name: 'Oblivion 808 Distortion VST',
        slug: 'oblivion-808-distortion-vst',
        brand: 'Producer Toy',
        product_type: 'plugin',
        price_usd: 29.99,
        cover_image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&auto=format&fit=crop',
        short_description: 'Aggressive multi-band 808 saturation, sub-harmonics exciter and soft clipper.',
        statusBadge: 'Coming Soon',
        statusType: 'coming_soon',
      },
      {
        id: 'cs-2',
        name: 'Vocal Sauce Elite Processor',
        slug: 'vocal-sauce-elite-processor',
        brand: 'Producer Toy',
        product_type: 'plugin',
        price_usd: 39.99,
        cover_image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
        short_description: 'All-in-one vocal chain with pitch correction, air EQ, and lush studio reverb.',
        statusBadge: 'Coming Soon',
        statusType: 'coming_soon',
      },
      {
        id: 'cs-3',
        name: 'Cyberpunk Serum Presets Vol. 2',
        slug: 'cyberpunk-serum-presets-vol-2',
        brand: 'Producer Toy',
        product_type: 'preset',
        price_usd: 14.99,
        cover_image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
        short_description: '80 Dystopian synthwave leads, gritty Reese basses, and holographic pads.',
        statusBadge: 'Available 10/15/26',
        statusType: 'coming_soon',
      },
      {
        id: 'cs-4',
        name: 'Vintage Tape Machine VST3',
        slug: 'vintage-tape-machine-vst3',
        brand: 'Producer Toy',
        product_type: 'plugin',
        price_usd: 24.99,
        cover_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
        short_description: 'Warm reel-to-reel magnetic tape emulation with flutter, wow, and harmonic drive.',
        statusBadge: 'Coming Soon',
        statusType: 'coming_soon',
      },
      {
        id: 'cs-5',
        name: 'Dark Brooklyn Drill Drum Loops',
        slug: 'dark-brooklyn-drill-drum-loops',
        brand: 'Producer Toy',
        product_type: 'sample_pack',
        price_usd: 19.99,
        cover_image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
        short_description: 'Hard-hitting sliding 808s, punchy snare patterns, and dark piano melodies.',
        statusBadge: 'Coming Soon',
        statusType: 'coming_soon',
      },
    ]

    const combined = [...dbComingSoon, ...upcomingPresets.filter((p) => !dbComingSoon.some((d) => d.slug === p.slug))]
    return combined.slice(0, 5)
  }, [products, convertUsdToInr])

  // 3. Column 3: Top Deals & Free (5 products with discounts or free)
  const topDealsList = useMemo<ListItemProduct[]>(() => {
    return products.slice(0, 5).map((p) => {
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
        statusBadge: hasDiscount ? `-${discountPercent}%` : isFree ? 'Free' : 'Now On Producer Toy',
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
    <section className="w-full my-8 sm:my-14 select-none">
      
      {/* ========================================================================= */}
      {/* 1. DESKTOP 3-COLUMN GRID (>= 1024px) (Exact 1:1 Epic Games Store Layout)  */}
      {/* ========================================================================= */}
      <div className="hidden lg:grid grid-cols-3 gap-6 xl:gap-8 items-start">
        {columnsData.map((col, colIdx) => (
          <div key={colIdx} className="flex flex-col space-y-3">
            
            {/* Column Header with Link */}
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
              <Link 
                href={col.href}
                prefetch={true}
                className="group inline-flex items-center gap-1 text-[17px] font-bold text-white hover:text-zinc-300 transition-colors"
              >
                <span>{col.title}</span>
                <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* 5 Stacked Item Rows */}
            <div className="flex flex-col gap-1">
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
                    className="group flex items-center gap-3.5 p-2 rounded-xl hover:bg-white/[0.04] transition-colors duration-150 cursor-pointer select-none"
                  >
                    {/* Square Thumbnail with Bookmark Icon */}
                    <div className="relative w-[58px] h-[58px] rounded-xl overflow-hidden bg-[#1e1e1e] border border-white/[0.08] flex-shrink-0 shadow-sm">
                      <Image
                        src={getCdnImageUrl(item.cover_image, { width: 160 })}
                        alt={item.name}
                        fill
                        sizes="70px"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-200"
                      />

                      {/* Wishlist Bookmark Button Overlay on Thumbnail */}
                      <button
                        type="button"
                        onClick={(e) => handleBookmarkClick(e, item)}
                        className={`absolute top-1 right-1 w-5 h-5 rounded-full backdrop-blur-md flex items-center justify-center transition-all border border-white/10 z-10 ${
                          isSaved
                            ? 'bg-white text-black opacity-100'
                            : 'bg-black/60 text-white/80 hover:text-white hover:bg-black/80 opacity-0 group-hover:opacity-100'
                        }`}
                        title={isSaved ? 'Saved in Wishlist' : 'Save to Wishlist'}
                      >
                        <Bookmark className={`w-2.5 h-2.5 ${isSaved ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Metadata & Price Row */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1">
                      {/* Product Title */}
                      <h3 className="font-bold text-white text-[14px] leading-snug line-clamp-1 group-hover:text-zinc-200 transition-colors">
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
                          <span className="bg-[#FA742B] text-white font-black text-[10.5px] px-1.5 py-0.5 rounded">
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
          className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory px-4 pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {columnsData.map((col, colIdx) => (
            <div
              key={colIdx}
              className="w-[85vw] max-w-[340px] flex-shrink-0 snap-start flex flex-col space-y-2.5"
            >
              {/* Column Title with Chevron */}
              <div className="flex items-center justify-between pb-1 border-b border-white/[0.06]">
                <Link
                  href={col.href}
                  prefetch={true}
                  className="group inline-flex items-center gap-1 text-[16px] font-bold text-white hover:text-zinc-300"
                >
                  <span>{col.title}</span>
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                </Link>
              </div>

              {/* 5 Stacked Item Rows */}
              <div className="flex flex-col gap-1">
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
                      className="group flex items-center gap-3 p-1.5 rounded-xl hover:bg-white/[0.04] transition-colors cursor-pointer select-none"
                    >
                      {/* Square Thumbnail */}
                      <div className="relative w-[52px] h-[52px] rounded-xl overflow-hidden bg-[#1e1e1e] border border-white/[0.08] flex-shrink-0 shadow-sm">
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
                          className={`absolute top-1 right-1 w-5 h-5 rounded-full backdrop-blur-md flex items-center justify-center transition-all border border-white/10 z-10 ${
                            isSaved
                              ? 'bg-white text-black opacity-100'
                              : 'bg-black/60 text-white/80'
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
