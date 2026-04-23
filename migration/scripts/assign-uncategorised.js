/**
 * PHASE 2C — Step 0
 * Handle uncategorised articles per architect assignments.
 */

const fs   = require('fs');
const path = require('path');
const { cleanHtml } = require('./lib/cleanHtml');

const RAW      = path.resolve(__dirname, '../../migration/content/articles-raw.json');
const DATA     = path.resolve(__dirname, '../../src/data');
const LOG_DIR  = path.resolve(__dirname, '../../migration/logs');
const DUP_LOG  = path.join(LOG_DIR, 'duplicates.txt');

const articles = JSON.parse(fs.readFileSync(RAW, 'utf8'));
const uncat    = articles.filter(a => a.category_path === 'uncategorised');

const dupLines = fs.existsSync(DUP_LOG)
  ? fs.readFileSync(DUP_LOG, 'utf8').split('\n').filter(Boolean)
  : [`DUPLICATES LOG — ${new Date().toISOString()}`];

function normalizeDate(d) {
  if (!d || d === '0000-00-00 00:00:00') return null;
  return new Date(d).toISOString();
}

function byId(id) {
  return uncat.find(a => a.id === id);
}

const log = [];

// ─── ID 2: home-page → src/data/home/home-page.json ──────────────────────
const homePage = byId(2);
if (homePage) {
  const { html: body } = cleanHtml((homePage.introtext || '') + (homePage.fulltext || ''));
  const out = {
    id:    'home-page',
    type:  'HomeContent',
    title: homePage.title.trim(),
    slug:  homePage.alias,
    body:  body,
  };
  const outPath = path.join(DATA, 'home', 'home-page.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
  log.push(`✓ home-page.json → src/data/home/ (${body.length} chars)`);
}

// ─── ID 3: about-template → DUPLICATE, log only ──────────────────────────
const aboutTemplate = byId(3);
if (aboutTemplate) {
  dupLines.push(`ID 3 about-template ("${aboutTemplate.title}") is duplicate of about-guneku — skipped`);
  log.push(`  SKIPPED ID 3 (about-template) — logged as duplicate`);
}

// ─── ID 9: exhibitions → src/data/kingdom/exhibitions.json ───────────────
const exhibitions = byId(9);
if (exhibitions) {
  const { html: body } = cleanHtml((exhibitions.introtext || '') + (exhibitions.fulltext || ''));
  const out = {
    id:              'exhibitions',
    type:            'KingdomArticle',
    title:           exhibitions.title.trim(),
    slug:            exhibitions.alias,
    section:         'kingdom',
    order:           99,
    publishedAt:     normalizeDate(exhibitions.publish_up),
    metaDescription: (exhibitions.metadesc || '').trim() || null,
    body:            body,
    youtubeEmbeds:   [],
    images:          [],
    featuredImage:   null,
  };
  const outPath = path.join(DATA, 'kingdom', 'exhibitions.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
  log.push(`✓ exhibitions.json → src/data/kingdom/ (${body.length} chars)`);
}

// ─── ID 25: video → src/data/gallery/video-intro.json ────────────────────
const videoIntro = byId(25);
if (videoIntro) {
  const { html: body } = cleanHtml((videoIntro.introtext || '') + (videoIntro.fulltext || ''));
  const out = {
    id:    'video-intro',
    type:  'GalleryIntro',
    title: videoIntro.title.trim(),
    slug:  videoIntro.alias,
    body:  body,
  };
  const outPath = path.join(DATA, 'gallery', 'video-intro.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
  log.push(`✓ video-intro.json → src/data/gallery/ (${body.length} chars)`);
}

// ─── ID 33: privacy-policy — compare with existing ───────────────────────
const privacyRaw = byId(33);
if (privacyRaw) {
  const rawBody  = (privacyRaw.introtext || '') + (privacyRaw.fulltext || '');
  const { html: body } = cleanHtml(rawBody);
  const existingPath = path.join(DATA, 'pages', 'privacy-policy.json');
  let decision = 'created';

  if (fs.existsSync(existingPath)) {
    const existing = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
    const existLen = (existing.body || '').length;
    if (body.length > existLen) {
      const out = { ...existing, body, type: 'StaticPage' };
      fs.writeFileSync(existingPath, JSON.stringify(out, null, 2), 'utf8');
      decision = `overwritten (new: ${body.length} > old: ${existLen})`;
    } else {
      decision = `kept existing (existing: ${existLen} >= new: ${body.length})`;
    }
  } else {
    const out = {
      id: 'privacy-policy', type: 'StaticPage', title: privacyRaw.title,
      slug: 'privacy-policy', section: 'pages',
      publishedAt: normalizeDate(privacyRaw.publish_up),
      metaDescription: null, body, youtubeEmbeds: [], images: [], featuredImage: null,
    };
    fs.writeFileSync(existingPath, JSON.stringify(out, null, 2), 'utf8');
  }
  log.push(`✓ privacy-policy → ${decision}`);
}

// ─── ID 43: terms — compare with existing ────────────────────────────────
const termsRaw = byId(43);
if (termsRaw) {
  const rawBody  = (termsRaw.introtext || '') + (termsRaw.fulltext || '');
  const { html: body } = cleanHtml(rawBody);
  const existingPath = path.join(DATA, 'pages', 'terms.json');
  let decision = 'created';

  if (fs.existsSync(existingPath)) {
    const existing = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
    const existLen = (existing.body || '').length;
    if (body.length > existLen) {
      const out = { ...existing, body, type: 'StaticPage' };
      fs.writeFileSync(existingPath, JSON.stringify(out, null, 2), 'utf8');
      decision = `overwritten (new: ${body.length} > old: ${existLen})`;
    } else {
      decision = `kept existing (existing: ${existLen} >= new: ${body.length})`;
    }
  } else {
    const out = {
      id: 'terms', type: 'StaticPage', title: termsRaw.title,
      slug: 'terms', section: 'pages',
      publishedAt: normalizeDate(termsRaw.publish_up),
      metaDescription: null, body, youtubeEmbeds: [], images: [], featuredImage: null,
    };
    fs.writeFileSync(existingPath, JSON.stringify(out, null, 2), 'utf8');
  }
  log.push(`✓ terms → ${decision}`);
}

// ─── Write duplicate log ──────────────────────────────────────────────────
fs.writeFileSync(DUP_LOG, dupLines.join('\n') + '\n', 'utf8');

log.forEach(l => console.log(l));
console.log(`\nDuplicates log: migration/logs/duplicates.txt`);
