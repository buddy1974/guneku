/* The pictures each curated business is shown with.
 *
 * ── Where they came from ─────────────────────────────────────────────────────────────────
 *
 * Every file named here was supplied for its business and sits, untouched, in that
 * business's own folder under `public/business/`. One is derived rather than supplied, and
 * says so where it is used: Magic Gate's logo, trimmed of white margin. The original is kept
 * beside it. The folders are named as they were
 * delivered — with spaces and mixed case — and are not renamed to match slugs: the slug is
 * the business's public address, the folder is where its material was filed, and neither
 * should move to suit the other. This table is the only place the two meet.
 *
 * ── What was left out, and why ───────────────────────────────────────────────────────────
 *
 * More was supplied than is used. A file is left in its folder, unreferenced, when it:
 *
 *   prints a telephone number or address the record does not publish. A curated record
 *     carries no telephone number (there is a test for it), and a flyer with the number on
 *     it would publish one through the side door;
 *   is a portrait of a person. The person has an entry in the register, and their face
 *     belongs there, not on a business card;
 *   is a dated event poster, a sponsor's graphic, or a near-duplicate of a file already
 *     chosen — a directory card is not a noticeboard;
 *   looks like a stock render rather than the business's own photograph.
 *
 * Those files are not deleted. They were moved, byte-for-byte, to
 * `archive-staging/business/<same folder>/`, where they are kept but not served, until the
 * owner decides what they are. The inventory and the reason for each exclusion is in
 * docs/change-log.md.
 *
 * ── Hints ────────────────────────────────────────────────────────────────────────────────
 *
 * `logoFit: 'cover'` is for a logo delivered as a square tile with its own background (a
 * yellow plate, a blue plate) — it fills the plate rather than sitting inside a white one.
 * `coverFit: 'contain'` is for a poster or banner whose text a crop would cut in half; it is
 * shown whole over a blurred copy of itself. Both are presentation only. */

export type BusinessMediaEntry = {
  /** The folder under public/business/, exactly as delivered. */
  folder: string
  logo?: { file: string; width: number; height: number; fit?: 'cover' }
  cover?: { file: string; fit?: 'contain'; position?: string }
  gallery?: Array<{ file: string; alt: string; fit?: 'contain' }>
}

/** A public URL for a supplied file. Folder and file names keep their spaces on disk and are
 *  percent-encoded here, once, so nothing downstream ever sees a raw space in a path. */
export function businessAsset(folder: string, file: string): string {
  return `/business/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`
}

export const BUSINESS_MEDIA: Record<string, BusinessMediaEntry> = {
  'maxpromo-digital': {
    folder: 'maxpromo',
    logo: { file: 'fb-logo.png', width: 2056, height: 765, fit: 'cover' },
    cover: { file: 'fb-cover.png', position: '18% center' },
    gallery: [
      { file: 'agent systems.png', alt: 'MaxPromo Digital graphic: AI and agent systems' },
      { file: 'workflow-automation.png', alt: 'MaxPromo Digital graphic: custom business systems' },
      { file: 'workflow.png', alt: 'MaxPromo Digital graphic: workflow automation' },
    ],
  },

  'midas-property-auctions': {
    folder: 'midas property auctions',
    logo: { file: 'logo-midas-black-subtext.png', width: 768, height: 244 },
    cover: { file: 'image.webp' },
  },

  'fondom-studios': {
    folder: 'fondom studios',
    logo: {
      file: '481055272_1094824789325369_8044044176004448459_n.jpg',
      width: 1080, height: 1080, fit: 'cover',
    },
    cover: { file: '487079829_1116945063780008_8803776592268596105_n.jpg', fit: 'contain' },
  },

  'concept-care-solutions': {
    folder: 'concept care solutions',
    logo: { file: 'CCS-LOGO.webp', width: 775, height: 332 },
    cover: { file: '1-qw0zt1q58a2r700xnw6x5xwxvljdkzfs9ct9gx371g.png', position: 'center 35%' },
    gallery: [
      {
        file: 'sire-pics2-qtpnu2v52mja4obkxgfjycb6b8d5zje2l9ps3pmdnk.png',
        alt: 'A Concept Care Solutions carer with a client at home',
      },
    ],
  },

  'urologie-neuwied': {
    folder: 'urologie neuwied',
    logo: { file: 'hxuo25nlturvjlhrfl89.webp', width: 2771, height: 720 },
    cover: { file: 'header_fomuki_walters_001.jpg', position: '60% center' },
    gallery: [
      { file: 've_neuwied_18-70579f8e.jpg', alt: 'The practice team at Urologie Neuwied' },
      { file: 'fb7a98f7-720f-4775-84b6-e85b4d84874c_large.jpg', alt: 'The reception desk at Urologie Neuwied' },
      { file: 'header_leistungen_01.jpg', alt: 'Instruments being loaded into a steriliser' },
    ],
  },

  'arcpoint-labs': {
    folder: 'ARCpoint Labs',
    logo: { file: 'images.jpg', width: 200, height: 200, fit: 'cover' },
    cover: { file: 'images (1).jpg', position: 'center 40%' },
    gallery: [
      { file: 'owner-danise.jpg', alt: 'A ribbon cutting outside an ARCpoint Labs location' },
      { file: 'Screenshot 2026-10-17 121812.png', alt: 'The DNA and fingerprinting room at ARCpoint Labs' },
    ],
  },

  'any-lab-test-now-lynchburg': {
    folder: 'AnyLab Test Now',
    cover: { file: '488641915_1121056210033906_7430975478940290834_n.jpg', fit: 'contain' },
    gallery: [
      {
        file: '825292428_1579156467557209_507638673815447255_n.jpg',
        alt: 'Any Lab Test Now poster: Peace of mind matters', fit: 'contain',
      },
      {
        file: '845506964_1597214745751381_1526721068901558002_n.jpg',
        alt: 'Any Lab Test Now poster: Don’t guess. Test', fit: 'contain',
      },
      {
        file: '828873065_1585371750269014_3811088969326113542_n.jpg',
        alt: 'Any Lab Test Now poster: Confidence looks like proactive care', fit: 'contain',
      },
    ],
  },

  'vitalis-fish-breeding-centre': {
    folder: 'Vitalis Fish Production',
    cover: { file: 'WhatsApp Image 2026-07-24 at 23.30.17.jpeg', fit: 'contain' },
  },

  'magic-gate-enterprise': {
    folder: 'Magic Gate Enterprise',
    /* Derived: the supplied 472745700_….jpg with its white margin trimmed, because the
       wordmark filled a fifth of that square and was illegible at plate size. */
    logo: { file: 'magic-gate-logo-trimmed.png', width: 987, height: 209 },
    cover: { file: '482358240_1141882114302716_3982167144148150397_n.jpg', position: 'center 45%' },
    gallery: [
      { file: '201638770_2737057149918191_2233295573836178197_n.jpg', alt: 'A leather corner sofa at Magic Gate Enterprise' },
      { file: '204262950_2737057343251505_464863994751595417_n.jpg', alt: 'A three-piece sofa set at Magic Gate Enterprise' },
    ],
  },
}
