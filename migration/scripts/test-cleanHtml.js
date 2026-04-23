const { cleanHtml } = require('./lib/cleanHtml');

const testInput = `<div class="sparky_page_row"><div class="sparky_cell">
  <img src="/images/blog/test.jpg#joomlaImage://local-images/blog/test.jpg">
  <p>Hello &amp;amp; world</p>
  </div></div>`;

const { html, youtubeIds } = cleanHtml(testInput);

console.log('=== INPUT ===');
console.log(testInput);
console.log('\n=== OUTPUT HTML ===');
console.log(html);
console.log('\n=== YOUTUBE IDS ===');
console.log(youtubeIds);

// Assertions
const checks = [
  {
    name: 'Sparky wrapper removed',
    pass: !html.includes('sparky_page_row') && !html.includes('sparky_cell'),
  },
  {
    name: 'Image path rewritten (/images/blog/ → /images/updates/)',
    pass: html.includes('/images/updates/test.jpg'),
  },
  {
    name: 'Joomla artifact removed from img src (no #joomlaImage)',
    pass: !html.includes('#joomlaImage'),
  },
  {
    name: 'Double-encoded ampersand fixed (&amp;amp; → &amp;)',
    pass: html.includes('&amp;') && !html.includes('&amp;amp;'),
  },
];

console.log('\n=== TEST RESULTS ===');
let passed = 0;
checks.forEach(c => {
  const status = c.pass ? 'PASS' : 'FAIL';
  console.log(`  [${status}] ${c.name}`);
  if (c.pass) passed++;
});

console.log(`\n${passed}/${checks.length} checks passed`);
if (passed === checks.length) {
  console.log('RESULT: PASS');
} else {
  console.log('RESULT: FAIL');
  process.exit(1);
}
