'use client'

import React from 'react'
import Link from 'next/link'
import { Search, ChevronDown, X } from 'lucide-react'

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
  return (
    <div className="w-full bg-[#121212] relative z-30">
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-[100px] flex items-center justify-start gap-8 lg:gap-12">
        
        {/* Exact Epic Games Store Search Pill (240px width, 40px height, #404044 bg, full rounded) */}
        <div className="relative w-56 sm:w-60 lg:w-[240px] flex-shrink-0">
          <form onSubmit={onSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 text-zinc-300 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search store"
              className="w-full bg-[#404044] text-white text-sm pl-11 pr-8 h-[40px] rounded-full border border-transparent focus:outline-none focus:bg-[#4a4a50] focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-300 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 rounded-full cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
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


