import { getAdminClient } from '@/lib/supabase/admin'
import ManufacturersClient from './ManufacturersClient'
import { LocalDataCache } from '@/components/LocalDataCache'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { ItemListJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd'
import { Metadata } from 'next'

export const revalidate = false // 🟢 Infinite edge cache

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
      <BreadcrumbJsonLd
        breadcrumbs={[
          { name: 'Home', url: 'https://producertoy.com' },
          { name: 'Manufacturers', url: 'https://producertoy.com/manufacturers' },
        ]}
      />
      <ItemListJsonLd
        name="Audio Plugin Manufacturers & Brands"
        description="Browse VST plugins, sample toolkits, and virtual instruments from top music production brands."
        itemListElement={brands.map((b, idx) => ({
          position: idx + 1,
          name: b.name,
          url: `https://producertoy.com/manufacturers/${b.slug}`,
          image: b.logo_url || 'https://producertoy.com/Icon.png',
          description: `Explore official audio plugins and virtual instruments by ${b.name}.`,
        }))}
      />
      <ManufacturersClient initialBrands={brands} />
      <LocalDataCache data={{ brands }} />
    </main>
  )
}

