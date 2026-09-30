'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, X, Sparkles } from 'lucide-react'
import { NewsArticle } from '@/lib/turso/newsDb'
import { NewsGoogleAd } from '@/components/news/NewsGoogleAd'

interface NewsPageClientProps {
  initialArticles: NewsArticle[]
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All News' },
  { id: 'free', label: 'Free Plugins & VSTs', isFree: true },
  { id: 'deals', label: 'Deals & Discounts' },
  { id: 'guides', label: 'Guides & Tech' },
]

export function NewsPageClient({ initialArticles }: NewsPageClientProps) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'free' | 'deals' | 'guides'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(12)

  // Sync URL search params on mount (e.g. /news?category=free or /news?free=true)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const cat = params.get('category') || params.get('filter')
      const isFreeParam = params.get('free') === 'true'
      const q = params.get('q') || params.get('search')

      if (isFreeParam || (cat && cat.toLowerCase().includes('free'))) {
        setActiveCategory('free')
      } else if (cat && cat.toLowerCase().includes('deal')) {
        setActiveCategory('deals')
      } else if (cat && (cat.toLowerCase().includes('guide') || cat.toLowerCase().includes('tech'))) {
        setActiveCategory('guides')
      }

      if (q) setSearchQuery(q)
    }
  }, [])

  // Filtered articles based on active category and live search query
  const filteredArticles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return initialArticles.filter((article) => {
      const title = (article.title || '').toLowerCase()
      const excerpt = (article.excerpt || '').toLowerCase()

      const matchesQuery = !q || title.includes(q) || excerpt.includes(q)
      if (!matchesQuery) return false

      if (activeCategory === 'free') {
        return (
          article.category === 'Free VSTs' ||
          article.badge === 'FREEWARE' ||
          /free|freeware|giveaway|100% off|zero cost|gratuit/i.test(article.title) ||
          /free/i.test(article.deal_price || '')
        )
      }

      if (activeCategory === 'deals') {
        return (
          article.category === 'Deals & Sales' ||
          article.badge === 'HOT DEAL' ||
          article.badge === 'MEGA DEAL' ||
          article.badge === 'FLASH SALE' ||
          article.badge === 'COUPON CODE' ||
          Boolean(article.deal_price)
        )
      }

      if (activeCategory === 'guides') {
        return (
          article.category === 'Guides' ||
          article.category === 'Tech & Gear' ||
          article.badge === 'GUIDE'
        )
      }

      return true
    })
  }, [initialArticles, activeCategory, searchQuery])

  // Count of free plugins for badge indicator
  const freePluginsCount = useMemo(() => {
    return initialArticles.filter(
      (a) =>
        a.category === 'Free VSTs' ||
        a.badge === 'FREEWARE' ||
        /free|freeware|giveaway/i.test(a.title)
    ).length
  }, [initialArticles])

  const isFiltering = activeCategory !== 'all' || Boolean(searchQuery.trim())

  // Top 2 featured billboard hero cards (only when viewing All News without search)
  const billboardArticles = isFiltering ? [] : filteredArticles.slice(0, 2)

  // Remaining articles for the 1:1 Epic Games horizontal feed
  const feedArticles = isFiltering
    ? filteredArticles.slice(0, visibleCount)
    : filteredArticles.slice(2, visibleCount + 2)

  const hasMore = isFiltering
    ? visibleCount < filteredArticles.length
    : visibleCount + 2 < filteredArticles.length

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
        
        {/* SEO-Optimized Live News Header */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-[#FC6301]/15 text-[#FC6301] border border-[#FC6301]/30">
              Live Plugin News
            </span>
            <span className="text-zinc-500 text-xs font-semibold">• Updated Daily</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-2.5">
            Free Plugins &amp; Audio Plugin News
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-normal max-w-2xl leading-relaxed">
            Daily freeware alerts, music plugins, VST deals, and music production tech news curated by Producer Toy.
          </p>
        </div>

        {/* Category Filter Tabs & Quick Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8 sm:mb-10 pb-5 border-b border-[#222226]">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORY_TABS.map((tab) => {
              const isActive = activeCategory === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveCategory(tab.id as any)
                    setVisibleCount(12)
                  }}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? tab.isFree
                        ? 'bg-[#FC6301] text-white shadow-lg shadow-[#FC6301]/25 font-bold'
                        : 'bg-white text-black font-bold'
                      : tab.isFree
                      ? 'bg-[#FC6301]/10 text-[#FC6301] hover:bg-[#FC6301]/20 border border-[#FC6301]/30 font-semibold'
                      : 'bg-[#18181b] text-zinc-400 hover:text-white hover:bg-[#232326] border border-white/5'
                  }`}
                >
                  {tab.isFree && <Sparkles className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                  {tab.isFree && freePluginsCount > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                        isActive ? 'bg-black/30 text-white' : 'bg-[#FC6301] text-white'
                      }`}
                    >
                      {freePluginsCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Instant Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setVisibleCount(12)
              }}
              placeholder="Search plugins, deals, VSTs..."
              className="w-full bg-[#18181b] border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#FC6301] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Headline / Info Bar if filtering */}
        {isFiltering && (
          <div className="flex items-center justify-between mb-6 pb-2">
            <div className="text-xs sm:text-sm text-zinc-300 font-medium flex items-center gap-2">
              <span>Showing</span>
              <span className="text-white font-bold">{filteredArticles.length}</span>
              <span>{activeCategory === 'free' ? 'free plugins & freeware news' : 'articles'}</span>
              {searchQuery && (
                <span>
                  matching &ldquo;<span className="text-[#FC6301]">{searchQuery}</span>&rdquo;
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setActiveCategory('all')
                setSearchQuery('')
              }}
              className="text-xs text-zinc-400 hover:text-[#FC6301] font-semibold transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Empty State when no articles match search/filter */}
        {filteredArticles.length === 0 && (
          <div className="py-16 text-center border border-[#222226] rounded-2xl bg-[#161618] my-8">
            <p className="text-base text-zinc-300 font-semibold mb-2">No matching news articles found</p>
            <p className="text-xs text-zinc-500 mb-5">Try checking your spelling or selecting another category.</p>
            <button
              onClick={() => {
                setActiveCategory('all')
                setSearchQuery('')
              }}
              className="px-5 py-2 bg-[#FC6301] text-white text-xs font-bold rounded-xl hover:bg-[#e05800] transition-colors cursor-pointer"
            >
              View All News
            </button>
          </div>
        )}

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
                    alt={`${cleanHtmlTitle(article.title)} - Free Plugin & Audio News - Producer Toy`}
                    title={`${cleanHtmlTitle(article.title)} - Producer Toy`}
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
                      alt={`${cleanHtmlTitle(article.title)} - Free Plugin & Audio News - Producer Toy`}
                      title={`${cleanHtmlTitle(article.title)} - Producer Toy`}
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
