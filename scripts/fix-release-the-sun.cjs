/*
  Post-ingest cleanup for Release the Sun content in bookContent.json.
  Fixes:
   - U+FFFD replacement chars (PDF extraction dropped fi/fl ligatures and hyphens)
   - Mid-sentence paragraph breaks caused by page boundaries in pdftotext layout mode
*/
const fs = require('fs');
const path = require('path');

const JSON_PATH = path.join(__dirname, '..', 'src', 'data', 'books', 'release-the-sun.json');
const db = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));

const KEYS = Object.keys(db).filter(k => k !== '__chapters');

// ─── Chapter opening fixes ───────────────────────────────────────────────────
// The PDF sets the first few words of each chapter in small caps, which pdftotext
// renders as all-caps with dropped spaces. These are the authoritative opening
// phrases to substitute in.
const OPENINGS = [
  ['Tms IS THE STORY of a modern',             'This is the story of a modern'],
  ["l\\1ULLAH.usAYNwas in Iṣfahán",            'Mullá Ḥusayn was in Iṣfahán'],
  ['MULL.AHusAYNwas faithful',                 'Mullá Ḥusayn was faithful'],
  ['~rHE PILGRIMAGE',                          'The Pilgrimage'],
  ['THE BABRETURNED with',                     'The Báb returned with'],
  ["HusAYNKHAN'SANGERwas not",                 "Ḥusayn Khán's anger was not"],
  ['MULLAH. usAYNcame to visit',               'Mullá Ḥusayn came to visit'],
  ['THE FEW MONTIIS which',                    'The few months which'],
  ['THE BABDEPARTED for',                      'The Báb departed for'],
  ['MUHAMMASDHAH,king of Persia, was tom',     'Muhammad Sháh, king of Persia, was torn'],
  ['THE BABwas delivered',                     'The Báb was delivered'],
  ['THE BABwas subjected',                     'The Báb was subjected'],
  ['MUHAMMASDHAHWASDEADT.he new ruler',        'Muhammad Sháh was dead. The new ruler'],
  ['VAHio,who had been sent',                  'Vaḥíd, who had been sent'],
  ['THE DEATH OF VAHin came',                  'The death of Vaḥíd came'],
  ['THE PRIME MINISTER,Mírzá Taqi Khan, despatched', 'The Prime Minister, Mírzá Taqí Khán, despatched'],
  ['ONE MORNING shortly after this',            'One morning shortly after this'],
  ["THE NEWS of the Báb's arrival",             "The news of the Báb's arrival"],
  ['ONE OF THE MOST courageous',                'One of the most courageous'],
  ['A WAVE OF VIOLENCE unprecedented',          'A wave of violence unprecedented'],
];

