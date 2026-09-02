import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calendar, Clock, MapPin, Phone, GraduationCap, Stethoscope,
         Building2, Landmark, Scroll, HeartHandshake, CheckCircle2 } from 'lucide-react'
import programme from '@/data/institutions/education-scholarship-day-2026.json'

export const metadata = {
  alternates: { canonical: '/education' },
  title:       'Guneku Education & Scholarship Day 2026',
  description: 'Guneku Education & Scholarship Day 2026 — a Back-to-School initiative targeting 50 scholarships. Information Day 29 August 2026, Selection Examination 19 September 2026, at the Guneku Fon’s Palace.',
  openGraph: {
    title:       'Guneku Education & Scholarship Day 2026',
    description: 'Opening Doors. Creating Opportunities. Building Brighter Futures. 50 scholarships for deserving students.',
    url:         'https://www.guneku.org/education',
    images: [{ url: 'https://www.guneku.org/images/education/og-scholarship-2026.jpg', width: 1200, height: 630, alt: programme.name }],
  },
}

const PATHWAY_ICONS = [Building2, Stethoscope, Landmark, GraduationCap, Scroll, HeartHandshake]

/* Migrated 2026-09-02 out of the separate `ed-*` / `surface-ink` campaign language and
   into the institutional system the homepage uses. Every date, figure, pathway, contact
   and link is unchanged; only surface, type scale and accent colour move. */
