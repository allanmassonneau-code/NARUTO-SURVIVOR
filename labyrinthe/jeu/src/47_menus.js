// ═══════════════════════════════════════════════════════════════════════════
// Menus entièrement jouables à la manette : focus visible, ordre explicite,
// répétition contrôlée, entrées consommées à chaque changement de contexte.
// ═══════════════════════════════════════════════════════════════════════════

const Scenes = {
  pile: [],
  aller(s, o) { this.pile = [s]; Entrees.consommer(); s.entrer && s.entrer(o); },
  empiler(s, o) { this.pile.push(s); Entrees.consommer(); s.entrer && s.entrer(o); },
  depiler() { const s = this.pile.pop(); s && s.sortir && s.sortir(); Entrees.consommer(); },
  courante() { return this.pile[this.pile.length - 1]; },
  maj(dt) { const s = this.courante(); if (s) s.maj(dt); },
  rendre(g) { for (const s of this.pile) if (s.rendre) s.rendre(g, s === this.courante()); },
};

// ── Liste de menu générique ──
function menuListe(items, o = {}) {
  return { items, focus: Math.max(0, items.findIndex(i => !i.cache && !i.inactif)), o,
    maj() {
      const it = this.items.filter(i => !i.cache); if (!it.length) return;
      if (Entrees.nav.dy) { let k = this.focus; do { k = (k + Entrees.nav.dy + this.items.length) % this.items.length; } while (this.items[k].cache || this.items[k].inactif); this.focus = k; Son.jouer('menu'); }
      const cur = this.items[this.focus];
      if (Entrees.nav.dx && (cur.type === 'curseur' || cur.type === 'choix' || cur.type === 'bascule')) { cur.changer(Entrees.nav.dx); Son.jouer('menu'); }
      if (Entrees.menuConfirmer()) { if (cur.type === 'bascule') { cur.changer(1); Son.jouer('valider'); } else if (cur.action) { Son.jouer('valider'); cur.action(); } }
    },
    rendre(g, x, y, largeur, actif = true) {
      let yy = y;
      // liste longue : fenêtre de « visibles » éléments qui suit le focus, flèches aux bords
      let L = this.items.map((it, i) => i).filter(i => !this.items[i].cache); const n = this.o.visibles;
      if (n && L.length > n) {
        const p = Math.max(0, L.indexOf(this.focus)); this.debut = this.debut || 0;
        if (p < this.debut) this.debut = p; if (p >= this.debut + n) this.debut = p - n + 1; this.debut = Math.max(0, Math.min(this.debut, L.length - n));
        const haut = this.debut > 0, bas = this.debut + n < L.length; L = L.slice(this.debut, this.debut + n);
        if (haut) losange(g, x + largeur / 2, y - 9, '#c8a060', 2); if (bas) losange(g, x + largeur / 2, y + n * 14 + 1, '#c8a060', 2);
      }
      L.forEach(i => {
        const it = this.items[i];
        if (it.entete) { yy += 3; Police.ecrire(g, it.label, x, yy, '#d8b070'); const w = Police.largeur(it.label); g.fillStyle = '#4a3a2c'; g.fillRect(x + w + 6, yy + 4, largeur - w - 6, 1); losange(g, x + largeur, yy + 4, '#8a6a40', 1); yy += 13; return; }
        const f = i === this.focus && actif; const h = it.hauteur || 14;
        if (f) { const gr = g.createLinearGradient(x - 6, 0, x + largeur + 6, 0); gr.addColorStop(0, 'rgba(240,190,100,0.3)'); gr.addColorStop(1, 'rgba(240,190,100,0.03)'); g.fillStyle = gr; g.fillRect(x - 6, yy - 3, largeur + 12, h); g.fillStyle = '#f0c870'; g.fillRect(x - 6, yy - 3, 2, h); losange(g, x - 11, yy + 3, '#ffe0a0', 2); }
        const col = it.inactif ? '#5a5268' : f ? '#fff4d8' : '#c8c0d8';
        Police.ecrire(g, it.label, x, yy, col);
        if (it.valeur) { const v = it.valeur(); Police.ecrire(g, (it.type !== 'bouton' && f ? '< ' : '') + v + (it.type !== 'bouton' && f ? ' >' : ''), x + largeur, yy, f ? '#ffe0a0' : '#a8a0b8', { a: 'd' }); }
        yy += h;
      });
      const cur = this.items[this.focus]; if (cur && cur.aide && actif) Police.paragraphe(g, cur.aide, x, yy + 8, largeur, '#8a8098');
    },
  };
}
function curseur(label, get, set, min, max, pas, fmt) { return { label, type: 'curseur', valeur: () => fmt ? fmt(get()) : Math.round(get() * 100) + ' %', changer: d => { set(arrondi(borne(get() + d * pas, min, max), 3)); } }; }
function bascule(label, get, set, aide) { return { label, type: 'bascule', aide, valeur: () => get() ? 'Oui' : 'Non', changer: () => set(!get()) }; }
function choix(label, options, get, set, aide) { return { label, type: 'choix', aide, valeur: () => (options.find(o => o[0] === get()) || options[0])[1], changer: d => { const i = options.findIndex(o => o[0] === get()); set(options[(i + d + options.length) % options.length][0]); } }; }
// Cadre de menu : ombre portée, fond dégradé, double liseré doré, coins sertis
function cadreMenu(g, x, y, l, h, titre) {
  g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(x + 3, y + 4, l, h);
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, 'rgba(30,20,40,0.95)'); gr.addColorStop(1, 'rgba(10,7,15,0.95)'); g.fillStyle = gr; g.fillRect(x, y, l, h);
  g.fillStyle = '#8a6a3a'; g.fillRect(x, y, l, 1); g.fillRect(x, y + h - 1, l, 1); g.fillRect(x, y, 1, h); g.fillRect(x + l - 1, y, 1, h);
  g.fillStyle = '#3a2c46'; g.fillRect(x + 2, y + 2, l - 4, 1); g.fillRect(x + 2, y + h - 3, l - 4, 1); g.fillRect(x + 2, y + 2, 1, h - 4); g.fillRect(x + l - 3, y + 2, 1, h - 4);
  g.fillStyle = 'rgba(255,230,190,0.07)'; g.fillRect(x + 3, y + 3, l - 6, 1);
  for (const [cx, cy] of [[x, y], [x + l - 1, y], [x, y + h - 1], [x + l - 1, y + h - 1]]) losange(g, cx, cy, '#e0c080', 2);
  if (titre) { Police.ecrire(g, titre, x + l / 2, y + 8, '#f0d8a0', { a: 'c', e: 2, contour: '#1c1420' }); const w = Police.largeur(titre) * 2; for (const sgn of [-1, 1]) { const cx = x + l / 2 + sgn * (w / 2 + 12); losange(g, cx, y + 16, '#c8a060', 2); g.fillStyle = '#6a5030'; g.fillRect(sgn < 0 ? cx - 22 : cx + 4, y + 16, 18, 1); } }
}
function aideBoutons(g, L) { let x = 630; for (let i = L.length - 1; i >= 0; i--) { const [act, txt] = L[i]; const s = (act === 'retour' && Entrees.dernierPeripherique !== 'manette' ? 'Échap' : Entrees.libelle(act)) + ' ' + txt; const w = Police.largeur(s); Police.ecrire(g, s, x, 346, '#a898b8', { a: 'd' }); x -= w + 14; } }