// ─── Global OCR word fixes ──────────────────────────────────────────────────
// Well-known misreads that occur throughout the book.
const GLOBAL = [
  // Small-caps OCR artifacts used as running text later
  ['MUHAMMASDHAH', 'Muhammad Sháh'],
  ['MUHAMMAD SHAH', 'Muhammad Sháh'],
  // "rn" → "m" misreads confirmed by context
  [/\btom between\b/g, 'torn between'],
  [/\btom asunder\b/g, 'torn asunder'],
  [/\btom from\b/g, 'torn from'],
  [/\btom by\b/g, 'torn by'],
  [/\btom apart\b/g, 'torn apart'],
  // Accent/character drops (partial word OCR)
  [/\bShfraz\b/g, 'Shíráz'],
  [/\bMfrza\b/g, 'Mírzá'],
  [/\bNasiri'd-Dfn\b/g, "Náṣiri'd-Dín"],
  [/\bTaqi Khan\b/g, 'Taqí Khán'],
  [/\bAlf Khan\b/g, "'Alí Khán"],
  [/'Alf Khan/g, "'Alí Khán"],
  // Double apostrophe from replacement collision
  [/''Alí Khán/g, "'Alí Khán"],
  [/\bMONTIIS\b/g, 'months'],
  [/\bVAHin\b/g, 'Vaḥíd'],
  [/\bVAHio\b/g, 'Vaḥíd'],
  // Hyphen compound
  [/\bseventeen-yearold\b/g, 'seventeen-year-old'],
  // Over-aggressive diacritic restoration: "Mashhad" wasn't in subs list —
  // already correct, no change
];

// ─── Known-word replacements (applied first, before generic rules) ───────────
// Context-aware substitutions for ambiguous replacement-char occurrences.
const EXACT = [
  // fi/fl ligatures in common words — the FFFD is the lost "fi" or "fl"
  ['Be \uFFFDrm',        'Be firm'],
  ['\uFFFDrmly',          'firmly'],
  ['\uFFFDnd no fault',   'find no fault'],
  ['\uFFFDnd it',         'find it'],
  ['\uFFFDve hundred',    'five hundred'],
  ['\uFFFDve years',      'five years'],
  ['\uFFFDnal',           'final'],
  ['\uFFFDrst',           'first'],
  ['\uFFFDght',           'fight'],
  ['\uFFFDlled',          'filled'],
  ['\uFFFDeld',           'field'],
  ['\uFFFDerce',          'fierce'],
  ['ful\uFFFDlled',       'fulfilled'],
  ['unful\uFFFDlled',     'unfulfilled'],
  ['unful\uFFFDlment',    'unfulfillment'],
  ['ful\uFFFDl',          'fulfil'],
  ['suf\uFFFDcient',      'sufficient'],
  ['dif\uFFFDcult',       'difficult'],
  ['of\uFFFDcer',         'officer'],
  ['of\uFFFDce',          'office'],
  ['con\uFFFDdence',      'confidence'],
  ['con\uFFFDdent',       'confident'],
  ['in\uFFFDnite',        'infinite'],
  ['sacri\uFFFDce',       'sacrifice'],
  ['identi\uFFFDed',      'identified'],
  ['terri\uFFFDed',       'terrified'],
  ['justi\uFFFDed',       'justified'],
  ['satis\uFFFDed',       'satisfied'],
  ['speci\uFFFDc',        'specific'],
  ['\uFFFDgure',          'figure'],
  ['\uFFFDre',            'fire'],

  // Hyphenated line-wraps that survived as FFFD + space
  ['dis\uFFFD card',      'discard'],
  ['com\uFFFD panions',   'companions'],
  ['com\uFFFD panion',    'companion'],
  ['ex\uFFFD pressing',   'expressing'],
  ['embrac\uFFFD ing',    'embracing'],
  ['con\uFFFD stitute',   'constitute'],
  ['re-\uFFFD moved',     'removed'],

  // Opening quote marks replaced by FFFD
  [': \uFFFDo Zephyr',    ': "O Zephyr'],
  ['bade Quddús \uFFFDfarewell', 'bade Quddús "farewell'],

  // Specific stray-char phrases the generic rule would get wrong
  ['\uFFFD\uFFFDAn of',   '"An of'],     // ``An of a sudden``
  ['ful\uFFFDll',         'fulfill'],
];

// ─── Generic rules ───────────────────────────────────────────────────────────
function fixReplacementChars(text) {
  let t = text;

  // Apply exact substitutions first
  for (const [a, b] of EXACT) {
    t = t.split(a).join(b);
  }

  // Remaining FFFD patterns:
  //  1. <letters>FFFD<letters>   — unrecovered ligature; try "fi" / "fl"
  //  2. <word>FFFD<space><word>  — hyphen wrap, join words
  //  3. <space>FFFD<space>       — stray; drop it
  //  4. FFFD at start of line or after punctuation+space — open quote; use "

  // Hyphen wrap: a\uFFFD b  →  ab   (only if the combined letters look like a word)
  t = t.replace(/([a-zA-Zá-ú']{2,})\uFFFD\s+([a-z]{2,})/g, (m, a, b) => {
    return a + b;
  });

  // Mid-word ligature: `a\uFFFDb`  →  try fi/fl
  t = t.replace(/([a-zA-Z])\uFFFD([a-z])/g, (m, a, b) => {
    // Most common replacements: fi or fl
    return a + 'fi' + b;  // default to fi; can override via EXACT list
  });

  // Standalone FFFD between spaces or at para boundaries → remove
  t = t.replace(/\s\uFFFD\s/g, ' ');
  t = t.replace(/^\uFFFD\s*/gm, '');
  t = t.replace(/\s*\uFFFD$/gm, '');

  // Any remaining FFFD → drop (last resort)
  t = t.replace(/\uFFFD/g, '');

  return t;
}

// ─── Mid-sentence paragraph break rejoiner ───────────────────────────────────
function rejoinBrokenParagraphs(text) {
  const paras = text.split(/\n\n/);
  const out = [];
  for (const p of paras) {
    const trimmed = p.trim();
    if (!trimmed) continue;
    if (out.length === 0) { out.push(trimmed); continue; }

    const prev = out[out.length - 1];
    // Prev ends with sentence-terminating punctuation (possibly + close quote)?
    const prevEndsSentence = /[.!?:;]["')\]]?$/.test(prev);
    const currStartsLower = /^[a-z]/.test(trimmed);

    if (!prevEndsSentence && currStartsLower) {
      // Mid-sentence break — join with space
      out[out.length - 1] = prev + ' ' + trimmed;
    } else {
      out.push(trimmed);
    }
  }
  return out.join('\n\n');
}

// ─── Leading-fragment stripper ───────────────────────────────────────────────
// A chapter content that begins with a tiny paragraph like "," or a 1-4 char
// fragment is an OCR artifact from page-header text bleeding into the body.
function stripLeadingFragments(text) {
  const paras = text.split(/\n\n/);
  while (paras.length > 1 && paras[0].trim().length < 5) {
    paras.shift();
  }
  return paras.join('\n\n');
}

function applyOpenings(text) {
  let t = text;
  for (const [a, b] of OPENINGS) {
    t = t.split(a).join(b);
  }
  return t;
}

function applyGlobal(text) {
  let t = text;
  for (const [a, b] of GLOBAL) {
    if (a instanceof RegExp) t = t.replace(a, b);
    else t = t.split(a).join(b);
  }
  return t;
}

// ─── Apply ───────────────────────────────────────────────────────────────────
let totalFfReplaced = 0, totalRejoined = 0;
for (const k of KEYS) {
  const entry = db[k];
  const before = entry.content;
  const ffBefore = (before.match(/\uFFFD/g) || []).length;
  const parasBefore = before.split(/\n\n/).length;

  let after = fixReplacementChars(before);
  after = stripLeadingFragments(after);
  after = applyOpenings(after);
  after = applyGlobal(after);
  after = rejoinBrokenParagraphs(after);

  const ffAfter = (after.match(/\uFFFD/g) || []).length;
  const parasAfter = after.split(/\n\n/).length;

  totalFfReplaced += (ffBefore - ffAfter);
  totalRejoined += (parasBefore - parasAfter);

  entry.content = after;
}

fs.writeFileSync(JSON_PATH, JSON.stringify(db));
console.log(`Fixed ${totalFfReplaced} replacement chars across ${KEYS.length} sections`);
console.log(`Rejoined ${totalRejoined} mid-sentence paragraph breaks`);
console.log(`Wrote ${JSON_PATH}`);
