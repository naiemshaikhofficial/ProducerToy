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
  const secretParam = searchParams.get('secret') || searchParams.get('token')
  const authHeader = req.headers.get('authorization')
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
  const headerSecret =
    req.headers.get('x-revalidation-token') ||
    req.headers.get('x-revalidate-secret') ||
    bearerToken

  const incomingSecret = secretParam || headerSecret

  // Verify against either REVALIDATE_SECRET or REVALIDATION_TOKEN in environment
  const configuredSecret = process.env.REVALIDATE_SECRET || process.env.REVALIDATION_TOKEN
  if (configuredSecret && incomingSecret && incomingSecret !== configuredSecret) {
    console.warn('[Revalidate Webhook] Unauthorized attempt with invalid secret')
    return NextResponse.json({ error: 'Unauthorized secret' }, { status: 401 })
  }

  const revalidatedItems: string[] = []

  // Handle Supabase Webhook Body if available
  if (req.method === 'POST') {
    try {
      const contentType = req.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const body = await req.json().catch(() => null)
        if (body && body.table) {
          const table = body.table
          const eventType = body.type || 'UNKNOWN'
          const currentSlug = body.record?.slug
          const previousSlug = body.old_record?.slug

          console.log(`[Revalidate Webhook] Supabase ${eventType} event received for table: "${table}"`)

          if (table === 'products') {
            tag = 'products'
            revalidateTag('homepage_products')
            revalidateTag('products')
            revalidatePath('/', 'page')
            revalidatePath('/', 'layout')
            revalidatePath('/store', 'page')
            revalidatePath('/store', 'layout')
            revalidatePath('/free-vst-plugins', 'page')
            revalidatePath('/product/[slug]', 'page')
            revalidatePath('/p/[slug]', 'page')
            revalidatePath('/products/[slug]', 'page')

            revalidatedItems.push(
              'tag:products',
              'tag:homepage_products',
              'path:/',
              'path:/store',
              'path:/product/[slug]'
            )

            // Revalidate current product slug
            if (currentSlug) {
              revalidatePath(`/product/${currentSlug}`)
              revalidatePath(`/p/${currentSlug}`)
              revalidatePath(`/products/${currentSlug}`)
              revalidatedItems.push(`path:/product/${currentSlug}`)
            }

            // Revalidate old product slug if renamed
            if (previousSlug && previousSlug !== currentSlug) {
              revalidatePath(`/product/${previousSlug}`)
              revalidatePath(`/p/${previousSlug}`)
              revalidatePath(`/products/${previousSlug}`)
              revalidatedItems.push(`path:/product/${previousSlug} (renamed)`)
            }
          } else if (table === 'blogs' || table === 'blog_posts') {
            tag = 'blogs'
            revalidatePath('/blog', 'page')
            revalidatePath('/blog', 'layout')
            if (currentSlug) {
              revalidatePath(`/blog/${currentSlug}`)
              revalidatedItems.push(`path:/blog/${currentSlug}`)
            }
          } else if (table === 'categories' || table === 'subcategories') {
            revalidatePath('/categories', 'layout')
            revalidatePath('/store', 'page')
            revalidatePath('/store', 'layout')
            revalidatePath('/', 'page')
            revalidatedItems.push('path:/categories', 'path:/store', 'path:/')
          } else if (table === 'brands') {
            revalidatePath('/brands', 'layout')
            revalidatePath('/manufacturers', 'layout')
            revalidatePath('/store', 'page')
            revalidatePath('/', 'page')
            revalidatedItems.push('path:/brands', 'path:/manufacturers', 'path:/store', 'path:/')
          }
        }
      }
    } catch (e: any) {
      console.warn('[Revalidate Webhook] JSON parse error:', e.message)
    }
  }

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
