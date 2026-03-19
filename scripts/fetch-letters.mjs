#!/usr/bin/env node
/**
 * Pre-fetch all UHJ letter content using Puppeteer (headless browser).
 * Saves results to src/data/letterContent.json for static bundling.
 *
 * Usage: node scripts/fetch-letters.mjs
 */

import puppeteer from 'puppeteer';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, '..', 'src', 'data', 'letterContent.json');
const BASE_URL = 'https://www.bahai.org/library/authoritative-texts/the-universal-house-of-justice/messages';

// Read existing content to avoid re-fetching
let existing = {};
if (existsSync(OUTPUT_PATH)) {
  try {
    existing = JSON.parse(readFileSync(OUTPUT_PATH, 'utf-8'));
    console.log(`Found ${Object.keys(existing).length} already-fetched letters.`);
  } catch { /* start fresh */ }
}

// Extract letterIndex entries from the TS source
const indexSrc = readFileSync(join(__dirname, '..', 'src', 'data', 'letterIndex.ts'), 'utf-8');
const entries = [];
const re = /\{\s*id:\s*'([^']+)'.*?urlCode:\s*'([^']+)'/gs;
let m;
while ((m = re.exec(indexSrc)) !== null) {
  entries.push({ id: m[1], urlCode: m[2] });
}
console.log(`Found ${entries.length} letters in index.`);

// Filter out already-fetched
const toFetch = entries.filter(e => !existing[e.id] || existing[e.id].length < 100);
console.log(`Need to fetch ${toFetch.length} letters.\n`);

if (toFetch.length === 0) {
  console.log('All letters already fetched!');
  process.exit(0);
}

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 800 });

// Block images/css/fonts to speed things up
await page.setRequestInterception(true);
page.on('request', req => {
  const type = req.resourceType();
  if (['image', 'stylesheet', 'font', 'media'].includes(type)) {
    req.abort();
  } else {
    req.continue();
  }
});

const SKIP_PHRASES = [
  'Please enter', 'More about', 'Document link', 'Links to specific',
  'reference link', 'About downloads', 'Publications are',
  'Copyright and terms', 'Copy With Reference'
];

let fetched = 0;
let failed = 0;

for (const entry of toFetch) {
  const url = `${BASE_URL}/${entry.urlCode}/1`;
  console.log(`[${fetched + failed + 1}/${toFetch.length}] Fetching ${entry.id}...`);

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
    await new Promise(r => setTimeout(r, 5000));

    const content = await page.evaluate((skipPhrases) => {
      const ps = document.querySelectorAll('p');
      const texts = [];
      let contentStarted = false;

      for (const p of ps) {
        const t = p.textContent?.trim();
        if (!t || t.length < 3) continue;
        if (skipPhrases.some(s => t.startsWith(s))) continue;
        if (t.includes('International Community')) continue;

        // Content starts with translation note, date, greeting, or structured header
        if (!contentStarted && (
          t.includes('TRANSLATION') ||
          /^\d{1,2}\s+\w+\s+\d{4}/.test(t) ||
          /^\w+\s+\d{4}$/.test(t) ||
          t.startsWith('Dear') ||
          t.startsWith('To the') ||
          t.startsWith('To all') ||
          t.startsWith('To an') ||
          t.startsWith('Dearly') ||
          t.startsWith('The Universal House of Justice') ||
          t.startsWith('TO:') ||
          t.startsWith('DATE:') ||
          t.startsWith('MESSAGE:')
        )) {
          contentStarted = true;
        }
        if (contentStarted) texts.push('<p>' + t + '</p>');
      }
      return texts.join('\n');
    }, SKIP_PHRASES);

    if (content && content.length > 100) {
      existing[entry.id] = content;
      fetched++;
      console.log(`  Got ${content.length} chars`);
    } else {
      console.log(`  Content too short (${content?.length || 0} chars), skipping`);
      failed++;
    }

    // Save progress after each fetch
    writeFileSync(OUTPUT_PATH, JSON.stringify(existing, null, 2));

    // Small delay to be respectful
    await new Promise(r => setTimeout(r, 1500));

  } catch (err) {
    console.log(`  Error: ${err.message}`);
    failed++;
  }
}

await browser.close();

// Final save
writeFileSync(OUTPUT_PATH, JSON.stringify(existing, null, 2));
console.log(`\nDone! Fetched: ${fetched}, Failed: ${failed}, Total saved: ${Object.keys(existing).length}`);
