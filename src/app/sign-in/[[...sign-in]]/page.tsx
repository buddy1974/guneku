import Link from 'next/link'
import { SignIn } from '@clerk/nextjs'
import { pageMetadata } from '@/lib/seo'

export const metadata = {
  ...pageMetadata({
    title: 'Sign in',
    description: 'Sign in to My Guneku to manage your entry in the indigenes register, follow projects and track what you have contributed to the Guneku record.',
    path: '/sign-in',
  }),
  robots: { index: false, follow: false },
}

/* An account is for taking part, never for reading. Every page of the Guneku record stays
   open to a visitor with no account at all, and the copy here says so plainly rather than
   letting a sign-in wall imply otherwise. */
export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--paper)] px-5 py-14">
      <div className="w-full max-w-[26rem]">
        <div className="mb-7 text-center">
          <p className="inst-eyebrow">Guneku Fondom</p>
          <h1 className="inst-h1 mt-2 !text-[2.1rem]">My Guneku</h1>
          <p className="inst-body mx-auto mt-3 max-w-[22rem]">
            Sign in to claim your entry, follow a project, or see what you have put forward
            for the village record.
          </p>
        </div>

        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/my-guneku"
        />

        <p className="inst-meta mt-7 text-center">
          You do not need an account to read anything on Guneku.org.{' '}
          <Link href="/" className="inst-link">Return to the village →</Link>
        </p>
      </div>
    </main>
  )
}
