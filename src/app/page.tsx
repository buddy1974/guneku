import Link  from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calendar, MapPin, PlayCircle } from 'lucide-react'
import { getAllUpdates }    from '@/lib/content'
import { HeroEditorial }    from '@/components/home/HeroEditorial'
import { PathwayStrip }     from '@/components/home/PathwayStrip'
import { BuiltBySection }   from '@/components/home/BuiltBySection'

export const revalidate = 3600

/* ─────────────────────────────────────────────────────────────
   VERIFIED FIGURES ONLY.
   27 quarters ....... legacy village record (src/data/home/home-page.json)
   Ninth Fon ......... src/data/palace/fon-walters-profile.json
   2015 / 2016 ....... enthronementDate / coronationDate (same file)
   3 continents ...... GUDECA chapters — Cameroon, Europe, North America
   Population is deliberately NOT shown: the only figure in the
   repository ("approximately 10 000 inhabitants", legacy demography
   page) conflicts with the 15,000 used elsewhere. Flagged for the
   Palace to confirm before publication.
   ───────────────────────────────────────────────────────────── */
const GLANCE = [
  { figure: '27',   label: 'Quarters',      note: 'Making up the village of Guneku' },
  { figure: 'IX',   label: 'The Ninth Fon', note: 'HRH Fon Fomuki Walters Ticha IX' },
  { figure: '2016', label: 'Coronation',    note: 'Enthroned 2015 · crowned 17 January 2016' },
  { figure: '3',    label: 'Continents',    note: 'GUDECA chapters in Cameroon, Europe and North America' },
]

/* Statuses mirror src/app/projects/page.tsx and the GUDECA Europe record.
   Nothing proposed is shown as delivered. */
const INITIATIVES = [
  { title: 'Guneku Agro CIG',           status: 'Live',        desc: 'Community-owned agricultural enterprise. 12.5M FCFA raised in Phase 1.', href: '/agro-cig' },
  { title: 'GUNECCUL Credit Union',     status: 'Active',      desc: 'Cooperative credit union serving members across four branches.',        href: '/guneccul' },
  { title: 'Royal Community Library',   status: 'Active',      desc: 'Solar-powered library offering computer training and holiday classes.', href: '/projects' },
  { title: 'Digital Empowerment',       status: 'Proposed',    desc: 'Satellite internet at the Palace and digital skills training for adults.', href: '/projects' },
]

const STATUS_TONE: Record<string, string> = {
  Live:     'text-[var(--brass)] border-[var(--brass)]/50',
  Active:   'text-emerald-300/90 border-emerald-300/40',
  Proposed: 'text-white/55 border-white/25',
}

