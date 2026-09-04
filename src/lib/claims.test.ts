import { describe, it, expect } from 'vitest'
import {
  claimEligibility, isClaimable, CLAIM_STATUSES, isClaimStatus, isLive,
  canTransition, actorFor, isClaimAction, ACTION_RESULT, INELIGIBLE_MESSAGE,
} from './claims'
import { allFoundingNames } from './community'

/* Eligibility and transitions, over the real register. These are the two places where being
   wrong is a harm rather than a bug, so they are tested against the actual reviewed data
   rather than a fixture that could drift away from it. */

const NAMES    = allFoundingNames()
const DECEASED = NAMES.filter(n => n.deceased === true)
const LIVING   = NAMES.filter(n => n.deceased !== true)

describe('the register this is tested against', () => {
  it('has both kinds of record, or these tests prove nothing', () => {
    expect(DECEASED.length).toBeGreaterThan(0)
    expect(LIVING.length).toBeGreaterThan(0)
  })
})

describe('a deceased record is never claimable', () => {
  it.each(DECEASED.map(n => n.slug))('refuses %s', slug => {
    const result = claimEligibility(slug)
    expect(result.ok).toBe(false)
    expect(result).toEqual({ ok: false, reason: 'deceased' })
    expect(isClaimable(slug)).toBe(false)
  })

  it('refuses every deceased record in the register, with no exception', () => {
    for (const n of DECEASED) expect(isClaimable(n.slug)).toBe(false)
  })

  /* The ordering matters: `deceased` is checked first and cannot be overridden by any other
     flag, so a record marked both deceased and claimable is still refused. */
  it('is refused for the deceased reason even if the record is also marked claimable', () => {
    const slug = DECEASED[0].slug
    const record = DECEASED[0] as { claimable?: boolean }
    const before = record.claimable
    record.claimable = true
    try {
      expect(claimEligibility(slug)).toEqual({ ok: false, reason: 'deceased' })
    } finally {
      if (before === undefined) delete record.claimable
      else record.claimable = before
    }
  })
})

describe('an eligible living record can be claimed', () => {
  it('accepts a living record and returns the record itself', () => {
    const slug   = LIVING[0].slug
    const result = claimEligibility(slug)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.person.slug).toBe(slug)
  })

  it('accepts every living record that is not explicitly withheld', () => {
    for (const n of LIVING) {
      if (n.claimable === false) continue
      expect(isClaimable(n.slug)).toBe(true)
    }
  })

  it('honours an explicit claimable:false without touching the data model', () => {
    const record = LIVING[0] as { claimable?: boolean }
    const before = record.claimable
    record.claimable = false
    try {
      expect(claimEligibility(LIVING[0].slug))
        .toEqual({ ok: false, reason: 'not-claimable' })
    } finally {
      if (before === undefined) delete record.claimable
      else record.claimable = before
    }
  })
})

describe('a record that does not exist cannot be claimed', () => {
  it.each([
    'no-such-person', '', '   ', '../../etc/passwd', 'marcel-tabit-akwe-x',
  ])('refuses %j', slug => {
    expect(claimEligibility(slug)).toEqual({ ok: false, reason: 'unknown' })
  })

  it.each([null, undefined, 42, {}, [], true])('refuses the non-string %j', v => {
    expect(claimEligibility(v)).toEqual({ ok: false, reason: 'unknown' })
  })
})

describe('what a refusal says', () => {
  it('never names another member, a reviewer, or a moderation state', () => {
    for (const message of Object.values(INELIGIBLE_MESSAGE)) {
      expect(message).not.toMatch(/user_|clerk|reviewer|pending|approved|rejected/i)
    }
  })

  it('points a deceased record at the Palace rather than at a claim', () => {
    expect(INELIGIBLE_MESSAGE.deceased).toMatch(/Palace/)
    expect(INELIGIBLE_MESSAGE.deceased).not.toMatch(/claim this|is this you/i)
  })
})

describe('the four states', () => {
  it('is exactly pending, approved, rejected, withdrawn', () => {
    expect([...CLAIM_STATUSES]).toEqual(['pending', 'approved', 'rejected', 'withdrawn'])
  })

  it('rejects anything else offered as a status', () => {
    for (const v of ['deleted', 'PENDING', '', null, 7]) expect(isClaimStatus(v)).toBe(false)
  })

  /* Must match the partial unique indexes in migration 0002 exactly. */
  it('treats pending and approved as live, and the other two as not', () => {
    expect(isLive('pending')).toBe(true)
    expect(isLive('approved')).toBe(true)
    expect(isLive('rejected')).toBe(false)
    expect(isLive('withdrawn')).toBe(false)
  })
})

describe('transitions', () => {
  it('allows all three actions out of pending', () => {
    expect(canTransition('pending', 'withdraw')).toBe(true)
    expect(canTransition('pending', 'approve')).toBe(true)
    expect(canTransition('pending', 'reject')).toBe(true)
  })

  /* A decision that can be quietly revised later is not a decision. */
  it.each(['approved', 'rejected', 'withdrawn'] as const)('refuses every move out of %s', from => {
    expect(canTransition(from, 'withdraw')).toBe(false)
    expect(canTransition(from, 'approve')).toBe(false)
    expect(canTransition(from, 'reject')).toBe(false)
  })

  it('rejects an invented action', () => {
    for (const v of ['delete', 'APPROVE', 'merge', '', null]) expect(isClaimAction(v)).toBe(false)
  })

  it('maps each action to the state it produces', () => {
    expect(ACTION_RESULT).toEqual({
      withdraw: 'withdrawn', approve: 'approved', reject: 'rejected',
    })
  })

  it('lets a claimant withdraw and nothing else', () => {
    expect(actorFor('withdraw')).toBe('claimant')
    expect(actorFor('approve')).toBe('reviewer')
    expect(actorFor('reject')).toBe('reviewer')
  })
})
