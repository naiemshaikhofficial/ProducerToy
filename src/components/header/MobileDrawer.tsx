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
  CreditCard,
  Gift,
  Tag,
  Key,
  Bookmark,
  HelpCircle,
  ExternalLink
} from 'lucide-react'
import { categoryData, CategoryKey } from './categoryData'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  currency: string
  onToggleCurrency: () => void
  user: any
  onSignOut?: () => void
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currency,
  onToggleCurrency,
  user,
  onSignOut,
}) => {
  const [activeView, setActiveView] = useState<'menu' | 'account'>('menu')
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [mobileExpandedCat, setMobileExpandedCat] = useState<CategoryKey | null>(null)

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
    <div className="fixed inset-0 top-[52px] z-50 bg-[#121212] flex flex-col md:hidden animate-in slide-in-from-right duration-200 overflow-y-auto">
      <div className="p-6 flex flex-col gap-6 flex-1">
        
        {/* ========================================================================= */}
        {/* VIEW 1: ACCOUNT SUB-VIEW (When Profile Initial Icon is tapped)             */}
        {/* ========================================================================= */}
        {activeView === 'account' ? (
          <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-left duration-150">
            {/* Back Button */}
            <button
              type="button"
              onClick={() => setActiveView('menu')}
              className="flex items-center gap-1.5 text-zinc-200 hover:text-white font-semibold text-[15px] py-1 transition-colors w-fit cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            {/* Profile Avatar + Name Row (Exact Screenshot 1 & 3 Match) */}
            <div className="flex items-center gap-3.5 py-3 border-b border-[#202020]">
              <div className="w-10 h-10 rounded-full bg-[#2a2a2a] text-white font-bold text-base flex items-center justify-center border border-zinc-700 shadow-sm flex-shrink-0">
                {initialLetter}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[16px] font-bold text-white truncate leading-tight">
                  {displayName}
                </span>
                {user?.email && (
                  <span className="text-xs text-zinc-400 truncate">
                    {user.email}
                  </span>
                )}
              </div>
            </div>

            {/* STORE Section Heading */}
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mt-2">
              STORE
            </span>

            {/* Account Action Rows with Icons (Exact Epic Layout) */}
            <div className="flex flex-col space-y-3.5">
              <Link
                href="/library"
                prefetch={true}
                onClick={onClose}
                className="flex items-center gap-3.5 text-[15px] text-zinc-200 hover:text-white py-1.5 transition-colors"
              >
                <Trophy className="w-5 h-5 text-zinc-400" />
                <span>My Achievements</span>
              </Link>

              <Link
                href="/store"
                prefetch={true}
                onClick={onClose}
                className="flex items-center gap-3.5 text-[15px] text-zinc-200 hover:text-white py-1.5 transition-colors"
              >
                <Sparkles className="w-5 h-5 text-zinc-400" />
                <span>Producer Rewards</span>
              </Link>

              <Link
                href="/library"
                prefetch={true}
                onClick={onClose}
                className="flex items-center gap-3.5 text-[15px] text-zinc-200 hover:text-white py-1.5 transition-colors"
              >
                <CreditCard className="w-5 h-5 text-zinc-400" />
                <span>Account Balance</span>
              </Link>

              <Link
                href="/store"
                prefetch={true}
                onClick={onClose}
                className="flex items-center gap-3.5 text-[15px] text-zinc-200 hover:text-white py-1.5 transition-colors"
              >
                <Gift className="w-5 h-5 text-zinc-400" />
                <span>Gifts</span>
              </Link>

              <Link
                href="/store"
                prefetch={true}
                onClick={onClose}
                className="flex items-center gap-3.5 text-[15px] text-zinc-200 hover:text-white py-1.5 transition-colors"
              >
                <Tag className="w-5 h-5 text-zinc-400" />
                <span>Coupons</span>
              </Link>

              <Link
                href="/account"
                prefetch={true}
                onClick={onClose}
                className="flex items-center gap-3.5 text-[15px] text-zinc-200 hover:text-white py-1.5 transition-colors"
              >
                <User className="w-5 h-5 text-zinc-400" />
                <span>Account</span>
              </Link>

              <Link
                href="/library"
                prefetch={true}
                onClick={onClose}
                className="flex items-center gap-3.5 text-[15px] text-zinc-200 hover:text-white py-1.5 transition-colors"
              >
                <Key className="w-5 h-5 text-zinc-400" />
                <span>Redeem Code</span>
              </Link>

              <Link
                href="/library"
                prefetch={true}
                onClick={onClose}
                className="flex items-center gap-3.5 text-[15px] text-zinc-200 hover:text-white py-1.5 transition-colors"
              >
                <Bookmark className="w-5 h-5 text-zinc-400" />
                <span>Wishlist</span>
              </Link>

              <div className="pt-2 border-t border-[#202020] flex flex-col space-y-3.5">
                <Link
                  href="/store"
                  prefetch={true}
                  onClick={onClose}
                  className="flex items-center justify-between text-[15px] text-zinc-200 hover:text-white py-1.5 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <HelpCircle className="w-5 h-5 text-zinc-400" />
                    <span>Support</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-500" />
                </Link>

                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (onSignOut) onSignOut()
                      onClose()
                    }}
                    className="flex items-center gap-3.5 text-[15px] text-[#ff4053] hover:text-white hover:bg-[#ff4053]/15 py-1.5 px-2 rounded-lg transition-colors w-full text-left cursor-pointer"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                ) : (
                  <Link
                    href="/auth"
                    prefetch={true}
                    onClick={onClose}
                    className="flex items-center gap-3.5 text-[15px] text-zinc-200 hover:text-white py-1.5 transition-colors"
                  >
                    <LogOut className="w-5 h-5 text-zinc-400" />
                    <span>Sign In</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: MAIN MENU VIEW (Exact Screenshot 2 Match with Corner Initial)     */
          /* ========================================================================= */
          <>
            {/* Top Controls Row: Globe Currency Toggle + Corner Profile Initial Icon */}
            <div className="flex items-center justify-end gap-3.5">
              {/* Globe Currency Toggle */}
              <button
                type="button"
                onClick={onToggleCurrency}
                className="p-1.5 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                title="Toggle Currency"
              >
                <Globe className="w-5 h-5" />
                <span>{currency}</span>
              </button>

              {/* Corner Profile Button (If logged in, show Initial Circle. If logged out, show Sign In link) */}
              {user ? (
                <button
                  type="button"
                  onClick={() => setActiveView('account')}
                  className="w-8 h-8 rounded-full bg-[#2a2a2a] hover:bg-[#383838] text-white text-xs font-bold flex items-center justify-center border border-zinc-700/60 shadow-sm active:scale-95 transition-all cursor-pointer"
                  title={`Open Account (${displayName})`}
                >
                  {initialLetter}
                </button>
              ) : (
                <Link
                  href="/auth"
                  prefetch={true}
                  onClick={onClose}
                  className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-bold text-zinc-300 hover:text-white bg-[#202020] hover:bg-[#282828] border border-[#2e2e2e] rounded-lg transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>

            {/* Big Bold "Menu" Header (Exact Image 2 Match) */}
            <h2 className="text-3xl font-black text-white tracking-tight -mt-1">
              Menu
            </h2>

            {/* Primary Menu Links */}
            <div className="flex flex-col space-y-4">
              <Link
                href="/store"
                prefetch={true}
                onClick={onClose}
                className="text-[17px] font-medium text-zinc-200 hover:text-white transition-colors py-1 block"
              >
                Support
              </Link>

              <Link
                href="/manufacturers"
                prefetch={true}
                onClick={onClose}
                className="text-[17px] font-medium text-zinc-200 hover:text-white transition-colors py-1 flex items-center justify-between"
              >
                <span>Distribute</span>
                <ChevronRight className="w-5 h-5 text-zinc-500" />
              </Link>

              <Link
                href="/manufacturers"
                prefetch={true}
                onClick={onClose}
                className="text-[17px] font-medium text-zinc-200 hover:text-white transition-colors py-1 flex items-center justify-between"
              >
                <span>All Brands</span>
                <ChevronRight className="w-5 h-5 text-zinc-500" />
              </Link>

              <Link
                href="/store?on_sale=true"
                prefetch={true}
                onClick={onClose}
                className="text-[17px] font-medium text-zinc-200 hover:text-white transition-colors py-1 flex items-center justify-between"
              >
                <span>Deals & Sales</span>
                <ChevronRight className="w-5 h-5 text-zinc-500" />
              </Link>

              <Link
                href="/store?free=true"
                prefetch={true}
                onClick={onClose}
                className="text-[17px] font-medium text-zinc-200 hover:text-white transition-colors py-1 flex items-center justify-between"
              >
                <span>Free Downloads</span>
                <ChevronRight className="w-5 h-5 text-zinc-500" />
              </Link>
            </div>

            {/* Categories Accordion Section */}
            <div className="mt-4 pt-5 border-t border-[#202020]">
              <button
                type="button"
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="w-full flex items-center justify-between py-2 text-base font-bold text-white hover:text-zinc-300 transition-colors"
              >
                <span>Categories</span>
                <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoriesOpen && (
                <div className="flex flex-col gap-1 mt-2 pl-2 animate-in fade-in duration-150">
                  {(Object.keys(categoryData) as CategoryKey[]).map((key) => {
                    const cat = categoryData[key]
                    const isExpanded = mobileExpandedCat === key
                    return (
                      <div key={key} className="border-b border-[#202020] pb-2">
                        <button
                          onClick={() => toggleAccordion(key)}
                          className="w-full flex items-center justify-between py-2 text-sm font-semibold text-zinc-300 hover:text-white transition-colors"
                        >
                          <span>{cat.label}</span>
                          <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                        {isExpanded && (
                          <div className="pl-3 py-1 flex flex-col gap-1.5 bg-[#181818] rounded-md my-1">
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
              )}
            </div>

            {/* Bottom Library / Account Button */}
            <div className="mt-auto pt-6 border-t border-[#202020]">
              <Link
                href={user ? "/library" : "/auth"}
                prefetch={true}
                onClick={onClose}
                className="bg-[#202020] hover:bg-[#282828] text-white text-center font-bold text-sm py-3.5 rounded-xl transition-colors block shadow-md"
              >
                {user ? "Go to My Library" : "Sign In to ProducerToy"}
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  )
}

