'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { BlogPost } from '@/lib/data/blogs'
import { Clock, Calendar, ArrowUpRight } from 'lucide-react'

interface BlogCardProps {
  post: BlogPost
  priority?: boolean
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, priority = false }) => {
  const formattedDate = new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <article className="group flex flex-col bg-[#1c1c1c] hover:bg-[#222222] border border-[#282828] hover:border-[#383838] rounded-2xl overflow-hidden transition-all duration-200 shadow-lg hover:shadow-2xl hover:-translate-y-0.5 select-none">
      {/* Cover Image Container */}
      <Link
        href={`/blog/${post.slug}`}
        prefetch={true}
        className="relative aspect-[16/10] w-full overflow-hidden bg-[#141414] block"
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

        {/* Category Pill Overlay */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-[#121212]/85 backdrop-blur-md text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-white/10 shadow-md">
            {post.category || 'Guides'}
          </span>
        </div>
      </Link>

      {/* Content Container */}
      <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-2.5">
          {/* Metadata Row: Date & Read Time */}
          <div className="flex items-center gap-3 text-xs text-zinc-400 font-medium">
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

          {/* Article Title */}
          <Link href={`/blog/${post.slug}`} prefetch={true} className="block group/title">
            <h3 className="text-base sm:text-lg font-bold text-white group-hover/title:text-[#FA742B] transition-colors leading-snug line-clamp-2">
              {post.title}
            </h3>
          </Link>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-2 font-normal">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Bottom Author & Read Link Row */}
        <div className="pt-3 border-t border-[#262626] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {post.author_avatar ? (
              <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border border-zinc-700 bg-zinc-800">
                <Image
                  src={post.author_avatar}
                  alt={post.author_name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-[#2a2a2a] text-white text-[10px] font-bold flex items-center justify-center border border-zinc-700 flex-shrink-0">
                {post.author_name ? post.author_name[0].toUpperCase() : 'P'}
              </div>
            )}
            <span className="text-xs font-medium text-zinc-300 truncate">
              {post.author_name || 'Producer Toy'}
            </span>
          </div>

          <Link
            href={`/blog/${post.slug}`}
            prefetch={true}
            className="flex items-center gap-1 text-xs font-bold text-zinc-300 group-hover:text-white group-hover:translate-x-0.5 transition-all"
            aria-label={`Read article: ${post.title}`}
          >
            <span>Read</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#FA742B] transition-colors" />
          </Link>
        </div>
      </div>
    </article>
  )
}
