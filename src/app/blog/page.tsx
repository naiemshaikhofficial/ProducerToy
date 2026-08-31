import React from 'react'
import { Metadata } from 'next'
import Link from 'next/link'
import { getBlogPosts, getFeaturedBlogPost, BlogPost } from '@/lib/data/blogs'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { BlogListJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd'
import { BlogHero } from '@/components/blog/BlogHero'
import { BlogListingClient } from '@/components/blog/BlogListingClient'
import { BlogNewsletterCard } from '@/components/blog/BlogNewsletterCard'

export const revalidate = 3600 // Edge Cache 1 Hour with on-demand instant purge

export const metadata: Metadata = generatePageMetadata({
  title: 'Blog & Production Guides | Music Production, Mixing & VST Tutorials',
  description:
    'Explore in-depth music production guides, free VST plugin roundups, vocal chain tutorials, and 808 sound design tips from the Producer Toy team.',
  path: '/blog',
  keywords: [
    'music production blog',
    'vst plugin guides',
    'mixing tutorials',
    'free vst plugins 2026',
    '808 bass mixing tips',
    'fl studio workflow hacks',
    'vocal pitch correction guide',
    'sound design masterclass',
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
            title: 'Top 10 Free VST Plugins Every Producer Needs in 2026',
            slug: 'top-10-free-vst-plugins-2026',
            excerpt:
              'From surgical dynamic EQs to vintage tube tape saturators, here is our ultimate ranking of the best free VST plugins of 2026.',
            content: '<p>Discover the top free plugins...</p>',
            cover_image:
              'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop',
            author_name: 'Alex Rivera',
            author_avatar:
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
            author_role: 'Lead Mixing Engineer',
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
    <div className="w-full bg-[#121212] min-h-screen text-white select-none">
      {/* Schema.org Structured Data */}
      <BlogListJsonLd
        title="Producer Toy Blog & Music Production Guides"
        description="Explore in-depth music production guides, free VST plugin roundups, vocal chain tutorials, and 808 sound design tips."
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
          { name: 'Blog', url: 'https://producertoy.com/blog' },
        ]}
      />

      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-20 sm:pb-28 space-y-12 sm:space-y-16">
        
        {/* Page Header Section */}
        <header className="space-y-4 max-w-3xl">
          {/* Breadcrumb row */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-400">
            <Link href="/" prefetch={true} className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white font-semibold">Blog & Guides</span>
          </nav>

          <div className="space-y-2">
            <span className="text-xs font-bold text-[#FA742B] tracking-wider uppercase">
              The Ultimate Playground for Music Producers
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight font-sans">
              Where Producers Find Their Toys.
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
              Explore in-depth sound design masterclasses, free VST roundups, sample pack business guides, and workflow tutorials crafted for modern beatmakers.
            </p>
          </div>
        </header>

        {/* Hero Featured Article */}
        {activeFeatured && <BlogHero post={activeFeatured} />}

        {/* Main Interactive Blog Listing */}
        <BlogListingClient initialPosts={posts} featuredPostId={activeFeatured?.id} />

        {/* Newsletter & Free Downloads Subscription Banner */}
        <BlogNewsletterCard />

      </div>
    </div>
  )
}
