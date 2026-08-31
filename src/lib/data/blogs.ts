import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { getAdminClient } from '@/lib/supabase/admin'

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image: string | null
  author_name: string
  author_avatar: string | null
  author_role: string | null
  category: string
  tags: string[]
  read_time: string
  is_published: boolean
  is_featured: boolean
  published_at: string
  created_at: string
  updated_at: string
  meta_title?: string | null
  meta_description?: string | null
  meta_keywords?: string[] | null
}

export const BLOG_CARD_SELECT = `
  id,
  title,
  slug,
  excerpt,
  cover_image,
  author_name,
  author_avatar,
  author_role,
  category,
  tags,
  read_time,
  is_published,
  is_featured,
  published_at,
  created_at,
  updated_at
`

/**
 * Fetch all published blog posts with optional category filter, cached at the Next.js Data Cache layer.
 */
export const getBlogPosts = cache(
  unstable_cache(
    async (category?: string, search?: string): Promise<BlogPost[]> => {
      const supabase = getAdminClient()
      try {
        let query = supabase
          .from('blogs')
          .select('*')
          .eq('is_published', true)
          .order('published_at', { ascending: false })

        if (category && category !== 'All') {
          query = query.ilike('category', `%${category}%`)
        }

        if (search && search.trim()) {
          query = query.or(`title.ilike.%${search.trim()}%,excerpt.ilike.%${search.trim()}%,content.ilike.%${search.trim()}%`)
        }

        const { data, error } = await query

        if (error) {
          console.error('Error fetching blog posts from Supabase:', error)
          return []
        }

        return (data as BlogPost[]) || []
      } catch (err) {
        console.error('Unexpected error in getBlogPosts:', err)
        return []
      }
    },
    ['blog_posts_list_cache_key'],
    {
      revalidate: 3600, // 1 hour edge cache, instantly purged on demand
      tags: ['blogs', 'blog_posts'],
    }
  )
)

/**
 * Fetch a single blog post by its URL slug.
 */
export const getBlogPostBySlug = cache(
  unstable_cache(
    async (slug: string): Promise<BlogPost | null> => {
      if (!slug) return null
      const supabase = getAdminClient()
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single()

        if (error || !data) {
          return null
        }

        return data as BlogPost
      } catch (err) {
        console.error(`Unexpected error in getBlogPostBySlug for slug "${slug}":`, err)
        return null
      }
    },
    ['single_blog_post_cache_key'],
    {
      revalidate: 3600,
      tags: ['blogs'],
    }
  )
)

/**
 * Fetch the primary featured blog post.
 */
export const getFeaturedBlogPost = cache(
  unstable_cache(
    async (): Promise<BlogPost | null> => {
      const supabase = getAdminClient()
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('is_published', true)
          .eq('is_featured', true)
          .order('published_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (error || !data) {
          // If no featured flag is true, return the newest published post
          const { data: latestData } = await supabase
            .from('blogs')
            .select('*')
            .eq('is_published', true)
            .order('published_at', { ascending: false })
            .limit(1)
            .maybeSingle()
          return latestData as BlogPost | null
        }

        return data as BlogPost
      } catch (err) {
        console.error('Error fetching featured blog post:', err)
        return null
      }
    },
    ['featured_blog_post_cache_key'],
    {
      revalidate: 3600,
      tags: ['blogs'],
    }
  )
)

/**
 * Fetch related blog posts by matching category or tags, excluding current post.
 */
export const getRelatedBlogPosts = cache(
  unstable_cache(
    async (category: string, currentSlug: string, limit = 3): Promise<BlogPost[]> => {
      const supabase = getAdminClient()
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select(BLOG_CARD_SELECT)
          .eq('is_published', true)
          .neq('slug', currentSlug)
          .ilike('category', `%${category}%`)
          .order('published_at', { ascending: false })
          .limit(limit)

        if (error || !data || data.length === 0) {
          // Fallback to any recent posts if not enough in same category
          const { data: fallbackData } = await supabase
            .from('blogs')
            .select(BLOG_CARD_SELECT)
            .eq('is_published', true)
            .neq('slug', currentSlug)
            .order('published_at', { ascending: false })
            .limit(limit)
          return (fallbackData as BlogPost[]) || []
        }

        return (data as BlogPost[]) || []
      } catch (err) {
        console.error('Error fetching related blog posts:', err)
        return []
      }
    },
    ['related_blog_posts_cache_key'],
    {
      revalidate: 3600,
      tags: ['blogs'],
    }
  )
)

/**
 * Fetch all published blog slugs for static generation and sitemap.
 */
export async function getAllBlogSlugs(): Promise<string[]> {
  const supabase = getAdminClient()
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('slug')
      .eq('is_published', true)

    if (error || !data) return []
    return data.map((item) => item.slug)
  } catch (err) {
    console.error('Error getting all blog slugs:', err)
    return []
  }
}
