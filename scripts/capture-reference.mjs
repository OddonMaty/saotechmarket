import puppeteer from 'puppeteer-core';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const legacyDir = path.join(rootDir, 'legacy');
const outDir = path.join(rootDir, 'design-reference');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Simple static server for legacy files
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.txt': 'text/plain',
  '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  let reqPath = req.url ? req.url.split('?')[0] : '/';
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  const filePath = path.join(legacyDir, reqPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  res.writeHead(200, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(8085, '127.0.0.1', async () => {
  console.log('Legacy server running on http://127.0.0.1:8085');

  const edgePath =
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const pagesToCapture = [
    'home',
    'collection',
    'product',
    'seller',
    'seller-dashboard',
    'account',
    'checkout',
    'faq',
    'about',
    'contact',
  ];

  const viewports = [
    { name: '390', width: 390, height: 844 },
    { name: '1440', width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height });

    for (const pageName of pagesToCapture) {
      console.log(`Capturing ${pageName} at ${vp.width}px...`);
      await page.goto('http://127.0.0.1:8085/index.html', {
        waitUntil: 'networkidle0',
      });

      // Navigate to the target page via legacy JS
      await page.evaluate((target) => {
        if (typeof window.loadPage === 'function') {
          window.loadPage(target);
        }
      }, pageName);

      // Wait a moment for rendering and fonts
      await new Promise((resolve) => setTimeout(resolve, 800));

      const screenshotPath = path.join(outDir, `${pageName}-${vp.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`Saved ${screenshotPath}`);
    }

    await page.close();
  }

  await browser.close();
  server.close(() => {
    console.log('All legacy reference captures finished successfully!');
    process.exit(0);
  });
});