// ── Titre ──
const SceneTitre = {
  entrer() {
    const susp = partieSuspendue();
    this.menu = menuListe([
      { label: 'Continuer la partie', action: () => { const s = partieSuspendue(); if (s) { try { reprendrePartie(s); Scenes.aller(SceneJeu); } catch (e) { console.error(e); effacerPartieSuspendue(); this.entrer(); } } }, cache: !susp },
      { label: 'Nouvelle partie', action: () => Scenes.empiler(SceneSelection, {}) },
      { label: 'Défis', action: () => Scenes.empiler(SceneDefis) },
      { label: 'Mission à code', action: () => Scenes.empiler(SceneCode) },
      { label: 'Registre des missions', action: () => Scenes.empiler(SceneRegistre) },
      { label: 'Options', action: () => Scenes.empiler(SceneOptions) },
    ]);
    if (!susp) this.menu.focus = 1;
    Musique.jouerPiste('titre', { gamme: 'in', racine: 50, tempo: 70, timbre: 'flute' }); Musique.etatCombat(false);
  },
  maj(dt) { this.t = (this.t || 0) + dt; this.menu.maj(); },
  rendre(g) {
    const t = this.t || 0; g.drawImage(fondTitre(), 0, 0); animerFond(g, t);
    // sceau tournant (original), en lueur additive derrière le menu
    g.save(); g.globalCompositeOperation = 'lighter'; g.translate(320, 168); g.rotate(t * 0.12); g.globalAlpha = 0.14;
    for (let r = 70; r <= 190; r += 40) g.drawImage(anneau(r, 1, '#f09a4a'), -r - 1, -r - 1);
    for (let i = 0; i < 12; i++) { g.rotate(Math.PI / 6); g.fillStyle = '#f09a4a'; g.fillRect(176, -2, 12, 4); g.fillRect(150, -1, 4, 2); }
    g.restore();
    // logo et titre
    const L = logoTitre(); g.save(); g.globalCompositeOperation = 'lighter'; g.imageSmoothingEnabled = true; g.globalAlpha = 0.28 + 0.08 * Math.sin(t * 1.6); g.drawImage(halo('#ff8a30'), 320 - 180, -6, 360, 100); g.restore();
    g.drawImage(L, Math.round(320 - L.width / 2), 6);
    titreOrne(g, 'LE LABYRINTHE DES SCEAUX', 320, 76, '#f8eedc');
    Police.ecrire(g, 'Projet créatif non officiel — ressources originales', 320, 102, '#b8a8c8', { a: 'c' });
    const ordre = ['naruto', 'sasuke', 'sakura', 'kakashi', 'lee', 'gaara'];
    ordre.forEach((k, i) => { const x = 150 + i * 68; g.drawImage(ellipse(10, 3, 'rgba(0,0,0,0.55)'), x - 10, 329); dessinerPerso(g, k, x, 330, { dirCorps: 'bas', frame: Math.floor(t * 4 + i) % 4, etatTete: Math.floor(t * 0.7 + i) % 7 === 0 ? 'cligne' : 'normal' }); });
    cadreMenu(g, 230, 124, 180, 112);
    this.menu.rendre(g, 246, 136, 148);
    if (Son.suspendu()) { inviteSon(g, 320, 240); Police.ecrire(g, 'Les navigateurs ne comptent pas la manette pour autoriser le son : un seul clic suffit.', 320, 260, '#c8b8a8', { a: 'c', contour: '#1c1420' }); }
    aideBoutons(g, [['interagir', 'Valider'], ['retour', 'Retour']]);
    Police.ecrire(g, 'v' + VERSION_JEU, 6, 346, '#7a7088');
  },
};

