/*
  Final OCR cleanup pass for Release the Sun.
  Fixes: f→í substitutions, garbled names, remaining artifacts.
*/
const fs = require('fs');
const p = 'public/books/release-the-sun.json';
const db = JSON.parse(fs.readFileSync(p, 'utf8'));

const subs = [
  // Digit-prefixed names
  ['1Mullá', 'Mullá'],
  ['11ah-Ku', 'Máh-Kú'],

  // f→í OCR misreads (the scanner read í as f)
  ['Karfm', 'Karím'],
  ['Karlm', 'Karím'],
  ['Tabrfz', 'Tabríz'],
  ['Aqasf', 'Aqasí'],
  ['Zarrfn', 'Zarrín'],
  ['Raduvf', 'Radaví'],
  ['Karím ', 'Karím '], // already correct — skip
  ['Mulhi ', 'Mullá '],

  // H→lí / H→lf OCR misreads
  ['QuHKhan', 'Qulí Khán'],
  ['QuH Khan', 'Qulí Khán'],
  ['QuH ', 'Qulí '],
  ['Qulf ', 'Qulí '],
  ['himseH ', 'himself '],
  ['himseH,', 'himself,'],
  ['itseH', 'itself'],

  // Garbled chapter title
  ['lllGH STONE PRISON', 'HIGH STONE PRISON'],
  ['THE lllGH', 'THE HIGH'],

  // Angle bracket artifact
  ['<Abbas', "'Abbás"],

  // Garbled 'Alí variants
  ["'Alf-", "'Alí-"],
  ["'Ali-Askar", "'Alí-Askar"],

  // Other OCR misreads found in scan
  ["Sabzih-Maydan", "Sabzih-Maydán"],
  ['Navvab-i-', 'Navváb-i-'],
  ['\"Abbas-', "'Abbás-"],

  // Quote cleanup
  [' ,to ', ', to '],
  [') the', ') the'],
];

let totalCount = 0;
for (const k of Object.keys(db)) {
  if (k === '__chapters') continue;
  let c = db[k].content;
  for (const [from, to] of subs) {
    if (from === to) continue;
    while (c.includes(from)) {
      c = c.replace(from, to);
      totalCount++;
    }
  }
  db[k].content = c;
}

// Also fix titles
for (const ch of db.__chapters) {
  for (const [from, to] of subs) {
    if (from === to) continue;
    if (ch.title.includes(from)) {
      ch.title = ch.title.replace(from, to);
      totalCount++;
    }
  }
  const entry = db[ch.urlSegment];
  if (entry && entry.title) {
    for (const [from, to] of subs) {
      if (from === to) continue;
      if (entry.title.includes(from)) {
        entry.title = entry.title.replace(from, to);
      }
    }
  }
}

fs.writeFileSync(p, JSON.stringify(db));
console.log('Applied', totalCount, 'fixes');

// Final verification
const all = Object.keys(db).filter(k => k !== '__chapters').map(k => db[k].content).join('');
const remaining = [
  ['1Mullá', /1Mullá/g],
  ['Karfm', /Karfm/g],
  ['Karlm', /Karlm/g],
  ['Tabrfz', /Tabrfz/g],
  ['Aqasf', /Aqasf/g],
  ['QuH', /QuH\b/g],
  ['himseH', /himseH/g],
  ['lllGH', /lllGH/g],
  ['11ah-Ku', /11ah-Ku/g],
  ['<Abbas', /<Abbas/g],
  ['Mulhi', /Mulhi/g],
];
let clean = true;
for (const [name, pat] of remaining) {
  const count = (all.match(pat) || []).length;
  if (count > 0) { console.log('STILL:', name, count); clean = false; }
}
if (clean) console.log('All patterns clean!');
