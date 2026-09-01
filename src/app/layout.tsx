import type { Metadata, Viewport } from 'next'
import { Analytics }      from '@vercel/analytics/react'
import { SpeedInsights }  from '@vercel/speed-insights/next'
import { Header }         from '@/components/layout/Header'
import { Footer }         from '@/components/layout/Footer'
import { MobileNav }      from '@/components/layout/MobileNav'
import { ToastContainer } from '@/components/ui/Toast'
import { getNavigation }  from '@/lib/content'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.guneku.org'),
  title: {
    default:  'Guneku Fondom | Official Community Website',
    template: '%s | Guneku Fondom',
  },
  description: 'The official website of Guneku Fondom — Mbengwi, Momo Division, North West Cameroon. Twenty-seven quarters, one Fondom, and a community organised across three continents.',
  alternates: { canonical: '/' },
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
    images: [{ url: '/images/site/og-guneku.jpg', width: 1200, height: 630, alt: 'The Guneku palace grounds during the 2016 coronation' }],
  },
  twitter: {
    card:    'summary_large_image',
    title:   'Guneku Fondom | Official Community Website',
    description: 'The official community website of Guneku Fondom — Mbengwi, Momo Division, North West Cameroon.',
    images:  ['/images/site/og-guneku.jpg'],
  },
  robots:   { index: true, follow: true },
  icons:    { icon: '/logo.png', apple: '/logo.png', shortcut: '/logo.png' },
  manifest: '/manifest.json',
}

/* Next 16 wants themeColor on the viewport export, not metadata. */
export const viewport: Viewport = {
  themeColor: '#14432F',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nav = getNavigation()

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
        />
      </head>
      <body style={{ backgroundColor: 'oklch(0.965 0.012 85)', color: 'oklch(0.245 0.022 150)', overflowX: 'hidden' }}>
        <Header nav={nav} />
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
