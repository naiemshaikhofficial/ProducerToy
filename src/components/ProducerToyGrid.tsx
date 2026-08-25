'use client'

import React, { useRef } from 'react'
import Link from 'next/link'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { Product, ProductCard } from '@/components/ProductCard'

interface ProducerToyGridProps {
  products: Product[]
  title?: string
}

export function ProducerToyGrid({ products, title = "Producer Toy Originals" }: ProducerToyGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Filter products by Producer Toy brand (fallback to all products if none matched)
  const producerToyProducts = products.filter(
    (p) => p.brand?.toLowerCase() === 'producer toy' || p.brand?.toLowerCase() === 'producertoy'
  )
  const displayProducts = producerToyProducts.length > 0 ? producerToyProducts : products

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (displayProducts.length === 0) return null

  return (
    <section className="w-full my-8 sm:my-12 select-none">
      {/* Header Row with Arrow Navigation */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <Link 
          href="/store?brand=producer-toy" 
          prefetch={true}
          className="group inline-flex items-center gap-1 text-xl sm:text-2xl font-bold text-white hover:text-white/80 transition-colors tracking-tight"
        >
          <span>{title}</span>
          <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Scroll Control Arrows */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-9 h-9 rounded-full bg-[#202020] hover:bg-[#303030] text-white/80 hover:text-white flex items-center justify-center transition-colors shadow-md active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-9 h-9 rounded-full bg-[#202020] hover:bg-[#303030] text-white/80 hover:text-white flex items-center justify-center transition-colors shadow-md active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Epic Games Store Poster Card Grid / Scroll Container */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none pb-4 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {displayProducts.map((product) => (
          <div 
            key={product.id} 
            className="flex-none w-[200px] sm:w-[220px] lg:w-[235px] snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
