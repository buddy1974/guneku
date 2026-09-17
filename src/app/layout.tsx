import type { Metadata, Viewport } from 'next'
import { Source_Serif_4, Source_Sans_3 } from 'next/font/google'
import { Analytics }      from '@vercel/analytics/react'
import { SpeedInsights }  from '@vercel/speed-insights/next'
import { Header }         from '@/components/layout/Header'
import { Footer }         from '@/components/layout/Footer'
import { MobileNav }      from '@/components/layout/MobileNav'
import { ToastContainer } from '@/components/ui/Toast'
import { JsonLd } from '@/components/seo/JsonLd'
import { graph, organizationNode, websiteNode, gunekuPlaceNode } from '@/lib/schema'
import './globals.css'

/* Previously loaded with a <link> to fonts.googleapis.com, which Lighthouse measured
   blocking render for 856 ms and pulling 276 KiB from a third-party origin. Same two
   typefaces, now self-hosted and preloaded by the framework. */
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--ff-serif',
})
const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--ff-sans',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.guneku.org'),
  title: {
    default:  'Guneku Fondom | Official Community Website',
    template: '%s | Guneku Fondom',
  },
  /* 158 characters. The site default is inherited by the homepage and by anything that
     does not set its own, so it is the one description no page-level helper can trim. */
  description: 'The official website of Guneku Fondom — Mbengwi, Momo Division, North West Cameroon. Twenty-seven quarters, one Fondom, a community across three continents.',
  /* No canonical here. In the App Router `alternates.canonical` is inherited by every
     child route, so a value set on the root layout made all ~110 pages canonicalise to
     the homepage. Each route now declares its own self-referencing canonical. */
  keywords: ['Guneku','Fondom','Cameroon','Meta clan','Mbengwi','GUDECA','Fon Fomuki','Northwest Cameroon'],
  authors:  [{ name: 'MaxPromo Digital', url: 'https://maxpromo.digital' }],
  creator:  'Marcel Tabit Akwe — MaxPromo Digital',
  openGraph: {
    type:        'website',
    locale:      'en_GB',
    url:         'https://www.guneku.org',
    siteName:    'Guneku Fondom',
    title:       'Guneku Fondom | Official Community Website',
    description: 'The official community website of Guneku Fondom — Mbengwi, Momo Division, North West Cameroon.',
    images: [{ url: '/images/site/og-guneku.jpg', width: 1200, height: 630, alt: 'The Guneku Palace grounds during the public presentation of HRH Fomuki Walters Ticha IX to Meta in December 2016' }],
  },
  twitter: {
    card:    'summary_large_image',
    title:   'Guneku Fondom | Official Community Website',
    description: 'The official community website of Guneku Fondom — Mbengwi, Momo Division, North West Cameroon.',
    images:  ['/images/site/og-guneku.jpg'],
  },
  robots:   { index: true, follow: true },
  manifest: '/manifest.json',
}

/* Next 16 wants themeColor on the viewport export, not metadata. */
export const viewport: Viewport = {
  themeColor: '#14432F',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en" className={`scroll-smooth ${sourceSerif.variable} ${sourceSans.variable}`}>
      <body style={{ backgroundColor: 'oklch(0.965 0.012 85)', color: 'oklch(0.245 0.022 150)', overflowX: 'hidden' }}>
        {/* The three nodes the whole graph hangs from, declared once here and referred to
            by `@id` from every page after this: the institution, the site, and Guneku the
            place. They are three things, not one — a Fondom is not a village and neither is
            a website — and the pages that follow attach themselves to whichever they mean.
            Everything in them comes from src/lib/schema.ts, which explains what may go in. */}
        <JsonLd data={graph(organizationNode(), websiteNode(), gunekuPlaceNode())} />
        <Header />
        <main>{children}</main>
        <Footer />
        <MobileNav />
        <ToastContainer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
