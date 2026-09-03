import { ClerkScope } from '@/components/auth/ClerkScope'

export default function SignUpLayout({ children }: { children: React.ReactNode }) {
  return <ClerkScope>{children}</ClerkScope>
}
