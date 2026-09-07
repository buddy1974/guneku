import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  HUMAN_CHECK_MESSAGE, HUMAN_CHECK_CODE,
  needsHumanCheck, humanCheckRejection,
  humanCheckReducer, initialHumanCheck, type HumanCheckState,
} from './human-check'

/* T-1: the human check failed silently.
 *
 * `/contact` enforced it, the server answered 400, and the page showed nothing — the submit
 * handler ended in `alert('Failed to send')`, which discarded the server's own message, and
 * the only text beside the widget still read "A quick check that you are a person" in a
 * polite live region that never changed. A visitor could press send again and again and
 * never learn why nothing happened.
 *
 * The lifecycle below is the fix, walked end to end. The rendering contract is asserted
 * after it, across all four anonymous surfaces. */

const READ = (p: string) => readFileSync(p, 'utf-8')
const strip = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')

const FORMS = {
  contact:   'src/app/contact/page.tsx',
  palace:    'src/components/home/PalaceMessageModal.tsx',
  support:   'src/app/support/SupportForm.tsx',
  directory: 'src/components/community/DirectoryForm.tsx',
}

/** Walk a sequence of events from the initial state, as a visitor would. */
const run = (...events: Parameters<typeof humanCheckReducer>[1][]): HumanCheckState =>
  events.reduce(humanCheckReducer, initialHumanCheck)

describe('1 · a missing check produces feedback rather than silence', () => {
  it('refuses to post when the check is armed and unsolved', () => {
    expect(needsHumanCheck(true, '')).toBe(true)
    expect(needsHumanCheck(true, '   ')).toBe(true)
  })

  it('says one sentence a person can act on', () => {
    expect(run({ type: 'blocked' }).error).toBe(HUMAN_CHECK_MESSAGE)
    expect(HUMAN_CHECK_MESSAGE).toBe('Please complete the human check before sending.')
  })

  it('changes nothing while the check is not armed', () => {
    /* Today, in Production. The forms must behave exactly as they did. */
    expect(needsHumanCheck(false, '')).toBe(false)
  })

  it('posts once the check is solved', () => {
    expect(needsHumanCheck(true, 'a-token')).toBe(false)
  })
})

