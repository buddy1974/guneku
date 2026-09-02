import type { Metadata } from 'next'

/* A private, transactional surface: kept out of the index entirely rather than
   canonicalised onto the public directory page. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  alternates: {},
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
