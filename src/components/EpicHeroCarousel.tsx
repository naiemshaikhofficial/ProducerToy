'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, Bookmark, Check } from 'lucide-react'
import { Product } from '@/components/ProductCard'
import { useCurrency } from '@/context/CurrencyContext'
import { useCart } from '@/context/CartContext'
import { toggleWishlistAction } from '@/actions/wishlistActions'
import { getCdnImageUrl } from '@/lib/cdn'

interface EpicHeroCarouselProps {
  products: Product[]
}

const ROTATION_DURATION = 7000 // 7 seconds per slide

export function EpicHeroCarousel({ products }: EpicHeroCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({})
  const { formatPrice } = useCurrency()
  const { addItem, isInCart } = useCart()

  // Touch Swipe tracking for mobile
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  // Priority to featured products (is_featured === true), backfilling with top products
  const featuredOnly = products.filter((p) => p.is_featured === true)
  const nonFeatured = products.filter((p) => !p.is_featured)
  const featuredList = (featuredOnly.length >= 4 
    ? featuredOnly 
    : [...featuredOnly, ...nonFeatured]
  ).slice(0, 5)

  // Hook 1: Smoothly tick progress from 0 to 100% for the current slide
  useEffect(() => {
    if (featuredList.length <= 1) return

    const intervalMs = 50
    const step = (intervalMs / ROTATION_DURATION) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100
        return prev + step
      })
    }, intervalMs)

    return () => clearInterval(timer)
  }, [selectedIndex, featuredList.length])

  // Hook 2: Trigger slide transition when progress hits 100%
  useEffect(() => {
    if (progress >= 100) {
      setSelectedIndex((prevIndex) => (prevIndex + 1) % featuredList.length)
      setProgress(0)
    }
  }, [progress, featuredList.length])

  const handleSelect = (index: number) => {
    setSelectedIndex(index)
    setProgress(0)
  }

  const handleWishlistToggle = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setSavedIds((prev) => ({ ...prev, [productId]: !prev[productId] }))
    await toggleWishlistAction(productId)
  }

  // Touch swipe event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const distance = touchStartX.current - touchEndX.current
    const minSwipeDistance = 45

    if (distance > minSwipeDistance) {
      // Swiped Left -> Next Slide
      setSelectedIndex((prev) => (prev + 1) % featuredList.length)
      setProgress(0)
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Prev Slide
      setSelectedIndex((prev) => (prev - 1 + featuredList.length) % featuredList.length)
      setProgress(0)
    }

    touchStartX.current = null
    touchEndX.current = null
  }

  if (featuredList.length === 0) return null

  return (
    <div className="w-full select-none">

      {/* ========================================================================= */}
      {/* 1. MOBILE & TABLET LAYOUT (< 1024px): Epic Games Store Peek Card Slider */}
      {/* ========================================================================= */}
      <div className="block lg:hidden w-full">
        {/* Peek Carousel Viewport */}
        <div 
          className="w-full overflow-hidden touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="flex transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] pl-4 sm:pl-6"
            style={{
              transform: `translateX(calc(-${selectedIndex} * (86% + 12px)))`,
              gap: '12px',
            }}
          >
            {featuredList.map((product, idx) => {
              const isFree = Number(product.price_usd) === 0
              const isSaved = !!savedIds[product.id]
              const inCart = isInCart(product.id)

              return (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-[86%] sm:w-[75%] max-w-[440px]"
                >
                  <div className="relative w-full h-[460px] sm:h-[500px] rounded-2xl overflow-hidden border border-[#262626] bg-[#141414] shadow-2xl group flex flex-col justify-end">
                    
                    {/* Background Product Artwork */}
                    <Image
                      src={getCdnImageUrl(product.cover_image || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1600&auto=format&fit=crop', { width: 800 })}
                      alt={product.name}
                      fill
                      priority={idx === 0}
                      unoptimized
                      className="object-cover object-center pointer-events-none"
                    />

                    {/* Dark Dramatic Epic Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent pointer-events-none" />

                    {/* Top Right Wishlist Bookmark Button */}
                    <button
                      type="button"
                      onClick={(e) => handleWishlistToggle(e, product.id)}
                      className={`absolute top-3.5 right-3.5 w-9 h-9 rounded-full backdrop-blur-md border flex items-center justify-center z-20 active:scale-90 transition-all ${
                        isSaved
                          ? 'bg-white text-black border-white'
                          : 'bg-black/60 text-white/90 border-white/15 hover:bg-black/80'
                      }`}
                      title={isSaved ? "Saved in Wishlist" : "Save to Wishlist"}
                    >
                      <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    </button>

                    {/* Card Content Overlay */}
                    <div className="relative z-10 p-5 sm:p-6 flex flex-col gap-2">
                      
                      {/* Product Type / Brand Badge */}
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                        {product.brand || 'Producer Toy'} • {product.product_type?.replace('_', ' ') || 'Plugin'}
                      </span>

                      {/* Main Product Title */}
                      <Link 
                        href={`/product/${product.slug}`}
                        prefetch={true}
                        className="block text-xl sm:text-2xl font-black uppercase tracking-tight text-white leading-tight font-sans drop-shadow-md hover:underline"
                      >
                        {product.name}
                      </Link>

                      {/* Subtitle / Short Description */}
                      <p className="text-xs sm:text-[13px] text-zinc-300 font-normal leading-relaxed line-clamp-2 drop-shadow-sm">
                        {product.short_description || 'Professional audio tools, presets, and sample packs for elite music production.'}
                      </p>

                      {/* Price Badge */}
                      <div className="pt-1">
                        <span className="text-base font-black text-white drop-shadow">
                          {isFree ? 'Free' : formatPrice(product.price_inr, product.price_usd)}
                        </span>
                      </div>

                      {/* CTA Action Buttons Row */}
                      <div className="pt-2 flex items-center gap-2">
                        <Link
                          href={`/product/${product.slug}`}
                          prefetch={true}
                          className="flex-1 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs py-3 px-4 rounded-xl text-center uppercase tracking-wider shadow-lg active:scale-95 transition-all"
                        >
                          {isFree ? 'Get Free' : 'Buy Now'}
                        </Link>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            addItem({
                              id: product.id,
                              name: product.name,
                              slug: product.slug,
                              price_inr: product.price_inr,
                              price_usd: product.price_usd,
                              cover_image: product.cover_image,
                              product_type: product.product_type,
                              brand: product.brand,
                            })
                          }}
                          className="bg-[#1e1e1e]/90 hover:bg-[#282828] text-white border border-white/15 p-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center"
                          title={inCart ? "In Cart" : "Add to Cart"}
                        >
                          {inCart ? <Check className="w-4 h-4 text-green-400" /> : <Plus className="w-4 h-4" />}
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile Pagination Indicator Dots (Exact Epic Games Store Bottom Dots) */}
        <div className="flex items-center justify-center gap-1.5 mt-4 sm:mt-5">
          {featuredList.map((_, idx) => {
            const isActive = idx === selectedIndex
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  isActive
                    ? 'w-5 h-1.5 bg-white shadow-sm'
                    : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'
                }`}
              />
            )
          })}
        </div>
      </div>


      {/* ========================================================================= */}
      {/* 2. DESKTOP LAYOUT (>= 1024px): 9-Col Hero Banner + 3-Col Sidebar Cards   */}
      {/* ========================================================================= */}
      <div className="hidden lg:grid grid-cols-12 gap-3 lg:gap-4 items-stretch">
        
        {/* Main Hero Banner Container (Left 9 out of 12 columns) */}
        <div 
          className="col-span-9 relative w-full h-[430px] rounded-none overflow-hidden border border-[#202020] shadow-2xl bg-[#121212]"
          style={{ position: 'relative', width: '100%', overflow: 'hidden' }}
        >
          {/* Horizontal Sliding Viewport */}
          <div 
            className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{ 
              display: 'flex',
              height: '100%',
              width: '100%',
              transform: `translateX(-${selectedIndex * 100}%)`,
              transition: 'transform 700ms cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            {featuredList.map((product) => {
              const isFree = Number(product.price_usd) === 0
              const isSaved = !!savedIds[product.id]

              return (
                <Link 
                  key={product.id} 
                  href={`/product/${product.slug}`}
                  prefetch={true}
                  className="block relative w-full h-full flex-shrink-0 overflow-hidden group cursor-pointer"
                  style={{
                    position: 'relative',
                    width: '100%',
                    minWidth: '100%',
                    height: '100%',
                    flexShrink: 0,
                    overflow: 'hidden',
                    display: 'block',
                  }}
                >
                  {/* Background Artwork */}
                  <Image
                    src={getCdnImageUrl(product.cover_image || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1600&auto=format&fit=crop', { width: 1600 })}
                    alt={product.name}
                    fill
                    priority
                    unoptimized
                    className="object-cover object-center pointer-events-none"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />

                  {/* Epic Dark Gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent pointer-events-none" style={{ position: 'absolute', inset: 0 }} />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/95 via-[#0a0a0a]/45 to-transparent pointer-events-none" style={{ position: 'absolute', inset: 0 }} />

                  {/* Top Right Wishlist Button for Desktop */}
                  <button
                    type="button"
                    onClick={(e) => handleWishlistToggle(e, product.id)}
                    className={`absolute top-4 right-4 w-9 h-9 rounded-full backdrop-blur-md border flex items-center justify-center z-20 active:scale-90 transition-all ${
                      isSaved
                        ? 'bg-white text-black border-white'
                        : 'bg-black/60 text-white/90 border-white/15 hover:bg-black/80'
                    }`}
                    title={isSaved ? "Saved in Wishlist" : "Save to Wishlist"}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>

                  {/* Hero Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-9 max-w-xl space-y-3 z-10">
                    
                    {/* Main Product Title */}
                    <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tight text-white leading-tight font-sans drop-shadow-xl">
                      {product.name}
                    </h1>

                    {/* Short Description */}
                    <p className="text-sm text-zinc-200 font-normal leading-relaxed line-clamp-2 drop-shadow-md max-w-md">
                      {product.short_description || 'Professional audio tools and VST plugins designed for modern music producers.'}
                    </p>

                    {/* CTA Action Buttons Row */}
                    <div className="pt-1 flex items-center gap-2.5 flex-wrap">
                      <span
                        className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs px-6 py-2.5 rounded-xl transition-colors uppercase tracking-wider shadow-lg active:scale-95 inline-flex items-center justify-center min-w-[120px]"
                      >
                        {isFree ? 'Get Free' : 'Buy Now'}
                      </span>

                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          addItem({
                            id: product.id,
                            name: product.name,
                            slug: product.slug,
                            price_inr: product.price_inr,
                            price_usd: product.price_usd,
                            cover_image: product.cover_image,
                            product_type: product.product_type,
                            brand: product.brand
                          })
                        }}
                        className="bg-[#1e1e1e]/80 hover:bg-[#282828] text-white border border-white/10 p-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center"
                        title="Add to Cart"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </Link>
              )
            })}
          </div>

        </div>

        {/* Right Sidebar Interactive Product Cards */}
        <div className="col-span-3 flex flex-col justify-between gap-2 h-[430px]">
          {featuredList.map((item, idx) => {
            const isActive = idx === selectedIndex
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(idx)}
                className={`relative flex-1 flex items-center gap-3 p-2.5 rounded-xl transition-all text-left overflow-hidden border ${
                  isActive
                    ? 'bg-[#202020] border-[#2e2e2e] shadow-lg'
                    : 'bg-[#121212]/90 hover:bg-[#181818] border-transparent hover:border-[#222222]'
                }`}
              >
                {/* Progress Fill Layer */}
                {isActive && (
                  <div 
                    className="absolute inset-0 bg-[#2d2d2d] transition-all duration-75 ease-linear origin-left"
                    style={{ 
                      width: `${progress}%`
                    }}
                  />
                )}

                {/* SQUARE Thumbnail Box */}
                <div className="relative w-[48px] h-[48px] aspect-square rounded-xl overflow-hidden flex-shrink-0 border border-[#2a2a2a] z-10 shadow-sm">
                  <Image
                    src={getCdnImageUrl(item.cover_image, { width: 100 })}
                    alt={item.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>

                {/* Info Text */}
                <div className="flex-1 min-w-0 pr-1 z-10">
                  <p className="text-xs font-bold text-white leading-tight line-clamp-2">
                    {item.name}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

      </div>

    </div>
  )
}
