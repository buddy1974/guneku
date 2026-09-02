import Link from 'next/link'
import facts from '@/data/home/village-facts.json'

/* The village in figures, immediately below the hero.
   Every number is quoted from a record in this repository and carries its source in
   village-facts.json. A figure that could not be proved is absent, not estimated.

   Desktop: one calm row with hairline separators.
   Mobile:  a native horizontal scroller with snap points — CSS only, no carousel
            library, no auto-motion, so it never fights the reader or a screen reader. */
export function AtAGlance() {
  const items = facts.glance

  return (
    <section className="inst-alt inst-rule border-b border-[var(--rule)]" aria-labelledby="glance-heading">
      <div className="inst-wrap py-6 md:py-7">
        <h2 id="glance-heading" className="sr-only">Guneku at a glance</h2>

        <ul
          className="
            -mx-[clamp(1rem,4vw,2.5rem)] flex list-none snap-x snap-mandatory gap-0
            overflow-x-auto px-[clamp(1rem,4vw,2.5rem)] pb-1
            [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
            md:mx-0 md:flex-wrap md:justify-between md:overflow-visible md:px-0 md:pb-0
          "
        >
          {items.map((f, i) => {
            const inner = (
              <>
                <span className="block font-[family-name:var(--font-display)] text-[1.6rem] font-bold leading-none text-[var(--royal-green)] md:text-[1.75rem]">
                  {f.value}
                </span>
                <span className="mt-1.5 block text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[var(--ink-600)]">
                  {f.label}
                </span>
              </>
            )
            return (
              <li
                key={f.id}
                className={`
                  min-w-[8.5rem] shrink-0 snap-start px-5 first:pl-0 last:pr-0
                  md:min-w-0 md:flex-1 md:px-3
                  ${i > 0 ? 'border-l border-[var(--rule)]' : ''}
                `}
              >
                {f.href ? (
                  <Link href={f.href} className="block no-underline" title={f.note}>{inner}</Link>
                ) : (
                  <span className="block" title={f.note}>{inner}</span>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
