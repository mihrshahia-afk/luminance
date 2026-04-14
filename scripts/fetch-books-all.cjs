/**
 * Fetches all book chapters from the Bahá'í Reference Library using Puppeteer.
 * Uses known page ranges instead of TOC discovery (more reliable).
 * Run with: node scripts/fetch-books-all.cjs
 * Output: src/data/bookContent.json
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, '../src/data/bookContent.json');
const BAHAI_ORG = 'https://www.bahai.org';
const DELAY_MS = 1500;

// All books with their known page ranges
const bookConfigs = [
  // Bahá'u'lláh
  { id: 'hidden-words', urlPath: 'bahaullah/hidden-words', pages: ['1','2'] },
  { id: 'seven-valleys', urlPath: 'bahaullah/call-divine-beloved', pages: ['2','3','4','5','6','7','8','9','10'] },
  { id: 'gleanings', urlPath: 'bahaullah/gleanings-writings-bahaullah', pages: ['1','2','3','4','5'] },
  { id: 'iqan', urlPath: 'bahaullah/kitab-i-iqan', pages: ['1','2'] },
  { id: 'aqdas', urlPath: 'bahaullah/kitab-i-aqdas', pages: ['1','2','3','4','5'] },
  { id: 'epistle-son-wolf', urlPath: 'bahaullah/epistle-son-wolf', pages: ['1','2','3'] },
  { id: 'prayers-meditations', urlPath: 'bahaullah/prayers-meditations', pages: ['1','2','3','4','5','6','7','8'] },
  { id: 'tablets-bahaullah', urlPath: 'bahaullah/tablets-bahaullah', pages: ['1','2','3','4','5','6','7','8'] },
  { id: 'summons-lord-hosts', urlPath: 'bahaullah/summons-lord-hosts', pages: ['2','3','4','5','6','7','8','9','10','11','12','13','14','15'] },
  { id: 'gems-divine-mysteries', urlPath: 'bahaullah/gems-divine-mysteries', pages: ['2','3','4','5'] },
  { id: 'days-remembrance', urlPath: 'bahaullah/days-remembrance', pages: ['2','3','4','5','6','7','8','9','10','11'] },
  { id: 'tabernacle-unity', urlPath: 'bahaullah/tabernacle-unity', pages: ['2','3','4','5','6','7','8'] },
  // 'Abdu'l-Bahá
  { id: 'paris-talks', urlPath: 'abdul-baha/paris-talks', pages: ['1','2','3'] },
  { id: 'promulgation', urlPath: 'abdul-baha/promulgation-universal-peace', pages: ['1','2','3','4'] },
  { id: 'some-answered-questions', urlPath: 'abdul-baha/some-answered-questions', pages: ['1','2','3','4','5'] },
  { id: 'selections-writings-abdul-baha', urlPath: 'abdul-baha/selections-writings-abdul-baha', pages: ['2','3','4','5','6','7','8','9','10','11','12'] },
  { id: 'secret-divine-civilization', urlPath: 'abdul-baha/secret-divine-civilization', pages: ['1','2','3'] },
  { id: 'memorials-faithful', urlPath: 'abdul-baha/memorials-faithful', pages: ['2','3','4','5','6','7'] },
  { id: 'will-testament', urlPath: 'abdul-baha/will-testament-abdul-baha', pages: ['1','2','3'] },
  { id: 'tablets-divine-plan', urlPath: 'abdul-baha/tablets-divine-plan', pages: ['2','3','4','5','6','7','8','9','10','11','12','13','14','15'] },
  { id: 'travelers-narrative', urlPath: 'abdul-baha/travelers-narrative', pages: ['1','2','3','4'] },
  { id: 'light-of-the-world', urlPath: 'abdul-baha/light-of-the-world', pages: ['1','2','3','4','5'] },
  // Shoghi Effendi
  { id: 'god-passes-by', urlPath: 'shoghi-effendi/god-passes-by', pages: ['2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27'] },
  { id: 'world-order-bahaullah', urlPath: 'shoghi-effendi/world-order-bahaullah', pages: ['2','3','4','5','6','7','8','9','10'] },
  { id: 'advent-divine-justice', urlPath: 'shoghi-effendi/advent-divine-justice', pages: ['2','3','4','5'] },
  { id: 'promised-day-come', urlPath: 'shoghi-effendi/promised-day-come', pages: ['1','2','3'] },
  { id: 'citadel-faith', urlPath: 'shoghi-effendi/citadel-faith', pages: ['1','2','3','4','5'] },
  { id: 'decisive-hour', urlPath: 'shoghi-effendi/decisive-hour', pages: ['1','2','3','4','5'] },
  { id: 'bahai-administration', urlPath: 'shoghi-effendi/bahai-administration', pages: ['1','2','3','4','5'] },
  // The Báb
  { id: 'selections-writings-bab', urlPath: 'the-bab/selections-writings-bab', pages: ['2','3','4','5','6','7','8','9'] },
];

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

async function fetchPage(page, urlPath, seg) {
  const url = `${BAHAI_ORG}/library/authoritative-texts/${urlPath}/${seg}/`;
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

  const result = await page.evaluate(() => {
    const selectors = ['.library-article__content', '.library-article', 'article', 'main .content', 'main'];
    let container = null;
    for (const sel of selectors) {
      container = document.querySelector(sel);
      if (container) break;
    }
    if (!container) container = document.body;

    ['nav','header','footer','script','style','aside','.sidebar','.navigation','.breadcrumb','.back-link','.page-nav','.library-nav'].forEach(sel => {
      container.querySelectorAll(sel).forEach(el => el.remove());
    });

    const h1 = container.querySelector('h1');
    const title = h1?.textContent?.trim() || '';

    const parts = [];
    container.querySelectorAll('p, h1, h2, h3, h4, blockquote').forEach(el => {
      const text = el.textContent?.trim() || '';
      if (text.length < 8) return;
      if (/^(next|previous|back|return|table of contents|copyright|all rights)/i.test(text)) return;
      if (text.length < 30 && /^\d+$/.test(text)) return;
      const tag = el.tagName.toLowerCase();
      if (['h1','h2','h3','h4'].includes(tag)) parts.push(`**${text}**`);
      else parts.push(text);
    });

    return { title, content: parts.join('\n\n') };
  });

  return result;
}

async function main() {
  const data = loadExisting();
  console.log(`Loaded ${Object.keys(data).length} existing entries.\n`);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36');
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (['image','font','media'].includes(req.resourceType())) req.abort();
    else req.continue();
  });

  let totalSaved = 0;

  for (const book of bookConfigs) {
    console.log(`\n=== ${book.id} ===`);
    const chapters = [];

    for (let i = 0; i < book.pages.length; i++) {
      const seg = book.pages[i];
      const key = `${book.id}/${seg}`;

      if (data[key] && data[key].content?.length > 100) {
        console.log(`  [${i+1}/${book.pages.length}] Page ${seg} — cached (${data[key].content.length} chars)`);
        chapters.push({ id: `${book.id}-${seg}`, title: data[key].title || `Section ${seg}`, urlSegment: seg });
        continue;
      }

      process.stdout.write(`  [${i+1}/${book.pages.length}] Page ${seg}… `);
      try {
        const result = await fetchPage(page, book.urlPath, seg);
        if (result.content.length < 50) {
          console.log(`too short (${result.content.length} chars), skipping`);
        } else {
          data[key] = { title: result.title || `Section ${seg}`, content: result.content };
          chapters.push({ id: `${book.id}-${seg}`, title: result.title || `Section ${seg}`, urlSegment: seg });
          save(data);
          totalSaved++;
          console.log(`${result.content.length} chars — "${(result.title || '').slice(0, 50)}"`);
        }
      } catch (e) {
        console.log(`ERROR: ${e.message}`);
      }

      await delay(DELAY_MS);
    }

    if (chapters.length > 0) {
      data[`${book.id}/__chapters`] = chapters;
      save(data);
      console.log(`  → Saved ${chapters.length} chapters for ${book.id}`);
    }
  }

  await browser.close();
  console.log(`\nDone. Saved ${totalSaved} new chapters to ${OUTPUT}`);
  console.log(`Total entries: ${Object.keys(data).length}`);
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
