import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { getUpdate, getAllUpdates } from './content'
import { getCuratedBusiness } from './businesses'
import { getQuarter } from './quarter-pages'

/* The October 2026 community-intelligence merge.
 *
 * Five additions from public community sources, each with a way to go wrong quietly: a
 * crime record that names someone it should not, a date made more precise than its source,
 * an advertised offering presented as counted stock, a past examination left as "next",
 * and a business's advertised numbers published without the owner's election. */

const json = <T,>(f: string): T => JSON.parse(readFileSync(f, 'utf-8')) as T

describe('the Palace investigation record', () => {
  const u = getUpdate('palace-investigation-attack-on-family-october-2026')!
  const raw = readFileSync('src/data/updates/palace-investigation-attack-on-family-october-2026.json', 'utf-8')

  it('exists once, on the date of the questioning', () => {
    expect(u).toBeTruthy()
    expect(u.publishedAt?.slice(0, 10)).toBe('2026-10-02')
    expect(getAllUpdates().filter(x => x.slug === u.slug)).toHaveLength(1)
  })

  /* Accuracy, not editorial policy. How crime is presented — images, which details — is
     ADR-101, which is a proposal awaiting the owner's decision and is not enforced here. */
  it('treats the suspects as untried', () => {
    expect(u.body).toMatch(/not a court judgment/)
    expect(u.body).toMatch(/No charge, trial or verdict has been reported/)
  })

  it('separates what is corroborated from what is single-source or alleged', () => {
    expect(u.body).toMatch(/Confirmed by more than one source:/)
    expect(u.body).toMatch(/Reported by a single source:<\/strong>[^<]*120,000 FCFA/)
    expect(u.body).toMatch(/An allegation, with no court finding:/)
    expect(u.body).toMatch(/published on 5 October 2026/)
  })

  it('does not repeat the unconfirmed claim about where the suspects came from', () => {
    expect(u.body).not.toMatch(/Nyen|Njinedeh/)
  })

  it('links the documentary and credits both sources', () => {
    expect(u.body).toContain('https://www.facebook.com/reel/2303868100018359/')
    expect(u.body).toContain('Mbengwi Info Newsline')
    expect(raw).not.toMatch(/wa\.me|\+237|\b6\d{2}[ ]?\d{3}[ ]?\d{3}\b/)
  })
})

describe('section 7 — other community developments', () => {
  it('records the council budget without inventing what was done for Guneku schools', () => {
    const u = getUpdate('mbengwi-council-2026-budget-guneku-schools')!
    expect(u.publishedAt?.slice(0, 10)).toBe('2026-09-24')
    expect(u.body).toContain('907,250,000 FCFA')
    expect(u.body).toMatch(/schools in Guneku/)
    expect(u.body).toMatch(/What is not yet established/)
    expect(u.body).toContain('https://www.facebook.com/watch/?v=2261127488019039')
    /* Munam is a Guneku quarter, but the source does not say it means that Munam. */
    expect(u.body).toMatch(/no Guneku bridge project is recorded here/)
  })

  it('adds a source to the MEFU–MECUDA record rather than a second record of it', () => {
    const mefu = getAllUpdates().filter(x => /mefu-mecuda-joint/i.test(x.slug))
    expect(mefu.map(x => x.slug)).toEqual(['mefu-mecuda-joint-meeting-guneku-palace'])
    expect(mefu[0].body).toContain('https://www.facebook.com/watch/?v=4383072861957851')
  })
})

describe('Fun Quarter', () => {
  const u = getUpdate('fun-quarter-protection-rites-october-2026')!

  it('does not make the date more precise than the source allows', () => {
    expect(u.excerpt).not.toMatch(/\b[56] October\b/)
    expect(u.body).toMatch(/either Monday 5 or Tuesday 6 October/)
  })

  it('is linked from the quarter page, and the quarter keeps what it had', () => {
    const hrefs = getQuarter('fun')!.links.map(l => l.href)
    expect(hrefs).toContain('/updates/fun-quarter-protection-rites-october-2026')
    expect(hrefs).toContain('/people/traditional-council')
    expect(hrefs).toContain('/projects')
  })
})