export default function HomePage() {
  const updates  = getAllUpdates()
  const featured = updates.find(u => u.featuredImage) ?? updates[0]
  const rest     = updates.filter(u => u.slug !== featured?.slug).slice(0, 4)

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''

  return (
    <>
      <HeroEditorial />
      <PathwayStrip />

      {/* ── LATEST UPDATES ── */}
      <section className="surface-ink py-16 md:py-24">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="ed-eyebrow">The Village Square</p>
              <h2 className="ed-h2 mt-2 text-[var(--ivory)]">Latest from Guneku</h2>
            </div>
            <Link href="/updates" className="ed-kicker inline-flex items-center gap-2 text-[var(--brass)] no-underline hover:gap-3">
              All updates <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="rule-hair mt-6" />

          <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-12">

            {/* Featured story */}
            {featured && (
              <article>
                <Link href={`/updates/${featured.slug}`} className="group block no-underline">
                  {featured.featuredImage && (
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/30">
                      <Image
                        src={featured.featuredImage}
                        alt={featured.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 55vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    </div>
                  )}
                  <p className="ed-meta mt-4 text-[var(--brass)]">{fmt(featured.publishedAt)}</p>
                  <h3 className="ed-h2 mt-2 !text-[clamp(1.4rem,2.4vw,2rem)] text-[var(--ivory)] group-hover:text-[var(--brass)]">
                    {featured.title}
                  </h3>
                  {featured.excerpt && (
                    <p className="ed-body mt-3 text-white/60 line-clamp-3">{featured.excerpt}</p>
                  )}
                </Link>
              </article>
            )}

            {/* Secondary stories */}
            <div>
              {rest.map(u => (
                <article key={u.slug} className="border-b border-white/10 first:border-t">
                  <Link href={`/updates/${u.slug}`} className="group block py-5 no-underline">
                    <p className="ed-meta text-white/40">{fmt(u.publishedAt)}</p>
                    <h3 className="ed-h3 mt-1.5 text-[var(--ivory)] transition-colors group-hover:text-[var(--brass)]">
                      {u.title}
                    </h3>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── UPCOMING: EDUCATION & SCHOLARSHIP DAY 2026 ──
           The Information Day (29 August 2026) has passed; the Selection
           Examination on 19 September 2026 is the date still ahead, so that is
           the one surfaced here. Both are recorded on /education. */}
      <section className="surface-burgundy">
        <div className="shell grid items-center gap-8 py-12 md:py-16 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="ed-eyebrow">Upcoming · Education</p>
            <h2 className="ed-h2 mt-2 text-[var(--ivory)]">Guneku Education &amp; Scholarship Day 2026</h2>
            <p className="ed-body mt-3 text-white/70">
              A Back-to-School initiative targeting <strong>50 scholarships</strong> for deserving
              students &mdash; full and partial &mdash; across vocational training, health and medical
              programmes, professional courses and university education. The Scholarship
              Selection Examination is the next date.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2">
              <span className="ed-meta inline-flex items-center gap-2 text-white/85">
                <Calendar className="h-4 w-4 text-[var(--brass)]" aria-hidden /> Saturday, 19 September 2026 · 9:00 a.m.
              </span>
              <span className="ed-meta inline-flex items-center gap-2 text-white/85">
                <MapPin className="h-4 w-4 text-[var(--brass)]" aria-hidden /> Guneku Fon&rsquo;s Palace
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link href="/education" className="ed-btn ed-btn-gold">
              Learn more <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/education#video" className="ed-btn ed-btn-ghost">
              <PlayCircle className="h-4 w-4" /> Watch video
            </Link>
          </div>
        </div>
      </section>

      {/* ── GUNEKU AT A GLANCE ── */}
      <section className="surface-ivory py-16 md:py-24">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div>
              <p className="ed-eyebrow">At a Glance</p>
              <h2 className="ed-h2 mt-2 text-[oklch(0.22_0.02_45)]">
                A village of the Meta clan,<br />in the hills of Momo Division.
              </h2>
              <p className="muted ed-body mt-4">
                Guneku lies in the MEDIG zone — Central Meta — of Mbengwi Subdivision,
                in the Momo Division of Cameroon&rsquo;s North West Region. It is made up
                of twenty-seven quarters, and its sons and daughters are today
                organised on three continents.
              </p>
              <Link href="/kingdom/history" className="ed-btn ed-btn-ink mt-6">
                Read our history <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <dl className="grid grid-cols-2 gap-px self-start bg-[oklch(0.22_0.02_45/0.14)]">
              {GLANCE.map(s => (
                <div key={s.label} className="bg-[var(--ivory)] p-6">
                  <dt className="ed-kicker text-[oklch(0.44_0.02_50)]">{s.label}</dt>
                  <dd className="m-0">
                    <span className="mt-1 block font-cormorant text-[2.75rem] font-semibold leading-none text-[var(--brass-deep)]">
                      {s.figure}
                    </span>
                    <span className="muted mt-2 block text-[0.75rem] leading-snug">{s.note}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ── DEVELOPMENT ── */}
      <section className="surface-ink py-16 md:py-24">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">

            <div className="relative aspect-[4/3] w-full lg:aspect-auto lg:min-h-[26rem]">
              <Image
                src="/images/site/palace-grounds.jpg"
                alt="The palace grounds at Guneku during the 2016 coronation gathering"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover"
              />
            </div>

            <div>
              <p className="ed-eyebrow">Development</p>
              <h2 className="ed-h2 mt-2 text-[var(--ivory)]">Built by the community, for the community</h2>
              <p className="ed-body mt-3 text-white/60">
                From cooperative farming and credit to education and digital access —
                Guneku&rsquo;s development is carried by its own people, at home and abroad.
                Each initiative below is shown with its current status.
              </p>

              <ul className="mt-8 list-none p-0">
                {INITIATIVES.map(p => (
                  <li key={p.title} className="border-t border-white/10 last:border-b">
                    <Link href={p.href} className="group flex items-start gap-4 py-4 no-underline">
                      <span className={`ed-meta mt-0.5 shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.12em] ${STATUS_TONE[p.status]}`}>
                        {p.status}
                      </span>
                      <span className="flex-1">
                        <span className="ed-h3 block text-[var(--ivory)] transition-colors group-hover:text-[var(--brass)]">
                          {p.title}
                        </span>
                        <span className="ed-body mt-1 block !text-[0.82rem] text-white/55">{p.desc}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <Link href="/projects" className="ed-btn ed-btn-ghost mt-8">
                All projects <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── PARTICIPATION ── */}
      <section className="relative isolate overflow-hidden">
        <Image
          src="/images/site/kingdom-hills.jpg"
          alt="The Guneku palace compound and the surrounding hills at dusk"
          fill
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[oklch(0.16_0.012_55/0.86)]" />

        <div className="shell py-20 text-center md:py-28">
          <p className="ed-eyebrow">Take Part</p>
          <h2 className="ed-h2 mx-auto mt-3 max-w-2xl text-[var(--ivory)]">
            Guneku is counted one person at a time
          </h2>
          <p className="ed-body mx-auto mt-4 text-white/65">
            Add your name to the Guneku indigenes register — wherever in the world you
            are — so the Fondom knows its people, and its people can find each other.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/indigenes/onboarding" className="ed-btn ed-btn-gold">
              Join our community <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/contact" className="ed-btn ed-btn-ghost">
              Contact the Palace
            </Link>
          </div>
        </div>
      </section>

      <BuiltBySection />
    </>
  )
}
