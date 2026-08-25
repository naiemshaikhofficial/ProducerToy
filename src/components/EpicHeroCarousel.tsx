'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, Bookmark } from 'lucide-react'
import { Product } from '@/components/ProductCard'
import { useCurrency } from '@/context/CurrencyContext'
import { useCart } from '@/context/CartContext'

interface EpicHeroCarouselProps {
  products: Product[]
}

const ROTATION_DURATION = 7000 // 7 seconds per slide

export function EpicHeroCarousel({ products }: EpicHeroCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const { formatPrice } = useCurrency()
  const { addItem } = useCart()

  // Priority to featured products (is_featured === true), backfilling with top products to ensure all products rotate
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

  // Hook 2: Trigger slide transition strictly when progress hits 100% (Sequential 0 -> 1 -> 2 -> 3 -> 0)
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

  if (featuredList.length === 0) return null

  return (
    <div className="w-full select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 items-stretch">
        
        {/* Main Hero Banner Container (Left 9 out of 12 columns) */}
        <div className="lg:col-span-9 relative w-full h-[360px] sm:h-[400px] lg:h-[430px] rounded-none overflow-hidden border border-[#202020] shadow-2xl bg-[#121212]">
          
          {/* Horizontal Sliding Viewport (Exact Epic Games Slide Transition) */}
          <div 
            className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
            style={{ transform: `translateX(-${selectedIndex * 100}%)` }}
          >
            {featuredList.map((product) => (
              <Link 
                key={product.id} 
                href={`/product/${product.slug}`}
                className="block relative w-full h-full flex-shrink-0 overflow-hidden group cursor-pointer"
              >
                
                {/* Background Artwork */}
                <Image
                  src={product.cover_image || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1600&auto=format&fit=crop'}
                  alt={product.name}
                  fill
                  priority
                  unoptimized
                  className="object-cover object-center"
                />

                {/* Epic Dark Gradients for Content Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/95 via-[#0a0a0a]/45 to-transparent" />

                {/* Hero Content Overlay (Only Name, Description, Buy Now, Cart & Save) */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 lg:p-9 max-w-xl space-y-3 z-10">
                  
                  {/* Main Product Title */}
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-white leading-tight font-sans drop-shadow-xl">
                    {product.name}
                  </h1>

                  {/* Short Description */}
                  <p className="text-xs sm:text-sm text-zinc-200 font-normal leading-relaxed line-clamp-2 drop-shadow-md max-w-md">
                    {product.short_description || 'Professional audio tools and VST plugins designed for modern music producers.'}
                  </p>

                  {/* CTA Action Buttons Row (Buy Now, Add to Cart, Save) */}
                  <div className="pt-1 flex items-center gap-2.5 flex-wrap">
                    <span
                      className="bg-white hover:bg-zinc-200 text-black font-extrabold text-xs px-6 py-2.5 rounded-xl transition-colors uppercase tracking-wider shadow-lg active:scale-95 inline-flex items-center justify-center min-w-[120px]"
                    >
                      Buy Now
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

                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                      }}
                      className="bg-[#1e1e1e]/80 hover:bg-[#282828] text-white border border-white/10 p-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center"
                      title="Save to Wishlist"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </Link>
            ))}
          </div>

        </div>

        {/* Right Sidebar Interactive Product Cards */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-2 h-auto lg:h-[430px]">
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
                <div className="relative w-12 h-12 sm:w-[48px] sm:h-[48px] aspect-square rounded-xl overflow-hidden flex-shrink-0 border border-[#2a2a2a] z-10 shadow-sm">
                  <Image
                    src={item.cover_image}
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
