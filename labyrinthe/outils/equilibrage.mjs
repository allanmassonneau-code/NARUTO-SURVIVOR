// Banc d'équilibrage : parties simulées par le pilote automatique (Chromium, Playwright).
// Usage : node labyrinthe/outils/equilibrage.mjs [CHR_001,CHR_002,…] [graine]
// Pour chaque personnage, une partie de huit étages ; le joueur ne peut pas mourir mais chaque coup
// qui l'aurait touché est compté. Mesures par étage : puissance (dégâts × cadence × multitir),
// temps moyen pour vider une salle de combat, coups encaissés, durée et coups du combat de boss,
// Ryō récoltés. Le pilote ne sait pas esquiver : les coups comptent la pression, pas la difficulté réelle.
// Écrit catalogues/equilibrage.json et affiche un résumé (moyennes par étage, médiane des boss).
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }
const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = 'file://' + resolve(racine, 'jeu', 'index.html');
const persos = (process.argv[2] || 'CHR_001,CHR_002,CHR_003,CHR_004,CHR_005,CHR_006,CHR_007,CHR_008,CHR_009,CHR_010,CHR_011,CHR_012').split(',');
const graine = process.argv[3] || '7';

const exe = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
let b; try { b = await pw.chromium.launch({ executablePath: exe, args: ['--mute-audio'] }); } catch (e) { b = await pw.chromium.launch(); }
const page = await b.newPage(); const erreurs = []; page.on('pageerror', e => erreurs.push(String(e).slice(0, 300)));
await page.goto(PAGE); await page.waitForTimeout(300);
await page.addScriptTag({ content: readFileSync(join(racine, 'outils', 'aide_tests.js'), 'utf8') });

const parties = [];
for (const perso of persos) {
  const r = await page.evaluate(([perso, code]) => {
    const L = window.LDS, G = L.G, T = window.__T; L.Progression.profil.toutDebloque = true; L.Progression.profil.routes = { RTE_01: true, RTE_02: true };
    L.nouvellePartie({ perso, code }); L.Scenes.aller(L.SceneJeu); T.pas(10); G.modeTest = { dieu: true, deblocages: [] };
    const puissance = J => { const S = J.stats, P = J.profil; return +(S.degats * S.cadence * (P.multi || 1) * (P.coefMulti || 1) * (P.coefDegats || 1)).toFixed(1); };
    const out = { perso, etages: [] };
    for (let et = 1; et <= 8; et++) {
      if (!G.partie || G.partie.etage !== et) break;
      const E = G.etage, J = G.joueur;
      const F = { et, theme: E.cfg.nom, puissance: puissance(J), degats: J.stats.degats, cadence: +J.stats.cadence.toFixed(2), passifs: J.passifs.length, ryo0: J.ryo, dep0: G.stats.depenses || 0, salles: 0, tSalles: 0, coupsSalles: 0 };
      for (const id of Object.values(E.salles).filter(s => s.type !== 'boss' && s.id !== 'opp').map(s => s.id)) {
        const s = E.salles[id]; if (s.type === 'cache' || s.type === 'isolee') for (const x of Object.values(E.salles)) for (const q of x.portes) if (q.vers === id && q.etat === 'secrete') q.etat = 'ouverte';
        T.allerA(id); const combat = !!G.salle.combat, t0 = G.temps, c0 = G.modeTest.coups || 0;
        T.bot(60, { jusquaNettoyage: true, actif: true, bombes: true });
        if (combat) { F.salles++; F.tSalles += G.temps - t0; F.coupsSalles += (G.modeTest.coups || 0) - c0; }
        if (G.salle.combat) { for (const x of G.ennemis) x.pv = 1; T.bot(5, {}); }
        T.prendreTout();
      }
      T.allerA(E.boss); T.pas(120, ['Enter']);
      F.boss = G.ennemis.filter(x => x.boss).map(x => x.id).join('+'); const t0 = G.temps, c0 = G.modeTest.coups || 0; F.puissanceBoss = puissance(G.joueur);
      T.bot(150, { jusquaNettoyage: true, actif: true, relacher: true });
      F.tBoss = Math.round(G.temps - t0); F.coupsBoss = (G.modeTest.coups || 0) - c0; F.bossVaincu = !G.ennemis.some(x => x.boss && !x.mort);
      if (!F.bossVaincu) { for (const x of G.ennemis) x.pv = 1; T.bot(10, {}); }
      if (!(G.partie && G.partie.etage > et)) { if (G.salle.id !== E.boss && E.salles[E.boss]) T.allerA(E.boss); T.prendreTout(); }
      F.ryo = G.joueur.ryo - F.ryo0 + (G.stats.depenses || 0) - F.dep0; F.tSalles = +(F.tSalles / Math.max(1, F.salles)).toFixed(1); F.coupsSalles = +(F.coupsSalles / Math.max(1, F.salles)).toFixed(2);
      F.eveils = G.joueur.transformations.filter(t => L.INDEX[t].type === 'eveil').length; F.transformations = G.joueur.transformations.length - F.eveils;
      out.etages.push(F);
      if (G.partie && G.partie.etage > et) continue;
      const so = (G.salle.sorties || []).find(x => x.type === 'etage' && (!x.condition || x.condition())) || (G.salle.sorties || [])[0]; if (!so) break;
      const avant = G.partie.etage; for (let k = 0; k < 400 && G.partie && G.partie.etage === avant && !G.partie.fini; k++) { const J2 = G.joueur; if (!G.enAnimationObjet && !G.fondu) { J2.x = so.x; J2.y = so.y; } T.pas(1, G.enAnimationObjet ? ['Enter'] : []); }
    }
    return out;
  }, [perso, 'EQUI' + perso.slice(-3) + graine]);
  parties.push(r); console.error(perso + ' : ' + r.etages.length + ' étages');
}
await b.close();
writeFileSync(join(racine, 'catalogues', 'equilibrage.json'), JSON.stringify({ graine, parties }, null, 1) + '\n');

const moy = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
const med = a => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
console.log('Étage | puissance | passifs | s / salle | coups / salle | boss : médiane s | coups / boss | Ryō');
for (let et = 1; et <= 8; et++) {
  const F = parties.map(r => r.etages.find(f => f.et === et)).filter(Boolean); if (!F.length) continue;
  console.log([et, moy(F.map(f => f.puissance)).toFixed(1), moy(F.map(f => f.passifs)).toFixed(1), moy(F.map(f => f.tSalles)).toFixed(1), moy(F.map(f => f.coupsSalles)).toFixed(2),
    med(F.map(f => f.tBoss)), moy(F.map(f => f.coupsBoss)).toFixed(1), moy(F.map(f => f.ryo)).toFixed(0)].join(' | '));
}
const B = {}; for (const r of parties) for (const f of r.etages) (B[f.boss] = B[f.boss] || []).push(f);
console.log('\nBoss | combats | durée moyenne | coups | non vaincus');
for (const [id, L] of Object.entries(B)) console.log([id, L.length, moy(L.map(f => f.tBoss)).toFixed(0) + ' s', moy(L.map(f => f.coupsBoss)).toFixed(1), L.filter(f => !f.bossVaincu).length].join(' | '));
console.log(erreurs.length ? 'ERREURS :\n' + erreurs.join('\n') : 'aucune erreur de page');
