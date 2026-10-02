'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Copy,
  Check,
  ExternalLink,
  Tag,
  Clock,
} from 'lucide-react'
import { NewsArticle } from '@/lib/turso/newsDb'
import { BlogContentRenderer } from '@/components/blog/BlogContentRenderer'
import { NewsGoogleAd } from '@/components/news/NewsGoogleAd'
import { detectDealExpiry } from '@/lib/news/dealExpiry'

interface NewsArticleClientProps {
  article: NewsArticle
  relatedArticles: NewsArticle[]
}

export function NewsArticleClient({ article, relatedArticles }: NewsArticleClientProps) {
  const [copied, setCopied] = useState(false)
  const [copiedCoupon, setCopiedCoupon] = useState(false)

  const expiryInfo = detectDealExpiry(article)
  const isExpired = expiryInfo.isExpired
  const expiryTimeline = expiryInfo.expiryTimeline

  const couponCode =
    article.specs?.['Coupon Code'] ||
    article.specs?.['Coupon'] ||
    article.specs?.['Promo Code'] ||
    article.specs?.['coupon_code'] ||
    (article as any).coupon_code

  const handleCopyCoupon = () => {
    if (couponCode && typeof window !== 'undefined') {
      navigator.clipboard.writeText(couponCode)
      setCopiedCoupon(true)
      setTimeout(() => setCopiedCoupon(false), 2000)
    }
  }

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formattedDate = new Date(article.published_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

  // Format price
  const displayPrice = article.deal_price || (article.category === 'Free VSTs' ? 'FREE' : 'FREE / PROMO')

  // Detect if article is a multi-deal roundup with multiple product purchase links
  const ctaLinksCount = (article.content?.match(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g) || []).length
  const isMultiDeal =
    ctaLinksCount > 1 ||
    (article.title?.includes(',') && ctaLinksCount >= 1) ||
    /deals|roundup|plugins on sale|best deals|top deals|3 strong|4 strong|5 strong/i.test(article.title || '')

  // Check if article already contains an explicit CTA action button inside its markdown content
  const hasInlineCta = Boolean(
    article.content &&
    /\[(get|claim|grab|download|buy|save|view|redeem|official)[^\]]*\]\(/i.test(article.content)
  )

  const PB_AFFILIATE_ID = '68affa2b94f43'

  const resolveOfferLink = (url?: string | null): string => {
    if (!url || url === '/store' || url.includes('producertoy.com/store')) {
      return `https://www.pluginboutique.com/deals?a_aid=${PB_AFFILIATE_ID}`
    }
    const lower = url.toLowerCase()
    if (
      /\.(jpg|jpeg|png|webp|gif|svg|avif)(\?.*)?$/i.test(url) ||
      lower.includes('ytimg.com') ||
      lower.includes('youtube.com') ||
      lower.includes('youtu.be')
    ) {
      return `https://www.pluginboutique.com/deals?a_aid=${PB_AFFILIATE_ID}`
    }
    if (
      lower.includes('gearnews.com') ||
      lower.includes('bedroomproducersblog.com') ||
      lower.includes('rekkerd.org') ||
      lower.includes('kvraudio.com') ||
      lower.includes('musictech.com') ||
      lower.includes('cdm.link') ||
      lower.includes('news.google.com')
    ) {
      return `https://www.pluginboutique.com/deals?a_aid=${PB_AFFILIATE_ID}`
    }
    if (url.includes('pluginboutique.com')) {
      try {
        const parsed = new URL(url)
        Array.from(parsed.searchParams.keys()).forEach(key => {
          if (key !== 'a_aid') {
            if (/^data\d*$/i.test(key) || /^utm_/i.test(key) || key.toLowerCase() === 'affiliate') {
              parsed.searchParams.delete(key)
            }
          }
        })
        parsed.searchParams.set('a_aid', PB_AFFILIATE_ID)
        return parsed.toString()
      } catch {
        let clean = url.replace(/[?&]data\d*=[^&]*/gi, '')
        if (clean.includes('a_aid=')) {
          return clean.replace(/a_aid=[a-zA-Z0-9_-]+/g, `a_aid=${PB_AFFILIATE_ID}`)
        }
        return clean.includes('?') ? `${clean}&a_aid=${PB_AFFILIATE_ID}` : `${clean}?a_aid=${PB_AFFILIATE_ID}`
      }
    }
    return url
  }

  const offerUrl = resolveOfferLink(article.source_url)

  const getHighResCoverImage = (url?: string | null, title?: string): string => {
    if (
      !url ||
      typeof url !== 'string' ||
      url.includes('googleusercontent.com') ||
      url.includes('gstatic.com') ||
      url.includes('news.google.com') ||
      url.includes('placeholder')
    ) {
      const cleanTitle = (title || 'music production vst audio plugin').replace(/&#?[a-z0-9]+;/gi, ' ').slice(0, 80)
      const prompt = `sleek futuristic music production synthesizer daw studio vst plugin neon amber lighting high resolution 8k render, professional audio technology article header for ${cleanTitle}`
      return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1920&height=1080&nologo=true`
    }
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
    <article className="min-h-screen bg-[#121212] text-white selection:bg-[#FC6301] selection:text-white relative overflow-hidden">
      {/* 1:1 Epic Games Sharp Atmospheric Product Background: Full clarity at top behind transparent fixed header, smoothly dissolves down into pure #121212 */}
      <div
        className="absolute top-0 left-0 right-0 w-full overflow-hidden z-0 pointer-events-none select-none"
        style={{ height: '620px' }}
      >
        <img
          src={getHighResCoverImage(article.cover_image, article.title)}
          alt=""
          className="w-full h-full object-cover object-top opacity-100"
          style={{
            maskImage:
              'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 120px, rgba(0,0,0,0.75) 300px, rgba(0,0,0,0.15) 75%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 120px, rgba(0,0,0,0.75) 300px, rgba(0,0,0,0.15) 75%, transparent 100%)',
          }}
        />
        {/* Rich dark atmospheric tint overlay: Ensures all text is 100% crystal clear and high-contrast, even when the cover image is pure white or brightly colored */}
        <div className="absolute inset-0 bg-[#121212]/75 backdrop-blur-[3px]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(18,18,18,0.75) 0%, rgba(18,18,18,0.92) 200px, #121212 520px)',
          }}
        />
      </div>

      {/* Main Page Content Layer */}
      <div className="relative z-10 px-4 sm:px-6 pt-24 sm:pt-32 lg:pt-38 pb-16 sm:pb-24">
        
        {/* 1:1 Epic Games Centered Header Block: Title + Description in the middle of page */}
        <div
          className="w-full mx-auto"
          style={{ maxWidth: '820px', marginLeft: 'auto', marginRight: 'auto' }}
        >
          {/* Top Meta Row: Category Pill + Date + Expiry Status */}
          <div className="flex flex-wrap items-center gap-3 mb-4 sm:mb-5">
            <span className="px-3 py-1 rounded-md bg-[#242426] text-zinc-200 text-xs font-semibold tracking-wide border border-white/5 shadow-sm">
              {article.category || 'News'}
            </span>
            <span className="text-zinc-400 text-xs sm:text-sm font-medium drop-shadow-sm">
              {formattedDate}
            </span>
            {isExpired ? (
              <span className="px-2.5 py-0.5 rounded-md bg-white/5 text-zinc-400 text-xs font-semibold tracking-wide border border-white/10">
                Expired
              </span>
            ) : expiryTimeline ? (
              <span className="px-2.5 py-0.5 rounded-md bg-white/5 text-zinc-300 text-xs font-semibold tracking-wide border border-white/10 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                {expiryTimeline}
              </span>
            ) : null}
          </div>

          {/* 1:1 Epic Games Headline */}
          <h1 className="text-2xl sm:text-4xl lg:text-[46px] font-black text-white leading-[1.12] tracking-tight mb-5 sm:mb-6 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            {cleanHtmlTitle(article.title)}
            {isExpired && (
              <span className="ml-2.5 sm:ml-3.5 text-zinc-400 font-bold text-lg sm:text-2xl lg:text-3xl tracking-normal inline-block align-baseline select-none">
                [Expired]
              </span>
            )}
          </h1>

          {/* Short Description / Excerpt below Title */}
          {article.excerpt && (
            <p className="text-base sm:text-lg text-zinc-200 leading-relaxed font-normal mb-10 sm:mb-14 drop-shadow-[0_1px_6px_rgba(0,0,0,0.85)]">
              {article.excerpt}
            </p>
          )}
        </div>

        {/* 1:1 Epic Games Hero Image Banner: Website-wide (max-w-[1280px]), NO white border */}
        <div
          className="w-full mx-auto mb-12 sm:mb-16"
          style={{ maxWidth: '1280px', marginLeft: 'auto', marginRight: 'auto' }}
        >
          <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-[#181818] shadow-[0_24px_60px_rgba(0,0,0,0.95)]">
            <img
              src={getHighResCoverImage(article.cover_image, article.title)}
              alt={`${cleanHtmlTitle(article.title)} - Free Plugin & Audio News - Producer Toy`}
              title={`${cleanHtmlTitle(article.title)} - Producer Toy`}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Story Reading Column: Clean 820px width matching Headline */}
        <div
          className="w-full mx-auto"
          style={{ maxWidth: '820px', marginLeft: 'auto', marginRight: 'auto' }}
        >
          {/* Prominent 1-Click Copy Coupon Box inside story if coupon exists */}
          {couponCode && (
            <div className="mb-8 p-4 sm:p-5 bg-[#18181c] border border-[#FC6301]/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#FC6301]/10 border border-[#FC6301]/30 flex items-center justify-center shrink-0 text-[#FC6301]">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Exclusive Coupon / Promo Code
                  </div>
                  <div className="text-lg sm:text-xl font-mono font-black text-white tracking-widest">
                    {couponCode}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleCopyCoupon}
                  className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs sm:text-sm rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer shrink-0"
                >
                  {copiedCoupon ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCoupon ? 'Code Copied!' : 'Copy Code'}</span>
                </button>
                <a
                  href={offerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex px-4 py-2.5 bg-[#FC6301] hover:bg-[#e05800] text-white font-extrabold text-xs sm:text-sm rounded-xl active:scale-95 transition-all items-center gap-1.5 shadow-md cursor-pointer shrink-0"
                >
                  <span>Redeem Deal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* Main Story Content */}
          <div className="prose prose-invert max-w-none text-[#d4d4d8] leading-[1.85] text-base sm:text-[17px] font-normal">
            <BlogContentRenderer
              content={article.content}
              isExpired={isExpired}
              expiryTimeline={expiryTimeline}
              fallbackDealUrl={offerUrl}
            />
          </div>

          {/* Guaranteed Deal CTA Button: Always displays at bottom of every deal article */}
          {offerUrl && (
            <div className="my-10 flex flex-col items-center justify-center w-full clear-both">
              <a
                href={offerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#FC6301] hover:bg-[#e05800] text-white font-bold text-base rounded-xl transition-all shadow-lg hover:shadow-[#FC6301]/30 active:scale-95 no-underline text-center group"
              >
                <span>
                  {article.category === 'Free VSTs' || article.deal_price === '$0' || article.title?.toLowerCase().includes('free')
                    ? 'Download Free Plugin'
                    : 'Get Official Deal'}
                </span>
                <ExternalLink className="w-4 h-4 text-white shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </a>
              {isExpired ? (
                <span className="mt-2 text-xs sm:text-sm text-zinc-400 font-medium tracking-wide">
                  Expired
                </span>
              ) : expiryTimeline ? (
                <span className="mt-2 text-xs sm:text-sm text-zinc-400 font-medium tracking-wide">
                  {expiryTimeline}
                </span>
              ) : null}
            </div>
          )}

          {/* Dedicated In-Article Google Ad Slot */}
          <div className="my-10">
            <NewsGoogleAd slot="news_article_inline" />
          </div>

          {/* Article Footer Bar: Author & Share */}
          <div className="my-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs sm:text-sm text-zinc-400">
            <span>Author: <strong className="text-zinc-200 font-semibold">{article.author_name}</strong></span>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Link Copied' : 'Share Story'}</span>
            </button>
          </div>
        </div>

        {/* More Stories Grid matching Epic Games (Wider 1280px container) */}
        {relatedArticles.length > 0 && (
          <div
            className="w-full mx-auto mt-16 sm:mt-24 pt-12 border-t border-white/10"
            style={{ maxWidth: '1280px', marginLeft: 'auto', marginRight: 'auto' }}
          >
            <h4 className="text-xl sm:text-2xl font-bold text-white mb-6">
              Related Stories
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedArticles.slice(0, 3).map((rel) => (
                <Link
                  key={rel.slug}
                  href={`/news/${rel.slug}`}
                  prefetch={true}
                  className="group flex flex-col gap-2.5 cursor-pointer"
                >
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#181818] border border-white/5">
                    <Image
                      src={getHighResCoverImage(rel.cover_image, rel.title)}
                      alt={cleanHtmlTitle(rel.title)}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 group-hover:brightness-110 transition-all duration-300"
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    {rel.category || 'News'}
                  </span>
                  <h5 className="text-sm font-bold text-white group-hover:text-zinc-300 transition-colors line-clamp-2 leading-snug">
                    {cleanHtmlTitle(rel.title)}
                    {detectDealExpiry(rel).isExpired && (
                      <span className="ml-1.5 text-zinc-400 font-bold text-xs tracking-normal inline-block align-baseline">
                        [Expired]
                      </span>
                    )}
                  </h5>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Copyright & Disclaimer matching Epic Games */}
        <div
          className="w-full mx-auto mt-16 pt-8 border-t border-white/5 text-center text-xs text-zinc-500 font-normal leading-relaxed"
          style={{ maxWidth: '820px', marginLeft: 'auto', marginRight: 'auto' }}
        >
          <p>
            © 2026 Producer Toy Editorial &amp; respective rights holders. All brand names, logos, and product trademarks are the property of their respective developers.
          </p>
        </div>

      </div>
    </article>
  )
}
