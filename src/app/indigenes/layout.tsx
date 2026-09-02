import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

/* /indigenes is a client component and cannot export metadata itself. */
export const metadata: Metadata = pageMetadata({
  title: 'Indigenes Directory',
  description: 'The directory of Guneku sons and daughters at home and in the diaspora, searchable by name and by quarter of origin.',
  path: '/indigenes',
})

export default function IndigenesLayout({ children }: { children: React.ReactNode }) {
  return children
}
