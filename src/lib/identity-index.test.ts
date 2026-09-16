import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  classifyCandidate, classifyPool, identityIndex, tokensOf, normaliseName,
  editDistance, proposeSlug,
} from './identity-index'
import { allFoundingNames } from './community'

/* The duplicate guard, tested on the collisions that actually exist in this register.
 *
 * Every case below is a real name from a real Guneku record. They are here because each one
 * is a way the register could have gained a second entry for a man who already has one, and
 * a rule that has not been tried against the hard cases is a rule nobody should trust. */

const NAMES = allFoundingNames()

describe('a name written as the record writes it resolves to that person', () => {
  it('resolves the three men the Palace record says are one man each', () => {
    for (const [written, slug] of [
      ['Fah Elvis Tayong', 'fah-elvis-tayong'],
      ['Tayong Fah Elvis', 'fah-elvis-tayong'],
      ['Fah Elvis Tayong (Delegate CIG)', 'fah-elvis-tayong'],
      ['Sam Fongoh', 'sam-fongoh'],
      ['Sam Fongho', 'sam-fongoh'],
      ['Ni Sam', 'sam-fongoh'],
      ['Ngwa Vitalis', 'ngwa-vitalis'],
      ['Vitalis Ngwa', 'ngwa-vitalis'],
      ['Ngwa Vitalis (Epenghefon)', 'ngwa-vitalis'],
    ] as const) {
      const v = classifyCandidate(written)
      expect(v.classification, written).toBe('EXISTING')
      expect(v.resolvesTo?.id, written).toBe(slug)
    }
  })

  it('resolves Rebecca Fomuki to the Queen already in the record, surname or no surname', () => {
    /* Five entries carry the name Fomuki. Four of them are not her, and the rule has to
       reach her anyway — on "Rebecca", which belongs to one woman. */
    const v = classifyCandidate('Rebecca Fomuki')
    expect(v.classification).toBe('EXISTING')
    expect(v.resolvesTo?.id).toBe('fomuki-rebecca')
  })

  it('ignores a parenthetical role and a courtesy title', () => {
    expect(classifyCandidate('Mrs. Fomuki Rebecca').resolvesTo?.id).toBe('fomuki-rebecca')
    expect(classifyCandidate('President Constantine Ndenge').resolvesTo?.id)
      .toBe('ndenge-constantine')
  })
})

describe('the Fon is one man with one record, and it is not a register entry', () => {
  it('sends every spelling of his name to the Fon profile', () => {
    for (const written of [
      'HRH Fon Fomuki Walters Ticha IX',
      'Fomuki Walters Ticha',
      'Walters Formuki',
      'HRH Dr. Fomuki Ticha IX',
      'Fomuki Walters',
    ]) {
      const v = classifyCandidate(written)
      expect(v.classification, written).toBe('EXISTING')
      expect(v.resolvesTo?.id, written).toBe('fon-walters-profile')
      expect(v.resolvesTo?.kind, written).toBe('fon')
    }
  })

  it('has not opened a register entry for the reigning Fon', () => {
    /* The single most expensive duplicate this repository could make: the Fon of Guneku
       appearing among the sons and daughters as though he were a claimable stub. */
    for (const n of NAMES) {
      expect(tokensOf(n.display)).not.toEqual(['fomuki', 'walters', 'ticha', 'ix'])
    }
    expect(NAMES.map(n => n.slug)).not.toContain('fon-walters-profile')
    expect(NAMES.map(n => n.slug)).not.toContain('walters-formuki')
    expect(NAMES.map(n => n.slug)).not.toContain('fomuki-walters')
  })
})

