'use client'

import { useState, useEffect } from 'react'
import Link            from 'next/link'
import Image           from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X }     from 'lucide-react'
import { cn }          from '@/lib/utils'
import type { NavItem } from '@/lib/content'

const LINKS = [
  { href: '/',        label: 'Home',        exact: true  },
  { href: '/kingdom', label: 'The Kingdom', exact: false },
  { href: '/palace',  label: 'The Palace',  exact: false },
  { href: '/gudeca',  label: 'GUDECA',      exact: false },
  { href: '/gallery', label: 'Gallery',     exact: false },
  { href: '/diaspora',label: 'Diaspora',    exact: false },
  { href: '/contact', label: 'Contact',     exact: false },
]

interface HeaderProps {
  nav?: { mainNav: NavItem[] }
}

export function Header({ nav: _nav }: HeaderProps) {
  const [scrolled,    setScrolled]    = useState(false)
  const [open,        setOpen]        = useState(false)
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [query,       setQuery]       = useState('')
  const [results,     setResults]     = useState<{ id: string; title: string; section: string; href: string }[]>([])
  const pathname = usePathname()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24)
    fn()
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const t = setTimeout(async () => {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.results || [])
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : (href !== '/' && pathname.startsWith(href))

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled || open
          ? 'backdrop-blur-xl bg-background/80 border-b border-border'
          : 'bg-transparent'
      )}
      style={{ paddingLeft: 'env(safe-area-inset-left,0px)', paddingRight: 'env(safe-area-inset-right,0px)' }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0">
            <Image
              src="/royal-seal.png"
              alt="Royal seal of Guneku"
              fill
              className="object-contain drop-shadow-[0_0_12px_oklch(0.78_0.16_78/0.5)] transition-transform duration-700 group-hover:rotate-12"
              unoptimized
              priority
            />
          </div>
          <div className="leading-tight">
            <div className="font-cinzel text-lg font-bold tracking-[0.18em] text-gold-gradient">
              GUNEKU
            </div>
            <div className="text-[10px] tracking-[0.32em] text-muted-foreground">
              FONDOM · MMXXVI
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'relative rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary',
                isActive(l.href, l.exact) ? 'text-primary' : 'text-foreground/80'
              )}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/palace/fon-walters-profile"
            className="ml-3 inline-flex items-center gap-2 rounded-full border border-gold/70 bg-gold-gradient px-5 py-2 text-sm font-semibold text-gold-foreground shadow-[0_8px_30px_-8px_oklch(0.78_0.16_78/0.6)] transition-transform hover:scale-[1.03]"
          >
            Audience with the Fon
          </Link>
        </nav>

        {/* Right: search + hamburger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSearchOpen(s => !s)}
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-md text-foreground/70 hover:bg-secondary transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </button>
          <button
            onClick={() => setOpen(v => !v)}
            className="lg:hidden flex h-10 w-10 items-center justify-center rounded-md text-foreground hover:bg-secondary"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Search overlay */}
      {searchOpen && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl px-6 py-3">
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
            placeholder="Search the kingdom..."
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm"
            style={{ fontSize: '16px' }}
          />
          {results.length > 0 && (
            <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
              {results.map(r => (
                <Link key={r.id} href={r.href}
                      onClick={() => { setSearchOpen(false); setQuery('') }}
                      className="flex justify-between items-center py-2 border-b border-border/50 text-sm hover:text-primary transition-colors min-h-[44px]">
                  <span className="text-foreground font-medium">{r.title}</span>
                  <span className="text-muted-foreground text-xs ml-4">{r.section}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mobile fullscreen menu */}
      <div
        className="lg:hidden"
        style={{
          position: 'fixed',
          top: open ? '60px' : '-100vh',
          left: 0, right: 0, bottom: 0,
          zIndex: 98,
          backgroundColor: 'oklch(0.10 0.02 30 / 0.97)',
          backdropFilter: 'blur(20px)',
          overflowY: 'auto',
          paddingBottom: 'calc(var(--bottom-nav-total) + 2rem)',
          transition: 'top 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-6">
          {LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center justify-between min-h-[56px] py-4 border-b border-border/30 font-cinzel text-2xl tracking-wide transition-colors',
                isActive(l.href, l.exact) ? 'text-primary' : 'text-foreground'
              )}
            >
              <span>{l.label}</span>
              <span className="text-muted-foreground/40">→</span>
            </Link>
          ))}
          <Link
            href="/palace/fon-walters-profile"
            onClick={() => setOpen(false)}
            className="mt-6 btn-royal text-center justify-center"
          >
            Audience with the Fon
          </Link>
        </nav>
      </div>
    </header>
  )
}
