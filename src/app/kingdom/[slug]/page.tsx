import { getAllKingdomArticles, getKingdomArticle } from '@/lib/content'
import { PageHero } from '@/components/layout/PageHero'
import { ArticleBody } from '@/components/layout/ArticleBody'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export async function generateStaticParams() {
  return getAllKingdomArticles().map((a: any) => ({ slug: a.slug }))
}

export default async function KingdomArticlePage({
  params
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getKingdomArticle(slug)
  if (!article) notFound()

  return (
    <main style={{ backgroundColor:'#0F0F0F', minHeight:'100vh' }}>
      <PageHero label="THE KINGDOM" title={article.title.toUpperCase()} />
      <section style={{ maxWidth:'900px', margin:'0 auto', padding:'4rem 1.5rem' }}>
        <ArticleBody body={article.body} />
        <div style={{ marginTop:'4rem', paddingTop:'2rem',
                      borderTop:'1px solid rgba(255,255,255,0.08)' }}>
          <Link href="/kingdom" style={{
            color:'#f2a90b', fontFamily:'Syne, sans-serif',
            fontSize:'0.8rem', letterSpacing:'0.1em',
            textTransform:'uppercase', textDecoration:'none',
          }}>
            ← Back to The Kingdom
          </Link>
        </div>
      </section>
    </main>
  )
}
