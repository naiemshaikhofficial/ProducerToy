'use client'

import React, { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, ChevronDown, ArrowRight, Tag, X } from 'lucide-react'
import { clientCache } from '@/lib/clientCache'
import { matchesSearchQuery } from '@/lib/search'
import { categoryData } from './categoryData'

interface SubBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  onSearchSubmit: (e: React.FormEvent) => void
  isScrolled: boolean
  isProductsMegaOpen: boolean
  onMouseEnterProducts: () => void
  onMouseLeaveProducts: () => void
}

const NAV_LINKS = [
  { label: 'Deals', href: '/store?on_sale=true' },
  { label: 'Brands', href: '/manufacturers' },
  { label: 'Rent to Own', href: '/store' },
  { label: 'Blog', href: '/store' },
  { label: 'Free', href: '/store?free=true' },
]

export const SubBar: React.FC<SubBarProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  isScrolled,
  isProductsMegaOpen,
  onMouseEnterProducts,
  onMouseLeaveProducts,
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 0ms instant matching from pre-seeded client cache
  const { matchingProducts, matchingCategories } = useMemo(() => {
    const q = searchQuery.trim()
    if (!q) return { matchingProducts: [], matchingCategories: [] }

    const allProducts = clientCache.get<any[]>('producertoy_catalog_products') || []
    const matchedP = allProducts.filter((p) => matchesSearchQuery(p, q)).slice(0, 5)

    // Match categories and subcategories
    const matchedCats: Array<{ label: string; href: string }> = []
    const qLower = q.toLowerCase()

    Object.keys(categoryData).forEach((catKey) => {
      const cat = categoryData[catKey]
      if (cat.label.toLowerCase().includes(qLower) || cat.slug.toLowerCase().includes(qLower)) {
        matchedCats.push({ label: cat.label, href: `/store/${cat.slug}` })
      }
      cat.items.forEach((item) => {
        if (item.name.toLowerCase().includes(qLower) || item.slug.toLowerCase().includes(qLower)) {
          if (!matchedCats.some((c) => c.label === item.name)) {
            matchedCats.push({
              label: item.name,
              href: item.slug ? `/store/${cat.slug}/${item.slug}` : `/store/${cat.slug}`,
            })
          }
        }
      })
    })

    return {
      matchingProducts: matchedP,
      matchingCategories: matchedCats.slice(0, 4),
    }
  }, [searchQuery])

  const showLiveSearch = isSearchFocused && searchQuery.trim().length > 0

  return (
    <div className="w-full bg-[#121212] relative z-30">
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-[100px] flex items-center justify-start gap-8 lg:gap-12">
        
        {/* Exact Epic Games Store Search Pill + Instant Live Search Dropdown */}
        <div ref={searchContainerRef} className="relative w-56 sm:w-72 lg:w-[280px] flex-shrink-0">
          <form onSubmit={onSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 text-zinc-300 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search store"
              className="w-full bg-[#404044] text-white text-sm pl-11 pr-8 h-[40px] rounded-full border border-transparent focus:outline-none focus:bg-[#4a4a50] focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-300 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Instant 0ms Live Search Results Popup */}
          {showLiveSearch && (
            <div className="absolute top-[48px] left-0 w-[320px] sm:w-[380px] bg-[#18181b] border border-[#2e2e34] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-md">
              
              {/* Category / Subcategory Quick Match Pills */}
              {matchingCategories.length > 0 && (
                <div className="p-3 border-b border-[#27272a] bg-[#141416]">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-zinc-400" />
                    <span>Categories & Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchingCategories.map((cat, idx) => (
                      <Link
                        key={idx}
                        href={cat.href}
                        prefetch={true}
                        onClick={() => setIsSearchFocused(false)}
                        className="text-xs bg-[#222226] hover:bg-white hover:text-black text-zinc-300 px-2.5 py-1 rounded-full transition-all font-medium border border-[#303036]"
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Products List */}
              <div className="p-2 max-h-[320px] overflow-y-auto custom-scrollbar">
                {matchingProducts.length > 0 ? (
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-1">
                      Products
                    </div>
                    {matchingProducts.map((product) => {
                      const brandName = product.brands?.name || product.brand || 'Producer Toy'
                      const isFree = product.price_usd === 0
                      const priceDisplay = isFree ? 'Free' : `$${product.price_usd}`

                      return (
                        <Link
                          key={product.id}
                          href={`/product/${product.slug}`}
                          prefetch={true}
                          onClick={() => setIsSearchFocused(false)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#27272a] transition-all group"
                        >
                          {/* Square Thumbnail */}
                          <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-[#202020] flex-shrink-0 border border-[#333338]">
                            {product.cover_image && (
                              <Image
                                src={product.cover_image}
                                alt={product.name}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate group-hover:text-zinc-200">
                              {product.name}
                            </p>
                            <p className="text-[11px] text-zinc-400 truncate">
                              by {brandName}
                            </p>
                          </div>

                          {/* Price Tag */}
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            isFree ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-zinc-200'
                          }`}>
                            {priceDisplay}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                ) : (
                  matchingCategories.length === 0 && (
                    <div className="p-4 text-center text-xs text-zinc-400">
                      No instant matches found for &quot;{searchQuery}&quot;
                    </div>
                  )
                )}
              </div>

              {/* View all in Store CTA Bar */}
              <Link
                href={`/store?q=${encodeURIComponent(searchQuery.trim())}`}
                prefetch={true}
                onClick={() => setIsSearchFocused(false)}
                className="w-full bg-[#202025] hover:bg-[#2a2a30] text-zinc-200 hover:text-white p-3 text-xs font-bold flex items-center justify-between border-t border-[#2e2e34] transition-colors"
              >
                <span>Search all results for &quot;{searchQuery}&quot; in Store</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

            </div>
          )}
        </div>

        {/* Epic Games Store Sub Navigation Links (16px font, centered) */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-base font-normal">
          
          {/* Products Mega Dropdown Trigger */}
          <div 
            className="relative flex items-center cursor-pointer py-2"
            onMouseEnter={onMouseEnterProducts}
            onMouseLeave={onMouseLeaveProducts}
          >
            <button 
              type="button"
              className={`flex items-center gap-1.5 font-semibold transition-colors cursor-pointer ${
                isProductsMegaOpen ? 'text-white' : 'text-white hover:text-zinc-200'
              }`}
            >
              <span>Products</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProductsMegaOpen ? 'rotate-180 text-white' : 'text-zinc-400'}`} />
            </button>
          </div>

          {/* Clean Mapped Links */}
          {NAV_LINKS.map((link) => (
            <Link 
              key={link.label} 
              href={link.href} 
              prefetch={true}
              className="text-zinc-300 hover:text-white font-normal transition-colors py-2"
            >
              {link.label}
            </Link>
          ))}

        </nav>

      </div>
    </div>
  )
}

