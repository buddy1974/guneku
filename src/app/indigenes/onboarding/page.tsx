'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { GUNEKU_QUARTERS, GENERATIONS } from '@/types/indigene'

const COUNTRIES = [
  { name: 'Cameroon',     flag: '🇨🇲' },
  { name: 'Germany',      flag: '🇩🇪' },
  { name: 'USA',          flag: '🇺🇸' },
  { name: 'UAE',          flag: '🇦🇪' },
  { name: 'Belgium',      flag: '🇧🇪' },
  { name: 'UK',           flag: '🇬🇧' },
  { name: 'France',       flag: '🇫🇷' },
  { name: 'Italy',        flag: '🇮🇹' },
  { name: 'Sweden',       flag: '🇸🇪' },
  { name: 'Nigeria',      flag: '🇳🇬' },
  { name: 'South Africa', flag: '🇿🇦' },
  { name: 'Canada',       flag: '🇨🇦' },
  { name: 'China',        flag: '🇨🇳' },
  { name: 'Japan',        flag: '🇯🇵' },
  { name: 'Qatar',        flag: '🇶🇦' },
  { name: 'Other',        flag: '🌍' },
]

const STEP_LABELS = ['Your Identity', 'Your Heritage', 'Your Work', 'Your Presence', 'Review']

