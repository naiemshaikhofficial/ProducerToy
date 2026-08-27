import React, { Suspense } from 'react'
import { Metadata } from 'next'
import { CartPageClient } from './CartPageClient'

export const metadata: Metadata = {
  title: 'My Cart | ProducerToy',
  description: 'Review your selected plugins, sound kits, sample packs, and synth presets before instant checkout.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function CartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#121212]" />}>
      <CartPageClient />
    </Suspense>
  )
}
