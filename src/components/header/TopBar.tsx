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
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)

  // Click outside to close desktop account menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false)
      }
    }
    if (isAccountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAccountMenuOpen])

  // Derive initial and display name only when user is present
  const displayName = user
    ? user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      (user.email ? user.email.split('@')[0] : 'Producer')
    : ''
  const initialLetter = displayName ? displayName[0].toUpperCase() : 'P'

  return (
    <div className="w-full bg-[#121212]">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-10 lg:px-16 h-[52px] sm:h-[58px] flex items-center justify-between">
        
        {/* Left Section: Logo + Chevron + STORE Name (Exact Epic Games Store Layout) */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/" prefetch={true} className="flex items-center gap-1 hover:opacity-90 transition-opacity">
            <LogoIcon size={26} />
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </Link>

          <Link 
            href="/store" 
            prefetch={true}
            className="text-white font-black text-[16px] tracking-wider uppercase font-sans hover:text-zinc-200 transition-colors"
          >
            STORE
          </Link>

          <Link 
            href="/store" 
            prefetch={true}
            className="hidden md:block text-zinc-400 hover:text-white text-sm font-medium transition-colors"
          >
            Support
          </Link>

          <div className="hidden lg:flex items-center gap-1 text-zinc-400 hover:text-white text-sm font-medium cursor-pointer transition-colors">
            <span>Distribute</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
          </div>
        </div>

        {/* Right Section Desktop (Exact PC Screenshot Match) */}
        <div className="hidden md:flex items-center gap-4">

          {/* Globe Currency Toggle */}
          <button
            type="button"
            onClick={onToggleCurrency}
            className="p-1.5 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Toggle Currency"
          >
            <Globe className="w-4 h-4 text-zinc-300" />
            <span className="text-zinc-300">{currency}</span>
          </button>

          {/* Account Popover Trigger or Sign In Button */}
          {user ? (
            <div className="relative" ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="flex items-center gap-2.5 py-1 px-2 hover:bg-[#1a1a1a] rounded-lg transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-[#2a2a2a] text-white text-xs font-bold flex items-center justify-center border border-zinc-700/60 shadow-sm flex-shrink-0">
                  {initialLetter}
                </div>
                <span className="text-xs font-semibold text-zinc-200 hover:text-white truncate max-w-[130px]">
                  {displayName}
                </span>
              </button>

              {/* Desktop Account Popover (Solid Minimalist Dark, No Glassmorphism) */}
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
                    href="/store"
                    prefetch={true}
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-[13px] text-zinc-300 hover:text-white hover:bg-[#222222] rounded-lg transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-zinc-400" />
                    <span>Producer Rewards</span>
                  </Link>

                  <Link
                    href="/library"
                    prefetch={true}
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-[13px] text-zinc-300 hover:text-white hover:bg-[#222222] rounded-lg transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-zinc-400" />
                    <span>Account Balance</span>
                  </Link>

                  <Link
                    href="/store"
                    prefetch={true}
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-[13px] text-zinc-300 hover:text-white hover:bg-[#222222] rounded-lg transition-colors"
                  >
                    <Gift className="w-4 h-4 text-zinc-400" />
                    <span>Gifts</span>
                  </Link>

                  <Link
                    href="/store"
                    prefetch={true}
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-[13px] text-zinc-300 hover:text-white hover:bg-[#222222] rounded-lg transition-colors"
                  >
                    <Tag className="w-4 h-4 text-zinc-400" />
                    <span>Coupons</span>
                  </Link>

                  <Link
                    href="/account"
                    prefetch={true}
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-[13px] text-zinc-300 hover:text-white hover:bg-[#222222] rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4 text-zinc-400" />
                    <span>Account</span>
                  </Link>

                  <Link
                    href="/library"
                    prefetch={true}
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-[13px] text-zinc-300 hover:text-white hover:bg-[#222222] rounded-lg transition-colors"
                  >
                    <Key className="w-4 h-4 text-zinc-400" />
                    <span>Redeem Code</span>
                  </Link>

                  <Link
                    href="/library"
                    prefetch={true}
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-[13px] text-zinc-300 hover:text-white hover:bg-[#222222] rounded-lg transition-colors"
                  >
                    <Bookmark className="w-4 h-4 text-zinc-400" />
                    <span>Wishlist</span>
                  </Link>
                </div>

                <div className="my-1.5 border-t border-[#242424]" />

                <div className="flex flex-col space-y-0.5">
                  <Link
                    href="/store"
                    prefetch={true}
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 text-[13px] text-zinc-300 hover:text-white hover:bg-[#222222] rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 text-zinc-400" />
                      <span>Support</span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                  </Link>

                  {user ? (
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

          {/* Download Button */}
          <Link
            href="/store"
            prefetch={true}
            className="bg-[#0074e4] hover:bg-[#006bd6] text-white font-bold text-xs px-4 py-2 rounded-[4px] active:scale-95 transition-all shadow-sm flex items-center justify-center cursor-pointer"
          >
            Download
          </Link>

        </div>

        {/* Mobile Right Controls: Download Button + Menu Hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <Link
            href="/store"
            prefetch={true}
            className="bg-[#0074e4] hover:bg-[#006bd6] text-white font-bold text-[13px] px-3.5 py-1.5 rounded-[4px] active:scale-95 transition-all shadow-sm flex items-center justify-center"
          >
            Download
          </Link>

          <button
            onClick={onToggleMobileMenu}
            className="p-1 text-white hover:text-zinc-300 transition-colors focus:outline-none flex items-center justify-center cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>
    </div>
  )
}
