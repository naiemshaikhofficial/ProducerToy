'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, ChevronDown, X, ShoppingCart, Bookmark, Gift } from 'lucide-react'

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
  { label: 'Deals', href: '/store?on_sale=true' },
  { label: 'Brands', href: '/manufacturers' },
  { label: 'Rent to Own', href: '/store' },
  { label: 'Blog', href: '/store' },
  { label: 'Free', href: '/store?free=true' },
]

const MOBILE_DISCOVER_OPTIONS = [
  { label: 'Products', href: '/store' },
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
              <Search className="w-5 h-5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={mobileInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search store"
                className="w-full bg-[#202020] text-white text-sm pl-11 pr-8 h-[42px] rounded-full border border-transparent focus:outline-none focus:bg-[#282828] placeholder:text-zinc-400 font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(false)}
              className="text-sm font-semibold text-zinc-300 hover:text-white px-2 py-1"
            >
              Cancel
            </button>
          </form>
        ) : (
          /* Normal Mobile SubBar: Search Icon (Left) + Discover ▾ (Center) */
          <>
            {/* Search Icon Trigger (Bigger size matching Epic Games) */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(true)}
              className="p-1.5 text-zinc-200 hover:text-white transition-colors active:scale-95 flex items-center justify-center cursor-pointer"
              aria-label="Open search"
            >
              <Search className="w-[21px] h-[21px] stroke-[2.2]" />
            </button>

            {/* Discover ▾ Selector Dropdown (Exact True Screen Center & Bigger Font) */}
            <div ref={discoverMenuRef} className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-30">
              <button
                type="button"
                onClick={() => setIsDiscoverMenuOpen(!isDiscoverMenuOpen)}
                className="flex items-center gap-1.5 text-[17px] font-extrabold text-white hover:text-zinc-200 transition-colors py-1.5 px-2 cursor-pointer select-none tracking-tight"
              >
                <span>{currentSectionLabel}</span>
                <ChevronDown className={`w-4 h-4 text-zinc-300 transition-transform duration-200 ${isDiscoverMenuOpen ? 'rotate-180 text-white' : ''}`} />
              </button>

              {/* Exact Epic Games Store Mobile Dropdown Menu (Centered in the middle) */}
              {isDiscoverMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 top-0 bg-black/75 z-40"
                    onClick={() => setIsDiscoverMenuOpen(false)}
                  />

                  <div className="fixed left-1/2 -translate-x-1/2 top-[110px] w-[92vw] max-w-[400px] bg-[#121212] shadow-2xl px-7 pt-6 pb-8 z-50 animate-in fade-in duration-150 border-b border-[#202020] rounded-b-2xl">
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
                              className={`block py-4 text-[19px] sm:text-[20px] tracking-wide transition-colors ${
                                isSelected
                                  ? 'text-white font-black'
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

            {/* Right Icons: Wishlist, Gifts, Cart (Exact Screenshot Match: Bigger & Spacious) */}
            <div className="flex items-center gap-5 sm:gap-6 text-zinc-200">
              <Link
                href="/wishlist"
                prefetch={true}
                className="p-1 text-zinc-200 hover:text-white transition-colors active:scale-95"
                title="Wishlist"
              >
                <Bookmark className="w-[21px] h-[21px] stroke-[2]" />
              </Link>

              <Link
                href="/store?on_sale=true"
                prefetch={true}
                className="p-1 text-zinc-200 hover:text-white transition-colors active:scale-95"
                title="Gifts"
              >
                <Gift className="w-[21px] h-[21px] stroke-[2]" />
              </Link>

              <Link
                href="/cart"
                prefetch={true}
                className="relative p-1 text-zinc-200 hover:text-white transition-colors active:scale-95 flex items-center"
                title="Cart"
              >
                <ShoppingCart className="w-[21px] h-[21px] stroke-[2]" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#FA742B] text-white text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-md leading-none">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </>
        )}

      </div>


      {/* ========================================================================= */}
      {/* 2. DESKTOP SUBBAR (>= 768px): Exact 1:1 PC Screenshot Match                */}
      {/* ========================================================================= */}
      <div className="hidden md:flex w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-[76px] items-center justify-between">
        
        {/* Left Side: Search Capsule + Discover / Browse / News Tabs */}
        <div className="flex items-center">
          
          {/* Epic Search Pill (Exact 1:1 Size & Radius) */}
          <div className="relative w-[230px] lg:w-[250px] flex-shrink-0">
            <form onSubmit={onSearchSubmit} className="relative w-full">
              <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search store"
                className="w-full bg-[#202020] hover:bg-[#252525] focus:bg-[#2a2a2a] text-white text-[13px] pl-10 pr-8 h-[42px] rounded-full border border-transparent focus:outline-none focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-400 transition-all font-sans"
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

          {/* Desktop Sub Navigation Links (Products ˅, Deals, Brands, Rent to Own, Blog, Free) */}
          <nav className="flex items-center gap-6 lg:gap-8 ml-6 lg:ml-8 text-[14px]">
            {/* Products Mega Dropdown Trigger */}
            <div 
              className="relative flex items-center cursor-pointer py-2"
              onMouseEnter={onMouseEnterProducts}
              onMouseLeave={onMouseLeaveProducts}
            >
              <button 
                type="button"
                className={`flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
                  isProductsMegaOpen ? 'text-white font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>Products</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isProductsMegaOpen ? 'rotate-180 text-white' : 'text-zinc-400'}`} />
              </button>
            </div>

            {/* Mapped Sub Links */}
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link 
                  key={link.label} 
                  href={link.href} 
                  prefetch={true}
                  className={`transition-colors py-2 font-medium ${
                    isActive 
                      ? 'text-white font-bold' 
                      : 'text-zinc-400 font-normal hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right Side: Wishlist, Gifts, Cart (Exact 1:1 Match) */}
        <div className="flex items-center gap-7 text-[14px]">
          <Link
            href="/wishlist"
            prefetch={true}
            className={`transition-colors font-normal ${
              pathname === '/wishlist' ? 'text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Wishlist
          </Link>

          <Link
            href="/store?on_sale=true"
            prefetch={true}
            className="text-zinc-400 hover:text-white font-normal transition-colors"
          >
            Gifts
          </Link>

          <Link
            href="/cart"
            prefetch={true}
            className={`flex items-center gap-2 font-normal transition-colors py-1.5 px-2 rounded-lg group ${
              pathname === '/cart' ? 'text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Cart</span>
            {itemCount > 0 && (
              <span className="bg-[#FA742B] text-white text-[11px] font-extrabold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>

      </div>
    </div>
  )
}
