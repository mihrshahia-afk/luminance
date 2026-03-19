import type { LetterEntry } from './letterIndex';
import { letterIndex } from './letterIndex';

const PROXY = 'https://api.allorigins.win/raw?url=';
const MESSAGES_URL = 'https://www.bahai.org/library/authoritative-texts/the-universal-house-of-justice/messages/';
const DISCOVERED_KEY = 'luminance-discovered-letters';
const LAST_CHECK_KEY = 'luminance-discovery-last-check';
const CHECK_INTERVAL_HOURS = 24;

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

function isDue(): boolean {
  const last = localStorage.getItem(LAST_CHECK_KEY);
  if (!last) return true;
  const hours = (Date.now() - new Date(last).getTime()) / 3_600_000;
  return hours >= CHECK_INTERVAL_HOURS;
}

export function getDiscoveredLetters(): LetterEntry[] {
  return getDiscovered();
}

export function getAllLetters(): LetterEntry[] {
  const staticIds = new Set(letterIndex.map(l => l.id));
  const discovered = getDiscovered().filter(l => !staticIds.has(l.id));
  return [...discovered, ...letterIndex].sort((a, b) => b.date.localeCompare(a.date));
}

export async function runAutoDiscovery(): Promise<{ found: number }> {
  if (!isDue()) return { found: 0 };

  try {
    const html = await fetch(`${PROXY}${encodeURIComponent(MESSAGES_URL)}`).then(r => r.text());
    const doc = new DOMParser().parseFromString(html, 'text/html');

    const staticIds = new Set(letterIndex.map(l => l.id));
    const existingDiscovered = new Map(getDiscovered().map(l => [l.urlCode, l]));
    const newLetters: LetterEntry[] = [];
    const seen = new Set<string>();

    const linkPattern = /\/messages\/(\d{8}_\d{3})\//;

    doc.querySelectorAll('a[href*="/messages/"]').forEach(el => {
      const href = el.getAttribute('href') || '';
      const match = href.match(linkPattern);
      if (!match) return;

      const urlCode = match[1];
      if (seen.has(urlCode)) return;
      seen.add(urlCode);

      const dateStr = urlCode.substring(0, 8);
      const id = `uhj-${dateStr}`;
      const date = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;

      if (staticIds.has(id) || existingDiscovered.has(urlCode)) return;

      const rawTitle = el.textContent?.trim() || '';
      const title = rawTitle.length > 5 ? rawTitle : `Letter of ${date}`;

      // Try to infer recipient from surrounding list item
      let recipient = "The Bahá'í World";
      const li = el.closest('li, tr, .list-item');
      if (li) {
        const full = li.textContent || '';
        const toMatch = full.match(/to\s+([^,.\n]{5,60})/i);
        if (toMatch) recipient = toMatch[1].trim();
      }

      newLetters.push({ id, title, date, recipient, urlCode });
    });

    localStorage.setItem(LAST_CHECK_KEY, new Date().toISOString());

    if (newLetters.length > 0) {
      const merged = [...Array.from(existingDiscovered.values()), ...newLetters];
      saveDiscovered(merged);
    }

    return { found: newLetters.length };
  } catch {
    // Fail silently — auto-discovery is best-effort
    return { found: 0 };
  }
}
