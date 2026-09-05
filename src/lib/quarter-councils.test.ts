import { describe, it, expect } from 'vitest'
import {
  allQuarterCouncils, councilFor, councilCoverage, councilNamesOutsideCanonicalQuarters,
} from './quarter-councils'
import { GUNEKU_QUARTERS_27 } from './quarters'
import { allFoundingNames } from './community'

/* The standing editorial principle, asserted over the real records:
     STRUCTURAL COMPLETENESS IS ENCOURAGED. FACTUAL FABRICATION IS PROHIBITED. */

describe('structural completeness — every quarter is represented', () => {
  it('returns all twenty-seven, none dropped for being undocumented', () => {
    const all = allQuarterCouncils()
    expect(all).toHaveLength(27)
    expect(all.map(c => c.quarter).sort()).toEqual([...GUNEKU_QUARTERS_27].sort())
  })

  it.each([...GUNEKU_QUARTERS_27])('%s has a council structure', q => {
    const council = councilFor(q)
    expect(council.quarter).toBe(q)
    expect(Array.isArray(council.members)).toBe(true)
  })

  it('marks a quarter with no recorded members as incomplete rather than omitting it', () => {
    for (const c of allQuarterCouncils()) {
      expect(c.incomplete).toBe(c.members.length === 0)
    }
  })

  it('reports coverage honestly — most of the village is not recorded', () => {
    const { recorded, total } = councilCoverage()
    expect(total).toBe(27)
    expect(recorded).toBeLessThan(total)
    expect(recorded).toBeGreaterThan(0)
  })
})

describe('no fabrication — every member comes from the register’s own words', () => {
  const register = allFoundingNames()

  it('invents no person: every member exists in the register under that slug', () => {
    for (const c of allQuarterCouncils()) {
      for (const m of c.members) {
        const source = register.find(n => n.slug === m.slug)
        expect(source).toBeDefined()
        expect(m.display).toBe(source!.display)
        /* The role is carried through verbatim, never paraphrased into an office. */
        expect(m.role).toBe(source!.role)
      }
    }
  })

  it('never produces a placeholder that reads as a person', () => {
    const text = JSON.stringify(allQuarterCouncils())
    for (const bad of ['TBC', 'To be confirmed', 'Unknown', 'N/A', 'Vacant', 'Placeholder']) {
      expect(text).not.toContain(bad)
    }
  })

  it('attaches a person only where their own role names that quarter', () => {
    for (const c of allQuarterCouncils()) {
      for (const m of c.members) {
        expect(m.role.toLowerCase()).toContain(c.quarter.toLowerCase())
      }
    }
  })

  /* The register names Fun's quarter council. Everything else is silent, and that silence
     is the finding rather than a bug in the matcher. */
  it('finds the council the archive actually records', () => {
    const fun = councilFor('Fun')
    expect(fun.incomplete).toBe(false)
    expect(fun.members.length).toBeGreaterThan(0)
    expect(fun.members.map(m => m.slug)).toContain('mukum-charles-ndika')
  })

  it('does not attach someone whose role merely mentions a body they sit in', () => {
    /* Mbakwa Bernard led the 2021 election team. That is not a quarter council office, and
       reading it as one would invent an office-holder for whichever quarter he toured. */
    for (const c of allQuarterCouncils()) {
      expect(c.members.map(m => m.slug)).not.toContain('mbakwa-bernard')
      expect(c.members.map(m => m.slug)).not.toContain('fon-mathias')
    }
  })

  /* "Fun" must not swallow "Funmbot", and a longer name must not match a shorter one. */
  it('matches a quarter name as a whole word', () => {
    for (const c of allQuarterCouncils()) {
      for (const m of c.members) {
        const pattern = new RegExp(`(^|[^A-Za-z])${c.quarter}([^A-Za-z]|$)`, 'i')
        expect(pattern.test(m.role)).toBe(true)
      }
    }
  })
})

describe('the discrepancy is surfaced, not resolved', () => {
  /* The register names quarter office-holders for places absent from the canonical 27.
     This module reports them so the owner can decide; it does not add them to the canonical
     list and does not drop them. */
  it('reports council names that attach to no canonical quarter', () => {
    const orphans = councilNamesOutsideCanonicalQuarters()
    expect(orphans.length).toBeGreaterThan(0)
    expect(orphans.map(m => m.slug)).toContain('amamuki-jonathan')
  })

  it('does not smuggle those names onto a canonical quarter', () => {
    const attached = new Set(allQuarterCouncils().flatMap(c => c.members.map(m => m.slug)))
    for (const orphan of councilNamesOutsideCanonicalQuarters()) {
      expect(attached.has(orphan.slug)).toBe(false)
    }
  })

  it('leaves the canonical list of twenty-seven untouched', () => {
    expect(GUNEKU_QUARTERS_27).toHaveLength(27)
    expect(GUNEKU_QUARTERS_27).not.toContain('Njinebai')
  })
})

describe('deceased members', () => {
  it('carries the register’s own deceased flag through unchanged', () => {
    const register = allFoundingNames()
    for (const c of allQuarterCouncils()) {
      for (const m of c.members) {
        const source = register.find(n => n.slug === m.slug)!
        expect(m.deceased).toBe(source.deceased === true)
      }
    }
  })
})
