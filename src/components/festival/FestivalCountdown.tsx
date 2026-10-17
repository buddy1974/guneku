'use client'

import { useEffect, useState } from 'react'
import { festivalCountdown } from '@/lib/festival-time'

/* The countdown to Michi Ebeng 2027.
 *
 * The server renders it with the time the page was built, so a reader without JavaScript —
 * or a search engine — sees a sensible number of days rather than a row of dashes. The
 * browser then takes over and ticks once a second. Only the digits are allowed to differ
 * between the two renders; everything else is identical.
 *
 * It is a timer, not a live region: announcing every second to a screen reader would make
 * the page unusable. The whole countdown has one accessible label, which carries the days. */

const UNITS = [
  ['days', 'Days'],
  ['hours', 'Hours'],
  ['minutes', 'Minutes'],
  ['seconds', 'Seconds'],
] as const

export function FestivalCountdown({ initialNow, tone = 'dark' }: {
  initialNow: number
  tone?: 'dark' | 'light'
}) {
  const [now, setNow] = useState(initialNow)

  /* Each tick schedules the next one for the start of the following second, so the digits
     change on the second rather than drifting a little later every time. It runs only while
     the page is open; nothing is scheduled anywhere else. */
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const tick = () => {
      const n = Date.now()
      setNow(n)
      t = setTimeout(tick, 1000 - (n % 1000))
    }
    tick()
    return () => clearTimeout(t)
  }, [])

  const c = festivalCountdown(now)

  if (c.phase === 'live') {
    return (
      <p className={`fest-countdown-state fest-tone-${tone}`}>
        Happening now · 19–20 March 2027, Limbe
      </p>
    )
  }
  if (c.phase === 'past') {
    return (
      <p className={`fest-countdown-state fest-tone-${tone}`}>
        Held on 19–20 March 2027 in Limbe
      </p>
    )
  }

  return (
    <div
      suppressHydrationWarning
      className={`fest-countdown fest-tone-${tone}`}
      role="timer"
      aria-label={`${c.days} days to the opening day, 19 March 2027, Cameroon time`}
    >
      {UNITS.map(([key, label]) => (
        <div key={key} className="fest-countdown-unit" aria-hidden="true">
          <span className="fest-countdown-num" suppressHydrationWarning>
            {String(c[key]).padStart(2, '0')}
          </span>
          <span className="fest-countdown-label">{label}</span>
        </div>
      ))}
    </div>
  )
}
