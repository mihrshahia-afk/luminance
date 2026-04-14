const fs = require('fs');
const path = require('path');
const data = require(path.join(__dirname, '..', 'src', 'data', 'bookContent.json'));

let totalSplit = 0;

function getFullText(bookId) {
  const keys = Object.keys(data).filter(k => k.startsWith(bookId + '/') && !k.includes('__'));
  keys.sort((a, b) => {
    const na = parseInt(a.split('/')[1].replace('ch', ''));
    const nb = parseInt(b.split('/')[1].replace('ch', ''));
    return na - nb;
  });
  let all = '';
  keys.forEach(k => { if (data[k]?.content) all += '\n\n' + data[k].content; });
  return all.trim();
}

function replaceBook(bookId, chapters) {
  // Delete old entries
  Object.keys(data).forEach(k => { if (k.startsWith(bookId + '/')) delete data[k]; });

  // Write new
  const index = [];
  chapters.forEach((ch, i) => {
    const chId = 'ch' + (i + 1);
    index.push({ id: bookId + '-' + chId, title: ch.title, urlSegment: chId });
    data[bookId + '/' + chId] = { title: ch.title, content: ch.content };
  });
  data[bookId + '/__chapters'] = index;
  console.log(bookId + ': ' + chapters.length + ' chapters');
  totalSplit++;
}

// Split by bold headings, deduplicating
function splitByBoldHeadings(bookId, filterFn) {
  const allText = getFullText(bookId);
  const paras = allText.split('\n\n').map(p => p.trim()).filter(Boolean);

  const bounds = [];
  const seen = new Set();

  for (let i = 0; i < paras.length; i++) {
    const p = paras[i];
    if (p.startsWith('**') && p.endsWith('**') && p.length < 200) {
      const title = p.slice(2, -2);
      // Skip book title repetitions and generic headings
      if (filterFn && !filterFn(title, i, paras)) continue;

      // Create a unique key: title + first 50 chars of next paragraph
      const nextText = i + 1 < paras.length ? paras[i + 1].slice(0, 50) : '';
      const key = title + '||' + nextText;
      if (seen.has(key)) continue;
      seen.add(key);

      bounds.push({ idx: i, title });
    }
  }

  if (bounds.length < 2) return false;

  const chapters = [];
  for (let i = 0; i < bounds.length; i++) {
    const start = bounds[i].idx;
    const end = i + 1 < bounds.length ? bounds[i + 1].idx : paras.length;
    chapters.push({ title: bounds[i].title, content: paras.slice(start, end).join('\n\n') });
  }

  replaceBook(bookId, chapters);
  return true;
}

// ── Tablets of Bahá'u'lláh ──
// Has named tablets: Lawh-i-Karmil, Lawh-i-Aqdas, Bisharat, etc.
{
  const allText = getFullText('tablets-bahaullah');
  const paras = allText.split('\n\n').map(p => p.trim()).filter(Boolean);

  // Find tablet names (bold headings that are NOT the book title or translation notes)
  const tabletNames = [
    'Lawḥ-i-Karmil', 'Lawḥ-i-Aqdas', 'Bishárát', 'Ṭarázát', 'Tajallíyát',
    'Kalimát-i-Firdawsíyyih', 'Lawḥ-i-Dunyá', 'Ishráqát', 'Lawḥ-i-Ḥikmat',
    "Aṣl-i-Kullu'l-Khayr", 'Lawḥ-i-Maqṣúd', "Súriy-i-Vafá",
    "Lawḥ-i-Síyyid-i-Mihdíy-i-Dahají", 'Lawḥ-i-Burhán', "Kitáb-i-'Ahd",
    "Lawḥ-i-Arḍ-i-Bá", 'Excerpts from Other Tablets'
  ];

  const bounds = [];
  const seen = new Set();

  for (let i = 0; i < paras.length; i++) {
    const p = paras[i];
    if (!p.startsWith('**') || !p.endsWith('**')) continue;
    const title = p.slice(2, -2);

    // Check if this matches a tablet name
    const match = tabletNames.find(t => title.includes(t));
    if (!match) continue;

    // Deduplicate
    const nextText = i + 1 < paras.length ? paras[i + 1].slice(0, 50) : '';
    const key = match + '||' + nextText;
    if (seen.has(key)) continue;
    seen.add(key);

    // If next line is a translation like "(Tablet of Carmel)", combine
    let fullTitle = title;
    if (i + 1 < paras.length) {
      const next = paras[i + 1];
      if (next.startsWith('**') && next.endsWith('**') && next.includes('(')) {
        fullTitle = title + ' ' + next.slice(2, -2);
      }
    }

    bounds.push({ idx: i, title: fullTitle });
  }

  if (bounds.length >= 2) {
    const chapters = [];
    for (let i = 0; i < bounds.length; i++) {
      const start = bounds[i].idx;
      const end = i + 1 < bounds.length ? bounds[i + 1].idx : paras.length;
      chapters.push({ title: bounds[i].title, content: paras.slice(start, end).join('\n\n') });
    }
    replaceBook('tablets-bahaullah', chapters);
  }
}

