import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Indigenes Directory — Sons & Daughters of Guneku',
  description: 'The official directory of Guneku indigenes worldwide. Create your profile and connect with the community.',
}

export default function IndigenesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
