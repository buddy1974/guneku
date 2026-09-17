import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  curatedBusinesses, publicCuratedBusinesses, getCuratedBusiness, mergeBusinesses,
  filterBusinesses, categoriesPresent, countriesPresent, relatedBusinesses,
  resolveBusinessPeople, businessSlug, uniqueBusinessSlug,
  youtubeIdFrom, youtubeEmbedUrl, youtubeThumbnail, safeExternalUrl, displayUrl,
  businessInitials, placeholderHue, locationLabel,
  BUSINESS_CATEGORIES, CATEGORY_LABEL, isBusinessCategory, isBusinessRelationship,
  type Business,
} from './businesses'
import { getFoundingName, allFoundingNames } from './community'
import { identityIndex } from './identity-index'
import { search } from './search-index'

/* The Business Directory: what it publishes, whom it attaches it to, and the two things a
 * directory of user-entered content must never do — publish somebody's private details, or
 * let a stranger write under somebody else's name. */

const ALL = curatedBusinesses()
const PUBLIC = publicCuratedBusinesses()
const RAW = readFileSync('src/data/businesses/businesses.json', 'utf-8')

/** Register slugs whose name or aliases contain a probe, for "exactly one X" assertions. */
const NAMES_WITH = (probe: string): string[] =>
  allFoundingNames()
    .filter(n => new RegExp(probe, 'i').test([n.display, ...(n.aliases ?? [])].join(' ')))
    .map(n => n.slug)

describe('the record is coherent', () => {
  it('gives every business a unique slug and a real category', () => {
    expect(new Set(ALL.map(b => b.slug)).size).toBe(ALL.length)
    for (const b of ALL) {
      expect(isBusinessCategory(b.category), `${b.slug}: ${b.category}`).toBe(true)
      expect(b.slug, b.slug).toBe(businessSlug(b.slug))
      expect(b.name.trim().length).toBeGreaterThan(0)
    }
  })

  it('uses only relationships from the closed list', () => {
    for (const b of ALL) {
      for (const p of b.people ?? []) {
        expect(isBusinessRelationship(p.relationship), `${b.slug}`).toBe(true)
        expect(p.evidence.trim().length, `${b.slug}`).toBeGreaterThan(0)
      }
    }
  })

  it('does not call everybody an owner', () => {
    /* A physician in a practice is not its proprietor and a managing director is not
       necessarily a shareholder. If every relationship in the directory is "owner", somebody
       has stopped reading the evidence. */
    const kinds = new Set(ALL.flatMap(b => (b.people ?? []).map(p => p.relationship)))
    expect(kinds.size).toBeGreaterThan(1)
    expect(kinds).toContain('owner')
  })

  it('gives every held business a reason it is held', () => {
    for (const b of ALL.filter(x => x.status === 'held')) {
      expect(b.holdReason?.trim().length, b.slug).toBeGreaterThan(0)
    }
  })

  it('publishes every category label it uses', () => {
    for (const c of BUSINESS_CATEGORIES) expect(CATEGORY_LABEL[c].length).toBeGreaterThan(0)
  })
})

