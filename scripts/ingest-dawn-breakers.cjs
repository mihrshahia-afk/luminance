/*
  Ingest The Dawn-Breakers from dawn-breakers-utf8.txt (converted from
  ISO-8859-1 PDF output). Splits into Introduction + 26 chapters +
  Epilogue, restores underdotted diacritics, writes to
  src/data/books/dawn-breakers.json.
*/
const fs = require('fs');
const path = require('path');

const TXT = path.join(__dirname, 'dawn-breakers-utf8.txt');
const OUT = path.join(__dirname, '..', 'src', 'data', 'books', 'dawn-breakers.json');

const raw = fs.readFileSync(TXT, 'utf8');
const lines = raw.split(/\r?\n/);

const CHAPTER_TITLES = {
  'I': 'The Mission of Shaykh Aḥmad-i-Aḥsá\'í',
  'II': 'The Mission of Siyyid Káẓim-i-Rashtí',
  'III': 'The Declaration of the Báb\'s Mission',
  'IV': 'Mullá Ḥusayn\'s Journey to Ṭihrán',
  'V': 'Bahá\'u\'lláh\'s Journey to Mázindarán',
  'VI': 'Mullá Ḥusayn\'s Journey to Khurásán',
  'VII': 'The Báb\'s Pilgrimage to Mecca and Medina',
  'VIII': 'The Báb\'s Stay in Shíráz After the Pilgrimage',
  'IX': 'The Báb\'s Stay in Shíráz After the Pilgrimage (Continued)',
  'X': 'The Báb\'s Sojourn in Iṣfáhán',
  'XI': 'The Báb\'s Stay in Káshán',
  'XII': 'The Báb\'s Journey from Káshán to Tabríz',
  'XIII': 'The Báb\'s Incarceration in the Castle of Máh-Kú',
  'XIV': 'Mullá Ḥusayn\'s Journey to Mázindarán',
  'XV': 'Ṭáhirih\'s Journey from Karbilá to Khurásán',
  'XVI': 'The Conference of Badasht',
  'XVII': 'The Báb\'s Incarceration in the Castle of Chihríq',
  'XVIII': 'Examination of the Báb at Tabríz',
  'XIX': 'The Mázindarán Upheaval',
  'XX': 'The Mázindarán Upheaval (Continued)',
  'XXI': 'The Seven Martyrs of Ṭihrán',
  'XXII': 'The Nayríz Upheaval',
  'XXIII': 'Martyrdom of the Báb',
  'XXIV': 'The Zanján Upheaval',
  'XXV': 'Bahá\'u\'lláh\'s Journey to Karbilá',
  'XXVI': 'Attempt on the Sháh\'s Life, and Its Consequences',
};

// Find chapter start lines
const chapterStarts = {};
const introStart = lines.findIndex(l => l.trim() === 'INTRODUCTION');
let epilogueStart = -1;

for (let i = 0; i < lines.length; i++) {
  const l = lines[i].trim();
  const m = l.match(/^CHAPTER ([IVXL]+):/);
  if (m && !chapterStarts[m[1]]) {
    // Skip TOC entries — real chapters come after the TOC
    if (i > 100) chapterStarts[m[1]] = i;
  }
  if (l === 'EPILOGUE' && i > 3000) epilogueStart = i;
}

// Find end of book content (before APPENDIX/GLOSSARY)
let bookEnd = lines.length;
for (let i = epilogueStart + 1; i < lines.length; i++) {
  if (/^APPENDIX:|^WORKS CONSULTED|^GLOSSARY\b/.test(lines[i].trim())) {
    bookEnd = i;
    break;
  }
}

