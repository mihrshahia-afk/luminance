/*
  Ingest "Release the Sun" by William Sears from PDF using pdfjs-dist.

  This replaces the old pdftotext pipeline which suffered from U+FFFD chars,
  mangled small-caps, broken diacritics, and running-header contamination.
  pdfjs-dist extracts Unicode directly from the PDF, preserving diacritics.

  Output: public/books/release-the-sun.json  (new version)
          public/books/release-the-sun.OLD.json  (backup of previous)

  Usage: node scripts/ingest-release-the-sun-v2.mjs
*/
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDF_PATH = path.join(__dirname, 'release-the-sun.pdf');
const OUT_DIR = path.join(__dirname, '..', 'public', 'books');
const OUT_JSON = path.join(OUT_DIR, 'release-the-sun.json');
const BACKUP_JSON = path.join(OUT_DIR, 'release-the-sun.OLD.json');

// ─── Chapter boundaries (PDF page numbers, 1-indexed) ────────────────────────
// Discovered by scanning the PDF for "CHAPTER <WORD>" patterns.
// Each section runs from its start page up to (but not including) the next
// section's start page.
const SECTIONS = [
  { key: 'foreword', title: 'Foreword',                                   startPage: 4 },
  { key: 'prologue', title: 'Prologue',                                   startPage: 8 },
  { key: '1',  title: '1. The Promise of the Messiah',                    startPage: 10 },
  { key: '2',  title: '2. The Search Begins',                             startPage: 17 },
  { key: '3',  title: '3. The Promise Is Fulfilled',                      startPage: 25 },
  { key: '4',  title: '4. The Pilgrimage and the Proclamation',           startPage: 30 },
  { key: '5',  title: '5. The Persecution Begins',                        startPage: 33 },
  { key: '6',  title: '6. The Gentle Arrest',                             startPage: 37 },
  { key: '7',  title: "7. The Enchantment of the King's Messenger",       startPage: 42 },
  { key: '8',  title: '8. The Avenging Hand of God',                      startPage: 51 },
  { key: '9',  title: '9. The Kindly Governor',                           startPage: 58 },
  { key: '10', title: "10. The King's Summons",                           startPage: 64 },
  { key: '11', title: '11. The Tumult in Tabríz',                         startPage: 69 },
  { key: '12', title: '12. The High Stone Prison',                        startPage: 73 },
  { key: '13', title: '13. The Scourging at Tabríz',                      startPage: 79 },
  { key: '14', title: '14. The Massacre at the Fort of Shaykh Ṭabarsí',   startPage: 89 },
  { key: '15', title: '15. A Wonder among Women',                         startPage: 110 },
  { key: '16', title: '16. The Death of the Wisest Persian',              startPage: 128 },
  { key: '17', title: '17. The Seven Heroes of Ṭihrán',                   startPage: 141 },
  { key: '18', title: '18. The Dawn and the Sun',                         startPage: 149 },
  { key: '19', title: '19. The Martyrdom of the Báb',                     startPage: 173 },
];
// Content ends when Appendix/Glossary/References begin
const CONTENT_END_PAGE = 196; // p196 = APPENDIX start

// ─── Per-page text extraction with paragraph detection ───────────────────────

async function extractPageLines(doc, pageNum) {
  const page = await doc.getPage(pageNum);
  const tc = await page.getTextContent();

  // Sort text items top-to-bottom, left-to-right
  const items = tc.items
    .filter(item => item.str && item.str.trim())
    .sort((a, b) => {
      const yDiff = b.transform[5] - a.transform[5]; // higher y = higher on page
      if (Math.abs(yDiff) > 2) return yDiff;
      return a.transform[4] - b.transform[4]; // left to right
    });

  if (!items.length) return [];

  // Group into lines by y-position, tracking the first-item x position
  const lineGroups = [];
  let currentLine = [];
  let lastY = null;

  for (const item of items) {
    const y = Math.round(item.transform[5] * 10) / 10;
    if (lastY !== null && Math.abs(y - lastY) > 2) {
      lineGroups.push(currentLine);
      currentLine = [];
    }
    currentLine.push(item);
    lastY = y;
  }
  if (currentLine.length) lineGroups.push(currentLine);

  // Build structured lines: { text, firstX, y }
  return lineGroups.map(lineItems => {
    let text = '';
    for (let i = 0; i < lineItems.length; i++) {
      const item = lineItems[i];
      if (i > 0) {
        const prevItem = lineItems[i - 1];
        const prevEnd = prevItem.transform[4] + (prevItem.width || 0);
        const gap = item.transform[4] - prevEnd;
        if (gap > 1.5) text += ' ';
      }
      text += item.str;
    }
    return {
      text,
      firstX: lineItems[0].transform[4],
      y: lineItems[0].transform[5],
    };
  });
}

