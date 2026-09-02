import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/seo'

/* /contact is a client component and cannot export metadata itself. */
export const metadata: Metadata = pageMetadata({
  title: 'Contact the Palace',
  description: 'Reach the Guneku Fondom — the Palace at Guneku Centre, Mbengwi, Momo Division, North West Cameroon. Telephone, email and a message form.',
  path: '/contact',
})

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
