// Rebuild src/data/prayers.ts from BOTH sources:
//   - Source 2 (bahaiprayers.org)  — 283 prayers, native topics
//   - Source 1 (bahai.org)         — 174 untopiced prayers, manually
//                                    assigned to topics via
//                                    scripts/categorization-manifest.json
//                                    (40 scraping artifacts dropped)
//
// All prayer text is taken verbatim from the source JSONs — no hand-typing,
// no AI-generated content. Run:
//   node scripts/rebuild-prayers.mjs

import { readFileSync, writeFileSync } from 'fs';

const s2 = JSON.parse(readFileSync('scripts/prayers-content.json', 'utf-8'));
const untopiced = JSON.parse(readFileSync('scripts/untopiced-prayers.json', 'utf-8'));
const manifest = JSON.parse(readFileSync('scripts/categorization-manifest.json', 'utf-8'));

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function autoTitle(text) {
  // First sentence-ish, max ~60 chars, end on word boundary, append ellipsis
  // if truncated. Used for S1 prayers, which have no native title.
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= 60) return flat;
  const cut = flat.slice(0, 60);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 30 ? cut.slice(0, lastSpace) : cut) + '…';
}

// --- Build category buckets ---
const byCategory = {};

// Source 2 prayers (already topic-categorized)
const s2Clean = s2.filter(
  p => !p.error && p.paragraphs?.length && p.category !== 'Indexes'
);
for (const p of s2Clean) {
  (byCategory[p.category] ||= []).push({
    src: 's2',
    title: p.title || null,
    author: p.author,
    rubric: p.rubric || null,
    paragraphs: p.paragraphs,
  });
}

// Source 1 prayers (manually assigned via manifest)
const byId = Object.fromEntries(untopiced.map(p => [p.id, p]));
for (const [id, topic] of Object.entries(manifest.assign)) {
  const p = byId[id];
  if (!p) continue;
  // attribution is like "—Bahá'u'lláh"; strip the leading dash for author field
  const author = (p.attribution || '').replace(/^[—\-]\s*/, '').trim() || 'Bahá’u’lláh';
  (byCategory[topic] ||= []).push({
    src: 's1',
    title: autoTitle(p.text),
    author,
    rubric: p.rubric || null,
    paragraphs: p.paragraphs,
  });
}

// Category ordering: Obligatory first, then alphabetical
const categories = Object.keys(byCategory).sort((a, b) => {
  if (a === 'Obligatory Prayers') return -1;
  if (b === 'Obligatory Prayers') return 1;
  return a.localeCompare(b);
});

// --- Build prayers.ts ---
const lines = [];
const w = (s = '') => lines.push(s);

w(`import type { Prayer, PrayerTopic } from '../types';`);
w('');
w(`export const prayerTopics: PrayerTopic[] = [`);
for (const c of categories) w(`  ${JSON.stringify(c)},`);
w(`];`);
w('');
w(`export const prayers: Prayer[] = [`);

let totalPrayers = 0;
for (const cat of categories) {
  w('');
  w(`  // ─── ${cat.toUpperCase()} ───`);
  w('');
  const catSlug = slugify(cat);
  byCategory[cat].forEach((p, i) => {
    const id = `${catSlug}-${i + 1}`;
    const textParts = [];
    if (p.rubric) textParts.push(p.rubric);
    textParts.push(...p.paragraphs);
    const text = textParts.join('\n\n');

    w(`  {`);
    w(`    id: ${JSON.stringify(id)},`);
    w(`    topic: ${JSON.stringify(cat)},`);
    if (p.title) w(`    title: ${JSON.stringify(p.title)},`);
    w(`    author: ${JSON.stringify(p.author)},`);
    w(`    text: ${JSON.stringify(text)},`);
    w(`  },`);
    totalPrayers++;
  });
}
w(`];`);
w('');

writeFileSync('src/data/prayers.ts', lines.join('\n'));

// --- Update types.ts (PrayerTopic union) ---
const typesPath = 'src/types.ts';
const typesSrc = readFileSync(typesPath, 'utf-8');
const unionLines = categories.map((c, i) => {
  const sep = i === 0 ? '=' : '|';
  return `  ${sep} ${JSON.stringify(c)}`;
}).join('\n') + ';';
const newTypes = typesSrc.replace(
  /export type PrayerTopic[\s\S]*?;/,
  `export type PrayerTopic\n${unionLines}`
);
writeFileSync(typesPath, newTypes);

// --- Stats ---
console.log(`Wrote ${totalPrayers} prayers across ${categories.length} categories.`);
let s1Count = 0, s2Count = 0;
for (const cat of categories) for (const p of byCategory[cat]) {
  if (p.src === 's1') s1Count++; else s2Count++;
}
console.log(`  From S2 (bahaiprayers.org): ${s2Count}`);
console.log(`  From S1 (bahai.org):        ${s1Count}`);
console.log('Per-topic counts:');
for (const cat of categories) {
  console.log(`  ${cat.padEnd(50)} ${byCategory[cat].length}`);
}
