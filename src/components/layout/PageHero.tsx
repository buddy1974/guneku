interface Props {
  label: string
  title: string
  subtitle?: string
  accent?: string
  bg?: string
}

/* Shared page header. Institutional: warm beige ground, deep green heading,
   a single restrained ochre rule. No gradient, no pattern, no grain. */
export function PageHero({ label, title, subtitle }: Props) {
  return (
    <section className="border-b border-[var(--rule,oklch(0.878_0.010_90))] bg-[var(--paper,oklch(0.965_0.012_85))]">
      <div className="mx-auto w-full max-w-[76rem] px-[clamp(1rem,4vw,2.5rem)] py-10 md:py-14">
        <p className="text-[0.70rem] font-bold uppercase tracking-[0.08em] text-[var(--primary)]">
          {label}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-[clamp(1.85rem,3.4vw,2.7rem)] font-bold leading-[1.14] text-[var(--foreground)]">
          {title}
        </h1>
        <div className="mt-4 h-0.5 w-12 bg-[var(--accent)]" />
        {subtitle && (
          <p className="mt-4 max-w-2xl font-[family-name:var(--font-sans)] text-[0.94rem] leading-[1.62] text-[var(--muted-foreground)]">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}
