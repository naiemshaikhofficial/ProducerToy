'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, Menu, X, LogOut, User } from 'lucide-react'
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
  return (
    <div className="w-full bg-[#121212]">
      <div className="w-full max-w-[1600px] mx-auto px-6 md:px-10 lg:px-16 h-[72px] flex items-center justify-between">
        
        {/* Left Section: Epic Style Logo + Store Name + Support/Distribute */}
        <div className="flex items-center gap-4 sm:gap-8">
          <Link href="/" prefetch={true} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <LogoIcon size={38} />
            <ChevronDown className="w-4 h-4 text-zinc-400 hidden sm:block" />
          </Link>

          <Link 
            href="/store" 
            prefetch={true}
            className="text-white font-black text-base sm:text-lg tracking-widest uppercase font-sans hover:text-zinc-200 transition-colors"
          >
            STORE
          </Link>

          <Link 
            href="/library" 
            prefetch={true}
            className="text-zinc-300 hover:text-white text-sm font-semibold transition-colors uppercase tracking-wider"
          >
            LIBRARY
          </Link>

          <Link 
            href="/store" 
            prefetch={true}
            className="hidden md:block text-[#cccccc] hover:text-white text-sm font-medium transition-colors"
          >
            Support
          </Link>

          <div className="hidden lg:flex items-center gap-1.5 text-[#cccccc] hover:text-white text-sm font-medium cursor-pointer transition-colors">
            <span>Distribute</span>
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          </div>
        </div>

        {/* Right Section Desktop: Cart Icon Only, Account/Logout Icon */}
        <div className="hidden md:flex items-center gap-3.5">

          {/* Cart Icon Only Button */}
          <button
            onClick={onOpenCart}
            className="relative p-2.5 bg-[#26262c] hover:bg-[#32323a] text-white rounded-[8px] transition-colors flex items-center justify-center cursor-pointer"
            title="Shopping Cart"
          >
            <Image
              src="/icons8-cart-96.png"
              alt="Cart"
              width={20}
              height={20}
              className="w-5 h-5 object-contain filter brightness-0 invert"
            />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-[#FC6301] text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#121212]">
                {itemCount}
              </span>
            )}
          </button>

          {/* Account / Logout Button */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/library"
                prefetch={true}
                className="w-9 h-9 rounded-full bg-[#FC6301] text-white font-black text-xs flex items-center justify-center uppercase shadow-md hover:opacity-90 transition-opacity"
                title={`Account: ${user.email}`}
              >
                {(user.email || 'U')[0].toUpperCase()}
              </Link>
              <button
                onClick={onSignOut}
                className="bg-[#26262c] hover:bg-[#e50914] text-zinc-300 hover:text-white border border-transparent text-xs font-semibold px-3 py-2 rounded-[6px] transition-all duration-200 flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/auth"
              prefetch={true}
              className="bg-[#26262c] hover:bg-[#32323a] text-white text-xs font-semibold px-4 py-2 rounded-[6px] transition-colors"
            >
              Sign in
            </Link>
          )}

        </div>

        {/* Mobile Right Controls */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={onOpenCart}
            className="relative p-2 text-white hover:text-zinc-300 transition-colors"
          >
            <Image
              src="/icons8-cart-96.png"
              alt="Cart"
              width={24}
              height={24}
              className="w-6 h-6 object-contain filter brightness-0 invert"
            />
            {itemCount > 0 && (
              <span className="absolute top-1 right-1 bg-white text-black text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>

          {user ? (
            <button
              onClick={onSignOut}
              className="bg-[#26262c] hover:bg-[#e50914] text-zinc-300 hover:text-white p-2 rounded-[6px] transition-all duration-200 flex items-center justify-center"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <Link 
              href="/auth" 
              prefetch={true}
              className="bg-[#26262c] hover:bg-[#32323a] text-white text-xs font-semibold px-3 py-1.5 rounded-[6px] transition-colors"
            >
              Sign in
            </Link>
          )}

          <button
            onClick={onToggleMobileMenu}
            className="p-2 text-white hover:text-zinc-300 transition-colors focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>
    </div>
  )
}
