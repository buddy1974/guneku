import { describe, it, expect } from 'vitest'
import { aiSources, isAiVisible, sourceBreakdown } from './ai-sources'
import { GUNEKU_QUARTERS_27 } from './quarters'

const SOURCES = aiSources()
const ALL_TEXT = JSON.stringify(SOURCES)

describe('the boundary is populated from real public records', () => {
  it('has sources', () => {
    expect(SOURCES.length).toBeGreaterThan(50)
  })

  it('covers every kind of public record', () => {
    const types = new Set(sourceBreakdown().map(b => b.type))
    for (const t of ['update', 'palace', 'institution', 'person', 'project', 'quarter', 'chapter']) {
      expect(types.has(t as never)).toBe(true)
    }
  })

  it('includes all twenty-seven quarters', () => {
    for (const q of GUNEKU_QUARTERS_27) {
      expect(SOURCES.some(s => s.title === `${q} quarter`)).toBe(true)
    }
  })
})

describe('every source is publicly readable', () => {
  it('points only at site-relative public paths', () => {
    for (const s of SOURCES) {
      expect(s.url.startsWith('/')).toBe(true)
      expect(s.url.startsWith('//')).toBe(false)
      expect(s.url).not.toMatch(/^https?:/)
      expect(s.url).not.toMatch(/javascript:/i)
    }
  })

  it('passes its own visibility predicate', () => {
    for (const s of SOURCES) expect(isAiVisible(s)).toBe(true)
  })

  it('rejects anything that is not a site-relative path', () => {
    const base = SOURCES[0]
    for (const url of ['https://evil.example.com', '//evil.example.com', 'javascript:alert(1)', 'relative']) {
      expect(isAiVisible({ ...base, url })).toBe(false)
    }
  })

  it('never carries a repository path or a data filename', () => {
    expect(ALL_TEXT).not.toMatch(/src\/data/)
    expect(ALL_TEXT).not.toMatch(/\.json/)
    expect(ALL_TEXT).not.toMatch(/node_modules/)
  })

  it('caps every piece of evidence', () => {
    for (const s of SOURCES) expect(s.text.length).toBeLessThanOrEqual(701)
  })
})

describe('held and private records are excluded', () => {
  /* The Business Directory is withheld pending a consent review. It is excluded here
     because `visibility.ts` excludes it — the same predicate the sitemap uses — not
     because this module remembers to filter it. */
  it('excludes the held Business Directory', () => {
    expect(ALL_TEXT.toLowerCase()).not.toContain('business directory')
    for (const s of SOURCES) expect(s.url).not.toContain('business-directory')
  })

  it('carries no member, correspondence, contribution or claim data', () => {
    /* Column and table identifiers, not English words. "follows" and "contributions" occur
       naturally in the records' own prose — testing for them as substrings would fail on a
       sentence about what a chapter contributes, which proves nothing about privacy. */
    for (const identifier of [
      'clerk_user_id', 'sender_email', 'sender_phone', 'internal_note', 'reviewed_by',
      'handled_by', 'palace_correspondence', 'profile_claims', 'community_members',
      'indigene_profiles', 'schema_migrations',
    ]) {
      expect(ALL_TEXT).not.toContain(identifier)
    }
  })

  it('carries no Clerk user id', () => {
    /* The shape of one, rather than the prefix — "user_" alone would match prose. */
    expect(ALL_TEXT).not.toMatch(/user_[A-Za-z0-9]{8,}/)
  })

  it('carries no environment value or secret shape', () => {
    for (const forbidden of [
      'ANTHROPIC_API_KEY', 'sk-ant', 'DATABASE_URL', 'postgres://',
      'CLERK_SECRET', 'sk_live', 'RESEND_API_KEY', 're_', 'MIGRATE_TOKEN',
    ]) {
      expect(ALL_TEXT).not.toContain(forbidden)
    }
  })

  /* The Fondom's own published contact details are deliberately present — they are printed
     on the contact page for this purpose. No individual's is. */
  it('carries the Fondom’s published contact details and no personal ones', () => {
    expect(ALL_TEXT).toContain('info@guneku.org')

    const emails = ALL_TEXT.match(/[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? []
    for (const e of emails) expect(e).toBe('info@guneku.org')

    /* Exactly one telephone number: the Palace's own. */
    const phones = new Set(ALL_TEXT.match(/\+\d[\d\s()-]{7,}/g) ?? [])
    expect(phones.size).toBeLessThanOrEqual(1)
  })
})

describe('the module cannot reach a database', () => {
  /* Structural, not careful: the assistant's source of truth imports no db module, so no
     amount of prompt or retrieval work can surface a member's private record. */
  it('imports no database module and makes no query', async () => {
    const { readFileSync } = await import('node:fs')
    const src = readFileSync(new URL('./ai-sources.ts', import.meta.url), 'utf-8')
      .replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')

    expect(src).not.toMatch(/from '\.\/db\//)
    expect(src).not.toMatch(/@\/lib\/db/)
    expect(src).not.toMatch(/\bsql`/)
  })

  it('the assistant itself imports no database module either', async () => {
    const { readFileSync } = await import('node:fs')
    const src = readFileSync(new URL('./palace-ai.ts', import.meta.url), 'utf-8')
      .replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')

    expect(src).not.toMatch(/@\/lib\/db|from '\.\/db\//)
    expect(src).not.toMatch(/requireUser|optionalUser|requireRole/)
  })
})
