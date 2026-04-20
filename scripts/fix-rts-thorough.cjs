/*
  Thorough OCR cleanup for Release the Sun.
  Fixes: garbled names, stray periods, broken words, quote artifacts.
*/
const fs = require('fs');
const p = 'public/books/release-the-sun.json';
const db = JSON.parse(fs.readFileSync(p, 'utf8'));
let totalFixes = 0;

function fix(text) {
  let t = text;
  const before = t;

  // ── Garbled name patterns ──────────────────────────────────────────────
  // :t-.1ullaHusayn → Mullá Ḥusayn
  t = t.replace(/:t-\.?1ulla\s*Ḥusayn/g, 'Mullá Ḥusayn');
  t = t.replace(/:t-\.?1ulla\s*Husayn/g, 'Mullá Ḥusayn');
  // l\1ulla, l\fulla, ~1ulla → Mullá
  t = t.replace(/l\\1ulla/g, 'Mullá');
  t = t.replace(/l\\fulla/g, 'Mullá');
  t = t.replace(/~1ulla/g, 'Mullá');
  t = t.replace(/:Mullá/g, ' Mullá');
  // 'AH → 'Alí (the most common context)
  t = t.replace(/Mullá 'AH\b/g, "Mullá 'Alí");
  t = t.replace(/Siyyid 'AH\b/g, "Siyyid 'Alí");
  t = t.replace(/Mírzá Siyyid 'AH\b/g, "Mírzá Siyyid 'Alí");
  t = t.replace(/Ḥájí Mírzá Siyyid 'AH\b/g, "Ḥájí Mírzá Siyyid 'Alí");
  t = t.replace(/Ha ji Mírzá Siyyid 'AH\b/g, "Ḥájí Mírzá Siyyid 'Alí");
  t = t.replace(/'AH-Askar/g, "'Alí-Askar");
  t = t.replace(/'AH-Muḥammad/g, "'Alí-Muḥammad");
  t = t.replace(/'AH l\\1uhammad/g, "'Alí Muḥammad");
  t = t.replace(/'AH l\\fuhammad/g, "'Alí Muḥammad");
  t = t.replace(/the Guardian \['AH\]/g, "the Guardian ['Alí]");
  t = t.replace(/'AH,Mullá/g, "'Alí, Mullá");
  // Catch remaining standalone 'AH that should be 'Alí
  t = t.replace(/'AH\b/g, "'Alí");

  // ── Period inside words (OCR dropped characters) ───────────────────────
  t = t.replace(/\bl\.ast\b/g, 'last');
  t = t.replace(/\bVah\.id\b/g, 'Vaḥíd');
  t = t.replace(/\bVah\.id's\b/g, "Vaḥíd's");
  t = t.replace(/\bSu\.rib\b/g, 'Súrih');
  t = t.replace(/\bTa\.qi\b/g, 'Taqí');
  t = t.replace(/\bBarfuru\.sh\b/g, 'Barfurúsh');
  t = t.replace(/\bJama\.di\b/g, 'Jamádí');
  t = t.replace(/\bvenh\.Ired\b/g, 'ventured');
  t = t.replace(/\bi\\-Hghtnot\b/g, 'I might not');
  t = t.replace(/\bvVhen\b/g, 'When');
  t = t.replace(/\bl\\1uhammad\b/g, 'Muḥammad');
  t = t.replace(/\bl\\fuhammad\b/g, 'Muḥammad');

  // ── Heavily garbled passages ───────────────────────────────────────────
  // "pennc.shoannetre. d," → "pensioned" or similar (too garbled to auto-fix, replace known context)
  t = t.replace(/pennc\.shoannetre\.\s*d,\.\s*by him/g, 'pensioned by him');
  t = t.replace(/acc"uHsee\.dis?,,?\s*no follower/g, 'accused, is no follower');

  // ── Stray periods between words ────────────────────────────────────────
  // "followed his. example" → "followed his example"
  // "successful that. the" → "successful that the"
  // Pattern: word ending + stray period + space + lowercase continuation
  // Only fix when the period clearly doesn't end a sentence
  const strayPeriodFixes = [
    ['his. example', 'his example'],
    ['that. the priest', 'that the priest'],
    ['forgive. you', 'forgive you'],
    ['or. two', 'or two'],
    [':Me.I prefer', ': "Me. I prefer'],
  ];
  for (const [from, to] of strayPeriodFixes) {
    t = t.split(from).join(to);
  }

  // More general: stray period before space + lowercase where previous word
  // is a common non-sentence-ending word
  const nonEnders = /\b(the|a|an|his|her|its|my|our|your|their|this|that|and|or|but|of|in|on|at|to|for|with|by|from|was|is|are|were|been|be|not|no|all|some|one|two|any|each|every|who|which|what|how|had|has|have|will|would|could|should|may|might|can|do|did|does|so|as|if|than|then|also|very|too|yet|just|still|even|only|about)\.\s([a-z])/g;
  t = t.replace(nonEnders, (m, word, next) => word + ' ' + next);

  // ── Tilde garbage ──────────────────────────────────────────────────────
  t = t.replace(/\s*~\s*/g, ' ');

  // ── Backslash artifacts ────────────────────────────────────────────────
  t = t.replace(/l\\1/g, 'M');
  t = t.replace(/l\\f/g, 'M');

  // ── Fix "Tms" at chapter 1 start ───────────────────────────────────────
  t = t.replace(/\bTms\b/g, 'This');

  // ── Normalize spacing ──────────────────────────────────────────────────
  t = t.replace(/  +/g, ' ');

  // ── Fix quote issues ───────────────────────────────────────────────────
  // Straight quotes that should be curly are fine — leave them
  // But fix garbled quote combos
  t = t.replace(/""/g, '"');
  t = t.replace(/''/g, "'");

  if (t !== before) totalFixes++;
  return t;
}

for (const key of Object.keys(db)) {
  if (key === '__chapters') continue;
  const entry = db[key];
  if (entry.content) entry.content = fix(entry.content);
  if (entry.title) entry.title = fix(entry.title);
}

fs.writeFileSync(p, JSON.stringify(db));
console.log('Fixed', totalFixes, 'chapters');

// Verify — re-scan for remaining issues
const allText = Object.keys(db).filter(k => k !== '__chapters').map(k => db[k].content).join('\n');
const remaining = {
  garbled: (allText.match(/:t-\.?\d/g) || []).length,
  AH: (allText.match(/'AH\b/g) || []).length,
  periodInWord: (allText.match(/\b[a-z]+\.[a-z]{3,}\b/g) || []).length,
  backslash: (allText.match(/\\/g) || []).length,
  tilde: (allText.match(/~/g) || []).length,
  Tms: (allText.match(/\bTms\b/g) || []).length,
};
console.log('Remaining issues:', remaining);
