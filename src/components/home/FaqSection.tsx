import Link from 'next/link'
import facts from '@/data/home/village-facts.json'
import { JsonLd } from '@/components/seo/JsonLd'

/* Native <details> — keyboard-operable, screen-reader-friendly and searchable in the
   page, with no JavaScript to load. Every answer is drawn from a record already on this
   site and links to the page that carries it in full. */
export function FaqSection() {
  const faq = facts.faq

  return (
    <section className="inst-rule border-b border-[var(--rule)]" aria-labelledby="faq-heading">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }} />

      <div className="inst-wrap inst-sec">
        <p className="inst-eyebrow">Common questions</p>
        <h2 id="faq-heading" className="inst-h2 mt-1.5">Questions about Guneku</h2>

        <div className="mt-6 grid gap-x-12 md:grid-cols-2">
          {faq.map(f => (
            <details key={f.q} className="group border-b border-[var(--rule)] py-1">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-3.5 [&::-webkit-details-marker]:hidden">
                <span className="inst-h3">{f.q}</span>
                <span aria-hidden
                      className="mt-0.5 shrink-0 text-[1.1rem] leading-none text-[var(--royal-green)] transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="pb-4">
                <p className="inst-body !text-[0.9rem]">{f.a}</p>
                {f.href && (
                  <Link href={f.href} className="inst-link mt-2 inline-block">
                    {f.hrefLabel || 'Read more'} →
                  </Link>
                )}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
