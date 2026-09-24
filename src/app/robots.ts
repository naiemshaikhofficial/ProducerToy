import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
      ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
      : 'https://producertoy.com'

  return {
    rules: [
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'Claude-SearchBot',
          'Google-Extended',
          'Applebot-Extended',
        ],
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/account/',
          '/checkout/',
          '/library/',
          '/auth/',
        ],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/account/',
          '/checkout/',
          '/library/',
          '/auth/',
          '/*?sort=*',
          '/*?filter=*',
          '/*?brand=*',
          '/*?price=*',
          '/*?order=*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
