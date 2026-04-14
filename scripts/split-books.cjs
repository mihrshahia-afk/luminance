const fs = require('fs');
const path = require('path');
const data = require(path.join(__dirname, '..', 'src', 'data', 'bookContent.json'));

function getContent(bookId) {
  const keys = Object.keys(data).filter(k => k.startsWith(bookId + '/') && !k.includes('__'));
  keys.sort((a, b) => {
    const na = a.split('/')[1].replace('ch','');
    const nb = b.split('/')[1].replace('ch','');
    return parseInt(na) - parseInt(nb);
  });
  let all = '';
  keys.forEach(k => { if (data[k]?.content) all += '\n\n' + data[k].content; });
  return all.trim();
}

const datePattern = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d/i;

// ── Paris Talks: split by date lines ──
const ptText = getContent('paris-talks');
const ptParas = ptText.split('\n\n').map(p => p.trim()).filter(Boolean);

const ptBounds = [];
for (let i = 0; i < ptParas.length - 1; i++) {
  const p = ptParas[i];
  const next = ptParas[i + 1];

  if (datePattern.test(next) && next.length < 100) {
    if (p.match(/Avenue|Gardens|Lane|Street|Road|Church|House|Hotel|Meeting/i) && p.length < 80) {
      if (i > 0) {
        const title = ptParas[i - 1];
        if (title.length > 5 && title.length < 130 && /^[A-Z']/.test(title)) {
          ptBounds.push({ idx: i - 1, title: title });
        }
      }
    } else if (p.length > 5 && p.length < 130 && /^[A-Z'"]/.test(p) && !p.match(/^\d/)) {
      ptBounds.push({ idx: i, title: p });
    }
  }
}

const seenIdx = new Set();
const ptUnique = ptBounds.filter(b => {
  if (seenIdx.has(b.idx)) return false;
  seenIdx.add(b.idx);
  return true;
});

if (ptUnique.length > 0) {
  Object.keys(data).forEach(k => { if (k.startsWith('paris-talks/')) delete data[k]; });
  const chapters = [];
  for (let i = 0; i < ptUnique.length; i++) {
    const start = ptUnique[i].idx;
    const end = i + 1 < ptUnique.length ? ptUnique[i + 1].idx : ptParas.length;
    const content = ptParas.slice(start, end).join('\n\n');
    const chId = 'ch' + (i + 1);
    chapters.push({ id: 'paris-talks-' + chId, title: (i+1) + '. ' + ptUnique[i].title, urlSegment: chId });
    data['paris-talks/' + chId] = { title: (i+1) + '. ' + ptUnique[i].title, content };
  }
  data['paris-talks/__chapters'] = chapters;
  console.log('Paris Talks: ' + chapters.length + ' talks');
  chapters.forEach(c => console.log('  ' + c.title.slice(0,70)));
}

// ── Gleanings: split by roman numeral sections ──
const glText = getContent('gleanings');
const glParas = glText.split('\n\n').map(p => p.trim()).filter(Boolean);
const glBounds = [];
for (let i = 0; i < glParas.length; i++) {
  const p = glParas[i];
  // Match roman numerals I through CLXVI (up to about 170)
  if (/^[IVXLC]+$/.test(p) && p.length <= 10 && p.length >= 1) {
    glBounds.push({ idx: i, title: 'Section ' + p });
  }
}
if (glBounds.length > 20) {
  Object.keys(data).forEach(k => { if (k.startsWith('gleanings/')) delete data[k]; });
  const chapters = [];
  for (let i = 0; i < glBounds.length; i++) {
    const start = glBounds[i].idx;
    const end = i + 1 < glBounds.length ? glBounds[i + 1].idx : glParas.length;
    const content = glParas.slice(start, end).join('\n\n');
    const chId = 'ch' + (i + 1);
    chapters.push({ id: 'gleanings-' + chId, title: glBounds[i].title, urlSegment: chId });
    data['gleanings/' + chId] = { title: glBounds[i].title, content };
  }
  data['gleanings/__chapters'] = chapters;
  console.log('\nGleanings: ' + chapters.length + ' sections');
}

// ── Promulgation: split by talk title + date ──
const promText = getContent('promulgation');
const promParas = promText.split('\n\n').map(p => p.trim()).filter(Boolean);
const promBounds = [];
for (let i = 0; i < promParas.length - 1; i++) {
  const p = promParas[i];
  const next = promParas[i + 1];
  if (p.length > 5 && p.length < 200 && /^[A-Z'"]/.test(p) && !p.match(/^\d/) &&
      datePattern.test(next) && next.length < 150) {
    promBounds.push({ idx: i, title: p.slice(0, 80) });
  }
}
if (promBounds.length > 30) {
  Object.keys(data).forEach(k => { if (k.startsWith('promulgation/')) delete data[k]; });
  const chapters = [];
  for (let i = 0; i < promBounds.length; i++) {
    const start = promBounds[i].idx;
    const end = i + 1 < promBounds.length ? promBounds[i + 1].idx : promParas.length;
    const content = promParas.slice(start, end).join('\n\n');
    const chId = 'ch' + (i + 1);
    chapters.push({ id: 'promulgation-' + chId, title: (i+1) + '. ' + promBounds[i].title, urlSegment: chId });
    data['promulgation/' + chId] = { title: (i+1) + '. ' + promBounds[i].title, content };
  }
  data['promulgation/__chapters'] = chapters;
  console.log('\nPromulgation: ' + chapters.length + ' talks');
}

// ── Remove empty first chapters (0KB intro pages) ──
['hidden-words','epistle-son-wolf','secret-divine-civilization','promised-day-come'].forEach(bookId => {
  const chaptersKey = bookId + '/__chapters';
  const chapters = data[chaptersKey];
  if (!chapters) return;

  const newChapters = chapters.filter(ch => {
    const entry = data[bookId + '/' + ch.urlSegment];
    if (!entry || !entry.content || entry.content.length < 100) {
      delete data[bookId + '/' + ch.urlSegment];
      return false;
    }
    return true;
  });
  data[chaptersKey] = newChapters;
  if (newChapters.length !== chapters.length) {
    console.log('\n' + bookId + ': removed ' + (chapters.length - newChapters.length) + ' empty chapters, now ' + newChapters.length);
  }
});

fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'bookContent.json'), JSON.stringify(data, null, 2));
console.log('\nDone! Total entries: ' + Object.keys(data).length);
