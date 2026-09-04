import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

/* Nothing in this repository's migration path may be destructive.
 *
 * The runner applies statements one HTTP request at a time and cannot wrap a file in a
 * transaction, so a migration that fails halfway leaves what came before it applied. That is
 * survivable only because every statement is additive and idempotent — and "only because" is
 * exactly the kind of assumption that quietly stops being true. So it is asserted here, over
 * every migration file, on every test run.
 *
 * If a migration ever genuinely needs to drop or rewrite something, this test should fail and
 * the change should go to a human, not through this runner. */

const DIR = dirname(fileURLToPath(import.meta.url))

const FILES = readdirSync(DIR).filter(f => f.endsWith('.sql')).sort()

/** SQL with comments removed: `-- DROP` in prose must not fail the suite, and a real DROP
 *  must not hide behind a comment marker either. */
function code(sql: string): string {
  return sql.replace(/--[^\n]*/g, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ')
}

describe('the migration set', () => {
  it('has files to check', () => {
    expect(FILES.length).toBeGreaterThan(0)
  })

  it('includes the profile-claims migration', () => {
    expect(FILES).toContain('0002_profile_claims.sql')
  })
})

describe.each(FILES)('%s', file => {
  const sql = code(readFileSync(join(DIR, file), 'utf-8'))

  it.each([
    ['DROP',     /\bDROP\b/i],
    ['TRUNCATE', /\bTRUNCATE\b/i],
    ['DELETE',   /\bDELETE\s+FROM\b/i],
    ['UPDATE',   /\bUPDATE\s+\w/i],
    ['ALTER',    /\bALTER\s+TABLE\b/i],
  ])('contains no %s', (_name, pattern) => {
    expect(sql).not.toMatch(pattern)
  })

  it('creates things and only creates things', () => {
    const statements = sql.split(';').map(s => s.trim()).filter(Boolean)
    for (const s of statements) {
      expect(s.toUpperCase()).toMatch(/^CREATE\b/)
    }
  })

  /* Re-running must apply nothing. The runner records what it has applied, but a migration
     that is also idempotent survives a half-applied file being retried after a fix. */
  it('is idempotent — every CREATE says IF NOT EXISTS', () => {
    const creates = sql.match(/CREATE\s+(?:UNIQUE\s+)?(?:TABLE|INDEX)[\s\S]*?(?=\(|ON\s)/gi) ?? []
    expect(creates.length).toBeGreaterThan(0)
    for (const c of creates) {
      expect(c.toUpperCase()).toContain('IF NOT EXISTS')
    }
  })

  it('never writes to a table holding an authoritative Guneku record', () => {
    /* The people records live in reviewed JSON. No migration has any business naming one. */
    expect(sql).not.toMatch(/founding_names|notables|royal_family|people\b/i)
  })
})

describe('0002_profile_claims.sql specifically', () => {
  const sql = code(readFileSync(join(DIR, '0002_profile_claims.sql'), 'utf-8'))

  it('constrains the status column to the four workflow states', () => {
    expect(sql).toMatch(/CHECK\s*\(\s*status\s+IN\s*\(\s*'pending',\s*'approved',\s*'rejected',\s*'withdrawn'\s*\)\s*\)/i)
  })

  it('stops a member accumulating live claims on one record', () => {
    expect(sql).toMatch(/UNIQUE INDEX[\s\S]*?profile_claims\s*\(clerk_user_id, person_slug\)[\s\S]*?WHERE status IN \('pending', 'approved'\)/i)
  })

  it('stops one record being approved to two members', () => {
    expect(sql).toMatch(/UNIQUE INDEX[\s\S]*?profile_claims\s*\(person_slug\)[\s\S]*?WHERE status = 'approved'/i)
  })

  it('holds a pointer to the record, never a copy of it', () => {
    expect(sql).toMatch(/person_slug\s+TEXT NOT NULL/i)
    /* No foreign key, and no copied biography: the register is upstream of this table. */
    expect(sql).not.toMatch(/REFERENCES/i)
    expect(sql).not.toMatch(/\b(biography|bio|office|role|notable|royal)\s+TEXT/i)
  })
})
