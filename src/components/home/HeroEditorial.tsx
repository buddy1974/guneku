import Link  from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

/* News rail content is drawn from verified repository data
   (src/data/institutions/gudeca-eu.json). Each item carries its true
   status — nothing here is presented as delivered that is not. */
const RAIL = [
  {
    tag:  'Fundraising',
    title:'Solar Street Lighting — Phase II',
    body: '€800 raised towards the second phase at the GUDECA Europe meeting.',
    date: '28 March 2026',
    href: '/projects',
  },
  {
    tag:  'Proposed',
    title:'Digital Empowerment Initiative',
    body: 'Satellite internet at the Palace and digital skills training for adults.',
    date: 'Proposed by Ni Sam · GUDECA Europe',
    href: '/projects',
  },
  {
    tag:  'Upcoming',
    title:'GUDECA Europe Meeting',
    body: 'The next general meeting of the European chapter.',
    date: '24 July 2027 · United Kingdom',
    href: '/gudeca',
  },
]

export function HeroEditorial() {
  return (
    <section className="surface-ink">

      {/* ── Split hero ── */}
      <div className="grid xl:grid-cols-[46fr_54fr]">

        {/* Editorial panel */}
        <div className="order-2 flex flex-col justify-center px-[var(--gut)] py-12 md:py-16 xl:order-1 xl:min-h-[clamp(520px,70vh,680px)] xl:pl-[6vw] xl:pr-12">
          <div className="w-full max-w-[46rem]">
            <p className="ed-eyebrow">A Living Kingdom</p>

            <h1 className="ed-display mt-5 text-[var(--ivory)]">
              Where heritage<br />
              <span className="text-[var(--brass)]">unites us.</span><br />
              Where vision<br />
              builds our future.
            </h1>

            <p className="ed-body mt-6 max-w-lg text-white/65">
              Guneku is more than a place. It is our identity, our history, our people
              and the future we are building together — in the village, and across the world.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/kingdom" className="ed-btn ed-btn-gold">
                Explore Guneku <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/palace/fon-walters-profile" className="ed-btn ed-btn-ghost">
                Meet the Fon <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Photograph — genuine Guneku archive */}
        <div className="relative order-1 aspect-[4/3] w-full sm:aspect-[16/9] xl:order-2 xl:aspect-auto xl:min-h-[clamp(520px,70vh,680px)]">
          <Image
            src="/images/site/fon-coronation-2016.jpg"
            alt="HRH Fon Fomuki Walters Ticha IX in white ceremonial robe, flanked by Guneku notables, at his coronation in January 2016"
            fill
            priority
            sizes="(max-width: 1279px) 100vw, 54vw"
            className="object-cover"
            style={{ objectPosition: '56% 38%' }}
          />
          {/* Blend into the editorial panel on desktop */}
          <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-32 bg-gradient-to-r from-[var(--ink)] to-transparent xl:block" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/65 to-transparent" />

          <p className="absolute bottom-3 right-4 max-w-[85%] text-right text-[10px] leading-snug tracking-[0.06em] text-white/70">
            HRH Fon Fomuki Walters Ticha IX · Coronation, 17 January 2016
          </p>
        </div>
      </div>

      {/* ── News rail ── */}
      <div className="grid border-t border-white/10 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_minmax(0,0.95fr)]">
        {RAIL.map(item => (
          <Link
            key={item.title}
            href={item.href}
            className="surface-burgundy group block border-b border-white/12 px-6 py-6 no-underline transition-colors hover:bg-[var(--burgundy-deep)] sm:border-r xl:border-b-0"
          >
            <span className="ed-kicker text-[var(--brass)]">{item.tag}</span>
            <h2 className="ed-h3 mt-2 text-[var(--ivory)]">{item.title}</h2>
            <p className="ed-body mt-1.5 !text-[0.8rem] text-white/70">{item.body}</p>
            <p className="ed-meta mt-3 text-white/50">{item.date}</p>
          </Link>
        ))}

        {/* Verified quotation from the reigning Fon */}
        <blockquote className="m-0 flex flex-col justify-center bg-[var(--brass)] px-6 py-6 text-[oklch(0.19_0.02_50)]">
          <p className="m-0 font-cormorant text-[1.05rem] italic leading-snug">
            “We carry Guneku in our hearts wherever we are in the world. But Guneku
            must grow — in the village, in the diaspora, and in the digital world.”
          </p>
          <footer className="ed-meta mt-3 font-semibold uppercase tracking-[0.14em] opacity-70">
            HRH Fon Fomuki Walters Ticha IX
          </footer>
        </blockquote>
      </div>
    </section>
  )
}
