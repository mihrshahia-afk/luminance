import { letterIndex } from './letterIndex';
import { getAllLetters } from './letterDiscovery';
import type { LetterEntry } from './letterIndex';
import type { UHJLetter } from '../types';

const CACHE_KEY = 'luminance-letter-cache';
const OWN_PROXY = '/api/proxy?url=';
const FALLBACK_PROXY = 'https://api.allorigins.win/raw?url=';
const BAHAI_ORG = 'https://www.bahai.org';

// Lazy-loaded static content from the pre-fetch script
let staticContent: Record<string, string> | null = null;
let staticLoadPromise: Promise<Record<string, string>> | null = null;

async function getStaticContent(): Promise<Record<string, string>> {
  if (staticContent !== null) return staticContent;
  if (staticLoadPromise) return staticLoadPromise;

  staticLoadPromise = import('./letterContent.json')
    .then(mod => {
      staticContent = mod.default || mod;
      return staticContent as Record<string, string>;
    })
    .catch(() => {
      staticContent = {};
      return staticContent;
    });

  return staticLoadPromise;
}

function getCache(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveCache(id: string, content: string) {
  try {
    const cache = getCache();
    cache[id] = content;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch { /* QuotaExceededError */ }
}

async function proxyFetch(url: string): Promise<string> {
  try {
    const r = await fetch(`${OWN_PROXY}${encodeURIComponent(url)}`);
    if (r.ok) return await r.text();
  } catch { /* fall through */ }
  const r = await fetch(`${FALLBACK_PROXY}${encodeURIComponent(url)}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.text();
}

function extractLetterText(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');

  // Remove nav, header, footer, scripts
  ['nav', 'header', 'footer', 'script', 'style', 'aside', '.sidebar',
   '.navigation', '.breadcrumb'].forEach(sel => {
    doc.querySelectorAll(sel).forEach(el => el.remove());
  });

  // Try known content containers
  const selectors = ['.library-article__content', '.library-article', 'article', 'main', '.content'];
  let container: Element | null = null;
  for (const sel of selectors) {
    container = doc.querySelector(sel);
    if (container) break;
  }
  if (!container) container = doc.body;

  // Collect paragraphs as HTML
  const parts: string[] = [];
  container.querySelectorAll('p, h1, h2, h3, h4, blockquote').forEach(el => {
    const text = el.textContent?.trim() || '';
    if (text.length < 5) return;
    if (/^(next|previous|back|return|table of contents|copyright)/i.test(text)) return;

    const tag = el.tagName.toLowerCase();
    if (['h1', 'h2', 'h3', 'h4'].includes(tag)) {
      parts.push(`<h3>${text}</h3>`);
    } else {
      parts.push(`<p>${text}</p>`);
    }
  });

  return parts.join('\n');
}

/** Find a letter entry by urlCode — checks both static index and discovered letters */
export function findLetter(urlCode: string): LetterEntry | undefined {
  return getAllLetters().find(l => l.urlCode === urlCode);
}

export async function fetchLetterContent(urlCode: string): Promise<string> {
  const entry = findLetter(urlCode);
  if (!entry) throw new Error('Letter not found');

  // 1. Check static pre-fetched content
  const content = await getStaticContent();
  if (content[entry.id] && content[entry.id].length > 100) {
    return content[entry.id];
  }

  // 2. Check localStorage cache
  const cache = getCache();
  if (cache[entry.id]) {
    return cache[entry.id];
  }

  // 3. Fetch live from bahai.org through our proxy
  const url = `${BAHAI_ORG}/library/authoritative-texts/the-universal-house-of-justice/messages/${urlCode}/1`;
  const html = await proxyFetch(url);
  const extracted = extractLetterText(html);

  if (!extracted || extracted.length < 50) {
    throw new Error('Could not extract letter content. Read it on bahai.org.');
  }

  // Cache for offline access
  saveCache(entry.id, extracted);
  return extracted;
}

export function getLettersAsUHJ(): UHJLetter[] {
  const cache = getCache();
  const sc = staticContent || {};
  return letterIndex.map(entry => ({
    id: entry.id,
    title: entry.title,
    date: entry.date,
    recipient: entry.recipient,
    content: sc[entry.id] || cache[entry.id] || '',
  }));
}

export function isLetterCached(id: string): boolean {
  const sc = staticContent || {};
  return !!(sc[id] && sc[id].length > 100) || !!getCache()[id];
}

export function getCachedLetterCount(): number {
  const sc = staticContent || {};
  const staticCount = Object.keys(sc).filter(k => sc[k]?.length > 100).length;
  const cacheCount = Object.keys(getCache()).length;
  return Math.max(staticCount, cacheCount);
}
