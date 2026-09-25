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
  ShieldCheck
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
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const globeMenuRef = useRef<HTMLDivElement>(null)
  const ecosystemMenuRef = useRef<HTMLDivElement>(null)

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
    }
    if (isAccountMenuOpen || isGlobeMenuOpen || isEcosystemOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAccountMenuOpen, isGlobeMenuOpen, isEcosystemOpen])

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
          {/* Logo with Dropdown Chevron - On mobile, if mobile menu is open, transition/hide logo */}
          <button
            type="button"
            onClick={() => setIsEcosystemOpen(!isEcosystemOpen)}
            className={`items-center gap-1.5 hover:opacity-90 transition-all cursor-pointer ${
              isMobileMenuOpen ? 'hidden md:flex' : 'flex'
            }`}
            aria-label="Producer Toy Ecosystem Menu"
          >
            <LogoIcon size={38} />
            <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isEcosystemOpen ? 'rotate-180 text-white' : ''}`} />
          </button>

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

          <div 
            onClick={() => setIsEcosystemOpen(!isEcosystemOpen)}
            className="hidden lg:flex items-center gap-1.5 text-zinc-300 hover:text-white text-[15px] font-medium cursor-pointer transition-colors"
          >
            <Link href="/distribute" prefetch={true} onClick={(e) => e.stopPropagation()}>
              Distribute
            </Link>
            <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${isEcosystemOpen ? 'rotate-180 text-white' : ''}`} />
          </div>

          {/* Epic Ecosystem Mega Dropdown (Exact Screenshot 1 Match) */}
          {isEcosystemOpen && (
            <div 
              ref={ecosystemMenuRef}
              className="absolute left-0 top-[60px] sm:top-[68px] w-[540px] bg-[#181818] border border-white/10 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] p-6 z-[100] animate-in fade-in zoom-in-95 duration-150 grid grid-cols-2 gap-8 text-left select-none"
            >
              {/* Column 1: Play & Discover */}
              <div className="space-y-6">
                {/* Section: Play */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Play & Produce</h4>
                  <div className="space-y-1">
                    <Link
                      href="/store/sounds"
                      prefetch={true}
                      onClick={() => setIsEcosystemOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#242424] flex items-center justify-center text-zinc-300">
                        <Music2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight">Sample Packs & Loops</p>
                        <p className="text-[11px] text-zinc-500 leading-tight">808s, Drums & Melodies</p>
                      </div>
                    </Link>

                    <Link
                      href="/store/vst-plugins"
                      prefetch={true}
                      onClick={() => setIsEcosystemOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#242424] flex items-center justify-center text-zinc-300">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight">VST & Audio Plugins</p>
                        <p className="text-[11px] text-zinc-500 leading-tight">Instruments & FX Tools</p>
                      </div>
                    </Link>

                    <Link
                      href="/store/presets"
                      prefetch={true}
                      onClick={() => setIsEcosystemOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#242424] flex items-center justify-center text-zinc-300">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight">Synth Presets</p>
                        <p className="text-[11px] text-zinc-500 leading-tight">Serum, Vital, Phase Plant</p>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Section: Discover */}
                <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Discover</h4>
                  <div className="space-y-1">
                    <Link
                      href="/store"
                      prefetch={true}
                      onClick={() => setIsEcosystemOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#242424] flex items-center justify-center text-zinc-300">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight">Producer Toy Store</p>
                        <p className="text-[11px] text-zinc-500 leading-tight">Explore Full Catalog</p>
                      </div>
                    </Link>

                    <Link
                      href="/store?price=free"
                      prefetch={true}
                      onClick={() => setIsEcosystemOpen(false)}
                      className="flex items-center gap-3 p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#242424] flex items-center justify-center text-zinc-300">
                        <Gift className="w-4 h-4 text-[#FC6301]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight text-white flex items-center gap-1.5">
                          <span>Free Producer Toys</span>
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#FC6301]/20 text-[#FC6301]">Free</span>
                        </p>
                        <p className="text-[11px] text-zinc-500 leading-tight">100% Free Downloads</p>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Column 2: Create & Distribute */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Create & Distribute</h4>
                <div className="space-y-1">
                  <Link
                    href="/distribute"
                    prefetch={true}
                    onClick={() => setIsEcosystemOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#242424] flex items-center justify-center text-[#FC6301]">
                      <Upload className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-tight text-white">Distribute on Producer Toy</p>
                      <p className="text-[11px] text-zinc-500 leading-tight">88/12 Revenue Split</p>
                    </div>
                  </Link>

                  <Link
                    href="/contact?topic=creator"
                    prefetch={true}
                    onClick={() => setIsEcosystemOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#242424] flex items-center justify-center text-zinc-300">
                      <Radio className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-tight">Publish Your Music Packs</p>
                      <p className="text-[11px] text-zinc-500 leading-tight">Global CDN Distribution</p>
                    </div>
                  </Link>

                  <Link
                    href="/account"
                    prefetch={true}
                    onClick={() => setIsEcosystemOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#242424] flex items-center justify-center text-zinc-300">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-tight">Creator Dashboard</p>
                      <p className="text-[11px] text-zinc-500 leading-tight">Analytics & Earnings</p>
                    </div>
                  </Link>

                  <Link
                    href="/contact"
                    prefetch={true}
                    onClick={() => setIsEcosystemOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#242424] flex items-center justify-center text-zinc-300">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-tight">Help & Support</p>
                      <p className="text-[11px] text-zinc-500 leading-tight">Tickets & Live Assistance</p>
                    </div>
                  </Link>

                  <Link
                    href="/licensing"
                    prefetch={true}
                    onClick={() => setIsEcosystemOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#242424] flex items-center justify-center text-zinc-300">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold leading-tight">Licensing Agreement</p>
                      <p className="text-[11px] text-zinc-500 leading-tight">Royalty-Free Terms</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          )}
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

        {/* Mobile Right Controls: Exact Epic Games Screenshot 1 & 4 */}
        <div className="flex md:hidden items-center gap-2">
          {isMobileMenuOpen ? (
            // When Mobile Menu is Open:
            user ? (
              // Logged in (Screenshot 4): Orange Library button + X close button
              <>
                <Link
                  href="/library"
                  prefetch={true}
                  className="bg-[#FC6301] hover:bg-[#e05700] text-white font-bold text-xs px-3 py-1.5 rounded-lg active:scale-95 transition-all shadow-md flex items-center justify-center uppercase tracking-wide"
                >
                  Library
                </Link>

                <button
                  onClick={onToggleMobileMenu}
                  className="p-1 text-white hover:text-zinc-300 transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
                  aria-label="Close Navigation Menu"
                >
                  <X className="w-6 h-6 stroke-[2.2]" />
                </button>
              </>
            ) : (
              // Logged out (Screenshot 1): Globe icon + Sign In button + X close button
              <>
                <button
                  type="button"
                  onClick={onToggleCurrency}
                  className="p-1.5 text-zinc-300 hover:text-white transition-colors"
                  aria-label="Toggle Currency"
                >
                  <Globe className="w-4 h-4" />
                </button>

                <Link
                  href="/auth"
                  prefetch={true}
                  className="bg-[#202020] hover:bg-[#282828] text-white border border-white/10 font-bold text-xs px-3 py-1.5 rounded-lg active:scale-95 transition-all shadow-sm flex items-center justify-center"
                >
                  Sign in
                </Link>

                <button
                  onClick={onToggleMobileMenu}
                  className="p-1 text-white hover:text-zinc-300 transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
                  aria-label="Close Navigation Menu"
                >
                  <X className="w-6 h-6 stroke-[2.2]" />
                </button>
              </>
            )
          ) : (
            // When Mobile Menu is Closed: Normal Library button + Hamburger icon
            <>
              <Link
                href="/library"
                prefetch={true}
                className="bg-[#202020] hover:bg-[#282828] text-white border border-[#333333] font-bold text-xs px-3 py-1.5 rounded-lg active:scale-95 transition-all shadow-xs flex items-center justify-center uppercase tracking-normal"
              >
                Library
              </Link>

              <button
                onClick={onToggleMobileMenu}
                className="p-1 text-white hover:text-zinc-300 transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-7 h-7 stroke-[2.2]" />
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
