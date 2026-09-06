import type { Metadata } from 'next'

/* One canonical host for the whole site. Never a vercel.app, preview or localhost URL. */
export const SITE_URL = 'https://www.guneku.org'
export const SITE_NAME = 'Guneku Fondom'
export const OG_FALLBACK = '/images/site/og-guneku.jpg'

/** Strip HTML and collapse whitespace, then cut to a clean sentence boundary. */
export function excerptFrom(html: string | null | undefined, max = 158): string {
  if (!html) return ''
  const text = String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '))
  return (stop > max * 0.5 ? cut.slice(0, stop + 1) : cut.replace(/\s+\S*$/, '') + '…').trim()
}

/* ── A name for the tab, when the record's own title is a sentence ───────────────────────
 *
 * Two archive albums carry a full sentence where a name would go — "Sons and daughters of
 * Guneku assembled on the palace grounds of the village on 27 February 2015 for the return
 * of HRH Fon Fomuki…", 160 characters — because that is what the migrated record says, and
 * that record is evidence rather than copy. It is not rewritten.
 *
 * But a 160-character `<title>` is truncated by every search engine and every browser tab,
 * and set in capitals in a page hero it is a wall on a phone. So the full text stays on the
 * page, where a reader can read it, and this produces something that fits where only
 * something short can go.
 *
 * Presentation, not editing. It cuts at a boundary the text already has and never adds a
 * word: the shortened form is always a prefix of what the record says. */
export function shortTitle(text: string, max = 60): string {
  const clean = String(text ?? '').replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean

  const cut = clean.slice(0, max)
  /* Prefer a boundary the sentence itself provides — a clause end reads as deliberate,
     a mid-phrase truncation reads as a bug. */
  const stop = Math.max(cut.lastIndexOf(', '), cut.lastIndexOf(' — '), cut.lastIndexOf('. '))
  if (stop > max * 0.45) return cut.slice(0, stop).trim()
  return cut.replace(/\s+\S*$/, '').trim() + '…'
}

type PageMetaInput = {
  title: string
  description?: string
  path: string          // always a site-root-relative path, e.g. /updates/foo
  image?: string | null // site-root-relative; falls back to the site social image
  imageAlt?: string
  type?: 'website' | 'article'
  publishedTime?: string | null
}

/** Builds a page's metadata with a correct self-referencing canonical and social card. */
export function pageMetadata({
  title, description, path, image, imageAlt, type = 'website', publishedTime,
}: PageMetaInput): Metadata {
  const url = path === '/' ? SITE_URL : `${SITE_URL}${path}`
  const img = image || OG_FALLBACK
  const desc = description && description.length > 0 ? description : undefined

  return {
    title,
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type,
      locale: 'en_GB',
      url,
      siteName: SITE_NAME,
      title,
      description: desc,
      images: [{ url: img, alt: imageAlt || title }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [img],
    },
  }
}
