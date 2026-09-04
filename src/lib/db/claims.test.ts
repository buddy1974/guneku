import { describe, it, expect, vi, beforeEach } from 'vitest'

/* The claim storage layer: what it scopes by, and what it lets out. */

const tagged = vi.fn()
vi.mock('./client', () => ({
  sql: Object.assign((...a: unknown[]) => tagged(...a), { query: vi.fn() }),
  DbConfigError: class DbConfigError extends Error {},
}))

const {
  toClaimantView, listMyClaims, findLiveClaim, personIsTaken,
  createClaim, withdrawOwnClaim, decideClaim,
} = await import('./claims')

const ROW = {
  id: 'c1', clerk_user_id: 'user_owner', person_slug: 'a-name',
  status: 'pending' as const, note: 'why it is me',
  created_at: '2026-09-01', updated_at: '2026-09-01',
  reviewed_at: null, reviewed_by: 'user_reviewer',
}

/** The values interpolated into a tagged template land in the arguments after the strings. */
const paramsOf = (call: unknown[]) => call.slice(1)
const textOf   = (call: unknown[]) => (call[0] as string[]).join('?')

beforeEach(() => {
  tagged.mockReset()
  tagged.mockResolvedValue([ROW])
})

describe('what a claimant is allowed to see', () => {
  it('strips the reviewer’s identity out of the row', () => {
    const view = toClaimantView(ROW)
    expect(view).not.toHaveProperty('reviewed_by')
    expect(JSON.stringify(view)).not.toContain('user_reviewer')
  })

  it('strips the claimant’s own Clerk id too — the browser has no use for it', () => {
    const view = toClaimantView(ROW)
    expect(view).not.toHaveProperty('clerk_user_id')
    expect(JSON.stringify(view)).not.toContain('user_owner')
  })

  it('keeps the outcome, the record and the claimant’s own note', () => {
    expect(toClaimantView(ROW)).toEqual({
      id: 'c1', person_slug: 'a-name', status: 'pending',
      note: 'why it is me', created_at: '2026-09-01', reviewed_at: null,
    })
  })
})

describe('every claimant read is scoped by the session id', () => {
  it('lists only that member’s claims', async () => {
    await listMyClaims('user_owner')
    const call = tagged.mock.calls[0]
    expect(textOf(call)).toContain('WHERE clerk_user_id =')
    expect(paramsOf(call)).toContain('user_owner')
  })

  it('returns claimant views, never raw rows', async () => {
    const claims = await listMyClaims('user_owner')
    expect(JSON.stringify(claims)).not.toContain('reviewed_by')
    expect(JSON.stringify(claims)).not.toContain('user_reviewer')
  })

  it('looks for a live claim by member and record together', async () => {
    await findLiveClaim('user_owner', 'a-name')
    const call = tagged.mock.calls[0]
    expect(paramsOf(call)).toEqual(['user_owner', 'a-name'])
    expect(textOf(call)).toContain("status IN ('pending', 'approved')")
  })

  it('answers whether a record is taken as a boolean, never as a name', async () => {
    await expect(personIsTaken('a-name')).resolves.toBe(true)
    tagged.mockResolvedValue([])
    await expect(personIsTaken('a-name')).resolves.toBe(false)
  })
})

describe('creating', () => {
  it('writes the id it was given, in that position', async () => {
    await createClaim('user_owner', 'a-name', 'my note')
    expect(paramsOf(tagged.mock.calls[0])).toEqual(['user_owner', 'a-name', 'my note'])
  })

  it('does not set a status — the column default is what makes a new claim pending', async () => {
    await createClaim('user_owner', 'a-name', null)
    expect(textOf(tagged.mock.calls[0])).not.toContain('status')
  })
})

describe('state changes are guarded in the statement, not only in the code', () => {
  /* This is the concurrency control, not a belt-and-braces check: two reviewers pressing
     approve at once both pass a read-then-write test, and only one passes this. */
  it('withdraws only a pending claim, and only the claimant’s own', async () => {
    await withdrawOwnClaim('user_owner', 'c1')
    const text = textOf(tagged.mock.calls[0])

    expect(text).toContain('clerk_user_id =')
    expect(text).toContain("status = 'pending'")
    expect(paramsOf(tagged.mock.calls[0])).toEqual(['c1', 'user_owner'])
  })

  it('decides only a pending claim', async () => {
    await decideClaim('c1', 'approved', 'user_reviewer')
    expect(textOf(tagged.mock.calls[0])).toContain("status = 'pending'")
  })

  it('records who decided and when', async () => {
    await decideClaim('c1', 'approved', 'user_reviewer')
    const text = textOf(tagged.mock.calls[0])
    expect(text).toContain('reviewed_at')
    expect(text).toContain('reviewed_by')
    expect(paramsOf(tagged.mock.calls[0])).toEqual(['approved', 'user_reviewer', 'c1'])
  })

  it('returns null when nothing was updated, rather than throwing', async () => {
    tagged.mockResolvedValue([])
    await expect(withdrawOwnClaim('user_owner', 'c1')).resolves.toBeNull()
    await expect(decideClaim('c1', 'approved', 'user_reviewer')).resolves.toBeNull()
  })
})

describe('historical integrity', () => {
  /* The whole safety property of this phase, asserted rather than assumed: every statement
     this module can issue names `profile_claims` and nothing else. No claim decision can
     reach a person's record, because there is no code path from here to one. */
  it('touches no table but profile_claims', async () => {
    await listMyClaims('u')
    await findLiveClaim('u', 'p')
    await personIsTaken('p')
    await createClaim('u', 'p', null)
    await withdrawOwnClaim('u', 'c')
    await decideClaim('c', 'approved', 'r')
    await import('./claims').then(m => m.getClaimForReview('c'))
    await import('./claims').then(m => m.listPendingForReview())

    for (const call of tagged.mock.calls) {
      const text = textOf(call)
      expect(text).toContain('profile_claims')
      expect(text).not.toMatch(/founding|notables|people|indigene_profiles|community_members/i)
      /* And nothing destructive anywhere in the module. */
      expect(text).not.toMatch(/\bDROP\b|\bTRUNCATE\b|\bDELETE\b|\bALTER\b/i)
    }
  })
})
