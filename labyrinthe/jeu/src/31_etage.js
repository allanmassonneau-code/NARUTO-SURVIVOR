// ═══════════════════════════════════════════════════════════════════════════
// Génération d'un étage : graphe de salles préparées sur une grille 13×13.
// 1) route praticable par expansion en largeur (pas de boucles) ;
// 2) grandes salles ; 3) culs-de-sac → boss (le plus éloigné), puis salles
// spéciales ; 4) secrets (contraintes topologiques propres) ; 5) validation ;
// 6) secours après un nombre fini d'échecs. Aucune relance infinie.
// ═══════════════════════════════════════════════════════════════════════════

const GRILLE_ETAGE = 13;
const PRIORITE_SPECIALES = ['heritage', 'boutique', 'defi_boss', 'sacrifice', 'malediction', 'defi', 'dispositifs', 'bibliotheque', 'coffres', 'repos'];
const OBLIGATOIRES = ['heritage', 'boutique'];

function planEtage(alea, cfg) {
  const N = alea.entierEntre(cfg.salles[0], cfg.salles[1]);
  const occ = new Map(); // "x,y" → index de salle
  const salles = [];
  const cle = (x, y) => x + ',' + y;
  const dedans = (x, y) => x >= 0 && y >= 0 && x < GRILLE_ETAGE && y < GRILLE_ETAGE;
  const voisinsOcc = (x, y) => [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => occ.has(cle(x + dx, y + dy))).length;
  const ajouter = (forme, x0, y0, type) => {
    const F = FORMES[forme]; const id = salles.length;
    const cel = F.cel.map(([i, j]) => [x0 + i, y0 + j]);
    salles.push({ id, forme, cx: x0, cy: y0, cel, type: type || 'combat' });
    for (const [x, y] of cel) occ.set(cle(x, y), id);
    return salles[id];
  };
  const dep = ajouter('1x1', 6, 6, 'depart');
  const file = [dep];
  let garde = 0;
  while (salles.length < N && garde++ < 400) {
    if (!file.length) { // relance depuis une salle existante au hasard (comme une nouvelle vague)
      file.push(alea.choix(salles.filter(s => s.type !== 'depart' || salles.length < 3)));
    }
    const r = file.shift();
    const dirs = alea.melanger([[1, 0], [-1, 0], [0, 1], [0, -1]]);
    for (const [x, y] of r.cel) for (const [dx, dy] of dirs) {
      if (salles.length >= N) break;
      const nx = x + dx, ny = y + dy;
      if (!dedans(nx, ny) || occ.has(cle(nx, ny))) continue;
      if (voisinsOcc(nx, ny) > 1) continue;
      if (alea.chance(0.5)) continue;
      // grande salle ?
      let place = null;
      if (r.type !== 'depart' && alea.chance(cfg.grandes || 0.18)) {
        const formes = alea.melanger(['2x1', '1x2', '2x2', 'L1', 'L2', 'L3', 'L4']);
        for (const f of formes) {
          const F = FORMES[f];
          // essayer chaque ancrage qui place une cellule de la forme sur (nx,ny)
          for (const [ai, aj] of F.cel) {
            const x0 = nx - ai, y0 = ny - aj;
            const cels = F.cel.map(([i, j]) => [x0 + i, y0 + j]);
            if (!cels.every(([cx, cy]) => dedans(cx, cy) && !occ.has(cle(cx, cy)))) continue;
            // voisins extérieurs : uniquement la salle parente
            const ext = new Set(); for (const [cx, cy] of cels) for (const [ex, ey] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = cle(cx + ex, cy + ey); if (occ.has(k)) ext.add(occ.get(k)); }
            if (ext.size === 1 && ext.has(r.id) && salles.length + 1 <= N) { place = [f, x0, y0]; break; }
          }
          if (place) break;
        }
      }
      const nouv = place ? ajouter(place[0], place[1], place[2]) : ajouter('1x1', nx, ny);
      file.push(nouv);
    }
  }
  if (salles.length < N) return { echec: 'nombre de salles insuffisant (' + salles.length + '/' + N + ')' };
  // Adjacences
  const adj = salles.map(() => new Set());
  for (const s of salles) for (const [x, y] of s.cel) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = cle(x + dx, y + dy); if (occ.has(k) && occ.get(k) !== s.id) adj[s.id].add(occ.get(k)); }
  // Distances depuis le départ
  const distA = salles.map(() => -1); distA[0] = 0; const q = [0];
  while (q.length) { const a = q.shift(); for (const b of adj[a]) if (distA[b] < 0) { distA[b] = distA[a] + 1; q.push(b); } }
  // Culs-de-sac : salles 1×1 à un seul voisin, hors départ
  let culs = salles.filter(s => s.id !== 0 && s.forme === '1x1' && adj[s.id].size === 1);
  culs.sort((a, b) => distA[b.id] - distA[a.id]);
  if (!culs.length) return { echec: 'aucun cul-de-sac' };
  const boss = culs[0];
  if (distA[boss.id] < (cfg.distBossMin || 3)) return { echec: 'boss trop proche (' + distA[boss.id] + ')' };
  if (adj[boss.id].has(0)) return { echec: 'boss adjacent au départ' };
  // la salle devant le boss ne doit pas être une grande salle en L (lisibilité de l'approche) — pas d'exigence : documenté
  boss.type = 'boss';
  const restants = culs.slice(1);
  // Salles spéciales demandées pour cet étage
  const demandes = [];
  for (const t of PRIORITE_SPECIALES) {
    const p = (cfg.speciales || {})[t]; if (p === undefined) continue;
    if (p >= 1 || alea.chance(p)) demandes.push(t);
  }
  // les spéciales obligatoires doivent tenir
  const oblig = demandes.filter(t => OBLIGATOIRES.includes(t));
  if (restants.length < oblig.length) return { echec: 'culs-de-sac insuffisants pour ' + oblig.join(', ') };
  alea.melanger(restants);
  // éviter qu'une spéciale soit voisine du boss si possible
  restants.sort((a, b) => (adj[a.id].has(boss.id) ? 1 : 0) - (adj[b.id].has(boss.id) ? 1 : 0));
  for (const t of demandes) { const s = restants.shift(); if (!s) break; s.type = t; }
  // Cache de renseignements (secret) : case vide voisine d'au moins 2 salles ordinaires, loin du boss
  const vides = [];
  for (let y = 0; y < GRILLE_ETAGE; y++) for (let x = 0; x < GRILLE_ETAGE; x++) if (!occ.has(cle(x, y))) vides.push([x, y]);
  const voisinsDe = (x, y) => { const v = new Set(); for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = cle(x + dx, y + dy); if (occ.has(k)) v.add(occ.get(k)); } return [...v]; };
  const candSecret = vides.map(([x, y]) => ({ x, y, v: voisinsDe(x, y) }))
    .filter(c => c.v.length >= 2 && !c.v.some(i => salles[i].type === 'boss') && c.v.every(i => ['combat', 'depart'].includes(salles[i].type) || alea.chance(0.2)));
  let secret = null;
  if (candSecret.length) {
    const maxV = Math.max(...candSecret.map(c => c.v.length));
    const meilleurs = candSecret.filter(c => c.v.length >= Math.min(3, maxV));
    const c = alea.choix(meilleurs);
    secret = ajouter('1x1', c.x, c.y, 'cache'); secret.liens = c.v;
  } else if (cfg.secretObligatoire) return { echec: 'aucun emplacement de cache' };
  // Chambre isolée (super-secrète) : voisine d'exactement une salle ordinaire, et de rien d'autre
  const candIsole = [];
  for (let y = 0; y < GRILLE_ETAGE; y++) for (let x = 0; x < GRILLE_ETAGE; x++) {
    if (occ.has(cle(x, y))) continue; const v = voisinsDe(x, y);
    if (v.length === 1 && salles[v[0]].type === 'combat' && salles[v[0]].forme === '1x1') candIsole.push({ x, y, v });
  }
  let isolee = null;
  if (candIsole.length) {
    // préférer les plus éloignées du départ
    candIsole.sort((a, b) => distA[b.v[0]] - distA[a.v[0]]);
    const c = alea.choix(candIsole.slice(0, Math.max(1, Math.ceil(candIsole.length / 2))));
    isolee = ajouter('1x1', c.x, c.y, 'isolee'); isolee.liens = c.v;
  }
  // Spéciales obligatoires présentes ?
  for (const t of oblig) if (!salles.some(s => s.type === t)) return { echec: 'spéciale manquante : ' + t };
  return { salles, occ, adj, distA, boss: boss.id, secret: secret && secret.id, isolee: isolee && isolee.id };
}

