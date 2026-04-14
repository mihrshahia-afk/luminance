const fs = require('fs');
const path = require('path');
const data = require(path.join(__dirname, '..', 'src', 'data', 'bookContent.json'));
const configPath = path.join(__dirname, '..', 'src', 'data', 'bookConfig.ts');
let config = fs.readFileSync(configPath, 'utf8');

// For each book, replace its seedChapters array
Object.keys(data).filter(k => k.includes('/__chapters')).forEach(k => {
  const bookId = k.split('/')[0];
  const chapters = data[k];

  // Build the new seedChapters array
  const items = chapters.map(ch => {
    const title = ch.title.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `      { id: '${ch.id}', title: '${title}', urlSegment: '${ch.urlSegment}' }`;
  });
  const newArray = '[\n' + items.join(',\n') + ',\n    ]';

  // Find: id: 'bookId', ... seedChapters: [ ... ]
  const pattern = new RegExp(
    "(id:\\s*'" + bookId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "'[\\s\\S]*?seedChapters:\\s*)\\[[\\s\\S]*?\\]"
  );

  if (pattern.test(config)) {
    config = config.replace(pattern, '$1' + newArray);
    console.log(bookId + ': ' + chapters.length + ' chapters');
  } else {
    console.log(bookId + ': NOT FOUND');
  }
});

fs.writeFileSync(configPath, config);
console.log('\nDone - bookConfig.ts updated');
