import type { MetadataRoute } from 'next'
import { recordedQuarters } from '@/lib/quarter-pages'
import { getAllNotables, getImageGallery } from '@/lib/content'
import {
  publicUpdates, publicPalaceArticles, publicFondomArticles, sitemapInstitutions,
} from '@/lib/visibility'
import { SITE_URL } from '@/lib/seo'
import { publicCuratedBusinesses } from '@/lib/businesses'
import { allChapters, allBodies } from '@/lib/community'
import { indexablePersonSlugs } from '@/lib/seo-policy'

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
   /indigenes/profile, /indigenes/onboarding, the held Business Directory, the empty Fondom
   stubs, and any institution whose content lives on another page.

   This file is built from the indexability policy, not from "every route that returns 200".
   The two differ in both directions: a page can be public and deliberately unlisted (a thin
   quarter, a sparse register entry), and a page can be listed without being reachable from
   any menu. `src/app/sitemap.test.ts` holds both halves of that in place. */
export default function sitemap(): MetadataRoute.Sitemap {
  const statics: Entry[] = [
    at('/', { priority: 1.0, changeFrequency: 'weekly' }),
    at('/fondom', { priority: 0.9 }),
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
    at('/sons-and-daughters'),
    at('/indigenes'),
    at('/people', { priority: 0.8 }),
    /* How the Fondom is supported. Public, indexable, and until now reachable only from
       the footer — which is how it came to be the one public page with no sitemap entry. */
    at('/support', { priority: 0.5 }),
    at('/businesses', { priority: 0.8, changeFrequency: 'weekly' }),
    at('/updates', { priority: 0.9, changeFrequency: 'weekly' }),
    at('/gallery'),
    at('/gallery/images'),
    /* /gallery/videos redirects to /watch, so only one film library is indexable. */
    at('/watch', { priority: 0.8, changeFrequency: 'monthly' }),
    at('/contact'),
    /* Public and indexable, like every other page a visitor can simply open, but low
       priority and rarely changed: they are reference, not record. */
    at('/privacy', { priority: 0.3, changeFrequency: 'yearly' }),
    at('/terms',   { priority: 0.3, changeFrequency: 'yearly' }),
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
  const fondom = publicFondomArticles()
    .map(a => at(`/fondom/${a.slug}`, { changeFrequency: 'yearly', priority: 0.7 }))

  const notables = getAllNotables().map(n =>
    at(`/sons-and-daughters/${n.slug}`, { changeFrequency: 'yearly' }))

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

  /* Only the curated businesses the Fondom has published. A held one is absent, and a
     registered one is absent too: it lives in the database, is rendered on demand, and a
     sitemap built at build time cannot know whether it was approved since. The directory
     page itself is listed and links to every one of them. Nothing under
     /my-guneku/businesses appears here — those are somebody's own drafts. */
  const businesses = publicCuratedBusinesses().map(b =>
    at(`/businesses/${b.slug}`, { changeFrequency: 'monthly', priority: 0.7 }))

  const albums = (getImageGallery()?.albums || []).map(a =>
    at(`/gallery/images/${a.id}`, { changeFrequency: 'yearly', priority: 0.5 }))

  /* The seventeen chapters and the five governing bodies. Each is a real, named organisation
     with a roster of its own, and every one of them was missing here — not by policy but by
     omission: the sitemap was written before these routes existed and was never revisited. */
  const chapters = allChapters().map(c =>
    at(`/gudeca/chapters/${c.id}`, { changeFrequency: 'monthly', priority: 0.6 }))

  const bodies = allBodies().map(b =>
    at(`/people/${b.id}`, { changeFrequency: 'monthly', priority: 0.7 }))

  /* The register, filtered by the indexability policy rather than listed wholesale: an entry
     is offered here only when it carries at least two facts beyond the name. The rest stay
     public, linked and crawlable, and carry `noindex, follow` on the page itself. The rule,
     and the reasoning behind the number, live in src/lib/seo-policy.ts. */
  const people = indexablePersonSlugs().map(slug =>
    at(`/indigenes/founding/${slug}`, { changeFrequency: 'yearly', priority: 0.4 }))

  return [...statics, ...updates, ...palace, ...fondom, ...notables, ...institutions,
          ...quarters, ...businesses, ...albums, ...chapters, ...bodies, ...people]
}
