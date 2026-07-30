/**
 * Rasterize Vodafone SVG logos to transparent PNGs.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assets = path.resolve(__dirname, '..', 'assets');

const chromeCandidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
].filter(Boolean);

function findChrome() {
  for (const p of chromeCandidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('Chrome/Edge not found');
}

async function render(svgName, outName, size = 256) {
  const svg = fs.readFileSync(path.join(assets, svgName), 'utf8');
  const html = `<!doctype html><html><head><style>
    html,body{margin:0;padding:0;background:transparent;width:${size}px;height:${size}px;overflow:hidden}
    svg{display:block;width:${size}px;height:${size}px}
  </style></head><body>${svg
    .replace(/width="512"/, `width="${size}"`)
    .replace(/height="512"/, `height="${size}"`)}</body></html>`;

  const browser = await puppeteer.launch({
    executablePath: findChrome(),
    headless: 'new',
    args: ['--no-sandbox', '--force-device-scale-factor=1']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({
    path: path.join(assets, outName),
    omitBackground: true,
    clip: { x: 0, y: 0, width: size, height: size }
  });
  await browser.close();
  console.log('wrote', outName, fs.statSync(path.join(assets, outName)).size);
}

await render('vodafone-logo.svg', 'vodafone-logo.png', 256);
await render('vodafone-mark-white.svg', 'vodafone-mark-white.png', 256);
