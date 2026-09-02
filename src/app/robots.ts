import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

/* Private and transactional surfaces are kept out of the index. Everything the
   Fondom publishes is allowed. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/sign-in', '/sign-up', '/indigenes/profile', '/indigenes/onboarding'],
    }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
