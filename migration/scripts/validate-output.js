/**
 * PHASE 2A — Step 17
 * Validate all files in src/data/
 */

const fs   = require('fs');
const path = require('path');

const DATA_ROOT = path.resolve(__dirname, '../../src/data');
const LOG_PATH  = path.resolve(__dirname, '../../migration/logs/validation-report.txt');

// ─── Gather all JSON files ────────────────────────────────────────────────
function walk(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walk(full));
    else if (entry.name.endsWith('.json')) results.push(full);
  }
  return results;
}

const allFiles = walk(DATA_ROOT);
const lines    = [`VALIDATION REPORT — ${new Date().toISOString()}`, ''];

let passed = 0;
let failed = 0;

// Types that must have a non-empty body field
const BODY_REQUIRED_TYPES = new Set([
  'KingdomArticle','PalaceArticle','Update','StaticPage'
]);

// Count per directory
const countByDir = {};

allFiles.forEach(f => {
  const rel = path.relative(DATA_ROOT, f);
  const dir = path.dirname(rel);
  countByDir[dir] = (countByDir[dir] || 0) + 1;

  const checks = [];
  let data;

  // 1. Valid JSON
  try {
    data = JSON.parse(fs.readFileSync(f, 'utf8'));
    checks.push({ name: 'valid JSON', pass: true });
  } catch (e) {
    checks.push({ name: 'valid JSON', pass: false, detail: e.message });
    lines.push(`FAIL  ${rel}`);
    lines.push(`      ✗ invalid JSON: ${e.message}`);
    failed++;
    return;
  }

  // 2. Has id field — skip for arrays and known index/config files
  const NO_ID_FILES = new Set([
    'articles-index.json','categories.json','navigation.json',
    'site-config.json','albums.json','files-by-album.json','videos.json',
  ]);
  const skipId = Array.isArray(data) || NO_ID_FILES.has(path.basename(f));
  const hasId  = skipId || (data.id !== undefined && data.id !== null && data.id !== '');
  checks.push({ name: 'has id', pass: hasId, skip: skipId });

  // 3. Non-empty body where required
  let bodyCheck = { name: 'body field', pass: true, skip: true };
  if (data.type && BODY_REQUIRED_TYPES.has(data.type)) {
    bodyCheck = { name: 'body non-empty', pass: typeof data.body === 'string' && data.body.trim().length > 0, skip: false };
  }
  checks.push(bodyCheck);

  const allPass = checks.every(c => c.skip || c.pass);
  if (allPass) {
    passed++;
    lines.push(`OK    ${rel}`);
  } else {
    failed++;
    lines.push(`FAIL  ${rel}`);
    checks.filter(c => !c.pass && !c.skip).forEach(c => {
      lines.push(`      ✗ ${c.name}${c.detail ? ': ' + c.detail : ''}`);
    });
  }
});

// ─── Directory minimums ───────────────────────────────────────────────────
const MINIMUMS = {
  'kingdom':     3,
  'palace':      6,
  'updates':     15,
  'pages':       4,
  'gallery':     2,
  'notables':    2,
  'institutions':3,
};

const rootFiles = ['navigation.json','site-config.json','categories.json','articles-index.json'];

lines.push('');
lines.push('─── DIRECTORY COUNTS ───────────────────────────────────────');
Object.entries(countByDir).forEach(([d, n]) => {
  const min = MINIMUMS[d];
  const ok  = min ? n >= min : true;
  lines.push(`  ${ok ? 'OK' : 'LOW'}  ${d || 'root'}: ${n} files${min ? ` (min ${min})` : ''}`);
  if (!ok) failed++;
});

lines.push('');
lines.push('─── REQUIRED ROOT FILES ─────────────────────────────────────');
rootFiles.forEach(f => {
  const exists = fs.existsSync(path.join(DATA_ROOT, f));
  lines.push(`  ${exists ? 'OK' : 'MISSING'}  ${f}`);
  if (!exists) failed++;
});

lines.push('');
lines.push(`─── SUMMARY ─────────────────────────────────────────────────`);
lines.push(`Total files checked: ${allFiles.length}`);
lines.push(`PASSED: ${passed}`);
lines.push(`FAILED: ${failed}`);

const report = lines.join('\n') + '\n';
fs.writeFileSync(LOG_PATH, report, 'utf8');

// Console summary
console.log(`✓ Validation complete — ${allFiles.length} files`);
Object.entries(countByDir).forEach(([d, n]) => {
  const min = MINIMUMS[d];
  const ok  = !min || n >= min;
  console.log(`  ${ok ? '✓' : '✗'} ${d || 'root'}: ${n} files`);
});
console.log('');
console.log(`PASSED ${passed} / FAILED ${failed}`);
if (failed > 0) {
  console.log('\nFailed items:');
  lines.filter(l => l.startsWith('FAIL') || l.startsWith('  ✗') || l.includes('MISSING') || l.includes('LOW'))
    .forEach(l => console.log(l));
}
