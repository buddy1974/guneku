import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CalendarDays, MapPin, Check, CircleDashed } from 'lucide-react'
import { pageMetadata } from '@/lib/seo'
import { PageGraph } from '@/components/seo/PageGraph'
import { abs, ORG_ID, PLACE_ID } from '@/lib/schema'
import { getUpdate, getImageGallery } from '@/lib/content'
import { FestivalCountdown } from '@/components/festival/FestivalCountdown'
import { BusinessVideos } from '@/components/business/BusinessVideos'
import {
  FESTIVAL, FESTIVAL_PATH, GALLERY, HERO_IMAGE, HISTORY_UPDATES,
  festivalUpdates, festivalFilms, kemFilm, shortDate, renderedAt,
} from '@/lib/festival'

/* Michi Ebeng 2027 — the festival's own page.
 *
 * This is where the festival is followed until it happens, and where the edition is recorded
 * after. It reads one data file (`data/events/michi-ebeng-2027.json`) for the facts and asks
 * the news archive for the planning updates tagged to it, so a new announcement is a new
 * update record and this page picks it up on its next regeneration.
 *
 * Three rules govern every section:
 *
 *   Agreed and proposed are labelled apart. The minutes record a few decisions and a longer
 *   list of ideas; only the first are the programme.
 *   Every photograph is from an earlier edition, and its caption says which. No picture of the
 *   2027 festival exists yet.
 *   Nothing is supplied that the record does not hold: no street address, no map pin, no
 *   ticket price, no registration form, no account to pay into. Where something is not yet
 *   decided, the page says that instead. */

export const revalidate = 3600

const PATH = FESTIVAL_PATH
const EVENT_ID = `${abs(PATH)}#event`

export const metadata = pageMetadata({
  title: 'Michi Ebeng 2027 — 19–20 March, Limbe',
  description:
    'Michi Ebeng 2027, the Mɨchi Əbeŋ festival of Meta heritage: the Kem dance competition, '
    + 'traditional dances, food and community at the Handicraft Centre, Mile 4, Limbe, on '
    + '19–20 March 2027. Planning under way.',
  path: '/events/michi-ebeng-2027',
  image: HERO_IMAGE.src,
  imageAlt: 'Dancers at the maiden Mɨchi Əbeŋ festival, Guneku Palace, 2023',
})

const SECTIONS: Array<[string, string]> = [
  ['about', 'About'],
  ['programme', 'Programme'],
  ['kem', 'Kem dance'],
  ['history', 'History'],
  ['planning', 'Planning'],
  ['updates', 'Updates'],
  ['gallery', 'Gallery'],
  ['location', 'Location'],
  ['participate', 'Take part'],
  ['faq', 'Questions'],
]

/* The editions the record holds. Each says what it is sourced from; none is filled in. */
const EDITIONS = [
  {
    when: '15 April 2023',
    title: 'The maiden edition',
    where: 'Guneku Palace',
    body: 'The revival after six years of conflict. Six Mukonge dance groups competed — Barakwe, Sang, Mbemi, Kai, Bome and Mbengwi — and the day was kept in the mother tongue, in traditional dress, with traditional food in wooden bowls and on plantain leaves, and palm wine from calabashes and horns.',
    links: [
      ['Photographs of the day', '/gallery/images/mchibe-mta-event-guneku2023'],
      ['How it was reported', '/updates/meta-people-start-going-back-to-their-roots'],
    ],
  },
  {
    when: 'March 2024',
    title: 'The second edition',
    where: 'Guneku Palace',
    body: 'Built around the Kem — then written Kwem — dance groups. The announcement gave Saturday 23 March 2024 in its text and April in its headline; the Palace has not yet confirmed which.',
    links: [['The announcement', '/updates/festival-in-april-2024']],
  },
  {
    when: 'Date not recorded',
    title: 'The third edition',
    where: '',
    body: 'The Mukonge dance again, according to the minutes of the 2027 planning meeting, which look back on three editions. They do not give its date.',
    links: [],
  },
  {
    when: '28 March 2026',
    title: 'In the diaspora',
    where: 'Bonn, Germany',
    body: 'GUDECA Europe marked a Bonn edition at the Fon’s Palace in Bonn, deliberately on the day Michi Ebeng was celebrated in Guneku village.',
    links: [['The Bonn gathering', '/updates/gudeca-eu-meeting-bonn-28-march-2026']],
  },
  {
    when: '19–20 March 2027',
    title: 'Michi Ebeng 2027',
    where: 'Handicraft Centre, Mile 4, Limbe',
    body: 'Two days, with the Kem dance competition. In planning.',
    links: [],
  },
] as const

