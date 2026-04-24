'use client'

import Link            from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  {
    href: '/', label: 'Home', exact: true,
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
           stroke={active ? '#f2a90b' : 'rgba(245,242,233,0.35)'}
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    ),
  },
  {
    href: '/palace', label: 'The Fon', exact: false,
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
           stroke={active ? '#f2a90b' : 'rgba(245,242,233,0.35)'}
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M20 21a8 8 0 10-16 0"/>
      </svg>
    ),
  },
  {
    href: '/gallery', label: 'Gallery', exact: false,
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
           stroke={active ? '#f2a90b' : 'rgba(245,242,233,0.35)'}
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: '/indigenes', label: 'Indigenes', exact: false,
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
           stroke={active ? '#f2a90b' : 'rgba(245,242,233,0.35)'}
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
        <path d="M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    href: '/gudeca', label: 'More', exact: false,
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
           stroke={active ? '#f2a90b' : 'rgba(245,242,233,0.35)'}
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="6"  x2="21" y2="6"/>
        <line x1="3" y1="12" x2="21" y2="12"/>
        <line x1="3" y1="18" x2="21" y2="18"/>
      </svg>
    ),
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden"
      style={{
        position:             'fixed',
        bottom:               0,
        left:                 0,
        right:                0,
        zIndex:               50,
        backgroundColor:      'rgba(8,8,12,0.97)',
        backdropFilter:       'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop:            '0.5px solid rgba(255,255,255,0.08)',
        paddingBottom:        'env(safe-area-inset-bottom, 0px)',
        paddingLeft:          'env(safe-area-inset-left, 0px)',
        paddingRight:         'env(safe-area-inset-right, 0px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'stretch', height: 'var(--bottom-nav-h)' }}>
        {NAV_ITEMS.map(item => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)

          return (
            <Link key={item.href} href={item.href} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '3px', textDecoration: 'none', minHeight: '44px',
              position: 'relative', WebkitTapHighlightColor: 'transparent',
            }}>
              {active && (
                <div style={{
                  position: 'absolute', top: '6px', left: '50%',
                  transform: 'translateX(-50%)', width: '4px', height: '4px',
                  borderRadius: '50%', backgroundColor: '#f2a90b',
                }} />
              )}
              <div style={{ marginTop: active ? '6px' : '0' }}>
                {item.icon(active)}
              </div>
              <span style={{
                fontSize: '9px', letterSpacing: '0.5px',
                color: active ? '#f2a90b' : 'rgba(245,242,233,0.3)',
                fontFamily: 'Syne, sans-serif', fontWeight: active ? 700 : 400,
                transition: 'color 0.2s',
              }}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
