'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import type { IndigeneProfile } from '@/types/indigene'

/* The member's own profile, shown and editable in one place.
 *
 * Identity is not a prop and is not a field. The server page fetched this row with the Clerk
 * session's user id, and the PUT below carries no id at all — the route takes it from the
 * session again. There is deliberately nothing here that names whose profile is being saved:
 * a form that could say so would be the vulnerability, not the feature. */

const LABEL = 'block text-[0.72rem] font-semibold uppercase tracking-[0.07em] text-[var(--ink-600)]'
const FIELD = 'mt-1.5 w-full rounded-[3px] border border-[var(--rule)] bg-[var(--paper)] px-3 py-2.5 text-[0.92rem] text-[var(--ink-900)] focus:border-[var(--royal-green)] focus:outline-none disabled:opacity-55'

/* The editable shape, flattened to strings so an empty input is an empty string rather than
   undefined. That distinction is what lets a member clear a field: the route reads "" as
   "remove this" and a missing key as "leave it alone". */
type Draft = {
  full_name: string
  display_name: string
  bio: string
  current_city: string
  current_country: string
  profession: string
  employer: string
  quarter: string
  family_lineage: string
  family_home: string
  generation: string
  year_left_guneku: string
  skills: string
  website_url: string
  facebook_url: string
  instagram_url: string
  linkedin_url: string
  twitter_url: string
  youtube_url: string
  is_public: boolean
  willing_to_mentor: boolean
  open_to_connect: boolean
}

function toDraft(p: IndigeneProfile): Draft {
  return {
    full_name:        p.full_name ?? '',
    display_name:     p.display_name ?? '',
    bio:              p.bio ?? '',
    current_city:     p.current_city ?? '',
    current_country:  p.current_country ?? '',
    profession:       p.profession ?? '',
    employer:         p.employer ?? '',
    quarter:          p.quarter ?? '',
    family_lineage:   p.family_lineage ?? '',
    family_home:      p.family_home ?? '',
    generation:       p.generation ?? '',
    year_left_guneku: p.year_left_guneku ? String(p.year_left_guneku) : '',
    skills:           (p.skills ?? []).join(', '),
    website_url:      p.website_url ?? '',
    facebook_url:     p.facebook_url ?? '',
    instagram_url:    p.instagram_url ?? '',
    linkedin_url:     p.linkedin_url ?? '',
    twitter_url:      p.twitter_url ?? '',
    youtube_url:      p.youtube_url ?? '',
    is_public:         p.is_public !== false,
    willing_to_mentor: p.willing_to_mentor === true,
    open_to_connect:   p.open_to_connect !== false,
  }
}

const LINKS = [
  ['website_url',   'Website'],
  ['linkedin_url',  'LinkedIn'],
  ['facebook_url',  'Facebook'],
  ['instagram_url', 'Instagram'],
  ['twitter_url',   'X / Twitter'],
  ['youtube_url',   'YouTube'],
] as const

