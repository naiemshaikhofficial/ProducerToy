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
  const finalRatingValue = Number(ratingValue) > 0 ? Number(ratingValue).toFixed(1) : '4.9'
  const finalReviewCount = Number(reviewCount) > 0 ? Number(reviewCount).toString() : '96'
  const numericPrice = Number(priceUsd) || 0
  const formattedPrice = isFree || numericPrice === 0 ? '0.00' : numericPrice.toFixed(2)
  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

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
      price: formattedPrice,
      priceValidUntil: priceValidUntil,
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Producer Toy',
        url: 'https://producertoy.com',
        logo: 'https://producertoy.com/Icon.png',
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'US',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0.00',
          currency: currency,
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'US',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 0,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 0,
            unitCode: 'DAY',
          },
        },
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: finalRatingValue,
      reviewCount: finalReviewCount,
      bestRating: '5',
      worstRating: '1',
    },
    review: [
      {
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: finalRatingValue,
          bestRating: '5',
          worstRating: '1',
        },
        author: {
          '@type': 'Organization',
          name: 'Producer Toy Editorial Team',
        },
        reviewBody: `Official release for ${name} by ${brandName}. Verified 100% royalty-free commercial license with instant digital delivery and full DAW compatibility.`,
        datePublished: '2026-01-01',
      },
    ],
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
  items?: Array<{ name: string; url: string; price?: number; image?: string; brand?: string }>
}) {
  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description: description,
    url: url,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.slice(0, 30).map((item, index) => {
        const itemPrice = item.price !== undefined && item.price !== null ? Number(item.price) : 0
        const isFree = itemPrice === 0
        return {
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          url: item.url,
          item: {
            '@type': 'Product',
            name: item.name,
            url: item.url,
            image: item.image || 'https://producertoy.com/Icon.png',
            brand: {
              '@type': 'Brand',
              name: item.brand || 'Producer Toy',
            },
            offers: {
              '@type': 'Offer',
              price: isFree ? '0.00' : itemPrice.toFixed(2),
              priceCurrency: 'USD',
              url: item.url,
              availability: 'https://schema.org/InStock',
              priceValidUntil: priceValidUntil,
              itemCondition: 'https://schema.org/NewCondition',
              seller: {
                '@type': 'Organization',
                name: 'Producer Toy',
                url: 'https://producertoy.com',
              },
            },
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.9',
              reviewCount: '64',
              bestRating: '5',
              worstRating: '1',
            },
            review: [
              {
                '@type': 'Review',
                reviewRating: {
                  '@type': 'Rating',
                  ratingValue: '4.9',
                  bestRating: '5',
                  worstRating: '1',
                },
                author: {
                  '@type': 'Organization',
                  name: 'Producer Toy Review Team',
                },
                reviewBody: `Verified production software download on Producer Toy Store.`,
                datePublished: '2026-01-01',
              },
            ],
          },
        }
      }),
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

export function ItemListJsonLd({
  name,
  description,
  itemListElement,
}: {
  name: string
  description: string
  itemListElement: Array<{
    position: number
    name: string
    url: string
    image?: string
    description?: string
  }>
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    description,
    numberOfItems: itemListElement.length,
    itemListElement: itemListElement.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      url: item.url,
      image: item.image,
      description: item.description,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function ArticleJsonLd({
  title,
  description,
  url,
  image,
  datePublished,
  dateModified,
  authorName = 'Producer Toy Team',
  authorRole = 'Audio Engineer & Sound Designer',
  category = 'Guides',
  tags = [],
}: {
  title: string
  description?: string
  url: string
  image?: string | null
  datePublished: string
  dateModified?: string
  authorName?: string
  authorRole?: string | null
  category?: string
  tags?: string[]
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    headline: title,
    description: description || title,
    image: image ? [image] : ['https://producertoy.com/Icon.png'],
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: authorName,
      jobTitle: authorRole || 'Music Production Specialist',
      url: 'https://producertoy.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Producer Toy',
      logo: {
        '@type': 'ImageObject',
        url: 'https://producertoy.com/Icon.png',
      },
    },
    articleSection: category,
    keywords: tags.join(', '),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export function BlogListJsonLd({
  title = 'Producer Toy Blog & Guides',
  description = 'Tutorials, VST plugin guides, sound design walkthroughs, and mixing tips from the Producer Toy team.',
  url = 'https://producertoy.com/blog',
  posts,
}: {
  title?: string
  description?: string
  url?: string
  posts: Array<{
    title: string
    url: string
    image?: string | null
    datePublished?: string
    description?: string | null
  }>
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: title,
    description: description,
    url: url,
    publisher: {
      '@type': 'Organization',
      name: 'Producer Toy',
      logo: {
        '@type': 'ImageObject',
        url: 'https://producertoy.com/Icon.png',
      },
    },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: post.url,
      image: post.image || 'https://producertoy.com/Icon.png',
      datePublished: post.datePublished,
      description: post.description || post.title,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}


