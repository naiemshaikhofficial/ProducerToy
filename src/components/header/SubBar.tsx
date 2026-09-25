'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Search,
  ChevronDown,
  X,
  ShoppingCart,
  Bookmark,
  Gift,
  Loader2,
} from 'lucide-react'
import { useGifts } from '@/context/GiftContext'
import { liveSearchAction, SearchProductResult } from '@/actions/searchActions'
import { ENABLE_BRANDS } from '@/config/features'

interface SubBarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  onSearchSubmit: (e: React.FormEvent) => void
  isScrolled: boolean
  isProductsMegaOpen: boolean
  onMouseEnterProducts: () => void
  onMouseLeaveProducts: () => void
  isFreeMegaOpen: boolean
  onMouseEnterFree: () => void
  onMouseLeaveFree: () => void
  itemCount?: number
  onOpenCart?: () => void
}

const NAV_LINKS = [
  { label: 'Deals', href: '/store?on_sale=true' },
  ...(ENABLE_BRANDS ? [{ label: 'Brands', href: '/manufacturers' }] : []),
  { label: 'Blog', href: '/blog' },
]

const MOBILE_DISCOVER_OPTIONS = [
  { label: 'Products', href: '/store' },
  { label: 'Deals', href: '/store?on_sale=true' },
  ...(ENABLE_BRANDS ? [{ label: 'Brands', href: '/manufacturers' }] : []),
  { label: 'Blog', href: '/blog' },
  { label: 'Free VSTs & Plugins', href: '/free-vst-plugins' },
  { label: 'Free Samples & Loops', href: '/store/sounds?price=free' },
  { label: 'Free Presets', href: '/store/presets?price=free' },
]

