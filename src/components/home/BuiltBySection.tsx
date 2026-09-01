/* Builder credit. Restyled to the approved editorial language — the links
   and the business intent are unchanged, only the presentation. Whether the
   lead-generation calls-to-action belong on the Fondom's homepage at all is
   Marcel's decision, not a design one; flagged in the facelift handover. */
export function BuiltBySection() {
  return (
    <section className="border-t border-white/8 bg-[var(--ink-deep)] py-12">
      <div className="shell flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

        <div>
          <p className="ed-kicker text-white/35">This platform was built by</p>
          <a
            href="https://maxpromo.digital"
            target="_blank"
            rel="noopener noreferrer"
            className="ed-h3 mt-1.5 inline-block text-[var(--brass)] no-underline hover:underline"
          >
            MaxPromo Digital
          </a>
          <p className="ed-meta mt-1.5 text-white/35">
            Essen, Germany — built by Marcel Tabit Akwe, son of Guneku
          </p>
        </div>

        <div className="md:text-right">
          <p className="ed-meta max-w-sm text-white/35">
            AI-powered web platforms · Workflow automation · Digital transformation
          </p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 md:justify-end">
            <a
              href="https://maxpromo.digital"
              target="_blank"
              rel="noopener noreferrer"
              className="ed-kicker text-[var(--brass)] no-underline hover:underline"
            >
              Want this for your community?
            </a>
            <a
              href="https://maxpromo.digital/automation-audit"
              target="_blank"
              rel="noopener noreferrer"
              className="ed-kicker text-white/40 no-underline hover:text-white/70"
            >
              Free automation audit
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
