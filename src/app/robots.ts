import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://producertoy.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/_next/',
        '/checkout/',
        '/my-purchases/',
        '/*?sort=*',
        '/*?price=*',
        '/*?q=*',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
