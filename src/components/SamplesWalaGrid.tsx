'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react'
import { Product, ProductCard } from '@/components/ProductCard'

interface SamplesWalaGridProps {
  products: Product[]
  title?: string
}

export function SamplesWalaGrid({ products }: SamplesWalaGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Filter products strictly by Samples Wala brand (excluding coming soon items)
  const releasedProducts = products.filter((p) => !p.is_coming_soon)
  const displayProducts = releasedProducts.filter((p) => {
    const brandName = (p.brands?.name || p.brand || '').toLowerCase().trim()
    return (
      brandName === 'samples wala' ||
      brandName === 'sampleswala' ||
      brandName.includes('samples wala') ||
      brandName.includes('sampleswala')
    )
  })

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (displayProducts.length === 0) return null

  return (
    <section className="w-full my-8 sm:my-12 lg:my-16 select-none relative">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5 sm:mb-6">
        
        {/* Left: Painted Graffiti Title + Subtitle */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <Link 
              href="/store?brand=samples-wala" 
              prefetch={true}
              className="group inline-flex items-center gap-2"
            >
              <h2 className="font-graffiti text-2xl sm:text-3xl lg:text-4xl text-white tracking-wide uppercase drop-shadow-[0_2px_10px_rgba(252,99,1,0.3)] transition-all group-hover:brightness-110">
                PRODUCER TOY <span className="text-[#FC6301] font-sans font-black mx-1 inline-block -rotate-6">✕</span> SAMPLES WALA
              </h2>
              <ChevronRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-zinc-400 font-normal">
            Checkout a huge collection of Samples Wala now on Producer Toy.
          </p>
        </div>

        {/* Right: Scroll Control Arrows */}
        <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
          <button
            onClick={() => scroll('left')}
            className="w-9 h-9 rounded-full bg-[#1c1c1e] hover:bg-[#28282b] text-zinc-300 hover:text-white flex items-center justify-center transition-colors shadow-sm active:scale-95 cursor-pointer border border-white/10"
            aria-label="Scroll left"
            title="Previous items"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-9 h-9 rounded-full bg-[#1c1c1e] hover:bg-[#28282b] text-zinc-300 hover:text-white flex items-center justify-center transition-colors shadow-sm active:scale-95 cursor-pointer border border-white/10"
            aria-label="Scroll right"
            title="Next items"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Epic Games Store Poster Card Grid / Scroll Container */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 sm:gap-6 lg:gap-7 overflow-x-auto scrollbar-none pb-3 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {displayProducts.map((product) => (
          <div 
            key={product.id} 
            className="flex-none w-[155px] sm:w-[190px] lg:w-[225px] snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
