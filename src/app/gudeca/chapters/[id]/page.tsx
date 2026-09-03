import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { FoundingNames } from '@/components/community/FoundingNames'
import { allChapters, getChapter, foundingCount, placeLabel, parentChapter } from '@/lib/community'
import { pageMetadata } from '@/lib/seo'

export async function generateStaticParams() {
  return allChapters().map(c => ({ id: c.id }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id } = await params
  const c = getChapter(id)
  if (!c) return {}
  return pageMetadata({
    title: c.kind === 'chapter' ? c.org : `${c.country} — ${c.org}`,
    description: `Guneku sons and daughters in ${placeLabel(c)}. See who is recorded, add a name, or claim your own entry.`,
    path: `/gudeca/chapters/${id}`,
  })
}

/* A chapter or a place, with a register and a front door into the directory.
   Home and diaspora get the same treatment — the same register, the same Add a
   name, the same claim route — because a son of Guneku in Douala belongs on the
   list on the same terms as one in Europe.

   A location under a chapter (Germany under GUDECA EU) shows that chapter's
   register rather than one of its own, and says so. Its names are the chapter's
   names; it is a place, not a second chapter. */
export default async function ChapterPage({
  params,
}: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const chapter = getChapter(id)
  if (!chapter) notFound()

  const parent = parentChapter(chapter)
  const count  = foundingCount(chapter.id)
  const peers  = allChapters().filter(c => c.scope === chapter.scope && c.id !== chapter.id)

  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <PageHero
        label={
          chapter.kind === 'location'
            ? (chapter.scope === 'home' ? 'HOME COMMUNITY' : 'WHERE OUR PEOPLE ARE')
            : (chapter.scope === 'home' ? 'HOME CHAPTER' : 'DIASPORA CHAPTER')
        }
        title={`${chapter.flag} ${chapter.kind === 'location' ? chapter.country : chapter.org}`}
        subtitle={`${chapter.place}.${chapter.note ? ` ${chapter.note}` : ''}`}
      />

      <section className="inst-wrap inst-sec">
        <div className="inst-card grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="inst-tag">{parent ? `Recorded with ${parent.org}` : 'Recorded here'}</p>
            <p className="inst-h3 mt-1">
              {count === 0 ? 'Nobody yet' : `${count} ${count === 1 ? 'name' : 'names'}`}
            </p>
            <p className="inst-body mt-1 !text-[0.88rem]">
              {parent
                ? <>{chapter.country} sits under <Link href={`/gudeca/chapters/${parent.id}`} className="inst-link">{parent.org}</Link>, so names here are recorded with that chapter.</>
                : 'Anyone may add a name — their own, or someone they know belongs here.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/indigenes/submit?intent=add&chapter=${chapter.id}`} className="inst-btn inst-btn-primary">
              Add a name
            </Link>
            <Link href="/indigenes/onboarding" className="inst-btn inst-btn-quiet">
              Create my profile
            </Link>
          </div>
        </div>
      </section>

      <section className="inst-wrap pb-[clamp(2.25rem,4.5vw,3.5rem)]">
        <FoundingNames
          chapterId={chapter.id}
          heading={parent ? `${parent.org} — names on record` : 'Names on record'}
        />
      </section>

      <section className="inst-alt inst-rule">
        <div className="inst-wrap inst-sec">
          <h2 className="inst-h2">
            {chapter.scope === 'home' ? 'Elsewhere at home' : 'Elsewhere in the diaspora'}
          </h2>
          <ul className="mt-4 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {peers.map(c => (
              <li key={c.id} className="inst-card p-4">
                <Link href={`/gudeca/chapters/${c.id}`} className="no-underline">
                  <p className="inst-h3 group-hover:text-[var(--burgundy-i)]">
                    {c.flag} {c.country}
                  </p>
                  <p className="inst-meta mt-1">{c.place} · {c.org}</p>
                  <p className="inst-meta mt-2">
                    {foundingCount(c.id)} on record
                  </p>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link href="/diaspora" className="inst-link">The diaspora →</Link>
            <Link href="/gudeca" className="inst-link">GUDECA →</Link>
            <Link href="/indigenes" className="inst-link">The full directory →</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
