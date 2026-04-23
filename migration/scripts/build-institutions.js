const fs   = require('fs');
const path = require('path');
const OUTDIR = path.resolve(__dirname, '../../src/data/institutions');
fs.mkdirSync(OUTDIR, { recursive: true });

const institutions = [
  {
    filename: 'guneccul.json',
    data: {
      "id": "guneccul",
      "name": "Guneku Cooperative Credit Union Limited",
      "abbreviation": "GUNECCUL",
      "status": "active",
      "description": "Community-owned credit union serving Guneku indigenes worldwide. Provides savings accounts, loans, and solidarity fund shares.",
      "branches": [
        { "name": "Head Office", "location": "Guneku", "status": "operational" },
        { "name": "Home Branch", "location": "Guneku Fon's Palace", "launched": "2023-04-15", "status": "operational" },
        { "name": "Douala Branch", "location": "Douala", "launched": "2022-09-17", "status": "operational" },
        { "name": "Bamenda Branch", "location": "Bamenda", "launched": "2025-01", "status": "operational" }
      ],
      "products": ["Savings accounts", "Loans", "Solidarity fund shares"],
      "contact": { "whatsapp": "675994599" }
    }
  },
  {
    filename: 'agro-cig.json',
    data: {
      "id": "agro-cig",
      "name": "Guneku Agro Common Initiative Group",
      "abbreviation": "Agro CIG",
      "status": "active",
      "launchDate": "2026-04-05",
      "location": "Ngong Quarter, Guneku",
      "phase1": {
        "status": "complete",
        "raisedFCFA": 12500000,
        "achievements": ["Land preparation complete", "Bulldozing done", "Chicks available"]
      },
      "phase2": {
        "status": "open",
        "deadline": "2026-04-30",
        "registrationFee": 5000,
        "sharePrice": 2000,
        "minShares": 5,
        "maxShares": 100,
        "targetFCFA": 20000000
      },
      "products": ["Poultry (day-old chicks)", "Catfish (Vitalis Fish Farm, Wumfi-Ku)", "Ostrich (planned)"],
      "contact": { "phone": "673320716", "whatsapp": "673320716" }
    }
  },
  {
    filename: 'guyodeca.json',
    data: {
      "id": "guyodeca",
      "name": "Youth Development Association of Guneku",
      "abbreviation": "GUYODECA",
      "parentOrg": "GUDECA",
      "status": "active",
      "zones": ["Zone 1", "Zone 2"],
      "confirmedActivities": [
        "Bridge construction project (2025)",
        "GUYODECA vs GUDECA football match",
        "Gift-giving to Guneku women over 50 (rice, Maggi, soap, spaghetti, clothes, flowers)"
      ]
    }
  }
];

institutions.forEach(({ filename, data }) => {
  const outPath = path.join(OUTDIR, filename);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`✓ ${filename} written`);
});
console.log(`✓ ${institutions.length} institution files written to src/data/institutions/`);
