import { describe, it, expect, vi, beforeEach } from 'vitest'

const tagged = vi.fn()
vi.mock('./client', () => ({
  sql: Object.assign((...a: unknown[]) => tagged(...a), { query: vi.fn() }),
  DbConfigError: class DbConfigError extends Error {},
}))

const m = await import('./contributions')

const ROW = {
  id: 'c1', clerk_user_id: 'user_owner', type: 'correction',
  target_type: 'quarter', target_id: 'Fun', content: 'text', source_note: 'a source',
  status: 'pending', created_at: '2026-09-05', updated_at: '2026-09-05',
  reviewed_at: null, reviewed_by: 'user_reviewer',
}

const paramsOf = (call: unknown[]) => call.slice(1)
const textOf   = (call: unknown[]) => (call[0] as string[]).join('?')

beforeEach(() => {
  tagged.mockReset()
  tagged.mockResolvedValue([ROW])
})

describe('what a contributor is allowed to see', () => {
  it('strips the reviewer’s identity', () => {
    const v = m.toContributorView(ROW as never)
    expect(v).not.toHaveProperty('reviewed_by')
    expect(JSON.stringify(v)).not.toContain('user_reviewer')
  })

  it('strips their own Clerk id — the browser has no use for it', () => {
    const v = m.toContributorView(ROW as never)
    expect(v).not.toHaveProperty('clerk_user_id')
    expect(JSON.stringify(v)).not.toContain('user_owner')
  })

  it('keeps what they wrote, the target and the outcome', () => {
    const v = m.toContributorView(ROW as never)
    expect(v.content).toBe('text')
    expect(v.source_note).toBe('a source')
    expect(v.target_id).toBe('Fun')
    expect(v.status).toBe('pending')
  })
})

describe('scoping', () => {
  it('lists only that member’s contributions', async () => {
    await m.listMyContributions('user_owner')
    const call = tagged.mock.calls[0]
    expect(textOf(call)).toContain('WHERE clerk_user_id =')
    expect(paramsOf(call)).toContain('user_owner')
  })

  it('returns contributor views, never raw rows', async () => {
    const out = await m.listMyContributions('user_owner')
    expect(JSON.stringify(out)).not.toContain('reviewed_by')
    expect(JSON.stringify(out)).not.toContain('user_reviewer')
  })

  it('writes the id it was given, in first position', async () => {
    await m.createContribution('user_owner', {
      type: 'correction', targetType: 'quarter', targetId: 'Fun',
      content: 'x', sourceNote: null,
    })
    expect(paramsOf(tagged.mock.calls[0])[0]).toBe('user_owner')
  })

  it('sets no status on insert — the column default makes it pending', async () => {
    await m.createContribution('user_owner', {
      type: 'correction', targetType: 'quarter', targetId: 'Fun',
      content: 'x', sourceNote: null,
    })
    expect(textOf(tagged.mock.calls[0])).not.toContain('status')
  })
})

describe('state changes are guarded in the statement', () => {
  it('withdraws only a pending row, and only the contributor’s own', async () => {
    await m.withdrawOwnContribution('user_owner', 'c1')
    const text = textOf(tagged.mock.calls[0])
    expect(text).toContain('clerk_user_id =')
    expect(text).toContain("status = 'pending'")
    expect(paramsOf(tagged.mock.calls[0])).toEqual(['c1', 'user_owner'])
  })

  it('decides only a pending row, recording who and when', async () => {
    await m.decideContribution('c1', 'accepted', 'user_reviewer')
    const text = textOf(tagged.mock.calls[0])
    expect(text).toContain("status = 'pending'")
    expect(text).toContain('reviewed_by')
    expect(paramsOf(tagged.mock.calls[0])).toEqual(['accepted', 'user_reviewer', 'c1'])
  })

  it('returns null when nothing was updated', async () => {
    tagged.mockResolvedValue([])
    await expect(m.withdrawOwnContribution('u', 'c')).resolves.toBeNull()
    await expect(m.decideContribution('c', 'accepted', 'r')).resolves.toBeNull()
  })
})

describe('the publication boundary', () => {
  /* The safety property of this phase, asserted rather than assumed: every statement this
     module can issue names `contributions` and nothing else. Accepting a contribution cannot
     reach a canonical record, because there is no code path from here to one. */
  it('touches no table but contributions', async () => {
    await m.listMyContributions('u')
    await m.createContribution('u', {
      type: 'other', targetType: 'general', targetId: null, content: 'x', sourceNote: null,
    })
    await m.withdrawOwnContribution('u', 'c')
    await m.decideContribution('c', 'accepted', 'r')
    await m.getContributionForReview('c')
    await m.listPendingContributions()

    for (const call of tagged.mock.calls) {
      const text = textOf(call)
      expect(text).toContain('contributions')
      expect(text).not.toMatch(/founding|indigene_profiles|community_members|profile_claims|follows/i)
      expect(text).not.toMatch(/\bDROP\b|\bTRUNCATE\b|\bDELETE\b|\bALTER\b/i)
    }
  })

  it('only ever UPDATEs a status, never any content of the record', async () => {
    await m.decideContribution('c', 'accepted', 'r')
    const text = textOf(tagged.mock.calls[0])
    /* The SET clause changes status and the review stamps. Nothing else. */
    const setClause = text.split('WHERE')[0]
    expect(setClause).toContain('status')
    expect(setClause).toContain('reviewed_at')
    expect(setClause).toContain('reviewed_by')
    expect(setClause).not.toMatch(/content|target_|type/)
  })
})
