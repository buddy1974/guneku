'use client'

import { useEffect, useState } from 'react'
import { useUser }             from '@clerk/nextjs'
import { useRouter }           from 'next/navigation'
import { IndigeneProfile }     from '@/types/indigene'
import Link                    from 'next/link'

export default function MyProfilePage() {
  const { user } = useUser()
  const router   = useRouter()
  const [profile, setProfile] = useState<IndigeneProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // suppress unused warning
  void user

  useEffect(() => {
    fetch('/api/indigenes/profile')
      .then(r => r.json())
      .then(d => {
        if (!d.profile) {
          router.push('/indigenes/onboarding')
        } else {
          setProfile(d.profile)
          setLoading(false)
        }
      })
  }, [router])

  if (loading) return (
    <main style={{ backgroundColor:'#0F0F0F', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <span style={{ color:'rgba(245,242,233,0.3)', fontFamily:'Syne, sans-serif', fontSize:'0.8rem', letterSpacing:'0.2em', textTransform:'uppercase' }}>Loading your profile...</span>
    </main>
  )

  if (!profile) return null

  return (
    <main style={{ backgroundColor:'#0F0F0F', minHeight:'100vh' }}>
      <div style={{ height:'240px', background:'linear-gradient(135deg, rgba(139,30,45,0.5), rgba(15,15,15,0.9))', position:'relative', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'3px', backgroundColor:'#f2a90b' }} />
      </div>

      <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'0 1.5rem' }}>
        <div style={{ display:'flex', gap:'2rem', alignItems:'flex-end', marginTop:'-50px', marginBottom:'3rem', flexWrap:'wrap' }}>
          <div style={{ width:'100px', height:'100px', borderRadius:'50%', backgroundColor:'#1A1A20', border:'4px solid #0F0F0F', overflow:'hidden', flexShrink:0 }}>
            {profile.photo_url ? (
              <img src={profile.photo_url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
            ) : (
              <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', backgroundColor:'rgba(242,169,11,0.1)', color:'#f2a90b', fontFamily:'"Bebas Neue", sans-serif', fontSize:'2rem' }}>{profile.full_name.charAt(0)}</div>
            )}
          </div>
          <div style={{ flex:1, paddingBottom:'0.5rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1rem' }}>
              <div>
                <h1 style={{ fontFamily:'Syne, sans-serif', fontWeight:700, color:'#F5F2E9', fontSize:'1.75rem', margin:'0 0 0.3rem' }}>{profile.full_name}</h1>
                <p style={{ color:'#f2a90b', fontFamily:'Syne, sans-serif', fontSize:'0.85rem', margin:0 }}>{profile.profession}{profile.employer ? ` · ${profile.employer}` : ''}</p>
              </div>
              <Link href="/indigenes/edit" style={{ border:'1px solid rgba(242,169,11,0.3)', color:'#f2a90b', fontFamily:'Syne, sans-serif', fontWeight:700, padding:'0.6rem 1.5rem', fontSize:'0.75rem', letterSpacing:'0.12em', textTransform:'uppercase', textDecoration:'none', display:'inline-block' }}>Edit Profile</Link>
            </div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'2rem', paddingBottom:'5rem' }} className="grid-cols-1 md:grid-cols-[2fr_1fr]">
          <div>
            {profile.bio && (
              <div style={{ marginBottom:'2.5rem' }}>
                <h2 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'1.5rem', color:'#F5F2E9', letterSpacing:'0.05em', margin:'0 0 1rem' }}>ABOUT</h2>
                <p style={{ color:'rgba(245,242,233,0.65)', fontFamily:'Inter, sans-serif', fontSize:'1rem', lineHeight:1.8 }}>{profile.bio}</p>
              </div>
            )}
            {profile.skills && profile.skills.length > 0 && (
              <div style={{ marginBottom:'2.5rem' }}>
                <h2 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'1.5rem', color:'#F5F2E9', letterSpacing:'0.05em', margin:'0 0 1rem' }}>SKILLS</h2>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                  {profile.skills.map(skill => (
                    <span key={skill} style={{ backgroundColor:'rgba(242,169,11,0.08)', color:'rgba(242,169,11,0.8)', fontFamily:'Syne, sans-serif', fontSize:'0.75rem', letterSpacing:'0.1em', textTransform:'uppercase', padding:'0.35rem 0.75rem', border:'1px solid rgba(242,169,11,0.2)' }}>{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
            <div style={{ backgroundColor:'#0C0C14', border:'1px solid rgba(242,169,11,0.1)', padding:'1.5rem' }}>
              <h4 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'1rem', color:'#f2a90b', letterSpacing:'0.1em', margin:'0 0 1rem' }}>GUNEKU HERITAGE</h4>
              {[
                { label:'Quarter',     value: profile.quarter },
                { label:'Family Home', value: profile.family_home },
                { label:'Lineage',     value: profile.family_lineage },
                { label:'Generation',  value: profile.generation },
                { label:'Year Left',   value: profile.year_left_guneku?.toString() },
              ].filter(f => f.value).map(f => (
                <div key={f.label} style={{ padding:'0.5rem 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ color:'rgba(245,242,233,0.25)', fontFamily:'Syne, sans-serif', fontSize:'0.65rem', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'0.2rem' }}>{f.label}</div>
                  <div style={{ color:'rgba(245,242,233,0.7)', fontFamily:'Inter, sans-serif', fontSize:'0.85rem' }}>{f.value}</div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor:'#0C0C14', border:'1px solid rgba(255,255,255,0.05)', padding:'1.5rem' }}>
              <h4 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'1rem', color:'#F5F2E9', letterSpacing:'0.1em', margin:'0 0 1rem' }}>LOCATION</h4>
              <p style={{ color:'rgba(245,242,233,0.6)', fontFamily:'Inter, sans-serif', fontSize:'1rem', margin:0 }}>{profile.country_flag} {profile.current_city}{profile.current_city && profile.current_country ? ', ' : ''}{profile.current_country}</p>
            </div>

            {(profile.website_url || profile.linkedin_url || profile.facebook_url || profile.instagram_url) && (
              <div style={{ backgroundColor:'#0C0C14', border:'1px solid rgba(255,255,255,0.05)', padding:'1.5rem' }}>
                <h4 style={{ fontFamily:'"Bebas Neue", sans-serif', fontSize:'1rem', color:'#F5F2E9', letterSpacing:'0.1em', margin:'0 0 1rem' }}>LINKS</h4>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                  {profile.website_url  && <a href={profile.website_url}  target="_blank" rel="noopener noreferrer" style={{ color:'#f2a90b', fontFamily:'Inter, sans-serif', fontSize:'0.85rem', textDecoration:'none' }}>🌐 Website</a>}
                  {profile.linkedin_url && <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color:'rgba(245,242,233,0.5)', fontFamily:'Inter, sans-serif', fontSize:'0.85rem', textDecoration:'none' }}>💼 LinkedIn</a>}
                  {profile.facebook_url && <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer" style={{ color:'rgba(245,242,233,0.5)', fontFamily:'Inter, sans-serif', fontSize:'0.85rem', textDecoration:'none' }}>📘 Facebook</a>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
