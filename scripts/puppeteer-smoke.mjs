import puppeteer from 'puppeteer-core';

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--use-gl=swiftshader']
});

const page = await browser.newPage();
const errors = [];
const failed = [];
const logs = [];

page.on('pageerror', (e) => errors.push('pageerror: ' + String(e)));
page.on('console', (msg) => logs.push(msg.type() + ': ' + msg.text()));
page.on('response', (res) => {
  if (res.status() >= 400) failed.push(res.status() + ' ' + res.url());
});

await page.goto('http://localhost:5173/?t=' + Date.now(), {
  waitUntil: 'domcontentloaded',
  timeout: 20000
});

await new Promise((r) => setTimeout(r, 6000));

const info = await page.evaluate(() => {
  const game = window.__VF_GAME__;
  let scenes = [];
  let textureCount = 0;
  if (game) {
    scenes = game.scene.getScenes(true).map((s) => s.scene.key);
    textureCount = Object.keys(game.textures.list || {}).length;
  }
  return {
    hasPhaser: typeof window.Phaser !== 'undefined',
    hasGame: !!game,
    phaserVer: window.Phaser?.VERSION,
    scenes,
    textureCount,
    canvas: !!document.querySelector('canvas'),
    bodyText: document.body?.innerText?.slice(0, 200) || ''
  };
});

console.log(JSON.stringify({ info, errors, failed, logs: logs.slice(0, 40) }, null, 2));
await browser.close();

if (errors.some((e) => e.includes('pageerror'))) process.exitCode = 2;
if (info.scenes?.includes('MenuScene')) {
  console.log('SUCCESS');
} else {
  console.log('CURRENT SCENES:', info.scenes);
  process.exitCode = 4;
}
