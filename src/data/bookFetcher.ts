import type { BookChapter, BookConfig } from './bookConfig';

const PROXY = 'https://api.allorigins.win/raw?url=';
const BAHAI_ORG = 'https://www.bahai.org';
const STRUCTURE_KEY = 'luminance-book-structure';
const CONTENT_KEY = 'luminance-book-content';

// Static pre-fetched content (populated by scripts/fetch-books.js)
type StaticData = Record<string, { title?: string; content?: string } | BookChapter[]>;
const staticCache: Record<string, StaticData | null> = {};
const loadPromises: Record<string, Promise<StaticData | null>> = {};

async function getStaticBooks(lang = 'en'): Promise<StaticData | null> {
  if (staticCache[lang] !== undefined) return staticCache[lang];
  if (lang in loadPromises) return loadPromises[lang];

  const loader = lang === 'en'
    ? import('./bookContent.json')
    : lang === 'fa'
    ? import('./bookContent-fa.json')
    : lang === 'ar'
    ? import('./bookContent-ar.json')
    : import('./bookContent.json');

  loadPromises[lang] = loader
    .then(mod => { staticCache[lang] = mod.default || mod; return staticCache[lang]; })
    .catch(() => { staticCache[lang] = null; return null; });

  return loadPromises[lang];
}

// ─── Cache helpers ────────────────────────────────────────────────────────────

function getStructureCache(): Record<string, { chapters: BookChapter[]; at: string }> {
  try { return JSON.parse(localStorage.getItem(STRUCTURE_KEY) || '{}'); }
  catch { return {}; }
}

function getContentCache(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem(CONTENT_KEY) || '{}'); }
  catch { return {}; }
}

function saveContent(key: string, text: string) {
  try {
    const cache = getContentCache();
    cache[key] = text;
    localStorage.setItem(CONTENT_KEY, JSON.stringify(cache));
  } catch {
    // QuotaExceededError — skip caching, will re-fetch next time
  }
}

// ─── Chapter discovery ────────────────────────────────────────────────────────

/**
 * Fetches the book's TOC page from bahai.org and parses all chapter links.
 * Falls back to seedChapters if discovery fails or finds nothing.
 */
export async function discoverChapters(config: BookConfig, lang = 'en'): Promise<BookChapter[]> {
  // For non-English languages, check if we have static content
  if (lang !== 'en') {
    const sb = await getStaticBooks(lang);
    const chaptersKey = `${config.id}/__chapters_${lang}`;
    const staticChapters = sb?.[chaptersKey] as BookChapter[] | undefined;
    if (staticChapters && staticChapters.length > 0) return staticChapters;
    // Fall back to English chapters if not available in this language
    return discoverChapters(config, 'en');
  }

  const cache = getStructureCache();

  // Return cached structure if discovered in the last 30 days
  if (cache[config.id]) {
    const age = (Date.now() - new Date(cache[config.id].at).getTime()) / 86_400_000;
    if (age < 30) return cache[config.id].chapters;
  }

  // Check static pre-fetched chapter structure
  const sb = await getStaticBooks();
  const staticChapters = sb?.[`${config.id}/__chapters`] as BookChapter[] | undefined;
  if (staticChapters && staticChapters.length > 0) {
    return staticChapters;
  }

  try {
    const tocUrl = `${BAHAI_ORG}/library/authoritative-texts/${config.urlPath}/`;
    const html = await fetch(`${PROXY}${encodeURIComponent(tocUrl)}`).then(r => r.text());
    const doc = new DOMParser().parseFromString(html, 'text/html');

    // Look for links like /library/authoritative-texts/{urlPath}/N or /N/
    const pattern = new RegExp(
      `\\/library\\/authoritative-texts\\/${config.urlPath.replace(/\//g, '\\/')}\\/([\\w-]+)\\/?$`
    );

    const seen = new Set<string>();
    const chapters: BookChapter[] = [];

    doc.querySelectorAll('a[href]').forEach(el => {
      const href = el.getAttribute('href') || '';
      const match = href.match(pattern);
      if (!match) return;
      const seg = match[1];
      if (seen.has(seg)) return;
      seen.add(seg);

      const title = el.textContent?.trim() || `Section ${seg}`;
      if (title.length < 2) return;

      chapters.push({
        id: `${config.id}-${seg}`,
        title,
        urlSegment: seg,
      });
    });

    // Sort numerically if segments are numbers, else alphabetically
    chapters.sort((a, b) => {
      const na = parseInt(a.urlSegment);
      const nb = parseInt(b.urlSegment);
      if (!isNaN(na) && !isNaN(nb)) return na - nb;
      return a.urlSegment.localeCompare(b.urlSegment);
    });

    const result = chapters.length >= 2 ? chapters : config.seedChapters;

    // Cache the structure
    const sc = getStructureCache();
    sc[config.id] = { chapters: result, at: new Date().toISOString() };
    try { localStorage.setItem(STRUCTURE_KEY, JSON.stringify(sc)); } catch {}

    return result;
  } catch {
    return config.seedChapters;
  }
}

