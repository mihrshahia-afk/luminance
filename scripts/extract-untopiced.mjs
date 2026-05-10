// Extract the prayers from Source 1 (bahai.org) that have no topic in
// Source 2 or Source 3. Auto-suggest a best-fit topic via keyword
// matching against the existing 41 PrayerTopic categories. Emits CSV
// for me to manually verify each row before merging.
//
//   node scripts/extract-untopiced.mjs
//
// Outputs:
//   scripts/untopiced-prayers.json       (full text + suggestion)
//   scripts/topic-suggestions.csv        (id, first-line, collection, suggested-topic)

import { readFileSync, writeFileSync } from 'fs';

const s1 = JSON.parse(readFileSync('scripts/bahai-org-prayers.json', 'utf-8'));
const s2 = JSON.parse(readFileSync('scripts/prayers-content.json', 'utf-8'));
const s3 = JSON.parse(readFileSync('scripts/thebahaiprayers-prayers.json', 'utf-8'));

function fp(text) { return text.toLowerCase().replace(/[^a-z]/g, '').slice(0, 60); }

const topiced = new Set();
for (const c of s2.filter(p => !p.error && p.paragraphs?.length && p.category !== 'Indexes')) {
  topiced.add(fp(c.paragraphs.join(' ')));
}
for (const c of s3) for (const p of (c.prayers||[])) {
  topiced.add(fp(p.paragraphs.join(' ')));
}

const untopiced = [];
const seen = new Set(); // dedupe within S1
for (const c of s1) for (const p of c.prayers) {
  const text = p.paragraphs.join('\n\n');
  const key = fp(text);
  if (topiced.has(key) || seen.has(key)) continue;
  seen.add(key);
  untopiced.push({
    collection: c.collection,
    sectionPath: p.sectionPath || [],
    number: p.number,
    rubric: p.rubric || null,
    paragraphs: p.paragraphs,
    attribution: p.attribution || `—${c.author}`,
    text,
  });
}

// --- Topic suggestion via keyword matching ---
// Order matters: most specific first.
const topicKeywords = [
  ['The Fast',                ['fast', 'fasting', 'abstain']],
  ['Marriage',                ['marriage', 'bride', 'bridegroom', 'wedded']],
  ['The Departed',            ['departed', 'deceased', 'ascended unto thee', 'dead', 'thy mercy upon him', 'thy mercy upon her', 'risen up to thee']],
  ['Children',                ['child', 'infant', 'babe', 'these little ones']],
  ['Youth',                   ['youth', 'young']],
  ['Women',                   ['handmaid', 'woman', 'women', 'maid-servant']],
  ['Marriage',                ['matrimony']],
  ['Morning',                 ['morning', 'dawn', 'daystar', 'wakened', 'awakened']],
  ['Evening',                 ['evening', 'night', 'sleep', 'slumber']],
  ['America',                 ['america', 'american']],
  ['Prison',                  ['prison', 'captive', 'captivity', 'fetters', 'chains']],
  ['Healing',                 ['heal', 'healing', 'physician', 'sickness', 'illness', 'remedy', 'cure']],
  ['Humanity',                ['mankind', 'humanity', 'human race', 'all peoples', 'oneness of mankind']],
  ['Unity',                   ['unity', 'oneness', 'concord']],
  ['Forgiveness',             ['forgive', 'forgiveness', 'pardon', 'sins', 'transgression']],
  ['Detachment',              ['detach', 'detachment', 'sever', 'rid me of all attachment']],
  ['Steadfastness',           ['steadfast', 'firm', 'firmness']],
  ['Tests and Difficulties',  ['test', 'trial', 'affliction', 'sorrow', 'tribulation']],
  ['Trials',                  ['adversit']],
  ['Protection',              ['protect', 'shield', 'shelter', 'guard', 'safe-keep']],
  ['Praise and Gratitude',    ['praise', 'thanksgiving', 'glorif', 'extol', 'magnif']],
  ['Nearness to God',         ['nearness', 'draw nigh', 'draw near', 'fellowship with thee']],
  ['Spiritual Growth',        ['spiritual', 'growth', 'illumin', 'enlighten']],
  ['Service',                 ['service', 'serve thee', 'serve thy cause']],
  ['Teaching',                ['teach', 'teaching']],
  ['Manifestation of God',    ['manifestation', 'manifest', 'beauty of thy countenance']],
  ['Sacrifice',               ['sacrifice']],
  ['Aid and Assistance',      ['aid', 'assist', 'help', 'succor']],
  ['Triumph of the Cause',    ['triumph', 'cause of god', 'thy cause']],
  ['Firmness in the Covenant',['covenant']],
  ['Paradise',                ['paradise', 'abha kingdom', 'kingdom of abh']],
  ['Gatherings',              ['gathering', 'assembly', 'concourse']],
  ['Grace at Table',          ['food', 'sustenance', 'this table']],
  ['Special Tablets',         ['ahmad', 'fire tablet', 'tablet of']],
  ['Divine Springtime',       ['springtime', 'spring']],
];

function suggest(text) {
  const lower = text.toLowerCase();
  const hits = [];
  for (const [topic, kws] of topicKeywords) {
    for (const kw of kws) {
      if (lower.includes(kw)) {
        hits.push({ topic, kw });
        break;
      }
    }
  }
  // Default to a broad bucket if nothing matched
  return hits[0]?.topic || 'Spiritual Growth';
}

for (const p of untopiced) {
  p.suggestedTopic = suggest(p.text);
}

// Sort by suggested topic for easier review
untopiced.sort((a, b) => a.suggestedTopic.localeCompare(b.suggestedTopic) || a.collection.localeCompare(b.collection));

// Assign stable ids
untopiced.forEach((p, i) => { p.id = `s1-untopiced-${i + 1}`; });

writeFileSync('scripts/untopiced-prayers.json', JSON.stringify(untopiced, null, 2));

// --- CSV ---
function csvEscape(s) {
  if (s == null) return '';
  const t = String(s).replace(/"/g, '""');
  return /[",\n]/.test(t) ? `"${t}"` : t;
}
const csvRows = ['id,suggested_topic,collection,first_line'];
for (const p of untopiced) {
  const firstLine = (p.text.replace(/\s+/g, ' ').slice(0, 140)).trim();
  csvRows.push([p.id, p.suggestedTopic, p.collection, firstLine].map(csvEscape).join(','));
}
writeFileSync('scripts/topic-suggestions.csv', csvRows.join('\n'));

// --- Stats ---
console.log(`Untopiced prayers (deduped): ${untopiced.length}`);
const counts = {};
for (const p of untopiced) counts[p.suggestedTopic] = (counts[p.suggestedTopic] || 0) + 1;
console.log('Suggested topic distribution:');
for (const [t, n] of Object.entries(counts).sort((a,b)=>b[1]-a[1])) {
  console.log(`  ${t.padEnd(40)} ${n}`);
}
