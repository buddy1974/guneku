import { describe, it, expect } from 'vitest'
import {
  ANNOUNCEABLE, isAnnounceable, NEVER_ANNOUNCE, NOT_BUILT, SEND_BLOCKERS,
  parseAudience, subjectFor, audienceLabel, allAudiences,
  reachability, usableAddress, recipientList,
} from './notify'
import { FOLLOW_TOPICS } from './follow-topics'
import { GUNEKU_QUARTERS_27 } from './quarters'
import { readFileSync, readdirSync } from 'node:fs'

describe('an audience is a published topic or a canonical quarter, and nothing else', () => {
  it('accepts the eight topics', () => {
    for (const t of FOLLOW_TOPICS) {
      expect(parseAudience(t.id)).toEqual({ kind: 'topic', topic: t.id })
    }
  })

  it('accepts a canonical quarter, and only a canonical one', () => {
    expect(parseAudience(GUNEKU_QUARTERS_27[0]))
      .toEqual({ kind: 'quarter', quarter: GUNEKU_QUARTERS_27[0] })
    /* A quarter name the register does not carry is not an audience. Inventing one would let
       a caller create parts of Guneku that do not exist. */
    for (const v of ['Njinebai', 'Nowhere', '', null, 42, {}, 'topic']) {
      expect(parseAudience(v as never)).toBeNull()
    }
  })

  it('offers exactly 8 topics and 27 quarters', () => {
    const all = allAudiences()
    expect(all.filter(a => a.kind === 'topic')).toHaveLength(8)
    expect(all.filter(a => a.kind === 'quarter')).toHaveLength(27)
  })

  it('maps onto the follows table that already exists', () => {
    /* ('topic', id) and ('quarter', name) — both already permitted by the CHECK constraint
       in migration 0001. No migration was needed for this phase and none was written. */
    for (const a of allAudiences()) {
      const s = subjectFor(a)
      expect(['topic', 'quarter']).toContain(s.type)
      expect(s.id.length).toBeGreaterThan(0)
    }
  })

  it('labels an audience in words a Palace clerk would use', () => {
    expect(audienceLabel({ kind: 'topic', topic: 'palace' })).toBe('Palace announcements')
    expect(audienceLabel({ kind: 'quarter', quarter: GUNEKU_QUARTERS_27[0] }))
      .toBe(`${GUNEKU_QUARTERS_27[0]} quarter`)
  })
})

describe('only published content may be announced', () => {
  it('is a closed set', () => {
    expect([...ANNOUNCEABLE]).toEqual(['update', 'project', 'film', 'page'])
    for (const v of ['contribution', 'claim', 'correspondence', 'member', 'note', '', null]) {
      expect(isAnnounceable(v as never)).toBe(false)
    }
  })

  it('names what must never be announced, rather than leaving it implicit', () => {
    const text = NEVER_ANNOUNCE.join(' | ')
    for (const must of [
      'contribution', 'claim', 'correspondence', 'internal note',
      'private profile', 'held film', 'staged archive', 'unpublished',
    ]) {
      expect(text.toLowerCase()).toContain(must.toLowerCase())
    }
  })
})

describe('who can actually be written to', () => {
  it('accepts an ordinary address', () => {
    expect(usableAddress('member@example.com')).toBe('member@example.com')
    expect(usableAddress('  member@example.com ')).toBe('member@example.com')
  })

  it('refuses an absent, malformed or injected address', () => {
    for (const v of [
      null, undefined, '', '   ', 'not-an-address', 'a@b',
      'a@b.com, attacker@evil.com', 'a@b.com;x@y.com', 'A <a@b.com>',
      'a@b.com\nBcc: attacker@evil.com', 'a@b.com\r\nSubject: x',
    ]) {
      expect(usableAddress(v as never)).toBeNull()
    }
  })

  it('counts the unreachable rather than dropping them quietly', () => {
    /* A clerk told "34 follow Projects" who reaches 11 has been misled by their own screen.
       Told "34 follow this, 11 gave an address", they know what they are looking at. */
    const rows = [
      { email: 'a@example.com' }, { email: null },
      { email: 'not-an-address' }, { email: 'b@example.com' },
    ]
    expect(reachability(rows)).toEqual({ followers: 4, withEmail: 2, withoutEmail: 2 })
  })

  it('writes once to an address two accounts share', () => {
    const rows = [
      { email: 'family@example.com' }, { email: 'FAMILY@example.com' },
      { email: 'other@example.com' }, { email: null },
    ]
    expect(recipientList(rows)).toEqual(['family@example.com', 'other@example.com'])
  })
})

