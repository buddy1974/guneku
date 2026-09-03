import { ClerkScope } from '@/components/auth/ClerkScope'

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return <ClerkScope>{children}</ClerkScope>
}
