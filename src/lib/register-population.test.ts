import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  allFoundingNames, allNotables, palaceQueens, royalFamilyOthers, membersOf,
  toCardSafe, getFoundingName, ROYAL_FAMILY_BODY,
} from './community'
import { claimEligibility, isClaimable } from './claims'
import { search } from './search-index'
import { GUNEKU_QUARTERS_27 } from './quarters'
import { allQuarters } from './quarter-pages'
import { classifyCandidate } from './identity-index'
import namesDoc from '@/data/community/founding-names.json'

/* The population pass of 2026-09-16, and the guarantees it had to keep.
 *
 * Twenty-four entries were opened in one edit — nearly half as many again as the register
 * held. A pass that size is where a register quietly acquires a second entry for a man who
 * already has one, a place in the Royal Family nobody conferred, or a telephone number
 * somebody gave a WhatsApp group and not the Fondom. Each of those is checked here against
 * the register as it now stands, not against the diff that produced it. */

const NAMES = allFoundingNames()
const RAW = readFileSync('src/data/community/founding-names.json', 'utf-8')

/** The entries opened by this pass, found by the sources it declared rather than by a list
 *  typed here — so the checks cannot drift from what was actually written. */
const POPULATION_SOURCES = [
  'zonal-installation-2021',
  'gudeca-branch-record',
  'community-record-2026-09',
  'owner-list-2026-09-16',
]
const ADDED = NAMES.filter(n => POPULATION_SOURCES.includes(n.source))

describe('the register grew, and every entry is still one person', () => {
  it('opened the entries this pass declared', () => {
    expect(ADDED.length).toBeGreaterThanOrEqual(22)
    expect(NAMES.length).toBe(new Set(NAMES.map(n => n.slug)).size)
  })

  it('gives no two entries the same name, however it is written', () => {
    /* Slugs being unique is not the guarantee that matters — two slugs can hold one man.
       Every display name and every alias in the register must resolve to its own entry. */
    const seen = new Map<string, string>()
    const clashes: string[] = []
    for (const n of NAMES) {
      for (const written of [n.display, ...(n.aliases ?? [])]) {
        const key = written.trim().toLowerCase()
        const owner = seen.get(key)
        if (owner && owner !== n.slug) clashes.push(`"${written}": ${owner} and ${n.slug}`)
        seen.set(key, n.slug)
      }
    }
    expect(clashes).toEqual([])
  })

  it('places every entry in the register when its own name is looked up', () => {
    const lost = NAMES
      .filter(n => classifyCandidate(n.display).resolvesTo?.id !== n.slug)
      .map(n => n.display)
    expect(lost).toEqual([])
  })
})

describe('the collisions the Fondom named are still one person each', () => {
  const oneOf = (pattern: RegExp) =>
    NAMES.filter(n => pattern.test(n.display) || (n.aliases ?? []).some(a => pattern.test(a)))

  it('holds one Fah Elvis Tayong, in three roles', () => {
    const rows = oneOf(/fah\s+elvis|tayong\s+fah/i)
    expect(rows.map(r => r.slug)).toEqual(['fah-elvis-tayong'])
    expect(rows[0].role).toMatch(/Agro CIG/)
    expect(rows[0].role).toMatch(/Ngam-Fon/)
  })

  it('holds one Sam Fongoh, and no sam-fongho beside him', () => {
    expect(NAMES.filter(n => /fongoh|fongho/i.test(n.display)).map(n => n.slug))
      .not.toContain('sam-fongho')
    expect(oneOf(/^sam fongoh$|^sam fongho$|^ni sam$/i).map(r => r.slug)).toEqual(['sam-fongoh'])
  })

  it('holds one Ngwa Vitalis', () => {
    expect(oneOf(/ngwa\s+vitalis|vitalis\s+ngwa/i).map(r => r.slug)).toEqual(['ngwa-vitalis'])
  })

  it('holds one Rebecca Fomuki, and she is the Queen already recorded', () => {
    const rows = NAMES.filter(n => /rebecca/i.test(n.display))
    expect(rows.map(r => r.slug)).toEqual(['fomuki-rebecca'])
    expect(rows[0].royalRole).toBe('queen')
  })

  it('has not opened an entry for the reigning Fon under any spelling', () => {
    for (const slug of ['walters-formuki', 'fomuki-walters', 'fon-walters-profile',
                        'fomuki-ticha-ix', 'dr-fomuki-ticha-ix']) {
      expect(getFoundingName(slug)).toBeNull()
    }
    expect(NAMES.filter(n => /walters/i.test(n.display))).toEqual([])
  })

  it('kept the Jonathan and Mbakwa entries apart and opened no fourth', () => {
    const jonathans = NAMES.filter(n => /jonathan|mbakwa/i.test(n.display)).map(n => n.slug).sort()
    expect(jonathans).toEqual(['amamuki-jonathan', 'mbakwa-bernard', 'mbakwa-jonathan'])
  })

  it('keeps two Agwetangs and two Tembengs apart, as it keeps two Jonathans apart', () => {
    /* A shared family name has never merged two people in this register, and this pass did
       not start. John Agwetang is in the record; Julius Agwetang is held. */
    expect(getFoundingName('john-agwetang')).not.toBeNull()
    expect(getFoundingName('julius-agwetang')).toBeNull()
    expect(getFoundingName('timothy-tembeng')?.display).toBe('Timothy Tembeng')
    expect(getFoundingName('dominic-tembeng')?.display).toBe('Dominic Tembeng')
  })

  it('held the names that were a courtesy title and a given name', () => {
    for (const slug of ['bah-andrew', 'mola-ekema', 'mr-faraday', 'tan-prince']) {
      expect(getFoundingName(slug)).toBeNull()
    }
  })
})

