const fs = require('fs');
const db = JSON.parse(fs.readFileSync('public/books/release-the-sun.json', 'utf8'));
const allText = Object.keys(db).filter(k => k !== '__chapters').map(k => db[k].content).join('\n');

console.log('Total chars:', allText.length);
const issues = {};

function add(type, ctx) {
  if (!issues[type]) issues[type] = [];
  issues[type].push(ctx.replace(/\n/g, ' '));
}

// 1. :t-.1ulla garble
for (const m of allText.matchAll(/:t-\.?\d?ulla/g)) {
  add('garbled-mulla', allText.slice(Math.max(0, m.index - 20), m.index + 30));
}

// 2. Period inside words: Vah.id, l.ast, Su.rib etc
for (const m of allText.matchAll(/\b[a-zA-ZÁ-ú]+\.[a-zA-Z]{2,}\b/g)) {
  const w = m[0];
  if (/^(Mr|Mrs|Dr|St|Mt|Vol|No|pp|vs|etc|Rev|Gen|Lt|Gov)\./i.test(w)) continue;
  if (/^(i\.e|e\.g|a\.m|p\.m)/i.test(w)) continue;
  add('period-in-word', allText.slice(Math.max(0, m.index - 15), m.index + w.length + 15));
}

// 3. 'AH (should be 'Alí)
for (const m of allText.matchAll(/'AH\b/g)) {
  add('AH-garble', allText.slice(Math.max(0, m.index - 20), m.index + 15));
}

// 4. Stray period before space+lowercase: "his. example" pattern
for (const m of allText.matchAll(/[a-z]\. [a-z]/g)) {
  const before = allText.slice(Math.max(0, m.index - 40), m.index);
  // Skip if it's a real sentence ending (preceded by a full word)
  // Flag it — we'll manually filter
  add('stray-period-space', allText.slice(Math.max(0, m.index - 25), m.index + 15));
}

// 5. Missing space after period+capital: "word.Next"
for (const m of allText.matchAll(/[a-z]\.[A-Z]/g)) {
  add('missing-space', allText.slice(Math.max(0, m.index - 10), m.index + 15));
}

// 6. Broken quotes: unmatched or garbled quotation marks
for (const m of allText.matchAll(/[""]/g)) {
  add('curly-quote', allText.slice(Math.max(0, m.index - 5), m.index + 20));
}

// 7. Random single characters or garbage between words
for (const m of allText.matchAll(/\s[^a-zA-ZÁ-ú0-9\s"',;:!?.()—–\-]{1,3}\s/g)) {
  add('garbage-char', allText.slice(Math.max(0, m.index - 10), m.index + m[0].length + 10));
}

// 8. Tms (should be This — from chapter 1)
for (const m of allText.matchAll(/\bTms\b/g)) {
  add('Tms', allText.slice(Math.max(0, m.index - 5), m.index + 20));
}

// Show results
for (const [type, ctxs] of Object.entries(issues)) {
  console.log('\n=== ' + type + ' (' + ctxs.length + ') ===');
  // Deduplicate similar
  const uniq = [...new Set(ctxs)];
  uniq.slice(0, 15).forEach(c => console.log('  ' + c));
  if (uniq.length > 15) console.log('  ... and ' + (uniq.length - 15) + ' more');
}
