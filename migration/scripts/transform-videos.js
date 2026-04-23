/**
 * PHASE 2A — Step 5
 * Transform: migration/content/gallery/video-gallery-raw.json
 * Output:    src/data/gallery/videos.json
 *
 * Extracts YouTube IDs and builds clean video data.
 */

const fs   = require('fs');
const path = require('path');

const RAW     = path.resolve(__dirname, '../../migration/content/gallery/video-gallery-raw.json');
const OUT_DIR = path.resolve(__dirname, '../../src/data/gallery');
const LOG_DIR = path.resolve(__dirname, '../../migration/logs');

fs.mkdirSync(OUT_DIR, { recursive: true });

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract YouTube video ID from any YouTube URL format:
 *   https://youtu.be/ID
 *   https://www.youtube.com/watch?v=ID
 *   https://www.youtube.com/@channel  → null (channel, not video)
 */
function extractYoutubeId(url) {
  if (!url) return null;
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  const longMatch  = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (longMatch)  return longMatch[1];
  return null;
}

/**
 * Detect if a URL is a YouTube channel rather than a specific video.
 */
function isYoutubeChannel(url) {
  if (!url) return false;
  return url.includes('youtube.com/@') || url.includes('youtube.com/channel/') || url.includes('youtube.com/c/');
}

const raw = JSON.parse(fs.readFileSync(RAW, 'utf8'));

const videos = raw.map(v => {
  const youtubeId   = extractYoutubeId(v.youtube);
  const isChannel   = isYoutubeChannel(v.youtube);
  const description = stripHtml(v.description);

  return {
    id:          v.id,
    title:       v.title.trim(),
    slug:        v.slug,
    description: description,
    type:        v.type,
    youtubeUrl:  v.youtube || null,
    youtubeId:   youtubeId,
    isChannel:   isChannel,
    // Standard YouTube embed and thumbnail URLs
    embedUrl:    youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : null,
    thumbnailUrl: v.thumb
      ? v.thumb
      : youtubeId
        ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
        : null,
    ordering:    v.ordering,
  };
});

const output = {
  channelUrl: videos.find(v => v.isChannel)?.youtubeUrl || null,
  videos:     videos.filter(v => !v.isChannel),
  channels:   videos.filter(v => v.isChannel),
};

fs.writeFileSync(
  path.join(OUT_DIR, 'videos.json'),
  JSON.stringify(output, null, 2),
  'utf8'
);

const logLines = [
  'VIDEOS TRANSFORM LOG',
  `Date: ${new Date().toISOString()}`,
  `Total raw records: ${raw.length}`,
  `Videos (specific): ${output.videos.length}`,
  `Channels:          ${output.channels.length}`,
  '',
  'Records:',
  ...videos.map(v =>
    `  [${v.id}] ${v.title} | youtubeId: ${v.youtubeId || 'N/A (channel)'} | isChannel: ${v.isChannel}`
  ),
];
fs.writeFileSync(
  path.join(LOG_DIR, 'transform-videos.log'),
  logLines.join('\n') + '\n',
  'utf8'
);

console.log(`✓ videos.json written`);
console.log(`  Channel records: ${output.channels.length}`);
console.log(`  Video records:   ${output.videos.length}`);
output.channels.forEach(c => console.log(`  [channel] ${c.title} → ${c.youtubeUrl}`));
output.videos.forEach(v   => console.log(`  [video]   ${v.title} → youtubeId: ${v.youtubeId}`));
