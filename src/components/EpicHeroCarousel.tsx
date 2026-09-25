'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, Bookmark, Check } from 'lucide-react'
import { Product } from '@/components/ProductCard'
import { useCurrency } from '@/context/CurrencyContext'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { getCdnImageUrl } from '@/lib/cdn'

interface EpicHeroCarouselProps {
  products: Product[]
}

const ROTATION_DURATION = 6500 // 6.5 seconds auto-advance on PC

export function EpicHeroCarousel({ products }: EpicHeroCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isDesktop, setIsDesktop] = useState(false)

  const { isWishlisted, toggleWishlist } = useWishlist()
  const { formatPrice, convertUsdToInr } = useCurrency()
  const { addItem, isInCart } = useCart()

  // Real-time Touch & Drag Gesture Tracking (Mobile)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const startXRef = useRef<number>(0)
  const currentXRef = useRef<number>(0)
  const isPointerDownRef = useRef<boolean>(false)

  // Priority to featured products (is_featured === true), backfilling with top products
  const featuredOnly = products.filter((p) => p.is_featured === true)
  const nonFeatured = products.filter((p) => !p.is_featured)
  const featuredList = (featuredOnly.length >= 6 
    ? featuredOnly 
    : [...featuredOnly, ...nonFeatured]
  ).slice(0, 6)

  // Detect Desktop Viewport for PC-only animation
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Hook 1: PC ONLY - Smoothly tick progress from 0 to 100% for the current slide (Never pauses on hover)
  useEffect(() => {
    if (!isDesktop || featuredList.length <= 1) return

    const intervalMs = 50
    const step = (intervalMs / ROTATION_DURATION) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100
        return prev + step
      })
    }, intervalMs)

    return () => clearInterval(timer)
  }, [selectedIndex, featuredList.length, isDesktop])

  // Hook 2: PC ONLY - Trigger slide transition strictly when progress hits 100%
  useEffect(() => {
    if (!isDesktop) return

    if (progress >= 100) {
      setSelectedIndex((prevIndex) => (prevIndex + 1) % featuredList.length)
      setProgress(0)
    }
  }, [progress, featuredList.length, isDesktop])

  const handleSelect = (index: number) => {
    setSelectedIndex(index)
    setProgress(0)
  }

  const handleWishlistToggle = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault()
    e.stopPropagation()
    const priceUsd = Number(product.price_usd) || 0
    const priceInr = product.price_inr ? Number(product.price_inr) : convertUsdToInr(priceUsd)

    await toggleWishlist({
      id: product.id,
      name: product.name,
      slug: product.slug,
      brand: product.brand,
      product_type: product.product_type,
      price_inr: priceInr,
      price_usd: priceUsd,
      cover_image: product.cover_image,
      vst_format: product.vst_format,
      short_description: product.short_description,
    })
  }

  // --- Real-Time Touch Gestures (Mobile) ---
  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX
    currentXRef.current = e.touches[0].clientX
    setIsDragging(true)
    setDragOffset(0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    currentXRef.current = e.touches[0].clientX
    const diff = currentXRef.current - startXRef.current
    setDragOffset(diff)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    const diff = currentXRef.current - startXRef.current
    const threshold = 40

    if (diff < -threshold && selectedIndex < featuredList.length - 1) {
      setSelectedIndex((prev) => prev + 1)
    } else if (diff > threshold && selectedIndex > 0) {
      setSelectedIndex((prev) => prev - 1)
    }
    setDragOffset(0)
  }

  // --- Real-Time Mouse Drag Gestures (For mobile simulators) ---
  const handleMouseDown = (e: React.MouseEvent) => {
    startXRef.current = e.clientX
    currentXRef.current = e.clientX
    isPointerDownRef.current = true
    setIsDragging(true)
    setDragOffset(0)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPointerDownRef.current) return
    currentXRef.current = e.clientX
    const diff = currentXRef.current - startXRef.current
    setDragOffset(diff)
  }

  const handleMouseUp = () => {
    if (!isPointerDownRef.current) return
    isPointerDownRef.current = false
    setIsDragging(false)
    const diff = currentXRef.current - startXRef.current
    const threshold = 40

    if (diff < -threshold && selectedIndex < featuredList.length - 1) {
      setSelectedIndex((prev) => prev + 1)
    } else if (diff > threshold && selectedIndex > 0) {
      setSelectedIndex((prev) => prev - 1)
    }
    setDragOffset(0)
  }

  const handleMouseLeave = () => {
    if (isPointerDownRef.current) {
      handleMouseUp()
    }
  }

  if (featuredList.length === 0) return null

  return (
    <div className="w-full select-none">

      {/* ========================================================================= */}
      {/* 1. MOBILE & TABLET LAYOUT (< 1024px): Gesture Slider (Static, No Timer)    */}
      {/* ========================================================================= */}
      <div className="block lg:hidden w-full">
        {/* Peek Carousel Viewport with Real-time Drag Gestures */}
        <div 
          className="w-full overflow-hidden touch-pan-y cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
        >
          <div 
            className="flex"
            style={{
              transform: `translateX(calc(12% - ${selectedIndex * 76}% + ${dragOffset}px))`,
              transition: isDragging ? 'none' : 'transform 350ms cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            {featuredList.map((product, idx) => {
              const isFree = Number(product.price_usd) === 0
              const isSaved = isWishlisted(product.id)
              const inCart = isInCart(product.id)
              const priceUsd = Number(product.price_usd) || 0
              const priceInr = product.price_inr ? Number(product.price_inr) : convertUsdToInr(priceUsd)

              return (
                <div
                  key={product.id}
                  className="w-[78%] sm:w-[74%] flex-shrink-0 px-2.5 sm:px-3"
                >
                  <Link
                    href={`/product/${product.slug}`}
                    prefetch={true}
                    className="block relative w-full aspect-[3/4.3] sm:aspect-[3/4] rounded-2xl overflow-hidden border border-[#222222] shadow-2xl bg-[#121212] cursor-pointer"
                  >
                    {/* Background Artwork */}
                    <Image
                      src={getCdnImageUrl(product.cover_image || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop', { width: 1200 })}
                      alt={product.name}
                      fill
                      priority={idx === 0}
                      unoptimized
                      className="object-cover object-center pointer-events-none"
                    />

                    {/* Dark Gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/90 via-[#0a0a0a]/30 to-transparent pointer-events-none" />

                    {/* Top Right Wishlist Bookmark Button */}
                    <button
                      type="button"
                      onClick={(e) => handleWishlistToggle(e, product)}
                      className={`absolute top-4 right-4 w-8 h-8 rounded-full backdrop-blur-md border flex items-center justify-center z-20 active:scale-90 transition-all duration-200 ${
                        isSaved
                          ? 'bg-[#FC6301] text-white border-[#FC6301] shadow-[0_0_12px_rgba(252,99,1,0.45)] hover:bg-[#e05700]'
                          : 'bg-[#121214]/80 text-zinc-300 border-white/15 hover:border-[#FC6301]/70 hover:text-[#FC6301] hover:bg-[#1c1c20]'
                      }`}
                      title={isSaved ? "Saved in Wishlist" : "Save to Wishlist"}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>

                    {/* Content Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 space-y-2.5 z-10">
                      <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-white leading-tight font-sans line-clamp-1">
                        {product.name}
                      </h2>

                      <p className="text-xs text-zinc-200 font-normal leading-relaxed line-clamp-2">
                        {product.short_description || 'Professional audio tools and VST plugins designed for modern music producers.'}
                      </p>

                      {/* Action Buttons Row */}
                      <div className="pt-1 flex items-center gap-2">
                        <span className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs px-5 py-2 rounded-lg uppercase tracking-wider shadow-lg active:scale-95 inline-flex items-center justify-center min-w-[90px]">
                          {isFree ? 'Free' : formatPrice(priceInr, priceUsd)}
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
                              price_inr: priceInr,
                              price_usd: priceUsd,
                              cover_image: product.cover_image,
                              product_type: product.product_type,
                              brand: product.brand,
                            })
                          }}
                          className={`p-2 rounded-lg border transition-all active:scale-95 flex items-center justify-center ${
                            inCart
                              ? 'bg-white text-black border-white'
                              : 'bg-[#1e1e1e]/80 hover:bg-[#282828] text-white border-white/10'
                          }`}
                          title={inCart ? "In Cart" : "Add to Cart"}
                        >
                          {inCart ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile Pagination Indicator Dots (Static) */}
        <div className="relative z-20 flex items-center justify-center gap-2.5 mt-5 mb-6">
          {featuredList.map((_, idx) => {
            const isActive = idx === selectedIndex
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`w-[6px] h-[6px] rounded-full transition-colors duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white'
                    : 'bg-[#787880] hover:bg-[#9a9aa2]'
                }`}
              />
            )
          })}
        </div>
      </div>


      {/* ========================================================================= */}
      {/* 2. DESKTOP LAYOUT (>= 1024px): PC-Only Auto-Rotation Animated Carousel    */}
      {/* ========================================================================= */}
      <div className="hidden lg:grid grid-cols-12 gap-4 lg:gap-5 xl:gap-6 items-stretch">
        
        {/* Main Hero Banner Container (Left 9 out of 12 columns - Flush against page, no shadow) */}
        <div 
          className="col-span-9 relative w-full rounded-2xl overflow-hidden bg-[#121212]"
          style={{ 
            position: 'relative', 
            width: '100%', 
            height: 560,
            minHeight: 560,
            overflow: 'hidden',
            isolation: 'isolate',
            transform: 'translateZ(0)'
          }}
        >
          {/* Horizontal Sliding Viewport (Smooth 700ms Animation) */}
          <div 
            className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] motion-reduce:transition-none"
            style={{ 
              display: 'flex',
              height: '100%',
              width: '100%',
              transform: `translateX(-${selectedIndex * 100}%)`,
              transition: 'transform 700ms cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            {featuredList.map((product, idx) => {
              const isFree = Number(product.price_usd) === 0
              const isSaved = isWishlisted(product.id)
              const inCart = isInCart(product.id)
              const priceUsd = Number(product.price_usd) || 0
              const priceInr = product.price_inr ? Number(product.price_inr) : convertUsdToInr(priceUsd)

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
                    priority={idx === 0}
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
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-transparent pointer-events-none" style={{ position: 'absolute', inset: 0 }} />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/95 via-[#0a0a0a]/40 to-transparent pointer-events-none" style={{ position: 'absolute', inset: 0 }} />

                  {/* Top Right Wishlist Button for Desktop */}
                  <button
                    type="button"
                    onClick={(e) => handleWishlistToggle(e, product)}
                    aria-label={isSaved ? "Remove from Wishlist" : "Save to Wishlist"}
                    className={`absolute top-5 right-5 w-11 h-11 rounded-full backdrop-blur-md border flex items-center justify-center z-20 active:scale-90 transition-all ${
                      isSaved
                        ? 'bg-white text-black border-white shadow-xl'
                        : 'bg-black/70 text-white border-white/20 hover:bg-white hover:text-black shadow-lg'
                    }`}
                    title={isSaved ? "Saved in Wishlist" : "Save to Wishlist"}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </button>

                  {/* Hero Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-10 xl:p-12 max-w-2xl space-y-3.5 z-10">
                    
                    {/* Brand / Category Tag */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 bg-white/[0.08] backdrop-blur-md px-2.5 py-1 rounded-md border border-white/[0.06]">
                        {product.brand && product.brand !== 'Producer Toy' ? product.brand : (product.product_type || 'Featured Release')}
                      </span>
                    </div>

                    {/* Main Product Title */}
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black tracking-tight text-white leading-tight font-sans drop-shadow-2xl">
                      {product.name}
                    </h2>

                    {/* Short Description */}
                    <p className="text-sm lg:text-base text-zinc-200 font-normal leading-relaxed line-clamp-2 drop-shadow-md max-w-lg">
                      {product.short_description || 'Professional audio tools and VST plugins designed for modern music producers.'}
                    </p>

                    {/* Price & Action Row (1:1 Epic Games Store Layout) */}
                    <div className="pt-2 space-y-2.5">
                      <p className="text-xs uppercase tracking-wider font-bold text-zinc-300">
                        {isFree ? 'Free' : formatPrice(priceInr, priceUsd)}
                      </p>

                      <div className="flex items-center gap-3 flex-wrap">
                        <span
                          className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs sm:text-sm px-7 py-3 rounded-xl transition-colors uppercase tracking-wider shadow-xl active:scale-95 inline-flex items-center justify-center min-w-[130px]"
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
                              price_inr: priceInr,
                              price_usd: priceUsd,
                              cover_image: product.cover_image,
                              product_type: product.product_type,
                              brand: product.brand
                            })
                          }}
                          className={`p-3 rounded-xl border transition-all active:scale-95 flex items-center justify-center shadow-lg ${
                            inCart
                              ? 'bg-white text-black border-white'
                              : 'bg-[#1e1e1e]/85 hover:bg-[#282828] text-white border-white/15'
                          }`}
                          title={inCart ? "In Cart" : "Add to Cart"}
                          aria-label="Add to Cart"
                        >
                          {inCart ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                  </div>
                </Link>
              )
            })}
          </div>

        </div>

        {/* Right Sidebar Interactive Product Cards (PC Only) - EXACT 1:1 Epic Games Store Reference */}
        <div 
          className="col-span-3 flex flex-col justify-start gap-2 xl:gap-2.5 py-1" 
          role="tablist" 
          aria-label="Featured slides"
          style={{ height: 560, minHeight: 560 }}
        >
          {featuredList.map((item, idx) => {
            const isActive = idx === selectedIndex
            return (
              <button
                key={item.id}
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? 'true' : undefined}
                aria-label={item.name}
                onClick={() => handleSelect(idx)}
                style={{ height: 84, minHeight: 84 }}
                className={`group relative w-full flex items-center gap-3.5 px-3.5 py-2 rounded-2xl transition-all duration-200 text-left overflow-hidden cursor-pointer ${
                  isActive
                    ? 'bg-[#202020]'
                    : 'bg-transparent hover:bg-white/[0.04]'
                }`}
              >
                {/* Active Animated Progress Fill Layer (PC Only - sweeps horizontally to the side) */}
                {isActive && (
                  <div 
                    className="absolute inset-0 bg-white/[0.08] transition-all duration-75 ease-linear origin-left pointer-events-none"
                    style={{ 
                      width: `${progress}%`
                    }}
                  />
                )}

                {/* Poster / Thumbnail Box */}
                <div 
                  style={{ width: 52, height: 68, minWidth: 52, minHeight: 68 }}
                  className={`relative z-10 rounded-xl overflow-hidden flex-shrink-0 bg-[#161616] border border-white/[0.06] shadow-sm transition-transform duration-200 ${
                    isActive ? 'scale-[1.02]' : 'group-hover:scale-[1.02]'
                  }`}
                >
                  <Image
                    src={getCdnImageUrl(item.cover_image, { width: 140 })}
                    alt={item.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>

                {/* Info Text */}
                <div className="flex-1 min-w-0 pr-1 relative z-10">
                  <p className={`text-[13px] xl:text-[14px] leading-snug line-clamp-2 transition-colors duration-200 ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-zinc-400 group-hover:text-white font-medium'
                  }`}>
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
