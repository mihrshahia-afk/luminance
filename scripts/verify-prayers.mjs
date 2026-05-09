// Verifier: cross-reference each existing prayer in prayers.ts against the
// 288 prayer pages on bahaiprayers.org. Marks each as VERIFIED (authentic)
// or UNVERIFIED (likely hallucinated and should be pruned).
//
// Strategy:
//   1. Fetch all 288 prayer pages once, into a gitignored cache.
//   2. Normalise each fetched page's body text (strip punctuation, lowercase,
//      collapse whitespace).
//   3. For each existing prayer, build the same normalised form, then take a
//      ~12-word distinctive phrase from the middle (avoids common openings
//      like "O my God!").
//   4. Search the corpus for that phrase. If found, VERIFIED; else UNVERIFIED.
//
// Outputs:
//   - scripts/verification-report.json (the full table)
//   - prints summary to stdout
//
// The fetched page text is cached at scripts/.bahaiprayers-cache/*.json
// (gitignored). Only the verification report is committed.

import * as cheerio from 'cheerio';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import path from 'path';

const INDEX_PATH = 'scripts/prayers-index.json';
const EXISTING_PATH = 'scripts/existing-prayers.json';
const CACHE_DIR = 'scripts/.bahaiprayers-cache';
const REPORT_PATH = 'scripts/verification-report.json';

const CONCURRENCY = 4;
const DELAY_MS = 200;
const sleep = ms => new Promise(r => setTimeout(r, ms));

function normalise(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/\p{M}/gu, '') // strip diacritics
    .replace(/[‘’ʻʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseBody(html) {
  const $ = cheerio.load(html);
  const $prayer = $('#prayer');
  if (!$prayer.length) return '';
  const paras = [];
  $prayer.find('p').each((_, el) => {
    const $p = $(el);
    const cls = $p.attr('class') || '';
    if (/comment|source/.test(cls)) return;
    paras.push($p.text());
  });
  return paras.join(' ');
}

async function fetchAndCache(entry) {
  const cachePath = path.join(CACHE_DIR, entry.slug + '.txt');
  if (existsSync(cachePath)) {
    return readFileSync(cachePath, 'utf-8');
  }
  const html = await fetch(entry.url, {
    headers: { 'User-Agent': 'luminance-prayer-verifier/1.0' },
  }).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.text();
  });
  const body = parseBody(html);
  writeFileSync(cachePath, body);
  await sleep(DELAY_MS);
  return body;
}

async function buildCorpus() {
  if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
  const index = JSON.parse(readFileSync(INDEX_PATH, 'utf-8'));
  const corpus = [];
  let i = 0;
  let inFlight = 0;
  let nextIdx = 0;
  return new Promise((resolve, reject) => {
    const launch = () => {
      while (inFlight < CONCURRENCY && nextIdx < index.length) {
        const entry = index[nextIdx++];
        inFlight++;
        fetchAndCache(entry)
          .then(body => {
            corpus.push({ slug: entry.slug, url: entry.url, body, normalised: normalise(body) });
          })
          .catch(err => {
            corpus.push({ slug: entry.slug, url: entry.url, body: '', normalised: '', error: String(err.message || err) });
          })
          .finally(() => {
            i++;
            if (i % 25 === 0) console.log(`  corpus: ${i}/${index.length}`);
            inFlight--;
            if (nextIdx < index.length) launch();
            else if (inFlight === 0) resolve(corpus);
          });
      }
    };
    launch();
  });
}

function pickPhrases(normalisedText) {
  const words = normalisedText.split(' ').filter(Boolean);
  if (words.length < 8) return [words.join(' ')];
  // Try 5 different windows of 8 words across the prayer; ANY match passes.
  // This handles paragraph-break variations, dropcap quirks, etc.
  const wordCount = Math.min(8, Math.max(6, Math.floor(words.length / 4)));
  const phrases = new Set();
  const positions = [0.15, 0.30, 0.50, 0.70, 0.85];
  for (const pct of positions) {
    let start = Math.floor((words.length - wordCount) * pct);
    if (start < 0) start = 0;
    const phrase = words.slice(start, start + wordCount).join(' ');
    if (phrase.length >= 25) phrases.add(phrase);
  }
  // Also try a 6-word phrase from the very middle, more lenient
  const midStart = Math.max(0, Math.floor(words.length / 2) - 3);
  phrases.add(words.slice(midStart, midStart + 6).join(' '));
  return [...phrases].filter(p => p.length >= 20);
}

async function main() {
  console.log('Building corpus from bahaiprayers.org (cached at scripts/.bahaiprayers-cache/)...');
  const corpus = await buildCorpus();
  const valid = corpus.filter(c => c.normalised.length > 50);
  console.log(`Corpus ready: ${valid.length} prayers with content (of ${corpus.length} fetched)`);

  // Build a giant single string for fast indexOf matching.
  // Use a separator that won't appear in normalised text.
  const sep = '|||';
  const bigText = sep + valid.map(c => c.normalised).join(sep) + sep;

  const existing = JSON.parse(readFileSync(EXISTING_PATH, 'utf-8'));
  const report = [];
  let verifiedCount = 0;

  for (const p of existing) {
    const normalised = normalise(p.text);
    const phrases = pickPhrases(normalised);
    let verified = false;
    let matchSlug = null;
    let matchedPhrase = null;

    for (const phrase of phrases) {
      const idx = bigText.indexOf(phrase);
      if (idx !== -1) {
        verified = true;
        matchedPhrase = phrase;
        const before = bigText.slice(0, idx);
        const segIdx = (before.match(/\|\|\|/g) || []).length - 1;
        if (segIdx >= 0 && segIdx < valid.length) {
          matchSlug = valid[segIdx].slug;
        }
        break;
      }
    }

    if (verified) verifiedCount++;
    report.push({
      id: p.id,
      topic: p.topic,
      title: p.title || null,
      verified,
      matchSlug,
      phrasePreview: (matchedPhrase || phrases[0] || '').slice(0, 60),
      textPreviewLen: normalised.length,
    });
  }

  console.log(`\nVerified: ${verifiedCount} / ${existing.length}`);
  console.log(`Unverified: ${existing.length - verifiedCount}`);

  // Group unverified by topic
  const byTopic = {};
  for (const r of report) {
    if (!r.verified) {
      byTopic[r.topic] = (byTopic[r.topic] || 0) + 1;
    }
  }
  console.log('\nUnverified count by topic:');
  for (const [t, n] of Object.entries(byTopic).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${n.toString().padStart(3)}  ${t}`);
  }

  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
  console.log(`\nWrote ${REPORT_PATH}`);
}

main().catch(err => { console.error(err); process.exit(1); });
