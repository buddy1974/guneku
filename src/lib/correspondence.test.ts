import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import {
  CORRESPONDENCE_CATEGORIES, isCategory, CATEGORY_LABEL, categoryForTopic,
  CORRESPONDENCE_STATUSES, isStatus, isPalaceAction, ACTION_RESULT, canAct,
  STATUS_LABEL, STATUS_NOTE, RESPONSE_ATTRIBUTION,
  MAX, replyRecipient, subjectLine, DELIVERY_NOTE, type ReplyDelivery,
} from './correspondence'
import { PALACE_TOPICS } from '@/components/home/PalaceMessageModal'

describe('categories', () => {
  it('is a restrained closed set', () => {
    expect([...CORRESPONDENCE_CATEGORIES]).toEqual([
      'general-enquiry', 'palace-matter', 'community-matter', 'development-matter',
      'cultural-matter', 'information-request', 'other',
    ])
  })

  it('gives every category a label', () => {
    for (const c of CORRESPONDENCE_CATEGORIES) expect(CATEGORY_LABEL[c]).toBeTruthy()
  })

  /* No legal or government service categories were invented. */
  it('claims no legal or governmental function', () => {
    const text = Object.values(CATEGORY_LABEL).join(' ').toLowerCase()
    for (const word of ['legal', 'court', 'police', 'licence', 'permit', 'visa', 'tax',
                        'certificate', 'registry office', 'complaint tribunal']) {
      expect(text).not.toContain(word)
    }
  })

  it.each(['enquiry', 'Palace-Matter', '', 'admin', null, 7])('rejects %j', v => {
    expect(isCategory(v)).toBe(false)
  })
})

describe('the existing public form keeps working', () => {
  /* The modal's eleven topics have been in front of visitors for some time. Changing what a
     working public form offers, to suit a database column added afterwards, is the tail
     wagging the dog — so every one of them maps. */
  it.each([...PALACE_TOPICS])('maps the existing topic %j to a category', topic => {
    const category = categoryForTopic(topic)
    expect(isCategory(category)).toBe(true)
  })

  it('maps the obvious ones to the obvious place', () => {
    expect(categoryForTopic('Palace / traditional matters')).toBe('palace-matter')
    expect(categoryForTopic('Culture')).toBe('cultural-matter')
    expect(categoryForTopic('Project support')).toBe('development-matter')
    expect(categoryForTopic('General enquiry')).toBe('general-enquiry')
  })

  /* A topic the Palace has been accepting for months must not start failing because a
     mapping table is short. */
  it('files an unmapped topic under other rather than refusing it', () => {
    expect(categoryForTopic('Something nobody anticipated')).toBe('other')
    expect(categoryForTopic('')).toBe('other')
  })
})

describe('workflow', () => {
  it('has four states and no CRM pipeline', () => {
    expect([...CORRESPONDENCE_STATUSES]).toEqual(['received', 'in-review', 'responded', 'closed'])
    for (const v of ['assigned', 'escalated', 'triaged', 'PENDING', '']) {
      expect(isStatus(v)).toBe(false)
    }
  })

  it('rejects an invented action', () => {
    for (const v of ['delete', 'publish', 'RESPOND', 'assign', '', null]) {
      expect(isPalaceAction(v)).toBe(false)
    }
  })

  it('maps each acting verb to the state it produces', () => {
    expect(ACTION_RESULT).toEqual({
      'begin-review': 'in-review', 'respond': 'responded', 'close': 'closed',
    })
  })

  /* Recording a note is not a decision. A clerk jotting something down must not silently
     advance a letter towards closed. */
  it('does not give a note a resulting state', () => {
    expect(ACTION_RESULT).not.toHaveProperty('note')
  })

  it('allows review only from received', () => {
    expect(canAct('received', 'begin-review')).toBe(true)
    expect(canAct('in-review', 'begin-review')).toBe(false)
    expect(canAct('responded', 'begin-review')).toBe(false)
  })

  it('allows a reply before or during review', () => {
    expect(canAct('received', 'respond')).toBe(true)
    expect(canAct('in-review', 'respond')).toBe(true)
  })

  it('allows a note at any point up to closing', () => {
    for (const s of ['received', 'in-review', 'responded'] as const) {
      expect(canAct(s, 'note')).toBe(true)
    }
  })

  /* A closed letter is finished. Reopening it is a deliberate act for somebody with
     database access, not an API call. */
  it.each(['begin-review', 'respond', 'close', 'note'] as const)(
    'refuses %s on a closed letter', action => {
      expect(canAct('closed', action)).toBe(false)
    },
  )
})

