import Link  from 'next/link'
import Image from 'next/image'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { getAllUpdates }  from '@/lib/content'
import { GunekuVideo }    from '@/components/home/GunekuVideo'
import { AtAGlance }      from '@/components/home/AtAGlance'
import { CurrentProjects } from '@/components/home/CurrentProjects'
import { SupportBand }    from '@/components/home/SupportBand'
import { CommunityEconomy } from '@/components/home/CommunityEconomy'
import { ThingsToKnow }   from '@/components/home/ThingsToKnow'
import { DiscoverGuneku } from '@/components/home/DiscoverGuneku'
import { GunekuToday }    from '@/components/home/GunekuToday'
import { ArchiveStrip }   from '@/components/home/ArchiveStrip'
import { FaqSection }     from '@/components/home/FaqSection'
import { TalkToPalace }   from '@/components/home/TalkToPalace'
import { AskPalace }      from '@/components/home/AskPalace'
import { UpdateCardMedia } from '@/components/ui/UpdateCardMedia'
import current            from '@/data/current-notices.json'
import type { Metadata } from 'next'

/* The root layout no longer sets a canonical, so the homepage declares its own. */
export const metadata: Metadata = {
  alternates: { canonical: '/' },
}
import programme          from '@/data/institutions/education-scholarship-day-2026.json'

export const revalidate = 3600

/* Facts are current Guneku source of fact, supplied first-party by the project
   owners and recorded in site-config.json under gunekuSOF. Where older migrated
   Joomla material disagrees it is kept only as historical source context. */
const FACTS = [
  { figure: '27',   label: 'Quarters' },
  { figure: '15,000', label: 'People, approximately' },
  { figure: 'IX',   label: 'The reigning Fon' },
  { figure: '2016', label: 'Coronation' },
]

const EXPLORE = [
  { label: 'The Kingdom', href: '/kingdom',   desc: 'Land, history and the 27 quarters' },
  { label: 'The Palace',  href: '/palace',    desc: 'The Fon, the throne and the royal record' },
  { label: 'Development', href: '/projects',  desc: 'Projects and institutions' },
  { label: 'Education',   href: '/education', desc: 'Scholarships and skills' },
  { label: 'Our People',  href: '/indigenes', desc: 'Indigenes, notables and youth' },
  { label: 'Diaspora',    href: '/diaspora',  desc: 'Guneku beyond Cameroon' },
  { label: 'News',        href: '/updates',   desc: 'The village square archive' },
  { label: 'Media',       href: '/gallery',   desc: 'Photographs and video' },
]

