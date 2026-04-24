import { getAllUpdates, getUpdate } from '@/lib/content'
import { PageHero } from '@/components/layout/PageHero'
import { ArticleBody } from '@/components/layout/ArticleBody'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export async function generateStaticParams() {
  return getAllUpdates().map((u: any) => ({ slug: u.slug }))
}

export default async function UpdatePage({
  params
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const update = getUpdate(slug)
  if (!update) notFound()

  return (
    <main style={{ backgroundColor:'#0F0F0F', minHeight:'100vh' }}>
      <PageHero
        label="THE VILLAGE SQUARE"
        title={update.title.toUpperCase()}
        subtitle={update.publishedAt
          ? new Date(update.publishedAt).toLocaleDateString('en-GB',
              { day:'numeric', month:'long', year:'numeric' })
          : ''}
      />

      <section style={{ maxWidth:'900px', margin:'0 auto', padding:'4rem 1.5rem' }}>

        {/* YouTube embeds if any */}
        {(update as any).youtubeEmbeds?.length > 0 && (
          <div style={{ marginBottom:'2.5rem' }}>
            {(update as any).youtubeEmbeds.map((v: any) => (
              <div key={v.videoId}
                   style={{ position:'relative', paddingBottom:'56.25%',
                            height:0, overflow:'hidden', marginBottom:'1rem' }}>
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${v.videoId}`}
                  title={v.title || 'Video'}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                  allowFullScreen
                  style={{ position:'absolute', top:0, left:0,
                           width:'100%', height:'100%', border:'none' }}
                />
              </div>
            ))}
          </div>
        )}

        <ArticleBody body={update.body} />

        <div style={{ marginTop:'4rem', paddingTop:'2rem',
                      borderTop:'1px solid rgba(255,255,255,0.08)' }}>
          <Link href="/updates" style={{
            color:'#f2a90b', fontFamily:'Syne, sans-serif',
            fontSize:'0.8rem', letterSpacing:'0.1em',
            textTransform:'uppercase', textDecoration:'none',
          }}>
            ← Back to Village Square
          </Link>
        </div>
      </section>
    </main>
  )
}
