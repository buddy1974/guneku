import { describe, it, expect } from 'vitest'
import { SITE_URL, SITE_NAME, excerptFrom, shortTitle, pageMetadata } from './seo'
import robots from '@/app/robots'
import sitemap from '@/app/sitemap'

/* Technical SEO readiness, asserted rather than assumed.
 *
 * Not the growth programme — no keywords, no campaign, nothing speculative. These are the
 * things that would quietly break the site's relationship with a search engine if they
 * regressed: a canonical pointing at a preview host, a private page in the sitemap, a
 * disallow list that stops covering the member area. */

describe('one canonical host, everywhere', () => {
  it('is the production domain and nothing else', () => {
    expect(SITE_URL).toBe('https://www.guneku.org')
    expect(SITE_NAME).toBe('Guneku Fondom')
  })

  it('builds a self-referencing canonical from a path', () => {
    const meta = pageMetadata({ title: 'X', path: '/palace' })
    expect(meta.alternates?.canonical).toBe('/palace')
    expect(String(meta.openGraph?.url)).toBe('https://www.guneku.org/palace')
  })

  it('sends the homepage canonical to the bare domain, not to a trailing slash', () => {
    const meta = pageMetadata({ title: 'X', path: '/' })
    expect(String(meta.openGraph?.url)).toBe('https://www.guneku.org')
  })
})

describe('robots keeps the private surfaces out', () => {
  const r = robots()
  const rules = Array.isArray(r.rules) ? r.rules[0] : r.rules
  const disallow = ([] as string[]).concat(rules?.disallow ?? [])

  it('points at one sitemap on the production host', () => {
    expect(r.sitemap).toBe('https://www.guneku.org/sitemap.xml')
    expect(r.host).toBe('https://www.guneku.org')
  })

  it('allows the public record', () => {
    expect(([] as string[]).concat(rules?.allow ?? [])).toContain('/')
  })

  it('disallows every member, moderation and transactional surface', () => {
    for (const path of [
      '/api/', '/sign-in', '/sign-up',
      '/my-guneku', '/review',
      '/indigenes/profile', '/indigenes/onboarding', '/indigenes/submit',
    ]) {
      expect(disallow).toContain(path)
    }
  })

  it('does not disallow the archive it exists to publish', () => {
    for (const path of ['/gallery', '/watch', '/palace', '/quarters', '/projects', '/indigenes']) {
      expect(disallow).not.toContain(path)
    }
  })
})

describe('the sitemap publishes what is public and nothing else', () => {
  const entries = sitemap()
  const urls = entries.map(e => String(e.url))

  it('lists only absolute production URLs', () => {
    expect(urls.length).toBeGreaterThan(80)
    for (const u of urls) {
      expect(u.startsWith('https://www.guneku.org')).toBe(true)
      expect(u).not.toMatch(/vercel\.app|localhost|127\.0\.0\.1/)
    }
  })

  it('lists no page twice', () => {
    expect(new Set(urls).size).toBe(urls.length)
  })

  it('lists no private, moderation or transactional route', () => {
    for (const u of urls) {
      expect(u).not.toMatch(
        /\/(my-guneku|review|sign-in|sign-up|api)(\/|$)|\/indigenes\/(profile|onboarding|submit)/)
    }
  })

  it('lists nothing held or staged', () => {
    const all = urls.join(' ')
    for (const s of ['archive-staging', 'archive-held', '2jS-ael4Ccg',
                     'visit-to-fons-palace-by-eu-residents',
                     '/images/gallery/coronation/', '/images/gallery/enthronement/']) {
      expect(all).not.toContain(s)
    }
  })
})

describe('a title that fits where only a short thing fits', () => {
  it('leaves a short title alone', () => {
    expect(shortTitle('The Coronation')).toBe('The Coronation')
    expect(shortTitle('  spaced   out  ')).toBe('spaced out')
  })

  it('never adds a word — the short form is a prefix of the record', () => {
    /* The point of the rule. Two albums carry a sentence where a name would go, and the
       record is evidence: it may be cut, never rewritten. */
    const long = 'Sons and daughters of Guneku assembled on the palace grounds of the village '
      + 'on 27 February 2015 for the return of HRH Fon Fomuki Walters Ticha'
    const short = shortTitle(long)
    expect(short.length).toBeLessThanOrEqual(61)
    expect(long.startsWith(short.replace(/…$/, ''))).toBe(true)
  })

  it('prefers a boundary the sentence already has', () => {
    const s = shortTitle('The esteemed visit of His Majesty, Fon Fomuki of Guneku to the indigenes')
    expect(s).toBe('The esteemed visit of His Majesty')
    expect(s.endsWith('…')).toBe(false)
  })

  it('falls back to a word boundary with an ellipsis', () => {
    const s = shortTitle('a'.repeat(20) + ' ' + 'b'.repeat(60))
    expect(s.endsWith('…')).toBe(true)
    expect(s).not.toMatch(/\s…$/)
  })
})

describe('an excerpt is text, never markup', () => {
  it('strips tags and entities', () => {
    expect(excerptFrom('<p>Hello &amp; welcome</p>')).toBe('Hello welcome')
  })

  it('returns an empty string for nothing, rather than "undefined"', () => {
    for (const v of [null, undefined, '']) expect(excerptFrom(v)).toBe('')
  })
})