describe('the Royal Family gained nobody', () => {
  it('still holds the seven the record placed around the throne', () => {
    expect(membersOf(ROYAL_FAMILY_BODY)).toHaveLength(7)
    expect(palaceQueens()).toHaveLength(3)
    expect(royalFamilyOthers()).toHaveLength(4)
  })

  it('did not make a new Fomuki royal', () => {
    const harriet = getFoundingName('harriet-fomuki')
    expect(harriet).not.toBeNull()
    expect(harriet!.body).toBeUndefined()
    expect(harriet!.royalRole ?? null).toBeNull()
    expect(harriet!.notable).toBeFalsy()
  })

  it('confers royalty on nobody this pass opened', () => {
    for (const n of ADDED) {
      expect(n.royalRole ?? null, n.slug).toBeNull()
      expect(n.body, n.slug).toBeUndefined()
    }
  })
})

describe('the Notables did not grow by an office', () => {
  it('holds the same nine the record names, and no more', () => {
    expect(allNotables()).toHaveLength(9)
    for (const n of ADDED) expect(n.notable, n.slug).toBeFalsy()
  })

  it('leaves the Traditional Council roster at the eight it recorded in 2021', () => {
    /* The 2021 zonal presidents became council members according to the festival report.
       That is a second source about a roster the council's own record does not carry, so
       nobody was added to the body and nobody inherited the standing that goes with it. */
    expect(membersOf('traditional-council')).toHaveLength(8)
  })
})

describe('nothing private came in with the names', () => {
  it('carries no telephone number in the register', () => {
    const numbers = (RAW.match(/\+?\d[\d ()\-]{8,}\d/g) ?? [])
      .filter(s => !/^\s*\d{4}-\d{2}-\d{2}/.test(s.trim()))
    expect(numbers).toEqual([])
  })

  /** Contact and social data. `whatsapp` is deliberately not in this list: the register has
   *  carried a `whatsapp:gudeca-eu` SOURCE declaration since 2026-09-03 (ADR-014, R-019),
   *  which names where two names came from and is not a way of reaching anybody. It is
   *  checked against this pass separately, below. */
  const CONTACT_MARKERS = [
    '@', 'wa.me', 'facebook', 'linkedin', 'instagram', 'twitter',
    'http://', 'https://', 'mailto:', 't.me/',
  ]

  it('carries no address, handle or social link in the register', () => {
    for (const marker of CONTACT_MARKERS) {
      expect(RAW.toLowerCase(), marker).not.toContain(marker)
    }
  })

  it('brought in no contact detail and no mention of where the names were read', () => {
    const written = JSON.stringify(ADDED).toLowerCase()
    for (const marker of [...CONTACT_MARKERS, 'whatsapp', 'telegram', 'phone', 'mobile']) {
      expect(written, marker).not.toContain(marker)
    }
  })

  it('publishes nothing about a new entry but a name, a role and a source', () => {
    const allowed = new Set([
      'slug', 'display', 'aliases', 'role', 'body', 'chapter', 'source', 'sourceLabel', 'note',
    ])
    const extra = ADDED.flatMap(n => Object.keys(n).filter(k => !allowed.has(k)))
    expect([...new Set(extra)]).toEqual([])
  })

  it('names the collection mechanism against nobody', () => {
    /* The community record is the source. What it is, where it was read and what else it
       contains are not published against a person. */
    for (const n of ADDED) {
      expect(n.sourceLabel.toLowerCase(), n.slug).not.toContain('whatsapp')
      expect(n.sourceLabel.toLowerCase(), n.slug).not.toContain('group')
    }
  })

  it('keeps a card to the fields the publication contract allows', () => {
    const allowed = new Set([
      'slug', 'display', 'role', 'sourceLabel', 'profileUrl', 'deceased',
      'chapter', 'body', 'profession', 'notable', 'royalRole',
    ])
    for (const n of ADDED) {
      expect(Object.keys(toCardSafe(n)).filter(k => !allowed.has(k)), n.slug).toEqual([])
    }
  })
})

