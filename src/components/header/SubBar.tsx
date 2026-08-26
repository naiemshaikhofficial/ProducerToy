'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, ChevronDown, X, Check, ShoppingCart } from 'lucide-react'

interface SubBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  onSearchSubmit: (e: React.FormEvent) => void
  isScrolled: boolean
  isProductsMegaOpen: boolean
  onMouseEnterProducts: () => void
  onMouseLeaveProducts: () => void
  itemCount?: number
  onOpenCart?: () => void
}

const NAV_LINKS = [
  { label: 'Discover', href: '/store' },
  { label: 'Browse', href: '/store' },
  { label: 'News', href: '/store' },
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
  itemCount = 0,
  onOpenCart,
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
      <div className="flex md:hidden w-full px-4 sm:px-6 h-[48px] items-center justify-between relative">
        
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
                placeholder="Search store"
                className="w-full bg-[#202020] text-white text-xs pl-10 pr-8 h-[38px] rounded-full border border-transparent focus:outline-none focus:bg-[#282828] placeholder:text-zinc-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(false)}
              className="text-xs text-zinc-400 hover:text-white px-2 py-1"
            >
              Cancel
            </button>
          </form>
        ) : (
          /* Normal Mobile SubBar: Search Icon (Left) + Discover ▾ (Center) */
          <>
            {/* Search Icon Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(true)}
              className="p-1.5 text-zinc-300 hover:text-white transition-colors active:scale-95 flex items-center justify-center"
              aria-label="Open search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Discover ▾ Selector Dropdown */}
            <div ref={discoverMenuRef}>
              <button
                type="button"
                onClick={() => setIsDiscoverMenuOpen(!isDiscoverMenuOpen)}
                className="flex items-center gap-1 text-[15px] font-semibold text-white hover:text-zinc-200 transition-colors py-1 px-2 cursor-pointer"
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
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-[90vw] max-w-[400px] bg-[#121212] shadow-2xl px-7 pt-6 pb-8 z-50 animate-in fade-in duration-150 border-b border-[#202020]">
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
                                  : 'text-zinc-400 font-normal hover:text-white'
                              }`}
                            >
                              {item.label}
                            </Link>
                            {!isLast && <div className="w-full h-[1px] bg-[#222222]" />}
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
      {/* 2. DESKTOP SUBBAR (>= 768px): Exact PC Screenshot Match                    */}
      {/* ========================================================================= */}
      <div className="hidden md:flex w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 lg:px-14 h-[68px] items-center justify-between">
        
        {/* Left Side: Search Bar + Discover / Browse / News Links */}
        <div className="flex items-center gap-7 lg:gap-9">
          
          {/* Epic Search Pill (Clean & Prominent) */}
          <div className="relative w-60 lg:w-[250px] flex-shrink-0">
            <form onSubmit={onSearchSubmit} className="relative w-full">
              <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search store"
                className="w-full bg-[#202020] hover:bg-[#252525] focus:bg-[#282828] text-white text-[13.5px] pl-11 pr-8 h-[40px] rounded-full border border-transparent focus:outline-none focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-400 transition-all font-sans"
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

          {/* Desktop Sub Navigation Links */}
          <nav className="flex items-center gap-6 lg:gap-7 text-[14px]">
            {NAV_LINKS.map((link, idx) => {
              const isActive = idx === 0 && pathname === '/store' || (idx > 0 && pathname === link.href)
              return (
                <Link 
                  key={link.label} 
                  href={link.href} 
                  prefetch={true}
                  className={`transition-colors py-2 ${
                    isActive 
                      ? 'text-white font-bold' 
                      : 'text-zinc-400 font-medium hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right Side: Wishlist, Gifts, Cart (Exact PC Screenshot Match) */}
        <div className="flex items-center gap-6 text-[14px]">
          <Link
            href="/library"
            prefetch={true}
            className="text-zinc-400 hover:text-white font-medium transition-colors"
          >
            Wishlist
          </Link>

          <Link
            href="/store?on_sale=true"
            prefetch={true}
            className="text-zinc-400 hover:text-white font-medium transition-colors"
          >
            Gifts
          </Link>

          {onOpenCart && (
            <button
              type="button"
              onClick={onOpenCart}
              className="flex items-center gap-2 text-zinc-400 hover:text-white font-medium transition-colors cursor-pointer py-1.5 px-2.5 hover:bg-[#1a1a1a] rounded-lg group"
            >
              <ShoppingCart className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
              <span>Cart</span>
              {itemCount > 0 && (
                <span className="bg-white text-black text-[10.5px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
