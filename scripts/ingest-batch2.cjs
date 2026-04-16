/*
  Batch ingester for: Thief in the Night, King of Glory, Chosen Highway cleanup,
  Vignettes, and Stories of Bahá'u'lláh.
*/
const fs = require('fs');
const path = require('path');

const BOOKS_DIR = path.join(__dirname, '..', 'src', 'data', 'books');

function writeBook(bookId, db) {
  fs.writeFileSync(path.join(BOOKS_DIR, bookId + '.json'), JSON.stringify(db));
}

// ─── 1. THIEF IN THE NIGHT ──────────────────────────────────────────────────
function ingestThiefInTheNight() {
  const buf = fs.readFileSync(path.join(__dirname, 'thief-in-the-night.txt'));
  const raw = buf.toString('latin1'); // ISO-8859-1 → UTF-8

  const lines = raw.split(/\r?\n/);
  const sections = [];

  // Find chapter/part boundaries: "Part One--..." or standalone numbers with titles
  // Structure: 6 Parts with numbered chapters under each
  // Parts are: "Part One--The Unsolved Problem" etc.
  // Chapters are numbered 1-60ish

  // Strategy: find PART lines and standalone chapter headings
  const partStarts = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (/^Part (One|Two|Three|Four|Five|Six)--/i.test(l)) {
      partStarts.push({ line: i, title: l.replace(/--/g, ' — ') });
    }
  }

  // If no parts found, just split by page-feed or big gaps
  if (partStarts.length === 0) {
    // Fallback: split into one chapter
    sections.push({ title: 'Thief in the Night', content: raw.replace(/\f/g, '').trim() });
  } else {
    // For each part, grab content until next part
    for (let i = 0; i < partStarts.length; i++) {
      const start = partStarts[i].line;
      const end = (i < partStarts.length - 1) ? partStarts[i + 1].line : lines.length;
      let content = lines.slice(start, end).join('\n');
      content = content.replace(/\f/g, '').replace(/^\d+\s*$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
      sections.push({ title: partStarts[i].title, content });
    }
  }

  // Also try to get intro/foreword before Part One
  if (partStarts.length > 0 && partStarts[0].line > 50) {
    // Find where real content starts (after TOC)
    let introStart = -1;
    for (let i = 0; i < partStarts[0].line; i++) {
      if (/^(FOREWORD|INTRODUCTION|Foreword|Introduction)\s*$/i.test(lines[i].trim())) {
        introStart = i;
        break;
      }
    }
    if (introStart > 0) {
      let content = lines.slice(introStart, partStarts[0].line).join('\n');
      content = content.replace(/\f/g, '').replace(/^\d+\s*$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
      sections.unshift({ title: 'Foreword', content });
    }
  }

  const db = {};
  db.__chapters = sections.map((s, i) => ({
    id: `thief-in-the-night-${i + 1}`,
    title: s.title,
    urlSegment: String(i + 1),
  }));
  sections.forEach((s, i) => { db[String(i + 1)] = { title: s.title, content: s.content }; });
  writeBook('thief-in-the-night', db);
  console.log(`Thief in the Night: ${sections.length} sections`);
  sections.forEach((s, i) => console.log(`  ${i + 1}. ${s.title.slice(0, 55).padEnd(55)} ${s.content.length} chars`));
}

// ─── 2. KING OF GLORY ───────────────────────────────────────────────────────
function ingestKingOfGlory() {
  const html = fs.readFileSync(path.join(__dirname, 'king-of-glory.html'), 'utf8');
  // Strip to text with \n preserved
  const text = html.replace(/<[^>]+>/g, '\n').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&#\d+;/g, m => String.fromCharCode(parseInt(m.slice(2, -1))));

  const lines = text.split('\n');

  // Find standalone chapter numbers (1-42) — lines that are JUST a number
  const chapterLines = [];
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (/^\d{1,2}$/.test(t)) {
      const n = parseInt(t);
      if (n >= 1 && n <= 42) chapterLines.push({ line: i, num: n });
    }
  }

  // Also find PREFACE
  let prefaceStart = -1;
  for (let i = 0; i < (chapterLines[0]?.line || lines.length); i++) {
    if (/^PREFACE\s*$/.test(lines[i].trim())) { prefaceStart = i; break; }
  }

  const sections = [];

  if (prefaceStart >= 0) {
    const end = chapterLines[0]?.line || lines.length;
    let content = lines.slice(prefaceStart, end).join('\n');
    content = content.replace(/\[p\.\s*\d+\]/g, '').replace(/\n{3,}/g, '\n\n').trim();
    sections.push({ title: 'Preface', content });
  }

  for (let i = 0; i < chapterLines.length; i++) {
    const start = chapterLines[i].line;
    const end = (i < chapterLines.length - 1) ? chapterLines[i + 1].line : lines.length;
    let content = lines.slice(start + 1, end).join('\n');
    content = content.replace(/\[p\.\s*\d+\]/g, '').replace(/\n{3,}/g, '\n\n').trim();
    // Get first meaningful line as subtitle
    const firstLine = content.split('\n').find(l => l.trim().length > 10)?.trim().slice(0, 80) || '';
    const title = `Chapter ${chapterLines[i].num}`;
    if (content.length > 100) sections.push({ title, content });
  }

  const db = {};
  db.__chapters = sections.map((s, i) => ({
    id: `bahaullah-king-glory-${i + 1}`,
    title: s.title,
    urlSegment: String(i + 1),
  }));
  sections.forEach((s, i) => { db[String(i + 1)] = { title: s.title, content: s.content }; });
  writeBook('bahaullah-king-glory', db);
  console.log(`King of Glory: ${sections.length} sections`);
  sections.forEach((s, i) => console.log(`  ${i + 1}. ${s.title.padEnd(55)} ${s.content.length} chars`));
}