export default function HomePage() {
  const updates = getAllUpdates().slice(0, 4)
  const notices = current.notices.slice(0, 5)

  const fmt = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''

  return (
    <div className="inst">

      {/* ── 1 · Hero ── */}
      <section className="border-b border-[var(--rule)]">
        <div className="inst-wrap grid items-center gap-8 py-10 md:py-12 lg:grid-cols-[1fr_1fr] lg:gap-12">
          <div>
            <p className="inst-eyebrow">Mbengwi · Momo Division · North West Cameroon</p>
            <h1 className="inst-h1 mt-2.5">Guneku Fondom</h1>
            <p className="mt-1 font-[family-name:var(--font-sans)] text-[1.02rem] font-semibold text-[var(--ink-600)]">
              Official community website
            </p>
            <p className="inst-body mt-4 max-w-xl">
              Guneku is a village of the Meta clan, made up of twenty-seven quarters and
              led by HRH Fon Fomuki Walters Ticha IX. This is the community&rsquo;s record of
              its history, its institutions, its development work and its people &mdash; at
              home and across the world.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link href="/kingdom/about-guneku" className="inst-btn inst-btn-primary">
                About Guneku <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/palace/fon-walters-profile" className="inst-link">
                The reigning Fon →
              </Link>
            </div>
          </div>

          <figure className="m-0">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--stone)] sm:aspect-[16/9] lg:aspect-[4/3]">
              <Image
                src="/images/site/fon-coronation-2016.jpg"
                alt="HRH Fon Fomuki Walters Ticha IX with notables of Guneku"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                style={{ objectPosition: '56% 38%' }}
              />
            </div>
            <figcaption className="inst-meta mt-2">
              HRH Fon Fomuki Walters Ticha IX · Fon of Guneku since 2015
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── 2 · Guneku at a glance ── */}
      <AtAGlance />

      {/* ── 3 · Work under way ── */}
      <CurrentProjects />

      {/* ── 4 · Support the work ── */}
      <SupportBand />

      {/* ── 5 · Notices & the scholarship feature ── */}
      <section className="inst-alt border-b border-[var(--rule)]">
        <div className="inst-wrap inst-sec grid items-start gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-10">

          <div>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="inst-h2">What&rsquo;s happening in Guneku</h2>
              <Link href="/updates" className="inst-link">All news →</Link>
            </div>

            <ul className="mt-3 list-none p-0">
              {notices.map(n => (
                <li key={n.title} className="inst-row">
                  <Link href={n.href} className="group grid gap-x-4 gap-y-1 py-3 no-underline sm:grid-cols-[7.5rem_1fr]">
                    <span className="inst-meta pt-0.5">{n.displayDate}</span>
                    <span>
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="inst-tag">{n.category}</span>
                        <span className={`inst-status ${
                          n.status === 'upcoming'     ? 'st-upcoming'
                          : n.status === 'active'     ? 'st-active'
                          : n.status === 'registered' ? 'st-registered'
                          : 'st-historical'}`}>
                          {n.status}
                        </span>
                      </span>
                      <span className="inst-h3 mt-1 block group-hover:text-[var(--burgundy-i)]">{n.title}</span>
                      <span className="inst-body mt-0.5 block !text-[0.86rem]">{n.description}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Scholarship — institutional feature, not a banner */}
          <aside className="inst-card self-start overflow-hidden">
            {/* Flyer — front page, clickable through to the full programme */}
            <Link href="/education" className="block no-underline" aria-label="Guneku Education & Scholarship Day 2026 — see the full programme">
              <Image
                src={programme.flyer.thumb}
                alt="Guneku Education & Scholarship Day 2026 flyer. Information Day Saturday 29 August 2026 and Scholarship Selection Examination Saturday 19 September 2026, both 9:00 a.m. at the Guneku Fon's Palace. Target of 50 scholarships, full and partial."
                width={600}
                height={849}
                sizes="(max-width: 1024px) 100vw, 32vw"
                className="h-auto w-full"
              />
            </Link>
            <div className="p-5">
            <p className="inst-tag">Education · Current programme</p>
            <h3 className="inst-h2 mt-1.5">{programme.name}</h3>
            <p className="inst-body mt-2">
              A Back-to-School initiative targeting{' '}
              <strong className="text-[var(--ink-900)]">50 scholarships</strong>{' '}
              &mdash; full and partial &mdash; for deserving students.
            </p>

            <dl className="mt-4 border-t border-[var(--rule)] pt-3 text-[0.86rem]">
              <dt className="inst-tag">Next</dt>
              <dd className="m-0 mt-1 text-[var(--ink-900)]">Scholarship Selection Examination</dd>
              <dd className="inst-meta m-0 mt-0.5">
                Saturday, 19 September 2026 · 9:00 a.m.<br />Guneku Fon&rsquo;s Palace
              </dd>
            </dl>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link href="/education" className="inst-btn inst-btn-primary">Scholarship details</Link>
              <Link href="/education#video" className="inst-link inline-flex items-center gap-1.5">
                <PlayCircle className="h-4 w-4" aria-hidden /> Watch video
              </Link>
            </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ── 6 · Latest from Guneku ── */}
      <section className="border-b border-[var(--rule)]">
        <div className="inst-wrap inst-sec">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="inst-h2">Latest from Guneku</h2>
            <Link href="/updates" className="inst-link">News archive →</Link>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {updates.map(u => (
              <article key={u.slug} className="inst-card overflow-hidden">
                <Link href={`/updates/${u.slug}`} className="group block no-underline">
                  <UpdateCardMedia slug={u.slug} title={u.title} featuredImage={u.featuredImage} />
                  <div className="p-4">
                    <p className="inst-meta">{fmt(u.publishedAt)}</p>
                    <h3 className="inst-h3 mt-1 line-clamp-3 group-hover:text-[var(--burgundy-i)]">{u.title}</h3>
                    {u.excerpt && <p className="inst-body mt-1.5 line-clamp-2 !text-[0.84rem]">{u.excerpt}</p>}
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7 · Guneku Video ── */}
      <GunekuVideo />

      {/* ── 8 · About Guneku ── */}
      <section className="border-b border-[var(--rule)]">
        <div className="inst-wrap inst-sec grid items-start gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
          <div>
            <p className="inst-eyebrow">About Guneku</p>
            <h2 className="inst-h2 mt-1.5">A village of the Meta clan, in the hills of Momo Division</h2>
            <p className="inst-body mt-3">
              Guneku lies in the MEDIG zone &mdash; Central Meta &mdash; of Mbengwi Subdivision,
              and is the largest village of the Meta clan by area. It is made up of twenty-seven
              quarters. The eighth day of the week,{' '}
              <strong className="text-[var(--ink-900)]">Ngon</strong>, is the market day held in
              Guneku. The people speak the <strong className="text-[var(--ink-900)]">MENEMO</strong>{' '}
              dialect, and <strong className="text-[var(--ink-900)]">Musongong</strong> is the dance
              of Guneku.
            </p>
            <p className="inst-body mt-2.5">
              Its sons and daughters are organised on three continents through GUDECA, the
              Guneku Development and Cultural Association.
            </p>
            <Link href="/kingdom/about-guneku" className="inst-btn inst-btn-quiet mt-5">
              Read the village record <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <dl className="grid grid-cols-2 gap-px self-start bg-[var(--rule)]">
            {FACTS.map(f => (
              <div key={f.label} className="bg-[var(--paper)] p-4">
                <dd className="m-0 font-[family-name:var(--font-display)] text-[2rem] font-bold leading-none text-[var(--burgundy-i)]">
                  {f.figure}
                </dd>
                <dt className="inst-meta mt-1.5">{f.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── 9 · Community economy ── */}
      <CommunityEconomy />

      {/* ── 10 · The village, in its own words ── */}
      <ThingsToKnow />

      {/* ── 11 · Discover ── */}
      <DiscoverGuneku />

      {/* ── 12 · From the archive ── */}
      <ArchiveStrip />

      {/* ── 13 · Upcoming events ── */}
      <section className="border-b border-[var(--rule)]">
        <div className="inst-wrap inst-sec">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="inst-h2">Upcoming events</h2>
            {/* A small living card, not a weather page. Renders nothing if the
                lookup fails, so the band never shows an empty slot. */}
            <GunekuToday />
          </div>
          <ul className="mt-4 grid list-none gap-4 p-0 sm:grid-cols-2">
            {current.upcomingEvents.map(e => (
              <li key={e.date} className="inst-card">
                <Link href={e.href} className="group flex gap-4 p-4 no-underline">
                  <span className="flex w-16 shrink-0 flex-col items-center justify-center border-r border-[var(--rule)] pr-4 text-center">
                    <span className="font-[family-name:var(--font-display)] text-2xl font-bold leading-none text-[var(--burgundy-i)]">{e.day}</span>
                    <span className="inst-meta mt-0.5">{e.month} {e.year}</span>
                  </span>
                  <span>
                    <span className="inst-h3 block group-hover:text-[var(--burgundy-i)]">{e.title}</span>
                    <span className="inst-meta mt-1 block">{e.detail}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 14 · Explore Guneku ── */}
      <section className="inst-alt border-b border-[var(--rule)]">
        <div className="inst-wrap inst-sec">
          <h2 className="inst-h2">Explore Guneku</h2>
          <ul className="mt-4 grid list-none gap-x-8 gap-y-0 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {EXPLORE.map(e => (
              <li key={e.href} className="inst-row">
                <Link href={e.href} className="group block py-3 no-underline">
                  <span className="inst-h3 group-hover:text-[var(--burgundy-i)]">{e.label}</span>
                  <span className="inst-meta mt-0.5 block">{e.desc}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 15 · Questions ── */}
      <FaqSection />

      {/* ── 16 · Reach the Palace ── */}
      <TalkToPalace />

      {/* ── 17 · The information desk ── */}
      <AskPalace />

      {/* ── 18 · Our community ── */}
      <section>
        <div className="inst-wrap inst-sec">
          <div className="inst-card grid gap-5 p-6 md:grid-cols-[1.6fr_auto] md:items-center">
            <div>
              <h2 className="inst-h2">Our community</h2>
              <p className="inst-body mt-2 max-w-2xl">
                Add your name to the Guneku indigenes register, wherever in the world you
                are, so the Fondom knows its people and its people can find one another.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link href="/indigenes/onboarding" className="inst-btn inst-btn-primary">
                Join our community
              </Link>
              <Link href="/indigenes" className="inst-btn inst-btn-quiet">Indigenes directory</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
