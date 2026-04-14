/*
  Ingest "Release the Sun" by William Sears from the layout-preserved
  pdftotext output at scripts/release-the-sun.txt. Splits into
  Foreword + Prologue + 19 chapters, cleans OCR artifacts, restores
  diacritics on the book's core proper nouns, rebuilds paragraphs,
  then merges entries into src/data/bookContent.json under
  release-the-sun/<n> and release-the-sun/__chapters.
*/
const fs = require('fs');
const path = require('path');

const TXT = path.join(__dirname, 'release-the-sun.txt');
const OUT_JSON = path.join(__dirname, '..', 'src', 'data', 'bookContent.json');

const raw = fs.readFileSync(TXT, 'utf8');
const lines = raw.split('\n');

// ─── Locate section boundaries ────────────────────────────────────────────────
const CHAPTER_WORDS = [
  'ONE','TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE','TEN',
  'ELEVEN','TWELVE','THIRTEEN','FOURTEEN','FIFTEEN','SIXTEEN','SEVENTEEN',
  'EIGHTEEN','NINETEEN',
];

const CHAPTER_TITLES = [
  'The Promise of the Messiah',
  'The Search Begins',
  'The Promise Is Fulfilled',
  'The Pilgrimage and the Proclamation',
  'The Persecution Begins',
  'The Gentle Arrest',
  "The Enchantment of the King's Messenger",
  'The Avenging Hand of God',
  'The Kindly Governor',
  "The King's Summons",
  'The Tumult in Tabríz',
  'The High Stone Prison',
  'The Scourging at Tabríz',
  'The Massacre at Fort Shaykh Ṭabarsí',
  'A Wonder Among Women',
  'The Death of the Wisest Persian',
  'The Seven Heroes of Ṭihrán',
  'The Dawn and the Sun',
  'The Martyrdom of the Báb',
];

function findChapterStarts() {
  const starts = new Array(CHAPTER_WORDS.length).fill(null);
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    const m = l.match(/^CHAPTER\s+([A-Z]+)$/);
    if (!m) continue;
    const idx = CHAPTER_WORDS.indexOf(m[1]);
    if (idx >= 0 && starts[idx] === null) starts[idx] = i;
  }
  return starts;
}

const chapterStarts = findChapterStarts();

let forewordStart = -1, prologueStart = -1;
for (let i = 0; i < chapterStarts[0]; i++) {
  const l = lines[i].trim();
  if (l === 'FOREWORD' && forewordStart === -1) forewordStart = i;
  if (l === 'PROLOGUE' && prologueStart === -1) prologueStart = i;
}

// Chapter 19 ends when we hit APPENDIX or REFERENCES
let chapter19End = lines.length;
for (let i = chapterStarts[18] + 1; i < lines.length; i++) {
  const l = lines[i].trim();
  if (l === 'APPENDIX' || l === 'REFERENCES' || /^AP\s*PEN\s*DIX\b/i.test(l) || /^REFERENCES\b/i.test(l)) {
    chapter19End = i;
    break;
  }
}