describe('Guneku Agro CIG', () => {
  type Cig = {
    livestock: Array<{ animal: string; status: string; asOf: string }>
    orders: { display: string }
    commercialActivity: { recorded: Array<{ date: string }> }
    registration: { registeredName: string }
    governance: { offices: Array<{ office: string; holder?: string; note: string }> }
  }
  const cig = json<Cig>('src/data/institutions/agro-cig.json')

  it('dates every line and labels it by what the source establishes', () => {
    for (const l of cig.livestock) {
      expect(['advertised', 'expected', 'recorded', 'planned'], l.animal).toContain(l.status)
      expect(l.asOf.length, l.animal).toBeGreaterThan(3)
    }
    const by = Object.fromEntries(cig.livestock.map(l => [l.animal, l.status]))
    expect(by.Pigs).toBe('advertised')
    expect(by.Layers).toBe('expected')
    expect(by.Ducks).toBe('advertised')
    expect(by.Manure).toBe('advertised')
  })

  it('carries the order line the CIG published and the dated update', () => {
    expect(cig.orders.display).toBe('673 536 278')
    expect(cig.commercialActivity.recorded.map(r => r.date)).toContain('2026-10-16')
    expect(getUpdate('guneku-agro-cig-offerings-october-2026')).toBeTruthy()
  })

  it('keeps the registration and names no manager it was not given', () => {
    expect(cig.registration.registeredName).toBe('GUNEKU AGRO COMMON INITIATIVE GROUP')
    const manager = cig.governance.offices.find(o => o.office === 'Manager')!
    expect(manager.holder).toBeUndefined()
    expect(manager.note).toMatch(/veterinarian/)
  })
})

describe('education', () => {
  it('no longer presents the 19 September examination as upcoming', () => {
    for (const f of ['src/app/page.tsx', 'src/app/education/page.tsx']) {
      const src = readFileSync(f, 'utf-8')
      expect(src, f).not.toMatch(/Next: Scholarship Selection Examination/)
      expect(src, f).not.toMatch(/<dt className="inst-tag">Next<\/dt>/)
    }
    const notices = json<{ notices: Array<{ date: string; status: string }>; upcomingEvents: Array<{ date: string }> }>(
      'src/data/current-notices.json')
    expect(notices.notices.find(n => n.date === '2026-09-19')?.status).toBe('historical')
    expect(notices.upcomingEvents.map(e => e.date)).not.toContain('2026-09-19')
  })

  it('invents no examination result', () => {
    const p = json<{ outcome: { status: string }; achievements: Array<{ summary: string }> }>(
      'src/data/institutions/education-scholarship-day-2026.json')
    expect(p.outcome.status).toBe('not-yet-published')
    for (const a of p.achievements) expect(a.summary).not.toMatch(/scholarship (winners|recipients)|passed the (selection )?exam/i)
  })

  it('records the HND awards with their source and the school-name conflict', () => {
    const u = getUpdate('medical-school-hnd-graduates-rewarded-2026')!
    expect(u.body).toContain('50,000 FCFA each to its four best-performing students')
    expect(u.body).toContain('https://www.facebook.com/reel/1816967966141646/')
    const school = json<{ spellingConflict: string }>('src/data/institutions/medphisatg.json')
    expect(school.spellingConflict).toMatch(/Medvisac/)
  })
})

describe('Fondom Studios', () => {
  const b = getCuratedBusiness('fondom-studios')!

  it('is the same record, updated', () => {
    const all = json<{ businesses: Array<{ slug: string }> }>('src/data/businesses/businesses.json').businesses
    expect(all.filter(x => x.slug === 'fondom-studios')).toHaveLength(1)
    expect(b.description).toMatch(/division of FONDOM SARL/)
    for (const s of ['Cultural documentaries', 'Live streaming', 'Video production up to 4K', 'Event recordings supplied on USB']) {
      expect(b.services, s).toContain(s)
    }
  })

  it('publishes no contact the owner has not elected to publish, and keeps the location question open', () => {
    expect(b.contact).toBeUndefined()
    expect(JSON.stringify(b)).not.toMatch(/fondomstudios@|671 ?413 ?262|653 ?243 ?155/)
    expect(b.location?.city).toBe('Guneku')
    expect(b.sourceNote).toMatch(/Bamenda/)
  })
})
