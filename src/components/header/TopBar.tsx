'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronDown,
  Menu,
  X,
  LogOut,
  User,
  Globe,
  Check,
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
import { LogoIcon } from '@/components/Logo'
import { ToywardsIcon } from '@/components/ui/ToywardsIcon'
import { useAuth } from '@/context/AuthContext'
import { useCurrency } from '@/context/CurrencyContext'

interface TopBarProps {
  currency: string
  onToggleCurrency: () => void
  user: any
  onSignOut?: () => void
  itemCount: number
  onOpenCart: () => void
  isMobileMenuOpen: boolean
  onToggleMobileMenu: () => void
}

export const TopBar: React.FC<TopBarProps> = ({
  currency,
  onToggleCurrency,
  user,
  onSignOut,
  itemCount,
  onOpenCart,
  isMobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const { region, setRegion, regions } = useCurrency()
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [isGlobeMenuOpen, setIsGlobeMenuOpen] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const globeMenuRef = useRef<HTMLDivElement>(null)

  // Click outside to close desktop menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false)
      }
      if (globeMenuRef.current && !globeMenuRef.current.contains(event.target as Node)) {
        setIsGlobeMenuOpen(false)
      }
    }
    if (isAccountMenuOpen || isGlobeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAccountMenuOpen, isGlobeMenuOpen])

  // Derive initial and display name only when user is present
  const displayName = user
    ? user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      (user.email ? user.email.split('@')[0] : 'Producer')
    : ''
  const initialLetter = displayName ? displayName[0].toUpperCase() : 'P'

  return (
    <div className="w-full bg-[#121212] border-none">
      <div className="w-full px-5 sm:px-8 lg:px-10 h-[60px] sm:h-[72px] lg:h-[76px] flex items-center justify-between">
        
        {/* Left Section: Clean Shield Logo + STORE Name + Support + Distribute (Exact 1:1 Epic Games Store Layout) */}
        <div className="flex items-center gap-5 sm:gap-8 lg:gap-10">
          <Link href="/" prefetch={true} className="flex items-center gap-1.5 hover:opacity-90 transition-opacity">
            <LogoIcon size={38} />
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          </Link>

          <Link 
            href="/" 
            prefetch={true}
            className="text-white font-black text-[20px] sm:text-[22px] lg:text-[23px] tracking-wide uppercase font-sans hover:text-zinc-200 transition-colors leading-none"
          >
            STORE
          </Link>

          <Link 
            href="/store" 
            prefetch={true}
            className="hidden md:block text-zinc-300 hover:text-white text-[15px] font-medium transition-colors"
          >
            Support
          </Link>

          <div className="hidden lg:flex items-center gap-1.5 text-zinc-300 hover:text-white text-[15px] font-medium cursor-pointer transition-colors">
            <span>Distribute</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
          </div>
        </div>

        {/* Right Section Desktop (Exact 1:1 PC Screenshot Match) */}
        <div className="hidden md:flex items-center gap-6">

          {/* Globe Language / Region Selector Trigger (Exact 1:1 Epic Games Match) */}
          <div className="relative" ref={globeMenuRef}>
            <button
              type="button"
              onClick={() => setIsGlobeMenuOpen(!isGlobeMenuOpen)}
              className={`p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${
                isGlobeMenuOpen ? 'text-white bg-[#222222]' : 'text-zinc-400 hover:text-white hover:bg-[#1a1a1a]'
              }`}
              title={`Select Region & Currency (Current: ${region?.name || 'India'} - ${currency})`}
              aria-label="Select Region and Currency"
            >
              <Globe className="w-[21px] h-[21px]" />
            </button>

            {/* Epic Games Region / Currency Dropdown Menu */}
            {isGlobeMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-[275px] bg-[#181818] border border-[#282828] rounded-2xl shadow-2xl py-2 z-[100] animate-in fade-in zoom-in-95 duration-100 divide-y divide-[#222222]">
                <div className="px-4 py-2">
                  <p className="text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
                    Select Region & Currency
                  </p>
                </div>

                <div className="py-1 max-h-[340px] overflow-y-auto custom-scrollbar">
                  {regions.map((r) => {
                    const isSelected = region?.id === r.id
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setRegion(r.id)
                          setIsGlobeMenuOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] transition-colors text-left cursor-pointer ${
                          isSelected
                            ? 'bg-[#242424] text-white font-semibold'
                            : 'text-zinc-300 hover:text-white hover:bg-[#202020]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[17px] leading-none">{r.flag}</span>
                          <span className="truncate">{r.name}</span>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[11px] text-zinc-400 font-medium">
                            {r.currency} ({r.symbol})
                          </span>
                          {isSelected ? (
                            <Check className="w-4 h-4 text-white flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Account Popover Trigger or Sign In Button */}
          {user ? (
            <div className="relative" ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center gap-2.5 py-1 px-2 hover:bg-[#1c1c1c] rounded-lg transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-[#2a2a2a] text-white text-[12.5px] font-bold flex items-center justify-center border border-zinc-700/60 shadow-sm flex-shrink-0">
                  {initialLetter}
                </div>
                <span className="text-[14.5px] font-medium text-zinc-300 hover:text-white truncate max-w-[160px]">
                  {displayName}
                </span>
              </button>

              {/* Desktop Account Popover (Solid Minimalist Dark) */}
              {isAccountMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-[240px] bg-[#181818] border border-[#262626] rounded-[16px] shadow-2xl p-3 z-[100] animate-in fade-in zoom-in-95 duration-100">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3 pt-1 block mb-1">
                    STORE
                  </span>

                  <div className="flex flex-col space-y-0.5">
                    <Link
                      href="/library"
                      prefetch={true}
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-[13px] text-zinc-300 hover:text-white hover:bg-[#222222] rounded-lg transition-colors"
                    >
                      <Trophy className="w-4 h-4 text-zinc-400" />
                      <span>My Achievements</span>
                    </Link>

                    <Link
                      href="/account?tab=rewards"
                      prefetch={true}
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-[13px] text-zinc-300 hover:text-white hover:bg-[#222222] rounded-lg transition-colors"
                    >
                      <ToywardsIcon size={16} />
                      <span>Toywards</span>
                    </Link>

                    <Link
                      href="/account?tab=currency"
                      prefetch={true}
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-[13px] text-zinc-300 hover:text-white hover:bg-[#222222] rounded-lg transition-colors"
                    >
                      <CreditCard className="w-4 h-4 text-zinc-400" />
                      <span>Account Balance</span>
                    </Link>

                    <Link
                      href="/gifts"
                      prefetch={true}
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-[13px] text-zinc-300 hover:text-white hover:bg-[#222222] rounded-lg transition-colors"
                    >
                      <Gift className="w-4 h-4 text-zinc-400" />
                      <span>Gifts</span>
                    </Link>

                    <Link
                      href="/store?on_sale=true"
                      prefetch={true}
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-[13px] text-zinc-300 hover:text-white hover:bg-[#222222] rounded-lg transition-colors"
                    >
                      <Tag className="w-4 h-4 text-zinc-400" />
                      <span>Coupons</span>
                    </Link>

                    <Link
                      href="/account?tab=redeem"
                      prefetch={true}
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-[13px] text-zinc-300 hover:text-white hover:bg-[#222222] rounded-lg transition-colors"
                    >
                      <Key className="w-4 h-4 text-zinc-400" />
                      <span>Redeem Code</span>
                    </Link>

                    <Link
                      href="/wishlist"
                      prefetch={true}
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-[13px] text-zinc-300 hover:text-white hover:bg-[#222222] rounded-lg transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-zinc-400" />
                      <span>Wishlist</span>
                    </Link>

                    <Link
                      href="/contact"
                      prefetch={true}
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-[13px] text-zinc-300 hover:text-white hover:bg-[#222222] rounded-lg transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-zinc-400" />
                      <span>Support</span>
                    </Link>
                  </div>

                  {/* Account Settings / Sign Out */}
                  <div className="pt-2 mt-2 border-t border-[#262626] flex flex-col space-y-0.5">
                    <Link
                      href="/account"
                      prefetch={true}
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-[13px] text-zinc-300 hover:text-white hover:bg-[#222222] rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-zinc-400" />
                        <span>Account</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountMenuOpen(false)
                        if (onSignOut) onSignOut()
                      }}
                      className="flex items-center gap-3 px-3 py-2 text-[13px] text-[#ff4053] hover:text-white hover:bg-[#ff4053]/15 rounded-lg transition-colors w-full text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth"
              prefetch={true}
              className="flex items-center gap-2 py-1.5 px-3 text-xs font-semibold text-zinc-300 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-zinc-400" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Library Button (Producer Toy Light Orange Accent) */}
          <Link
            href="/library"
            prefetch={true}
            className="bg-[#FA742B] hover:bg-[#E05A18] text-white font-extrabold text-[13px] px-5 py-2.5 rounded-lg active:scale-95 transition-all shadow-md flex items-center justify-center cursor-pointer uppercase tracking-wider"
          >
            Library
          </Link>

        </div>

        {/* Mobile Right Controls: Library Button + Menu Hamburger */}
        <div className="flex md:hidden items-center gap-3.5">
          <Link
            href="/library"
            prefetch={true}
            className="bg-[#FA742B] hover:bg-[#E05A18] text-white font-extrabold text-[12px] px-4 py-1.5 rounded-[6px] active:scale-95 transition-all shadow-sm flex items-center justify-center uppercase tracking-normal"
          >
            Library
          </Link>

          <button
            onClick={onToggleMobileMenu}
            className="p-1 text-white hover:text-zinc-300 transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-7 h-7 stroke-[2.2]" /> : <Menu className="w-7 h-7 stroke-[2.2]" />}
          </button>
        </div>

      </div>
    </div>
  )
}
