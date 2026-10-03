// Captures d'écran rapides à partir d'une sauvegarde injectée.
// Usage : node tools/shots.mjs [url] [dossier] ; nécessite `npm run preview`.
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:4173/';
const out = process.argv[3] ?? '.';
const owned = (defId, level = 12) => ({ defId, level, xp: 0, stars: 1, fragments: 0, obtainedAt: 0, isNew: false });
const save = {
  saveVersion: 3,
  username: 'Testeur',
  avatar: 'naruto',
  collection: Object.fromEntries(
    ['naruto', 'sasuke', 'sakura', 'gaara', 'kakashi', 'itachi'].map((id) => [id, owned(id)]),
  ),
  teams: [
    { id: 't1', name: 'Équipe 1', members: ['naruto', 'sasuke', 'sakura'] },
    { id: 't2', name: 'Équipe 2', members: [null, null, null] },
    { id: 't3', name: 'PvP', members: [null, null, null] },
    { id: 't4', name: 'Farm', members: [null, null, null] },
  ],
  packs: { standard: 2 },
  pve: { cleared: { academy_1: 1, academy_2: 1 } },
  tutorial: { starterChosen: true, firstPackOpened: true, done: true },
  settings: { battleSpeed: 2 },
};
const errors = [];
const browser = await chromium.launch();

async function battleShots(name, viewport) {
  const page = await browser.newPage({ viewport });
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
  // Injectée avant le chargement : sinon la sauvegarde de la session précédente l'écrase au déchargement.
  await page.addInitScript((s) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('shinobi-clash-save', JSON.stringify(s));
      sessionStorage.setItem('seeded', '1');
    }
  }, save);
  await page.goto(url);
  await page.waitForSelector('.start-menu');
  await page.screenshot({ path: `${out}/${name}-accueil.png` });
  await page.locator('.start-menu .mitem', { hasText: 'JOUER' }).click();
  await page.waitForSelector('.map-frame');
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${out}/${name}-carte.png` });
  await page.locator('.stage-item:not([disabled])').last().click();
  await page.waitForSelector('.battle-screen');
  await page.waitForSelector('.dock[data-mode="split"]', { timeout: 20000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/${name}-menu.png` });
  await page.locator('.mitem', { hasText: 'JUTSU' }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/${name}-jutsus.png` });
  await page.keyboard.press('Escape');
  await page.locator('.mitem', { hasText: 'SHINOBI' }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/${name}-equipe.png` });
  await page.close();
}

await battleShots('portrait', { width: 390, height: 844 });
await battleShots('paysage', { width: 844, height: 390 });
await battleShots('desktop', { width: 1280, height: 800 });
console.log(errors.length ? errors.join('\n') : 'ok');
await browser.close();
