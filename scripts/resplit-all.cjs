const fs = require('fs');
const path = require('path');
const data = require(path.join(__dirname, '..', 'src', 'data', 'bookContent.json'));

let changes = 0;

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
  Object.keys(data).forEach(k => { if (k.startsWith(bookId + '/')) delete data[k]; });
  const index = [];
  chapters.forEach((ch, i) => {
    const chId = 'ch' + (i + 1);
    index.push({ id: bookId + '-' + chId, title: ch.title, urlSegment: chId });
    data[bookId + '/' + chId] = { title: ch.title, content: ch.content };
  });
  data[bookId + '/__chapters'] = index;
  changes++;
  console.log(bookId + ': ' + chapters.length + ' chapters');
}

// ══════════════════════════════════════════════════════════════
// PARIS TALKS — Split by date lines (talks have title + date)
// ══════════════════════════════════════════════════════════════
{
  const allText = getFullText('paris-talks');
  const paras = allText.split('\n\n').map(p => p.trim()).filter(Boolean);
  const dateRe = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d/i;
  const locationRe = /Avenue|Camoëns|Gardens|Lane|Street|Church|House|Hotel|Meeting|Cadogan|Pasteur/i;

  // Find all date lines
  const datelines = [];
  paras.forEach((p, i) => {
    if (dateRe.test(p) && p.length < 100) datelines.push(i);
  });

  // For each date line, find the talk title (1-3 lines above, skipping location lines)
  const talks = [];
  const usedIdx = new Set();
  datelines.forEach(dateIdx => {
    let titleIdx = dateIdx - 1;
    // Skip location lines
    while (titleIdx >= 0 && (locationRe.test(paras[titleIdx]) || paras[titleIdx].length < 5) && paras[titleIdx].length < 80) {
      titleIdx--;
    }
    if (titleIdx < 0 || usedIdx.has(titleIdx)) return;
    const title = paras[titleIdx];
    // Title should be short and capitalized
    if (title.length > 120 || title.length < 5 || !/^[A-Z'"\u2018]/.test(title)) return;
    usedIdx.add(titleIdx);
    talks.push({ titleIdx, title, dateIdx });
  });

  if (talks.length > 25) {
    const chapters = [];
    for (let i = 0; i < talks.length; i++) {
      const start = talks[i].titleIdx;
      const end = i + 1 < talks.length ? talks[i + 1].titleIdx : paras.length;
      const content = paras.slice(start, end).join('\n\n');
      chapters.push({ title: (i + 1) + '. ' + talks[i].title, content });
    }
    replaceBook('paris-talks', chapters);
  }
}

// ══════════════════════════════════════════════════════════════
// GLEANINGS — Split by Roman numeral headers
// ══════════════════════════════════════════════════════════════
{
  const allText = getFullText('gleanings');
  const paras = allText.split('\n\n').map(p => p.trim()).filter(Boolean);

  // Roman numerals appear as standalone paragraphs
  const romanRe = /^[IVXLC]+$/;
  const bounds = [];
  const seen = new Set();
  paras.forEach((p, i) => {
    if (romanRe.test(p) && p.length <= 12) {
      // Deduplicate by checking next paragraph
      const key = p + '|' + (paras[i + 1] || '').slice(0, 40);
      if (!seen.has(key)) {
        seen.add(key);
        bounds.push({ idx: i, title: p });
      }
    }
  });

  if (bounds.length > 100) {
    const chapters = [];
    for (let i = 0; i < bounds.length; i++) {
      const start = bounds[i].idx;
      const end = i + 1 < bounds.length ? bounds[i + 1].idx : paras.length;
      const content = paras.slice(start, end).join('\n\n');
      chapters.push({ title: 'Gleaning ' + bounds[i].title, content });
    }
    replaceBook('gleanings', chapters);
  } else {
    console.log('gleanings: only found ' + bounds.length + ' roman numerals, keeping as-is');
  }
}

// ══════════════════════════════════════════════════════════════
// PRAYERS AND MEDITATIONS — Split by numbered prayers
// ══════════════════════════════════════════════════════════════
{
  const allText = getFullText('prayers-meditations');
  const paras = allText.split('\n\n').map(p => p.trim()).filter(Boolean);

  // Prayers are separated by Roman numerals or bold numbered headers
  const bounds = [];
  const seen = new Set();
  paras.forEach((p, i) => {
    // Match standalone roman numerals or "**I**" style
    const plain = p.replace(/\*\*/g, '').trim();
    if (/^[IVXLC]+$/.test(plain) && plain.length <= 12) {
      const key = plain + '|' + (paras[i + 1] || '').slice(0, 40);
      if (!seen.has(key)) {
        seen.add(key);
        bounds.push({ idx: i, title: plain });
      }
    }
  });

  if (bounds.length > 50) {
    const chapters = [];
    for (let i = 0; i < bounds.length; i++) {
      const start = bounds[i].idx;
      const end = i + 1 < bounds.length ? bounds[i + 1].idx : paras.length;
      const content = paras.slice(start, end).join('\n\n');
      chapters.push({ title: 'Prayer ' + bounds[i].title, content });
    }
    replaceBook('prayers-meditations', chapters);
  } else {
    console.log('prayers-meditations: only found ' + bounds.length + ' separators, keeping as-is');
  }
}

// ══════════════════════════════════════════════════════════════
// DAYS OF REMEMBRANCE — Split by numbered selections within holy days
// ══════════════════════════════════════════════════════════════
{
  const allText = getFullText('days-remembrance');
  const paras = allText.split('\n\n').map(p => p.trim()).filter(Boolean);

  // Look for bold section headers (holy day names) and numbered selections
  const holyDays = ['Naw-Rúz', 'Riḍván', 'Declaration of the Báb', 'Ascension of Bahá',
    'Martyrdom of the Báb', 'Birth of the Báb', 'Birth of Bahá', 'Day of the Covenant',
    "Ascension of 'Abdu'l-Bahá"];

  const bounds = [];
  const seen = new Set();
  paras.forEach((p, i) => {
    const plain = p.replace(/\*\*/g, '').trim();
    // Match holy day headers
    if (p.startsWith('**') && p.endsWith('**') && holyDays.some(h => plain.includes(h))) {
      const key = plain + '|' + (paras[i + 1] || '').slice(0, 40);
      if (!seen.has(key)) {
        seen.add(key);
        bounds.push({ idx: i, title: plain });
      }
    }
  });

  if (bounds.length >= 5) {
    const chapters = [];
    for (let i = 0; i < bounds.length; i++) {
      const start = bounds[i].idx;
      const end = i + 1 < bounds.length ? bounds[i + 1].idx : paras.length;
      const content = paras.slice(start, end).join('\n\n');
      chapters.push({ title: bounds[i].title, content });
    }
    replaceBook('days-remembrance', chapters);
  }
}

// ══════════════════════════════════════════════════════════════
// LIGHT OF THE WORLD — Split by numbered tablets
// ══════════════════════════════════════════════════════════════
{
  const allText = getFullText('light-of-the-world');
  const paras = allText.split('\n\n').map(p => p.trim()).filter(Boolean);

  // Tablets are prefixed with — 1 —, — 2 —, etc. or numbered "1  O thou..."
  const bounds = [];
  const seen = new Set();
  paras.forEach((p, i) => {
    // Match "– 1 –" or "— 1 —" pattern
    const dashMatch = p.match(/^[–—]\s*(\d+)\s*[–—]$/);
    if (dashMatch) {
      const key = dashMatch[1] + '|' + (paras[i + 1] || '').slice(0, 40);
      if (!seen.has(key)) {
        seen.add(key);
        bounds.push({ idx: i, title: 'Tablet ' + dashMatch[1] });
      }
    }
  });

  if (bounds.length > 20) {
    const chapters = [];
    for (let i = 0; i < bounds.length; i++) {
      const start = bounds[i].idx;
      const end = i + 1 < bounds.length ? bounds[i + 1].idx : paras.length;
      const content = paras.slice(start, end).join('\n\n');
      chapters.push({ title: bounds[i].title, content });
    }
    replaceBook('light-of-the-world', chapters);
  } else {
    console.log('light-of-the-world: found ' + bounds.length + ' tablet markers');
  }
}

// ══════════════════════════════════════════════════════════════
// SELECTIONS FROM WRITINGS OF ABDUL-BAHA — Split by "– N –" markers
// ══════════════════════════════════════════════════════════════
{
  const allText = getFullText('selections-writings-abdul-baha');
  const paras = allText.split('\n\n').map(p => p.trim()).filter(Boolean);

  const bounds = [];
  const seen = new Set();
  paras.forEach((p, i) => {
    const dashMatch = p.match(/^[–—]\s*(\d+)\s*[–—]$/);
    if (dashMatch) {
      const num = parseInt(dashMatch[1]);
      if (!seen.has(num)) {
        seen.add(num);
        // Get first line of the selection as subtitle
        const nextP = paras[i + 1] || '';
        const subtitle = nextP.slice(0, 60).replace(/[.,;:]$/, '') + '...';
        bounds.push({ idx: i, title: 'Selection ' + num, num });
      }
    }
  });

  bounds.sort((a, b) => a.num - b.num);

  if (bounds.length > 50) {
    const chapters = [];
    for (let i = 0; i < bounds.length; i++) {
      const start = bounds[i].idx;
      const end = i + 1 < bounds.length ? bounds[i + 1].idx : paras.length;
      const content = paras.slice(start, end).join('\n\n');
      chapters.push({ title: bounds[i].title, content });
    }
    replaceBook('selections-writings-abdul-baha', chapters);
  } else {
    console.log('selections-writings-abdul-baha: found ' + bounds.length + ' selection markers');
  }
}

// ══════════════════════════════════════════════════════════════
// PROMULGATION OF UNIVERSAL PEACE — Split by individual talk titles
// ══════════════════════════════════════════════════════════════
{
  const allText = getFullText('promulgation');
  const paras = allText.split('\n\n').map(p => p.trim()).filter(Boolean);
  const dateRe = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d/i;

  // Individual talks have a bold title followed by location/date
  const bounds = [];
  const seen = new Set();
  paras.forEach((p, i) => {
    if (!p.startsWith('**') || !p.endsWith('**')) return;
    const title = p.slice(2, -2);
    if (title.includes('Promulgation') || title === 'Notes') return;
    if (title.length < 5 || title.length > 200) return;

    const key = title.slice(0, 50) + '|' + (paras[i + 1] || '').slice(0, 40);
    if (!seen.has(key)) {
      seen.add(key);
      bounds.push({ idx: i, title: title.slice(0, 100) });
    }
  });

  if (bounds.length > 40) {
    const chapters = [];
    for (let i = 0; i < bounds.length; i++) {
      const start = bounds[i].idx;
      const end = i + 1 < bounds.length ? bounds[i + 1].idx : paras.length;
      const content = paras.slice(start, end).join('\n\n');
      chapters.push({ title: (i + 1) + '. ' + bounds[i].title, content });
    }
    replaceBook('promulgation', chapters);
  } else {
    console.log('promulgation: found ' + bounds.length + ' talk headings');
  }
}

// ══════════════════════════════════════════════════════════════
// Remove any empty chapters created
// ══════════════════════════════════════════════════════════════
let removed = 0;
Object.keys(data).filter(k => k.includes('/__chapters')).forEach(k => {
  const bookId = k.split('/')[0];
  const chapters = data[k];
  const filtered = chapters.filter(ch => {
    const entry = data[bookId + '/' + ch.urlSegment];
    if (!entry || !entry.content || entry.content.length < 50) {
      delete data[bookId + '/' + ch.urlSegment];
      removed++;
      return false;
    }
    return true;
  });
  data[k] = filtered;
});

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'bookContent.json'), JSON.stringify(data, null, 2));
console.log('\nBooks re-split: ' + changes);
console.log('Empty chapters removed: ' + removed);
console.log('Total entries: ' + Object.keys(data).length);
