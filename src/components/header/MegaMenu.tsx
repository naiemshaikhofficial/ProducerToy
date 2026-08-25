'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { clientCache } from '@/lib/clientCache'
import { categoryData } from './categoryData'

interface SubCategoryItem {
  id: string
  name: string
  slug: string
}

interface CategoryItem {
  id: string
  name: string
  slug: string
  subcategories: SubCategoryItem[]
}

interface MegaMenuProps {
  isOpen: boolean
  onClose: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

// Pre-seeded DB categories for instant 0ms glitch-free initial render
const INITIAL_CATEGORIES: CategoryItem[] = Object.keys(categoryData).map((key) => {
  const cat = categoryData[key]
  return {
    id: key,
    name: cat.label,
    slug: cat.slug,
    subcategories: cat.items
      .filter((item) => item.slug !== '')
      .map((item, idx) => ({
        id: `${key}-${idx}`,
        name: item.name,
        slug: item.slug,
      })),
  }
})

export const MegaMenu: React.FC<MegaMenuProps> = ({ 
  isOpen, 
  onClose,
  onMouseEnter,
  onMouseLeave 
}) => {
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = clientCache.get<CategoryItem[]>('mega_menu_categories')
      if (cached && cached.length > 0) return cached
    }
    return INITIAL_CATEGORIES
  })

  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('effects')

  // Background fetch to ensure real-time DB sync without any UI flickering
  useEffect(() => {
    async function syncCategories() {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data } = await supabase
          .from('categories')
          .select('id, name, slug, sort_order, subcategories(id, name, slug, sort_order)')
          .order('sort_order', { ascending: true })

        if (data && data.length > 0) {
          const formatted: CategoryItem[] = data.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            subcategories: (cat.subcategories || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0)),
          }))
          setCategoriesList(formatted)
          clientCache.set('mega_menu_categories', formatted, 30 * 60 * 1000) // 30 min cache
        }
      } catch (err) {
        console.warn('MegaMenu DB background sync skipped:', err)
      }
    }

    syncCategories()
  }, [])

  if (!isOpen) return null

  const currentCategory = categoriesList.find((c) => c.slug === activeCategorySlug) || categoriesList[0]
  const categoryLabel = currentCategory?.name || 'Category'
  const categorySlug = currentCategory?.slug || 'effects'

  const subItems = [
    { name: 'Show All', href: `/store/${categorySlug}` },
    ...(currentCategory?.subcategories.map((sub) => ({
      name: sub.name,
      href: `/store/${categorySlug}/${sub.slug}`
    })) || [])
  ]

  return (
    <div 
      className="absolute top-full left-0 w-full bg-[#121212] shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 border-b border-[#222228]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave || onClose}
    >
      <div className="max-w-7xl mx-auto px-8 py-8 flex gap-12">
        
        {/* Left Side Category Navigation Tabs */}
        <div className="w-56 flex flex-col gap-1 border-r border-[#222228] pr-6">
          {categoriesList.map((cat) => {
            const isActive = activeCategorySlug === cat.slug
            return (
              <button
                key={cat.id}
                onMouseEnter={() => setActiveCategorySlug(cat.slug)}
                onClick={() => setActiveCategorySlug(cat.slug)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-md text-sm font-semibold transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-zinc-800 text-white font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
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
          <div className="flex items-center justify-between border-b border-[#222228] pb-4 mb-6">
            <h3 className="text-white text-base font-bold tracking-wide uppercase">
              {categoryLabel} Catalog
            </h3>
            <Link 
              href={`/store/${categorySlug}`} 
              prefetch={true}
              onClick={onClose}
              className="text-xs font-semibold text-zinc-400 hover:text-white underline transition-colors"
            >
              Explore all {categoryLabel} →
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-x-6 gap-y-2.5 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
            {subItems.map((item, idx) => {
              const isShowAll = item.name === 'Show All'
              return (
                <Link
                  key={idx}
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

      </div>
    </div>
  )
}
