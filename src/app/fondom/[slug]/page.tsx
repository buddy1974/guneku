import { getAllFondomArticles, getFondomArticle } from '@/lib/content'
import { pageMetadata, excerptFrom } from '@/lib/seo'
import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { ArticleBody } from '@/components/layout/ArticleBody'
import { EditorialLead } from '@/components/layout/EditorialLead'
import { notFound } from 'next/navigation'
import Link from 'next/link'

/* The optional editorial fields a migrated article may carry. Naming them is what lets a
   renamed `leadImage` fail here rather than render as a missing picture. */
type FondomArticleView = {
  title: string
  slug: string
  body: string
  metaDescription?: string | null
  featuredImage?: string | null
  leadImage?: string | null
  leadImageAlt?: string | null
  leadImageCaption?: string | null
  publishedAt?: string | null
  noindex?: boolean
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const a = getFondomArticle(slug) as FondomArticleView | null
  if (!a) return {}
  const meta = pageMetadata({
    title: String(a.title),
    description: excerptFrom(a.metaDescription || a.body),
    path: `/fondom/${slug}`,
    image: typeof a.featuredImage === 'string' ? a.featuredImage : null,
    imageAlt: String(a.title),
    type: 'article',
    publishedTime: typeof a.publishedAt === 'string' ? a.publishedAt : null,
  })
  /* An unsupported stub stays reachable but out of the index until it has content. */
  return a.noindex ? { ...meta, robots: { index: false, follow: true } } : meta
}

export async function generateStaticParams() {
  return getAllFondomArticles().map((a: { slug: string }) => ({ slug: a.slug }))
}

export default async function FondomArticlePage({
  params
}: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getFondomArticle(slug)
  if (!article) notFound()

  return (
    <main style={{ backgroundColor:'oklch(0.965 0.012 85)', minHeight:'100vh' }}>
      <PageHero label="THE FONDOM" title={article.title.toUpperCase()} />
      <section style={{ maxWidth:'900px', margin:'0 auto', padding:'4rem 1.5rem' }}>
        <EditorialLead
          src={(article as FondomArticleView).leadImage ?? null}
          alt={(article as FondomArticleView).leadImageAlt ?? null}
          caption={(article as FondomArticleView).leadImageCaption ?? null}
          category="The Fondom"
        />

        <ArticleBody body={article.body} />
        <div style={{ marginTop:'4rem', paddingTop:'2rem',
                      borderTop:'1px solid oklch(0.878 0.010 90)' }}>
          <Link href="/fondom" style={{
            color:'oklch(0.320 0.060 158)', fontFamily:'var(--font-sans)',
            fontSize:'0.8rem', letterSpacing:'0.1em',
            textTransform:'uppercase', textDecoration:'none',
          }}>
            ← Back to The Fondom
          </Link>
        </div>
      </section>
    </main>
  )
}
