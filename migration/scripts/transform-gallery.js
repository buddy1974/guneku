/**
 * PHASE 2A — Step 4
 * Transform: migration/content/gallery/image-albums-raw.json
 *            migration/content/gallery/image-files-raw.json
 * Output:
 *   src/data/gallery/albums.json              (all albums, enriched)
 *   src/data/gallery/files-by-album.json      (files grouped by folder key)
 *   src/data/gallery/{folder-slug}.json       (per-album file with images)
 */

const fs   = require('fs');
const path = require('path');

const RAW_ALBUMS = path.resolve(__dirname, '../../migration/content/gallery/image-albums-raw.json');
const RAW_FILES  = path.resolve(__dirname, '../../migration/content/gallery/image-files-raw.json');
const OUT_DIR    = path.resolve(__dirname, '../../src/data/gallery');
const LOG_DIR    = path.resolve(__dirname, '../../migration/logs');

fs.mkdirSync(OUT_DIR, { recursive: true });

// Joomla stores event gallery images under /images/eventgallery/{folder}/
const IMAGE_BASE_PATH = '/images/eventgallery';

function toSlug(str) {
  return str
    // Insert hyphen only between a lowercase letter and an uppercase letter (camelCase boundary)
    // Do NOT split consecutive uppercase letters (acronyms like GUDECA, USA, HRH)
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseDescription(raw) {
  if (!raw) return '';
  // Descriptions are stored as JSON localization strings: {"en-GB":"text"}
  try {
    const parsed = JSON.parse(raw);
    return parsed['en-GB'] || parsed[Object.keys(parsed)[0]] || '';
  } catch {
    // Plain string
    return raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}

function normalizeDate(dateStr) {
  if (!dateStr || dateStr === '0000-00-00 00:00:00') return null;
  return new Date(dateStr).toISOString();
}

const rawAlbums = JSON.parse(fs.readFileSync(RAW_ALBUMS, 'utf8'));
const rawFiles  = JSON.parse(fs.readFileSync(RAW_FILES,  'utf8'));

// Group files by folder
const filesByFolder = {};
rawFiles.forEach(f => {
  if (!filesByFolder[f.folder]) filesByFolder[f.folder] = [];
  filesByFolder[f.folder].push({
    id:          f.id,
    filename:    f.file,
    src:         `${IMAGE_BASE_PATH}/${f.folder}/${f.file}`,
    title:       f.title   || null,
    caption:     f.caption || null,
    width:       f.width   || null,
    height:      f.height  || null,
    aspectRatio: (f.width && f.height)
      ? parseFloat((f.width / f.height).toFixed(4))
      : null,
    isMainImage: f.ismainimage === 1,
    ordering:    f.ordering,
  });
});

// Sort files within each folder by ordering
Object.keys(filesByFolder).forEach(folder => {
  filesByFolder[folder].sort((a, b) => a.ordering - b.ordering);
});

// Build enriched album list
const albums = rawAlbums.map(album => {
  const files       = filesByFolder[album.folder] || [];
  const coverImage  = files.find(f => f.isMainImage) || files[0] || null;
  const slug        = toSlug(album.folder);

  return {
    id:          album.id,
    folder:      album.folder,
    slug:        slug,
    title:       parseDescription(album.description) || album.folder,
    description: parseDescription(album.description),
    date:        normalizeDate(album.date),
    ordering:    album.ordering,
    imageCount:  files.length,
    coverImage:  coverImage ? coverImage.src : null,
    coverThumb:  coverImage ? coverImage.src : null,
  };
});

// Write albums index
fs.writeFileSync(
  path.join(OUT_DIR, 'albums.json'),
  JSON.stringify(albums, null, 2),
  'utf8'
);

// Write files-by-album lookup
fs.writeFileSync(
  path.join(OUT_DIR, 'files-by-album.json'),
  JSON.stringify(filesByFolder, null, 2),
  'utf8'
);

// Write per-album files
albums.forEach(album => {
  const files = filesByFolder[album.folder] || [];
  const albumDetail = { ...album, images: files };
  fs.writeFileSync(
    path.join(OUT_DIR, `${album.slug}.json`),
    JSON.stringify(albumDetail, null, 2),
    'utf8'
  );
});

// Write log
const logLines = [
  'GALLERY TRANSFORM LOG',
  `Date: ${new Date().toISOString()}`,
  `Total albums: ${albums.length}`,
  `Total files:  ${rawFiles.length}`,
  '',
  'Albums written:',
  ...albums.map(a => `  [${a.id}] ${a.folder} (${a.imageCount} images) → src/data/gallery/${a.slug}.json`),
];
fs.writeFileSync(
  path.join(LOG_DIR, 'transform-gallery.log'),
  logLines.join('\n') + '\n',
  'utf8'
);

console.log(`✓ albums.json written — ${albums.length} albums`);
console.log(`✓ files-by-album.json written — ${rawFiles.length} files`);
console.log(`✓ Per-album JSON files written:`);
albums.forEach(a =>
  console.log(`  src/data/gallery/${a.slug}.json  (${a.imageCount} images)`)
);