describe('a person is attached only where somebody established it', () => {
  it('resolves every recorded slug to a real identity', () => {
    for (const b of ALL) {
      for (const p of b.people ?? []) {
        if (!p.personSlug) continue
        const resolved = resolveBusinessPeople(b).find(r => r.display && !r.held)
        expect(resolved, `${b.slug} -> ${p.personSlug}`).toBeDefined()
      }
    }
  })

  it('links the three businesses whose owner the register holds', () => {
    for (const [slug, personSlug] of [
      ['maxpromo-digital', 'marcel-tabit-akwe'],
      ['midas-property-auctions', 'sam-fongoh'],
      ['urologie-neuwied', 'fon-walters-profile'],
    ] as const) {
      const b = getCuratedBusiness(slug)!
      expect(b.people?.[0].personSlug, slug).toBe(personSlug)
      const resolved = resolveBusinessPeople(b)[0]
      expect(resolved.held, slug).toBe(false)
      expect(resolved.href, slug).toBeTruthy()
    }
  })

  it('resolves every one of the businesses the Fondom has confirmed', () => {
    /* These four were HELD until 2026-09-17: the Fondom had named the people behind them and
       none of those people was in the register, so the name was recorded and no slug was
       invented. The Fondom then added them to the register, and the links resolved. That
       order is the point — the identity came first and the link followed it, rather than a
       link being made to work by manufacturing an identity. */
    for (const [slug, personSlug, relationship] of [
      ['fondom-studios', 'tanwi-amerion', 'owner'],
      ['concept-care-solutions', 'edith-fongho', 'managing-director'],
      ['arcpoint-labs', 'denis-m-tebit', 'associated'],
      ['any-lab-test-now-lynchburg', 'denis-m-tebit', 'associated'],
    ] as const) {
      const b = getCuratedBusiness(slug)!
      expect(b.people![0].personSlug, slug).toBe(personSlug)
      expect(b.people![0].relationship, slug).toBe(relationship)
      expect(b.people![0].heldName, slug).toBeUndefined()

      const resolved = resolveBusinessPeople(b)[0]
      expect(resolved.held, slug).toBe(false)
      expect(resolved.href, slug).toBe(`/indigenes/founding/${personSlug}`)
      expect(getFoundingName(personSlug), personSlug).not.toBeNull()
    }
  })

  it('gives the two Denis businesses one person and keeps them two businesses', () => {
    const arc = getCuratedBusiness('arcpoint-labs')!
    const anylab = getCuratedBusiness('any-lab-test-now-lynchburg')!
    expect(arc.people![0].personSlug).toBe(anylab.people![0].personSlug)
    expect(arc.slug).not.toBe(anylab.slug)
    expect(arc.name).not.toBe(anylab.name)
    /* And nothing says or implies he owns the national brand. */
    expect(arc.people![0].relationship).toBe('associated')
    expect(arc.sourceNote).toMatch(/national brand/i)
    expect(JSON.stringify(arc)).not.toMatch(/"relationship":\s*"owner"/)
  })

  it('still refuses to invent a slug for anybody the Fondom has not confirmed', () => {
    /* The rule the four above were held under has not been relaxed; it was satisfied. Every
       personSlug in the directory resolves to a real identity, and a business may only carry
       a heldName where no slug is claimed at all. */
    for (const b of ALL) {
      for (const person of b.people ?? []) {
        if (person.personSlug) {
          const known = getFoundingName(person.personSlug)
            || identityIndex().some(i => i.id === person.personSlug)
          expect(Boolean(known), `${b.slug} -> ${person.personSlug}`).toBe(true)
          expect(person.heldName, b.slug).toBeUndefined()
        }
      }
    }
  })

  it('links the fish centre to the councillor, now that the Fondom has said they are one man', () => {
    /* Held from the forensic review until 2026-09-17 on the rule that a same-name match is
       not an identity. The Fondom confirmed it; the rule was never that the link was wrong,
       only that nothing established it. */
    const b = getCuratedBusiness('vitalis-fish-breeding-centre')!
    expect(b.people![0].personSlug).toBe('ngwa-vitalis')
    expect(b.people![0].heldName).toBeUndefined()
    /* Operator, not owner: the confirmation settled who he is, not what he holds. */
    expect(b.people![0].relationship).toBe('operator')
    expect(resolveBusinessPeople(b)[0].held).toBe(false)

    /* And there is still exactly one Ngwa Vitalis. */
    expect(NAMES_WITH('vitalis')).toEqual(['ngwa-vitalis'])
  })

  it('resolves Magic Gate to Goddy Akwe and publishes it', () => {
    /* Held until 2026-09-17 for one reason only — no Guneku connection was established — and
       explicitly NOT attached to Goddy on the strength of his name appearing near it in a
       note. The Fondom then said it is his, which is a confirmation and not an inference. */
    const b = getCuratedBusiness('magic-gate-enterprise')!
    expect(b.status).toBe('public')
    expect(b.holdReason).toBeUndefined()
    expect(b.people![0].personSlug).toBe('goddy-akwe')
    expect(resolveBusinessPeople(b)[0].held).toBe(false)

    /* Exactly one Goddy Akwe, and his register entry is untouched by any of this. */
    expect(NAMES_WITH('goddy')).toEqual(['goddy-akwe'])
    const goddy = getFoundingName('goddy-akwe')!
    expect(goddy.residence).toBe('Cameroon')
    /* The business address did NOT become his residence. */
    expect(JSON.stringify(goddy)).not.toMatch(/bonaberi|ndobo|douala/i)
  })

  it("leaves Vicky and Son's held, with nobody invented for it", () => {
    const b = getCuratedBusiness('vicky-and-sons')!
    expect(b.status).toBe('held')
    expect(b.people ?? []).toEqual([])
    expect(b.holdReason).toMatch(/no proprietor is named/i)
    /* Not assigned to any of the people this reconciliation resolved, and no proprietor
       manufactured out of the trading name. */
    const written = JSON.stringify(b).toLowerCase()
    for (const name of ['goddy', 'ngwa', 'vitalis', 'tanwi', 'edith', 'denis', 'akwe']) {
      expect(written, name).not.toContain(name)
    }
    expect(getFoundingName('vicky')).toBeNull()
  })

  it('does not make the Fon the owner of the practice he works in', () => {
    const b = getCuratedBusiness('urologie-neuwied')!
    expect(b.people![0].relationship).toBe('physician')
    expect(JSON.stringify(b)).not.toMatch(/"relationship":\s*"owner"/)
  })

  it('holds the register at the count the Fondom has authorised, and no more', () => {
    /* 110 after the population programme froze, plus the three the Fondom explicitly added on
       2026-09-17 so their businesses could be linked. The freeze stopped discovery; it never
       stopped the Fondom naming somebody it knows. */
    const namesDoc = JSON.parse(
      readFileSync('src/data/community/founding-names.json', 'utf-8'),
    ) as { names: Array<{ slug: string; source: string }> }
    expect(namesDoc.names).toHaveLength(113)

    const added = namesDoc.names.filter(n => n.source === 'owner-confirmation-2026-09-17')
    expect(added.map(n => n.slug).sort())
      .toEqual(['denis-m-tebit', 'edith-fongho', 'tanwi-amerion'])
  })

  it('gives each newly added person exactly one entry', () => {
    for (const [probe, slug] of [
      ['edith', 'edith-fongho'],
      ['denis', 'denis-m-tebit'],
      ['amerion', 'tanwi-amerion'],
    ] as const) {
      expect(NAMES_WITH(probe)).toEqual([slug])
    }
  })

  it('invents no standing, family or membership for the newly added people', () => {
    for (const slug of ['edith-fongho', 'denis-m-tebit', 'tanwi-amerion']) {
      const n = getFoundingName(slug)!
      expect(n.body, slug).toBeUndefined()
      expect(n.chapter, slug).toBeNull()
      expect(n.royalRole ?? null, slug).toBeNull()
      expect(n.notable, slug).toBeFalsy()
      expect(n.residence, slug).toBeUndefined()
      expect(n.profession, slug).toBeUndefined()
      /* The structured fields above are the real guarantee: standing in this register comes
         from body, chapter, royalRole and notable, and all four are empty for these three.

         The text sweep is narrower than a word list, because a note may legitimately NAME
         another body in order to say somebody is NOT part of it - Tanwi Amerion's note
         distinguishes him from Festus Tanwi, the GUDECA EU officer, which is exactly the
         kind of sentence that keeps two people apart. What must not appear is a CLAIM. */
      const written = JSON.stringify(n).toLowerCase()
        /* "a son or daughter of Guneku" is how this register says somebody is an indigene.
           It is the phrase every one of these notes opens with and it is not a relationship
           to a person. */
        .replace(/a son of guneku|a daughter of guneku|son or daughter of guneku/g, 'an indigene')

      for (const claim of [
        /member of/, /belongs to/, /chapter of/, /quarter of/,
        /son of /, /daughter of /, /brother|sister|wife of|husband of/,
        /of the palace family/, /queen|prince|ngam-fon|notable/,
      ]) {
        expect(written, `${n.slug} / ${claim}`).not.toMatch(claim)
      }
    }
  })

  it('keeps an academic suffix out of a name', () => {
    /* The Fondom supplied "Denis M. Tebit, PhD, MSc". This register has never carried a
       suffix in a display name; the qualifications are recorded in the note instead. */
    const denis = getFoundingName('denis-m-tebit')!
    expect(denis.display).toBe('Denis M. Tebit')
    expect(denis.display).not.toMatch(/PhD|MSc/)
    expect(denis.note).toMatch(/PhD/)
  })
})