describe('a name two men answer to is given to neither', () => {
  it('refuses to place Jonathan Mbakwa', () => {
    /* The register holds Mbakwa Jonathan, Amamuki Jonathan and Mbakwa Bernard. The candidate
       is flanked on the given name and on the family name at once, so no rule can place him
       and the Palace must. This is the case the whole module is shaped around. */
    const v = classifyCandidate('Jonathan Mbakwa')
    expect(v.classification).toBe('AMBIGUOUS')
    expect(v.resolvesTo).toBeUndefined()
    expect(v.reason).toMatch(/jonathan/)
    expect(v.reason).toMatch(/mbakwa/)
  })

  it('keeps Amamuki Jonathan and Mbakwa Jonathan as two people', () => {
    const a = classifyCandidate('Amamuki Jonathan')
    const m = classifyCandidate('Mbakwa Jonathan')
    expect(a.resolvesTo?.id).toBe('amamuki-jonathan')
    expect(m.resolvesTo?.id).toBe('mbakwa-jonathan')
  })

  it('holds a short form of a longer name rather than merging it', () => {
    /* "Roland Forbang" sits inside "Prof. Dr. Roland Teboh Forbang" — and the register also
       holds Forbang Noel. Suggestive is not the same as established. */
    const v = classifyCandidate('Roland Forbang')
    expect(v.classification).toBe('AMBIGUOUS')
    expect(v.resolvesTo).toBeUndefined()
  })

  it('catches a name that is a letter away from another', () => {
    const v = classifyCandidate('Timkoh Onies Fongho')
    expect(v.classification).toBe('AMBIGUOUS')
  })
})

describe('a courtesy title and one given name is not an identity', () => {
  it('refuses the forms the owner ruled out', () => {
    for (const written of ['Pa Andrew', 'Aunty Pat', 'Daddy Akwe', 'Bah Andrew', 'Tan Prince']) {
      expect(classifyCandidate(written).classification, written).toBe('INSUFFICIENT')
    }
  })

  it('refuses a handle, a placeholder and an organisation', () => {
    for (const written of [
      'The Investigator', '[UNNAMED]', 'Multiple members',
      'Fondom Studios (Guneku Branch)', 'Afroroots Culture Development Initiative (ACDIF)',
    ]) {
      expect(classifyCandidate(written).classification, written).toBe('INSUFFICIENT')
    }
  })

  it('still reaches a real person whose name contains an organisation word', () => {
    /* Fondom Calvin is a man, not a studio. The organisation check runs only after an exact
       match has been ruled out, which is what keeps him findable. */
    expect(classifyCandidate('Fondom Calvin').resolvesTo?.id).toBe('fodom-calvin')
  })
})

describe('the family name Fomuki confers nothing', () => {
  it('does not resolve a new Fomuki to anybody in the Royal Family', () => {
    const v = classifyCandidate('Harriet Fomuki')
    expect(v.resolvesTo?.id).not.toBe('fomuki-carine')
    expect(v.resolvesTo?.id).not.toBe('fomuki-rebecca')
    expect(v.resolvesTo?.id).not.toBe('esther-hammer-fomuki')
  })

  it('matches on a name and returns no standing of any kind', () => {
    /* The verdict carries an id, a display name and a link. It has no field for Notable
       standing, royal standing, a body or a chapter, so no caller can read one out of it. */
    const v = classifyCandidate('Fomuki Carine')
    expect(v.resolvesTo?.id).toBe('fomuki-carine')
    expect(Object.keys(v.resolvesTo!).sort())
      .toEqual(['display', 'href', 'id', 'kind', 'names'])
  })

  it('never decides royalty from a name, in the code as well as in the data', () => {
    const source = readFileSync('src/lib/identity-index.ts', 'utf-8')
    for (const word of ['royalRole', 'notable', 'palace-household']) {
      expect(source).not.toContain(`'${word}'`)
    }
  })
})

