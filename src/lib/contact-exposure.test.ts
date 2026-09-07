import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { PALACE_PHONE, PALACE_EMAIL } from './palace-contact'
import config from '@/data/site-config.json'

/* Whose address is published, where, and how many times.
 *
 * Two different questions, and the acceptance pass turned up one of each. A **personal**
 * address was reaching browsers that nobody meant to send it to; an **institutional** one
 * was published two hundred times when once would do. The first is a privacy defect. The
 * second is a harvesting surface. Neither is fixed by obfuscating anything. */

const READ = (p: string) => readFileSync(p, 'utf-8')

function sourceFiles(exts = /\.(ts|tsx|json)$/): string[] {
  const out: string[] = []
  const stack = ['src']
  while (stack.length) {
    const dir = stack.pop()!
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = `${dir}/${e.name}`
      if (e.isDirectory()) { stack.push(full); continue }
      if (!exts.test(e.name) || /\.test\.tsx?$/.test(e.name)) continue
      out.push(full)
    }
  }
  return out
}

describe('no personal address is anywhere the site can publish it', () => {
  it('carries the Fon’s personal address in no record at all', () => {
    /* It was in site-config.json and in the Fon's profile, read by nothing, and it reached a
       public JavaScript chunk on /contact because a client component imported the whole of
       site-config.json for one telephone number. A JSON import in a client module ships
       every field of the file, whichever field the component reads. */
    const offenders = sourceFiles()
      .filter(f => /wfomuki@gmx\.de/i.test(READ(f)))
    expect(offenders).toEqual([])
  })

  it('declares no fonEmail field to be filled in again', () => {
    expect(JSON.stringify(config)).not.toContain('fonEmail')
    expect(READ('src/lib/content.ts')).not.toContain('fonEmail')
  })

  it('publishes no personal address of any officer', () => {
    /* Institutional addresses are fine and deliberate. A personal one on a free mail
       provider is somebody's own, and it does not belong to the Fondom to publish. */
    const personal = /@(gmx|gmail|yahoo|hotmail|outlook|icloud|proton|web)\.[a-z.]{2,}/i
    const offenders: string[] = []
    for (const f of sourceFiles()) {
      for (const m of READ(f).match(personal) ?? []) offenders.push(`${f}: ${m}`)
    }
    expect(offenders).toEqual([])
  })
})

describe('the institutional address is published once, not two hundred times', () => {
  it('is the address the record holds', () => {
    expect(PALACE_EMAIL).toBe(config.contactEmail)
    expect(PALACE_PHONE).toBe(config.palacePhone)
  })

  it('is not in the footer, which put it on every page of the site', () => {
    /* Comments stripped: the footer explains in prose that the address used to be a
       `mailto:` here, and a check matching that prose would fail on the note recording the
       fix. JSX comments are `/* *\/` inside braces, so the same strip catches them. */
    const footer = READ('src/components/layout/Footer.tsx')
      .replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')
    expect(footer).not.toContain('mailto:')
    expect(footer).not.toContain('contactEmail')
    /* Still reachable from every page — the link is simply to the page that publishes it. */
    expect(footer).toContain('/contact')
    /* The telephone stays: it is what most of this audience uses, and a number is not
       harvested the way an address is. */
    expect(footer).toContain('palacePhone')
  })

  it('is a real, readable, clickable address on the page that publishes it', () => {
    /* No character-shuffling, no base64, no image. Each of those costs a screen-reader user
       real access and costs a scraper about a second, which is the wrong trade — and the
       brief is explicit that obfuscation is a spam-reduction measure and never a security
       boundary. */
    const contact = READ('src/app/contact/page.tsx')
    expect(contact).toContain('mailto:${PALACE_EMAIL}')
    for (const trick of ['atob(', 'btoa(', 'split("").reverse', 'String.fromCharCode']) {
      expect(contact).not.toContain(trick)
    }
  })
})

describe('a client component cannot carry a record it does not read', () => {
  it('gets the two published values as constants, not the whole config', () => {
    const contact = READ('src/app/contact/page.tsx')
    expect(contact).toContain("from '@/lib/palace-contact'")
    expect(contact).not.toContain("from '@/data/site-config.json'")
  })

  it('imports no site record into any client module', () => {
    /* The shape of the leak, guarded. A `'use client'` file importing a whole JSON record
       ships all of it — including whatever field somebody adds next. */
    const offenders: string[] = []
    for (const f of sourceFiles(/\.tsx?$/)) {
      const text = READ(f)
      if (!/^['"]use client['"]/m.test(text)) continue
      const code = text.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')
      if (/from ['"]@\/data\/site-config\.json['"]/.test(code)) offenders.push(f)
    }
    expect(offenders).toEqual([])
  })

  it('keeps no secret in the module a browser can read', () => {
    const mod = READ('src/lib/palace-contact.ts')
    for (const s of ['process.env.EMAIL_ADMIN', 'process.env.EMAIL_BCC',
                     'RESEND_API_KEY', 'TURNSTILE_SECRET_KEY']) {
      expect(mod).not.toContain(s)
    }
  })
})

describe('no provider or private address is reachable from the public site', () => {
  it('names EMAIL_ADMIN, EMAIL_BCC and the mail key only where they belong', () => {
    /* The mailer is `server-only` and is the one module allowed to read them. */
    const offenders: string[] = []
    for (const f of sourceFiles(/\.tsx?$/)) {
      if (f === 'src/lib/email/send.ts') continue
      const code = READ(f).replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')
      for (const s of ['EMAIL_ADMIN', 'EMAIL_BCC', 'RESEND_API_KEY']) {
        if (code.includes(s)) offenders.push(`${f}: ${s}`)
      }
    }
    expect(offenders).toEqual([])
    expect(existsSync('src/lib/email/send.ts')).toBe(true)
    expect(READ('src/lib/email/send.ts')).toContain("import 'server-only'")
  })
})
