'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BlogPost } from '@/lib/data/blogs'

interface BlogCardProps {
  post: BlogPost
  priority?: boolean
}

export function BlogCard({ post, priority = false }: BlogCardProps) {
  const formattedDate = new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <article className="group flex flex-col bg-[#1c1c1c] hover:bg-[#222222] border border-[#262626] hover:border-[#333333] rounded-[24px] p-4 sm:p-5 transition-all duration-300 shadow-md hover:shadow-2xl select-none">
      {/* 16:9 Rounded Image Container with Category Pill */}
      <Link
        href={`/blog/${post.slug}`}
        prefetch={true}
        className="relative aspect-[16/9] w-full rounded-[16px] overflow-hidden bg-[#121212] block"
      >
        <Image
          src={post.cover_image || '/Icon.png'}
          alt={post.title}
          fill
          priority={priority}
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Floating Pill Badge on Bottom-Left Corner (Exact Epic Games News Style) */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="px-3 py-1 text-[11px] font-bold text-white bg-black/75 backdrop-blur-md rounded-full border border-white/10 shadow-md tracking-wide">
            {post.category || 'News'}
          </span>
        </div>
      </Link>

      {/* Content Section */}
      <div className="pt-4 pb-2 px-1 flex flex-col flex-1 justify-between">
        <div className="space-y-1.5">
          {/* Publication Date */}
          <p className="text-xs font-medium text-zinc-400">
            {formattedDate}
          </p>

          {/* Article Headline */}
          <Link href={`/blog/${post.slug}`} prefetch={true} className="block group/title">
            <h3 className="text-base sm:text-lg font-bold text-white group-hover/title:text-[#FA742B] transition-colors leading-snug line-clamp-2">
              {post.title}
            </h3>
          </Link>

          {/* Excerpt Description */}
          {post.excerpt && (
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-3 font-normal pt-1">
              {post.excerpt}
            </p>
          )}
        </div>
      </div>
    </article>
  )
}

export default BlogCard
