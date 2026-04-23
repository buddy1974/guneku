/**
 * PHASE 2A — Step 3
 * Transform: migration/content/articles-raw.json
 * Output:
 *   src/data/articles-index.json          (all articles, metadata only)
 *   src/data/about/{alias}.json           (9 articles)
 *   src/data/updates/{alias}.json         (15 articles)
 *   src/data/palace/{alias}.json          (2 articles)
 *   src/data/pages/{alias}.json           (5 + 6 uncategorised articles)
 */

const fs   = require('fs');
const path = require('path');

const RAW     = path.resolve(__dirname, '../../migration/content/articles-raw.json');
const SRC     = path.resolve(__dirname, '../../src/data');
const LOG_DIR = path.resolve(__dirname, '../../migration/logs');

// Category path → section folder
const SECTION_MAP = {
  'about-guneku': 'about',
  'blog':         'updates',
  'coronation':   'palace',
  'pages':        'pages',
  'uncategorised':'pages',
};

function safeJson(str) {
  try { return JSON.parse(str); } catch { return {}; }
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function buildExcerpt(introtext, maxLen = 200) {
  const plain = stripHtml(introtext);
  if (plain.length <= maxLen) return plain;
  return plain.slice(0, plain.lastIndexOf(' ', maxLen)) + '…';
}

function normalizeDate(dateStr) {
  if (!dateStr || dateStr === '0000-00-00 00:00:00') return null;
  return new Date(dateStr).toISOString();
}

const raw = JSON.parse(fs.readFileSync(RAW, 'utf8'));

const index = [];
const countBySection = {};

raw.forEach(article => {
  const section = SECTION_MAP[article.category_path] || 'pages';
  const images  = safeJson(article.images);
  const attribs = safeJson(article.attribs);

  // Full article object (written per-file)
  const full = {
    id:            article.id,
    title:         article.title.trim(),
    slug:          article.alias,
    section:       section,
    categoryPath:  article.category_path,
    categoryTitle: article.category_title,
    publishedAt:   normalizeDate(article.publish_up),
    modifiedAt:    normalizeDate(article.modified),
    metaDescription: (article.metadesc || '').trim(),
    excerpt:       buildExcerpt(article.introtext),
    introHtml:     (article.introtext || '').trim(),
    bodyHtml:      (article.fulltext  || '').trim(),
    images: {
      intro:     images.image_intro     || null,
      introAlt:  images.image_intro_alt || null,
      fulltext:  images.image_fulltext  || null,
      fulltextAlt: images.image_fulltext_alt || null,
    },
    showTitle:    attribs.show_title !== '0',
    readingTime:  Math.max(1, Math.ceil(
      stripHtml((article.introtext || '') + (article.fulltext || '')).split(/\s+/).length / 200
    )),
  };

  // Index entry (no HTML body)
  index.push({
    id:            full.id,
    title:         full.title,
    slug:          full.slug,
    section:       full.section,
    categoryPath:  full.categoryPath,
    categoryTitle: full.categoryTitle,
    publishedAt:   full.publishedAt,
    modifiedAt:    full.modifiedAt,
    metaDescription: full.metaDescription,
    excerpt:       full.excerpt,
    heroImage:     full.images.intro || full.images.fulltext || null,
    readingTime:   full.readingTime,
  });

  // Write individual file
  const dir = path.join(SRC, section);
  fs.mkdirSync(dir, { recursive: true });
  const outPath = path.join(dir, `${article.alias}.json`);
  fs.writeFileSync(outPath, JSON.stringify(full, null, 2), 'utf8');

  countBySection[section] = (countBySection[section] || 0) + 1;
});

// Write index
const indexPath = path.join(SRC, 'articles-index.json');
fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');

// Write log
const logLines = [
  'ARTICLES TRANSFORM LOG',
  `Date: ${new Date().toISOString()}`,
  `Total articles: ${index.length}`,
  '',
  'By section:',
  ...Object.entries(countBySection).map(([s, n]) => `  ${s}: ${n}`),
  '',
  'Files written:',
  ...index.map(a => `  src/data/${a.section}/${a.slug}.json`),
];
fs.writeFileSync(
  path.join(LOG_DIR, 'transform-articles.log'),
  logLines.join('\n') + '\n',
  'utf8'
);

console.log(`✓ articles-index.json written — ${index.length} entries`);
console.log('✓ Per-article files written:');
Object.entries(countBySection).forEach(([s, n]) =>
  console.log(`  src/data/${s}/  → ${n} files`)
);