describe('2 · the failure is announced, and the ordinary state is not', () => {
  const field = READ('src/components/forms/TurnstileField.tsx')

  it('puts the failure in an assertive region beside the widget', () => {
    expect(field).toContain('role="alert"')
    /* And the calm state stays polite: most visitors solve nothing and should not be
       interrupted to be told so. */
    expect(field).toContain('role="status"')
    expect(field).toContain('aria-live="polite"')
  })

  it('binds both states to the widget a screen-reader user lands on', () => {
    expect(field).toContain('aria-describedby={`${id}-state`}')
  })

  it('never shows the calm text while something is wrong', () => {
    /* The whole defect in one line: the polite paragraph kept saying "a quick check" while
       the submission was being refused. They are now branches of one conditional. */
    const code = strip(field)
    expect(code).toMatch(/\{failed \?/)
    expect(code.indexOf('role="alert"')).toBeLessThan(code.indexOf('role="status"'))
  })
})

describe('3 · what the visitor typed is not touched', () => {
  it('holds no form state in the check', () => {
    const state = run({ type: 'blocked' }, { type: 'rejected' })
    expect(Object.keys(state).sort()).toEqual(['error', 'resetKey', 'token'])
  })

  it('returns from the rejection path before any form is reset', () => {
    for (const [name, path] of Object.entries(FORMS)) {
      const code = strip(READ(path))
      const at = code.indexOf('human.rejected(data)')
      expect(at, name).toBeGreaterThan(-1)
      /* Nothing between the refusal and the return that leaves the handler. The window ends
         at that `return` on purpose — past it is the success path, which of course sets
         things, and reading into it would be measuring the wrong code. */
      const tail = code.slice(at)
      const between = tail.slice(0, tail.indexOf('return') + 'return'.length)
      expect(between, name).toContain('return')
      expect(between, name).not.toMatch(/setForm\(|\.reset\(|setSent\(/)
    }
  })
})

describe('4 · the visitor can solve it and try again', () => {
  it('hands back a fresh challenge after a refusal, because a token is single-use', () => {
    const after = run({ type: 'token', token: 't1' }, { type: 'rejected' })
    expect(after.token).toBe('')
    expect(after.resetKey).toBe(1)
    expect(after.error).toBe(HUMAN_CHECK_MESSAGE)
  })

  it('clears the complaint the moment a new token arrives', () => {
    const after = run({ type: 'blocked' }, { type: 'token', token: 't2' })
    expect(after.error).toBeNull()
    expect(after.token).toBe('t2')
    expect(needsHumanCheck(true, after.token)).toBe(false)
  })

  it('keeps the message when the token is lost rather than gained', () => {
    /* Expiry clears the token; it must not also clear the reason the visitor is stuck. */
    const after = run({ type: 'blocked' }, { type: 'token', token: '' })
    expect(after.error).toBe(HUMAN_CHECK_MESSAGE)
  })

  it('re-arms once per refusal, so repeated failures each get a new challenge', () => {
    const after = run(
      { type: 'token', token: 'a' }, { type: 'rejected' },
      { type: 'token', token: 'b' }, { type: 'rejected' },
    )
    expect(after.resetKey).toBe(2)
  })
})

describe('5 · a successful send clears the complaint', () => {
  it('leaves nothing announced behind it', () => {
    const after = run({ type: 'blocked' }, { type: 'token', token: 't' }, { type: 'cleared' })
    expect(after.error).toBeNull()
  })

  it('is cleared by every form on success', () => {
    for (const [name, path] of Object.entries(FORMS)) {
      const code = strip(READ(path))
      expect(code, name).toContain('human.clear()')
      expect(code.indexOf('human.clear()'), name).toBeLessThan(code.indexOf('setSent(true)'))
    }
  })
})

describe('6 · all four anonymous forms behave the same way', () => {
  it('uses the one shared boundary, not four hand-rolled ones', () => {
    for (const [name, path] of Object.entries(FORMS)) {
      const code = strip(READ(path))
      expect(code, name).toContain("useTurnstile(")
      expect(code, name).toContain('<TurnstileField {...human.field} />')
    }
  })

  it('refuses before the network on every one of them', () => {
    for (const [name, path] of Object.entries(FORMS)) {
      const code = strip(READ(path))
      expect(code, name).toContain('if (!human.ready()) return')
      expect(code.indexOf('if (!human.ready()) return'), name)
        .toBeLessThan(code.indexOf('await fetch('))
    }
  })

  it('shows every other failure in an assertive region too', () => {
    /* Including `/contact`, which had no error element at all and used `alert()`. */
    for (const [name, path] of Object.entries(FORMS)) {
      expect(READ(path), name).toContain('role="alert"')
      expect(strip(READ(path)), name).not.toContain('alert(')
    }
  })

  it('recognises the refusal by code, not by matching the sentence', () => {
    expect(humanCheckRejection({ code: HUMAN_CHECK_CODE })).toBe(HUMAN_CHECK_MESSAGE)
    expect(humanCheckRejection({ code: HUMAN_CHECK_CODE, error: 'Please do the check.' }))
      .toBe('Please do the check.')
    /* Anything else belongs to the caller's ordinary error path. */
    for (const body of [{}, null, undefined, { error: 'All fields required' },
                        { code: 'something-else' }]) {
      expect(humanCheckRejection(body)).toBeNull()
    }
  })

  it('never repeats a provider detail back to the visitor', () => {
    /* The routes send only our own sentence, and this is the last place that could leak one
       if that ever changed. */
    for (const leak of [
      'invalid-input-secret', 'Cloudflare siteverify failed', 'timeout-or-duplicate',
      'Turnstile error 400', 'bad sitekey',
    ]) {
      expect(humanCheckRejection({ code: HUMAN_CHECK_CODE, error: leak }))
        .toBe(HUMAN_CHECK_MESSAGE)
    }
  })
})

describe('7–9 · the controls that were already there are still there', () => {
  const ROUTES = [
    'src/app/api/palace-message/route.ts',
    'src/app/api/contact/route.ts',
    'src/app/api/support-interest/route.ts',
    'src/app/api/community/register/route.ts',
  ]

  it('keeps every honeypot', () => {
    for (const r of ROUTES) expect(strip(READ(r)), r).toMatch(/\bwebsite\b/)
    for (const [name, path] of Object.entries(FORMS)) {
      expect(READ(path), name).toContain('name="website"')
    }
  })

  it('keeps every rate limit', () => {
    for (const r of ROUTES) expect(strip(READ(r)), r).toContain('rateLimited(')
  })

  it('keeps the secret on the server', () => {
    expect(READ('src/lib/turnstile.ts')).toContain("import 'server-only'")
    for (const f of ['src/components/forms/TurnstileField.tsx',
                     'src/components/forms/useTurnstile.ts',
                     'src/components/forms/human-check.ts',
                     ...Object.values(FORMS)]) {
      expect(READ(f), f).not.toContain('TURNSTILE_SECRET_KEY')
    }
  })

  it('logs no token from any of the four forms', () => {
    for (const [name, path] of Object.entries(FORMS)) {
      expect(strip(READ(path)), name).not.toMatch(/console\.\w+\([^)]*(token|turnstile)/i)
    }
  })
})
