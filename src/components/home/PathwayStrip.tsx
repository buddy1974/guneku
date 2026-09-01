import Link from 'next/link'
import { Landmark, Crown, Users, Sprout, GraduationCap, HeartHandshake, Globe2, Scroll } from 'lucide-react'

/* Every pathway resolves to a real, populated route. */
const PATHS = [
  { icon: Landmark,       label: 'The Kingdom', href: '/kingdom',   desc: 'Our history, our land and the 27 quarters.' },
  { icon: Crown,          label: 'The Palace',  href: '/palace',    desc: 'The Fon, the throne and the royal record.'  },
  { icon: Users,          label: 'Our People',  href: '/indigenes', desc: 'Indigenes, notables, leadership and youth.' },
  { icon: Sprout,         label: 'Development', href: '/projects',  desc: 'Projects for today. A better tomorrow.'     },
  { icon: GraduationCap,  label: 'Education',   href: '/education', desc: 'Scholarships, skills and opportunity.'      },
  { icon: HeartHandshake, label: 'GUDECA',      href: '/gudeca',    desc: 'Our development and cultural association.'  },
  { icon: Globe2,         label: 'Diaspora',    href: '/diaspora',  desc: 'Guneku beyond Cameroon.'                    },
  { icon: Scroll,         label: 'Media',       href: '/gallery',   desc: 'Photographs, video and the archive.'        },
]

export function PathwayStrip() {
  return (
    <nav className="surface-ivory" aria-label="Explore Guneku">
      <ul className="shell grid list-none grid-cols-2 gap-x-6 gap-y-8 p-0 py-10 sm:grid-cols-3 lg:grid-cols-8 lg:gap-x-4 lg:py-9">
        {PATHS.map(({ icon: Icon, label, href, desc }) => (
          <li key={href}>
            <Link href={href} className="group block no-underline">
              <Icon className="h-6 w-6 text-[var(--brass-deep)]" strokeWidth={1.25} aria-hidden />
              <p className="ed-kicker mt-3 text-[oklch(0.22_0.02_45)] transition-colors group-hover:text-[var(--brass-deep)]">
                {label}
              </p>
              <p className="muted mt-1.5 text-[0.78rem] leading-snug">{desc}</p>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