describe('what the sender is told', () => {
  it('labels every state', () => {
    for (const s of CORRESPONDENCE_STATUSES) {
      expect(STATUS_LABEL[s]).toBeTruthy()
      expect(STATUS_NOTE[s]).toBeTruthy()
    }
  })

  it('says plainly that correspondence is private', () => {
    expect(STATUS_NOTE.received.toLowerCase()).toContain('not published')
  })

  /* Nobody has undertaken to reply within any period, so nothing promises one. */
  it('promises no response time', () => {
    const text = Object.values(STATUS_NOTE).join(' ').toLowerCase()
    for (const p of ['within', 'hours', 'business day', 'shortly', 'soon', 'we will reply']) {
      expect(text).not.toContain(p)
    }
  })
})

describe('the Palace answers as the Palace', () => {
  it('attributes a reply institutionally, never to the Fon', () => {
    expect(RESPONSE_ATTRIBUTION).toBe('The Guneku Palace')
    expect(RESPONSE_ATTRIBUTION.toLowerCase()).not.toContain('fon')
    expect(RESPONSE_ATTRIBUTION.toLowerCase()).not.toContain('hrh')
    expect(RESPONSE_ATTRIBUTION.toLowerCase()).not.toContain('fomuki')
  })
})

describe('answering by email — who may be written to', () => {
  it('accepts an ordinary address', () => {
    expect(replyRecipient('villager@example.com')).toBe('villager@example.com')
    expect(replyRecipient('  villager@example.com  ')).toBe('villager@example.com')
    expect(replyRecipient('a.b+tag@sub.example.co.uk')).toBe('a.b+tag@sub.example.co.uk')
  })

  it('returns null when there is nobody to write to, and that is not a failure', () => {
    /* Plenty of letters arrive with a callback number and no email at all. */
    for (const v of [null, undefined, '', '   ', 42, {}]) {
      expect(replyRecipient(v as never)).toBeNull()
    }
  })

  it('refuses anything that could turn one recipient into several', () => {
    /* The failure that matters: a mail API takes a comma-separated string, so a second
       address smuggled into the field would receive a stranger's private letter to their
       Fon. Rejected outright rather than split and cleaned up. */
    for (const v of [
      'a@b.com, attacker@evil.com',
      'a@b.com;attacker@evil.com',
      'Someone <a@b.com>',
      '"a"@b.com',
      'a@b.com attacker@evil.com',
    ]) {
      expect(replyRecipient(v)).toBeNull()
    }
  })

  it('refuses header injection', () => {
    for (const v of [
      'a@b.com\nBcc: attacker@evil.com',
      'a@b.com\r\nBcc: attacker@evil.com',
      'a@b.com\rSubject: nonsense',
    ]) {
      expect(replyRecipient(v)).toBeNull()
    }
  })

  it('refuses an address that is not one, and one that is absurdly long', () => {
    for (const v of ['not-an-address', 'a@b', '@b.com', 'a@.com', 'a@b.c']) {
      expect(replyRecipient(v)).toBeNull()
    }
    expect(replyRecipient('a'.repeat(MAX.email) + '@example.com')).toBeNull()
  })

  it('accepts exactly what the public form accepts', () => {
    /* Deliberately the same rule. A stricter one here would silently decline to answer
       somebody the form had already taken an address from. */
    const formRule = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    for (const v of ['villager@example.com', 'a.b+tag@sub.example.co.uk', 'x@y.org']) {
      expect(formRule.test(v)).toBe(true)
      expect(replyRecipient(v)).toBe(v)
    }
  })
})

