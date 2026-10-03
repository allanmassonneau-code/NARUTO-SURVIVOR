// Parcours complet dans un vrai navigateur : onboarding, combat tutoriel, parchemin, équipe, second combat.
// Usage : npm run build && npx vite preview --port 4173 & node tools/e2e.mjs [url] [dossier-captures]
import { chromium } from 'playwright';

const url = process.argv[2] ?? 'http://localhost:4173/';
const outDir = process.argv[3] ?? '.';
const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`);
});
const shot = (name) => page.screenshot({ path: `${outDir}/${name}.png` });
const step = (text) => console.log(`• ${text}`);

/** Joue un combat au clavier : touche 1 (attaque de base) et Entrée pour accélérer, jusqu'à l'écran de résultat. */
async function fight(label, maxMs = 240000) {
  const start = Date.now();
  let shotTaken = false;
  while (Date.now() - start < maxMs) {
    if (await page.locator('.result').count()) return true;
    const replace = page.locator('.swap-opt:not([disabled])');
    if ((await page.locator('.menu-grid.swaps').count()) && (await replace.count())) await replace.first().click();
    await page.keyboard.press('1');
    await page.keyboard.press('Enter');
    if (!shotTaken && Date.now() - start > 6000) {
      await shot(`${label}-combat`);
      shotTaken = true;
    }
    await page.waitForTimeout(150);
  }
  throw Error(`${label} : combat non terminé`);
}

await page.goto(url);
await page.evaluate(() =>
  localStorage.setItem('shinobi-clash-save', JSON.stringify({ saveVersion: 3, settings: { battleSpeed: 2 } })),
);
await page.reload();
await page.waitForSelector('.starter');
step('Onboarding');
await page.fill('input.field', 'Testeur');
await page.locator('.starter').first().click();
await shot('01-onboarding');
await page.getByText('Commencer mon aventure').click();

step('Combat tutoriel');
await page.waitForSelector('.battle-screen');
await fight('02-tutoriel');
await page.waitForTimeout(1500);
await shot('03-resultat');
const result = await page.locator('.result div.big').innerText();
step(`Résultat : ${result}`);

step('Ouverture du parchemin');
await page.getByText('Ouvrir le parchemin').click();
await page.waitForSelector('.opening .stage-pack');
await page.waitForTimeout(500);
await shot('04-parchemin-ferme');
for (let i = 0; i < 3; i++) {
  await page.keyboard.press('Space');
  await page.waitForTimeout(450);
}
await page.waitForSelector('.reveal-row .fcard');
await page.waitForTimeout(900);
await shot('05-cartes-cachees');
for (let i = 0; i < 5; i++) {
  await page.keyboard.press('Space');
  await page.waitForTimeout(900);
  if (await page.locator('.big-reveal').count()) {
    await shot('05b-legendaire');
    await page.locator('.big-reveal').click();
  }
}
await page.waitForSelector('.opening .summary', { timeout: 15000 });
await page.waitForTimeout(400);
await shot('06-resume-parchemin');
const note = await page.locator('.pity-note').innerText();
step(`Résumé : ${note.replace(/\n/g, ' | ')}`);

step('Second combat (enchaîné depuis le résumé)');
await page.getByText('Combat suivant').click();
await page.waitForSelector('.battle-screen');
await fight('07-academie2');
await page.waitForTimeout(1200);
await shot('08-resultat2');
step(`Résultat : ${await page.locator('.result div.big').innerText()}`);
await page.getByText('Retour').click();

step('Écrans de menu');
await page.waitForSelector('.map-frame');
await shot('09-carte');
await page.keyboard.press('Escape');
await page.waitForSelector('.start-menu');
await shot('10-accueil');
for (const [label, name] of [
  ['COLLECTION', '11-collection'],
  ['ÉQUIPE', '12-equipe'],
  ['MISSIONS', '13-missions'],
  ['PASSE', '14-passe'],
  ['DUELS', '15-duels'],
  ['BOUTIQUE', '16-boutique'],
]) {
  await page.locator('.start-menu .mitem', { hasText: label }).click();
  await page.waitForTimeout(700);
  await shot(name);
  await page.locator('.back-btn').click();
  await page.waitForSelector('.start-menu');
}

step('Persistance après rechargement');
await page.reload();
await page.waitForSelector('.start-menu');
const owned = await page.evaluate(
  () => Object.keys(JSON.parse(localStorage.getItem('shinobi-clash-save')).collection).length,
);
step(`Shinobis possédés après rechargement : ${owned}`);

step('Mobile (390×844)');
await page.setViewportSize({ width: 390, height: 844 });
await page.locator('.start-menu .mitem', { hasText: 'JOUER' }).click();
await page.waitForSelector('.map-frame');
await shot('17-mobile-carte');
await page.locator('.stage-item:not([disabled])').first().click();
await page.waitForSelector('.battle-screen');
await page.waitForTimeout(4000);
await page.keyboard.press('Enter');
await page.waitForTimeout(1500);
await shot('18-mobile-combat');

console.log(errors.length ? `ERREURS:\n${errors.join('\n')}` : 'Aucune erreur console.');
await browser.close();
process.exit(errors.length ? 1 : 0);
