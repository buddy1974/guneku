const fs   = require('fs');
const path = require('path');

const RAW = path.resolve(__dirname, '../../migration/content/articles-raw.json');
const LOG = path.resolve(__dirname, '../../migration/logs/articles-inspection.txt');

const articles = JSON.parse(fs.readFileSync(RAW, 'utf8'));

const lines = [
  `ARTICLES INSPECTION — ${new Date().toISOString()}`,
  `Total: ${articles.length}`,
  '',
  `${'ID'.padEnd(5)} | ${'CATEGORY_PATH'.padEnd(16)} | ${'ALIAS'.padEnd(70)} | ${'INTRO'.padEnd(7)} | FULL`,
  '-'.repeat(120),
];

articles.forEach(a => {
  const row = [
    String(a.id).padEnd(5),
    (a.category_path || '').padEnd(16),
    (a.alias || '').padEnd(70),
    String((a.introtext || '').length).padEnd(7),
    String((a.fulltext  || '').length),
  ].join(' | ');
  lines.push(row);
});

const output = lines.join('\n') + '\n';
fs.writeFileSync(LOG, output, 'utf8');
process.stdout.write(output);
