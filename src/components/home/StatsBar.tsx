'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'

const STATS = [
  { value: 27,   suffix: '',    label: 'Quarters' },
  { value: 15000, suffix: '+',  label: 'Inhabitants' },
  { value: 8,    suffix: '',    label: 'GUDECA Branches' },
  { value: 50,   suffix: 'yrs', label: 'Royal Heritage' },
]

function useCounter(target: number, active: boolean, duration = 2000) {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!active) return
    const start = performance.now()

    function tick(now: number) {
      const elapsed  = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [active, target, duration])

  return count
}

function StatBlock({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 })
  const count = useCounter(value, inView)

  return (
    <div ref={ref} className="flex flex-col items-center py-10 px-4">
      <div
        className="font-display-title text-palace-gold leading-none"
        style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', fontWeight: 700 }}
      >
        {count.toLocaleString()}{suffix}
      </div>
      <div className="mt-2 text-ivory/50 font-heading text-[11px] tracking-[0.2em] uppercase">
        {label}
      </div>
    </div>
  )
}

export function StatsBar() {
  return (
    <section className="pattern-atoghu-brown border-y border-heritage-red/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className={i < STATS.length - 1 ? 'border-r border-heritage-red/20' : ''}
            >
              <StatBlock {...s} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
