// Dump existing prayers.ts to scripts/existing-prayers.json for processing.
import { writeFileSync } from 'fs';
import { prayers } from '../src/data/prayers.ts';

writeFileSync(
  'scripts/existing-prayers.json',
  JSON.stringify(prayers, null, 2),
);
console.log(`Wrote ${prayers.length} prayers to scripts/existing-prayers.json`);
