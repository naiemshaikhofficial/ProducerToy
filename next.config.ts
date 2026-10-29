import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@supabase/supabase-js', '@supabase/ssr'],
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
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
      // 🟢 CANONICAL DOMAIN CONSOLIDATION:
      // Redirect all requests from store.producertoy.com directly to producertoy.com
      // (Keeps cart items, local storage, and user sessions on a single unified origin)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'store.producertoy.com' }],
        destination: 'https://producertoy.com/:path*',
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
      // Creator distribution portal redirect
      {
        source: '/distribute',
        destination: 'https://creators.producertoy.com',
        permanent: false,
      },
      {
        source: '/distribute/:path*',
        destination: 'https://creators.producertoy.com',
        permanent: false,
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
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
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

    const isProd = process.env.NODE_ENV === 'production';

    return [
      // 1. Static Assets & Next.js Static Builds (Only in production to prevent caching stale CSS in dev)
      ...(isProd
        ? [
            {
              source: '/:path*.(ico|png|jpg|jpeg|gif|webp|avif|svg|woff|woff2|ttf|eot|mp3|wav|ogg|json)',
              headers: cdnCacheHeaders,
            },
            {
              source: '/_next/static/:path*',
              headers: cdnCacheHeaders,
            },
          ]
        : []),
      // 2. Security Headers for all routes
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