export const SubBar: React.FC<SubBarProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  isScrolled,
  isProductsMegaOpen,
  onMouseEnterProducts,
  onMouseLeaveProducts,
  isFreeMegaOpen,
  onMouseEnterFree,
  onMouseLeaveFree,
  itemCount = 0,
  onOpenCart,
}) => {
  const pathname = usePathname()
  const { unopenedCount } = useGifts()
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isDiscoverMenuOpen, setIsDiscoverMenuOpen] = useState(false)

  const mobileInputRef = useRef<HTMLInputElement>(null)
  const discoverButtonRef = useRef<HTMLDivElement>(null)
  const discoverMenuRef = useRef<HTMLDivElement>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const [suggestions, setSuggestions] = useState<SearchProductResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)

  // Live search debounced fetch
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([])
      setIsSuggestionsOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await liveSearchAction(searchQuery)
        setSuggestions(results)
        setIsSuggestionsOpen(results.length > 0)
      } catch (e) {
        console.error('Failed to fetch search suggestions:', e)
      } finally {
        setIsSearching(false)
      }
    }, 180)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Close search dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSuggestionsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

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
    if (pathname?.startsWith('/blog')) return 'Blog'
    return 'Discover'
  })()

  const isFreeActive =
    pathname === '/free-vst-plugins' ||
    pathname === '/free' ||
    pathname.includes('price=free') ||
    pathname.includes('free=true')

  return (
    <div className="w-full bg-[#121212] relative z-50">
      
      {/* ========================================================================= */}
      {/* 1. MOBILE SUBBAR (< 768px): Exact Epic Games Store Mobile Search & Discover */}
      {/* ========================================================================= */}
      <div className="flex md:hidden w-full px-4 sm:px-6 h-[54px] items-center justify-between relative z-50 bg-[#121212]">
        
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
                className="w-full bg-[#202020] text-white text-sm pl-10 pr-8 h-[40px] rounded-full border border-transparent focus:outline-none focus:bg-[#282828] placeholder:text-zinc-400 font-sans"
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
              className="p-1.5 text-zinc-300 hover:text-white transition-colors active:scale-95 flex items-center justify-center cursor-pointer"
              aria-label="Open search"
            >
              <Search className="w-[19px] h-[19px] stroke-[1.8]" />
            </button>

            {/* Discover ▾ Selector Dropdown */}
            <div ref={discoverButtonRef} className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-30">
              <button
                type="button"
                onClick={() => setIsDiscoverMenuOpen(!isDiscoverMenuOpen)}
                className="flex items-center gap-1.5 text-[14px] sm:text-[15px] font-normal text-white hover:text-zinc-200 transition-colors py-1.5 px-2 cursor-pointer select-none tracking-normal"
              >
                <span>{currentSectionLabel}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-300 transition-transform duration-200 ${isDiscoverMenuOpen ? 'rotate-180 text-white' : ''}`} />
              </button>
            </div>

            {/* Right Icons: Wishlist, Gifts, Cart */}
            <div className="flex items-center gap-3.5 sm:gap-4.5 text-zinc-300">
              <Link
                href="/wishlist"
                prefetch={true}
                className="p-1 text-zinc-300 hover:text-white transition-colors active:scale-95"
                title="Wishlist"
              >
                <Bookmark className="w-[19px] h-[19px] stroke-[1.8]" />
              </Link>

              {/* GIFTING FEATURE (Temporarily Commented Out for Future Launch)
              <Link
                href="/gifts"
                prefetch={true}
                className={`relative p-1 transition-colors active:scale-95 flex items-center ${
                  pathname === '/gifts' ? 'text-white' : 'text-zinc-300 hover:text-white'
                }`}
                title="Gifts"
              >
                <Gift className="w-[19px] h-[19px] stroke-[1.8]" />
                {unopenedCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-white text-black text-[10px] font-extrabold min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center shadow-md leading-none animate-in zoom-in-75">
                    {unopenedCount}
                  </span>
                )}
              </Link>
              */}

              <Link
                href="/cart"
                prefetch={true}
                className="relative p-1 text-zinc-300 hover:text-white transition-colors active:scale-95 flex items-center"
                title="Cart"
              >
                <ShoppingCart className="w-[19px] h-[19px] stroke-[1.8]" />
                {itemCount > 0 && (
                  <span className="bg-[#FA742B] text-white text-[11px] font-bold min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center shadow-md leading-none">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </>
        )}

      </div>

      {/* ========================================================================= */}
      {/* Mobile Discover Menu Overlay                                               */}
      {/* ========================================================================= */}
      {isDiscoverMenuOpen && (
        <div ref={discoverMenuRef} className="md:hidden">
          <div
            className="fixed inset-0 bg-black/75 z-40"
            onClick={() => setIsDiscoverMenuOpen(false)}
          />

          <div className="absolute top-full left-5 right-5 max-w-[285px] mx-auto bg-[#121212] rounded-none border-none shadow-2xl z-50 animate-in fade-in duration-150 pb-6 pt-2">
            <div className="px-6 flex flex-col">
              {MOBILE_DISCOVER_OPTIONS.map((item, idx) => {
                const isSelected = item.label === currentSectionLabel
                const isLast = idx === MOBILE_DISCOVER_OPTIONS.length - 1
                return (
                  <div key={item.label}>
                    <Link
                      href={item.href}
                      prefetch={true}
                      onClick={() => setIsDiscoverMenuOpen(false)}
                      className={`block py-3.5 text-[15px] tracking-normal transition-colors ${
                        isSelected
                          ? 'text-white font-semibold'
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
      {/* 2. DESKTOP SUBBAR (>= 768px): Products ˅, Deals, Brands, Blog, Free ˅      */}
      {/* ========================================================================= */}
      <div className="hidden md:flex w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-[76px] items-center justify-between">
        
        {/* Left Side: Search Capsule + Navigation Links */}
        <div className="flex items-center">
          
          {/* Search Pill with Live Suggestions Dropdown */}
          <div ref={searchContainerRef} className="relative w-[240px] lg:w-[270px] flex-shrink-0">
            <form
              onSubmit={(e) => {
                setIsSuggestionsOpen(false)
                onSearchSubmit(e)
              }}
              className="relative w-full"
            >
              <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onFocus={() => {
                  if (suggestions.length > 0) setIsSuggestionsOpen(true)
                }}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search store"
                className="w-full bg-[#202020] hover:bg-[#252525] focus:bg-[#2a2a2a] text-white text-[13px] pl-10 pr-8 h-[42px] rounded-full border border-transparent focus:outline-none focus:ring-1 focus:ring-zinc-400 placeholder:text-zinc-400 transition-all font-sans"
              />
              {isSearching ? (
                <Loader2 className="w-3.5 h-3.5 text-zinc-400 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              ) : searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange('')
                    setSuggestions([])
                    setIsSuggestionsOpen(false)
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 rounded-full cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}
            </form>

            {/* Live Suggestions Dropdown */}
            {isSuggestionsOpen && suggestions.length > 0 && (
              <div className="absolute top-[48px] left-0 w-[320px] bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2 divide-y divide-zinc-800/60 max-h-[360px] overflow-y-auto">
                  {suggestions.map((item) => (
                    <Link
                      key={item.id}
                      href={`/product/${item.slug}`}
                      onClick={() => setIsSuggestionsOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#242424] transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-md bg-[#222] overflow-hidden flex-shrink-0 relative border border-white/5">
                        {item.cover_image ? (
                          <img
                            src={item.cover_image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs font-bold">
                            PT
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-white truncate group-hover:text-[#FA742B] transition-colors">
                          {item.name}
                        </p>
                        {ENABLE_BRANDS && item.brand && (
                          <p className="text-[11px] text-zinc-400 truncate">
                            {item.brand}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`text-[12px] font-semibold ${item.price_usd === 0 ? 'text-[#00FF94]' : 'text-zinc-200'}`}>
                          {item.price_usd === 0 ? 'Free' : `$${item.price_usd.toFixed(2)}`}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
                <div className="bg-[#141414] px-3 py-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Press Enter to view all</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      setIsSuggestionsOpen(false)
                      onSearchSubmit(e)
                    }}
                    className="text-[#FA742B] hover:underline font-medium cursor-pointer"
                  >
                    View All &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Sub Navigation Links */}
          <nav className="flex items-center gap-7 lg:gap-9 ml-8 lg:ml-10 text-[14px]">
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

            {/* Mapped Sub Links: Deals, Brands, Blog */}
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

            {/* FREE Mega Dropdown Trigger (Exact Minimalist Architecture like Products) */}
            <div
              className="relative flex items-center cursor-pointer py-2"
              onMouseEnter={onMouseEnterFree}
              onMouseLeave={onMouseLeaveFree}
            >
              <button
                type="button"
                className={`flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
                  isFreeActive || isFreeMegaOpen
                    ? 'text-white font-bold'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <span>Free</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isFreeMegaOpen ? 'rotate-180 text-white' : 'text-zinc-400'}`} />
              </button>
            </div>

          </nav>
        </div>

        {/* Right Side: Wishlist, Gifts, Cart */}
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

          {/* GIFTING FEATURE (Temporarily Commented Out for Future Launch)
          <Link
            href="/gifts"
            prefetch={true}
            className={`flex items-center gap-1.5 transition-colors font-normal ${
              pathname === '/gifts' ? 'text-white font-bold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <span>Gifts</span>
            {unopenedCount > 0 && (
              <span className="bg-white text-black text-[11px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none shadow-sm animate-in zoom-in-75">
                {unopenedCount}
              </span>
            )}
          </Link>
          */}

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

export default SubBar
