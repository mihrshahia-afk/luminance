const fs = require('fs');
const path = require('path');
const data = require(path.join(__dirname, '..', 'src', 'data', 'bookContent.json'));

let fixes = 0;

// ── 1. Remove broken chapters ──
function removeChapter(bookId, urlSegment) {
  const key = bookId + '/__chapters';
  const chapters = data[key];
  if (!chapters) return;
  const idx = chapters.findIndex(c => c.urlSegment === urlSegment);
  if (idx !== -1) {
    chapters.splice(idx, 1);
    delete data[bookId + '/' + urlSegment];
    console.log('  Removed: ' + bookId + '/' + urlSegment);
    fixes++;
  }
}

// Prayers & Meditations ch7 "Page Not Found"
console.log('Prayers & Meditations:');
const pmCh = data['prayers-meditations/__chapters'];
if (pmCh) {
  const broken = pmCh.filter(c => {
    const entry = data['prayers-meditations/' + c.urlSegment];
    return !entry || entry.content?.length < 500 || entry.title?.includes('Page Not Found');
  });
  broken.forEach(c => removeChapter('prayers-meditations', c.urlSegment));
}

// Summons ch4 duplicate tiny fragment
console.log('\nSummons of the Lord of Hosts:');
const slhCh = data['summons-lord-hosts/__chapters'];
if (slhCh) {
  const toRemove = slhCh.filter(c => {
    const entry = data['summons-lord-hosts/' + c.urlSegment];
    return entry && entry.content && entry.content.length < 500;
  });
  toRemove.forEach(c => removeChapter('summons-lord-hosts', c.urlSegment));
}

// Tabernacle ch6 tiny duplicate
console.log('\nTabernacle of Unity:');
const tuCh = data['tabernacle-unity/__chapters'];
if (tuCh) {
  const toRemove = tuCh.filter(c => {
    const entry = data['tabernacle-unity/' + c.urlSegment];
    return entry && entry.content && entry.content.length < 500;
  });
  toRemove.forEach(c => removeChapter('tabernacle-unity', c.urlSegment));
}

// ── 2. Fix God Passes By chapter titles ──
console.log('\nGod Passes By - adding proper chapter titles:');
const gpbTitles = [
  'The Ministry of the Báb: The Dawn-Breakers',
  'The Báb\'s Pilgrimage and Declaration',
  'The Dawn of a New Day',
  'The Imprisonment of the Báb',
  'The Martyrdom of the Báb',
  'The Birth of the Bahá\'í Revelation',
  'Bahá\'u\'lláh\'s Banishment to Iraq',
  'The Sun of Bahá\'u\'lláh\'s Revelation',
  'Adrianople: The City of Mystery',
  'The Proclamation to the Kings',
  'The Most Great Prison',
  'The Covenant of Bahá\'u\'lláh',
  'The Ascension of Bahá\'u\'lláh',
  'The Ministry of \'Abdu\'l-Bahá',
  '\'Abdu\'l-Bahá in the West',
  'The World War and After',
  'The Will and Testament of \'Abdu\'l-Bahá',
  'The Birth of the Administrative Order',
  'The Rise of the Administrative Order',
  'The Spread of the Faith in East and West',
  'The Golden Age of the Cause',
  'The World Order of Bahá\'u\'lláh',
  'The First Seven Year Plan',
  'The Centenary of the Faith',
  'The Culmination of the First Century',
];
const gpbChapters = data['god-passes-by/__chapters'];
if (gpbChapters) {
  gpbChapters.forEach((ch, i) => {
    if (i < gpbTitles.length) {
      const newTitle = 'Chapter ' + (i + 1) + ': ' + gpbTitles[i];
      ch.title = newTitle;
      const entry = data['god-passes-by/' + ch.urlSegment];
      if (entry) entry.title = newTitle;
      fixes++;
    }
  });
  // Check if last 2 chapters need splitting
  const lastCh = gpbChapters[gpbChapters.length - 1];
  const lastEntry = data['god-passes-by/' + lastCh.urlSegment];
  if (lastEntry && gpbChapters.length === 26 && gpbTitles.length === 25) {
    // 26 web pages but 25 chapters - last page is likely conclusion/notes
    lastCh.title = 'Chapter 26: Retrospect and Prospect';
    lastEntry.title = lastCh.title;
  }
  console.log('  Updated ' + gpbChapters.length + ' chapter titles');
}

// ── 3. Fix Advent of Divine Justice titles ──
console.log('\nAdvent of Divine Justice:');
const adjTitles = [
  'Part 1: The State of the World',
  'Part 2: The Spiritual Prerequisites',
  'Part 3: The Challenging Requirements',
  'Part 4: The Destiny of America',
];
const adjCh = data['advent-divine-justice/__chapters'];
if (adjCh) {
  adjCh.forEach((ch, i) => {
    if (i < adjTitles.length) {
      ch.title = adjTitles[i];
      const entry = data['advent-divine-justice/' + ch.urlSegment];
      if (entry) entry.title = adjTitles[i];
      fixes++;
    }
  });
  console.log('  Updated titles');
}

// ── 4. Fix Citadel of Faith titles ──
console.log('\nCitadel of Faith:');
const cfTitles = [
  'Messages 1947-1950',
  'Messages 1950-1953',
  'Messages 1953-1955',
  'Messages 1955-1957',
];
const cfCh = data['citadel-faith/__chapters'];
if (cfCh) {
  cfCh.forEach((ch, i) => {
    if (i < cfTitles.length) {
      ch.title = cfTitles[i];
      const entry = data['citadel-faith/' + ch.urlSegment];
      if (entry) entry.title = cfTitles[i];
      fixes++;
    }
  });
  console.log('  Updated titles');
}

