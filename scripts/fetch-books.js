/**
 * Fetches all book chapters from the Bahá'í Reference Library using Puppeteer.
 * Run with: node scripts/fetch-books.js
 * Output: src/data/bookContent.json
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, '../src/data/bookContent.json');
const BAHAI_ORG = 'https://www.bahai.org';
const DELAY_MS = 1500; // polite delay between requests

const bookConfigs = [
  // Bahá'u'lláh
  { id: 'hidden-words',           urlPath: 'bahaullah/hidden-words' },
  { id: 'seven-valleys',          urlPath: 'bahaullah/call-divine-beloved' },
  { id: 'gleanings',              urlPath: 'bahaullah/gleanings-writings-bahaullah' },
  { id: 'iqan',                   urlPath: 'bahaullah/kitab-i-iqan' },
  { id: 'aqdas',                  urlPath: 'bahaullah/kitab-i-aqdas' },
  { id: 'epistle-son-wolf',       urlPath: 'bahaullah/epistle-son-wolf' },
  { id: 'prayers-meditations',    urlPath: 'bahaullah/prayers-meditations' },
  { id: 'tablets-bahaullah',      urlPath: 'bahaullah/tablets-bahaullah' },
  { id: 'summons-lord-hosts',     urlPath: 'bahaullah/summons-lord-hosts' },
  { id: 'gems-divine-mysteries',  urlPath: 'bahaullah/gems-divine-mysteries' },
  { id: 'days-remembrance',       urlPath: 'bahaullah/days-remembrance' },
  { id: 'tabernacle-unity',       urlPath: 'bahaullah/tabernacle-unity' },
  // 'Abdu'l-Bahá
  { id: 'paris-talks',            urlPath: 'abdul-baha/paris-talks' },
  { id: 'promulgation',           urlPath: 'abdul-baha/promulgation-universal-peace' },
  { id: 'some-answered-questions',urlPath: 'abdul-baha/some-answered-questions' },
  { id: 'selections-writings-abdul-baha', urlPath: 'abdul-baha/selections-writings-abdul-baha' },
  { id: 'secret-divine-civilization',     urlPath: 'abdul-baha/secret-divine-civilization' },
  { id: 'memorials-faithful',     urlPath: 'abdul-baha/memorials-faithful' },
  { id: 'will-testament',         urlPath: 'abdul-baha/will-testament-abdul-baha' },
  { id: 'tablets-divine-plan',    urlPath: 'abdul-baha/tablets-divine-plan' },
  { id: 'travelers-narrative',    urlPath: 'abdul-baha/travelers-narrative' },
  { id: 'light-of-the-world',     urlPath: 'abdul-baha/light-of-the-world' },
  // Shoghi Effendi
  { id: 'god-passes-by',          urlPath: 'shoghi-effendi/god-passes-by' },
  { id: 'world-order-bahaullah',  urlPath: 'shoghi-effendi/world-order-bahaullah' },
  { id: 'advent-divine-justice',  urlPath: 'shoghi-effendi/advent-divine-justice' },
  { id: 'promised-day-come',      urlPath: 'shoghi-effendi/promised-day-come' },
  { id: 'citadel-faith',          urlPath: 'shoghi-effendi/citadel-faith' },
  { id: 'decisive-hour',          urlPath: 'shoghi-effendi/decisive-hour' },
  { id: 'bahai-administration',   urlPath: 'shoghi-effendi/bahai-administration' },
  // The Báb
  { id: 'selections-writings-bab', urlPath: 'the-bab/selections-writings-bab' },
];

// Load existing output so we can resume if interrupted
function loadExisting() {
  try { return JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); }
  catch { return {}; }
}

function save(data) {
  fs.writeFileSync(OUTPUT, JSON.stringify(data, null, 2));
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function discoverChapters(page, bookId, urlPath) {
  const tocUrl = `${BAHAI_ORG}/library/authoritative-texts/${urlPath}/`;
  console.log(`  Fetching TOC: ${tocUrl}`);
  await page.goto(tocUrl, { waitUntil: 'networkidle2', timeout: 30000 });

  const chapters = await page.evaluate((urlPath) => {
    const pattern = new RegExp(
      `/library/authoritative-texts/${urlPath.replace(/\//g, '\\/')}/([\\w-]+)/?$`
    );
    const seen = new Set();
    const results = [];

    document.querySelectorAll('a[href]').forEach(el => {
      const href = el.getAttribute('href') || '';
      const match = href.match(pattern);
      if (!match) return;
      const seg = match[1];
      if (seen.has(seg) || seg === 'introduction') return;
      seen.add(seg);
      const title = el.textContent?.trim() || `Section ${seg}`;
      if (title.length < 2) return;
      results.push({ seg, title });
    });

    // Sort numerically if all segments are numbers
    const allNumeric = results.every(r => !isNaN(parseInt(r.seg)));
    if (allNumeric) results.sort((a, b) => parseInt(a.seg) - parseInt(b.seg));

    return results;
  }, urlPath);

  return chapters;
}

async function fetchChapterContent(page, urlPath, seg) {
  const url = `${BAHAI_ORG}/library/authoritative-texts/${urlPath}/${seg}/`;
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

  const content = await page.evaluate(() => {
    // Try known content containers
    const selectors = [
      '.library-article__content',
      '.library-article',
      'article',
      'main .content',
      'main',
    ];

    let container = null;
    for (const sel of selectors) {
      container = document.querySelector(sel);
      if (container) break;
    }
    if (!container) container = document.body;

    // Remove nav, header, footer, scripts etc.
    ['nav', 'header', 'footer', 'script', 'style', 'aside',
     '.sidebar', '.navigation', '.breadcrumb', '.back-link',
     '.page-nav', '.library-nav'].forEach(sel => {
      container.querySelectorAll(sel).forEach(el => el.remove());
    });

    const parts = [];
    container.querySelectorAll('p, h1, h2, h3, h4, blockquote').forEach(el => {
      const text = el.textContent?.trim() || '';
      if (text.length < 8) return;

      // Skip nav-like content
      if (/^(next|previous|back|return|table of contents|copyright|all rights)/i.test(text)) return;
      if (text.length < 30 && /^\d+$/.test(text)) return;

      const tag = el.tagName.toLowerCase();
      if (['h1','h2','h3','h4'].includes(tag)) {
        parts.push(`**${text}**`);
      } else {
        parts.push(text);
      }
    });

    return parts.join('\n\n');
  });

  return content;
}

async function main() {
  const data = loadExisting();
  console.log(`Loaded ${Object.keys(data).length} existing entries.\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36'
  );

  let totalSaved = 0;

  for (const book of bookConfigs) {
    console.log(`\n=== ${book.id} ===`);

    let chapters = [];
    try {
      chapters = await discoverChapters(page, book.id, book.urlPath);
      console.log(`  Found ${chapters.length} chapters`);
      await delay(DELAY_MS);
    } catch (e) {
      console.log(`  TOC discovery failed: ${e.message}`);
      continue;
    }

    if (chapters.length === 0) {
      console.log('  No chapters found, skipping.');
      continue;
    }

    for (let i = 0; i < chapters.length; i++) {
      const { seg, title } = chapters[i];
      const key = `${book.urlPath}/${seg}`;
      const chapterKey = `${book.id}/${seg}`;

      if (data[chapterKey] && data[chapterKey].content?.length > 100) {
        console.log(`  [${i+1}/${chapters.length}] ${title} — already cached`);
        continue;
      }

      process.stdout.write(`  [${i+1}/${chapters.length}] ${title}… `);
      try {
        const content = await fetchChapterContent(page, book.urlPath, seg);
        if (content.length < 50) {
          console.log(`too short (${content.length} chars), skipping`);
        } else {
          data[chapterKey] = { title, content };
          save(data);
          totalSaved++;
          console.log(`${content.length} chars`);
        }
      } catch (e) {
        console.log(`ERROR: ${e.message}`);
      }

      await delay(DELAY_MS);
    }

    // Save chapter structure too so the app knows the full chapter list
    data[`${book.id}/__chapters`] = chapters.map((c, i) => ({
      id: `${book.id}-${c.seg}`,
      title: c.title,
      urlSegment: c.seg,
    }));
    save(data);
  }

  await browser.close();
  console.log(`\nDone. Saved ${totalSaved} new chapters to ${OUTPUT}`);
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
