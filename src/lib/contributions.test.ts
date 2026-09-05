import { describe, it, expect } from 'vitest'
import {
  CONTRIBUTION_TYPES, isContributionType, TYPE_LABEL, TYPE_HINT,
  TARGET_TYPES, isTargetType, resolveTarget,
  CONTRIBUTION_STATUSES, isContributionAction, ACTION_RESULT, canTransition, actorFor,
  STATUS_LABEL, STATUS_NOTE,
} from './contributions'
import { GUNEKU_QUARTERS_27 } from './quarters'
import { allFoundingNames } from './community'

const LIVING   = allFoundingNames().find(n => n.deceased !== true)!
const DECEASED = allFoundingNames().find(n => n.deceased === true)!

describe('contribution types', () => {
  it('is the closed set the Palace has a process for', () => {
    expect([...CONTRIBUTION_TYPES]).toEqual([
      'correction', 'missing-information', 'quarter-information', 'gudeca-information',
      'person-information', 'history-culture', 'photo-archive', 'other',
    ])
  })

  it('gives every type a label and a hint', () => {
    for (const t of CONTRIBUTION_TYPES) {
      expect(TYPE_LABEL[t]).toBeTruthy()
      expect(TYPE_HINT[t]).toBeTruthy()
    }
  })

  it.each(['fabrication', 'Correction', 'CORRECTION', '', 'delete-record', 'admin'])(
    'rejects the arbitrary type %j', v => { expect(isContributionType(v)).toBe(false) },
  )

  it.each([null, undefined, 1, {}, []])('rejects the non-string type %j', v => {
    expect(isContributionType(v)).toBe(false)
  })
})

describe('targets are validated against the canonical records', () => {
  it('has the expected set of target kinds', () => {
    expect([...TARGET_TYPES]).toEqual(['quarter', 'person', 'body', 'chapter', 'page', 'general'])
    expect(isTargetType('nonsense')).toBe(false)
  })

  it('accepts the general record with no id', () => {
    const r = resolveTarget('general', null)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.targetId).toBeNull()
  })

  it.each([...GUNEKU_QUARTERS_27])('accepts the canonical quarter %s', q => {
    const r = resolveTarget('quarter', q)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.targetId).toBe(q)
  })

  /* A browser must not be able to invent a place in Guneku. */
  it.each(['Atlantis', 'njinigom', '', '  ', 'Njinebai'])('rejects the quarter %j', q => {
    expect(resolveTarget('quarter', q).ok).toBe(false)
  })

  it('accepts a person in the register and returns the register’s own name', () => {
    const r = resolveTarget('person', LIVING.slug)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.targetId).toBe(LIVING.slug)
      /* The label comes from the record, never from the request. */
      expect(r.label).toBe(LIVING.display)
    }
  })

  it('rejects a person who is not in the register', () => {
    expect(resolveTarget('person', 'no-such-person').ok).toBe(false)
    expect(resolveTarget('person', '../../etc/passwd').ok).toBe(false)
  })

  it('accepts a body and a chapter the Fondom records', () => {
    expect(resolveTarget('body', 'traditional-council').ok).toBe(true)
    expect(resolveTarget('chapter', 'gudeca-europe').ok).toBe(true)
  })

  it('rejects a body or chapter it does not', () => {
    expect(resolveTarget('body', 'invented-council').ok).toBe(false)
    expect(resolveTarget('chapter', 'gudeca-atlantis').ok).toBe(false)
  })

  it('requires an id for everything except the general record', () => {
    for (const t of ['quarter', 'person', 'body', 'chapter', 'page']) {
      expect(resolveTarget(t, null).ok).toBe(false)
      expect(resolveTarget(t, '').ok).toBe(false)
    }
  })

  it('accepts a plain site path and refuses anything that is not one', () => {
    expect(resolveTarget('page', '/quarters/njinigom').ok).toBe(true)
    for (const bad of [
      'https://evil.example.com', '//evil.example.com', 'javascript:alert(1)',
      '/quarters/<script>', '/a?b=c', 'quarters/njinigom',
    ]) {
      expect(resolveTarget('page', bad).ok).toBe(false)
    }
  })

  it('rejects an unknown target kind outright', () => {
    expect(resolveTarget('database', 'x').ok).toBe(false)
    expect(resolveTarget(null, 'x').ok).toBe(false)
  })
})

describe('deceased records', () => {
  /* A deceased entry cannot be CLAIMED — there is nobody to invite. But a family or a
     neighbour correcting what the archive says about someone who has gone is exactly the
     contribution a village record needs, and refusing it would lose the people who
     remember best. The two concepts are deliberately not merged. */
  it('can be contributed about', () => {
    const r = resolveTarget('person', DECEASED.slug)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.label).toBe(DECEASED.display)
  })
})

describe('workflow', () => {
  it('has four states', () => {
    expect([...CONTRIBUTION_STATUSES]).toEqual(['pending', 'accepted', 'rejected', 'withdrawn'])
  })

  it('maps each action to the state it produces', () => {
    expect(ACTION_RESULT).toEqual({
      withdraw: 'withdrawn', accept: 'accepted', reject: 'rejected',
    })
  })

  it('rejects an invented action', () => {
    for (const v of ['publish', 'apply', 'merge', 'ACCEPT', '', null]) {
      expect(isContributionAction(v)).toBe(false)
    }
  })

  it('allows all three actions out of pending', () => {
    for (const a of ['withdraw', 'accept', 'reject'] as const) {
      expect(canTransition('pending', a)).toBe(true)
    }
  })

  it.each(['accepted', 'rejected', 'withdrawn'] as const)('refuses every move out of %s', from => {
    for (const a of ['withdraw', 'accept', 'reject'] as const) {
      expect(canTransition(from, a)).toBe(false)
    }
  })

  it('lets a contributor withdraw and nothing else', () => {
    expect(actorFor('withdraw')).toBe('contributor')
    expect(actorFor('accept')).toBe('reviewer')
    expect(actorFor('reject')).toBe('reviewer')
  })
})

describe('accepted never claims to be published', () => {
  /* Telling somebody their grandmother's name is on the site when it is not would be a lie
     the site tells on the Fondom's behalf. */
  it('does not use the word "published" for an accepted contribution', () => {
    expect(STATUS_LABEL.accepted).toBe('Accepted for editorial action')
    expect(STATUS_LABEL.accepted.toLowerCase()).not.toContain('publish')
    expect(STATUS_NOTE.accepted.toLowerCase()).toContain('not the same as it being on the')
  })

  it('says plainly that pending changes nothing', () => {
    expect(STATUS_NOTE.pending.toLowerCase()).toContain('nothing on the public record has changed')
  })

  it('keeps rejection neutral and exposes no reviewer reasoning', () => {
    expect(STATUS_NOTE.rejected).not.toMatch(/because|reason|reviewer|rejected by/i)
  })
})
