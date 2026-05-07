/*
  Ingest "Release the Sun" by William Sears from PDF using pdf-parse.

  This replaces the old pdftotext-based pipeline (ingest-release-the-sun.cjs +
  fix-release-the-sun.cjs) which suffered from:
    - U+FFFD replacement chars (lost fi/fl ligatures)
    - Small-caps mangling
    - Running header contamination
    - Broken diacritics requiring extensive manual substitution tables

  pdf-parse extracts Unicode text directly from the PDF, preserving all
  diacritics and special characters natively.

  Output: public/books/release-the-sun.json  (the new version)
          public/books/release-the-sun.OLD.json  (backup of previous)

  Usage: node scripts/ingest-release-the-sun-v2.cjs
*/
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const PDF_PATH = path.join(__dirname, 'release-the-sun.pdf');
const OUT_DIR = path.join(__dirname, '..', 'public', 'books');
const OUT_JSON = path.join(OUT_DIR, 'release-the-sun.json');
const BACKUP_JSON = path.join(OUT_DIR, 'release-the-sun.OLD.json');

// ─── Chapter metadata ────────────────────────────────────────────────────────
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
  'The Massacre at the Fort of Shaykh Ṭabarsí',
  'A Wonder among Women',
  'The Death of the Wisest Persian',
  'The Seven Heroes of Ṭihrán',
  'The Dawn and the Sun',
  'The Martyrdom of the Báb',
];

// ─── Page ranges from PDF (1-indexed) ────────────────────────────────────────
// These are derived from the PDF's table of contents (pages 5-6).
// The PDF page numbers map as follows:
//   Page 1  = Cover
//   Page 2  = Half-title
//   Page 3  = Title page
//   Page 4  = Copyright
//   Page 5  = Contents (part 1)
//   Page 6  = Contents (part 2)
//   Page 7  = Map of Persia
//   Page 8  = Map caption
//   Page 9  = Publisher's Preface
//   Page 10 = Preface to the First Edition
//   Page 11 = Preface footnote
//   Page 12 = A Note to the Reader
//   Page 13 = RELEASE THE SUN divider
//   Page 14 = Prologue divider
//   Page 15 = Prologue text
//   Page 16 = Chapter 1 divider
//   Page 17 = Chapter 1 text starts
//   ...etc

// Section boundaries: [startPage, endPage] (inclusive, 1-indexed PDF pages)
// We define the content page ranges for each section.
const SECTIONS = [
  { key: 'foreword', title: 'Foreword', pages: [9, 9] },           // Publisher's Preface + Preface to First Edition
  { key: 'prologue', title: 'Prologue', pages: [14, 15] },
  { key: '1',  title: '1. The Promise of the Messiah', pages: [16, 21] },
  { key: '2',  title: '2. The Search Begins', pages: [22, 29] },
  { key: '3',  title: '3. The Promise Is Fulfilled', pages: [30, 35] },
  { key: '4',  title: '4. The Pilgrimage and the Proclamation', pages: [36, 39] },
  { key: '5',  title: '5. The Persecution Begins', pages: [40, 43] },
  { key: '6',  title: '6. The Gentle Arrest', pages: [44, 48] },
  { key: '7',  title: "7. The Enchantment of the King's Messenger", pages: [49, 56] },
  { key: '8',  title: '8. The Avenging Hand of God', pages: [57, 63] },
  { key: '9',  title: '9. The Kindly Governor', pages: [64, 69] },
  { key: '10', title: "10. The King's Summons", pages: [70, 73] },
  { key: '11', title: '11. The Tumult in Tabríz', pages: [74, 77] },
  { key: '12', title: '12. The High Stone Prison', pages: [78, 83] },
  { key: '13', title: '13. The Scourging at Tabríz', pages: [84, 93] },
  { key: '14', title: '14. The Massacre at the Fort of Shaykh Ṭabarsí', pages: [94, 112] },
  { key: '15', title: '15. A Wonder among Women', pages: [113, 127] },
  { key: '16', title: '16. The Death of the Wisest Persian', pages: [128, 138] },
  { key: '17', title: '17. The Seven Heroes of Ṭihrán', pages: [139, 145] },
  { key: '18', title: '18. The Dawn and the Sun', pages: [146, 167] },
  { key: '19', title: '19. The Martyrdom of the Báb', pages: [168, 185] },
];

// ─── Text cleaning ───────────────────────────────────────────────────────────

