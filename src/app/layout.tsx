import type { Metadata } from 'next'
import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getNavigation } from '@/lib/content'

export const metadata: Metadata = {
  title: {
    default: 'Guneku Fondom — Official Website',
    template: '%s | Guneku Fondom',
  },
  description:
    'Official digital home of Guneku Fondom — Mbengwi, Momo Division, Northwest Cameroon. A royal community of 15,000 people united across three continents.',
  keywords: ['Guneku', 'Fondom', 'Cameroon', 'Meta clan', 'Mbengwi', 'GUDECA', 'Fon Fomuki'],
  authors: [{ name: 'MaxPromo Digital', url: 'https://maxpromo.digital' }],
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://guneku.org',
    siteName: 'Guneku Fondom',
    title: 'Guneku Fondom — Official Website',
    description: 'Welcome to the Kingdom of Guneku — A Village Built from the Heart.',
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const nav = getNavigation()

  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <body className="bg-royal-night text-ivory antialiased">
          <Header nav={nav} />
          <main>{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  )
}
