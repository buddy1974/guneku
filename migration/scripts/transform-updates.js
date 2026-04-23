/**
 * PHASE 2A — Step 7
 * Transform blog/updates articles
 * Output: src/data/updates/[alias].json
 */

const fs      = require('fs');
const path    = require('path');
const { cleanHtml } = require('./lib/cleanHtml');

const RAW    = path.resolve(__dirname, '../../migration/content/articles-raw.json');
const OUTDIR = path.resolve(__dirname, '../../src/data/updates');

fs.mkdirSync(OUTDIR, { recursive: true });

function stripAllHtml(html) {
  return (html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildExcerpt(introtext, maxLen = 200) {
  const plain = stripAllHtml(introtext);
  if (plain.length <= maxLen) return plain;
  const cut = plain.lastIndexOf(' ', maxLen);
  return plain.slice(0, cut > 0 ? cut : maxLen) + '…';
}

function normalizeDate(dateStr) {
  if (!dateStr || dateStr === '0000-00-00 00:00:00') return null;
  return new Date(dateStr).toISOString();
}

const articles = JSON.parse(fs.readFileSync(RAW, 'utf8'));
const updates  = articles.filter(a => a.category_path === 'blog');

const results = [];

updates.forEach(a => {
  const rawBody = (a.introtext || '') + (a.fulltext || '');
  const { html: body, youtubeIds } = cleanHtml(rawBody);

  if (!body.trim()) console.warn(`  [WARN] Empty body: ${a.alias}`);

  const out = {
    id:            a.alias,
    type:          'Update',
    joomlaId:      a.id,
    title:         a.title.trim(),
    slug:          a.alias,
    publishedAt:   normalizeDate(a.publish_up),
    excerpt:       buildExcerpt(a.introtext),
    body:          body,
    featuredImage: null,
    images:        [],
    youtubeEmbeds: youtubeIds,
  };

  fs.writeFileSync(
    path.join(OUTDIR, `${a.alias}.json`),
    JSON.stringify(out, null, 2),
    'utf8'
  );

  results.push({
    alias: a.alias,
    title: a.title,
    publishedAt: out.publishedAt,
    youtubeCount: youtubeIds.length,
    bodyLen: body.length,
  });
});

console.log(`✓ ${results.length} updates written to src/data/updates/`);
results.forEach(r => {
  const yt  = r.youtubeCount ? ` [${r.youtubeCount} youtube]` : '';
  const warn = r.bodyLen === 0 ? ' ⚠ EMPTY' : '';
  const date = r.publishedAt ? r.publishedAt.slice(0, 10) : 'no-date';
  console.log(`  ${date} | ${r.alias}${yt}${warn}`);
});
