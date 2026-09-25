'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useFreeCategories } from './freeCategoryData'

interface FreeMegaMenuProps {
  isOpen: boolean
  onClose: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export const FreeMegaMenu: React.FC<FreeMegaMenuProps> = ({
  isOpen,
  onClose,
  onMouseEnter,
  onMouseLeave,
}) => {
  const { categories } = useFreeCategories()
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('')

  if (!isOpen) return null

  const currentCategory =
    categories.find((c) => c.slug === activeCategorySlug) ||
    categories[0]

  const categoryLabel = currentCategory?.name || 'Free Soundware'

  return (
    <div
      className="absolute top-full left-0 w-full bg-[#121212] shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 border-b border-[#202020]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave || onClose}
    >
      <div className="max-w-7xl mx-auto px-8 py-8 flex gap-12">
        {categories.length === 0 ? (
          <div className="w-full text-center py-10">
            <p className="text-zinc-400 text-sm mb-3">No free downloads currently available.</p>
            <Link
              href="/store"
              onClick={onClose}
              className="text-xs font-bold text-[#FA742B] hover:underline"
            >
              Browse All Store Products &rarr;
            </Link>
          </div>
        ) : (
          <>
            {/* Left Side Category Navigation Tabs */}
            <div className="w-56 flex flex-col gap-1 border-r border-[#202020] pr-6">
              {categories.map((cat) => {
                const isActive = (currentCategory?.slug || '') === cat.slug
                return (
                  <button
                    key={cat.id}
                    onMouseEnter={() => setActiveCategorySlug(cat.slug)}
                    onClick={() => setActiveCategorySlug(cat.slug)}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-md text-sm font-semibold transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#262626] text-white font-bold'
                        : 'text-zinc-400 hover:text-white hover:bg-[#1a1a1a]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {isActive && <ChevronRight className="w-4 h-4 text-white" />}
                  </button>
                )
              })}
            </div>

            {/* Right Side Subcategory Links Grid */}
            <div className="flex-1">
              <div className="flex items-center justify-between border-b border-[#202020] pb-4 mb-6">
                <h3 className="text-white text-base font-bold tracking-wide uppercase">
                  {categoryLabel} Catalog
                </h3>
                {currentCategory?.exploreUrl && (
                  <Link
                    href={currentCategory.exploreUrl}
                    prefetch={true}
                    onClick={onClose}
                    className="text-xs font-semibold text-zinc-400 hover:text-white underline transition-colors"
                  >
                    Explore all {categoryLabel} →
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-4 gap-x-6 gap-y-2.5 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                {currentCategory?.subcategories.map((item, idx) => {
                  const isShowAll = item.name.startsWith('Show All')
                  return (
                    <Link
                      key={item.id || idx}
                      href={item.href}
                      prefetch={true}
                      onClick={onClose}
                      className={`text-sm transition-colors py-1 truncate block ${
                        isShowAll
                          ? 'text-white font-bold hover:underline'
                          : 'text-zinc-400 hover:text-white font-normal'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default FreeMegaMenu

