// Recorre el sitio servido en BASE, guarda capturas en artifacts/ y avisa de errores y desbordes.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || '/home/gabsplat/Labs/briggs-rauscher/node_modules/playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:4340';
const routes = ['', 'que-nos-inspira', 'proceso-transformacion', 'nuestra-filosofia', 'clientes', 'clientes/ipc', 'clientes/nutriterra'];
const only = process.argv[2];

(async () => {
  const browser = await chromium.launch();
  const problems = [];
  for (const [name, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport });
    page.on('console', m => m.type() === 'error' && problems.push(`${name} console: ${m.text()}`));
    page.on('pageerror', e => problems.push(`${name} error: ${e.message}`));
    for (const route of routes) {
      if (only && only !== (route || 'home')) continue;
      const slug = (route || 'home').replace('/', '-');
      await page.goto(`${BASE}/${route}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1500);
      const total = await page.evaluate(() => document.documentElement.scrollHeight);
      const story = await page.evaluate(() => {
        const el = document.querySelector('.story');
        return el ? { top: el.getBoundingClientRect().top + scrollY, height: el.offsetHeight } : null;
      });
      let shot = 0;
      for (let y = 0; y < total; ) {
        await page.evaluate(v => scrollTo(0, v), y);
        await page.waitForTimeout(900);
        await page.screenshot({ path: `artifacts/${name}-${slug}-${String(shot++).padStart(2, '0')}.png` });
        const inStory = story && y >= story.top - 10 && y < story.top + story.height - viewport.height;
        y += inStory ? Math.round((story.height - viewport.height) / 11) : viewport.height;
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (overflow > 0) problems.push(`${name} /${route}: desborde horizontal de ${overflow}px`);
      const broken = await page.evaluate(() => [...document.images].filter(i => i.complete && !i.naturalWidth).map(i => i.src));
      if (broken.length) problems.push(`${name} /${route}: imágenes rotas ${broken}`);
    }
    await page.close();
  }
  await browser.close();
  console.log(problems.length ? problems.join('\n') : 'Sin errores ni desbordes.');
  process.exit(problems.length ? 1 : 0);
})();
