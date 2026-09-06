import type { NextConfig } from 'next'
import path from 'path'

/* Legacy Joomla routes, taken from the migrated `menu-raw.json` menu table rather than
   guessed. Each one is mapped to the page that actually carries the same subject; none
   is swept to the homepage. Retired routes with no modern equivalent (/shop, the legal
   pages) are deliberately absent — they are reported instead of invented. */
const LEGACY_ROUTES: Array<[string, string]> = [
  // The Kingdom — formerly /about/*
  ['/about', '/kingdom'],
  ['/about/about-guneku', '/kingdom/about-guneku'],
  ['/about/religion', '/kingdom/religion'],
  ['/about/touristic-sites', '/kingdom/touristic-sites'],
  ['/about/the-guneku-cultural-heritage', '/kingdom/the-guneku-cultural-heritage'],
  ['/about/history', '/kingdom/history'],
  ['/about/map-of-guneku', '/kingdom/map-of-guneku'],
  ['/about/gudeca-construction', '/kingdom/gudeca-construction'],

  // The Palace — formerly /guneku-palace/*
  ['/guneku-palace', '/palace'],
  ['/guneku-palace/tributes', '/palace/tributes'],
  ['/guneku-palace/the-coronation', '/palace/the-coronation'],
  ['/guneku-palace/notables', '/notables'],
  ['/guneku-palace/biography-of-hrh-fomuki-patrick-njie', '/palace/biography-of-hrh-fomuki-patrick-njie'],
  ['/guneku-palace/activities-building-up-to-the-coronation-ceremony', '/palace/activities-building-up-to-the-coronation-ceremony'],
  ['/guneku-palace/the-legacy-of-hrh-chief-fomuki-p-n', '/palace/the-legacy-of-hrh-chief-fomuki-p-n'],

  // Gallery
  ['/gallery/video-gallery', '/watch'],
  ['/gallery/image-gallery', '/gallery/images'],

  // Former /pages/* container
  ['/pages', '/'],
  ['/pages/projects', '/projects'],
  ['/pages/indigenes', '/indigenes'],
  ['/pages/notables', '/notables'],
  ['/pages/tributes', '/palace/tributes'],
  ['/pages/exhibitions', '/kingdom/exhibitions'],
  ['/pages/about-template', '/kingdom/about-guneku'],
  ['/pages/video', '/watch'],
  ['/pages/home-page', '/'],

  // Joomla's own homepage alias
  ['/homepage', '/'],
]

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    unoptimized: true,
  },
  /* ── Caching for the archive ─────────────────────────────────────────────────────────
   *
   * Every file under `public/` is served with `public, max-age=0, must-revalidate`, which is
   * Next's default and is the wrong default for a photograph archive. It means a visitor who
   * opens an album, goes back, and opens it again pays a round trip for every one of its
   * twenty-odd images to be told nothing changed. Most of the audience is on a mid-range
   * Android on a throttled connection in Cameroon (R-008), where a round trip is the
   * expensive part and the 304 that comes back is almost free by comparison.
   *
   * A day fresh, thirty days stale-while-revalidate. Not `immutable`, and not a year: these
   * filenames are not content-hashed, so a photograph replaced at the same path has to be
   * able to reach people. A day is long enough to make browsing the gallery feel like
   * browsing a gallery, and short enough that a correction is never stuck.
   *
   * `/images/` only. The HTML is left alone deliberately — a cached page is how a withdrawn
   * record keeps being read, and this archive has already withdrawn one date. */
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [{
          key: 'Cache-Control',
          value: 'public, max-age=86400, stale-while-revalidate=2592000',
        }],
      },
    ]
  },

  async redirects() {
    const legacy = LEGACY_ROUTES.flatMap(([from, to]) => ([
      { source: from, destination: to, permanent: true },
      /* Joomla also served every route behind /index.php. */
      { source: `/index.php${from}`, destination: to, permanent: true },
    ]))

    return [
      /* The Vercel preview hostname must never carry public navigation. Anyone
         who lands on it — an old link, a shared preview URL — is moved to the
         production domain, so relative internal links stay on guneku.org. */
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'guneku.vercel.app' }],
        destination: 'https://www.guneku.org/:path*',
        permanent: true,
      },

      ...legacy,

      /* The film library moved to /watch. One indexable library, not two competing ones:
         /gallery/videos was linked from the header, the gallery landing page, the sitemap and
         two legacy Joomla routes, so it redirects rather than 404s. The image gallery routes
         under /gallery/images are untouched. */
      /* Profiles moved out of /notables on 2026-09-03. "Notable" means a place in Guneku's
         traditional governance, not a distinguished son or daughter, so the professional
         profiles that lived there now sit under /sons-and-daughters. Old links redirect. */
      { source: '/notables/:slug',           destination: '/sons-and-daughters/:slug', permanent: true },
      { source: '/index.php/notables/:slug', destination: '/sons-and-daughters/:slug', permanent: true },

      { source: '/gallery/videos',            destination: '/watch', permanent: true },
      { source: '/index.php/gallery/videos',  destination: '/watch', permanent: true },

      /* Joomla SEF article URLs carried a numeric id prefix, e.g.
         /updates/23-minutes-of-meeting. The slug that follows is the alias the
         migration kept, so the prefix can simply be dropped. */
      {
        source: '/updates/:id(\\d+)-:slug',
        destination: '/updates/:slug',
        permanent: true,
      },
      {
        source: '/index.php/updates/:id(\\d+)-:slug',
        destination: '/updates/:slug',
        permanent: true,
      },

      /* Anything else that arrived under /index.php keeps its path. */
      {
        source: '/index.php',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
