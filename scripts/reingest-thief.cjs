/*
  Re-ingest Thief in the Night with all ~67 chapters properly split.
  Uses exact TOC titles to find chapter boundaries in the body text.
*/
const fs = require('fs');
const path = require('path');

const buf = fs.readFileSync(path.join(__dirname, 'thief-in-the-night.txt'));
const text = buf.toString('latin1');
const lines = text.split(/\r?\n/);

// Full TOC from the PDF, grouped by Part
const PARTS = [
  { part: 'Part One — The Unsolved Problem', chapters: [
    'Once to Every Man and Nation', 'The Strange Case of the Missing Millennium',
    'The First Promise', 'The Second Promise', 'The Third Promise',
    'Other Promises', 'Yet more promises', 'Lift Up Your Heads',
    'The Mystery of the White Stone', 'The Rich Who are Poor',
    'The Light that Blinds', 'For None Can Read', 'A Mysterious Springtime',
    'The Living and the Dead', 'The Mouthpiece of God',
    'One Shepherd but Many Folds', 'The Unmistakable Signs',
    'Lightning from the East', 'The Vision of the Last Days', 'The Avalanche',
  ]},
  { part: 'Part Two — The Solution', chapters: [
    'The Mystery Begins to Unravel', 'The Remarkable Parallel',
    'The Twin Fires of Heaven', 'The Witnesses',
    'The Hidden is Revealed', 'The Glory of God',
  ]},
  { part: 'Part Three — The Proof', chapters: [
    'The King from the Sunrise', 'Ancient Land of Mystery',
    'Begotten in Babylon', 'The Amazing Micah', 'The Eight Astonishing Steps',
    'No Need of the Sun', 'The Families of the Earth Shall Be Blessed',
    'The Lord of the New Era', 'The Door of Hope',
    'Where the Poor are the Kings of Paradise', 'The Blossoming Desert',
    'Fire in the Sky!', 'He Shall Glorify Christ', 'The End of the Avalanche',
  ]},
  { part: 'Part Four — The Signs in the Heavens', chapters: [
    'The Signs in the Heavens', 'The Shaking Earth', 'The Blast of the Trumpet',
    'When Stars Fell Like Snowflakes', 'The Face of Heaven', 'The Night Visitor',
  ]},
  { part: 'Part Five — By Their Fruits', chapters: [
    'Beware of False Prophets', 'Enemy of the People', 'The Tree of Life',
    'The First Fruit: Home and Family', 'The Second Fruit: Country',
    'The Third Fruit: Religion', 'The Fourth Fruit: Individual Life',
    'A Searching Eye', 'The Bird with Two Wings', 'The Real Treasury',
    'No Man is a Stranger', 'Partners in Progress', 'The Beauty of the Rainbow',
    'The Worlds Beyond', 'Food for the Soul',
  ]},
  { part: 'Part Six — The Day of the Lord', chapters: [
    'Except These Days be Shortened', 'Nuclear Giants and Ethical Midgets',
    'The Chariots Shall Rage in the Streets', 'Terror in the Sky',
    'The Hour Hath Come', 'The Day of the Lord', 'The Dawn of a New Day',
  ]},
];

// Find each chapter's start line by searching for its numbered title in the body
// Chapter titles appear as "N. Title" where N resets per part
function findChapterLine(num, title, afterLine = 50) {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Try exact: "N. Title" at start of line
  const pat1 = new RegExp('^' + num + '\\.\\s+' + escaped, 'i');
  for (let i = afterLine; i < lines.length; i++) {
    if (pat1.test(lines[i].trim())) return i;
  }
  // Try: title embedded in a Part line: "Part N--... N. Title"
  const pat2 = new RegExp(num + '\\.\\s+' + escaped.slice(0, 30), 'i');
  for (let i = afterLine; i < lines.length; i++) {
    if (pat2.test(lines[i].trim())) return i;
  }
  // Fallback: just the title substring (case-insensitive)
  const lower = title.toLowerCase().slice(0, 25);
  for (let i = afterLine; i < lines.length; i++) {
    if (lines[i].trim().toLowerCase().includes(lower)) return i;
  }
  return -1;
}

// Also find Foreword
let forewordStart = -1;
for (let i = 15; i < 50; i++) {
  if (/^Forward|^Foreword/i.test(lines[i].trim())) { forewordStart = i; break; }
}

const sections = [];
let globalChNum = 0;

// Foreword
if (forewordStart >= 0) {
  // Find where foreword ends (first chapter of Part One)
  const firstChLine = findChapterLine(1, PARTS[0].chapters[0]);
  if (firstChLine > forewordStart) {
    let content = lines.slice(forewordStart, firstChLine).join('\n')
      .replace(/\f/g, '').replace(/^\d+\s*$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
    sections.push({ title: 'Foreword', content });
  }
}

// Process each part and its chapters
let lastFoundLine = 50;
for (const part of PARTS) {
  for (let i = 0; i < part.chapters.length; i++) {
    globalChNum++;
    const chTitle = part.chapters[i];
    const chNum = i + 1;
    const startLine = findChapterLine(chNum, chTitle, lastFoundLine);

    if (startLine < 0) {
      console.warn(`  WARNING: Could not find "${chNum}. ${chTitle}" after line ${lastFoundLine}`);
      continue;
    }
    lastFoundLine = startLine + 1;

    // End line: next chapter start, or next part's first chapter, or end of file
    let endLine = lines.length;
    if (i < part.chapters.length - 1) {
      const nextLine = findChapterLine(chNum + 1, part.chapters[i + 1], startLine + 1);
      if (nextLine > startLine) endLine = nextLine;
    } else {
      // Last chapter in part — find first chapter of next part
      const partIdx = PARTS.indexOf(part);
      if (partIdx < PARTS.length - 1) {
        const nextPartFirstLine = findChapterLine(1, PARTS[partIdx + 1].chapters[0], startLine + 1);
        if (nextPartFirstLine > startLine) endLine = nextPartFirstLine;
      }
    }

    let content = lines.slice(startLine, endLine).join('\n')
      .replace(/\f/g, '').replace(/^\d+\s*$/gm, '').replace(/\n{3,}/g, '\n\n').trim();

    sections.push({ title: chTitle, content });
  }
}

// Build JSON
const db = {};
db.__chapters = sections.map((s, i) => ({
  id: `thief-in-the-night-${i + 1}`,
  title: s.title,
  urlSegment: String(i + 1),
}));
sections.forEach((s, i) => { db[String(i + 1)] = { title: s.title, content: s.content }; });
fs.writeFileSync(path.join(__dirname, '..', 'public', 'books', 'thief-in-the-night.json'), JSON.stringify(db));
console.log(`Thief in the Night: ${sections.length} sections`);
sections.forEach((s, i) => console.log(`  ${String(i+1).padEnd(3)} ${s.title.padEnd(50)} ${s.content.length} chars`));
