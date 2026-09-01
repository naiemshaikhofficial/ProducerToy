import React from 'react'
import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { SupportClient } from './SupportClient'

export const metadata: Metadata = generatePageMetadata({
  title: 'Help Center & Technical Support Desk — Producer Toy',
  description:
    'Instant assistance for VST plugins, serial key activation, DAW troubleshooting (FL Studio, Ableton, Logic Pro), download mirrors, tax invoices, and raising technical support tickets.',
  path: '/support',
  keywords: [
    'Producer Toy support',
    'Producer Toy help center',
    'raise support ticket',
    'track support ticket',
    'VST plugin troubleshooting',
    'license key help',
    'FL Studio VST3 rescan',
    'Ableton Live plugin support',
    'sample pack downloads',
  ],
})

export default function SupportPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Producer Toy Customer Support & Help Desk',
    description: 'Technical support and ticket tracking for digital audio products.',
    url: 'https://producertoy.com/support',
    mainEntity: {
      '@type': 'CustomerService',
      serviceType: 'Audio Software Technical Support',
      areaServed: 'Worldwide',
      availableLanguage: ['English'],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'Customer Support',
        email: 'support@producertoy.com',
        url: 'https://producertoy.com/support',
      },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SupportClient />
    </>
  )
}