// ── Tablets of the Divine Plan ──
// Each tablet is "Tablet to the Bahá'ís of [Region]"
{
  const allText = getFullText('tablets-divine-plan');
  const paras = allText.split('\n\n').map(p => p.trim()).filter(Boolean);

  const bounds = [];
  const seen = new Set();

  for (let i = 0; i < paras.length; i++) {
    const p = paras[i];
    if (!p.startsWith('**') || !p.endsWith('**')) continue;
    const title = p.slice(2, -2);
    if (!title.startsWith('Tablet to')) continue;

    const nextText = i + 1 < paras.length ? paras[i + 1].slice(0, 80) : '';
    const key = title + '||' + nextText;
    if (seen.has(key)) continue;
    seen.add(key);

    bounds.push({ idx: i, title });
  }

  if (bounds.length >= 2) {
    const chapters = [];
    for (let i = 0; i < bounds.length; i++) {
      const start = bounds[i].idx;
      const end = i + 1 < bounds.length ? bounds[i + 1].idx : paras.length;
      chapters.push({ title: (i + 1) + '. ' + bounds[i].title, content: paras.slice(start, end).join('\n\n') });
    }
    replaceBook('tablets-divine-plan', chapters);
  }
}

// ── World Order of Bahá'u'lláh ──
{
  const essays = [
    'The World Order of Bahá\\u2019u\\u2019lláh: Further Considerations',
    'The Goal of a New World Order',
    'The Golden Age of the Cause of Bahá',
    'America and the Most Great Peace',
    'The Dispensation of Bahá',
    'The Unfoldment of World Civilization'
  ];

  const allText = getFullText('world-order-bahaullah');
  const paras = allText.split('\n\n').map(p => p.trim()).filter(Boolean);

  const bounds = [];
  const seen = new Set();

  for (let i = 0; i < paras.length; i++) {
    const p = paras[i];
    if (!p.startsWith('**') || !p.endsWith('**')) continue;
    const title = p.slice(2, -2);

    // Skip generic book title
    if (title === "The World Order of Bahá\u2019u\u2019lláh") continue;

    const nextText = i + 1 < paras.length ? paras[i + 1].slice(0, 80) : '';
    const key = title + '||' + nextText;
    if (seen.has(key)) continue;
    seen.add(key);

    bounds.push({ idx: i, title });
  }

  if (bounds.length >= 2) {
    const chapters = [];
    for (let i = 0; i < bounds.length; i++) {
      const start = bounds[i].idx;
      const end = i + 1 < bounds.length ? bounds[i + 1].idx : paras.length;
      chapters.push({ title: bounds[i].title, content: paras.slice(start, end).join('\n\n') });
    }
    replaceBook('world-order-bahaullah', chapters);
  }
}

// ── Summons of the Lord of Hosts ──
{
  const tabletNames = ['Introduction', 'Súriy-i-Haykal', "Súriy-i-Ra'ís", "Lawḥ-i-Ra'ís",
    "Lawḥ-i-Fu'ád", 'Súriy-i-Mulúk', 'Endnotes', 'Note on the Translation',
    'Key to Passages Translated by Shoghi Effendi'];

  const allText = getFullText('summons-lord-hosts');
  const paras = allText.split('\n\n').map(p => p.trim()).filter(Boolean);

  const bounds = [];
  const seen = new Set();

  for (let i = 0; i < paras.length; i++) {
    const p = paras[i];
    if (!p.startsWith('**') || !p.endsWith('**')) continue;
    const title = p.slice(2, -2);

    if (!tabletNames.some(t => title.includes(t))) continue;

    const nextText = i + 1 < paras.length ? paras[i + 1].slice(0, 80) : '';
    const key = title + '||' + nextText;
    if (seen.has(key)) continue;
    seen.add(key);

    bounds.push({ idx: i, title });
  }

  if (bounds.length >= 2) {
    const chapters = [];
    for (let i = 0; i < bounds.length; i++) {
      const start = bounds[i].idx;
      const end = i + 1 < bounds.length ? bounds[i + 1].idx : paras.length;
      chapters.push({ title: bounds[i].title, content: paras.slice(start, end).join('\n\n') });
    }
    replaceBook('summons-lord-hosts', chapters);
  }
}

