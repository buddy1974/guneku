import { describe, it, expect } from 'vitest'
import sitemap from '@/app/sitemap'
import {
  PERSON_INDEX_THRESHOLD, personSignals, isPersonIndexable, personIndexBar,
  indexablePersonSlugs, personDescription, personIndexabilitySummary,
} from './seo-policy'
import {
  allFoundingNames, allChapters, allBodies, getBody, getChapter, placeLabel,
} from './community'

/* The indexability policy, held in place.
 *
 * Until 2026-09-18 this file defended a richness threshold that withheld 32 of the 113
 * entries. Marcel reversed it, and these tests now defend the reversal — because the easiest
 * way for it to be undone is not an argument but a default: somebody reinstating a "quality"
 * filter, or a helper that quietly skips an entry with nothing in it.
 *
 * So the assertion that matters most in this file is that **no confirmed public record is
 * withheld for being thin**, and that the sitemap agrees. The second is that being thin is
 * still not a licence to invent: a sparse entry's description must stay traceable to fields
 * the record actually holds. */

describe('every confirmed public record in the register is offered for indexing', () => {
  const names = allFoundingNames()

  it('withholds nothing for thinness', () => {
    expect(PERSON_INDEX_THRESHOLD).toBe(0)
    const s = personIndexabilitySummary()
    expect(s.total).toBe(names.length)
    expect(s.indexable).toBe(s.total)
    expect(s.noindex).toBe(0)
    expect(s.bars['too-thin']).toBe(0)
  })

  it('offers the sparsest entry in the register as readily as the richest', () => {
    /* The entry this policy change exists for: one fact, a name, and a person somewhere who
       may one day search for it. */
    const bySignals = [...names].sort((a, b) => personSignals(a).length - personSignals(b).length)
    const sparsest = bySignals[0]
    const richest = bySignals[bySignals.length - 1]
    expect(personSignals(sparsest).length).toBeLessThan(personSignals(richest).length)
    expect(isPersonIndexable(sparsest), sparsest.slug).toBe(true)
    expect(isPersonIndexable(richest), richest.slug).toBe(true)
  })

  it('still treats the reviewed register as the one gate', () => {
    /* Eligibility was never weakened, only decoupled from richness. A held, ambiguous or
       unconfirmed name is not in founding-names.json, and a slug that resolves to nothing
       is not a page. */
    expect(personIndexBar('not-a-person-in-the-register')).toBe('not-a-record')
    expect(isPersonIndexable('not-a-person-in-the-register')).toBe(false)
    for (const n of names.slice(0, 20)) {
      expect(isPersonIndexable(n.slug)).toBe(isPersonIndexable(n))
    }
  })

  it('keeps counting what the Fondom holds, even though it no longer decides anything', () => {
    /* personSignals survives as reporting. If it were deleted, the next person to propose a
       quality filter would have no measurement to argue with. */
    const spread = new Set(names.map(n => personSignals(n).length))
    expect(spread.size).toBeGreaterThan(3)
  })
})

/** The chapter label a page shows, or null where the record has no chapter. */
function chapterLabelFor(id: string | null | undefined): string | null {
  const c = id ? getChapter(id) : null
  return c ? placeLabel(c) : null
}

describe('a register entry describes itself', () => {
  const names = allFoundingNames()
  const described = names.map(n => ({
    n,
    d: personDescription(
      n,
      n.body ? getBody(n.body)?.name : null,
      chapterLabelFor(n.chapter),
    ),
  }))

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
      const label = chapterLabelFor(n.chapter)
      if (!label) {
        for (const c of allChapters()) expect(d, n.slug).not.toContain(placeLabel(c))
      }
    }
  })

  it('lets a sparse record stay sparse', () => {
    /* Now that nothing is withheld for thinness, the temptation is to pad the thin entries
       until they look substantial. Every word of a sparse description is reconstructed here
       from the fields the record actually holds — so a sentence added to fill space, or a
       place or occupation inferred from a name, fails this. */
    const sparse = described.filter(x => personSignals(x.n).length <= 1 && !x.n.deceased)
    expect(sparse.length).toBeGreaterThan(0)
    for (const { n, d } of sparse) {
      const only = [n.body ? getBody(n.body)?.name : null, chapterLabelFor(n.chapter)]
        .filter(Boolean)
      const lead = `${n.display} — ${n.role}`
      const expected = only.length
        ? `${lead}. ${only.join(' · ')}. An entry in the Guneku indigenes register.`
        : `${lead}. An entry in the Guneku indigenes register.`
      expect(d, n.slug).toBe(expected)
    }
  })

  it('names a deceased entry as a record, and offers nothing else', () => {
    for (const { d } of described.filter(x => x.n.deceased)) {
      expect(d).toContain('archive')
      expect(d).not.toContain('register')
    }
  })
})

describe('the sitemap is built from the policy, not from the route list', () => {
  const urls = sitemap().map(e => String(e.url).replace('https://www.guneku.org', '') || '/')
  const set = new Set(urls)

  it('lists every register entry, all of them', () => {
    const slugs = indexablePersonSlugs()
    const all = allFoundingNames()
    expect(slugs.length).toBe(all.length)
    expect(slugs.length).toBe(personIndexabilitySummary().indexable)
    for (const n of all) expect(set.has(`/indigenes/founding/${n.slug}`), n.slug).toBe(true)
  })

  it('would still leave out an entry the register stopped vouching for', () => {
    /* The mechanism is intact even though nothing currently trips it, which is the point:
       the sitemap reads the policy rather than the route list, so if a record is ever
       withheld the sitemap follows without anybody remembering to edit it. */
    for (const n of allFoundingNames()) {
      if (!isPersonIndexable(n)) {
        expect(set.has(`/indigenes/founding/${n.slug}`), n.slug).toBe(false)
      }
    }
    expect(indexablePersonSlugs()).not.toContain('not-a-person-in-the-register')
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
