/*
  Generic HTML book ingester for bahai-library.com full-text pages.
  Usage: node ingest-html-book.cjs <html-file> <book-id>

  Extracts chapters by <h3> headings, strips site chrome, produces
  src/data/books/<book-id>.json with __chapters + per-chapter content.
*/
const fs = require('fs');
const path = require('path');

const [,, htmlFile, bookId] = process.argv;
if (!htmlFile || !bookId) { console.error('Usage: node ingest-html-book.cjs <html-file> <book-id>'); process.exit(1); }

const HTML = path.resolve(htmlFile);
const OUT = path.join(__dirname, '..', 'src', 'data', 'books', bookId + '.json');

const raw = fs.readFileSync(HTML, 'utf8');

// Extract the main content area — between the first <h3> and the footer/nav
// bahai-library.com pages have site chrome before/after the book content.
// Strategy: find all <h3> tags — each starts a chapter.

// First, strip everything before the first <h3> that looks like a chapter heading
const firstH3 = raw.indexOf('<h3');
if (firstH3 < 0) { console.error('No <h3> tags found'); process.exit(1); }

// Also strip footer/navigation at the end — look for common markers
let endIdx = raw.length;
for (const marker of ['<div class="footer"', '<!-- footer', '<footer', '<div id="footer"', '<!-- Google Analytics']) {
  const m = raw.indexOf(marker, firstH3);
  if (m > 0 && m < endIdx) endIdx = m;
}

const body = raw.slice(firstH3, endIdx);

// Split by <h3> tags — each is a chapter boundary
const parts = body.split(/<h3[^>]*>/i);
const chapters = [];

for (let i = 0; i < parts.length; i++) {
  const part = parts[i];
  if (!part.trim()) continue;

  // Extract title from the part: it's before the first </h3>
  const closeH3 = part.indexOf('</h3>');
  let title, content;
  if (closeH3 > 0 && i > 0) {
    // This part starts with the h3 content (since we split on <h3>)
    title = part.slice(0, closeH3).replace(/<[^>]+>/g, '').trim();
    content = part.slice(closeH3 + 5);
  } else if (i === 0) {
    // Before first h3 — intro/preface content
    content = part;
    title = 'Introduction';
  } else {
    content = part;
    title = `Section ${chapters.length + 1}`;
  }

  // Strip HTML to plain text with paragraph breaks
  let text = content
    // Replace block elements with double newlines
    .replace(/<\/?(p|div|blockquote|br\s*\/?|hr\s*\/?)>/gi, '\n\n')
    // Replace headers with bold markers
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n\n**$1**\n\n')
    // Strip remaining tags
    .replace(/<[^>]+>/g, '')
    // Decode common entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rdquo;/g, '\u201D')
    .replace(/&ldquo;/g, '\u201C')
    .replace(/&mdash;/g, '\u2014')
    .replace(/&ndash;/g, '\u2013')
    .replace(/&hellip;/g, '\u2026')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, m => String.fromCharCode(parseInt(m.slice(2, -1))))
    // Strip [page N] markers (they're reference noise)
    .replace(/\[page\s*\d+\]/gi, '')
    // Collapse whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Split into paragraphs and clean
  const paras = text.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0);
  const cleaned = paras.join('\n\n');

  if (cleaned.length < 20) continue;

  // Clean up title
  title = title
    .replace(/\s+/g, ' ')
    .replace(/^\d+\.\s*/, '') // strip leading "1. "
    .trim();

  if (!title || title.length < 2) title = `Chapter ${chapters.length + 1}`;

  chapters.push({ title, content: cleaned });
}

// Build output JSON
const db = {};
db.__chapters = chapters.map((ch, i) => ({
  id: `${bookId}-${i + 1}`,
  title: ch.title,
  urlSegment: String(i + 1),
}));

for (let i = 0; i < chapters.length; i++) {
  db[String(i + 1)] = { title: chapters[i].title, content: chapters[i].content };
}

fs.writeFileSync(OUT, JSON.stringify(db));
console.log(`Ingested ${chapters.length} chapters of "${bookId}".`);
for (let i = 0; i < chapters.length; i++) {
  console.log(`  ${String(i + 1).padEnd(4)} ${chapters[i].title.padEnd(60)} ${chapters[i].content.length} chars`);
}
