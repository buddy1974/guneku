import { describe, it, expect, vi, beforeEach } from 'vitest'

/* Who may register a business — tested where it is actually decided, in the route.
 *
 * The page hides the form from somebody who may not use it. That is courtesy and it is not
 * the control: a hidden button is not a permission, and the interesting caller is the one who
 * never loads the page. So every case below is a hand-made request straight at the handler,
 * which is exactly the shape a curious person would send.
 *
 * Clerk and Neon are mocked at the module boundary; nothing here opens a connection. */

const auth = vi.fn()
const claimRows = vi.fn()
const dbFns = {
  createBusiness: vi.fn(),
  updateMyBusiness: vi.fn(),
  archiveMyBusiness: vi.fn(),
  getMyBusiness: vi.fn(),
  listMyBusinesses: vi.fn(),
}

vi.mock('@clerk/nextjs/server', () => ({ auth: () => auth() }))

/* The limiter is real behaviour and has its own tests; here it would only make every case
   after the first answer 429, because they all share one sender key. */
vi.mock('@/lib/rate-limit', () => ({
  rateLimited: () => false, senderKey: () => 'test', RATE_LIMIT_MESSAGE: 'Too many requests.',
}))
vi.mock('@/lib/clerk-config', () => ({ clerkConfigured: () => true }))

/* The claim lookup is the whole gate, so it is mocked at the database rather than at the
   function that reads it — that way the real `requireVerifiedGunekuan` runs. */
vi.mock('@/lib/db/client', () => ({
  sql: Object.assign(
    () => claimRows(),
    { query: () => claimRows() },
  ),
  DbConfigError: class extends Error {},
  isDatabaseConfigured: () => true,
  databaseConfigState: () => ({ ok: true, url: 'postgres://x' }),
}))

vi.mock('@/lib/db/businesses', async () => {
  const real = await vi.importActual<typeof import('@/lib/db/businesses')>('@/lib/db/businesses')
  return {
    ...real,
    createBusiness:   (...a: unknown[]) => dbFns.createBusiness(...a),
    updateMyBusiness: (...a: unknown[]) => dbFns.updateMyBusiness(...a),
    archiveMyBusiness: (...a: unknown[]) => dbFns.archiveMyBusiness(...a),
    getMyBusiness:    (...a: unknown[]) => dbFns.getMyBusiness(...a),
    listMyBusinesses: (...a: unknown[]) => dbFns.listMyBusinesses(...a),
  }
})

const { POST, GET } = await import('./route')
const { PUT, DELETE } = await import('./[id]/route')

