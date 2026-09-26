// Tests automatisés du jeu dans Chromium (Playwright).
// Usage : node labyrinthe/outils/tests_jeu.mjs [section…]
// Sections : generation, parcours, objets, actifs, boss, ennemis, personnages, sauvegarde, manette, economie
// Ne remplace pas une recette manuelle à la manette : il vérifie l'absence d'erreurs
// et des invariants (portes reliées, boss atteignable, récompenses uniques…).
import { createRequire } from 'node:module';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }
const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = 'file://' + resolve(racine, 'jeu', 'index.html');
const demandees = process.argv.slice(2); const veut = s => !demandees.length || demandees.includes(s);

const AIDE = `
window.__T = {
  L: () => window.LDS,
  pas(n, touches, boutons) { const L = window.LDS; const E = L.Entrees; for (let i = 0; i < n; i++) {
      E.touches = new Set(touches || []); E.ordreFleches = [...E.touches].filter(c => c.startsWith('Arrow'));
      if (boutons) { window.__pad = boutons; }
      E.maj(1/60); L.Scenes.maj(1/60); E.finPas(); if (L.G.derniereErreur) { const e = L.G.derniereErreur; L.G.derniereErreur = null; return e; } } return null; },
  bot(sec, o = {}) { const L = window.LDS, G = L.G; let a = Math.random() * 6;
    for (let i = 0; i < sec * 60; i++) { const J = G.joueur; if (!J || !G.salle || !G.partie) return 'pas de partie';
      if (o.dieu) { J.invuln = 1; if (J.etat === 'mort') return 'mort malgré dieu'; }
      if (G.enAnimationObjet) { const e = this.pas(1, ['Enter']); if (e) return e; continue; }
      const cibles = G.ennemis.filter(x => !x.mort && !x.cache && !x.intangible && !x.statuts.charme && !x.allie);
      const e = cibles.sort((p, q) => Math.hypot(p.x - J.x, p.y - J.y) - Math.hypot(q.x - J.x, q.y - J.y))[0];
      const t = []; a += 0.03;
      let mx = Math.cos(a), my = Math.sin(a * 1.3);
      if (e) { const d = Math.hypot(e.x - J.x, e.y - J.y); if (d > 150) { mx += (e.x - J.x) / d; my += (e.y - J.y) / d; } else if (d < 60) { mx -= (e.x - J.x) / d; my -= (e.y - J.y) / d; } }
      else if (o.cible) { const d = Math.hypot(o.cible.x - J.x, o.cible.y - J.y) || 1; mx = (o.cible.x - J.x) / d; my = (o.cible.y - J.y) / d; }
      if (mx > 0.3) t.push('KeyD'); if (mx < -0.3) t.push('KeyA'); if (my > 0.3) t.push('KeyS'); if (my < -0.3) t.push('KeyW');
      if (e) { const dx = e.x - J.x, dy = (e.y - 8) - (J.y - 12); t.push(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft') : (dy > 0 ? 'ArrowDown' : 'ArrowUp'));
        if (o.relacher && i % 50 > 44) t.pop(); }
      if (o.actif && i % 120 === 0) t.push('Space');
      if (o.bombes && i % 240 === 100) t.push('KeyE');
      const err = this.pas(1, t); if (err) return err;
      if (L.Scenes.courante() !== L.SceneJeu) { if (o.fermerMenus) L.Scenes.aller(L.SceneJeu); else return 'scene ' + (L.Scenes.courante() === window.LDS.SceneTitre ? 'titre' : 'autre'); }
      if (o.jusquaNettoyage && !G.salle.combat && !G.ennemis.length) return null;
    }
    return null; },
  prendreTout() { const L = window.LDS, G = L.G, J = G.joueur; let n = 0;
    for (const p of G.salle.piedestaux) { if (!p.id || p.prix) continue; J.x = p.x; J.y = p.y + 6; const e = this.pas(40, []); if (e) return e; n++; }
    for (const r of G.salle.ramassables.slice()) { J.x = r.x; J.y = r.y; const e = this.pas(3, []); if (e) return e; }
    return n; },
  allerA(id, dir) { const L = window.LDS; L.demarrerTransition(dir || 'droite', id); return this.pas(30, []); },
};`;

