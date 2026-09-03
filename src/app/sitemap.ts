import type { MetadataRoute } from 'next'
import { recordedQuarters } from '@/lib/quarter-pages'
import {
  getAllUpdates, getAllPalaceArticles, getAllKingdomArticles,
  getAllNotables, getAllInstitutions, getImageGallery,
} from '@/lib/content'
import { SITE_URL } from '@/lib/seo'

type Entry = MetadataRoute.Sitemap[number]

const at = (path: string, opts: Partial<Entry> = {}): Entry => ({
  url: path === '/' ? SITE_URL : `${SITE_URL}${path}`,
  lastModified: new Date(),
  changeFrequency: 'monthly',
  priority: 0.6,
  ...opts,
})

/* Held, private and transactional routes are deliberately absent:
   /sign-in, /sign-up, /indigenes/profile, /indigenes/onboarding, and any
   institution record carrying `route` (covered elsewhere) or `publicVisibility: hold`. */
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
    at('/gallery/videos'),
    at('/contact'),
  ]

  const updates = getAllUpdates().map(u =>
    at(`/updates/${u.slug}`, {
      lastModified: u.publishedAt ? new Date(u.publishedAt) : new Date(),
      changeFrequency: 'yearly',
      priority: 0.7,
    }))

  const palace = getAllPalaceArticles().map(a =>
    at(`/palace/${a.slug}`, { changeFrequency: 'yearly', priority: 0.7 }))

  /* Unsupported stubs are excluded until they carry content. */
  const kingdom = getAllKingdomArticles()
    .filter(a => !(a as unknown as { noindex?: boolean }).noindex)
    .map(a => at(`/kingdom/${a.slug}`, { changeFrequency: 'yearly', priority: 0.7 }))

  const notables = getAllNotables().map(n =>
    at(`/notables/${n.slug}`, { changeFrequency: 'yearly' }))

  const institutions = getAllInstitutions()
    .filter(i => typeof i.route !== 'string' && i.publicVisibility !== 'hold')
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
