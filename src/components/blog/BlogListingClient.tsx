'use client'

import React, { useState, useMemo } from 'react'
import { BlogPost } from '@/lib/data/blogs'
import { BlogCard } from './BlogCard'
import { ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'

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
]

const POSTS_PER_PAGE = 6

export function BlogListingClient({
  initialPosts,
  featuredPostId,
}: BlogListingClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)

  // Filter posts by category
  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      // If featured post is shown in hero on 'All' view, don't duplicate on page 1
      if (selectedCategory === 'All' && featuredPostId && post.id === featuredPostId) {
        return false
      }

      if (selectedCategory === 'All') return true
      return post.category?.toLowerCase() === selectedCategory.toLowerCase()
    })
  }, [initialPosts, selectedCategory, featuredPostId])

  // Total pages
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE))

  // Sliced posts for current page
  const currentPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE
    return filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE)
  }, [filteredPosts, currentPage])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      // Smooth scroll to top of grid
      const gridElem = document.getElementById('news-grid-section')
      if (gridElem) {
        gridElem.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  return (
    <div id="news-grid-section" className="space-y-10 sm:space-y-12">
      {/* Category Pills Header */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              className={`text-xs sm:text-sm font-bold px-4 py-2 rounded-full transition-all whitespace-nowrap cursor-pointer border ${
                isSelected
                  ? 'bg-white text-black border-white shadow-md'
                  : 'bg-[#181818] hover:bg-[#242424] text-zinc-400 hover:text-white border-[#2c2c2c]'
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* 3-Column Responsive Grid (Exact Epic Games News 1:1 Layout) */}
      {currentPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 lg:gap-8">
          {currentPosts.map((post, idx) => (
            <BlogCard key={post.id} post={post} priority={idx < 3} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#181818] border border-[#262626] rounded-[24px] p-12 text-center space-y-4 my-8">
          <div className="w-12 h-12 rounded-full bg-[#242424] text-zinc-400 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-white">No articles found</h4>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
              There are no articles currently listed under {selectedCategory}.
            </p>
          </div>
        </div>
      )}

      {/* Epic Games Circular Pagination Controls (Exact 1:1 Match) */}
      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="flex items-center justify-center gap-2 sm:gap-3 pt-6 sm:pt-10"
        >
          {/* Previous Page Arrow */}
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Number Circles */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
            const isActive = pageNum === currentPage
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => handlePageChange(pageNum)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-9 h-9 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-black shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {pageNum}
              </button>
            )
          })}

          {/* Next Page Arrow */}
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}
    </div>
  )
}

export default BlogListingClient
