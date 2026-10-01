'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NewsArticle } from '@/lib/turso/newsDb'

interface NewsPageClientProps {
  initialArticles: NewsArticle[]
}

export function NewsPageClient({ initialArticles }: NewsPageClientProps) {
  const [visibleCount, setVisibleCount] = useState(12)

  // 1 Featured Hero Article (Matching Screenshot 1)
  const featuredArticle = initialArticles[0]

  // All other cards in 3-column Grid (Matching Screenshot 2 - "sare cards")
  const gridArticles = initialArticles.slice(1, visibleCount + 1)
  const hasMore = visibleCount + 1 < initialArticles.length

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
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
        
        {/* Featured Hero Story (1:1 with Screenshot 1) */}
        {featuredArticle && (
          <div className="mb-14 sm:mb-20">
            <Link
              href={`/news/${featuredArticle.slug}`}
              prefetch={true}
              className="group grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center cursor-pointer"
            >
              {/* Left Column: 16:9 Image with product-image ambient glow behind it matching Epic */}
              <div className="lg:col-span-7 relative">
                {/* Ambient Glow: Mirror of the product image with blur matching Epic Games */}
                <div className="absolute -inset-3 sm:-inset-6 overflow-hidden rounded-[36px] -z-10 pointer-events-none opacity-55 group-hover:opacity-80 transition-opacity duration-300">
                  <Image
                    src={getHighResCoverImage(featuredArticle.cover_image)}
                    alt=""
                    fill
                    className="object-cover blur-3xl scale-125"
                    aria-hidden="true"
                  />
                </div>
                
                <div className="relative aspect-video w-full rounded-2xl sm:rounded-[24px] overflow-hidden bg-[#18181c]">
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
                  <div className="absolute bottom-4 left-4 px-3.5 py-1 rounded bg-black/75 backdrop-blur-md text-xs font-semibold text-white tracking-wide">
                    {featuredArticle.category || 'News'}
                  </div>
                </div>
              </div>

              {/* Right Column: Date + Headline + Read more */}
              <div className="lg:col-span-5 flex flex-col justify-center">
                <div className="text-sm font-medium text-zinc-400 mb-3 tracking-wide">
                  {formatEpicDate(featuredArticle.published_at)}
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-[38px] font-black text-white leading-[1.18] tracking-tight mb-5 line-clamp-3 group-hover:text-zinc-200 transition-colors">
                  {cleanHtmlTitle(featuredArticle.title)}
                </h1>
                {featuredArticle.excerpt && (
                  <p className="text-sm sm:text-base text-zinc-400 line-clamp-2 leading-relaxed mb-6">
                    {featuredArticle.excerpt}
                  </p>
                )}
                <div>
                  <span className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-[#FC6301] hover:bg-[#e05800] text-white font-bold text-sm tracking-wide transition-all shadow-md group-hover:shadow-[#FC6301]/30">
                    Read more
                  </span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* 3-Column Card Grid (1:1 with Screenshot 2 - "sare cards bhi") */}
        {gridArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 mb-14">
            {gridArticles.map((article, idx) => (
              <Link
                key={article.id || idx}
                href={`/news/${article.slug}`}
                prefetch={true}
                className="group flex flex-col bg-[#202024] hover:bg-[#28282e] rounded-2xl p-3.5 sm:p-4 border-0 transition-all duration-200 cursor-pointer shadow-lg"
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
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-black/75 backdrop-blur-md text-[11px] font-semibold text-white tracking-wide">
                    {article.category || 'News'}
                  </div>
                </div>

                {/* Card Text Content */}
                <div className="pt-3.5 pb-1 flex flex-col flex-1">
                  <div className="text-xs font-medium text-zinc-400 mb-1.5">
                    {formatEpicDate(article.published_at)}
                  </div>
                  <h2 className="text-base sm:text-[17px] font-bold text-white group-hover:text-zinc-200 transition-colors leading-snug line-clamp-2">
                    {cleanHtmlTitle(article.title)}
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
              className="px-8 py-3 bg-[#202024] hover:bg-[#28282e] text-white font-bold text-xs sm:text-sm rounded-xl border-0 active:scale-95 transition-all shadow-md cursor-pointer"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
