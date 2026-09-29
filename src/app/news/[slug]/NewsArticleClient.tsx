'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronRight,
  Clock,
  User,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Tag,
  Sparkles,
  ArrowLeft,
  Flame,
  Download,
} from 'lucide-react'
import { NewsArticle } from '@/lib/turso/newsDb'
import { BlogContentRenderer } from '@/components/blog/BlogContentRenderer'

interface NewsArticleClientProps {
  article: NewsArticle
  relatedArticles: NewsArticle[]
}

export function NewsArticleClient({ article, relatedArticles }: NewsArticleClientProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleTwitterShare = () => {
    if (typeof window !== 'undefined') {
      const url = encodeURIComponent(window.location.href)
      const text = encodeURIComponent(`${article.title} via @ProducerToy`)
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank')
    }
  }

  const formattedDate = new Date(article.published_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <article className="min-h-screen bg-[#121212] text-white selection:bg-[#FC6301] selection:text-white">
      {/* Top Breadcrumb Navigation */}
      <div className="border-b border-[#222226] bg-[#16161a]/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-zinc-400 overflow-x-auto scrollbar-none">
            <Link
              href="/news"
              prefetch={true}
              className="hover:text-white font-medium transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>News</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
            <span className="text-zinc-300 font-semibold truncate shrink-0">{article.category}</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600 shrink-0 hidden sm:inline" />
            <span className="text-zinc-500 truncate hidden sm:inline max-w-[320px]">
              {article.title}
            </span>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#202024] hover:bg-[#28282d] text-zinc-300 hover:text-white rounded-lg border border-[#303036] transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Article Header */}
        <header className="mb-8 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <span
              className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider shadow-sm ${
                article.badge === 'FREEWARE'
                  ? 'bg-emerald-500 text-black'
                  : article.badge === 'HOT DEAL'
                  ? 'bg-[#FC6301] text-white'
                  : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
              }`}
            >
              {article.badge || 'NEWS'}
            </span>
            <span className="text-xs font-semibold text-zinc-400">
              {article.category}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="flex items-center gap-1 text-xs text-zinc-400 font-medium">
              <Clock className="w-3.5 h-3.5" />
              {article.reading_time}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.18] mb-4">
            {article.title}
          </h1>

          {article.excerpt && (
            <p className="text-base sm:text-xl text-zinc-300 font-normal leading-relaxed mb-6">
              {article.excerpt}
            </p>
          )}

          {/* Author & Publish Date Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#222226]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FC6301] to-[#FA742B] flex items-center justify-center text-white font-black text-sm shadow-md">
                {article.author_name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-tight">
                  {article.author_name}
                </div>
                <div className="text-xs text-zinc-400">
                  {article.author_role} • {formattedDate}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTwitterShare}
                aria-label="Share on X"
                className="w-9 h-9 rounded-lg bg-[#1e1e24] hover:bg-[#282830] border border-[#2e2e38] flex items-center justify-center text-zinc-300 hover:text-white transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* 16:9 Featured Cover Image */}
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-10 sm:mb-14 border border-[#26262a] shadow-2xl bg-black/50">
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 1240px) 100vw, 1240px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        {/* Main Content & Sticky Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Main Article Body (8 cols) */}
          <div className="lg:col-span-8 flex flex-col">
            {/* Callout Deal Card if Price exists */}
            {article.deal_price && (
              <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#161c16] to-[#121612] border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Special Audio Freeware / Deal Alert</span>
                  </div>
                  <div className="text-xl font-black text-white">
                    {article.title}
                  </div>
                  <div className="text-sm text-zinc-300 mt-1">
                    Price: <span className="font-bold text-emerald-400">{article.deal_price}</span>
                    {article.deal_regular_price && (
                      <span className="text-zinc-500 line-through ml-2">
                        {article.deal_regular_price}
                      </span>
                    )}
                  </div>
                </div>

                {article.source_url && (
                  <a
                    href={article.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center gap-2 active:scale-95"
                  >
                    <span>Claim Deal</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}

            {/* Markdown Content */}
            <BlogContentRenderer content={article.content} />

            {/* Quick Specs / System Requirements Box */}
            {article.specs && Object.keys(article.specs).length > 0 && (
              <div className="mt-10 p-6 rounded-2xl bg-[#18181c] border border-[#28282e]">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#FC6301]" />
                  <span>Release Specifications</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {Object.entries(article.specs).map(([key, value]) => (
                    <div
                      key={key}
                      className="p-3 rounded-xl bg-[#202026] border border-[#2b2b34] flex flex-col"
                    >
                      <span className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
                        {key}
                      </span>
                      <span className="text-white font-medium mt-0.5">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Sidebar (4 cols) matching Epic Games "IN THIS STORY" */}
          <aside className="lg:col-span-4">
            <div className="sticky top-20 space-y-6">
              {/* "IN THIS STORY" Card */}
              <div className="p-6 rounded-2xl bg-[#18181c] border border-[#28282e] shadow-xl">
                <div className="text-xs font-black uppercase tracking-wider text-zinc-400 mb-4 pb-2 border-b border-[#28282e]">
                  In This Story
                </div>

                <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-4 bg-black/40">
                  <Image
                    src={article.cover_image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 380px"
                    className="object-cover"
                  />
                </div>

                <div className="mb-4">
                  <span className="text-[11px] font-bold uppercase text-[#FC6301]">
                    {article.category}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1 leading-snug line-clamp-2">
                    {article.title}
                  </h4>
                  <div className="text-sm font-black text-emerald-400 mt-2">
                    {article.deal_price || 'FREEWARE / DEAL'}
                  </div>
                </div>

                {article.source_url ? (
                  <a
                    href={article.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-[#FC6301] hover:bg-[#e05800] text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <span>Get This Plugin</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                ) : (
                  <Link
                    href="/store"
                    className="w-full py-3 bg-[#FC6301] hover:bg-[#e05800] text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    <span>Browse Plugins</span>
                  </Link>
                )}
              </div>

              {/* Producer Toy Newsletter / Free Pack Promo */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1e1c24] to-[#16151c] border border-[#302a3a] text-center">
                <div className="w-10 h-10 rounded-full bg-[#FC6301]/20 text-[#FC6301] flex items-center justify-center mx-auto mb-3">
                  <Download className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white mb-1">
                  Want Free Sample Packs & VSTs?
                </h4>
                <p className="text-xs text-zinc-400 mb-4">
                  Join 10,000+ music producers getting weekly free downloads and sound libraries.
                </p>
                <Link
                  href="/store/sounds?price=free"
                  prefetch={true}
                  className="inline-block w-full py-2.5 bg-[#25252e] hover:bg-[#2e2e38] text-white font-bold text-xs rounded-xl border border-[#3a3a46] transition-colors"
                >
                  Download Free Packs
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Stories Footer (Epic Games Layout) */}
        {relatedArticles.length > 0 && (
          <section className="mt-16 sm:mt-24 pt-12 border-t border-[#222226]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-white tracking-tight">
                Related Stories
              </h3>
              <Link
                href="/news"
                prefetch={true}
                className="text-xs font-bold text-[#FC6301] hover:underline flex items-center gap-1"
              >
                <span>View All News</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel, idx) => (
                <Link
                  key={rel.id || idx}
                  href={`/news/${rel.slug}`}
                  prefetch={true}
                  className="group flex flex-col bg-[#18181c] rounded-xl overflow-hidden border border-[#26262a] hover:border-zinc-500 transition-all duration-300"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                    <Image
                      src={rel.cover_image}
                      alt={rel.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-[10px] font-bold uppercase text-[#FC6301] mb-1">
                      {rel.category}
                    </span>
                    <h4 className="text-sm font-bold text-white group-hover:text-zinc-200 transition-colors line-clamp-2 mb-2 leading-snug">
                      {rel.title}
                    </h4>
                    <span className="text-[11px] text-zinc-500 mt-auto">
                      {rel.reading_time}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  )
}
