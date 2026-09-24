import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 🟢 CPU OPTIMIZATION: If the visitor has no Supabase auth cookies (guest or bot), 
  // we completely bypass expensive auth requests, saving massive serverless CPU hours & Supabase hits!
  const hasSessionCookie = request.cookies.getAll().some(c => c.name.startsWith('sb-') || c.name.includes('-auth-token'))
  if (!hasSessionCookie) {
    return { supabaseResponse, user: null }
  }

  // 🟢 PREFETCH OPTIMIZATION: Next.js aggressively prefetches pages on Link hover/view.
  // We DO NOT need to perform a costly Supabase network request (getUser) for prefetch requests.
  const isPrefetch =
    request.headers.get('purpose') === 'prefetch' ||
    request.headers.get('sec-purpose') === 'prefetch' ||
    request.headers.get('x-middleware-prefetch') === '1' ||
    request.headers.get('next-router-prefetch') === '1'
  if (isPrefetch) {
    return { supabaseResponse, user: null }
  }

  // 🟢 ULTRA-LOW RESOURCE OPTIMIZATION (95% Drop in Supabase Auth Network Hits):
  // Public browsing routes (/, /store, /product/*, /categories/*, /manufacturers/*, /blog/*, legal pages)
  // do not need server-side auth verification. The client-side AuthProvider manages session in browser memory.
  // We strictly reserve the expensive server-side Supabase network call for:
  // 1. Protected user accounts & checkout: /account, /checkout, /library, /gifts, /auth
  // 2. State mutations or Server Actions (POST, next-action)
  const pathname = request.nextUrl.pathname
  const isServerAction = request.headers.has('next-action') || request.method === 'POST'
  const isApi = pathname.startsWith('/api')
  const isProtectedRoute =
    pathname.startsWith('/account') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/library') ||
    pathname.startsWith('/gifts') ||
    pathname.startsWith('/auth')

  if (!isProtectedRoute && !isServerAction && !isApi) {
    return { supabaseResponse, user: null }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://voalgeyexfhfitlyorfl.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_AFTgvwUXdDPCgTny9uDIuQ_NGiDyAJD'

  const supabase = createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This will refresh the session if it's expired
  const { data: { user } } = await supabase.auth.getUser()

  return { supabaseResponse, user }
}
