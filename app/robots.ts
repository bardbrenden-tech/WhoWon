import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/profile', '/challenges', '/sessions'],
    },
    sitemap: 'https://who-won.com/sitemap.xml',
  }
}
