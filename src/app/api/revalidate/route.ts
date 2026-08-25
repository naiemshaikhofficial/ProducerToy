import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const secret = searchParams.get('secret')

    // Secret Token validation (Environment Variable or default ProducerToy secret)
    const token = process.env.REVALIDATION_TOKEN || 'producertoy_cache_bypass_secret_2026'

    if (secret !== token) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid revalidation token' },
        { status: 401 }
      )
    }

    // 1. Revalidate tags if using fetch cache
    try {
      revalidateTag('products')
      revalidateTag('categories')
      revalidateTag('brands')
    } catch (e) {
      // Ignore tag error if not defined
    }

    // 2. Clear Next.js CDN Edge Cache across core storefront routes
    revalidatePath('/')
    revalidatePath('/store')
    revalidatePath('/categories')
    revalidatePath('/manufacturers')
    revalidatePath('/sitemap.xml')
    revalidatePath('/sitemap')

    // 3. Clear dynamic layouts & page routes
    revalidatePath('/product/[slug]', 'page')
    revalidatePath('/categories/[slug]', 'page')
    revalidatePath('/manufacturers/[slug]', 'page')
    revalidatePath('/store/[[...slug]]', 'page')

    return NextResponse.json({
      revalidated: true,
      timestamp: Date.now(),
      message: 'ProducerToy Next.js CDN Edge cache cleared successfully across all product & storefront routes.',
    })
  } catch (err: any) {
    console.error('[PRODUCERTOY_REVALIDATE_ERROR]', err)
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 })
  }
}

// Allow both GET and POST requests for easy browser or Webhook execution
export async function GET(req: Request) {
  return POST(req)
}
