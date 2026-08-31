'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BlogPost } from '@/lib/data/blogs'
import { Clock, Calendar, ArrowRight, Sparkles } from 'lucide-react'

interface BlogHeroProps {
  post: BlogPost
}

export function BlogHero({ post }: BlogHeroProps) {
  const formattedDate = new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <section className="relative w-full bg-[#181818] border border-[#282828] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:border-[#383838]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8 items-stretch">
        
        {/* Left / Top Artwork Section */}
        <Link
          href={`/blog/${post.slug}`}
          prefetch={true}
          className="lg:col-span-7 relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto w-full min-h-[260px] sm:min-h-[360px] lg:min-h-[420px] overflow-hidden bg-[#101010] block group"
        >
          <Image
            src={post.cover_image || '/Icon.png'}
            alt={post.title}
            fill
            priority
            unoptimized
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {/* Subtle gradient vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent lg:hidden opacity-90" />
        </Link>

        {/* Right / Bottom Info Section */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between gap-6 -mt-12 sm:-mt-16 lg:mt-0 relative z-10">
          <div className="space-y-4">
            
            {/* Badges Row */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="bg-[#FA742B] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-md flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-3 h-3 fill-white" />
                <span>Featured Story</span>
              </span>

              <span className="bg-[#242424] text-zinc-300 text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-md border border-[#333333]">
                {post.category || 'Guides'}
              </span>
            </div>

            {/* Title */}
            <Link href={`/blog/${post.slug}`} prefetch={true} className="block group">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white group-hover:text-[#FA742B] transition-colors leading-tight tracking-tight">
                {post.title}
              </h2>
            </Link>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed line-clamp-3 font-normal">
                {post.excerpt}
              </p>
            )}

            {/* Metadata (Date & Read Time) */}
            <div className="flex items-center gap-4 text-xs text-zinc-400 font-medium pt-1">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>{formattedDate}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>{post.read_time || '5 min read'}</span>
              </span>
            </div>

          </div>

          {/* Bottom Row: Author + CTA Button */}
          <div className="pt-6 border-t border-[#2a2a2a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Author */}
            <div className="flex items-center gap-3">
              {post.author_avatar ? (
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-zinc-700 bg-zinc-800 flex-shrink-0">
                  <Image
                    src={post.author_avatar}
                    alt={post.author_name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#2a2a2a] text-white text-xs font-bold flex items-center justify-center border border-zinc-700 flex-shrink-0">
                  {post.author_name ? post.author_name[0].toUpperCase() : 'P'}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-bold text-white leading-tight">{post.author_name}</span>
                <span className="text-[11px] text-zinc-400">{post.author_role || 'Producer Toy'}</span>
              </div>
            </div>

            {/* Read Article Button */}
            <Link
              href={`/blog/${post.slug}`}
              prefetch={true}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md active:scale-95 group/btn"
            >
              <span>Read Story</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>

          </div>

        </div>

      </div>
    </section>
  )
}

export default BlogHero
