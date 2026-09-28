// Tests automatisés du jeu dans Chromium (Playwright).
// Usage : node labyrinthe/outils/tests_jeu.mjs [section…]
// Sections : generation, parcours, objets, actifs, boss, ennemis, personnages, sauvegarde, manette, economie
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
    return out;
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
    const L = window.LDS, G = L.G, T = window.__T; const out = { ko: [] };
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
      b.pv = 1; L.infligerDegats(b, 5, { proprio: 'joueur', type: 'explosion' }); T.pas(90, []);
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
    return out;
  });

  console.log(erreursPage.length ? 'ERREURS PAGE (' + erreursPage.length + '):\n' + erreursPage.slice(0, 8).join('\n') : 'aucune erreur de page');
  await b.close();
  process.exit(echecs || erreursPage.length ? 1 : 0);
})();
