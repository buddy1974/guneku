'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { BusinessCard } from './BusinessCard'
import {
  type Business, filterBusinesses, categoriesPresent, countriesPresent,
} from '@/lib/businesses'

/* The directory's own filtering, done in the browser over a list the server already sent.
 *
 * The whole directory is small — it will be tens of businesses for a long time — so there is
 * nothing to gain from a round trip per keystroke and quite a lot to lose on a slow
 * connection. The list arrives once with the page and filtering is instant after that.
 *
 * The business PAGES are still statically generated and individually crawlable; this only
 * governs which cards are on screen. */

export function BusinessDirectory({ businesses }: { businesses: Business[] }) {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [country, setCountry] = useState('')

  const categories = useMemo(() => categoriesPresent(businesses), [businesses])
  const countries = useMemo(() => countriesPresent(businesses), [businesses])

  const results = useMemo(
    () => filterBusinesses(businesses, { q, category, country }),
    [businesses, q, category, country],
  )

  const filtered = Boolean(q || category || country)
  const clear = () => { setQ(''); setCategory(''); setCountry('') }

  return (
    <div>
      <div className="inst-card p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <label htmlFor="biz-q" className="inst-tag">Search</label>
            <input
              id="biz-q"
              type="search"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="A name, a service, a place"
              className="mt-1.5 w-full border border-[var(--rule)] bg-white px-3 py-2.5 text-[0.92rem] text-[var(--ink-900)] outline-none focus-visible:border-[var(--royal-green)] focus-visible:ring-2 focus-visible:ring-[var(--royal-green)]/30"
            />
          </div>

          <div>
            <label htmlFor="biz-category" className="inst-tag">Category</label>
            <select
              id="biz-category"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="mt-1.5 w-full border border-[var(--rule)] bg-white px-3 py-2.5 text-[0.92rem] text-[var(--ink-900)] outline-none focus-visible:border-[var(--royal-green)] focus-visible:ring-2 focus-visible:ring-[var(--royal-green)]/30"
            >
              <option value="">Every category</option>
              {categories.map(c => (
                <option key={c.category} value={c.category}>{c.label} ({c.count})</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="biz-country" className="inst-tag">Country</label>
            <select
              id="biz-country"
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="mt-1.5 w-full border border-[var(--rule)] bg-white px-3 py-2.5 text-[0.92rem] text-[var(--ink-900)] outline-none focus-visible:border-[var(--royal-green)] focus-visible:ring-2 focus-visible:ring-[var(--royal-green)]/30"
            >
              <option value="">Everywhere</option>
              {countries.map(c => (
                <option key={c.country} value={c.country}>{c.country} ({c.count})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--rule)] pt-3">
          {/* Announced politely, so somebody filtering with a screen reader hears the count
              change without the focus being taken away from the field they are typing in. */}
          <p className="inst-meta m-0" role="status" aria-live="polite">
            {results.length === businesses.length
              ? `${businesses.length} ${businesses.length === 1 ? 'business' : 'businesses'}`
              : `${results.length} of ${businesses.length}`}
          </p>
          {filtered && (
            <button type="button" onClick={clear} className="inst-link text-[0.82rem]">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {results.length > 0 ? (
        <div className="biz-grid mt-7">
          {results.map((b, i) => (
            <BusinessCard key={b.slug} business={b} priority={i < 3} />
          ))}
        </div>
      ) : (
        <div className="inst-card mt-7 p-8 text-center">
          <p className="inst-h3">Nothing matches that yet</p>
          <p className="inst-body mx-auto mt-2 max-w-md">
            The directory is young. If the business you are looking for belongs to a son or
            daughter of Guneku, it may simply not be here yet &mdash; and if it is yours, it
            takes a few minutes to add.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button type="button" onClick={clear} className="inst-btn inst-btn-quiet">
              Clear filters
            </button>
            <Link href="/my-guneku/businesses/new" className="inst-btn inst-btn-primary">
              Register your business
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