// ─── Per-section cleanup + paragraph rebuild ──────────────────────────────────
function rebuildParagraphs(rawLines) {
  // Strip layout artifacts: isolated page numbers, running headers, chapter
  // title repeats. Keep blank lines (paragraph separators). An "indented"
  // line (2+ leading spaces, non-blank) marks the start of a new paragraph.
  const cleaned = [];
  for (const l of rawLines) {
    const trimmed = l.trim();
    if (!trimmed) { cleaned.push(''); continue; }
    if (/^\d+$/.test(trimmed)) continue;
    if (trimmed === 'RELEASE THE SUN') continue;
    // Running header variants: "4  RELEASE THE SUN", "RELEASE THE SUN  4", etc.
    if (/^\d+\s+RELEASE\s+THE\s+SUN\s*\d*$/i.test(trimmed)) continue;
    if (/^RELEASE\s+THE\s+SUN\s+\d+$/i.test(trimmed)) continue;
    // Running header chapter-title repeat: short all-caps line with optional page number
    if (/^[A-Z][A-Z '\-.]{2,55}\s*\d*$/.test(trimmed) && !trimmed.includes('"')) continue;
    // Page number + all-caps chapter title header (e.g. "22  THE SEARCH BEGINS")
    if (/^\d+\s+[A-Z][A-Z '\-.]{2,55}$/.test(trimmed) && !trimmed.includes('"')) continue;
    cleaned.push(l);
  }

  // Now group into paragraphs: a new para starts on a blank line or on a
  // line whose first non-space character position is > 0 AND the prior line
  // was non-blank & appears to end a sentence. Simplest robust heuristic:
  // blank-line = paragraph separator. Join all non-blank lines with a space.
  const paras = [];
  let buf = [];
  for (const l of cleaned) {
    if (l.trim() === '') {
      if (buf.length) { paras.push(buf.join(' ')); buf = []; }
    } else {
      buf.push(l.trim());
    }
  }
  if (buf.length) paras.push(buf.join(' '));

  // Split paragraphs that visibly contain multiple indented starts within a
  // layout block — rare in reflow, unnecessary here.

  return paras;
}

function applyOcrFixes(text) {
  let t = text;

  t = t
    // Hyphenated line-wrap joins: "au- thorities" → "authorities"
    .replace(/([a-zA-Zá-ú])- ([a-z])/g, '$1$2')
    // Stray " 0 " used as "O" before a space + capital letter
    .replace(/(^|[\s(])0 ([A-Z])/g, '$1O $2')
    // "B.AB" → "Báb"
    .replace(/\bB\.AB\b/g, 'Báb')
    // "11:essenger" → "Messenger" (OCR'd M: misread)
    .replace(/\b11:essenger\b/g, 'Messenger')
    // rn→m misreads
    .replace(/\bmodem\b/g, 'modern')
    .replace(/\bcomer\b/g, 'corner')
    .replace(/\bcomers\b/g, 'corners')
    // tilde artifacts from ligatures
    .replace(/([a-z])~([a-z])/g, '$1$2')
    // Backtick-double and stray
    .replace(/``/g, '"').replace(/''/g, '"')
    // Musi.c / b.ar style intra-word dots (only between two lowercase letters, rare)
    .replace(/([a-z])\.([a-z])\b/g, '$1$2');

  // Restore diacritics for proper nouns that appear repeatedly in the book.
  const subs = [
    ['Baha\'u\'llah', 'Bahá\'u\'lláh'],
    ['Baha\'i', 'Bahá\'í'],
    ['Abdu\'l-Baha', '\u2018Abdu\'l-Bahá'],
    ['Bab', 'Báb'],
    ['BAB', 'BÁB'],
    ['Mulla', 'Mullá'],
    ['Husayn', 'Ḥusayn'],
    ['Quddus', 'Quddús'],
    ['Tahirih', 'Ṭáhirih'],
    ['Vahid', 'Vaḥíd'],
    ['Hujjat', 'Ḥujjat'],
    ['Tabriz', 'Tabríz'],
    ['TABRIZ', 'TABRÍZ'],
    ['Tihran', 'Ṭihrán'],
    ['TIHRAN', 'ṬIHRÁN'],
    ['Isfahan', 'Iṣfahán'],
    ['Shiraz', 'Shíráz'],
    ['Karbila', 'Karbilá'],
    ['Mazindaran', 'Mázindarán'],
    ['Khurasan', 'Khurásán'],
    ['Adhirbayjan', 'Ádhirbáyján'],
    ['Nasiri\'d-Din', 'Náṣiri\'d-Dín'],
    ['Muhammad Shah', 'Muḥammad Sháh'],
    ['Nasiri\'d-Din Shah', 'Náṣiri\'d-Dín Sháh'],
    ['Shaykh Ahmad', 'Shaykh Aḥmad'],
    ['Siyyid Kazim', 'Siyyid Káẓim'],
    ['Siyyid Ali-Muhammad', 'Siyyid \u2018Alí-Muḥammad'],
    ['Chihriq', 'Chihríq'],
    ['Mah-Ku', 'Máh-Kú'],
    ['Tabarsi', 'Ṭabarsí'],
    ['Nayriz', 'Nayríz'],
    ['Zanjan', 'Zanján'],
    ['Mirza', 'Mírzá'],
    ['Aqa', 'Áqá'],
    ['Hajji', 'Ḥájí'],
    ['Haji', 'Ḥájí'],
    ['Qa\'im', 'Qá\'im'],
    ['Qur\'an', 'Qur\'án'],
    ['Islam', 'Islám'],
  ];

  for (const [plain, accented] of subs) {
    const esc = plain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    t = t.replace(new RegExp(`\\b${esc}\\b`, 'g'), accented);
  }

  // Remove trailing footnote digit markers. Covers: `word." 3`, `word.3`,
  // `word. 3` mid-para, `word.' 0`, `word.) 0`, `word. 0` at end of para.
  t = t
    .replace(/([.!?])["']\s+\d{1,2}(?=\s|$)/g, m => m.replace(/\s+\d{1,2}$/, ''))
    .replace(/([.!?])\)\s+\d{1,2}(?=\s|$)/g, '$1)')
    .replace(/([a-záíúéèñçṭḥẓšž])\.\d{1,2}(?=\s|$)/gi, '$1.')
    .replace(/([.!?])\s+\d{1,2}(?=\s+[A-Z"'])/g, '$1')
    .replace(/([.!?])\s+\d{1,2}$/g, '$1')
    // Close-quote followed by lone footnote digit mid-sentence: `"word" 3 more` → `"word" more`
    .replace(/(["'])\s+\d{1,2}(?=\s+[a-z])/g, '$1');

  return t;
}

function cleanSection(startLine, endLine, skipHeadingLines) {
  let i = startLine + (skipHeadingLines || 0);
  // Skip over additional blank lines right after the CHAPTER heading + title
  while (i < endLine && (lines[i].trim() === '' || /^[A-Z][A-Z '\-.]{2,55}$/.test(lines[i].trim()))) i++;
  const slice = lines.slice(i, endLine);
  const paras = rebuildParagraphs(slice);
  return paras.map(applyOcrFixes).filter(p => p.length > 0).join('\n\n');
}

const sections = [];

if (forewordStart !== -1) {
  const end = prologueStart !== -1 ? prologueStart : chapterStarts[0];
  sections.push({
    urlSegment: 'foreword',
    title: 'Foreword',
    content: cleanSection(forewordStart + 1, end, 0),
  });
}

if (prologueStart !== -1) {
  sections.push({
    urlSegment: 'prologue',
    title: 'Prologue',
    content: cleanSection(prologueStart + 1, chapterStarts[0], 0),
  });
}

for (let i = 0; i < chapterStarts.length; i++) {
  const start = chapterStarts[i];
  if (start == null) { console.warn(`! Chapter ${i + 1} not found`); continue; }
  const end = (i === chapterStarts.length - 1) ? chapter19End : chapterStarts[i + 1];
  // Skip the "CHAPTER ONE" line (1 line) + title line(s)
  sections.push({
    urlSegment: String(i + 1),
    title: `${i + 1}. ${CHAPTER_TITLES[i]}`,
    content: cleanSection(start + 1, end, 0),
  });
}

// ─── Merge into bookContent.json ──────────────────────────────────────────────
const db = JSON.parse(fs.readFileSync(OUT_JSON, 'utf8'));

db['release-the-sun/__chapters'] = sections.map(s => ({
  id: `release-the-sun-${s.urlSegment}`,
  title: s.title,
  urlSegment: s.urlSegment,
}));

for (const s of sections) {
  db[`release-the-sun/${s.urlSegment}`] = { title: s.title, content: s.content };
}

fs.writeFileSync(OUT_JSON, JSON.stringify(db));
console.log(`Ingested ${sections.length} sections of Release the Sun.`);
for (const s of sections) {
  console.log(`  ${s.urlSegment.padEnd(10)} ${s.title.padEnd(50)} ${s.content.length} chars`);
}
