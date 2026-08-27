import React from 'react'
import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { ContactClient } from './ContactClient'

export const metadata: Metadata = generatePageMetadata({
  title: 'Customer Care & Technical Support — Producer Toy',
  description:
    'Need help with your VST downloads, license keys, Toywards balance, or sound packs? Contact the Producer Toy 24/7 technical support team.',
  path: '/contact',
  keywords: [
    'Producer Toy support',
    'Customer care',
    'VST support',
    'License key help',
    'Toywards balance inquiry',
    'Producer Toy contact',
  ],
})

export default function ContactPage() {
  return <ContactClient />
}
