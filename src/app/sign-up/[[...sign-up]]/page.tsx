import Link from 'next/link'
import { SignUp } from '@clerk/nextjs'
import { clerkConfigured } from '@/lib/clerk-config'
import { MemberAreaNotice } from '@/components/auth/MemberAreaNotice'
import { pageMetadata } from '@/lib/seo'

export const metadata = {
  ...pageMetadata({
    title: 'Create a My Guneku account',
    description: 'Create an account to claim your entry in the indigenes register, follow Guneku projects and contribute to the village record.',
    path: '/sign-up',
  }),
  robots: { index: false, follow: false },
}

/* Signing up grants a member account and nothing more. It is not a claim on a name in the
   register, not a place in a quarter, and not an office — each of those is a Guneku fact
   established from sources and reviewed by the Palace, never something a form confers. */
export default function SignUpPage() {
  if (!clerkConfigured()) return <MemberAreaNotice title="Accounts are not open yet" />

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--paper)] px-5 py-14">
      <div className="w-full max-w-[26rem]">
        <div className="mb-7 text-center">
          <p className="inst-eyebrow">Guneku Fondom</p>
          <h1 className="inst-h1 mt-2 !text-[2.1rem]">Join My Guneku</h1>
          <p className="inst-body mx-auto mt-3 max-w-[23rem]">
            An account lets you claim your own entry, follow the work under way, and put
            something forward for the record. What you claim is still reviewed by the Palace.
          </p>
        </div>

        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/my-guneku"
        />

        <p className="inst-meta mt-7 text-center">
          Reading Guneku.org has never needed an account and still does not.{' '}
          <Link href="/" className="inst-link">Return to the village →</Link>
        </p>
      </div>
    </main>
  )
}