function eventNode() {
  return {
    '@type': 'Event',
    '@id': EVENT_ID,
    name: FESTIVAL.name,
    alternateName: FESTIVAL.metaName,
    description: FESTIVAL.summary,
    url: abs(PATH),
    startDate: FESTIVAL.dates.start,
    endDate: FESTIVAL.dates.end,
    /* Scheduled is the accurate status: the dates are fixed. Nothing about tickets, entry or
       performers is published, so no `offers` and no `performer` — a schema slot is not a
       reason to invent one. */
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: FESTIVAL.venue.name,
      address: {
        '@type': 'PostalAddress',
        addressLocality: FESTIVAL.venue.locality,
        addressRegion: FESTIVAL.venue.region,
        addressCountry: FESTIVAL.venue.countryCode,
      },
    },
    image: [abs(HERO_IMAGE.src)],
    organizer: { '@id': ORG_ID },
    about: { '@id': PLACE_ID },
    inLanguage: 'en',
  }
}

function SectionHead({ id, eyebrow, title, children }: {
  id: string; eyebrow: string; title: string; children?: React.ReactNode
}) {
  return (
    <header className="fest-sec-head">
      <p className="fest-sec-eyebrow">{eyebrow}</p>
      <h2 id={`${id}-title`} className="fest-sec-title">{title}</h2>
      {children && <div className="fest-sec-intro">{children}</div>}
    </header>
  )
}

