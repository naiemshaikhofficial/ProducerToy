import { Metadata } from 'next'
import { GiftsPageClient } from './GiftsPageClient'

export const metadata: Metadata = {
  title: 'Gifts | Producer Toy Store',
  description: 'View received and sent digital audio gifts, sound pack licenses, and plugin keys on ProducerToy.',
}

export default function GiftsPage() {
  return <GiftsPageClient />
}
