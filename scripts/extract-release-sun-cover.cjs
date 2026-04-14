/*
  Render page 1 of scripts/release-the-sun.pdf to public/covers/release-the-sun.jpg
  using the copy of puppeteer already installed in this repo. Chrome's built-in
  PDF viewer renders the page; we locate the canvas element, crop to it, and
  write a JPG sized for the app's cover carousel.
*/
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const PDF = path.resolve(__dirname, 'release-the-sun.pdf');
const OUT = path.resolve(__dirname, '..', 'public', 'covers', 'release-the-sun.jpg');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 1200, deviceScaleFactor: 2 });

  // Render the PDF via pdf.js served from a simple HTML page so we have full
  // control over what gets captured, rather than Chrome's built-in viewer.
  const pdfBytes = fs.readFileSync(PDF);
  const b64 = pdfBytes.toString('base64');
  const html = `
    <!doctype html>
    <html><head><meta charset="utf-8"><style>
      html,body{margin:0;padding:0;background:#fff;}
      #canvas{display:block;margin:0 auto;}
    </style></head>
    <body><canvas id="canvas"></canvas>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    <script>
      (async () => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const data = atob('${b64}');
        const arr = new Uint8Array(data.length);
        for (let i=0;i<data.length;i++) arr[i] = data.charCodeAt(i);
        const pdf = await pdfjsLib.getDocument({ data: arr }).promise;
        const pg = await pdf.getPage(1);
        const viewport = pg.getViewport({ scale: 0.6 });
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await pg.render({ canvasContext: ctx, viewport }).promise;
        document.title = 'ready';
      })();
    </script></body></html>
  `;

  await page.setContent(html, { waitUntil: 'load' });
  await page.waitForFunction(() => document.title === 'ready', { timeout: 60000 });

  const canvas = await page.$('#canvas');
  const shot = await canvas.screenshot({ type: 'jpeg', quality: 85 });
  fs.writeFileSync(OUT, shot);

  console.log(`Wrote ${OUT} (${shot.length} bytes)`);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
