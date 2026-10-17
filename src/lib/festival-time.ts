/* When Michi Ebeng 2027 opens and closes, and how far away that is.
 *
 * Kept apart from `festival.ts` because the countdown ticks in the browser, and that module
 * reads the news archive from disk. This one imports nothing.
 *
 * Cameroon keeps West Africa Time, UTC+1, all year — there is no daylight saving — so the
 * offset is a constant rather than something to look up. No opening hour has been announced,
 * so the festival "opens" at the start of 19 March in Limbe, which is 23:00 UTC on 18 March,
 * and closes at the end of 20 March. The countdown says it runs to the opening day. */

export const OPENS_AT = Date.parse('2027-03-19T00:00:00+01:00')
export const CLOSES_AT = Date.parse('2027-03-21T00:00:00+01:00')

export type FestivalPhase = 'upcoming' | 'live' | 'past'

export type Countdown = {
  phase: FestivalPhase
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function festivalCountdown(now: number): Countdown {
  if (now >= CLOSES_AT) return { phase: 'past', days: 0, hours: 0, minutes: 0, seconds: 0 }
  if (now >= OPENS_AT) return { phase: 'live', days: 0, hours: 0, minutes: 0, seconds: 0 }
  let s = Math.floor((OPENS_AT - now) / 1000)
  const days = Math.floor(s / 86400); s -= days * 86400
  const hours = Math.floor(s / 3600); s -= hours * 3600
  const minutes = Math.floor(s / 60); s -= minutes * 60
  return { phase: 'upcoming', days, hours, minutes, seconds: s }
}