describe('what the Palace is told about delivery', () => {
  it('names all three outcomes, and none of them loses the reply', () => {
    const outcomes: ReplyDelivery[] = ['sent', 'no-recipient', 'failed']
    for (const o of outcomes) expect(DELIVERY_NOTE[o]).toMatch(/recorded/)
    expect(DELIVERY_NOTE['failed']).toMatch(/Nothing was lost/)
    expect(DELIVERY_NOTE['no-recipient']).toMatch(/no email address/)
  })

  it('promises nothing to the sender that the Palace has not done', () => {
    /* The sender-facing status text is separate and stays as it was: "The Palace has
       answered." It says nothing about email, because a letter with no address is answered
       just as truly as one that was posted. */
    expect(STATUS_NOTE['responded']).not.toMatch(/email|sent to you|inbox/i)
  })
})

describe('a subject line carries no headers', () => {
  it('flattens newlines and tabs a person may have pasted', () => {
    expect(subjectLine('A matter\r\nBcc: attacker@evil.com')).toBe('A matter Bcc: attacker@evil.com')
    expect(subjectLine('one\ttwo   three')).toBe('one two three')
    expect(subjectLine('   trimmed   ')).toBe('trimmed')
  })

  it('is bounded', () => {
    expect(subjectLine('x'.repeat(500)).length).toBe(120)
    expect(subjectLine('x'.repeat(500), 40).length).toBe(40)
  })
})

describe('retention — R-039 is an owner policy, not an engineering gap', () => {
  const strip = (s: string) =>
    s.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')
  const sources = () => {
    const out: string[] = []
    const stack = ['src']
    while (stack.length) {
      const dir = stack.pop()!
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const full = `${dir}/${e.name}`
        if (e.isDirectory()) { stack.push(full); continue }
        if (!/\.(ts|tsx)$/.test(e.name) || /\.test\.tsx?$/.test(e.name)) continue
        out.push(full)
      }
    }
    return out
  }

  it('deletes no correspondence anywhere, by any route', () => {
    /* The whole guarantee. Nothing has been decided about how long Guneku keeps a
       villager's private letter, so nothing removes one — no cron, no purge, no expiry
       column, no destructive migration. Deciding by writing code would be deciding. */
    const offenders: string[] = []
    for (const f of sources()) {
      const code = strip(readFileSync(f, 'utf-8'))
      if (/DELETE\s+FROM\s+palace_correspondence/i.test(code)) offenders.push(f)
      if (/palace_correspondence[\s\S]{0,200}\bDROP\b/i.test(code)) offenders.push(f)
    }
    expect(offenders).toEqual([])
  })

  it('has no scheduled job of any kind', () => {
    /* A retention cron is the specific thing R-039 says must not exist until somebody has
       written a policy. This fails if one appears. */
    const offenders: string[] = []
    for (const f of sources()) {
      const code = strip(readFileSync(f, 'utf-8'))
      if (/\bcron\b|setInterval\(|node-schedule|node-cron/i.test(code)) offenders.push(f)
    }
    expect(offenders).toEqual([])
    expect(() => readFileSync('vercel.json', 'utf-8')).toThrow()
  })

  it('promises the sender no period it has not decided on', () => {
    /* "Deleted after 90 days" would be a policy invented by a sentence. The sender is told
       what is true — the letter is kept, privately, and nothing removes it automatically. */
    for (const f of [
      'src/components/home/PalaceMessageModal.tsx',
      'src/app/my-guneku/page.tsx',
    ]) {
      const text = readFileSync(f, 'utf-8')
      expect(text).not.toMatch(/deleted after|removed after|retained for \d|expires? (in|after)/i)
    }
    expect(readFileSync('src/components/home/PalaceMessageModal.tsx', 'utf-8'))
      .toMatch(/never published on Guneku\.org/)
    expect(readFileSync('src/app/my-guneku/page.tsx', 'utf-8'))
      .toMatch(/nothing is deleted automatically/i)
  })
})
