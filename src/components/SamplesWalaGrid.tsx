'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { Product, ProductCard } from '@/components/ProductCard'

interface SamplesWalaGridProps {
  products: Product[]
  title?: string
}

export function SamplesWalaGrid({ products, title = "Samples Wala ✕ Producer Toy" }: SamplesWalaGridProps) {
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
    <section className="w-full my-8 sm:my-12 lg:my-16 select-none">
      {/* Minimalist Epic Header Row */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-3">
          <h2>
            <Link 
              href="/store?brand=samples-wala" 
              prefetch={true}
              className="group inline-flex items-center gap-1.5 text-xl sm:text-2xl font-bold text-white hover:text-white/80 transition-colors tracking-tight"
            >
              <span>{title}</span>
              <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
            </Link>
          </h2>

          <span className="hidden sm:inline-flex items-center text-[11px] font-semibold text-zinc-400 bg-[#1e1e1e] border border-[#2a2a2a] px-2.5 py-0.5 rounded-full">
            Sound Partner
          </span>
        </div>

        {/* Minimal Scroll Control Arrows */}
        <div className="flex items-center gap-2">
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
