'use client'

import React, { useState, useMemo } from 'react'
import { BlogPost } from '@/lib/data/blogs'
import { BlogCard } from './BlogCard'
import { Search, X, SlidersHorizontal, BookOpen } from 'lucide-react'

interface BlogListingClientProps {
  initialPosts: BlogPost[]
  featuredPostId?: string
}

const CATEGORIES = [
  'All',
  'Plugins & VSTs',
  'Sound Design',
  'Guides',
  'Tutorials',
  'Freebies',
]

export const BlogListingClient: React.FC<BlogListingClientProps> = ({
  initialPosts,
  featuredPostId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter out featured post if on 'All' tab without search query to avoid duplicate display, but include it if searching
  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        post.category?.toLowerCase() === selectedCategory.toLowerCase()

      const query = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        (post.excerpt && post.excerpt.toLowerCase().includes(query)) ||
        (post.tags && post.tags.some((t) => t.toLowerCase().includes(query)))

      return matchesCategory && matchesSearch
    })
  }, [initialPosts, selectedCategory, searchQuery])

  // Split posts if on default view (exclude hero item)
  const displayPosts = useMemo(() => {
    if (selectedCategory === 'All' && !searchQuery.trim() && featuredPostId) {
      return filteredPosts.filter((p) => p.id !== featuredPostId)
    }
    return filteredPosts
  }, [filteredPosts, selectedCategory, searchQuery, featuredPostId])

  return (
    <div className="space-y-8">
      {/* Filter & Search Bar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#242424]">
        
        {/* Category Pills (Horizontal Scroll on Mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 md:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer border ${
                  isSelected
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-[#181818] hover:bg-[#222222] text-zinc-300 hover:text-white border-[#2c2c2c]'
                }`}
              >
                {cat}
              </button>
            )
          })}
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-[280px] lg:w-[320px] flex-shrink-0">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles, topics..."
            className="w-full bg-[#1c1c1c] hover:bg-[#222222] focus:bg-[#242424] text-white text-xs sm:text-sm pl-10 pr-9 h-[42px] rounded-xl border border-[#2c2c2c] focus:border-zinc-500 focus:outline-none placeholder:text-zinc-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 rounded-full cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

      {/* Grid Results Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>{selectedCategory === 'All' ? 'Latest Articles' : `${selectedCategory} Articles`}</span>
          <span className="text-xs text-zinc-500 font-normal">({displayPosts.length})</span>
        </h3>

        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('All')
            }}
            className="text-xs text-[#FA742B] hover:underline font-semibold cursor-pointer"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Posts Responsive Grid */}
      {displayPosts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayPosts.map((post, idx) => (
            <BlogCard key={post.id} post={post} priority={idx < 3} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#181818] border border-[#262626] rounded-2xl p-12 text-center space-y-4 my-8">
          <div className="w-12 h-12 rounded-full bg-[#242424] text-zinc-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white">No articles found</h4>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
              We couldn't find any articles matching &ldquo;{searchQuery || selectedCategory}&rdquo;. Try another search term or reset your filters.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('All')
            }}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
          >
            Show All Articles
          </button>
        </div>
      )}
    </div>
  )
}
