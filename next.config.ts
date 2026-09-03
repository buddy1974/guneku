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
