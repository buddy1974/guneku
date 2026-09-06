import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { GUNEKU_QUARTERS_27 } from './quarters'
import {
  allFoundingNames, allNotables, getFoundingName, isDiaspora, diasporaNames,
  allChapters, palaceQueens,
} from './community'
import { getImageGallery } from './content'
import { allProjects } from './projects'
import { allFilms } from './guneku-tv'
import exco from '@/data/gudeca/national-exco.json'
import site from '@/data/site-config.json'

/* The facts about Guneku this platform must not quietly change.
 *
 * Every assertion here is a thing somebody established — an owner correction, a source
 * document, a decision recorded in the log — rather than a shape the code happens to have
 * today. That is the difference between an invariant and a snapshot: a snapshot test breaks
 * when the code improves, and this file should only ever break when a *fact* moves, at which
 * point somebody should have to say so out loud in a diff.
 *
 * The failure mode it guards against is not a crash. It is a village register that gains a
 * twenty-eighth quarter, a Fomuki who becomes royal by surname, a queen who acquires a
 * seniority nobody recorded, or a withdrawn date that quietly returns — none of which any
 * other test would notice. */

const NAMES = allFoundingNames()
const byDisplay = (d: string) => NAMES.find(n => n.display === d)

describe('the quarters — exactly 27, and no twenty-eighth by accident', () => {
  it('holds 27 canonical quarters, each distinct', () => {
    expect(GUNEKU_QUARTERS_27).toHaveLength(27)
    expect(new Set(GUNEKU_QUARTERS_27).size).toBe(27)
  })

  it('does not admit a disputed name into the canonical list', () => {
    /* "Njinebai" appears in the Traditional Council's own record of a quarter head, and is
       not one of the 27. The discrepancy is surfaced by `councilNamesOutsideCanonicalQuarters`
       and left for the owner; what must never happen is it being resolved by appending it
       here, which would turn an open question into a published fact. */
    expect(GUNEKU_QUARTERS_27 as readonly string[]).not.toContain('Njinebai')
  })

  it('names no quarter twice under a different spelling', () => {
    const squashed = GUNEKU_QUARTERS_27.map(q => q.toLowerCase().replace(/[^a-z]/g, ''))
    expect(new Set(squashed).size).toBe(27)
  })
})

describe('the archive — counts that a person decided on', () => {
  const gallery = getImageGallery()
  const albums = gallery.albums ?? []
  const images = albums.flatMap((a: { images?: unknown[] }) => a.images ?? [])

  it('publishes 15 albums and 339 photographs', () => {
    expect(albums).toHaveLength(15)
    expect(images).toHaveLength(339)
  })

  it('serves nothing from the gallery that the catalogue does not list', () => {
    const listed = new Set(images.map((i) => String((i as { publicPath: string }).publicPath)))
    const stray: string[] = []
    const stack = ['public/images/gallery']
    while (stack.length) {
      const dir = stack.pop()!
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const full = `${dir}/${e.name}`
        if (e.isDirectory()) { stack.push(full); continue }
        if (!listed.has(full.replace(/^public/, ''))) stray.push(full)
      }
    }
    expect(stray).toEqual([])
  })

  it('keeps 162 staged photographs and 17 held files outside every served path', () => {
    const staged = ['coronation', 'enthronement', 'prince-tibahs-bornhouse-bonn',
                    'guneku-dmv-welcomefomuki']
    let total = 0
    for (const d of staged) {
      expect(existsSync(`public/images/gallery/${d}`)).toBe(false)
      total += readdirSync(`archive-staging/${d}`).length
    }
    expect(total).toBe(162)
    expect(existsSync('public/images/gallery/visit-to-fons-palace-by-eu-residents')).toBe(false)
    expect(readdirSync('archive-held/visit-to-fons-palace-by-eu-residents')).toHaveLength(17)
  })

  it('carries no web-server configuration file under public/', () => {
    /* R-041. `.htaccess` and `web.config` inside `public/` are not rules — Next reads
       neither — they are downloadable text that says "deny from all". */
    const found: string[] = []
    const stack = ['public']
    while (stack.length) {
      const dir = stack.pop()!
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const full = `${dir}/${e.name}`
        if (e.isDirectory()) { stack.push(full); continue }
        if (['.htaccess', 'web.config', 'index.html'].includes(e.name)) found.push(full)
      }
    }
    expect(found).toEqual([])
  })

  it('keeps the private film and the held directory out of every gallery record', () => {
    const all = JSON.stringify(gallery)
    expect(all).not.toContain('2jS-ael4Ccg')
    expect(all).not.toContain('visit-to-fons-palace-by-eu-residents')
    expect(allFilms().some(f => f.youtubeId === '2jS-ael4Ccg')).toBe(false)
  })
})