describe('candidates are checked against each other, not only against the record', () => {
  it('holds the weaker source when two candidates collide', () => {
    const verdicts = classifyPool([
      { name: 'Ndongo Emmanuel', from: 'A reviewed record', priority: 1 },
      { name: 'Ndonga Emanuel', from: 'A group record', priority: 6 },
    ])
    expect(verdicts[0].classification).toBe('NEW_SAFE')
    expect(verdicts[1].classification).toBe('AMBIGUOUS')
    expect(verdicts[1].reason).toContain('Ndongo Emmanuel')
  })

  it('does not read one repeated name part as two agreements', () => {
    /* A source wrote one man as "Tibi Enerst Tibi", so his tokens held `tibi` twice. Counted
       as written, that read as two agreements against every other Tibi and held six
       unrelated people on the strength of one family name. Two people must agree on two
       DIFFERENT parts of a name before the guard says anything at all. */
    /* Written with names the register does not hold, because this is a test of the rule and
       not of today's data — the real names it was found on are all in the register now, and
       would resolve before the pool logic ever ran. */
    const verdicts = classifyPool([
      { name: 'Zando Kerost Zando', from: 'A group record', priority: 1 },
      { name: 'Zando Weline', from: 'The Fondom', priority: 4 },
      { name: 'Zando Purmay', from: 'The Fondom', priority: 4 },
      { name: 'Zando Lintor', from: 'The Fondom', priority: 4 },
    ])
    expect(verdicts.slice(1).map(v => v.classification))
      .toEqual(['NEW_SAFE', 'NEW_SAFE', 'NEW_SAFE'])
  })

  it('still catches a one-letter slip in a given name beside a shared family name', () => {
    /* The genuine case the Fondom flagged, in the shape it had: a shared family name and two
       given names one letter apart. Names the register does not hold, for the same reason as
       above. */
    const verdicts = classifyPool([
      { name: 'Zando Kerost', from: 'The Fondom', priority: 4 },
      { name: 'Zando Keroste Zando', from: 'A group record', priority: 6 },
    ])
    expect(verdicts[0].classification).toBe('NEW_SAFE')
    expect(verdicts[1].classification).toBe('AMBIGUOUS')
  })

  it('leaves two people who merely share a family name alone', () => {
    const verdicts = classifyPool([
      { name: 'Timothy Tembeng', from: 'A reviewed record', priority: 1 },
      { name: 'Dominic Tembeng', from: 'A group record', priority: 6 },
    ])
    expect(verdicts.map(v => v.classification)).toEqual(['EXISTING', 'EXISTING'])
  })
})

describe('the mechanics', () => {
  it('drops an initial, because an initial cannot tell two people apart', () => {
    expect(tokensOf('Ngati Bah G.')).toEqual(['ngati', 'bah'])
  })

  it('strips accents and punctuation without touching the stored name', () => {
    expect(normaliseName('Mɨchi Ǝbeŋ')).not.toContain('ɨ')
    expect(normaliseName('Bah. Sanje. Jonas')).toBe('bah sanje jonas')
  })

  it('measures a one-letter slip and gives up beyond two', () => {
    expect(editDistance('onias', 'onies')).toBe(1)
    expect(editDistance('gongho', 'fongho')).toBe(1)
    expect(editDistance('mbakwa', 'amamuki')).toBe(3)
  })

  it('refuses a slug the register has already used', () => {
    expect(proposeSlug('Sam Fongoh')).toBeNull()
    expect(proposeSlug('Somebody Not In The Register')).toBe('somebody-not-in-the-register')
  })

  it('indexes every register entry plus the Fon, and nothing else', () => {
    expect(identityIndex()).toHaveLength(NAMES.length + 1)
    expect(identityIndex().filter(i => i.kind === 'fon')).toHaveLength(1)
  })

  it('finds every name in the register by its own display name', () => {
    /* If the register itself contains a name the classifier cannot place, the classifier is
       wrong about the register and would let a duplicate of that person straight through. */
    const unplaceable = NAMES
      .map(n => ({ n, v: classifyCandidate(n.display) }))
      .filter(({ n, v }) => v.resolvesTo?.id !== n.slug)
      .map(({ n, v }) => `${n.display} -> ${v.classification} ${v.resolvesTo?.id ?? ''}`)
    expect(unplaceable).toEqual([])
  })
})
