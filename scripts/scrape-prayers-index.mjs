// Stage 1: scrape the bahaiprayers.org index to extract
//   { category, prayerUrl, firstLineOrTitle }[]
// Output: scripts/prayers-index.json

import * as cheerio from 'cheerio';
import { writeFileSync } from 'fs';

const BASE = 'https://www.bahaiprayers.org';
const INDEX_URL = `${BASE}/indexlong.htm`;

async function main() {
  const html = await fetch(INDEX_URL).then(r => r.text());
  const $ = cheerio.load(html);

  // The page uses <h3> for top-level categories and nested lists for entries.
  // Some categories have sub-headers like "— Infants —" which we'll capture
  // as a sub-category note.
  const entries = [];
  let currentCategory = null;
  let currentSubcategory = null;

  // Walk the DOM in document order so we know which heading a link sits under.
  // We look at <h3>, <h4>, <h5>, em/strong markers, and <a> elements.
  $('body *').each((_, el) => {
    const $el = $(el);
    const tag = el.tagName?.toLowerCase();

    if (tag === 'h2' || tag === 'h3') {
      const txt = $el.text().trim();
      if (txt) {
        currentCategory = txt;
        currentSubcategory = null;
      }
      return;
    }

    if (tag === 'h4' || tag === 'h5' || tag === 'h6') {
      const txt = $el.text().trim();
      // Sub-headers like "— Infants —" or "— Healing —"
      if (txt && txt.length < 60) {
        currentSubcategory = txt.replace(/^[—\-\s]+|[—\-\s]+$/g, '').trim() || null;
      }
      return;
    }

    if (tag === 'a') {
      const href = $el.attr('href');
      if (!href) return;
      // Only individual prayer pages on this site (relative .htm files)
      if (!/^[a-z0-9_-]+\.htm$/i.test(href)) return;
      // Skip ALL index/navigational pages
      const lower = href.toLowerCase();
      if (lower.startsWith('index')) return;
      const SKIP = new Set([
        'about.htm', 'contact.htm', 'languages.htm', 'search.htm', 'home.htm',
        'bahaifaith.htm', 'shoghi.htm', 'sources.htm', 'help.htm', 'feedback.htm',
        'links.htm', 'sitemap.htm', 'donate.htm', 'subscribe.htm',
      ]);
      if (SKIP.has(lower)) return;
      // Skip if the link text looks like a navigation label rather than a prayer
      // (prayer links are either descriptive titles or first lines).
      const navLabels = new Set([
        'home', 'about', 'contact', 'search', 'languages', 'next', 'previous',
        'top', 'index', 'back', 'help', 'sources', 'all prayers',
      ]);
      if (navLabels.has(text.toLowerCase())) return;

      const text = $el.text().trim().replace(/\s+/g, ' ');
      if (!text) return;

      entries.push({
        category: currentCategory,
        subcategory: currentSubcategory,
        firstLineOrTitle: text,
        url: `${BASE}/${href}`,
        slug: href.replace(/\.htm$/i, ''),
      });
    }
  });

  // Dedupe by URL keeping first occurrence (so we keep the first category an
  // entry appears under).
  const seen = new Set();
  const unique = [];
  for (const e of entries) {
    if (seen.has(e.url)) continue;
    seen.add(e.url);
    unique.push(e);
  }

  // Quick stats
  const byCategory = {};
  for (const e of unique) {
    const k = e.category || '(uncategorized)';
    byCategory[k] = (byCategory[k] || 0) + 1;
  }

  console.log(`Total unique prayer URLs: ${unique.length}`);
  console.log('Categories:');
  for (const [cat, n] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${n.toString().padStart(4)}  ${cat}`);
  }

  writeFileSync('scripts/prayers-index.json', JSON.stringify(unique, null, 2));
  console.log(`\nWrote scripts/prayers-index.json (${unique.length} entries)`);
}

main().catch(err => { console.error(err); process.exit(1); });
