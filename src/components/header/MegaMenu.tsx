'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { categoryData as fallbackCategoryData, CategoryKey } from './categoryData'

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

export const MegaMenu: React.FC<MegaMenuProps> = ({ 
  isOpen, 
  onClose,
  onMouseEnter,
  onMouseLeave 
}) => {
  const [dbCategories, setDbCategories] = useState<CategoryItem[]>([])
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>('effects')

  useEffect(() => {
    async function loadCategories() {
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
          setDbCategories(formatted)
          if (formatted.length > 0 && !formatted.some(c => c.slug === activeCategorySlug)) {
            setActiveCategorySlug(formatted[0].slug)
          }
        }
      } catch (err) {
        console.error('Failed to load categories from Supabase:', err)
      }
    }

    if (isOpen) {
      loadCategories()
    }
  }, [isOpen, activeCategorySlug])

  if (!isOpen) return null

  // Use DB categories if available, else fallback
  const isUsingDb = dbCategories.length > 0

  const currentCategory = isUsingDb
    ? dbCategories.find(c => c.slug === activeCategorySlug) || dbCategories[0]
    : null

  const fallbackKey = activeCategorySlug as CategoryKey
  const currentFallback = fallbackCategoryData[fallbackKey] || fallbackCategoryData['effects']

  const categoryLabel = isUsingDb ? currentCategory?.name : currentFallback?.label
  const categorySlug = isUsingDb ? currentCategory?.slug : fallbackKey

  const subItems = isUsingDb
    ? [
        { name: 'Show All', href: `/store/${categorySlug}` },
        ...(currentCategory?.subcategories.map(sub => ({
          name: sub.name,
          href: `/store/${categorySlug}/${sub.slug}`
        })) || [])
      ]
    : fallbackCategoryData[fallbackKey]?.items.map(item => ({
        name: item,
        href: item === 'Show All' ? `/store/${fallbackKey}` : `/store/${fallbackKey}/${encodeURIComponent(item.toLowerCase())}`
      })) || []

  return (
    <div 
      className="absolute top-full left-0 w-full bg-[#121212] shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave || onClose}
    >
      <div className="max-w-7xl mx-auto px-8 py-8 flex gap-12">
        
        {/* Left Side Category Navigation Tabs */}
        <div className="w-56 flex flex-col gap-1 border-r border-[#222228] pr-6">
          {isUsingDb ? (
            dbCategories.map((cat) => {
              const isActive = activeCategorySlug === cat.slug
              return (
                <button
                  key={cat.id}
                  onMouseEnter={() => setActiveCategorySlug(cat.slug)}
                  onClick={() => setActiveCategorySlug(cat.slug)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-md text-sm font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-zinc-800 text-white font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <span>{cat.name}</span>
                  {isActive && <ChevronRight className="w-4 h-4 text-white" />}
                </button>
              )
            })
          ) : (
            (Object.keys(fallbackCategoryData) as CategoryKey[]).map((key) => {
              const cat = fallbackCategoryData[key]
              const isActive = activeCategorySlug === key
              return (
                <button
                  key={key}
                  onMouseEnter={() => setActiveCategorySlug(key)}
                  onClick={() => setActiveCategorySlug(key)}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-md text-sm font-semibold transition-all text-left ${
                    isActive
                      ? 'bg-zinc-800 text-white font-bold'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                  }`}
                >
                  <span>{cat.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 text-white" />}
                </button>
              )
            })
          )}
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
