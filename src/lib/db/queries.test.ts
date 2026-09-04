import { describe, it, expect, vi, beforeEach } from 'vitest'

/* The Neon client is replaced wholesale. These tests are about what the query layer decides —
   which columns leave the building, and whose id scopes a write — not about Postgres. */
const query = vi.fn()
const tagged = vi.fn()

vi.mock('./client', () => ({
  sql: Object.assign(
    (...args: unknown[]) => tagged(...args),
    { query: (...args: unknown[]) => query(...args) },
  ),
  DbConfigError: class DbConfigError extends Error {},
}))

const {
  PUBLIC_PROFILE_COLUMNS, listProfiles, updateProfile, isUniqueViolation,
} = await import('./queries')

beforeEach(() => {
  query.mockReset()
  tagged.mockReset()
  /* The tagged-template form is used by the single-row reads. Default it to "no rows" so a
     test that does not care about them still gets a defined result. */
  tagged.mockResolvedValue([])
})

describe('the public projection', () => {
  it('never publishes the identifier every row is owned by', () => {
    expect(PUBLIC_PROFILE_COLUMNS).not.toContain('clerk_user_id')
  })

  /* The window column the pagination needs. It belongs to the query, not to a person, and
     it used to be spread into every profile object by `SELECT *` plus an object spread. */
  it('does not publish internal or query-only columns', () => {
    for (const forbidden of ['clerk_user_id', 'total_count', 'is_public', 'updated_at']) {
      expect(PUBLIC_PROFILE_COLUMNS).not.toContain(forbidden)
    }
  })

  it('still carries every field the public directory renders', () => {
    for (const needed of [
      'id', 'full_name', 'photo_url', 'quarter', 'profession', 'country_flag',
      'current_city', 'current_country', 'family_lineage', 'skills_text',
      'is_verified', 'willing_to_mentor', 'website_url', 'linkedin_url', 'facebook_url',
    ]) {
      expect(PUBLIC_PROFILE_COLUMNS).toContain(needed)
    }
  })

  it('asks the database for named columns, never for *', async () => {
    query.mockResolvedValue([])
    await listProfiles({})
    const [text] = query.mock.calls[0]
    expect(text).toContain('SELECT id, created_at')
    expect(text).not.toContain('SELECT *')
    expect(text).not.toContain('clerk_user_id')
  })
})

describe('listProfiles', () => {
  const row = {
    id: 'p1', created_at: '2026-01-01', full_name: 'A Name',
    profession: 'Teacher', quarter: 'Ntoh', skills_text: 'Maths, French',
    is_verified: true, willing_to_mentor: false, open_to_connect: true,
    /* Present in the row on purpose: even if a future query returns them, the mapper must
       not carry them out. */
    clerk_user_id: 'user_secret', total_count: '1', is_public: true,
  }

  it('strips ownership and query columns out of what it returns', async () => {
    query.mockResolvedValue([row])
    const { profiles, total } = await listProfiles({})

    expect(total).toBe(1)
    expect(profiles).toHaveLength(1)
    expect(JSON.stringify(profiles)).not.toContain('user_secret')
    expect(profiles[0]).not.toHaveProperty('clerk_user_id')
    expect(profiles[0]).not.toHaveProperty('total_count')
    expect(profiles[0]).not.toHaveProperty('is_public')
  })

  it('splits the stored skills column into a list', async () => {
    query.mockResolvedValue([row])
    const { profiles } = await listProfiles({})
    expect(profiles[0].skills).toEqual(['Maths', 'French'])
  })

  it('binds search, quarter, country, limit and offset as parameters', async () => {
    query.mockResolvedValue([])
    await listProfiles({ search: 'AKWE', quarter: 'Ntoh', country: 'Germany', page: 3, limit: 24 })

    const [text, params] = query.mock.calls[0]
    expect(params).toEqual(['%akwe%', 'Ntoh', 'Germany', 24, 48])
    /* The filters must be parameters, so a search term can never become SQL. */
    expect(text).toContain('$1::text')
    expect(text).not.toContain('akwe')
  })

  it('passes null for absent filters so every profile matches', async () => {
    query.mockResolvedValue([])
    await listProfiles({ page: 1 })
    const [, params] = query.mock.calls[0]
    expect(params.slice(0, 3)).toEqual([null, null, null])
    expect(params[4]).toBe(0)
  })

  it('reports a total of zero rather than NaN when nothing matches', async () => {
    query.mockResolvedValue([])
    const { profiles, total } = await listProfiles({ search: 'nobody' })
    expect(profiles).toEqual([])
    expect(total).toBe(0)
  })
})

describe('updateProfile', () => {
  const updated = [{ id: 'p1', clerk_user_id: 'user_1', full_name: 'A Name', skills_text: '' }]

  it('scopes the write to the id it was given, and never to anything in the data', async () => {
    query.mockResolvedValue(updated)
    await updateProfile('user_1', {
      bio: 'Hello',
      /* A caller trying to redirect the write. Neither column is editable, so neither may
         reach the SET clause however the body was shaped. */
      clerk_user_id: 'user_2',
      id: 'someone-elses-row',
    })

    const [text, params] = query.mock.calls[0]
    const setClause = String(text).split('WHERE')[0]
    expect(setClause).not.toContain('clerk_user_id')
    expect(setClause).not.toContain('id =')
    expect(text).toContain('WHERE clerk_user_id = $')
    expect(params[params.length - 1]).toBe('user_1')
    expect(params).not.toContain('user_2')
    expect(params).not.toContain('someone-elses-row')
  })

  it('leaves out a field the caller did not send', async () => {
    query.mockResolvedValue(updated)
    await updateProfile('user_1', { bio: 'Hello' })
    const [text] = query.mock.calls[0]
    expect(text).toContain('bio = $1')
    expect(text).not.toContain('employer')
  })

  it('clears a field the caller emptied', async () => {
    query.mockResolvedValue(updated)
    await updateProfile('user_1', { employer: '' })
    const [text, params] = query.mock.calls[0]
    expect(text).toContain('employer = $1')
    expect(params[0]).toBeNull()
  })

  it('refuses to empty the name, because the column cannot be null', async () => {
    query.mockResolvedValue(updated)
    await updateProfile('user_1', { full_name: '   ', bio: 'x' })
    const [text] = query.mock.calls[0]
    expect(text).not.toContain('full_name')
  })

  it('never sets a column it was not given, whatever else is in the object', async () => {
    query.mockResolvedValue(updated)
    await updateProfile('user_1', { is_verified: true })
    /* is_verified is the Palace's mark, not the member's. With nothing else to change the
       function falls through to a read rather than issuing an update. */
    expect(query).not.toHaveBeenCalled()
  })

  it('returns null when the member has no profile, instead of throwing', async () => {
    query.mockResolvedValue([])
    await expect(updateProfile('user_1', { bio: 'x' })).resolves.toBeNull()
  })
})

describe('isUniqueViolation', () => {
  it('recognises the one constraint this table has', () => {
    expect(isUniqueViolation({ code: '23505' })).toBe(true)
  })

  it('does not mistake other failures for it', () => {
    expect(isUniqueViolation({ code: '42P01' })).toBe(false)
    expect(isUniqueViolation(new Error('boom'))).toBe(false)
    expect(isUniqueViolation(null)).toBe(false)
  })
})
