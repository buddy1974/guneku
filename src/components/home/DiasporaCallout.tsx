import { SectionLabel } from '@/components/ui/SectionLabel'
import { RoyalButton } from '@/components/ui/RoyalButton'

const COUNTRY_TAGS = [
  '🇩🇪 Germany', '🇺🇸 USA', '🇦🇪 UAE', '🇧🇪 Belgium',
  '🇬🇧 UK', '🇮🇹 Italy', '🇸🇪 Sweden', '🇳🇬 Nigeria',
  '🇨🇳 China', '🇯🇵 Japan', '🇶🇦 Qatar', '🇨🇲 Cameroon',
]

export function DiasporaCallout() {
  return (
    <section className="pattern-atoghu py-28 px-4 overflow-hidden">
      <div className="max-w-2xl mx-auto">

        {/* Left red border container */}
        <div className="border-l-4 border-heritage-red pl-8">
          <SectionLabel>Our People, Everywhere</SectionLabel>

          <h2
            className="font-display-title text-ivory mt-4 leading-tight"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700 }}
          >
            Guneku Is{' '}
            <span className="text-heritage-red">Everywhere</span>
          </h2>

          <p className="mt-5 text-ivory/60 font-body text-base leading-relaxed">
            From the Ruhr Valley to New Jersey, from Dubai to Tokyo —
            15,000 Guneku sons and daughters span three continents,
            one heritage, one kingdom.
          </p>
        </div>

        {/* Country tags */}
        <div className="mt-8 flex flex-wrap gap-2">
          {COUNTRY_TAGS.map(tag => (
            <span
              key={tag}
              className="bg-heritage-red/10 border border-heritage-red/35
                         text-ivory/70 text-xs font-heading tracking-wide
                         px-3 py-1"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-10 pl-12">
          <RoyalButton variant="outline" href="/diaspora">
            Indigenes &amp; Diaspora
          </RoyalButton>
        </div>
      </div>
    </section>
  )
}
