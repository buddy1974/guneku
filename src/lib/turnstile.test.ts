import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'

/* Turnstile, and — as much as the code — where it is deliberately absent.
 *
 * A challenge belongs on a write a stranger can make with no account. It does not belong on
 * a member editing their own profile, following a topic, or answering their own letter:
 * those already know who is asking. Adding a puzzle there taxes the villagers who signed in
 * and stops nobody. */

const READ = (p: string) => readFileSync(p, 'utf-8')
const strip = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')

const ANONYMOUS = [
  'src/app/api/palace-message/route.ts',
  'src/app/api/contact/route.ts',
  'src/app/api/support-interest/route.ts',
  'src/app/api/community/register/route.ts',
]

describe('the four anonymous public writes are challenged', () => {
  it('verifies a token on each of them, server-side', () => {
    for (const f of ANONYMOUS) {
      const code = strip(READ(f))
      expect(code).toContain('await verifyTurnstile(')
      expect(code).toContain('TURNSTILE_MESSAGE')
    }
  })

  it('keeps the honeypot and the rate limit that were already there', () => {
    /* A layer, never a replacement. */
    for (const f of ANONYMOUS) {
      const code = strip(READ(f))
      expect(code).toContain('rateLimited(')
      expect(code).toMatch(/website/)
    }
  })

  it('verifies after parsing and before doing the work', () => {
    for (const f of ANONYMOUS) {
      const code = strip(READ(f))
      expect(code.indexOf('await req.json()')).toBeLessThan(code.indexOf('verifyTurnstile('))
    }
  })
})

describe('and nothing else is challenged', () => {
  it('adds no challenge to an authenticated route', () => {
    /* Identity, authorisation and rate limiting are the controls there. */
    const offenders: string[] = []
    const stack = ['src/app/api']
    while (stack.length) {
      const dir = stack.pop()!
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const full = `${dir}/${e.name}`
        if (e.isDirectory()) { stack.push(full); continue }
        if (e.name !== 'route.ts') continue
        if (ANONYMOUS.includes(full)) continue
        if (strip(READ(full)).includes('verifyTurnstile')) offenders.push(full)
      }
    }
    expect(offenders).toEqual([])
  })

  it('adds no challenge to Ask Guneku', () => {
    /* Its 3-per-10-minutes limiter is the control, and there is no evidence of abuse to
       justify making a villager solve a puzzle to ask their own Fondom a question. */
    const ask = strip(READ('src/app/api/ask/route.ts'))
    expect(ask).not.toContain('verifyTurnstile')
    expect(ask).toContain("rateLimited('ask'")
  })

  it('adds no challenge to the indigenes registration journey', () => {
    /* It happens after a Clerk sign-in, so it is protected by identity rather than by a
       puzzle — the brief is explicit that a write action alone is not a reason. */
    for (const f of ['src/app/api/indigenes/profile/route.ts',
                     'src/app/api/claims/route.ts',
                     'src/app/api/follows/route.ts',
                     'src/app/api/contributions/route.ts']) {
      expect(strip(READ(f))).not.toContain('verifyTurnstile')
    }
  })
})

describe('the secret stays on the server', () => {
  it('is read only by the server-only verifier', () => {
    const offenders: string[] = []
    const stack = ['src']
    while (stack.length) {
      const dir = stack.pop()!
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const full = `${dir}/${e.name}`
        if (e.isDirectory()) { stack.push(full); continue }
        if (!/\.tsx?$/.test(e.name) || /\.test\.tsx?$/.test(e.name)) continue
        if (full === 'src/lib/turnstile.ts') continue
        if (strip(READ(full)).includes('TURNSTILE_SECRET_KEY')) offenders.push(full)
      }
    }
    expect(offenders).toEqual([])
    expect(READ('src/lib/turnstile.ts')).toContain("import 'server-only'")
  })

  it('gives the widget only the public key', () => {
    const widget = READ('src/components/forms/TurnstileField.tsx')
    expect(widget).toContain('NEXT_PUBLIC_TURNSTILE_SITE_KEY')
    expect(widget).not.toContain('TURNSTILE_SECRET_KEY')
  })

  it('logs no token, anywhere', () => {
    /* A token in a log is a token somebody else can replay. */
    for (const f of ['src/lib/turnstile.ts', 'src/components/forms/TurnstileField.tsx',
                     ...ANONYMOUS]) {
      const code = strip(READ(f))
      expect(code).not.toMatch(/console\.\w+\([^)]*(token|turnstile)/i)
    }
  })
})

describe('inert until armed, closed once armed', () => {
  const ENV = { ...process.env }
  beforeEach(() => { vi.resetModules() })
  afterEach(() => { process.env = { ...ENV } })

  it('passes everything through while no keys exist', async () => {
    delete process.env.TURNSTILE_SECRET_KEY
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    const { turnstileConfigured, verifyTurnstile } = await import('./turnstile')
    expect(turnstileConfigured()).toBe(false)
    /* The public forms must keep working today. */
    expect(await verifyTurnstile(undefined, 'contact')).toEqual({ ok: true, skipped: true })
  })

  it('needs both halves before it is armed', async () => {
    /* A public key with no secret renders a widget that nothing verifies — protection that
       only looks like protection, which is worse than none. */
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'site'
    delete process.env.TURNSTILE_SECRET_KEY
    const { turnstileConfigured } = await import('./turnstile')
    expect(turnstileConfigured()).toBe(false)
  })

  it('refuses a missing token once armed', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'site'
    const { verifyTurnstile } = await import('./turnstile')
    expect(await verifyTurnstile('', 'contact')).toEqual({ ok: false, reason: 'missing-token' })
    expect(await verifyTurnstile(undefined, 'contact'))
      .toEqual({ ok: false, reason: 'missing-token' })
  })

  it('refuses a token minted for another site or another form', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'site'
    const { verifyTurnstile } = await import('./turnstile')

    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true, json: async () => ({ success: true, hostname: 'evil.example', action: 'contact' }),
    })))
    expect(await verifyTurnstile('t', 'contact')).toEqual({ ok: false, reason: 'wrong-host' })

    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ success: true, hostname: 'www.guneku.org', action: 'contact' }),
    })))
    expect(await verifyTurnstile('t', 'palace-message'))
      .toEqual({ ok: false, reason: 'wrong-action' })
    vi.unstubAllGlobals()
  })

  it('fails closed when Cloudflare cannot be reached', async () => {
    /* A control that stops checking whenever a third party has a bad afternoon is not a
       control. The honeypot and rate limit are still standing behind it. */
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'site'
    const { verifyTurnstile } = await import('./turnstile')
    vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('network') }))
    expect(await verifyTurnstile('t', 'contact')).toEqual({ ok: false, reason: 'unreachable' })
    vi.unstubAllGlobals()
  })

  it('accepts a good token', async () => {
    process.env.TURNSTILE_SECRET_KEY = 'secret'
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = 'site'
    const { verifyTurnstile } = await import('./turnstile')
    vi.stubGlobal('fetch', vi.fn(async () => ({
      ok: true,
      json: async () => ({ success: true, hostname: 'www.guneku.org', action: 'contact' }),
    })))
    expect(await verifyTurnstile('t', 'contact')).toEqual({ ok: true, skipped: false })
    vi.unstubAllGlobals()
  })

  it('tells the visitor something useful and nothing about our configuration', async () => {
    const { TURNSTILE_MESSAGE } = await import('./turnstile')
    expect(TURNSTILE_MESSAGE).toMatch(/complete the check/i)
    expect(TURNSTILE_MESSAGE).not.toMatch(/secret|sitekey|site key|error code|cloudflare/i)
  })
})
