// Catalogues et validation des données du Labyrinthe des Sceaux.
// Lit les fichiers de données du jeu (jeu/src/00_noyau.js + 1x_donnees_*.js), sans navigateur,
// vérifie identifiants, références, pools, valeurs et navigabilité des gabarits de salles,
// puis écrit catalogues/*.json, catalogues/*.csv, catalogues/compteurs.json et
// dossier/F_catalogues.md + dossier/F_salles.md.
// Usage : node labyrinthe/outils/catalogues.mjs [--verifier]   (--verifier : n'écrit rien, code 1 si erreur)
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const racine = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(racine, 'jeu', 'src');
const verifierSeulement = process.argv.includes('--verifier');

// ── Chargement des données dans un contexte isolé ──
const fichiers = ['00_noyau.js', ...readdirSync(src).filter(f => /^1\d_.*\.js$/.test(f)).sort()];
let code = fichiers.map(f => readFileSync(join(src, f), 'utf8').replace(/^if \(typeof module[^\n]*\n?/m, '')).join('\n');
code += '\n;globalThis.__DON = DON; globalThis.__INDEX = INDEX; indexerDonnees(); globalThis.__VERSION = { jeu: VERSION_JEU, donnees: VERSION_DONNEES };';
const ctx = vm.createContext({ console, Math, JSON, Object, Array, String, Number, Set, Map });
vm.runInContext(code, ctx, { filename: 'donnees.js' });
const DON = ctx.__DON, INDEX = ctx.__INDEX, VERSION = ctx.__VERSION;

// Noms d'effets et de mécaniques réellement implémentés (lus dans le code du jeu)
const texte = f => readFileSync(join(src, f), 'utf8');
const effetsActifs = new Set([...texte('40_actifs.js').matchAll(/^\s{2}(\w+)\(J(?:, P)?\)\s*\{/gm)].map(m => m[1]));
const speciauxBoss = new Set([...texte('43_boss_speciaux.js').matchAll(/^\s{2}(\w+)\((?:e|e, a, m(?:, dt)?)\)\s*\{/gm)].map(m => m[1]));
const actionsDeclencheurs = new Set([...texte('42_evenements.js').matchAll(/case '(\w+)':/g)].map(m => m[1]));
const evenementsEmis = new Set([...fichiersCode().join('\n').matchAll(/evenement\('(\w+)'/g)].map(m => m[1]));
function fichiersCode() { return readdirSync(src).filter(f => /^[2-9]\d_.*\.js$/.test(f)).map(texte); }

// ── Validation ──
const erreurs = [], avertissements = [];
const err = m => erreurs.push(m), avert = m => avertissements.push(m);
const existe = id => !!INDEX[id];
const fam = id => DON.familiers.some(f => f.id === id);
const prefixes = { personnages: /^(CHR|ALT)_\d{3}$/, objets: /^(PSV|ACT)_\d{3}$/, talismans: /^TAL_\d{3}$/, consommables: /^CON_\d{3}$/, pilules: /^PIL_\d{2}$/,
  ennemis: /^ENM_\d{3}$/, boss: /^BOS_(\d{3}|M\d{2})$/, salles: /^ROM_\d{3}$/, themes: /^THM_[A-Z]{3}$/, etages: /^FLR_[A-Z]{3}_\d$/, routes: /^RTE_\d{2}$/,
  transformations: /^TRF_\d{3}$/, synergies: /^SYN_\d{3}$/, objectifs: /^OBJ_\d{3}$/, defis: /^DEF_\d{3}$/, secrets: /^SEC_\d{3}$/ };
for (const [liste, re] of Object.entries(prefixes)) for (const d of DON[liste]) if (!re.test(d.id)) err(`identifiant mal formé dans ${liste} : ${d.id}`);
const nombreFini = (v, m) => { if (typeof v !== 'number' || !Number.isFinite(v)) err(m); };

// Effets déclaratifs (passifs, talismans, transformations, synergies)
const POOLS_VALIDES = ['heritage', 'boss', 'boutique', 'pacte', 'sanctuaire', 'cache', 'isolee', 'bibliotheque', 'defi', 'coffre', 'machine'];
const STATS = ['degats', 'cadence', 'portee', 'vitesseTir', 'vitesse', 'chance', 'plafondCadence'];
function verifierEffets(d) {
  for (const e of d.effets || []) {
    if (e.s && !STATS.includes(e.s)) err(`${d.id} : statistique inconnue ${e.s}`);
    for (const k of ['a', 'p', 'm']) if (e[k] !== undefined) nombreFini(e[k], `${d.id} : valeur ${k} non finie`);
    if (e.familier && !fam(e.familier)) err(`${d.id} : familier inconnu ${e.familier}`);
    if (e.quand && !evenementsEmis.has(e.quand)) err(`${d.id} : événement « ${e.quand} » jamais émis par le moteur`);
    if (e.faire && !actionsDeclencheurs.has(e.faire.type)) err(`${d.id} : action « ${e.faire.type} » non implémentée`);
    if (e.faire && e.faire.familier && !fam(e.faire.familier)) err(`${d.id} : familier inconnu ${e.faire.familier}`);
    if (e.chance !== undefined && !(e.chance >= 0 && e.chance <= 1)) err(`${d.id} : chance hors [0,1]`);
  }
}
// Personnages
for (const p of DON.personnages) {
  if (p.actif && !existe(p.actif)) err(`${p.id} : actif inconnu ${p.actif}`);
  for (const id of p.passifs || []) if (!existe(id)) err(`${p.id} : passif de départ inconnu ${id}`);
  if (p.parent && !existe(p.parent)) err(`${p.id} : parent inconnu ${p.parent}`);
  if (p.deblocage && p.deblocage.objectif && !existe(p.deblocage.objectif)) err(`${p.id} : objectif de déblocage inconnu`);
  for (const k of ['degats', 'cadence', 'portee', 'vitesseTir', 'vitesse', 'chance']) nombreFini(p.stats[k], `${p.id} : stat ${k}`);
}
// Collectibles
for (const o of DON.objets) {
  if (!['passif', 'actif'].includes(o.type)) err(`${o.id} : type ${o.type}`);
  if (!(o.qualite >= 0 && o.qualite <= 4)) err(`${o.id} : qualité hors 0-4`);
  for (const [k, w] of Object.entries(o.pools || {})) { if (!POOLS_VALIDES.includes(k)) err(`${o.id} : pool inconnu ${k}`); if (!(w >= 0)) err(`${o.id} : poids négatif`); }
  if (!Object.keys(o.pools || {}).length && !o.horsPool) avert(`${o.id} : dans aucun pool (obtenable seulement par une source spéciale)`);
  if (!o.desc || /undefined|NaN/.test(o.desc)) err(`${o.id} : description manquante ou invalide`);
  if (o.type === 'actif') {
    if (!o.unique && !o.recharge && !(o.charges >= 1 && o.charges <= 12)) err(`${o.id} : charges hors 1-12`);
    if (!effetsActifs.has(o.effet)) err(`${o.id} : effet d’actif « ${o.effet} » non implémenté`);
  }
  verifierEffets(o);
}
for (const t of DON.talismans) verifierEffets(t);
for (const t of DON.transformations) { verifierEffets(t); const membres = DON.objets.filter(o => o.ensemble === t.ensemble); if (membres.length < t.seuil) err(`${t.id} : ensemble « ${t.ensemble} » trop petit (${membres.length} < ${t.seuil})`); }
for (const s of DON.synergies) { verifierEffets(s); for (const c of s.composants) if (!existe(c)) err(`${s.id} : composant inconnu ${c}`); if (new Set(s.composants).size !== s.composants.length) err(`${s.id} : composant répété`); }
for (const c of DON.consommables) if (!effetsActifs.has(c.effet) && !texte('40_actifs.js').includes('  ' + c.effet + '(J')) err(`${c.id} : effet « ${c.effet} » non implémenté`);
for (const p of DON.pilules) if (p.contraire && !existe(p.contraire)) err(`${p.id} : contraire inconnu`);
// Pools non vides
const tailles = {}; for (const k of POOLS_VALIDES) tailles[k] = DON.objets.filter(o => (o.pools || {})[k] > 0).length;
for (const [k, n] of Object.entries(tailles)) if (n < 3) err(`pool « ${k} » presque vide (${n})`);
// Ennemis et boss
for (const e of DON.ennemis) {
  nombreFini(e.pv, `${e.id} : pv`); if (e.pv <= 0) err(`${e.id} : pv ≤ 0`); nombreFini(e.vitesse, `${e.id} : vitesse`);
  if (e.params && e.params.invocation && !existe(e.params.invocation)) err(`${e.id} : invocation inconnue ${e.params.invocation}`);
  if (e.enfant && !existe(e.enfant)) err(`${e.id} : enfant inconnu`);
}
for (const b of DON.boss) {
  nombreFini(b.pv, `${b.id} : pv`);
  for (const a of b.attaques || []) {
    if (a.type === 'special' && !speciauxBoss.has(a.nom)) err(`${b.id} : attaque spéciale « ${a.nom} » non implémentée`);
    if (a.type === 'invocation' && !existe(a.id)) err(`${b.id} : invocation inconnue ${a.id}`);
    for (const k of ['tele', 'recup']) if (a[k] !== undefined && !(a[k] >= 0.15)) avert(`${b.id}/${a.id} : ${k} très court (${a[k]} s)`);
  }
  if (b.init && !speciauxBoss.has(b.init)) err(`${b.id} : initialisation « ${b.init} » non implémentée`);
}
// Thèmes, variantes, positions, routes
const themes = new Set(DON.themes.map(t => t.id));
for (const t of DON.themes) for (const [r, L] of Object.entries(t.roles)) for (const id of L) if (!existe(id)) err(`${t.id} : ennemi inconnu ${id} (rôle ${r})`);
for (const f of DON.etages) if (!themes.has(f.theme)) err(`${f.id} : thème inconnu`);
for (const p of DON.positions.filter(Boolean).concat(Object.values(DON.branches))) { for (const b of p.boss) if (!existe(b)) err(`étage ${p.pos} : boss inconnu ${b}`); for (const t of p.themes) if (!themes.has(t)) err(`étage ${p.pos} : thème inconnu ${t}`); }
for (const b of DON.boss.filter(b => b.etage >= 1 && !b.mini)) if (!DON.positions.filter(Boolean).concat(Object.values(DON.branches)).some(p => p.boss.includes(b.id)) && b.id !== 'BOS_022') avert(`${b.id} : aucun étage ne le propose`);
// Objectifs, défis
for (const o of DON.objectifs) {
  for (const id of o.recompense.debloque) if (!existe(id)) err(`${o.id} : déblocage inconnu ${id}`);
  const c = o.condition; if (c.type === 'boss' && !existe(c.id)) err(`${o.id} : boss inconnu`); if (c.route && !existe(c.route)) err(`${o.id} : route inconnue`);
  if (c.defi && !existe(c.defi)) err(`${o.id} : défi inconnu`); if (c.perso && !existe(c.perso)) err(`${o.id} : personnage inconnu`);
}
for (const d of DON.defis) { if (d.perso && !existe(d.perso)) err(`${d.id} : personnage inconnu`); for (const id of d.depart || []) if (!existe(id)) err(`${d.id} : objet de départ inconnu ${id}`); }
// Chaque route est accessible sans déblocage issu de sa propre réussite
for (const r of DON.routes) { const auto = DON.objectifs.filter(o => o.condition.route === r.id).flatMap(o => o.recompense.debloque); if (auto.includes(r.id)) err(`${r.id} : dépend de sa propre réussite`); }

// ── Gabarits de salles : dimensions, caractères et navigabilité ──
const FORMES = { '1x1': [[0, 0]], '2x1': [[0, 0], [1, 0]], '1x2': [[0, 0], [0, 1]], '2x2': [[0, 0], [1, 0], [0, 1], [1, 1]], L1: [[1, 0], [0, 1], [1, 1]], L2: [[0, 0], [0, 1], [1, 1]], L3: [[0, 0], [1, 0], [1, 1]], L4: [[0, 0], [1, 0], [0, 1]] };
const BLOQUANT = new Set('#XOJCFKT$~^');       // pour la marche (les pics sont évités : chemin sûr)
const CARACTERES = /^[.#XO^JCFKT$~Wptvcsiefgnqhmlr1-9ISMNBAZ@&*]$/;
const rapportSalles = [];
for (const s of DON.salles) {
  const cel = FORMES[s.forme]; if (!cel) { err(`${s.id} : forme inconnue ${s.forme}`); continue; }
  const cw = Math.max(...cel.map(c => c[0])) + 1, ch = Math.max(...cel.map(c => c[1])) + 1; const W = 13 * cw, H = 7 * ch;
  if (s.grille.length !== H || s.grille.some(l => l.length !== W)) { err(`${s.id} : grille ${s.grille[0].length}×${s.grille.length}, attendu ${W}×${H}`); continue; }
  for (const l of s.grille) for (const c of l) if (!CARACTERES.test(c)) err(`${s.id} : caractère inconnu « ${c} »`);
  const dans = (x, y) => cel.some(([i, j]) => x >= i * 13 && x < i * 13 + 13 && y >= j * 7 && y < j * 7 + 7);
  const libre = (x, y) => x >= 0 && y >= 0 && x < W && y < H && dans(x, y) && !BLOQUANT.has(s.grille[y][x]);
  // devants de portes possibles : milieu de chaque bord extérieur de cellule
  const devants = [];
  for (const [i, j] of cel) {
    const bords = [['haut', i * 13 + 6, j * 7, [i, j - 1]], ['bas', i * 13 + 6, j * 7 + 6, [i, j + 1]], ['gauche', i * 13, j * 7 + 3, [i - 1, j]], ['droite', i * 13 + 12, j * 7 + 3, [i + 1, j]]];
    for (const [dir, x, y, v] of bords) if (!cel.some(c => c[0] === v[0] && c[1] === v[1]) && (!s.portes || s.portes.includes(dir))) devants.push({ dir, x, y });
  }
  const bloques = devants.filter(d => !libre(d.x, d.y));
  if (bloques.length === devants.length) { err(`${s.id} : aucune porte praticable`); continue; }
  // BFS depuis le premier devant libre
  const dep = devants.find(d => libre(d.x, d.y)); const vu = new Set([dep.x + ',' + dep.y]); const f = [[dep.x, dep.y]];
  while (f.length) { const [x, y] = f.pop(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (x + dx) + ',' + (y + dy); if (!vu.has(k) && libre(x + dx, y + dy)) { vu.add(k); f.push([x + dx, y + dy]); } } }
  const coupees = devants.filter(d => libre(d.x, d.y) && !vu.has(d.x + ',' + d.y));
  if (bloques.length && s.type !== 'depart') err(`${s.id} : devant de porte bloqué (${bloques.map(d => d.dir).join(', ')})`);
  if (coupees.length) err(`${s.id} : portes non reliées entre elles (${coupees.map(d => d.dir).join(', ')})`);
  // points d'apparition au sol et piédestaux accessibles (volants et tourelles exemptés)
  const isoles = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const c = s.grille[y][x]; const voisin = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => vu.has((x + dx) + ',' + (y + dy)));
    if ('ptcsiegnqhmlr'.includes(c) && !voisin) isoles.push(c + '@' + x + ',' + y);
    if ('IS'.includes(c) && !voisin) isoles.push(c + '@' + x + ',' + y);
  }
  if (isoles.length) (s.type === 'combat' ? err : avert)(`${s.id} : éléments hors d’atteinte à pied ${isoles.join(' ')}${s.type === 'combat' ? '' : ' (récompense facultative derrière un obstacle)'}`);
  const praticables = [...vu].length, total = cel.length * 91;
  rapportSalles.push({ id: s.id, praticables, total });
}

// ── Compteurs : produit / cible v1.0 / bibliothèque complète (brief §35 et §44) ──
const passifs = DON.objets.filter(o => o.type === 'passif'), actifs = DON.objets.filter(o => o.type === 'actif');
const compteurs = [
  ['Personnages de base', DON.personnages.filter(p => !p.parent).length, 12, 40],
  ['Variantes altérées', DON.personnages.filter(p => p.parent).length, 6, 40],
  ['Objets passifs', passifs.length, 150, 480],
  ['Objets actifs', actifs.length, 30, 120],
  ['Talismans', DON.talismans.length, 35, 100],
  ['Consommables (rouleaux, sceaux)', DON.consommables.length, 30, 80],
  ['Pilules (effets)', DON.pilules.length, null, null],
  ['Familiers (comportements distincts)', new Set(DON.familiers.map(f => f.comportement)).size, null, null],
  ['Synergies documentées', DON.synergies.length, 60, 300],
  ['Transformations d’ensemble', DON.transformations.length, 12, 40],
  ['Thèmes d’étage', DON.themes.length, 6, 12],
  ['Variantes d’étage', DON.etages.length, 12, 24],
  ['Boss (dont mini-boss)', DON.boss.length, 25, 70],
  ['Archétypes ennemis', DON.ennemis.length, 60, 140],
  ['Modèles de salles', DON.salles.length, 120, 500],
  ['Objectifs de déblocage', DON.objectifs.length, 80, 250],
  ['Défis jouables', DON.defis.length, 30, 80],
  ['Secrets documentés', DON.secrets.length, null, 60],
  ['Routes et fins', DON.routes.length, null, null],
];

// ── Formatage ──
const nomDe = id => (INDEX[id] ? INDEX[id].nom : (DON.familiers.find(f => f.id === id) || {}).nom) || id;
const poolsTxt = p => Object.entries(p || {}).map(([k, w]) => k + ' ' + w).join(', ');
const deblocage = id => DON.objectifs.filter(o => o.recompense.debloque.includes(id)).map(o => o.id).join(' ou ') || (INDEX[id] && INDEX[id].deblocage && INDEX[id].deblocage.objectif) || '—';
const md = v => String(v ?? '—').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const csvCellule = v => { const s = String(v ?? ''); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
function tableMd(colonnes, lignes) { return '| ' + colonnes.join(' | ') + ' |\n|' + colonnes.map(() => '---').join('|') + '|\n' + lignes.map(l => '| ' + l.map(md).join(' | ') + ' |').join('\n') + '\n'; }
function csv(colonnes, lignes) { return '﻿' + [colonnes, ...lignes].map(l => l.map(csvCellule).join(';')).join('\n') + '\n'; }
const condTxt = c => c.type === 'boss' ? 'vaincre ' + nomDe(c.id) + (c.sansDegats ? ' sans dégâts' : '') + (c.perso ? ' avec ' + nomDe(c.perso) : '') : c.type === 'compteur' ? c.nom + ' ≥ ' + c.min + ' (cumulé)' : c.type === 'etat' ? 'état : ' + c.nom : 'fin ' + (c.route || '') + (c.perso ? ' avec ' + nomDe(c.perso) : '') + (c.difficile ? ' en Difficile' : '') + (c.defi ? ' du défi ' + c.defi : '');
const effetTxt = o => o.type === 'actif' ? (o.unique ? 'usage unique' : o.recharge ? 'recharge ' + o.recharge + ' s en combat' : o.charges + ' charge(s)') : '';

const tables = {
  personnages: { titre: 'Personnages et variantes', col: ['ID', 'Nom', 'Parent', 'Santé', 'Dég.', 'Cad.', 'Portée', 'Vit.', 'Tir', 'Actif', 'Règle', 'Déblocage'],
    lignes: DON.personnages.map(p => [p.id, p.nom, p.parent || '', (p.sante.vitalite || 0) + (p.sante.protection ? '+' + p.sante.protection + 'p' : '') + (p.sante.instable ? '+' + p.sante.instable + 'i' : ''), p.stats.degats, p.stats.cadence, p.stats.portee, p.stats.vitesse, (p.tir.forme || 'projectile') + ' / ' + p.tir.apparence, p.actif ? nomDe(p.actif) : '—', p.regle, p.deblocage ? p.deblocage.objectif : 'départ']) },
  passifs: { titre: 'Objets passifs (PSV)', col: ['ID', 'Nom', 'Famille', 'Q', 'Pools (poids)', 'Effet', 'Cumul', 'Ensemble', 'Statut', 'Déblocage'],
    lignes: passifs.map(o => [o.id, o.nom, o.famille, o.qualite, poolsTxt(o.pools), o.desc + (o.contrepartie ? ' Contrepartie : ' + o.contrepartie : ''), o.cumul, o.ensemble || '', o.statut, deblocage(o.id)]) },
  actifs: { titre: 'Objets actifs — techniques scellées (ACT)', col: ['ID', 'Nom', 'Q', 'Pools (poids)', 'Recharge', 'Effet', 'Statut', 'Déblocage'],
    lignes: actifs.map(o => [o.id, o.nom, o.qualite, poolsTxt(o.pools), effetTxt(o), o.desc, o.statut, deblocage(o.id)]) },
  talismans: { titre: 'Talismans (TAL)', col: ['ID', 'Nom', 'Effet', 'Statut', 'Déblocage'], lignes: DON.talismans.map(t => [t.id, t.nom, t.desc, t.statut, deblocage(t.id)]) },
  consommables: { titre: 'Consommables : rouleaux et sceaux (CON)', col: ['ID', 'Nom', 'Famille', 'Effet', 'Poids'], lignes: DON.consommables.map(c => [c.id, c.nom, c.famille, c.desc, c.poids]) },
  pilules: { titre: 'Pilules militaires (PIL, apparence tirée par partie)', col: ['ID', 'Nom', 'Effet', 'Négative', 'Neutralisée en'], lignes: DON.pilules.map(p => [p.id, p.nom, p.desc, p.negatif ? 'oui' : 'non', p.contraire ? nomDe(p.contraire) : '—']) },
  familiers: { titre: 'Familiers (FAM)', col: ['ID', 'Nom', 'Comportement', 'Dégâts', 'Cadence / recharge', 'Particularité'], lignes: DON.familiers.map(f => [f.id, f.nom, f.comportement, f.degats ?? (f.coef ? '×' + f.coef + ' du tir' : f.coefJoueur ? '×' + f.coefJoueur + ' dégâts' : '—'), f.cadence ? f.cadence + ' /s' : f.recharge ? f.recharge + ' s' : f.tousLes ? 'toutes les ' + f.tousLes + ' salles' : '—', [f.bloque ? 'bloque les tirs' : '', f.statut ? 'statut ' + f.statut : '', f.marionnette ? 'marionnette' : '', f.donne ? 'donne ' + f.donne : '', f.reflet ? 'renvoie les tirs' : ''].filter(Boolean).join(', ') || '—']) },
  ennemis: { titre: 'Ennemis (ENM)', col: ['ID', 'Nom', 'Rôle', 'Comportement', 'PV', 'Vitesse', 'Rayon', 'Thèmes', 'Description'],
    lignes: DON.ennemis.map(e => [e.id, e.nom, e.role, e.comportement, e.pv, e.vitesse, e.r, DON.themes.filter(t => Object.values(t.roles).some(L => L.includes(e.id))).map(t => t.id.slice(4)).join(' ') || 'invocation', e.desc || '']) },
  boss: { titre: 'Boss (BOS)', col: ['ID', 'Nom', 'Titre', 'Étage', 'PV', 'Attaques', 'Phases', 'Mécanique'],
    lignes: DON.boss.map(b => [b.id, b.nom, b.titre, b.mini ? 'mini-boss' : b.etage, b.pv, (b.attaques || []).map(a => a.id).join(', '), (b.phases || []).map(p => Math.round(p.seuil * 100) + ' %').join(', ') || '—', b.desc]) },
  salles: { titre: 'Modèles de salles (ROM)', col: ['ID', 'Nom', 'Type', 'Forme', 'Étages', 'Portes', 'Ennemis', 'Cases praticables'],
    lignes: DON.salles.map(s => { const r = rapportSalles.find(x => x.id === s.id) || {}; return [s.id, s.nom, s.type, s.forme, s.etages ? s.etages.join('-') : 'tous', s.portes ? s.portes.join(', ') : 'toutes', s.grille.join('').replace(/[^ptvcsiefgnqhmlr]/g, '').length, r.praticables + ' / ' + r.total]; }) },
  themes: { titre: 'Thèmes (THM) et variantes d’étage (FLR)', col: ['ID', 'Nom', 'Chapitre', 'Sol / murs', 'Décor', 'Musique', 'Variantes (règle)'],
    lignes: DON.themes.map(t => [t.id, t.nom, t.chapitre, t.visuel.sol.motif + ' / ' + t.visuel.mur.motif, t.visuel.deco.join(', '), t.musique.gamme + ', ' + t.musique.tempo + ' bpm, ' + t.musique.timbre, DON.etages.filter(f => f.theme === t.id).map(f => f.nom + ' : ' + f.desc).join(' ; ')]) },
  routes: { titre: 'Routes et fins (RTE)', col: ['ID', 'Nom', 'Bifurcation', 'Prérequis', 'Boss', 'Récompense', 'Marque'], lignes: DON.routes.map(r => [r.id, r.nom, r.bifurcation, r.prerequis, r.boss.split('|').map(nomDe).join(' / '), r.recompense, r.marque]) },
  transformations: { titre: 'Transformations d’ensemble (TRF)', col: ['ID', 'Nom', 'Ensemble', 'Seuil', 'Effet', 'Objets de l’ensemble'],
    lignes: DON.transformations.map(t => [t.id, t.nom, t.ensemble, t.seuil + ' distincts', t.desc, DON.objets.filter(o => o.ensemble === t.ensemble).map(o => o.id).join(', ')]) },
  synergies: { titre: 'Synergies documentées (SYN)', col: ['ID', 'Nom', 'Composants', 'Type', 'Effet', 'Test d’acceptation'], lignes: DON.synergies.map(s => [s.id, s.nom, s.composants.map(c => c + ' ' + nomDe(c)).join(' + '), s.type, s.desc, s.test]) },
  objectifs: { titre: 'Objectifs de déblocage (OBJ)', col: ['ID', 'Nom', 'Condition', 'Débloque'], lignes: DON.objectifs.map(o => [o.id, o.nom, condTxt(o.condition), o.recompense.debloque.map(id => id + ' ' + nomDe(id)).join(', ')]) },
  defis: { titre: 'Défis — contrats de mission (DEF)', col: ['ID', 'Nom', 'Règles', 'Récompense'], lignes: DON.defis.map(d => [d.id, d.nom, d.desc, d.recompenseTexte]) },
  secrets: { titre: 'Secrets (SEC)', col: ['ID', 'Nom', 'Indice en jeu', 'Solution'], lignes: DON.secrets.map(s => [s.id, s.nom, s.indice, s.solution]) },
};

// ── Rapport ──
console.log(`Données v${VERSION.donnees} (jeu ${VERSION.jeu}) : ${Object.keys(INDEX).length} identifiants.`);
for (const a of avertissements) console.log('  avertissement : ' + a);
for (const e of erreurs) console.log('  ERREUR : ' + e);
console.log(`${erreurs.length} erreur(s), ${avertissements.length} avertissement(s).`);
if (verifierSeulement) process.exit(erreurs.length ? 1 : 0);

// ── Écriture ──
const dCat = join(racine, 'catalogues'), dDos = join(racine, 'dossier');
mkdirSync(dCat, { recursive: true }); mkdirSync(dDos, { recursive: true });
const brut = { personnages: DON.personnages, passifs, actifs, talismans: DON.talismans, consommables: DON.consommables, pilules: DON.pilules, familiers: DON.familiers, ennemis: DON.ennemis, boss: DON.boss,
  salles: DON.salles, themes: DON.themes, variantes_etage: DON.etages, positions_etage: DON.positions.filter(Boolean), branches: DON.branches, routes: DON.routes, transformations: DON.transformations,
  synergies: DON.synergies, objectifs: DON.objectifs, defis: DON.defis, secrets: DON.secrets };
for (const [k, v] of Object.entries(brut)) writeFileSync(join(dCat, k + '.json'), JSON.stringify(v, null, 1) + '\n');
for (const [k, t] of Object.entries(tables)) writeFileSync(join(dCat, k + '.csv'), csv(t.col, t.lignes));
const cpt = compteurs.map(([nom, n, v1, cible]) => ({ ensemble: nom, produit: n, cible_v1: v1, cible_bibliotheque: cible }));
writeFileSync(join(dCat, 'compteurs.json'), JSON.stringify({ version_donnees: VERSION.donnees, version_jeu: VERSION.jeu, genere: 'outils/catalogues.mjs', compteurs: cpt, pools: tailles, validation: { erreurs, avertissements } }, null, 1) + '\n');

let doc = `# F — Catalogues générés depuis les données du jeu\n\n`;
doc += `> Fichier produit par \`outils/catalogues.mjs\` à partir de \`jeu/src/1x_donnees_*.js\` (données v${VERSION.donnees}, jeu ${VERSION.jeu}). `;
doc += `Ne pas l’éditer à la main : modifier les données puis relancer l’outil. Les mêmes tables existent en CSV (séparateur « ; ») et en JSON complet dans \`catalogues/\`.\n\n`;
doc += `Validation : **${erreurs.length} erreur(s)**, ${avertissements.length} avertissement(s) (identifiants, références, pools, effets implémentés, navigabilité des salles).\n\n`;
doc += `## Compteurs par lot\n\n` + tableMd(['Ensemble', 'Produit et jouable', 'Cible v1.0 (brief §44)', 'Bibliothèque complète (brief §35)'], compteurs.map(([n, p, v, c]) => [n, p, v ?? '—', c ?? '—']));
doc += `\nTaille des pools (objets de poids non nul) : ${Object.entries(tailles).map(([k, n]) => k + ' ' + n).join(', ')}.\n\n`;
for (const [k, t] of Object.entries(tables)) { if (k === 'salles') continue; doc += `## ${t.titre} — ${t.lignes.length}\n\n` + tableMd(t.col, t.lignes) + '\n'; }
if (avertissements.length) doc += `## Avertissements de validation\n\n` + avertissements.map(a => '- ' + a).join('\n') + '\n';
writeFileSync(join(dDos, 'F_catalogues.md'), doc);

let ds = `# F bis — Modèles de salles (grilles complètes)\n\n> Généré par \`outils/catalogues.mjs\`. Légende : \`.\` sol, \`#\` rocher, \`X\` bloc, \`O\` fosse, \`^\` pics, \`J\` jarre, \`C\` caisse, \`F\` feu, \`K\` bloc à clé, \`T\` totem, \`$\` rocher à sceau, \`~\` hors salle, \`W\` toile ; `;
ds += `minuscules = rôle d’apparition (p poursuivant, t tireur, v volant, c chargeur, s lanceur en arc, i invocateur, e embusqué, f tourelle, g protecteur, n nuée, q tireur prédictif, h guérisseur, m poseur de pièges, l lourd, r rampant) ; `;
ds += `chiffres = ressource, \`I\` piédestal, \`S\` étal, \`M\` machine, \`N\` informateur, \`A\` statue ou autel, \`Z\` coffre. Les portes sont au milieu des bords autorisés ; la navigabilité est vérifiée par l’outil (cases praticables reliées).\n\n`;
ds += tableMd(tables.salles.col, tables.salles.lignes) + '\n';
for (const s of DON.salles) ds += `### ${s.id} — ${s.nom}\n\nType ${s.type}, forme ${s.forme}${s.etages ? ', étages ' + s.etages.join('–') : ''}${s.portes ? ', portes imposées : ' + s.portes.join(', ') : ''}${s.poids ? ', poids ' + s.poids : ''}.\n\n\`\`\`text\n${s.grille.join('\n')}\n\`\`\`\n\n`;
writeFileSync(join(dDos, 'F_salles.md'), ds);
console.log('Écrit : catalogues/*.json, catalogues/*.csv, catalogues/compteurs.json, dossier/F_catalogues.md, dossier/F_salles.md');
