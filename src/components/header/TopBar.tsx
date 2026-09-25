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
  Gift,
  Tag,
  Key,
  Bookmark,
  HelpCircle,
  ExternalLink,
  Music2,
  Cpu,
  ShoppingBag,
  Upload,
  Radio,
  Users,
  ShieldCheck,
  BookOpen,
  MessageSquare
} from 'lucide-react'
import { LogoIcon } from '@/components/Logo'
import { ToywardsIcon } from '@/components/ui/ToywardsIcon'
import { useAuth } from '@/context/AuthContext'
import { useCurrency } from '@/context/CurrencyContext'
import { useGifts } from '@/context/GiftContext'

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
  const { unopenedCount } = useGifts()
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [isGlobeMenuOpen, setIsGlobeMenuOpen] = useState(false)
  const [isEcosystemOpen, setIsEcosystemOpen] = useState(false)
  const [isDistributeOpen, setIsDistributeOpen] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const globeMenuRef = useRef<HTMLDivElement>(null)
  const ecosystemMenuRef = useRef<HTMLDivElement>(null)
  const distributeMenuRef = useRef<HTMLDivElement>(null)

  // Click outside to close desktop menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false)
      }
      if (globeMenuRef.current && !globeMenuRef.current.contains(event.target as Node)) {
        setIsGlobeMenuOpen(false)
      }
      if (ecosystemMenuRef.current && !ecosystemMenuRef.current.contains(event.target as Node)) {
        setIsEcosystemOpen(false)
      }
      if (distributeMenuRef.current && !distributeMenuRef.current.contains(event.target as Node)) {
        setIsDistributeOpen(false)
      }
    }
    if (isAccountMenuOpen || isGlobeMenuOpen || isEcosystemOpen || isDistributeOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAccountMenuOpen, isGlobeMenuOpen, isEcosystemOpen, isDistributeOpen])

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
        <div className="flex items-center gap-5 sm:gap-7 lg:gap-8 relative">
          {/* Logo with Ecosystem Dropdown (Exact Screenshot 1 Match) */}
          <div className="relative" ref={ecosystemMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsEcosystemOpen(!isEcosystemOpen)
                setIsDistributeOpen(false)
              }}
              className={`items-center gap-1.5 hover:opacity-90 transition-all cursor-pointer ${
                isMobileMenuOpen ? 'hidden md:flex' : 'flex'
              }`}
              aria-label="Producer Toy Ecosystem Menu"
            >
              <LogoIcon size={38} />
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isEcosystemOpen ? 'rotate-180 text-white' : ''}`} />
            </button>

            {/* Ecosystem Mega Dropdown (Exact Screenshot 1 Match) */}
            {isEcosystemOpen && (
              <div 
                className="absolute left-0 top-[60px] sm:top-[68px] lg:top-[74px] w-[calc(100vw-32px)] sm:w-[500px] lg:w-[540px] bg-[#18181c] border border-white/10 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-5 sm:p-6 z-[100] animate-in fade-in zoom-in-95 duration-150 grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-6 sm:gap-8 text-left select-none"
              >
                {/* Column 1: Play & Discover */}
                <div className="space-y-6">
                  {/* Section: Play */}
                  <div className="space-y-2.5">
                    <h4 className="text-[15px] font-bold text-white tracking-tight">Play</h4>
                    <div className="space-y-1">
                      <Link
                        href="/store/sounds"
                        prefetch={true}
                        onClick={() => setIsEcosystemOpen(false)}
                        className="group flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <Music2 className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0" />
                        <span>Sample Packs</span>
                      </Link>

                      <Link
                        href="/store/vst-plugins"
                        prefetch={true}
                        onClick={() => setIsEcosystemOpen(false)}
                        className="group flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <Cpu className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0" />
                        <span>VST Plugins</span>
                      </Link>

                      <Link
                        href="/store/presets"
                        prefetch={true}
                        onClick={() => setIsEcosystemOpen(false)}
                        className="group flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <Sparkles className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0" />
                        <span>Synth Presets</span>
                      </Link>
                    </div>
                  </div>

                  {/* Section: Discover */}
                  <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
                    <h4 className="text-[15px] font-bold text-white tracking-tight">Discover</h4>
                    <div className="space-y-1">
                      <Link
                        href="/store"
                        prefetch={true}
                        onClick={() => setIsEcosystemOpen(false)}
                        className="group flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-semibold bg-[#2a2a30] text-white shadow-sm transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4 text-white flex-shrink-0" />
                        <span>Producer Toy Store</span>
                      </Link>

                      <Link
                        href="/store?price=free"
                        prefetch={true}
                        onClick={() => setIsEcosystemOpen(false)}
                        className="group flex items-center justify-between px-3 py-2 rounded-xl text-[13.5px] font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <Gift className="w-4 h-4 text-[#FC6301] flex-shrink-0" />
                          <span>Free Producer Toys</span>
                        </div>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#FC6301]/20 text-[#FC6301]">
                          Free
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Column 2: Create */}
                <div className="space-y-2.5 sm:border-l sm:border-white/[0.06] sm:pl-6">
                  <h4 className="text-[15px] font-bold text-white tracking-tight">Create</h4>
                  <div className="space-y-1">
                    <Link
                      href="/distribute"
                      prefetch={true}
                      onClick={() => setIsEcosystemOpen(false)}
                      className="group flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <Upload className="w-4 h-4 text-[#FC6301] flex-shrink-0" />
                      <span>Distribute on Producer Toy</span>
                    </Link>

                    <Link
                      href="/account"
                      prefetch={true}
                      onClick={() => setIsEcosystemOpen(false)}
                      className="group flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <Users className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0" />
                      <span>Creator Dashboard</span>
                    </Link>

                    <Link
                      href="/distribute"
                      prefetch={true}
                      onClick={() => setIsEcosystemOpen(false)}
                      className="group flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <Radio className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0" />
                      <span>Publish Your Music Packs</span>
                    </Link>

                    <Link
                      href="/contact?topic=creator"
                      prefetch={true}
                      onClick={() => setIsEcosystemOpen(false)}
                      className="group flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0" />
                      <span>Developer & Creator Forums</span>
                    </Link>

                    <Link
                      href="/licensing"
                      prefetch={true}
                      onClick={() => setIsEcosystemOpen(false)}
                      className="group flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0" />
                      <span>Licensing & Terms</span>
                    </Link>

                    <Link
                      href="/blog"
                      prefetch={true}
                      onClick={() => setIsEcosystemOpen(false)}
                      className="group flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0" />
                      <span>Creator Academy & Guides</span>
                    </Link>

                    <Link
                      href="/contact"
                      prefetch={true}
                      onClick={() => setIsEcosystemOpen(false)}
                      className="group flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13.5px] font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0" />
                      <span>Help & Support Assistant</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link 
            href="/" 
            prefetch={true}
            className="text-white font-bold text-[19px] sm:text-[21px] lg:text-[22px] tracking-wide uppercase font-sans hover:text-zinc-200 transition-colors leading-none"
          >
            STORE
          </Link>

          <Link 
            href="/contact" 
            prefetch={true}
            className="hidden md:block text-zinc-300 hover:text-white text-[15px] font-medium transition-colors"
          >
            Support
          </Link>

          {/* Distribute Dropdown (Exact Screenshot 2 Match) */}
          <div className="relative hidden lg:block" ref={distributeMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsDistributeOpen(!isDistributeOpen)
                setIsEcosystemOpen(false)
              }}
              className={`flex items-center gap-1.5 text-[15px] font-medium cursor-pointer transition-all px-3 py-1.5 rounded-lg ${
                isDistributeOpen 
                  ? 'bg-white/[0.08] text-white border border-white/20' 
                  : 'text-zinc-300 hover:text-white hover:bg-white/[0.04] border border-transparent'
              }`}
              aria-label="Distribute Menu"
            >
              <span>Distribute</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDistributeOpen ? 'rotate-180 text-white' : 'text-zinc-400'}`} />
            </button>

            {/* Distribute Dropdown Menu (Screenshot 2 1:1 Match) */}
            {isDistributeOpen && (
              <div className="absolute left-0 top-full mt-2 w-[240px] bg-[#18181c] border border-white/10 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-[100] animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-0.5 select-none">
                <Link
                  href="/distribute"
                  prefetch={true}
                  onClick={() => setIsDistributeOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors block text-left"
                >
                  Distribute on Producer Toy
                </Link>
                <Link
                  href="/contact?topic=creator"
                  prefetch={true}
                  onClick={() => setIsDistributeOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors block text-left"
                >
                  Developer Forums
                </Link>
                <Link
                  href="/licensing"
                  prefetch={true}
                  onClick={() => setIsDistributeOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors block text-left"
                >
                  Documentation
                </Link>
                <Link
                  href="/blog"
                  prefetch={true}
                  onClick={() => setIsDistributeOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors block text-left"
                >
                  Learning
                </Link>
              </div>
            )}
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

                    {/* TOYWARDS FEATURE (Commented out for future launch)
                    <Link
                      href="/account?tab=rewards"
                      prefetch={true}
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-[13px] text-zinc-300 hover:text-white hover:bg-[#222222] rounded-lg transition-colors"
                    >
                      <ToywardsIcon size={16} />
                      <span>Toywards</span>
                    </Link>
                    */}

                    {/* GIFTING FEATURE (Temporarily Commented Out for Future Launch)
                    <Link
                      href="/gifts"
                      prefetch={true}
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-[13px] text-zinc-300 hover:text-white hover:bg-[#222222] rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Gift className="w-4 h-4 text-zinc-400" />
                        <span>Gifts</span>
                      </div>
                      {unopenedCount > 0 && (
                        <span className="bg-white text-black text-[10px] font-extrabold px-1.5 py-0.5 rounded-full leading-none shadow-sm">
                          {unopenedCount} new
                        </span>
                      )}
                    </Link>
                    */}

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

          {/* Library Button (Balanced Minimalist Style) */}
          <Link
            href="/library"
            prefetch={true}
            className="bg-[#202020] hover:bg-[#2a2a2a] text-white hover:text-white border border-[#303030] hover:border-zinc-400 font-bold text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl active:scale-95 transition-all shadow-sm flex items-center justify-center cursor-pointer uppercase tracking-wider"
          >
            Library
          </Link>

        </div>

        {/* Mobile Right Controls: Exact Epic Games Screenshot Match */}
        <div className="flex md:hidden items-center gap-3">
          {!isMobileMenuOpen && (
            <Link
              href="/library"
              prefetch={true}
              className="bg-[#202020] hover:bg-[#282828] text-white border border-[#333333] font-bold text-xs px-3.5 py-1.5 rounded-lg active:scale-95 transition-all shadow-xs flex items-center justify-center uppercase tracking-wide"
            >
              Library
            </Link>
          )}

          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="w-10 h-10 -mr-2 text-white hover:text-zinc-300 transition-colors focus:outline-none flex items-center justify-center cursor-pointer active:scale-90"
            aria-label={isMobileMenuOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
          >
            <div className="relative w-6 h-[18px] flex flex-col justify-between items-center">
              <span
                className={`h-0.5 w-6 bg-white rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center ${
                  isMobileMenuOpen ? 'rotate-45 translate-y-[8px]' : 'translate-y-0'
                }`}
              />
              <span
                className={`h-0.5 w-6 bg-white rounded-full transition-all duration-200 ease-out ${
                  isMobileMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
                }`}
              />
              <span
                className={`h-0.5 w-6 bg-white rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] origin-center ${
                  isMobileMenuOpen ? '-rotate-45 -translate-y-[8px]' : 'translate-y-0'
                }`}
              />
            </div>
          </button>
        </div>

      </div>
    </div>
  )
}