// ── 5. Fix Decisive Hour titles ──
console.log('\nThis Decisive Hour:');
const dhTitles = [
  'Messages 1932-1937',
  'Messages 1937-1940',
  'Messages 1940-1943',
  'Messages 1943-1946',
];
const dhCh = data['decisive-hour/__chapters'];
if (dhCh) {
  dhCh.forEach((ch, i) => {
    if (i < dhTitles.length) {
      ch.title = dhTitles[i];
      const entry = data['decisive-hour/' + ch.urlSegment];
      if (entry) entry.title = dhTitles[i];
      fixes++;
    }
  });
  console.log('  Updated titles');
}

// ── 6. Fix Light of the World titles ──
console.log('\nLight of the World:');
const lwTitles = [
  'Introduction',
  'Tablets 1-25',
  'Tablets 26-50',
  'Tablets 51-76',
];
const lwCh = data['light-of-the-world/__chapters'];
if (lwCh) {
  lwCh.forEach((ch, i) => {
    if (i < lwTitles.length) {
      ch.title = lwTitles[i];
      const entry = data['light-of-the-world/' + ch.urlSegment];
      if (entry) entry.title = lwTitles[i];
      fixes++;
    }
  });
  console.log('  Updated titles');
}

// ── 7. Fix Gems of Divine Mysteries titles ──
console.log('\nGems of Divine Mysteries:');
const gdmCh = data['gems-divine-mysteries/__chapters'];
if (gdmCh && gdmCh.length === 2) {
  gdmCh[0].title = 'Introduction';
  gdmCh[1].title = 'Gems of Divine Mysteries';
  const e1 = data['gems-divine-mysteries/' + gdmCh[0].urlSegment];
  const e2 = data['gems-divine-mysteries/' + gdmCh[1].urlSegment];
  if (e1) e1.title = 'Introduction';
  if (e2) e2.title = 'Gems of Divine Mysteries';
  fixes += 2;
  console.log('  Updated titles');
}

// ── 8. Fix Epistle to the Son of the Wolf titles ──
console.log('\nEpistle to the Son of the Wolf:');
const eswCh = data['epistle-son-wolf/__chapters'];
if (eswCh && eswCh.length === 2) {
  eswCh[0].title = 'Part One';
  eswCh[1].title = 'Part Two';
  const e1 = data['epistle-son-wolf/' + eswCh[0].urlSegment];
  const e2 = data['epistle-son-wolf/' + eswCh[1].urlSegment];
  if (e1) e1.title = 'Part One';
  if (e2) e2.title = 'Part Two';
  fixes += 2;
  console.log('  Updated titles');
}

// ── 9. Fix Secret of Divine Civilization titles ──
console.log('\nSecret of Divine Civilization:');
const sdcCh = data['secret-divine-civilization/__chapters'];
if (sdcCh && sdcCh.length === 2) {
  sdcCh[0].title = 'Part One';
  sdcCh[1].title = 'Part Two';
  const e1 = data['secret-divine-civilization/' + sdcCh[0].urlSegment];
  const e2 = data['secret-divine-civilization/' + sdcCh[1].urlSegment];
  if (e1) e1.title = 'Part One';
  if (e2) e2.title = 'Part Two';
  fixes += 2;
  console.log('  Updated titles');
}

// ── 10. Fix Promised Day is Come titles ──
console.log('\nPromised Day is Come:');
const pdcCh = data['promised-day-come/__chapters'];
if (pdcCh && pdcCh.length === 2) {
  pdcCh[0].title = 'Part One';
  pdcCh[1].title = 'Part Two';
  const e1 = data['promised-day-come/' + pdcCh[0].urlSegment];
  const e2 = data['promised-day-come/' + pdcCh[1].urlSegment];
  if (e1) e1.title = 'Part One';
  if (e2) e2.title = 'Part Two';
  fixes += 2;
  console.log('  Updated titles');
}

// ── 11. Fix Traveler's Narrative titles ──
console.log('\nTraveler\'s Narrative:');
const tnCh = data['travelers-narrative/__chapters'];
if (tnCh && tnCh.length === 3) {
  tnCh[0].title = 'Part One';
  tnCh[1].title = 'Part Two';
  tnCh[2].title = 'Notes';
  fixes += 3;
  console.log('  Updated titles');
}

// ── 12. Fix Will and Testament titles ──
console.log('\nWill and Testament:');
const wtCh = data['will-testament/__chapters'];
if (wtCh && wtCh.length === 3) {
  wtCh[0].title = 'Part One';
  wtCh[1].title = 'Part Two';
  wtCh[2].title = 'Part Three';
  fixes += 3;
  console.log('  Updated titles');
}

// ── 13. Fix Bahá'í Administration titles ──
console.log('\nBahá\'í Administration:');
const baCh = data['bahai-administration/__chapters'];
if (baCh && baCh.length === 2) {
  baCh[0].title = 'Excerpts from the Will and Testament';
  baCh[1].title = 'Letters from Shoghi Effendi (1922-1932)';
  fixes += 2;
  console.log('  Updated titles');
}

// ── 14. Fix Prayers and Meditations titles ──
console.log('\nPrayers and Meditations:');
const pmChFinal = data['prayers-meditations/__chapters'];
if (pmChFinal) {
  pmChFinal.forEach((ch, i) => {
    ch.title = 'Section ' + (i + 1);
    const entry = data['prayers-meditations/' + ch.urlSegment];
    if (entry) entry.title = ch.title;
  });
  fixes++;
  console.log('  Updated titles to Section 1-' + pmChFinal.length);
}

// Save
fs.writeFileSync(path.join(__dirname, '..', 'src', 'data', 'bookContent.json'), JSON.stringify(data, null, 2));
console.log('\nTotal fixes applied: ' + fixes);
console.log('Total entries: ' + Object.keys(data).length);
