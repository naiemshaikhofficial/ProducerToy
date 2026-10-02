'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NewsArticle } from '@/lib/turso/newsDb'
import { detectDealExpiry } from '@/lib/news/dealExpiry'

interface NewsPageClientProps {
  initialArticles: NewsArticle[]
}

const TOP_AUDIO_BRANDS = [
  'UNIVERSAL AUDIO',
  'NATIVE INSTRUMENTS',
  'ROLAND',
  'SLATE DIGITAL',
  'FABFILTER',
  'SOUNDTOYS',
  'IZOTOPE',
  'ARTURIA',
  'SOFTUBE',
  'KLEVGRAND',
  'EXCITE AUDIO',
  'EASTWEST',
  'REVEAL SOUND',
  'XLN AUDIO',
  'BRAINWORX',
  'SOLID STATE LOGIC',
  'SSL',
  'WAVES',
  'TRACKTION',
  'EVENTIDE',
]

/**
 * Intelligent Hero Selection:
 * 1. Priority 1: Sponsored / Partner product if active
 * 2. Priority 2: Highest Deal Power Score (Sabse tagda brand deal offer analyzed via top brands, discount %, and badges)
 */
export function getTopFeaturedArticle(articles: NewsArticle[]): NewsArticle | undefined {
  if (!articles || articles.length === 0) return undefined

  // Priority 1: Sponsored or Partner article
  const sponsored = articles.find(
    (a) =>
      (a as any).is_sponsored === 1 ||
      a.badge?.toUpperCase().includes('SPONSORED') ||
      a.badge?.toUpperCase().includes('PARTNER') ||
      Boolean(a.specs?.['Sponsored']) ||
      Boolean(a.specs?.['Partner'])
  )
  if (sponsored) return sponsored

  // Priority 2: Sabse tagda brand deal offer
  let bestArticle = articles[0]
  let maxScore = -1

  for (const article of articles) {
    let score = 0
    const upperTitle = (article.title || '').toUpperCase()
    const upperBadge = (article.badge || '').toUpperCase()
    const brandInSpecs = (article.specs?.['Brand'] || '').toUpperCase()

    // 1. Top Tier Audio Brand (+45 points)
    const hasTopBrand = TOP_AUDIO_BRANDS.some(
      (b) => upperTitle.includes(b) || brandInSpecs.includes(b)
    )
    if (hasTopBrand) score += 45

    // 2. Deal Badge Weight
    if (upperBadge.includes('MEGA DEAL') || upperBadge.includes('RECORD LOW')) {
      score += 35
    } else if (upperBadge.includes('HOT DEAL') || upperBadge.includes('FLASH SALE')) {
      score += 25
    } else if (upperBadge.includes('COUPON CODE')) {
      score += 20
    } else if (upperBadge.includes('FREEWARE')) {
      score += 10
    }

    // 3. Discount Percentage extraction (e.g. 90% OFF -> +30 points)
    const discountMatch = upperTitle.match(/(\d{2})%\s*OFF/i)
    if (discountMatch) {
      const discountNum = parseInt(discountMatch[1], 10)
      if (discountNum >= 80) score += 30
      else if (discountNum >= 50) score += 20
      else if (discountNum >= 30) score += 10
    }

    // 4. Explicit is_featured flag (+15 points)
    if (article.is_featured === 1) {
      score += 15
    }

    // 5. Freshness / Recency Bonus (within last 7 days +15 points)
    try {
      const pubTime = new Date(article.published_at).getTime()
      const now = Date.now()
      const daysOld = (now - pubTime) / (1000 * 60 * 60 * 24)
      if (daysOld < 3) score += 15
      else if (daysOld < 7) score += 10
      else if (daysOld < 14) score += 5
    } catch {}

    if (score > maxScore) {
      maxScore = score
      bestArticle = article
    }
  }

  return bestArticle
}

