import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

/* Private and transactional surfaces are kept out of the index. Everything the
   Fondom publishes is allowed. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: '*',
      allow: '/',
      /* The member area and the moderation queues. Each of those pages also carries
         `robots: { index: false }` in its own metadata, and both are wanted: the meta tag
         is what a crawler that ignores robots.txt sees, and this is what stops the request
         being made at all. Neither is a security control — the pages redirect a signed-out
         caller to sign-in and every route behind them checks a role server-side. */
      disallow: [
        '/api/', '/sign-in', '/sign-up',
        '/indigenes/profile', '/indigenes/onboarding', '/indigenes/submit',
        '/my-guneku', '/review',
      ],
    }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
