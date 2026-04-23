const fs   = require('fs');
const path = require('path');

const RAW = path.resolve(__dirname, '../../migration/content/articles-raw.json');
const LOG = path.resolve(__dirname, '../../migration/logs/uncategorised-articles.txt');

const articles = JSON.parse(fs.readFileSync(RAW, 'utf8'));
const uncat = articles.filter(a => a.category_path === 'uncategorised');

const lines = [
  `UNCATEGORISED ARTICLES — ${new Date().toISOString()}`,
  `Count: ${uncat.length}`,
  '',
  `${'ID'.padEnd(5)} | ${'ALIAS'.padEnd(45)} | ${'INTRO'.padEnd(7)} | TITLE`,
  '-'.repeat(110),
];

uncat.forEach(a => {
  lines.push([
    String(a.id).padEnd(5),
    (a.alias || '').padEnd(45),
    String((a.introtext || '').length).padEnd(7),
    a.title,
  ].join(' | '));
});

const output = lines.join('\n') + '\n';
fs.writeFileSync(LOG, output, 'utf8');
process.stdout.write(output);
