import { Metadata } from 'next'
import { getNewsArticles } from '@/lib/turso/newsDb'
import { NewsPageClient } from './NewsPageClient'

// ISR Edge Caching: Statically generated on Edge CDN (0 serverless cost, 0 DB queries for visitors)
// Automatically purged on-demand when /api/news/sync finds new news or expired deals
export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Free Plugins, Audio Plugin News & VST Deals | Producer Toy',
  description:
    'Discover the best free plugins, latest audio plugin news, music plugins, and VST deals. Download free audio plugins, synths, and mixing effects updated daily on Producer Toy.',
  keywords: [
    'free plugins',
    'free plugin',
    'plugin news',
    'music plugins',
    'audio plugins',
    'free vst plugins',
    'free vst',
    'audio plugin deals',
    'vst deals',
    'music production news',
    'free audio software',
    'vst plugins',
    'producer toy news',
  ],
  alternates: {
    canonical: 'https://producertoy.com/news',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'Free Plugins, Audio Plugin News & VST Deals | Producer Toy',
    description:
      'Curated daily free plugins, breaking audio plugin news, music plugins, and VST deals for producers and audio engineers.',
    url: 'https://producertoy.com/news',
    siteName: 'Producer Toy',
    type: 'website',
    images: [
      {
        url: 'https://producertoy.com/icon.png',
        width: 1200,
        height: 630,
        alt: 'Producer Toy - Free Plugins & Audio Plugin News',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Plugins, Audio Plugin News & VST Deals | Producer Toy',
    description:
      'Curated daily free plugins, breaking audio plugin news, music plugins, and VST deals for producers and audio engineers.',
    images: ['https://producertoy.com/icon.png'],
  },
}

export default async function NewsPage() {
  const articles = await getNewsArticles({ limit: 100 })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': 'https://producertoy.com/news#webpage',
        url: 'https://producertoy.com/news',
        name: 'Free Plugins, Audio Plugin News & VST Deals',
        description:
          'Discover the best free plugins, latest audio plugin news, music plugins, and VST deals on Producer Toy.',
        publisher: {
          '@type': 'Organization',
          name: 'Producer Toy',
          url: 'https://producertoy.com',
          logo: {
            '@type': 'ImageObject',
            url: 'https://producertoy.com/icon.png',
          },
        },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: articles.slice(0, 15).map((art, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            url: `https://producertoy.com/news/${art.slug}`,
            name: art.title,
            image: art.cover_image,
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': 'https://producertoy.com/news#breadcrumb',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://producertoy.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Plugin News',
            item: 'https://producertoy.com/news',
          },
        ],
      },
    ],
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
