import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Validates whether a payload conforms strictly to RFC 4648 Base64URL encoding.
 * Prevents @supabase/ssr stringFromBase64URL from throwing fatal unhandled exceptions
 * on legacy JWT cookies or malformed tokens containing '.' or invalid characters.
 */
function isValidBase64Url(str: string): boolean {
  return /^[A-Za-z0-9_-]+$/.test(str)
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  try {
    const rawCookies = request.cookies.getAll()

    // 🟢 CPU OPTIMIZATION: If the visitor has no Supabase auth cookies (guest or bot), 
    // we completely bypass expensive auth requests, saving massive serverless CPU hours & Supabase hits!
    const hasSessionCookie = rawCookies.some(c => c.name.startsWith('sb-') || c.name.includes('-auth-token'))
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

    const host = request.headers.get('host') || ''
    const isProd = host.includes('producertoy.com')

    // 🟢 Cookie Sanitization: filter out corrupt or legacy cookies with dots/invalid chars
    // to protect @supabase/ssr from crashing edge middleware execution.
    const sanitizedCookies = rawCookies.filter((c) => {
      if (
        (c.name.startsWith('sb-') || c.name.includes('-auth-token')) &&
        typeof c.value === 'string' &&
        c.value.startsWith('base64-')
      ) {
        const payload = c.value.substring(7)
        if (!isValidBase64Url(payload)) {
          return false
        }
      }
      return true
    })

    const hasValidSessionCookie = sanitizedCookies.some(
      (c) => c.name.startsWith('sb-') || c.name.includes('-auth-token')
    )
    if (!hasValidSessionCookie) {
      return { supabaseResponse, user: null }
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

    if (!url || !key) {
      return { supabaseResponse, user: null }
    }

    const supabase = createServerClient(
      url,
      key,
      {
        cookies: {
          getAll() {
            return sanitizedCookies
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
              supabaseResponse = NextResponse.next({
                request,
              })
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, {
                  ...options,
                  domain: isProd ? '.producertoy.com' : options?.domain,
                })
              )
            } catch (cookieErr) {
              console.warn('Middleware cookie sync warning:', cookieErr)
            }
          },
        },
      }
    )

    // This will refresh the session if it's expired
    let user = null
    try {
      const { data } = await supabase.auth.getUser()
      user = data.user
    } catch (authErr) {
      console.warn('Middleware getUser failed gracefully:', authErr)
    }

    return { supabaseResponse, user }
  } catch (err) {
    console.error('Middleware updateSession critical fallback:', err)
    return { supabaseResponse, user: null }
  }
}
