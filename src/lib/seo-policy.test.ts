import { describe, it, expect } from 'vitest'
import sitemap from '@/app/sitemap'
import {
  PERSON_INDEX_THRESHOLD, personSignals, isPersonIndexable,
  indexablePersonSlugs, personDescription, personIndexabilitySummary,
} from './seo-policy'
import { allFoundingNames, allChapters, allBodies, getBody } from './community'

/* The indexability policy, held in place.
 *
 * The register is the only part of the site where "public" and "offered to a search engine"
 * come apart, so it is the only part where the rule has to be written down and tested. The
 * tests below are deliberately about the SHAPE of the decision, not about a number that
 * happens to be true today: if a sparse entry gains a profession tomorrow it should cross the
 * line, and nothing here should have to be edited for that. The one count that is pinned —
 * the size of the register — is pinned because a sudden change in it means the data moved,
 * which is worth being told about. */

describe('the register decides indexing by what an entry holds', () => {
  const names = allFoundingNames()

  it('offers an entry only when it carries facts beyond the name', () => {
    expect(PERSON_INDEX_THRESHOLD).toBe(2)
    for (const n of names) {
      expect(isPersonIndexable(n)).toBe(personSignals(n).length >= PERSON_INDEX_THRESHOLD)
    }
  })

  it('splits the register rather than swallowing or excluding it', () => {
    const s = personIndexabilitySummary()
    expect(s.total).toBe(names.length)
    expect(s.indexable + s.noindex).toBe(s.total)
    /* Both sides are populated. A policy that indexed everything or nothing would pass every
       other test in this file and would mean the threshold had stopped doing any work. */
    expect(s.indexable).toBeGreaterThan(s.total / 2)
    expect(s.noindex).toBeGreaterThan(0)
  })

  it('never treats bare membership of a body as enough on its own', () => {
    const bare = names.find(n => personSignals(n).join() === 'body')
    if (bare) expect(isPersonIndexable(bare)).toBe(false)
  })

  it('resolves a slug the same way it resolves a record', () => {
    for (const n of names.slice(0, 20)) {
      expect(isPersonIndexable(n.slug)).toBe(isPersonIndexable(n))
    }
    expect(isPersonIndexable('not-a-person-in-the-register')).toBe(false)
  })
})

describe('a register entry describes itself', () => {
  const names = allFoundingNames()
  const described = names.map(n =>
    ({ n, d: personDescription(n, n.body ? getBody(n.body)?.name : null) }))

  it('fits in a search result', () => {
    for (const { n, d } of described) {
      expect(d.length, n.slug).toBeLessThanOrEqual(158)
      expect(d.length, n.slug).toBeGreaterThan(20)
      expect(d).not.toMatch(/\s$/)
    }
  })

  it('says something different about each person', () => {
    /* The failure this replaces: 113 descriptions that differed only in a name. */
    expect(new Set(described.map(x => x.d)).size).toBe(names.length)
  })

  it('asserts nothing the entry does not record', () => {
    for (const { n, d } of described) {
      expect(d.startsWith(n.display), n.slug).toBe(true)
      if (!n.notable) expect(d).not.toContain('Notable of Guneku')
      if (!n.profession) expect(d).not.toContain(String(n.profession))
    }
  })

  it('names a deceased entry as a record, and offers nothing else', () => {
    for (const { n, d } of described.filter(x => x.n.deceased)) {
      expect(d).toContain('archive')
      expect(d).not.toContain('register')
    }
  })
})

describe('the sitemap is built from the policy, not from the route list', () => {
  const urls = sitemap().map(e => String(e.url).replace('https://www.guneku.org', '') || '/')
  const set = new Set(urls)

  it('lists every indexable register entry', () => {
    const slugs = indexablePersonSlugs()
    expect(slugs.length).toBe(personIndexabilitySummary().indexable)
    for (const s of slugs) expect(set.has(`/indigenes/founding/${s}`), s).toBe(true)
  })

  it('lists no entry the policy asked a search engine to skip', () => {
    for (const n of allFoundingNames()) {
      if (!isPersonIndexable(n)) {
        expect(set.has(`/indigenes/founding/${n.slug}`), n.slug).toBe(false)
      }
    }
  })

  it('lists every chapter and every governing body', () => {
    /* Twenty-two real organisations that the sitemap simply never mentioned. */
    for (const c of allChapters()) expect(set.has(`/gudeca/chapters/${c.id}`), c.id).toBe(true)
    for (const b of allBodies()) expect(set.has(`/people/${b.id}`), b.id).toBe(true)
    expect(set.has('/people')).toBe(true)
  })

  it('lists the support page, which only the footer used to reach', () => {
    expect(set.has('/support')).toBe(true)
  })

  it('still lists each URL exactly once', () => {
    expect(set.size).toBe(urls.length)
  })
})
