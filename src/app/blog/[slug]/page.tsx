import React from 'react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  getBlogPostBySlug,
  getRelatedBlogPosts,
  getAllBlogSlugs,
  BlogPost,
} from '@/lib/data/blogs'
import { generatePageMetadata } from '@/lib/seo/metadata'
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd'
import { BlogContentRenderer } from '@/components/blog/BlogContentRenderer'
import { BlogShareButtons } from '@/components/blog/BlogShareButtons'
import { BlogCard } from '@/components/blog/BlogCard'
import { Clock, Calendar, ArrowLeft, Tag, BookOpen, Sparkles } from 'lucide-react'

export const revalidate = false // 🟢 Infinite edge cache

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    return {
      title: 'Article Not Found | Producer Toy',
      description: 'The requested blog article could not be found.',
    }
  }

  const title = post.meta_title || `${post.title} | Producer Toy Blog`
  const description =
    post.meta_description ||
    post.excerpt ||
    `Read ${post.title} on Producer Toy. Discover mixing tips, VST guides, and music production workflows.`

  return generatePageMetadata({
    title,
    description,
    path: `/blog/${post.slug}`,
    image: post.cover_image || undefined,
    keywords: post.meta_keywords || post.tags || [post.title, post.category],
  })
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getBlogPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = await getRelatedBlogPosts(post.category, post.slug, 3)

  const formattedDate = new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const articleUrl = `https://producertoy.com/blog/${post.slug}`

  return (
    <article className="w-full bg-[#121212] min-h-screen text-white">
      {/* Schema.org Structured Data */}
      <ArticleJsonLd
        title={post.title}
        description={post.excerpt || undefined}
        url={articleUrl}
        image={post.cover_image}
        datePublished={post.published_at || post.created_at}
        dateModified={post.updated_at || post.published_at || post.created_at}
        authorName={post.author_name}
        authorRole={post.author_role}
        category={post.category}
        tags={post.tags}
      />
      <BreadcrumbJsonLd
        breadcrumbs={[
          { name: 'Home', url: 'https://producertoy.com' },
          { name: 'Blog', url: 'https://producertoy.com/blog' },
          { name: post.category, url: 'https://producertoy.com/blog' },
          { name: post.title, url: articleUrl },
        ]}
      />

      <div className="w-full max-w-[920px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-20 sm:pb-28 space-y-8 sm:space-y-12">
        
        {/* Back Link & Breadcrumb Nav */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#222222] pb-6">
          <Link
            href="/blog"
            prefetch={true}
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors group w-fit"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-[#FA742B]" />
            <span>Back to Blog</span>
          </Link>

          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-zinc-500 truncate max-w-full">
            <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-zinc-300 transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-zinc-300 truncate">{post.category}</span>
          </nav>
        </div>

        {/* Article Header Section */}
        <header className="space-y-6">
          
          {/* Badges & Read Time Row */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="bg-[#FA742B] text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-md shadow-md">
              {post.category || 'Guides'}
            </span>

            <div className="flex items-center gap-3 text-xs text-zinc-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <time dateTime={post.published_at || post.created_at}>{formattedDate}</time>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>{post.read_time || '5 min read'}</span>
              </span>
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.2] font-sans">
            {post.title}
          </h1>

          {/* Excerpt / Lead */}
          {post.excerpt && (
            <p className="text-base sm:text-xl text-zinc-300 leading-relaxed font-normal">
              {post.excerpt}
            </p>
          )}

          {/* Author Info & Share Bar */}
          <div className="pt-6 border-t border-[#242424] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            
            {/* Author */}
            <div className="flex items-center gap-3.5">
              {post.author_avatar ? (
                <div className="relative w-11 h-11 rounded-full overflow-hidden border border-zinc-700 bg-zinc-800 flex-shrink-0">
                  <Image
                    src={post.author_avatar}
                    alt={post.author_name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-11 h-11 rounded-full bg-[#2a2a2a] text-white text-sm font-bold flex items-center justify-center border border-zinc-700 flex-shrink-0">
                  {post.author_name ? post.author_name[0].toUpperCase() : 'P'}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-bold text-white leading-tight">
                  {post.author_name}
                </span>
                <span className="text-xs text-zinc-400">
                  {post.author_role || 'Audio Engineer & Sound Designer'}
                </span>
              </div>
            </div>

            {/* Social Share Controls */}
            <BlogShareButtons url={articleUrl} title={post.title} />

          </div>

        </header>

        {/* Featured Cover Image */}
        {post.cover_image && (
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#161616] border border-[#282828] shadow-2xl">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              priority
              unoptimized
              sizes="(max-width: 1024px) 100vw, 920px"
              className="object-cover"
            />
          </div>
        )}

        {/* Main Article Body */}
        <main className="pt-2">
          <BlogContentRenderer content={post.content} />
        </main>

        {/* Article Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="pt-8 border-t border-[#262626] space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5" />
              <span>Related Topics:</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[#1c1c1c] text-zinc-300 hover:text-white text-xs px-3 py-1.5 rounded-lg border border-[#2c2c2c] transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio Box */}
        <section className="bg-[#181818] border border-[#282828] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-xl">
          {post.author_avatar ? (
            <div className="relative w-16 h-16 rounded-full overflow-hidden border border-zinc-700 bg-zinc-800 flex-shrink-0">
              <Image
                src={post.author_avatar}
                alt={post.author_name}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#2a2a2a] text-white text-xl font-bold flex items-center justify-center border border-zinc-700 flex-shrink-0">
              {post.author_name ? post.author_name[0].toUpperCase() : 'P'}
            </div>
          )}
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">{post.author_name}</h3>
              <span className="text-xs text-[#FA742B] font-semibold">Author</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              {post.author_name === 'Naiem Shaikh'
                ? 'Founder & Lead Audio Engineer at Producer Toy. Dedicated to empowering music producers worldwide with cutting-edge VSTs, pristine soundware, and battle-tested studio workflows.'
                : 'Contributing audio engineer and music producer at Producer Toy. Passionate about analog hardware emulations, sound synthesis, and modern beatmaking workflows.'}
            </p>
          </div>
        </section>

        {/* Share Bar (Bottom of Post) */}
        <div className="p-6 bg-[#161616] border border-[#262626] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-white">Found this guide helpful?</h4>
            <p className="text-xs text-zinc-400">Share it with your producer friends or community.</p>
          </div>
          <BlogShareButtons url={articleUrl} title={post.title} />
        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <section className="pt-10 border-t border-[#262626] space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#FA742B]" />
                <span>Related Articles</span>
              </h3>
              <Link
                href="/blog"
                prefetch={true}
                className="text-xs font-bold text-zinc-400 hover:text-white transition-colors"
              >
                View all →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPosts.map((rPost) => (
                <BlogCard key={rPost.id} post={rPost} />
              ))}
            </div>
          </section>
        )}

      </div>
    </article>
  )
}