// Plan de secours : croix fixe, toujours valide (utilisé après 60 échecs)
function planSecours(cfg) {
  const salles = []; const occ = new Map();
  const add = (x, y, type) => { const id = salles.length; salles.push({ id, forme: '1x1', cx: x, cy: y, cel: [[x, y]], type }); occ.set(x + ',' + y, id); return id; };
  add(6, 6, 'depart'); add(5, 6, 'combat'); add(4, 6, 'heritage'); add(7, 6, 'combat'); add(8, 6, 'combat'); add(9, 6, 'boss');
  add(6, 5, 'combat'); add(6, 4, 'boutique'); add(6, 7, 'combat'); add(6, 8, 'combat');
  const sec = add(7, 5, 'cache'); salles[sec].liens = [3, 6];
  const adj = salles.map(() => new Set());
  for (const s of salles) for (const [x, y] of s.cel) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (x + dx) + ',' + (y + dy); if (occ.has(k) && occ.get(k) !== s.id) adj[s.id].add(occ.get(k)); }
  return { salles, occ, adj, distA: [], boss: 5, secret: sec, isolee: null, secours: true };
}

// Type de porte : la salle la plus « spéciale » des deux impose le cadre
const RANG_PORTE = { boss: 9, heritage: 8, boutique: 7, defi_boss: 7, defi: 6, malediction: 6, sacrifice: 5, bibliotheque: 5, dispositifs: 5, coffres: 5, repos: 5, cache: 4, isolee: 4, depart: 0, combat: 0 };
function typePorte(a, b) { const ra = RANG_PORTE[a.type] || 0, rb = RANG_PORTE[b.type] || 0; return ra >= rb ? a.type : b.type; }

