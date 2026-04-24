'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'
import { useUser, SignInButton, UserButton } from '@clerk/nextjs'
import type { NavItem } from '@/lib/content'

interface HeaderProps {
  nav: { mainNav: NavItem[] }
}

export function Header({ nav }: HeaderProps) {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobile]     = useState(false)
  const [openDropdown, setDropdown] = useState<string | null>(null)
  const { user, isLoaded }          = useUser()
  const pathname                    = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobile(false) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <header
      className="sticky top-0 z-50 border-b border-heritage-red/25"
      style={{
        backgroundColor: scrolled ? 'rgba(15,15,15,0.95)' : 'rgba(15,15,15,0)',
        backdropFilter:  scrolled ? 'blur(12px)' : 'none',
        transition: 'background-color 0.3s, backdrop-filter 0.3s',
      }}
    >
      {/* ── Heritage-red top accent line ── */}
      <div className="h-0.5 bg-heritage-red w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
              <Image
                src="/logo.png"
                alt="Guneku Fondom"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-heading font-bold text-palace-gold
                               text-base tracking-[0.1em] uppercase">
                Guneku
              </span>
              <span className="font-heading text-ivory/40 text-[10px]
                               tracking-[0.15em] uppercase">
                Fondom
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden lg:flex items-center gap-6">
            {nav.mainNav.map((item: NavItem) => {
              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href))
              return item.children?.length ? (
                <div key={item.href} className="relative"
                     onMouseEnter={() => setDropdown(item.href)}
                     onMouseLeave={() => setDropdown(null)}>
                  <button
                    className="flex items-center gap-1 text-[11px] font-heading font-bold tracking-widest uppercase transition-colors duration-200"
                    style={{ color: isActive ? '#f2a90b' : 'rgba(245,242,233,0.7)' }}
                  >
                    {item.label}
                    <ChevronDown size={12} className={`transition-transform duration-200 ${openDropdown === item.href ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === item.href && (
                    <div className="absolute top-full left-0 pt-2 min-w-[220px]">
                      <div className="bg-[#111111] border border-heritage-red/20 py-1">
                        {item.children.map((child: NavItem) => (
                          <Link key={child.href} href={child.href}
                                onClick={() => setDropdown(null)}
                                className="block px-4 py-2.5 text-ivory/70 hover:text-palace-gold hover:bg-heritage-red/5 text-[11px] font-heading tracking-wide transition-colors duration-150">
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link key={item.href} href={item.href}
                      className="text-[11px] font-heading font-bold tracking-widest uppercase transition-colors duration-200"
                      style={{
                        color: isActive ? '#f2a90b' : 'rgba(245,242,233,0.7)',
                        borderBottom: isActive ? '2px solid #f2a90b' : '2px solid transparent',
                        paddingBottom: '2px',
                      }}>
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* ── Right CTA + Auth + Hamburger ── */}
          <div className="flex items-center gap-3">
            <Link
              href="/palace/fon-walters-profile"
              className="hidden lg:inline-flex items-center
                         border border-heritage-red text-heritage-red
                         text-[10px] font-heading font-bold tracking-widest uppercase
                         px-4 py-2 hover:bg-heritage-red hover:text-ivory
                         transition-colors duration-200"
            >
              The Fon
            </Link>

            {isLoaded && (
              user ? (
                <div className="hidden lg:flex items-center gap-3">
                  <Link
                    href="/indigenes/profile"
                    className="text-ivory/50 hover:text-palace-gold text-[10px]
                               font-heading font-bold tracking-widest uppercase
                               transition-colors duration-200"
                  >
                    My Profile
                  </Link>
                  <UserButton />
                </div>
              ) : (
                <SignInButton mode="modal">
                  <button
                    className="hidden lg:inline-flex items-center
                               border border-palace-gold/30 text-palace-gold
                               text-[10px] font-heading font-bold tracking-widest uppercase
                               px-4 py-2 hover:bg-palace-gold/10
                               transition-colors duration-200 bg-transparent cursor-pointer"
                  >
                    Sign In
                  </button>
                </SignInButton>
              )
            )}

            <button
              aria-label="Toggle menu"
              onClick={() => setMobile(o => !o)}
              className="lg:hidden text-ivory/70 hover:text-heritage-red transition-colors"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Overlay ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-[calc(4rem+3px)] z-40 overflow-y-auto pattern-atoghu">
          <nav className="max-w-7xl mx-auto px-6 py-8 space-y-1">
            {nav.mainNav.map((item: NavItem) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobile(false)}
                  className="block py-3 text-ivory/80 hover:text-palace-gold
                             text-xl font-heading font-bold tracking-wide
                             border-b border-heritage-red/15 transition-colors"
                >
                  {item.label}
                </Link>
                {item.children?.map((child: NavItem) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    onClick={() => setMobile(false)}
                    className="block py-2 pl-4 text-ivory/50 hover:text-palace-gold
                               text-base font-body transition-colors"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="pt-6">
              <Link
                href="/palace/fon-walters-profile"
                onClick={() => setMobile(false)}
                className="btn-red inline-block"
              >
                Meet the Fon
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
