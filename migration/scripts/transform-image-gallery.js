/**
 * PHASE 2A — Step 13
 * Build image-gallery.json from albums + files
 * Output: src/data/gallery/image-gallery.json
 */

const fs   = require('fs');
const path = require('path');

const RAW_ALBUMS = path.resolve(__dirname, '../../migration/content/gallery/image-albums-raw.json');
const RAW_FILES  = path.resolve(__dirname, '../../migration/content/gallery/image-files-raw.json');
const OUTDIR     = path.resolve(__dirname, '../../src/data/gallery');
fs.mkdirSync(OUTDIR, { recursive: true });

/**
 * Convert any folder name to kebab-case.
 * Handles: CamelCase, ALL_CAPS, spaces, commas, numbers run-on.
 */
function toKebab(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')        // camelCase → camel-Case
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')  // acronym before word: HRHFon → HRH-Fon
    .replace(/[_\s,./\\]+/g, '-')                // whitespace/symbols → hyphen
    .replace(/-+/g, '-')                          // collapse multiple hyphens
    .replace(/^-+|-+$/g, '')                     // trim
    .toLowerCase();
}

function parseDescription(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed['en-GB'] || parsed[Object.keys(parsed)[0]] || null;
  } catch {
    return raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || null;
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
  filesByFolder[f.folder].push(f);
});
Object.values(filesByFolder).forEach(arr =>
  arr.sort((a, b) => (a.ordering ?? 999) - (b.ordering ?? 999))
);

const albums = rawAlbums.map(album => {
  const albumId = toKebab(album.folder);
  const files   = filesByFolder[album.folder] || [];
  const cover   = files.find(f => f.ismainimage === 1) || files[0] || null;
  const title   = parseDescription(album.description) || album.folder;

  const images = files.map((f, idx) => ({
    id:             `${albumId}-${String(idx + 1).padStart(3, '0')}`,
    filename:       f.file,
    caption:        f.caption || null,
    title:          f.title   || null,
    ftpPath:        `/images/${album.folder}/${f.file}`,
    publicPath:     `/images/gallery/${albumId}/${f.file}`,
    width:          f.width  || null,
    height:         f.height || null,
    isMainImage:    f.ismainimage === 1,
    downloadStatus: 'pending',
  }));

  return {
    id:          albumId,
    joomlaFolder: album.folder,
    title:       title,
    date:        normalizeDate(album.date),
    description: title,
    coverImage:  cover ? cover.file : null,
    imageCount:  images.length,
    images:      images,
  };
});

const output = {
  id:    'image-gallery',
  type:  'ImageGallery',
  albums: albums,
};

fs.writeFileSync(
  path.join(OUTDIR, 'image-gallery.json'),
  JSON.stringify(output, null, 2),
  'utf8'
);

const totalImages = albums.reduce((sum, a) => sum + a.imageCount, 0);
console.log(`✓ image-gallery.json written`);
console.log(`  Albums: ${albums.length}`);
console.log(`  Total images: ${totalImages}`);
albums.forEach(a => {
  const warn = a.imageCount === 0 ? ' ⚠ NO IMAGES' : '';
  console.log(`  [${a.id}] "${a.title}" — ${a.imageCount} images${warn}`);
});