// Construit l'étage complet (salles instanciées, portes, gabarits, ennemis)
function genererEtage(partie, numero, cfg) {
  const code = partie.code;
  const topo = fluxEtage(code, numero, 'topologie');
  let plan = null; const diagnostics = [];
  for (let essai = 0; essai < 60 && !plan; essai++) {
    const p = planEtage(topo, cfg);
    if (p.echec) diagnostics.push(p.echec); else plan = p;
  }
  if (!plan) { plan = planSecours(cfg); diagnostics.push('SECOURS'); }
  const E = { numero, cfg, theme: cfg.theme, variante: cfg.variante, nom: cfg.nom, salles: {}, grille: {}, depart: 0, boss: plan.boss,
    secret: plan.secret, isolee: plan.isolee, diagnostics, essais: diagnostics.length + 1, courante: 0, malediction: cfg.malediction || null };
  const alSalles = fluxEtage(code, numero, 'gabarits');
  for (const ps of plan.salles) {
    const s = creerSalle({ id: ps.id, type: ps.type, forme: ps.forme, cx: ps.cx, cy: ps.cy, graine: hacher(code + '|' + numero + '|' + ps.id)[0] });
    E.salles[ps.id] = s;
    for (const [x, y] of ps.cel) E.grille[x + ',' + y] = ps.id;
  }
  // Portes (paires) — les secrets n'ont que des portes secrètes
  for (const ps of plan.salles) {
    const s = E.salles[ps.id];
    for (const [x, y] of ps.cel) for (const d of DIR_LISTE) {
      const [dx, dy] = DIRS[d]; const k = (x + dx) + ',' + (y + dy);
      if (!(k in E.grille)) continue; const autre = E.salles[E.grille[k]]; if (autre.id === s.id) continue;
      const estSecret = s.type === 'cache' || s.type === 'isolee' || autre.type === 'cache' || autre.type === 'isolee';
      if (estSecret) {
        const sec = s.type === 'cache' || s.type === 'isolee' ? ps : plan.salles[autre.id];
        if (!(sec.liens || []).includes(s.type === 'cache' || s.type === 'isolee' ? autre.id : s.id)) continue;
      } else if (!plan.adj[s.id].has(autre.id)) continue;
      const i = x - s.cx, j = y - s.cy;
      const type = estSecret ? (s.type === 'isolee' || autre.type === 'isolee' ? 'isolee' : 'cache') : typePorte(s, autre);
      let etat = 'ouverte';
      if (estSecret) etat = (s.type === 'cache' || s.type === 'isolee') ? 'ouverte' : 'secrete';
      else if ((autre.type === 'heritage' || autre.type === 'boutique' || autre.type === 'bibliotheque' || autre.type === 'coffres' || autre.type === 'repos') && numero >= (cfg.verrouDes || 2)) etat = 'verrouillee';
      else if (autre.type === 'malediction' || s.type === 'malediction') etat = 'ouverte';
      else if (autre.type === 'defi' || autre.type === 'defi_boss') etat = 'conditionnelle';
      else if (autre.type === 'dispositifs' && numero >= 2) etat = 'ouverte';
      ajouterPorte(s, i, j, d, autre.id, type, etat);
    }
  }
  // Gabarits
  for (const s of Object.values(E.salles)) choisirGabarit(E, s, alSalles, cfg);
  return E;
}

// Choix d'un gabarit compatible (type, forme, portes), sans répétition inutile dans l'étage
function choisirGabarit(E, s, alea, cfg) {
  const dirsPortes = new Set(s.portes.map(p => p.dir + (s.forme === '1x1' ? '' : ':' + p.i + ',' + p.j)));
  const typeGab = s.type === 'depart' ? 'depart' : s.type;
  const deja = E._gabUtilises || (E._gabUtilises = new Set());
  let cands = DON.salles.filter(g => g.type === typeGab && (g.forme || '1x1') === s.forme
    && (!g.etages || (E.numero >= g.etages[0] && E.numero <= g.etages[1]))
    && (!g.themes || g.themes.includes(cfg.theme))
    && (!g.portes || [...dirsPortes].every(d => g.portes.includes(d.split(':')[0]))));
  // les couloirs étroits exigent exactement leurs portes
  if (!cands.length) cands = DON.salles.filter(g => g.type === typeGab && (g.forme || '1x1') === s.forme && !g.portes);
  if (!cands.length) cands = DON.salles.filter(g => g.type === 'combat' && (g.forme || '1x1') === s.forme && !g.portes);
  const frais = cands.filter(g => !deja.has(g.id));
  const g = alea.pondere(frais.length ? frais : cands, x => (x.poids || 1) * (x.themes ? 2 : 1));
  if (!g) throw new Error('Aucun gabarit pour ' + s.type + ' ' + s.forme);
  deja.add(g.id);
  appliquerGabarit(s, g, alea);
  s.titre = g.nom;
}