// ─── Content fetching ─────────────────────────────────────────────────────────

/**
 * Returns cached content for a chapter, or null if not cached.
 */
export function getCachedChapter(urlPath: string, urlSegment: string): string | null {
  const cache = getContentCache();
  return cache[`${urlPath}/${urlSegment}`] ?? null;
}

/**
 * Fetches a chapter page from bahai.org, extracts the main text, and caches it.
 */
export async function fetchChapter(urlPath: string, urlSegment: string, bookId?: string, lang = 'en'): Promise<string> {
  const cacheKey = `${urlPath}/${urlSegment}/${lang}`;
  const cached = getContentCache()[cacheKey];
  if (cached) return cached;

  // Check static pre-fetched content in the appropriate language
  if (bookId) {
    const sb = await getStaticBooks(lang);
    const entry = sb?.[`${bookId}/${urlSegment}`] as { title?: string; content?: string } | undefined;
    if (entry?.content && entry.content.length > 50) return entry.content;

    // Fall back to English if not available in requested language
    if (lang !== 'en') {
      const enSb = await getStaticBooks('en');
      const enEntry = enSb?.[`${bookId}/${urlSegment}`] as { title?: string; content?: string } | undefined;
      if (enEntry?.content && enEntry.content.length > 50) return enEntry.content;
    }
  }


  const url = `${BAHAI_ORG}/library/authoritative-texts/${urlPath}/${urlSegment}/`;
  const html = await fetch(`${PROXY}${encodeURIComponent(url)}`).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.text();
  });

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const content = extractContent(doc);

  if (!content) throw new Error('Could not extract content from page.');

  saveContent(cacheKey, content);
  return content;
}

// ─── HTML extraction ──────────────────────────────────────────────────────────

function extractContent(doc: Document): string {
  // Try known bahai.org content containers in priority order
  const selectors = [
    '.library-article__content',
    '.library-article',
    'article',
    'main',
    '.content',
    '#content',
  ];

  let container: Element | null = null;
  for (const sel of selectors) {
    container = doc.querySelector(sel);
    if (container) break;
  }
  if (!container) container = doc.body;

  // Remove nav, header, footer, scripts, sidebars
  ['nav', 'header', 'footer', 'script', 'style', 'aside', '.sidebar',
   '.navigation', '.breadcrumb', '.footnote-wrapper'].forEach(sel => {
    container!.querySelectorAll(sel).forEach(el => el.remove());
  });

  // Collect paragraphs, headings, and list items as plain text
  const parts: string[] = [];
  container.querySelectorAll('p, h1, h2, h3, h4, blockquote, li').forEach(el => {
    const text = el.textContent?.trim() || '';
    if (text.length < 10) return;

    // Skip navigation-like text
    if (/^(next|previous|back|return|table of contents|copyright)/i.test(text)) return;

    const tag = el.tagName.toLowerCase();
    if (['h1', 'h2', 'h3', 'h4'].includes(tag)) {
      parts.push(`**${text}**`);
    } else {
      parts.push(text);
    }
  });

  return parts.join('\n\n');
}

// ─── Utility ──────────────────────────────────────────────────────────────────

export function isChapterCached(urlPath: string, urlSegment: string): boolean {
  return !!getContentCache()[`${urlPath}/${urlSegment}`];
}
