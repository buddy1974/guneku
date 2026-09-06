import { describe, it, expect } from 'vitest'
import { search, indexSize, indexBreakdown, GROUP_ORDER, type SearchEntry } from './search-index'
import { approvedFilms, allFilms } from './guneku-tv'
import { readFileSync } from 'node:fs'

/* Search is the one surface that reads everything the site publishes and puts it in front of
 * a stranger who typed two letters. So the question worth testing is not "does it find
 * things" — it is "can it find something the Fondom did not publish".
 *
 * A leak here is worse than a leak on a page. A page has to be linked to; the index is
 * queried by people who do not know what they are looking for, which is exactly how somebody
 * finds material nobody meant them to see. */

const all = (): SearchEntry[] => {
  /* Every entry, reached through the public API rather than by exporting the index — a query
     of one common letter pair across every group is enough to sweep it. */
  const seen = new Map<string, SearchEntry>()
  for (const q of ['a', 'e', 'i', 'o', 'u', 'gu', 'ne', 'ku', 'on', 'an', 'th', 'in']) {
    for (const g of search(q, 500).groups) {
      for (const r of g.results) seen.set(r.id, r)
    }
  }
  return [...seen.values()]
}

describe('the index is built, and built from the published record', () => {
  it('holds a substantial index across several groups', () => {
    expect(indexSize()).toBeGreaterThan(200)
    expect(indexBreakdown().length).toBeGreaterThan(4)
  })

  it('uses only the declared groups, in the declared order', () => {
    const groups = indexBreakdown().map(g => g.group)
    for (const g of groups) expect(GROUP_ORDER).toContain(g)
    expect(groups).toEqual(GROUP_ORDER.filter(g => groups.includes(g)))
  })

  it('gives every entry somewhere to go on this site', () => {
    for (const e of all()) {
      expect(e.href.startsWith('/')).toBe(true)
      expect(e.href).not.toMatch(/^\/\/|vercel\.app|localhost|http:/)
      expect(e.title.trim().length).toBeGreaterThan(0)
    }
  })
})

describe('nothing unpublished is findable', () => {
  const entries = all()
  const haystack = JSON.stringify(entries)

  it('indexes no held or staged archive path', () => {
    for (const s of [
      'archive-held', 'archive-staging', 'visit-to-fons-palace-by-eu-residents',
      '/images/gallery/coronation/', '/images/gallery/enthronement/',
      'prince-tibahs-bornhouse-bonn', 'Guneku-DMV-WelcomeFomuki',
    ]) {
      expect(haystack).not.toContain(s)
    }
  })

  it('indexes no film that is not approved, and not the private one', () => {
    /* A film entry carries its id as `film:<youtubeId>` and lands on /watch — there is no
       per-film route. The Films group also holds one `page:` entry, the watch hub itself.
       So the guarantee is about which film ids reached the index at all. */
    const approved = new Set(approvedFilms().map(f => f.youtubeId))
    const films = entries.filter(e => e.group === 'Films')
    const filmEntries = films.filter(e => e.id.startsWith('film:'))
    expect(filmEntries.length).toBeGreaterThan(0)
    for (const f of filmEntries) {
      expect(approved.has(f.id.slice('film:'.length))).toBe(true)
      expect(f.href).toBe('/watch')
    }
    /* And nothing else got into that group by another route. */
    for (const f of films) {
      expect(f.id.startsWith('film:') || f.id.startsWith('page:')).toBe(true)
    }
    expect(haystack).not.toContain('2jS-ael4Ccg')
  })

  it('indexes none of the 62 uploads queued for review', () => {
    const discovered = JSON.parse(
      readFileSync('src/data/gallery/video-discovered.json', 'utf-8')) as
      { discovered: Array<{ youtubeId: string }> }
    for (const d of discovered.discovered) expect(haystack).not.toContain(d.youtubeId)
    /* And they are genuinely absent from the film record, not merely absent from search. */
    const known = new Set(allFilms().map(f => f.youtubeId))
    for (const d of discovered.discovered) expect(known.has(d.youtubeId)).toBe(false)
  })

  it('indexes no member, moderation or private route', () => {
    for (const e of entries) {
      expect(e.href).not.toMatch(
        /^\/(my-guneku|review|sign-in|sign-up|api)(\/|$)|^\/indigenes\/(profile|onboarding|submit)/)
    }
  })

  it('puts no personal contact detail in an excerpt', () => {
    /* The excerpt is the one field rendered under a result, so it is where a private number
       would reach a stranger who typed two letters.

       The rule is about *whose* details, not about the shape of them. The Fondom's own
       institutional line and address are published deliberately — the Palace telephone of
       record (ADR-002) is on the contact page, in the village facts and in the answer to
       "how do I reach the Palace", and a search result that carried it would be doing its
       job. What must never appear is an officer's mobile or a member's address. */
    const PUBLISHED = [/\+237 681 19 46 64/g, /info@guneku\.org/g]
    for (const e of entries) {
      let text = e.excerpt
      for (const p of PUBLISHED) text = text.replace(p, ' ')
      expect(text).not.toMatch(/\+?\d[\d ()\-]{8,}\d/)
      expect(text).not.toMatch(/[\w.+-]+@[\w-]+\.[\w.]{2,}/)
      /* A `wa.me` link is a phone number wearing a URL — and one is already published on
         /guneccul against a person rather than an office (R-001). The word "WhatsApp" is
         not: a published notice is *about* compromised WhatsApp accounts, and matching the
         word would fail on the security warning rather than on a leak. */
      expect(e.excerpt).not.toMatch(/wa\.me\//i)
    }
  })

  it('carries no held business record', () => {
    /* The Business Directory is held pending consent from the four businesses listed
       (ADR-005). Held means not findable, not merely not linked. */
    expect(haystack).not.toContain('business-directory')
  })
})

describe('the same query always gives the same answer', () => {
  it('is deterministic', () => {
    const a = search('guneku', 8)
    const b = search('guneku', 8)
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })

  it('says nothing for a query too short to mean anything', () => {
    for (const q of ['', ' ', 'a']) {
      const r = search(q)
      expect(r.total).toBe(0)
      expect(r.groups).toEqual([])
    }
  })

  it('finds the Fondom by its own name', () => {
    expect(search('guneku').total).toBeGreaterThan(0)
    expect(search('palace').total).toBeGreaterThan(0)
  })

  it('requires every term to land, rather than any of them', () => {
    /* Matching the film library's own rule, so the two can never disagree about what
       exists. A query of two words that never co-occur finds nothing. */
    expect(search('guneku zzzzqqq').total).toBe(0)
  })

  it('returns no more than asked for per group', () => {
    for (const g of search('a', 3).groups) expect(g.results.length).toBeLessThanOrEqual(3)
  })
})
