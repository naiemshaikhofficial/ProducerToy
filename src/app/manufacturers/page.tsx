import { getAdminClient } from '@/lib/supabase/admin'
import ManufacturersClient from './ManufacturersClient'
import { LocalDataCache } from '@/components/LocalDataCache'

export const metadata = {
  title: 'Audio Plugin Manufacturers & Brands | ProducerToy',
  description: 'Browse VST plugins, sample toolkits, and virtual instruments from 300+ top music production brands including FabFilter, Arturia, Slate Digital, Native Instruments & more.',
}

export const revalidate = 3600 // Cache for 1 hour

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
      <LocalDataCache data={{ brands }} />
    </main>
  )
}
