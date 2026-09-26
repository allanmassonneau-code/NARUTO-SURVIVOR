// ═══════════════════════════════════════════════════════════════════════════
// Entrées : actions logiques, manette (disposition « standard » du navigateur),
// clavier de secours, zones mortes radiales, visée cardinale avec hystérésis,
// répétition des menus, consommation des entrées au changement de contexte.
// ═══════════════════════════════════════════════════════════════════════════

// Boutons de la disposition standard (positions, pas de lettres de fabricant).
const BTN = { BAS: 0, DROITE: 1, GAUCHE: 2, HAUT: 3, LB: 4, RB: 5, LT: 6, RT: 7, VUE: 8, MENU: 9, L3: 10, R3: 11, CR_HAUT: 12, CR_BAS: 13, CR_GAUCHE: 14, CR_DROITE: 15 };

// Actions logiques et liaisons par défaut (registre §R5).
const ACTIONS_JEU = ['actif', 'explosif', 'poche', 'interagir', 'retour', 'description', 'carte', 'pause', 'echanger', 'deposer'];
const LIAISONS_DEFAUT = {
  manette: {
    actif: [BTN.LT], explosif: [BTN.RB], poche: [BTN.RT], interagir: [BTN.BAS], retour: [BTN.DROITE],
    description: [BTN.HAUT], carte: [BTN.VUE], pause: [BTN.MENU], echanger: [BTN.LB], deposer: [BTN.GAUCHE],
  },
  clavier: {
    actif: ['Space'], explosif: ['KeyE'], poche: ['KeyQ'], interagir: ['Enter', 'KeyF'], retour: ['Backspace'],
    description: ['KeyR'], carte: ['Tab'], pause: ['Escape', 'KeyP'], echanger: ['ShiftLeft', 'ShiftRight'], deposer: ['ControlLeft', 'ControlRight'],
    haut: ['KeyW'], bas: ['KeyS'], gauche: ['KeyA'], droite: ['KeyD'],
    tirHaut: ['ArrowUp'], tirBas: ['ArrowDown'], tirGauche: ['ArrowLeft'], tirDroite: ['ArrowRight'],
  },
};
const NOMS_ACTIONS = {
  actif: 'Technique scellée (actif)', explosif: 'Poser un parchemin explosif', poche: 'Utiliser la poche',
  interagir: 'Interagir / confirmer', retour: 'Retour / annuler', description: 'Description d’un objet proche',
  carte: 'Carte étendue', pause: 'Pause', echanger: 'Échanger les poches', deposer: 'Déposer (maintenir)',
  haut: 'Déplacement haut', bas: 'Déplacement bas', gauche: 'Déplacement gauche', droite: 'Déplacement droite',
  tirHaut: 'Tir haut', tirBas: 'Tir bas', tirGauche: 'Tir gauche', tirDroite: 'Tir droite',
};
const DUREE_DEPOT = 0.8; // maintien confirmé pour déposer talisman / poche