describe('people — who the Fondom says someone is', () => {
  it('does not make Marcel Tabit Akwe a Notable', () => {
    /* The word means a place in the traditional governance of the village around the Fon. A
       career confers nothing traditional, however distinguished. The record says so in its
       own note, and this asserts the consequence. */
    const marcel = byDisplay('Marcel Tabit Akwe')!
    expect(marcel).toBeDefined()
    expect(marcel.notable).toBe(false)
    expect(allNotables().map(n => n.slug)).not.toContain('marcel-tabit-akwe')
    expect(marcel.profileUrl).toBe('/sons-and-daughters/marcel-tabit-akwe')
  })

  it('records Roland Teboh Forbang as a Notable, in GUDECA USA, and diaspora', () => {
    const roland = byDisplay('Prof. Dr. Roland Teboh Forbang')!
    expect(roland.notable).toBe(true)
    expect(roland.chapter).toBe('gudeca-us-dmv')
    expect(isDiaspora(roland)).toBe(true)
    /* And his standing is recorded as separate from his profession, not derived from it. */
    expect(roland.notableNote ?? '').toMatch(/not what makes him a Notable/i)
  })

  it('places Queen Esther in the Palace household and in the diaspora', () => {
    const esther = byDisplay('Queen Esther Fomuki')!
    expect(esther.body).toBe('palace-household')
    expect(esther.role).toMatch(/^Queen of the Guneku Palace/)
    expect(isDiaspora(esther)).toBe(true)
    /* She is reachable by the names the record actually carries for her. */
    expect(getFoundingName('esther-hammer-fomuki')?.display).toBe('Queen Esther Fomuki')
  })

  it('records Carine and Rebecca as Queens of the Palace', () => {
    for (const d of ['Fomuki Carine', 'Mrs. Fomuki Rebecca']) {
      const q = byDisplay(d)!
      expect(q).toBeDefined()
      expect(q.body).toBe('palace-household')
      expect(q.role).toMatch(/Queen of the Guneku Palace/)
    }
  })

  it('invents no seniority among the Queens', () => {
    /* Three women are recorded as Queen of the Guneku Palace. Nothing in any source ranks
       them, so nothing here may: no "first", no "senior", no ordering, no numbering. */
    const queens = palaceQueens()
    expect(queens.length).toBeGreaterThanOrEqual(3)
    for (const q of queens) {
      expect(q.role).not.toMatch(/\b(first|second|third|senior|junior|principal|chief)\b/i)
      expect(q.role).not.toMatch(/\b(1st|2nd|3rd)\b/)
    }
  })

  it('decides who is royal from the record, never from a surname', () => {
    /* Everybody in the household today happens to be called Fomuki, which is exactly the
       coincidence that makes a surname rule tempting and wrong. The guarantee is therefore
       about the code rather than about today's data: membership comes from `body`, and
       nothing in the community module matches on a name to confer royalty. */
    const source = readFileSync('src/lib/community.ts', 'utf-8')
    expect(source.toLowerCase()).not.toContain('fomuki')
    expect(source).toContain("ROYAL_FAMILY_BODY = 'palace-household'")

    /* And every member of the household is there because a source put them there. */
    for (const n of NAMES.filter(x => x.body === 'palace-household')) {
      expect(String(n.source ?? '').trim().length).toBeGreaterThan(0)
    }
  })

  it('keeps Amamuki Jonathan and Mbakwa Jonathan apart', () => {
    /* Two different people who share a forename. Merging them would put a GUDECA national
       officer on the Traditional Council, or the reverse. */
    const a = byDisplay('Amamuki Jonathan')!
    const m = byDisplay('Mbakwa Jonathan')!
    expect(a.slug).not.toBe(m.slug)
    expect(a.body).toBe('traditional-council')
    expect(m.body).toBe('gudeca-national')
    expect(a.aliases ?? []).not.toContain('Mbakwa Jonathan')
    expect(m.aliases ?? []).not.toContain('Amamuki Jonathan')
  })

  it('holds Ma Rose as one person under one slug', () => {
    const roses = NAMES.filter(n =>
      n.display === 'Ma Rose' || (n.aliases ?? []).includes('Ma Rose'))
    expect(roses).toHaveLength(1)
    expect(roses[0].slug).toBe('ma-rose')
  })

  it('holds Sam Fongoh as one person, reachable by the spellings the sources use', () => {
    const sam = byDisplay('Sam Fongoh')!
    expect(sam.aliases).toContain('Ni Sam')
    /* "Sam Fongho" appears in one source. Kept as an alias rather than as a second person. */
    expect(sam.aliases).toContain('Sam Fongho')
    expect(NAMES.filter(n => /fongoh|fongho/i.test(n.display)).map(n => n.slug))
      .not.toContain('sam-fongho')
  })

  it('gives every person exactly one record', () => {
    const slugs = NAMES.map(n => n.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})

describe('GUDECA — the roster, and what stays private', () => {
  it('publishes the twelve-office National EXCO', () => {
    expect(exco.members).toHaveLength(12)
    for (const m of exco.members) {
      expect(String(m.office).trim().length).toBeGreaterThan(0)
      expect(String(m.name).trim().length).toBeGreaterThan(0)
    }
  })

  it('carries none of the Joomla sample names', () => {
    /* `src/data/pages/gudeca-exco.json` held four fictitious people from a Joomla demo
       install (R-011). It was deleted on 2026-09-06 — see the deletion test below — and this
       stays because the names must not reappear by any other route either. */
    /* The names only. The record's own source note explains that a second migrated file
       holds Joomla sample data and is not published — and a check that read the whole
       document would fail on the sentence documenting the guarantee. */
    const roster = exco.members.map(m => `${m.office} ${m.name}`).join(' | ').toLowerCase()
    for (const fake of ['john doe', 'jane doe', 'joe bloggs', 'lorem', 'sample', 'example']) {
      expect(roster).not.toContain(fake)
    }
  })

  it('publishes no personal mobile number', () => {
    /* The contact policy is the Fondom's own address, never an officer's handset. */
    const raw = readFileSync('src/data/gudeca/national-exco.json', 'utf-8')
    /* Anything that reads as a phone number, other than a date. */
    const numbers = (raw.match(/\+?\d[\d ()\-]{8,}\d/g) || [])
      .filter(s => !/^\s*\d{4}-\d{2}-\d{2}/.test(s.trim()))
    expect(numbers).toEqual([])
  })
})

describe('the diaspora — living outside Cameroon, and nothing else', () => {
  it('counts a register, and never calls it a population', () => {
    /* The register is who the Fondom has recorded, which is not who exists. Describing it as
       a census or a total would be a claim about Guneku that nobody can support. */
    const people = diasporaNames()
    expect(people.length).toBeGreaterThan(0)
    const source = readFileSync('src/lib/community.ts', 'utf-8')
    expect(source).not.toMatch(/\b(census|total population|all Guneku people abroad)\b/i)
  })

  it('makes an overseas chapter establish diaspora', () => {
    const overseas = allChapters().filter(c => c.scope === 'diaspora')
    expect(overseas.length).toBeGreaterThan(0)
    for (const c of overseas) {
      for (const n of NAMES.filter(x => x.chapter === c.id)) {
        expect(isDiaspora(n)).toBe(true)
      }
    }
  })

  it('does not make a Cameroonian city establish diaspora', () => {
    /* Yaoundé, Douala, Bamenda and Mbengwi are home chapters. Someone who left the village
       for the capital has not left the country. */
    const home = allChapters().filter(c => c.scope === 'home').map(c => c.id)
    expect(home.length).toBeGreaterThan(0)
    for (const n of NAMES.filter(x => x.chapter && home.includes(x.chapter))) {
      expect(isDiaspora(n)).toBe(false)
    }
  })
})

describe('the Palace record — the chronology that was established', () => {
  const corpus = () => {
    const out: string[] = []
    const stack = ['src/data']
    while (stack.length) {
      const dir = stack.pop()!
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const full = `${dir}/${e.name}`
        if (e.isDirectory()) { stack.push(full); continue }
        if (e.name.endsWith('.json')) out.push(full)
      }
    }
    return out
  }

  it('publishes the Palace telephone of record', () => {
    expect((site as { palacePhone: string }).palacePhone).toBe('+237 681 19 46 64')
  })

  it('has not let 17 January 2016 return', () => {
    /* ADR-001. The date was published as a coronation, appears nowhere in the retired Joomla
       database, and was withdrawn. Its only origin was a hand-authored literal. The one place
       it may still be named is the source note that records the withdrawal. */
    const offenders: string[] = []
    for (const f of corpus()) {
      const text = readFileSync(f, 'utf-8')
      if (!/2016-01-17|17 January 2016|17th January 2016|January 17,? 2016/i.test(text)) continue
      /* Permitted only where the record explains that it was withdrawn. */
      if (!/withdrawn/i.test(text)) offenders.push(f)
    }
    expect(offenders).toEqual([])
  })

  it('keeps the predecessor’s reign at 1965 to 2015', () => {
    const article = readFileSync('src/data/palace/the-coronation.json', 'utf-8')
    expect(article).toMatch(/reigned since 1965/)
    expect(article).toMatch(/28 January 2015/)
  })

  it('keeps the succession as distinct stages rather than one coronation', () => {
    const article = readFileSync('src/data/palace/the-coronation.json', 'utf-8')
    for (const stage of [
      '28 January 2015', '27 February 2015', 'November 2015', '30 December 2016',
    ]) {
      expect(article).toContain(stage)
    }
    expect(article).toMatch(/rather than collapsing them into one coronation date/)
  })

  it('dates the enthronement where the profile dates it, and nowhere else', () => {
    const profile = JSON.parse(readFileSync('src/data/palace/fon-walters-profile.json', 'utf-8'))
    expect(profile.enthronementDate).toBe('2015-02-27')
  })
})

describe('projects — a register, not an accounting system', () => {
  const projects = allProjects()

  it('holds 28 records', () => {
    expect(projects).toHaveLength(28)
  })

  it('has no field for money, anywhere', () => {
    /* The register records what the Fondom is doing. It has never held an amount, and a
       field for one would be an invitation to fill it in. */
    for (const p of projects) {
      for (const field of [
        'amount', 'budget', 'cost', 'raised', 'target', 'spent', 'balance', 'donors',
        'funding', 'price',
      ]) {
        expect(p).not.toHaveProperty(field)
      }
    }
  })

  it('invents no status, location or timeline', () => {
    /* Every status must come from the register's own vocabulary, and an absent location or
       date stays absent rather than becoming a guess. */
    for (const p of projects) {
      expect(typeof p.name).toBe('string')
      expect(p.name.trim().length).toBeGreaterThan(0)
      for (const field of ['startedOn', 'completedOn', 'deadline', 'coordinates']) {
        expect(p).not.toHaveProperty(field)
      }
    }
  })
})

describe('no page links at a page that does not exist', () => {
  /* Two dead links reached production and were found by crawling it, not by any test:
     the explore map pointed at /institutions/guneku-agro-cig and /institutions/guyodeca.
     Both institutions carry their own `route` — /agro-cig and /gudeca/guyodeca — and
     `generateStaticParams` deliberately builds no /institutions page for a record that
     already has a home. So the links were for pages the site had decided not to generate.

     This is the shape of that mistake, guarded. */
  const institutions = JSON.parse(readFileSync('src/data/explore/locations.json', 'utf-8'))

  const publicUrls = (() => {
    const out: Array<{ id: string; url: string }> = []
    const walk = (o: unknown) => {
      if (Array.isArray(o)) return o.forEach(walk)
      if (o && typeof o === 'object') {
        const rec = o as Record<string, unknown>
        if (typeof rec.publicUrl === 'string') {
          out.push({ id: String(rec.id ?? '?'), url: rec.publicUrl })
        }
        Object.values(rec).forEach(walk)
      }
    }
    walk(institutions)
    return out
  })()

  const records = readdirSync('src/data/institutions')
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(readFileSync(`src/data/institutions/${f}`, 'utf-8')))

  it('finds the map links to check', () => {
    expect(publicUrls.length).toBeGreaterThan(10)
  })

  it('links to /institutions/<id> only where such a page is generated', () => {
    /* A page exists for an institution with no `route` of its own that is not held. */
    const routed = new Set(
      records.filter(r => typeof r.route !== 'string' && r.publicVisibility !== 'hold')
        .map(r => String(r.id)))
    const broken = publicUrls
      .filter(l => l.url.startsWith('/institutions/'))
      .filter(l => !routed.has(l.url.replace('/institutions/', '')))
    expect(broken).toEqual([])
  })

  it('sends a reader to an institution’s own home when it has one', () => {
    const homes = new Map(
      records.filter(r => typeof r.route === 'string').map(r => [String(r.id), String(r.route)]))
    for (const l of publicUrls) {
      const id = l.url.replace('/institutions/', '')
      if (l.url.startsWith('/institutions/') && homes.has(id)) {
        /* Would be a link to a page that is deliberately not generated. */
        expect(`${l.id} -> ${l.url}`).toBe(`${l.id} -> ${homes.get(id)}`)
      }
    }
  })

  it('links only to somewhere on Guneku', () => {
    for (const l of publicUrls) {
      expect(l.url.startsWith('/')).toBe(true)
      expect(l.url).not.toMatch(/^\/\//)
      expect(l.url).not.toMatch(/vercel\.app|localhost/)
    }
  })
})

describe('dead files that held invented people are gone, not merely unread', () => {
  /* R-011 and R-012, closed 2026-09-06 by deletion.
     `src/data/pages/gudeca-exco.json` held four fictitious names from a Joomla demo install,
     and `src/data/about/` held nine dead duplicates. Nothing read either, which is precisely
     what made them dangerous: an unread file containing four invented people is one careless
     import away from publishing them, and the next person to find it has no way of knowing
     the names are fake. Both remain in git history. */
  it('has deleted the Joomla sample roster', () => {
    expect(existsSync('src/data/pages/gudeca-exco.json')).toBe(false)
  })

  it('has deleted the duplicate about/ directory', () => {
    expect(existsSync('src/data/about')).toBe(false)
  })

  it('finds no invented person anywhere in the data', () => {
    const stack = ['src/data']
    const offenders: string[] = []
    while (stack.length) {
      const dir = stack.pop()!
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const full = `${dir}/${e.name}`
        if (e.isDirectory()) { stack.push(full); continue }
        if (!e.name.endsWith('.json')) continue
        const text = readFileSync(full, 'utf-8').toLowerCase()
        for (const fake of ['john doe', 'jane doe', 'joe bloggs', 'lorem ipsum']) {
          if (text.includes(fake)) offenders.push(`${full}: ${fake}`)
        }
      }
    }
    expect(offenders).toEqual([])
  })
})

describe('a published count matches the thing it counts', () => {
  /* On 2026-09-06 the archive gained one photograph and three published sentences went on
     saying 338 — the homepage stat, the FAQ answer, and two page descriptions. None of them
     was wrong when written, which is exactly the problem with a number typed into prose: it
     is a fact with no link to the thing it describes. These are the ones a reader sees. */
  const facts = JSON.parse(readFileSync('src/data/home/village-facts.json', 'utf-8'))
  const gallery = getImageGallery()
  const albums = gallery.albums ?? []
  const photos = albums.flatMap((a: { images?: unknown[] }) => a.images ?? []).length

  it('states the photograph count the gallery actually holds', () => {
    const stat = (facts.glance ?? [])
      .find((f: { id?: string }) => f.id === 'photographs')
    expect(stat).toBeDefined()
    expect(String(stat.value)).toBe(String(photos))
  })

  it('answers the photographs question with the same number', () => {
    const faq = JSON.stringify(facts)
    expect(faq).toContain(`${photos} photographs`)
    expect(faq).not.toContain('338 photographs')
  })

  it('describes the gallery pages with the same number', () => {
    for (const f of ['src/app/gallery/page.tsx', 'src/app/gallery/images/page.tsx']) {
      const text = readFileSync(f, 'utf-8')
      expect(text).toContain(String(photos))
      expect(text).not.toMatch(/\b338 photographs\b/)
    }
  })

  it('states the album count the gallery actually holds', () => {
    expect(albums).toHaveLength(15)
  })
})
