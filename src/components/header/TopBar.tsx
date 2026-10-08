'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import {
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Search,
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
  profile?: any
  onSignOut?: () => void
  itemCount: number
  onOpenCart: () => void
  isMobileMenuOpen: boolean
  onToggleMobileMenu: () => void
  isSiteVariant?: boolean
}

export const TopBar: React.FC<TopBarProps> = ({
  currency,
  onToggleCurrency,
  user,
  profile,
  onSignOut,
  itemCount,
  onOpenCart,
  isMobileMenuOpen,
  onToggleMobileMenu,
  isSiteVariant = false,
}) => {
  const router = useRouter()
  const pathname = usePathname()
  const { region, setRegion, regions } = useCurrency()
  const { unopenedCount } = useGifts()
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [isGlobeMenuOpen, setIsGlobeMenuOpen] = useState(false)
  const [isEcosystemOpen, setIsEcosystemOpen] = useState(false)
  const [isDistributeOpen, setIsDistributeOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [desktopSearchQuery, setDesktopSearchQuery] = useState('')
  const accountMenuRef = useRef<HTMLDivElement>(null)
  const globeMenuRef = useRef<HTMLDivElement>(null)
  const ecosystemMenuRef = useRef<HTMLDivElement>(null)
  const distributeMenuRef = useRef<HTMLDivElement>(null)
  const aboutMenuRef = useRef<HTMLDivElement>(null)
  const ecosystemTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const distributeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const aboutTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isAboutOpen, setIsAboutOpen] = useState(false)

  const handleDesktopSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (desktopSearchQuery.trim()) {
      router.push(`/store?q=${encodeURIComponent(desktopSearchQuery.trim())}`)
    }
  }

  const handleDropdownNavigate = (e: React.MouseEvent, href: string) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
      return
    }
    e.preventDefault()
    e.stopPropagation()

    if (ecosystemTimeoutRef.current) {
      clearTimeout(ecosystemTimeoutRef.current)
      ecosystemTimeoutRef.current = null
    }
    if (distributeTimeoutRef.current) {
      clearTimeout(distributeTimeoutRef.current)
      distributeTimeoutRef.current = null
    }
    if (aboutTimeoutRef.current) {
      clearTimeout(aboutTimeoutRef.current)
      aboutTimeoutRef.current = null
    }

    router.push(href)
    setIsEcosystemOpen(false)
    setIsDistributeOpen(false)
    setIsAboutOpen(false)
    setIsAccountMenuOpen(false)
  }

  // Automatically close any open popover or drawer when the route changes
  useEffect(() => {
    setIsEcosystemOpen(false)
    setIsDistributeOpen(false)
    setIsAboutOpen(false)
    setIsAccountMenuOpen(false)
    setIsGlobeMenuOpen(false)
  }, [pathname])

  const handleMouseEnterAbout = () => {
    if (aboutTimeoutRef.current) {
      clearTimeout(aboutTimeoutRef.current)
      aboutTimeoutRef.current = null
    }
    setIsAboutOpen(true)
  }

  const handleMouseLeaveAbout = () => {
    if (aboutTimeoutRef.current) {
      clearTimeout(aboutTimeoutRef.current)
    }
    aboutTimeoutRef.current = setTimeout(() => {
      setIsAboutOpen(false)
    }, 180)
  }

  const handleMouseEnterEcosystem = () => {
    if (ecosystemTimeoutRef.current) {
      clearTimeout(ecosystemTimeoutRef.current)
      ecosystemTimeoutRef.current = null
    }
    if (distributeTimeoutRef.current) {
      clearTimeout(distributeTimeoutRef.current)
      distributeTimeoutRef.current = null
    }
    setIsDistributeOpen(false)
    setIsEcosystemOpen(true)
  }

  const handleMouseLeaveEcosystem = () => {
    if (ecosystemTimeoutRef.current) {
      clearTimeout(ecosystemTimeoutRef.current)
    }
    ecosystemTimeoutRef.current = setTimeout(() => {
      setIsEcosystemOpen(false)
    }, 180)
  }

  const handleMouseEnterDistribute = () => {
    if (distributeTimeoutRef.current) {
      clearTimeout(distributeTimeoutRef.current)
      distributeTimeoutRef.current = null
    }
    if (ecosystemTimeoutRef.current) {
      clearTimeout(ecosystemTimeoutRef.current)
      ecosystemTimeoutRef.current = null
    }
    setIsEcosystemOpen(false)
    setIsDistributeOpen(true)
  }

  const handleMouseLeaveDistribute = () => {
    if (distributeTimeoutRef.current) {
      clearTimeout(distributeTimeoutRef.current)
    }
    distributeTimeoutRef.current = setTimeout(() => {
      setIsDistributeOpen(false)
    }, 180)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock body scroll on mobile when ecosystem menu is open
  useEffect(() => {
    if (isEcosystemOpen && typeof window !== 'undefined' && window.innerWidth < 768) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isEcosystemOpen])

  // Close ecosystem menu when mobile right menu opens
  useEffect(() => {
    if (isMobileMenuOpen) {
      setIsEcosystemOpen(false)
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    return () => {
      if (ecosystemTimeoutRef.current) clearTimeout(ecosystemTimeoutRef.current)
      if (distributeTimeoutRef.current) clearTimeout(distributeTimeoutRef.current)
      if (aboutTimeoutRef.current) clearTimeout(aboutTimeoutRef.current)
    }
  }, [])

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
      if (aboutMenuRef.current && !aboutMenuRef.current.contains(event.target as Node)) {
        setIsAboutOpen(false)
      }
    }
    if (isAccountMenuOpen || isGlobeMenuOpen || isEcosystemOpen || isDistributeOpen || isAboutOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isAccountMenuOpen, isGlobeMenuOpen, isEcosystemOpen, isDistributeOpen, isAboutOpen])

  // Derive initial and display name prioritizing profile display_name (matching Account Settings)
  const displayName = user
    ? profile?.display_name ||
      profile?.full_name ||
      user.user_metadata?.display_name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      (user.email ? user.email.split('@')[0] : 'Producer')
    : ''
  const initialLetter = displayName ? displayName.trim().charAt(0).toUpperCase() : 'P'

  return (
    <div className="w-full bg-transparent border-none">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-[60px] sm:h-[72px] lg:h-[76px] flex items-center justify-between">

        {/* Left Section: Clean Shield Logo + STORE Name + Support + Distribute (Exact 1:1 Epic Games Store Layout) */}
        <div className="flex items-center relative">
          {/* Logo with Ecosystem Dropdown - Smoothly collapses on mobile when menu opens */}
          <div
            ref={ecosystemMenuRef}
            onMouseEnter={handleMouseEnterEcosystem}
            onMouseLeave={handleMouseLeaveEcosystem}
            className={`relative flex items-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isMobileMenuOpen
                ? 'w-0 min-w-0 max-w-0 opacity-0 -translate-x-16 pointer-events-none overflow-hidden mr-0 md:w-auto md:min-w-0 md:max-w-none md:opacity-100 md:translate-x-0 md:pointer-events-auto md:overflow-visible md:mr-8'
                : isSiteVariant
                ? 'w-auto min-w-0 md:w-auto opacity-100 translate-x-0 overflow-visible mr-3 sm:mr-4 md:mr-5'
                : 'w-auto min-w-0 md:w-auto opacity-100 translate-x-0 overflow-visible mr-4 sm:mr-5 md:mr-8'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setIsEcosystemOpen(!isEcosystemOpen)
                setIsDistributeOpen(false)
              }}
              className="flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer flex-shrink-0"
              aria-label="Producer Toy Ecosystem Menu"
            >
              <LogoIcon size={48} />
              <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${isEcosystemOpen ? 'rotate-180 text-white' : ''}`} />
            </button>

            {/* Desktop Ecosystem Mega Dropdown */}
            {isEcosystemOpen && (
              <div
                className="hidden md:grid absolute left-0 top-full mt-2.5 w-[570px] max-w-[calc(100vw-32px)] bg-[#141416]/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.03)] p-6 z-[100] animate-in fade-in zoom-in-95 duration-150 grid-cols-[220px_1fr] gap-6 text-left select-none pointer-events-auto before:content-[''] before:absolute before:-top-3 before:inset-x-0 before:h-3"
              >
                {/* Column 1: Play & Discover */}
                <div className="space-y-6">
                  {/* Section: Play */}
                  <div className="space-y-2.5">
                    <h4 className="text-[13px] font-bold uppercase tracking-wider text-zinc-400">Play</h4>
                    <div className="space-y-1">
                      <Link
                        href="/store/sounds"
                        prefetch={true}
                        onClick={(e) => handleDropdownNavigate(e, '/store/sounds')}
                        className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all whitespace-nowrap w-full"
                      >
                        <Music2 className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0" />
                        <span>Sample Packs</span>
                      </Link>

                      <Link
                        href="/store/vst-plugins"
                        prefetch={true}
                        onClick={(e) => handleDropdownNavigate(e, '/store/vst-plugins')}
                        className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all whitespace-nowrap w-full"
                      >
                        <Cpu className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0" />
                        <span>VST Plugins</span>
                      </Link>

                      <Link
                        href="/store/presets"
                        prefetch={true}
                        onClick={(e) => handleDropdownNavigate(e, '/store/presets')}
                        className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all whitespace-nowrap w-full"
                      >
                        <Sparkles className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0" />
                        <span>Synth Presets</span>
                      </Link>
                    </div>
                  </div>

                  {/* Section: Discover */}
                  <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
                    <h4 className="text-[13px] font-bold uppercase tracking-wider text-zinc-400">Discover</h4>
                    <div className="space-y-1">
                      <Link
                        href="/store"
                        prefetch={true}
                        onClick={(e) => handleDropdownNavigate(e, '/store')}
                        className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13.5px] font-semibold bg-white/[0.08] hover:bg-white/[0.12] border border-white/[0.08] text-white shadow-sm transition-all whitespace-nowrap w-full"
                      >
                        <ShoppingBag className="w-4 h-4 text-white flex-shrink-0" />
                        <span>Producer Toy Store</span>
                      </Link>

                      <Link
                        href="/store?price=free"
                        prefetch={true}
                        onClick={(e) => handleDropdownNavigate(e, '/store?price=free')}
                        className="group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all whitespace-nowrap w-full"
                      >
                        <div className="flex items-center gap-2.5">
                          <Gift className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0" />
                          <span>Free Producer Toys</span>
                        </div>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/10">
                          Free
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Column 2: Create */}
                <div className="space-y-2.5 sm:border-l sm:border-white/[0.06] sm:pl-6">
                  <h4 className="text-[13px] font-bold uppercase tracking-wider text-zinc-400">Create</h4>
                  <div className="space-y-1">
                    <Link
                      href="/distribute"
                      prefetch={true}
                      onClick={(e) => handleDropdownNavigate(e, '/distribute')}
                      className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all whitespace-nowrap w-full"
                    >
                      <Upload className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0" />
                      <span>Distribute on Producer Toy</span>
                    </Link>

                    <Link
                      href="/account"
                      prefetch={true}
                      onClick={(e) => handleDropdownNavigate(e, '/account')}
                      className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all whitespace-nowrap w-full"
                    >
                      <Users className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0" />
                      <span>Creator Dashboard</span>
                    </Link>

                    <Link
                      href="/distribute"
                      prefetch={true}
                      onClick={(e) => handleDropdownNavigate(e, '/distribute')}
                      className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all whitespace-nowrap w-full"
                    >
                      <Radio className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0" />
                      <span>Publish Your Music Packs</span>
                    </Link>

                    <Link
                      href="/contact?topic=creator"
                      prefetch={true}
                      onClick={(e) => handleDropdownNavigate(e, '/contact?topic=creator')}
                      className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all whitespace-nowrap w-full"
                    >
                      <MessageSquare className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0" />
                      <span>Developer Forums</span>
                    </Link>

                    <Link
                      href="/licensing"
                      prefetch={true}
                      onClick={(e) => handleDropdownNavigate(e, '/licensing')}
                      className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all whitespace-nowrap w-full"
                    >
                      <ShieldCheck className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0" />
                      <span>Licensing & Terms</span>
                    </Link>

                    <Link
                      href="/blog"
                      prefetch={true}
                      onClick={(e) => handleDropdownNavigate(e, '/blog')}
                      className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all whitespace-nowrap w-full"
                    >
                      <BookOpen className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0" />
                      <span>Creator Academy & Guides</span>
                    </Link>

                    <Link
                      href="/support"
                      prefetch={true}
                      onClick={(e) => handleDropdownNavigate(e, '/support')}
                      className="group flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-all whitespace-nowrap w-full"
                    >
                      <HelpCircle className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors flex-shrink-0" />
                      <span>Help & Support Assistant</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile 1:1 Epic Games Mobile Ecosystem Drawer */}
            {isEcosystemOpen && mounted && typeof document !== 'undefined' && createPortal(
              <div className="fixed inset-0 z-[99999] bg-[#121212] flex flex-col md:hidden select-none animate-in fade-in duration-150">
                {/* Top Header Bar matching Epic Games Mobile Drawer */}
                <div className="h-[60px] px-5 flex items-center justify-between border-b border-white/[0.04] flex-shrink-0">
                  {/* Top Left: Logo with Up Arrow */}
                  <button
                    type="button"
                    onClick={() => setIsEcosystemOpen(false)}
                    className="flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
                    aria-label="Close Ecosystem Menu"
                  >
                    <LogoIcon size={44} />
                    <ChevronUp className="w-3.5 h-3.5 text-zinc-300" />
                  </button>

                  {/* Top Right: Clean Close X Button */}
                  <button
                    type="button"
                    onClick={() => setIsEcosystemOpen(false)}
                    className="w-10 h-10 -mr-2 flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    aria-label="Close Ecosystem Menu"
                  >
                    <X className="w-6 h-6 stroke-[2]" />
                  </button>
                </div>

                {/* Mobile Scrollable Menu Content */}
                <div className="flex-1 overflow-y-auto px-6 pt-6 pb-16 space-y-7">
                  {/* Big Brand Title like 'Epic Games' */}
                  <h2 className="text-[26px] font-bold text-white tracking-tight">Producer Toy</h2>

                  {/* Section 1: Play */}
                  <div className="space-y-3">
                    <h3 className="text-[13px] font-semibold text-zinc-400">Play</h3>
                    <div className="space-y-1">
                      <Link
                        href="/store/sounds"
                        prefetch={true}
                        onClick={(e) => handleDropdownNavigate(e, '/store/sounds')}
                        className="flex items-center gap-3.5 py-3 text-[15.5px] font-medium text-white hover:text-zinc-300 transition-colors"
                      >
                        <Music2 className="w-5 h-5 text-white flex-shrink-0" />
                        <span>Sample Packs</span>
                      </Link>

                      <Link
                        href="/store/vst-plugins"
                        prefetch={true}
                        onClick={(e) => handleDropdownNavigate(e, '/store/vst-plugins')}
                        className="flex items-center gap-3.5 py-3 text-[15.5px] font-medium text-white hover:text-zinc-300 transition-colors"
                      >
                        <Cpu className="w-5 h-5 text-white flex-shrink-0" />
                        <span>VST Plugins</span>
                      </Link>

                      <Link
                        href="/store/presets"
                        prefetch={true}
                        onClick={(e) => handleDropdownNavigate(e, '/store/presets')}
                        className="flex items-center gap-3.5 py-3 text-[15.5px] font-medium text-white hover:text-zinc-300 transition-colors"
                      >
                        <Sparkles className="w-5 h-5 text-white flex-shrink-0" />
                        <span>Synth Presets</span>
                      </Link>
                    </div>
                  </div>

                  {/* Section 2: Discover */}
                  <div className="space-y-3">
                    <h3 className="text-[13px] font-semibold text-zinc-400">Discover</h3>
                    <div className="space-y-1">
                      <Link
                        href="/store"
                        prefetch={true}
                        onClick={(e) => handleDropdownNavigate(e, '/store')}
                        className="flex items-center gap-3.5 py-3 text-[15.5px] font-medium text-white hover:text-zinc-300 transition-colors"
                      >
                        <ShoppingBag className="w-5 h-5 text-white flex-shrink-0" />
                        <span>Producer Toy Store</span>
                      </Link>

                      <Link
                        href="/store?price=free"
                        prefetch={true}
                        onClick={(e) => handleDropdownNavigate(e, '/store?price=free')}
                        className="flex items-center justify-between py-3 text-[15.5px] font-medium text-white hover:text-zinc-300 transition-colors"
                      >
                        <div className="flex items-center gap-3.5">
                          <Gift className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                          <span>Free Producer Toys</span>
                        </div>
                        <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/10 text-zinc-300 border border-white/10">
                          Free
                        </span>
                      </Link>
                    </div>
                  </div>

                  {/* Section 3: Create */}
                  <div className="space-y-3">
                    <h3 className="text-[13px] font-semibold text-zinc-400">Create</h3>
                    <div className="space-y-1">
                      <Link
                        href="/distribute"
                        prefetch={true}
                        onClick={(e) => handleDropdownNavigate(e, '/distribute')}
                        className="flex items-center gap-3.5 py-3 text-[15.5px] font-medium text-white hover:text-zinc-300 transition-colors"
                      >
                        <Upload className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                        <span>Distribute on Producer Toy</span>
                      </Link>

                      <Link
                        href="/account"
                        prefetch={true}
                        onClick={(e) => handleDropdownNavigate(e, '/account')}
                        className="flex items-center gap-3.5 py-3 text-[15.5px] font-medium text-white hover:text-zinc-300 transition-colors"
                      >
                        <Users className="w-5 h-5 text-white flex-shrink-0" />
                        <span>Creator Dashboard</span>
                      </Link>

                      <Link
                        href="/distribute"
                        prefetch={true}
                        onClick={(e) => handleDropdownNavigate(e, '/distribute')}
                        className="flex items-center gap-3.5 py-3 text-[15.5px] font-medium text-white hover:text-zinc-300 transition-colors"
                      >
                        <Radio className="w-5 h-5 text-white flex-shrink-0" />
                        <span>Publish Your Music Packs</span>
                      </Link>

                      <Link
                        href="/contact?topic=creator"
                        prefetch={true}
                        onClick={(e) => handleDropdownNavigate(e, '/contact?topic=creator')}
                        className="flex items-center gap-3.5 py-3 text-[15.5px] font-medium text-white hover:text-zinc-300 transition-colors"
                      >
                        <MessageSquare className="w-5 h-5 text-white flex-shrink-0" />
                        <span>Developer Forums</span>
                      </Link>

                      <Link
                        href="/licensing"
                        prefetch={true}
                        onClick={(e) => handleDropdownNavigate(e, '/licensing')}
                        className="flex items-center gap-3.5 py-3 text-[15.5px] font-medium text-white hover:text-zinc-300 transition-colors"
                      >
                        <ShieldCheck className="w-5 h-5 text-white flex-shrink-0" />
                        <span>Licensing & Terms</span>
                      </Link>

                      <Link
                        href="/blog"
                        prefetch={true}
                        onClick={(e) => handleDropdownNavigate(e, '/blog')}
                        className="flex items-center gap-3.5 py-3 text-[15.5px] font-medium text-white hover:text-zinc-300 transition-colors"
                      >
                        <BookOpen className="w-5 h-5 text-white flex-shrink-0" />
                        <span>Creator Academy & Guides</span>
                      </Link>

                      <Link
                        href="/support"
                        prefetch={true}
                        onClick={(e) => handleDropdownNavigate(e, '/support')}
                        className="flex items-center gap-3.5 py-3 text-[15.5px] font-medium text-white hover:text-zinc-300 transition-colors"
                      >
                        <HelpCircle className="w-5 h-5 text-white flex-shrink-0" />
                        <span>Help & Support Assistant</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>,
              document.body
            )}
          </div>

          {/* Left Navigation: Site Variant (News/FAQ/Help/About/Blog) vs Main Store */}
          {isSiteVariant ? (
            <div className="hidden md:flex items-center gap-5 lg:gap-6 ml-0">
              <Link
                href="/"
                prefetch={true}
                className="text-zinc-300 hover:text-white text-[15px] font-medium transition-colors"
              >
                Store
              </Link>

              <Link
                href="/news"
                prefetch={true}
                className={`text-[15px] font-medium transition-colors ${
                  pathname?.startsWith('/news') ? 'text-white font-bold' : 'text-zinc-300 hover:text-white'
                }`}
              >
                News
              </Link>

              <Link
                href="/faq"
                prefetch={true}
                className={`text-[15px] font-medium transition-colors ${
                  pathname?.startsWith('/faq') ? 'text-white font-bold' : 'text-zinc-300 hover:text-white'
                }`}
              >
                FAQ
              </Link>

              <Link
                href="/support"
                prefetch={true}
                className={`text-[15px] font-medium transition-colors ${
                  pathname?.startsWith('/support') || pathname?.startsWith('/help') ? 'text-white font-bold' : 'text-zinc-300 hover:text-white'
                }`}
              >
                Help
              </Link>

              {/* About Dropdown with Hover */}
              <div
                className="relative"
                ref={aboutMenuRef}
                onMouseEnter={handleMouseEnterAbout}
                onMouseLeave={handleMouseLeaveAbout}
              >
                <button
                  type="button"
                  onClick={() => setIsAboutOpen(!isAboutOpen)}
                  className={`flex items-center gap-1.5 text-[15px] font-medium cursor-pointer transition-colors ${
                    isAboutOpen
                      ? 'text-white'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                  aria-label="About Menu"
                >
                  <span>About Us</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isAboutOpen ? 'rotate-180 text-white' : 'text-zinc-400'}`} />
                </button>

                {isAboutOpen && (
                  <div className="absolute left-0 top-full mt-2 w-[220px] bg-[#18181c] border border-white/10 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-[100] animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-0.5 select-none before:content-[''] before:absolute before:-top-3 before:inset-x-0 before:h-3">
                    <Link
                      href="/about"
                      prefetch={true}
                      onClick={(e) => handleDropdownNavigate(e, '/about')}
                      className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors block text-left whitespace-nowrap"
                    >
                      About Us
                    </Link>
                    <Link
                      href="/distribute"
                      prefetch={true}
                      onClick={(e) => handleDropdownNavigate(e, '/distribute')}
                      className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors block text-left whitespace-nowrap"
                    >
                      Distribute
                    </Link>
                    <Link
                      href="/licensing"
                      prefetch={true}
                      onClick={(e) => handleDropdownNavigate(e, '/licensing')}
                      className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors block text-left whitespace-nowrap"
                    >
                      Licensing
                    </Link>
                    <Link
                      href="/contact"
                      prefetch={true}
                      onClick={(e) => handleDropdownNavigate(e, '/contact')}
                      className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors block text-left whitespace-nowrap"
                    >
                      Contact &amp; Grievance
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // EXISTING STORE NAVIGATION - 100% UNTOUCHED!
            <>
              <Link
                href="/"
                prefetch={true}
                className="text-white font-bold text-[19px] sm:text-[21px] lg:text-[22px] tracking-wide uppercase font-sans hover:text-zinc-200 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] leading-none select-none flex-shrink-0"
              >
                STORE
              </Link>

              <Link
                href="/support"
                prefetch={true}
                className="hidden md:block text-zinc-300 hover:text-white text-[15px] font-medium transition-colors ml-6 lg:ml-8"
              >
                Support
              </Link>

              {/* Distribute Dropdown with Hover */}
              <div
                className="relative hidden lg:block ml-6 lg:ml-8"
                ref={distributeMenuRef}
                onMouseEnter={handleMouseEnterDistribute}
                onMouseLeave={handleMouseLeaveDistribute}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsDistributeOpen(!isDistributeOpen)
                    setIsEcosystemOpen(false)
                  }}
                  className={`flex items-center gap-1.5 text-[15px] font-medium cursor-pointer transition-colors ${
                    isDistributeOpen
                      ? 'text-white'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                  aria-label="Distribute Menu"
                >
                  <span>Distribute</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDistributeOpen ? 'rotate-180 text-white' : 'text-zinc-400'}`} />
                </button>

                {/* Distribute Dropdown Menu */}
                {isDistributeOpen && (
                  <div className="absolute left-0 top-full mt-2 w-[240px] bg-[#18181c] border border-white/10 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-[100] animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-0.5 select-none before:content-[''] before:absolute before:-top-3 before:inset-x-0 before:h-3">
                    <Link
                      href="/distribute"
                      prefetch={true}
                      onClick={(e) => handleDropdownNavigate(e, '/distribute')}
                      className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors block text-left whitespace-nowrap"
                    >
                      Distribute on Producer Toy
                    </Link>
                    <Link
                      href="/contact?topic=creator"
                      prefetch={true}
                      onClick={(e) => handleDropdownNavigate(e, '/contact?topic=creator')}
                      className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors block text-left whitespace-nowrap"
                    >
                      Developer Forums
                    </Link>
                    <Link
                      href="/licensing"
                      prefetch={true}
                      onClick={(e) => handleDropdownNavigate(e, '/licensing')}
                      className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors block text-left whitespace-nowrap"
                    >
                      Documentation
                    </Link>
                    <Link
                      href="/blog"
                      prefetch={true}
                      onClick={(e) => handleDropdownNavigate(e, '/blog')}
                      className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors block text-left whitespace-nowrap"
                    >
                      Learning
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right Section Desktop (Exact 1:1 PC Screenshot Match) */}
        <div className="hidden md:flex items-center gap-6">

          {/* Desktop Search Input (Matching Screenshot 2 on site pages) */}
          {isSiteVariant && (
            <form onSubmit={handleDesktopSearch} className="relative flex items-center">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search"
                value={desktopSearchQuery}
                onChange={(e) => setDesktopSearchQuery(e.target.value)}
                className="bg-[#202024] hover:bg-[#28282c] focus:bg-[#28282c] border border-white/10 rounded-full pl-9 pr-7 py-1.5 text-xs text-white placeholder-zinc-400 focus:outline-none w-[160px] lg:w-[200px] transition-all focus:border-[#0084FF]"
              />
              {desktopSearchQuery && (
                <button
                  type="button"
                  onClick={() => setDesktopSearchQuery('')}
                  className="absolute right-2.5 text-zinc-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          )}

          {/* Globe Language / Region Selector Trigger (Exact 1:1 Epic Games Match) */}
          <div className="relative" ref={globeMenuRef}>
            <button
              type="button"
              onClick={() => setIsGlobeMenuOpen(!isGlobeMenuOpen)}
              className={`p-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer ${isGlobeMenuOpen ? 'text-white bg-[#222222]' : 'text-zinc-400 hover:text-white hover:bg-[#1a1a1a]'
                }`}
              title={`Select Region & Currency (Current: ${region?.name || 'India'} - ${currency})`}
              aria-label="Select Region and Currency"
            >
              <img
                src={region?.id === 'IN' ? '/icons/region-india.webp' : '/icons/region-international.webp'}
                alt={region?.name || 'Region'}
                width={20}
                height={20}
                className="w-5 h-5 object-contain"
                loading="eager"
                decoding="async"
              />
            </button>

            {/* Compact Region / Currency Dropdown Menu */}
            {isGlobeMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-[205px] bg-[#181818] border border-[#282828] rounded-xl shadow-2xl p-1 z-[100] animate-in fade-in zoom-in-95 duration-100 space-y-0.5">
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
                      className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors text-left cursor-pointer ${isSelected
                        ? 'bg-[#252525] text-white font-medium'
                        : 'text-zinc-300 hover:text-white hover:bg-[#202020]'
                        }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={r.iconUrl || (r.id === 'IN' ? '/icons/region-india.webp' : '/icons/region-international.webp')}
                          alt={r.name}
                          width={18}
                          height={18}
                          className="w-[18px] h-[18px] object-contain flex-shrink-0"
                          loading="eager"
                          decoding="async"
                        />
                        <span className="truncate">{r.name}</span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        <span className="text-[10.5px] text-zinc-400 font-mono">
                          {r.currency} ({r.symbol})
                        </span>
                        {isSelected ? (
                          <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </button>
                  )
                })}
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
                      onClick={(e) => handleDropdownNavigate(e, '/library')}
                      className="flex items-center gap-3 px-3 py-2 text-[13px] text-zinc-300 hover:text-white hover:bg-[#222222] rounded-lg transition-colors"
                    >
                      <Trophy className="w-4 h-4 text-zinc-400" />
                      <span>My Achievements</span>
                    </Link>

                    {/* TOYWARDS FEATURE (Commented out for future launch)
                    <Link
                      href="/account?tab=rewards"
                      prefetch={true}
                      onClick={(e) => handleDropdownNavigate(e, '/account?tab=rewards')}
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
                      onClick={(e) => handleDropdownNavigate(e, '/gifts')}
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
                      onClick={(e) => handleDropdownNavigate(e, '/store?on_sale=true')}
                      className="flex items-center gap-3 px-3 py-2 text-[13px] text-zinc-300 hover:text-white hover:bg-[#222222] rounded-lg transition-colors"
                    >
                      <Tag className="w-4 h-4 text-zinc-400" />
                      <span>Coupons</span>
                    </Link>

                    <Link
                      href="/account?tab=redeem"
                      prefetch={true}
                      onClick={(e) => handleDropdownNavigate(e, '/account?tab=redeem')}
                      className="flex items-center gap-3 px-3 py-2 text-[13px] text-zinc-300 hover:text-white hover:bg-[#222222] rounded-lg transition-colors"
                    >
                      <Key className="w-4 h-4 text-zinc-400" />
                      <span>Redeem Code</span>
                    </Link>

                    <Link
                      href="/wishlist"
                      prefetch={true}
                      onClick={(e) => handleDropdownNavigate(e, '/wishlist')}
                      className="flex items-center gap-3 px-3 py-2 text-[13px] text-zinc-300 hover:text-white hover:bg-[#222222] rounded-lg transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-zinc-400" />
                      <span>Wishlist</span>
                    </Link>

                    <Link
                      href="/support"
                      prefetch={true}
                      onClick={(e) => handleDropdownNavigate(e, '/support')}
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
                      onClick={(e) => handleDropdownNavigate(e, '/account')}
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
          ) : null}

          {/* Primary Action Button: Dynamic Sign In (if guest) or Library (if logged in) in brand secondary orange */}
          <Link
            href={user ? "/library" : "/auth"}
            prefetch={true}
            className="bg-[#0084FF] hover:bg-[#006fe6] text-white font-bold text-xs sm:text-sm px-5 py-2 sm:py-2.5 rounded-xl active:scale-95 transition-all shadow-md shadow-[#0084FF]/20 flex items-center justify-center cursor-pointer tracking-tight"
          >
            {user ? 'Library' : 'Sign In'}
          </Link>

        </div>

        {/* Mobile Right Controls: Exact Epic Games Screenshot Match */}
        <div className="flex md:hidden items-center gap-2">
          {isMobileMenuOpen ? (
            <button
              onClick={onToggleMobileMenu}
              className="w-10 h-10 flex items-center justify-center text-white hover:text-zinc-300 transition-colors focus:outline-none cursor-pointer"
              aria-label="Close Navigation Menu"
            >
              <X className="w-6 h-6 stroke-[2.2] animate-in zoom-in-75 duration-200" />
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href={user ? "/library" : "/auth"}
                prefetch={true}
                className="bg-[#0084FF] hover:bg-[#006fe6] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg active:scale-95 transition-all shadow-xs flex items-center justify-center tracking-tight"
              >
                {user ? 'Library' : 'Sign In'}
              </Link>

              <button
                onClick={onToggleMobileMenu}
                className="w-9 h-9 flex items-center justify-center text-white hover:text-zinc-300 transition-colors focus:outline-none cursor-pointer"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-7 h-7 stroke-[2.2] animate-in zoom-in-75 duration-200" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
