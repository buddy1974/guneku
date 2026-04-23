/**
 * PHASE 2A — Step 6
 * Transform palace articles
 * Sources: category_path = 'about-guneku' (palace aliases) + 'coronation'
 * Output: src/data/palace/[alias].json
 */

const fs      = require('fs');
const path    = require('path');
const { cleanHtml } = require('./lib/cleanHtml');

const RAW    = path.resolve(__dirname, '../../migration/content/articles-raw.json');
const OUTDIR = path.resolve(__dirname, '../../src/data/palace');

fs.mkdirSync(OUTDIR, { recursive: true });

// These about-guneku articles belong to palace, not kingdom
const PALACE_ABOUT_ALIASES = new Set([
  'activities-building-up-to-the-coronation-ceremony',
  'the-legacy-of-hrh-chief-fomuki-p-n',
  'biography-of-hrh-fomuki-patrick-njie',
]);

// ERA assignment rules: keyword → era
function assignEra(alias) {
  const legacy = ['biography', 'legacy', 'activities', 'tributes'];
  const current = ['coronation', 'walters', 'notables', 'return', 'bavarian'];
  const a = alias.toLowerCase();
  if (legacy.some(k => a.includes(k)))  return 'legacy';
  if (current.some(k => a.includes(k))) return 'current';
  return 'legacy'; // default
}

const articles = JSON.parse(fs.readFileSync(RAW, 'utf8'));

const palace = articles.filter(a =>
  (a.category_path === 'about-guneku' && PALACE_ABOUT_ALIASES.has(a.alias)) ||
  a.category_path === 'coronation'
);

const results = [];

palace.forEach(a => {
  const rawBody = (a.introtext || '') + (a.fulltext || '');
  const { html: body, youtubeIds } = cleanHtml(rawBody);

  if (!body.trim()) console.warn(`  [WARN] Empty body: ${a.alias}`);

  const out = {
    id:              a.alias,
    type:            'PalaceArticle',
    title:           a.title.trim(),
    slug:            a.alias,
    section:         'palace',
    era:             assignEra(a.alias),
    order:           a.ordering || 0,
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

  results.push({ alias: a.alias, title: a.title, era: out.era, bodyLen: body.length });
});

console.log(`✓ ${results.length} palace articles written to src/data/palace/`);
results.forEach(r => {
  const warn = r.bodyLen === 0 ? ' ⚠ EMPTY BODY' : '';
  console.log(`  [${r.era}] ${r.alias} (${r.bodyLen} chars)${warn}`);
});
