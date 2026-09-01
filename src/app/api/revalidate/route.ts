import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'

/**
 * On-Demand Cache Invalidation Endpoint
 * Allows instant, zero-downtime cache purge without restarting servers or waiting for timeouts.
 * Triggered manually, from admin tools, or via Supabase database webhooks.
 *
 * Usage:
 * GET/POST /api/revalidate?tag=products
 * GET/POST /api/revalidate?path=/
 * POST /api/revalidate (with Supabase Webhook payload: { table: "products", record: { slug: "..." } })
 */
export async function GET(req: NextRequest) {
  return handleRevalidation(req)
}

export async function POST(req: NextRequest) {
  return handleRevalidation(req)
}

async function handleRevalidation(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  let tag = searchParams.get('tag')
  let path = searchParams.get('path')
  const secret = searchParams.get('secret')

  // Optional security check (if REVALIDATE_SECRET is configured in env)
  const envSecret = process.env.REVALIDATE_SECRET
  if (envSecret && secret && secret !== envSecret) {
    return NextResponse.json({ error: 'Unauthorized secret' }, { status: 401 })
  }

  // Handle Supabase Webhook Body if available
  if (req.method === 'POST') {
    try {
      const contentType = req.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const body = await req.json().catch(() => null)
        if (body && body.table) {
          const table = body.table
          const slug = body.record?.slug || body.old_record?.slug

          if (table === 'products') {
            tag = 'products'
            revalidateTag('homepage_products')
            revalidatePath('/', 'page')
            revalidatePath('/store', 'page')
            revalidatePath('/free-vst-plugins', 'page')
            if (slug) {
              revalidatePath(`/product/${slug}`, 'page')
              revalidatePath(`/products/${slug}`, 'page')
              revalidatePath(`/p/${slug}`, 'page')
            }
          } else if (table === 'blogs' || table === 'blog_posts') {
            tag = 'blogs'
            revalidatePath('/blog', 'page')
            if (slug) {
              revalidatePath(`/blog/${slug}`, 'page')
            }
          } else if (table === 'categories' || table === 'subcategories') {
            revalidatePath('/categories', 'layout')
            revalidatePath('/store', 'page')
          } else if (table === 'brands') {
            revalidatePath('/brands', 'layout')
            revalidatePath('/manufacturers', 'layout')
          }
        }
      }
    } catch {
      // JSON parse fallback
    }
  }

  const revalidatedItems: string[] = []

  try {
    // 1. Revalidate by tag (e.g., 'products', 'homepage_products', 'blogs')
    if (tag) {
      revalidateTag(tag)
      revalidatedItems.push(`tag:${tag}`)
    }

    // 2. Revalidate by path (e.g., '/', '/store')
    if (path) {
      revalidatePath(path)
      revalidatedItems.push(`path:${path}`)
    }

    // If neither tag nor path was passed, default to revalidating 'products' and home '/'
    if (!tag && !path && revalidatedItems.length === 0) {
      revalidateTag('products')
      revalidateTag('homepage_products')
      revalidatePath('/')
      revalidatePath('/store')
      revalidatedItems.push('tag:products', 'tag:homepage_products', 'path:/', 'path:/store')
    }

    return NextResponse.json({
      success: true,
      revalidated: true,
      items: revalidatedItems,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Revalidation error:', error)
    return NextResponse.json(
      { error: 'Failed to revalidate', details: error.message },
      { status: 500 }
    )
  }
}
