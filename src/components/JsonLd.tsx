import React from 'react'

export interface ProductJsonLdProps {
  name: string
  description?: string
  image?: string
  brandName?: string
  priceUsd: number
  currency?: string
  sku?: string
  url: string
  categoryName?: string
  ratingValue?: number
  reviewCount?: number
  isFree?: boolean
  keywords?: string[]
  vstFormat?: string
}

export function ProductJsonLd({
  name,
  description,
  image,
  brandName = 'Producer Toy',
  priceUsd,
  currency = 'USD',
  sku,
  url,
  categoryName = 'Music Production Tools',
  ratingValue = 4.9,
  reviewCount = 128,
  isFree = false,
  keywords = [],
  vstFormat = 'VST3, AU, AAX',
}: ProductJsonLdProps) {
  const autoKeywords = [
    name,
    `free ${name}`,
    `${brandName} ${name}`,
    `download ${name}`,
    `${name} VST`,
    `${name} plugin`,
    `${brandName} plugins`,
    ...(isFree ? [`free ${categoryName}`, 'free VST download'] : []),
    ...keywords,
  ]

  const productImage = image || 'https://producertoy.com/Icon.png'

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': ['Product', 'SoftwareApplication'],
    name: name,
    headline: `${name} by ${brandName}`,
    alternateName: [`${name} by ${brandName}`, `${brandName} ${name}`, `Free ${name}`],
    description: description || `Download ${name} by ${brandName} on Producer Toy Store. Fast direct download for ${vstFormat}.`,
    image: [productImage],
    primaryImageOfPage: {
      '@type': 'ImageObject',
      contentUrl: productImage,
      url: productImage,
      caption: `${name} by ${brandName}`,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    sku: sku || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    keywords: autoKeywords.join(', '),
    brand: {
      '@type': 'Brand',
      name: brandName,
    },
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Windows 10/11 64-bit, macOS 10.15+ (Apple Silicon M1/M2/M3 & Intel)',
    softwareVersion: 'Latest',
    fileFormat: vstFormat,
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: currency,
      price: isFree ? '0.00' : priceUsd.toFixed(2),
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Producer Toy',
        url: 'https://producertoy.com',
        logo: 'https://producertoy.com/Icon.png',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ratingValue.toString(),
      reviewCount: reviewCount.toString(),
      bestRating: '5',
      worstRating: '1',
    },
    category: categoryName,
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
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
        name: 'Store',
        item: 'https://producertoy.com/store',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: categoryName,
        item: `https://producertoy.com/categories/${categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: name,
        item: url,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  )
}

export function StoreOrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'OnlineStore'],
    '@id': 'https://producertoy.com/#organization',
    name: 'Producer Toy',
    alternateName: ['ProducerToy', 'Producer Toy Store'],
    url: 'https://producertoy.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://producertoy.com/Icon.png',
      contentUrl: 'https://producertoy.com/Icon.png',
      width: '512',
      height: '512',
      caption: 'Producer Toy Logo',
    },
    image: 'https://producertoy.com/Icon.png',
    description: 'The premier minimalist marketplace for music producers. Download VST plugins, sample packs, synth presets, and DAW templates.',
    sameAs: [
      'https://twitter.com/producertoy',
      'https://instagram.com/producertoy',
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function WebSiteJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Producer Toy',
    alternateName: ['ProducerToy', 'Producer Toy Store'],
    url: 'https://producertoy.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://producertoy.com/store?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function CollectionPageJsonLd({
  title,
  description,
  url,
  items = [],
}: {
  title: string
  description: string
  url: string
  items?: Array<{ name: string; url: string; price?: number; image?: string }>
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description: description,
    url: url,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.slice(0, 30).map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: item.url,
        item: {
          '@type': 'Product',
          name: item.name,
          url: item.url,
          image: item.image,
          offers: item.price !== undefined ? {
            '@type': 'Offer',
            price: item.price.toFixed(2),
            priceCurrency: 'USD',
            url: item.url,
          } : undefined,
        },
      })),
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function FAQPageJsonLd({
  faqs,
}: {
  faqs: Array<{ question: string; answer: string }>
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function BreadcrumbJsonLd({
  breadcrumbs,
}: {
  breadcrumbs: Array<{ name: string; url: string }>
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((bc, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: bc.name,
      item: bc.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