export default function EducationPage() {
  const { name, tagline, badge, summary, video, dates, target, openToAll, pathways, contact, appeal, quote } = programme

  return (
    <main className="min-h-screen bg-[var(--paper)]">

      {/* ── Masthead ── */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-14 md:py-20">
          <p className="inst-eyebrow">{badge}</p>
          <h1 className="inst-h1 mt-4">{name}</h1>
          <p className="mt-4 font-[family-name:var(--font-display)] text-[1.28rem] italic text-[var(--ink-600)]">{tagline}</p>
          <p className="inst-body mt-6">{summary}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`tel:${contact.tel}`} className="inst-btn inst-btn-primary">
              <Phone className="h-4 w-4" /> Register — {contact.display}
            </a>
            <a href="#dates" className="inst-btn inst-btn-quiet">
              The two dates <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>


      {/* ── Approved campaign flyer ──
           Published as supplied and approved by the PM on 2026-09-01. The
           artwork is not edited. The PNG served here is byte-identical in
           pixels and aspect to the supplied file, re-encoded only for delivery
           weight; the untouched original is linked for full-size viewing. The
           website's own contact details remain those in the record below —
           the flyer's printed number is not repeated as text anywhere. */}
      <section id="flyer" className="scroll-mt-24 border-b border-[var(--rule)]">
        <div className="shell py-12 md:py-16">
          <p className="inst-eyebrow">The campaign</p>
          <h2 className="inst-h2 mt-2">Guneku Education &amp; Scholarship Day 2026 &mdash; flyer</h2>

          <figure className="m-0 mt-7">
            <div className="mx-auto block w-full max-w-[640px] border border-[var(--rule)] bg-[var(--stone)]">
              <Image
                src="/images/education/guneku-scholarship-2026-web.webp"
                alt="Guneku Education & Scholarship Day 2026 flyer. Two dates at the Guneku Fon's Palace: the Information Day on Saturday 29 August 2026 at 9:00 a.m., open to the general public, and the Scholarship Selection Examination on Saturday 19 September 2026 at 9:00 a.m. for exam candidates only. Target of 50 scholarships, full and partial. Opportunities span professional and vocational training, health and medical programmes, career-oriented courses, university education, other suitable programmes, and guidance and support. Registration through the Guneku Library."
                width={1054}
                height={1492}
                sizes="(max-width: 700px) 100vw, 640px"
                className="h-auto w-full"
                priority
              />
            </div>
            <figcaption className="inst-meta mt-3 text-center">
              {/* An explicit, labelled action rather than the whole image behaving as a
                  link to a raw JPEG. Uses the existing asset; no new functionality. */}
              <a
                href="/images/education/guneku-scholarship-2026.jpg"
                target="_blank"
                rel="noopener noreferrer"
                className="inst-link inline-block py-1"
              >
                View the full-size flyer (JPEG, opens in a new tab) →
              </a>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── Video message — placed after the summary, before the detail ── */}
      <section id="video" className="scroll-mt-24 border-b border-[var(--rule)]">
        <div className="shell py-12 md:py-16">
          <p className="inst-eyebrow">Watch the scholarship announcement</p>
          <h2 className="inst-h2 mt-2">Education &amp; Scholarship Day 2026 — video message</h2>

          <div className="mt-7 overflow-hidden border border-[var(--rule)] bg-[var(--stone)]">
            <div className="relative h-0 w-full pb-[56.25%]">
              <iframe
                className="absolute inset-0 h-full w-full border-0"
                src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0`}
                title={video.title}
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          <p className="inst-meta mt-3">
            Published on the {video.channelTitle} channel as &ldquo;{video.publishedTitleOnYouTube}&rdquo; ·{' '}
            <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="inst-link">
              Watch on YouTube
            </a>
          </p>
        </div>
      </section>

      {/* ── The two dates ── */}
      <section id="dates" className="scroll-mt-24 border-b border-[var(--rule)]">
        <div className="shell py-12 md:py-16">
          <p className="inst-eyebrow">Two important dates — please take note</p>
          <div className="mt-7 grid gap-6 lg:grid-cols-2">
            {dates.map(d => (
              <article key={d.order} className="border border-[var(--rule)] p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--royal-green)] font-semibold text-[oklch(0.98_0.006_85)]">
                    {d.order}
                  </span>
                  <h3 className="inst-h3">{d.name}</h3>
                </div>

                <dl className="mt-5 space-y-2">
                  <div className="inst-meta flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0 text-[var(--ochre)]" aria-hidden />
                    <dt className="sr-only">Date</dt><dd className="m-0">{d.displayDate}</dd>
                  </div>
                  <div className="inst-meta flex items-center gap-2">
                    <Clock className="h-4 w-4 shrink-0 text-[var(--ochre)]" aria-hidden />
                    <dt className="sr-only">Time</dt><dd className="m-0">{d.time}</dd>
                  </div>
                  <div className="inst-meta flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-[var(--ochre)]" aria-hidden />
                    <dt className="sr-only">Venue</dt><dd className="m-0">{d.venue}</dd>
                  </div>
                </dl>

                <p className="inst-tag mt-5 inline-block border border-[var(--brass)]/45 px-3 py-1 text-[var(--ochre)]">
                  {d.audience}
                </p>

                <ul className="mt-5 list-none space-y-2 p-0">
                  {d.points.map(pt => (
                    <li key={pt} className="inst-body flex items-start gap-2.5 !text-[0.85rem]">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ochre)]" aria-hidden />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>

                <p className="inst-meta mt-5 border-t border-[var(--rule)] pt-4">{d.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Target ── */}
      <section className="inst-alt border-b border-[var(--rule)]">
        <div className="shell grid items-start gap-10 py-12 md:py-16 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div>
            <p className="inst-eyebrow">{target.headline}</p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-[4.5rem] font-bold leading-none text-[var(--oxblood)]">
              {target.count}
            </p>
            <p className="inst-body mt-3">{target.summary}</p>
            <p className="inst-body mt-5 font-[family-name:var(--font-display)] !text-[1.12rem] italic">{target.closing}</p>
          </div>

          <div>
            {target.types.map(t => (
              <div key={t.name} className="border-t border-[var(--rule)] py-5 last:border-b">
                <h3 className="inst-tag">{t.name}</h3>
                <p className="inst-body mt-1.5 !text-[0.88rem]">{t.description}</p>
              </div>
            ))}
            <p className="inst-body mt-6 !text-[0.82rem] leading-relaxed">{target.terms}</p>
          </div>
        </div>
      </section>

      {/* ── Open to all ── */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-12 md:py-16">
          <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
            <div>
              <p className="inst-eyebrow">Who may take part</p>
              <h2 className="inst-h2 mt-2">{openToAll.heading}</h2>
            </div>
            <div>
              <p className="inst-body">{openToAll.body}</p>
              <p className="inst-body mt-3">{openToAll.specialConsideration}</p>
              <p className="inst-body mt-3">{openToAll.displaced}</p>
              <p className="inst-body mt-4 font-semibold text-[var(--ink-900)]">{openToAll.emphasis}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pathways ── */}
      <section className="border-b border-[var(--rule)]">
        <div className="shell py-12 md:py-16">
          <p className="inst-eyebrow">Types of educational opportunities</p>
          <ul className="mt-8 grid list-none grid-cols-2 gap-x-6 gap-y-8 p-0 md:grid-cols-3 lg:grid-cols-6">
            {pathways.map((p, i) => {
              const Icon = PATHWAY_ICONS[i] ?? GraduationCap
              return (
                <li key={p.name}>
                  <Icon className="h-6 w-6 text-[var(--ochre)]" strokeWidth={1.25} aria-hidden />
                  <h3 className="inst-tag mt-3">{p.name}</h3>
                  <p className="inst-body mt-1.5 !text-[0.78rem] leading-snug">{p.description}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* ── Registration ── */}
      <section>
        <div className="shell py-14 text-center md:py-20">
          <p className="inst-eyebrow">For registration &amp; more information</p>
          <h2 className="inst-h2 mx-auto mt-3 max-w-2xl">
            Contact the {contact.organisation}
          </h2>
          <p className="inst-body mx-auto mt-3">{contact.method}</p>
          <p className="inst-tag mx-auto mt-4 inline-block border border-[var(--brass)]/45 px-3 py-1.5 text-[var(--ochre)]">
            Next: Scholarship Selection Examination &middot; Saturday, 19 September 2026
          </p>

          <p className="mt-5 font-[family-name:var(--font-display)] text-[2.6rem] font-semibold leading-none text-[var(--ochre)]">
            {contact.display}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a href={`tel:${contact.tel}`} className="inst-btn inst-btn-primary">
              <Phone className="h-4 w-4" /> Call
            </a>
            <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer" className="inst-btn inst-btn-quiet">
              WhatsApp
            </a>
          </div>

          <div className="mx-auto mt-12 max-w-xl border-t border-[var(--rule)] pt-8">
            <blockquote className="m-0 mb-6">
              <p className="m-0 font-[family-name:var(--font-display)] text-[1.35rem] italic">&ldquo;{quote.text}&rdquo;</p>
              <footer className="inst-meta mt-2">&mdash; {quote.attribution}</footer>
            </blockquote>
            {appeal.lines.map(l => (
              <p key={l} className="font-[family-name:var(--font-display)] text-[1.35rem] italic">{l}</p>
            ))}
            <p className="inst-tag mt-5 text-[var(--ochre)]">{appeal.motto}</p>
          </div>

          <Link href="/projects" className="inst-btn inst-btn-quiet mt-10">
            All Guneku initiatives <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  )
}
