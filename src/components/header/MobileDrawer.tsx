'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Globe,
  User,
  LogOut,
  Trophy,
  Sparkles,
  Gift,
  Tag,
  Key,
  Bookmark,
  HelpCircle,
  ExternalLink,
  ShoppingCart,
  Check
} from 'lucide-react'
import { useCurrency } from '@/context/CurrencyContext'
import { useGifts } from '@/context/GiftContext'
import { categoryData, CategoryKey } from './categoryData'
import { useFreeCategories } from './freeCategoryData'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  currency: string
  onToggleCurrency: () => void
  user: any
  onSignOut?: () => void
}

type ActiveView = 'menu' | 'account' | 'distribute' | 'categories' | 'free'

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currency,
  user,
  onSignOut,
}) => {
  const { region, setRegion, regions } = useCurrency()
  const { unopenedCount } = useGifts()
  const [activeView, setActiveView] = useState<ActiveView>('menu')
  const [isMobileRegionOpen, setIsMobileRegionOpen] = useState(false)
  const [mobileExpandedCat, setMobileExpandedCat] = useState<CategoryKey | null>(null)
  const { categories: freeCategories } = useFreeCategories()

  if (!isOpen) return null

  const toggleAccordion = (catKey: CategoryKey) => {
    setMobileExpandedCat(mobileExpandedCat === catKey ? null : catKey)
  }

  // Derive initial and display name from user
  const displayName = user
    ? user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      (user.email ? user.email.split('@')[0] : 'Producer')
    : ''
  const initialLetter = displayName ? displayName[0].toUpperCase() : 'P'

  return (
    <div className="fixed inset-x-0 bottom-0 top-[56px] sm:top-[70px] lg:top-[76px] z-[55] bg-[#121212] flex flex-col md:hidden overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] select-none">
      
      {/* Scrollable Main Area */}
      <div className="flex-1 overflow-y-auto px-6 pt-3 pb-8 overscroll-contain flex flex-col">
        
        {/* Top Controls Bar (Globe Region Toggle + Profile/Sign In Button) */}
        <div className="flex items-center justify-end gap-3 py-1 mb-2">
          {/* Globe Currency Toggle with Dropdown Modal */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMobileRegionOpen(!isMobileRegionOpen)}
              className="p-2 text-zinc-300 hover:text-white transition-colors flex items-center justify-center cursor-pointer rounded-lg hover:bg-white/[0.06]"
              aria-label="Select Region and Currency"
            >
              <Globe className="w-5 h-5 text-zinc-300" />
            </button>

            {isMobileRegionOpen && (
              <div className="absolute right-0 top-full mt-2 w-[250px] bg-[#1a1a1a] border border-[#2e2e2e] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-[#262626]">
                <div className="px-3.5 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Select Region & Currency
                </div>
                <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
                  {regions.map((r) => {
                    const isSelected = region?.id === r.id
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setRegion(r.id)
                          setIsMobileRegionOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2 text-xs transition-colors text-left cursor-pointer ${
                          isSelected
                            ? 'bg-[#262626] text-white font-bold'
                            : 'text-zinc-300 hover:text-white hover:bg-[#202020]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span>{r.flag}</span>
                          <span className="truncate">{r.name}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {r.currency} ({r.symbol})
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User Profile or Sign In Button (Exact Screenshot Match) */}
          {user ? (
            <button
              type="button"
              onClick={() => setActiveView('account')}
              className="flex items-center gap-2.5 py-1 px-2 text-zinc-200 hover:text-white transition-all cursor-pointer group rounded-lg hover:bg-white/[0.06]"
            >
              <div className="w-7 h-7 rounded-full bg-[#2a2a2a] text-white text-xs font-bold flex items-center justify-center border border-zinc-700 shadow-sm flex-shrink-0">
                {initialLetter}
              </div>
              <span className="text-[15px] font-semibold text-zinc-200 group-hover:text-white truncate max-w-[140px]">
                {displayName}
              </span>
            </button>
          ) : (
            <Link
              href="/auth"
              prefetch={true}
              onClick={onClose}
              className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-[#202020] hover:bg-[#2a2a2a] text-white text-xs font-bold transition-colors"
            >
              <User className="w-4 h-4 text-zinc-300" />
              <span>Sign In</span>
            </Link>
          )}
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: MAIN MENU (Exact Screenshot Match)                                 */}
        {/* ========================================================================= */}
        {activeView === 'menu' && (
          <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-left-4 duration-250 ease-out">
            {/* Big Bold "Menu" Header */}
            <h2 className="text-4xl font-black text-white tracking-tight mt-1 mb-6 font-sans">
              Menu
            </h2>

            {/* Navigation List */}
            <div className="flex flex-col space-y-1">
              <Link
                href="/contact"
                prefetch={true}
                onClick={onClose}
                className="text-[17px] font-semibold text-zinc-200 hover:text-white py-3.5 transition-colors block border-b border-white/[0.04]"
              >
                Support
              </Link>

              {/* Distribute > Button */}
              <button
                type="button"
                onClick={() => setActiveView('distribute')}
                className="w-full text-[17px] font-semibold text-zinc-200 hover:text-white py-3.5 flex items-center justify-between transition-colors border-b border-white/[0.04] text-left cursor-pointer group"
              >
                <span className="group-hover:text-white">Distribute</span>
                <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
              </button>

              {/* Categories > Button */}
              <button
                type="button"
                onClick={() => setActiveView('categories')}
                className="w-full text-[17px] font-semibold text-zinc-200 hover:text-white py-3.5 flex items-center justify-between transition-colors border-b border-white/[0.04] text-left cursor-pointer group"
              >
                <span className="group-hover:text-white">Categories</span>
                <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
              </button>

              {/* Free Downloads > Button */}
              <button
                type="button"
                onClick={() => setActiveView('free')}
                className="w-full text-[17px] font-semibold text-zinc-200 hover:text-white py-3.5 flex items-center justify-between transition-colors border-b border-white/[0.04] text-left cursor-pointer group"
              >
                <span className="flex items-center gap-2">
                  <span className="group-hover:text-white">Free Downloads</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#FC6301]/20 text-[#FC6301] uppercase tracking-wide">
                    100% Free
                  </span>
                </span>
                <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
              </button>

              {/* Deals & Sales */}
              <Link
                href="/store?on_sale=true"
                prefetch={true}
                onClick={onClose}
                className="text-[17px] font-semibold text-zinc-200 hover:text-white py-3.5 flex items-center justify-between transition-colors border-b border-white/[0.04] group"
              >
                <span className="group-hover:text-white">Deals & Sales</span>
                <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
              </Link>

              {/* Blog & Guides */}
              <Link
                href="/blog"
                prefetch={true}
                onClick={onClose}
                className="text-[17px] font-semibold text-zinc-200 hover:text-white py-3.5 flex items-center justify-between transition-colors border-b border-white/[0.04] group"
              >
                <span className="group-hover:text-white">Blog & Guides</span>
                <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: DISTRIBUTE SUB-VIEW (Exact 1:1 match)                               */}
        {/* ========================================================================= */}
        {activeView === 'distribute' && (
          <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-right-4 duration-250 ease-out">
            <button
              type="button"
              onClick={() => setActiveView('menu')}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white font-medium text-sm py-2 transition-colors w-fit cursor-pointer -ml-1 mb-2"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <h2 className="text-3xl font-black text-white tracking-tight mb-4 font-sans">
              Distribute
            </h2>

            <div className="flex flex-col space-y-1">
              <Link
                href="/distribute"
                prefetch={true}
                onClick={onClose}
                className="text-[16px] font-semibold text-zinc-200 hover:text-white py-3.5 border-b border-white/[0.04] transition-colors block"
              >
                Distribute on Producer Toy
              </Link>
              <Link
                href="/contact?topic=creator"
                prefetch={true}
                onClick={onClose}
                className="text-[16px] font-semibold text-zinc-200 hover:text-white py-3.5 border-b border-white/[0.04] transition-colors block"
              >
                Developer Forums
              </Link>
              <Link
                href="/licensing"
                prefetch={true}
                onClick={onClose}
                className="text-[16px] font-semibold text-zinc-200 hover:text-white py-3.5 border-b border-white/[0.04] transition-colors block"
              >
                Documentation
              </Link>
              <Link
                href="/blog"
                prefetch={true}
                onClick={onClose}
                className="text-[16px] font-semibold text-zinc-200 hover:text-white py-3.5 border-b border-white/[0.04] transition-colors block"
              >
                Learning
              </Link>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: ACCOUNT SUB-VIEW                                                  */}
        {/* ========================================================================= */}
        {activeView === 'account' && (
          <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-right-4 duration-250 ease-out">
            <button
              type="button"
              onClick={() => setActiveView('menu')}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white font-medium text-sm py-2 transition-colors w-fit cursor-pointer -ml-1 mb-2"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            {/* Profile Avatar + Name Row */}
            <div className="flex items-center gap-3.5 py-3 border-b border-white/[0.06] mb-3">
              <div className="w-11 h-11 rounded-full bg-[#2a2a2a] text-white font-bold text-lg flex items-center justify-center border border-zinc-700 shadow-sm flex-shrink-0">
                {initialLetter}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[17px] font-bold text-white truncate leading-tight">
                  {displayName}
                </span>
                {user?.email && (
                  <span className="text-xs text-zinc-400 truncate mt-0.5">
                    {user.email}
                  </span>
                )}
              </div>
            </div>

            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest my-1">
              STORE
            </span>

            <div className="flex flex-col space-y-1">
              <Link
                href="/library"
                prefetch={true}
                onClick={onClose}
                className="flex items-center gap-3.5 text-[15px] font-medium text-zinc-200 hover:text-white py-3 border-b border-white/[0.04] transition-colors"
              >
                <Trophy className="w-5 h-5 text-zinc-400" />
                <span>My Achievements & Library</span>
              </Link>

              <Link
                href="/wishlist"
                prefetch={true}
                onClick={onClose}
                className="flex items-center gap-3.5 text-[15px] font-medium text-zinc-200 hover:text-white py-3 border-b border-white/[0.04] transition-colors"
              >
                <Bookmark className="w-5 h-5 text-zinc-400" />
                <span>Wishlist</span>
              </Link>

              <Link
                href="/store?on_sale=true"
                prefetch={true}
                onClick={onClose}
                className="flex items-center gap-3.5 text-[15px] font-medium text-zinc-200 hover:text-white py-3 border-b border-white/[0.04] transition-colors"
              >
                <Tag className="w-5 h-5 text-zinc-400" />
                <span>Coupons & Deals</span>
              </Link>

              <Link
                href="/account"
                prefetch={true}
                onClick={onClose}
                className="flex items-center gap-3.5 text-[15px] font-medium text-zinc-200 hover:text-white py-3 border-b border-white/[0.04] transition-colors"
              >
                <User className="w-5 h-5 text-zinc-400" />
                <span>Account Settings</span>
              </Link>

              <Link
                href="/contact"
                prefetch={true}
                onClick={onClose}
                className="flex items-center gap-3.5 text-[15px] font-medium text-zinc-200 hover:text-white py-3 border-b border-white/[0.04] transition-colors"
              >
                <HelpCircle className="w-5 h-5 text-zinc-400" />
                <span>Support</span>
              </Link>

              {onSignOut && (
                <button
                  type="button"
                  onClick={() => {
                    onSignOut()
                    onClose()
                  }}
                  className="flex items-center gap-3.5 text-[15px] font-medium text-[#ff4053] hover:text-white hover:bg-[#ff4053]/10 py-3 px-2 rounded-xl transition-colors w-full text-left mt-2 cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: CATEGORIES SUB-VIEW                                                */}
        {/* ========================================================================= */}
        {activeView === 'categories' && (
          <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-right-4 duration-250 ease-out">
            <button
              type="button"
              onClick={() => setActiveView('menu')}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white font-medium text-sm py-2 transition-colors w-fit cursor-pointer -ml-1 mb-2"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <h2 className="text-3xl font-black text-white tracking-tight mb-4 font-sans">
              Categories
            </h2>

            <div className="flex flex-col gap-1">
              {(Object.keys(categoryData) as CategoryKey[]).map((key) => {
                const cat = categoryData[key]
                const isExpanded = mobileExpandedCat === key
                return (
                  <div key={key} className="border-b border-[#202020] pb-2">
                    <button
                      onClick={() => toggleAccordion(key)}
                      className="w-full flex items-center justify-between py-2 text-sm font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <span>{cat.label}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isExpanded && (
                      <div className="pl-3 py-1 flex flex-col gap-1.5 bg-[#181818] rounded-md my-1 animate-in fade-in duration-100">
                        {cat.items.map((item, idx) => (
                          <Link
                            key={idx}
                            href={item.slug === '' ? `/store/${cat.slug}` : `/store/${cat.slug}/${item.slug}`}
                            prefetch={true}
                            onClick={onClose}
                            className="text-xs text-zinc-400 hover:text-white py-1 block"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: FREE DOWNLOADS SUB-VIEW                                           */}
        {/* ========================================================================= */}
        {activeView === 'free' && (
          <div className="flex flex-col flex-1 animate-in fade-in slide-in-from-right-4 duration-250 ease-out">
            <button
              type="button"
              onClick={() => setActiveView('menu')}
              className="flex items-center gap-1.5 text-zinc-400 hover:text-white font-medium text-sm py-2 transition-colors w-fit cursor-pointer -ml-1 mb-2"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            <h2 className="text-3xl font-black text-white tracking-tight mb-4 font-sans">
              Free Downloads
            </h2>

            <div className="flex flex-col gap-2">
              {freeCategories.length === 0 ? (
                <span className="text-xs text-zinc-500 py-1">No free downloads available.</span>
              ) : (
                freeCategories.map((cat) => (
                  <div key={cat.id} className="flex flex-col gap-1 pb-2 border-b border-white/[0.04]">
                    <Link
                      href={cat.exploreUrl}
                      prefetch={true}
                      onClick={onClose}
                      className="text-sm font-bold text-white hover:text-[#FC6301] py-1 block"
                    >
                      {cat.name}
                    </Link>
                    {cat.subcategories
                      .filter((s) => !s.name.startsWith('Show All'))
                      .map((sub, sIdx) => (
                        <Link
                          key={sub.id || sIdx}
                          href={sub.href}
                          prefetch={true}
                          onClick={onClose}
                          className="text-xs font-normal text-zinc-400 hover:text-white pl-2 py-0.5 block"
                        >
                          • {sub.name}
                        </Link>
                      ))}
                  </div>
                ))
              )}
              <Link
                href="/store?price=free"
                prefetch={true}
                onClick={onClose}
                className="text-xs font-bold text-[#FC6301] hover:underline pt-2 block"
              >
                Explore All Free Tools →
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* PINNED BOTTOM BAR: Bright Blue "Download" CTA (Exact Screenshot Match)       */}
      {/* ========================================================================= */}
      <div className="p-5 border-t border-white/[0.08] bg-[#121212] flex-shrink-0">
        <Link
          href="/store"
          prefetch={true}
          onClick={onClose}
          className="w-full py-3.5 bg-[#0074e4] hover:bg-[#0060be] active:bg-[#0052a3] text-white font-extrabold text-[15px] rounded-xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center tracking-wide"
        >
          Download
        </Link>
      </div>

    </div>
  )
}
