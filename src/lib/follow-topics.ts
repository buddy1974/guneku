import { GUNEKU_QUARTERS_27 } from './quarters'

/* What a member may choose to follow, and nothing else.
 *
 * This is a closed list. A subscription is a standing instruction to the Fondom about what
 * somebody wants to hear about, so an arbitrary string arriving in a request body must never
 * become one — that would let a caller invent parts of village life that do not exist, and
 * fill the table with targets nobody can ever publish to.
 *
 * It is also deliberately NOT a social graph. Nobody follows a person here, there are no
 * follower counts, and who follows what is private. The nine entries below are the product
 * taxonomy the Fondom settled on, and adding a tenth is a decision about Guneku rather than
 * a refactor.
 *
 * ── The storage this maps onto ───────────────────────────────────────────────────────────
 *
 * `follows` already exists, from migration 0001, with exactly the shape this needs:
 *
 *   subject_type  CHECK IN ('project','topic','quarter','event','institution')
 *   subject_id    TEXT
 *   UNIQUE (clerk_user_id, subject_type, subject_id)
 *
 * So the eight named topics are stored as ('topic', <id>) and My quarter as
 * ('quarter', <the member's canonical quarter>). No migration is required for this phase,
 * and none was written. The UNIQUE constraint is what makes following idempotent at the
 * database rather than in a handler that remembers to check.
 *
 * `subject_type` 'project' and 'event' are left alone. They are for following one specific
 * project or one specific event later; the categories "Projects" and "Events" here are
 * topics, and conflating the two would make "following Projects" and "following the water
 * project" indistinguishable in the same column. */

export type TopicId =
  | 'palace' | 'projects' | 'education' | 'gudeca'
  | 'culture' | 'events' | 'diaspora' | 'guneku-tv'

export type Topic = {
  id: TopicId
  label: string
  /** One plain sentence about what following it would mean. */
  blurb: string
  /** Where to read about it today, or null where the Fondom has not published a page yet.
   *  Null is honest: Culture and Events are things Guneku does, and neither has a page on
   *  this site. A member may still say they want to hear about them; inventing /culture and
   *  /events so the UI could show a link would be publishing a route to nothing. */
  route: string | null
}

export const FOLLOW_TOPICS: readonly Topic[] = [
  {
    id: 'palace', label: 'Palace announcements',
    blurb: 'Word from the Fon and the Palace.',
    route: '/palace',
  },
  {
    id: 'projects', label: 'Projects',
    blurb: 'Work under way in the village, and what it needs.',
    route: '/projects',
  },
  {
    id: 'education', label: 'Education',
    blurb: 'Schools, scholarships and the education fund.',
    route: '/education',
  },
  {
    id: 'gudeca', label: 'GUDECA',
    blurb: 'The development association, at home and in the chapters.',
    route: '/gudeca',
  },
  {
    id: 'culture', label: 'Culture',
    blurb: 'Custom, language and the traditions of the Fondom.',
    route: null,
  },
  {
    id: 'events', label: 'Events',
    blurb: 'Gatherings, meetings and dates worth knowing.',
    route: null,
  },
  {
    id: 'diaspora', label: 'Diaspora',
    blurb: 'Sons and daughters of Guneku living outside Cameroon.',
    route: '/diaspora',
  },
  {
    id: 'guneku-tv', label: 'Guneku TV',
    blurb: 'New film and video from the village.',
    route: '/watch',
  },
] as const

const TOPIC_IDS = new Set<string>(FOLLOW_TOPICS.map(t => t.id))

export function isTopicId(v: unknown): v is TopicId {
  return typeof v === 'string' && TOPIC_IDS.has(v)
}

export function getTopic(id: unknown): Topic | null {
  return isTopicId(id) ? FOLLOW_TOPICS.find(t => t.id === id) ?? null : null
}

/* ── My quarter ──────────────────────────────────────────────────────────────────────────
 *
 * Not a ninth topic in the list above, because it is not one subscription — it is a
 * subscription to a *place*, and which place depends on the member. It is stored as
 * ('quarter', <their quarter>) so that the Fondom can later address the people of one
 * quarter without also having to hold a separate table of who lives where.
 *
 * The quarter is read from the member's own `community_members` row, server-side. It is
 * never taken from a request body, and it is never inferred — not from a name, not from a
 * chapter, not from a country. A member who has not told us their quarter is asked to set
 * it in My Guneku, and until they do, this cannot be followed. Guessing which of the 27
 * quarters somebody belongs to would be inventing a fact about them. */
export const MY_QUARTER = 'my-quarter' as const
export type MyQuarterId = typeof MY_QUARTER

/** Everything a member may name in a request: the eight topics plus My quarter. */
export type FollowChoice = TopicId | MyQuarterId

export function isFollowChoice(v: unknown): v is FollowChoice {
  return v === MY_QUARTER || isTopicId(v)
}

const QUARTERS = new Set<string>(GUNEKU_QUARTERS_27)

/** A quarter the Fondom actually publishes. Re-checked here even though `/api/me` already
 *  constrains what it stores: a row could predate that constraint, and a subscription to a
 *  place that does not exist is a subscription nobody can ever deliver. */
export function isCanonicalQuarter(v: unknown): v is string {
  return typeof v === 'string' && QUARTERS.has(v)
}

export const QUARTER_NOT_SET_MESSAGE =
  'Add your quarter in My Guneku first, and you can follow it from here.'

export const QUARTER_UNKNOWN_MESSAGE =
  'The quarter on your details is not one the Fondom publishes. Please choose it again in '
  + 'My Guneku.'
