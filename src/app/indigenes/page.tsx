'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, SignInButton } from '@clerk/nextjs'
import { IndigeneProfile, GUNEKU_QUARTERS } from '@/types/indigene'
import Link from 'next/link'

export default function IndigenesPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  const [profiles, setProfiles]     = useState<IndigeneProfile[]>([])
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [quarter, setQuarter]       = useState('')
  const [page, setPage]             = useState(1)
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)

  useEffect(() => {
    if (!user) return
    fetch('/api/indigenes/profile')
      .then(r => r.json())
      .then(d => setHasProfile(!!d.profile))
  }, [user])

  const fetchProfiles = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      ...(search  ? { search }  : {}),
      ...(quarter ? { quarter } : {}),
    })
    const res  = await fetch(`/api/indigenes/all?${params}`)
    const data = await res.json()
    setProfiles(data.profiles || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [search, quarter, page])

  useEffect(() => { fetchProfiles() }, [fetchProfiles])

  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchProfiles() }, 400)
    return () => clearTimeout(t)
  }, [search])

  // suppress unused warning
  void router

  return (
    <main style={{ backgroundColor:'#0F0F0F', minHeight:'100vh' }}>

      {/* Hero */}
      <div style={{ background:'linear-gradient(to bottom, rgba(139,30,45,0.4) 0%, #0F0F0F 100%)', padding:'8rem 1.5rem 4rem', borderBottom:'1px solid rgba(139,30,45,0.25)', textAlign:'center' }}>
        <div style={{ maxWidth:'800px', margin:'0 auto' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', marginBottom:'1.5rem' }}>
            <span style={{ width:'28px', height:'2px', backgroundColor:'#8B1E2D', flexShrink:0 }} />
            <span className="section-label">INDIGENES DIRECTORY</span>
            <span style={{ width:'28px', height:'2px', backgroundColor:'#8B1E2D', flexShrink:0 }} />
          </div>
          <h1 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'clamp(2.5rem, 6vw, 5rem)', color:'#F5F2E9', letterSpacing:'0.05em', lineHeight:1, margin:'0 0 1rem' }}>
            SONS &amp; DAUGHTERS OF GUNEKU
          </h1>
          <p style={{ color:'rgba(245,242,233,0.5)', fontFamily:'Inter, sans-serif', fontSize:'1.05rem', lineHeight:1.7, maxWidth:'600px', margin:'0 auto 2rem' }}>
            {total > 0 ? (
              <><strong style={{ color:'#f2a90b' }}>{total}</strong> Guneku indigenes registered worldwide. From Essen to New Jersey — one people, one village.</>
            ) : 'The first digital directory of Guneku indigenes worldwide.'}
          </p>
          {isLoaded && (
            <div style={{ display:'flex', gap:'1rem', justifyContent:'center', flexWrap:'wrap' }}>
              {user ? (
                hasProfile === false ? (
                  <Link href="/indigenes/onboarding" style={{ backgroundColor:'#f2a90b', color:'#0F0F0F', fontFamily:'Syne, sans-serif', fontWeight:700, padding:'0.9rem 2rem', fontSize:'0.8rem', letterSpacing:'0.12em', textTransform:'uppercase', textDecoration:'none', display:'inline-block' }}>Create My Profile</Link>
                ) : (
                  <Link href="/indigenes/profile" style={{ backgroundColor:'#f2a90b', color:'#0F0F0F', fontFamily:'Syne, sans-serif', fontWeight:700, padding:'0.9rem 2rem', fontSize:'0.8rem', letterSpacing:'0.12em', textTransform:'uppercase', textDecoration:'none', display:'inline-block' }}>View My Profile</Link>
                )
              ) : (
                <SignInButton mode="modal">
                  <button style={{ backgroundColor:'#f2a90b', color:'#0F0F0F', fontFamily:'Syne, sans-serif', fontWeight:700, padding:'0.9rem 2rem', fontSize:'0.8rem', letterSpacing:'0.12em', textTransform:'uppercase', border:'none', cursor:'pointer' }}>Join the Directory</button>
                </SignInButton>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ backgroundColor:'#0A0A0A', borderBottom:'1px solid rgba(255,255,255,0.05)', padding:'1rem 1.5rem', display:'flex', gap:'1rem', flexWrap:'wrap', alignItems:'center' }}>
        <div style={{ flex:1, minWidth:'200px' }}>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search by name, profession, city..." style={{ width:'100%', backgroundColor:'#0C0C14', border:'1px solid rgba(255,255,255,0.1)', color:'#F5F2E9', fontFamily:'Inter, sans-serif', fontSize:'0.9rem', padding:'0.75rem 1rem', outline:'none', boxSizing:'border-box' }} />
        </div>
        <select value={quarter} onChange={e => { setQuarter(e.target.value); setPage(1) }} style={{ backgroundColor:'#0C0C14', border:'1px solid rgba(255,255,255,0.1)', color:'#F5F2E9', fontFamily:'Syne, sans-serif', fontSize:'0.8rem', padding:'0.75rem 1rem', letterSpacing:'0.05em', appearance:'none' }}>
          <option value="">All Quarters</option>
          {GUNEKU_QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
        </select>
      </div>

      {/* Profile grid */}
      <section style={{ maxWidth:'1400px', margin:'0 auto', padding:'4rem 1.5rem' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'5rem', color:'rgba(245,242,233,0.25)', fontFamily:'Syne, sans-serif', fontSize:'0.8rem', letterSpacing:'0.2em', textTransform:'uppercase' }}>Loading indigenes...</div>
        ) : profiles.length === 0 ? (
          <div style={{ textAlign:'center', padding:'5rem' }}>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🌍</div>
            <h3 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'2rem', color:'rgba(245,242,233,0.3)', letterSpacing:'0.05em', margin:'0 0 1rem' }}>{search || quarter ? 'NO RESULTS' : 'BE THE FIRST'}</h3>
            <p style={{ color:'rgba(245,242,233,0.2)', fontFamily:'Inter, sans-serif' }}>{search || quarter ? 'Try different search terms' : 'Register and become the first Guneku indigene in the directory.'}</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'1.5rem' }}>
            {profiles.map(profile => (
              <div key={profile.id} style={{ backgroundColor:'#0C0C14', border:'1px solid rgba(255,255,255,0.05)', overflow:'hidden' }} className="hover:border-[rgba(242,169,11,0.25)]">
                <div style={{ height:'100px', background:'linear-gradient(135deg, rgba(139,30,45,0.3), rgba(15,15,15,0.8))', position:'relative', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                  {profile.quarter && (
                    <div style={{ position:'absolute', top:'0.75rem', right:'0.75rem', backgroundColor:'rgba(15,15,15,0.8)', color:'rgba(245,242,233,0.4)', fontFamily:'Syne, sans-serif', fontSize:'0.6rem', letterSpacing:'0.1em', textTransform:'uppercase', padding:'0.2rem 0.5rem' }}>{profile.quarter}</div>
                  )}
                  <div style={{ position:'absolute', bottom:'-30px', left:'1.25rem', width:'60px', height:'60px', borderRadius:'50%', backgroundColor:'#1A1A20', border:'3px solid #0C0C14', overflow:'hidden' }}>
                    {profile.photo_url ? (
                      <img src={profile.photo_url} alt={profile.full_name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                    ) : (
                      <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'rgba(242,169,11,0.1)', color:'#f2a90b', fontFamily:'"Bebas Neue", sans-serif', fontSize:'1.5rem' }}>{profile.full_name.charAt(0)}</div>
                    )}
                  </div>
                </div>
                <div style={{ padding:'2.5rem 1.25rem 1.25rem' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.5rem' }}>
                    <h3 style={{ fontFamily:'Syne, sans-serif', fontWeight:700, color:'#F5F2E9', fontSize:'1rem', margin:0, lineHeight:1.3 }}>{profile.full_name}</h3>
                    {profile.is_verified && <span style={{ color:'#f2a90b', fontSize:'0.9rem' }} title="Verified">✓</span>}
                  </div>
                  {profile.profession && <p style={{ color:'#f2a90b', fontFamily:'Syne, sans-serif', fontSize:'0.75rem', letterSpacing:'0.05em', margin:'0 0 0.5rem' }}>{profile.profession}</p>}
                  <p style={{ color:'rgba(245,242,233,0.35)', fontFamily:'Inter, sans-serif', fontSize:'0.8rem', margin:'0 0 0.75rem' }}>{profile.country_flag} {profile.current_city}{profile.current_city && profile.current_country ? ', ' : ''}{profile.current_country}</p>
                  {profile.family_lineage && <p style={{ color:'rgba(245,242,233,0.25)', fontFamily:'Inter, sans-serif', fontSize:'0.75rem', fontStyle:'italic', margin:'0 0 1rem', lineHeight:1.5 }}>{profile.family_lineage}</p>}
                  {profile.skills && profile.skills.length > 0 && (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'4px', marginBottom:'1rem' }}>
                      {profile.skills.slice(0, 3).map(skill => (
                        <span key={skill} style={{ backgroundColor:'rgba(242,169,11,0.08)', color:'rgba(242,169,11,0.6)', fontFamily:'Syne, sans-serif', fontSize:'0.6rem', letterSpacing:'0.08em', textTransform:'uppercase', padding:'0.15rem 0.5rem', border:'1px solid rgba(242,169,11,0.15)' }}>{skill}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ display:'flex', gap:'8px' }}>
                    {profile.website_url  && <a href={profile.website_url}  target="_blank" rel="noopener noreferrer" style={{ color:'rgba(245,242,233,0.3)', fontSize:'0.75rem', textDecoration:'none', fontFamily:'Syne, sans-serif' }} title="Website">🌐</a>}
                    {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color:'rgba(245,242,233,0.3)', textDecoration:'none' }} title="LinkedIn">💼</a>}
                    {profile.facebook_url && <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer" style={{ color:'rgba(245,242,233,0.3)', textDecoration:'none' }} title="Facebook">📘</a>}
                  </div>
                  {profile.willing_to_mentor && <div style={{ marginTop:'0.75rem', backgroundColor:'rgba(139,30,45,0.15)', border:'1px solid rgba(139,30,45,0.3)', color:'rgba(245,242,233,0.5)', fontFamily:'Syne, sans-serif', fontSize:'0.6rem', letterSpacing:'0.1em', textTransform:'uppercase', padding:'0.25rem 0.5rem', display:'inline-block' }}>Open to mentor</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {total > 24 && (
          <div style={{ display:'flex', justifyContent:'center', gap:'8px', marginTop:'3rem' }}>
            {Array.from({ length: Math.ceil(total / 24) }).map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} style={{ width:'36px', height:'36px', backgroundColor: page === i + 1 ? '#f2a90b' : '#0C0C14', color: page === i + 1 ? '#0F0F0F' : 'rgba(245,242,233,0.4)', border: page === i + 1 ? 'none' : '1px solid rgba(255,255,255,0.08)', fontFamily:'Syne, sans-serif', fontSize:'0.8rem', cursor:'pointer' }}>{i + 1}</button>
            ))}
          </div>
        )}
      </section>

      {isLoaded && !user && (
        <div style={{ backgroundColor:'#0A0A0A', borderTop:'1px solid rgba(242,169,11,0.1)', padding:'4rem 1.5rem', textAlign:'center' }}>
          <h3 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'2.5rem', color:'#F5F2E9', letterSpacing:'0.05em', margin:'0 0 1rem' }}>ARE YOU A SON OR DAUGHTER OF GUNEKU?</h3>
          <p style={{ color:'rgba(245,242,233,0.4)', fontFamily:'Inter, sans-serif', fontSize:'1rem', margin:'0 0 2rem' }}>Sign in with Google and create your profile in 3 minutes.</p>
          <SignInButton mode="modal">
            <button style={{ backgroundColor:'#f2a90b', color:'#0F0F0F', fontFamily:'Syne, sans-serif', fontWeight:700, padding:'1rem 3rem', fontSize:'0.85rem', letterSpacing:'0.15em', textTransform:'uppercase', border:'none', cursor:'pointer' }}>Sign in with Google</button>
          </SignInButton>
        </div>
      )}
    </main>
  )
}
