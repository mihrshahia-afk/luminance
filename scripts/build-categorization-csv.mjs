// Output a CSV of (id, assigned_topic, collection, first_~200_chars) for
// the 174 untopiced prayers, grouped by topic, for user spot-check before
// merging into prayers.ts.

import { readFileSync, writeFileSync } from 'fs';

const data = JSON.parse(readFileSync('scripts/untopiced-prayers.json', 'utf-8'));
const manifest = JSON.parse(readFileSync('scripts/categorization-manifest.json', 'utf-8'));
const byId = Object.fromEntries(data.map(p => [p.id, p]));

function csvEscape(s) {
  if (s == null) return '';
  const t = String(s).replace(/"/g, '""');
  return /[",\n]/.test(t) ? `"${t}"` : t;
}

const rows = [['topic', 'id', 'collection', 'preview']];
const assignments = Object.entries(manifest.assign)
  .sort(([, ta], [, tb]) => ta.localeCompare(tb));

for (const [id, topic] of assignments) {
  const p = byId[id];
  if (!p) continue;
  const preview = p.text.replace(/\s+/g, ' ').slice(0, 200).trim();
  rows.push([topic, id, p.collection, preview]);
}

const csv = rows.map(r => r.map(csvEscape).join(',')).join('\n');
writeFileSync('scripts/categorization-spotcheck.csv', csv);

// Summary
const dist = {};
for (const t of Object.values(manifest.assign)) dist[t] = (dist[t] || 0) + 1;
console.log(`Wrote ${assignments.length} rows to scripts/categorization-spotcheck.csv`);
console.log('Distribution by topic:');
for (const [t, n] of Object.entries(dist).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${t.padEnd(28)} ${n}`);
}
console.log(`Dropped: ${manifest.drop.length}`);
