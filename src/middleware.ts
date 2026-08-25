import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Bot rejection list
const BOT_USER_AGENTS = ['semrushbot', 'ahrefsbot', 'mj12bot', 'dotbot', 'roguebot']

export function middleware(request: NextRequest) {
  const ua = (request.headers.get('user-agent') || '').toLowerCase()

  // Block malicious crawlers instantly at the edge (0ms CPU)
  if (BOT_USER_AGENTS.some((bot) => ua.includes(bot))) {
    return new NextResponse('Access Denied', { status: 403 })
  }

  const response = NextResponse.next()

  // Security Edge Headers
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files & favicon
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