function buildParagraphsFromLines(structuredLines) {
  // Detect paragraph boundaries using first-line indentation.
  // The book uses indented first lines (~12-15 units right of left margin).
  // Find the left margin (most common x position)
  const xValues = structuredLines
    .filter(l => l.text.trim().length > 10) // skip short lines (page numbers, headers)
    .map(l => Math.round(l.firstX));

  if (!xValues.length) return structuredLines.map(l => l.text).join(' ');

  // Left margin = the most frequent x value among body lines
  const xCounts = {};
  for (const x of xValues) { xCounts[x] = (xCounts[x] || 0) + 1; }
  const marginX = Number(Object.entries(xCounts).sort((a, b) => b[1] - a[1])[0][0]);

  // A line is "indented" if its firstX is > marginX + 8
  // (threshold accounts for slight variations in margin position)
  const INDENT_THRESHOLD = 8;

  const paragraphs = [];
  let currentPara = [];

  for (const line of structuredLines) {
    const trimmed = line.text.trim();
    if (!trimmed) continue;

    const isIndented = line.firstX > marginX + INDENT_THRESHOLD;

    if (isIndented && currentPara.length > 0) {
      // Start of a new paragraph
      paragraphs.push(currentPara.join(' '));
      currentPara = [trimmed];
    } else {
      currentPara.push(trimmed);
    }
  }
  if (currentPara.length) paragraphs.push(currentPara.join(' '));

  return paragraphs;
}

// ─── Text cleaning ───────────────────────────────────────────────────────────

function cleanSectionText(rawText, sectionKey) {
  let lines = rawText.split('\n');
  const cleaned = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { cleaned.push(''); continue; }

    // Skip standalone page numbers (1-3 digits alone on a line)
    if (/^\d{1,3}$/.test(trimmed)) continue;

    // Skip running headers: "RELEASE THE SUN" or "N RELEASE THE SUN"
    if (/^(\d+\s+)?RELEASE\s+THE\s+SUN(\s+\d+)?$/i.test(trimmed)) continue;
    if (trimmed === 'RELEASE THE SUN') continue;

    // Skip chapter-title running headers (all-caps lines that match known patterns)
    // These are short all-caps lines at top/bottom of pages
    if (/^(THE\s+)?[A-Z][A-Z '\-,.]{4,55}\s*\d*$/.test(trimmed) &&
        !trimmed.includes('"') && !trimmed.includes("'") &&
        trimmed.length < 60 &&
        // But don't strip lines that are clearly body text (contain lowercase)
        trimmed === trimmed.toUpperCase()) {
      continue;
    }

    // Skip "CHAPTER <WORD>" header lines
    if (/^CHAPTER\s+(ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|ELEVEN|TWELVE|THIRTEEN|FOURTEEN|FIFTEEN|SIXTEEN|SEVENTEEN|EIGHTEEN|NINETEEN)/i.test(trimmed)) continue;

    // Skip chapter title lines that appear right after CHAPTER header
    // (these are the known chapter titles in all caps or title case)
    // We keep the body text

    cleaned.push(trimmed);
  }

  // Build paragraphs: blank lines = paragraph separators
  const paras = [];
  let buf = [];
  for (const line of cleaned) {
    if (line === '') {
      if (buf.length) { paras.push(buf.join(' ')); buf = []; }
    } else {
      buf.push(line);
    }
  }
  if (buf.length) paras.push(buf.join(' '));

  return paras;
}