function cleanPageText(text, _pageNum) {
  let lines = text.split('\n');
  const cleaned = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      cleaned.push('');
      continue;
    }

    // Skip standalone page numbers
    if (/^\d{1,3}$/.test(trimmed)) continue;

    // Skip running headers like "RELEASE THE SUN" or chapter title repeats
    if (trimmed === 'RELEASE THE SUN') continue;

    // Skip divider pages (just the number or just a title)
    if (/^\d{1,2}$/.test(trimmed)) continue;

    cleaned.push(trimmed);
  }

  return cleaned;
}

function buildParagraphs(lines) {
  // Group non-blank lines into paragraphs separated by blank lines
  const paras = [];
  let buf = [];

  for (const line of lines) {
    if (line === '') {
      if (buf.length) {
        paras.push(buf.join(' '));
        buf = [];
      }
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
  t = t.replace(/([a-zA-Zá-ú])- ([a-z])/g, '$1$2');

  // Fix double spaces
  t = t.replace(/ {2,}/g, ' ');

  // Fix space before punctuation
  t = t.replace(/ ([.,;:!?])/g, '$1');

  // Fix quotes: replace backtick-style quotes
  t = t.replace(/``/g, '\u201c').replace(/''/g, '\u201d');

  // Clean up any remaining U+FFFD (shouldn't be many with pdf-parse)
  t = t.replace(/\uFFFD/g, '');

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
    // Previous paragraph ends with sentence-terminating punctuation?
    const prevEndsSentence = /[.!?:;]["')\u201d\u2019\]]?\s*$/.test(prev);
    // Current paragraph starts with lowercase?
    const currStartsLower = /^[a-z]/.test(trimmed);

    if (!prevEndsSentence && currStartsLower) {
      // Mid-sentence break caused by page boundary — join
      out[out.length - 1] = prev + ' ' + trimmed;
    } else {
      out.push(trimmed);
    }
  }

  return out.join('\n\n');
}

function stripSectionHeaders(text, sectionTitle) {
  // Remove the chapter title if it appears at the very start
  // e.g. "Publisher's Preface\n..." or "1\nThe Promise of the Messiah\n..."
  let t = text;

  // Remove chapter number lines like "1" at start
  t = t.replace(/^\d{1,2}\s*\n/, '');

  // Remove the section title if it's the first line
  const titleEsc = sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  t = t.replace(new RegExp('^' + titleEsc + '\\s*\\n', 'i'), '');

  // Remove "Contents" or "Prologue" or chapter number word headers
  t = t.replace(/^(Contents|Prologue|Publisher's Preface|Preface to the First Edition|A Note to the Reader|RELEASE THE SUN)\s*\n/i, '');

  return t.trim();
}

function filterFootnotes(text) {
  // The book has footnotes at the end of some pages marked with * or †
  // These appear as short lines starting with * or † at paragraph boundaries.
  // We want to keep them but clean them up.
  // In the PDF text they often appear as separate paragraphs.

  const paras = text.split('\n\n');
  const cleaned = [];

  for (const p of paras) {
    const trimmed = p.trim();

    // Skip empty
    if (!trimmed) continue;

    // Skip very short fragments that are just artifacts (1-3 chars)
    if (trimmed.length <= 3 && !/[a-zA-Z]{2,}/.test(trimmed)) continue;

    cleaned.push(trimmed);
  }

  return cleaned.join('\n\n');
}

// ─── Main extraction ─────────────────────────────────────────────────────────

async function main() {
  console.log('Reading PDF...');
  const pdfBuffer = fs.readFileSync(PDF_PATH);

  // Extract text page by page
  const pageTexts = {};

  // pdf-parse options: extract per-page text
  const data = await pdfParse(pdfBuffer, {
    // Custom page renderer to get per-page text
    pagerender: async function(pageData) {
      const textContent = await pageData.getTextContent();
      // Sort items by position (top to bottom, left to right)
      const items = textContent.items.sort((a, b) => {
        // y increases downward in PDF coordinates (from bottom),
        // so higher y = higher on page
        const yDiff = b.transform[5] - a.transform[5];
        if (Math.abs(yDiff) > 5) return yDiff;
        return a.transform[4] - b.transform[4];
      });

      // Group items into lines based on y-position
      const lines = [];
      let currentLine = [];
      let lastY = null;

      for (const item of items) {
        const y = Math.round(item.transform[5]);
        if (lastY !== null && Math.abs(y - lastY) > 5) {
          if (currentLine.length) {
            lines.push(currentLine.map(i => i.str).join(''));
          }
          currentLine = [];
        }
        currentLine.push(item);
        lastY = y;
      }
      if (currentLine.length) {
        lines.push(currentLine.map(i => i.str).join(''));
      }

      return lines.join('\n');
    }
  });

  // Now re-extract per-page using the built-in numpages
  // pdf-parse concatenates all pages. We need per-page extraction.
  // Let's use a different approach: extract with page callback

  console.log(`PDF has ${data.numpages} pages`);

  // Re-extract per page
  const perPage = {};
  await pdfParse(pdfBuffer, {
    pagerender: async function(pageData) {
      const pageNum = pageData.pageIndex + 1; // 1-indexed
      const textContent = await pageData.getTextContent();

      const items = textContent.items.sort((a, b) => {
        const yDiff = b.transform[5] - a.transform[5];
        if (Math.abs(yDiff) > 5) return yDiff;
        return a.transform[4] - b.transform[4];
      });

      const lines = [];
      let currentLine = [];
      let lastY = null;

      for (const item of items) {
        const y = Math.round(item.transform[5]);
        if (lastY !== null && Math.abs(y - lastY) > 3) {
          if (currentLine.length) {
            lines.push(currentLine.map(i => i.str).join(''));
          }
          currentLine = [];
        }
        currentLine.push(item);
        lastY = y;
      }
      if (currentLine.length) {
        lines.push(currentLine.map(i => i.str).join(''));
      }

      perPage[pageNum] = lines.join('\n');
      return ''; // we don't need the concatenated result
    }
  });

  console.log(`Extracted text from ${Object.keys(perPage).length} pages`);

  // ─── Build sections ──────────────────────────────────────────────────────
  const db = {};

  for (const section of SECTIONS) {
    const [startPage, endPage] = section.pages;
    let allLines = [];

    for (let p = startPage; p <= endPage; p++) {
      const pageText = perPage[p] || '';
      const cleaned = cleanPageText(pageText, p);
      allLines = allLines.concat(cleaned);
      // Add blank line between pages to preserve paragraph boundaries
      allLines.push('');
    }

    const paras = buildParagraphs(allLines);
    let content = paras.join('\n\n');

    // Apply fixes
    content = stripSectionHeaders(content, section.title);
    content = applyTextFixes(content);
    content = filterFootnotes(content);
    content = rejoinBrokenParagraphs(content);

    // Final trim
    content = content.trim();

    db[section.key] = {
      title: section.title,
      content: content,
    };

    console.log(`  ${section.key.padEnd(10)} ${section.title.padEnd(50)} ${content.length} chars, ${content.split('\n\n').length} paras`);
  }

  // Add __chapters metadata
  db.__chapters = SECTIONS.map(s => ({
    id: `release-the-sun-${s.key}`,
    title: s.title,
    urlSegment: s.key,
  }));

  // ─── Backup old & write new ────────────────────────────────────────────────
  if (fs.existsSync(OUT_JSON)) {
    fs.copyFileSync(OUT_JSON, BACKUP_JSON);
    console.log(`\nBacked up old JSON to ${BACKUP_JSON}`);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(db, null, 0));

  // Verify
  const written = JSON.parse(fs.readFileSync(OUT_JSON, 'utf8'));
  const sectionKeys = Object.keys(written).filter(k => k !== '__chapters');
  const totalChars = sectionKeys.reduce((sum, k) => sum + (written[k].content?.length || 0), 0);

  console.log(`\nWrote ${OUT_JSON}`);
  console.log(`  ${sectionKeys.length} sections, ${totalChars} total chars`);
  console.log(`  __chapters: ${written.__chapters?.length} entries`);

  // Sanity checks
  const issues = [];
  for (const s of SECTIONS) {
    const entry = written[s.key];
    if (!entry) { issues.push(`Missing section: ${s.key}`); continue; }
    if (!entry.content || entry.content.length < 100) {
      issues.push(`Section ${s.key} too short: ${entry.content?.length || 0} chars`);
    }
    // Check for remaining FFFD
    const fffd = (entry.content.match(/\uFFFD/g) || []).length;
    if (fffd > 0) issues.push(`Section ${s.key} has ${fffd} U+FFFD chars remaining`);
  }

  if (issues.length) {
    console.log('\n⚠ Issues found:');
    issues.forEach(i => console.log(`  - ${i}`));
  } else {
    console.log('\n✓ All sections look good!');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
