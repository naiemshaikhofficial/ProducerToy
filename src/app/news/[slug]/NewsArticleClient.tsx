'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Bookmark,
  Copy,
  Check,
  ExternalLink,
  ImageIcon,
} from 'lucide-react'
import { NewsArticle } from '@/lib/turso/newsDb'
import { BlogContentRenderer } from '@/components/blog/BlogContentRenderer'

interface NewsArticleClientProps {
  article: NewsArticle
  relatedArticles: NewsArticle[]
}

export function NewsArticleClient({ article, relatedArticles }: NewsArticleClientProps) {
  const [copied, setCopied] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formattedDate = new Date(article.published_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  // Format price
  const displayPrice = article.deal_price || (article.category === 'Free VSTs' ? 'FREE' : 'FREE / PROMO')

  return (
    <article className="min-h-screen bg-[#121212] text-white selection:bg-[#FC6301] selection:text-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10">

        {/* 1:1 Epic Games Split Hero: Ek Taraf Text Card, Ek Taraf Picture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-10 sm:mb-14 items-stretch">
          
          {/* Left Hero Card (5 cols) */}
          <div className="lg:col-span-5 bg-[#18181c] border border-[#26262a] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xl min-h-[340px] lg:min-h-[420px]">
            <div>
              {/* Top Tag Badge */}
              <div className="mb-4">
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-md bg-[#24242a] text-zinc-300 border border-white/5">
                  {article.badge === 'FREEWARE' ? 'FREEWARE' : 'ARTICLE'}
                </span>
              </div>

              {/* Bold Article Headline */}
              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-extrabold text-white leading-[1.25] tracking-tight">
                {article.title}
              </h1>
            </div>

            {/* Bottom Author & Date Bar */}
            <div className="flex items-center gap-3 pt-6 border-t border-[#26262a] mt-6">
              <div className="w-8 h-8 rounded-full bg-[#2a2a32] text-zinc-200 font-bold text-xs flex items-center justify-center border border-white/10 uppercase">
                {article.author_name.charAt(0) || 'P'}
              </div>
              <div className="text-xs sm:text-sm font-bold text-white tracking-tight">
                {article.author_name}
              </div>
              <div className="ml-auto text-xs sm:text-sm text-zinc-400 font-medium">
                {formattedDate}
              </div>
            </div>
          </div>

          {/* Right Hero Picture (7 cols) */}
          <div className="lg:col-span-7 relative aspect-video lg:aspect-auto rounded-2xl overflow-hidden bg-[#18181c] border border-[#26262a] shadow-xl min-h-[340px] lg:min-h-[420px]">
            <Image
              src={article.cover_image}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

            {/* Bottom-left Media Count Pill matching Epic Games [🖼 8] */}
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-md border border-white/10 text-xs font-bold text-white shadow-lg">
              <ImageIcon className="w-3.5 h-3.5 text-zinc-300" />
              <span>HD</span>
            </div>
          </div>
        </div>

        {/* Sub-Headline Bar matching Epic Games screenshot */}
        <div className="text-sm sm:text-base mb-8 leading-relaxed flex flex-wrap items-center gap-2 font-medium border-b border-[#202024] pb-5">
          <span className="text-[#FC6301] font-bold">
            {article.title}
          </span>
          <span className="text-zinc-500 font-bold">|</span>
          <span className="text-white font-bold">
            {article.category}
          </span>
          <span className="text-zinc-500 font-bold">|</span>
          <span className="text-zinc-400">
            Release Date: {formattedDate}
          </span>
        </div>

        {/* 2-Column Content Grid: Main Article Text + Sticky "IN THIS STORY" Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          
          {/* Main Story Body (8 cols) */}
          <div className="lg:col-span-8 flex flex-col">
            {/* Markdown Body Text */}
            <div className="prose prose-invert max-w-none text-[#d4d4d8] leading-[1.8] text-base sm:text-lg">
              <BlogContentRenderer content={article.content} />
            </div>

            {/* Mid-Article Wide Feature Image */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden my-8 sm:my-10 bg-[#18181c] border border-[#26262a] shadow-xl">
              <Image
                src={article.cover_image}
                alt={article.title}
                fill
                sizes="(max-width: 1024px) 100vw, 800px"
                className="object-cover"
              />
            </div>

            {/* Action Bar (Share & Direct Link) */}
            <div className="pt-6 border-t border-[#202024] flex items-center justify-between">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 bg-[#18181c] hover:bg-[#202026] text-white text-xs font-bold rounded-xl border border-[#28282e] transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Copied' : 'Share Story'}</span>
              </button>

              {article.source_url && (
                <a
                  href={article.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-[#FC6301] hover:bg-[#e05800] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <span>Get Official Download</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Sticky Sidebar matching Epic Games "IN THIS STORY" */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
              IN THIS STORY
            </div>

            {/* Story Card Container */}
            <div className="bg-[#18181c] border border-[#26262a] rounded-2xl p-5 shadow-xl flex flex-col gap-5">
              
              {/* Primary Item */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-bold text-sm sm:text-base text-white truncate hover:text-[#FC6301] transition-colors">
                    {article.title}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-zinc-400 mt-1">
                    {displayPrice}
                  </span>
                </div>

                {/* Bookmark Button */}
                <button
                  onClick={() => setBookmarked(!bookmarked)}
                  aria-label="Bookmark"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all cursor-pointer ${
                    bookmarked
                      ? 'bg-[#FC6301] border-[#FC6301] text-white'
                      : 'bg-[#222228] hover:bg-[#2a2a32] border-[#2e2e38] text-zinc-300'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Direct CTA Button */}
              {article.source_url ? (
                <a
                  href={article.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#FC6301] hover:bg-[#e05800] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <span>Download Now</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <Link
                  href="/store"
                  className="w-full py-3 bg-[#FC6301] hover:bg-[#e05800] text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <span>View in Store</span>
                </Link>
              )}
            </div>

            {/* Related Story Card */}
            {relatedArticles.length > 0 && (
              <div className="bg-[#18181c] border border-[#26262a] rounded-2xl p-5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-3">
                  More Stories
                </div>
                <div className="space-y-4">
                  {relatedArticles.slice(0, 3).map((rel) => (
                    <Link
                      key={rel.slug}
                      href={`/news/${rel.slug}`}
                      className="group flex items-center justify-between gap-3 text-xs"
                    >
                      <span className="text-zinc-300 group-hover:text-white font-medium line-clamp-2 leading-snug">
                        {rel.title}
                      </span>
                      <span className="text-[11px] font-bold text-[#FC6301] shrink-0">
                        {rel.deal_price || 'FREE'}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

      </div>
    </article>
  )
}