// ── Sélection du personnage (carrousel, variante, difficulté) ──
const SceneSelection = {
  entrer(o) { this.o = o || {}; this.bases = DON.personnages.filter(p => !p.variante); this.i = 0; this.variante = false; this.difficile = false; this.t = 0; },
  perso() { const b = this.bases[this.i]; if (!this.variante) return b; return DON.personnages.find(p => p.parent === b.id) || b; },
  maj(dt) {
    this.t += dt;
    if (Entrees.nav.dx) { this.i = (this.i + Entrees.nav.dx + this.bases.length) % this.bases.length; Son.jouer('menu'); if (this.variante && !DON.personnages.find(p => p.parent === this.bases[this.i].id)) this.variante = false; }
    if (Entrees.nav.dy) { if (DON.personnages.find(p => p.parent === this.bases[this.i].id)) { this.variante = !this.variante; Son.jouer('menu'); } }
    if (Entrees.vientEnfonce('description')) { this.difficile = !this.difficile; Son.jouer('menu'); }
    if (Entrees.menuRetour()) { Son.jouer('annuler'); Scenes.depiler(); return; }
    if (Entrees.menuConfirmer()) {
      const p = this.perso(); if (!Progression.estDebloque(p.id)) { Son.jouer('refus'); return; }
      Son.jouer('valider'); effacerPartieSuspendue();
      nouvellePartie({ perso: p.id, difficile: this.difficile, code: this.o.code, graineSaisie: !!this.o.code, defi: this.o.defi });
      Scenes.aller(SceneJeu);
    }
  },
  rendre(g) {
    fondMenu(g);
    const p = this.perso(); const ok = Progression.estDebloque(p.id);
    Police.ecrire(g, 'Choisissez votre shinobi', 320, 14, '#f0d8a0', { a: 'c', e: 2, contour: '#1c1420' });
    // carrousel
    for (let k = -3; k <= 3; k++) {
      const j = (this.i + k + this.bases.length * 3) % this.bases.length; const b = this.bases[j]; const x = 320 + k * 70, y = 120;
      const deb = Progression.estDebloque(b.id);
      if (k === 0) { g.save(); g.globalCompositeOperation = 'lighter'; g.imageSmoothingEnabled = true; g.globalAlpha = 0.35; g.drawImage(halo('#ffc070'), x - 50, y - 70, 100, 100); g.restore(); g.drawImage(ellipse(22, 6, '#2a2034'), x - 22, y - 4); g.drawImage(ellipse(20, 5, '#4a3c58'), x - 20, y - 4); g.fillStyle = '#6a5a7a'; g.fillRect(x - 14, y - 4, 28, 1); }
      else g.drawImage(ellipse(12, 3, 'rgba(0,0,0,0.45)'), x - 12, y - 2);
      g.globalAlpha = k === 0 ? 1 : 0.55;
      if (deb) dessinerPerso(g, b.cle, x, y, { dirCorps: 'bas', frame: k === 0 ? Math.floor(this.t * 5) % 4 : 0 });
      else { const S = spritesPerso(b.cle); g.drawImage(silhouette(S.corps.face[0], '#2a2236'), x - 7, y - 11); g.drawImage(silhouette(S.tetes.face.normal, '#2a2236'), x - 13, y - 32); Police.ecrire(g, '?', x, y - 22, '#6a5a7a', { a: 'c', e: 2 }); }
      g.globalAlpha = 1;
    }
    const x0 = 60, y0 = 150; cadreMenu(g, x0 - 10, y0 - 6, 540, 168);
    Police.ecrire(g, ok ? p.nom : '???', x0, y0, '#fff0d0', { e: 2 });
    if (p.variante || DON.personnages.find(v => v.parent === this.bases[this.i].id)) Police.ecrire(g, this.variante ? '▲▼ Variante altérée' : '▲▼ Version de base (variante disponible)', 582, y0 + 2, this.variante ? '#d0a0ff' : '#8a8098', { a: 'd' });
    if (!ok) {
      const liste = Progression.verrous[p.id] || []; const o = DON.objectifs.find(x => liste.includes(x.id));
      Police.paragraphe(g, 'Verrouillé. Mission : ' + (o ? o.nom + ' — ' + o.desc : '?'), x0, y0 + 28, 520, '#c09080');
    } else {
      const S = p.stats; let hx = x0; // santé de départ en cœurs
      for (let k = 0; k < (p.sante.vitalite || 0); k++) { g.drawImage(ICONES.vit[2], hx, y0 + 22); hx += 10; }
      for (let k = 0; k < (p.sante.protection || 0); k++) { g.drawImage(ICONES.bleu[2], hx, y0 + 22); hx += 10; }
      for (let k = 0; k < Math.ceil((p.sante.instable || 0) / 2); k++) { g.drawImage(ICONES.noir[2], hx, y0 + 22); hx += 10; }
      if (!(p.sante.vitalite || p.sante.protection || p.sante.instable)) Police.ecrire(g, 'Aucune vitalité', x0, y0 + 24, '#c09080');
      [['degats', S.degats], ['cadence', S.cadence], ['portee', S.portee], ['vitesseTir', S.vitesseTir ?? 9], ['vitesse', S.vitesse], ['chance', S.chance]].forEach(([k, v], i) => { const cx = x0 + (i % 2) * 92, cy = y0 + 38 + Math.floor(i / 2) * 12; g.drawImage(pictoHUD(k), cx - 1, cy - 1); Police.ecrire(g, { degats: 'Dégâts', cadence: 'Cadence', portee: 'Portée', vitesseTir: 'Tirs', vitesse: 'Vitesse', chance: 'Chance' }[k], cx + 11, cy, '#8a8098'); Police.ecrire(g, formatNombre(arrondi(v, 2)), cx + 86, cy, '#f0e8f8', { a: 'd' }); });
      if (p.actif && INDEX[p.actif]) { ecrinHUD(g, x0, y0 + 78, 24, null); g.drawImage(iconeObjet(p.actif), x0 + 2, y0 + 80); Police.ecrire(g, INDEX[p.actif].nom, x0 + 30, y0 + 80, '#f0dca0'); Police.ecrire(g, 'Technique de départ', x0 + 30, y0 + 91, '#7a90b8'); }
      const xd = x0 + 196, wd = 330;
      const hr = Police.paragraphe(g, p.regle, xd, y0 + 24, wd, '#d8d0e8');
      Police.paragraphe(g, 'Faiblesse : ' + p.faiblesse, xd, y0 + 28 + hr, wd, '#c0a0a0');
      Police.ecrire(g, 'Difficulté ' + ['', 'accessible', 'intermédiaire', 'expert'][p.difficulte || 1], xd, y0 + 84, '#a8a0b8');
      const M = Progression.profil.marques[p.id] || {}; let mx = xd + 130;
      for (const r of ['RTE_01', 'RTE_02', 'RTE_03', 'RTE_04', 'RTE_05', 'RTE_06']) { g.fillStyle = '#0c0810'; g.fillRect(mx - 1, y0 + 83, 10, 10); g.fillStyle = M[r] ? (M[r] === 'difficile' ? '#f0c040' : '#c8c0d8') : '#2a2436'; g.fillRect(mx, y0 + 84, 8, 8); mx += 12; }
      Police.ecrire(g, 'Marques', mx + 3, y0 + 84, '#8a8098');
      const V = DON.eveils.filter(v => v.perso === p.id).sort((a, b) => a.rang - b.rang); // éveils : ce que la règle deviendra
      V.forEach((v, k) => { const ey = y0 + 100 + k * 26; ecrinHUD(g, xd, ey, 22, '#9a7ac8'); g.drawImage(iconeObjet(v.id), xd + 1, ey + 1); Police.ecrire(g, 'Éveil ' + (v.rang === 1 ? 'I' : 'II') + ' · ' + v.nom, xd + 28, ey + 2, '#e0c070'); Police.ecrire(g, v.rang === 1 ? 'après le boss de l’étage 3' : 'après le boss de l’étage 6', xd + 28, ey + 13, '#8a8098'); });
    }
    Police.ecrire(g, 'Mode : ' + (this.difficile ? 'Difficile' : 'Standard') + (this.o.code ? '   Code : ' + codeAffiche(this.o.code) + ' (sans déblocages)' : ''), 320, 326, this.difficile ? '#ff9a7a' : '#a8a0b8', { a: 'c' });
    aideBoutons(g, [['description', 'Difficulté'], ['interagir', 'Commencer'], ['retour', 'Retour']]);
  },
};

