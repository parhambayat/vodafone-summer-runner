import { spawn } from 'child_process';
import http from 'http';

const CHROME = process.env.CHROME ||
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const URL = 'http://localhost:5173/?smoke=' + Date.now();

function get(path) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:5173' + path, (res) => {
      let d = '';
      res.on('data', (c) => { d += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    }).on('error', reject);
  });
}

const files = await Promise.all([
  get('/'),
  get('/src/main.js'),
  get('/src/scenes/PreloadScene.js'),
  get('/src/SpriteFactory.js')
]);
console.log('HTTP', files.map((f) => f.status).join(','));
if (files.some((f) => f.status !== 200)) process.exit(1);

if (!files[2].body.includes('failsafe') && !files[2].body.includes('finish')) {
  console.error('PreloadScene does not contain updated loader');
  process.exit(1);
}
if (!files[3].body.includes('generateTexture')) {
  console.error('SpriteFactory still using old texture path');
  process.exit(1);
}
console.log('OK: updated loader + generateTexture present');

// Optional: launch chrome briefly (visual); ignore if fails
try {
  const child = spawn(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--dump-dom',
    URL
  ], { stdio: ['ignore', 'pipe', 'pipe'] });
  let out = '';
  child.stdout.on('data', (c) => { out += c; });
  await new Promise((r) => setTimeout(r, 5000));
  child.kill();
  const ok = out.includes('game-container') || out.includes('LOADING');
  console.log(ok ? 'OK: chrome dumped game page' : 'WARN: chrome dump empty');
} catch (e) {
  console.log('WARN: chrome smoke skipped', e.message);
}
