import { getAllPalaceArticles, getPalaceArticle } from '@/lib/content'
import { PageHero } from '@/components/layout/PageHero'
import { ArticleBody } from '@/components/layout/ArticleBody'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export async function generateStaticParams() {
  const articles = getAllPalaceArticles()
  return articles.map((a: any) => ({ slug: a.slug }))
}

export default async function PalaceArticlePage({
  params
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getPalaceArticle(slug)
  if (!article) notFound()

  return (
    <main style={{ backgroundColor:'oklch(0.965 0.012 85)', minHeight:'100vh' }}>
      <PageHero
        label={(article as any).era === 'legacy' ? 'ROYAL LEGACY' : 'THE PALACE'}
        title={article.title.toUpperCase()}
      />
      <section style={{ maxWidth:'900px', margin:'0 auto', padding:'4rem 1.5rem' }}>
        <ArticleBody body={article.body} />
        <div style={{ marginTop:'4rem', paddingTop:'2rem',
                      borderTop:'1px solid oklch(0.878 0.010 90)' }}>
          <Link href="/palace" style={{
            color:'oklch(0.320 0.060 158)', fontFamily:'var(--font-sans)',
            fontSize:'0.8rem', letterSpacing:'0.1em',
            textTransform:'uppercase', textDecoration:'none',
          }}>
            ← Back to The Palace
          </Link>
        </div>
      </section>
    </main>
  )
}
