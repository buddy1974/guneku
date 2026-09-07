/* The Palace's own contact details, as two values a client component may safely carry.
 *
 * ── Why these are literals and not an import ─────────────────────────────────────────────
 *
 * A JSON import in a client module ships the **whole file** to the browser. Bundlers do not
 * eliminate the properties a component never reads: the record becomes one object literal in
 * the chunk, every field included.
 *
 * That is not hypothetical here. `site-config.json` carried `fonEmail` — the Fon's personal
 * address — `/contact` is a client component that imported the whole record for one
 * telephone number, and until 2026-09-07 that address sat in a public JavaScript chunk on
 * `/contact`: invisible to any reader, one search away for anyone harvesting. The field is
 * gone from the record now, and re-importing the record would only have re-armed the same
 * gun for whatever field it grows next.
 *
 * So the two published values are written here, and a test asserts they equal what
 * `site-config.json` says. One source of truth, enforced rather than hoped for, and nothing
 * else from that record crosses into a browser.
 *
 * Both are institutional and both are published deliberately: the telephone is the Palace
 * number of record (ADR-002) and the address is the Fondom's own, never an officer's. */

export const PALACE_PHONE = '+237 681 19 46 64'
export const PALACE_EMAIL = 'info@guneku.org'
