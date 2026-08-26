'use client'

import React, { useState, useRef } from 'react'
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

export function EpicHeroCarousel({ products }: EpicHeroCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({})
  const { formatPrice } = useCurrency()
  const { addItem, isInCart } = useCart()

  // Real-time Touch & Drag Gesture Tracking
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const startXRef = useRef<number>(0)
  const currentXRef = useRef<number>(0)
  const isPointerDownRef = useRef<boolean>(false)

  // Priority to featured products (is_featured === true), backfilling with top products
  const featuredOnly = products.filter((p) => p.is_featured === true)
  const nonFeatured = products.filter((p) => !p.is_featured)
  const featuredList = (featuredOnly.length >= 4 
    ? featuredOnly 
    : [...featuredOnly, ...nonFeatured]
  ).slice(0, 5)

  const handleSelect = (index: number) => {
    setSelectedIndex(index)
  }

  const handleWishlistToggle = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setSavedIds((prev) => ({ ...prev, [productId]: !prev[productId] }))
    await toggleWishlistAction(productId)
  }

  // --- Real-Time Touch Gestures ---
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

  // --- Real-Time Mouse Drag Gestures (For desktop & touch simulators) ---
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
      {/* 1. MOBILE & TABLET LAYOUT (< 1024px): Epic Games Store Peek Card Slider */}
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
            className="flex pl-4 sm:pl-6"
            style={{
              transform: isDragging 
                ? `translateX(calc(-${selectedIndex} * (84vw + 14px) + ${dragOffset}px))`
                : `translateX(calc(-${selectedIndex} * (84vw + 14px)))`,
              transition: isDragging ? 'none' : 'transform 450ms cubic-bezier(0.2, 1, 0.3, 1)',
              gap: '14px',
            }}
          >
            {featuredList.map((product, idx) => {
              const isFree = Number(product.price_usd) === 0
              const isSaved = !!savedIds[product.id]
              const inCart = isInCart(product.id)

              return (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-[84vw] sm:w-[410px] max-w-[420px]"
                >
                  <Link
                    href={`/product/${product.slug}`}
                    prefetch={true}
                    className="block relative w-full h-[520px] sm:h-[540px] rounded-[20px] overflow-hidden border border-[#222224] bg-[#141414] shadow-2xl group flex flex-col justify-end"
                  >
                    
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

                    {/* Top Right Wishlist Bookmark Button (Glass Pill) */}
                    <button
                      type="button"
                      onClick={(e) => handleWishlistToggle(e, product.id)}
                      className={`absolute top-4 right-4 w-8 h-8 rounded-full backdrop-blur-md border flex items-center justify-center z-20 active:scale-90 transition-all ${
                        isSaved
                          ? 'bg-white text-black border-white'
                          : 'bg-black/40 text-white/90 border-white/20 hover:bg-black/60'
                      }`}
                      title={isSaved ? "Saved in Wishlist" : "Save to Wishlist"}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                    </button>

                    {/* Card Content Overlay (Exact Epic Games Store Mobile Typography) */}
                    <div className="relative z-10 p-5 sm:p-6 flex flex-col gap-2 pointer-events-auto">
                      
                      {/* Product Type / Brand Tag */}
                      <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300">
                        {product.brand || 'Producer Toy'} • {product.product_type?.replace('_', ' ') || 'Audio Tool'}
                      </span>

                      {/* Main Product Title */}
                      <h2 className="text-[22px] sm:text-[24px] font-black uppercase tracking-tight text-white leading-tight font-sans drop-shadow-md">
                        {product.name}
                      </h2>

                      {/* Subtitle / Short Description */}
                      <p className="text-[13px] text-white/90 font-medium leading-[1.35] line-clamp-3 drop-shadow-sm">
                        {product.short_description || 'Professional audio tools, presets, and sample packs designed for elite music producers.'}
                      </p>

                      {/* Bottom Row: Price & Subtle Cart Icon */}
                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-base font-bold text-white drop-shadow">
                          {isFree ? 'Free' : formatPrice(product.price_inr, product.price_usd)}
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
                              brand: product.brand,
                            })
                          }}
                          className="bg-[#1e1e22]/90 hover:bg-[#282830] text-white border border-white/15 p-2 rounded-lg transition-all shadow-md active:scale-95 flex items-center justify-center"
                          title={inCart ? "In Cart" : "Add to Cart"}
                        >
                          {inCart ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Plus className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile Pagination Indicator Dots (Solid Pure White Active + Solid Visible Gray Inactive, No Glow) */}
        <div className="relative z-20 flex items-center justify-center gap-2 mt-4 mb-4">
          {featuredList.map((_, idx) => {
            const isActive = idx === selectedIndex
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`w-[5px] h-[5px] rounded-full transition-colors duration-200 cursor-pointer ${
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
                {/* Active Highlight Layer */}
                {isActive && (
                  <div className="absolute inset-0 bg-[#282828] transition-all origin-left" />
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