export function ProfileEditor({
  profile, quarters, generations,
}: {
  profile: IndigeneProfile
  quarters: readonly string[]
  generations: readonly string[]
}) {
  const [v, setV]         = useState<Draft>(() => toDraft(profile))
  const [photoUrl, setPhotoUrl] = useState(profile.photo_url ?? '')
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [uploading, setUploading]   = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function set<K extends keyof Draft>(k: K, value: Draft[K]) {
    setV(prev => ({ ...prev, [k]: value }))
    setSaved(false)
  }

  /* A full navigation, not a router push: the session is gone and the server has to decide
     again who this is. `redirect_url` brings them back to this page. */
  function toSignIn() {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- deliberate: the session is gone, so the server must decide again who this is
    window.location.href = '/sign-in?redirect_url=%2Findigenes%2Fprofile'
  }

  /* The same authenticated, user-scoped upload route the onboarding journey uses. Nothing
     about it is relaxed here: a session is required, the blob path is derived from that
     session's own id, the extension comes from the sniffed content type, SVG is refused and
     the 5MB ceiling still applies. This form only sends the file and shows the answer. */
  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setPhotoError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'avatar')
      const res  = await fetch('/api/indigenes/upload', { method: 'POST', body: fd })
      const data = await res.json().catch(() => ({}))

      if (res.status === 401) return toSignIn()
      if (!res.ok || !data.url) {
        setPhotoError(data.error || 'That image could not be uploaded. Please try another.')
        return
      }
      setPhotoUrl(data.url)
      setSaved(false)
    } catch {
      setPhotoError('That image could not be uploaded. Please check your connection.')
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const res = await fetch('/api/indigenes/profile', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...v,
          photo_url: photoUrl,
          /* Sent as an array because that is what the profile model holds; the query layer
             is what knows it is stored as one comma-separated column. */
          skills: v.skills.split(',').map(s => s.trim()).filter(Boolean),
          year_left_guneku: v.year_left_guneku ? Number(v.year_left_guneku) : '',
        }),
      })
      const data = await res.json().catch(() => ({}))

      if (res.status === 401) return toSignIn()
      if (res.status === 404) {
        /* The profile is gone — removed on request, most likely. Offer the way back in
           rather than leaving a form that saves into nothing. */
        setError('You do not have a profile any more. You can create a new one from the directory.')
        return
      }
      if (!res.ok) {
        setError(data.error || 'Your changes could not be saved. Please try again.')
        return
      }
      setSaved(true)
    } catch {
      setError('Your changes could not be saved. Please check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:gap-12">
      <div className="grid gap-8">
        {/* ── Who you are ── */}
        <section className="inst-card p-5 md:p-6">
          <h2 className="inst-h3">Who you are</h2>

          <div className="mt-5 flex flex-wrap items-center gap-5">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border border-[var(--rule)] bg-[var(--paper-alt)]">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[1.6rem] text-[var(--ink-400)]">
                  {(v.full_name || '?').charAt(0)}
                </div>
              )}
            </div>
            <div>
              <button type="button" onClick={() => fileRef.current?.click()}
                      disabled={uploading}
                      className="inst-btn inst-btn-quiet !py-2 !text-[0.76rem] disabled:opacity-55">
                {uploading ? 'Uploading…' : photoUrl ? 'Change photo' : 'Add a photo'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={uploadPhoto} className="hidden" />
              <p className="inst-meta mt-2">Max 5MB · JPEG, PNG, WebP, GIF or AVIF</p>
              {photoError && (
                <p role="alert" className="mt-1.5 text-[0.84rem] text-[var(--oxblood)]">{photoError}</p>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="p-name">Full name</label>
              <input id="p-name" required className={FIELD} maxLength={120}
                     value={v.full_name} onChange={e => set('full_name', e.target.value)} />
            </div>
            <div>
              <label className={LABEL} htmlFor="p-display">Name to show, if different</label>
              <input id="p-display" className={FIELD} maxLength={120}
                     value={v.display_name} onChange={e => set('display_name', e.target.value)} />
            </div>
          </div>

          <div className="mt-4">
            <label className={LABEL} htmlFor="p-bio">Short bio</label>
            <textarea id="p-bio" rows={3} className={FIELD} maxLength={1000}
                      value={v.bio} onChange={e => set('bio', e.target.value)} />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="p-city">City or town you live in</label>
              <input id="p-city" className={FIELD} maxLength={120}
                     value={v.current_city} onChange={e => set('current_city', e.target.value)} />
            </div>
            <div>
              <label className={LABEL} htmlFor="p-country">Country you live in</label>
              <input id="p-country" className={FIELD} maxLength={120} autoComplete="country-name"
                     value={v.current_country} onChange={e => set('current_country', e.target.value)} />
            </div>
          </div>
        </section>

        {/* ── Heritage ── */}
        <section className="inst-card p-5 md:p-6">
          <h2 className="inst-h3">Your connection to Guneku</h2>
          <p className="inst-body mt-2 !text-[0.88rem]">
            What you tell the directory about your own family. It is your account of yourself,
            not a Palace record — the register is only changed by a claim the Palace reviews.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="p-quarter">Your quarter</label>
              <select id="p-quarter" className={FIELD}
                      value={v.quarter} onChange={e => set('quarter', e.target.value)}>
                <option value="">Not saying</option>
                {quarters.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL} htmlFor="p-generation">Your generation</label>
              <select id="p-generation" className={FIELD}
                      value={v.generation} onChange={e => set('generation', e.target.value)}>
                <option value="">Not saying</option>
                {generations.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL} htmlFor="p-lineage">Family heritage</label>
              <input id="p-lineage" className={FIELD} maxLength={200}
                     placeholder="Your parent, family elder, or lineage connection to Guneku"
                     value={v.family_lineage} onChange={e => set('family_lineage', e.target.value)} />
            </div>
            <div>
              <label className={LABEL} htmlFor="p-home">Family home in Guneku</label>
              <input id="p-home" className={FIELD} maxLength={160}
                     value={v.family_home} onChange={e => set('family_home', e.target.value)} />
            </div>
            <div>
              <label className={LABEL} htmlFor="p-year">Year you left Guneku</label>
              <input id="p-year" type="number" min={1900} max={2100} className={FIELD}
                     value={v.year_left_guneku} onChange={e => set('year_left_guneku', e.target.value)} />
            </div>
          </div>
        </section>

        {/* ── Work ── */}
        <section className="inst-card p-5 md:p-6">
          <h2 className="inst-h3">Your work</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL} htmlFor="p-profession">Profession or title</label>
              <input id="p-profession" className={FIELD} maxLength={160}
                     value={v.profession} onChange={e => set('profession', e.target.value)} />
            </div>
            <div>
              <label className={LABEL} htmlFor="p-employer">Employer or institution</label>
              <input id="p-employer" className={FIELD} maxLength={160}
                     value={v.employer} onChange={e => set('employer', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL} htmlFor="p-skills">Skills, separated by commas</label>
              <input id="p-skills" className={FIELD} maxLength={400}
                     value={v.skills} onChange={e => set('skills', e.target.value)} />
            </div>
          </div>
        </section>

        {/* ── Links ── */}
        <section className="inst-card p-5 md:p-6">
          <h2 className="inst-h3">Links</h2>
          <p className="inst-body mt-2 !text-[0.88rem]">
            All optional. Only fill in what you are content to have shown publicly.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {LINKS.map(([key, label]) => (
              <div key={key}>
                <label className={LABEL} htmlFor={`p-${key}`}>{label}</label>
                <input id={`p-${key}`} type="url" className={FIELD} maxLength={300}
                       value={v[key]} onChange={e => set(key, e.target.value)} />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Visibility and saving ── */}
      <aside className="grid gap-5 self-start lg:sticky lg:top-6">
        <section className="inst-card p-5">
          <h2 className="inst-h3">What the directory shows</h2>
          <div className="mt-4 grid gap-3">
            {([
              ['is_public',         'List me in the public indigenes directory'],
              ['willing_to_mentor', 'Show that I am open to mentoring Guneku youth'],
              ['open_to_connect',   'Show that I am open to being contacted by indigenes'],
            ] as const).map(([key, text]) => (
              <label key={key} className="flex items-start gap-2.5 text-[0.88rem] leading-[1.55] text-[var(--ink-600)]">
                <input type="checkbox" className="mt-1 shrink-0"
                       checked={v[key]} onChange={e => set(key, e.target.checked)} />
                <span>{text}</span>
              </label>
            ))}
          </div>
          <p className="inst-meta mt-4">
            Turning off the first one removes you from the public directory immediately. Your
            profile stays here and nothing is deleted.
          </p>
        </section>

        <section className="inst-card p-5">
          {error && <p role="alert" className="mb-3 text-[0.86rem] leading-[1.55] text-[var(--oxblood)]">{error}</p>}
          {saved && <p className="mb-3 text-[0.86rem] text-[var(--royal-green)]">Saved.</p>}

          <button type="submit" disabled={saving}
                  className="inst-btn inst-btn-primary w-full justify-center disabled:opacity-55">
            {saving ? 'Saving…' : 'Save my profile'}
          </button>

          <p className="inst-meta mt-4">
            Emptying a field and saving removes it from your profile.
          </p>

          <p className="inst-body mt-4 !text-[0.86rem]">
            If you would rather your entry were not in the directory at all,{' '}
            <Link href="/indigenes/submit?intent=remove" className="inst-link">
              ask for it to be taken down
            </Link>
            . It comes down without question.
          </p>
        </section>

        <Link href="/indigenes" className="inst-btn inst-btn-quiet justify-center">
          View the directory
        </Link>
      </aside>
    </form>
  )
}
