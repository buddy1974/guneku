/**
 * cleanHtml.js
 * Cleans Joomla/Sparky HTML into production-ready HTML for Next.js.
 *
 * Returns: { html: string, youtubeIds: string[] }
 */

const cheerio = require('cheerio');
const he      = require('he');

/**
 * @param {string} rawHtml
 * @returns {{ html: string, youtubeIds: string[] }}
 */
function cleanHtml(rawHtml) {
  if (!rawHtml || !rawHtml.trim()) return { html: '', youtubeIds: [] };

  let html = rawHtml;

  // ─── 1. JOOMLA IMAGE ARTIFACT REMOVAL ────────────────────────────────────
  // /images/blog/file.jpg#joomlaImage://... → /images/blog/file.jpg
  html = html.replace(/(src="[^"#]+)#[^"]*"/g, '$1"');
  html = html.replace(/(src='[^'#]+)#[^']*'/g, "$1'");

  // ─── 4 (pre-parse). ENCODING FIX ─────────────────────────────────────────
  // Double-encoded ampersands that would survive cheerio parse
  html = html.replace(/&amp;amp;/g, '&amp;');
  // Smart quotes / zero-width spaces
  html = html.replace(/\u201C/g, '"').replace(/\u201D/g, '"');
  html = html.replace(/\u2018/g, "'").replace(/\u2019/g, "'");
  html = html.replace(/\u200B/g, '');

  // ─── Remove HTML comments ─────────────────────────────────────────────────
  html = html.replace(/<!--[\s\S]*?-->/g, '');

  // ─── Load into cheerio ───────────────────────────────────────────────────
  const $ = cheerio.load(html, { decodeEntities: false });

  // ─── 2. SPARKY LAYOUT COLLAPSE ───────────────────────────────────────────
  const sparkyContainers = [
    'div[class*="sparky_page_row"]',
    'div[class*="sparky_page_container"]',
    'div[class*="sparky_cell"]',
    'div[id^="row_"]',
  ];
  sparkyContainers.forEach(sel => {
    $(sel).each((_, el) => {
      $(el).replaceWith($(el).html() || '');
    });
  });
  $('div[class*="sparky_spacer"]').remove();

  // ─── 3. JOOMLA ARTIFACT REMOVAL ──────────────────────────────────────────
  $('div.clr, div.clearfix').remove();

  // Remove <p> tags containing only &nbsp; or whitespace
  $('p').each((_, el) => {
    const text = $(el).text().replace(/\u00a0/g, '').trim();
    if (!text && !$(el).find('img').length) {
      $(el).remove();
    }
  });

  // Unwrap font-size spans (keep inner content)
  $('span[style*="font-size"]').each((_, el) => {
    $(el).replaceWith($(el).html() || '');
  });

  // Unwrap <font> tags
  $('font').each((_, el) => {
    $(el).replaceWith($(el).html() || '');
  });

  // Remove o:p tags (Word artifacts)
  $('o\\:p').remove();

  // ─── 5. IMAGE PATH REWRITING ─────────────────────────────────────────────
  $('img').each((_, el) => {
    let src = $(el).attr('src') || '';
    src = src
      .replace(/^\/images\/blog\//,    '/images/updates/')
      .replace(/^\/images\/chieff-logo\.png$/, '/images/assets/chieff-logo.png')
      .replace(/^\/images\/cover\.jpg$/, '/images/assets/cover.jpg')
      .replace(/^\/images\/palace-front\.jpg$/, '/images/assets/palace-front.jpg');
    $(el).attr('src', src);
  });

  // ─── 6. LINK REWRITING ───────────────────────────────────────────────────
  $('a').each((_, el) => {
    let href = $(el).attr('href') || '';
    href = href
      .replace(/^https?:\/\/(?:www\.)?guneku\.org/, '')
      .replace(/^\/index\.php\//, '/');
    if (!href) href = '#';
    $(el).attr('href', href);
  });

  // ─── 8. YOUTUBE IFRAME REPLACEMENT ──────────────────────────────────────
  const youtubeIds = [];
  $('iframe').each((_, el) => {
    const src = $(el).attr('src') || '';
    const match = src.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (match) {
      const videoId = match[1];
      youtubeIds.push(videoId);
      $(el).replaceWith(
        `<div data-youtube-id="${videoId}" class="youtube-embed"></div>`
      );
    }
  });

  // ─── Extract cleaned HTML ────────────────────────────────────────────────
  let result = $('body').html() || '';

  // ─── 7. WHITESPACE NORMALISATION ─────────────────────────────────────────
  result = result
    .replace(/[ \t]+/g, ' ')                 // collapse multiple spaces/tabs
    .replace(/\n{3,}/g, '\n\n')              // max 2 consecutive newlines
    .trim();

  return { html: result, youtubeIds };
}

module.exports = { cleanHtml };
