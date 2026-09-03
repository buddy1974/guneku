import { ClerkScope } from '@/components/auth/ClerkScope'
import { clerkConfigured } from '@/lib/clerk-config'

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  /* ClerkProvider throws without a publishable key, so the notice the page renders
     instead must not be wrapped in it. */
  if (!clerkConfigured()) return <>{children}</>
  return <ClerkScope>{children}</ClerkScope>
}