export function NewsPageClient({ initialArticles }: NewsPageClientProps) {
  const [visibleCount, setVisibleCount] = useState(12)

  // 1 Featured Hero Article (Priority: Sponsored -> Sabse Tagda Brand Deal)
  const featuredArticle = getTopFeaturedArticle(initialArticles)

  // All other cards in 3-column Grid (Excluding the featured hero so it never duplicates)
  const remainingArticles = initialArticles.filter((a) => a.id !== featuredArticle?.id)
  const gridArticles = remainingArticles.slice(0, visibleCount)
  const hasMore = visibleCount < remainingArticles.length

  const formatEpicDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return 'Recently'
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    } catch {
      return 'Recently'
    }
  }

  const getHighResCoverImage = (url?: string | null): string => {
    if (!url) return '/placeholder.jpg'
    // Strip WordPress & CMS thumbnail suffixes (-128x71, -150x150, -300x169, -768x432, -1024x576) to always fetch crisp original Full HD master
    return url.replace(/-\d+x\d+(\.[a-zA-Z0-9]+(?:\?.*)?)$/i, '$1')
  }

  const cleanHtmlTitle = (title?: string | null): string => {
    if (!title) return ''
    return title
      .replace(/&#038;/g, '&')
      .replace(/&#38;/g, '&')
      .replace(/&amp;/g, '&')
      .replace(/&#8217;/g, "'")
      .replace(/&#8216;/g, "'")
      .replace(/&#039;/g, "'")
      .replace(/&#8211;/g, '–')
      .replace(/&#8212;/g, '—')
      .replace(/&#8220;/g, '“')
      .replace(/&#8221;/g, '”')
  }

  return (
    <div className="w-full bg-[#121212] text-white selection:bg-[#FC6301] selection:text-white">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-7 pb-12 sm:pb-16">
        
        {/* Featured Hero Story (1:1 with Epic Games Screenshot) */}
        {featuredArticle && (
          <div className="mb-10 sm:mb-12">
            <Link
              href={`/news/${featuredArticle.slug}`}
              prefetch={true}
              className="group grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center cursor-pointer"
            >
              {/* Left Column: 16:9 Image with 1:1 Epic Games Subtle Ambient Glow */}
              <div className="lg:col-span-7 relative isolate">
                {/* 1:1 Epic Games Ambient Glow: Contained, soft atmospheric halo directly behind the card, never bleeding into the grid below */}
                <div
                  className="absolute -inset-3 sm:-inset-5 -z-10 pointer-events-none select-none opacity-30 group-hover:opacity-40 transition-opacity duration-300"
                  aria-hidden="true"
                >
                  <img
                    src={getHighResCoverImage(featuredArticle.cover_image)}
                    alt=""
                    className="w-full h-full object-cover rounded-3xl filter blur-xl sm:blur-2xl scale-100"
                  />
                </div>
                
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#18181c] shadow-2xl">
                  <Image
                    src={getHighResCoverImage(featuredArticle.cover_image)}
                    alt={`${cleanHtmlTitle(featuredArticle.title)} - Free Plugin & Audio News - Producer Toy`}
                    title={`${cleanHtmlTitle(featuredArticle.title)} - Producer Toy`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover group-hover:scale-[1.01] transition-transform duration-300 ease-out"
                    priority
                  />
                  {/* Category Pill in bottom-left */}
                  <div className="absolute bottom-3.5 left-3.5 px-3 py-0.5 rounded bg-black/75 backdrop-blur-md text-[11px] font-semibold text-white tracking-wide">
                    {featuredArticle.category || 'News'}
                  </div>
                </div>
              </div>

              {/* Right Column: Date + Headline + Read more (Matching Epic Games Screenshot) */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-zinc-300 mb-2.5 tracking-wide">
                  {featuredArticle.badge && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                      featuredArticle.badge.toUpperCase().includes('SPONSORED') || featuredArticle.badge.toUpperCase().includes('PARTNER')
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-[#FC6301]/20 text-[#FC6301] border border-[#FC6301]/30'
                    }`}>
                      {featuredArticle.badge}
                    </span>
                  )}
                  <span>{formatEpicDate(featuredArticle.published_at)}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-white leading-[1.2] tracking-tight mb-5 line-clamp-3 group-hover:text-zinc-200 transition-colors">
                  {cleanHtmlTitle(featuredArticle.title)}
                  {detectDealExpiry(featuredArticle).isExpired && (
                    <span className="ml-2 text-zinc-400 font-bold text-lg sm:text-2xl tracking-normal inline-block align-baseline select-none">
                      [Expired]
                    </span>
                  )}
                </h1>
                <div>
                  <span className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#FC6301] hover:bg-[#e05800] text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md group-hover:shadow-[#FC6301]/30">
                    Read more
                  </span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* 3-Column Card Grid (1:1 with Epic Games - Compact, Sleek Cards) */}
        {gridArticles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-14">
            {gridArticles.map((article, idx) => (
              <Link
                key={article.id || idx}
                href={`/news/${article.slug}`}
                prefetch={true}
                className="group flex flex-col bg-[#1a1a1e] hover:bg-[#222228] rounded-2xl p-2.5 sm:p-3 border-0 transition-all duration-200 cursor-pointer shadow-md"
              >
                {/* 16:9 Inset Image with rounded corners */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#141416]">
                  <Image
                    src={getHighResCoverImage(article.cover_image)}
                    alt={`${cleanHtmlTitle(article.title)} - Free Plugin & Audio News - Producer Toy`}
                    title={`${cleanHtmlTitle(article.title)} - Producer Toy`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-[1.02] transition-transform duration-300 ease-out"
                  />
                  {/* Category Pill in bottom-left */}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-semibold text-white tracking-wide">
                    {article.category || 'News'}
                  </div>
                </div>

                {/* Card Text Content (Compact typography matching Epic) */}
                <div className="pt-2.5 pb-1 px-1 flex flex-col flex-1">
                  <div className="text-[11px] font-medium text-zinc-400 mb-1">
                    {formatEpicDate(article.published_at)}
                  </div>
                  <h2 className="text-[14px] sm:text-[14.5px] font-bold text-white group-hover:text-zinc-200 transition-colors leading-snug line-clamp-2">
                    {cleanHtmlTitle(article.title)}
                    {detectDealExpiry(article).isExpired && (
                      <span className="ml-1.5 text-zinc-400 font-bold text-xs sm:text-sm tracking-normal inline-block align-baseline select-none">
                        [Expired]
                      </span>
                    )}
                  </h2>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center pt-2 pb-8">
            <button
              onClick={() => setVisibleCount((prev) => prev + 9)}
              className="px-8 py-3 bg-[#1a1a1e] hover:bg-[#222228] text-white font-bold text-xs sm:text-sm rounded-xl border-0 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
