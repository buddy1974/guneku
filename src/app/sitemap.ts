import type { MetadataRoute } from 'next'
import { recordedQuarters } from '@/lib/quarter-pages'
import { getAllNotables, getImageGallery } from '@/lib/content'
import {
  publicUpdates, publicPalaceArticles, publicKingdomArticles, sitemapInstitutions,
} from '@/lib/visibility'
import { SITE_URL } from '@/lib/seo'

type Entry = MetadataRoute.Sitemap[number]

const at = (path: string, opts: Partial<Entry> = {}): Entry => ({
  url: path === '/' ? SITE_URL : `${SITE_URL}${path}`,
  lastModified: new Date(),
  changeFrequency: 'monthly',
  priority: 0.6,
  ...opts,
})

/* What may appear here is decided by `src/lib/visibility.ts`, the same predicate the search
   index uses, rather than by filters written out again in this file. The sitemap previously
   read the raw loaders for updates and Palace articles with no published check — harmless
   today, because every update carries a date, but it is precisely the latent divergence the
   shared predicate exists to remove.

   Held, private and transactional routes remain absent: /sign-in, /sign-up, /my-guneku,
   /indigenes/profile, /indigenes/onboarding, the held Business Directory, the empty Kingdom
   stubs, and any institution whose content lives on another page. */
export default function sitemap(): MetadataRoute.Sitemap {
  const statics: Entry[] = [
    at('/', { priority: 1.0, changeFrequency: 'weekly' }),
    at('/kingdom', { priority: 0.9 }),
    at('/palace', { priority: 0.9 }),
    at('/palace/fon-walters-profile', { priority: 0.8 }),
    at('/gudeca', { priority: 0.8 }),
    at('/gudeca/gudeca-exco'),
    at('/gudeca/guyodeca'),
    at('/guneccul'),
    at('/agro-cig', { priority: 0.8 }),
    at('/education', { priority: 0.8, changeFrequency: 'weekly' }),
    at('/projects', { priority: 0.8 }),
    at('/institutions', { priority: 0.8 }),
    at('/quarters', { priority: 0.8 }),
    at('/explore', { priority: 0.8 }),
    at('/search', { priority: 0.5 }),
    at('/diaspora', { priority: 0.8 }),
    at('/notables'),
    at('/indigenes'),
    at('/updates', { priority: 0.9, changeFrequency: 'weekly' }),
    at('/gallery'),
    at('/gallery/images'),
    /* /gallery/videos redirects to /watch, so only one film library is indexable. */
    at('/watch', { priority: 0.8, changeFrequency: 'monthly' }),
    at('/contact'),
  ]

  const updates = publicUpdates().map(u =>
    at(`/updates/${u.slug}`, {
      lastModified: u.publishedAt ? new Date(u.publishedAt) : new Date(),
      changeFrequency: 'yearly',
      priority: 0.7,
    }))

  const palace = publicPalaceArticles().map(a =>
    at(`/palace/${a.slug}`, { changeFrequency: 'yearly', priority: 0.7 }))

  /* Unsupported stubs are excluded until they carry content. */
  const kingdom = publicKingdomArticles()
    .map(a => at(`/kingdom/${a.slug}`, { changeFrequency: 'yearly', priority: 0.7 }))

  const notables = getAllNotables().map(n =>
    at(`/notables/${n.slug}`, { changeFrequency: 'yearly' }))

  /* Only institutions that own a page. The routed ones are searchable and link to where
     their content actually lives, but must not be given a URL of their own here. */
  const institutions = sitemapInstitutions()
    .map(i => at(`/institutions/${i.id}`, { changeFrequency: 'yearly', priority: 0.7 }))

  /* Only quarters the archive actually says something about. A page reading "nothing
     recorded yet" is honest for a reader who arrives at it, but offering seventeen of them
     to a search engine would be thin content — and would invite people in to be told the
     Fondom knows nothing about their quarter. They become indexable when they have content;
     the pages themselves carry robots:noindex until then. */
  const quarters = recordedQuarters().map(q =>
    at(`/quarters/${q.slug}`, { changeFrequency: 'monthly', priority: 0.6 }))

  const albums = (getImageGallery()?.albums || []).map(a =>
    at(`/gallery/images/${a.id}`, { changeFrequency: 'yearly', priority: 0.5 }))

  return [...statics, ...updates, ...palace, ...kingdom, ...notables, ...institutions,
          ...quarters, ...albums]
}