describe('nothing private is published', () => {
  it('carries no personal address at a free mail provider', () => {
    expect(RAW).not.toMatch(/@(gmx|gmail|yahoo|hotmail|outlook|icloud|proton|web)\./i)
  })

  it('carries no telephone number, WhatsApp link or personal social account', () => {
    const numbers = (RAW.match(/\+?\d[\d ()\-]{8,}\d/g) ?? [])
      .filter(s => !/^\s*\d{4}-\d{2}-\d{2}/.test(s.trim()))
    expect(numbers).toEqual([])
    for (const marker of ['wa.me', 'whatsapp', 't.me/', 'mailto:']) {
      expect(RAW.toLowerCase(), marker).not.toContain(marker)
    }
  })

  it('publishes a business address and never a person’s residence', () => {
    /* Magic Gate publishes a street, which is its own and is already public. The register
       publishes a country against a person and never a town, and nothing here writes to it. */
    const magic = getCuratedBusiness('magic-gate-enterprise')!
    expect(magic.location?.address).toMatch(/Bonaberi/)

    const register = readFileSync('src/data/community/founding-names.json', 'utf-8')
    for (const town of ['Bonaberi', 'Watford', 'Neuwied', 'Christiansburg', 'Lynchburg', 'Essen']) {
      expect(register, town).not.toContain(town)
    }
  })

  it('only links out over http or https', () => {
    for (const b of ALL) {
      for (const link of Object.values(b.links ?? {})) {
        if (!link) continue
        /* Parsing normalises a bare host to a trailing slash, so the guarantee is that the
           link SURVIVES parsing as http(s) — not that the stored string is byte-identical. */
        const parsed = safeExternalUrl(link)
        expect(parsed, `${b.slug}: ${link}`).toBeTruthy()
        expect(parsed!.startsWith('https://') || parsed!.startsWith('http://')).toBe(true)
      }
    }
  })

  it('publishes no rating, review or invented statistic', () => {
    /* No score, no star, no count. The record is allowed to SAY that it publishes no rating —
       Concept Care's note does exactly that — so what is forbidden is a value, not the word.
       A number beside a star, a "4.8", an "out of five", a follower count. */
    for (const pattern of [
      /\d(?:\.\d)?\s*(?:\/|out of)\s*5/i,
      /★|⭐/,
      /\d+(?:\.\d+)?\s*stars?/i,
      /testimonial/i,
      /\d+(?:\.\d+)?\s*[Kk]?\s*followers/i,
      /rated/i,
    ]) {
      expect(RAW, String(pattern)).not.toMatch(pattern)
    }
  })
})

