import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, CalendarDays, MapPin } from 'lucide-react'
import { FestivalCountdown } from './FestivalCountdown'
import { FESTIVAL, FESTIVAL_PATH, GALLERY, festivalUpdates, shortDate } from '@/lib/festival'

/* Michi Ebeng 2027 on the front page.
 *
 * The one band on the homepage that is allowed to be loud. It sits straight after the
 * village's own introduction — the reader first learns where they are, then what the village
 * is preparing — and it gives the space back a month after the festival closes.
 *
 * Every photograph in it is from an earlier edition at the Guneku Palace and the caption
 * says so. No picture of the 2027 festival exists yet, and none is implied.
 *
 * The programme preview shows the agreed items and the proposals under separate labels, so
 * the front page never promises what the committee has only discussed. */

const [LEAD, SECOND, THIRD] = [GALLERY[0], GALLERY[2], GALLERY[3]]

export function FestivalRibbon() {
  return (
    <Link href="/events/michi-ebeng-2027" className="fest-ribbon">
      <span className="fest-ribbon-inner inst-wrap">
        <span className="fest-ribbon-tag">{FESTIVAL.status.label}</span>
        <span className="fest-ribbon-text">
          <strong>Michi Ebeng 2027</strong>
          <span aria-hidden="true"> · </span>
          {FESTIVAL.dates.display}
          <span className="fest-ribbon-venue"><span aria-hidden="true"> · </span>{FESTIVAL.venue.display}</span>
        </span>
        <span className="fest-ribbon-cta">
          Explore the festival <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </span>
    </Link>
  )
}

export function FestivalFeature({ now }: { now: number }) {
  const updates = festivalUpdates().slice(0, 3)
  const agreed = FESTIVAL.established.slice(1, 3)
  const proposed = FESTIVAL.proposals.slice(0, 4)

  return (
    <section className="fest-band" aria-labelledby="fest-home-title">
      <div className="inst-wrap fest-band-inner">
        <div className="fest-home-grid">
          <div className="fest-home-copy">
            <p className="fest-eyebrow">
              <span className="fest-status">{FESTIVAL.status.label}</span>
              <span className="fest-meta-name" lang="mgo">Mɨchi Əbeŋ</span><span>The Meta festival of return</span>
            </p>

            <h2 id="fest-home-title" className="fest-title">
              Michi Ebeng <span className="fest-title-year">2027</span>
            </h2>

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
            <p className="fest-lede">
              Two days of Meta heritage in Limbe — the Kem dance competition, traditional
              dances, food and community. This edition is held in Limbe while the Guneku
              Palace is renovated.
            </p>

            <FestivalCountdown initialNow={now} />
            <p className="fest-small">{FESTIVAL.dates.timeNote}</p>

            <div className="fest-ctas">
              <Link href="/events/michi-ebeng-2027" className="fest-btn fest-btn-primary">
                Explore Michi Ebeng 2027 <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href={`${FESTIVAL_PATH}#planning`} className="fest-btn fest-btn-ghost">
                View festival planning
              </Link>
              <Link href={`${FESTIVAL_PATH}#history`} className="fest-link">
                Discover Michi Ebeng history →
              </Link>
            </div>
          </div>

          <figure className="fest-mosaic">
            <div className="fest-mosaic-lead">
              <Image src={LEAD.src} alt={LEAD.alt} fill sizes="(max-width: 64rem) 100vw, 40rem" className="object-cover" />
            </div>
            <div className="fest-mosaic-side">
              <Image src={SECOND.src} alt={SECOND.alt} fill sizes="(max-width: 64rem) 50vw, 20rem" className="object-cover" />
            </div>
            <div className="fest-mosaic-side">
              <Image src={THIRD.src} alt={THIRD.alt} fill sizes="(max-width: 64rem) 50vw, 20rem" className="object-cover" />
            </div>
            <figcaption className="fest-mosaic-caption">
              Photographs from the maiden edition at the Guneku Palace, April 2023.
            </figcaption>
          </figure>
        </div>

        <div className="fest-home-cards">
          <article className="fest-card">
            <p className="fest-card-tag">The competition</p>
            <h3 className="fest-card-title">The Kem dance</h3>
            <p className="fest-card-body">{FESTIVAL.kem.summary}</p>
            <Link href={`${FESTIVAL_PATH}#kem`} className="fest-link mt-auto">About the Kem dance →</Link>
          </article>

          <article className="fest-card">
            <p className="fest-card-tag">The programme</p>
            <h3 className="fest-card-title">Agreed, and proposed</h3>
            <ul className="fest-mini-list">
              {agreed.map(i => (
                <li key={i.title}><span className="fest-label fest-label-agreed">Agreed</span>{i.title}</li>
              ))}
              {proposed.map(i => (
                <li key={i.title}><span className="fest-label fest-label-proposed">Proposed</span>{i.title}</li>
              ))}
            </ul>
            <Link href={`${FESTIVAL_PATH}#programme`} className="fest-link mt-auto">The full programme →</Link>
          </article>

          <article className="fest-card">
            <p className="fest-card-tag">Planning updates</p>
            <h3 className="fest-card-title">From the committee</h3>
            {updates.length > 0 ? (
              <ul className="fest-update-list">
                {updates.map(u => (
                  <li key={u.slug}>
                    <time dateTime={u.publishedAt ?? undefined}>{u.publishedAt ? shortDate(u.publishedAt) : ''}</time>
                    <Link href={`/updates/${u.slug}`}>{u.title}</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="fest-card-body">The first update will appear here.</p>
            )}
            <Link href={`${FESTIVAL_PATH}#updates`} className="fest-link mt-auto">All planning updates →</Link>
          </article>
        </div>
      </div>
    </section>
  )
}
