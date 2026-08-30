'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useCurrency } from '@/context/CurrencyContext'

interface RelatedProduct {
  id: string
  name: string
  slug: string
  price_usd: number
  price_inr?: number
  cover_image: string
  product_type?: string
  brand?: string
  brands?: { name: string }
}

export function RelatedProductsSection({
  currentProductId,
  currentProductSlug,
  currentProductType,
  categorySlugs = [],
  brandName = 'Producer Toy',
}: {
  currentProductId: string
  currentProductSlug: string
  currentProductType?: string
  categorySlugs?: string[]
  brandName?: string
}) {
  const [products, setProducts] = useState<RelatedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const { formatPrice } = useCurrency()

  useEffect(() => {
    async function loadRelated() {
      try {
        const supabase = createClient()
        let query = supabase
          .from('products')
          .select('id, name, slug, price_usd, price_inr, cover_image, product_type, brands!brand_id(name)')
          .eq('is_active', true)
          .neq('id', currentProductId)
          .limit(4)

        if (currentProductType) {
          query = query.eq('product_type', currentProductType)
        }

        const { data, error } = await query

        if (!error && data && data.length > 0) {
          setProducts(data as any[])
        } else {
          // Fallback query if no exact type match
          const { data: fallbackData } = await supabase
            .from('products')
            .select('id, name, slug, price_usd, price_inr, cover_image, product_type, brands!brand_id(name)')
            .eq('is_active', true)
            .neq('id', currentProductId)
            .limit(4)

          if (fallbackData) setProducts(fallbackData as any[])
        }
      } catch (err) {
        console.error('Error loading related products:', err)
      } finally {
        setLoading(false)
      }
    }

    loadRelated()
  }, [currentProductId, currentProductType])

  if (!loading && products.length === 0) return null

  return (
    <div className="space-y-6 pt-14 sm:pt-18 border-t border-[#202020] select-none">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Similar & Recommended Plugins
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            More tools and sounds curated for your production workflow.
          </p>
        </div>
        <Link
          href="/store"
          className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          View All Store →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 lg:gap-7 pt-2">
        {products.map((item) => {
          const itemBrand = item.brands?.name || item.brand || brandName
          const isFree = Number(item.price_usd) === 0

          return (
            <Link
              key={item.id}
              href={`/product/${item.slug}`}
              prefetch={true}
              className="group flex flex-col cursor-pointer"
              title={`${item.name} by ${itemBrand}`}
            >
              <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-[#181818] border border-[#262626] mb-3 shadow-md">
                <Image
                  src={item.cover_image || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600&auto=format&fit=crop'}
                  alt={`${item.name} by ${itemBrand}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover group-hover:brightness-110 transition-all duration-200"
                />
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                  {itemBrand}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-zinc-200 line-clamp-1">
                  {item.name}
                </h4>
                <div className="text-xs font-bold text-zinc-300 pt-0.5">
                  {isFree ? (
                    <span className="text-[#FA742B]">FREE</span>
                  ) : (
                    formatPrice(item.price_inr, item.price_usd)
                  )}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
