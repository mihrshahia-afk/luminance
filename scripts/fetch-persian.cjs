const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, '..', 'src', 'data', 'bookContent-fa.json');
const BASE = 'https://www.bahai.org/fa/library/authoritative-texts';

const PERSIAN_BOOKS = [
  { id: 'hidden-words', path: 'bahaullah/hidden-words', pages: 4 },
  { id: 'iqan', path: 'bahaullah/kitab-i-iqan', pages: 10 },
  { id: 'aqdas', path: 'bahaullah/kitab-i-aqdas', pages: 12 },
  { id: 'seven-valleys', path: 'bahaullah/call-divine-beloved', pages: 8 },
  { id: 'epistle-son-wolf', path: 'bahaullah/epistle-son-wolf', pages: 6 },
  { id: 'prayers-meditations', path: 'bahaullah/prayers-meditations', pages: 8 },
  { id: 'gleanings', path: 'bahaullah/gleanings-writings-bahaullah', pages: 10 },
  { id: 'summons-lord-hosts', path: 'bahaullah/summons-lord-hosts', pages: 10 },
  { id: 'gems-divine-mysteries', path: 'bahaullah/gems-divine-mysteries', pages: 4 },
  { id: 'days-remembrance', path: 'bahaullah/days-remembrance', pages: 8 },
  { id: 'tabernacle-unity', path: 'bahaullah/tabernacle-unity', pages: 6 },
  { id: 'tablets-bahaullah', path: 'bahaullah/tablets-bahaullah', pages: 12 },
];

function loadExisting() {
  try { return JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); }
  catch { return {}; }
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchPage(page, url) {
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
  await delay(3000);

  // Scroll down repeatedly to trigger lazy content loading
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => window.scrollBy(0, 800));
    await delay(500);
  }
  // Scroll back to top and wait
  await page.evaluate(() => window.scrollTo(0, 0));
  await delay(2000);
  // Scroll all the way down once more
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await delay(3000);

  const result = await page.evaluate(() => {
    const container = document.querySelector('.js-document-content') || document.body;
    const text = (container.innerText || container.textContent || '').trim()
      .replace(/^ادامهٔ مطالعه\s*/, '') // "Continue reading" in Persian
      .replace(/^Continue reading\s*/, '');
    const title = document.querySelector('h1')?.textContent?.trim() ||
                  document.querySelector('.js-document-title')?.textContent?.trim() || '';
    return { title, content: text };
  });

  return result;
}

async function main() {
  const data = loadExisting();
  console.log('Existing entries: ' + Object.keys(data).length);

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  let totalDownloaded = 0;

  for (const book of PERSIAN_BOOKS) {
    console.log('\n=== ' + book.id + ' ===');
    const chapters = [];

    for (let p = 2; p <= book.pages; p++) {
      const key = book.id + '/fa-' + p;
      if (data[key] && data[key].content && data[key].content.length > 200) {
        console.log('  Page ' + p + ': cached (' + Math.round(data[key].content.length / 1024) + 'KB)');
        chapters.push({ id: book.id + '-fa-' + p, title: data[key].title || 'Page ' + p, urlSegment: 'fa-' + p });
        continue;
      }

      const url = BASE + '/' + book.path + '/' + p + '/';
      console.log('  Page ' + p + ': fetching...');

      try {
        const result = await fetchPage(page, url);

        if (result.content && result.content.length > 200) {
          data[key] = { title: result.title, content: result.content };
          chapters.push({ id: book.id + '-fa-' + p, title: result.title || 'Page ' + p, urlSegment: 'fa-' + p });
          console.log('  Page ' + p + ': ' + Math.round(result.content.length / 1024) + 'KB - ' + (result.title || '').slice(0, 40));
          totalDownloaded++;
        } else {
          console.log('  Page ' + p + ': empty (' + (result.content?.length || 0) + ' chars) - skipping remaining pages');
          break;
        }
      } catch (err) {
        console.log('  Page ' + p + ': ERROR - ' + err.message);
      }

      await delay(1500);
    }

    if (chapters.length > 0) {
      data[book.id + '/__chapters_fa'] = chapters;
      console.log('  Total: ' + chapters.length + ' pages');
    }

    fs.writeFileSync(OUTPUT, JSON.stringify(data, null, 2));
  }

  await browser.close();
  console.log('\nDone! Downloaded ' + totalDownloaded + ' new pages. Total entries: ' + Object.keys(data).length);
}

main().catch(console.error);
