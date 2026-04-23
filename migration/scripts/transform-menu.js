/**
 * PHASE 2A — Step 2
 * Transform: migration/content/menu-raw.json
 * Output:    src/data/navigation.json
 *
 * Builds a hierarchical nav tree.
 * Parses Joomla component links into clean hrefs.
 */

const fs   = require('fs');
const path = require('path');

const RAW = path.resolve(__dirname, '../../migration/content/menu-raw.json');
const OUT = path.resolve(__dirname, '../../src/data/navigation.json');

/**
 * Convert a Joomla menu link + alias path into a clean href.
 * e.g. "index.php?option=com_content&view=article&id=2" → "/homepage"
 * We use the alias path as the canonical href since it reflects the URL.
 */
function resolveHref(item) {
  if (!item.path || item.level === 0) return '/';
  if (item.type === 'url') {
    // External or custom URL — parse from link field
    const match = item.link.match(/url=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : item.link;
  }
  if (item.type === 'separator') return null;
  // Component links: use the alias path
  return '/' + item.path;
}

/**
 * Parse article ID from Joomla link string.
 */
function parseArticleId(link) {
  const match = (link || '').match(/[&?]id=(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Parse category ID from Joomla link string.
 */
function parseCategoryId(link) {
  const match = (link || '').match(/[&?]id=(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

const raw = JSON.parse(fs.readFileSync(RAW, 'utf8'));

// Flatten into a map for tree building
const itemMap = {};
raw.forEach(item => {
  const view = (item.link || '').match(/view=(\w+)/)?.[1] || null;
  itemMap[item.id] = {
    id:         item.id,
    menutype:   item.menutype || null,
    title:      item.title.trim(),
    slug:       item.alias,
    href:       resolveHref(item),
    type:       item.type,
    link:       item.link,
    view:       view,
    articleId:  view === 'article'  ? parseArticleId(item.link)  : null,
    categoryId: view === 'category' ? parseCategoryId(item.link) : null,
    parentId:   item.parent_id,
    level:      item.level,
    children:   [],
  };
});

// Build tree — attach children to parents
const roots = [];
Object.values(itemMap).forEach(item => {
  if (item.level === 0) {
    roots.push(item);
  } else {
    const parent = itemMap[item.parentId];
    if (parent) {
      parent.children.push(item);
    } else {
      roots.push(item);
    }
  }
});

// Group by menutype for the output
const byMenutype = {};
Object.values(itemMap).forEach(item => {
  if (item.level !== 1) return; // top-level items only in this grouping
  const mt = item.menutype || 'root';
  if (!byMenutype[mt]) byMenutype[mt] = [];
  byMenutype[mt].push(item);
});

const output = {
  menutypes: [...new Set(raw.map(i => i.menutype).filter(Boolean))],
  tree:      roots,
  flat:      Object.values(itemMap).filter(i => i.level > 0),
};

fs.writeFileSync(OUT, JSON.stringify(output, null, 2), 'utf8');

// Report
const flat = output.flat;
console.log(`✓ navigation.json written — ${flat.length} items`);
const menutypes = [...new Set(flat.map(i => i.menutype))];
menutypes.forEach(mt => {
  const items = flat.filter(i => i.menutype === mt && i.level === 1);
  console.log(`  [${mt}] ${items.length} top-level items:`);
  items.forEach(i => console.log(`    • ${i.title} → ${i.href}`));
});
