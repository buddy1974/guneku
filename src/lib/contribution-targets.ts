import { getFoundingName, getBody, getChapter } from './community'
import { getQuarterBySlugOrName } from './quarter-pages'
import type { TargetType } from './contributions'

/* Turning a stored (target_type, target_id) back into something a person can read.
 *
 * The label is looked up in the reviewed records rather than stored alongside the
 * contribution — the record is the record, and copying a person's name into the database
 * would create a second version of it to drift. If a record is later renamed, every
 * contribution about it says the new name, because there was never a copy to go stale.
 *
 * If a target has since been removed from the records, the raw id is shown. That is honest:
 * it says the contribution concerned something that is no longer there, which is exactly
 * what a reviewer needs to know. */

export function contributionTargetLabel(
  targetType: TargetType, targetId: string | null,
): string {
  if (targetType === 'general' || !targetId) return 'The Guneku record in general'

  switch (targetType) {
    case 'quarter': return `${targetId} quarter`
    case 'person':  return getFoundingName(targetId)?.display ?? targetId
    case 'body':    return getBody(targetId)?.name ?? targetId
    case 'chapter': {
      const c = getChapter(targetId)
      return c ? `${c.org} — ${c.place}` : targetId
    }
    case 'page':    return targetId
  }
}

/** Where to read the record a contribution concerns, or null where there is nowhere to send
 *  a reader. A `page` target is deliberately NOT turned into a link: it is a value that
 *  originated in a request, and a value from a request that becomes an href is how an open
 *  redirect starts. It is rendered as text. */
export function contributionTargetHref(
  targetType: TargetType, targetId: string | null,
): string | null {
  if (!targetId) return null

  switch (targetType) {
    case 'quarter': {
      const q = getQuarterBySlugOrName(targetId)
      return q ? `/quarters/${q.slug}` : null
    }
    case 'person':  return getFoundingName(targetId) ? `/indigenes/founding/${targetId}` : null
    case 'body':    return getBody(targetId) ? `/people/${targetId}` : null
    case 'chapter': return getChapter(targetId) ? `/gudeca/chapters/${targetId}` : null
    case 'page':
    case 'general':
    default:        return null
  }
}
