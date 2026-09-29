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

  // Top 2 featured articles for the Epic Games billboard hero cards
  const billboardArticles = initialArticles.slice(0, 2)

  // Remaining articles for the list below
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

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10">
        
        {/* Exact Epic Games Heading */}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-6">
          Producer Toy News
        </h1>

        {/* 1:1 Epic Games 2-Billboard Hero Cards */}
        {billboardArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
            {billboardArticles.map((article, idx) => (
              <Link
                key={article.id || idx}
                href={`/news/${article.slug}`}
                prefetch={true}
                className="group flex flex-col cursor-pointer"
              >
                {/* 16:9 Clean Thumbnail (No overlays or stickers) */}
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#202024] mb-3 sm:mb-4">
                  <Image
                    src={article.cover_image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-300 ease-out"
                    priority={idx === 0}
                  />
                </div>

                {/* Date stamp */}
                <div className="text-[11px] sm:text-xs font-semibold uppercase text-zinc-400 tracking-wider mb-2">
                  {formatRelativeDate(article.published_at)}
                </div>

                {/* Article Headline */}
                <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white group-hover:text-zinc-300 transition-colors leading-snug mb-2 line-clamp-2">
                  {article.title}
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

        {/* Epic Games Horizontal Stories Feed */}
        {feedArticles.length > 0 && (
          <div className="space-y-6 sm:space-y-8 mb-12">
            {feedArticles.map((article, idx) => (
              <Link
                key={article.id || idx}
                href={`/news/${article.slug}`}
                prefetch={true}
                className="group flex flex-col md:flex-row gap-5 sm:gap-7 items-start pb-6 sm:pb-8 border-b border-[#202024] last:border-b-0 cursor-pointer"
              >
                {/* Horizontal Thumbnail (16:9 on desktop, full width on mobile) */}
                <div className="relative aspect-video w-full md:w-[320px] lg:w-[380px] shrink-0 rounded-2xl overflow-hidden bg-[#202024]">
                  <Image
                    src={article.cover_image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 380px"
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-300 ease-out"
                  />
                </div>

                {/* Content Details */}
                <div className="flex flex-col flex-1 py-1">
                  <div className="text-[11px] sm:text-xs font-semibold uppercase text-zinc-400 tracking-wider mb-2">
                    {formatRelativeDate(article.published_at)}
                  </div>

                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white group-hover:text-zinc-300 transition-colors leading-snug mb-2 line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                    {article.excerpt}
                  </p>

                  <div className="mt-auto">
                    <span className="text-xs sm:text-sm font-semibold text-white group-hover:underline">
                      Read more
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center pt-4 pb-12">
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
