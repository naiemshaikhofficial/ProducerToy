import { Metadata } from 'next'
import { notFound, redirect, RedirectType } from 'next/navigation'
import { getNewsArticleBySlug, getRelatedNews } from '@/lib/turso/newsDb'
import { NewsArticleClient } from './NewsArticleClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getNewsArticleBySlug(slug)

  if (!article) {
    return {
      title: 'Article Not Found | Producer Toy News',
    }
  }

  let highResImage = (article.cover_image || '').replace(/-\d+x\d+(\.[a-zA-Z0-9]+(?:\?.*)?)$/i, '$1')
  if (
    !highResImage ||
    highResImage.includes('googleusercontent.com') ||
    highResImage.includes('gstatic.com') ||
    highResImage.includes('news.google.com') ||
    highResImage.includes('placeholder')
  ) {
    const cleanT = (article.title || 'audio-production').replace(/&#?[a-z0-9]+;/gi, ' ').slice(0, 80)
    highResImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(`sleek futuristic music production synthesizer daw studio vst plugin neon amber lighting high resolution 8k render, professional audio technology article header for ${cleanT}`)}?width=1200&height=675&nologo=true`
  }
  const cleanTitle = (article.title || '')
    .replace(/&#038;/g, '&')
    .replace(/&#38;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .trim()

  const isFree =
    article.badge === 'FREEWARE' ||
    article.category === 'Free VSTs' ||
    /free|freeware|giveaway|100% off|zero cost|gratuit/i.test(cleanTitle) ||
    /free/i.test(article.deal_price || '')

  // High-Intent Dynamic Title targeting "free plugin", "plugin news", "music plugins", "audio plugins", and Producer Toy
  let title = ''
  if (isFree) {
    if (/free/i.test(cleanTitle)) {
      title = `${cleanTitle} | Free VST Plugin News | Producer Toy`
    } else {
      title = `${cleanTitle} – Free VST Plugin Download & Audio News | Producer Toy`
    }
  } else if (article.category === 'Deals & Sales' || article.deal_price) {
    title = `${cleanTitle} – Audio Plugin Deals & VST News | Producer Toy`
  } else {
    title = `${cleanTitle} | Music Plugins & Audio News | Producer Toy`
  }

  const baseExcerpt = (article.excerpt || '')
    .replace(/&#\d+;/g, '')
    .replace(/&[a-z]+;/gi, '')
    .trim()

  const description = baseExcerpt
    ? `${baseExcerpt} Discover free plugins, audio plugin news, music plugins, VST deals, and software on Producer Toy.`
    : `Get ${cleanTitle}. Read verified audio plugin news, free music plugins, VST deals, and music production gear updates on Producer Toy.`

  const keywords = Array.from(
    new Set([
      cleanTitle,
      article.source_name || 'Producer Toy',
      'free plugin',
      'free plugins',
      'plugin news',
      'music plugins',
      'audio plugins',
      'free vst plugins',
      'free vst download',
      'vst plugins',
      'audio software',
      'music production',
      article.category,
      ...(isFree
        ? ['free audio plugins', 'free music plugins', 'free vst download', 'freeware vst']
        : ['audio plugin deals', 'vst discounts', 'plugin sales']),
      'producer toy',
      'producer toy news',
      ...(article.seo_keywords ? article.seo_keywords.split(',').map((k: string) => k.trim()) : []),
    ])
  ).filter(Boolean)

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `https://producertoy.com/news/${article.slug}`,
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
      title,
      description,
      url: `https://producertoy.com/news/${article.slug}`,
      siteName: 'Producer Toy',
      type: 'article',
      publishedTime: article.published_at,
      modifiedTime: article.published_at,
      authors: [article.author_name || 'Producer Toy Editorial'],
      section: article.category,
      tags: keywords,
      images: [
        {
          url: highResImage,
          width: 1200,
          height: 675,
          alt: `${cleanTitle} - Free Audio Plugin News - Producer Toy`,
          type: 'image/jpeg',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [highResImage],
      creator: '@producertoy',
    },
  }
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = await getNewsArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  // Canonical SEO 308 Redirect: If accessed via a legacy/superseded slug, redirect to canonical slug
  if (article.slug && article.slug !== slug) {
    redirect(`/news/${article.slug}`, RedirectType.replace)
  }

  const relatedArticles = await getRelatedNews(article.slug, article.category, 3)

  let highResImage = (article.cover_image || '').replace(/-\d+x\d+(\.[a-zA-Z0-9]+(?:\?.*)?)$/i, '$1')
  if (
    !highResImage ||
    highResImage.includes('googleusercontent.com') ||
    highResImage.includes('gstatic.com') ||
    highResImage.includes('news.google.com') ||
    highResImage.includes('placeholder')
  ) {
    const cleanT = (article.title || 'audio-production').replace(/&#?[a-z0-9]+;/gi, ' ').slice(0, 80)
    highResImage = `https://image.pollinations.ai/prompt/${encodeURIComponent(`sleek futuristic music production synthesizer daw studio vst plugin neon amber lighting high resolution 8k render, professional audio technology article header for ${cleanT}`)}?width=1200&height=675&nologo=true`
  }
  const cleanTitle = (article.title || '')
    .replace(/&#038;/g, '&')
    .replace(/&#38;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#039;/g, "'")
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .trim()

  const isFree =
    article.badge === 'FREEWARE' ||
    article.category === 'Free VSTs' ||
    /free|freeware|giveaway|100% off|zero cost|gratuit/i.test(cleanTitle) ||
    /free/i.test(article.deal_price || '')

  // Google Schema.org JSON-LD (@graph linking NewsArticle, BreadcrumbList, and SoftwareApplication)
  const structuredDataGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'NewsArticle',
        '@id': `https://producertoy.com/news/${article.slug}#article`,
        isPartOf: {
          '@type': 'WebPage',
          '@id': `https://producertoy.com/news/${article.slug}`,
        },
        headline: cleanTitle,
        description: article.excerpt || cleanTitle,
        image: [highResImage, article.cover_image].filter(Boolean),
        datePublished: article.published_at,
        dateModified: article.published_at,
        author: [
          {
            '@type': 'Person',
            name: article.author_name || 'Producer Toy Editorial',
            jobTitle: article.author_role || 'Audio Technology Editor',
          },
        ],
        publisher: {
          '@type': 'Organization',
          name: 'Producer Toy',
          url: 'https://producertoy.com',
          logo: {
            '@type': 'ImageObject',
            url: 'https://producertoy.com/icon.png',
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://producertoy.com/news/${article.slug}`,
        },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `https://producertoy.com/news/${article.slug}#breadcrumb`,
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
          {
            '@type': 'ListItem',
            position: 3,
            name: article.category || 'Audio News',
            item: 'https://producertoy.com/news',
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: cleanTitle,
            item: `https://producertoy.com/news/${article.slug}`,
          },
        ],
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `https://producertoy.com/news/${article.slug}#software`,
        name: cleanTitle,
        description: article.excerpt || cleanTitle,
        image: highResImage,
        applicationCategory: 'AudioApplication',
        operatingSystem: 'Windows, macOS',
        offers: {
          '@type': 'Offer',
          price: isFree ? '0' : (article.deal_price ? article.deal_price.replace(/[^0-9.]/g, '') || '0' : '0'),
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: `https://producertoy.com/news/${article.slug}`,
        },
        publisher: {
          '@type': 'Organization',
          name: 'Producer Toy',
          url: 'https://producertoy.com',
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredDataGraph) }}
      />
      <NewsArticleClient article={article} relatedArticles={relatedArticles} />
    </>
  )
}
