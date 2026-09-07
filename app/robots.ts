import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Private/user-generated routes are crawlable on purpose: they carry a
      // `noindex` meta tag, and Google can only honour that if it may fetch them.
      disallow: ['/api/', '/admin'],
    },
    sitemap: 'https://who-won.com/sitemap.xml',
  }
}