export default function MichiEbeng2027Page() {
  const now = renderedAt()
  const updates = festivalUpdates()
  const films = festivalFilms()
  const kem = kemFilm()
  const history = HISTORY_UPDATES.map(s => getUpdate(s)).filter(Boolean)
  /* Counted, not written down: a number in prose goes stale the day an album changes. */
  const album2023 = (getImageGallery()?.albums ?? [])
    .find((a: { id: string }) => a.id === 'mchibe-mta-event-guneku2023') as { images?: unknown[] } | undefined
  const count2023 = album2023?.images?.length ?? 0

  return (
    /* A div, not a second <main>: the layout already provides the page's main landmark, and
       its header offset. A nested <main> is invalid and paid that offset twice. */
    <div className="fest-page">
      <PageGraph
        path="/events/michi-ebeng-2027"
        name={FESTIVAL.name}
        description={FESTIVAL.summary}
        trail={[{ name: 'Mɨchi Əbeŋ Festival', path: '/institutions/michi-ebeng-festival' }]}
        primaryEntity={EVENT_ID}
        image={HERO_IMAGE.src}
        nodes={[eventNode()]}
      />

      {/* ── Hero ── */}
      <section className="fest-hero" aria-labelledby="fest-title">
        <div className="fest-hero-media">
          <Image
            src={HERO_IMAGE.src}
            alt={HERO_IMAGE.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: '50% 40%' }}
          />
        </div>
        <div className="inst-wrap fest-hero-inner">
          <nav aria-label="Breadcrumb" className="fest-crumbs">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/institutions/michi-ebeng-festival">Mɨchi Əbeŋ Festival</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">2027</span>
          </nav>

          <p className="fest-eyebrow">
            <span className="fest-status">{FESTIVAL.status.label}</span>
            <span className="fest-meta-name" lang="mgo">Mɨchi Əbeŋ</span><span>The Meta festival of return</span>
          </p>
          <h1 id="fest-title" className="fest-title fest-title-xl">
            Michi Ebeng <span className="fest-title-year">2027</span>
          </h1>

          <dl className="fest-facts">
            <div>
              <dt className="sr-only">Dates</dt>
              <dd><CalendarDays aria-hidden="true" className="h-4 w-4" />{FESTIVAL.dates.display}</dd>
            </div>
            <div>
              <dt className="sr-only">Venue</dt>
              <dd><MapPin aria-hidden="true" className="h-4 w-4" />{FESTIVAL.venue.display}</dd>
            </div>
          </dl>
          <p className="fest-tagline">{FESTIVAL.tagline}</p>

          <FestivalCountdown initialNow={now} />
          <p className="fest-small">{FESTIVAL.dates.timeNote}</p>

          <div className="fest-ctas">
            <a href="#programme" className="fest-btn fest-btn-primary">
              The programme <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="#planning" className="fest-btn fest-btn-ghost">Festival planning</a>
            <a href="#history" className="fest-link">Michi Ebeng history →</a>
          </div>

          <p className="fest-hero-credit">
            Photograph: the maiden edition at the Guneku Palace, April 2023.
          </p>
        </div>
      </section>

      {/* ── On this page ── */}
      <nav className="fest-toc" aria-label="On this page">
        <div className="inst-wrap">
          <ul>
            {SECTIONS.map(([id, label]) => (
              <li key={id}><a href={`#${id}`}>{label}</a></li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ── Status ── */}
      <div className="inst-wrap">
        <p className="fest-status-note" role="note">
          <strong>{FESTIVAL.status.label}.</strong> {FESTIVAL.status.detail}
        </p>
      </div>

      {/* ── About ── */}
      <section id="about" className="fest-sec" aria-labelledby="about-title">
        <div className="inst-wrap fest-two">
          <SectionHead id="about" eyebrow="About Michi Ebeng" title="A festival of return" />
          <div className="fest-prose">
            <p>
              <strong>Mɨchi Əbeŋ</strong> is the Meta festival initiated by HRH Fon Fomuki
              Walters Ticha IX of Guneku: a day of return to the arts and crafts, the food, the
              mother tongue and the dress of the Meta people. It was revived in April 2023,
              after six years in which the armed conflict in the region had put the culture
              &ldquo;in the cold&rdquo;, and it has grown around a competition between dance
              groups.
            </p>
            <p>
              Its first edition set the tone. Speaking was in the Meta language. Entry to the
              ground was in traditional dress. Food was traditional, eaten from wooden bowls or
              plantain leaves, and the only drink was palm wine from calabashes and horns.
            </p>
            <p>
              <Link href="/institutions/michi-ebeng-festival" className="fest-inline">
                The festival&rsquo;s full record
              </Link>{' '}
              holds every edition, the 2023 committee and the dance groups.
            </p>
          </div>
        </div>
      </section>

      {/* ── The 2027 celebration ── */}
      <section className="fest-sec fest-sec-alt" aria-labelledby="celebration-title">
        <div className="inst-wrap fest-two">
          <SectionHead id="celebration" eyebrow="The 2027 celebration" title="Two days in Limbe" />
          <div className="fest-prose">
            <p>{FESTIVAL.summary}</p>
            <p>
              The editions recorded on this site were held at the Guneku Palace. For 2027 the
              festival moves to Limbe, and the planning meeting of 8 October 2026 gave three
              reasons:
            </p>
            <ul className="fest-bullets">
              {FESTIVAL.whyLimbe.map(r => <li key={r}>{r}</li>)}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Programme ── */}
      <section id="programme" className="fest-sec" aria-labelledby="programme-title">
        <div className="inst-wrap">
          <SectionHead id="programme" eyebrow="Programme and activities" title="What is agreed, and what is proposed">
            <p>
              The committee has agreed a few things and is discussing many more. They are
              kept apart here so that nothing proposed reads as promised.
            </p>
          </SectionHead>

          <div className="fest-prog">
            <div className="fest-prog-col">
              <h3 className="fest-prog-head">
                <Check aria-hidden="true" className="h-4 w-4" /> Agreed
              </h3>
              <ul className="fest-prog-list">
                {FESTIVAL.established.map(i => (
                  <li key={i.title} className="fest-prog-item fest-prog-agreed">
                    <span className="fest-label fest-label-agreed">Agreed</span>
                    <p className="fest-prog-title">{i.title}</p>
                    <p className="fest-prog-detail">{i.detail}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="fest-prog-col">
              <h3 className="fest-prog-head">
                <CircleDashed aria-hidden="true" className="h-4 w-4" /> Proposed
              </h3>
              <ul className="fest-prog-list">
                {FESTIVAL.proposals.map(i => (
                  <li key={i.title} className="fest-prog-item">
                    <span className="fest-label fest-label-proposed">Proposed</span>
                    <p className="fest-prog-title">{i.title}</p>
                    <p className="fest-prog-detail">{i.detail}</p>
                  </li>
                ))}
              </ul>
              <p className="fest-source">{FESTIVAL.proposalSource}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Kem dance ── */}
      <section id="kem" className="fest-sec fest-sec-dark" aria-labelledby="kem-title">
        <div className="inst-wrap fest-kem">
          <div>
            <SectionHead id="kem" eyebrow="The competition" title="The Kem dance" />
            <div className="fest-prose fest-prose-dark">
              <p>{FESTIVAL.kem.summary}</p>
              <p>{FESTIVAL.kem.spelling}</p>
              <p>{FESTIVAL.kem.rulesNote}</p>
            </div>
          </div>
          {kem && (
            <div>
              <BusinessVideos videos={[kem]} businessName="Michi Ebeng" />
              <p className="fest-small">
                A film from Guneku TV: a Kem group from Buea performing at the Guneku Palace.
                Not a film of the 2027 competition.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── History ── */}
      <section id="history" className="fest-sec" aria-labelledby="history-title">
        <div className="inst-wrap">
          <SectionHead id="history" eyebrow="Festival history" title="The editions so far" />
          <ol className="fest-timeline">
            {EDITIONS.map(e => (
              <li key={e.title} className="fest-timeline-item">
                <p className="fest-timeline-when">{e.when}</p>
                <div>
                  <h3 className="fest-timeline-title">{e.title}</h3>
                  {e.where && <p className="fest-timeline-where">{e.where}</p>}
                  <p className="fest-timeline-body">{e.body}</p>
                  {e.links.length > 0 && (
                    <p className="fest-timeline-links">
                      {e.links.map(([label, href]) => (
                        <Link key={href} href={href} className="fest-inline">{label} →</Link>
                      ))}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>

          {films.length > 0 && (
            <div className="mt-12">
              <h3 className="fest-sub">Films of earlier editions</h3>
              <BusinessVideos videos={films} businessName="Mɨchi Əbeŋ" />
              <p className="fest-small mt-3">
                From Guneku TV. <Link href="/watch" className="fest-inline">The full film library →</Link>
              </p>
            </div>
          )}

          {history.length > 0 && (
            <div className="mt-10">
              <h3 className="fest-sub">From the news archive</h3>
              <ul className="fest-archive-list">
                {history.map(u => (
                  <li key={u!.slug}>
                    <time dateTime={u!.publishedAt ?? undefined}>{u!.publishedAt ? shortDate(u!.publishedAt) : ''}</time>
                    <Link href={`/updates/${u!.slug}`}>{u!.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* ── Planning ── */}
      <section id="planning" className="fest-sec fest-sec-alt" aria-labelledby="planning-title">
        <div className="inst-wrap">
          <SectionHead id="planning" eyebrow="Planning and organisation" title="Nine committees">
            <p>
              At the first planning meeting, held online on 8 October 2026, the work of
              preparing the festival was divided between nine committees.
            </p>
          </SectionHead>

          <ol className="fest-committees">
            {FESTIVAL.committees.map((c, i) => (
              <li key={c.name}>
                <span className="fest-committee-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="fest-committee-name">{c.name}</span>
                {'detail' in c && c.detail && <span className="fest-committee-detail">{c.detail}</span>}
              </li>
            ))}
          </ol>

          <div className="fest-two mt-10">
            <div className="fest-card fest-card-light">
              <p className="fest-card-tag">Terms of reference</p>
              <p className="fest-card-body">{FESTIVAL.termsOfReference.detail}</p>
              <ul className="fest-names">
                {FESTIVAL.termsOfReference.members.map(m => <li key={m}>{m}</li>)}
              </ul>
              <p className="fest-small">{FESTIVAL.termsOfReference.note}</p>
            </div>
            <div className="fest-card fest-card-light">
              <p className="fest-card-tag">Still to be decided</p>
              <ul className="fest-bullets">
                {FESTIVAL.outstanding.map(o => <li key={o}>{o}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Updates ── */}
      <section id="updates" className="fest-sec" aria-labelledby="updates-title">
        <div className="inst-wrap fest-two">
          <SectionHead id="updates" eyebrow="Latest updates" title="The preparations, dated">
            <p>Newest first. Each announcement is also in the <Link href="/updates" className="fest-inline">Village Square</Link>.</p>
          </SectionHead>
          <div>
            {updates.length > 0 && (
              <ul className="fest-news">
                {updates.map(u => (
                  <li key={u.slug}>
                    <Link href={`/updates/${u.slug}`} className="fest-news-link">
                      <time dateTime={u.publishedAt ?? undefined}>{u.publishedAt ? shortDate(u.publishedAt) : ''}</time>
                      <span className="fest-news-title">{u.title}</span>
                      <span className="fest-news-excerpt">{u.excerpt}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <h3 className="fest-sub mt-8">How the planning has gone</h3>
            <ol className="fest-steps">
              {[...FESTIVAL.timeline].reverse().map(t => (
                <li key={t.date + t.title}>
                  <time dateTime={t.date}>{shortDate(t.date)}</time>
                  <p className="fest-steps-title">{t.title}</p>
                  <p className="fest-steps-detail">{t.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Gallery ── */}
      <section id="gallery" className="fest-sec fest-sec-alt" aria-labelledby="gallery-title">
        <div className="inst-wrap">
          <SectionHead id="gallery" eyebrow="Cultural gallery" title="From earlier editions">
            <p>
              Photographs from the Fondom&rsquo;s own albums. None is of the 2027 festival,
              which has not happened yet; each caption says where it is from.
            </p>
          </SectionHead>
          <ul className="fest-gallery">
            {GALLERY.map(g => (
              <li key={g.src} className={g.height > g.width ? 'fest-gallery-tall' : ''}>
                <figure>
                  <div className="fest-gallery-frame">
                    <Image src={g.src} alt={g.alt} fill sizes="(max-width: 40rem) 100vw, (max-width: 64rem) 50vw, 25rem" className="object-cover" />
                  </div>
                  <figcaption>{g.caption}</figcaption>
                </figure>
              </li>
            ))}
          </ul>
          <p className="fest-small mt-5">
            <Link href="/gallery/images/mchibe-mta-event-guneku2023" className="fest-inline">All {count2023} photographs from 2023 →</Link>
            {'  '}
            <Link href="/gallery/images/mukonge-dance-groupsin-meta" className="fest-inline">Mukonge dance groups in Meta →</Link>
          </p>
        </div>
      </section>

      {/* ── Location ── */}
      <section id="location" className="fest-sec" aria-labelledby="location-title">
        <div className="inst-wrap fest-two">
          <SectionHead id="location" eyebrow="Location" title="Mile 4, Limbe" />
          <div className="fest-card fest-card-light">
            <p className="fest-venue-name">{FESTIVAL.venue.name}</p>
            <p className="fest-venue-place">{FESTIVAL.venue.locality} · {FESTIVAL.venue.region} · {FESTIVAL.venue.country}</p>
            <p className="fest-card-body mt-3">{FESTIVAL.venue.note}</p>
            <p className="fest-card-body">
              The cultural committee is to call on the traditional authority of the area. In
              the South West that is a chief, the host region&rsquo;s own custom.
            </p>
          </div>
        </div>
      </section>

      {/* ── Community participation ── */}
      <section id="participate" className="fest-sec fest-sec-alt" aria-labelledby="participate-title">
        <div className="inst-wrap">
          <SectionHead id="participate" eyebrow="Community participation" title="How to take part">
            <p>
              Only what the planning record supports. There is no ticketing, registration or
              payment arrangement yet, and this page will not imply one.
            </p>
          </SectionHead>
          <div className="fest-part">
            {FESTIVAL.participation.map(p => (
              <div key={p.title} className="fest-card fest-card-light">
                <p className="fest-prog-title">{p.title}</p>
                <p className="fest-card-body">{p.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="fest-btn fest-btn-primary fest-btn-onlight">
              Write to the Palace <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="fest-sec" aria-labelledby="faq-title">
        <div className="inst-wrap fest-two">
          <SectionHead id="faq" eyebrow="Questions" title="What is known so far" />
          <div className="fest-faq">
            {FESTIVAL.faq.map(f => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sources ── */}
      <section className="fest-sources">
        <div className="inst-wrap">
          <p className="inst-tag">Sources</p>
          <p className="fest-small-dark">{FESTIVAL.sources.planning}</p>
          <p className="fest-small-dark">{FESTIVAL.sources.history}</p>
        </div>
      </section>
    </div>
  )
}
