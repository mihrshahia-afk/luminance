const fs = require('fs');
const p = 'public/books/release-the-sun.json';
const db = JSON.parse(fs.readFileSync(p, 'utf8'));

const replacements = [
  ['\\Ve ', 'We '],
  ['\\Vho ', 'Who '],
  ['\\Vith ', 'With '],
  ['\\Vhose ', 'Whose '],
  ['\\iVho ', 'Who '],
  ['\\,Vellis ', 'Well is '],
  ['J\\1inister', 'Minister'],
  ['l\\1', 'M'],
  // Also fix other OCR garble found in scan
  ['Hirn ', 'Him '],
  ["Codi'", 'God!'],
];

let count = 0;
for (const k of Object.keys(db)) {
  if (k === '__chapters') continue;
  let c = db[k].content;
  for (const [from, to] of replacements) {
    while (c.includes(from)) {
      c = c.replace(from, to);
      count++;
    }
  }
  db[k].content = c;
}

fs.writeFileSync(p, JSON.stringify(db));
console.log('Fixed', count, 'backslash patterns');

// Verify
const db2 = JSON.parse(fs.readFileSync(p, 'utf8'));
const all = Object.keys(db2).filter(k => k !== '__chapters').map(k => db2[k].content).join('');
let remaining = 0;
for (let i = 0; i < all.length; i++) {
  if (all.charCodeAt(i) === 92) {
    remaining++;
    console.log('Still at', i, ':', JSON.stringify(all.slice(Math.max(0, i - 15), i + 15)));
  }
}
console.log('Remaining backslashes:', remaining);
