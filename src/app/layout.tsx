import type { Metadata } from 'next'
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
    default:  'Guneku Fondom — Official Website',
    template: '%s | Guneku Fondom',
  },
  description: 'Official digital home of Guneku Fondom — Mbengwi, Momo Division, Northwest Cameroon. A royal community of 15,000 people united across three continents.',
  keywords: [
    'Guneku', 'Fondom', 'Cameroon', 'Meta clan', 'Mbengwi',
    'GUDECA', 'Fon Fomuki', 'Northwest Cameroon',
    'African village', 'Momo Division',
  ],
  authors:  [{ name: 'MaxPromo Digital', url: 'https://maxpromo.digital' }],
  creator:  'Marcel Tabit Akwe — MaxPromo Digital',
  openGraph: {
    type:        'website',
    locale:      'en_GB',
    url:         'https://guneku.org',
    siteName:    'Guneku Fondom',
    title:       'Guneku Fondom — Welcome to the Kingdom',
    description: 'A Living Kingdom of Heritage, Unity & Vision. Northwest Cameroon.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Guneku Fondom' }],
  },
  twitter: {
    card:        'summary_large_image',
    site:        '@GunekuF',
    creator:     '@GunekuF',
    title:       'Guneku Fondom',
    description: 'Official website of Guneku Fondom, Northwest Cameroon.',
    images:      ['/og-image.jpg'],
  },
  robots:   { index: true, follow: true },
  icons:    { icon: '/logo.png', apple: '/logo.png', shortcut: '/logo.png' },
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nav = getNavigation()

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ backgroundColor: '#0F0F0F', color: '#F5F2E9', overflowX: 'hidden' }}>
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
