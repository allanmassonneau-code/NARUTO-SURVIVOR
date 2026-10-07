// Tests automatisés du jeu dans Chromium (Playwright).
// Usage : node labyrinthe/outils/tests_jeu.mjs [section…]
// Sections : generation, parcours, objets, actifs, synergies, boss, ennemis, personnages, sauvegarde, manette, economie,
// secours, visibilite, mecaniques, pactes, opportunites, eveils, defis
// Ne remplace pas une recette manuelle à la manette : il vérifie l'absence d'erreurs
// et des invariants (portes reliées, boss atteignable, récompenses uniques…).
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }
const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = 'file://' + resolve(racine, 'jeu', 'index.html');
const demandees = process.argv.slice(2); const veut = s => !demandees.length || demandees.includes(s);

const AIDE = readFileSync(join(racine, 'outils', 'aide_tests.js'), 'utf8');

(async () => {
  const exe = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  let b; try { b = await pw.chromium.launch({ executablePath: exe }); } catch (e) { b = await pw.chromium.launch(); }
  const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const erreursPage = []; page.on('pageerror', e => erreursPage.push(String(e.stack || e).slice(0, 500)));
  await page.goto(PAGE); await page.waitForTimeout(300);
  await page.addScriptTag({ content: AIDE });
  await page.evaluate(() => { const L = window.LDS; L.Progression.profil.toutDebloque = true; L.G.modeTest = {}; window.__T.rendu = 7; }); // rendu d'une image sur 7 : les erreurs de dessin sont aussi détectées
  const res = {}; let echecs = 0;
  const lancer = async (nom, fn, arg) => { const t0 = Date.now(); try { const r = await page.evaluate(fn, arg); res[nom] = r; if (r && (r.ko && r.ko.length || r.erreur)) echecs++; } catch (e) { res[nom] = { erreur: String(e).slice(0, 400) }; echecs++; } console.log('== ' + nom + ' (' + ((Date.now() - t0) / 1000).toFixed(1) + ' s) : ' + JSON.stringify(res[nom]).slice(0, 3000)); };

  // 1) Génération : 400 étages, invariants topologiques et de gabarits
  if (veut('generation')) await lancer('generation', () => {
    const L = window.LDS; const out = { ko: [], etages: 0, secours: 0, essaisMoy: 0, formes: {} };
    for (let k = 0; k < 400; k++) {
      const code = 'T' + String(k).padStart(7, '2').replace(/[01]/g, '9').slice(0, 7);
      const n = 1 + (k % 9); L.G.partie = { code, etage: n, branche: k % 2 ? 'lumiere' : 'ombre', retires: [], vus: [], pactesAchetes: 0, joueur: null };
      try {
        const cfg = L.configEtage(n); const E = L.genererEtage(L.G.partie, n, cfg); out.etages++; out.essaisMoy += E.essais; if (E.diagnostics.includes('SECOURS')) out.secours++;
        const S = Object.values(E.salles);
        if (!S.some(s => s.type === 'boss')) out.ko.push(code + ' sans boss');
        // graphe : toutes les salles non secrètes atteignables depuis le départ par des portes non secrètes
        const vu = new Set([0]); const f = [0]; while (f.length) { const s = E.salles[f.pop()]; for (const p of s.portes) if (p.etat !== 'secrete' && !vu.has(p.vers)) { vu.add(p.vers); f.push(p.vers); } }
        for (const s of S) if (!['cache', 'isolee'].includes(s.type) && !vu.has(s.id)) out.ko.push(code + ' salle isolée ' + s.id + ' ' + s.type);
        // la route vers le boss ne demande ni clé ni explosif
        const vu2 = new Set([0]); const f2 = [0]; while (f2.length) { const s = E.salles[f2.pop()]; for (const p of s.portes) if (p.etat === 'ouverte' && !vu2.has(p.vers) && !['cache', 'isolee'].includes(E.salles[p.vers].type)) { vu2.add(p.vers); f2.push(p.vers); } }
        if (!vu2.has(E.boss)) out.ko.push(code + ' boss inaccessible sans clé');
        // secrets : chaque porte secrète est réciproque
        for (const s of S) for (const p of s.portes) { const v = E.salles[p.vers]; if (!v || !v.portes.some(q => q.vers === s.id)) out.ko.push(code + ' porte non réciproque ' + s.id + '→' + p.vers); }
        // gabarits : portes reliées à pied dans chaque salle
        for (const s of S) {
          out.formes[s.forme] = (out.formes[s.forme] || 0) + 1;
          const fronts = s.portes.map(p => { const [dx, dy] = { haut: [0, -1], bas: [0, 1], gauche: [-1, 0], droite: [1, 0] }[p.dir]; return [p.tx - dx, p.ty - dy]; });
          for (const [x, y] of fronts) { const t = s.tuiles[y * s.W + x]; if (![3, 14, 15, 17].includes(t)) { out.ko.push(code + ' devant de porte bloqué salle ' + s.id + ' (' + s.gabarit + ') tuile ' + t); } }
        }
      } catch (e) { out.ko.push(code + ' ' + String(e.stack || e).slice(0, 200)); }
    }
    out.essaisMoy = +(out.essaisMoy / out.etages).toFixed(2); out.ko = out.ko.slice(0, 30); return out;
  });

  // 2) Parcours complet d'une partie (mode dieu) : étages 1 → 9, boss, objets, trappes
  if (veut('parcours')) for (const [perso, code] of (process.env.PERSOS ? process.env.PERSOS.split(',').map(x => x.split(':')) : [['CHR_001', 'PARC2345'], ['CHR_005', 'LEEA2345'], ['CHR_002', 'SASK2345']])) await lancer('parcours ' + perso, ([perso, code]) => {
    const L = window.LDS, G = L.G, T = window.__T; const out = { ko: [], etages: [], boss: [], objets: 0, salles: 0 };
    L.Progression.profil.routes = { RTE_01: true, RTE_02: true };
    L.nouvellePartie({ perso, code }); L.Scenes.aller(L.SceneJeu); T.pas(10); G.modeTest.deblocages = [];
    for (let et = 1; et <= 9; et++) {
      if (!G.partie || G.partie.etage !== et) { out.ko.push('étage attendu ' + et + ' obtenu ' + (G.partie && G.partie.etage)); break; }
      const E = G.etage; out.etages.push(E.cfg.nom); if (et === 1) out.plan1 = Object.values(E.salles).map(s => s.id + ':' + s.gabarit).join(' '); (out.inventaires || (out.inventaires = [])).push(et + ':' + G.joueur.passifs.join(',') + ' actif=' + (G.joueur.actif && G.joueur.actif.id) + ' forme=' + G.joueur.profil.forme + ' tal=' + G.joueur.talisman);
      const ids = Object.values(E.salles).filter(s => s.type !== 'boss' && s.id !== 'opp').map(s => s.id);
      for (const id of ids) {
        const s = E.salles[id]; if (s.type === 'cache' || s.type === 'isolee') { for (const x of Object.values(E.salles)) for (const p of x.portes) if (p.vers === id && p.etat === 'secrete') { p.etat = 'ouverte'; } }
        let e = T.allerA(id); if (e) { out.ko.push('entrée ' + id + ' : ' + e); continue; }
        e = T.bot(60, { dieu: true, jusquaNettoyage: true, actif: true, bombes: true }); if (e) { out.ko.push('combat ' + id + ' (' + s.type + ') : ' + e); }
        if (G.salle.combat) out.ko.push('salle ' + id + ' ' + s.type + ' ' + s.gabarit + ' non nettoyée : ' + G.ennemis.map(x => x.id + ':' + Math.round(x.pv)).join(','));
        const n = T.prendreTout(); if (typeof n === 'string') out.ko.push('ramassage ' + id + ' : ' + n); else out.objets += n;
        out.salles++;
        if (G.joueur.etat === 'mort') { out.ko.push('mort'); return out; }
      }
      // boss
      let e = T.allerA(E.boss); if (e) out.ko.push('entrée boss : ' + e);
      T.pas(120, ['Enter']);
      const nomBoss = G.ennemis.filter(x => x.boss).map(x => x.id).join('+'); out.boss.push(nomBoss);
      const t0 = G.temps; e = T.bot(150, { dieu: true, jusquaNettoyage: true, actif: true, relacher: true }); if (e) out.ko.push('boss ' + nomBoss + ' : ' + e);
      out.boss[out.boss.length - 1] += ' ' + Math.round(G.temps - t0) + ' s';
      if (G.ennemis.some(x => x.boss && !x.mort)) { out.ko.push('boss ' + nomBoss + ' invaincu après 150 s : ' + G.ennemis.filter(x => x.boss).map(x => Math.round(x.pv) + '/' + Math.round(x.pvMax)).join(',')); for (const x of G.ennemis) x.pv = 1; T.bot(10, { dieu: true }); }
      if (G.partie && G.partie.etage > et) continue; // le pilote a emprunté la trappe tout seul
      if (G.salle.id !== E.boss && E.salles[E.boss]) T.allerA(E.boss); // le pilote a pu errer dans la salle de pacte ouverte après le boss
      T.prendreTout();
      const s = G.salle; const sorties = s.sorties || [];
      if (!sorties.length) { const sb = E.salles[E.boss]; out.ko.push('aucune sortie étage ' + et + ' (salle courante ' + s.id + ' ' + s.type + ', salle boss : sorties ' + (sb.sorties || []).length + ', bossVaincu ' + !!sb.bossVaincu + ', ennemis ' + G.ennemis.map(x => x.id + (x.mort ? '†' : '')).join(',') + ')'); break; }
      const so = sorties.find(x => x.type === 'etage' && (!x.condition || x.condition())) || sorties[0];
      const avant = G.partie.etage; let k = 0;
      for (; k < 400 && G.partie && G.partie.etage === avant && !G.partie.fini; k++) { const J = G.joueur; if (!G.enAnimationObjet && !G.fondu) { J.x = so.x; J.y = so.y; } const e2 = T.pas(1, G.enAnimationObjet ? ['Enter'] : []); if (e2) { out.ko.push('sortie : ' + e2); break; } if (L.Scenes.courante() !== L.SceneJeu) break; }
      if (so.type === 'fin') { out.fin = so.route + (L.Scenes.courante() !== L.SceneJeu ? ' (écran de fin)' : ' (pas d’écran de fin)'); break; }
      if (k >= 400) { out.ko.push('sortie étage ' + et + ' non empruntée'); break; }
    }
    out.passifs = G.joueur ? G.joueur.passifs.length : 0; out.secours = (G.modeTest.deblocages || []).map(d => d.gabarit + ':' + d.ennemi).join(' ') || 0;
    if (G.joueur) { const J = G.joueur, S = J.stats, P = J.profil; out.stats = { degats: S.degats, cadence: +S.cadence.toFixed(2), multi: P.multi, forme: P.forme, perce: P.perce, familiers: J.familiers.length, detailFam: Object.entries(J.familiers.reduce((m, f) => (m[f.id + '<' + (f.source || '?') + (f.dureeSalle ? ' salle' : '')] = (m[f.id + '<' + (f.source || '?') + (f.dureeSalle ? ' salle' : '')] || 0) + 1, m), {})).map(([k, v]) => k + '×' + v).join(' '), dps: +(S.degats * S.cadence * P.coefDegats * Math.max(1, P.multi * (P.coefMulti || 1))).toFixed(1) }; out.liste = J.passifs.join(' '); } out.ko = out.ko.slice(0, 25); return out;
  }, [perso, code]);

  // 3) Chaque objet passif : acquisition, 6 s de combat, dégâts infligés
  if (veut('objets')) await lancer('objets', () => {
    const L = window.LDS, G = L.G, T = window.__T; const out = { ko: [], sansDegats: [], ok: 0 };
    for (const o of L.DON.objets.filter(x => x.type === 'passif')) {
      try {
        L.nouvellePartie({ perso: 'CHR_001', code: 'QBJT2345' }); L.Scenes.aller(L.SceneJeu); T.pas(5);
        const s = Object.values(G.etage.salles).find(x => x.type === 'combat' && x.pointsApparition && x.pointsApparition.length >= 2) || Object.values(G.etage.salles).find(x => x.type === 'combat');
        L.acquerirPassif(G.joueur, o.id, 'test'); T.pas(60, ['Enter']);
        let e = T.allerA(s.id); if (e) { out.ko.push(o.id + ' entrée ' + e); continue; }
        const d0 = G.stats.degats; e = T.bot(6, { dieu: true, relacher: true }); if (e) { out.ko.push(o.id + ' ' + e); continue; }
        if (G.stats.degats <= d0 && G.ennemis.length) out.sansDegats.push(o.id); else out.ok++;
      } catch (err) { out.ko.push(o.id + ' ' + String(err.stack || err).slice(0, 200)); }
    }
    return out;
  });

  // 4) Chaque actif
  if (veut('actifs')) await lancer('actifs', () => {
    const L = window.LDS, G = L.G, T = window.__T; const out = { ko: [], ok: 0 };
    for (const o of L.DON.objets.filter(x => x.type === 'actif')) {
      try {
        L.nouvellePartie({ perso: 'CHR_001', code: 'ACTF2345' }); L.Scenes.aller(L.SceneJeu); T.pas(5);
        const s = Object.values(G.etage.salles).find(x => x.type === 'combat' && x.pointsApparition && x.pointsApparition.length >= 2) || Object.values(G.etage.salles).find(x => x.type === 'combat');
        T.allerA(s.id); T.pas(40);
        G.joueur.actif = { id: o.id, charges: 99 }; if (o.recharge) G.joueur.actif.temps = 999; if (o.persoExclusif === 'ALT_001') G.joueur.clones = 2;
        let e = T.pas(1, ['Space']); if (e) { out.ko.push(o.id + ' ' + e); continue; }
        e = T.bot(4, { dieu: true }); if (e) { out.ko.push(o.id + ' ' + e); continue; }
        out.ok++;
      } catch (err) { out.ko.push(o.id + ' ' + String(err.stack || err).slice(0, 200)); }
    }
    // Échanges sans va-et-vient : l'objet reposé (actif sur son piédestal, talisman lâché) ne se reprend
    // qu'après s'en être éloigné, quelle que soit la cadence d'affichage
    try {
      L.nouvellePartie({ perso: 'CHR_001', code: 'ACTF2345' }); L.Scenes.aller(L.SceneJeu); T.pas(5);
      const J = G.joueur, S = G.salle, A = L.DON.objets.filter(x => x.type === 'actif');
      J.actif = { id: A[0].id, charges: 1 }; const p = L.poserPiedestal(S, J.x, J.y - 4, A[1].id);
      let n = 0, avant = J.actif.id; for (let i = 0; i < 400; i++) { T.pas(1); if (J.actif.id !== avant) { n++; avant = J.actif.id; } }
      if (n !== 1 || J.actif.id !== A[1].id || p.id !== A[0].id) out.ko.push('échange d’actif en boucle : ' + n + ' échanges immobile');
      J.x += 40; T.pas(10); J.x -= 40; T.pas(120);
      if (J.actif.id !== A[0].id) out.ko.push('actif reposé impossible à reprendre après s’être éloigné');
      const tal = L.DON.talismans; J.talisman = tal[0].id; const r = L.creerRamassable('talisman', J.x, J.y, { id: tal[1].id }); r.age = 1;
      T.pas(20); const lache = S.ramassables.find(x => x.type === 'talisman' && x.id === tal[0].id);
      if (J.talisman !== tal[1].id || !lache) out.ko.push('prise de talisman sans dépôt de l’ancien');
      else { for (let i = 0; i < 30; i++) { J.x = lache.x - 16 + i; T.pas(1); } if (J.talisman !== tal[1].id) out.ko.push('talisman lâché repris en passant dessus (va-et-vient)'); }
    } catch (err) { out.ko.push('échanges ' + String(err.stack || err).slice(0, 200)); }
    // Délai de 3 s après la prise d'un actif, décompté après l'animation : ni l'actif reposé (même en s'éloignant
    // puis revenant aussitôt) ni un autre actif voisin ne se prennent ; touché pendant le délai, un actif ne part
    // pas tout seul à la fin du délai : il faut s'en éloigner puis revenir
    try {
      L.nouvellePartie({ perso: 'CHR_001', code: 'ACTG2345' }); L.Scenes.aller(L.SceneJeu); T.pas(5);
      const J = G.joueur, S = G.salle, A = L.DON.objets.filter(x => x.type === 'actif');
      J.actif = { id: A[0].id, charges: 1 }; const x0 = J.x, y0 = J.y;
      const p = L.poserPiedestal(S, x0, y0 - 4, A[1].id), q = L.poserPiedestal(S, x0 + 70, y0 - 4, A[2].id);
      let k = 0; while (J.actif.id !== A[1].id && k++ < 60) T.pas(1);
      let f = 0; while (J.etat !== 'normal' && f++ < 90) T.pas(1); // fin de l'animation de prise (≈ 0,8 s)
      if (!(J.delaiActif > 2.9)) out.ko.push('délai d’actif entamé pendant l’animation de prise (' + J.delaiActif.toFixed(2) + ' s restantes)');
      J.x = x0 + 40; T.pas(3); J.x = x0; J.y = y0; T.pas(3);
      if (J.actif.id !== A[1].id) out.ko.push('actif reposé repris pendant le délai');
      J.x = q.x; J.y = q.y + 4; T.pas(3);
      if (J.actif.id !== A[1].id) out.ko.push('second actif pris pendant le délai');
      T.pas(190);
      if (J.actif.id !== A[1].id) out.ko.push('actif pris tout seul à la fin du délai, sans bouger');
      J.x = q.x + 40; T.pas(3); J.x = q.x; J.y = q.y + 4; T.pas(3);
      if (J.actif.id !== A[2].id || q.id !== A[1].id) out.ko.push('second actif impossible à prendre une fois le délai écoulé');
    } catch (err) { out.ko.push('délai actif ' + String(err.stack || err).slice(0, 200)); }
    return out;
  });

  // 4 bis) Chaque synergie à effet : réunie, annoncée, et sa mécanique propre se produit en combat
  if (veut('synergies')) await lancer('synergies', () => {
    const L = window.LDS, G = L.G, T = window.__T; const out = { ko: [], ok: 0, fusions: 0 };
    const PORTEUR = { katon: 'PSV_043', futon: 'PSV_046', doton: 'PSV_047', suiton: 'PSV_044', raiton: 'PSV_045', hyoton: 'PSV_050' };
    const ATTENDU = { SYN_061: 'lave', SYN_062: 'vapeur', SYN_064: 'foudre', SYN_069: 'jinton', SYN_081: 'foudre' };
    for (const sy of L.DON.synergies.filter(x => x.effets && x.effets.length)) {
      try {
        L.nouvellePartie({ perso: 'CHR_001', code: 'SYNR2345' }); L.Scenes.aller(L.SceneJeu); T.pas(5); G.modeTest.dieu = true; G.modeTest.degatsPar = {};
        const J = G.joueur; const ids = sy.composants.concat((sy.elements || []).map(n => PORTEUR[n]));
        for (const id of ids) { if (L.INDEX[id].type === 'actif') { J.actif = { id, charges: 9 }; if (!J.acquis.includes(id)) J.acquis.push(id); } else L.acquerirPassif(J, id, 'test'); }
        L.recalculer(J);
        if (!L.synergiesActives(J).some(x => x.id === sy.id)) { out.ko.push(sy.id + ' inactive'); continue; }
        if (!J.synergiesVues.includes(sy.id)) { out.ko.push(sy.id + ' non annoncée'); continue; }
        if (sy.elements) out.fusions++;
        const s = Object.values(G.etage.salles).find(x => x.type === 'combat' && x.pointsApparition && x.pointsApparition.length >= 2) || Object.values(G.etage.salles).find(x => x.type === 'combat');
        let e = T.allerA(s.id); if (e) { out.ko.push(sy.id + ' entrée ' + e); continue; }
        if (sy.effets.some(x => x.quand === 'degat_recu')) { J.sante = L.santeInit({ vitalite: 1, pleins: 1 }); L.evenement('degat_recu', {}); }
        if (sy.effets.some(x => x.quand === 'boss_vaincu')) { const n = J.sante.cont.length; L.evenement('boss_vaincu', {}); if (J.sante.cont.length <= n) out.ko.push(sy.id + ' : aucun contenant après un boss'); }
        for (let i = 0; i < 90 && G.ennemis.some(x => !x.mort && x.apparition > 0); i++) T.pas(1); // ennemis pleinement apparus
        for (const x of sy.effets) if (x.tousLes) J.compteurs['tl_' + sy.id] = x.tousLes - 1; // la prochaine émission déclenche
        e = T.bot(4, { dieu: true }); if (e) { out.ko.push(sy.id + ' ' + e); continue; }
        if (ATTENDU[sy.id] && !Object.keys(G.modeTest.degatsPar).some(k => k.startsWith(ATTENDU[sy.id]))) { out.ko.push(sy.id + ' : aucun dégât « ' + ATTENDU[sy.id] + ' » (' + Object.keys(G.modeTest.degatsPar).join(',') + ')'); continue; }
        out.ok++;
      } catch (err) { out.ko.push(sy.id + ' ' + String(err.stack || err).slice(0, 200)); }
    }
    // bandeaux : l'objet ramassé s'affiche d'abord, la synergie qu'il complète ensuite (jamais écrasée),
    // et rien ne passe par-dessus le titre d'étage
    try {
      L.nouvellePartie({ perso: 'CHR_001', code: 'BAND2345' }); L.Scenes.aller(L.SceneJeu); T.pas(5); G.modeTest.dieu = true;
      const J = G.joueur; L.acquerirPassif(J, 'PSV_043', 'test'); L.recalculer(J); G.banniere = null; G.banniereFile = [];
      const p = L.poserPiedestal(G.salle, J.x, J.y - 30, 'PSV_047'); J.x = p.x; J.y = p.y + 6; T.pas(3, []);
      if (!G.banniereEtage) out.ko.push('bandeaux : titre d’étage déjà parti (scénario invalide)');
      const B = G.banniere, F = (G.banniereFile || []).map(b => b.nom);
      if (!B || B.nom !== L.INDEX.PSV_047.nom) out.ko.push('bandeaux : l’objet ramassé n’est pas en tête (' + (B && B.nom) + ')');
      if (!F.some(n => n.includes('Yōton'))) out.ko.push('bandeaux : synergie Yōton perdue (file : ' + F.join(', ') + ')');
      if (B && B.t > 0.01) out.ko.push('bandeaux : le bandeau d’objet avance sous le titre d’étage');
      T.pas(Math.round((3.4 + 2.7) * 60), []);
      if (!G.banniere || !G.banniere.synergie) out.ko.push('bandeaux : la synergie ne suit pas l’objet (' + (G.banniere && G.banniere.nom) + ')');
    } catch (err) { out.ko.push('bandeaux ' + String(err.stack || err).slice(0, 200)); }
    G.modeTest.dieu = false; return out;
  });

  // 5) Chaque boss : apparition, dangers, dégâts subis, mort possible
  if (veut('boss')) await lancer('boss', () => {
    const L = window.LDS, G = L.G, T = window.__T; const out = { ko: [], intouchable: [], ok: 0, durees: {} };
    for (const d of L.DON.boss) {
      try {
        L.nouvellePartie({ perso: 'CHR_001', code: 'BZSS2345' }); L.Scenes.aller(L.SceneJeu); T.pas(5);
        const s = G.etage.salles[G.etage.boss]; s.bossDef = d.id; s.visitee = true; s.ennemisDef = [];
        T.allerA(s.id); T.pas(120, ['Enter']);
        const b = G.ennemis.find(x => x.id === d.id); if (!b) { out.ko.push(d.id + ' absent'); continue; }
        G.joueur.passifs.push('PSV_034', 'PSV_034', 'PSV_036'); L.recalculer(G.joueur);
        let t = 0; let e = null; for (; t < 150 && G.ennemis.some(x => x.boss && !x.mort); t++) { e = T.bot(1, { dieu: true, relacher: true }); if (e) break; }
        if (e) { out.ko.push(d.id + ' ' + e); continue; }
        out.durees[d.id] = t;
        if (G.ennemis.some(x => x.boss && !x.mort)) out.intouchable.push(d.id + ' ' + G.ennemis.filter(x => x.boss).map(x => Math.round(x.pv) + '/' + Math.round(x.pvMax)).join(','));
        else out.ok++;
      } catch (err) { out.ko.push(d.id + ' ' + String(err.stack || err).slice(0, 300)); }
    }
    return out;
  });

  // 6) Chaque ennemi : 8 s de combat
  if (veut('ennemis')) await lancer('ennemis', () => {
    const L = window.LDS, G = L.G, T = window.__T; const out = { ko: [], invaincus: [], ok: 0 };
    for (const d of L.DON.ennemis) {
      try {
        L.nouvellePartie({ perso: 'CHR_001', code: 'ENNM2345' }); L.Scenes.aller(L.SceneJeu); T.pas(5);
        const s = Object.values(G.etage.salles).find(x => x.type === 'combat'); s.ennemisDef = [{ id: d.id, x: 13 * 32 / 2 + 60, y: 5 * 32 }, { id: d.id, x: 13 * 32 / 2 - 60, y: 3 * 32 }]; s.visitee = true;
        T.allerA(s.id); G.joueur.passifs.push('PSV_034', 'PSV_034'); L.recalculer(G.joueur);
        const e = T.bot(12, { dieu: true, jusquaNettoyage: true }); if (e) { out.ko.push(d.id + ' ' + e); continue; }
        if (G.salle.combat) out.invaincus.push(d.id); else out.ok++;
      } catch (err) { out.ko.push(d.id + ' ' + String(err.stack || err).slice(0, 300)); }
    }
    return out;
  });

  // 7) Chaque personnage : 20 s sur l'étage 1
  if (veut('personnages')) await lancer('personnages', () => {
    const L = window.LDS, G = L.G, T = window.__T; const out = { ko: [], ok: 0 };
    for (const p of L.DON.personnages) {
      try {
        L.nouvellePartie({ perso: p.id, code: 'PERS2345' }); L.Scenes.aller(L.SceneJeu); T.pas(5);
        const s = Object.values(G.etage.salles).find(x => x.type === 'combat'); T.allerA(s.id);
        const e = T.bot(20, { dieu: true, actif: true, relacher: true }); if (e) { out.ko.push(p.id + ' ' + e); continue; }
        out.ok++;
      } catch (err) { out.ko.push(p.id + ' ' + String(err.stack || err).slice(0, 300)); }
    }
    // table de conversion de Rock Lee : la mêlée reste principale, la frappe céleste devient une contribution
    L.nouvellePartie({ perso: 'CHR_005', code: 'CQNV2345' }); L.Scenes.aller(L.SceneJeu); T.pas(3); L.acquerirPassif(G.joueur, 'PSV_020', 'test'); L.recalculer(G.joueur);
    if (G.joueur.profil.forme !== 'lame' || G.joueur.profil.frappeDifferee !== 3) out.ko.push('Lee + Chute céleste : forme ' + G.joueur.profil.forme);
    L.nouvellePartie({ perso: 'CHR_001', code: 'CQNV2345' }); L.Scenes.aller(L.SceneJeu); T.pas(3); L.acquerirPassif(G.joueur, 'PSV_020', 'test'); L.acquerirPassif(G.joueur, 'PSV_021', 'test'); L.recalculer(G.joueur); T.pas(5, []);
    if (G.joueur.profil.forme !== 'frappe' || !G.orbes.some(o => o.appoint)) out.ko.push('Naruto + Chute céleste + Sphère téléguidée : forme ' + G.joueur.profil.forme + ', sphère d’appoint ' + G.orbes.some(o => o.appoint));
    return out;
  });

  // 8) Sauvegarde et reprise ; récompenses non dupliquées ; migration
  if (veut('sauvegarde')) await lancer('sauvegarde', () => {
    const L = window.LDS, G = L.G, T = window.__T; const out = { ko: [] }; G.modeTest = null;
    L.nouvellePartie({ perso: 'CHR_003', code: 'SAUV2345' }); L.Scenes.aller(L.SceneJeu); T.pas(5);
    const s = Object.values(G.etage.salles).find(x => x.type === 'combat'); T.allerA(s.id); T.bot(20, { dieu: true, jusquaNettoyage: true });
    const charges = G.joueur.actif.charges; T.pas(5);
    const snap = L.serialiserPartie(); const json = JSON.stringify(snap); if (json.length > 2e6) out.ko.push('sauvegarde trop grosse ' + json.length);
    L.reprendrePartie(JSON.parse(json)); L.Scenes.aller(L.SceneJeu); T.pas(5);
    if (G.salle.id !== s.id) out.ko.push('salle reprise ' + G.salle.id + ' ≠ ' + s.id);
    if (G.salle.combat) out.ko.push('la salle nettoyée est repartie en combat');
    if (G.joueur.actif.charges !== charges) out.ko.push('charges ' + G.joueur.actif.charges + ' ≠ ' + charges);
    T.allerA(0, 'gauche'); T.allerA(s.id, 'droite'); if (G.joueur.actif.charges !== charges) out.ko.push('recharge à la revisite');
    // migration v2 → v3
    const v2 = JSON.parse(json); v2.v = 2; v2.joueur.poche = v2.joueur.poches[0] || null; delete v2.joueur.poches; try { L.reprendrePartie(v2); } catch (e) { out.ko.push('migration ' + e); }
    out.taille = json.length; G.modeTest = {}; return out;
  });

  // 9) Manette simulée : menus depuis le titre sans clavier
  if (veut('manette')) await lancer('manette', async () => {
    const L = window.LDS; const out = { ko: [] };
    const pad = { id: 'Xbox Wireless Controller (STANDARD GAMEPAD Vendor: 045e)', index: 0, connected: true, buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })), axes: [0, 0, 0, 0], vibrationActuator: { playEffect: () => Promise.resolve() } };
    navigator.getGamepads = () => [pad];
    const appui = (b, n = 3) => { pad.buttons[b].pressed = true; pad.buttons[b].value = 1; for (let i = 0; i < n; i++) { L.Entrees.maj(1 / 60); L.Scenes.maj(1 / 60); L.Entrees.finPas(); } pad.buttons[b].pressed = false; pad.buttons[b].value = 0; for (let i = 0; i < 3; i++) { L.Entrees.maj(1 / 60); L.Scenes.maj(1 / 60); L.Entrees.finPas(); } };
    L.G.partie = null; L.Stockage.effacer(L.CLES.partie); // aucune partie suspendue : « Nouvelle partie » a le focus
    L.Scenes.aller(L.SceneTitre);
    for (let i = 0; i < 2; i++) { L.Entrees.maj(1 / 60); L.Scenes.maj(1 / 60); L.Entrees.finPas(); } // entrées consommées au changement de scène
    appui(0); // Nouvelle partie
    if (L.Scenes.pile.length !== 2) out.ko.push('« Nouvelle partie » non ouverte à la manette');
    appui(15); appui(14); appui(0); // carrousel : suivant puis précédent (Naruto, tir simple), valider
    if (!L.G.partie) out.ko.push('la partie n’a pas démarré à la manette');
    else {
      appui(9); if (L.Scenes.pile.length < 2) out.ko.push('pause non ouverte');
      appui(1); if (L.Scenes.pile.length !== 1) out.ko.push('pause non refermée par Retour');
      // stick droit : tir, puis retour au centre = arrêt
      pad.axes = [0, 0, 0, 0]; for (let i = 0; i < 2; i++) { L.Entrees.maj(1 / 60); L.Scenes.maj(1 / 60); L.Entrees.finPas(); } // la visée consommée à la fermeture du menu se relâche d'abord
      pad.axes = [0, 0, 1, 0]; for (let i = 0; i < 30; i++) { L.Entrees.maj(1 / 60); L.Scenes.maj(1 / 60); L.Entrees.finPas(); }
      const nb = L.G.proj.filter(p => p.proprio === 'joueur').length; if (!nb) out.ko.push('le stick droit ne tire pas');
      pad.axes = [0, 0, 0.62, 0.6]; L.Entrees.maj(1 / 60); const d1 = L.Entrees.visee.dir; pad.axes = [0, 0, 0.6, 0.62]; L.Entrees.maj(1 / 60); const d2 = L.Entrees.visee.dir;
      if (d1 !== d2) out.ko.push('hystérésis : oscillation ' + d1 + '/' + d2);
      pad.axes = [0, 0, 0, 0]; L.Entrees.maj(1 / 60); if (L.Entrees.visee.dir) out.ko.push('le tir ne s’arrête pas au centre');
      // profil par défaut (comme Isaac) : en jeu, Y tire vers le haut ; interagir passe sur la croix, les menus gardent A
      pad.buttons[3].pressed = true; let viseY = null; for (let i = 0; i < 30; i++) { L.Entrees.maj(1 / 60); L.Scenes.maj(1 / 60); L.Entrees.finPas(); viseY = viseY || L.Entrees.visee.dir; }
      pad.buttons[3].pressed = false; for (let i = 0; i < 2; i++) { L.Entrees.maj(1 / 60); L.Scenes.maj(1 / 60); L.Entrees.finPas(); }
      if (viseY !== 'haut' || !L.G.proj.some(p => p.proprio === 'joueur' && p.vy < -1)) out.ko.push('les boutons de face ne tirent pas en jeu (visée ' + viseY + ')');
      if (!L.Entrees.liaisonsManette('interagir', true).includes(13) || !L.Entrees.liaisonsManette('interagir', false).includes(0)) out.ko.push('interagir : croix ↓ en jeu, A dans les menus attendus');
      L.G.reglages.profilTir = 'stick+croix'; pad.buttons[3].pressed = true; for (let i = 0; i < 3; i++) { L.Entrees.maj(1 / 60); L.Scenes.maj(1 / 60); L.Entrees.finPas(); }
      if (L.Entrees.visee.dir) out.ko.push('profil stick + croix : Y tire encore'); pad.buttons[3].pressed = false; L.G.reglages.profilTir = 'stick+boutons';
      for (let i = 0; i < 2; i++) { L.Entrees.maj(1 / 60); L.Scenes.maj(1 / 60); L.Entrees.finPas(); }
      // consommation : la validation qui ferme un menu ne pose pas d'explosif
      const ex = L.G.joueur.explosifs; appui(9); pad.buttons[5].pressed = true; appui(1); pad.buttons[5].pressed = false; for (let i = 0; i < 3; i++) { L.Entrees.maj(1 / 60); L.Scenes.maj(1 / 60); L.Entrees.finPas(); }
      if (L.G.joueur.explosifs !== ex) out.ko.push('explosif posé en fermant un menu');
      // déconnexion → pause
      window.dispatchEvent(Object.assign(new Event('gamepaddisconnected'), { gamepad: pad }));
      if (L.Scenes.pile.length < 2) out.ko.push('pas de pause à la déconnexion');
    }
    // effacer une partie suspendue efface aussi sa copie de secours (pas de résurrection d'une partie perdue)
    L.Stockage.ecrire('lds_test', { v: 1, n: 1 }); L.Stockage.ecrire('lds_test', { v: 1, n: 2 }); L.Stockage.effacer('lds_test');
    if (L.Stockage.lire('lds_test')) out.ko.push('partie effacée relue depuis la copie de secours');
    return out;
  });

  // 10) Règles et économie : formule de stats indépendante de l'ordre, ordre des dégâts,
  //     soldes/coupon, contrat en Ryō, crochetage, énergie naturelle, plein de vitalité, explosions
  if (veut('economie')) await lancer('economie', () => {
    const L = window.LDS, G = L.G, T = window.__T; const out = { ko: [], ok: 0 }; const verif = (c, m) => { if (c) out.ok++; else out.ko.push(m); };
    const nouvelle = (perso) => { L.nouvellePartie({ perso: perso || 'CHR_001', code: 'ECQN2345' }); L.Scenes.aller(L.SceneJeu); T.pas(5); return G.joueur; };
    // ordre des acquisitions sans effet sur les stats
    const lot = L.DON.objets.filter(o => o.type === 'passif' && (o.effets || []).some(e => e.s)).slice(0, 12).map(o => o.id);
    let J = nouvelle(); for (const id of lot) L.acquerirPassif(J, id, 'test'); const s1 = JSON.stringify(J.stats);
    J = nouvelle(); for (const id of lot.slice().reverse()) L.acquerirPassif(J, id, 'test'); const s2 = JSON.stringify(J.stats);
    verif(s1 === s2, 'stats dépendantes de l’ordre : ' + s1 + ' ≠ ' + s2);
    // ordre des dégâts : protections avant vitalité ; un prix n'est pas un dommage
    J = nouvelle(); J.sante = L.santeInit({ vitalite: 3, protection: 2 }); const r0 = L.rougeTotal(J.sante); J.invuln = 0; L.blesserJoueur(1, {});
    verif(L.rougeTotal(J.sante) === r0 && J.sante.prot.length === 3, 'la protection doit absorber avant la vitalité');
    const dv = G.etage.degatsSubis; G.etage.degatsSubis = false; L.payerSante(1, 'test'); verif(!G.etage.degatsSubis, 'payer un prix ne doit pas compter comme un dommage');
    G.etage.degatsSubis = dv;
    // soldes et coupon
    J = nouvelle(); const s = G.salle; J.ryo = 99; const p = L.poserPiedestal(s, J.x + 60, J.y, 'PSV_034', { prix: { type: 'ryo', n: 15 } });
    verif(L.prixRyo(p) === 15, 'prix de base');
    J.drapeaux.soldes = true; verif(L.prixRyo(p) === 8, 'soldes : 15 → 8 attendu, obtenu ' + L.prixRyo(p)); J.drapeaux.soldes = false;
    J.drapeaux.coupon = true; verif(L.prixRyo(p) === 0, 'coupon : premier achat gratuit'); L.acheter(p); verif(J.ryo === 99, 'coupon : aucun Ryō débité (reste ' + J.ryo + ')');
    const p2 = L.poserPiedestal(s, J.x - 60, J.y, 'PSV_036', { prix: { type: 'ryo', n: 15 } }); verif(L.prixRyo(p2) === 15, 'coupon : un seul achat gratuit par étage');
    // contrat de Kakuzu : pacte en Ryō si possible
    J.drapeaux.pacteRyoOption = true; J.ryo = 45; const pp = L.poserPiedestal(s, J.x, J.y + 60, 'PSV_037', { prix: { type: 'pacte', n: 2 } });
    const v = L.peutPayer(pp); verif(v.ok && v.ryo === 40, 'contrat : 2 contenants = 40 Ryō'); const vit0 = J.sante.cont.length; L.acheter(pp); verif(J.ryo === 5 && J.sante.cont.length === vit0, 'contrat : Ryō débités, vitalité intacte');
    J.ryo = 10; const pp2 = L.poserPiedestal(s, J.x, J.y - 60, 'PSV_038', { prix: { type: 'pacte', n: 1 } }); verif(!L.peutPayer(pp2).ryo, 'contrat : sans assez de Ryō, prix en santé');
    // crochetage des coffres
    J = nouvelle(); J.cles = 0; J.drapeaux.crochetageCoffres = true; const c = L.creerRamassable('coffre_verrouille', J.x + 8, J.y, { immobile: true }); c.age = 1; L.collecter(c, J);
    verif(!G.salle.ramassables.includes(c) || c.ouvert || c.pris, 'crochetage : le coffre verrouillé doit s’ouvrir sans clé');
    // énergie naturelle
    J = nouvelle(); L.acquerirPassif(J, 'PSV_144', 'test'); T.pas(90, ['Enter']); T.pas(5, ['KeyD']); const d0 = J.stats.degats; T.pas(80, []); verif(J.sage && Math.abs(J.stats.degats - d0 * 1.5) < 0.01, 'énergie naturelle : ×1,5 après 1 s immobile (' + d0 + ' → ' + J.stats.degats + ')');
    T.pas(10, ['KeyD']); verif(!J.sage && Math.abs(J.stats.degats - d0) < 0.01, 'énergie naturelle : perdue au premier pas');
    // plein de vitalité
    J = nouvelle(); J.talisman = 'TAL_013'; L.recalculer(J); T.pas(2, []); const d1 = J.stats.degats; J.invuln = 0; L.blesserJoueur(1, {}); T.pas(2, []);
    verif(Math.abs(d1 - J.stats.degats - 0.5) < 0.01, 'charme du plein : +0,5 perdu après un coup (' + d1 + ' → ' + J.stats.degats + ')');
    // explosions renforcées
    J = nouvelle(); const e = L.creerEnnemi('ENM_002', J.x + 80, J.y, { sansApparition: true }); e.pv = e.pvMax = 100; J.drapeaux.explosionPlus = true; L.explosion(e.x, e.y, 20, 10, { proprio: 'joueur' });
    verif(Math.abs(100 - e.pv - 15) < 0.01, 'dent de requin : explosion 10 + 5 attendue, dégâts ' + (100 - e.pv));
    // machines : douze usages de chaque type sans erreur (loterie à gains doublés comprise)
    J = nouvelle(); J.ryo = 200; J.sante = L.santeInit({ vitalite: 6 }); J.drapeaux.loterieDouble = true; const ryo0 = J.ryo;
    for (const type of ['loterie', 'don_vital', 'diseuse', 'soin', 'recharge', 'troc']) { const m = { x: J.x, y: J.y - 40, type, usages: 0, uid: 1 }; G.salle.machines.push(m); for (let i = 0; i < 12; i++) { try { L.utiliserMachine(m); } catch (e) { out.ko.push('machine ' + type + ' : ' + String(e).slice(0, 120)); break; } } }
    verif(J.ryo < ryo0, 'les machines consomment des Ryō');
    // objets sans fonction exclus avant tirage : Sasori (sans vitalité) ne tire jamais le Sceau de régénération
    J = nouvelle('CHR_011'); const tirs = []; for (let i = 0; i < 40; i++) tirs.push(L.tirerObjet(G.partie, 'sanctuaire', G.alea.butin));
    verif(!tirs.includes('PSV_087'), 'Sasori : PSV_087 (soin seul) ne doit pas être tiré');
    // un identifiant débloqué par deux objectifs : l'un ou l'autre suffit
    const Pg = L.Progression, pr = Pg.profil; const avant = { tout: pr.toutDebloque, obj: Object.assign({}, pr.objectifs) };
    pr.toutDebloque = false; pr.objectifs = {}; const bloque = !Pg.estDebloque('PSV_020'); pr.objectifs = { OBJ_028: 1 }; const parMadara = Pg.estDebloque('PSV_020'); pr.objectifs = { OBJ_049: 1 }; const parBreche = Pg.estDebloque('PSV_020');
    pr.toutDebloque = avant.tout; pr.objectifs = avant.obj;
    verif(bloque && parMadara && parBreche, 'Chute céleste : verrouillée puis débloquée par OBJ_028 ou OBJ_049 (' + [bloque, parMadara, parBreche] + ')');
    // contrepartie en contenants payée en réserves quand il n'y a pas de contenant (Sasori)
    J = nouvelle('CHR_011'); const pr0 = J.sante.prot.length; L.acquerirPassif(J, 'PSV_092', 'test');
    verif(J.sante.prot.length === pr0 - 4, 'Porte de la Vie gratuite pour Sasori : réserve ' + pr0 + ' → ' + J.sante.prot.length);
    // offrande au tanuki de l'échoppe : 1 Ryō → +1 au cumul du profil (paliers de boutique)
    J = nouvelle(); const sb = Object.values(G.etage.salles).find(x => x.type === 'boutique');
    if (sb) { T.allerA(sb.id); const st = G.salle.statue; if (!st) out.ko.push('boutique sans tanuki');
      else { J.ryo = 3; const d0 = L.Progression.profil.dons; J.x = st.x; J.y = st.y + 14; T.pas(2, []); T.pas(1, ['KeyF']); T.pas(2, []);
        verif(J.ryo === 2 && L.Progression.profil.dons === d0 + 1, 'offrande : ryo=' + J.ryo + ' dons ' + d0 + '→' + L.Progression.profil.dons); } }
    return out;
  });

  // 11) Secours d'un ennemi réellement inaccessible : îlot entouré de fosses, joueur immobile
  if (veut('secours')) await lancer('secours', () => {
    const L = window.LDS, G = L.G, T = window.__T; const out = { ko: [] };
    L.nouvellePartie({ perso: 'CHR_005', code: 'SECQ2345' }); L.Scenes.aller(L.SceneJeu); T.pas(5); G.modeTest.dieu = true;
    const s = Object.values(G.etage.salles).find(x => x.type === 'combat' && x.forme === '1x1');
    s.visitee = true; s.ennemisDef = [{ id: 'ENM_003', x: 7 * 32 + 16, y: 4 * 32 + 16 }];
    for (let ty = 2; ty <= 6; ty++) for (let tx = 5; tx <= 9; tx++) if (!(tx === 7 && ty === 4)) s.tuiles[ty * s.W + tx] = L.T.FOSSE;
    T.allerA(s.id); G.modeTest.deblocages = [];
    const e0 = G.ennemis[0]; const x0 = e0.x, y0 = e0.y; T.pas(60 * 12, []);
    if (!G.modeTest.deblocages.length) out.ko.push('aucun secours après 12 s');
    else if (Math.hypot(e0.x - x0, e0.y - y0) < 16 && !e0.mort) out.ko.push('ennemi non déplacé');
    if (G.modeTest.deblocages.length > 1) out.ko.push('secours répété : ' + G.modeTest.deblocages.length);
    out.secours = G.modeTest.deblocages; G.modeTest.dieu = false; return out;
  });

  // 12) Visibilité : chaque ennemi et chaque boss dessine réellement des pixels
  // (un décalage non numérique rend un sprite invisible sans erreur)
  if (veut('visibilite')) await lancer('visibilite', () => {
    const L = window.LDS, G = L.G, T = window.__T; const out = { ko: [], ok: 0 };
    L.nouvellePartie({ perso: 'CHR_001', code: 'VYSY2345' }); L.Scenes.aller(L.SceneJeu); T.pas(5);
    const c = document.createElement('canvas'); c.width = 160; c.height = 160; const g = c.getContext('2d');
    for (const d of L.DON.ennemis.concat(L.DON.boss)) {
      try {
        const e = L.creerEnnemi(d.id, 80, 130, { sansApparition: true }); e.apparition = 0; e.cache = false; // embusqués : on juge le sprite, pas l'indice au sol
        const sp = L.spriteEnnemi(e);
        if (typeof (sp.base || 0) !== 'number') { out.ko.push(d.id + ' base ' + typeof sp.base); continue; }
        g.clearRect(0, 0, 160, 160); L.dessinerEnnemi(g, e, 80, 130);
        const px = g.getImageData(0, 0, 160, 160).data; let n = 0; for (let i = 3; i < px.length; i += 4) if (px[i] > 40) n++;
        if (n < Math.min(30, 0.6 * e.r * e.r)) out.ko.push(d.id + ' ' + n + ' px'); else out.ok++;
        e.mort = true;
      } catch (err) { out.ko.push(d.id + ' ' + String(err.stack || err).slice(0, 200)); }
    }
    G.ennemis = []; return out;
  });

  // 13) Mécaniques signatures : sable de Gaara, Susanoo d'Itachi, cristaux, zones télégraphiées
  if (veut('mecaniques')) await lancer('mecaniques', () => {
    const L = window.LDS, G = L.G, T = window.__T; const out = { ko: [] }; G.modeTest.dieu = false; // indépendant des sections précédentes
    const boss = id => { L.nouvellePartie({ perso: 'CHR_001', code: 'MECA2345' }); L.Scenes.aller(L.SceneJeu); T.pas(5);
      const s = G.etage.salles[G.etage.boss]; s.bossDef = id; s.visitee = true; s.ennemisDef = []; T.allerA(s.id); T.pas(120, ['Enter']); T.pas(10, []);
      const b = G.ennemis.find(x => x.id === id); b.tB = 99; b.etatB = 'choix'; return b; };
    // Gaara : sous 50 %, une bande de sable se forme ; y rester 1,2 s coûte une touche ; elle se retire à sa mort
    let b = boss('BOS_009'); const J = G.joueur;
    b.pv = b.pvMax * 0.52; L.infligerDegats(b, b.pvMax * 0.05, { proprio: 'joueur', type: 'explosion' });
    const m = G.salle._mursSable; if (!m || !m.tuiles.length) out.ko.push('Gaara : pas de bande de sable');
    else {
      const s = G.salle; const i = m.tuiles[0], tx = i % s.W, ty = (i / s.W) | 0;
      J.x = tx * 32 + 16; J.y = ty * 32 + 20; if (L.dansSableArene(J)) out.ko.push('sable actif pendant sa formation');
      T.pas(160, []); b.tB = 99;
      const avant = L.santeTotale(J.sante); let lent = null;
      for (let k = 0; k < 90; k++) { J.x = tx * 32 + 16; J.y = ty * 32 + 20; if (k === 5) lent = L.dansSableArene(J); b.tB = 99; T.pas(1, []); }
      if (!lent) out.ko.push('sable formé sans effet');
      if (!(L.santeTotale(J.sante) < avant)) out.ko.push('rester dans le sable ne coûte rien');
      b.pv = 1; L.infligerDegats(b, 5, { proprio: 'joueur', type: 'explosion' }); T.pas(150, []); // 1 s de retrait, ralenti de la mort du boss compris
      if (G.salle._mursSable) out.ko.push('sable encore là après la mort de Gaara');
      out.sable = m.tuiles.length + ' tuiles';
    }
    // Itachi : sous 40 %, rempart frontal qui arrête les tirs de face, pas de dos ni les explosions ; cycle 4 s / 2,5 s
    b = boss('BOS_016'); b.pv = b.pvMax * 0.42; L.infligerDegats(b, b.pvMax * 0.05, { proprio: 'joueur', type: 'explosion' }); T.pas(20, []);
    const S = b.susanoo; if (!S) out.ko.push('Itachi : pas de Susanoo');
    else {
      if (!S.actif) out.ko.push('Susanoo inactif au lancement');
      const face = L.infligerDegats(b, 1, { proprio: 'joueur', type: 'projectile', vx: -Math.cos(S.a), vy: -Math.sin(S.a) });
      const dos = L.infligerDegats(b, 1, { proprio: 'joueur', type: 'projectile', vx: Math.cos(S.a), vy: Math.sin(S.a) });
      const expl = L.infligerDegats(b, 1, { proprio: 'joueur', type: 'explosion' });
      if (face || !dos || !expl) out.ko.push('Susanoo face=' + face + ' dos=' + dos + ' explosion=' + expl);
      let actifs = 0; for (let k = 0; k < 390; k++) { b.tB = 99; T.pas(1, []); if (S.actif) actifs++; }
      if (actifs < 200 || actifs > 280) out.ko.push('cycle du Susanoo : ' + actifs + '/390 images actives');
      out.susanoo = actifs + '/390 images dressé';
    }
    // Cristaux (« Galeries de verre ») : un tir rebondit sur un cristal, au plus 3 fois
    L.nouvellePartie({ perso: 'CHR_001', code: 'CRYS2345' }); L.Scenes.aller(L.SceneJeu); T.pas(5);
    const sc = Object.values(G.etage.salles).find(x => x.type === 'combat' && x.forme === '1x1'); sc.visitee = true; sc.ennemisDef = []; T.allerA(sc.id);
    const s2 = G.salle; for (let tx = 5; tx <= 9; tx++) s2.tuiles[4 * s2.W + tx] = L.T.SOL; const ic = 4 * s2.W + 10; s2.tuiles[ic] = L.T.BLOC; s2.cristaux = [ic]; s2.fondSale = true; G.ennemis = [];
    G.joueur.x = 3 * 32 + 16; G.joueur.y = 6 * 32 + 16;
    const p = L.tirEnnemi(8 * 32 + 16, 4 * 32 + 16, 0, 4); p.dureeVie = 5; T.pas(40, []);
    if (p.mort && !(p.rebondsCristal >= 1)) out.ko.push('tir détruit par le cristal sans rebond');
    else if (!(p.vx < 0)) out.ko.push('tir non renvoyé par le cristal (vx=' + Math.round(p.vx) + ')');
    // Zones ennemies : pas de dégâts pendant leur naissance (télégraphe)
    const avantZ = L.santeTotale(G.joueur.sante); L.creerZone(G.joueur.x, G.joueur.y, 'acide', 3, { r: 20, proprio: 'ennemi', naissance: 0.6 });
    T.pas(20, []); if (L.santeTotale(G.joueur.sante) < avantZ) out.ko.push('zone ennemie blessante avant la fin de sa naissance');
    // Collé au mur du haut (en poussant vers lui), un tir de côté part bien : l'origine n'est plus dans le mur
    L.nouvellePartie({ perso: 'CHR_001', code: 'MURH2345' }); L.Scenes.aller(L.SceneJeu); T.pas(200);
    { const J = G.joueur; J.x = 330; J.y = 60; T.pas(40, ['KeyW']); const yM = J.y; const e = L.creerEnnemi('ENM_001', 200, yM, { sansApparition: true }); const pv0 = e.pv;
      for (let i = 0; i < 90; i++) { T.pas(1, ['KeyW', 'ArrowLeft']); e.x = 200; e.y = yM; }
      if (!(yM < 44)) out.ko.push('mise en place : joueur non collé au mur (' + Math.round(yM) + ')'); else if (!(e.pv < pv0)) out.ko.push('tir de côté contre le mur du haut détruit à la naissance'); }
    // Visée tenue à travers une porte : le tir reprend dans la salle suivante sans relâcher le stick
    L.nouvellePartie({ perso: 'CHR_001', code: 'VISE2345' }); L.Scenes.aller(L.SceneJeu); T.pas(200);
    { const sv = Object.values(G.etage.salles).find(x => x.type === 'combat'); sv.visitee = true; sv.ennemisDef = [];
      L.demarrerTransition('droite', sv.id); for (let i = 0; i < 40; i++) T.pas(1, ['ArrowLeft']);
      let tirs = 0; for (let i = 0; i < 40; i++) { T.pas(1, ['ArrowLeft']); tirs = Math.max(tirs, G.proj.filter(p => p.proprio === 'joueur').length); }
      if (!(L.Entrees.visee.dir === 'gauche' && tirs > 0)) out.ko.push('visée tenue à travers une porte : plus de tir (visée ' + L.Entrees.visee.dir + ')'); }
    // Boîtes des obstacles : on frôle une jarre, un tir passe à côté, le feu ne brûle qu'au contact de la flamme
    L.nouvellePartie({ perso: 'CHR_001', code: 'BOIT2345' }); L.Scenes.aller(L.SceneJeu); T.pas(200);
    { const s = G.salle, J = G.joueur; G.ennemis = [];
      for (let ty = 2; ty <= 6; ty++) for (let tx = 3; tx <= 12; tx++) s.tuiles[ty * s.W + tx] = L.T.SOL;
      const jx = 8, jy = 4, fx = 11, fy = 2; s.tuiles[jy * s.W + jx] = L.T.JARRE; s.tuiles[fy * s.W + fx] = L.T.FEU; s.fondSale = true;
      J.x = jx * 32 - 20; J.y = jy * 32 + 24; for (let i = 0; i < 40; i++) T.pas(1, ['KeyD']);
      if (!(J.x > jx * 32 - 3)) out.ko.push('jarre : arrêté à ' + Math.round(jx * 32 - J.x) + ' px de sa tuile (boîte trop large)');
      out.jarre = 'arrêt à ' + Math.round(J.x - jx * 32) + ' px du bord de tuile';
      J.x = 4 * 32 + 16; J.y = 6 * 32 + 16; T.pas(5, []);
      const frole = L.tirEnnemi(jx * 32 + 3, jy * 32 + 60, -Math.PI / 2, 4), plein = L.tirEnnemi(jx * 32 + 16, jy * 32 + 60, -Math.PI / 2, 4);
      frole.dureeVie = plein.dureeVie = 5; T.pas(40, []);
      if (frole.mort) out.ko.push('tir qui frôle une jarre arrêté par sa tuile'); if (!plein.mort) out.ko.push('tir en plein dans une jarre non arrêté');
      J.invuln = 0; const pv0 = L.santeTotale(J.sante);
      for (let i = 0; i < 10; i++) { J.x = fx * 32 - 6; J.y = fy * 32 + 16; T.pas(1, []); }
      if (L.santeTotale(J.sante) < pv0) out.ko.push('feu : brûlé à 12 px de la flamme');
      for (let i = 0; i < 10; i++) { J.x = fx * 32; J.y = fy * 32 + 16; T.pas(1, []); }
      if (!(L.santeTotale(J.sante) < pv0)) out.ko.push('feu : pas de brûlure au contact de la flamme'); }
    // Charge (Sasuke) : la tête suit la visée pendant la charge ; une charge tenue traverse la porte et part à la sortie
    L.nouvellePartie({ perso: 'CHR_002', code: 'CHRG2345' }); L.Scenes.aller(L.SceneJeu); T.pas(200);
    { const J = G.joueur; T.pas(25, ['ArrowRight']); const c0 = J.tir.charge;
      T.pas(5, ['ArrowUp']); if (J.dirTete !== 'haut' || !(J.tir.charge > c0)) out.ko.push('charge : tête ' + J.dirTete + ', charge ' + J.tir.charge.toFixed(2) + ' (la tête doit suivre la visée, la charge continuer)');
      const sv = Object.values(G.etage.salles).find(x => x.type === 'combat'); sv.visitee = true; sv.ennemisDef = [];
      L.demarrerTransition('droite', sv.id); for (let i = 0; i < 40 && G.transition; i++) T.pas(1, ['ArrowUp']); T.pas(2, ['ArrowUp']);
      if (!(G.salle === sv && J.tir.charge > c0)) out.ko.push('charge perdue en changeant de salle (' + J.tir.charge.toFixed(2) + ')');
      const n0 = G.proj.filter(p => p.proprio === 'joueur').length; T.pas(2, []);
      if (!(G.proj.filter(p => p.proprio === 'joueur').length > n0)) out.ko.push('charge gardée mais pas déclenchée au relâchement'); }
    // Fiches d'objets (façon « External Item Descriptions ») : objet proche, synergie, ensemble, remplacement, prix
    L.nouvellePartie({ perso: 'CHR_001', code: 'FICH2345' }); L.Scenes.aller(L.SceneJeu); T.pas(200);
    { const J = G.joueur, S = G.salle; S.piedestaux = []; S.ramassables = [];
      const p = L.poserPiedestal(S, J.x, J.y - 50, 'PSV_001'); p.apparu = 0; J.passifs.push('PSV_002'); J.acquis.push('PSV_002'); T.pas(2, []);
      const c = L.cibleFiche(), F = c && L.ficheObjet(c), txt = F ? F.lignes.map(l => l.t).join(' | ') : '';
      if (!F || F.nom !== L.INDEX.PSV_001.nom) out.ko.push('fiche : objet proche non décrit');
      else { if (!/Synergie : Rasengan jumeau/.test(txt)) out.ko.push('fiche : synergie avec un objet porté absente'); if (!/0\/3 → 1\/3/.test(txt)) out.ko.push('fiche : progression d’ensemble absente (' + txt.slice(0, 120) + ')'); }
      p.id = 'ACT_004'; J.actif = { id: 'ACT_003', charges: 1 }; p.prix = { type: 'ryo', n: 15 }; T.pas(1, []);
      const t2 = L.ficheObjet(L.cibleFiche()).lignes.map(l => l.t).join(' | ');
      if (!/Remplace Chidori/.test(t2) || !/Prix : 15 Ryō/.test(t2)) out.ko.push('fiche : remplacement ou prix absents (' + t2.slice(0, 160) + ')');
      J.x += 200; T.pas(1, []); if (L.cibleFiche()) out.ko.push('fiche affichée loin de tout objet');
      const r = L.creerRamassable('pilule', J.x + 20, J.y, { immobile: true }); r.age = 1; T.pas(1, []);
      const F3 = L.ficheObjet(L.cibleFiche()); if (!F3 || !/Pilule inconnue/.test(F3.nom) || F3.lignes.some(l => l.t === L.INDEX[r.id].desc)) out.ko.push('fiche : une pilule inconnue révèle son effet');
      G.reglages.descriptionsAuto = true; L.Scenes.rendre(L.Rendu.gi); }
    // projectiles qui reviennent (grand shuriken de Mizuki, faux de Hidan) : retour vers le lanceur, esquivables d'un pas de côté
    for (const [boss, att] of [['BOS_001', 'fuma'], ['BOS_013', 'faux']]) {
      L.nouvellePartie({ perso: 'CHR_001', code: 'FUMA2345' }); L.Scenes.aller(L.SceneJeu); T.pas(5); const dieu = G.modeTest.dieu; G.modeTest.dieu = true; G.modeTest.coups = 0;
      const s = G.etage.salles[G.etage.boss]; s.bossDef = boss; s.visitee = true; s.ennemisDef = []; T.allerA(s.id); T.pas(150, ['Enter']);
      const e = G.ennemis.find(x => x.boss), J = G.joueur; e.etatB = 'recup'; e.tB = 99; e.def = Object.assign({}, e.def, { vitesse: 0 }); const [cx, cy] = [e.x, e.y];
      J.x = cx; J.y = Math.min(cy + 120, (s.H - 2) * 32); T.pas(2, []); L.executerAttaqueBoss(e, e.def.attaques.find(x => x.id === att), 'debut', 0);
      const p = G.proj.find(q => q.proprio === 'ennemi' && q.traj && q.traj.retour); if (!p) { out.ko.push(boss + ' : pas de projectile qui revient'); continue; }
      for (let k = 0; k < 300 && !p.mort; k++) { T.pas(1, k < 30 ? ['KeyD'] : []); e.etatB = 'recup'; e.tB = 99; e.x = cx; e.y = cy; }
      if (G.modeTest.coups) out.ko.push(boss + ' : projectile qui revient non esquivable (' + G.modeTest.coups + ' coup)');
      if (!p.mort) out.ko.push(boss + ' : le projectile ne revient jamais');
      G.modeTest.dieu = dieu;
    }
    return out;
  });

  // 14) Pactes et sanctuaires : scénarios chiffrés du dossier (E §6), événements comptés, refus, tirage figé
  if (veut('pactes')) await lancer('pactes', () => {
    const L = window.LDS, G = L.G, T = window.__T; const out = { ko: [], scenarios: [] };
    L.nouvellePartie({ perso: 'CHR_001', code: 'PACT2345' }); L.Scenes.aller(L.SceneJeu); T.pas(5); L.entrerEtage(3); T.pas(5);
    const P = G.partie, J = G.joueur;
    const propre = () => { const E = G.etage; E.degatsVitalite = false; E.degatsBoss = false; E.faveurSanctuaire = 0; P.pactesAchetes = 0; P.pactesRefuses = 0; J.talisman = null; J.talisman2 = null; J.passifs = J.passifs.filter(x => x !== 'PSV_091'); J.drapeaux.serment = false; };
    const cas = (nom, prep, attendu) => {
      propre(); prep(G.etage); const r = L.chanceOpportunite(); const v = [r.chance, r.pacte, r.sanctuaire].map(x => Math.round(x * 1000) / 1000);
      out.scenarios.push(nom + ' ' + v.join('/'));
      if (attendu.some((a, i) => Math.abs(a - v[i]) > 0.0015)) out.ko.push(nom + ' : attendu ' + attendu.join('/') + ', obtenu ' + v.join('/'));
    };
    cas('A', E => { E.degatsVitalite = true; E.degatsBoss = true; }, [0.2, 0.12, 0.08]);
    cas('B', E => { E.degatsBoss = true; }, [0.35, 0.21, 0.14]);
    cas('C', () => {}, [0.45, 0.27, 0.18]);
    cas('D', () => { P.pactesRefuses = 1; }, [0.45, 0.216, 0.234]);
    cas('E', () => { P.pactesAchetes = 1; }, [0.45, 0.45, 0]);
    cas('F', E => { J.passifs.push('PSV_091'); E.faveurSanctuaire = 0.3; }, [0.95, 0.57, 0.38]);
    cas('G', E => { E.degatsVitalite = true; J.talisman = 'TAL_004'; P.pactesRefuses = 2; }, [0.3, 0.109, 0.191]);
    cas('H', () => { J.drapeaux.serment = true; }, [1, 1, 0]);
    // événements : ce qui compte comme dégât à la vitalité
    propre(); const E = G.etage;
    J.sante.prot = ['b', 'b']; J.invuln = 0; L.blesserJoueur(1, { type: 'test' }); if (E.degatsVitalite) out.ko.push('protection entamée comptée comme vitalité');
    J.invuln = 0; L.payerSante(1, 'pacte'); if (E.degatsVitalite) out.ko.push('prix payé compté comme dégât');
    J.invuln = 0; L.sacrifier(1); if (E.degatsVitalite) out.ko.push('sacrifice compté comme dégât');
    L.soignerJoueur(J, 4); J.sante.prot = []; J.invuln = 0; L.explosion(J.x, J.y, 32, 0, { proprio: 'joueur', blesseJoueur: true, degatsJoueur: 1 }); if (!E.degatsVitalite) out.ko.push('explosion du joueur non comptée');
    L.soignerJoueur(J, 4); if (!E.degatsVitalite) out.ko.push('un soin efface le dégât à la vitalité');
    // refus : salle de pacte visitée, quittée sans achat
    const quitter = (visitee, achat) => { const F = G.etage; F.opportunite = 'pacte'; F.salles.opp = { visitee, portes: [] }; F.pacteAchete = achat; const avant = P.pactesRefuses; L.entrerEtage(G.etage.numero + 1); return P.pactesRefuses - avant; };
    propre(); if (quitter(true, false) !== 1) out.ko.push('refus non compté'); else if (!L.Progression.profil.decouverts.includes('SEC_012')) out.ko.push('refus non inscrit comme secret (SEC_012)');
    if (quitter(true, true) !== 0) out.ko.push('achat compté comme refus');
    if (quitter(false, false) !== 0) out.ko.push('pacte non visité compté comme refus');
    // tirage figé par étage : recharger ne permet pas de retenter
    propre(); const t1 = L.tirerOpportunite(), t2 = L.tirerOpportunite(); if (t1 !== t2) out.ko.push('tirage d’opportunité non déterministe');
    return out;
  });

  // 14b) Variantes des salles d'opportunité : quatre pactes, quatre sanctuaires, chacun acheté ou utilisé pour de vrai
  if (veut('opportunites')) await lancer('opportunites', () => {
    const L = window.LDS, G = L.G, T = window.__T; const out = { ko: [], ok: 0, vues: [] }; const verif = (c, m) => { if (c) out.ok++; else out.ko.push(m); };
    const salle = (type, v, prep) => { L.nouvellePartie({ perso: 'CHR_001', code: 'OPPO2345' }); L.Scenes.aller(L.SceneJeu); T.pas(5); L.entrerEtage(3); T.pas(5); const J = G.joueur; G.modeTest.dieu = false; if (prep) prep(J);
      L.ouvrirOpportunite(type, v); L.entrerSalle('opp'); T.pas(3); const s = G.salle; out.vues.push(type + '/' + v + ' : ' + s.piedestaux.filter(p => p.id).length + ' offre(s)'); verif(G.banniere && G.banniere.nom === L.VARIANTES_OPP[type].find(x => x.id === v).nom, type + '/' + v + ' : bandeau absent'); return [s, J]; };
    const finir = () => { for (let i = 0; i < 80 && G.enAnimationObjet; i++) T.pas(1, ['Enter']); T.pas(2); };
    // tirage : les quatre variantes de chaque type sortent sur 200 étages simulés, avec des parts proches des poids
    L.nouvellePartie({ perso: 'CHR_001', code: 'TIRA2345' }); L.Scenes.aller(L.SceneJeu); T.pas(3);
    for (const type of ['pacte', 'sanctuaire']) { const n = {}; for (let k = 0; k < 400; k++) { G.partie.code = 'T' + k + 'Z'; const v = L.tirerVariante(type); n[v] = (n[v] || 0) + 1; }
      for (const v of L.VARIANTES_OPP[type]) { const att = 400 * v.p / 100; verif(Math.abs((n[v.id] || 0) - att) < att * 0.4 + 6, type + '/' + v.id + ' : ' + (n[v.id] || 0) + ' sur 400 (attendu ~' + att + ')'); }
      out.vues.push(type + ' ' + JSON.stringify(n)); }
    // pacte de sang : trois marques distinctes à un contenant, cumulables
    let [s, J] = salle('pacte', 'sang'); const M = s.piedestaux.filter(p => p.id);
    verif(M.length === 3 && M.every(p => L.INDEX[p.id].marque && p.prix.type === 'pacte' && p.prix.n === 1), 'sang : offres ' + M.map(p => p.id + '/' + (p.prix && p.prix.n)).join(','));
    verif(new Set(M.map(p => p.id)).size === 3, 'sang : marques en double');
    const ids = M.map(p => p.id), c0 = J.sante.cont.length, d0 = J.stats.degats + J.stats.cadence + J.stats.portee + J.stats.vitesse + J.stats.chance;
    L.acheter(M[0]); finir(); L.acheter(M[1]); finir();
    verif(J.sante.cont.length === c0 - 2 && J.passifs.includes(ids[0]) && J.passifs.includes(ids[1]), 'sang : deux marques, deux contenants (' + c0 + ' → ' + J.sante.cont.length + ')');
    verif(J.stats.degats + J.stats.cadence + J.stats.portee + J.stats.vitesse + J.stats.chance > d0, 'sang : aucune statistique gagnée'); verif(G.partie.pactesAchetes === 2, 'sang : pactes non comptés');
    // troc : le serpent prend un objet annoncé d'avance, sans toucher à la santé
    [s, J] = salle('pacte', 'troc', J => { L.acquerirPassif(J, 'PSV_034', 'test'); }); const Tr = s.piedestaux.filter(p => p.id); const cible = L.objetTroc(Tr[0]);
    verif(Tr.length >= 2 && Tr.every(p => p.prix.type === 'troc'), 'troc : prix');
    verif(cible === 'PSV_034', 'troc : objet annoncé ' + cible);
    const cont0 = J.sante.cont.length, pris = Tr[0].id; L.acheter(Tr[0]); finir();
    const propre = (L.INDEX[pris].effets || []).reduce((s, e) => s - ((e.sante && e.sante.retraitCont) || 0), 0); // l'objet obtenu peut retirer lui-même un contenant (contrepartie)
    verif(!J.passifs.includes('PSV_034') && (J.passifs.includes(pris) || (J.actif && J.actif.id === pris)) && J.sante.cont.length >= cont0 + propre, 'troc : échange raté ' + J.passifs.join(',') + ' / ' + cont0 + ' → ' + J.sante.cont.length);
    verif(L.objetTroc(Tr[1]) === pris || L.objetTroc(Tr[1]) === null || J.passifs.includes(L.objetTroc(Tr[1])), 'troc : nouvel objet annoncé invalide');
    // sans objet à céder : achat refusé
    [s, J] = salle('pacte', 'troc'); const T0 = s.piedestaux.find(p => p.id); verif(!L.peutPayer(T0).ok, 'troc : achat possible sans rien à céder');
    // pari : trois offres voilées de qualité 2 ou plus, un contenant chacune ; la fiche ne trahit pas l'objet
    [s, J] = salle('pacte', 'pari'); const V = s.piedestaux.filter(p => p.id);
    verif(V.length === 3 && V.every(p => p.voile && p.prix.n === 1 && (L.INDEX[p.id].qualite || 0) >= 2), 'pari : offres ' + V.map(p => p.id + '/q' + L.INDEX[p.id].qualite).join(','));
    J.x = V[0].x; J.y = V[0].y + 30; const F = L.ficheObjet(L.cibleFiche()); verif(F && F.nom === 'Offre voilée' && !F.lignes.some(l => l.t.includes(L.INDEX[V[0].id].nom)), 'pari : la fiche dévoile l’objet');
    L.relancerPiedestaux(s); verif(V.every(p => p.voile && p.prix.n === 1), 'pari : relance perd le voile ou le prix');
    // bénédictions : trois au choix, une seule accordée
    [s, J] = salle('sanctuaire', 'benedictions'); const B = s.piedestaux.filter(p => p.id); verif(B.length === 3 && B.every(p => L.INDEX[p.id].benediction && p.groupe), 'bénédictions : offres');
    J.x = B[1].x; J.y = B[1].y + 6; T.pas(40, []); finir(); verif(B.filter(p => p.id).length === 0 && J.passifs.filter(id => L.INDEX[id].benediction).length === 1, 'bénédictions : choix non exclusif');
    L.relancerPiedestaux(s); // rien à relancer : pas d'erreur
    // source sacrée : soin complet, cicatrices effacées, un contenant, une seule fois
    [s, J] = salle('sanctuaire', 'source', J => { J.sante.cont.forEach(c => c.p = 0); J.sante.cont[0].p = 1; J.sante.cicatrices = 2; });
    const nc = J.sante.cont.length; J.x = s.source.x; J.y = s.source.y; T.pas(1, ['Enter']); T.pas(2);
    verif(s.source.utilisee && J.sante.cicatrices === 0 && J.sante.cont.length === nc + 1 && L.rougeTotal(J.sante) === J.sante.cont.length * 2, 'source : ' + JSON.stringify(J.sante));
    verif(s.piedestaux.filter(p => p.id).length === 1, 'source : présent absent');
    // tronc des offrandes : 15 Ryō rendent les deux présents libres
    [s, J] = salle('sanctuaire', 'offrande', J => { J.ryo = 20; }); const m = s.machines.find(x => x.type === 'tronc'); const O = s.piedestaux.filter(p => p.id);
    verif(m && O.length === 2 && O.every(p => p.groupe === m.groupe), 'offrande : mise en place');
    L.utiliserMachine(m); verif(J.ryo === 5 && O.every(p => !p.groupe), 'offrande : paiement ou déliaison');
    const na = J.acquis.length; for (const p of O) { J.delaiActif = 0; J.x = p.x; J.y = p.y + 6; T.pas(5, []); finir(); J.y += 40; T.pas(2, []); } verif(J.acquis.length === na + 2, 'offrande : les deux présents ne se prennent pas (' + (J.acquis.length - na) + ')');
    // bénédiction du phénix : une fois par étage, jamais pour un prix
    [s, J] = salle('sanctuaire', 'classique', J => { L.acquerirPassif(J, 'PSV_191', 'test'); });
    J.sante.cont.forEach(c => c.p = 0); J.sante.cont[0].p = 1; J.sante.prot = []; J.invuln = 0; L.blesserJoueur(2, { type: 'test' }); verif(J.etat !== 'mort' && L.santeTotale(J.sante) === 1 && G.etage.phenix, 'phénix : pas de sauvetage (' + J.etat + ', ' + L.santeTotale(J.sante) + ')');
    return out;
  });

  // 14c) Éveils : deux par personnage (étages 3 et 6), effets réellement appliqués, règles qui évoluent
  if (veut('eveils')) await lancer('eveils', () => {
    const L = window.LDS, G = L.G, T = window.__T; const out = { ko: [], ok: 0, vus: 0 }; const verif = (c, m) => { if (c) out.ok++; else out.ko.push(m); };
    const partie = id => { L.nouvellePartie({ perso: id, code: 'EVEI2345' }); L.Scenes.aller(L.SceneJeu); T.pas(5); G.modeTest.dieu = false; return G.joueur; };
    const STATS = ['degats', 'cadence', 'portee', 'vitesseTir', 'vitesse', 'chance'];
    for (const p of L.DON.personnages) {
      let J = partie(p.id); const V = L.eveilsDe(J); verif(V.length === 2 && V[0].rang === 1 && V[1].rang === 2, p.id + ' : éveils ' + V.map(v => v.id));
      L.verifierEveils(J, 2); verif(!J.transformations.some(t => L.INDEX[t].type === 'eveil'), p.id + ' : éveil avant l’étage 3');
      for (const [n, v] of [[3, V[0]], [6, V[1]]]) {
        const st = Object.assign({}, J.stats), fam = J.familiers.length, cont = J.sante.cont.length, prot = J.sante.prot.length, res = J.coeursReserve || 0, prof = JSON.stringify(J.profil, (k, x) => x instanceof Set ? [...x] : x);
        L.verifierEveils(J, n); verif(J.transformations.includes(v.id), p.id + ' : ' + v.id + ' non accordé à l’étage ' + n); out.vus++;
        verif([G.banniere].concat(G.banniereFile || []).some(b => b && b.nom === 'Éveil — ' + v.nom), v.id + ' : pas de bandeau'); // affiché ou en file
        for (const e of v.effets) {
          if (e.drapeau) verif(J.drapeaux[e.drapeau] !== undefined && J.drapeaux[e.drapeau] !== false, v.id + ' : drapeau ' + e.drapeau + ' absent');
          if (e.s && STATS.includes(e.s)) verif(J.stats[e.s] !== st[e.s] || J.stats[e.s] >= 999, v.id + ' : ' + e.s + ' inchangé');
          if (e.familier) verif(J.familiers.length > fam, v.id + ' : familier absent');
          if (e.sante && e.sante.cont) verif(J.sante.cont.length > cont || J.drapeaux.sansVitalite && J.sante.prot.length > prot, v.id + ' : contenant absent');
          if (e.coeurReserve) verif((J.coeursReserve || 0) === res + e.coeurReserve, v.id + ' : cœur de réserve absent');
          if (e.statut || e.impact || e.multi || e.forme) verif(JSON.stringify(J.profil, (k, x) => x instanceof Set ? [...x] : x) !== prof, v.id + ' : profil d’attaque inchangé');
        }
      }
      L.verifierEveils(J, 8); verif(J.transformations.filter(t => L.INDEX[t].type === 'eveil').length === 2, p.id + ' : éveils en double');
    }
    // règles qui évoluent, vérifiées en jeu
    let J = partie('CHR_001'); L.verifierEveils(J, 3); const d0 = J.stats.degats; J.sante = L.santeInit({ vitalite: 3, pleins: 3 }); J.invuln = 0; L.blesserJoueur(1, { type: 'test' });
    verif(J.drapeaux.obstination && Math.abs(J.stats.degats - d0 - 1.5) < 0.01, 'Volonté du feu : obstination à ' + J.stats.degats + ' (base ' + d0 + ')');
    J = partie('CHR_002'); L.verifierEveils(J, 3); verif(J.profil.params.charge_libre.charge === 0.6, 'Sharingan : charge ' + J.profil.params.charge_libre.charge);
    J = partie('CHR_003'); L.verifierEveils(J, 6); L.evenement('soin_excedentaire', { demis: 30 }); verif(J.force === 10, 'Force centuplée : force ' + J.force);
    J.force = 4; J.sante.cont.forEach(c => c.p = 0); J.sante.cont[0].p = 2; J.sante.prot = []; J.invuln = 0; L.blesserJoueur(1, { type: 'test' }); verif(L.santeTotale(J.sante) === 5 && J.force === 0, 'Byakugō : santé ' + L.santeTotale(J.sante) + ', force ' + J.force);
    J = partie('CHR_004'); L.verifierEveils(J, 3); J.actif = { id: 'ACT_022', charges: 1 }; J.actif2 = { id: 'ACT_034', charges: 0 }; L.utiliserActif(); verif(J.actif2.charges === 1, 'Copie parfaite : ' + J.actif2.charges);
    J = partie('CHR_006'); L.verifierEveils(J, 6); let s = T.scenario('CHR_006', 'ROM_001', [{ id: 'ENM_080', tx: 10, ty: 1 }]); J = G.joueur; L.verifierEveils(J, 6); T.pas(80, []); G.ennemis.forEach(e => { e.pv = e.pvMax = 99999; }); let vu = false; for (let k = 0; k < 660; k++) { J.invuln = 1; T.pas(1, []); if (J.kaiten) vu = true; } verif(vu, 'Soixante-quatre paumes : aucune rotation en 11 s');
    J = partie('CHR_007'); L.verifierEveils(J, 3); const h = Object.values(G.etage.salles).find(x => x.type === 'heritage'); if (h) { L.entrerSalle(h.id); T.pas(3); verif(G.salle.piedestaux.filter(q => q.id).length === 3, 'Plan à long terme : ' + G.salle.piedestaux.length + ' objets'); }
    s = T.scenario('CHR_008', 'ROM_001', [{ id: 'ENM_080', tx: 10, ty: 1 }]); J = G.joueur; L.verifierEveils(J, 3); T.pas(80, []); G.ennemis.forEach(e => { e.pv = e.pvMax = 99999; }); J.invuln = 0; const abs = J.bouclierSable && L.blesserJoueur(2, { type: 'test' }) === false; for (let k = 0; k < 630; k++) { J.invuln = 1; T.pas(1, []); } verif(abs && J.bouclierSable, 'Armure de sable : bouclier ' + abs + '/' + J.bouclierSable);
    J = partie('ALT_002'); L.verifierEveils(J, 6); const c = Object.values(G.etage.salles).find(x => x.type === 'combat' && !x.visitee && x.forme === '1x1'); if (c) { L.entrerSalle(c.id); T.pas(2); verif(!!J.susanoo || !G.salle.combat, 'Susanoo : pas de rempart à l’entrée'); }
    return out;
  });

  // 15) Contrats (défis) : règles imposées et conditions de réussite réellement vérifiées
  if (veut('defis')) await lancer('defis', () => {
    const L = window.LDS, G = L.G, T = window.__T; const out = { ko: [], ok: 0 }; const verif = (c, m) => { if (c) out.ok++; else out.ko.push(m); };
    const partie = (defi, perso) => { L.nouvellePartie({ perso: perso || 'CHR_003', code: 'DEFY2345', defi }); L.Scenes.aller(L.SceneJeu); T.pas(3); return G.partie; };
    let P = partie('DEF_001'); verif(G.joueur.def.id === 'CHR_005', 'DEF_001 : Rock Lee non imposé'); verif(!Object.values(G.etage.salles).some(s => s.type === 'heritage'), 'DEF_001 : salle d’héritage présente');
    P = partie('DEF_002'); verif((G.variante.obscurite || 0) >= 0.55, 'DEF_002 : pas de pénombre');
    P = partie('DEF_006'); verif(G.joueur.def.id === 'CHR_001' && G.joueur.stats.degats < 3.5 * 0.75, 'DEF_006 : dégâts ' + G.joueur.stats.degats);
    P = partie('DEF_010'); P.temps = 21 * 60; L.Progression.finPartie('victoire', 'RTE_01'); verif(P.defiEchoue && !L.Progression.profil.defis.DEF_010, 'DEF_010 : réussi hors délai');
    P = partie('DEF_010'); P.temps = 12 * 60; L.Progression.finPartie('victoire', 'RTE_01'); verif(!P.defiEchoue && L.Progression.profil.defis.DEF_010, 'DEF_010 : non réussi dans les temps');
    P = partie('DEF_011'); L.entrerEtage(6); verif(!P.defiValide, 'DEF_011 : validé sans 10 objets');
    P = partie('DEF_011'); for (const id of L.DON.objets.filter(o => o.type === 'passif').slice(0, 10).map(o => o.id)) G.joueur.passifs.push(id); L.entrerEtage(6); verif(P.defiValide && L.Progression.profil.defis.DEF_011, 'DEF_011 : non validé à l’étage 6 avec 10 objets');
    P = partie('DEF_012'); verif(P.difficile, 'DEF_012 : Difficile non imposé'); L.entrerEtage(2); verif(G.etage.cfg.speciales.defi === 1, 'DEF_012 : pas de salle d’épreuve à l’étage 2');
    // contrats 13 à 30 : personnage et départ imposés, fin imposée, aucun pacte, ressources nulles
    P = partie('DEF_013'); verif(G.joueur.def.id === 'CHR_003' && G.joueur.passifs.includes('PSV_040') && G.joueur.passifs.includes('PSV_063'), 'DEF_013 : départ non imposé');
    P = partie('DEF_021'); verif(L.synergiesActives(G.joueur).some(s => s.id === 'SYN_061'), 'DEF_021 : Yōton absent au départ');
    P = partie('DEF_025'); verif(G.joueur.ryo === 0 && G.joueur.cles === 0 && G.joueur.explosifs === 0, 'DEF_025 : ressources de départ non nulles');
    P = partie('DEF_023'); P.pactesAchetes = 1; L.Progression.finPartie('victoire', 'RTE_01'); verif(P.defiEchoue && !L.Progression.profil.defis.DEF_023, 'DEF_023 : réussi malgré un pacte');
    P = partie('DEF_023'); L.Progression.finPartie('victoire', 'RTE_01'); verif(!P.defiEchoue && L.Progression.profil.defis.DEF_023, 'DEF_023 : non réussi sans pacte');
    P = partie('DEF_024'); P.temps = 30 * 60; L.Progression.finPartie('victoire', 'RTE_01'); verif(P.defiEchoue && !L.Progression.profil.defis.DEF_024, 'DEF_024 : réussi sur la mauvaise fin');
    P = partie('DEF_024'); P.temps = 41 * 60; L.Progression.finPartie('victoire', 'RTE_02'); verif(P.defiEchoue && !L.Progression.profil.defis.DEF_024, 'DEF_024 : réussi hors délai');
    P = partie('DEF_024'); P.temps = 30 * 60; L.Progression.finPartie('victoire', 'RTE_02'); verif(!P.defiEchoue && L.Progression.profil.defis.DEF_024, 'DEF_024 : non réussi');
    verif(L.Progression.profil.objectifs.OBJ_071, 'OBJ_071 : contrat « Pureté » non inscrit');
    // registre des synergies : une fusion réunie accomplit « Kekkei genkai » ; le compteur cumule les découvertes
    P = partie(null, 'CHR_001'); const avant = L.Progression.profil.compteurs.synergies || 0; for (const id of ['PSV_043', 'PSV_047']) L.acquerirPassif(G.joueur, id, 'test'); L.recalculer(G.joueur);
    verif(L.Progression.profil.objectifs.OBJ_079, 'OBJ_079 : fusion réunie sans objectif accompli');
    verif((L.Progression.profil.compteurs.synergies || 0) > avant || L.Progression.profil.decouverts.includes('SYN_061'), 'compteur de synergies inchangé');
    return out;
  });

  console.log(erreursPage.length ? 'ERREURS PAGE (' + erreursPage.length + '):\n' + erreursPage.slice(0, 8).join('\n') : 'aucune erreur de page');
  await b.close();
  process.exit(echecs || erreursPage.length ? 1 : 0);
})();
