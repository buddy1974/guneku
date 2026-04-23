const fs   = require('fs');
const path = require('path');
const OUTDIR = path.resolve(__dirname, '../../src/data');

const config = {
  "siteName": "Guneku Fondom",
  "siteTagline": "A Kingdom governed from Neuwied. A village built from the heart.",
  "siteDescription": "Official digital home of Guneku Fondom — Mbengwi, Momo Division, Northwest Cameroon. A royal community of 15,000 people united across three continents.",
  "siteUrl": "https://guneku.org",
  "contactEmail": "info@guneku.org",
  "palacePhone": "+237 681 19 46 64",
  "socialLinks": {
    "facebook":  "https://www.facebook.com/guneku",
    "twitter":   "https://twitter.com/GunekuF",
    "instagram": "https://www.instagram.com/gunekufondom/",
    "youtube":   "https://www.youtube.com/channel/UCEmIEHRMg3UTzb1wpxLZOAw"
  },
  "fonEmail": "wfomuki@gmx.de",
  "copyright": {
    "text":       "© 2026 Guneku Fondom",
    "builtBy":    "MaxPromo Digital",
    "builtByUrl": "https://maxpromo.digital"
  },
  "coordinates": { "lat": 6.2307346, "lng": 9.664737 },
  "youtubeChannelId": "UCEmIEHRMg3UTzb1wpxLZOAw",
  "anthropicModel": "claude-sonnet-4-5-20250514",
  "aiPersonality": "You are the voice of Guneku Fondom — knowledgeable, proud, warm, and culturally grounded. You answer questions about Guneku village, its Fon HRH Dr. Fomuki Walters Ticha IX, GUDECA, culture, history, and community. You speak with dignity befitting a royal fondom. You only answer based on what you know about Guneku. For anything outside Guneku, you gracefully redirect."
};

fs.writeFileSync(path.join(OUTDIR, 'site-config.json'), JSON.stringify(config, null, 2), 'utf8');
console.log(`✓ site-config.json written (${Buffer.byteLength(JSON.stringify(config), 'utf8')} bytes)`);
