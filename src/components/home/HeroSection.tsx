'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export function HeroSection() {
  const [logoVisible, setLogoVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLogoVisible(true), 150)
    return () => clearTimeout(t)
  }, [])

  return (
    <section style={{
      position:  'relative',
      width:     '100%',
      height:    '90vh',
      minHeight: '600px',
      overflow:  'hidden',
    }}>

      {/* LAYER 0 — Background image */}
      <div style={{
        position:           'absolute',
        inset:              0,
        zIndex:             0,
        opacity:            0.40,
        backgroundImage:    "url('/hero-1.jpg')",
        backgroundSize:     'cover',
        backgroundPosition: 'center',
        backgroundRepeat:   'no-repeat',
      }} />

      {/* LAYER 10 — Gradient overlay */}
      <div style={{
        position:  'absolute',
        inset:     0,
        zIndex:    10,
        background:'linear-gradient(to bottom, rgba(139,30,45,0.50) 0%, rgba(15,15,15,0.20) 40%, rgba(15,15,15,0.75) 100%)',
      }} />

      {/* LAYER 20 — Content */}
      <div style={{
        position:       'relative',
        zIndex:         20,
        width:          '100%',
        minHeight:      '100%',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '5rem 1.5rem',
        textAlign:      'center',
      }}>

        {/* Logo */}
        <div style={{
          position:     'relative',
          width:        '185px',
          height:       '185px',
          marginBottom: '2rem',
          opacity:      logoVisible ? 1 : 0,
          transform:    logoVisible ? 'scale(1)' : 'scale(0.85)',
          transition:   'opacity 700ms ease-out, transform 700ms ease-out',
        }}>
          <Image
            src="/logo.png"
            alt="Guneku Fondom"
            fill
            style={{ objectFit: 'contain' }}
            priority
            unoptimized
          />
        </div>

        {/* Label row */}
        <div style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '12px',
          marginBottom: '1rem',
        }}>
          <span style={{ width:'28px', height:'2px', backgroundColor:'#8B1E2D', flexShrink:0 }} />
          <span className="section-label" style={{ letterSpacing:'0.2em' }}>
            GUNEKU FONDOM · MBENGWI · NORTHWEST CAMEROON
          </span>
          <span style={{ width:'28px', height:'2px', backgroundColor:'#8B1E2D', flexShrink:0 }} />
        </div>

        {/* WELCOME — Bebas Neue, reduced 30% */}
        <h1
          className="text-[6rem] sm:text-[8.3rem] md:text-[10.7rem] lg:text-[12rem]"
          style={{
            fontFamily:    '"Bebas Neue", sans-serif',
            fontWeight:    400,
            lineHeight:    0.95,
            color:         '#F5F2E9',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin:        0,
          }}
        >
          WELCOME
        </h1>

        {/* TO THE KINGDOM OF GUNEKU — Bebas Neue, reduced 30% */}
        <h2
          className="text-[3rem] sm:text-[4.25rem] md:text-[6rem] lg:text-[7.1rem]"
          style={{
            fontFamily:    '"Bebas Neue", sans-serif',
            fontWeight:    400,
            lineHeight:    1.05,
            color:         '#f2a90b',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin:        '0.2rem 0 1.5rem',
          }}
        >
          TO THE KINGDOM OF GUNEKU
        </h2>

        {/* Sub-headline */}
        <p style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 600,
          fontSize:   '1.1rem',
          color:      '#F5F2E9',
          margin:     '0 0 0.4rem',
        }}>
          A Living Kingdom of Heritage, Unity &amp; Vision
        </p>

        {/* Body */}
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize:   '0.95rem',
          color:      'rgba(245,242,233,0.6)',
          lineHeight: 1.6,
          maxWidth:   '560px',
          margin:     '0 0 0.6rem',
        }}>
          Home of HRH Dr. Fomuki Walters Ticha IX —
          15,000 people, one heritage, one kingdom,
          united across three continents.
        </p>

        {/* Gold italic tagline */}
        <p style={{
          fontFamily: 'Playfair Display, serif',
          fontStyle:  'italic',
          fontSize:   '0.95rem',
          color:      '#f2a90b',
          margin:     '0 0 2rem',
        }}>
          Here, tradition is honoured. Here, culture lives. Here, Guneku grows.
        </p>

        {/* CTAs */}
        <div style={{
          display:        'flex',
          gap:            '1rem',
          flexWrap:       'wrap',
          justifyContent: 'center',
          marginBottom:   '2.5rem',
        }}>
          <Link href="/palace/fon-walters-profile" style={{
            backgroundColor: '#f2a90b',
            color:           '#0F0F0F',
            fontFamily:      'Syne, sans-serif',
            fontWeight:      700,
            padding:         '0.85rem 2rem',
            fontSize:        '0.78rem',
            letterSpacing:   '0.12em',
            textTransform:   'uppercase',
            textDecoration:  'none',
            display:         'inline-block',
          }}>
            Meet the Fon
          </Link>
          <Link href="/kingdom" style={{
            border:         '1px solid rgba(245,242,233,0.35)',
            color:          '#F5F2E9',
            fontFamily:     'Syne, sans-serif',
            fontWeight:     700,
            padding:        '0.85rem 2rem',
            fontSize:       '0.78rem',
            letterSpacing:  '0.12em',
            textTransform:  'uppercase',
            textDecoration: 'none',
            display:        'inline-block',
          }}>
            Explore the Kingdom
          </Link>
        </div>

        {/* Heritage tags */}
        <div style={{
          display:        'flex',
          flexWrap:       'wrap',
          gap:            '1.5rem',
          justifyContent: 'center',
          fontSize:       '0.6rem',
          letterSpacing:  '0.25em',
          textTransform:  'uppercase',
          color:          'rgba(245,242,233,0.25)',
          fontFamily:     'Syne, sans-serif',
        }}>
          {['27 Quarters','Meta Clan','GUDECA','3 Continents','Est. Fondom'].map(item => (
            <span key={item} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{
                width:'4px', height:'4px', borderRadius:'50%',
                backgroundColor:'#8B1E2D', display:'inline-block', flexShrink:0,
              }} />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* LAYER 30 — Ticker */}
      <div style={{
        position:        'absolute',
        bottom:          0, left:0, right:0,
        zIndex:          30,
        borderTop:       '1px solid rgba(139,30,45,0.25)',
        backgroundColor: 'rgba(15,15,15,0.85)',
        backdropFilter:  'blur(8px)',
        padding:         '9px 0',
        overflow:        'hidden',
      }}>
        <div
          className="font-heading uppercase"
          style={{ display:'flex', whiteSpace:'nowrap', animation:'ticker 45s linear infinite' }}
        >
          {[0,1,2].map(i => (
            <span key={i} style={{
              color:'#f2a90b', fontSize:'10px',
              letterSpacing:'0.3em', opacity:0.55, marginRight:'2rem',
            }}>
              FONDOM · CAMEROON · META CLAN · GUDECA · 27 QUARTERS ·
              MƗCHI ƏBEŊ · GUNECCUL · AGRO CIG · NORTHWEST CAMEROON ·&nbsp;
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
