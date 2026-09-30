'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NewsArticle } from '@/lib/turso/newsDb'
import { NewsGoogleAd } from '@/components/news/NewsGoogleAd'

interface NewsPageClientProps {
  initialArticles: NewsArticle[]
}

export function NewsPageClient({ initialArticles }: NewsPageClientProps) {
  const [visibleCount, setVisibleCount] = useState(12)

  // Top 2 featured articles for the Epic Games billboard hero cards
  const billboardArticles = initialArticles.slice(0, 2)

  // Remaining articles for the 1:1 Epic Games horizontal feed
  const feedArticles = initialArticles.slice(2, visibleCount + 2)
  const hasMore = visibleCount + 2 < initialArticles.length

  const formatRelativeDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      const now = new Date()
      const diffMs = now.getTime() - d.getTime()
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffHrs < 1) return 'JUST NOW'
      if (diffHrs < 24) return `${diffHrs}H AGO`
      if (diffDays === 1) return 'YESTERDAY'
      if (diffDays < 7) return `${diffDays}D AGO`
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}W AGO`
      if (diffDays < 365) return `${Math.floor(diffDays / 30)}MO AGO`
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()
    } catch {
      return 'RECENT'
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
    <div className="min-h-screen bg-[#121212] text-white selection:bg-[#FC6301] selection:text-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10">
        
        {/* Exact Epic Games Heading */}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-6">
          Producer Toy News
        </h1>

        {/* 1:1 Epic Games 2-Billboard Hero Cards (NO BORDERS, STATIC + LIGHT GLOW HIGHLIGHT ON HOVER) */}
        {billboardArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 mb-12 sm:mb-16">
            {billboardArticles.map((article, idx) => (
              <Link
                key={article.id || idx}
                href={`/news/${article.slug}`}
                prefetch={true}
                className="group flex flex-col cursor-pointer border-0"
              >
                {/* 16:9 Clean Thumbnail (Static with Home Page Brightness + Glow Highlight on Hover) */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#181818] mb-3.5 sm:mb-4">
                  <Image
                    src={getHighResCoverImage(article.cover_image)}
                    alt={cleanHtmlTitle(article.title)}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:brightness-110 transition-all duration-200 ease-out"
                    priority={idx === 0}
                  />
                  {/* Subtle Light Glow Overlay matching Homepage */}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                </div>

                {/* Date stamp */}
                <div className="text-[11px] sm:text-xs font-semibold uppercase text-zinc-400 tracking-wider mb-2">
                  {formatRelativeDate(article.published_at)}
                </div>

                {/* Article Headline */}
                <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white group-hover:text-zinc-300 transition-colors leading-snug mb-2 line-clamp-2">
                  {cleanHtmlTitle(article.title)}
                </h2>

                {/* Excerpt */}
                <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                  {article.excerpt}
                </p>

                {/* Read more Link */}
                <div className="mt-auto">
                  <span className="text-xs sm:text-sm font-semibold text-white group-hover:underline">
                    Read more
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* 1:1 Exact Epic Games Horizontal Feed (Matching User Screenshot) */}
        {feedArticles.length > 0 && (
          <div className="border-t border-[#26262a] pt-1">
            {feedArticles.map((article, idx) => (
              <React.Fragment key={article.id || idx}>
                <Link
                  href={`/news/${article.slug}`}
                  prefetch={true}
                  className="group flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center py-6 border-b border-[#222226] cursor-pointer"
                >
                  {/* 16:9 Thumbnail (Mobile: Full width with rounded corners & News pill | Desktop: w-60/w-64) */}
                  <div className="relative w-full sm:w-60 md:w-64 aspect-video shrink-0 rounded-2xl sm:rounded-xl overflow-hidden bg-[#181818]">
                    <Image
                      src={getHighResCoverImage(article.cover_image)}
                      alt={cleanHtmlTitle(article.title)}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 240px, 256px"
                      className="object-cover group-hover:brightness-110 transition-all duration-200 ease-out"
                    />
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
                    
                    {/* Mobile Only Category Pill on image (1:1 Epic Games mobile screenshot) */}
                    <div className="sm:hidden absolute bottom-3 left-3 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-xs font-semibold text-white">
                      {article.category || 'News'}
                    </div>
                  </div>

                  {/* Content Details: Meta Date + Bold Title + Read more (Exact Epic Games Layout) */}
                  <div className="flex flex-col justify-center min-w-0 flex-1 w-full">
                    {/* Category / Date Stamp matching Epic */}
                    <div className="text-xs font-semibold uppercase text-zinc-400 tracking-wider mb-1.5">
                      <span className="hidden sm:inline">{article.category ? `${article.category.toUpperCase()} | ` : ''}</span>
                      {formatRelativeDate(article.published_at)}
                    </div>

                    {/* Title (Bold white, hover light) */}
                    <h3 className="text-lg sm:text-base lg:text-[17px] font-bold text-white group-hover:text-zinc-300 transition-colors leading-snug line-clamp-2 mb-2">
                      {cleanHtmlTitle(article.title)}
                    </h3>

                    {/* Read more Link */}
                    <div className="hidden sm:block">
                      <span className="text-xs font-semibold text-zinc-300 group-hover:underline">
                        Read more
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Optional in-feed Google Ad after 4th item if configured */}
                {idx === 3 && (
                  <div className="border-b border-[#222226]">
                    <NewsGoogleAd slot="news_feed_inline" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center pt-4 pb-14">
            <button
              onClick={() => setVisibleCount((prev) => prev + 8)}
              className="px-8 py-3 bg-[#202020] hover:bg-[#282828] text-white font-bold text-xs sm:text-sm rounded-xl border border-[#333333] hover:border-zinc-400 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
