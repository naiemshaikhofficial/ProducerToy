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
  const discoverButtonRef = useRef<HTMLDivElement>(null)
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
      const target = event.target as Node
      if (
        discoverMenuRef.current && 
        !discoverMenuRef.current.contains(target) &&
        discoverButtonRef.current &&
        !discoverButtonRef.current.contains(target)
      ) {
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
    if (pathname.includes('on_sale')) return 'Deals'
    if (pathname.includes('free')) return 'Free'
    return 'Discover'
  })()

  return (
    <div className="w-full bg-[#121212] relative z-30">
      
      {/* ========================================================================= */}
      {/* 1. MOBILE SUBBAR (< 768px): Exact Epic Games Store Mobile Search & Discover */}
      {/* ========================================================================= */}
      <div className="flex md:hidden w-full px-3.5 sm:px-6 h-[50px] items-center justify-between relative">
        
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
                className="w-full bg-[#202020] text-white text-sm pl-10 pr-8 h-[38px] rounded-full border border-transparent focus:outline-none focus:bg-[#282828] placeholder:text-zinc-400 font-sans"
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
              className="text-sm font-medium text-zinc-300 hover:text-white px-2 py-1"
            >
              Cancel
            </button>
          </form>
        ) : (
          /* Normal Mobile SubBar: Search (Left) + Discover ▾ (Center) + Wishlist, Gift, Cart (Right) */
          <>
            {/* Search Icon Trigger (Left) */}
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(true)}
              className="p-1 text-zinc-300 hover:text-white transition-colors active:scale-95 flex items-center justify-center cursor-pointer"
              aria-label="Open search"
            >
              <Search className="w-[19px] h-[19px] stroke-[1.8]" />
            </button>

            {/* Discover ▾ Selector Dropdown (Exact True Screen Center, Clean Non-Bold Epic Style) */}
            <div ref={discoverButtonRef} className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-30">
              <button
                type="button"
                onClick={() => setIsDiscoverMenuOpen(!isDiscoverMenuOpen)}
                className="flex items-center gap-1.5 text-[14px] sm:text-[15px] font-normal text-white hover:text-zinc-200 transition-colors py-1 px-1 cursor-pointer select-none tracking-normal"
              >
                <span>{currentSectionLabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-300 transition-transform duration-200 ${isDiscoverMenuOpen ? 'rotate-180 text-white' : ''}`} />
              </button>
            </div>

            {/* Right Icons: Wishlist, Gifts, Cart (Clean spacing, no collision with center Discover) */}
            <div className="flex items-center gap-3 sm:gap-4 text-zinc-300">
              <Link
                href="/wishlist"
                prefetch={true}
                className="p-1 text-zinc-300 hover:text-white transition-colors active:scale-95"
                title="Wishlist"
              >
                <Bookmark className="w-[19px] h-[19px] stroke-[1.8]" />
              </Link>

              <Link
                href="/gifts"
                prefetch={true}
                className={`p-1 transition-colors active:scale-95 ${
                  pathname === '/gifts' ? 'text-white' : 'text-zinc-300 hover:text-white'
                }`}
                title="Gifts"
              >
                <Gift className="w-[19px] h-[19px] stroke-[1.8]" />
              </Link>

              <Link
                href="/cart"
                prefetch={true}
                className="relative p-1 text-zinc-300 hover:text-white transition-colors active:scale-95 flex items-center"
                title="Cart"
              >
                <ShoppingCart className="w-[19px] h-[19px] stroke-[1.8]" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#FA742B] text-white text-[10px] font-bold min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center shadow-md leading-none">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </>
        )}

      </div>

      {/* ========================================================================= */}
      {/* Exact Epic Games Store Mobile Dropdown Menu (Fixed Below Header)           */}
      {/* ========================================================================= */}
      {isDiscoverMenuOpen && (
        <div ref={discoverMenuRef} className="md:hidden">
          {/* Dark Dimmed Backdrop */}
          <div 
            className="fixed inset-0 top-[110px] bg-black/65 z-40"
            onClick={() => setIsDiscoverMenuOpen(false)}
          />

          {/* Centered Dropdown Panel with equal Left & Right blank space and Rounded Bottom Corners */}
          <div className="absolute top-full left-3.5 right-3.5 max-w-[380px] mx-auto bg-[#121212] border border-t-0 border-[#242424] rounded-b-2xl shadow-2xl z-50 animate-in fade-in duration-150 pb-6 pt-2">
            <div className="px-7 flex flex-col">
              {MOBILE_DISCOVER_OPTIONS.map((item, idx) => {
                const isSelected = item.label === currentSectionLabel
                const isLast = idx === MOBILE_DISCOVER_OPTIONS.length - 1
                return (
                  <div key={item.label}>
                    <Link
                      href={item.href}
                      prefetch={true}
                      onClick={() => setIsDiscoverMenuOpen(false)}
                      className={`block py-4 text-[15.5px] tracking-normal transition-colors ${
                        isSelected
                          ? 'text-white font-medium'
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
        </div>
      )}


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
            href="/gifts"
            prefetch={true}
            className={`transition-colors font-normal ${
              pathname === '/gifts' ? 'text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
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
