'use client'

import React, { useMemo } from 'react'
import Link from 'next/link'
import { Product, ProductCard } from '@/components/ProductCard'

interface EpicTrendingProps {
  products: Product[]
  title?: string
}

export function EpicTrending({ products = [], title = "Trending" }: EpicTrendingProps) {
  // Sort products prioritizing featured + latest high-demand products
  const trendingProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        // 1. Featured items first
        if (a.is_featured && !b.is_featured) return -1
        if (!a.is_featured && b.is_featured) return 1
        // 2. Newest / high demand next
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateB - dateA
      })
      .slice(0, 5)
  }, [products])

  if (trendingProducts.length === 0) return null

  return (
    <section className="w-full my-8 sm:my-14 select-none">
      {/* Header Row (Exact Epic Games Store Layout: 'Trending' title on left + 'View More' on right) */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {title}
        </h2>

        <Link
          href="/store?sort=trending"
          prefetch={true}
          className="border border-white/20 hover:border-white text-white text-xs sm:text-[13px] font-semibold px-3.5 sm:px-4 py-1.5 rounded-lg transition-colors cursor-pointer active:scale-95"
        >
          View More
        </Link>
      </div>

      {/* Desktop 5-Column Grid / Mobile Horizontal Scroll */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 lg:gap-5">
        {trendingProducts.map((product) => (
          <div key={product.id} className="w-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