// Diacritics restoration — the PDF encoded accented chars (á,í,ú) correctly
// but dropped underdotted chars (Ḥ,Ṭ,Ṣ,Ẓ). Restore via context.
function restoreDiacritics(text) {
  let t = text;
  const subs = [
    // Underdotted chars dropped from word starts
    [/\busayn\b/g, 'Ḥusayn'],
    [/\bUSAYN\b/g, 'ḤUSAYN'],
    [/\bájí\b/g, 'Ḥájí'],
    [/\bÁJÍ\b/g, 'ḤÁJÍ'],
    [/\bujjat\b/g, 'Ḥujjat'],
    [/\basan\b/g, 'Ḥasan'],
    [/\babíb\b/g, 'Ḥabíb'],
    [/\bihrán\b/g, 'Ṭihrán'],
    [/\bIHRÁN\b/g, 'ṬIHRÁN'],
    [/\báhirih\b/g, 'Ṭáhirih'],
    [/\bÁHIRIH\b/g, 'ṬÁHIRIH'],
    [/\babarsí\b/g, 'Ṭabarsí'],
    [/\bABARSÍ\b/g, 'ṬABARSÍ'],
    [/\bIfáhán\b/g, 'Iṣfáhán'],
    [/\bIFÁHÁN\b/g, 'IṢFÁHÁN'],
    [/\bádiq\b/g, 'Ṣádiq'],
    [/\búfí\b/g, 'Ṣúfí'],
    [/\badr\b/g, 'Ṣadr'],
    [/\buammad\b/g, 'Muḥammad'],
    [/\bUAMMAD\b/g, 'MUḤAMMAD'],
    [/\bAmad\b/g, 'Aḥmad'],
    [/\bAMAD\b/g, 'AḤMAD'],
    [/\bAhsá'í/g, 'Aḥsá\'í'],
    // Place names
    [/\bKázim\b/g, 'Káẓim'],
    [/\bKÁZIM\b/g, 'KÁẒIM'],
    [/\bZunúzí\b/g, 'Zunúzí'],
    // Common words
    [/\bMullá\b/g, 'Mullá'],
    [/\bMírzá\b/g, 'Mírzá'],
    [/\bMÍRZÁ\b/g, 'MÍRZÁ'],
    [/\bSháh\b/g, 'Sháh'],
    [/\bSHÁH\b/g, 'SHÁH'],
    [/\bKhán\b/g, 'Khán'],
    [/\bQur'án\b/g, 'Qur\'án'],
    [/\bIslám\b/g, 'Islám'],
    // The n-tilde issue (lowercase n at end of place names, e.g. KASHÁn → Káshán)
    [/\bKASHÁn\b/g, 'KÁSHÁN'],
  ];

  for (const [pattern, replacement] of subs) {
    t = t.replace(pattern, replacement);
  }

  // Remove page markers like "Page 42" at line starts
  t = t.replace(/^\d+\s*$/gm, '');

  // Remove form feed chars
  t = t.replace(/\f/g, '');
  // Remove ^L Page N lines
  t = t.replace(/^\x0CPage \d+\s*$/gm, '');
  t = t.replace(/^Page \d+\s*$/gm, '');

  // Collapse blank lines
  t = t.replace(/\n{3,}/g, '\n\n');

  return t.trim();
}

function extractSection(startLine, endLine) {
  const slice = lines.slice(startLine, endLine).join('\n');
  return restoreDiacritics(slice);
}

const sections = [];

// Introduction
if (introStart > 0) {
  const firstChapterNum = Object.keys(chapterStarts)[0];
  const introEnd = chapterStarts[firstChapterNum];
  sections.push({
    urlSegment: 'intro',
    title: 'Introduction',
    content: extractSection(introStart, introEnd),
  });
}

// 26 Chapters
const nums = Object.keys(chapterStarts);
for (let i = 0; i < nums.length; i++) {
  const num = nums[i];
  const start = chapterStarts[num];
  const end = (i < nums.length - 1) ? chapterStarts[nums[i + 1]]
    : (epilogueStart > 0 ? epilogueStart : bookEnd);
  sections.push({
    urlSegment: String(i + 1),
    title: `${num}. ${CHAPTER_TITLES[num] || num}`,
    content: extractSection(start, end),
  });
}

// Epilogue
if (epilogueStart > 0) {
  sections.push({
    urlSegment: 'epilogue',
    title: 'Epilogue',
    content: extractSection(epilogueStart, bookEnd),
  });
}

// Build JSON
const db = {};
db.__chapters = sections.map(s => ({
  id: `dawn-breakers-${s.urlSegment}`,
  title: s.title,
  urlSegment: s.urlSegment,
}));

for (const s of sections) {
  db[s.urlSegment] = { title: s.title, content: s.content };
}

fs.writeFileSync(OUT, JSON.stringify(db));
console.log(`Ingested ${sections.length} sections of The Dawn-Breakers.`);
for (const s of sections) {
  console.log(`  ${s.urlSegment.padEnd(10)} ${s.title.padEnd(60)} ${s.content.length} chars`);
}
