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

  // Auto close mobile drawer & mega menu on route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsProductsMegaOpen(false)
  }, [pathname])

  // Freeze background scrolling completely when mobile menu drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      const originalBodyOverflow = document.body.style.overflow
      const originalHtmlOverflow = document.documentElement.style.overflow

      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'

      return () => {
        document.body.style.overflow = originalBodyOverflow
        document.documentElement.style.overflow = originalHtmlOverflow
      }
    }
  }, [isMobileMenuOpen])

  // Hide Header completely on Auth and Checkout pages (exact Epic Games screen lock)
  if (
    pathname === '/auth' ||
    pathname?.startsWith('/auth') ||
    pathname === '/checkout' ||
    pathname?.startsWith('/checkout')
  ) {
    return null
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/store?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      router.push('/')
    }
    setIsProductsMegaOpen(false)
    setIsMobileMenuOpen(false)
  }

  const toggleCurrency = () => {
    setCurrency(currency === 'INR' ? 'USD' : 'INR')
  }

  // Determine if current route is a shop/catalog browsing page
  const isShopPage =
    pathname === '/' ||
    pathname === '/store' ||
    pathname === '/cart' ||
    pathname === '/gifts' ||
    pathname === '/wishlist' ||
    pathname?.startsWith('/manufacturers') ||
    pathname?.startsWith('/categories') ||
    pathname?.startsWith('/product/') ||
    pathname?.startsWith('/p/') ||
    pathname?.startsWith('/brands') ||
    pathname?.startsWith('/blog')

  return (
    <>
      {/* Tier 1 Top Header Bar (Fixed when mobile menu is open, sticky/relative otherwise) */}
      <div
        className={`${isMobileMenuOpen
          ? 'fixed top-0 left-0 right-0 z-[60]'
          : isShopPage
            ? 'relative z-[60]'
            : 'sticky top-0 z-[60]'
          } w-full bg-[#121212] select-none border-none`}
      >
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

      {/* Tier 2 Sub-Header Bar (Only on store/catalog browsing pages) */}
      {isShopPage && (
        <header className="sticky top-0 z-50 w-full bg-[#121212] select-none">
          <SubBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={handleSearch}
            isScrolled={isScrolled}
            isProductsMegaOpen={isProductsMegaOpen}
            onMouseEnterProducts={handleMouseEnterMenu}
            onMouseLeaveProducts={handleMouseLeaveMenu}
            itemCount={items.length}
            onOpenCart={() => setIsCartOpen(true)}
          />

          {/* Desktop Products Mega Dropdown Overlay */}
          <MegaMenu
            isOpen={isProductsMegaOpen}
            onClose={() => setIsProductsMegaOpen(false)}
            onMouseEnter={handleMouseEnterMenu}
            onMouseLeave={handleMouseLeaveMenu}
          />
        </header>
      )}

      {/* Mobile Touch-Friendly Drawer Navigation (Available on all pages) */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currency={currency}
        onToggleCurrency={toggleCurrency}
        user={user}
        onSignOut={signOut}
      />
    </>
  )
}
