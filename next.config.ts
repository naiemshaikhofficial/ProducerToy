import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@supabase/supabase-js', '@supabase/ssr'],
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    unoptimized: true, // ZERO VERCEL USAGE: Serves images directly from Supabase CDN without consuming Vercel transformation quota
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      // 🟢 EDGE CDN CANONICAL REDIRECT (0 Compute, 0 Function Invocations):
      // Vercel edge routers immediately redirect www.producertoy.com to producertoy.com without invoking serverless code
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.producertoy.com' }],
        destination: 'https://producertoy.com/:path*',
        permanent: true,
      },
      // Fast query param ?news -> /news redirect
      {
        source: '/',
        has: [{ type: 'query', key: 'news' }],
        destination: '/news',
        permanent: false,
      },
      // Content paths on store subdomain -> redirect to apex domain
      {
        source: '/news/:path*',
        has: [{ type: 'host', value: 'store.producertoy.com' }],
        destination: 'https://producertoy.com/news/:path*',
        permanent: false,
      },
      {
        source: '/blog/:path*',
        has: [{ type: 'host', value: 'store.producertoy.com' }],
        destination: 'https://producertoy.com/blog/:path*',
        permanent: false,
      },
      {
        source: '/support/:path*',
        has: [{ type: 'host', value: 'store.producertoy.com' }],
        destination: 'https://producertoy.com/support/:path*',
        permanent: false,
      },
      {
        source: '/faq/:path*',
        has: [{ type: 'host', value: 'store.producertoy.com' }],
        destination: 'https://producertoy.com/faq/:path*',
        permanent: false,
      },
      {
        source: '/about',
        has: [{ type: 'host', value: 'store.producertoy.com' }],
        destination: 'https://producertoy.com/about',
        permanent: false,
      },
      {
        source: '/contact',
        has: [{ type: 'host', value: 'store.producertoy.com' }],
        destination: 'https://producertoy.com/contact',
        permanent: false,
      },
      {
        source: '/privacy',
        has: [{ type: 'host', value: 'store.producertoy.com' }],
        destination: 'https://producertoy.com/privacy',
        permanent: false,
      },
      {
        source: '/terms',
        has: [{ type: 'host', value: 'store.producertoy.com' }],
        destination: 'https://producertoy.com/terms',
        permanent: false,
      },
      {
        source: '/refund-policy',
        has: [{ type: 'host', value: 'store.producertoy.com' }],
        destination: 'https://producertoy.com/refund-policy',
        permanent: false,
      },
      // Store-only paths on apex domain -> redirect to store subdomain
      {
        source: '/checkout/:path*',
        has: [{ type: 'host', value: 'producertoy.com' }],
        destination: 'https://store.producertoy.com/checkout/:path*',
        permanent: false,
      },
      {
        source: '/cart',
        has: [{ type: 'host', value: 'producertoy.com' }],
        destination: 'https://store.producertoy.com/cart',
        permanent: false,
      },
      {
        source: '/account/:path*',
        has: [{ type: 'host', value: 'producertoy.com' }],
        destination: 'https://store.producertoy.com/account/:path*',
        permanent: false,
      },
      // Existing product redirects
      {
        source: '/products/:slug',
        destination: '/product/:slug',
        permanent: true,
      },
      {
        source: '/p/:slug',
        destination: '/product/:slug',
        permanent: true,
      },
      {
        source: '/about-us',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/site/about',
        destination: '/about',
        permanent: true,
      },
      {
        source: '/site/faq',
        destination: '/faq',
        permanent: true,
      },
      {
        source: '/site/support',
        destination: '/support',
        permanent: true,
      },
      {
        source: '/site/:path*',
        destination: '/support',
        permanent: true,
      },
      {
        source: '/help',
        destination: '/support',
        permanent: true,
      },
      {
        source: '/help/:path*',
        destination: '/support',
        permanent: true,
      },
      {
        source: '/help-center',
        destination: '/support',
        permanent: true,
      },
      {
        source: '/faqs',
        destination: '/faq',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/home',
        destination: '/',
      },
    ];
  },
  async headers() {
    const securityHeaders = [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
    ];

    const cdnCacheHeaders = [
      {
        key: 'Cache-Control',
        value: 'public, max-age=31536000, s-maxage=31536000, immutable',
      },
      {
        key: 'CDN-Cache-Control',
        value: 'public, max-age=31536000, immutable',
      },
      {
        key: 'Vercel-CDN-Cache-Control',
        value: 'public, max-age=31536000, immutable',
      },
    ];

    return [
      // 1. Static Assets & Media CDN Caching (1 Year Immutable Edge Cache)
      {
        source: '/:path*.(ico|png|jpg|jpeg|gif|webp|avif|svg|woff|woff2|ttf|eot|mp3|wav|ogg|json)',
        headers: cdnCacheHeaders,
      },
      // 2. Next.js Static Builds
      {
        source: '/_next/static/:path*',
        headers: cdnCacheHeaders,
      },
      // 3. Security Headers for all routes
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
