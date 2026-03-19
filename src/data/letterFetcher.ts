import { letterIndex } from './letterIndex';
import type { UHJLetter } from '../types';

const CACHE_KEY = 'luminance-letter-cache';

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

export async function fetchLetterContent(urlCode: string): Promise<string> {
  const entry = letterIndex.find(l => l.urlCode === urlCode);
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

  // 3. Content not available
  throw new Error(
    'This letter has not been downloaded yet. You can read it directly on bahai.org.'
  );
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
