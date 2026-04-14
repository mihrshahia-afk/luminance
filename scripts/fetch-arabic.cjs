const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, '..', 'src', 'data', 'bookContent-ar.json');
const BASE = 'https://www.bahai.org/ar/library/authoritative-texts';

// Arabic books — using the same bahai.org structure but /ar/ prefix
// reference.bahai.org/ar has downloads but bahai.org/ar may have web-readable versions
const ARABIC_BOOKS = [
  { id: 'hidden-words', path: 'bahaullah/hidden-words', pages: 4 },
  { id: 'iqan', path: 'bahaullah/kitab-i-iqan', pages: 10 },
  { id: 'aqdas', path: 'bahaullah/kitab-i-aqdas', pages: 12 },
  { id: 'gleanings', path: 'bahaullah/gleanings-writings-bahaullah', pages: 10 },
  { id: 'prayers-meditations', path: 'bahaullah/prayers-meditations', pages: 8 },
  { id: 'tablets-bahaullah', path: 'bahaullah/tablets-bahaullah', pages: 12 },
  { id: 'gems-divine-mysteries', path: 'bahaullah/gems-divine-mysteries', pages: 4 },
  { id: 'summons-lord-hosts', path: 'bahaullah/summons-lord-hosts', pages: 10 },
];

function loadExisting() {
  try { return JSON.parse(fs.readFileSync(OUTPUT, 'utf8')); }
  catch { return {}; }
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const data = loadExisting();
  console.log('Existing entries: ' + Object.keys(data).length);

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  for (const book of ARABIC_BOOKS) {
    console.log('\n=== ' + book.id + ' (Arabic) ===');
    const chapters = [];

    for (let p = 2; p <= book.pages; p++) {
      const key = book.id + '/ar-' + p;
      if (data[key] && data[key].content && data[key].content.length > 200) {
        console.log('  Page ' + p + ': cached (' + Math.round(data[key].content.length / 1024) + 'KB)');
        chapters.push({ id: book.id + '-ar-' + p, title: data[key].title || 'Page ' + p, urlSegment: 'ar-' + p });
        continue;
      }

      const url = BASE + '/' + book.path + '/' + p + '/';
      console.log('  Page ' + p + ': fetching ' + url);

      try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
        await delay(3000);

        // Scroll to trigger lazy content loading
        for (let s = 0; s < 15; s++) {
          await page.evaluate(() => window.scrollBy(0, 500));
          await delay(400);
        }
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await delay(3000);

        const result = await page.evaluate(() => {
          const container = document.querySelector('.js-document-content') || document.body;
          const text = (container.innerText || container.textContent || '').trim()
            .replace(/^Continue reading\s*/, '')
            .replace(/^متابعة القراءة\s*/, '');
          const title = document.querySelector('h1')?.textContent?.trim() || '';
          return { title, content: text };
        });

        if (result.content && result.content.length > 100) {
          data[key] = { title: result.title, content: result.content };
          chapters.push({ id: book.id + '-ar-' + p, title: result.title || 'Page ' + p, urlSegment: 'ar-' + p });
          console.log('  Page ' + p + ': ' + Math.round(result.content.length / 1024) + 'KB');
        } else {
          console.log('  Page ' + p + ': empty or too short (' + result.content.length + ' chars)');
          break;
        }
      } catch (err) {
        console.log('  Page ' + p + ': ERROR - ' + err.message);
      }

      await delay(2000);
    }

    if (chapters.length > 0) {
      data[book.id + '/__chapters_ar'] = chapters;
      console.log('  Total: ' + chapters.length + ' pages');
    }

    fs.writeFileSync(OUTPUT, JSON.stringify(data, null, 2));
  }

  await browser.close();
  console.log('\nDone! Total entries: ' + Object.keys(data).length);
}

main().catch(console.error);
