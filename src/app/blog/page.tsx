import React from 'react'
import { Metadata } from 'next'
import { getBlogPosts, getFeaturedBlogPost, BlogPost } from '@/lib/data/blogs'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { BlogListJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd'
import { BlogHero } from '@/components/blog/BlogHero'
import { BlogListingClient } from '@/components/blog/BlogListingClient'
import { BlogNewsletterCard } from '@/components/blog/BlogNewsletterCard'

export const revalidate = 3600 // Edge Cache 1 Hour with on-demand instant purge

export const metadata: Metadata = generatePageMetadata({
  title: 'News & Production Guides | Music Production, Mixing & VST Tutorials',
  description:
    'Explore the latest music production news, sound design guides, free VST plugin roundups, vocal chains, and 808 mixing tutorials on Producer Toy.',
  path: '/blog',
  keywords: [
    'music production news',
    'producer toy news',
    'vst plugin guides',
    'mixing tutorials',
    'free vst plugins 2026',
    '808 bass mixing tips',
    'fl studio workflow hacks',
    'serum sound design',
    'producer toy blog',
  ],
})

export default async function BlogPage() {
  const [allPosts, featuredPost] = await Promise.all([
    getBlogPosts(),
    getFeaturedBlogPost(),
  ])

  // Fallback demo posts if DB is empty
  const posts: BlogPost[] =
    allPosts.length > 0
      ? allPosts
      : [
          {
            id: '1',
            title: 'Best Free VST Plugins in 2026: 10 Must-Have Synths & Effects',
            slug: 'top-10-free-vst-plugins-2026',
            excerpt:
              'A tested, studio-grade ranking of the 10 best free VST plugins of 2026. Includes Vital spectral synth, TDR Nova dynamic EQ, Valhalla Supermassive, and tape saturators.',
            content: '<p>Discover the top free plugins...</p>',
            cover_image:
              'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop',
            author_name: 'Naiem Shaikh',
            author_avatar: '/authors/naiem-shaikh.jpg',
            author_role: 'Founder & Lead Audio Engineer',
            category: 'Plugins & VSTs',
            tags: ['vst', 'free-plugins', 'mixing'],
            read_time: '6 min read',
            is_published: true,
            is_featured: true,
            published_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]

  const activeFeatured = featuredPost || posts[0]

  return (
    <div className="w-full bg-[#121212] min-h-screen text-white font-sans">
      {/* Schema.org Structured Data for Google Indexing */}
      <BlogListJsonLd
        title="Producer Toy News & Music Production Guides"
        description="Explore the latest music production news, sound design guides, free VST plugin roundups, vocal chains, and 808 mixing tutorials."
        url="https://producertoy.com/blog"
        posts={posts.map((p) => ({
          title: p.title,
          url: `https://producertoy.com/blog/${p.slug}`,
          image: p.cover_image,
          datePublished: p.published_at || p.created_at,
          description: p.excerpt,
        }))}
      />
      <BreadcrumbJsonLd
        breadcrumbs={[
          { name: 'Home', url: 'https://producertoy.com' },
          { name: 'News', url: 'https://producertoy.com/blog' },
        ]}
      />

      <main className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-20 sm:pb-28 space-y-12 sm:space-y-16">
        
        {/* 1:1 Epic Games Featured Story Hero Banner */}
        {activeFeatured && <BlogHero post={activeFeatured} />}

        {/* 1:1 Epic Games 3-Column News Grid with Circular Pagination */}
        <BlogListingClient initialPosts={posts} featuredPostId={activeFeatured?.id} />

        {/* Newsletter & Free Downloads Subscription Banner */}
        <BlogNewsletterCard />

      </main>
    </div>
  )
}
