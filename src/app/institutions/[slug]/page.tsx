import { getAllInstitutions, getInstitution } from '@/lib/content'
import { PageHero } from '@/components/layout/PageHero'
import { Reveal }   from '@/components/ui/Reveal'
import { notFound } from 'next/navigation'
import Link         from 'next/link'

/* Detail pages exist only for institutions that have no page of their own already.
   Where a dedicated page exists the record carries a `route` and the index links
   straight there — one subject, one page. */
export async function generateStaticParams() {
  /* No page is generated for a record that already has a home (`route`), nor for one
     held from public surfacing. One subject, one page — and held means held. */
  return getAllInstitutions()
    .filter(i => typeof i.route !== 'string' && i.publicVisibility !== 'hold')
    .map(i => ({ slug: i.id }))
}

/* Keys handled explicitly, or deliberately not shown. */
const SKIP = new Set([
  'id', 'type', 'name', 'description', 'route',
  'relatedUpdates', 'relatedRoutes', 'albums', 'sourceNote', 'sourceType',
])

const LABELS: Record<string, string> = {
  status: 'Status', category: 'Category', role: 'Role', patron: 'Patron',
  venue: 'Venue', founder: 'Founder', catchment: 'Catchment', prize: 'Prize',
  scholarshipType: 'Scholarship', abbreviation: 'Also known as',
  location: 'Location', launchDate: 'Launched', consentNote: 'Contact details',
  spellingConflict: 'On the spelling', diasporaMirror: 'In the diaspora',
  metaContext: 'Meta context', asRecorded: 'As recorded',
}

function humanise(key: string) {
  return LABELS[key] || key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase())
}

function ScalarRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex flex-col gap-1 py-2.5 border-b border-border/30 sm:flex-row sm:justify-between sm:gap-6">
      <span className="text-muted-foreground text-sm tracking-wide shrink-0">{humanise(k)}</span>
      <span className="text-foreground text-sm sm:text-right sm:max-w-[70%]">{v}</span>
    </div>
  )
}

function ObjectCard({ obj }: { obj: Record<string, unknown> }) {
  return (
    <div className="card-royal p-5">
      {Object.entries(obj).map(([k, v]) => {
        if (v === null || v === undefined || v === '') return null
        if (Array.isArray(v)) {
          return (
            <div key={k} className="mb-2">
              <div className="section-label mb-1.5">{humanise(k)}</div>
              <ul className="list-none p-0 m-0 space-y-1">
                {v.map((item, i) => (
                  <li key={i} className="text-muted-foreground text-sm leading-relaxed">
                    {typeof item === 'string' ? item : JSON.stringify(item)}
                  </li>
                ))}
              </ul>
            </div>
          )
        }
        if (typeof v === 'object') return null
        return (
          <div key={k} className="mb-1.5">
            <span className="text-muted-foreground text-xs tracking-wide">{humanise(k)}: </span>
            <span className="text-foreground text-sm">{String(v)}</span>
          </div>
        )
      })}
    </div>
  )
}

export default async function InstitutionPage({
  params,
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const inst = getInstitution(slug) as Record<string, unknown> | null
  if (!inst || inst.route || inst.publicVisibility === 'hold') notFound()

  const scalars = Object.entries(inst)
    .filter(([k, v]) => !SKIP.has(k) && v !== null && v !== undefined && v !== '' && typeof v !== 'object')
  const stringLists = Object.entries(inst)
    .filter(([k, v]) => !SKIP.has(k) && Array.isArray(v) && v.length > 0 && v.every(x => typeof x === 'string'))
  const objectLists = Object.entries(inst)
    .filter(([k, v]) => !SKIP.has(k) && Array.isArray(v) && v.length > 0 && v.every(x => x && typeof x === 'object'))
  const objectFields = Object.entries(inst)
    .filter(([k, v]) => !SKIP.has(k) && v && typeof v === 'object' && !Array.isArray(v))

  return (
    <main className="min-h-screen bg-background">
      <PageHero
        label={String(inst.category || 'INSTITUTION').toUpperCase()}
        title={String(inst.name).toUpperCase()}
        subtitle={inst.role ? String(inst.role) : undefined} />

      <Reveal>
        <section className="max-w-4xl mx-auto px-6 py-14">
          {typeof inst.description === 'string' && (
            <p className="text-foreground/90 leading-relaxed">{String(inst.description)}</p>
          )}

          {scalars.length > 0 && (
            <div className="mt-10">
              <div className="section-label mb-3">THE RECORD</div>
              {scalars.map(([k, v]) => <ScalarRow key={k} k={k} v={String(v)} />)}
            </div>
          )}

          {stringLists.map(([k, v]) => (
            <div key={k} className="mt-10">
              <div className="section-label mb-3">{humanise(k).toUpperCase()}</div>
              <ul className="list-none p-0 m-0 space-y-2">
                {(v as string[]).map((item, i) => (
                  <li key={i} className="text-muted-foreground text-sm leading-relaxed pl-4 relative">
                    <span className="absolute left-0 top-[0.55rem] h-1 w-1 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {objectLists.map(([k, v]) => (
            <div key={k} className="mt-10">
              <div className="section-label mb-3">{humanise(k).toUpperCase()}</div>
              <div className="grid gap-4 md:grid-cols-2">
                {(v as Record<string, unknown>[]).map((o, i) => <ObjectCard key={i} obj={o} />)}
              </div>
            </div>
          ))}

          {objectFields.map(([k, v]) => (
            <div key={k} className="mt-10">
              <div className="section-label mb-3">{humanise(k).toUpperCase()}</div>
              <ObjectCard obj={v as Record<string, unknown>} />
            </div>
          ))}

          {Array.isArray(inst.relatedUpdates) && inst.relatedUpdates.length > 0 && (
            <div className="mt-10">
              <div className="section-label mb-3">IN THE NEWS ARCHIVE</div>
              <ul className="list-none p-0 m-0 space-y-2">
                {(inst.relatedUpdates as string[]).map(s => (
                  <li key={s}>
                    <Link href={`/updates/${s}`} className="text-primary text-sm tracking-wide no-underline hover:underline">
                      {s.replace(/-/g, ' ')} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {typeof inst.sourceNote === 'string' && (
            <p className="mt-12 text-muted-foreground/70 text-xs leading-relaxed border-t border-border/40 pt-5">
              {String(inst.sourceNote)}
            </p>
          )}

          <div className="mt-10">
            <Link href="/institutions" className="text-primary text-xs tracking-widest no-underline hover:underline">
              ← All institutions
            </Link>
          </div>
        </section>
      </Reveal>
    </main>
  )
}
