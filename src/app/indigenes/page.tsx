'use client'

import { useEffect, useState, useCallback } from 'react'
import { IndigeneProfile, GUNEKU_QUARTERS } from '@/types/indigene'
import Link from 'next/link'
import { FoundingNames } from '@/components/community/FoundingNames'
import { allFoundingNames } from '@/lib/community'

/* Entries opened from the Fondom's own records, so the directory does not greet
   the first visitor with an empty grid. They are seed stubs, not profiles: see
   src/lib/community.ts for what a stub is allowed to show. */
const FOUNDING_COUNT = allFoundingNames().length

export default function IndigenesPage() {
  const [profiles, setProfiles] = useState<IndigeneProfile[]>([])
  const [total, setTotal]       = useState(0)
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [quarter, setQuarter]   = useState('')
  const [page, setPage]         = useState(1)

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      ...(search  ? { search }  : {}),
      ...(quarter ? { quarter } : {}),
    })
    try {
      const res  = await fetch(`/api/indigenes/all?${params}`)
      const data = await res.json()
      /* A 503 means the directory is not provisioned yet and answers with an error object
         rather than profiles. Treating that as "no one is registered" is the truthful
         reading: the founding names below are still shown, and nothing claims otherwise. */
      setProfiles(Array.isArray(data.profiles) ? data.profiles : [])
      setTotal(typeof data.total === 'number' ? data.total : 0)
    } catch {
      /* A rejected fetch must not leave the page spinning forever. */
      setProfiles([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [search, quarter, page])

  useEffect(() => { fetchProfiles() }, [fetchProfiles])

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchProfiles() }, 400)
    return () => clearTimeout(t)
  }, [search])

  return (
    <main style={{ backgroundColor:'oklch(0.965 0.012 85)', minHeight:'100vh' }}>

      {/* Hero */}
      <div style={{ background:'oklch(0.965 0.012 85)', padding:'6rem 1.5rem 3rem', borderBottom:'1px solid oklch(0.878 0.010 90)', textAlign:'center' }}>
        <div style={{ maxWidth:'800px', margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', marginBottom:'1.5rem' }}>
            <span style={{ width:'28px', height:'2px', backgroundColor:'oklch(0.320 0.060 158)', flexShrink:0 }} />
            <span className="section-label">INDIGENES DIRECTORY</span>
            <span style={{ width:'28px', height:'2px', backgroundColor:'oklch(0.320 0.060 158)', flexShrink:0 }} />
          </div>
          <h1 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'clamp(2.5rem, 6vw, 5rem)', color:'oklch(0.245 0.022 150)', letterSpacing:'0.05em', lineHeight:1, margin:'0 0 1rem' }}>
            SONS &amp; DAUGHTERS OF GUNEKU
          </h1>
          <p style={{ color:'oklch(0.470 0.018 150)', fontFamily:'Inter, sans-serif', fontSize:'1.05rem', lineHeight:1.7, maxWidth:'600px', margin:'0 auto 2rem' }}>
            {total > 0 ? (
              <><strong style={{ color:'oklch(0.320 0.060 158)' }}>{total}</strong> Guneku indigenes registered worldwide, and <strong style={{ color:'oklch(0.320 0.060 158)' }}>{FOUNDING_COUNT}</strong> founding names waiting to be claimed. From Bonn to New Jersey — one people, one village.</>
            ) : <>The directory of Guneku indigenes worldwide — opening with <strong style={{ color:'oklch(0.320 0.060 158)' }}>{FOUNDING_COUNT}</strong> names from the Fondom&rsquo;s own records.</>}
          </p>
          <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/indigenes/onboarding" style={{ backgroundColor:'oklch(0.320 0.060 158)', color:'oklch(0.965 0.012 85)', fontFamily:'var(--font-sans)', fontWeight:700, padding:'0.9rem 2rem', fontSize:'0.8rem', letterSpacing:'0.12em', textTransform:'uppercase', textDecoration:'none', display:'inline-block' }}>
              Create My Profile
            </Link>
            <Link href="/indigenes/submit?intent=add" style={{ border:'1px solid oklch(0.878 0.010 90)', color:'oklch(0.245 0.022 150)', fontFamily:'var(--font-sans)', fontWeight:700, padding:'0.9rem 2rem', fontSize:'0.8rem', letterSpacing:'0.12em', textTransform:'uppercase', textDecoration:'none', display:'inline-block' }}>
              Add a name
            </Link>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ backgroundColor:'#0A0A0A', borderBottom:'1px solid oklch(0.878 0.010 90)', padding:'1rem 1.5rem', display:'flex', gap:'1rem', flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ flex:1, minWidth:'200px' }}>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search by name, profession, city..." style={{ width:'100%', backgroundColor:'oklch(0.985 0.008 85)', border:'1px solid oklch(0.878 0.010 90)', color:'oklch(0.245 0.022 150)', fontFamily:'Inter, sans-serif', fontSize:'0.9rem', padding:'0.75rem 1rem', outline:'none', boxSizing:'border-box' }} />
        </div>
        <select value={quarter} onChange={e => { setQuarter(e.target.value); setPage(1) }} style={{ backgroundColor:'oklch(0.985 0.008 85)', border:'1px solid oklch(0.878 0.010 90)', color:'oklch(0.245 0.022 150)', fontFamily:'var(--font-sans)', fontSize:'0.8rem', padding:'0.75rem 1rem', letterSpacing:'0.05em', appearance:'none' }}>
          <option value="">All Quarters</option>
          {GUNEKU_QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
        </select>
      </div>

      {/* Profile grid */}
      <section style={{ maxWidth:'1400px', margin:'0 auto', padding:'4rem 1.5rem' }}>
        {loading ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(min(280px,100%), 1fr))', gap:'1.5rem' }}>
            {[...Array(12)].map((_, i) => (
              <div key={i} style={{
                backgroundColor:'oklch(0.985 0.008 85)', border:'1px solid oklch(0.878 0.010 90)',
                overflow:'hidden', animation:'pulse 1.5s ease-in-out infinite',
                animationDelay:`${i * 0.05}s`,
              }}>
                <div style={{ height:'100px', backgroundColor:'rgba(255,255,255,0.03)' }} />
                <div style={{ padding:'2.5rem 1.25rem 1.25rem' }}>
                  <div style={{ height:'12px', width:'70%', backgroundColor:'oklch(0.878 0.010 90)', marginBottom:'8px' }} />
                  <div style={{ height:'10px', width:'50%', backgroundColor:'rgba(255,255,255,0.03)', marginBottom:'6px' }} />
                  <div style={{ height:'10px', width:'40%', backgroundColor:'rgba(255,255,255,0.03)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : profiles.length === 0 ? (
          <div style={{ textAlign:'center', padding:'5rem' }}>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🌍</div>
            <h3 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'2rem', color:'oklch(0.560 0.016 150)', letterSpacing:'0.05em', margin:'0 0 1rem' }}>{search || quarter ? 'NO RESULTS' : 'BE THE FIRST'}</h3>
            <p style={{ color:'oklch(0.560 0.016 150)', fontFamily:'Inter, sans-serif' }}>{search || quarter ? 'Try different search terms' : 'Register and become the first Guneku indigene in the directory.'}</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(min(280px,100%), 1fr))', gap:'1.5rem' }}>
            {profiles.map(profile => (
              <div key={profile.id} style={{ backgroundColor:'oklch(0.985 0.008 85)', border:'1px solid oklch(0.878 0.010 90)', overflow:'hidden' }} className="hover:border-[rgba(242,169,11,0.25)]">
                <div style={{ height:'100px', background:'oklch(0.940 0.014 85)', position:'relative', borderBottom:'1px solid oklch(0.878 0.010 90)' }}>
                  {profile.quarter && (
                    <div style={{ position:'absolute', top:'0.75rem', right:'0.75rem', backgroundColor:'oklch(0.215 0.045 158 / 0.78)', color:'oklch(0.560 0.016 150)', fontFamily:'var(--font-sans)', fontSize:'0.6rem', letterSpacing:'0.1em', textTransform:'uppercase', padding:'0.2rem 0.5rem' }}>{profile.quarter}</div>
                  )}
                  <div style={{ position:'absolute', bottom:'-30px', left:'1.25rem', width:'60px', height:'60px', borderRadius:'50%', backgroundColor:'#1A1A20', border:'3px solid oklch(0.985 0.008 85)', overflow:'hidden' }}>
                    {profile.photo_url ? (
                      <img src={profile.photo_url} alt={profile.full_name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    ) : (
                      <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'rgba(242,169,11,0.1)', color:'oklch(0.320 0.060 158)', fontFamily:'"Bebas Neue", sans-serif', fontSize:'1.5rem' }}>{profile.full_name.charAt(0)}</div>
                    )}
                  </div>
                </div>
                <div style={{ padding:'2.5rem 1.25rem 1.25rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.5rem' }}>
                    <h3 style={{ fontFamily:'var(--font-sans)', fontWeight:700, color:'oklch(0.245 0.022 150)', fontSize:'1rem', margin:0, lineHeight:1.3 }}>{profile.full_name}</h3>
                    {profile.is_verified && <span style={{ color:'oklch(0.320 0.060 158)', fontSize:'0.9rem' }} title="Verified">✓</span>}
                  </div>
                  {profile.profession && <p style={{ color:'oklch(0.320 0.060 158)', fontFamily:'var(--font-sans)', fontSize:'0.75rem', letterSpacing:'0.05em', margin:'0 0 0.5rem' }}>{profile.profession}</p>}
                  <p style={{ color:'oklch(0.560 0.016 150)', fontFamily:'Inter, sans-serif', fontSize:'0.8rem', margin:'0 0 0.75rem' }}>{profile.country_flag} {profile.current_city}{profile.current_city && profile.current_country ? ', ' : ''}{profile.current_country}</p>
                  {profile.family_lineage && <p style={{ color:'oklch(0.560 0.016 150)', fontFamily:'Inter, sans-serif', fontSize:'0.75rem', fontStyle:'italic', margin:'0 0 1rem', lineHeight:1.5 }}>{profile.family_lineage}</p>}
                  {profile.skills && profile.skills.length > 0 && (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'4px', marginBottom:'1rem' }}>
                      {profile.skills.slice(0, 3).map(skill => (
                        <span key={skill} style={{ backgroundColor:'rgba(242,169,11,0.08)', color:'rgba(242,169,11,0.6)', fontFamily:'var(--font-sans)', fontSize:'0.6rem', letterSpacing:'0.08em', textTransform:'uppercase', padding:'0.15rem 0.5rem', border:'1px solid oklch(0.878 0.010 90)' }}>{skill}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ display:'flex', gap:'8px' }}>
                    {profile.website_url  && <a href={profile.website_url}  target="_blank" rel="noopener noreferrer" style={{ color:'oklch(0.560 0.016 150)', fontSize:'0.75rem', textDecoration:'none', fontFamily:'var(--font-sans)' }} title="Website">🌐</a>}
                    {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color:'oklch(0.560 0.016 150)', textDecoration:'none' }} title="LinkedIn">💼</a>}
                    {profile.facebook_url && <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer" style={{ color:'oklch(0.560 0.016 150)', textDecoration:'none' }} title="Facebook">📘</a>}
                  </div>
                  {profile.willing_to_mentor && <div style={{ marginTop:'0.75rem', backgroundColor:'oklch(0.320 0.060 158 / 0.08)', border:'1px solid oklch(0.320 0.060 158 / 0.30)', color:'oklch(0.470 0.018 150)', fontFamily:'var(--font-sans)', fontSize:'0.6rem', letterSpacing:'0.1em', textTransform:'uppercase', padding:'0.25rem 0.5rem', display:'inline-block' }}>Open to mentor</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {total > 24 && (
          <div style={{ display:'flex', justifyContent:'center', gap:'8px', marginTop:'3rem' }}>
            {Array.from({ length: Math.ceil(total / 24) }).map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} style={{ width:'36px', height:'36px', backgroundColor: page === i + 1 ? 'oklch(0.320 0.060 158)' : 'oklch(0.985 0.008 85)', color: page === i + 1 ? 'oklch(0.965 0.012 85)' : 'oklch(0.560 0.016 150)', border: page === i + 1 ? 'none' : '1px solid oklch(0.878 0.010 90)', fontFamily:'var(--font-sans)', fontSize:'0.8rem', cursor:'pointer' }}>{i + 1}</button>
            ))}
          </div>
        )}
      </section>

      {/* The founding names — unclaimed entries opened from Fondom and GUDECA
          records. Each one is claimable by its owner and removable on request. */}
      <section className="inst-alt inst-rule">
        <div className="inst-wrap inst-sec">
          <FoundingNames />
        </div>
      </section>

      <div style={{ backgroundColor:'#0A0A0A', borderTop:'1px solid rgba(242,169,11,0.1)', padding:'4rem 1.5rem', textAlign:'center' }}>
        <h3 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'2.5rem', color:'oklch(0.245 0.022 150)', letterSpacing:'0.05em', margin:'0 0 1rem' }}>ARE YOU A SON OR DAUGHTER OF GUNEKU?</h3>
        <p style={{ color:'oklch(0.560 0.016 150)', fontFamily:'Inter, sans-serif', fontSize:'1rem', margin:'0 0 2rem' }}>Join the official directory of Guneku sons and daughters worldwide.</p>
        <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/indigenes/onboarding" style={{ backgroundColor:'oklch(0.320 0.060 158)', color:'oklch(0.965 0.012 85)', fontFamily:'var(--font-sans)', fontWeight:700, padding:'1rem 3rem', fontSize:'0.85rem', letterSpacing:'0.15em', textTransform:'uppercase', textDecoration:'none', display:'inline-block' }}>
            Create My Profile
          </Link>
          <Link href="/indigenes/submit?intent=add" style={{ border:'1px solid oklch(0.878 0.010 90)', color:'oklch(0.245 0.022 150)', fontFamily:'var(--font-sans)', fontWeight:700, padding:'1rem 3rem', fontSize:'0.85rem', letterSpacing:'0.15em', textTransform:'uppercase', textDecoration:'none', display:'inline-block' }}>
            Add someone&rsquo;s name
          </Link>
        </div>
      </div>
    </main>
  )
}