// ─── 3. VIGNETTES ────────────────────────────────────────────────────────────
function ingestVignettes() {
  const buf = fs.readFileSync(path.join(__dirname, 'vignettes.txt'));
  const raw = buf.toString('latin1');

  // Fix diacritics
  let text = raw
    .replace(/Bah\xe1/g, 'Bahá').replace(/bah\xe1/g, 'bahá')
    .replace(/\xe1/g, 'á').replace(/\xed/g, 'í').replace(/\xfa/g, 'ú')
    .replace(/\xc1/g, 'Á').replace(/\xcd/g, 'Í').replace(/\xda/g, 'Ú')
    .replace(/\x92/g, "'").replace(/\x93/g, '"').replace(/\x94/g, '"')
    .replace(/\x96/g, '–').replace(/\x97/g, '—')
    .replace(/\f/g, '').replace(/^\d+\s*$/gm, '').replace(/\n{3,}/g, '\n\n');

  // Find sections: PREFACE, INTRODUCTION, HIS PURE HEART, HIS KINDLY HEART,
  // HIS RADIANT HEART, EPILOGUE
  const sectionNames = ['PREFACE', 'PREFACE TO THE 1991 REVISED EDITION', 'INTRODUCTION',
    'HIS PURE HEART', 'HIS KINDLY HEART', 'HIS RADIANT HEART', 'EPILOGUE'];
  const lines = text.split('\n');
  const sectionStarts = [];

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (sectionNames.includes(t)) {
      sectionStarts.push({ line: i, title: t.charAt(0) + t.slice(1).toLowerCase() });
    }
  }

  const sections = [];
  for (let i = 0; i < sectionStarts.length; i++) {
    const start = sectionStarts[i].line;
    const end = (i < sectionStarts.length - 1) ? sectionStarts[i + 1].line : lines.length;
    let content = lines.slice(start, end).join('\n').replace(/\n{3,}/g, '\n\n').trim();
    sections.push({ title: sectionStarts[i].title, content });
  }

  const db = {};
  db.__chapters = sections.map((s, i) => ({
    id: `vignettes-abdulbaha-${i + 1}`,
    title: s.title,
    urlSegment: String(i + 1),
  }));
  sections.forEach((s, i) => { db[String(i + 1)] = { title: s.title, content: s.content }; });
  writeBook('vignettes-abdulbaha', db);
  console.log(`Vignettes: ${sections.length} sections`);
  sections.forEach((s, i) => console.log(`  ${i + 1}. ${s.title.padEnd(55)} ${s.content.length} chars`));
}

