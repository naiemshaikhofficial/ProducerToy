'use client'

import React, { useRef, useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { Product, ProductCard } from '@/components/ProductCard'

interface EpicMostPopularProps {
  products: Product[]
  title?: string
}

export function EpicMostPopular({ products = [], title = "Most Popular" }: EpicMostPopularProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Sort by popularity & sales (featured products and top-performing audio tools)
  const popularProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1
      if (!a.is_featured && b.is_featured) return 1
      return 0
    })
  }, [products])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -420 : 420
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (popularProducts.length === 0) return null

  return (
    <section className="w-full my-10 sm:my-16 lg:my-20 select-none">
      {/* Header Row (Exact Epic Games Store: 'Most Popular >' on left + Scroll Arrows on right) */}
      <div className="flex items-center justify-between mb-5 sm:mb-7">
        <Link
          href="/store?sort=popular"
          prefetch={true}
          className="group inline-flex items-center gap-1.5 text-xl sm:text-2xl font-bold text-white hover:text-zinc-300 transition-colors"
        >
          <span>{title}</span>
          <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Scroll Control Arrows (< >) */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-[#202020] hover:bg-[#303030] text-zinc-300 hover:text-white flex items-center justify-center transition-colors shadow-md active:scale-95 cursor-pointer border border-white/[0.06]"
            aria-label="Scroll previous products"
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-[#202020] hover:bg-[#303030] text-zinc-300 hover:text-white flex items-center justify-center transition-colors shadow-md active:scale-95 cursor-pointer border border-white/[0.06]"
            aria-label="Scroll next products"
            title="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Side-Scrollable Horizontal 5-Card Viewport */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 sm:gap-6 lg:gap-7 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {popularProducts.map((product) => (
          <div
            key={product.id}
            className="flex-none w-[155px] sm:w-[195px] lg:w-[calc(20%-18px)] snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