// ── Saisie d'un code de mission à la manette (grille) ──
const SceneCode = {
  entrer() { this.code = ''; this.x = 0; this.y = 0; this.cols = 8; },
  maj() {
    const n = ALPHABET_CODE.length + 2; const rows = Math.ceil(n / this.cols);
    if (Entrees.nav.dx) { this.x = (this.x + Entrees.nav.dx + this.cols) % this.cols; Son.jouer('menu'); }
    if (Entrees.nav.dy) { this.y = (this.y + Entrees.nav.dy + rows) % rows; Son.jouer('menu'); }
    const k = this.y * this.cols + this.x;
    if (Entrees.menuConfirmer()) {
      if (k < ALPHABET_CODE.length) { if (this.code.length < 8) { this.code += ALPHABET_CODE[k]; Son.jouer('valider'); } }
      else if (k === ALPHABET_CODE.length) { this.code = this.code.slice(0, -1); Son.jouer('annuler'); }
      else if (codeValide(this.code)) { Son.jouer('valider'); Scenes.depiler(); Scenes.empiler(SceneSelection, { code: this.code }); }
      else Son.jouer('refus');
    }
    if (Entrees.menuRetour()) { if (this.code.length) { this.code = this.code.slice(0, -1); Son.jouer('annuler'); } else { Scenes.depiler(); } }
    for (const c of Entrees.touches) { if (c.startsWith('Key') || c.startsWith('Digit')) { const ch = c.slice(c.startsWith('Key') ? 3 : 5); if (ALPHABET_CODE.includes(ch) && this.code.length < 8 && !Entrees.touchesAvant.has(c)) { this.code += ch; Son.jouer('menu'); } } }
  },
  rendre(g) {
    fondMenu(g);
    Police.ecrire(g, 'Mission à code', 320, 20, '#f0d8a0', { a: 'c', e: 2, contour: '#1c1420' });
    Police.couper('Un code reproduit les étages et le butin d’une même version des données. Les parties à code saisi n’ouvrent pas de déblocages.', 520).forEach((l, i) => Police.ecrire(g, l, 320, 42 + i * 11, '#8a8098', { a: 'c' }));
    for (let i = 0; i < 8; i++) { const x = 220 + i * 26; g.fillStyle = '#2a2236'; g.fillRect(x, 70, 20, 24); if (this.code[i]) Police.ecrire(g, this.code[i], x + 10, 76, '#fff0d0', { a: 'c', e: 2 }); if (i === 3) g.fillRect(x + 22, 80, 2, 2); }
    const L = ALPHABET_CODE.split('').concat(['←', 'OK']);
    L.forEach((c, k) => { const x = 180 + (k % this.cols) * 36, y = 120 + Math.floor(k / this.cols) * 30; const f = k === this.y * this.cols + this.x; g.fillStyle = f ? '#f0c870' : '#2a2236'; g.fillRect(x, y, 30, 24); Police.ecrire(g, c, x + 15, y + 6, f ? '#1c1420' : '#e8e0f0', { a: 'c', e: c.length > 1 ? 1 : 2, ombre: null }); });
    aideBoutons(g, [['interagir', 'Choisir'], ['retour', 'Effacer / retour']]);
  },
};

