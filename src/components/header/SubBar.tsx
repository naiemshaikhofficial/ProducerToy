'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, ChevronDown, X, Check } from 'lucide-react'

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

const MOBILE_DISCOVER_OPTIONS = [
  { label: 'Discover', href: '/store' },
  { label: 'Browse', href: '/store' },
  { label: 'News', href: '/store' },
  { label: 'Deals', href: '/store?on_sale=true' },
  { label: 'Brands', href: '/manufacturers' },
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
  const pathname = usePathname()
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isDiscoverMenuOpen, setIsDiscoverMenuOpen] = useState(false)
  const mobileInputRef = useRef<HTMLInputElement>(null)
  const discoverMenuRef = useRef<HTMLDivElement>(null)

  // Focus input when mobile search opens
  useEffect(() => {
    if (isMobileSearchOpen && mobileInputRef.current) {
      mobileInputRef.current.focus()
    }
  }, [isMobileSearchOpen])

  // Close discover dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (discoverMenuRef.current && !discoverMenuRef.current.contains(event.target as Node)) {
        setIsDiscoverMenuOpen(false)
      }
    }
    if (isDiscoverMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDiscoverMenuOpen])

  // Determine current active section label for mobile dropdown
  const currentSectionLabel = (() => {
    if (pathname === '/manufacturers') return 'Brands'
    return 'Discover'
  })()

  return (
    <div className="w-full bg-[#121212] relative z-30">
      
      {/* ========================================================================= */}
      {/* 1. MOBILE SUBBAR (< 768px): Exact Epic Games Store Mobile Search & Discover */}
      {/* ========================================================================= */}
      <div className="flex md:hidden w-full px-4 sm:px-6 h-[54px] items-center justify-between relative">
        
        {isMobileSearchOpen ? (
          /* Mobile Expandable Search Bar */
          <form 
            onSubmit={(e) => {
              onSearchSubmit(e)
              setIsMobileSearchOpen(false)
            }} 
            className="w-full flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={mobileInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search store..."
                className="w-full bg-[#202024] text-white text-sm pl-10 pr-8 h-[38px] rounded-full border border-zinc-700 focus:outline-none focus:border-zinc-400 placeholder:text-zinc-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(false)}
              className="text-xs font-semibold text-zinc-300 hover:text-white px-2 py-1.5"
            >
              Cancel
            </button>
          </form>
        ) : (
          /* Mobile Normal State: Search Icon on Left, Discover Dropdown in Center */
          <>
            {/* Search Trigger Icon */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(true)}
              className="p-2 text-zinc-300 hover:text-white transition-colors active:scale-95 flex items-center justify-center"
              aria-label="Open search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Discover ▾ Selector Dropdown */}
            <div ref={discoverMenuRef}>
              <button
                type="button"
                onClick={() => setIsDiscoverMenuOpen(!isDiscoverMenuOpen)}
                className="flex items-center gap-1.5 text-[15px] font-bold text-white hover:text-zinc-200 transition-colors py-1.5 px-2.5 rounded-lg cursor-pointer"
              >
                <span>{currentSectionLabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isDiscoverMenuOpen ? 'rotate-180 text-white' : ''}`} />
              </button>

              {/* Exact Epic Games Store Mobile Dropdown Menu (Centered in the middle) */}
              {isDiscoverMenuOpen && (
                <>
                  {/* Dark Solid Backdrop (No Blur) */}
                  <div 
                    className="fixed inset-0 top-0 bg-black/75 z-40"
                    onClick={() => setIsDiscoverMenuOpen(false)}
                  />

                  {/* Dropdown Container (Dead Center in the Middle) */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-[90vw] max-w-[400px] bg-[#121214] shadow-2xl px-7 pt-6 pb-8 z-50 animate-in fade-in duration-150">
                    <div className="flex flex-col">
                      {MOBILE_DISCOVER_OPTIONS.map((item, idx) => {
                        const isSelected = item.label === currentSectionLabel
                        const isLast = idx === MOBILE_DISCOVER_OPTIONS.length - 1
                        return (
                          <div key={item.label}>
                            <Link
                              href={item.href}
                              prefetch={true}
                              onClick={() => setIsDiscoverMenuOpen(false)}
                              className={`block py-4 text-[18px] sm:text-[19px] tracking-wide transition-colors ${
                                isSelected
                                  ? 'text-white font-bold'
                                  : 'text-[#909098] font-normal hover:text-white'
                              }`}
                            >
                              {item.label}
                            </Link>
                            {!isLast && <div className="w-full h-[1px] bg-[#2a2a2e]" />}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Empty Spacer to balance the search icon */}
            <div className="w-9" />
          </>
        )}

      </div>


      {/* ========================================================================= */}
      {/* 2. DESKTOP SUBBAR (>= 768px): Full Search Bar & Mega Menu Navigation       */}
      {/* ========================================================================= */}
      <div className="hidden md:flex w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-[80px] lg:h-[90px] items-center justify-start gap-8 lg:gap-12">
        
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
        <nav className="flex items-center gap-8 lg:gap-10 text-base font-normal">
          
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