(async () => {
  const exe = process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  let b; try { b = await pw.chromium.launch({ executablePath: exe }); } catch (e) { b = await pw.chromium.launch(); }
  const page = await b.newPage({ viewport: { width: 1280, height: 720 } });
  const erreursPage = []; page.on('pageerror', e => erreursPage.push(String(e.stack || e).slice(0, 500)));
  await page.goto(PAGE); await page.waitForTimeout(300);
  await page.addScriptTag({ content: AIDE });
  await page.evaluate(() => { const L = window.LDS; L.Progression.profil.toutDebloque = true; L.G.modeTest = {}; });
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
  if (veut('parcours')) for (const [perso, code] of [['CHR_001', 'PARC2345'], ['CHR_005', 'LEEA2345'], ['CHR_002', 'SASK2345']]) await lancer('parcours ' + perso, ([perso, code]) => {
    const L = window.LDS, G = L.G, T = window.__T; const out = { ko: [], etages: [], boss: [], objets: 0, salles: 0 };
    L.Progression.profil.routes = { RTE_01: true, RTE_02: true };
    L.nouvellePartie({ perso, code }); L.Scenes.aller(L.SceneJeu); T.pas(10);
    for (let et = 1; et <= 9; et++) {
      if (!G.partie || G.partie.etage !== et) { out.ko.push('étage attendu ' + et + ' obtenu ' + (G.partie && G.partie.etage)); break; }
      const E = G.etage; out.etages.push(E.cfg.nom);
      const ids = Object.values(E.salles).filter(s => s.type !== 'boss' && s.id !== 'opp').map(s => s.id);
      for (const id of ids) {
        const s = E.salles[id]; if (s.type === 'cache' || s.type === 'isolee') { for (const x of Object.values(E.salles)) for (const p of x.portes) if (p.vers === id && p.etat === 'secrete') { p.etat = 'ouverte'; } }
        let e = T.allerA(id); if (e) { out.ko.push('entrée ' + id + ' : ' + e); continue; }
        e = T.bot(25, { dieu: true, jusquaNettoyage: true, actif: true, bombes: true }); if (e) { out.ko.push('combat ' + id + ' (' + s.type + ') : ' + e); }
        if (G.salle.combat) out.ko.push('salle ' + id + ' ' + s.type + ' ' + s.gabarit + ' non nettoyée : ' + G.ennemis.map(x => x.id + ':' + Math.round(x.pv)).join(','));
        const n = T.prendreTout(); if (typeof n === 'string') out.ko.push('ramassage ' + id + ' : ' + n); else out.objets += n;
        out.salles++;
        if (G.joueur.etat === 'mort') { out.ko.push('mort'); return out; }
      }
      // boss
      let e = T.allerA(E.boss); if (e) out.ko.push('entrée boss : ' + e);
      T.pas(120, ['Enter']);
      const nomBoss = G.ennemis.filter(x => x.boss).map(x => x.id).join('+'); out.boss.push(nomBoss);
      e = T.bot(90, { dieu: true, jusquaNettoyage: true, actif: true, relacher: true }); if (e) out.ko.push('boss ' + nomBoss + ' : ' + e);
      if (G.ennemis.some(x => x.boss && !x.mort)) { out.ko.push('boss ' + nomBoss + ' invaincu après 90 s : ' + G.ennemis.filter(x => x.boss).map(x => Math.round(x.pv) + '/' + Math.round(x.pvMax)).join(',')); for (const x of G.ennemis) x.pv = 1; T.bot(10, { dieu: true }); }
      T.prendreTout();
      const s = G.salle; const sorties = s.sorties || [];
      if (!sorties.length) { out.ko.push('aucune sortie étage ' + et); break; }
      const so = sorties.find(x => x.type === 'etage' && (!x.condition || x.condition())) || sorties[0];
      if (so.type === 'fin') { const J = G.joueur; J.x = so.x; J.y = so.y; T.pas(40); out.fin = so.route; break; }
      const J = G.joueur; J.x = so.x; J.y = so.y; T.pas(60);
    }
    out.passifs = G.joueur ? G.joueur.passifs.length : 0; out.ko = out.ko.slice(0, 25); return out;
  }, [perso, code]);

  // 3) Chaque objet passif : acquisition, 6 s de combat, dégâts infligés
  if (veut('objets')) await lancer('objets', () => {
    const L = window.LDS, G = L.G, T = window.__T; const out = { ko: [], sansDegats: [], ok: 0 };
    for (const o of L.DON.objets.filter(x => x.type === 'passif')) {
      try {
        L.nouvellePartie({ perso: 'CHR_001', code: 'OBJT2345' }); L.Scenes.aller(L.SceneJeu); T.pas(5);
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
    return out;
  });

  // 5) Chaque boss : apparition, dangers, dégâts subis, mort possible
  if (veut('boss')) await lancer('boss', () => {
    const L = window.LDS, G = L.G, T = window.__T; const out = { ko: [], intouchable: [], ok: 0, durees: {} };
    for (const d of L.DON.boss) {
      try {
        L.nouvellePartie({ perso: 'CHR_001', code: 'BOSS2345' }); L.Scenes.aller(L.SceneJeu); T.pas(5);
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
    L.Scenes.aller(L.SceneTitre);
    appui(0); // Nouvelle partie
    if (L.Scenes.courante() !== window.LDS.Scenes.pile[1]) {}
    appui(15); appui(0); // personnage suivant puis valider
    if (!L.G.partie) out.ko.push('la partie n’a pas démarré à la manette');
    else {
      appui(9); if (L.Scenes.pile.length < 2) out.ko.push('pause non ouverte');
      appui(1); if (L.Scenes.pile.length !== 1) out.ko.push('pause non refermée par Retour');
      // stick droit : tir, puis retour au centre = arrêt
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
    return out;
  });

  console.log(erreursPage.length ? 'ERREURS PAGE (' + erreursPage.length + '):\n' + erreursPage.slice(0, 8).join('\n') : 'aucune erreur de page');
  await b.close();
  process.exit(echecs || erreursPage.length ? 1 : 0);
})();
