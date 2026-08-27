import { getAdminClient } from '@/lib/supabase/admin'
import ManufacturersClient from './ManufacturersClient'
import { LocalDataCache } from '@/components/LocalDataCache'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { CollectionPageJsonLd } from '@/components/JsonLd'
import { Metadata } from 'next'

export const revalidate = 3600 // Cache for 1 hour

export const metadata: Metadata = generatePageMetadata({
  title: 'Audio Plugin Manufacturers & Brands — Producer Toy',
  description:
    'Browse VST plugins, sample toolkits, and virtual instruments from top music production brands including FabFilter, Arturia, Slate Digital, Native Instruments, Valhalla DSP & more.',
  path: '/manufacturers',
  keywords: [
    'Audio plugin manufacturers',
    'VST brands',
    'FabFilter plugins',
    'Arturia plugins',
    'Valhalla DSP',
    'Native Instruments',
    'Music software developers',
  ],
})

export default async function ManufacturersPage() {
  let brands: Array<{ id: string; name: string; slug: string; logo_url: string | null }> = []

  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from('brands')
      .select('id, name, slug, logo_url')
      .order('name', { ascending: true })

    if (!error && data) {
      brands = data
    }
  } catch (err) {
    console.error('Error fetching brands:', err)
  }

  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <ManufacturersClient initialBrands={brands} />
      <CollectionPageJsonLd
        title="Audio Plugin Manufacturers & Brands"
        description="Browse VST plugins, sample toolkits, and virtual instruments from top music production brands."
        url="https://producertoy.com/manufacturers"
        items={brands.map((b) => ({
          name: b.name,
          url: `https://producertoy.com/store?brand=${b.slug}`,
          image: b.logo_url || undefined,
        }))}
      />
      <LocalDataCache data={{ brands }} />
    </main>
  )
}