describe('only approved businesses reach the public', () => {
  it('keeps held businesses out of the public list', () => {
    expect(PUBLIC.every(b => b.status === 'public')).toBe(true)
    expect(PUBLIC.map(b => b.slug)).toContain('magic-gate-enterprise')
    expect(PUBLIC.map(b => b.slug)).not.toContain('vicky-and-sons')
    expect(ALL.length).toBeGreaterThan(PUBLIC.length)
  })

  it('keeps held businesses out of the sitemap and the search index', () => {
    const held = ALL.filter(b => b.status !== 'public')
    expect(held.length).toBeGreaterThan(0)
    for (const b of held) {
      const hits = search(b.name).groups.flatMap(g => g.results)
      expect(hits.map(r => r.href), b.slug).not.toContain(`/businesses/${b.slug}`)
    }
    const sitemap = readFileSync('src/app/sitemap.ts', 'utf-8')
    expect(sitemap).toContain('publicCuratedBusinesses()')
  })

  it('finds every published business by name, once', () => {
    for (const b of PUBLIC) {
      const hits = search(b.name).groups
        .flatMap(g => g.results)
        .filter(r => r.href === `/businesses/${b.slug}`)
      expect(hits.length, b.name).toBe(1)
    }
  })

  it('keeps the management surfaces out of the sitemap', () => {
    const sitemap = readFileSync('src/app/sitemap.ts', 'utf-8')
    /* Read from the lines that actually emit an entry. The file's own comment names the
       management path precisely in order to say it is absent, so a plain text search over
       the whole file would fail on the sentence explaining the guarantee. */
    const emitted = sitemap
      .split('\n')
      .filter(l => l.includes('at(') && !l.trimStart().startsWith('*'))
      .join('\n')

    expect(emitted).not.toContain('my-guneku')
    expect(emitted).toContain('/businesses')
  })
})

