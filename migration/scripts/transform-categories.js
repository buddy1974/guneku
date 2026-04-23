/**
 * PHASE 2A — Step 1
 * Transform: migration/content/categories-raw.json
 * Output:    src/data/categories.json
 */

const fs   = require('fs');
const path = require('path');

const RAW  = path.resolve(__dirname, '../../migration/content/categories-raw.json');
const OUT  = path.resolve(__dirname, '../../src/data/categories.json');

// Strip all HTML tags and collapse whitespace
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Map Joomla category path → local src/data folder name
const PATH_TO_SECTION = {
  'about-guneku': 'about',
  'blog':         'updates',
  'coronation':   'palace',
  'pages':        'pages',
  'uncategorised':'pages',
};

const raw = JSON.parse(fs.readFileSync(RAW, 'utf8'));

const categories = raw.map(cat => ({
  id:          cat.id,
  title:       cat.title.trim(),
  slug:        cat.alias,
  path:        cat.path,
  section:     PATH_TO_SECTION[cat.path] || cat.path,
  parentId:    cat.parent_id,
  level:       cat.level,
  description: stripHtml(cat.description),
}));

fs.writeFileSync(OUT, JSON.stringify(categories, null, 2), 'utf8');

console.log(`✓ categories.json written — ${categories.length} categories`);
categories.forEach(c =>
  console.log(`  [${c.id}] ${c.title} → section: ${c.section}`)
);
