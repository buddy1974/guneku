import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

/* The public directory endpoint. Nobody signs in to reach it, so what it returns is what the
   whole internet returns — the one place where an over-wide projection has no second lock. */

const listProfiles = vi.fn()
vi.mock('@/lib/db/queries', () => ({ listProfiles: (...a: unknown[]) => listProfiles(...a) }))

const { GET } = await import('./route')

const get = (qs = '') => new NextRequest(`https://www.guneku.org/api/indigenes/all${qs}`)

beforeEach(() => {
  vi.clearAllMocks()
  listProfiles.mockResolvedValue({ profiles: [], total: 0 })
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('the public listing', () => {
  it('answers 200 with an empty directory', async () => {
    const res = await GET(get())
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ profiles: [], total: 0 })
  })

  it('never carries a Clerk user id into the public payload', async () => {
    listProfiles.mockResolvedValue({
      profiles: [{ id: 'p1', full_name: 'A Name', quarter: 'Ntoh', is_verified: false }],
      total: 1,
    })
    const res  = await GET(get())
    const text = JSON.stringify(await res.json())

    expect(text).not.toContain('clerk_user_id')
    expect(text).not.toContain('user_')
    expect(text).not.toContain('total_count')
  })

  it('returns only the two keys the directory asks for', async () => {
    const res  = await GET(get())
    expect(Object.keys(await res.json()).sort()).toEqual(['profiles', 'total'])
  })
})

describe('search, filtering and pagination still work', () => {
  it('passes the search term through', async () => {
    await GET(get('?search=akwe'))
    expect(listProfiles).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'akwe', page: 1, limit: 24 }),
    )
  })

  it('passes the quarter filter through', async () => {
    await GET(get('?quarter=Ntoh'))
    expect(listProfiles).toHaveBeenCalledWith(expect.objectContaining({ quarter: 'Ntoh' }))
  })

  it('passes the country filter through', async () => {
    await GET(get('?country=Germany'))
    expect(listProfiles).toHaveBeenCalledWith(expect.objectContaining({ country: 'Germany' }))
  })

  it('pages', async () => {
    await GET(get('?page=3'))
    expect(listProfiles).toHaveBeenCalledWith(expect.objectContaining({ page: 3 }))
  })

  it('treats absent filters as absent rather than as empty strings', async () => {
    await GET(get())
    expect(listProfiles).toHaveBeenCalledWith({
      search: undefined, quarter: undefined, country: undefined, page: 1, limit: 24,
    })
  })

  it('combines a search with a filter and a page', async () => {
    await GET(get('?search=ak&quarter=Ntoh&page=2'))
    expect(listProfiles).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'ak', quarter: 'Ntoh', page: 2 }),
    )
  })
})

describe('failure', () => {
  it('answers 503 when the directory is not provisioned, and names nothing', async () => {
    listProfiles.mockRejectedValue(Object.assign(new Error('relation does not exist'), { code: '42P01' }))
    const res  = await GET(get())
    const body = await res.json()

    expect(res.status).toBe(503)
    expect(body).toEqual({ error: 'This part of Guneku is not available yet.' })
  })

  it('never returns a driver message to the public', async () => {
    listProfiles.mockRejectedValue(new Error('password authentication failed for user "guneku"'))
    const res  = await GET(get())
    const body = await res.json()

    expect(res.status).toBe(500)
    expect(JSON.stringify(body)).not.toContain('password')
  })
})