function applyTextFixes(text) {
  let t = text;

  // Fix hyphenated line-wrap joins: "au- thorities" → "authorities"
  t = t.replace(/([a-zA-Zá-úÁ-Ú])- ([a-z])/g, '$1$2');

  // Collapse multiple spaces
  t = t.replace(/ {2,}/g, ' ');

  // Remove stray U+FFFD (shouldn't be many with pdfjs-dist)
  t = t.replace(/\uFFFD/g, '');

  // Fix stray footnote/page number artifacts: "text\n\n1 0\n\nmore text"
  // These are page numbers or footnote markers that leaked into body text
  t = t.replace(/\n\n\d{1,2}\s+\d{1,2}\n\n/g, '\n\n');
  t = t.replace(/\n\n\d{1,2}\n\n/g, '\n\n');
  // Inline: "the West 1 0 were" → "the West were"
  t = t.replace(/(\w)\s+\d{1,2}\s+\d{1,2}\s+(\w)/g, '$1 $2');

  // Fix common PDF extraction artifacts
  // "11:essenger" → "Messenger" (M misread as "11:")
  t = t.replace(/\b11:essenger\b/g, 'Messenger');
  // "modem" → "modern" (rn→m misread)
  t = t.replace(/\bmodem\b/g, 'modern');
  t = t.replace(/\bModem\b/g, 'Modern');

  // Fix run-together words caused by missing spaces in PDF text
  // e.g., "ofShiraz" → "of Shiraz", "theexpected" → "the expected"
  // Insert space before capital letter that follows a lowercase letter
  // Also handle diacritic chars (ḥ, á, í, etc.)
  t = t.replace(/([a-záéíóúàèìòùâêîôûäëïöüçñṭḥẓṣḍ])([A-ZÁÉÍÓÚ][a-záéíóú])/g, '$1 $2');
  // Also: "Ḥusaynwas" → "Ḥusayn was" (diacritic uppercase followed by lowercase word)
  t = t.replace(/([\u1E00-\u1EFF])([a-z]{2,})/g, (m, a, b) => {
    // Only split if b looks like a common word start
    if (/^(was|is|had|has|have|in|at|on|to|of|and|the|his|her|him|came|went|said|told|who|whom|which|that|from|with|into|for|not|but|or|nor|may|can|will|shall|did|does|do|be|been|being|are|were|am|would|could|should|might)/.test(b)) {
      return a + ' ' + b;
    }
    return m;
  });

  // Fix "Itwas" "Itbegan" etc. (common with small-caps first words)
  t = t.replace(/\bItwas\b/g, 'It was');
  t = t.replace(/\bItbegan\b/g, 'It began');
  t = t.replace(/\bIsay\b/g, 'I say');
  t = t.replace(/\bHequestioned\b/g, 'He questioned');
  t = t.replace(/\bHefeared\b/g, 'He feared');

  // Fix specific known run-togethers from this PDF's small-caps opening words.
  // These occur because the PDF's text items have e.g. "HusAYNwas in" as a
  // single text item with no space between the proper noun and the next word.
  // Must run AFTER diacritic restoration so we catch both pre- and post-fix forms.
  const runTogethers = [
    [/Ḥusaynwas\b/g, 'Ḥusayn was'],
    [/Ḥusayncame\b/g, 'Ḥusayn came'],
    [/Husaynwas\b/g, 'Ḥusayn was'],
    [/Husayncame\b/g, 'Ḥusayn came'],
    [/HusAYNwas\b/gi, 'Ḥusayn was'],
    [/HusAYNcame\b/gi, 'Ḥusayn came'],
    // Small-caps patterns from chapter openings (raw PDF text)
    [/l\\1ULLA\.\s*HusAYN/g, 'Mullá Ḥusayn'],
    [/MULL\.?A\.?\s*HusAYN/gi, 'Mullá Ḥusayn'],
  ];
  for (const [pat, rep] of runTogethers) {
    t = t.replace(pat, rep);
  }
  // Also do plain string replacements for Unicode boundary issues
  t = t.split('Ḥusaynwas').join('Ḥusayn was');
  t = t.split('Ḥusayncame').join('Ḥusayn came');

  // rn→m misreads in specific known words
  t = t.replace(/\bcomer\b/g, 'corner');
  t = t.replace(/\bcomers\b/g, 'corners');
  // "au- thorities" style hyphen joins that survived
  t = t.replace(/\bau- thorities\b/g, 'authorities');
  // "." inside words (OCR artifact)
  t = t.replace(/([a-z])\.([a-z])\b/g, '$1$2');
  // Fix ")the" or ")his" etc
  t = t.replace(/\)([a-z])/g, ') $1');
  // Fix stray "O See Appendix" footnote references
  t = t.replace(/\bO See Appendix,?\s*Note\s+\w+\.?\s*/g, '');
  t = t.replace(/\bSee Appendix,?\s*Note\s+\w+\.?\s*/g, '');

  // Fix "tom" → "torn" in specific known contexts
  t = t.replace(/\btom between\b/g, 'torn between');
  t = t.replace(/\btom asunder\b/g, 'torn asunder');
  t = t.replace(/\btom from\b/g, 'torn from');
  t = t.replace(/\btom apart\b/g, 'torn apart');

  // Fix small-caps OCR at chapter openings via string splits first
  // (handles backslash and dot artifacts that break regexes)
  const stringSplitFixes = [
    ['l\\1ULLA.', 'Mullá '],
    ['MULL.A', 'Mullá '],
    ['MULLA.', 'Mullá '],
  ];
  for (const [from, to] of stringSplitFixes) {
    t = t.split(from).join(to);
  }

  // Then regex-based opening fixes
  const openingFixes = [
    [/\bTms\s+IS\s+THE\s+STORY\b/g, 'This is the story'],
    [/\bMullá\s+HusAYN/g, 'Mullá Ḥusayn'],
    [/\bHusAYN\s*KHAN'S\s*ANGER/g, "Ḥusayn Khán's anger"],
    [/\bHusAYN KHAN'S ANGER/g, "Ḥusayn Khán's anger"],
    [/~rHE\s+PILGRIMAGE/g, 'The pilgrimage'],
    [/\bTHE BAB\s*RETURNED/g, 'The Báb returned'],
    [/\bTHE BAB\s*DEPARTED/g, 'The Báb departed'],
    [/\bTHE BAB\s*was\b/gi, 'The Báb was'],
    [/\bTHE FEW MONTIIS/g, 'The few months'],
    [/\bMUHAMMAD\s*SHAH\s*WAS\s*DEAD/g, 'Muḥammad Sháh was dead'],
    [/\bMUHAMMAD\s*SHAH,?\s*king/g, 'Muḥammad Sháh, king'],
    [/\bV\s*AHio,?\s*who/g, 'Vaḥíd, who'],
    [/\bV\s*AHin\b/g, 'Vaḥíd'],
    [/\bVAHio\b/g, 'Vaḥíd'],
    [/\bVAHin\b/g, 'Vaḥíd'],
    [/\bTHE DEATH OF V\s*AHi[no]\b/g, 'The death of Vaḥíd'],
    [/\bTHE PRIME MINISTER,?\s*Mirza Taqi Khan/g, 'The Prime Minister, Mírzá Taqí Khán'],
    [/\bTHE NEWS of/g, 'The news of'],
    [/\bONE OF THE MOST courageous/g, 'One of the most courageous'],
    [/\bA WAVE OF VIOLENCE/g, 'A wave of violence'],
    [/\bONE MORNING/g, 'One morning'],
    [/\bA SMALL WIDRL WIND/g, 'A small whirlwind'],
    [/\bA SMALL WHIRLWIND/g, 'A small whirlwind'],
    // Chapter title that leaked into body text
    [/^OF THE KING'S MESSENGER\s*/gm, ''],
  ];

  for (const [pattern, replacement] of openingFixes) {
    t = t.replace(pattern, replacement);
  }

  // Clean up double spaces left by fixes
  t = t.replace(/ {2,}/g, ' ');

  // ─── Diacritic restoration for proper nouns ──────────────────────────────
  // pdf-parse from the 1960 edition may not have proper diacritics for all names.
  // The 2003 edition (in the PDF you provided) should have them, but the PDF
  // text extraction sometimes drops them. Apply cautious restoration.
  const diacriticSubs = [
    // Only apply these where the non-diacritic form appears
    // (won't damage text that already has correct diacritics)
    [/\bBaha'u'llah\b/g, "Bahá'u'lláh"],
    [/\bBaha'i\b/g, "Bahá'í"],
    [/\bBaha'is\b/g, "Bahá'ís"],
    [/\bthe Bab\b/g, 'the Báb'],
    [/\bThe Bab\b/g, 'The Báb'],
    [/\bthe Bab's\b/g, "the Báb's"],
    [/\bThe Bab's\b/g, "The Báb's"],
    [/\bof the Bab\b/g, 'of the Báb'],
    [/\bSiyyid-i-Bab\b/g, 'Siyyid-i-Báb'],
    [/\bMulla\b/g, 'Mullá'],
    [/\bMullas\b/g, 'Mullás'],
    [/\bHusayn\b/g, 'Ḥusayn'],
    [/\bQuddus\b/g, 'Quddús'],
    [/\bTahirih\b/g, 'Ṭáhirih'],
    [/\bVahid\b/g, 'Vaḥíd'],
    [/\bHujjat\b/g, 'Ḥujjat'],
    [/\bTabriz\b/g, 'Tabríz'],
    [/\bTihran\b/g, 'Ṭihrán'],
    [/\bIsfahan\b/g, 'Iṣfahán'],
    [/\bShiraz\b/g, 'Shíráz'],
    [/\bShfraz\b/g, 'Shíráz'],
    [/\bKarbila\b/g, 'Karbilá'],
    [/\bMazindaran\b/g, 'Mázindarán'],
    [/\bKhurasan\b/g, 'Khurásán'],
    [/\bAdhirbayjan\b/g, 'Ádhirbáyján'],
    [/\bChihriq\b/g, 'Chihríq'],
    [/\bChiriq\b/g, 'Chihríq'],
    [/\bMah-Ku\b/g, 'Máh-Kú'],
    [/\bTabarsi\b/g, 'Ṭabarsí'],
    [/\bNayriz\b/g, 'Nayríz'],
    [/\bZanjan\b/g, 'Zanján'],
    [/\bMirza\b/g, 'Mírzá'],
    [/\bMfrza\b/g, 'Mírzá'],
    [/\bHaji\b/g, 'Ḥájí'],
    [/\bHajji\b/g, 'Ḥájí'],
    [/\bQur'an\b/g, "Qur'án"],
    [/\bIslam\b/g, 'Islám'],
    [/\bQa'im\b/g, "Qá'im"],
    [/\bMuhammad Shah\b/g, 'Muḥammad Sháh'],
    [/\bMuhammad\b/g, 'Muḥammad'],
    [/\bNasiri'd-Din\b/g, "Náṣiri'd-Dín"],
    [/\bShaykh Ahmad\b/g, 'Shaykh Aḥmad'],
    [/\bSiyyid Kazim\b/g, 'Siyyid Káẓim'],
    [/\bTaqi Khan\b/g, 'Taqí Khán'],
    [/\bAli Khan\b/g, "'Alí Khán"],
    [/\bAlf Khan\b/g, "'Alí Khán"],
    [/\b'Alf Khan\b/g, "'Alí Khán"],
    [/\bBayan\b/g, 'Bayán'],
    [/\bAqasi\b/g, 'Áqásí'],
    [/\bBarfurush\b/g, 'Bárfurúsh'],
    [/\bBushihr\b/g, 'Búshihr'],
  ];

  for (const [pattern, replacement] of diacriticSubs) {
    t = t.replace(pattern, replacement);
  }

  // Fix double-apostrophe collisions from restoration
  t = t.replace(/''Alí/g, "'Alí");

  return t.trim();
}

function rejoinBrokenParagraphs(text) {
  const paras = text.split(/\n\n/);
  const out = [];

  for (const p of paras) {
    const trimmed = p.trim();
    if (!trimmed) continue;
    if (out.length === 0) { out.push(trimmed); continue; }

    const prev = out[out.length - 1];
    const prevEndsSentence = /[.!?:;]["')\u201d\u2019\]]?\s*$/.test(prev);
    const currStartsLower = /^[a-z]/.test(trimmed);

    if (!prevEndsSentence && currStartsLower) {
      out[out.length - 1] = prev + ' ' + trimmed;
    } else {
      out.push(trimmed);
    }
  }

  return out.join('\n\n');
}

function stripLeadingFragments(text) {
  const paras = text.split(/\n\n/);
  while (paras.length > 1 && paras[0].trim().length < 5) {
    paras.shift();
  }
  return paras.join('\n\n');
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Reading PDF:', PDF_PATH);
  const pdfBuffer = fs.readFileSync(PDF_PATH);
  const doc = await getDocument({ data: new Uint8Array(pdfBuffer) }).promise;
  console.log(`PDF has ${doc.numPages} pages`);

  // Extract structured lines from all content pages
  console.log('\nExtracting text from pages...');
  const pageLines = {};
  for (let p = 1; p <= Math.min(doc.numPages, CONTENT_END_PAGE - 1); p++) {
    pageLines[p] = await extractPageLines(doc, p);
  }
  console.log(`Extracted ${Object.keys(pageLines).length} pages`);

  // Compute end pages for each section
  const sectionsWithEnd = SECTIONS.map((s, i) => ({
    ...s,
    endPage: (i < SECTIONS.length - 1) ? SECTIONS[i + 1].startPage : CONTENT_END_PAGE,
  }));

  // Build section content
  console.log('\nBuilding sections...');
  const db = {};

  for (const section of sectionsWithEnd) {
    // Collect structured lines from all pages in this section
    let allStructuredLines = [];
    for (let p = section.startPage; p < section.endPage; p++) {
      const lines = pageLines[p] || [];
      // Filter out running headers, page numbers, chapter headers
      const filtered = lines.filter(l => {
        const t = l.text.trim();
        if (!t) return false;
        if (/^\d{1,3}$/.test(t)) return false; // page numbers
        if (/^(\d+\s+)?RELEASE\s+THE\s+SUN(\s+\d+)?$/i.test(t)) return false;
        if (t === 'RELEASE THE SUN') return false;
        // All-caps running header (chapter title repeat at top/bottom of page)
        if (t === t.toUpperCase() && t.length < 60 && !t.includes('"') && !t.includes("'") && /^[A-Z]/.test(t) && t.length > 5) {
          // But don't filter if it's the only text on the page or clearly body text
          if (lines.length > 3) return false;
        }
        // CHAPTER <WORD> header
        if (/^CHAPTER\s+(ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|ELEVEN|TWELVE|THIRTEEN|FOURTEEN|FIFTEEN|SIXTEEN|SEVENTEEN|EIGHTEEN|NINETEEN)/i.test(t)) return false;
        return true;
      });
      allStructuredLines = allStructuredLines.concat(filtered);
    }

    // Build paragraphs using indentation detection
    const paras = buildParagraphsFromLines(allStructuredLines);

    // Clean each paragraph
    let content = paras.map(p => p.trim()).filter(p => p.length > 0).join('\n\n');

    // Apply text fixes
    content = applyTextFixes(content);
    content = stripLeadingFragments(content);
    content = rejoinBrokenParagraphs(content);
    content = content.trim();

    // Remove the section title if it's the very first paragraph
    const titleWords = section.title.replace(/^\d+\.\s*/, '').toUpperCase();
    const firstPara = content.split('\n\n')[0] || '';
    if (firstPara.toUpperCase().includes(titleWords) && firstPara.length < titleWords.length + 20) {
      content = content.split('\n\n').slice(1).join('\n\n');
    }

    db[section.key] = { title: section.title, content };

    const paraCount = content.split('\n\n').length;
    const fffdCount = (content.match(/\uFFFD/g) || []).length;
    const flag = fffdCount > 0 ? ` ⚠ ${fffdCount} FFFD` : '';
    console.log(`  ${section.key.padEnd(10)} ${section.title.padEnd(52)} ${String(content.length).padStart(6)} chars  ${String(paraCount).padStart(3)} paras${flag}`);
  }

  // Add __chapters metadata
  db.__chapters = SECTIONS.map(s => ({
    id: `release-the-sun-${s.key}`,
    title: s.title,
    urlSegment: s.key,
  }));

  // Backup old file
  if (fs.existsSync(OUT_JSON)) {
    fs.copyFileSync(OUT_JSON, BACKUP_JSON);
    console.log(`\nBacked up old JSON → ${path.basename(BACKUP_JSON)}`);
  }

  // Write new file
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(db));

  // Summary
  const keys = Object.keys(db).filter(k => k !== '__chapters');
  const totalChars = keys.reduce((sum, k) => sum + (db[k].content?.length || 0), 0);
  console.log(`\nWrote ${path.basename(OUT_JSON)}`);
  console.log(`  ${keys.length} sections, ${totalChars.toLocaleString()} total chars`);

  // Sanity checks
  const issues = [];
  for (const s of SECTIONS) {
    const entry = db[s.key];
    if (!entry?.content) { issues.push(`EMPTY: ${s.key}`); continue; }
    if (entry.content.length < 500) issues.push(`SHORT: ${s.key} (${entry.content.length} chars)`);
    const fffd = (entry.content.match(/\uFFFD/g) || []).length;
    if (fffd > 0) issues.push(`FFFD: ${s.key} has ${fffd} replacement chars`);
  }

  if (issues.length) {
    console.log('\n⚠  Issues:');
    issues.forEach(i => console.log(`  - ${i}`));
  } else {
    console.log('\n✓ All sections look good!');
  }

  console.log('\nDone. Review the output, then delete release-the-sun.OLD.json when satisfied.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
