// Journal d'une partie à code : ce que le labyrinthe propose réellement, étage par étage.
// Usage : node labyrinthe/outils/journal_partie.mjs CHR_001 PARC2345 [etageMax=6]
// Le pilote (outils/aide_tests.js) nettoie les salles en mode invulnérable ; la politique de choix
// est volontairement simple et écrite ici : prendre les objets gratuits, acheter en boutique l'objet
// le plus cher payable (sinon une ressource), refuser les pactes, accepter le sanctuaire.
// Sert de matière aux parties commentées du dossier (G §2) : les offres sont celles du code de mission,
// les décisions commentées dans le dossier peuvent différer de cette politique.
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node22/lib/node_modules/playwright'); }

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const [perso = 'CHR_001', code = 'PARC2345', etageMax = '6'] = process.argv.slice(2);
// un code invalide serait remplacé par un code aléatoire : le journal ne serait plus reproductible
if (!/^[ABCDEFGHJKLMNPQRSTUVWXYZ2-9]{8}$/.test(code)) { console.error('Code de mission invalide (8 signes parmi A–Z sans I ni O, et 2–9) : ' + code); process.exit(1); }

const b = await pw.chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => pw.chromium.launch());
const page = await b.newPage();
const erreurs = []; page.on('pageerror', e => erreurs.push(String(e).slice(0, 300)));
await page.goto('file://' + join(racine, 'jeu', 'index.html')); await page.waitForTimeout(300);
await page.addScriptTag({ content: readFileSync(join(racine, 'outils', 'aide_tests.js'), 'utf8') });
const journal = await page.evaluate(([perso, code, etageMax]) => {
  const L = window.LDS, G = L.G, T = window.__T; window.__T.rendu = 30;
  L.Progression.profil.toutDebloque = true; G.modeTest = { deblocages: [] };
  L.nouvellePartie({ perso, code }); L.Scenes.aller(L.SceneJeu); T.pas(10);
  const nom = id => (L.INDEX[id] && L.INDEX[id].nom) || id;
  const q = id => (L.INDEX[id] && L.INDEX[id].qualite) ?? '-';
  const sante = J => { const S = J.sante; return S.cont.map(c => (c.t === 'os' ? 'o' : 'v') + c.p).join(' ') + (S.prot.length ? ' | prot ' + S.prot.join('') : ''); };
  const etat = J => ({ sante: sante(J), ryo: J.ryo, cles: J.cles, explosifs: J.explosifs, actif: J.actif && J.actif.id, talisman: J.talisman, passifs: J.passifs.slice(), forme: J.profil.forme });
  const J0 = () => G.joueur; const out = { perso, code, etages: [] };
  // prise des objets gratuits : un actif n'en remplace un autre que s'il est de meilleure qualité ; dans un groupe au choix, le meilleur
  const prendre = (F) => {
    const S = G.salle, J = J0(); const vus = new Set(); const notes = [];
    const libres = S.piedestaux.filter(p => p.id && !p.prix && !p.ramassable);
    for (const p of libres) {
      if (p.groupe) { if (vus.has(p.groupe)) continue; vus.add(p.groupe); const G2 = libres.filter(x => x.groupe === p.groupe).sort((a, b) => (q(b.id) || 0) - (q(a.id) || 0)); if (G2[0] !== p) { const m = G2[0]; J.x = m.x; J.y = m.y + 6; T.pas(40, []); T.pas(10, ['Enter']); notes.push('choix : ' + m.id + ' ' + nom(m.id) + ' plutôt que ' + G2.slice(1).map(x => x.id).join(', ')); continue; } }
      const d = L.INDEX[p.id]; if (d && d.type === 'actif' && J.actif && (q(p.id) || 0) <= (q(J.actif.id) || 0)) { notes.push('actif laissé : ' + p.id + ' ' + nom(p.id) + ' (garde ' + J.actif.id + ' ' + nom(J.actif.id) + ')'); continue; }
      const avant = J.actif && J.actif.id; J.x = p.x; J.y = p.y + 6; T.pas(40, []); T.pas(10, ['Enter']);
      if (d && d.type === 'actif' && J.actif && J.actif.id !== avant) notes.push('actif échangé : ' + (avant ? avant + ' ' + nom(avant) : 'aucun') + ' → ' + J.actif.id + ' ' + nom(J.actif.id));
    }
    for (const r of S.ramassables.slice()) { J.x = r.x; J.y = r.y; T.pas(3, []); }
    for (const n of notes) F.evenements.push('  ' + n);
  };
  for (let et = 1; et <= etageMax; et++) {
    if (!G.partie || G.partie.etage !== et) break;
    const E = G.etage; const F = { numero: et, nom: E.cfg.nom, boss: E.cfg.boss, salles: {}, evenements: [] };
    for (const s of Object.values(E.salles)) F.salles[s.type] = (F.salles[s.type] || 0) + 1;
    const ordre = Object.values(E.salles).filter(s => s.type !== 'boss' && s.id !== 'opp').sort((a, b) => a.id - b.id);
    for (const s of ordre) {
      if ((s.type === 'cache' || s.type === 'isolee')) { const ok = J0().explosifs > 0; F.evenements.push(`${s.type} : ${ok ? 'mur secret ouvert à l’explosif' : 'aucun explosif, salle laissée'}`); if (!ok) continue; J0().explosifs--; for (const x of Object.values(E.salles)) for (const p of x.portes) if (p.vers === s.id && p.etat === 'secrete') p.etat = 'ouverte'; }
      if (s.verrou || s.portes.some(p => p.etat === 'verrouillee')) { /* portes à clé : le pilote passe, le coût est noté */ }
      T.allerA(s.id); T.bot(60, { dieu: true, jusquaNettoyage: true, bombes: false });
      const S = G.salle;
      const offres = S.piedestaux.filter(p => p.id && !p.ramassable).map(p => `${p.id} ${nom(p.id)} (q${q(p.id)}${p.prix ? ', ' + (p.prix.type === 'ryo' ? L.prixRyo(p) + ' Ryō' : p.prix.n + ' contenant(s)') : ''}${p.groupe ? ', au choix' : ''})`);
      if (S.type === 'boutique') {
        const J = J0(); const vitrine = S.piedestaux.filter(p => p.prix && p.prix.type === 'ryo' && p.id);
        const objets = vitrine.filter(p => !p.ramassable).sort((a, b) => b.prix.n - a.prix.n); // prix de base : un coupon rend tout gratuit
        const achat = objets.find(p => L.prixRyo(p) <= J.ryo) || vitrine.filter(p => p.ramassable).sort((a, b) => b.prix.n - a.prix.n).find(p => L.prixRyo(p) <= J.ryo);
        F.evenements.push(`boutique (${J.ryo} Ryō) : ${vitrine.map(p => (p.ramassable ? p.ramassable : p.id + ' ' + nom(p.id)) + ' ' + L.prixRyo(p) + (p.solde ? ' soldé' : '')).join(' ; ')} → ${achat ? 'achat : ' + (achat.ramassable || achat.id + ' ' + nom(achat.id)) : 'rien d’abordable'}`);
        if (achat) { L.acheter(achat); T.pas(60, ['Enter']); }
      } else if (offres.length) F.evenements.push(`${s.type} : ${offres.join(' ; ')}`);
      const avant = J0().passifs.length; prendre(F); T.pas(20, []);
      const pris = J0().passifs.slice(avant); if (pris.length) F.evenements.push('  pris : ' + pris.map(id => id + ' ' + nom(id)).join(', '));
      if (S.machines.length || S.pnj.length) F.evenements.push(`${S.type === 'boutique' || offres.length ? '  ' : S.type + ' : '}${[...S.machines.map(m => 'machine ' + m.type), ...S.pnj.map(n => 'informateur ' + n.type)].join(', ')}`);
      if (G.joueur.etat === 'mort') { F.evenements.push('mort'); break; }
    }
    // boss
    T.allerA(E.boss); T.pas(120, ['Enter']);
    const nomBoss = G.ennemis.filter(x => x.boss).map(x => nom(x.id)).join(' + ');
    const t0 = G.temps; T.bot(150, { dieu: true, jusquaNettoyage: true, relacher: true });
    if (G.ennemis.some(x => x.boss && !x.mort)) { for (const x of G.ennemis) x.pv = 1; T.bot(10, { dieu: true }); }
    const SB = G.salle; const recompense = SB.piedestaux.filter(p => p.id).map(p => p.id + ' ' + nom(p.id) + ' (q' + q(p.id) + ')');
    F.evenements.push(`boss ${nomBoss} (${Math.round(G.temps - t0)} s de pilote) : ${recompense.join(' ; ') || 'rien'}`);
    const avantB = J0().passifs.length; prendre(F); T.pas(20, []); const prisB = J0().passifs.slice(avantB); if (prisB.length) F.evenements.push('  pris : ' + prisB.map(id => id + ' ' + nom(id)).join(', '));
    const O = L.chanceOpportunite(); F.opportunite = `${Math.round(O.chance * 100)} % (pacte ${Math.round(O.pacte * 100)} %, sanctuaire ${Math.round(O.sanctuaire * 100)} %) → ${E.opportunite || 'aucune'}`;
    if (E.opportunite && E.salles.opp) {
      T.allerA('opp'); T.pas(30, []); const so = G.salle;
      F.evenements.push(`${E.opportunite} : ${so.piedestaux.filter(p => p.id).map(p => p.id + ' ' + nom(p.id) + ' (q' + q(p.id) + (p.prix ? ', ' + p.prix.n + ' contenant(s)' : '') + ')').join(' ; ')}`);
      if (E.opportunite === 'sanctuaire') { const a = J0().passifs.length; prendre(F); T.pas(20, []); const p = J0().passifs.slice(a); if (p.length) F.evenements.push('  pris : ' + p.map(id => id + ' ' + nom(id)).join(', ')); }
      else F.evenements.push('  pacte refusé (politique du journal)');
      T.allerA(E.boss);
    }
    F.fin = etat(J0());
    out.etages.push(F);
    // sortie
    const s = G.salle; const sorties = s.sorties || []; const so = sorties.find(x => x.type === 'etage' && (!x.condition || x.condition())) || sorties.find(x => x.type === 'fin') || sorties[0];
    if (!so) break; if (so.type === 'fin') { out.fin = so.route; break; }
    const avantE = G.partie.etage; for (let k = 0; k < 400 && G.partie && G.partie.etage === avantE; k++) { const J = G.joueur; if (!G.enAnimationObjet && !G.fondu) { J.x = so.x; J.y = so.y; } T.pas(1, G.enAnimationObjet ? ['Enter'] : []); }
  }
  out.temps = Math.round(G.partie ? G.partie.temps : 0);
  return out;
}, [perso, code, Number(etageMax)]);
await b.close();

// ── Écriture Markdown ──
let md = `### Journal ${journal.perso} · mission ${journal.code}\n\n`;
for (const F of journal.etages) {
  md += `**Étage ${F.numero} — ${F.nom}** (boss prévu ${F.boss} ; salles : ${Object.entries(F.salles).map(([k, n]) => k + ' ' + n).join(', ')})\n\n`;
  for (const e of F.evenements) md += (e.startsWith('  ') ? '  - ' + e.trim() : '- ' + e) + '\n';
  md += `- opportunité : ${F.opportunite}\n- fin d’étage : santé ${F.fin.sante} · ${F.fin.ryo} Ryō · ${F.fin.cles} clé(s) · ${F.fin.explosifs} explosif(s) · actif ${F.fin.actif} · forme ${F.fin.forme} · ${F.fin.passifs.length} passifs\n\n`;
}
if (journal.fin) md += `Fin : ${journal.fin}.\n`;
if (erreurs.length) md += `\nErreurs de page : ${erreurs.join(' | ')}\n`;
console.log(md);