// ── Selections from Writings of 'Abdu'l-Bahá ──
// Individual selections are numbered bold headings like "2: ..."
{
  const allText = getFullText('selections-writings-abdul-baha');
  const paras = allText.split('\n\n').map(p => p.trim()).filter(Boolean);

  const bounds = [];
  const seen = new Set();

  for (let i = 0; i < paras.length; i++) {
    const p = paras[i];
    if (!p.startsWith('**') || !p.endsWith('**')) continue;
    const title = p.slice(2, -2);

    // Match numbered selections like "2: ..." or section headings like "Notes on Translations"
    if (!/^\d+:/.test(title) && title !== 'Notes on Translations') continue;

    const nextText = i + 1 < paras.length ? paras[i + 1].slice(0, 50) : '';
    const key = title.slice(0, 30) + '||' + nextText;
    if (seen.has(key)) continue;
    seen.add(key);

    // Shorten title for sidebar
    const shortTitle = /^\d+:/.test(title)
      ? 'Selection ' + title.match(/^(\d+)/)[1] + ': ' + title.slice(title.indexOf('"') + 1, title.indexOf('"') + 50).replace(/…$/, '...').replace(/"$/, '')
      : title;

    bounds.push({ idx: i, title: shortTitle });
  }

  if (bounds.length >= 2) {
    const chapters = [];
    for (let i = 0; i < bounds.length; i++) {
      const start = bounds[i].idx;
      const end = i + 1 < bounds.length ? bounds[i + 1].idx : paras.length;
      chapters.push({ title: bounds[i].title, content: paras.slice(start, end).join('\n\n') });
    }
    replaceBook('selections-writings-abdul-baha', chapters);
  }
}

// ── Selections from Writings of the Báb ──
{
  const allText = getFullText('selections-writings-bab');
  const paras = allText.split('\n\n').map(p => p.trim()).filter(Boolean);

  const bounds = [];
  const seen = new Set();

  for (let i = 0; i < paras.length; i++) {
    const p = paras[i];
    if (!p.startsWith('**') || !p.endsWith('**')) continue;
    const title = p.slice(2, -2);

    // Skip the book title
    if (title === "Selections from the Writings of the Báb") continue;

    const nextText = i + 1 < paras.length ? paras[i + 1].slice(0, 50) : '';
    const key = title + '||' + nextText;
    if (seen.has(key)) continue;
    seen.add(key);

    bounds.push({ idx: i, title });
  }

  if (bounds.length >= 2) {
    const chapters = [];
    for (let i = 0; i < bounds.length; i++) {
      const start = bounds[i].idx;
      const end = i + 1 < bounds.length ? bounds[i + 1].idx : paras.length;
      chapters.push({ title: bounds[i].title, content: paras.slice(start, end).join('\n\n') });
    }
    replaceBook('selections-writings-bab', chapters);
  }
}

// ── Days of Remembrance ──
{
  const dayNames = ['Naw-Rúz', 'Riḍván', 'Declaration of the Báb', 'Ascension of Bahá',
    'Martyrdom of the Báb', 'Birth of the Báb', 'Birth of Bahá', 'Day of the Covenant',
    "Ascension of 'Abdu'l-Bahá", 'Key to Passages'];

  const allText = getFullText('days-remembrance');
  const paras = allText.split('\n\n').map(p => p.trim()).filter(Boolean);

  const bounds = [];
  const seen = new Set();

  for (let i = 0; i < paras.length; i++) {
    const p = paras[i];
    if (!p.startsWith('**') || !p.endsWith('**')) continue;
    const title = p.slice(2, -2);
    if (title === 'Days of Remembrance') continue;

    const nextText = i + 1 < paras.length ? paras[i + 1].slice(0, 50) : '';
    const key = title + '||' + nextText;
    if (seen.has(key)) continue;
    seen.add(key);

    bounds.push({ idx: i, title });
  }

  if (bounds.length >= 2) {
    const chapters = [];
    for (let i = 0; i < bounds.length; i++) {
      const start = bounds[i].idx;
      const end = i + 1 < bounds.length ? bounds[i + 1].idx : paras.length;
      chapters.push({ title: bounds[i].title, content: paras.slice(start, end).join('\n\n') });
    }
    replaceBook('days-remembrance', chapters);
  }
}

// ── Bahá'í Administration ──
{
  const allText = getFullText('bahai-administration');
  const paras = allText.split('\n\n').map(p => p.trim()).filter(Boolean);

  const bounds = [];
  const seen = new Set();

  for (let i = 0; i < paras.length; i++) {
    const p = paras[i];
    if (!p.startsWith('**') || !p.endsWith('**')) continue;
    const title = p.slice(2, -2);
    if (title === "Bahá'í Administration" || title === "Bahá\u2019í Administration") continue;

    const nextText = i + 1 < paras.length ? paras[i + 1].slice(0, 50) : '';
    const key = title + '||' + nextText;
    if (seen.has(key)) continue;
    seen.add(key);

    bounds.push({ idx: i, title });
  }

  if (bounds.length >= 2) {
    const chapters = [];
    for (let i = 0; i < bounds.length; i++) {
      const start = bounds[i].idx;
      const end = i + 1 < bounds.length ? bounds[i + 1].idx : paras.length;
      chapters.push({ title: bounds[i].title, content: paras.slice(start, end).join('\n\n') });
    }
    replaceBook('bahai-administration', chapters);
  }
}

// ── Gems of Divine Mysteries ──
{
  splitByBoldHeadings('gems-divine-mysteries', (title) => {
    return title !== 'Gems of Divine Mysteries';
  });
}

// ── Tabernacle of Unity ──
{
  splitByBoldHeadings('tabernacle-unity', (title) => {
    return title !== 'The Tabernacle of Unity';
  });
}

// ── Light of the World ──
// This book has numbered selections (1  First sentence...)
{
  const allText = getFullText('light-of-the-world');
  const paras = allText.split('\n\n').map(p => p.trim()).filter(Boolean);

  // Find section headings
  const bounds = [];
  const seen = new Set();

  for (let i = 0; i < paras.length; i++) {
    const p = paras[i];
    if (!p.startsWith('**') || !p.endsWith('**')) continue;
    const title = p.slice(2, -2);
    if (title.includes('Light of the World')) continue;

    const nextText = i + 1 < paras.length ? paras[i + 1].slice(0, 50) : '';
    const key = title + '||' + nextText;
    if (seen.has(key)) continue;
    seen.add(key);

    bounds.push({ idx: i, title });
  }

  if (bounds.length >= 2) {
    const chapters = [];
    for (let i = 0; i < bounds.length; i++) {
      const start = bounds[i].idx;
      const end = i + 1 < bounds.length ? bounds[i + 1].idx : paras.length;
      chapters.push({ title: bounds[i].title, content: paras.slice(start, end).join('\n\n') });
    }
    replaceBook('light-of-the-world', chapters);
  }
}

// ── Citadel of Faith ──
{
  splitByBoldHeadings('citadel-faith', (title) => {
    return title !== 'Citadel of Faith';
  });
}

// ── Decisive Hour ──
// This is a compilation of messages with dates
{
  splitByBoldHeadings('decisive-hour', (title) => {
    return title !== "Messages from Shoghi Effendi to the Bahá\u2019í World" &&
           title !== 'This Decisive Hour';
  });
}

// ── Promulgation of Universal Peace ──
// Already has 34 chapters from web pages, check if we can split further by individual talks
{
  const allText = getFullText('promulgation');
  const paras = allText.split('\n\n').map(p => p.trim()).filter(Boolean);

  // Find bold headings that aren't the book title
  const bounds = [];
  const seen = new Set();

  for (let i = 0; i < paras.length; i++) {
    const p = paras[i];
    if (!p.startsWith('**') || !p.endsWith('**')) continue;
    const title = p.slice(2, -2);
    if (title.includes('Promulgation') || title.includes('Notes')) continue;

    const nextText = i + 1 < paras.length ? paras[i + 1].slice(0, 80) : '';
    const key = title + '||' + nextText;
    if (seen.has(key)) continue;
    seen.add(key);

    bounds.push({ idx: i, title });
  }

  if (bounds.length > 34) {
    const chapters = [];
    for (let i = 0; i < bounds.length; i++) {
      const start = bounds[i].idx;
      const end = i + 1 < bounds.length ? bounds[i + 1].idx : paras.length;
      chapters.push({ title: (i + 1) + '. ' + bounds[i].title.slice(0, 80), content: paras.slice(start, end).join('\n\n') });
    }
    replaceBook('promulgation', chapters);
  }
}

// ── Hidden Words ──
// Already has Arabic + Persian sections. The actual book has numbered aphorisms
// but those work better as a continuous read. Keep as-is unless there are bold subsections.

// ── Some Answered Questions ──
// Already split into 79 chapters, keep as-is

// ── Save ──
fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'bookContent.json'), JSON.stringify(data, null, 2));
console.log('\nTotal books re-split: ' + totalSplit);
console.log('Total entries: ' + Object.keys(data).length);