describe('discovery', () => {
  it('finds a business by name, service, tag and place', () => {
    const by = (q: string) => filterBusinesses(PUBLIC, { q }).map(b => b.slug)
    expect(by('midas')).toContain('midas-property-auctions')
    expect(by('  MIDAS  ')).toContain('midas-property-auctions')
    expect(by('catfish')).toContain('vitalis-fish-breeding-centre')
    expect(by('photography')).toContain('fondom-studios')
    expect(by('watford')).toContain('concept-care-solutions')
  })

  it('does not find a business by the name of the person behind it', () => {
    /* A directory of businesses must not become a way of looking people up. */
    expect(filterBusinesses(PUBLIC, { q: 'marcel' })).toEqual([])
    expect(filterBusinesses(PUBLIC, { q: 'fongoh' })).toEqual([])
  })

  it('filters by category and by country', () => {
    const media = filterBusinesses(PUBLIC, { category: 'media-creative' })
    expect(media.map(b => b.slug)).toEqual(['fondom-studios'])
    const cameroon = filterBusinesses(PUBLIC, { country: 'Cameroon' })
    expect(cameroon.length).toBeGreaterThan(0)
    expect(cameroon.every(b => b.location?.country === 'Cameroon')).toBe(true)
  })

  it('offers no filter that would return nothing', () => {
    for (const c of categoriesPresent(PUBLIC)) expect(c.count).toBeGreaterThan(0)
    for (const c of countriesPresent(PUBLIC)) expect(c.count).toBeGreaterThan(0)
  })

  it('never suggests a business beside itself', () => {
    for (const b of PUBLIC) {
      expect(relatedBusinesses(PUBLIC, b).map(x => x.slug), b.slug).not.toContain(b.slug)
    }
  })
})

describe('slugs', () => {
  it('builds a safe slug from a name', () => {
    expect(businessSlug('Vicky and Son’s')).toBe('vicky-and-son-s')
    expect(businessSlug('  Café  Déjà Vu!  ')).toBe('cafe-deja-vu')
    expect(businessSlug('///')).toBe('')
  })

  it('resolves a collision rather than taking a published URL', () => {
    expect(uniqueBusinessSlug('Fondom Studios', ['fondom-studios'])).toBe('fondom-studios-2')
    expect(uniqueBusinessSlug('Fondom Studios', ['fondom-studios', 'fondom-studios-2']))
      .toBe('fondom-studios-3')
    expect(uniqueBusinessSlug('New Shop', [])).toBe('new-shop')
    expect(uniqueBusinessSlug('///', [])).toBe('business')
  })

  it('reserves the curated slugs so a registered business cannot hide one', () => {
    const reserved = PUBLIC.map(b => b.slug)
    expect(uniqueBusinessSlug('MaxPromo Digital', reserved)).not.toBe('maxpromo-digital')
  })
})

