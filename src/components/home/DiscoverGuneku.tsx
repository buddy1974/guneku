import Link from 'next/link'
import facts from '@/data/home/village-facts.json'

/* What the record actually supports about visiting and seeing Guneku. No individual
   waterfall, cave or walking route is named, because no source in this repository names
   one — /kingdom/touristic-sites is empty in every source, including the retired Joomla
   article. The gap is stated rather than filled with tourism prose. */
export function DiscoverGuneku() {
  const cards = facts.discover

  return (
    <section className="inst-alt inst-rule border-b border-[var(--rule)]" aria-labelledby="discover-heading">
      <div className="inst-wrap inst-sec">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="inst-eyebrow">Discover</p>
            <h2 id="discover-heading" className="inst-h2 mt-1.5">Discover Guneku</h2>
          </div>
          <Link href="/kingdom" className="inst-btn inst-btn-quiet">The Kingdom</Link>
        </div>

        <div className="mt-6 grid items-start gap-x-10 gap-y-6 sm:grid-cols-2">
          {cards.map(c => (
            <article key={c.id} className="border-t border-[var(--rule)] pt-4">
              <h3 className="inst-h3">{c.title}</h3>
              <p className="inst-body mt-2 !text-[0.88rem]">{c.body}</p>
            </article>
          ))}
        </div>

        <p className="inst-meta mt-7 max-w-2xl">
          The Fondom has not yet recorded individual sites, routes or visitor
          arrangements. If you know Guneku and can help fill that gap, the Palace would
          be glad to hear from you.
        </p>
      </div>
    </section>
  )
}