// ── Défis ──
const SceneDefis = {
  entrer() {
    this.menu = menuListe(DON.defis.map(d => ({ label: (Progression.profil.defis[d.id] ? '✓ ' : '') + d.nom, aide: d.desc + (d.recompenseTexte ? ' — Récompense : ' + d.recompenseTexte : ''), inactif: !Progression.estDebloque(d.id), action: () => { if (!Progression.estDebloque(d.id)) { Son.jouer('refus'); return; } Scenes.depiler(); if (d.perso) { Son.jouer('valider'); effacerPartieSuspendue(); nouvellePartie({ perso: d.perso, defi: d.id }); Scenes.aller(SceneJeu); } else Scenes.empiler(SceneSelection, { defi: d.id }); } })), { visibles: 14 });
  },
  maj() { this.menu.maj(); if (Entrees.menuRetour()) { Son.jouer('annuler'); Scenes.depiler(); } },
  rendre(g) { fondMenu(g); cadreMenu(g, 80, 10, 480, 330, 'Contrats de mission (défis) — ' + DON.defis.filter(d => Progression.profil.defis[d.id]).length + ' / ' + DON.defis.length); this.menu.rendre(g, 100, 44, 440); aideBoutons(g, [['interagir', 'Choisir'], ['retour', 'Retour']]); },
};

