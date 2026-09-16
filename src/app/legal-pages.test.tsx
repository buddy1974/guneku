import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import sitemap from '@/app/sitemap'
import { metadata as privacyMetadata } from './privacy/page'
import { metadata as termsMetadata } from './terms/page'

/* The two legal surfaces, and the navigation that has to reach them.
 *
 * ── Why this is tested at all ────────────────────────────────────────────────────────────
 *
 * Google rejected the Fondom's OAuth branding because the privacy policy URL pointed at
 * /palace, which is the Palace's own page and contains no privacy policy. The failure was
 * not that a page was wrong; it was that a URL promised something no page delivered. So what
 * is checked here is the promise: the routes exist, they are reachable from ordinary
 * navigation, they declare the canonical URLs the OAuth configuration will name, and nothing
 * in the application still treats /palace as a legal page.
 *
 * ── Why the checks read source rather than render ────────────────────────────────────────
 *
 * This suite runs in `node` with no DOM, by design (see vitest.config.ts). Metadata is a
 * plain export and can be imported directly; the footer's links are read out of its source,
 * which is enough to prove the route is linked and is the only thing that would actually
 * break. */

const READ = (p: string) => readFileSync(p, 'utf-8')

/** Source with its comments removed. */
const strip = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')

/** The page file a site-root-relative route renders from. */
const pageFile = (route: string) => `src/app${route === '/' ? '' : route}/page.tsx`

const FOOTER = READ('src/components/layout/Footer.tsx')

describe('the two legal pages exist', () => {
  it('serves /privacy', () => {
    expect(existsSync(pageFile('/privacy'))).toBe(true)
  })

  it('serves /terms', () => {
    expect(existsSync(pageFile('/terms'))).toBe(true)
  })

  it('names the canonical URLs the OAuth configuration will point at', () => {
    /* `pageMetadata` writes a root-relative canonical, which Next resolves against
       metadataBase. What matters is that it is self-referencing and is not /palace. */
    expect(privacyMetadata.alternates?.canonical).toBe('/privacy')
    expect(termsMetadata.alternates?.canonical).toBe('/terms')
  })

  it('gives each a title and a description a search result can use', () => {
    for (const m of [privacyMetadata, termsMetadata]) {
      expect(typeof m.title).toBe('string')
      expect(String(m.title).length).toBeGreaterThan(5)
      expect(String(m.description ?? '').length).toBeGreaterThan(60)
    }
    expect(String(privacyMetadata.title)).toMatch(/privacy/i)
    expect(String(termsMetadata.title)).toMatch(/terms/i)
  })

  it('is a real policy rather than a page that merely has the name', () => {
    /* The defect Google reported was a URL with no policy behind it. A length floor and the
       subjects a policy has to cover are a crude test, and crude is the point: it fails if
       anybody ever replaces these with a stub. */
    const privacy = READ(pageFile('/privacy'))
    expect(privacy.length).toBeGreaterThan(4000)
    for (const subject of [
      /what (you|information)/i, /cookie/i, /retention|how long/i, /security/i,
      /children/i, /Clerk/, /Turnstile|Cloudflare/, /contact/i,
    ]) {
      expect(privacy, `privacy policy should address ${subject}`).toMatch(subject)
    }

    const terms = READ(pageFile('/terms'))
    expect(terms.length).toBeGreaterThan(4000)
    for (const subject of [
      /acceptable use/i, /account/i, /accuracy/i, /moderation|review/i,
      /availability/i, /contact/i,
    ]) {
      expect(terms, `terms should address ${subject}`).toMatch(subject)
    }
  })
})

describe('ordinary navigation reaches both', () => {
  it('links to each from the footer, on every page of the site', () => {
    expect(FOOTER).toContain("href: '/privacy'")
    expect(FOOTER).toContain("href: '/terms'")
    expect(FOOTER).toContain('Privacy Policy')
    expect(FOOTER).toContain('Terms of Service')
  })

  it('puts them in their own labelled legal navigation, not in the village navigation', () => {
    /* They must be reachable and must not be promoted into Explore, which is the record a
       villager comes to read. */
    expect(FOOTER).toMatch(/aria-label="Legal"/)
    /* To `const LEGAL`, not to `const SOCIAL`: the legal list is declared between the two,
       so slicing to SOCIAL would swallow it and this check would pass on its own subject. */
    const explore = FOOTER.slice(FOOTER.indexOf('const EXPLORE'), FOOTER.indexOf('const LEGAL'))
    expect(explore).not.toContain('/privacy')
    expect(explore).not.toContain('/terms')
  })
})

describe('the sitemap follows the site’s own public-page policy', () => {
  const urls = sitemap().map(e => e.url)

  it('lists both, because both are public pages anybody may open', () => {
    expect(urls).toContain('https://www.guneku.org/privacy')
    expect(urls).toContain('https://www.guneku.org/terms')
  })

  it('still keeps the private and transactional routes out', () => {
    /* Guarding the edit above: adding entries to this file must not have relaxed anything. */
    for (const held of ['/sign-in', '/sign-up', '/my-guneku', '/review',
                        '/indigenes/profile', '/indigenes/onboarding', '/indigenes/submit']) {
      expect(urls).not.toContain(`https://www.guneku.org${held}`)
    }
  })
})

describe('no legal surface is mapped onto /palace any more', () => {
  it('leaves the Palace page as the Palace page', () => {
    /* The rejected configuration named https://www.guneku.org/palace as the privacy policy.
       That mapping was only ever in the Google Cloud console, never in this repository — so
       what this proves is that it did not exist here and has not been introduced. */
    const palace = READ(pageFile('/palace'))
    expect(palace).not.toMatch(/privacy policy/i)
  })

  it('routes no legal path through the Palace', () => {
    const cfg = READ('next.config.ts')
    expect(cfg).not.toMatch(/privacy/i)
    expect(cfg).not.toMatch(/\/terms/i)
  })

  it('does not revive the legacy generated documents', () => {
    /* The 2023 TermsFeed records migrated from Joomla are inert — no route reads them — and
       they stay that way. They call Guneku "the Company" and describe a service that does
       not exist, so rendering them would be worse than having no page at all. */
    /* Comments stripped, as elsewhere in this suite: both pages explain in their header
       exactly which legacy record they refuse to use, and a check matching that prose would
       fail on the very sentence recording the decision. What must be absent is an import. */
    for (const page of [pageFile('/privacy'), pageFile('/terms')]) {
      const text = strip(READ(page))
      expect(text).not.toContain('data/pages/privacy-policy')
      expect(text).not.toContain('data/pages/terms')
    }
  })
})

describe('the footer’s existing navigation still works', () => {
  /* Every site-root-relative href the footer renders must resolve to a page that exists.
     The legal nav was added to this component, so the cheapest way to prove nothing else
     broke is to walk all of its links rather than only the new ones. */
  const hrefs = [...FOOTER.matchAll(/href[=:]\s*['"](\/[a-z0-9/-]*)['"]/gi)]
    .map(m => m[1])
    .filter((v, i, a) => a.indexOf(v) === i)

  it('renders links to somewhere', () => {
    expect(hrefs.length).toBeGreaterThanOrEqual(10)
  })

  it.each(hrefs)('resolves %s to a real page', (href) => {
    expect(existsSync(pageFile(href)), `${href} has no page.tsx`).toBe(true)
  })

  it('still carries the Explore section and the Palace contact route', () => {
    for (const href of ['/fondom', '/palace', '/projects', '/education',
                        '/indigenes', '/diaspora', '/updates', '/gallery', '/contact']) {
      expect(hrefs, `footer lost ${href}`).toContain(href)
    }
  })
})
