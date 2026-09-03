'use client'

import { useState, useEffect, useRef } from 'react'
import Link            from 'next/link'
import Image           from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, Search, ChevronDown, ArrowRight } from 'lucide-react'
import { cn }          from '@/lib/utils'
import type { NavItem } from '@/lib/content'

/* Information architecture — every href below resolves to a real route with
   real content. /kingdom/about-guneku, /palace/the-coronation and
   /palace/tributes were recovered from the legacy site on 2026-09-01.
   /palace/notables has no article (it is a placeholder on the legacy site too)
   and is reached through Our People instead. The kingdom stubs history,
   religion, touristic-sites, the-guneku-cultural-heritage and map-of-guneku
   are empty on the legacy site as well, so they are not promoted here; their
   subject matter is covered inside About Guneku. */
type Item = { href: string; label: string; exact?: boolean; children?: { href: string; label: string }[] }

const NAV: Item[] = [
  { href: '/', label: 'Home', exact: true },
  {
    href: '/kingdom', label: 'The Kingdom',
    children: [
      { href: '/kingdom/about-guneku', label: 'About Guneku' },
    ],
  },
  {
    href: '/palace', label: 'The Palace',
    children: [
      { href: '/palace/fon-walters-profile',                  label: 'The Reigning Fon'    },
      { href: '/palace/the-coronation',                       label: 'The Coronation'      },
      { href: '/palace/the-return-of-fon-fomuki-of-guneku',   label: 'The Return of the Fon' },
      { href: '/palace/biography-of-hrh-fomuki-patrick-njie', label: 'Biography — Fomuki Patrick Nji' },
      { href: '/palace/the-legacy-of-hrh-chief-fomuki-p-n',   label: 'Legacy of HRH Fomuki P.N.' },
      { href: '/palace/tributes',                             label: 'Tributes'            },
    ],
  },
  {
    href: '/indigenes', label: 'Our People',
    children: [
      { href: '/indigenes',                    label: 'Indigenes Directory'  },
      /* Who holds office, as distinct from who the sons and daughters are. */
      { href: '/people',                       label: 'Who holds office'     },
      { href: '/people/traditional-council',   label: 'Traditional Council'  },
      { href: '/notables',                     label: 'Notables'             },
      { href: '/gudeca/guyodeca',              label: 'GUYODECA — Youth'     },
      { href: '/gudeca/gudeca-exco',           label: 'GUDECA Executive'     },
    ],
  },
  {
    href: '/projects', label: 'Development',
    children: [
      { href: '/projects',  label: 'All Projects'     },
      { href: '/education', label: 'Education & Scholarships' },
      { href: '/agro-cig',  label: 'Guneku Agro CIG'  },
      { href: '/guneccul',  label: 'GUNECCUL Credit Union' },
      { href: '/gudeca',    label: 'GUDECA'           },
    ],
  },
  {
    href: '/gallery', label: 'Media',
    children: [
      { href: '/gallery/images', label: 'Image Gallery' },
      { href: '/gallery/videos', label: 'Video Gallery' },
      { href: '/updates',        label: 'Village Square' },
    ],
  },
  { href: '/diaspora', label: 'Diaspora' },
  { href: '/contact',  label: 'Contact'  },
]

interface HeaderProps { nav?: { mainNav: NavItem[] } }

