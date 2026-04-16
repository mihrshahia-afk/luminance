/*
  Re-ingest Muhammad and the Course of Islam with proper chapter splitting.
  The HTML has no structural chapter tags — chapters are identified by
  matching their TOC titles in the body text.
*/
const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'muhammad-islam.html'), 'utf8');
const text = html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&nbsp;/g, ' ').replace(/&#(\d+);/g, (m, n) => String.fromCharCode(parseInt(n)))
  .replace(/&[a-z]+;/gi, '');

const lines = text.split('\n').map(l => l.replace(/\s+/g, ' ').trim());

// Full TOC from the PDF
const TOC = [
  'Foreword', 'Introduction', 'Prologue',
  "The Birth of Muhammad", "Boyhood and Youth", "The Man and His Times",
  "The Ministry Begins", "Migration to Abyssinia", "Ostracism",
  "The Night Journey", "The Idolaters' Plot",
  "Medina -- the City of the Prophet", "Badr and Uhud",
  "The Investment of Medina", "The Truce of al-Hudaybiyyah",
  "The Call to the Kings", "Jews and Christians of the North",
  "Mecca and at-Ta'if Fall", "The Farewell",
  "The Passing of the Prophet", "What Muhammad Taught",
  'Postscript',
  'The Succession', "The Yoke of the House of Umayyah",
  'Revolt and its Roots', 'Ferment of Thought and Belief',
  'The New Society', 'Divisions of Thought and Belief',
  'The Bright Star of the Fatimids', 'Sufis and Sufiism',
  'The Civilization of Islam', 'The Crusades',
  'Islam at Bay', 'Islam Ascendant',
  'The Changing Face of Islamic Society', 'Final Divisions',
  'Epilogue',
];

function findLine(title, afterLine = 100) {
  const lower = title.toLowerCase();
  // Exact match first
  for (let i = afterLine; i < lines.length; i++) {
    if (lines[i].toLowerCase() === lower) return i;
  }
  // Substring match (title appears at start of line)
  for (let i = afterLine; i < lines.length; i++) {
    if (lines[i].toLowerCase().startsWith(lower) && lines[i].length < lower.length + 30) return i;
  }
  // Fuzzy: first 20 chars
  const short = lower.slice(0, 20);
  for (let i = afterLine; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(short) && lines[i].length < 100) return i;
  }
  return -1;
}

const sections = [];
let lastLine = 100; // skip TOC area

for (let i = 0; i < TOC.length; i++) {
  const title = TOC[i];
  const startLine = findLine(title, lastLine);

  if (startLine < 0) {
    console.warn(`WARNING: "${title}" not found after line ${lastLine}`);
    continue;
  }

  // End: next section start or end of file
  let endLine = lines.length;
  if (i < TOC.length - 1) {
    const nextLine = findLine(TOC[i + 1], startLine + 1);
    if (nextLine > startLine) endLine = nextLine;
  }

  let content = lines.slice(startLine, endLine)
    .filter(l => l.length > 0)
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Skip Glossary/Bibliography/Index at end
  const cutIdx = content.search(/\n\n(GLOSSARY|BIBLIOGRAPHY|INDEX)\b/i);
  if (cutIdx > 0) content = content.slice(0, cutIdx).trim();

  if (content.length > 50) {
    sections.push({ title, content });
    lastLine = startLine + 1;
  }
}

const db = {};
db.__chapters = sections.map((s, i) => ({
  id: `muhammad-islam-${i + 1}`,
  title: s.title,
  urlSegment: String(i + 1),
}));
sections.forEach((s, i) => { db[String(i + 1)] = { title: s.title, content: s.content }; });
fs.writeFileSync(path.join(__dirname, '..', 'public', 'books', 'muhammad-islam.json'), JSON.stringify(db));
console.log(`Muhammad: ${sections.length} sections`);
sections.forEach((s, i) => console.log(`  ${String(i+1).padEnd(3)} ${s.title.padEnd(50)} ${s.content.length} chars`));