// ── Options (réglages séparés du profil et de la partie) ──
const SceneOptions = {
  entrer(o) {
    const R = G.reglages; const maj = () => { Son.appliquerVolumes(); Rendu.ajuster(); sauverReglages(); };
    this.menu = menuListe([
      { label: 'Son', entete: true, inactif: true },
      curseur('Volume général', () => R.volGeneral ?? 0.8, v => { R.volGeneral = v; maj(); }, 0, 1, 0.1),
      curseur('Musique', () => R.volMusique, v => { R.volMusique = v; maj(); }, 0, 1, 0.1),
      curseur('Effets sonores', () => R.volEffets, v => { R.volEffets = v; maj(); }, 0, 1, 0.1),
      { label: 'Ressenti et image', entete: true, inactif: true },
      curseur('Vibrations', () => R.vibrations, v => { R.vibrations = v; maj(); }, 0, 1, 0.1),
      curseur('Secousses d’écran', () => R.secousses, v => { R.secousses = v; maj(); }, 0, 1, 0.1),
      bascule('Sans flash', () => R.sansFlash, v => { R.sansFlash = v; maj(); }, 'Supprime flashs blancs et clignotements ; les télégraphes restent visibles.'),
      bascule('Mode confort', () => R.confort, v => { R.confort = v; maj(); }, 'Animations plus courtes, moins de particules, sans ralenti décoratif.'),
      bascule('Éclairage dynamique', () => R.eclairage !== false, v => { R.eclairage = v; maj(); }, 'Lumières, halos et poussières d’ambiance (décoratifs). À couper sur une machine modeste.'),
      { label: 'Manette', entete: true, inactif: true },
      curseur('Zone morte stick gauche', () => R.zoneMorteG, v => { R.zoneMorteG = v; maj(); }, 0.05, 0.4, 0.01, v => formatNombre(v)),
      curseur('Zone morte stick droit', () => R.zoneMorteD, v => { R.zoneMorteD = v; maj(); }, 0.05, 0.4, 0.01, v => formatNombre(v)),
      curseur('Courbe du déplacement', () => R.courbeG, v => { R.courbeG = v; maj(); }, 0.6, 2, 0.1, v => formatNombre(v)),
      curseur('Seuil de visée', () => R.seuilVisee, v => { R.seuilVisee = v; if (R.seuilRepos > v - 0.05) R.seuilRepos = arrondi(v - 0.1, 2); maj(); }, 0.25, 0.9, 0.05, v => formatNombre(v)),
      curseur('Hystérésis diagonale', () => R.hysteresisAngle, v => { R.hysteresisAngle = v; maj(); }, 0, 25, 1, v => v + '°'),
      choix('Profil de tir', [['stick+boutons', 'Stick + boutons (Isaac)'], ['stick+croix', 'Stick droit + croix'], ['stick', 'Stick droit'], ['croix', 'Croix directionnelle']], () => R.profilTir, v => { R.profilTir = v; maj(); }, 'Boutons : en jeu, les quatre boutons de face tirent comme dans Isaac ; interagir, description et déposer passent sur la croix. Les menus ne changent pas.'),
      { label: 'Jeu et affichage', entete: true, inactif: true },
      bascule('Descriptions automatiques', () => R.descriptionsAuto !== false, v => { R.descriptionsAuto = v; maj(); }, 'Comme le mod « External Item Descriptions » d’Isaac : la fiche d’un objet proche s’affiche d’elle-même. Sinon, maintenir le bouton Description.'),
      bascule('Tir chargé automatique', () => R.chargeAuto, v => { R.chargeAuto = v; maj(); }, 'À pleine charge, l’attaque part seule tant que la visée est maintenue (même cycle minimal).'),
      bascule('Statistiques à l’écran', () => R.afficherStats, v => { R.afficherStats = v; maj(); }),
      bascule('Chiffres de dégâts', () => R.chiffresDegats, v => { R.chiffresDegats = v; maj(); }),
      choix('Mise à l’échelle', [['entiere', 'Entière (nette)'], ['ajustee', 'Ajustée à l’écran']], () => R.echelle, v => { R.echelle = v; maj(); }),
      { label: 'Autres réglages', entete: true, inactif: true },
      { label: 'Commandes…', action: () => Scenes.empiler(SceneCommandes) },
      { label: 'Plein écran', action: () => { try { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); } catch (e) { /* refusé */ } } },
      { label: 'Profil…', action: () => Scenes.empiler(SceneProfil) },
    ], { visibles: 17 });
  },
  maj() { this.menu.maj(); if (Entrees.menuRetour()) { Son.jouer('annuler'); Scenes.depiler(); } },
  rendre(g, actif) { if (Scenes.pile[0] === SceneJeu) { g.fillStyle = 'rgba(6,4,10,0.6)'; g.fillRect(0, 0, ECRAN_L, ECRAN_H); } else fondMenu(g); cadreMenu(g, 110, 6, 420, 334, 'Options'); this.menu.rendre(g, 130, 34, 380, actif); aideBoutons(g, [['interagir', 'Modifier'], ['retour', 'Retour']]); },
};
const SceneProfil = {
  entrer() { const P = Progression.profil; this.menu = menuListe([
    bascule('Tout débloquer (profil de démonstration)', () => P.toutDebloque, v => { P.toutDebloque = v; Progression.sauver(); }, 'Ouvre personnages, objets et routes sans remplir les missions. Les marques restent à obtenir.'),
    { label: 'Réinitialiser le profil', action: () => { if (this.confirme) { Stockage.effacer(CLES.profil); Progression.charger(); this.confirme = false; Son.jouer('annuler'); } else { this.confirme = true; Son.jouer('telegraphe'); } }, valeur: () => this.confirme ? 'Confirmer ?' : '' },
  ]); this.confirme = false; },
  maj() { this.menu.maj(); if (Entrees.menuRetour()) Scenes.depiler(); },
  rendre(g, actif) { fondMenu(g); cadreMenu(g, 110, 60, 420, 200, 'Profil'); this.menu.rendre(g, 130, 90, 380, actif); const P = Progression.profil; Police.paragraphe(g, 'Parties : ' + P.parties + ' · Victoires : ' + P.victoires + ' · Missions : ' + Object.keys(P.objectifs).length + '/' + DON.objectifs.length + ' · Dons : ' + P.dons + ' Ryō', 130, 200, 380, '#8a8098'); },
};
// Remappage par actions logiques (manette et clavier), détection des conflits
const SceneCommandes = {
  entrer() { this.i = 0; this.attente = null; this.actions = ACTIONS_JEU.concat(['haut', 'bas', 'gauche', 'droite', 'tirHaut', 'tirBas', 'tirGauche', 'tirDroite']); },
  maj() {
    const R = G.reglages;
    if (this.attente) {
      if (this.attente.periph === 'manette') { for (let b = 0; b < 16; b++) if (Entrees.bouton(b) && !Entrees.boutonAvant(b)) { if ([BTN.CR_HAUT, BTN.CR_BAS, BTN.CR_GAUCHE, BTN.CR_DROITE].includes(b) && R.profilTir.includes('croix')) { Son.jouer('refus'); return; } R.liaisons.manette[this.attente.a] = [b]; this.resoudreConflits('manette', this.attente.a, b); this.attente = null; sauverReglages(); Son.jouer('valider'); Entrees.consommer(); return; } }
      return;
    }
    if (Entrees.nav.dy) { this.i = (this.i + Entrees.nav.dy + this.actions.length) % this.actions.length; Son.jouer('menu'); }
    if (Entrees.menuConfirmer()) {
      const a = this.actions[this.i];
      if (Entrees.dernierPeripherique === 'manette' && ACTIONS_JEU.includes(a)) { this.attente = { a, periph: 'manette' }; Son.jouer('menu'); }
      else { this.attente = { a, periph: 'clavier' }; Entrees.captureTouche = code => { R.liaisons.clavier[a] = [code]; this.resoudreConflits('clavier', a, code); this.attente = null; sauverReglages(); Son.jouer('valider'); }; }
    }
    if (Entrees.vientEnfonce('description')) { R.liaisons = { manette: {}, clavier: {} }; sauverReglages(); Son.jouer('annuler'); }
    if (Entrees.menuRetour() && !this.attente) Scenes.depiler();
  },
  resoudreConflits(periph, a, v) { const R = G.reglages; for (const b of this.actions) { if (b === a) continue; const L = periph === 'manette' ? Entrees.liaisonsManette(b) : Entrees.liaisonsClavier(b); if (L.includes(v)) { R.liaisons[periph][b] = periph === 'manette' ? LIAISONS_DEFAUT.manette[a] || [] : LIAISONS_DEFAUT.clavier[a] || []; } } },
  rendre(g) {
    fondMenu(g); cadreMenu(g, 80, 6, 480, 334, 'Commandes');
    this.actions.forEach((a, k) => { const y = 34 + k * 14; const f = k === this.i; if (f) { g.fillStyle = 'rgba(240,200,120,0.14)'; g.fillRect(94, y - 3, 452, 14); }
      Police.ecrire(g, NOMS_ACTIONS[a], 100, y, f ? '#fff4d8' : '#c8c0d8');
      const m = ACTIONS_JEU.includes(a) ? Entrees.liaisonsManette(a, true).map(b => Entrees.nomBouton(b)).join(', ') : (a.startsWith('tir') ? Entrees.libelleTirManette({ tirHaut: 'haut', tirBas: 'bas', tirGauche: 'gauche', tirDroite: 'droite' }[a]) : 'Stick gauche');
      Police.ecrire(g, m, 420, y, '#a8a0b8', { a: 'd' }); Police.ecrire(g, Entrees.liaisonsClavier(a).map(c => Entrees.nomTouche(c)).join(', '), 540, y, '#a8a0b8', { a: 'd' }); });
    if (this.attente) Police.ecrire(g, 'Appuyez sur ' + (this.attente.periph === 'manette' ? 'un bouton de la manette' : 'une touche') + ' pour « ' + NOMS_ACTIONS[this.attente.a] + ' »', 320, 322, '#ffe0a0', { a: 'c' });
    aideBoutons(g, [['interagir', 'Réassigner'], ['description', 'Défaut'], ['retour', 'Retour']]);
  },
};

