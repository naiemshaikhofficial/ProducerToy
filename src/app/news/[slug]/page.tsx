import { Metadata } from 'next'
import { notFound } from 'next/navigation'
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

  const highResImage = (article.cover_image || '').replace(/-\d+x\d+(\.[a-zA-Z0-9]+(?:\?.*)?)$/i, '$1')
  const cleanTitle = (article.title || '')
    .replace(/&#038;/g, '&')
    .replace(/&#38;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8211;/g, '–')

  const title = `${cleanTitle} | Producer Toy`
  const description =
    article.excerpt ||
    `Read the latest on ${cleanTitle}. Curated music production news, free VST plugins, and audio tech.`

  return {
    title,
    description,
    keywords: [
      article.category,
      'free vst plugins',
      'music production',
      'vst plugins',
      article.source_name,
      ...(article.seo_keywords ? article.seo_keywords.split(',') : []),
    ],
    alternates: {
      canonical: `https://producertoy.com/news/${article.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://producertoy.com/news/${article.slug}`,
      siteName: 'Producer Toy',
      type: 'article',
      publishedTime: article.published_at,
      authors: [article.author_name],
      images: [
        {
          url: highResImage,
          width: 1200,
          height: 675,
          alt: cleanTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [highResImage],
    },
  }
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = await getNewsArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  const relatedArticles = await getRelatedNews(article.slug, article.category, 3)

  // Google NewsArticle Schema.org JSON-LD
  const newsArticleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    image: [article.cover_image],
    datePublished: article.published_at,
    dateModified: article.published_at,
    author: [
      {
        '@type': 'Person',
        name: article.author_name,
        jobTitle: article.author_role,
      },
    ],
    publisher: {
      '@type': 'Organization',
      name: 'Producer Toy',
      logo: {
        '@type': 'ImageObject',
        url: 'https://producertoy.com/icon.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://producertoy.com/news/${article.slug}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }}
      />
      <NewsArticleClient article={article} relatedArticles={relatedArticles} />
    </>
  )
}
