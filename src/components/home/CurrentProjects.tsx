import Link from 'next/link'
import Image from 'next/image'
import current from '@/data/current-notices.json'
import gallery from '@/data/gallery/image-gallery.json'

type Entry = {
  name: string; class?: string; status: string; statusClass: string
  body: string; lastUpdate: string; description: string; href: string
}

/* Pictures come from approved albums only, chosen for subject rather than convenience.
   A project with no defensible photograph shows no photograph. */
const PROJECT_IMAGE: Record<string, { album: string; index: number; alt: string }> = {
  'Tonmukom–Windik Road': {
    album: 'thetonmukom-windikroadwork', index: 0,
    alt: 'Work under way on the Tonmukom–Windik road through Guneku.',
  },
  'Guneku Royal Community Library': {
    album: 'guneku-royal-community-library', index: 0,
    alt: 'Readers at tables inside the Guneku Royal Community Library.',
  },
}

function imageFor(name: string) {
  const m = PROJECT_IMAGE[name]
  if (!m) return null
  const album = gallery.albums.find(a => a.id === m.album)
  const img = album?.images?.[m.index]
  return img ? { src: img.publicPath, alt: m.alt } : null
}

const STATUS_COLOUR: Record<string, string> = {
  'st-active': 'var(--royal-green)',
  'st-ongoing': 'var(--royal-green)',
  'st-proposed': 'var(--ink-400)',
  'st-historical': 'var(--ink-400)',
}

/* The register is the single source; nothing is retyped here. This is a curated view of
   the work actually under way — the full register lives at /projects. */
export function CurrentProjects() {
  const register = current.development as Entry[]
  const featured = ['Guneku Agro CIG', 'Solar Electrification Phase II', 'GUYODECA bridge construction',
                    'Guneku Royal Community Library', 'Afor Foundation Scholarship', 'Tonmukom–Windik Road']
    .map(n => register.find(e => e.name === n))
    .filter((e): e is Entry => Boolean(e))

  return (
    <section className="inst-rule border-b border-[var(--rule)]" aria-labelledby="projects-heading">
      <div className="inst-wrap inst-sec">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="inst-eyebrow">Development</p>
            <h2 id="projects-heading" className="inst-h2 mt-1.5">Work under way in Guneku</h2>
            <p className="inst-body mt-2 max-w-2xl">
              Each entry is shown at the stage its own sources establish. A proposal is
              recorded as a proposal.
            </p>
          </div>
          <Link href="/projects" className="inst-btn inst-btn-quiet">View all projects</Link>
        </div>

        <div className="mt-6 grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map(p => {
            const img = imageFor(p.name)
            const colour = STATUS_COLOUR[p.statusClass] ?? 'var(--ink-400)'
            return (
              <article key={p.name} className="inst-card flex h-full flex-col overflow-hidden">
                {img && (
                  <div className="relative aspect-[16/10] w-full bg-[var(--stone)]">
                    <Image src={img.src} alt={img.alt} fill unoptimized loading="lazy"
                           sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                           className="object-cover" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inst-tag">{p.class}</span>
                    <span className="text-[0.66rem] font-bold uppercase tracking-[0.07em]"
                          style={{ color: colour }}>{p.status}</span>
                  </div>
                  <h3 className="inst-h3 mt-1.5">{p.name}</h3>
                  <p className="inst-body mt-2 flex-1 !text-[0.86rem]">{p.description}</p>
                  <p className="inst-meta mt-3">{p.body} · {p.lastUpdate}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                    <Link href={p.href} className="inst-link">View project →</Link>
                    <Link href={`/support?project=${encodeURIComponent(p.name)}`} className="inst-link">
                      Support this project →
                    </Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
