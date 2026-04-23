/**
 * PHASE 2A — Step 8
 * Transform pages category articles
 * Output: src/data/pages/[alias].json
 */

const fs      = require('fs');
const path    = require('path');
const { cleanHtml } = require('./lib/cleanHtml');

const RAW    = path.resolve(__dirname, '../../migration/content/articles-raw.json');
const OUTDIR = path.resolve(__dirname, '../../src/data/pages');

fs.mkdirSync(OUTDIR, { recursive: true });

function normalizeDate(dateStr) {
  if (!dateStr || dateStr === '0000-00-00 00:00:00') return null;
  return new Date(dateStr).toISOString();
}

const articles = JSON.parse(fs.readFileSync(RAW, 'utf8'));
const pages    = articles.filter(a => a.category_path === 'pages');

const results = [];

pages.forEach(a => {
  const rawBody = (a.introtext || '') + (a.fulltext || '');
  const { html: body, youtubeIds } = cleanHtml(rawBody);

  if (!body.trim()) console.warn(`  [WARN] Empty body: ${a.alias}`);

  const out = {
    id:              a.alias,
    type:            'StaticPage',
    title:           a.title.trim(),
    slug:            a.alias,
    section:         'pages',
    publishedAt:     normalizeDate(a.publish_up),
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

  results.push({ alias: a.alias, title: a.title, bodyLen: body.length });
});

console.log(`✓ ${results.length} pages written to src/data/pages/`);
results.forEach(r => {
  const warn = r.bodyLen === 0 ? ' ⚠ EMPTY BODY' : '';
  console.log(`  ${r.alias} (${r.bodyLen} chars)${warn}`);
});