export function Header({ nav: _nav }: HeaderProps) {
  const [open,       setOpen]       = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [openMenu,   setOpenMenu]   = useState<string | null>(null)
  const [expanded,   setExpanded]   = useState<string | null>(null)
  const [query,      setQuery]      = useState('')
  const [results,    setResults]    = useState<{ id: string; title: string; section: string; href: string }[]>([])
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pathname   = usePathname()

  /* Reset navigation state when the route changes.
     Adjusted during render (React's documented pattern) rather than in an
     effect, so it lands in the same commit as the navigation. */
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setOpen(false)
    setSearchOpen(false)
    setOpenMenu(null)
    setExpanded(null)
  }

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const t = setTimeout(async () => {
      if (query.trim().length < 2) { setResults([]); return }
      try {
        const res  = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.results || [])
      } catch { setResults([]) }
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const isActive = (i: Item) =>
    i.exact ? pathname === i.href : (i.href !== '/' && pathname.startsWith(i.href))

  const hoverOpen = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setOpenMenu(label)
  }
  const hoverClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--rule)] bg-[var(--paper)]">
      <div
        className="mx-auto flex h-[var(--header-h)] max-w-[76rem] items-center gap-4 px-4 md:h-[68px] md:px-8"
        style={{ paddingLeft: 'max(1rem, env(safe-area-inset-left))', paddingRight: 'max(1rem, env(safe-area-inset-right))' }}
      >

        {/* ── Identity ── */}
        <Link href="/" className="flex min-w-0 items-center gap-2.5 no-underline">
          <span className="relative block h-9 w-9 shrink-0 md:h-11 md:w-11">
            <Image src="/brand/logo-96.png" alt="Guneku Fondom" fill sizes="44px" className="object-contain" priority unoptimized />
          </span>
          <span className="min-w-0 leading-none">
            <span className="block truncate font-[family-name:var(--font-display)] text-[1.02rem] font-bold leading-none text-[var(--burgundy-i)] md:text-[1.12rem]">
              Guneku Fondom
            </span>
            <span className="mt-1 block truncate text-[10px] leading-none text-[var(--ink-400)] md:text-[10.5px]">
              <span className="sm:hidden">Official community website</span>
              <span className="hidden sm:inline">Official community website · Mbengwi, North West Cameroon</span>
            </span>
          </span>
        </Link>

        {/* ── Desktop navigation ── */}
        <nav className="ml-auto hidden items-center xl:flex" aria-label="Primary">
          {NAV.map(item => (
            <div
              key={item.href}
              className="relative"
              onMouseEnter={() => item.children && hoverOpen(item.label)}
              onMouseLeave={hoverClose}
            >
              <Link
                href={item.href}
                aria-expanded={item.children ? openMenu === item.label : undefined}
                className={cn(
                  'flex items-center gap-1 whitespace-nowrap px-2.5 py-2 text-[0.83rem] font-semibold no-underline transition-colors',
                  isActive(item) ? 'text-[var(--burgundy-i)]' : 'text-[var(--ink-900)] hover:text-[var(--burgundy-i)]'
                )}
              >
                {item.label}
                {item.children && <ChevronDown className="h-3 w-3 opacity-50" aria-hidden />}
              </Link>

              {isActive(item) && <span className="absolute inset-x-2.5 -bottom-px h-0.5 bg-[var(--burgundy-i)]" />}

              {item.children && openMenu === item.label && (
                <div
                  className="absolute left-0 top-full min-w-60 border border-[var(--rule)] bg-white py-2 shadow-lg"
                  onMouseEnter={() => hoverOpen(item.label)}
                  onMouseLeave={hoverClose}
                >
                  {item.children.map(c => (
                    <Link
                      key={c.href}
                      href={c.href}
                      className="block px-4 py-2.5 text-[0.82rem] text-[var(--ink-600)] no-underline transition-colors hover:bg-[var(--paper-alt)] hover:text-[var(--burgundy-i)]"
                    >
                      {c.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* ── Actions ── */}
        <div className="ml-auto flex items-center gap-2 xl:ml-4">
          {/* Wrapped: `.ed-btn` sets display, which would beat Tailwind's `hidden`
              and leave the CTA overlapping the menu button on small screens. */}
          <span className="hidden lg:block">
            <Link
              href="/indigenes/onboarding"
              className="inst-btn inst-btn-primary !py-2 !text-[0.78rem]"
            >
              Join our community
            </Link>
          </span>

          <button
            onClick={() => setSearchOpen(s => !s)}
            aria-label={searchOpen ? 'Close search' : 'Search the site'}
            aria-expanded={searchOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--rule)] text-[var(--ink-600)] transition-colors hover:border-[var(--burgundy-i)] hover:text-[var(--burgundy-i)]"
          >
            {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </button>

          <button
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--rule)] text-[var(--ink-900)] xl:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      {searchOpen && (
        <div className="border-t border-[var(--rule)] bg-white px-4 py-3 md:px-8">
          <div className="mx-auto max-w-[76rem]">
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
              placeholder="Search Guneku — people, history, projects, updates…"
              aria-label="Search"
              className="w-full bg-transparent text-[var(--ink-900)] outline-none placeholder:text-[var(--ink-400)]"
            />
            {results.length > 0 && (
              <ul className="mt-3 max-h-72 list-none overflow-y-auto border-t border-[var(--rule)] p-0">
                {results.map(r => (
                  <li key={r.id}>
                    <Link
                      href={r.href}
                      onClick={() => { setSearchOpen(false); setQuery('') }}
                      className="flex min-h-[44px] items-center justify-between gap-4 border-b border-[var(--rule)] py-2.5 text-sm text-[var(--ink-900)] no-underline hover:text-[var(--burgundy-i)]"
                    >
                      <span>{r.title}</span>
                      <span className="inst-meta shrink-0">{r.section}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ── Mobile drawer — purpose-built, not a squeezed desktop nav ── */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 top-[var(--header-h)] z-40 overflow-y-auto bg-[var(--paper)] xl:hidden',
          open ? 'block' : 'hidden'
        )}
        style={{ paddingBottom: 'calc(var(--bottom-nav-total) + 2rem)' }}
      >
        <nav className="px-4 py-4" aria-label="Mobile">
          {NAV.map(item => {
            const isOpen = expanded === item.label
            return (
              <div key={item.href} className="border-b border-[var(--rule)]">
                <div className="flex items-stretch">
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex min-h-[52px] flex-1 items-center text-[0.98rem] font-semibold no-underline',
                      isActive(item) ? 'text-[var(--burgundy-i)]' : 'text-[var(--ink-900)]'
                    )}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <button
                      onClick={() => setExpanded(isOpen ? null : item.label)}
                      aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${item.label}`}
                      aria-expanded={isOpen}
                      className="flex w-12 items-center justify-center text-[var(--ink-400)]"
                    >
                      <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
                    </button>
                  )}
                </div>
                {item.children && isOpen && (
                  <div className="pb-3 pl-3">
                    {item.children.map(c => (
                      <Link
                        key={c.href}
                        href={c.href}
                        onClick={() => setOpen(false)}
                        className="flex min-h-[44px] items-center text-[0.86rem] text-[var(--ink-600)] no-underline"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}

          <Link
            href="/indigenes/onboarding"
            onClick={() => setOpen(false)}
            className="inst-btn inst-btn-primary mt-6 w-full justify-center"
          >
            Join our community <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      </div>
    </header>
  )
}
