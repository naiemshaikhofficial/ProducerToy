'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Gift } from 'lucide-react'
import { Product } from '@/components/ProductCard'
import { getCdnImageUrl } from '@/lib/cdn'

interface FreeProducerToysProps {
  products?: Product[]
}

interface FreeItemDisplay {
  id: string
  name: string
  slug: string
  cover_image: string
  brand?: string
}

export function FreeProducerToys({ products = [] }: FreeProducerToysProps) {
  // 1. Find all active free products from the database (price_usd === 0)
  const freeProductsFromDb = products.filter(
    (p) => Number(p.price_usd) === 0
  )

  // If no free products in database, do not render the section
  if (freeProductsFromDb.length === 0) {
    return null
  }

  const displayItems: FreeItemDisplay[] = freeProductsFromDb.slice(0, 4).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    cover_image: p.cover_image,
    brand: p.brand || 'Producer Toy',
  }))

  return (
    <section className="w-full select-none">
      {/* Outer Epic Games Container Box */}
      <div className="w-full bg-[#181818] border border-[#262626] rounded-xl sm:rounded-2xl p-5 sm:p-7 md:p-9 shadow-2xl">
        
        {/* Section Header: Gift Icon + Free Producer Toys + View More */}
        <div className="flex items-center justify-between mb-5 sm:mb-7">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* White Line Art Gift Box Icon */}
            <div className="text-white flex-shrink-0">
              <Gift className="w-5 h-5 sm:w-7 sm:h-7 stroke-[2]" />
            </div>
            <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
              Free Producer Toys
            </h2>
          </div>

          {/* View More Bordered Action Button */}
          <Link
            href="/free-vst-plugins"
            prefetch={true}
            className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold text-white hover:text-white bg-transparent hover:bg-white/10 border border-white/20 hover:border-white rounded-lg transition-all cursor-pointer inline-flex items-center justify-center active:scale-95"
          >
            View More
          </Link>
        </div>

        {/* 4 Cards Grid (Exact 1:1 Epic Games Match: 2-Cols on Mobile, 4-Cols on Desktop) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
          {displayItems.map((item) => (
            <Link
              key={item.id}
              href={`/product/${item.slug}`}
              prefetch={true}
              className="group flex flex-col select-none cursor-pointer"
              title={`${item.name} by ${item.brand || 'Producer Toy'}`}
            >
              {/* 3:4 Poster Image Container (Static + Brightness on Hover) */}
              <div className="relative w-full aspect-[3/4] rounded-t-lg sm:rounded-t-xl overflow-hidden bg-[#202020] border-t border-x border-[#282828]">
                <Image
                  src={getCdnImageUrl(item.cover_image, { width: 600 })}
                  alt={`${item.name} by ${item.brand || 'Producer Toy'} - Free VST Plugin`}
                  title={`${item.name} - ${item.brand || 'Producer Toy'}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-center group-hover:brightness-110 transition-all duration-200 ease-out"
                />
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
              </div>

              {/* Flush Bottom Action Bar (Static Brand Orange FREE) */}
              <div className="bg-[#FC6301] group-hover:bg-[#e05700] text-white font-black text-[10px] sm:text-[12px] py-1.5 px-2 text-center uppercase tracking-wider rounded-b-lg sm:rounded-b-xl transition-colors">
                FREE
              </div>

              {/* Product Title (Static Solid White Text) */}
              <div className="flex flex-col mt-2.5 px-0.5">
                <h3 className="font-bold text-white text-xs sm:text-[15px] tracking-tight leading-snug line-clamp-1">
                  {item.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