describe('nothing sends, and the reason is written down', () => {
  /* Comments stripped for every check that is about code. These files explain in prose the
     things they must not do — "no moderation table is reachable", "nothing here sends" — and
     a check matching that prose would fail on the very sentence documenting the guarantee. */
  const strip = (s: string) =>
    s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')

  it('names both blockers and what each needs', () => {
    expect(SEND_BLOCKERS).toHaveLength(2)
    const text = JSON.stringify(SEND_BLOCKERS)
    expect(text).toContain('EMAIL_FROM')
    expect(text).toMatch(/SPF and DKIM/)
    expect(text).toMatch(/migration/)
  })

  it('has no mailer anywhere in the notification path', () => {
    /* The guarantee, asserted rather than assumed: neither the rules nor the reader nor the
       page can send. A send arrives when somebody deliberately adds one, and this test is
       what they will have to change first. */
    for (const f of [
      'src/lib/notify.ts',
      'src/lib/db/notifications.ts',
      'src/app/review/notify/page.tsx',
    ]) {
      const code = strip(readFileSync(f, 'utf-8'))
      expect(code).not.toContain('@/lib/email')
      expect(code).not.toContain('resend')
      expect(code).not.toMatch(/\bsend[A-Z]\w*\(/)
    }
  })

  it('writes no row from the notification reader', () => {
    const code = readFileSync('src/lib/db/notifications.ts', 'utf-8')
    expect(code).not.toMatch(/\b(INSERT|UPDATE|DELETE|DROP|ALTER)\b/)
  })

  it('reads only follows and community_members', () => {
    /* No moderation table is reachable from an audience query. A notification list is built
       from two facts: somebody asked to hear, and they gave an address. */
    /* Comments stripped first. The file explains in prose that claims, contributions and
       correspondence are unreachable from here, and a check that matched that prose would
       fail on the very sentence documenting the guarantee. */
    const code = strip(readFileSync('src/lib/db/notifications.ts', 'utf-8'))
    for (const table of [
      'profile_claims', 'contributions', 'palace_correspondence', 'indigene_profiles',
    ]) {
      expect(code).not.toContain(table)
    }
    expect(code).toContain('FROM follows f')
    expect(code).toContain('community_members')
  })

  it('states what is deliberately not being built', () => {
    const text = NOT_BUILT.join(' | ').toLowerCase()
    for (const x of ['newsletter', 'digest', 'broadcast', 'marketing', 'push']) {
      expect(text).toContain(x)
    }
  })
})

describe('the Palace preflight shows counts, never people', () => {
  const page = readFileSync('src/app/review/notify/page.tsx', 'utf-8')

  it('requires palace-admin, and turns a reviewer away like a member', () => {
    expect(page).toContain("atLeast(user.role, 'palace-admin')")
    expect(page).toContain("redirect('/my-guneku')")
  })

  it('is never indexed', () => {
    expect(page).toMatch(/robots:\s*\{\s*index:\s*false/)
  })

  it('renders no address and no member name', () => {
    /* What somebody follows is private. A screen listing who follows Palace announcements
       would turn a private preference into a roster. */
    expect(page).not.toMatch(/\brow\.email\b|\.email\}/)
    expect(page).not.toMatch(/display_name|displayName/)
    expect(page).toContain('with_email')
  })

  it('is a page and not a route — there is no notification endpoint', () => {
    const apiDirs = readdirSync('src/app/api', { withFileTypes: true })
      .filter(e => e.isDirectory()).map(e => e.name)
    for (const forbidden of ['notify', 'notifications', 'broadcast', 'campaign']) {
      expect(apiDirs).not.toContain(forbidden)
    }
  })
})
