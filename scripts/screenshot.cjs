const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 500, deviceScaleFactor: 2 });
  const filePath = 'file:///' + path.resolve(__dirname, '..', 'temple-preview.html').replace(/\\/g, '/');
  await page.goto(filePath);
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(__dirname, '..', 'temple-preview.png'), fullPage: true });
  await browser.close();
  console.log('Screenshot saved');
})();