// ── Registre : marques, collection, missions ──
const SceneRegistre = {
  entrer() { this.onglet = 0; this.i = 0; },
  maj() {
    if (Entrees.nav.dx) { this.onglet = (this.onglet + Entrees.nav.dx + 5) % 5; this.i = 0; Son.jouer('menu'); }
    if (Entrees.nav.dy) { this.i = Math.max(0, this.i + Entrees.nav.dy * (this.onglet === 1 ? 14 : 1)); Son.jouer('menu'); }
    if (Entrees.menuRetour()) Scenes.depiler();
  },
  rendre(g) {
    fondMenu(g); cadreMenu(g, 14, 26, 612, 312);
    const titres = ['Marques', 'Collection', 'Missions', 'Secrets', 'Synergies']; titres.forEach((t, k) => { const x = 80 + k * 120, sel = k === this.onglet; Police.ecrire(g, t, x, 10, sel ? '#ffe0a0' : '#8a8098', { a: 'c' }); if (sel) { const w = Police.largeur(t); losange(g, x - w / 2 - 8, 14, '#e0b870', 2); losange(g, x + w / 2 + 7, 14, '#e0b870', 2); g.fillStyle = '#c8a060'; g.fillRect(x - w / 2, 21, w, 1); } });
    const P = Progression.profil;
    if (this.onglet === 0) {
      const L = DON.personnages; const deb = Math.min(this.i, Math.max(0, L.length - 18));
      L.slice(deb, deb + 18).forEach((p, k) => { const y = 40 + k * 16; const ok = Progression.estDebloque(p.id); Police.ecrire(g, ok ? p.nom : '???', 40, y, ok ? '#e8e0f0' : '#5a5268'); const M = P.marques[p.id] || {}; ['RTE_01', 'RTE_02', 'RTE_03', 'RTE_04', 'RTE_05', 'RTE_06'].forEach((r, i) => { g.fillStyle = M[r] ? (M[r] === 'difficile' ? '#f0c040' : '#c8c0d8') : '#2a2436'; g.fillRect(292 + i * 46, y, 11, 9); }); });
      ['Fin 1', 'Fin 2', 'Lumière', 'Ombre', 'Conseil', 'Brèche'].forEach((t, i) => Police.ecrire(g, t, 297 + i * 46, 29, '#a898b8', { a: 'c' }));
    } else if (this.onglet === 1) {
      const L = DON.objets.concat(DON.talismans); const cols = 14; const deb = Math.floor(Math.min(this.i, L.length - 1) / cols) * cols; const vis = L.slice(Math.max(0, deb - cols * 3), Math.max(0, deb - cols * 3) + cols * 12);
      vis.forEach((o, k) => { const x = 40 + (k % cols) * 40, y = 34 + Math.floor(k / cols) * 24; const conn = P.decouverts.includes(o.id); const vu = P.vus.includes(o.id); if (conn) g.drawImage(iconeObjet(o.id), x, y); else { g.fillStyle = vu ? '#3a3048' : '#1a1622'; g.fillRect(x + 2, y + 2, 16, 16); Police.ecrire(g, '?', x + 10, y + 6, '#5a5268', { a: 'c' }); } });
      Police.ecrire(g, 'Découverts : ' + P.decouverts.filter(id => INDEX[id] && (INDEX[id].type === 'passif' || INDEX[id].type === 'actif' || INDEX[id].type === 'talisman')).length + ' / ' + L.length, 320, 326, '#a8a0b8', { a: 'c' });
    } else if (this.onglet === 4) { // synergies : réunies au moins une fois ; indices pour les autres
      const L = DON.synergies; this.i = Math.min(this.i, L.length - 1); const deb = Math.max(0, Math.min(this.i - 7, L.length - 16)); const connue = s => P.decouverts.includes(s.id);
      L.slice(deb, deb + 16).forEach((sy, k) => { const j = deb + k, ok = connue(sy), y = 36 + k * 18; if (j === this.i) { g.fillStyle = 'rgba(240,200,112,0.18)'; g.fillRect(24, y - 3, 250, 16); } Police.ecrire(g, (ok ? '✓ ' : '· ') + (ok ? sy.nom : sy.type === 'fusion' ? 'Fusion inconnue' : 'Synergie inconnue'), 30, y, ok ? (sy.type === 'fusion' ? '#8af0e0' : '#a0e0a0') : '#8a8098'); });
      const sy = L[this.i], ok = connue(sy); g.fillStyle = 'rgba(20,14,28,0.95)'; g.fillRect(290, 32, 330, 200);
      g.drawImage(ok ? iconeSynergie(sy.id) : anneauxSynergie(), 300, 36); Police.ecrire(g, ok ? sy.nom : '???', 324, 42, '#fff0d0');
      let y = 62; const hint = [];
      if (sy.elements) hint.push('Natures : ' + sy.elements.map(n => NOMS_NATURES[n] || n).join(' + '));
      if (sy.composants.length) hint.push('Composants : ' + sy.composants.map(c => P.decouverts.includes(c) || ok ? INDEX[c].nom : '?').join(' + '));
      if (ok) { y += Police.paragraphe(g, sy.desc, 300, y, 310, '#e8dcc0') + 6; }
      for (const h of hint) y += Police.paragraphe(g, h, 300, y, 310, ok ? '#a8a0b8' : '#c8b8a0') + 2;
      if (!ok) Police.paragraphe(g, 'Réunissez ces pièces pendant une partie pour l’inscrire ici.', 300, y + 6, 310, '#6a6078');
      Police.ecrire(g, 'Réunies : ' + L.filter(connue).length + ' / ' + L.length, 455, 244, '#a8a0b8', { a: 'c' });
    } else if (this.onglet === 3) { // indices consultables en jeu ; la solution apparaît une fois le secret trouvé
      const L = DON.secrets; this.i = Math.min(this.i, L.length - 1);
      L.forEach((sc, k) => { const ok = P.decouverts.includes(sc.id); const y = 36 + k * 18; if (k === this.i) { g.fillStyle = 'rgba(240,200,112,0.18)'; g.fillRect(24, y - 3, 250, 16); } Police.ecrire(g, (ok ? '✓ ' : '· ') + (ok ? sc.nom : 'Secret inconnu'), 30, y, ok ? '#a0e0a0' : '#c8c0d8'); });
      const sc = L[this.i]; const ok = P.decouverts.includes(sc.id);
      g.fillStyle = 'rgba(20,14,28,0.95)'; g.fillRect(290, 32, 330, 170);
      Police.ecrire(g, ok ? sc.nom : 'Indice', 300, 40, '#fff0d0');
      let y = 56 + Police.paragraphe(g, sc.indice, 300, 56, 310, '#e8dcc0') + 8;
      if (ok) Police.paragraphe(g, sc.solution, 300, y, 310, '#a8a0b8'); else Police.paragraphe(g, 'La solution s’inscrit ici quand vous le découvrez.', 300, y, 310, '#6a6078');
      Police.ecrire(g, 'Trouvés : ' + L.filter(x => P.decouverts.includes(x.id)).length + ' / ' + L.length, 455, 214, '#a8a0b8', { a: 'c' });
    } else {
      const L = DON.objectifs; const deb = Math.min(this.i, Math.max(0, L.length - 20));
      L.slice(deb, deb + 20).forEach((o, k) => { const y = 34 + k * 15; const ok = !!P.objectifs[o.id]; Police.ecrire(g, (ok ? '✓ ' : '· ') + o.nom, 30, y, ok ? '#a0e0a0' : '#c8c0d8'); Police.ecrire(g, o.desc, 610, y, '#7a7088', { a: 'd' }); });
    }
    aideBoutons(g, [['retour', 'Retour']]);
  },
};
