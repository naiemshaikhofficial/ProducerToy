import React from 'react'
import { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { FaqPageClient } from './FaqPageClient'

export const metadata: Metadata = generatePageMetadata({
  title: 'Frequently Asked Questions & Help Desk — Producer Toy',
  description:
    'Comprehensive answers to common questions about VST plugin serial keys, cloud downloads, selling on Producer Toy, affiliate commissions, refund policies, and DAW setup.',
  path: '/faq',
  keywords: [
    'Producer Toy FAQ',
    'Producer Toy help',
    'selling with Producer Toy',
    'Producer Toy affiliate',
    'VST plugin troubleshooting',
    'serial key retrieval',
    'refund policy audio plugins',
    'FL Studio VST3 rescan',
    'Ableton Live rescan plugins',
    'Logic Pro audio unit plugin manager',
    'Apple Silicon VST compatibility',
  ],
})

export default function FaqPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: 'Producer Toy Frequently Asked Questions & Knowledge Base',
    description:
      'Answers to common questions regarding orders, license keys, seller distribution, affiliate programs, and DAW technical setup.',
    url: 'https://producertoy.com/faq',
    publisher: {
      '@type': 'Organization',
      name: 'Producer Toy',
      url: 'https://producertoy.com',
      logo: 'https://producertoy.com/Icon.png',
    },
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I sell my VST plugins or sample packs on Producer Toy?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We welcome audio developers, DSP engineers, and sound designers. Creators retain 70% to 80% net revenue split with automated bi-weekly payouts, cloud CDN hosting, and copy-protection delivery.',
        },
      },
      {
        '@type': 'Question',
        name: 'Where is my wishlist and how do I save products for later?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Your Wishlist is easily accessible from the bookmark icon in the top header or directly at producertoy.com/wishlist. You will receive automatic price-drop alerts when saved items go on sale.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do complimentary Free Gifts work with my purchase?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Every eligible purchase qualifies for complimentary audio software or sound libraries. On qualifying promotional periods, you can choose from premium VST plugins, vocal effects, or sample kits at zero extra cost.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is your refund policy for software plugins and sample packs?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Due to the digital nature of software licenses, unlocked serial keys are generally non-refundable once registered. However, if a plugin has a confirmed technical defect that cannot be resolved within 14 days, a full refund or replacement is issued.',
        },
      },
      {
        '@type': 'Question',
        name: 'My new VST3 plugin is not showing up in FL Studio. What should I do?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'In FL Studio, go to Options > Manage Plugins. Check "Rescan previously verified plugins" and "Verify plugins", verify C:\\Program Files\\Common Files\\VST3 is in search folders, then click "Find installed plugins".',
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <FaqPageClient />
    </>
  )
}