export default function OnboardingPage() {
  const router   = useRouter()
  const [step, setStep]         = useState(0)
  const [saving, setSaving]     = useState(false)
  const [photoUrl, setPhotoUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    full_name:        '',
    bio:              '',
    current_city:     '',
    current_country:  '',
    country_flag:     '',
    quarter:          '',
    family_lineage:   '',
    family_home:      '',
    generation:       '',
    year_left_guneku: '',
    profession:       '',
    employer:         '',
    skills:           [] as string[],
    website_url:      '',
    facebook_url:     '',
    instagram_url:    '',
    linkedin_url:     '',
    twitter_url:      '',
    willing_to_mentor: false,
    open_to_connect:  true,
    is_public:        true,
  })

  function set(key: string, value: unknown) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', 'avatar')
    const res  = await fetch('/api/indigenes/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.url) setPhotoUrl(data.url)
    setUploading(false)
  }

  async function submit() {
    setSaving(true)
    const payload = {
      ...form,
      photo_url:        photoUrl,
      year_left_guneku: form.year_left_guneku ? parseInt(form.year_left_guneku) : null,
    }
    const res = await fetch('/api/indigenes/profile', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
    if (res.ok) router.push('/indigenes')
    setSaving(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', backgroundColor: '#0C0C14',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#F5F2E9', fontFamily: 'Inter, sans-serif',
    fontSize: '0.95rem', padding: '0.875rem 1rem',
    outline: 'none', boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    color: 'rgba(245,242,233,0.4)', fontFamily: 'Syne, sans-serif',
    fontSize: '0.7rem', letterSpacing: '0.15em',
    textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem',
  }

  return (
    <main style={{ backgroundColor:'#0F0F0F', minHeight:'100vh',
                   paddingTop:'5rem', paddingBottom:'5rem' }}>
      <div style={{ maxWidth:'680px', margin:'0 auto', padding:'0 1.5rem' }}>

        <div style={{ textAlign:'center', marginBottom:'3rem' }}>
          <span className="section-label" style={{ marginBottom:'0.75rem', display:'block' }}>
            INDIGENES DIRECTORY
          </span>
          <h1 style={{ fontFamily:'"Bebas Neue", sans-serif',
                       fontSize:'3rem', color:'#F5F2E9',
                       letterSpacing:'0.05em', margin:'0 0 0.5rem' }}>
            CREATE YOUR PROFILE
          </h1>
          <p style={{ color:'rgba(245,242,233,0.4)', fontFamily:'Inter, sans-serif',
                      fontSize:'0.9rem' }}>
            Join the official directory of Guneku sons and daughters worldwide.
          </p>
        </div>

        {/* Progress */}
        <div style={{ display:'flex', gap:'4px', marginBottom:'2.5rem' }}>
          {STEP_LABELS.map((label, i) => (
            <div key={i} style={{ flex:1 }}>
              <div style={{ height:'3px', backgroundColor: i <= step ? '#f2a90b' : 'rgba(255,255,255,0.1)', transition:'background-color 0.3s' }} />
              <div style={{ color: i <= step ? '#f2a90b' : 'rgba(245,242,233,0.25)', fontFamily:'Syne, sans-serif', fontSize:'0.6rem', letterSpacing:'0.1em', textTransform:'uppercase', marginTop:'0.4rem', textAlign:'center' }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* STEP 0 — Identity */}
        {step === 0 && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
            <div style={{ textAlign:'center' }}>
              <div onClick={() => fileRef.current?.click()}
                   style={{ width:'120px', height:'120px', borderRadius:'50%', backgroundColor:'#0C0C14', border: photoUrl ? '3px solid #f2a90b' : '2px dashed rgba(242,169,11,0.3)', margin:'0 auto 1rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
                {photoUrl ? (
                  <img src={photoUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                ) : (
                  <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'2rem', marginBottom:'4px' }}>📷</div>
                    <div style={{ color:'rgba(245,242,233,0.3)', fontSize:'0.6rem', fontFamily:'Syne, sans-serif', letterSpacing:'0.1em' }}>
                      {uploading ? 'UPLOADING...' : 'ADD PHOTO'}
                    </div>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={uploadPhoto} style={{ display:'none' }} />
              <div style={{ color:'rgba(245,242,233,0.25)', fontFamily:'Inter, sans-serif', fontSize:'0.75rem' }}>Max 5MB · JPG, PNG, WebP</div>
            </div>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="e.g. Marcel Tabit Akwe" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Short Bio</label>
              <textarea value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Tell Guneku who you are in 2-3 sentences..." rows={3} style={{ ...inputStyle, resize:'vertical' }} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div>
                <label style={labelStyle}>City / Town</label>
                <input value={form.current_city} onChange={e => set('current_city', e.target.value)} placeholder="e.g. Essen" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Country</label>
                <select value={form.current_country} onChange={e => { const c = COUNTRIES.find(x => x.name === e.target.value); set('current_country', e.target.value); set('country_flag', c?.flag || '🌍') }} style={{ ...inputStyle, appearance:'none' }}>
                  <option value="">Select country</option>
                  {COUNTRIES.map(c => <option key={c.name} value={c.name}>{c.flag} {c.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1 — Heritage */}
        {step === 1 && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
            <div style={{ backgroundColor:'rgba(242,169,11,0.05)', border:'1px solid rgba(242,169,11,0.15)', borderLeft:'3px solid #f2a90b', padding:'1rem 1.25rem' }}>
              <p style={{ color:'rgba(245,242,233,0.6)', fontFamily:'Inter, sans-serif', fontSize:'0.85rem', lineHeight:1.6, margin:0 }}>This section connects you to Guneku permanently. Your family heritage is your identity here.</p>
            </div>
            <div>
              <label style={labelStyle}>Your Quarter in Guneku</label>
              <select value={form.quarter} onChange={e => set('quarter', e.target.value)} style={{ ...inputStyle, appearance:'none' }}>
                <option value="">Select your quarter</option>
                {GUNEKU_QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Family Heritage</label>
              <input value={form.family_lineage} onChange={e => set('family_lineage', e.target.value)} placeholder="e.g. Son of late Mr Akwe Thaddeus Acho" style={inputStyle} />
              <div style={{ color:'rgba(245,242,233,0.2)', fontFamily:'Inter, sans-serif', fontSize:'0.75rem', marginTop:'0.4rem' }}>Name your parent, family elder, or lineage connection to Guneku</div>
            </div>
            <div>
              <label style={labelStyle}>Family Home in Guneku</label>
              <input value={form.family_home} onChange={e => set('family_home', e.target.value)} placeholder="e.g. Njinigom Quarter" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Your Generation</label>
              <select value={form.generation} onChange={e => set('generation', e.target.value)} style={{ ...inputStyle, appearance:'none' }}>
                <option value="">Select generation</option>
                {GENERATIONS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Year you left Guneku (optional)</label>
              <input type="number" value={form.year_left_guneku} onChange={e => set('year_left_guneku', e.target.value)} placeholder="e.g. 2005" min="1950" max="2026" style={inputStyle} />
            </div>
          </div>
        )}

        {/* STEP 2 — Work */}
        {step === 2 && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
            <div>
              <label style={labelStyle}>Profession / Title</label>
              <input value={form.profession} onChange={e => set('profession', e.target.value)} placeholder="e.g. Software Developer & IT Consultant" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Employer / Company / Institution</label>
              <input value={form.employer} onChange={e => set('employer', e.target.value)} placeholder="e.g. MaxPromo Digital" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Skills (comma-separated)</label>
              <input value={form.skills.join(', ')} onChange={e => set('skills', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))} placeholder="e.g. Web Development, AI Automation, Medicine" style={inputStyle} />
            </div>
            <label style={{ display:'flex', alignItems:'center', gap:'0.75rem', cursor:'pointer' }}>
              <div onClick={() => set('willing_to_mentor', !form.willing_to_mentor)} style={{ width:'44px', height:'24px', borderRadius:'12px', backgroundColor: form.willing_to_mentor ? '#f2a90b' : 'rgba(255,255,255,0.1)', position:'relative', transition:'background-color 0.2s', cursor:'pointer', flexShrink:0 }}>
                <div style={{ position:'absolute', top:'2px', left: form.willing_to_mentor ? '22px' : '2px', width:'20px', height:'20px', borderRadius:'50%', backgroundColor:'#F5F2E9', transition:'left 0.2s' }} />
              </div>
              <span style={{ color:'rgba(245,242,233,0.6)', fontFamily:'Inter, sans-serif', fontSize:'0.85rem' }}>Open to mentor Guneku youth</span>
            </label>
          </div>
        )}

        {/* STEP 3 — Online Presence */}
        {step === 3 && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <p style={{ color:'rgba(245,242,233,0.4)', fontFamily:'Inter, sans-serif', fontSize:'0.85rem', margin:'0 0 0.5rem' }}>All links optional — only fill what you want to share publicly.</p>
            {[
              { key:'website_url',   label:'Personal / Company Website', placeholder:'https://maxpromo.digital' },
              { key:'linkedin_url',  label:'LinkedIn',                   placeholder:'https://linkedin.com/in/...' },
              { key:'facebook_url',  label:'Facebook',                   placeholder:'https://facebook.com/...' },
              { key:'instagram_url', label:'Instagram',                  placeholder:'https://instagram.com/...' },
              { key:'twitter_url',   label:'X / Twitter',                placeholder:'https://twitter.com/...' },
              { key:'youtube_url',   label:'YouTube',                    placeholder:'https://youtube.com/...' },
            ].map(field => (
              <div key={field.key}>
                <label style={labelStyle}>{field.label}</label>
                <input value={(form as Record<string, unknown>)[field.key] as string} onChange={e => set(field.key, e.target.value)} placeholder={field.placeholder} style={inputStyle} />
              </div>
            ))}
            <div>
              <label style={labelStyle}>Profile visibility</label>
              <div style={{ display:'flex', gap:'1rem' }}>
                {[{ val: true, label:'Public — visible to all visitors' }, { val: false, label:'Private — visible to logged-in indigenes only' }].map(opt => (
                  <div key={String(opt.val)} onClick={() => set('is_public', opt.val)} style={{ flex:1, padding:'0.875rem', backgroundColor: form.is_public === opt.val ? 'rgba(242,169,11,0.1)' : '#0C0C14', border: `1px solid ${form.is_public === opt.val ? '#f2a90b' : 'rgba(255,255,255,0.08)'}`, cursor:'pointer' }}>
                    <div style={{ color:'#F5F2E9', fontFamily:'Syne, sans-serif', fontSize:'0.8rem', fontWeight:700, marginBottom:'0.25rem' }}>{form.is_public === opt.val ? '✓ ' : ''}{opt.val ? 'Public' : 'Private'}</div>
                    <div style={{ color:'rgba(245,242,233,0.35)', fontFamily:'Inter, sans-serif', fontSize:'0.75rem' }}>{opt.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4 — Review */}
        {step === 4 && (
          <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
            <div style={{ backgroundColor:'#0C0C14', border:'1px solid rgba(242,169,11,0.15)', padding:'2rem' }}>
              <div style={{ display:'flex', gap:'1.5rem', alignItems:'flex-start', marginBottom:'1.5rem' }}>
                <div style={{ width:'80px', height:'80px', borderRadius:'50%', backgroundColor:'#1A1A20', border:'2px solid rgba(242,169,11,0.3)', overflow:'hidden', flexShrink:0 }}>
                  {photoUrl ? (
                    <img src={photoUrl} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  ) : (
                    <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem' }}>👤</div>
                  )}
                </div>
                <div>
                  <h3 style={{ fontFamily:'Syne, sans-serif', fontWeight:700, color:'#F5F2E9', fontSize:'1.2rem', margin:'0 0 0.3rem' }}>{form.full_name || 'Your Name'}</h3>
                  <p style={{ color:'#f2a90b', fontFamily:'Syne, sans-serif', fontSize:'0.8rem', margin:'0 0 0.25rem' }}>{form.profession || 'Profession'}</p>
                  <p style={{ color:'rgba(245,242,233,0.4)', fontFamily:'Inter, sans-serif', fontSize:'0.8rem', margin:0 }}>{form.country_flag} {form.current_city}{form.current_city && form.current_country ? ', ' : ''}{form.current_country}</p>
                </div>
              </div>
              {[
                { label:'Quarter', value: form.quarter },
                { label:'Heritage', value: form.family_lineage },
                { label:'Family Home', value: form.family_home },
                { label:'Generation', value: form.generation },
              ].filter(f => f.value).map(f => (
                <div key={f.label} style={{ display:'flex', justifyContent:'space-between', padding:'0.5rem 0', borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ color:'rgba(245,242,233,0.35)', fontFamily:'Syne, sans-serif', fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.1em' }}>{f.label}</span>
                  <span style={{ color:'rgba(245,242,233,0.7)', fontFamily:'Inter, sans-serif', fontSize:'0.85rem' }}>{f.value}</span>
                </div>
              ))}
            </div>
            <p style={{ color:'rgba(245,242,233,0.35)', fontFamily:'Inter, sans-serif', fontSize:'0.8rem', textAlign:'center', lineHeight:1.6 }}>You can edit your profile at any time. Your profile will appear in the Guneku Indigenes Directory.</p>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:'2.5rem' }}>
          {step > 0 ? (
            <button onClick={() => setStep(s => s - 1)} style={{ border:'1px solid rgba(245,242,233,0.2)', color:'rgba(245,242,233,0.6)', fontFamily:'Syne, sans-serif', fontWeight:700, padding:'0.85rem 2rem', fontSize:'0.78rem', letterSpacing:'0.12em', textTransform:'uppercase', background:'none', cursor:'pointer' }}>← Back</button>
          ) : <div />}
          {step < 4 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={step === 0 && !form.full_name} style={{ backgroundColor: step === 0 && !form.full_name ? 'rgba(242,169,11,0.3)' : '#f2a90b', color:'#0F0F0F', fontFamily:'Syne, sans-serif', fontWeight:700, padding:'0.85rem 2rem', fontSize:'0.78rem', letterSpacing:'0.12em', textTransform:'uppercase', border:'none', cursor: step === 0 && !form.full_name ? 'not-allowed' : 'pointer' }}>Continue →</button>
          ) : (
            <button onClick={submit} disabled={saving} style={{ backgroundColor:'#f2a90b', color:'#0F0F0F', fontFamily:'Syne, sans-serif', fontWeight:700, padding:'0.85rem 2rem', fontSize:'0.78rem', letterSpacing:'0.12em', textTransform:'uppercase', border:'none', cursor:'pointer' }}>
              {saving ? 'SAVING...' : 'PUBLISH MY PROFILE →'}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
