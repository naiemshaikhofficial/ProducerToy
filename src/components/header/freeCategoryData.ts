'use client'

import { useState, useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { clientCache } from '@/lib/clientCache'

export interface FreeSubCategoryItem {
  id: string
  name: string
  slug: string
  href: string
}

export interface FreeCategoryItem {
  id: string
  name: string
  rawName: string
  slug: string
  exploreUrl: string
  subcategories: FreeSubCategoryItem[]
}

/**
 * Maps a category and subcategory slug to the corresponding ProducerToy store URL
 */
export function getFreeCategoryStoreUrl(categorySlug: string, subcategorySlug?: string): string {
  const normCat = (categorySlug || '').toLowerCase().trim()
  let basePath = '/store/sounds'

  if (
    normCat.includes('plugin') ||
    normCat.includes('vst') ||
    normCat.includes('effect') ||
    normCat.includes('instrument')
  ) {
    basePath = '/store/plugins'
  } else if (normCat.includes('preset')) {
    basePath = '/store/presets'
  } else if (normCat.includes('template')) {
    basePath = '/store/templates'
  } else if (
    normCat.includes('sound') ||
    normCat.includes('sample') ||
    normCat.includes('drum')
  ) {
    basePath = '/store/sounds'
  } else {
    basePath = `/store/${encodeURIComponent(normCat)}`
  }

  if (subcategorySlug) {
    return `${basePath}?price=free&cat=${encodeURIComponent(subcategorySlug)}`
  }
  return `${basePath}?price=free`
}

/**
 * Transforms raw Supabase free products data into clean category & subcategory structures
 */
export function formatFreeCategories(products: any[]): FreeCategoryItem[] {
  const catMap = new Map<
    string,
    {
      id: string
      name: string
      rawName: string
      slug: string
      sortOrder: number
      exploreUrl: string
      subcategoriesMap: Map<string, { id: string; name: string; slug: string; href: string; sortOrder: number }>
    }
  >()

  for (const p of products) {
    const cat = p.categories
    if (!cat || !cat.id) continue

    if (!catMap.has(cat.id)) {
      const exploreUrl = getFreeCategoryStoreUrl(cat.slug)
      const rawName = cat.name || 'Sample Pack'
      const displayName = rawName.toLowerCase().startsWith('free ')
        ? rawName
        : `Free ${rawName}`

      catMap.set(cat.id, {
        id: cat.id,
        name: displayName,
        rawName,
        slug: cat.slug,
        sortOrder: cat.sort_order ?? 99,
        exploreUrl,
        subcategoriesMap: new Map(),
      })
    }

    const catEntry = catMap.get(cat.id)!
    const sub = p.subcategories
    if (sub && sub.id && !catEntry.subcategoriesMap.has(sub.id)) {
      const subHref = getFreeCategoryStoreUrl(cat.slug, sub.slug)
      catEntry.subcategoriesMap.set(sub.id, {
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        href: subHref,
        sortOrder: sub.sort_order ?? 99,
      })
    }
  }

  const result: FreeCategoryItem[] = []
  for (const catEntry of catMap.values()) {
    const sortedSubs = Array.from(catEntry.subcategoriesMap.values()).sort(
      (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)
    )

    result.push({
      id: catEntry.id,
      name: catEntry.name,
      rawName: catEntry.rawName,
      slug: catEntry.slug,
      exploreUrl: catEntry.exploreUrl,
      subcategories: [
        {
          id: `all-${catEntry.id}`,
          name: `Show All ${catEntry.name}`,
          slug: '',
          href: catEntry.exploreUrl,
        },
        ...sortedSubs.map((s) => ({
          id: s.id,
          name: s.name,
          slug: s.slug,
          href: s.href,
        })),
      ],
    })
  }

  return result.sort((a, b) => a.name.localeCompare(b.name))
}

// Initial pre-seeded state for instant 0ms glitch-free initial render
export const INITIAL_FREE_CATEGORIES: FreeCategoryItem[] = [
  {
    id: 'a3333333-3333-3333-3333-333333333333',
    name: 'Free Sample Pack',
    rawName: 'Sample Pack',
    slug: 'sample-pack',
    exploreUrl: '/store/sounds?price=free',
    subcategories: [
      {
        id: 'all-sample-pack',
        name: 'Show All Free Sample Pack',
        slug: '',
        href: '/store/sounds?price=free',
      },
      {
        id: 'c321916e-5cf4-4855-be69-7405f19f1fae',
        name: 'Drill Sample Pack',
        slug: 'drill-sample-pack',
        href: '/store/sounds?price=free&cat=drill-sample-pack',
      },
    ],
  },
]

/**
 * Hook to manage free categories with client-side localStorage caching and background Supabase sync
 */
export function useFreeCategories() {
  const [categories, setCategories] = useState<FreeCategoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = clientCache.get<FreeCategoryItem[]>('free_mega_menu_categories')
      if (cached && cached.length > 0) return cached
    }
    return INITIAL_FREE_CATEGORIES
  })
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    async function syncFreeCategories() {
      try {
        const supabase = getSupabaseBrowserClient()
        const { data, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            price_usd,
            category_id,
            subcategory_id,
            categories:category_id (id, name, slug, sort_order),
            subcategories:subcategory_id (id, name, slug, sort_order)
          `)
          .eq('is_active', true)
          .lte('price_usd', 0)

        if (error) {
          console.warn('FreeCategories DB sync skipped:', error.message)
          return
        }

        if (data) {
          const formatted = formatFreeCategories(data)
          setCategories(formatted)
          if (formatted.length > 0) {
            clientCache.set('free_mega_menu_categories', formatted, 30 * 60 * 1000)
          }
        }
      } catch (err) {
        console.warn('FreeCategories background sync skipped:', err)
      } finally {
        setIsLoaded(true)
      }
    }

    syncFreeCategories()
  }, [])

  return { categories, isLoaded }
}