describe('YouTube', () => {
  const ID = 'dQw4w9WgXcQ'

  it('accepts the four forms people actually paste', () => {
    for (const url of [
      `https://www.youtube.com/watch?v=${ID}`,
      `https://youtu.be/${ID}`,
      `https://www.youtube.com/shorts/${ID}`,
      `https://www.youtube.com/embed/${ID}`,
      `https://m.youtube.com/watch?v=${ID}&t=42s`,
      `youtube.com/watch?v=${ID}`,
    ]) {
      expect(youtubeIdFrom(url), url).toBe(ID)
    }
  })

  it('refuses anything that is not a YouTube video link', () => {
    for (const bad of [
      'javascript:alert(1)',
      'data:text/html,<script>alert(1)</script>',
      '<iframe src="https://evil.example"></iframe>',
      'https://evil.example/watch?v=dQw4w9WgXcQ',
      'https://www.youtube.com/playlist?list=PLabc',
      'https://www.youtube.com/watch?v=tooshort',
      ID,
      '',
      null,
      undefined,
      42,
    ]) {
      expect(youtubeIdFrom(bad as unknown), String(bad)).toBeNull()
    }
  })

  it('builds an embed only from a validated id, and on the no-cookie host', () => {
    expect(youtubeEmbedUrl(ID)).toBe(`https://www.youtube-nocookie.com/embed/${ID}`)
    expect(youtubeThumbnail(ID)).toContain(ID)
    expect(() => youtubeEmbedUrl('"><script>')).toThrow()
    expect(() => youtubeThumbnail('../../etc')).toThrow()
  })
})

describe('outbound links', () => {
  it('refuses a scheme a browser would execute', () => {
    for (const bad of [
      'javascript:alert(1)', 'JavaScript:alert(1)', 'data:text/html,x',
      'vbscript:msgbox', 'file:///etc/passwd', 'notaurl', '', null,
    ]) {
      expect(safeExternalUrl(bad as unknown), String(bad)).toBeNull()
    }
  })

  it('accepts and normalises an ordinary address', () => {
    expect(safeExternalUrl('example.com')).toBe('https://example.com/')
    expect(safeExternalUrl('https://example.com/shop')).toBe('https://example.com/shop')
  })

  it('shows a readable host rather than a raw URL', () => {
    expect(displayUrl('https://www.conceptcaresolutions.com/')).toBe('conceptcaresolutions.com')
    expect(displayUrl('https://maxpromo.digital')).toBe('maxpromo.digital')
  })
})

describe('the card survives every state', () => {
  it('gives a business with no images something designed', () => {
    const none = PUBLIC.filter(b => !b.cover && !b.logo)
    /* Most of them, today. The no-image state is the ordinary one. */
    expect(none.length).toBeGreaterThan(0)
    for (const b of none) {
      expect(businessInitials(b.name).length).toBeGreaterThanOrEqual(1)
      expect(businessInitials(b.name).length).toBeLessThanOrEqual(2)
      const hue = placeholderHue(b.slug)
      expect(hue).toBeGreaterThanOrEqual(0)
      expect(hue).toBeLessThan(360)
      /* Deterministic: the same card is the same colour on every render. */
      expect(placeholderHue(b.slug)).toBe(hue)
    }
  })

  it('reads initials from the words that carry meaning', () => {
    expect(businessInitials('The Magic Gate Enterprise')).toBe('MG')
    expect(businessInitials('MaxPromo Digital')).toBe('MD')
    expect(businessInitials('Midas')).toBe('MI')
    expect(businessInitials('!!!')).toBe('G')
  })

  it('writes a place only where there is one', () => {
    expect(locationLabel({ country: 'Cameroon', city: 'Douala' })).toBe('Douala, Cameroon')
    expect(locationLabel({ country: 'Cameroon' })).toBe('Cameroon')
    expect(locationLabel(undefined)).toBeNull()
  })
})

describe('the two halves of the directory', () => {
  const registered = (slug: string): Business => ({
    slug, name: slug, category: 'retail-commerce', status: 'public', registered: true,
  })

  it('shows curated and registered businesses as one directory', () => {
    const merged = mergeBusinesses(PUBLIC, [registered('a-new-shop')])
    expect(merged).toHaveLength(PUBLIC.length + 1)
    expect(merged.map(b => b.slug)).toContain('a-new-shop')
  })

  it('lets a curated record win a slug collision', () => {
    const merged = mergeBusinesses(PUBLIC, [registered('maxpromo-digital')])
    expect(merged).toHaveLength(PUBLIC.length)
    expect(merged.find(b => b.slug === 'maxpromo-digital')?.registered).toBeUndefined()
  })
})
