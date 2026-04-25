interface Props {
  label: string
  title: string
  subtitle?: string
  accent?: string
  bg?: string
}

export function PageHero({ label, title, subtitle, accent }: Props) {
  return (
    <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden pattern-royal grain">
      <div className="absolute inset-0 bg-royal-gradient opacity-90" />
      <div className="relative z-10 text-center px-6 py-28 max-w-4xl mx-auto">
        <p className="section-label mb-4">{label}</p>
        <div className="royal-divider max-w-xs mx-auto mb-6" />
        <h1 className="font-cinzel tracking-wide text-ivory" style={{ fontSize: 'clamp(1.8rem, 6vw, 5rem)' }}>
          {accent ? (
            <>
              {title.split(accent)[0]}
              <span className="text-gold-gradient">{accent}</span>
              {title.split(accent)[1]}
            </>
          ) : title}
        </h1>
        {subtitle && (
          <p className="font-cormorant italic text-xl mt-6 max-w-2xl mx-auto leading-relaxed"
             style={{ color: 'oklch(0.82 0.17 80 / 0.6)' }}>
            {subtitle}
          </p>
        )}
      </div>
    </section>
  )
}
