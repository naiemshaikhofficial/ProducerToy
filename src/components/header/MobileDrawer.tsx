'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, Globe, User, LogOut } from 'lucide-react'
import { categoryData, CategoryKey } from './categoryData'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  currency: string
  onToggleCurrency: () => void
  user: any
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  currency,
  onToggleCurrency,
  user
}) => {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [mobileExpandedCat, setMobileExpandedCat] = useState<CategoryKey | null>(null)

  if (!isOpen) return null

  const toggleAccordion = (catKey: CategoryKey) => {
    setMobileExpandedCat(mobileExpandedCat === catKey ? null : catKey)
  }

  return (
    <div className="fixed inset-0 top-[60px] sm:top-[72px] z-50 bg-[#121212] flex flex-col md:hidden animate-in slide-in-from-right duration-200 overflow-y-auto">
      <div className="p-6 flex flex-col gap-6 flex-1">
        
        {/* Top Controls Row: Globe Currency Toggle + Sign In / User Pill */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onToggleCurrency}
            className="p-2 text-zinc-300 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
            title="Toggle Currency"
          >
            <Globe className="w-5 h-5" />
            <span>{currency}</span>
          </button>

          {user ? (
            <Link
              href="/library"
              prefetch={true}
              onClick={onClose}
              className="bg-[#26262c] hover:bg-[#32323a] text-white text-xs font-semibold px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>{(user.email || 'Account').split('@')[0]}</span>
            </Link>
          ) : (
            <Link
              href="/auth"
              prefetch={true}
              onClick={onClose}
              className="bg-[#26262c] hover:bg-[#32323a] text-white text-xs font-semibold px-3.5 py-1.5 rounded-md transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Big Bold "Menu" Header (Exact Image 1 Match) */}
        <h2 className="text-3xl font-black text-white tracking-tight">
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
        <div className="mt-4 pt-5 border-t border-[#222226]">
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
                  <div key={key} className="border-b border-[#202025] pb-2">
                    <button
                      onClick={() => toggleAccordion(key)}
                      className="w-full flex items-center justify-between py-2 text-sm font-semibold text-zinc-300 hover:text-white transition-colors"
                    >
                      <span>{cat.label}</span>
                      <ChevronDown className={`w-3.5 h-3.5 text-zinc-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                    {isExpanded && (
                      <div className="pl-3 py-1 flex flex-col gap-1.5 bg-[#18181c] rounded-md my-1">
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
        <div className="mt-auto pt-6 border-t border-[#222226]">
          <Link
            href={user ? "/library" : "/auth"}
            prefetch={true}
            onClick={onClose}
            className="bg-[#222226] hover:bg-[#2c2c32] text-white text-center font-bold text-sm py-3.5 rounded-xl transition-colors block shadow-md"
          >
            {user ? "Go to My Library" : "Sign In to ProducerToy"}
          </Link>
        </div>

      </div>
    </div>
  )
}
