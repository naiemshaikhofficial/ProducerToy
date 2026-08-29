import { Metadata } from 'next'
import { GiftsPageClient } from './GiftsPageClient'
import { getUserGiftsAction } from '@/actions/giftActions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Gifts | Producer Toy Store',
  description: 'View received and sent digital audio gifts, sound pack licenses, and plugin keys on ProducerToy.',
}

export default async function GiftsPage() {
  const result = await getUserGiftsAction().catch(() => ({ success: false, gifts: [] }))
  return <GiftsPageClient initialGifts={result.gifts || []} />
}
