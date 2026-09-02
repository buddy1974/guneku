import { getAllKingdomArticles, getKingdomArticle } from '@/lib/content'
import { pageMetadata, excerptFrom } from '@/lib/seo'
import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { ArticleBody } from '@/components/layout/ArticleBody'
import { EditorialLead } from '@/components/layout/EditorialLead'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const a = getKingdomArticle(slug) as Record<string, any> | null
  if (!a) return {}
  const meta = pageMetadata({
    title: String(a.title),
    description: excerptFrom(a.metaDescription || a.body),
    path: `/kingdom/${slug}`,
    image: typeof a.featuredImage === 'string' ? a.featuredImage : null,
    imageAlt: String(a.title),
    type: 'article',
    publishedTime: typeof a.publishedAt === 'string' ? a.publishedAt : null,
  })
  /* An unsupported stub stays reachable but out of the index until it has content. */
  return a.noindex ? { ...meta, robots: { index: false, follow: true } } : meta
}

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
    <main style={{ backgroundColor:'oklch(0.965 0.012 85)', minHeight:'100vh' }}>
      <PageHero label="THE KINGDOM" title={article.title.toUpperCase()} />
      <section style={{ maxWidth:'900px', margin:'0 auto', padding:'4rem 1.5rem' }}>
        <EditorialLead
          src={(article as any).leadImage ?? null}
          alt={(article as any).leadImageAlt ?? null}
          caption={(article as any).leadImageCaption ?? null}
          category="The Kingdom"
        />

        <ArticleBody body={article.body} />
        <div style={{ marginTop:'4rem', paddingTop:'2rem',
                      borderTop:'1px solid oklch(0.878 0.010 90)' }}>
          <Link href="/kingdom" style={{
            color:'oklch(0.320 0.060 158)', fontFamily:'var(--font-sans)',
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
