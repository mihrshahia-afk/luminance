const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Use real temple photos from Wikimedia Commons (public domain / CC licensed)
const TEMPLES = [
  {
    name: 'lotus',
    // Lotus Temple photo - front view showing the petals clearly
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Lotus_Temple_in_New_Delhi_03-2016.jpg/800px-Lotus_Temple_in_New_Delhi_03-2016.jpg',
  },
  {
    name: 'chile',
    // Chile Temple - showing the wing panels
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Templo_Bah%C3%A1%27%C3%AD_de_Sudam%C3%A9rica.jpg/800px-Templo_Bah%C3%A1%27%C3%AD_de_Sudam%C3%A9rica.jpg',
  },
  {
    name: 'sydney',
    // Sydney Temple - showing the dome and colonnade
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Baha%27i_House_of_Worship%2C_Sydney.jpg/800px-Baha%27i_House_of_Worship%2C_Sydney.jpg',
  },
];

async function makesilhouette(browser, temple) {
  const page = await browser.newPage();
  await page.setViewport({ width: 400, height: 400 });

  // Create a canvas page that loads the image and converts to silhouette
  await page.setContent(`
    <html>
    <body style="margin:0;background:transparent;">
    <canvas id="c" width="400" height="400"></canvas>
    <script>
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.getElementById('c');
      const ctx = canvas.getContext('2d');

      // Draw image centered and scaled to fit
      const scale = Math.min(380 / img.width, 380 / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (400 - w) / 2;
      const y = (400 - h) / 2;

      ctx.drawImage(img, x, y, w, h);

      // Get image data
      const imageData = ctx.getImageData(0, 0, 400, 400);
      const d = imageData.data;

      // Convert to silhouette: any non-sky pixel becomes gold, sky becomes transparent
      // Use brightness threshold — sky is typically bright blue/white
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i+1], b = d[i+2], a = d[i+3];
        if (a === 0) continue;

        // Calculate brightness
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
        // Sky detection: high brightness OR blue-dominant
        const isSky = brightness > 180 || (b > r && b > g && brightness > 120);
        // Ground/grass: green dominant and bright
        const isGround = (g > r && g > b && brightness > 100 && brightness < 200);

        if (isSky || isGround) {
          d[i+3] = 0; // transparent
        } else {
          // Make it a solid gold silhouette
          d[i] = 201;   // R
          d[i+1] = 168; // G
          d[i+2] = 76;  // B
          d[i+3] = 220; // mostly opaque
        }
      }

      ctx.putImageData(imageData, 0, 0);
      window.__done = true;
    };
    img.onerror = () => { window.__error = true; };
    img.src = '${temple.url}';
    </script>
    </body>
    </html>
  `);

  // Wait for processing
  await page.waitForFunction(() => window.__done || window.__error, { timeout: 30000 });

  const error = await page.evaluate(() => window.__error);
  if (error) {
    console.log('  ERROR loading image for ' + temple.name);
    await page.close();
    return;
  }

  // Save as PNG
  const outPath = path.join(__dirname, '..', 'public', 'temples', temple.name + '.png');
  await page.screenshot({ path: outPath, omitBackground: true });
  console.log('  Saved: ' + outPath);
  await page.close();
}

async function main() {
  const outDir = path.join(__dirname, '..', 'public', 'temples');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

  for (const temple of TEMPLES) {
    console.log('Processing: ' + temple.name);
    await makesilhouette(browser, temple);
  }

  await browser.close();
  console.log('\nDone!');
}

main().catch(console.error);
