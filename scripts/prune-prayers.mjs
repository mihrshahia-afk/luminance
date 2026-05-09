// Prune unverified prayers from src/data/prayers.ts.
//
// Reads scripts/existing-prayers.json (current state) and
// scripts/verification-report.json (which IDs are verified).
//
// Emits a new src/data/prayers.ts containing only verified prayers,
// with the prayerTopics array trimmed to topics that still have content.
//
// This is a deletion operation — no new prayer text is generated.

import { readFileSync, writeFileSync } from 'fs';

const existing = JSON.parse(readFileSync('scripts/existing-prayers.json', 'utf-8'));
const report = JSON.parse(readFileSync('scripts/verification-report.json', 'utf-8'));

const verifiedIds = new Set(report.filter(r => r.verified).map(r => r.id));
const kept = existing.filter(p => verifiedIds.has(p.id));

console.log(`Existing: ${existing.length}`);
console.log(`Verified: ${verifiedIds.size}`);
console.log(`Keeping:  ${kept.length}`);
console.log(`Removing: ${existing.length - kept.length}`);

// Topics that still have at least one prayer
const topicsInUse = [...new Set(kept.map(p => p.topic))];

// Preserve the canonical order from the existing file
const canonicalOrder = [
  'Obligatory Prayers',
  'Morning',
  'Evening',
  'Praise & Gratitude',
  'Love',
  'Unity',
  'Healing',
  'Reliance on God',
  'Tests & Difficulties',
  'Steadfastness',
  'Forgiveness',
  'Detachment',
  'Protection',
  'Knowledge & Wisdom',
  'Service & Teaching',
  'Teaching',
  'Children',
  'Family',
  'Marriage',
  'Departed Souls',
  'Holy Days',
  'Special Tablets',
];
const orderedTopics = canonicalOrder.filter(t => topicsInUse.includes(t));

// Sort kept prayers by topic order, preserving original order within a topic
const topicIdx = new Map(orderedTopics.map((t, i) => [t, i]));
const origIdx = new Map(existing.map((p, i) => [p.id, i]));
kept.sort((a, b) => {
  const ta = topicIdx.get(a.topic) ?? 999;
  const tb = topicIdx.get(b.topic) ?? 999;
  if (ta !== tb) return ta - tb;
  return (origIdx.get(a.id) ?? 0) - (origIdx.get(b.id) ?? 0);
});

// Emit TypeScript
function escapeStringForTs(s) {
  // Use single quotes to wrap; escape backslashes, single quotes, and newlines.
  return "'" + s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
}

let out = `import type { Prayer, PrayerTopic } from '../types';\n\n`;
out += `export const prayerTopics: PrayerTopic[] = [\n`;
for (const t of orderedTopics) out += `  ${escapeStringForTs(t)},\n`;
out += `];\n\n`;

out += `export const prayers: Prayer[] = [\n`;
let lastTopic = null;
for (const p of kept) {
  if (p.topic !== lastTopic) {
    out += `\n  // ─── ${p.topic.toUpperCase()} ──────────────────\n\n`;
    lastTopic = p.topic;
  }
  out += `  {\n`;
  out += `    id: ${escapeStringForTs(p.id)},\n`;
  out += `    topic: ${escapeStringForTs(p.topic)},\n`;
  if (p.title) out += `    title: ${escapeStringForTs(p.title)},\n`;
  out += `    author: ${escapeStringForTs(p.author)},\n`;
  out += `    text: ${escapeStringForTs(p.text)},\n`;
  out += `  },\n`;
}
out += `];\n`;

writeFileSync('src/data/prayers.ts', out);
console.log(`\nWrote src/data/prayers.ts with ${kept.length} verified prayers across ${orderedTopics.length} topics.`);
console.log('Topics retained:', orderedTopics.join(', '));
