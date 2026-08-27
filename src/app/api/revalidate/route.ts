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
 */
export async function GET(req: NextRequest) {
  return handleRevalidation(req)
}

export async function POST(req: NextRequest) {
  return handleRevalidation(req)
}

async function handleRevalidation(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const tag = searchParams.get('tag')
  const path = searchParams.get('path')
  const secret = searchParams.get('secret')

  // Optional security check (if REVALIDATE_SECRET is configured in env)
  const envSecret = process.env.REVALIDATE_SECRET
  if (envSecret && secret !== envSecret) {
    return NextResponse.json({ error: 'Unauthorized secret' }, { status: 401 })
  }

  const revalidatedItems: string[] = []

  try {
    // 1. Revalidate by tag (e.g., 'products', 'homepage_products')
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
    if (!tag && !path) {
      revalidateTag('products')
      revalidatePath('/')
      revalidatedItems.push('tag:products', 'path:/')
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
