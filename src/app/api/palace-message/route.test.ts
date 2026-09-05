import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

/* The public Palace contact form. It has been the Fondom's working contact channel, and this
   phase put a database behind it — these tests exist mostly to prove that did not change what
   a visitor experiences. */

const sendPalaceMessage = vi.fn()
vi.mock('@/lib/email/send', () => ({ sendPalaceMessage: (...a: unknown[]) => sendPalaceMessage(...a) }))

const optionalUser = vi.fn()
vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth')
  return { ...actual, optionalUser: () => optionalUser() }
})

const createCorrespondence = vi.fn()
vi.mock('@/lib/db/correspondence', () => ({
  createCorrespondence: (...a: unknown[]) => createCorrespondence(...a),
}))

const rateLimited = vi.fn()
vi.mock('@/lib/rate-limit', () => ({
  rateLimited: (...a: unknown[]) => rateLimited(...a),
  senderKey: () => 'test',
  RATE_LIMIT_MESSAGE: 'Too many messages from this connection. Please try again later.',
}))

const { POST } = await import('./route')

const valid = {
  name: 'A Villager',
  topic: 'Palace / traditional matters',
  message: 'I would like to speak to the Palace about a family matter.',
  preferredContact: 'email',
  email: 'someone@example.com',
  consent: true,
}

const post = (body: unknown) => new NextRequest('https://www.guneku.org/api/palace-message', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
})

beforeEach(() => {
  vi.clearAllMocks()
  rateLimited.mockReturnValue(false)
  sendPalaceMessage.mockResolvedValue(undefined)
  optionalUser.mockResolvedValue(null)
  createCorrespondence.mockResolvedValue({ id: 'c1' })
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('a visitor does not need an account', () => {
  it('accepts a signed-out submission', async () => {
    const res = await POST(post(valid))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ success: true })
    expect(sendPalaceMessage).toHaveBeenCalledTimes(1)
  })

  /* No identity is manufactured for a visitor. NULL means "no account", never "unknown
     account", and it can never be filled in later by guessing who they were. */
  it('records no member for a signed-out visitor', async () => {
    await POST(post(valid))
    expect(createCorrespondence.mock.calls[0][0].clerkUserId).toBeNull()
  })

  it('attaches the member when the sender happens to be signed in', async () => {
    optionalUser.mockResolvedValue({ userId: 'user_member', role: 'member' })
    await POST(post(valid))
    expect(createCorrespondence.mock.calls[0][0].clerkUserId).toBe('user_member')
  })

  it('never takes an identity from the request body', async () => {
    await POST(post({ ...valid, clerk_user_id: 'user_victim', userId: 'user_victim' }))
    expect(createCorrespondence.mock.calls[0][0].clerkUserId).toBeNull()
    expect(JSON.stringify(createCorrespondence.mock.calls)).not.toContain('user_victim')
  })
})

describe('the existing protections are untouched', () => {
  it('keeps the honeypot, answering a bot with a success shape', async () => {
    const res = await POST(post({ ...valid, website: 'http://spam.example' }))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ success: true })
    /* Nothing is sent and nothing is stored — the bot simply learns nothing. */
    expect(sendPalaceMessage).not.toHaveBeenCalled()
    expect(createCorrespondence).not.toHaveBeenCalled()
  })

  it('keeps the rate limit', async () => {
    rateLimited.mockReturnValue(true)
    const res = await POST(post(valid))
    expect(res.status).toBe(429)
    expect(sendPalaceMessage).not.toHaveBeenCalled()
    expect(createCorrespondence).not.toHaveBeenCalled()
  })

  it.each([
    ['a missing name',        { name: '' }],
    ['an unknown topic',      { topic: 'Something invented' }],
    ['too short a message',   { message: 'hi' }],
    ['a missing consent',     { consent: false }],
    ['a bad email',           { email: 'not-an-email' }],
  ])('still refuses %s', async (_label, patch) => {
    const res = await POST(post({ ...valid, ...patch }))
    expect(res.status).toBe(400)
    expect(sendPalaceMessage).not.toHaveBeenCalled()
    expect(createCorrespondence).not.toHaveBeenCalled()
  })

  it('returns nothing about who was copied', async () => {
    const body = await (await POST(post(valid))).json()
    expect(Object.keys(body)).toEqual(['success'])
  })
})

describe('the email is what the visitor’s success depends on', () => {
  /* This route has been the Palace's working contact channel. Adding a database behind it
     must not create a new way for it to fail. */
  it('still succeeds when the letter cannot be recorded', async () => {
    createCorrespondence.mockRejectedValue(
      Object.assign(new Error('relation does not exist'), { code: '42P01' }))

    const res = await POST(post(valid))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual({ success: true })
    expect(sendPalaceMessage).toHaveBeenCalledTimes(1)
  })

  it('fails, and stores nothing, when the email itself fails', async () => {
    sendPalaceMessage.mockRejectedValue(new Error('Failed to send your message.'))
    const res = await POST(post(valid))
    expect(res.status).toBe(500)
    expect(createCorrespondence).not.toHaveBeenCalled()
  })

  it('never returns a provider message', async () => {
    sendPalaceMessage.mockRejectedValue(new Error('resend: 401 invalid api key re_abc123'))
    const body = await (await POST(post(valid))).json()
    expect(JSON.stringify(body)).not.toContain('re_abc123')
    expect(JSON.stringify(body)).not.toContain('resend')
  })
})

describe('what is recorded', () => {
  it('files the visitor’s topic under a category and keeps their words as the subject', async () => {
    await POST(post(valid))
    const input = createCorrespondence.mock.calls[0][0]

    expect(input.category).toBe('palace-matter')
    expect(input.subject).toBe('Palace / traditional matters')
    expect(input.message).toBe(valid.message)
    expect(input.senderName).toBe('A Villager')
    expect(input.senderEmail).toBe('someone@example.com')
  })

  it('records a telephone sender with no email', async () => {
    await POST(post({
      ...valid, preferredContact: 'phone', email: '', phone: '+237 6 00 00 00 00',
    }))
    const input = createCorrespondence.mock.calls[0][0]
    expect(input.senderPhone).toBe('+237 6 00 00 00 00')
    expect(input.senderEmail).toBeNull()
  })

  it('starts every letter at received, by column default', async () => {
    await POST(post(valid))
    expect(createCorrespondence.mock.calls[0][0]).not.toHaveProperty('status')
  })
})
