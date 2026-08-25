'use client'

import React, { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useCurrency } from '@/context/CurrencyContext'
import { useAuth } from '@/context/AuthContext'
import { TopBar } from './header/TopBar'
import { SubBar } from './header/SubBar'
import { MegaMenu } from './header/MegaMenu'
import { MobileDrawer } from './header/MobileDrawer'

export const Header: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { items, setIsCartOpen } = useCart()
  const { currency, setCurrency } = useCurrency()
  const { user, signOut } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isProductsMegaOpen, setIsProductsMegaOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnterMenu = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    setIsProductsMegaOpen(true)
  }

  const handleMouseLeaveMenu = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
    closeTimeoutRef.current = setTimeout(() => {
      setIsProductsMegaOpen(false)
    }, 250)
  }

  // Ultra-fast responsive scroll listener for 60fps performance
  useEffect(() => {
    let ticking = false

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScroll = window.scrollY
          setIsScrolled((prev) => {
            // Buffer threshold to prevent lag during fast scrolling
            if (!prev && currentScroll > 100) return true
            if (prev && currentScroll < 30) return false
            return prev
          })
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Hide Header completely on Auth page (placed after hooks to respect Rules of Hooks)
  if (pathname === '/auth' || pathname?.startsWith('/auth')) {
    return null
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/store?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/store')
    }
    setIsProductsMegaOpen(false)
    setIsMobileMenuOpen(false)
  }

  const toggleCurrency = () => {
    setCurrency(currency === 'INR' ? 'USD' : 'INR')
  }

  return (
    <>
      {/* Tier 1 Top Header Bar (Scrolls away naturally) */}
      <div className="w-full bg-[#121212] select-none">
        <TopBar
          currency={currency}
          onToggleCurrency={toggleCurrency}
          user={user}
          onSignOut={signOut}
          itemCount={items.length}
          onOpenCart={() => setIsCartOpen(true)}
          isMobileMenuOpen={isMobileMenuOpen}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
      </div>

      {/* Tier 2 Sub-Header Bar (Sticks to top-0 across entire page scroll) */}
      <header className="sticky top-0 z-50 w-full bg-[#121212] select-none">
        <SubBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearch}
          isScrolled={isScrolled}
          isProductsMegaOpen={isProductsMegaOpen}
          onMouseEnterProducts={handleMouseEnterMenu}
          onMouseLeaveProducts={handleMouseLeaveMenu}
        />

        {/* Desktop Products Mega Dropdown Overlay */}
        <MegaMenu
          isOpen={isProductsMegaOpen}
          onClose={() => setIsProductsMegaOpen(false)}
          onMouseEnter={handleMouseEnterMenu}
          onMouseLeave={handleMouseLeaveMenu}
        />

        {/* Mobile Touch-Friendly Drawer Navigation */}
        <MobileDrawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          currency={currency}
          onToggleCurrency={toggleCurrency}
          user={user}
        />
      </header>
    </>
  )
}
