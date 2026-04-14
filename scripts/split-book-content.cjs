/*
  Split the monolithic src/data/bookContent{,-fa,-ar}.json files into
  per-book files under src/data/books/ so the Vite build can code-split
  and lazy-load each book on demand.

  Input keys look like:
    "hidden-words/__chapters"       → array of chapters
    "hidden-words/2"                → { title, content }
    "release-the-sun/foreword"      → { title, content }

  Output: src/data/books/<bookId>.json with keys "__chapters", "2", "foreword"
          src/data/books/<bookId>.fa.json  (from bookContent-fa.json)
          src/data/books/<bookId>.ar.json  (from bookContent-ar.json)
*/
const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'src', 'data');
const OUT = path.join(DATA, 'books');

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

function splitOne(srcFile, suffix) {
  if (!fs.existsSync(srcFile)) { console.log('skip (missing):', srcFile); return 0; }
  const db = JSON.parse(fs.readFileSync(srcFile, 'utf8'));
  const byBook = {};
  let droppedKeys = 0;

  for (const key of Object.keys(db)) {
    const idx = key.indexOf('/');
    if (idx < 0) { droppedKeys++; continue; }
    const bookId = key.slice(0, idx);
    let segment = key.slice(idx + 1);

    // Normalize non-English chapter key: "bookId/__chapters_fa" → "__chapters"
    if (/^__chapters_[a-z]{2}$/.test(segment)) segment = '__chapters';

    if (!byBook[bookId]) byBook[bookId] = {};
    byBook[bookId][segment] = db[key];
  }

  const bookIds = Object.keys(byBook);
  for (const id of bookIds) {
    const outPath = path.join(OUT, id + suffix + '.json');
    fs.writeFileSync(outPath, JSON.stringify(byBook[id]));
  }
  console.log(`${path.basename(srcFile)}: wrote ${bookIds.length} files` +
    (droppedKeys ? ` (dropped ${droppedKeys} non-book keys)` : ''));
  return bookIds.length;
}

splitOne(path.join(DATA, 'bookContent.json'), '');
splitOne(path.join(DATA, 'bookContent-fa.json'), '.fa');
splitOne(path.join(DATA, 'bookContent-ar.json'), '.ar');

console.log('\nDone. Review src/data/books/ then delete the old bookContent*.json files.');
