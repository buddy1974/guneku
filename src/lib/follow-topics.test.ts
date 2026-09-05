import { describe, it, expect } from 'vitest'
import {
  FOLLOW_TOPICS, isTopicId, getTopic, isFollowChoice, isCanonicalQuarter, MY_QUARTER,
} from './follow-topics'
import { GUNEKU_QUARTERS_27 } from './quarters'

/* The taxonomy is a closed list, and that is the whole point: a subscription is a standing
   instruction about what somebody wants to hear about, so an arbitrary string must never
   become one. */

describe('the approved taxonomy', () => {
  it('is the eight topics the Fondom settled on, and no others', () => {
    expect(FOLLOW_TOPICS.map(t => t.id)).toEqual([
      'palace', 'projects', 'education', 'gudeca',
      'culture', 'events', 'diaspora', 'guneku-tv',
    ])
  })

  it('gives every topic a label and a plain sentence', () => {
    for (const t of FOLLOW_TOPICS) {
      expect(t.label.length).toBeGreaterThan(0)
      expect(t.blurb.length).toBeGreaterThan(0)
    }
  })

  /* Culture and Events are things Guneku does and the site has no page for either. A route
     invented so the UI could show a link would be publishing a route to nothing. */
  it('carries no route for a topic the site has not published', () => {
    expect(getTopic('culture')?.route).toBeNull()
    expect(getTopic('events')?.route).toBeNull()
  })

  it('points the rest at real pages, always absolute', () => {
    for (const t of FOLLOW_TOPICS) {
      if (t.route === null) continue
      expect(t.route).toMatch(/^\//)
    }
  })
})

describe('what may be followed', () => {
  it.each(FOLLOW_TOPICS.map(t => t.id))('accepts the approved topic %s', id => {
    expect(isTopicId(id)).toBe(true)
    expect(isFollowChoice(id)).toBe(true)
  })

  it('accepts My quarter', () => {
    expect(isFollowChoice(MY_QUARTER)).toBe(true)
    /* But not as a topic: it is stored against a place, not against the string. */
    expect(isTopicId(MY_QUARTER)).toBe(false)
  })

  it.each([
    'palace-announcements', 'Palace', 'PALACE', 'sport', 'politics', '',
    'topic', 'quarter', '*', 'projects; DROP TABLE follows',
  ])('rejects the unapproved string %j', v => {
    expect(isFollowChoice(v)).toBe(false)
    expect(isTopicId(v)).toBe(false)
  })

  it.each([null, undefined, 0, 1, {}, [], true])('rejects the non-string %j', v => {
    expect(isFollowChoice(v)).toBe(false)
  })

  it('returns null from getTopic for anything unapproved', () => {
    expect(getTopic('nope')).toBeNull()
    expect(getTopic(null)).toBeNull()
  })
})

describe('quarters', () => {
  it.each([...GUNEKU_QUARTERS_27])('accepts the canonical quarter %s', q => {
    expect(isCanonicalQuarter(q)).toBe(true)
  })

  it('accepts exactly the twenty-seven the Fondom publishes', () => {
    expect(GUNEKU_QUARTERS_27.length).toBe(27)
  })

  /* A subscription to a place that does not exist is one nobody can ever deliver. */
  it.each([
    'Atlantis', 'njinigom', 'NJINIGOM', ' Njinigom', 'Njinigom ', '',
    'Other / Unknown', 'Bamenda', 'Yaoundé',
  ])('rejects the non-canonical quarter %j', v => {
    expect(isCanonicalQuarter(v)).toBe(false)
  })

  it.each([null, undefined, 42, {}])('rejects the non-string quarter %j', v => {
    expect(isCanonicalQuarter(v)).toBe(false)
  })
})
