import { keyFileBody } from '@/lib/indexnow'

/* The IndexNow ownership file.
 *
 * Public by design: the protocol proves a host controls a key by serving it here, and a
 * submission names this URL as `keyLocation`. Served from the environment rather than
 * committed, so the repository carries no key and a rotation is a Vercel change rather than
 * a deploy.
 *
 * With no key configured this is a 404, which is the truthful answer: there is nothing to
 * verify. It is never a placeholder — a file containing a key nobody holds would be a
 * verification that quietly fails later. */
export const dynamic = 'force-dynamic'

export function GET() {
  const key = keyFileBody()
  if (!key) return new Response('Not found', { status: 404 })
  return new Response(key, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
