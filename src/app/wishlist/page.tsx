'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Mail,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Gift,
  Check,
  Plus,
  Trash2,
  Filter,
  Layers,
  Sliders,
  Monitor,
  Apple,
  Search,
  ShoppingCart
} from 'lucide-react'
import { useWishlist } from '@/context/WishlistContext'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import { getCdnImageUrl } from '@/lib/cdn'

type SortOption = 'on_sale' | 'recently_added' | 'price_low' | 'price_high' | 'alphabetical'

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, bulkRemove, isLoading } = useWishlist()
  const { addItem, isInCart } = useCart()
  const { currency, formatPrice } = useCurrency()
  const currencySymbol = currency === 'INR' ? '₹' : '$'

  const [notificationEnabled, setNotificationEnabled] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('recently_added')
  const [isSortOpen, setIsSortOpen] = useState(false)

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedFeature, setSelectedFeature] = useState<string>('all')
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all')

  const [isGenreOpen, setIsGenreOpen] = useState(true)
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(true)
  const [isPlatformOpen, setIsPlatformOpen] = useState(true)

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    let list = [...wishlist]

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter(
        (item) => item.product_type?.toLowerCase() === selectedCategory.toLowerCase()
      )
    }

    // Feature filter
    if (selectedFeature === 'on_sale') {
      list = list.filter(
        (item) => item.original_price_inr && item.original_price_inr > item.price_inr
      )
    } else if (selectedFeature === 'free') {
      list = list.filter((item) => Number(item.price_usd) === 0)
    }

    // Sorting
    if (sortBy === 'price_low') {
      list.sort((a, b) => a.price_inr - b.price_inr)
    } else if (sortBy === 'price_high') {
      list.sort((a, b) => b.price_inr - a.price_inr)
    } else if (sortBy === 'alphabetical') {
      list.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortBy === 'on_sale') {
      list.sort((a, b) => {
        const aSale = a.original_price_inr ? 1 : 0
        const bSale = b.original_price_inr ? 1 : 0
        return bSale - aSale
      })
    }

    return list
  }, [wishlist, selectedCategory, selectedFeature, sortBy])

  const handleAddAllToCart = () => {
    filteredItems.forEach((item) => {
      addItem({
        id: item.id,
        name: item.name,
        slug: item.slug,
        brand: item.brand,
        price_inr: item.price_inr,
        price_usd: item.price_usd,
        cover_image: item.cover_image,
        product_type: item.product_type,
      })
    })
  }

  const handleClearAll = async () => {
    const ids = filteredItems.map((i) => i.id)
    await bulkRemove(ids)
  }

  return (
    <div className="w-full min-h-screen bg-[#121212] text-white select-none pb-24 font-sans">
      <div className="w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* ========================================================================= */}
        {/* 1. TOP HEADER: My Wishlist + Producer Rewards Balance                      */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-[30px] sm:text-[34px] font-black text-white tracking-tight">
            My Wishlist
          </h1>

          <div className="flex items-center gap-3">
            <Link
              href="/store"
              prefetch={true}
              className="text-[13px] font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors"
            >
              <span>Producer Rewards</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </Link>

            <div className="border border-[#2e2e2e] bg-[#181818] rounded-full px-3.5 py-1 text-xs font-bold text-white shadow-sm flex items-center gap-1">
              <span>{currencySymbol}0.00</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. NOTIFICATION BANNER (Exact 1:1 Epic Games Notification Pill)           */}
        {/* ========================================================================= */}
        <div className="w-full bg-[#181818] border border-[#242424] border-l-4 border-l-[#0074e4] rounded-xl p-4 sm:p-5 flex items-center justify-between shadow-sm transition-all">
          <div className="flex items-center gap-3.5 min-w-0 pr-4">
            <Mail className="w-5 h-5 text-[#0074e4] flex-shrink-0" />
            <span className="text-[12.5px] sm:text-[13px] text-zinc-300 font-medium leading-snug">
              Get notified when your wishlisted items go on sale, or are available for purchase or pre-purchase.
            </span>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => setNotificationEnabled(!notificationEnabled)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              notificationEnabled ? 'bg-[#0074e4]' : 'bg-[#2a2a2a]'
            }`}
            role="switch"
            aria-checked={notificationEnabled}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                notificationEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 3. SORT DROPDOWN BAR & BULK CONTROLS                                       */}
        {/* ========================================================================= */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          {/* Sort By Dropdown */}
          <div className="relative">
            <div className="flex items-center gap-2 text-[13px]">
              <span className="text-zinc-400 font-normal">Sort by:</span>
              <button
                type="button"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="font-bold text-white hover:text-zinc-200 flex items-center gap-1.5 cursor-pointer py-1"
              >
                <span>
                  {sortBy === 'on_sale' && 'On Sale'}
                  {sortBy === 'recently_added' && 'Recently Added'}
                  {sortBy === 'price_low' && 'Price: Low to High'}
                  {sortBy === 'price_high' && 'Price: High to Low'}
                  {sortBy === 'alphabetical' && 'Alphabetical'}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {isSortOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-48 bg-[#181818] border border-[#282828] rounded-xl shadow-2xl z-50 py-1.5 divide-y divide-[#222222] animate-in fade-in duration-100">
                <button
                  type="button"
                  onClick={() => { setSortBy('on_sale'); setIsSortOpen(false); }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-[#222222] transition-colors ${sortBy === 'on_sale' ? 'text-white font-bold' : 'text-zinc-400'}`}
                >
                  On Sale
                </button>
                <button
                  type="button"
                  onClick={() => { setSortBy('recently_added'); setIsSortOpen(false); }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-[#222222] transition-colors ${sortBy === 'recently_added' ? 'text-white font-bold' : 'text-zinc-400'}`}
                >
                  Recently Added
                </button>
                <button
                  type="button"
                  onClick={() => { setSortBy('price_low'); setIsSortOpen(false); }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-[#222222] transition-colors ${sortBy === 'price_low' ? 'text-white font-bold' : 'text-zinc-400'}`}
                >
                  Price: Low to High
                </button>
                <button
                  type="button"
                  onClick={() => { setSortBy('price_high'); setIsSortOpen(false); }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-[#222222] transition-colors ${sortBy === 'price_high' ? 'text-white font-bold' : 'text-zinc-400'}`}
                >
                  Price: High to Low
                </button>
                <button
                  type="button"
                  onClick={() => { setSortBy('alphabetical'); setIsSortOpen(false); }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-[#222222] transition-colors ${sortBy === 'alphabetical' ? 'text-white font-bold' : 'text-zinc-400'}`}
                >
                  Alphabetical
                </button>
              </div>
            )}
          </div>

          {/* Bulk Actions */}
          {filteredItems.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleAddAllToCart}
                className="text-xs font-bold text-zinc-300 hover:text-white bg-[#222222] hover:bg-[#2a2a2a] border border-[#303030] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-zinc-400" />
                <span>Add All to Cart</span>
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-semibold text-zinc-500 hover:text-red-400 transition-colors cursor-pointer px-2 py-1"
              >
                Clear Wishlist
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. MAIN CONTENT (2 Columns: Left Wishlist Cards + Right Filters Sidebar)  */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          
          {/* ======================================================================= */}
          {/* LEFT COLUMN: Wishlist Cards List (Spans 9 cols)                         */}
          {/* ======================================================================= */}
          <div className="lg:col-span-9 space-y-4">
            
            {filteredItems.length === 0 ? (
              /* Clean Empty Wishlist State */
              <div className="w-full bg-[#181818] border border-[#242424] rounded-2xl p-12 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 rounded-full bg-[#202020] border border-[#2a2a2a] text-zinc-500 flex items-center justify-center mx-auto">
                  <Gift className="w-8 h-8 text-zinc-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">Your wishlist is empty</h3>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                    Explore top VST plugins, drum kits, sample packs, and presets to save your favorite sounds for later.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/store"
                    prefetch={true}
                    className="inline-flex items-center justify-center px-6 py-2.5 bg-[#0074e4] hover:bg-[#0060c0] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shadow-md"
                  >
                    Explore Store
                  </Link>
                </div>
              </div>
            ) : (
              /* Wishlist Items Cards */
              filteredItems.map((item) => {
                const inCart = isInCart(item.id)
                const isFree = Number(item.price_usd) === 0
                const isOnSale = item.original_price_inr && item.original_price_inr > item.price_inr
                const discountPercent = isOnSale
                  ? Math.round(((item.original_price_inr! - item.price_inr) / item.original_price_inr!) * 100)
                  : 0

                return (
                  <div
                    key={item.id}
                    className="w-full bg-[#181818] border border-[#242424] hover:border-[#303030] rounded-2xl p-5 flex flex-col sm:flex-row gap-5 relative transition-all shadow-md group"
                  >
                    {/* 3:4 Poster Thumbnail */}
                    <div className="relative w-full sm:w-[120px] h-[160px] bg-[#121212] border border-[#282828] rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                      <Image
                        src={getCdnImageUrl(item.cover_image || '/placeholder.jpg', { width: 300 })}
                        alt={item.name}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                      
                      {/* Platform Icons (Bottom Left Badge) */}
                      <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-[2px] px-1.5 py-0.5 rounded text-[10px] text-zinc-300">
                        <Monitor className="w-3 h-3 text-zinc-300" />
                        <Apple className="w-3 h-3 text-zinc-300" />
                      </div>
                    </div>

                    {/* Product Details & Actions */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      
                      <div>
                        {/* Top Row: Type Pill + Price */}
                        <div className="flex items-start justify-between gap-2">
                          <span className="bg-[#262626] text-zinc-300 text-[10.5px] font-bold px-2.5 py-0.5 rounded-[4px] uppercase tracking-wider">
                            {item.product_type?.replace('_', ' ') || 'VST Plugin'}
                          </span>

                          {/* Price */}
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              {isOnSale && (
                                <span className="bg-[#0074e4] text-white text-[10px] font-black px-1.5 py-0.5 rounded">
                                  -{discountPercent}%
                                </span>
                              )}
                              <span className="text-[18px] font-black text-white tracking-tight">
                                {isFree ? 'Free' : formatPrice(item.price_inr, item.price_usd)}
                              </span>
                            </div>
                            {isOnSale && (
                              <span className="text-[11px] text-zinc-500 line-through block mt-0.5">
                                {formatPrice(item.original_price_inr, item.original_price_usd)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Product Title */}
                        <Link
                          href={`/product/${item.slug}`}
                          prefetch={true}
                          className="text-[18px] font-black text-white hover:text-zinc-200 transition-colors mt-1.5 line-clamp-1 block"
                        >
                          {item.name}
                        </Link>

                        {/* Specs & Format Box */}
                        <div className="mt-3 bg-[#141414] border border-[#242424] rounded-lg px-3 py-1.5 flex items-center gap-3 w-fit">
                          <span className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider">
                            {item.vst_format || 'VST3 / AU (64-BIT)'}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-zinc-600" />
                          <span className="text-[11px] text-zinc-400">
                            {item.brand || 'Producer Toy'}
                          </span>
                        </div>

                        {/* Producer Rewards Note */}
                        {!isFree && (
                          <div className="flex items-center gap-1.5 text-[11.5px] text-zinc-400 mt-3 font-medium">
                            <Sparkles className="w-3.5 h-3.5 text-[#20d693]" />
                            <span>Earn 5% back in Producer Rewards</span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Actions Row */}
                      <div className="flex items-center justify-end gap-3 pt-4 sm:pt-2 border-t sm:border-t-0 border-[#242424] mt-4 sm:mt-0">
                        <button
                          type="button"
                          onClick={() => removeFromWishlist(item.id)}
                          className="text-[12.5px] font-semibold text-zinc-400 hover:text-white cursor-pointer px-3 py-1.5 transition-colors"
                        >
                          Remove
                        </button>

                        <button
                          type="button"
                          className="bg-[#222222] hover:bg-[#282828] border border-[#303030] p-2.5 rounded-lg text-white transition-colors cursor-pointer"
                          title="Gift this item"
                        >
                          <Gift className="w-4 h-4 text-zinc-300" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            addItem({
                              id: item.id,
                              name: item.name,
                              slug: item.slug,
                              brand: item.brand,
                              price_inr: item.price_inr,
                              price_usd: item.price_usd,
                              cover_image: item.cover_image,
                              product_type: item.product_type,
                            })
                          }}
                          className={`px-6 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer ${
                            inCart
                              ? 'bg-[#222222] text-zinc-300 border border-[#333333]'
                              : 'bg-[#0074e4] hover:bg-[#0060c0] text-white'
                          }`}
                        >
                          {inCart ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>In Cart</span>
                            </>
                          ) : (
                            <span>Add To Cart</span>
                          )}
                        </button>
                      </div>

                    </div>
                  </div>
                )
              })
            )}

          </div>


          {/* ======================================================================= */}
          {/* RIGHT COLUMN: FILTERS SIDEBAR (Spans 3 cols)                            */}
          {/* ======================================================================= */}
          <div className="lg:col-span-3 space-y-4 bg-[#181818] border border-[#242424] rounded-2xl p-5">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#242424]">
              <span className="text-[14px] font-bold text-white tracking-wide">Filters</span>
              {(selectedCategory !== 'all' || selectedFeature !== 'all' || selectedPlatform !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedFeature('all')
                    setSelectedPlatform('all')
                  }}
                  className="text-[11px] font-semibold text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Accordion 1: Genre / Category */}
            <div className="space-y-2 pt-1 border-b border-[#242424] pb-4">
              <button
                type="button"
                onClick={() => setIsGenreOpen(!isGenreOpen)}
                className="w-full flex items-center justify-between text-[13px] font-bold text-white hover:text-zinc-200 cursor-pointer"
              >
                <span>Category</span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isGenreOpen ? 'rotate-180' : ''}`} />
              </button>

              {isGenreOpen && (
                <div className="space-y-1.5 pt-2 text-xs">
                  {['all', 'plugin', 'sample_pack', 'preset', 'template', 'bundle'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors cursor-pointer flex items-center justify-between ${
                        selectedCategory === cat
                          ? 'bg-[#262626] text-white font-bold'
                          : 'text-zinc-400 hover:text-white hover:bg-[#202020]'
                      }`}
                    >
                      <span className="capitalize">{cat === 'all' ? 'All Categories' : cat.replace('_', ' ')}</span>
                      {selectedCategory === cat && <Check className="w-3 h-3 text-[#0074e4]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Accordion 2: Features */}
            <div className="space-y-2 border-b border-[#242424] pb-4">
              <button
                type="button"
                onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
                className="w-full flex items-center justify-between text-[13px] font-bold text-white hover:text-zinc-200 cursor-pointer"
              >
                <span>Features</span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isFeaturesOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFeaturesOpen && (
                <div className="space-y-1.5 pt-2 text-xs">
                  {[
                    { key: 'all', label: 'All Features' },
                    { key: 'on_sale', label: 'On Sale' },
                    { key: 'free', label: 'Free Downloads' },
                  ].map((feat) => (
                    <button
                      key={feat.key}
                      type="button"
                      onClick={() => setSelectedFeature(feat.key)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors cursor-pointer flex items-center justify-between ${
                        selectedFeature === feat.key
                          ? 'bg-[#262626] text-white font-bold'
                          : 'text-zinc-400 hover:text-white hover:bg-[#202020]'
                      }`}
                    >
                      <span>{feat.label}</span>
                      {selectedFeature === feat.key && <Check className="w-3 h-3 text-[#0074e4]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Accordion 3: Platform */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setIsPlatformOpen(!isPlatformOpen)}
                className="w-full flex items-center justify-between text-[13px] font-bold text-white hover:text-zinc-200 cursor-pointer"
              >
                <span>Platform</span>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isPlatformOpen ? 'rotate-180' : ''}`} />
              </button>

              {isPlatformOpen && (
                <div className="space-y-1.5 pt-2 text-xs">
                  {['all', 'windows', 'macos'].map((plat) => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setSelectedPlatform(plat)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md transition-colors cursor-pointer flex items-center justify-between ${
                        selectedPlatform === plat
                          ? 'bg-[#262626] text-white font-bold'
                          : 'text-zinc-400 hover:text-white hover:bg-[#202020]'
                      }`}
                    >
                      <span className="capitalize">{plat === 'all' ? 'All Platforms' : plat}</span>
                      {selectedPlatform === plat && <Check className="w-3 h-3 text-[#0074e4]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