describe('every source an entry names is declared', () => {
  it('declares each one, including the two that were in use undeclared', () => {
    const declared = Object.keys(namesDoc.meta.sources)
    const used = [...new Set(NAMES.map(n => n.source))]
    expect(used.filter(s => !declared.includes(s))).toEqual([])
    expect(declared).toContain('gudeca-us-2023')
    expect(declared).toContain('owner-correction-2026-09-03')
  })

  it('gives every entry a source label a reader can act on', () => {
    for (const n of ADDED) expect(String(n.sourceLabel).trim().length, n.slug).toBeGreaterThan(0)
  })

  it('records when the register was last changed', () => {
    expect(namesDoc.meta.updated).toBe('2026-09-16')
  })

  it('keeps the record of the name that was taken down', () => {
    expect(namesDoc.meta.removed.length).toBeGreaterThan(0)
  })
})

describe('the new entries behave like every other entry', () => {
  it('offers the claim workflow to each of them', () => {
    for (const n of ADDED) {
      expect(isClaimable(n.slug), n.slug).toBe(true)
      expect(claimEligibility(n.slug).ok, n.slug).toBe(true)
    }
  })

  it('marks nobody deceased on this pass', () => {
    for (const n of ADDED) expect(n.deceased, n.slug).toBeFalsy()
  })

  it('keeps the two recorded as deceased un-claimable', () => {
    for (const slug of ['mama-ngum-fomuki', 'akwe-thadeus-acho']) {
      expect(claimEligibility(slug)).toEqual({ ok: false, reason: 'deceased' })
    }
  })

  it('finds every one of them by name, and returns one person', () => {
    for (const n of ADDED) {
      const people = search(n.display).groups.find(g => g.group === 'People')?.results ?? []
      const exact = people.filter(r => r.title === n.display)
      expect(exact.length, n.display).toBe(1)
      expect(exact[0].href, n.display).toContain(n.slug)
    }
  })

  it('sends an alias to the person rather than to a second card', () => {
    /* An alias exists so a reader who knows the other spelling arrives at the same man.
       It must never stand beside him as a result of its own. */
    for (const n of NAMES) {
      for (const alias of n.aliases ?? []) {
        const people = search(alias).groups.find(g => g.group === 'People')?.results ?? []
        expect(people.filter(r => r.title === alias), alias).toEqual([])
        expect(people.some(r => r.title === n.display), `${alias} -> ${n.display}`).toBe(true)
      }
    }
  })
})

describe('the geography was not touched', () => {
  it('still holds exactly the twenty-seven quarters', () => {
    expect(GUNEKU_QUARTERS_27).toHaveLength(27)
    expect(allQuarters()).toHaveLength(27)
  })

  it('has not made Njindom a quarter or a locality of Guneku', () => {
    /* Njindom is a separate village with its own Fon, its own parish and its own development
       association. It appears in this archive only as a neighbour, and this pass did not
       change that. */
    expect([...GUNEKU_QUARTERS_27].map(q => q.toLowerCase())).not.toContain('njindom')
    expect(allQuarters().map(q => q.slug)).not.toContain('njindom')
    expect(RAW.toLowerCase()).not.toContain('njindom')

    const locations = JSON.parse(
      readFileSync('src/data/explore/locations.json', 'utf-8'),
    ) as { locations: Array<{ id: string; name: string }> }
    for (const l of locations.locations) {
      expect(l.name.toLowerCase(), l.id).not.toContain('njindom')
    }
  })

  it('added no quarter to the canonical list on the strength of another record', () => {
    for (const name of ['Njinebai', 'Nyeh', 'Toh', 'Tuengyie']) {
      expect([...GUNEKU_QUARTERS_27]).not.toContain(name)
    }
  })

  it('attaches a new entry to a quarter only where the record names one', () => {
    /* A role that mentions Guneku must not put somebody on a quarter council. Only the
       Nyang councillor the 2021 coverage names carries a quarter, and she carries it because
       the record says so. */
    const withQuarter = ADDED.filter(n => /quarter/i.test(n.role))
    expect(withQuarter).toEqual([])
  })
})
