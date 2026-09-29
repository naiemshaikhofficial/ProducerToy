import { Metadata } from 'next'
import { getNewsArticles } from '@/lib/turso/newsDb'
import { NewsPageClient } from './NewsPageClient'

export const revalidate = 900 // 15 mins ISR

export const metadata: Metadata = {
  title: 'Music Production News, Free VST Plugins & Audio Deals | Producer Toy',
  description:
    'Breaking news on free VST plugins, DAW sales, synthesizer updates, sound packs, and audio tech. Curated daily from Bedroom Producers Blog and premier industry sources.',
  keywords: [
    'free vst plugins',
    'music production news',
    'audio plugin deals',
    'bedroom producers blog',
    'synthesizers',
    'daw discounts',
    'producer toy news',
  ],
  alternates: {
    canonical: 'https://producertoy.com/news',
  },
  openGraph: {
    title: 'Music Production News, Free VST Plugins & Audio Deals | Producer Toy',
    description:
      'Breaking news on free VST plugins, DAW sales, synthesizer updates, and audio tech. Curated daily.',
    url: 'https://producertoy.com/news',
    siteName: 'Producer Toy',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Music Production News, Free VST Plugins & Audio Deals | Producer Toy',
    description:
      'Daily audio plugin news, freeware alerts, and exclusive music tech deals.',
  },
}

export default async function NewsPage() {
  const articles = await getNewsArticles({ limit: 40 })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Music Production News & Free VST Alerts',
    description:
      'Breaking news on free VST plugins, DAW sales, synthesizer updates, and audio tech.',
    url: 'https://producertoy.com/news',
    publisher: {
      '@type': 'Organization',
      name: 'Producer Toy',
      logo: {
        '@type': 'ImageObject',
        url: 'https://producertoy.com/icon.png',
      },
    },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: articles.slice(0, 10).map((art, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        url: `https://producertoy.com/news/${art.slug}`,
        name: art.title,
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NewsPageClient initialArticles={articles} />
    </>
  )
}
