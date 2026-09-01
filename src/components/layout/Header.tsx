'use client'

import { useState, useEffect, useRef } from 'react'
import Link            from 'next/link'
import Image           from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X, Search, ChevronDown, ArrowRight } from 'lucide-react'
import { cn }          from '@/lib/utils'
import type { NavItem } from '@/lib/content'

/* Information architecture — every href below resolves to a real route.
   Legacy navigation.json still contains unmapped Joomla paths
   (/kingdom/about-guneku, /palace/the-coronation, /palace/notables,
   /palace/tributes); they are deliberately not used here. */
type Item = { href: string; label: string; exact?: boolean; children?: { href: string; label: string }[] }

const NAV: Item[] = [
  { href: '/', label: 'Home', exact: true },
  {
    href: '/kingdom', label: 'The Kingdom',
    children: [
      { href: '/kingdom/history',                      label: 'History of Guneku'  },
      { href: '/kingdom/the-guneku-cultural-heritage', label: 'Culture & Heritage' },
      { href: '/kingdom/religion',                     label: 'Religion'           },
      { href: '/kingdom/touristic-sites',              label: 'Touristic Sites'    },
      { href: '/kingdom/map-of-guneku',                label: 'Map of Guneku'      },
    ],
  },
  {
    href: '/palace', label: 'The Palace',
    children: [
      { href: '/palace/fon-walters-profile',                  label: 'The Reigning Fon'    },
      { href: '/palace/the-return-of-fon-fomuki-of-guneku',   label: 'The Return of the Fon' },
      { href: '/palace/the-legacy-of-hrh-chief-fomuki-p-n',   label: 'Legacy of HRH Fomuki P.N.' },
      { href: '/palace/biography-of-hrh-fomuki-patrick-njie', label: 'Biography — Fomuki Patrick Nji' },
    ],
  },
  {
    href: '/indigenes', label: 'Our People',
    children: [
      { href: '/indigenes',           label: 'Indigenes Directory' },
      { href: '/gudeca/guyodeca',     label: 'GUYODECA — Youth'    },
      { href: '/gudeca/gudeca-exco',  label: 'GUDECA Executive'    },
    ],
  },
  {
    href: '/projects', label: 'Development',
    children: [
      { href: '/projects',  label: 'All Projects'     },
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
    <header className="fixed inset-x-0 top-0 z-50 surface-ink border-b border-white/10">
      <div
        className="mx-auto flex h-[var(--header-h)] max-w-[92rem] items-center gap-4 px-4 md:h-[76px] md:px-8"
        style={{ paddingLeft: 'max(1rem, env(safe-area-inset-left))', paddingRight: 'max(1rem, env(safe-area-inset-right))' }}
      >

        {/* ── Identity ── */}
        <Link href="/" className="flex shrink-0 items-center gap-3 no-underline">
          <span className="relative block h-9 w-9 shrink-0 md:h-11 md:w-11">
            <Image src="/royal-seal.png" alt="Royal seal of Guneku Fondom" fill sizes="44px" className="object-contain" priority unoptimized />
          </span>
          <span className="leading-none">
            <span className="block font-cinzel text-[0.95rem] font-bold tracking-[0.16em] text-[var(--brass)] md:text-[1.05rem]">
              GUNEKU FONDOM
            </span>
            <span className="mt-1 block text-[8.5px] tracking-[0.24em] text-white/45 md:text-[9.5px]">
              MBENGWI · NORTH WEST CAMEROON
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
                  'ed-kicker flex items-center gap-1 whitespace-nowrap px-3 py-2 no-underline transition-colors',
                  isActive(item) ? 'text-[var(--brass)]' : 'text-white/80 hover:text-white'
                )}
              >
                {item.label}
                {item.children && <ChevronDown className="h-3 w-3 opacity-50" aria-hidden />}
              </Link>

              {isActive(item) && <span className="absolute inset-x-3 -bottom-px h-0.5 bg-[var(--brass)]" />}

              {item.children && openMenu === item.label && (
                <div
                  className="absolute left-0 top-full min-w-60 border border-white/10 bg-[var(--ink-deep)] py-2 shadow-2xl"
                  onMouseEnter={() => hoverOpen(item.label)}
                  onMouseLeave={hoverClose}
                >
                  {item.children.map(c => (
                    <Link
                      key={c.href}
                      href={c.href}
                      className="block px-4 py-2.5 text-[0.8rem] text-white/70 no-underline transition-colors hover:bg-white/5 hover:text-[var(--brass)]"
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
              className="ed-btn ed-btn-gold !px-4 !py-2.5 !text-[0.68rem]"
            >
              Join our community
            </Link>
          </span>

          <button
            onClick={() => setSearchOpen(s => !s)}
            aria-label={searchOpen ? 'Close search' : 'Search the site'}
            aria-expanded={searchOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/75 transition-colors hover:border-[var(--brass)] hover:text-[var(--brass)]"
          >
            {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </button>

          <button
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white xl:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      {searchOpen && (
        <div className="border-t border-white/10 bg-[var(--ink-deep)] px-4 py-3 md:px-8">
          <div className="mx-auto max-w-[92rem]">
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
              placeholder="Search Guneku — people, history, projects, updates…"
              aria-label="Search"
              className="w-full bg-transparent text-white outline-none placeholder:text-white/35"
            />
            {results.length > 0 && (
              <ul className="mt-3 max-h-72 list-none overflow-y-auto border-t border-white/10 p-0">
                {results.map(r => (
                  <li key={r.id}>
                    <Link
                      href={r.href}
                      onClick={() => { setSearchOpen(false); setQuery('') }}
                      className="flex min-h-[44px] items-center justify-between gap-4 border-b border-white/5 py-2.5 text-sm text-white/85 no-underline hover:text-[var(--brass)]"
                    >
                      <span>{r.title}</span>
                      <span className="ed-meta shrink-0 text-white/35">{r.section}</span>
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
          'fixed inset-x-0 bottom-0 top-[var(--header-h)] z-40 overflow-y-auto bg-[var(--ink-deep)] xl:hidden',
          open ? 'block' : 'hidden'
        )}
        style={{ paddingBottom: 'calc(var(--bottom-nav-total) + 2rem)' }}
      >
        <nav className="px-4 py-4" aria-label="Mobile">
          {NAV.map(item => {
            const isOpen = expanded === item.label
            return (
              <div key={item.href} className="border-b border-white/8">
                <div className="flex items-stretch">
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex min-h-[52px] flex-1 items-center text-[0.95rem] font-semibold uppercase tracking-[0.12em] no-underline',
                      isActive(item) ? 'text-[var(--brass)]' : 'text-white'
                    )}
                  >
                    {item.label}
                  </Link>
                  {item.children && (
                    <button
                      onClick={() => setExpanded(isOpen ? null : item.label)}
                      aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${item.label}`}
                      aria-expanded={isOpen}
                      className="flex w-12 items-center justify-center text-white/45"
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
                        className="flex min-h-[44px] items-center text-[0.85rem] text-white/60 no-underline"
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
            className="ed-btn ed-btn-gold mt-6 w-full justify-center"
          >
            Join our community <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      </div>
    </header>
  )
}
