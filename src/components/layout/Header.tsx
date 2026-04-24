'use client'

import { useState, useEffect } from 'react'
import Link                    from 'next/link'
import Image                   from 'next/image'
import { usePathname }         from 'next/navigation'
import { useUser, SignInButton, UserButton } from '@clerk/nextjs'
import type { NavItem } from '@/lib/content'

interface HeaderProps {
  nav: { mainNav: NavItem[] }
}

export function Header({ nav }: HeaderProps) {
  const [scrolled,   setScrolled]   = useState(false)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query,      setQuery]      = useState('')
  const [results,    setResults]    = useState<{ id: string; title: string; section: string; href: string }[]>([])
  const pathname = usePathname()
  const { user, isLoaded } = useUser()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const t = setTimeout(async () => {
      const res  = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      setResults(data.results || [])
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      {/* ── HEADER BAR ── */}
      <header style={{
        position:             'fixed',
        top:                  0,
        left:                 0,
        right:                0,
        zIndex:               100,
        height:               'var(--header-h)',
        paddingLeft:          'env(safe-area-inset-left, 0px)',
        paddingRight:         'env(safe-area-inset-right, 0px)',
        backgroundColor:      scrolled || menuOpen ? 'rgba(10,10,14,0.97)' : 'transparent',
        backdropFilter:       scrolled || menuOpen ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled || menuOpen ? 'blur(20px)' : 'none',
        borderBottom:         scrolled ? '0.5px solid rgba(255,255,255,0.07)' : '1px solid transparent',
        transition:           'background-color 0.3s, border-color 0.3s',
      }}>
        <div style={{
          maxWidth: '1400px', margin: '0 auto',
          height: 'var(--header-h)', padding: '0 1rem',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '1rem',
        }}>

          {/* ── LOGO ── */}
          <Link href="/" style={{
            display: 'flex', alignItems: 'center',
            gap: '10px', textDecoration: 'none', flexShrink: 0,
          }}>
            <div style={{ position: 'relative', width: '36px', height: '36px', flexShrink: 0 }}>
              <Image src="/logo.png" alt="Guneku Fondom" fill
                     style={{ objectFit: 'contain' }} priority unoptimized />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800,
                             fontSize: '14px', color: '#f2a90b',
                             letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Guneku
              </span>
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '9px',
                             color: 'rgba(245,242,233,0.35)',
                             letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Fondom
              </span>
            </div>
          </Link>

          {/* ── DESKTOP NAV ── */}
          <nav className="hidden md:flex" style={{ alignItems: 'center', gap: '0.25rem' }}>
            {nav.mainNav.map((item: NavItem) => (
              <Link key={item.href} href={item.href} style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 600,
                fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase',
                color: isActive(item.href) ? '#f2a90b' : 'rgba(245,242,233,0.6)',
                textDecoration: 'none', padding: '0.5rem 0.75rem',
                borderBottom: `2px solid ${isActive(item.href) ? '#f2a90b' : 'transparent'}`,
                transition: 'color 0.2s, border-color 0.2s', whiteSpace: 'nowrap',
              }}>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* ── RIGHT: search + auth + hamburger ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

            {/* Search button */}
            <button onClick={() => setSearchOpen(s => !s)} aria-label="Search"
                    style={{ width: '40px', height: '40px', display: 'flex',
                             alignItems: 'center', justifyContent: 'center',
                             background: 'none', border: '1px solid rgba(255,255,255,0.1)',
                             cursor: 'pointer', borderRadius: '6px', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="rgba(245,242,233,0.6)" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>

            {/* Auth — desktop */}
            <div className="hidden md:flex" style={{ alignItems: 'center' }}>
              {isLoaded && (
                user ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Link href="/indigenes/profile" style={{
                      color: 'rgba(245,242,233,0.5)', fontFamily: 'Syne, sans-serif',
                      fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase',
                      textDecoration: 'none',
                    }}>
                      My Profile
                    </Link>
                    <UserButton />
                  </div>
                ) : (
                  <SignInButton mode="modal">
                    <button style={{
                      border: '1px solid rgba(242,169,11,0.35)', color: '#f2a90b',
                      fontFamily: 'Syne, sans-serif', fontWeight: 700,
                      padding: '0.45rem 1.1rem', fontSize: '11px',
                      letterSpacing: '0.12em', textTransform: 'uppercase',
                      background: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                    }}>
                      Sign In
                    </button>
                  </SignInButton>
                )
              )}
            </div>

            {/* Hamburger — mobile */}
            <button onClick={() => setMenuOpen(m => !m)} className="md:hidden"
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    style={{ width: '44px', height: '44px', display: 'flex',
                             alignItems: 'center', justifyContent: 'center',
                             background: 'none', border: 'none',
                             cursor: 'pointer', padding: 0, flexShrink: 0 }}>
              <div style={{ width: '20px', position: 'relative', height: '14px' }}>
                {[0, 6, 12].map((top, i) => (
                  <span key={i} style={{
                    position: 'absolute', left: 0, top: `${top}px`,
                    width: i === 1 && menuOpen ? '0%' : '100%',
                    height: '1.5px', backgroundColor: '#F5F2E9',
                    borderRadius: '1px', transition: 'all 0.25s ease',
                    transform: menuOpen
                      ? i === 0 ? 'rotate(45deg) translateY(7px)'
                      : i === 2 ? 'rotate(-45deg) translateY(-7px)' : 'scaleX(0)'
                      : 'none',
                    opacity: i === 1 && menuOpen ? 0 : 1,
                  }} />
                ))}
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* ── SPACER ── */}
      <div style={{ height: 'var(--header-h)' }} />

      {/* ── SEARCH OVERLAY ── */}
      {searchOpen && (
        <div style={{
          position: 'fixed', top: 'var(--header-h)', left: 0, right: 0,
          zIndex: 99, backgroundColor: 'rgba(8,8,12,0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '1rem',
        }}>
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)}
                 onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
                 placeholder="Search Guneku..."
                 style={{
                   width: '100%', backgroundColor: '#0C0C14',
                   border: '1px solid rgba(242,169,11,0.3)',
                   color: '#F5F2E9', fontFamily: 'Inter, sans-serif',
                   fontSize: '16px', padding: '0.875rem 1rem',
                   outline: 'none', boxSizing: 'border-box',
                 }} />
          {results.length > 0 && (
            <div style={{ marginTop: '8px', backgroundColor: '#0C0C14',
                          border: '1px solid rgba(255,255,255,0.08)',
                          maxHeight: '60vh', overflowY: 'auto' }}>
              {results.map(r => (
                <Link key={r.id} href={r.href}
                      onClick={() => { setSearchOpen(false); setQuery('') }}
                      style={{ display: 'flex', justifyContent: 'space-between',
                               alignItems: 'center', padding: '0.875rem 1rem',
                               borderBottom: '1px solid rgba(255,255,255,0.05)',
                               textDecoration: 'none', minHeight: '44px' }}>
                  <div>
                    <div style={{ color: '#F5F2E9', fontFamily: 'Syne, sans-serif',
                                  fontWeight: 600, fontSize: '13px' }}>
                      {r.title}
                    </div>
                    <div style={{ color: 'rgba(245,242,233,0.35)',
                                  fontFamily: 'Inter, sans-serif',
                                  fontSize: '11px', marginTop: '2px' }}>
                      {r.section}
                    </div>
                  </div>
                  <span style={{ color: '#f2a90b', fontSize: '12px' }}>→</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MOBILE FULLSCREEN MENU ── */}
      <div className="md:hidden" style={{
        position: 'fixed',
        top: menuOpen ? 'var(--header-h)' : '-100vh',
        left: 0, right: 0, bottom: 0, zIndex: 98,
        backgroundColor: '#0A0A0E', overflowY: 'auto',
        paddingBottom: 'calc(var(--bottom-nav-total) + 2rem)',
        transition: 'top 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <div style={{ padding: '1.5rem 1rem' }}>
          {nav.mainNav.map((item: NavItem) => (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1rem 0', borderBottom: '0.5px solid rgba(255,255,255,0.06)',
              textDecoration: 'none', minHeight: '56px',
            }}>
              <span style={{
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: '1.5rem', letterSpacing: '0.05em',
                color: isActive(item.href) ? '#f2a90b' : '#F5F2E9',
                transition: 'color 0.2s',
              }}>
                {item.label}
              </span>
              <span style={{ color: 'rgba(245,242,233,0.2)', fontSize: '1rem' }}>→</span>
            </Link>
          ))}

          <div style={{ marginTop: '2rem', paddingTop: '2rem',
                        borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {isLoaded && (
              user ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Link href="/indigenes/profile" style={{
                    color: '#f2a90b', fontFamily: 'Syne, sans-serif',
                    fontWeight: 700, fontSize: '14px', letterSpacing: '0.1em',
                    textTransform: 'uppercase', textDecoration: 'none',
                    padding: '12px 0', minHeight: '44px', display: 'flex', alignItems: 'center',
                  }}>
                    My Profile
                  </Link>
                  <UserButton />
                </div>
              ) : (
                <SignInButton mode="modal">
                  <button style={{
                    width: '100%', backgroundColor: '#f2a90b', color: '#0F0F0F',
                    fontFamily: 'Syne, sans-serif', fontWeight: 700, padding: '1rem',
                    fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase',
                    border: 'none', cursor: 'pointer', minHeight: '52px',
                  }}>
                    Sign In / Join Directory
                  </button>
                </SignInButton>
              )
            )}
          </div>
        </div>
      </div>
    </>
  )
}
