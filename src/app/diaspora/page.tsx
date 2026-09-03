import Link  from 'next/link'
import { ArrowRight } from 'lucide-react'
import { diasporaNames, diasporaByChapter } from '@/lib/community'
import { Reveal } from '@/components/ui/Reveal'
import { chaptersByScope, foundingCount } from '@/lib/community'

export const metadata = {
  alternates: { canonical: '/diaspora' },
  title: 'Diaspora — Guneku Across Three Continents',
  description: 'Guneku sons and daughters across the world — GUDECA chapters in Cameroon, Europe and North America.',
}

/* The places Guneku people are organised come from one register,
   `src/data/community/chapters.json`, shared with /gudeca and the chapter pages.
   Two hand-kept lists disagreed here before: both pinned the Europe chapter to a
   German city — first Essen, then Bonn — and both were wrong for the same reason.
   GUDECA EU is one chapter for the whole of Europe with no fixed seat; meetings
   rotate. Bonn is the official residence of H.R.H. the Fon, which is why the
   28 March 2026 meeting was held there.

   So this grid shows the chapter AND the countries beneath it: the countries are
   where members live, and each card leads to the register that holds their names.

   Per-country population counts previously shown here were not supported by any
   source in the repository and have been removed rather than guessed. */
const PLACES = chaptersByScope('diaspora')

