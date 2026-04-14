const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'public', 'temples');

async function processTemple(browser, name) {
  const inputPath = path.join(DIR, name + '.png');
  const outputPath = path.join(DIR, name + '-silhouette.png');

  const page = await browser.newPage();
  await page.setViewport({ width: 300, height: 300 });

  const imgBase64 = fs.readFileSync(inputPath).toString('base64');
  const imgDataUrl = 'data:image/png;base64,' + imgBase64;

  await page.setContent(`
    <html>
    <body style="margin:0;background:transparent;">
    <canvas id="c" width="300" height="300"></canvas>
    <script>
    const img = new Image();
    img.onload = () => {
      const canvas = document.getElementById('c');
      const ctx = canvas.getContext('2d');

      // Scale to fit, align bottom
      const scale = Math.min(280 / img.width, 250 / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (300 - w) / 2;
      const y = 290 - h;

      ctx.drawImage(img, x, y, w, h);

      const imageData = ctx.getImageData(0, 0, 300, 300);
      const d = imageData.data;

      // Sample sky color from top corners (where there's definitely sky)
      const skyPixels = [];
      for (let sy = 0; sy < 30; sy++) {
        for (let sx = 0; sx < 40; sx++) {
          const idx = (sy * 300 + sx) * 4;
          if (d[idx+3] > 0) skyPixels.push({ r: d[idx], g: d[idx+1], b: d[idx+2] });
        }
        for (let sx = 260; sx < 300; sx++) {
          const idx = (sy * 300 + sx) * 4;
          if (d[idx+3] > 0) skyPixels.push({ r: d[idx], g: d[idx+1], b: d[idx+2] });
        }
      }

      // Also sample bottom corners for ground
      const groundPixels = [];
      for (let sy = 270; sy < 300; sy++) {
        for (let sx = 0; sx < 40; sx++) {
          const idx = (sy * 300 + sx) * 4;
          if (d[idx+3] > 0) groundPixels.push({ r: d[idx], g: d[idx+1], b: d[idx+2] });
        }
        for (let sx = 260; sx < 300; sx++) {
          const idx = (sy * 300 + sx) * 4;
          if (d[idx+3] > 0) groundPixels.push({ r: d[idx], g: d[idx+1], b: d[idx+2] });
        }
      }

      function avg(pixels) {
        if (!pixels.length) return { r: 200, g: 200, b: 220 };
        return {
          r: pixels.reduce((s,p) => s+p.r, 0) / pixels.length,
          g: pixels.reduce((s,p) => s+p.g, 0) / pixels.length,
          b: pixels.reduce((s,p) => s+p.b, 0) / pixels.length,
        };
      }

      const skyAvg = avg(skyPixels);
      const groundAvg = avg(groundPixels);

      function colorDist(r, g, b, ref) {
        return Math.sqrt((r-ref.r)**2 + (g-ref.g)**2 + (b-ref.b)**2);
      }

      // Process each pixel
      for (let i = 0; i < d.length; i += 4) {
        if (d[i+3] === 0) continue;

        const r = d[i], g = d[i+1], b = d[i+2];
        const brightness = r * 0.299 + g * 0.587 + b * 0.114;

        const skyDist = colorDist(r, g, b, skyAvg);
        const groundDist = colorDist(r, g, b, groundAvg);

        const py = Math.floor(i / 4 / 300);

        // More aggressive sky removal
        const isSky = skyDist < 70 || (brightness > 190 && b > r * 0.85);
        // Ground removal (bottom portion, green/brown)
        const isGround = py > 250 && (groundDist < 50 || (g > r * 0.9 && brightness > 60));
        // Trees (green, any position)
        const isTree = g > r * 1.15 && g > b * 1.1 && brightness > 40 && brightness < 180;

        if (isSky || isGround || isTree) {
          d[i+3] = 0;
        } else {
          // Gold silhouette — opacity varies with how dark/distinct the pixel is
          const distinctness = Math.min(255, skyDist * 2);
          d[i] = 201;
          d[i+1] = 168;
          d[i+2] = 76;
          d[i+3] = Math.min(240, Math.max(60, distinctness));
        }
      }

      // Second pass: remove isolated pixels (noise reduction)
      const width = 300;
      const cleaned = new Uint8ClampedArray(d);
      for (let y = 1; y < 299; y++) {
        for (let x = 1; x < 299; x++) {
          const idx = (y * width + x) * 4;
          if (cleaned[idx+3] === 0) continue;

          // Count transparent neighbors
          let transparent = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dy === 0 && dx === 0) continue;
              const nIdx = ((y+dy) * width + (x+dx)) * 4;
              if (cleaned[nIdx+3] === 0) transparent++;
            }
          }
          // If mostly surrounded by transparent, remove (isolated noise)
          if (transparent >= 6) {
            d[idx+3] = 0;
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);
      window.__done = true;
    };
    img.src = '${imgDataUrl}';
    </script>
    </body>
    </html>
  `);

  await page.waitForFunction(() => window.__done, { timeout: 30000 });
  await page.screenshot({ path: outputPath, omitBackground: true });
  console.log('  Saved: ' + name + '-silhouette.png');
  await page.close();
}

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  for (const name of ['lotus', 'chile', 'sydney']) {
    console.log('Processing: ' + name);
    await processTemple(browser, name);
  }
  await browser.close();
  console.log('Done!');
})();