// ─── 4. STORIES OF BAHÁ'U'LLÁH ──────────────────────────────────────────────
function ingestStoriesBahaullah() {
  // Try epub first, fallback to PDF
  const epubPath = path.join(__dirname, 'stories-bahaullah.epub');
  const pdfTxtPath = path.join(__dirname, 'stories-bahaullah.txt');

  let text;
  if (fs.existsSync(pdfTxtPath)) {
    const buf = fs.readFileSync(pdfTxtPath);
    text = buf.toString('latin1');
  } else {
    console.log('Stories of Bahá\'u\'lláh: no text file found, skipping');
    return;
  }

  // Fix common encoding issues
  text = text
    .replace(/\x92/g, "'").replace(/\x93/g, '"').replace(/\x94/g, '"')
    .replace(/\x96/g, '–').replace(/\x97/g, '—')
    .replace(/\xe1/g, 'á').replace(/\xed/g, 'í').replace(/\xfa/g, 'ú')
    .replace(/\xc1/g, 'Á').replace(/\xcd/g, 'Í')
    .replace(/\f/g, '').replace(/^\d+\s*$/gm, '').replace(/\n{3,}/g, '\n\n');

  // Split into numbered stories: "1. Title..." through "39. Title..."
  const lines = text.split('\n');
  const storyStarts = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].trim().match(/^(\d{1,2})\.\s+(.+)/);
    if (m && parseInt(m[1]) >= 1 && parseInt(m[1]) <= 60) {
      // Only accept if the number follows in sequence (roughly)
      storyStarts.push({ line: i, num: parseInt(m[1]), title: m[2].slice(0, 80) });
    }
  }

  if (storyStarts.length < 5) {
    // Fallback: single chapter
    const sections = [{ title: 'Stories of Bahá\'u\'lláh', content: text.trim() }];
    const db = { __chapters: [{ id: 'stories-bahaullah-1', title: sections[0].title, urlSegment: '1' }] };
    db['1'] = { title: sections[0].title, content: sections[0].content };
    writeBook('stories-bahaullah', db);
    console.log('Stories of Bahá\'u\'lláh: 1 section (fallback)');
    return;
  }

  const sections = [];
  for (let i = 0; i < storyStarts.length; i++) {
    const start = storyStarts[i].line;
    const end = (i < storyStarts.length - 1) ? storyStarts[i + 1].line : lines.length;
    let content = lines.slice(start, end).join('\n').replace(/\n{3,}/g, '\n\n').trim();
    sections.push({ title: `${storyStarts[i].num}. ${storyStarts[i].title}`, content });
  }

  const db = {};
  db.__chapters = sections.map((s, i) => ({
    id: `stories-bahaullah-${i + 1}`,
    title: s.title,
    urlSegment: String(i + 1),
  }));
  sections.forEach((s, i) => { db[String(i + 1)] = { title: s.title, content: s.content }; });
  writeBook('stories-bahaullah', db);
  console.log(`Stories of Bahá'u'lláh: ${sections.length} sections`);
  sections.forEach((s, i) => console.log(`  ${i + 1}. ${s.title.slice(0, 55).padEnd(55)} ${s.content.length} chars`));
}

// ─── RUN ALL ─────────────────────────────────────────────────────────────────
try { ingestThiefInTheNight(); } catch(e) { console.error('Thief:', e.message); }
console.log();
try { ingestKingOfGlory(); } catch(e) { console.error('KOG:', e.message); }
console.log();
try { ingestVignettes(); } catch(e) { console.error('Vignettes:', e.message); }
console.log();
try { ingestStoriesBahaullah(); } catch(e) { console.error('Stories:', e.message); }
