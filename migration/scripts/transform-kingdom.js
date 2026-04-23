/**
 * PHASE 2A — Step 5
 * Transform kingdom (about-guneku) articles
 * Output: src/data/kingdom/[alias].json
 */

const fs      = require('fs');
const path    = require('path');
const { cleanHtml } = require('./lib/cleanHtml');

const RAW    = path.resolve(__dirname, '../../migration/content/articles-raw.json');
const OUTDIR = path.resolve(__dirname, '../../src/data/kingdom');

fs.mkdirSync(OUTDIR, { recursive: true });

const KINGDOM_ALIASES = [
  'history',
  'religion',
  'the-guneku-cultural-heritage',
  'touristic-sites',
  'map-of-guneku',
  'gudeca-construction',
  'about-guneku',             // may not exist — skip if absent
];

// All about-guneku articles (not palace ones) go to kingdom
// Palace aliases are handled in transform-palace.js
const PALACE_ALIASES = new Set([
  'activities-building-up-to-the-coronation-ceremony',
  'the-legacy-of-hrh-chief-fomuki-p-n',
  'biography-of-hrh-fomuki-patrick-njie',
]);

const articles = JSON.parse(fs.readFileSync(RAW, 'utf8'));

const kingdom = articles.filter(a =>
  a.category_path === 'about-guneku' && !PALACE_ALIASES.has(a.alias)
);

const results = [];

kingdom.forEach((a, idx) => {
  const rawBody = (a.introtext || '') + (a.fulltext || '');
  const { html: body, youtubeIds } = cleanHtml(rawBody);

  if (!body.trim()) {
    console.warn(`  [WARN] Empty body: ${a.alias}`);
  }

  const out = {
    id:              a.alias,
    type:            'KingdomArticle',
    title:           a.title.trim(),
    slug:            a.alias,
    section:         'kingdom',
    order:           idx + 1,
    publishedAt:     a.publish_up && a.publish_up !== '0000-00-00 00:00:00'
                       ? new Date(a.publish_up).toISOString()
                       : null,
    metaDescription: (a.metadesc || '').trim() || null,
    body:            body,
    youtubeEmbeds:   youtubeIds,
    images:          [],
    featuredImage:   null,
  };

  fs.writeFileSync(
    path.join(OUTDIR, `${a.alias}.json`),
    JSON.stringify(out, null, 2),
    'utf8'
  );

  results.push({ alias: a.alias, title: a.title, bodyLen: body.length, youtubeIds });
});

console.log(`✓ ${results.length} kingdom articles written to src/data/kingdom/`);
results.forEach(r => {
  const warn = r.bodyLen === 0 ? ' ⚠ EMPTY BODY' : '';
  console.log(`  ${r.alias} (${r.bodyLen} chars)${warn}`);
});
