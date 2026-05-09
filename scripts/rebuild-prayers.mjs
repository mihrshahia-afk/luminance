// Rebuild src/data/prayers.ts and src/types.ts (PrayerTopic union)
// from scripts/prayers-content.json (bahaiprayers.org scrape).
//
// All prayer text is taken verbatim from the JSON — no hand-typing,
// no AI-generated content. Run:
//   node scripts/rebuild-prayers.mjs

import { readFileSync, writeFileSync } from 'fs';

const data = JSON.parse(readFileSync('scripts/prayers-content.json', 'utf-8'));

const prayers = data.filter(
  p => !p.error && p.paragraphs?.length && p.category !== 'Indexes'
);

// Group by category, sort with Obligatory first, then alphabetical.
const byCategory = {};
for (const p of prayers) {
  (byCategory[p.category] ||= []).push(p);
}
const categories = Object.keys(byCategory).sort((a, b) => {
  if (a === 'Obligatory Prayers') return -1;
  if (b === 'Obligatory Prayers') return 1;
  return a.localeCompare(b);
});

// Stable id: category-slug + sequence (slugs from source aren't always unique).
function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// --- Build prayers.ts ---
const tsLines = [];
const w = (s = '') => tsLines.push(s);

w(`import type { Prayer, PrayerTopic } from '../types';`);
w('');
w(`export const prayerTopics: PrayerTopic[] = [`);
for (const c of categories) w(`  ${JSON.stringify(c)},`);
w(`];`);
w('');
w(`export const prayers: Prayer[] = [`);

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
  });
}
w(`];`);
w('');

writeFileSync('src/data/prayers.ts', tsLines.join('\n'));

// --- Update types.ts ---
const typesPath = 'src/types.ts';
const typesSrc = readFileSync(typesPath, 'utf-8');
const unionLines = categories.map((c, i) => {
  const sep = i === 0 ? '=' : '|';
  return `  ${sep} ${JSON.stringify(c)}`;
}).join('\n') + ';';
const newTypes = typesSrc.replace(
  /export type PrayerTopic =[\s\S]*?;/,
  `export type PrayerTopic\n${unionLines}`
);
writeFileSync(typesPath, newTypes);

// --- Stats ---
console.log(`Wrote ${prayers.length} prayers across ${categories.length} categories.`);
console.log('Topics:');
for (const c of categories) {
  console.log(`  ${c.padEnd(50)} ${byCategory[c].length}`);
}