export default function DiasporaPage() {
  const diaspora       = diasporaNames()
  const diasporaGroups = diasporaByChapter()

  return (
    <div className="min-h-screen bg-background">

      {/* ── HERO ── */}
      <section className="relative pt-40 pb-20 text-center">
        
        <div className="mx-auto max-w-5xl px-6 relative z-10">
          <div className="section-label animate-fade-up">ONE PEOPLE · MANY HORIZONS</div>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.85rem,3.4vw,2.7rem)] font-bold leading-[1.14] text-[var(--foreground)]" style={{ animationDelay: '0.15s' }}>
            The Diaspora
          </h1>
          <p className="mt-6 font-cormorant text-2xl italic text-foreground/90 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            From the volcanic hills of Mbengwi to the skylines of Tokyo —<br className="hidden md:block" />
            the kingdom travels with us.
          </p>
        </div>
      </section>

      {/* ── CSS GLOBE ── */}
      <Reveal>
        <section className="relative mx-auto max-w-7xl px-6 pb-24">
          {/* Inset on small screens so the orbiting country pills, which sit at
              96% of the circle, stay inside the viewport instead of overflowing. */}
          <div className="px-9 sm:px-4 md:px-0">
          <div className="relative mx-auto aspect-square max-w-2xl">
            {/* Circle — kept as the diaspora's information design. Institutional
                treatment only: beige ground, deep green rings, no glow, no spin. */}
            <div className="absolute inset-0 rounded-full border-2 border-[var(--primary)]/35 bg-[oklch(0.940_0.014_85)]" />
            <div className="absolute inset-[12%] rounded-full border border-[var(--primary)]/25" />
            <div className="absolute inset-[26%] rounded-full border border-[var(--primary)]/15" />

            {/* Center stats */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-8">
                <div className="font-[family-name:var(--font-display)] text-5xl font-bold text-[var(--primary)]">3</div>
                <div className="mt-2 section-label">CONTINENTS</div>
                <div className="mt-3 text-xs text-muted-foreground">8 constituted GUDECA chapters<br />in Cameroon, Europe and North America</div>
              </div>
            </div>

            {/* Orbiting flags */}
            {PLACES.slice(0, 8).map((p, i) => {
              const angle = (i / 8) * Math.PI * 2
              const r = 46
              const x = 50 + r * Math.cos(angle)
              const y = 50 + r * Math.sin(angle)
              return (
                <div key={p.country}
                     className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-[var(--primary)]/30 bg-[var(--primary)] px-2.5 py-1 text-[0.7rem] text-[oklch(0.975_0.010_85)] sm:px-3 sm:py-1.5 sm:text-xs"
                     style={{ left: `${x}%`, top: `${y}%` }}>
                  <span className="mr-1.5">{p.flag}</span>
                  <span className="font-medium">{p.country}</span>
                </div>
              )
            })}
          </div>
          </div>
        </section>
      </Reveal>

      {/* ── THE THREE MEASURES ──
          Three different things get counted in the sources, and they used to appear
          across the site as if they disagreed. They do not: a constituted chapter, a
          country that sent members to Bonn, and a place Guneku people are known to
          live are three separate measurements. Each is labelled as what it is. */}
      <Reveal>
        <section className="mx-auto max-w-7xl px-6 pb-16">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { n:'8',     l:'CONSTITUTED GUDECA CHAPTERS', d:'Across five countries and three continents.' },
              { n:'9',     l:'COUNTRIES AT BONN 2026',      d:'Countries members travelled from for the GUDECA EU meeting of 28 March 2026. Attendance, not chapters.' },
              { n:'12–13', l:'KNOWN DIASPORA LOCATIONS',    d:'Places where Guneku sons and daughters are known to live.' },
            ].map(m => (
              <div key={m.l} className="card-royal p-5">
                <div className="font-[family-name:var(--font-display)] text-4xl font-bold text-[var(--primary)]">{m.n}</div>
                <div className="mt-2 section-label">{m.l}</div>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{m.d}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* ── COUNTRY GRID ── */}
      <Reveal>
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {PLACES.map(p => {
              const on = foundingCount(p.id)
              return (
                <Link key={p.id} href={`/gudeca/chapters/${p.id}`}
                      className="group card-royal block p-5 no-underline transition-all">
                  <div className="mb-3">
                    <span className="text-4xl">{p.flag}</span>
                  </div>
                  <div className="font-cinzel text-lg text-foreground">{p.country}</div>
                  <div className="text-xs text-muted-foreground">{p.place}</div>
                  <div className="mt-1 text-xs text-primary/60">{p.org}</div>
                  {/* A country under a chapter shares that chapter's register, so it
                      points at the chapter rather than claiming a count of its own. */}
                  <div className="mt-3 border-t border-border pt-2 text-xs text-muted-foreground">
                    {p.partOf
                      ? 'GUDECA EU Chapter →'
                      : on === 0 ? 'Add the first name →' : `${on} on record →`}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </Reveal>

      {/* ── ADD A NAME ──
          The register is only as complete as the community makes it, so the way in
          sits on the page rather than behind a form somewhere else. Home chapters
          carry the same invitation on their own pages. */}
      <Reveal>
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="card-royal grid gap-4 p-6 sm:grid-cols-[1fr_auto] sm:items-center md:p-8">
            <div>
              <div className="section-label">EVERY CHAPTER IS OPEN</div>
              <h2 className="mt-2 font-cinzel text-2xl text-foreground">
                Know a son or daughter of Guneku who is not here?
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                Put the name forward — your own, or someone you know belongs. The Palace
                checks it, then the person is invited to complete their own profile and
                decide what it shows. Nobody writes another person&rsquo;s profile for them.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/indigenes/submit?intent=add" className="btn-royal inline-flex">Add a name</Link>
              <Link href="/indigenes" className="btn-royal-outline inline-flex">The directory</Link>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── THE DIASPORA COMMUNITY ──
           This replaced a hard-coded pair of cards headed "Notable Sons & Daughters —
           Guneku Excellence Worldwide", which was wrong twice over. Diaspora is not a rank:
           it means a Guneku person living outside Cameroon, and showing two distinguished
           professionals as though they were the worldwide community misrepresented both the
           word and everyone it left out. The list below is derived from the register, so it
           grows as the record does and can never again be a curated two. */}
      <Reveal>
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <div className="mb-10">
            <div className="section-label mb-4">GUNEKU PEOPLE ABROAD</div>
            <h2 className="font-cinzel text-4xl text-foreground">
              Guneku people abroad
            </h2>
            <p className="text-muted-foreground mt-3 max-w-3xl">
              {/* The count is what the register holds, and the sentence says exactly that.
                  Guneku's diaspora is far larger than any list on this site: writing "17
                  people abroad" would state a figure about the community that nobody has
                  established, from a number that only describes a register. */}
              <strong className="text-foreground">{diaspora.length}</strong> people are recorded
              here so far &mdash; those the register names as living outside Cameroon, or as
              members of an overseas GUDECA chapter. It is a record of who has been written
              down, not a count of the Guneku diaspora, which is very much larger.
            </p>
            <p className="text-muted-foreground mt-3 max-w-3xl">
              Belonging to the diaspora says where someone lives and
              nothing else &mdash; it is not a title, and it is separate from being a{' '}
              <Link href="/notables" className="text-primary underline-offset-2 hover:underline">
                Notable of Guneku
              </Link>, which is a place in the village&rsquo;s traditional governance.
            </p>
            <p className="text-muted-foreground/80 mt-2 max-w-3xl text-sm">
              Members of the Yaound&eacute;, Douala, Bamenda and Mbengwi chapters live in
              Cameroon and are not of the diaspora, whatever office they hold.
            </p>
          </div>

          {diasporaGroups.map(group => (
            <div key={group.chapter.id} className="mb-10">
              <h3 className="font-cinzel text-2xl text-foreground">
                {group.chapter.flag} {group.chapter.org} &mdash; {group.chapter.place}
              </h3>
              <p className="text-muted-foreground/70 text-xs tracking-widest mt-1">
                {group.people.length} {group.people.length === 1 ? 'person' : 'people'} recorded
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                {group.people.map(n => {
                  const inner = (
                    <>
                      <div className="h-0.5 w-6 bg-gold-gradient mb-4" />
                      <h4 className="font-cinzel text-lg text-foreground">{n.display}</h4>
                      {n.role && <p className="text-muted-foreground text-sm mt-1">{n.role}</p>}
                      {n.profession && (
                        <p className="text-muted-foreground text-sm mt-1">{n.profession}</p>
                      )}
                      {n.residence && (
                        <p className="text-primary/50 text-xs mt-2 tracking-widest">{n.residence}</p>
                      )}
                      {n.notable && (
                        <p className="text-primary/70 text-xs mt-2 tracking-widest">
                          A NOTABLE OF GUNEKU
                        </p>
                      )}
                    </>
                  )
                  return n.profileUrl ? (
                    <Link key={n.slug} href={n.profileUrl} className="card-royal p-6 block no-underline group">
                      {inner}
                      <div className="mt-4 flex items-center gap-2 text-primary text-xs tracking-widest">
                        Full profile <ArrowRight className="h-3 w-3" />
                      </div>
                    </Link>
                  ) : (
                    <div key={n.slug} className="card-royal p-6">{inner}</div>
                  )
                })}
              </div>
            </div>
          ))}
        </section>
      </Reveal>
    </div>
  )
}
