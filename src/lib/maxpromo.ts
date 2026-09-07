/* Where a Guneku page sends somebody who wants to reach the people who built it.
 *
 * Two destinations and no third. They are here rather than typed into each page because
 * that is exactly how the last one went stale: `https://maxpromo.digital/automation-audit`
 * was written into three components and one data record, MaxPromo retired the route, and
 * every one of those links went on pointing at it. A constant would have been one edit.
 *
 * ── The retired route is not redirected around ───────────────────────────────────────────
 *
 * Guneku links straight at the live destination. It does not keep the old URL and rely on
 * MaxPromo to redirect it, and it does not add a redirect of its own: a village website
 * carrying a hop for somebody else's retired marketing route is a small piece of debt that
 * nobody would remember to remove.
 *
 * ── What these are not ───────────────────────────────────────────────────────────────────
 *
 * The credit links — the footer, the "built by" lines, the author metadata — point at the
 * company's home page and stay as they are. They are attribution rather than a call to
 * action, and turning them into contact links would expand MaxPromo's presence on a village
 * record rather than repair it. */

/** The company's home page. Used by the credits: footer, "built by", author metadata. */
export const MAXPROMO_SITE = 'https://maxpromo.digital'

/** The canonical contact destination. Every call to action goes here. */
export const MAXPROMO_CONTACT = 'https://www.maxpromo.digital/en/contact'
