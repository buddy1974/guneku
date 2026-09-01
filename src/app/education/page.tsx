import Link from 'next/link'
import { ArrowRight, Calendar, Clock, MapPin, Phone, GraduationCap, Stethoscope,
         Building2, Landmark, Scroll, HeartHandshake, CheckCircle2 } from 'lucide-react'
import programme from '@/data/institutions/education-scholarship-day-2026.json'

export const metadata = {
  title:       'Guneku Education & Scholarship Day 2026',
  description: 'Guneku Education & Scholarship Day 2026 — a Back-to-School initiative targeting 50 scholarships. Information Day 29 August 2026, Selection Examination 19 September 2026, at the Guneku Fon’s Palace.',
  openGraph: {
    title:       'Guneku Education & Scholarship Day 2026',
    description: 'Opening Doors. Creating Opportunities. Building Brighter Futures. 50 scholarships for deserving students.',
    url:         'https://guneku.org/education',
    images: [{ url: `https://img.youtube.com/vi/${programme.video.youtubeId}/maxresdefault.jpg`, width: 1280, height: 720, alt: programme.name }],
  },
}

const PATHWAY_ICONS = [Building2, Stethoscope, Landmark, GraduationCap, Scroll, HeartHandshake]

export default function EducationPage() {
  const { name, tagline, badge, summary, video, dates, target, openToAll, pathways, contact, appeal } = programme

  return (
    <main className="surface-ink min-h-screen">

      {/* ── Masthead ── */}
      <section className="border-b border-white/10">
        <div className="shell py-14 md:py-20">
          <p className="ed-eyebrow">{badge}</p>
          <h1 className="ed-display mt-4 text-[var(--ivory)]">{name}</h1>
          <p className="mt-4 font-cormorant text-[1.35rem] italic text-[var(--brass)]">{tagline}</p>
          <p className="ed-body mt-6 text-white/70">{summary}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`tel:${contact.tel}`} className="ed-btn ed-btn-gold">
              <Phone className="h-4 w-4" /> Register — {contact.display}
            </a>
            <a href="#dates" className="ed-btn ed-btn-ghost">
              The two dates <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Video message — placed after the summary, before the detail ── */}
      <section id="video" className="scroll-mt-24 border-b border-white/10">
        <div className="shell py-12 md:py-16">
          <p className="ed-eyebrow">Watch the scholarship announcement</p>
          <h2 className="ed-h2 mt-2 text-[var(--ivory)]">Education &amp; Scholarship Day 2026 — video message</h2>

          <div className="mt-7 overflow-hidden border border-[var(--brass)]/20 bg-black">
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

          <p className="ed-meta mt-3 text-white/40">
            Published on the {video.channelTitle} channel as &ldquo;{video.publishedTitleOnYouTube}&rdquo; ·{' '}
            <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--brass)] hover:underline">
              Watch on YouTube
            </a>
          </p>
        </div>
      </section>

      {/* ── The two dates ── */}
      <section id="dates" className="scroll-mt-24 border-b border-white/10">
        <div className="shell py-12 md:py-16">
          <p className="ed-eyebrow">Two important dates — please take note</p>
          <div className="mt-7 grid gap-6 lg:grid-cols-2">
            {dates.map(d => (
              <article key={d.order} className="border border-white/12 p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brass)] font-semibold text-[oklch(0.16_0.012_55)]">
                    {d.order}
                  </span>
                  <h3 className="ed-h3 text-[var(--ivory)]">{d.name}</h3>
                </div>

                <dl className="mt-5 space-y-2">
                  <div className="ed-meta flex items-center gap-2 text-white/85">
                    <Calendar className="h-4 w-4 shrink-0 text-[var(--brass)]" aria-hidden />
                    <dt className="sr-only">Date</dt><dd className="m-0">{d.displayDate}</dd>
                  </div>
                  <div className="ed-meta flex items-center gap-2 text-white/85">
                    <Clock className="h-4 w-4 shrink-0 text-[var(--brass)]" aria-hidden />
                    <dt className="sr-only">Time</dt><dd className="m-0">{d.time}</dd>
                  </div>
                  <div className="ed-meta flex items-center gap-2 text-white/85">
                    <MapPin className="h-4 w-4 shrink-0 text-[var(--brass)]" aria-hidden />
                    <dt className="sr-only">Venue</dt><dd className="m-0">{d.venue}</dd>
                  </div>
                </dl>

                <p className="ed-kicker mt-5 inline-block border border-[var(--brass)]/45 px-3 py-1 text-[var(--brass)]">
                  {d.audience}
                </p>

                <ul className="mt-5 list-none space-y-2 p-0">
                  {d.points.map(pt => (
                    <li key={pt} className="ed-body flex items-start gap-2.5 !text-[0.85rem] text-white/65">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brass)]" aria-hidden />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>

                <p className="ed-meta mt-5 border-t border-white/10 pt-4 text-white/50">{d.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Target ── */}
      <section className="surface-burgundy border-b border-white/10">
        <div className="shell grid gap-10 py-12 md:py-16 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div>
            <p className="ed-eyebrow">{target.headline}</p>
            <p className="mt-3 font-cormorant text-[5rem] font-semibold leading-none text-[var(--brass)]">
              {target.count}
            </p>
            <p className="ed-body mt-3 text-white/75">{target.summary}</p>
            <p className="ed-body mt-5 font-cormorant !text-[1.15rem] italic text-white/85">{target.closing}</p>
          </div>

          <div>
            {target.types.map(t => (
              <div key={t.name} className="border-t border-white/15 py-5 last:border-b">
                <h3 className="ed-kicker text-[var(--brass)]">{t.name}</h3>
                <p className="ed-body mt-1.5 !text-[0.88rem] text-white/70">{t.description}</p>
              </div>
            ))}
            <p className="ed-body mt-6 !text-[0.82rem] leading-relaxed text-white/55">{target.terms}</p>
          </div>
        </div>
      </section>

      {/* ── Open to all ── */}
      <section className="surface-ivory border-b border-white/10">
        <div className="shell py-12 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
            <div>
              <p className="ed-eyebrow">Who may take part</p>
              <h2 className="ed-h2 mt-2 text-[oklch(0.22_0.02_45)]">{openToAll.heading}</h2>
            </div>
            <div>
              <p className="muted ed-body">{openToAll.body}</p>
              <p className="ed-body mt-4 font-semibold text-[oklch(0.22_0.02_45)]">{openToAll.emphasis}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pathways ── */}
      <section className="border-b border-white/10">
        <div className="shell py-12 md:py-16">
          <p className="ed-eyebrow">Types of educational opportunities</p>
          <ul className="mt-8 grid list-none grid-cols-2 gap-x-6 gap-y-8 p-0 md:grid-cols-3 lg:grid-cols-6">
            {pathways.map((p, i) => {
              const Icon = PATHWAY_ICONS[i] ?? GraduationCap
              return (
                <li key={p.name}>
                  <Icon className="h-6 w-6 text-[var(--brass)]" strokeWidth={1.25} aria-hidden />
                  <h3 className="ed-kicker mt-3 text-[var(--ivory)]">{p.name}</h3>
                  <p className="ed-body mt-1.5 !text-[0.78rem] leading-snug text-white/55">{p.description}</p>
                </li>
              )
            })}
          </ul>
        </div>
      </section>

      {/* ── Registration ── */}
      <section>
        <div className="shell py-14 text-center md:py-20">
          <p className="ed-eyebrow">For registration &amp; more information</p>
          <h2 className="ed-h2 mx-auto mt-3 max-w-2xl text-[var(--ivory)]">
            Contact the {contact.organisation}
          </h2>
          <p className="ed-body mx-auto mt-3 text-white/60">{contact.method}</p>

          <p className="mt-5 font-cormorant text-[2.6rem] font-semibold leading-none text-[var(--brass)]">
            {contact.display}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a href={`tel:${contact.tel}`} className="ed-btn ed-btn-gold">
              <Phone className="h-4 w-4" /> Call
            </a>
            <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer" className="ed-btn ed-btn-ghost">
              WhatsApp
            </a>
          </div>

          <div className="mx-auto mt-12 max-w-xl border-t border-white/10 pt-8">
            {appeal.lines.map(l => (
              <p key={l} className="font-cormorant text-[1.35rem] italic text-white/85">{l}</p>
            ))}
            <p className="ed-kicker mt-5 text-[var(--brass)]">{appeal.motto}</p>
          </div>

          <Link href="/projects" className="ed-btn ed-btn-ghost mt-10">
            All Guneku initiatives <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  )
}
