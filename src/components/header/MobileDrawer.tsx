'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Globe } from 'lucide-react'
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
  const [mobileExpandedCat, setMobileExpandedCat] = useState<CategoryKey | null>(null)

  if (!isOpen) return null

  const toggleAccordion = (catKey: CategoryKey) => {
    setMobileExpandedCat(mobileExpandedCat === catKey ? null : catKey)
  }

  return (
    <div className="fixed inset-0 top-[100px] z-40 bg-[#101014] flex flex-col md:hidden animate-in slide-in-from-right-full duration-200 overflow-y-auto">
      <div className="p-6 flex flex-col gap-6 flex-1">
        
        {/* Accordion Categories */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1">
            Categories
          </span>
          {(Object.keys(categoryData) as CategoryKey[]).map((key) => {
            const cat = categoryData[key]
            const isExpanded = mobileExpandedCat === key
            return (
              <div key={key} className="border-b border-[#202025] pb-2">
                <button
                  onClick={() => toggleAccordion(key)}
                  className="w-full flex items-center justify-between py-2 text-base font-semibold text-white hover:text-zinc-300 transition-colors"
                >
                  <span>{cat.label}</span>
                  <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
                {isExpanded && (
                  <div className="pl-4 py-2 flex flex-col gap-2 bg-[#18181c] rounded-md my-1">
                    {cat.items.map((item, idx) => (
                      <Link
                        key={idx}
                        href={item.slug === '' ? `/store/${cat.slug}` : `/store/${cat.slug}/${item.slug}`}
                        prefetch={true}
                        onClick={onClose}
                        className="text-sm text-zinc-400 hover:text-white py-1 block"
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

        {/* Quick Links */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 mt-2">
            Store Links
          </span>
          <Link href="/store?on_sale=true" prefetch={true} onClick={onClose} className="text-base font-semibold text-white py-1">
            🔥 Hot Deals
          </Link>
          <Link href="/store?free=true" prefetch={true} onClick={onClose} className="text-base font-semibold text-white py-1">
            🎁 Free Software & Packs
          </Link>
          <Link href="/manufacturers" prefetch={true} onClick={onClose} className="text-base font-semibold text-white py-1">
            🏷️ All Brands
          </Link>
          <Link href="/store" prefetch={true} onClick={onClose} className="text-base font-semibold text-white py-1">
            ⏳ Rent to Own
          </Link>
        </div>

        {/* Account & Settings */}
        <div className="mt-auto pt-6 border-t border-[#202025] flex flex-col gap-4">

          <Link
            href={user ? "/my-purchases" : "/auth"}
            prefetch={true}
            onClick={onClose}
            className="bg-[#262626] hover:bg-[#333333] text-white text-center font-bold text-sm py-3.5 rounded-lg transition-colors"
          >
            {user ? "Library & Purchases" : "Sign In / Create Account"}
          </Link>
        </div>

      </div>
    </div>
  )
}
