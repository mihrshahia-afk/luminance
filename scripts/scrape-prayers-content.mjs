// Stage 2: for each entry in scripts/prayers-index.json, fetch the page and
// extract structured prayer data. Output: scripts/prayers-content.json.
//
// Each prayer's HTML lives in <div id="prayer">. Inside it:
//   - h2.darker         => title (e.g. "Short Obligatory Prayer")
//   - p.commentcaps     => rubric / instructions (e.g. "To be recited once...")
//                          We keep this as `rubric` field.
//   - p.opening, p      => prayer body (drop p.commentleft / p.commentright,
//                          which are scholarly footnotes by Shoghi Effendi etc.)
//   - h4#author         => author attribution

import * as cheerio from 'cheerio';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const INDEX_PATH = 'scripts/prayers-index.json';
const OUT_PATH = 'scripts/prayers-content.json';

const CONCURRENCY = 4;
const DELAY_MS = 250; // be polite

const sleep = ms => new Promise(r => setTimeout(r, ms));

function parsePrayerPage(html) {
  const $ = cheerio.load(html);
  const $prayer = $('#prayer');
  if (!$prayer.length) return null;

  const title = $prayer.find('h2').first().text().trim();
  const author = $prayer.find('h4#author').first().text().trim();

  // Rubric (instructions)
  const rubric = $prayer.find('p.commentcaps').first().text().trim();

  // Prayer body: every <p> inside #prayer that is NOT a comment paragraph
  // and NOT the rubric.
  const bodyParas = [];
  $prayer.find('p').each((_, el) => {
    const $p = $(el);
    const cls = $p.attr('class') || '';
    if (cls.includes('commentcaps')) return;
    if (cls.includes('commentleft')) return;
    if (cls.includes('commentright')) return;
    if (cls.includes('commentcenter')) return;
    if (cls.includes('source')) return;
    // Drop the dropcap span artifact: leave its single letter at start.
    let text = $p.text();
    text = text.replace(/\s+/g, ' ').trim();
    if (text) bodyParas.push(text);
  });

  return {
    title,
    author,
    rubric: rubric || null,
    paragraphs: bodyParas,
  };
}

async function fetchOne(entry) {
  try {
    const html = await fetch(entry.url, {
      headers: { 'User-Agent': 'luminance-prayer-ingest/1.0' },
    }).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.text();
    });
    const parsed = parsePrayerPage(html);
    if (!parsed) {
      return { ...entry, error: 'no #prayer div' };
    }
    return { ...entry, ...parsed };
  } catch (err) {
    return { ...entry, error: String(err?.message || err) };
  }
}

async function main() {
  const index = JSON.parse(readFileSync(INDEX_PATH, 'utf-8'));
  // Resume support: if output file exists, skip already-done URLs.
  let existing = [];
  if (existsSync(OUT_PATH)) {
    existing = JSON.parse(readFileSync(OUT_PATH, 'utf-8'));
  }
  const doneUrls = new Set(existing.filter(e => !e.error).map(e => e.url));

  const todo = index.filter(e => !doneUrls.has(e.url));
  console.log(`Already done: ${doneUrls.size}, to fetch: ${todo.length}`);

  const results = [...existing.filter(e => !e.error)];

  // Argument: --limit=N to test on a small batch
  const limitArg = process.argv.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : todo.length;

  let i = 0;
  let errors = 0;
  let inFlight = 0;
  let nextIdx = 0;

  return new Promise(resolve => {
    const launch = () => {
      while (inFlight < CONCURRENCY && nextIdx < Math.min(limit, todo.length)) {
        const entry = todo[nextIdx++];
        inFlight++;
        fetchOne(entry).then(async result => {
          results.push(result);
          i++;
          if (result.error) errors++;
          if (i % 10 === 0 || i === limit) {
            console.log(`  ${i}/${limit}  errors=${errors}  last=${result.slug}${result.error ? ' [ERR ' + result.error + ']' : ''}`);
            // Periodic snapshot
            writeFileSync(OUT_PATH, JSON.stringify(results, null, 2));
          }
          await sleep(DELAY_MS);
          inFlight--;
          if (nextIdx < Math.min(limit, todo.length)) launch();
          else if (inFlight === 0) {
            writeFileSync(OUT_PATH, JSON.stringify(results, null, 2));
            console.log(`\nDone. Total: ${results.length}, errors: ${errors}`);
            resolve();
          }
        });
      }
    };
    launch();
  });
}

main().catch(err => { console.error(err); process.exit(1); });