const Entrees = {
  touches: new Set(), touchesAvant: new Set(),
  manetteIndex: -1, manetteId: '', glyphes: 'clavier', dernierPeripherique: 'clavier',
  boutons: [], boutonsAvant: [], axes: [0, 0, 0, 0],
  bloque: {},              // action → vrai tant qu'elle n'a pas été relâchée après consommation
  maintien: {},            // action → secondes de maintien
  deplacement: { x: 0, y: 0 },
  visee: { dir: null, x: 0, y: 0, source: null }, // direction cardinale de tir courante
  viseeLibre: { x: 0, y: 0 }, // vecteur analogique brut (objets à visée libre)
  nav: { dx: 0, dy: 0 }, navMaintien: { t: 0, dir: '' },
  ordreFleches: [],        // ordre d'appui des flèches de tir au clavier
  deconnexion: false,
  vibrationsDernier: {},
  reglages: null,

  init(reglages) {
    this.reglages = reglages;
    addEventListener('keydown', e => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab', 'Backspace'].includes(e.code)) e.preventDefault();
      if (!this.touches.has(e.code)) {
        this.touches.add(e.code); this.dernierPeripherique = 'clavier'; this.glyphes = 'clavier';
        if (e.code.startsWith('Arrow')) { this.ordreFleches = this.ordreFleches.filter(c => c !== e.code); this.ordreFleches.push(e.code); }
        if (this.captureTouche) { const f = this.captureTouche; this.captureTouche = null; f(e.code); }
      }
    });
    addEventListener('keyup', e => { this.touches.delete(e.code); this.ordreFleches = this.ordreFleches.filter(c => c !== e.code); });
    addEventListener('blur', () => { this.touches.clear(); this.ordreFleches = []; if (this.surPerteFocus) this.surPerteFocus(); });
    addEventListener('gamepaddisconnected', e => {
      if (e.gamepad.index === this.manetteIndex) { this.deconnexion = true; this.manetteIndex = -1; if (this.surDeconnexion) this.surDeconnexion(); }
    });
    addEventListener('gamepadconnected', e => { if (this.manetteIndex < 0) this.choisirManette(e.gamepad); });
    // Noms réels des touches (AZERTY → Z/Q/S/D affichés)
    this.nomsTouches = {};
    try { if (navigator.keyboard && navigator.keyboard.getLayoutMap) navigator.keyboard.getLayoutMap().then(m => { m.forEach((v, k) => { this.nomsTouches[k] = v.toUpperCase(); }); }).catch(() => {}); } catch (e) { /* facultatif */ }
  },
  choisirManette(gp) {
    this.manetteIndex = gp.index; this.manetteId = gp.id || ''; this.deconnexion = false;
    const id = this.manetteId.toLowerCase();
    this.typeManette = /054c|playstation|dualsense|dualshock|wireless controller/.test(id) ? 'playstation'
      : /057e|nintendo|pro controller|joy-con/.test(id) ? 'nintendo'
      : /xbox|xinput|045e/.test(id) ? 'xbox' : 'generique';
  },
  lireManettes() {
    let pads = [];
    try { pads = navigator.getGamepads ? Array.from(navigator.getGamepads()) : []; } catch (e) { pads = []; }
    // Plusieurs manettes : la dernière qui a produit une entrée devient active (solo).
    for (const gp of pads) {
      if (!gp || !gp.connected) continue;
      const actif = gp.buttons.some((b, i) => (b.pressed || b.value > 0.5) && i < 17) || gp.axes.some(a => Math.abs(a) > 0.6);
      if (actif && gp.index !== this.manetteIndex) this.choisirManette(gp);
    }
    const gp = this.manetteIndex >= 0 ? pads.find(p => p && p.index === this.manetteIndex) : null;
    this.boutonsAvant = this.boutons;
    if (gp) {
      this.boutons = gp.buttons.map((b, i) => (i === BTN.LT || i === BTN.RT) ? b.value > 0.35 || b.pressed : b.pressed);
      this.axes = [gp.axes[0] || 0, gp.axes[1] || 0, gp.axes[2] || 0, gp.axes[3] || 0];
      if (this.boutons.some(Boolean) || this.axes.some(a => Math.abs(a) > 0.5)) { this.dernierPeripherique = 'manette'; this.glyphes = this.typeManette; }
      this.pad = gp;
    } else { this.boutons = []; this.axes = [0, 0, 0, 0]; this.pad = null; }
  },
  bouton(i) { return !!this.boutons[i]; },
  boutonAvant(i) { return !!this.boutonsAvant[i]; },
  liaisonsManette(a) { return (this.reglages && this.reglages.liaisons.manette[a]) || LIAISONS_DEFAUT.manette[a] || []; },
  liaisonsClavier(a) { return (this.reglages && this.reglages.liaisons.clavier[a]) || LIAISONS_DEFAUT.clavier[a] || []; },
  brutEnfonce(a) {
    for (const b of this.liaisonsManette(a)) if (this.bouton(b)) return true;
    for (const k of this.liaisonsClavier(a)) if (this.touches.has(k)) return true;
    return false;
  },
  brutAvant(a) {
    for (const b of this.liaisonsManette(a)) if (this.boutonAvant(b)) return true;
    for (const k of this.liaisonsClavier(a)) if (this.touchesAvant.has(k)) return true;
    return false;
  },
  // État d'une action de jeu (en tenant compte de la consommation).
  enfonce(a) { return this.brutEnfonce(a) && !this.bloque[a]; },
  vientEnfonce(a) { return this.brutEnfonce(a) && !this.brutAvant(a) && !this.bloque[a]; },
  vientRelache(a) { return !this.brutEnfonce(a) && this.brutAvant(a); },
  // Consomme toutes les entrées maintenues : elles devront être relâchées avant d'agir à nouveau.
  consommer() {
    for (const a of [...ACTIONS_JEU, 'tir', 'nav']) this.bloque[a] = true;
    this.maintien = {};
  },

  // ── Traitement des sticks ──
  traiterStick(x, y, zm, courbe, ext = 0.96) {
    const m = Math.hypot(x, y);
    if (m < zm) return { x: 0, y: 0, m: 0 };
    let n = borne((m - zm) / (ext - zm), 0, 1); n = Math.pow(n, courbe);
    return { x: x / m * n, y: y / m * n, m: n };
  },
  // Quantification cardinale avec hystérésis (registre §R6).
  quantifier(x, y) {
    const R = this.reglages || {};
    const m = Math.hypot(x, y), actif = R.seuilVisee || 0.5, repos = R.seuilRepos || 0.35;
    const cur = this.visee.source === 'stick' ? this.visee.dir : null;
    if (!cur) { if (m < actif) return null; }
    else if (m < repos) return null;
    const ax = Math.abs(x), ay = Math.abs(y);
    const k = Math.tan((45 + (R.hysteresisAngle || 12)) * Math.PI / 180); // ≈1,54 pour 12°
    if (cur) {
      const horizontal = cur === 'gauche' || cur === 'droite';
      if (horizontal && ay > ax * k) return y > 0 ? 'bas' : 'haut';
      if (!horizontal && ax > ay * k) return x > 0 ? 'droite' : 'gauche';
      if (horizontal) return x > 0 ? 'droite' : x < 0 ? 'gauche' : cur;
      return y > 0 ? 'bas' : y < 0 ? 'haut' : cur;
    }
    if (ax >= ay) return x >= 0 ? 'droite' : 'gauche'; // égalité exacte : axe horizontal
    return y > 0 ? 'bas' : 'haut';
  },

  // Appelé une fois par pas de simulation (60 Hz).
  maj(dt) {
    this.lireManettes();
    const R = this.reglages || {};
    // Levée des blocages : une action consommée redevient utilisable après relâchement.
    for (const a of ACTIONS_JEU) if (this.bloque[a] && !this.brutEnfonce(a)) this.bloque[a] = false;
    // Maintiens
    for (const a of ACTIONS_JEU) this.maintien[a] = this.enfonce(a) ? (this.maintien[a] || 0) + dt : 0;

    // Déplacement : stick gauche + clavier
    const sg = this.traiterStick(this.axes[0], this.axes[1], R.zoneMorteG ?? 0.18, R.courbeG ?? 1.0);
    let kx = 0, ky = 0;
    const kc = a => this.liaisonsClavier(a).some(k => this.touches.has(k));
    if (kc('gauche')) kx -= 1; if (kc('droite')) kx += 1; if (kc('haut')) ky -= 1; if (kc('bas')) ky += 1;
    let mx = sg.x + kx, my = sg.y + ky; const mm = Math.hypot(mx, my); if (mm > 1) { mx /= mm; my /= mm; } // diagonales normalisées
    this.deplacement.x = mx; this.deplacement.y = my;

    // Visée : stick droit (profil stick), croix directionnelle (profil croix), flèches clavier
    const profil = R.profilTir || 'stick+croix';
    const sd = this.traiterStick(this.axes[2], this.axes[3], R.zoneMorteD ?? 0.12, 1.0);
    this.viseeLibre.x = sd.x; this.viseeLibre.y = sd.y;
    let dir = null, source = null;
    if (profil.includes('croix')) {
      const cr = [[BTN.CR_HAUT, 'haut'], [BTN.CR_BAS, 'bas'], [BTN.CR_GAUCHE, 'gauche'], [BTN.CR_DROITE, 'droite']];
      // la dernière direction enfoncée de la croix garde la priorité
      for (const [b, d] of cr) if (this.bouton(b) && !this.boutonAvant(b)) this.croixDerniere = d;
      const tenues = cr.filter(([b]) => this.bouton(b)).map(([, d]) => d);
      if (tenues.length) { dir = tenues.includes(this.croixDerniere) ? this.croixDerniere : tenues[0]; source = 'croix'; }
    }
    if (!dir && profil.includes('stick')) {
      const q = this.quantifier(this.axes[2], this.axes[3]);
      if (q) { dir = q; source = 'stick'; }
    }
    if (!dir && this.ordreFleches.length) {
      const map = { ArrowUp: 'haut', ArrowDown: 'bas', ArrowLeft: 'gauche', ArrowRight: 'droite' };
      // liaisons clavier personnalisées pour le tir
      for (let i = this.ordreFleches.length - 1; i >= 0 && !dir; i--) { const c = this.ordreFleches[i]; if (map[c]) { dir = map[c]; source = 'clavier'; } }
    }
    if (!dir) {
      for (const [a, d] of [['tirHaut', 'haut'], ['tirBas', 'bas'], ['tirGauche', 'gauche'], ['tirDroite', 'droite']]) {
        if (this.liaisonsClavier(a).some(k => this.touches.has(k) && !k.startsWith('Arrow'))) { dir = d; source = 'clavier'; }
      }
    }
    // Le tir consommé (changement de contexte) exige un retour au repos.
    if (this.bloque.tir) { if (!dir) this.bloque.tir = false; dir = null; }
    this.visee.dir = dir; this.visee.source = source;
    if (dir) { this.visee.x = DIRS[dir][0]; this.visee.y = DIRS[dir][1]; }

    // Navigation des menus avec répétition contrôlée
    let nx = 0, ny = 0;
    const s = this.axes, seuil = 0.55;
    if (s[0] < -seuil || this.bouton(BTN.CR_GAUCHE) || this.touches.has('ArrowLeft') || kc('gauche')) nx = -1;
    if (s[0] > seuil || this.bouton(BTN.CR_DROITE) || this.touches.has('ArrowRight') || kc('droite')) nx = 1;
    if (s[1] < -seuil || this.bouton(BTN.CR_HAUT) || this.touches.has('ArrowUp') || kc('haut')) ny = -1;
    if (s[1] > seuil || this.bouton(BTN.CR_BAS) || this.touches.has('ArrowDown') || kc('bas')) ny = 1;
    if (Math.abs(nx) && Math.abs(ny)) { if (Math.abs(s[0]) >= Math.abs(s[1])) ny = 0; else nx = 0; }
    const cle = nx + ',' + ny;
    this.nav.dx = 0; this.nav.dy = 0;
    if (this.bloque.nav) { if (!nx && !ny) this.bloque.nav = false; }
    else if (nx || ny) {
      if (this.navMaintien.dir !== cle) { this.navMaintien = { t: 0, dir: cle }; this.nav.dx = nx; this.nav.dy = ny; }
      else {
        const t0 = this.navMaintien.t; this.navMaintien.t += dt;
        const delai = 0.38, rep = 0.085;
        if (t0 < delai && this.navMaintien.t >= delai) { this.nav.dx = nx; this.nav.dy = ny; }
        else if (t0 >= delai && Math.floor((t0 - delai) / rep) !== Math.floor((this.navMaintien.t - delai) / rep)) { this.nav.dx = nx; this.nav.dy = ny; }
      }
    } else this.navMaintien = { t: 0, dir: '' };
    this.touchesAvantSuivantes = new Set(this.touches);
  },
  finPas() { this.touchesAvant = this.touchesAvantSuivantes || new Set(this.touches); },
  // Menus : confirmer / annuler (bouton de face inférieur / droit, Entrée / Échap)
  menuConfirmer() { return this.vientEnfonce('interagir') || (this.touches.has('Space') && !this.touchesAvant.has('Space') && !this.bloque.interagir); },
  menuRetour() { return this.vientEnfonce('retour') || (this.touches.has('Escape') && !this.touchesAvant.has('Escape')); },

  // ── Vibrations : distinctes, limitées en fréquence, réglables, jamais seules porteuses d'information ──
  vibrer(type) {
    const R = this.reglages || {}; const k = R.vibrations ?? 0.7;
    if (!k || !this.pad || !this.pad.vibrationActuator) return;
    const P = { degats: [220, 0.7, 0.5, 350], charge: [70, 0.0, 0.35, 250], explosion: [260, 0.9, 0.4, 200], objet: [160, 0.2, 0.6, 500], boss: [400, 0.8, 0.8, 900] }[type];
    if (!P) return;
    const now = performance.now(); if (now - (this.vibrationsDernier[type] || 0) < P[3]) return;
    this.vibrationsDernier[type] = now;
    try { this.pad.vibrationActuator.playEffect('dual-rumble', { duration: P[0], strongMagnitude: P[1] * k, weakMagnitude: P[2] * k }); } catch (e) { /* facultatif */ }
  },

  // ── Glyphes affichés (position d'abord, fabricant ensuite) ──
  nomBouton(i) {
    const t = this.glyphes;
    const X = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'View', 'Menu', 'L3', 'R3', 'Croix ↑', 'Croix ↓', 'Croix ←', 'Croix →'];
    const P = ['Croix', 'Rond', 'Carré', 'Triangle', 'L1', 'R1', 'L2', 'R2', 'Create', 'Options', 'L3', 'R3', 'Croix ↑', 'Croix ↓', 'Croix ←', 'Croix →'];
    const N = ['B', 'A', 'Y', 'X', 'L', 'R', 'ZL', 'ZR', '-', '+', 'L3', 'R3', 'Croix ↑', 'Croix ↓', 'Croix ←', 'Croix →'];
    const G = ['Face bas', 'Face droite', 'Face gauche', 'Face haut', 'Haut gauche', 'Haut droit', 'Gâchette G', 'Gâchette D', 'Vue', 'Menu', 'Stick G', 'Stick D', 'Croix ↑', 'Croix ↓', 'Croix ←', 'Croix →'];
    const L = t === 'playstation' ? P : t === 'nintendo' ? N : t === 'xbox' ? X : G;
    return L[i] || ('B' + i);
  },
  nomTouche(code) {
    if (this.nomsTouches && this.nomsTouches[code]) return this.nomsTouches[code];
    const m = { Space: 'Espace', Enter: 'Entrée', Escape: 'Échap', Backspace: 'Retour', Tab: 'Tab', ShiftLeft: 'Maj', ShiftRight: 'Maj D', ControlLeft: 'Ctrl', ControlRight: 'Ctrl D', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', AltLeft: 'Alt' };
    if (m[code]) return m[code];
    if (code.startsWith('Key')) return code.slice(3);
    if (code.startsWith('Digit')) return code.slice(5);
    return code;
  },
  // Libellé court de la première liaison d'une action pour le périphérique courant.
  libelle(a) {
    if (this.dernierPeripherique === 'manette') { const b = this.liaisonsManette(a)[0]; return b === undefined ? '—' : this.nomBouton(b); }
    const k = this.liaisonsClavier(a)[0]; return k ? this.nomTouche(k) : '—';
  },
};
