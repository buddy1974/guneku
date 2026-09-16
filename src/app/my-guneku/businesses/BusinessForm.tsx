'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BUSINESS_CATEGORIES, CATEGORY_LABEL, BUSINESS_RELATIONSHIPS, RELATIONSHIP_LABEL,
  youtubeIdFrom,
} from '@/lib/businesses'

const LABEL = 'block text-[0.72rem] font-semibold uppercase tracking-[0.07em] text-[var(--ink-600)]'
const FIELD = 'mt-1.5 w-full rounded-[3px] border border-[var(--rule)] bg-[var(--paper)] px-3 py-2.5 text-[0.92rem] text-[var(--ink-900)] focus:border-[var(--royal-green)] focus:outline-none disabled:opacity-55'
const HINT = 'mt-1 text-[0.76rem] text-[var(--ink-400)]'

export type BusinessFormValues = {
  name: string
  tagline: string
  description: string
  category: string
  relationship: string
  tags: string
  services: string
  serviceAreas: string
  country: string
  city: string
  address: string
  website: string
  facebook: string
  instagram: string
  linkedin: string
  youtube: string
  publishContact: boolean
  contactPhone: string
  contactEmail: string
  logoUrl: string
  coverUrl: string
  videos: string
}

export const EMPTY_BUSINESS: BusinessFormValues = {
  name: '', tagline: '', description: '', category: '', relationship: 'owner',
  tags: '', services: '', serviceAreas: '',
  country: '', city: '', address: '',
  website: '', facebook: '', instagram: '', linkedin: '', youtube: '',
  publishContact: false, contactPhone: '', contactEmail: '',
  logoUrl: '', coverUrl: '', videos: '',
}

const lines = (v: string) => v.split('\n').map(s => s.trim()).filter(Boolean)
const commas = (v: string) => v.split(',').map(s => s.trim()).filter(Boolean)

/* Registering or editing a business.
 *
 * Sectioned rather than presented as one wall of fields, because the wall is what makes
 * people abandon it — and a half-finished business record is worse for the directory than no
 * record. Only two things are actually required: what the business is called and what kind of
 * business it is. Everything else improves the page and nothing else blocks the save.
 *
 * There is no owner field and no person field. Whose business this is comes from the Palace's
 * own confirmation of who the signed-in person is, read on the server. A form that let
 * somebody type whose business it was would be the vulnerability, not the feature. */
