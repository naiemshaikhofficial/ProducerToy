'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BlogPost } from '@/lib/data/blogs'

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
    <section className="relative w-full mb-12 sm:mb-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Side: 16:9 Large Rounded Media Container */}
        <Link
          href={`/blog/${post.slug}`}
          prefetch={true}
          className="lg:col-span-7 relative aspect-[16/9] w-full rounded-[24px] sm:rounded-[28px] overflow-hidden bg-[#181818] block group shadow-2xl transition-transform duration-300"
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

          {/* Bottom-left Floating Pill Badge (Exact Epic Games News Pill) */}
          <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-10">
            <span className="px-3.5 py-1.5 text-xs font-bold text-white bg-black/75 backdrop-blur-md rounded-full border border-white/10 shadow-lg tracking-wide">
              {post.category || 'News'}
            </span>
          </div>
        </Link>

        {/* Right Side: Clean Typography & Read More Button (Exact Epic Games News Style with Brand Orange) */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-4 sm:space-y-5">
          {/* Publication Date */}
          <p className="text-xs sm:text-sm font-semibold text-zinc-400 tracking-normal">
            {formattedDate}
          </p>

          {/* Large Bold Headline */}
          <Link href={`/blog/${post.slug}`} prefetch={true} className="block group">
            <h1 className="text-2xl sm:text-3xl lg:text-[40px] font-black text-white leading-[1.18] tracking-tight group-hover:text-[#FA742B] transition-colors">
              {post.title}
            </h1>
          </Link>

          {/* Excerpt Summary */}
          {post.excerpt && (
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed line-clamp-3 font-normal">
              {post.excerpt}
            </p>
          )}

          {/* Producer Toy Brand Orange Read More Button */}
          <div className="pt-2">
            <Link
              href={`/blog/${post.slug}`}
              prefetch={true}
              className="inline-flex items-center justify-center px-7 py-3 rounded-xl bg-[#FA742B] hover:bg-[#e05800] text-white font-extrabold text-sm tracking-normal transition-all shadow-lg hover:shadow-[#FA742B]/25 active:scale-95 cursor-pointer uppercase tracking-wider"
            >
              Read more
            </Link>
          </div>
        </div>

      </div>
    </section>
  )
}

export default BlogHero
