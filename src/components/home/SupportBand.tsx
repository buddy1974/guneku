import Link from 'next/link'

/* The action anchor of the homepage. Deep green ground, one oxblood rule, no gradient.
   There is no approved donation or payment mechanism in this repository, so the call to
   action opens an interest form rather than inventing a payment route. */
export function SupportBand() {
  return (
    <section className="inst-dark" aria-labelledby="support-heading">
      <div className="inst-wrap inst-sec">
        <div className="grid items-start gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
          <div>
            <p className="text-[0.70rem] font-bold uppercase tracking-[0.09em] text-[oklch(0.80_0.10_78)]">
              Support Guneku
            </p>
            <h2 id="support-heading"
                className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.7rem,3.2vw,2.4rem)] font-bold leading-[1.15] text-[oklch(0.975_0.010_85)]">
              Help build the next chapter of Guneku
            </h2>
            <div className="mt-4 flex items-center gap-2" aria-hidden>
              <span className="block h-0.5 w-12 bg-[oklch(0.55_0.14_22)]" />
              <span className="block h-0.5 w-5 bg-[oklch(0.80_0.10_78)]" />
            </div>
            <p className="mt-5 max-w-2xl font-[family-name:var(--font-sans)] text-[0.96rem] leading-[1.65] text-[oklch(0.90_0.010_85)]">
              The work recorded on this site — a road, a library, a health centre, a
              scholarship — was built by people from Guneku at home and abroad. Tell the
              Palace which project interests you and how you would like to help.
            </p>
          </div>

          <div className="lg:justify-self-end">
            <Link href="/support"
                  className="inst-btn bg-[oklch(0.975_0.010_85)] text-[var(--royal-green-900)] hover:bg-white">
              Support a project
            </Link>
            <p className="mt-4 max-w-xs font-[family-name:var(--font-sans)] text-[0.78rem] leading-[1.6] text-[oklch(0.84_0.010_85)]">
              Funds, materials, professional expertise, volunteering or partnership. No
              payment is taken on this site; your offer is sent to the Palace for review.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
