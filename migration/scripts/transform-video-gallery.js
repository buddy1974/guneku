const fs   = require('fs');
const path = require('path');

const RAW    = path.resolve(__dirname, '../../migration/content/gallery/video-gallery-raw.json');
const OUTDIR = path.resolve(__dirname, '../../src/data/gallery');
fs.mkdirSync(OUTDIR, { recursive: true });

const raw = JSON.parse(fs.readFileSync(RAW, 'utf8'));

function extractYoutubeId(url) {
  if (!url) return null;
  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (short) return short[1];
  const long  = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (long)  return long[1];
  return null;
}

const dbVideos = raw.map(v => ({
  id:          v.id,
  title:       v.title.trim(),
  slug:        v.slug,
  youtubeUrl:  v.youtube,
  youtubeId:   extractYoutubeId(v.youtube),
  type:        v.type,
  thumb:       v.thumb || null,
  ordering:    v.ordering,
  state:       v.state,
}));

const output = {
  id:               'video-gallery',
  type:             'VideoGallery',
  youtubeChannelId: 'UCEmIEHRMg3UTzb1wpxLZOAw',
  featuredVideoId:  '11pAXbEfPgc',
  dbVideos:         dbVideos,
  youtubeApiStatus: 'pending',
  allVideos:        [],
};

fs.writeFileSync(
  path.join(OUTDIR, 'video-gallery.json'),
  JSON.stringify(output, null, 2),
  'utf8'
);
console.log(`✓ video-gallery.json written — ${dbVideos.length} DB records`);
dbVideos.forEach(v => console.log(`  [${v.id}] ${v.title} → ${v.youtubeId || v.youtubeUrl}`));
