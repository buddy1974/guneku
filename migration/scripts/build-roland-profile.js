const fs   = require('fs');
const path = require('path');
const OUTDIR = path.resolve(__dirname, '../../src/data/notables');
fs.mkdirSync(OUTDIR, { recursive: true });

const profile = {
  "id": "roland-teboh-forbang",
  "type": "NotableProfile",
  "name": "Prof. Dr. Roland Teboh Forbang",
  "slug": "roland-teboh-forbang",
  "origin": "Guneku, Cameroon",
  "location": "New Jersey, USA",
  "title": "Associate Professor & Medical Director",
  "institution": "Hackensack Meridian Health Network",
  "specialty": "Cancer Management / Oncology",
  "bio": "Prof. Dr. Roland Teboh Forbang is one of Guneku's most distinguished sons. An Associate Professor and Director at Hackensack Meridian Health Network in New Jersey, USA, he is a renowned specialist in cancer management and oncology. Beyond his medical career, Prof. Forbang gives back to his roots through the Afor Foundation — an annual scholarship programme that awards over 1,000,000 FCFA to outstanding pupils in Mbengwi Central, hosted at the Guneku Fon's Palace.",
  "connectionToGuneku": "Son of Guneku. Founder of the Afor Foundation Scholarship Programme.",
  "initiative": {
    "name": "Afor Foundation Scholarship Programme",
    "type": "Merit and need-based annual scholarship",
    "venue": "Guneku Fon's Palace, Mbengwi",
    "prize": "1,000,000 FCFA",
    "2025_edition": {
      "date": "February 22, 2025",
      "registered": 201,
      "wrote": 200,
      "invigilators": 13,
      "winners": "Top scorer from Wumnebug + 2 runners-up"
    },
    "2022_edition": {
      "amount_distributed": "470,000 FCFA",
      "date": "August 26, 2022",
      "recipients": "Class 6 pupils, P.S. Mbengwi Annex Guneku"
    }
  },
  "quote": "Guneku is blessed to have one of the renowned specialists in cancer management in the United States."
};

const outPath = path.join(OUTDIR, 'roland-teboh-forbang.json');
fs.writeFileSync(outPath, JSON.stringify(profile, null, 2), 'utf8');
console.log(`✓ roland-teboh-forbang.json written (${Buffer.byteLength(JSON.stringify(profile), 'utf8')} bytes)`);
