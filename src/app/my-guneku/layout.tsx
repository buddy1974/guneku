import { ClerkScope } from '@/components/auth/ClerkScope'

export default function MyGunekuLayout({ children }: { children: React.ReactNode }) {
  return <ClerkScope>{children}</ClerkScope>
}
