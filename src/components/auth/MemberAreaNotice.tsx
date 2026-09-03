import Link from 'next/link'

/* What a visitor sees where the member area would be, when Clerk is not configured.
 *
 * It says the true thing — the member area is not open yet — and sends them back to the part
 * of Guneku that is. It does not apologise for a fault, because from the reader's side there
 * is no fault: everything they came to the Fondom's site to read is working. */
export function MemberAreaNotice({
  title = 'The member area is not open yet',
}: { title?: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--paper)] px-5 py-14">
      <div className="w-full max-w-[30rem] text-center">
        <p className="inst-eyebrow">Guneku Fondom</p>
        <h1 className="inst-h1 mt-2 !text-[2rem]">{title}</h1>

        <p className="inst-body mx-auto mt-4 max-w-[26rem]">
          Accounts are being prepared. When the member area opens you will be able to claim
          your entry in the indigenes register, follow the work under way in the village, and
          put something forward for the Guneku record.
        </p>

        <p className="inst-body mx-auto mt-3 max-w-[26rem]">
          Nothing on Guneku.org needs an account to read, and nothing ever will.
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inst-btn inst-btn-primary">Return to the village</Link>
          <Link href="/search" className="inst-btn inst-btn-quiet">Search the record</Link>
        </div>

        <p className="inst-meta mt-8">
          If you wanted to reach the Fondom,{' '}
          <Link href="/contact" className="inst-link">the Palace contact page</Link> is open.
        </p>
      </div>
    </main>
  )
}
