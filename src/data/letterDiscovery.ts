import type { LetterEntry } from './letterIndex';
import { letterIndex } from './letterIndex';

const OWN_PROXY = '/api/proxy?url=';
const FALLBACK_PROXY = 'https://api.allorigins.win/raw?url=';
const MESSAGES_URL = 'https://www.bahai.org/library/authoritative-texts/the-universal-house-of-justice/messages/';

async function proxyFetch(url: string): Promise<string> {
  try {
    const r = await fetch(`${OWN_PROXY}${encodeURIComponent(url)}`);
    if (r.ok) return await r.text();
  } catch { /* fall through */ }
  const r = await fetch(`${FALLBACK_PROXY}${encodeURIComponent(url)}`);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.text();
}
const DISCOVERED_KEY = 'luminance-discovered-letters-v2';

function getDiscovered(): LetterEntry[] {
  try {
    return JSON.parse(localStorage.getItem(DISCOVERED_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveDiscovered(letters: LetterEntry[]) {
  try {
    localStorage.setItem(DISCOVERED_KEY, JSON.stringify(letters));
  } catch {}
}

// Guard against running multiple times in the same session
let discoveryRanThisSession = false;

export function getDiscoveredLetters(): LetterEntry[] {
  return getDiscovered();
}

export function getAllLetters(): LetterEntry[] {
  const staticIds = new Set(letterIndex.map(l => l.id));
  const discovered = getDiscovered().filter(l => !staticIds.has(l.id));
  return [...discovered, ...letterIndex].sort((a, b) => b.date.localeCompare(a.date));
}

export async function runAutoDiscovery(): Promise<{ found: number }> {
  if (discoveryRanThisSession) return { found: 0 };
  discoveryRanThisSession = true;

  try {
    const html = await proxyFetch(MESSAGES_URL);

    // Parse the HTML — extract date codes directly from the raw HTML
    // rather than relying on DOMParser + querySelectorAll, which can
    // behave differently across browsers with relative URLs.
    const linkPattern = /href="[^"]*?(\d{8}_\d{3})[^"]*"/g;
    const staticIds = new Set(letterIndex.map(l => l.id));
    const existingDiscovered = new Map(getDiscovered().map(l => [l.urlCode, l]));
    const newLetters: LetterEntry[] = [];
    const seen = new Set<string>();

    let match;
    while ((match = linkPattern.exec(html)) !== null) {
      const urlCode = match[1];
      if (seen.has(urlCode)) continue;
      seen.add(urlCode);

      const dateStr = urlCode.substring(0, 8);
      const id = `uhj-${dateStr}`;
      const date = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;

      if (staticIds.has(id) || existingDiscovered.has(urlCode)) continue;

      // Extract title from surrounding <a> tag text — find the tag that contains this href
      const tagPattern = new RegExp(`<a[^>]*href="[^"]*${urlCode}[^"]*"[^>]*>([^<]*)</a>`, 'i');
      const tagMatch = html.match(tagPattern);
      const rawTitle = tagMatch?.[1]?.trim() || '';
      const title = rawTitle.length > 5 ? rawTitle : `Letter of ${date}`;

      // Try to extract recipient from the same table row
      const rowPattern = new RegExp(`<tr[^>]*id="${urlCode}"[^>]*>([\\s\\S]*?)</tr>`, 'i');
      const rowMatch = html.match(rowPattern);
      let recipient = "The Bahá'í World";
      if (rowMatch) {
        const toMatch = rowMatch[1].match(/(to\s+[^<,]{5,80})/i);
        if (toMatch) recipient = toMatch[1].trim().replace(/^to\s/i, 'To ');
      }

      newLetters.push({ id, title, date, recipient, urlCode });
    }

    if (newLetters.length > 0) {
      const merged = [...Array.from(existingDiscovered.values()), ...newLetters];
      saveDiscovered(merged);
      console.log(`[Luminance] Discovered ${newLetters.length} new letter(s)`);
    }

    return { found: newLetters.length };
  } catch (err) {
    console.warn('[Luminance] Letter discovery failed:', err);
    discoveryRanThisSession = false; // allow retry on next navigation
    return { found: 0 };
  }
}
