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
import { councilFor, councilCoverage } from './quarter-councils'
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
 *  of names typed here — so the checks cannot drift from what was actually written. */
const POPULATION_SOURCES = [
  'zonal-installation-2021',
  'gudeca-branch-record',
  'community-record-2026-09',
  'owner-list-2026-09-16',
  'owner-confirmation-2026-09-16',
]

/** Two entries were opened from the 2021 quarter-elections coverage, which the register had
 *  already been citing since 2026-09-03. Naming them is the honest way to include them: the
 *  alternative is a source id that says "this pass" and is not true of the eight entries that
 *  cited it before. */
const ADDED_UNDER_EXISTING_SOURCE = ['timkoh-florence', 'wanjeh-augustine']

const ADDED = NAMES.filter(n =>
  POPULATION_SOURCES.includes(n.source) || ADDED_UNDER_EXISTING_SOURCE.includes(n.slug))

describe('the register grew, and every entry is still one person', () => {
  it('opened the entries this pass declared', () => {
    /* 45 entries were opened across this pass and one was folded back into a man who was
       already in the register the same day, on the Fondom's confirmation — see R-059 and the
       Tibi test below. */
    expect(ADDED).toHaveLength(44)
    expect(NAMES).toHaveLength(96)
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

describe('the names the Fondom confirmed on 16 September', () => {
  const resolves = (written: string) => classifyCandidate(written).resolvesTo?.id

  it('reuses the four who were already in the record', () => {
    for (const [written, slug] of [
      ['Dr. Joyce Akwe', 'joyce-akwe'],
      ['William Akwe', 'william-akwe'],
      ['Valentine Andom', 'valentine-andom'],
      ['Humphrey Tabot', 'humphrey-tabot'],
    ] as const) {
      expect(resolves(written), written).toBe(slug)
    }
    /* And opened no second entry beside any of them. */
    expect(NAMES.filter(n => /joyce/i.test(n.display))).toHaveLength(1)
    expect(NAMES.filter(n => /^william akwe$/i.test(n.display))).toHaveLength(1)
    expect(NAMES.filter(n => /valentine/i.test(n.display))).toHaveLength(1)
    expect(NAMES.filter(n => /tabot humphrey|humphrey tabot/i.test(n.display))).toHaveLength(1)
  })

  it('keeps William Akwe as one man, with what the record already held', () => {
    const w = getFoundingName('william-akwe')!
    expect(w.role).toMatch(/Medical Delegate/)
    expect(w.chapter).toBe('gudeca-yaounde')
    expect(w.residence).toBe('Cameroon')
  })

  it('collapses every name order the Fondom supplied onto one person', () => {
    for (const [a, b, slug] of [
      ['Tabot Humphrey', 'Humphrey Tabot', 'humphrey-tabot'],
      ['victor ndum', 'Ndum Victor', 'ndum-victor'],
      ['Tabi Ignatius Chum', 'Ignatius Tabi Chum', 'ignatius-tabi-chum'],
    ] as const) {
      expect(resolves(a), a).toBe(slug)
      expect(resolves(b), b).toBe(slug)
    }
  })

  it('collapses a family name of birth onto the woman who carries it', () => {
    /* The Fondom supplied both names. The name of birth is a spelling on her entry so that
       older material reaches her, and it is the only family fact published about her. */
    expect(resolves('Delphine Akwe')).toBe('delphine-mah-nforgwei')
    expect(resolves('Loveline Akwe')).toBe('loveline-mufor')
    expect(NAMES.filter(n => /delphine/i.test(n.display))).toHaveLength(1)
    expect(NAMES.filter(n => /loveline/i.test(n.display))).toHaveLength(1)
    for (const slug of ['delphine-mah-nforgwei', 'loveline-mufor']) {
      expect(JSON.stringify(getFoundingName(slug)).toLowerCase(), slug)
        .not.toMatch(/married|wife|husband|sister|mother of/)
    }
  })

  it('holds Ernest Tibi Ticha as one man under all three spellings', () => {
    /* R-059, resolved by the Fondom on 16 September 2026: Tibi Enert is Ernest Tibi Ticha.
       The entry opened that morning was folded into his the same day and both spellings are
       carried on it. The guard was right to refuse the merge on its own — it is right to
       record it now that a person has decided. */
    expect(getFoundingName('tibi-enert')).toBeNull()

    const canonical = getFoundingName('ernest-tibi-ticha')!
    expect(canonical.aliases).toContain('Tibi Enert')
    expect(canonical.aliases).toContain('Tibi Enerst Tibi')

    for (const written of ['Ernest Tibi Ticha', 'Tibi Enert', 'Tibi Enerst Tibi']) {
      const v = classifyCandidate(written)
      expect(v.classification, written).toBe('EXISTING')
      expect(v.resolvesTo?.id, written).toBe('ernest-tibi-ticha')
    }

    /* One man, counted once. */
    expect(NAMES.filter(n =>
      [n.display, ...(n.aliases ?? [])].some(s => /enert|enerst|ernest/i.test(s)),
    ).map(n => n.slug)).toEqual(['ernest-tibi-ticha'])
  })

  it('kept everything the canonical entry already held, and took nothing from another Tibi', () => {
    const c = getFoundingName('ernest-tibi-ticha')!
    expect(c.role).toBe('Member, GUDECA Yaoundé Branch')
    expect(c.chapter).toBe('gudeca-yaounde')
    expect(c.residence).toBe('Cameroon')
    expect(c.source).toBe('owner-correction-2026-09-03')
    expect(c.notable).toBeFalsy()
    expect(c.body).toBeUndefined()

    /* The other six Tibi entries are untouched and still six separate people. */
    const others = ['tibi-divine', 'tibi-felix', 'tibi-gladys-fri',
                    'tibi-vincent', 'tibi-nicoline', 'tibi-elvies']
    for (const slug of others) {
      const n = getFoundingName(slug)
      expect(n, slug).not.toBeNull()
      expect(n!.aliases, slug).toEqual([])
      expect(n!.chapter, slug).toBeNull()
    }
    expect(new Set(others).size).toBe(6)
  })

  it('leaves a way back from the address the folded entry was published at', () => {
    /* The page was live before the Fondom resolved it, so the old path redirects rather than
       404s. A reader who followed a link to the name they knew him by must arrive at the man
       (ADR-041). */
    const config = readFileSync('next.config.ts', 'utf-8')
    expect(config).toContain("source: '/indigenes/founding/tibi-enert'")
    expect(config).toContain("destination: '/indigenes/founding/ernest-tibi-ticha'")
  })

  it('records the fold in the register rather than losing it', () => {
    const removed = namesDoc.meta.removed as Array<{ name: string; reason: string }>
    const entry = removed.find(r => r.name === 'Tibi Enert')
    expect(entry).toBeDefined()
    expect(entry!.reason).toMatch(/one man/i)
    /* And the earlier removal is still on the record. */
    expect(removed.length).toBeGreaterThan(1)
  })

  it('opens the six other Tibi entries without inferring a family', () => {
    for (const slug of ['tibi-divine', 'tibi-felix', 'tibi-gladys-fri',
                        'tibi-vincent', 'tibi-nicoline', 'tibi-elvies']) {
      const n = getFoundingName(slug)
      expect(n, slug).not.toBeNull()
      /* "a son or daughter of Guneku" is how the register says somebody is an indigene and
         is not a relationship. What must not appear is a relationship to another person. */
      const written = JSON.stringify(n).toLowerCase()
        .replace(/son or daughter of guneku/g, 'an indigene')
      expect(written, slug)
        .not.toMatch(/brother|sister|son of|daughter of|father|mother|wife|husband|family of/)
    }
  })

  it('records the two North America members without inventing a chapter or an office', () => {
    for (const slug of ['samuel-ndum', 'ndum-wilfred-tembe']) {
      const n = getFoundingName(slug)!
      expect(n.role, slug).toBe('Member, GUDECA North America')
      expect(n.chapter, slug).toBeNull()
      expect(n.body, slug).toBeUndefined()
      expect(n.notable, slug).toBeFalsy()
    }
    /* And North America is still not quietly the GUDECA US chapter. */
    const usChapter = NAMES.filter(n => n.chapter === 'gudeca-us-dmv').map(n => n.slug)
    expect(usChapter).not.toContain('samuel-ndum')
    expect(usChapter).not.toContain('ndum-wilfred-tembe')

    const branches = JSON.parse(
      readFileSync('src/data/institutions/gudeca-branches.json', 'utf-8'),
    ) as { branches: Array<{ name: string; memberRegisterSlugs?: string[] }> }
    const na = branches.branches.find(b => b.name === 'GUDECA North America')!
    expect(na.memberRegisterSlugs).toEqual(['samuel-ndum', 'ndum-wilfred-tembe'])
  })

  it('turns a residence into no membership, office, body or quarter', () => {
    /* A Yaoundé residence is not GUDECA Yaoundé; Frankfurt is not GUDECA Europe. Everyone
       this batch gave a residence carries no chapter and no body at all. */
    const withResidence = NAMES.filter(n =>
      n.source === 'owner-confirmation-2026-09-16' && n.residence)
    expect(withResidence.length).toBeGreaterThan(0)
    for (const n of withResidence) {
      expect(n.chapter, n.slug).toBeNull()
      expect(n.body, n.slug).toBeUndefined()
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

  it('publishes nothing about a new entry outside the register contract', () => {
    /* `meta.publication_rule` settles this list: a name, what the person holds, where they
       belong, and where it came from. `profession` and `residence` are on it because the
       register already carries both against people the Fondom supplied them for, and
       `CardSafe` already renders a profession as a fact about somebody.

       What is NOT here is the point: no photograph, no employer, no town, no contact of any
       kind, and no field for a family relationship. */
    const allowed = new Set([
      'slug', 'display', 'aliases', 'role', 'body', 'chapter',
      'source', 'sourceLabel', 'note', 'profession', 'residence',
    ])
    const extra = ADDED.flatMap(n => Object.keys(n).filter(k => !allowed.has(k)))
    expect([...new Set(extra)]).toEqual([])
  })

  it('records a country of residence and never a town', () => {
    /* The Fondom supplied a town for nine people in the confirmation of 16 September -
       Yaounde, Douala, Bamenda, Buea, Frankfurt. `residence` is a country field and the
       publication rule forbids a town against a name, so the towns were not published.
       This fails if one is ever written in. */
    const TOWNS = ['yaound', 'douala', 'bamenda', 'buea', 'frankfurt', 'limbe', 'mutengene']
    for (const n of ADDED) {
      if (n.residence !== undefined && n.residence !== null) {
        expect(['Cameroon', 'Germany'], n.slug).toContain(n.residence)
      }
      /* A town inside the NAME of a GUDECA branch is an affiliation, not an address, and the
         register has published branch names since it was written - "Member, GUDECA Yaounde
         Branch". Those are removed before the scan so that what is left is any town written
         against a person as a place, which is the thing that must not be there. */
      const written = JSON.stringify(n).toLowerCase().replace(/gudeca [a-z]+/g, 'gudeca')
      for (const town of TOWNS) expect(written, `${n.slug} / ${town}`).not.toContain(town)
    }
  })

  it('records an occupation only as the plain word the Fondom used', () => {
    /* A profession is a fact about a person and never an office, never a reason for
       standing, and never a business. Nobody's employer or company is published. */
    for (const n of ADDED.filter(x => x.profession)) {
      expect(n.profession, n.slug).toBe('Businessman')
      expect(n.notable, n.slug).toBeFalsy()
      expect(n.body, n.slug).toBeUndefined()
    }
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
    /* A role that merely mentions Guneku must not put somebody on a quarter council. Exactly
       one entry this pass opened names a quarter, and she names it because the 2021 election
       coverage says she was elected for it. */
    const withQuarter = ADDED.filter(n => /quarter/i.test(n.role)).map(n => n.slug)
    expect(withQuarter).toEqual(['timkoh-florence'])

    const nyang = councilFor('Nyang')
    expect(nyang.members.map(m => m.slug)).toEqual(['timkoh-florence'])
    expect(councilCoverage()).toEqual({ recorded: 2, total: 27 })
  })
})
