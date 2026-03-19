/**
 * Downloads all book chapters from the Bahá'í Reference Library using Puppeteer.
 * Run from project root: node scripts/fetch-books.cjs
 * Output: src/data/bookContent.json
 *
 * Page numbers confirmed by scanning bahai.org — all books start at page /2, not /1.
 * Promulgation and SAQ scan up to /60 to catch all pages.
 * Seven Valleys scans /1-/20.
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, '../src/data/bookContent.json');
const BASE = 'https://www.bahai.org/library/authoritative-texts/';
const DELAY = 1200;

// Confirmed page ranges. Script will skip pages with < 2000 chars (404s/intro pages).
const BOOKS = [
  {
    id: 'hidden-words',
    path: 'bahaullah/hidden-words',
    pages: range(2, 10),
  },
  {
    id: 'seven-valleys',
    path: 'bahaullah/seven-valleys-four-valleys',
    pages: range(1, 20),
  },
  {
    id: 'gleanings',
    path: 'bahaullah/gleanings-writings-bahaullah',
    pages: range(2, 20),
  },
  {
    id: 'iqan',
    path: 'bahaullah/kitab-i-iqan',
    pages: range(2, 20),
  },
  {
    id: 'aqdas',
    path: 'bahaullah/kitab-i-aqdas',
    pages: range(2, 25),
  },
  {
    id: 'paris-talks',
    path: 'abdul-baha/paris-talks',
    pages: range(2, 15),
  },
  {
    id: 'promulgation',
    path: 'abdul-baha/promulgation-universal-peace',
    pages: range(2, 60),
  },
  {
    id: 'some-answered-questions',
    path: 'abdul-baha/some-answered-questions',
    pages: range(2, 35),
  },
];

function range(from, to) {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

function load() {
  try { return JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); }
  catch { return {}; }
}

function save(data) {
  fs.writeFileSync(OUTPUT, JSON.stringify(data, null, 2));
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchPage(page, url) {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

  return page.evaluate(() => {
    const bodyLen = document.body.innerText.length;
    if (bodyLen < 2000) return null; // 404 or empty page

    // Remove chrome/nav elements
    ['nav', 'header', 'footer', 'script', 'style', 'aside',
     '.site-header', '.site-footer', '.library-nav',
     '.breadcrumb', '.page-nav', '.back-to-top'].forEach(sel => {
      document.querySelectorAll(sel).forEach(el => el.remove());
    });

    const parts = [];
    const seen = new Set();

    document.querySelectorAll('p, h2, h3, h4, blockquote').forEach(el => {
      const text = el.textContent?.trim() || '';
      if (!text || text.length < 8 || seen.has(text)) return;
      if (/^(next|previous|back to|return|copyright|all rights reserved|bahá'í reference library|library|writings of|menu)/i.test(text)) return;
      seen.add(text);

      const tag = el.tagName.toLowerCase();
      parts.push(['h2','h3','h4'].includes(tag) ? `**${text}**` : text);
    });

    // Extract first meaningful heading as chapter title
    const firstH = document.querySelector('h2, h3');
    const chapterTitle = firstH?.textContent?.trim() || null;

    return { content: parts.join('\n\n'), chapterTitle };
  });
}

async function main() {
  const data = load();
  console.log(`Loaded ${Object.keys(data).filter(k => !k.includes('__')).length} existing chapters.\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const pg = await browser.newPage();
  await pg.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36');

  let totalSaved = 0;

  for (const book of BOOKS) {
    console.log(`\n=== ${book.id} ===`);
    const validChapters = [];

    for (const n of book.pages) {
      const key = `${book.id}/${n}`;

      if (data[key]?.content?.length > 100) {
        validChapters.push({ id: `${book.id}-${n}`, title: data[key].title || `Section ${n}`, urlSegment: String(n) });
        process.stdout.write('.');
        continue;
      }

      try {
        const result = await fetchPage(pg, `${BASE}${book.path}/${n}/`);
        if (!result || result.content.length < 200) {
          // Skip empty/404 pages silently
          await delay(300);
          continue;
        }

        const title = result.chapterTitle || `Section ${n}`;
        data[key] = { title, content: result.content };
        validChapters.push({ id: `${book.id}-${n}`, title, urlSegment: String(n) });
        save(data);
        totalSaved++;
        console.log(`\n  /${n} "${title}" — ${result.content.length}c`);
      } catch (e) {
        // silently skip errors (likely 404)
      }

      await delay(DELAY);
    }

    if (validChapters.length > 0) {
      data[`${book.id}/__chapters`] = validChapters;
      save(data);
      console.log(`\n  → ${validChapters.length} chapters saved for ${book.id}`);
    } else {
      console.log(`\n  → No chapters found for ${book.id}`);
    }
  }

  await browser.close();
  console.log(`\n\nDone. Saved ${totalSaved} new chapters to:\n${OUTPUT}`);
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
