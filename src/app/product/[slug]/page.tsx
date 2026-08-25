import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminClient } from '@/lib/supabase/admin'
import { EpicProductDetailClient } from './EpicProductDetailClient'
import { ArrowLeft } from 'lucide-react'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const cleanSlug = decodeURIComponent(slug).trim()
  const supabase = getAdminClient()

  const { data: product } = await supabase
    .from('products')
    .select('name, short_description, cover_image')
    .ilike('slug', cleanSlug)
    .eq('is_active', true)
    .single()

  if (!product) {
    return {
      title: 'Product Not Found | Producer Toy',
    }
  }

  return {
    title: `${product.name} | Producer Toy Store`,
    description: product.short_description || `Get ${product.name} on Producer Toy Store with instant direct download.`,
    openGraph: {
      title: product.name,
      description: product.short_description || undefined,
      images: product.cover_image ? [{ url: product.cover_image }] : [],
    },
  }
}

export default async function EpicProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const cleanSlug = decodeURIComponent(slug).trim()
  const supabase = getAdminClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, categories(name, slug), subcategories!subcategory_id(name, slug), brands!brand_id(name, slug, logo_url)')
    .ilike('slug', cleanSlug)
    .eq('is_active', true)
    .single()

  if (!product) {
    notFound()
  }

  return (
    <div className="max-w-[1240px] mx-auto px-6 sm:px-8 lg:px-12 py-4 space-y-4 text-white min-h-screen">
      {/* Main Epic Games Product Detail Client View */}
      <EpicProductDetailClient product={product} />
    </div>
  )
}
