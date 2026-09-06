import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const askPalace = vi.fn()
vi.mock('@/lib/palace-ai', () => ({ askPalace: (...a: unknown[]) => askPalace(...a) }))

const rateLimited = vi.fn()
vi.mock('@/lib/rate-limit', () => ({
  rateLimited: (...a: unknown[]) => rateLimited(...a),
  senderKey: () => 'test',
  RATE_LIMIT_MESSAGE: 'Too many messages from this connection. Please try again later.',
}))

const { POST } = await import('./route')

const post = (body: unknown) => new NextRequest('https://www.guneku.org/api/ask', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
})

const ANSWER = {
  answered: true, answer: 'An answer.', mode: 'record',
  citations: [{ title: 'About Guneku', url: '/kingdom/about-guneku', type: 'kingdom' }],
  links: [], suggestions: [],
}

beforeEach(() => {
  vi.clearAllMocks()
  rateLimited.mockReturnValue(false)
  askPalace.mockResolvedValue(ANSWER)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

describe('the assistant is public', () => {
  /* A visitor asking who the Fon is should not have to sign in to their own Fondom's
     website. This route calls no auth helper at all. */
  it('answers without any account', async () => {
    const res = await POST(post({ question: 'Who is the reigning Fon?' }))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toEqual(ANSWER)
  })

  it('imports no auth helper and no database module', async () => {
    const { readFileSync } = await import('node:fs')
    const src = readFileSync(new URL('./route.ts', import.meta.url), 'utf-8')
      .replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')

    expect(src).not.toMatch(/requireUser|optionalUser|requireRole/)
    expect(src).not.toMatch(/@\/lib\/db/)
  })
})

describe('input handling', () => {
  it.each(['', '  ', 'hi', 'a'])('refuses the too-short question %j', async q => {
    const res = await POST(post({ question: q }))
    expect(res.status).toBe(400)
    expect(askPalace).not.toHaveBeenCalled()
  })

  it('refuses a body that is not JSON', async () => {
    const bad = new NextRequest('https://www.guneku.org/api/ask', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: 'not json',
    })
    expect((await POST(bad)).status).toBe(400)
    expect(askPalace).not.toHaveBeenCalled()
  })

  it('caps the question length before it reaches the assistant', async () => {
    await POST(post({ question: 'x'.repeat(4000) }))
    expect(String(askPalace.mock.calls[0][0]).length).toBe(500)
  })

  it('coerces a non-string question rather than trusting it', async () => {
    const res = await POST(post({ question: { evil: true } }))
    /* "[object Object]" is long enough to pass the length gate; what matters is that a
       string reaches the assistant, never an object it might spread. */
    expect(res.status).toBe(200)
    expect(typeof askPalace.mock.calls[0][0]).toBe('string')
  })
})

describe('rate limiting', () => {
  it('answers 429 safely when the limit is reached', async () => {
    rateLimited.mockReturnValue(true)
    const res = await POST(post({ question: 'Who is the reigning Fon?' }))

    expect(res.status).toBe(429)
    expect(askPalace).not.toHaveBeenCalled()
    const body = await res.json()
    /* No quota, no provider name, no reset time — nothing an abuser can tune against. */
    expect(JSON.stringify(body)).not.toMatch(/anthropic|quota|token|limit:|reset/i)
  })

  it('uses its own bucket, separate from the forms', async () => {
    await POST(post({ question: 'Who is the reigning Fon?' }))
    expect(rateLimited).toHaveBeenCalledWith('ask', 'test')
  })
})

describe('failure', () => {
  it('never returns a provider message or key fragment', async () => {
    askPalace.mockRejectedValue(new Error('401 invalid x-api-key sk-ant-abc123'))
    const res = await POST(post({ question: 'Who is the reigning Fon?' }))

    expect(res.status).toBe(500)
    const body = JSON.stringify(await res.json())
    expect(body).toBe(JSON.stringify({ error: 'Something went wrong. Please try again.' }))
    expect(body).not.toContain('sk-ant')
  })
})

describe('the assistant’s limit is genuinely tighter than a form’s', () => {
  /* The route comment claims this. It is asserted rather than trusted, because a comment
     that describes behaviour the code does not have is worse than no comment. */
  it('refuses the assistant sooner than the Palace form', async () => {
    /* `vi.mock` above is hoisted and applies to the whole file, so a plain import here
       returns the mock. The real limiter has to be asked for explicitly. */
    const { rateLimited: realLimit } =
      await vi.importActual<typeof import('@/lib/rate-limit')>('@/lib/rate-limit')

    let askRefusedAt = 0
    for (let i = 1; i <= 10 && askRefusedAt === 0; i++) {
      if (realLimit('ask', '203.0.113.9')) askRefusedAt = i
    }

    let formRefusedAt = 0
    for (let i = 1; i <= 10 && formRefusedAt === 0; i++) {
      if (realLimit('palace-message', '203.0.113.10')) formRefusedAt = i
    }

    expect(askRefusedAt).toBeGreaterThan(0)
    expect(formRefusedAt).toBeGreaterThan(0)
    expect(askRefusedAt).toBeLessThan(formRefusedAt)
  })
})
