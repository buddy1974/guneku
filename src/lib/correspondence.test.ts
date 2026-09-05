import { describe, it, expect } from 'vitest'
import {
  CORRESPONDENCE_CATEGORIES, isCategory, CATEGORY_LABEL, categoryForTopic,
  CORRESPONDENCE_STATUSES, isStatus, isPalaceAction, ACTION_RESULT, canAct,
  STATUS_LABEL, STATUS_NOTE, RESPONSE_ATTRIBUTION,
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
