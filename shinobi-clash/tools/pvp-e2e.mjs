// Deux joueurs dans deux contextes isolés s'affrontent en PvP via le serveur local.
// Usage : npm run server & npm run preview & node tools/pvp-e2e.mjs [url] [dossier] [casual|ranked]
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:4173/';
const out = process.argv[3] ?? '.';
const mode = process.argv[4] ?? 'ranked';
const owned = (defId) => ({ defId, level: 15, xp: 0, stars: 1, fragments: 0, obtainedAt: 0, isNew: false });
const save = (name, team) => ({
  saveVersion: 3,
  username: name,
  avatar: team[0],
  collection: Object.fromEntries(team.map((id) => [id, owned(id)])),
  teams: [
    { id: 't1', name: 'Équipe 1', members: team },
    { id: 't2', name: 'Équipe 2', members: [null, null, null] },
    { id: 't3', name: 'PvP', members: [null, null, null] },
    { id: 't4', name: 'Farm', members: [null, null, null] },
  ],
  tutorial: { starterChosen: true, firstPackOpened: true, done: true },
  settings: { battleSpeed: 2 },
});
const errors = [];
const browser = await chromium.launch();

async function player(name, team) {
  const context = await browser.newContext({ viewport: { width: 1000, height: 760 } });
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
  page.on('console', (m) => m.type() === 'error' && errors.push(`${name}: ${m.text()}`));
  await page.addInitScript(
    (s) => {
      if (!sessionStorage.getItem('seeded')) {
        localStorage.setItem('shinobi-clash-save', JSON.stringify(s));
        sessionStorage.setItem('seeded', '1');
      }
    },
    save(name, team),
  );
  await page.goto(url);
  await page.locator('.start-menu .mitem', { hasText: 'DUELS' }).click();
  await page.waitForSelector('.pvp-modes');
  await page.locator('.pvp-mode', { hasText: mode === 'ranked' ? 'Classé' : 'Amical' }).click();
  return page;
}

async function play(page, name) {
  const start = Date.now();
  while (Date.now() - start < 240000) {
    if (await page.locator('.result').count()) return page.locator('.result div.big').innerText();
    const swap = page.locator('.menu-grid.swaps .swap-opt:not([disabled])');
    if (await swap.count())
      await swap
        .first()
        .click()
        .catch(() => undefined);
    await page.keyboard.press('1');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(150);
  }
  throw Error(`${name} : match non terminé`);
}

const a = await player('Alpha', ['naruto', 'sasuke', 'sakura']);
const b = await player('Bravo', ['gaara', 'temari', 'neji']);
await a.getByText('Chercher un adversaire').click();
await b.getByText('Chercher un adversaire').click();
await Promise.all([a.waitForSelector('.battle-screen'), b.waitForSelector('.battle-screen')]);
console.log(
  '• Match trouvé :',
  await a.locator('.battle-top .title').innerText(),
  '|',
  await b.locator('.battle-top .title').innerText(),
);
await a.waitForTimeout(4000);
await a.screenshot({ path: `${out}/pvp-alpha.png` });
await b.screenshot({ path: `${out}/pvp-bravo.png` });
const [ra, rb] = await Promise.all([play(a, 'Alpha'), play(b, 'Bravo')]);
await a.waitForTimeout(800);
await a.screenshot({ path: `${out}/pvp-resultat-alpha.png` });
console.log(`• Alpha : ${ra} · Bravo : ${rb}`);
const lb = await (await fetch(url.replace(/:\d+\/?$/, ':8787') + '/leaderboard')).json();
console.log('• Classement :', JSON.stringify(lb));
console.log(errors.length ? `ERREURS:\n${errors.join('\n')}` : 'Aucune erreur console.');
await browser.close();
process.exit(errors.length ? 1 : 0);