export function BusinessForm({ initial, businessId }: {
  initial?: BusinessFormValues
  /** Present when editing. Absent when registering. */
  businessId?: string
}) {
  const router = useRouter()
  const [v, setV] = useState<BusinessFormValues>(initial ?? EMPTY_BUSINESS)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  function set<K extends keyof BusinessFormValues>(k: K, value: BusinessFormValues[K]) {
    setV(prev => ({ ...prev, [k]: value }))
    setSaved(false)
  }

  /* Checked here so somebody pasting a playlist URL is told at once rather than after a
     round trip. The server checks again and is the one that decides — this is courtesy. */
  const badVideo = lines(v.videos).find(line => !youtubeIdFrom(line))

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!v.name.trim()) return setError('Give the business a name.')
    if (!v.category) return setError('Choose a category for the business.')
    if (badVideo) return setError('Enter a valid YouTube video link.')

    setSaving(true)
    try {
      const payload = {
        name: v.name,
        tagline: v.tagline,
        description: v.description,
        category: v.category,
        relationship: v.relationship,
        tags: commas(v.tags),
        services: lines(v.services),
        serviceAreas: commas(v.serviceAreas),
        country: v.country,
        city: v.city,
        address: v.address,
        website: v.website,
        facebook: v.facebook,
        instagram: v.instagram,
        linkedin: v.linkedin,
        youtube: v.youtube,
        publishContact: v.publishContact,
        contactPhone: v.contactPhone,
        contactEmail: v.contactEmail,
        logoUrl: v.logoUrl,
        coverUrl: v.coverUrl,
        videos: lines(v.videos).map(url => ({ url })),
      }

      const res = await fetch(
        businessId ? `/api/businesses/${businessId}` : '/api/businesses',
        {
          method: businessId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      )
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'That could not be saved.')
        return
      }

      setSaved(true)
      router.push('/my-guneku/businesses')
      router.refresh()
    } catch {
      setError('That could not be saved. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-7">
      {/* ── What it is ── */}
      <fieldset className="inst-card border-0 p-0">
        <legend className="inst-h3">What the business is</legend>
        <div className="mt-4 grid gap-4">
          <div>
            <label htmlFor="bf-name" className={LABEL}>Business name *</label>
            <input id="bf-name" required value={v.name} onChange={e => set('name', e.target.value)}
                   className={FIELD} maxLength={120} disabled={saving} />
          </div>
          <div>
            <label htmlFor="bf-tagline" className={LABEL}>In one line</label>
            <input id="bf-tagline" value={v.tagline} onChange={e => set('tagline', e.target.value)}
                   className={FIELD} maxLength={180} disabled={saving}
                   placeholder="What you do, in the words you would use" />
            <p className={HINT}>This is the line people read on the directory card.</p>
          </div>
          <div>
            <label htmlFor="bf-description" className={LABEL}>About the business</label>
            <textarea id="bf-description" rows={5} value={v.description}
                      onChange={e => set('description', e.target.value)}
                      className={FIELD} maxLength={4000} disabled={saving} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="bf-category" className={LABEL}>Category *</label>
              <select id="bf-category" required value={v.category}
                      onChange={e => set('category', e.target.value)}
                      className={FIELD} disabled={saving}>
                <option value="">Choose one</option>
                {BUSINESS_CATEGORIES.map(c => (
                  <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="bf-relationship" className={LABEL}>Your part in it</label>
              <select id="bf-relationship" value={v.relationship}
                      onChange={e => set('relationship', e.target.value)}
                      className={FIELD} disabled={saving}>
                {BUSINESS_RELATIONSHIPS.map(r => (
                  <option key={r} value={r}>{RELATIONSHIP_LABEL[r]}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="bf-tags" className={LABEL}>Tags</label>
            <input id="bf-tags" value={v.tags} onChange={e => set('tags', e.target.value)}
                   className={FIELD} disabled={saving} placeholder="Catering, Events, Delivery" />
            <p className={HINT}>Separated by commas. A few good ones beat a dozen.</p>
          </div>
        </div>
      </fieldset>

      {/* ── Services ── */}
      <fieldset className="inst-card border-0 p-0">
        <legend className="inst-h3">What you offer</legend>
        <div className="mt-4">
          <label htmlFor="bf-services" className={LABEL}>Services</label>
          <textarea id="bf-services" rows={5} value={v.services}
                    onChange={e => set('services', e.target.value)}
                    className={FIELD} disabled={saving}
                    placeholder={'One per line\nHouse construction\nRenovation'} />
          <p className={HINT}>One service per line.</p>
        </div>
      </fieldset>

      {/* ── Where ── */}
      <fieldset className="inst-card border-0 p-0">
        <legend className="inst-h3">Where the business is</legend>
        <p className="inst-body mt-1.5 !text-[0.86rem]">
          This is the business&rsquo;s address, not your home. It appears on the public page,
          so give only what you would put on a shop sign.
        </p>
        <div className="mt-4 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="bf-country" className={LABEL}>Country</label>
              <input id="bf-country" value={v.country} onChange={e => set('country', e.target.value)}
                     className={FIELD} maxLength={120} disabled={saving} />
            </div>
            <div>
              <label htmlFor="bf-city" className={LABEL}>Town or city</label>
              <input id="bf-city" value={v.city} onChange={e => set('city', e.target.value)}
                     className={FIELD} maxLength={120} disabled={saving} />
            </div>
          </div>
          <div>
            <label htmlFor="bf-address" className={LABEL}>Business address</label>
            <input id="bf-address" value={v.address} onChange={e => set('address', e.target.value)}
                   className={FIELD} maxLength={200} disabled={saving}
                   placeholder="Opposite the market, Ngong" />
          </div>
          <div>
            <label htmlFor="bf-areas" className={LABEL}>Areas you serve</label>
            <input id="bf-areas" value={v.serviceAreas}
                   onChange={e => set('serviceAreas', e.target.value)}
                   className={FIELD} disabled={saving} placeholder="Guneku, Mbengwi, Bamenda" />
            <p className={HINT}>Separated by commas.</p>
          </div>
        </div>
      </fieldset>

      {/* ── Online ── */}
      <fieldset className="inst-card border-0 p-0">
        <legend className="inst-h3">Online</legend>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {([
            ['bf-website', 'Website', 'website'],
            ['bf-facebook', 'Facebook page', 'facebook'],
            ['bf-instagram', 'Instagram', 'instagram'],
            ['bf-linkedin', 'LinkedIn', 'linkedin'],
          ] as const).map(([id, label, key]) => (
            <div key={id}>
              <label htmlFor={id} className={LABEL}>{label}</label>
              <input id={id} type="url" inputMode="url" value={v[key]}
                     onChange={e => set(key, e.target.value)}
                     className={FIELD} disabled={saving} placeholder="https://" />
            </div>
          ))}
        </div>
        <p className={HINT}>
          Business pages only. A link that is not a web address is dropped.
        </p>
      </fieldset>

      {/* ── Pictures ── */}
      <fieldset className="inst-card border-0 p-0">
        <legend className="inst-h3">Logo and cover</legend>
        <p className="inst-body mt-1.5 !text-[0.86rem]">
          Both are optional. A business with no pictures gets a designed cover of its own
          rather than an empty box, so nothing looks broken while you find them.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bf-logo" className={LABEL}>Logo address</label>
            <input id="bf-logo" type="url" inputMode="url" value={v.logoUrl}
                   onChange={e => set('logoUrl', e.target.value)}
                   className={FIELD} disabled={saving} placeholder="https://" />
          </div>
          <div>
            <label htmlFor="bf-cover" className={LABEL}>Cover image address</label>
            <input id="bf-cover" type="url" inputMode="url" value={v.coverUrl}
                   onChange={e => set('coverUrl', e.target.value)}
                   className={FIELD} disabled={saving} placeholder="https://" />
          </div>
        </div>
      </fieldset>

      {/* ── Video ── */}
      <fieldset className="inst-card border-0 p-0">
        <legend className="inst-h3">Video</legend>
        <div className="mt-4">
          <label htmlFor="bf-videos" className={LABEL}>YouTube links</label>
          <textarea id="bf-videos" rows={4} value={v.videos}
                    onChange={e => set('videos', e.target.value)}
                    className={FIELD} disabled={saving}
                    aria-invalid={badVideo ? true : undefined}
                    aria-describedby="bf-videos-hint"
                    placeholder={'One per line\nhttps://youtu.be/…'} />
          <p id="bf-videos-hint" className={HINT}>
            One per line. Ordinary YouTube links, shorts and youtu.be all work.
          </p>
          {badVideo && (
            <p className="mt-1.5 text-[0.8rem] text-[var(--destructive)]">
              Enter a valid YouTube video link.
            </p>
          )}
        </div>
      </fieldset>

      {/* ── Contact ── */}
      <fieldset className="inst-card border-0 p-0">
        <legend className="inst-h3">Contact</legend>
        <p className="inst-body mt-1.5 !text-[0.86rem]">
          Nothing is taken from your Guneku profile. A business number or address appears only
          if you put it here and switch it on, and switching it off removes it.
        </p>
        <label className="mt-4 flex items-start gap-2.5 text-[0.9rem] text-[var(--ink-900)]">
          <input type="checkbox" checked={v.publishContact} disabled={saving}
                 onChange={e => set('publishContact', e.target.checked)}
                 className="mt-1 h-4 w-4 accent-[var(--royal-green)]" />
          <span>Publish these business contact details on the directory</span>
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="bf-phone" className={LABEL}>Business telephone</label>
            <input id="bf-phone" value={v.contactPhone} disabled={saving || !v.publishContact}
                   onChange={e => set('contactPhone', e.target.value)}
                   className={FIELD} maxLength={160} />
          </div>
          <div>
            <label htmlFor="bf-email" className={LABEL}>Business email</label>
            <input id="bf-email" type="email" value={v.contactEmail}
                   disabled={saving || !v.publishContact}
                   onChange={e => set('contactEmail', e.target.value)}
                   className={FIELD} maxLength={160} />
          </div>
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="border-l-2 border-[var(--destructive)] pl-3 text-[0.9rem] text-[var(--destructive)]">
          {error}
        </p>
      )}
      {saved && !error && (
        <p role="status" className="inst-meta">Saved.</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={saving} className="inst-btn inst-btn-primary">
          {saving ? 'Saving…' : businessId ? 'Save changes' : 'Register this business'}
        </button>
        <a href="/my-guneku/businesses" className="inst-link">Cancel</a>
      </div>

      <p className="inst-meta">
        A newly registered business waits for the Palace to look at it before it appears on
        the public directory. You can keep editing it while it waits.
      </p>
    </form>
  )
}