const post = (body: unknown) =>
  POST(new Request('https://guneku.org/api/businesses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as never)

const put = (id: string, body: unknown) =>
  PUT(
    new Request(`https://guneku.org/api/businesses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }) as never,
    { params: Promise.resolve({ id }) },
  )

const VALID = { name: 'Ngong Market Supplies', category: 'retail-commerce' }

/** A signed-in account with no approved claim. */
function signedInOnly(userId = 'user_stranger') {
  auth.mockResolvedValue({ userId, sessionClaims: { publicMetadata: {} } })
  claimRows.mockResolvedValue([])
}

/** A signed-in account the Palace has associated with a register entry. */
function verified(userId = 'user_marcel', personSlug = 'marcel-tabit-akwe') {
  auth.mockResolvedValue({ userId, sessionClaims: { publicMetadata: {} } })
  claimRows.mockResolvedValue([{ person_slug: personSlug }])
}

beforeEach(() => {
  vi.clearAllMocks()
  for (const fn of Object.values(dbFns)) fn.mockReset()
  dbFns.createBusiness.mockResolvedValue({ id: 'b1', slug: 'ngong-market-supplies' })
})

describe('registering a business is not open to everybody with an account', () => {
  it('refuses a signed-out caller', async () => {
    auth.mockResolvedValue({ userId: null, sessionClaims: null })
    const res = await post(VALID)
    expect(res.status).toBe(401)
    expect(dbFns.createBusiness).not.toHaveBeenCalled()
  })

  it('refuses a signed-in account with no approved claim', async () => {
    /* The case that matters: a real, ordinary member of the site. A Clerk account says
       somebody exists; it says nothing about Guneku. */
    signedInOnly()
    const res = await post(VALID)
    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({
      error: 'Business registration is available to verified Gunekuans.',
    })
    expect(dbFns.createBusiness).not.toHaveBeenCalled()
  })

  it('refuses an account whose claim points at nobody in the register', async () => {
    /* An approved claim on a slug the register no longer holds attaches a business to
       nothing. The safe direction is to refuse. */
    verified('user_ghost', 'somebody-who-was-removed')
    const res = await post(VALID)
    expect(res.status).toBe(403)
    expect(dbFns.createBusiness).not.toHaveBeenCalled()
  })

  it('tells a refused caller nothing about their moderation state', async () => {
    signedInOnly()
    const body = JSON.stringify(await (await post(VALID)).json())
    for (const leak of ['claim', 'pending', 'rejected', 'profile_claims', 'clerk']) {
      expect(body.toLowerCase(), leak).not.toContain(leak)
    }
  })

  it('allows a verified Gunekuan', async () => {
    verified()
    const res = await post(VALID)
    expect(res.status).toBe(201)
    expect(dbFns.createBusiness).toHaveBeenCalledOnce()
  })
})

describe('a member cannot register a business in somebody else’s name', () => {
  it('ignores a person slug in the request body', async () => {
    /* The impersonation attempt, made as directly as it can be made. `person_slug` is read
       from the caller's own approved claim, so the body's version is never even looked at. */
    verified('user_marcel', 'marcel-tabit-akwe')
    await post({ ...VALID, personSlug: 'fomuki-carine', person_slug: 'fomuki-carine' })

    const [, personSlug] = dbFns.createBusiness.mock.calls[0] as [string, string]
    expect(personSlug).toBe('marcel-tabit-akwe')
  })

  it('writes the business under the caller’s own session id', async () => {
    verified('user_marcel', 'marcel-tabit-akwe')
    await post({ ...VALID, clerkUserId: 'user_someone_else' })
    const [clerkUserId] = dbFns.createBusiness.mock.calls[0] as [string]
    expect(clerkUserId).toBe('user_marcel')
  })
})

describe('editing is scoped to the owner', () => {
  it('refuses an unverified caller outright', async () => {
    signedInOnly()
    const res = await put('someone-elses-id', VALID)
    expect(res.status).toBe(403)
    expect(dbFns.updateMyBusiness).not.toHaveBeenCalled()
  })

  it('passes the caller’s own id into the update, never an id from the body', async () => {
    verified('user_marcel')
    dbFns.updateMyBusiness.mockResolvedValue({ id: 'b1' })
    await put('b1', { ...VALID, clerkUserId: 'user_someone_else' })
    const [clerkUserId, id] = dbFns.updateMyBusiness.mock.calls[0] as [string, string]
    expect(clerkUserId).toBe('user_marcel')
    expect(id).toBe('b1')
  })

  it('answers 404 when the business is not this caller’s', async () => {
    /* The owner-scoped statement updates no rows and returns null. 404 rather than 403,
       because "that exists but is not yours" confirms somebody else's record to a person
       who only guessed an id. */
    verified('user_marcel')
    dbFns.updateMyBusiness.mockResolvedValue(null)
    const res = await put('someone-elses-id', VALID)
    expect(res.status).toBe(404)
    expect(await res.json()).toEqual({ error: 'Not found.' })
  })

  it('archives rather than deletes, and only the caller’s own', async () => {
    verified('user_marcel')
    dbFns.archiveMyBusiness.mockResolvedValue(null)
    const res = await DELETE(
      new Request('https://guneku.org/api/businesses/x', { method: 'DELETE' }) as never,
      { params: Promise.resolve({ id: 'x' }) },
    )
    expect(res.status).toBe(404)
    const [clerkUserId] = dbFns.archiveMyBusiness.mock.calls[0] as [string]
    expect(clerkUserId).toBe('user_marcel')
  })
})

describe('what a business may contain', () => {
  it('refuses a submission with no name or no category', async () => {
    verified()
    expect((await post({ category: 'retail-commerce' })).status).toBe(400)
    expect((await post({ name: 'A shop' })).status).toBe(400)
    expect(dbFns.createBusiness).not.toHaveBeenCalled()
  })

  it('refuses a category that is not on the list', async () => {
    verified()
    const res = await post({ name: 'A shop', category: 'crypto-casino' })
    expect(res.status).toBe(400)
    expect(dbFns.createBusiness).not.toHaveBeenCalled()
  })

  it('refuses a video link that is not a YouTube video', async () => {
    verified()
    for (const bad of ['javascript:alert(1)', 'https://evil.example/v', '<iframe/>']) {
      const res = await post({ ...VALID, videos: [{ url: bad }] })
      expect(res.status, bad).toBe(400)
      expect(await res.json()).toEqual({ error: 'Enter a valid YouTube video link.' })
    }
    expect(dbFns.createBusiness).not.toHaveBeenCalled()
  })

  it('stores a video as an id and never as a URL', async () => {
    verified()
    await post({ ...VALID, videos: [{ url: 'https://youtu.be/dQw4w9WgXcQ' }] })
    const [, , input] = dbFns.createBusiness.mock.calls[0] as [string, string, { videoIds: unknown[] }]
    expect(input.videoIds).toEqual([{ videoId: 'dQw4w9WgXcQ', title: null }])
  })

  it('drops a link a browser would execute', async () => {
    verified()
    await post({ ...VALID, website: 'javascript:alert(1)', facebook: 'data:text/html,x' })
    const [, , input] = dbFns.createBusiness.mock.calls[0] as
      [string, string, { website: unknown; facebook: unknown }]
    expect(input.website).toBeNull()
    expect(input.facebook).toBeNull()
  })

  it('keeps no contact detail when publication was not chosen', async () => {
    /* Turning publication off must not leave the number sitting in a column for some later
       query to find. It is the consent decision, not a display toggle. */
    verified()
    await post({
      ...VALID, publishContact: false,
      contactPhone: '+237 600 000 000', contactEmail: 'shop@example.com',
    })
    const [, , input] = dbFns.createBusiness.mock.calls[0] as
      [string, string, { contactPhone: unknown; contactEmail: unknown }]
    expect(input.contactPhone).toBeNull()
    expect(input.contactEmail).toBeNull()
  })

  it('keeps contact detail when publication was chosen', async () => {
    verified()
    await post({ ...VALID, publishContact: true, contactPhone: '+237 600 000 000' })
    const [, , input] = dbFns.createBusiness.mock.calls[0] as
      [string, string, { contactPhone: unknown }]
    expect(input.contactPhone).toBe('+237 600 000 000')
  })

  it('reserves the curated slugs so a registered business cannot shadow one', async () => {
    verified()
    await post({ ...VALID, name: 'MaxPromo Digital' })
    const [, , , reserved] = dbFns.createBusiness.mock.calls[0] as
      [string, string, unknown, string[]]
    expect(reserved).toContain('maxpromo-digital')
  })
})

describe('listing your own', () => {
  it('is refused to an unverified account', async () => {
    signedInOnly()
    const res = await GET()
    expect(res.status).toBe(403)
    expect(dbFns.listMyBusinesses).not.toHaveBeenCalled()
  })

  it('reads only the caller’s own', async () => {
    verified('user_marcel')
    dbFns.listMyBusinesses.mockResolvedValue([])
    await GET()
    expect(dbFns.listMyBusinesses).toHaveBeenCalledWith('user_marcel')
  })
})
