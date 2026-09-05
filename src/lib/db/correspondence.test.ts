import { describe, it, expect, vi, beforeEach } from 'vitest'

const tagged = vi.fn()
vi.mock('./client', () => ({
  sql: Object.assign((...a: unknown[]) => tagged(...a), { query: vi.fn() }),
  DbConfigError: class DbConfigError extends Error {},
}))

const m = await import('./correspondence')

const ROW = {
  id: 'c1', clerk_user_id: 'user_sender', sender_name: 'A Villager',
  sender_email: 'someone@example.com', sender_phone: null,
  category: 'palace-matter', subject: 'A matter', message: 'body',
  status: 'received', response: null, responded_at: null,
  internal_note: 'PALACE ONLY', handled_by: 'user_palace',
  created_at: 'x', updated_at: 'x',
}

const paramsOf = (call: unknown[]) => call.slice(1)
const textOf   = (call: unknown[]) => (call[0] as string[]).join('?')

beforeEach(() => {
  tagged.mockReset()
  tagged.mockResolvedValue([ROW])
})

describe('what the sender may see', () => {
  /* Enforced by the type having no such field, not by a caller remembering to delete one. */
  it('has no field at all for the Palace’s internal note', () => {
    const v = m.toSenderView(ROW as never)
    expect(v).not.toHaveProperty('internal_note')
    expect(JSON.stringify(v)).not.toContain('PALACE ONLY')
  })

  it('does not carry who handled it, or the sender’s own Clerk id', () => {
    const v = m.toSenderView(ROW as never)
    expect(v).not.toHaveProperty('handled_by')
    expect(v).not.toHaveProperty('clerk_user_id')
    expect(JSON.stringify(v)).not.toContain('user_palace')
    expect(JSON.stringify(v)).not.toContain('user_sender')
  })

  it('does not echo the sender’s own contact details back', () => {
    const v = m.toSenderView(ROW as never)
    expect(v).not.toHaveProperty('sender_email')
    expect(v).not.toHaveProperty('sender_phone')
  })

  it('keeps their letter, its state and any reply', () => {
    const v = m.toSenderView(ROW as never)
    expect(v.subject).toBe('A matter')
    expect(v.message).toBe('body')
    expect(v.status).toBe('received')
    expect(v.response).toBeNull()
  })
})

describe('scoping', () => {
  it('lists only that member’s letters', async () => {
    await m.listMyCorrespondence('user_sender')
    expect(textOf(tagged.mock.calls[0])).toContain('WHERE clerk_user_id =')
    expect(paramsOf(tagged.mock.calls[0])).toContain('user_sender')
  })

  it('reads one scoped by both the letter id and the member id', async () => {
    await m.getMyCorrespondence('user_sender', 'c1')
    const text = textOf(tagged.mock.calls[0])
    expect(text).toContain('id =')
    expect(text).toContain('clerk_user_id =')
    expect(paramsOf(tagged.mock.calls[0])).toEqual(['c1', 'user_sender'])
  })

  it('returns sender views from every member-facing read', async () => {
    const list = await m.listMyCorrespondence('user_sender')
    const one  = await m.getMyCorrespondence('user_sender', 'c1')
    for (const out of [JSON.stringify(list), JSON.stringify(one)]) {
      expect(out).not.toContain('PALACE ONLY')
      expect(out).not.toContain('handled_by')
    }
  })

  it('writes a null member for a visitor without an account', async () => {
    await m.createCorrespondence({
      clerkUserId: null, senderName: 'V', senderEmail: 'v@example.com', senderPhone: null,
      category: 'general-enquiry', subject: 's', message: 'm',
    })
    expect(paramsOf(tagged.mock.calls[0])[0]).toBeNull()
  })

  it('sets no status on insert — the column default makes it received', async () => {
    await m.createCorrespondence({
      clerkUserId: null, senderName: 'V', senderEmail: 'v@example.com', senderPhone: null,
      category: 'general-enquiry', subject: 's', message: 'm',
    })
    expect(textOf(tagged.mock.calls[0])).not.toContain('status')
  })
})

describe('the Palace’s writes are guarded in the statement', () => {
  /* The allowed states go into the UPDATE, so two clerks acting in the same second cannot
     both succeed — the loser updates no rows and gets null. */
  it('constrains a status change to the states it is allowed from', async () => {
    await m.setStatus('c1', 'in-review', ['received'], 'user_palace')
    const text = textOf(tagged.mock.calls[0])
    expect(text).toContain('status = ANY(')
    expect(paramsOf(tagged.mock.calls[0])).toEqual(['in-review', 'user_palace', 'c1', ['received']])
  })

  it('writes a response and its timestamp together', async () => {
    await m.recordResponse('c1', 'Our reply', ['received', 'in-review'], 'user_palace')
    const text = textOf(tagged.mock.calls[0])
    expect(text).toContain('response')
    expect(text).toContain('responded_at')
    expect(text).toContain("status       = 'responded'")
  })

  /* Jotting a note down is not a decision. */
  it('records a note without touching the status', async () => {
    await m.recordInternalNote('c1', 'a note', ['received'], 'user_palace')
    const setClause = textOf(tagged.mock.calls[0]).split('WHERE')[0]
    expect(setClause).toContain('internal_note')
    expect(setClause).not.toContain('status =')
  })

  it('returns null when nothing was updated', async () => {
    tagged.mockResolvedValue([])
    await expect(m.setStatus('c1', 'closed', ['received'], 'u')).resolves.toBeNull()
    await expect(m.recordResponse('c1', 'x', ['received'], 'u')).resolves.toBeNull()
    await expect(m.recordInternalNote('c1', 'x', ['received'], 'u')).resolves.toBeNull()
  })
})

describe('boundaries', () => {
  it('touches no table but palace_correspondence', async () => {
    await m.listMyCorrespondence('u')
    await m.getMyCorrespondence('u', 'c')
    await m.createCorrespondence({
      clerkUserId: null, senderName: 'V', senderEmail: 'v@example.com', senderPhone: null,
      category: 'other', subject: 's', message: 'm',
    })
    await m.listForPalace()
    await m.getForPalace('c')
    await m.setStatus('c', 'closed', ['received'], 'u')
    await m.recordResponse('c', 'x', ['received'], 'u')
    await m.recordInternalNote('c', 'x', ['received'], 'u')

    for (const call of tagged.mock.calls) {
      const text = textOf(call)
      expect(text).toContain('palace_correspondence')
      expect(text).not.toMatch(/founding|indigene_profiles|community_members|profile_claims|follows|contributions/i)
      expect(text).not.toMatch(/\bDROP\b|\bTRUNCATE\b|\bDELETE\b|\bALTER\b/i)
    }
  })

  it('shows the Palace only what is still open', async () => {
    await m.listForPalace()
    expect(textOf(tagged.mock.calls[0])).toContain("status <> 'closed'")
  })
})
