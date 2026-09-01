import type { Metadata, Viewport } from 'next'
import { Analytics }      from '@vercel/analytics/react'
import { SpeedInsights }  from '@vercel/speed-insights/next'
import { Header }         from '@/components/layout/Header'
import { Footer }         from '@/components/layout/Footer'
import { MobileNav }      from '@/components/layout/MobileNav'
import { PageTransition } from '@/components/ui/PageTransition'
import { ToastContainer } from '@/components/ui/Toast'
import { getNavigation }  from '@/lib/content'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://guneku.org'),
  title: {
    default:  'Guneku Fondom — A Kingdom Reimagined',
    template: '%s | Guneku Fondom',
  },
  description: 'The official website of Guneku Fondom — Mbengwi, Momo Division, North West Cameroon. Twenty-seven quarters, one Fondom, and a community organised across three continents.',
  keywords: ['Guneku','Fondom','Cameroon','Meta clan','Mbengwi','GUDECA','Fon Fomuki','Northwest Cameroon'],
  authors:  [{ name: 'MaxPromo Digital', url: 'https://maxpromo.digital' }],
  creator:  'Marcel Tabit Akwe — MaxPromo Digital',
  openGraph: {
    type:        'website',
    locale:      'en_GB',
    url:         'https://guneku.org',
    siteName:    'Guneku Fondom',
    title:       'Guneku Fondom — A Kingdom Reimagined',
    description: 'Heritage. Unity. Vision. The official digital palace of Guneku Fondom.',
    images: [{ url: '/images/site/og-guneku.jpg', width: 1200, height: 630, alt: 'The Guneku palace grounds during the 2016 coronation' }],
  },
  twitter: {
    card:    'summary_large_image',
    title:   'Guneku Fondom',
    images:  ['/images/site/og-guneku.jpg'],
  },
  robots:   { index: true, follow: true },
  icons:    { icon: '/logo.png', apple: '/logo.png', shortcut: '/logo.png' },
  manifest: '/manifest.json',
}

/* Next 16 wants themeColor on the viewport export, not metadata. */
export const viewport: Viewport = {
  themeColor: '#1f1108',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nav = getNavigation()

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ backgroundColor: 'oklch(0.14 0.02 30)', color: 'oklch(0.96 0.02 80)', overflowX: 'hidden' }}>
        <Header nav={nav} />
        <main>
          <PageTransition>
            {children}
          </PageTransition>
        </main>
        <Footer />
        <MobileNav />
        <ToastContainer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
