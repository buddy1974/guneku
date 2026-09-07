import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { MAXPROMO_SITE, MAXPROMO_CONTACT } from './maxpromo'

/* MaxPromo retired its audit route, and Guneku was still sending people to it.
 *
 * `https://maxpromo.digital/automation-audit` had been typed into three components and one
 * data record. That is how a link goes stale in four places at once, and why the two
 * destinations are constants now: retiring the next one should be one edit. */

const RETIRED = [
  'automation-audit',
  'free-audit',
  'freeAudit',
]

const READ = (p: string) => readFileSync(p, 'utf-8')
const strip = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')

function appFiles(): string[] {
  const out: string[] = []
  const stack = ['src']
  while (stack.length) {
    const dir = stack.pop()!
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = `${dir}/${e.name}`
      if (e.isDirectory()) { stack.push(full); continue }
      if (!/\.(ts|tsx|json)$/.test(e.name) || /\.test\.tsx?$/.test(e.name)) continue
      out.push(full)
    }
  }
  return out
}

describe('no retired MaxPromo destination survives anywhere in the application', () => {
  it('links to no audit route, in code or in data', () => {
    /* Comments stripped: two files explain in prose what the retired route was, and a check
       matching that prose would fail on the very sentence recording the fix. JSON has no
       comments and is read whole. */
    const offenders: string[] = []
    for (const f of appFiles()) {
      const text = /\.tsx?$/.test(f) ? strip(READ(f)) : READ(f)
      for (const bad of RETIRED) {
        if (text.includes(bad)) offenders.push(`${f}: ${bad}`)
      }
    }
    expect(offenders).toEqual([])
  })

  it('cannot have it written back by the profile generator', () => {
    /* The record is produced by a migration script. Fixing the record and leaving the
       generator would mean the retired route returns the next time anybody runs it. */
    const gen = READ('migration/scripts/build-marcel-profile.js')
    for (const bad of RETIRED) expect(gen).not.toContain(bad)
    expect(gen).toContain(MAXPROMO_CONTACT)
  })
})

describe('every call to action goes straight to the live contact page', () => {
  it('names one canonical destination', () => {
    expect(MAXPROMO_CONTACT).toBe('https://www.maxpromo.digital/en/contact')
  })

  it('sends the three calls to action there', () => {
    const contact = READ('src/app/contact/page.tsx')
    const showcase = READ('src/app/sons-and-daughters/[slug]/page.tsx')
    /* Two on /contact, one on the showcase — each through the constant rather than a
       typed-out URL, so the next retirement is one edit. */
    expect((contact.match(/MAXPROMO_CONTACT/g) || []).length).toBeGreaterThanOrEqual(3)
    expect(showcase).toContain('MAXPROMO_CONTACT')
    expect(showcase).toContain('n.contactUrl || MAXPROMO_CONTACT')
  })

  it('carries the destination in the record, under a name that is still true', () => {
    const marcel = JSON.parse(READ('src/data/notables/marcel-tabit-akwe.json'))
    expect(marcel.contactUrl).toBe(MAXPROMO_CONTACT)
    expect(marcel).not.toHaveProperty('freeAudit')
  })

  it('adds no Guneku redirect for somebody else’s retired route', () => {
    /* A village website carrying a hop for a third party's retired marketing URL is debt
       nobody would remember to remove. */
    const cfg = READ('next.config.ts')
    expect(cfg).not.toMatch(/maxpromo/i)
  })
})

describe('the words no longer offer an audit', () => {
  it('offers no audit anywhere MaxPromo is mentioned', () => {
    /* Scoped to the MaxPromo surfaces on purpose. "Audit" is an ordinary word in a village
       record: a MECUDA joint meeting resolved on a full financial audit of its accounts, and
       a sweep that flagged Guneku's own minutes would be measuring the wrong thing. */
    const offenders: string[] = []
    for (const f of appFiles()) {
      const raw = READ(f)
      if (!/maxpromo/i.test(raw)) continue
      const text = /\.tsx?$/.test(f) ? strip(raw) : raw
      if (/\baudit\b/i.test(text)) offenders.push(f)
    }
    expect(offenders).toEqual([])
  })

  it('leaves Guneku’s own use of the word alone', () => {
    /* The MECUDA minutes, untouched. Editing a village record to satisfy a link check would
       be the wrong repair entirely. */
    expect(READ('src/data/updates/mefu-mecuda-joint-meeting-guneku-palace.json'))
      .toContain('a full financial audit')
  })

  it('invites contact instead', () => {
    expect(READ('src/app/contact/page.tsx')).toContain('Contact MaxPromo →')
    expect(READ('src/app/contact/page.tsx')).toContain('Get in touch →')
    expect(READ('src/app/sons-and-daughters/[slug]/page.tsx')).toContain('Contact MaxPromo →')
  })
})

describe('the credits are attribution, and stay attribution', () => {
  it('still points the built-by links at the company home page', () => {
    /* Not converted to contact links. They are a credit on a village record, and turning
       them into calls to action would expand MaxPromo's presence rather than repair it. */
    expect(MAXPROMO_SITE).toBe('https://maxpromo.digital')
    expect(READ('src/components/layout/Footer.tsx')).toContain(MAXPROMO_SITE)
    expect(JSON.parse(READ('src/data/site-config.json')).copyright.builtByUrl).toBe(MAXPROMO_SITE)
    expect(READ('src/app/layout.tsx')).toContain(MAXPROMO_SITE)
  })

  it('opens every external MaxPromo link safely', () => {
    for (const f of ['src/app/contact/page.tsx',
                     'src/app/sons-and-daughters/[slug]/page.tsx',
                     'src/components/layout/Footer.tsx']) {
      const text = READ(f)
      for (const m of text.match(/<a[^>]*maxpromo[^>]*>|<a[^>]*MAXPROMO_[A-Z]+[^>]*>/gi) ?? []) {
        expect(m, `${f}: ${m}`).toContain('rel="noopener noreferrer"')
      }
    }
  })
})
