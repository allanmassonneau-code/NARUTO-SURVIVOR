// ═══════════════════════════════════════════════════════════════════════════
// NARUTO — LE LABYRINTHE DES SCEAUX
// Noyau : constantes de grille, mathématiques, hasard reproductible (flux séparés).
// Ce fichier n'utilise pas le DOM : il est aussi chargé par les outils Node.
// ═══════════════════════════════════════════════════════════════════════════

const VERSION_JEU = '1.0.0';
const VERSION_DONNEES = 12;          // incrémentée à chaque changement des pools / salles (codes de mission)
const VERSION_SAUVEGARDE = 3;

// ── Grille de référence (registre §R1) ──────────────────────────────────────
const ECRAN_L = 640, ECRAN_H = 360;  // résolution interne
const TUILE = 32;                     // pixels par tuile
const CEL_L = 13, CEL_H = 7;          // intérieur d'une cellule de salle (tuiles)
const ORIGINE_X = 80, ORIGINE_Y = 40; // coin haut-gauche du mur d'une salle 1×1 à l'écran
const DT = 1 / 60;                    // pas fixe de simulation (s)

// ── Petits outils mathématiques ──────────────────────────────────────────────
const borne = (v, a, b) => (v < a ? a : v > b ? b : v);
const lerp = (a, b, t) => a + (b - a) * t;
const signe = v => (v > 0 ? 1 : v < 0 ? -1 : 0);
const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
const dist2 = (ax, ay, bx, by) => { const dx = bx - ax, dy = by - ay; return dx * dx + dy * dy; };
const angleVers = (ax, ay, bx, by) => Math.atan2(by - ay, bx - ax);
const approche = (v, cible, pas) => (v < cible ? Math.min(cible, v + pas) : Math.max(cible, v - pas));
const arrondi = (v, n = 2) => { const f = Math.pow(10, n); return Math.round(v * f) / f; };
const DIRS = { haut: [0, -1], bas: [0, 1], gauche: [-1, 0], droite: [1, 0] };
const DIR_OPPOSEE = { haut: 'bas', bas: 'haut', gauche: 'droite', droite: 'gauche' };
const DIR_LISTE = ['haut', 'droite', 'bas', 'gauche'];
function dirDepuisVecteur(x, y) { return Math.abs(x) >= Math.abs(y) ? (x >= 0 ? 'droite' : 'gauche') : (y >= 0 ? 'bas' : 'haut'); }
function normaliser(x, y) { const m = Math.hypot(x, y); return m > 1e-9 ? [x / m, y / m] : [0, 0]; }
function diffAngle(a, b) { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; }
function formatNombre(v) { // nombres affichés « à la française »
  if (Number.isInteger(v)) return String(v);
  return String(arrondi(v, 2)).replace('.', ',');
}
function formatTemps(s) { s = Math.max(0, Math.floor(s)); const m = Math.floor(s / 60), r = s % 60; return m + ':' + String(r).padStart(2, '0'); }

// ── Hasard reproductible ─────────────────────────────────────────────────────
// sfc32 : générateur 32 bits à état explicite (4 entiers), sérialisable.
function hacher(chaine) { // cyrb128 → 4 entiers 32 bits
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  for (let i = 0; i < chaine.length; i++) {
    const k = chaine.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067); h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213); h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067); h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213); h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
}
class Alea {
  constructor(graine) { this.s = Array.isArray(graine) ? graine.slice() : hacher(String(graine)); for (let i = 0; i < 12; i++) this.suivant(); }
  suivant() { // [0,1)
    let [a, b, c, d] = this.s;
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    const t = (a + b | 0) + d | 0;
    d = d + 1 | 0; a = b ^ b >>> 9; b = c + (c << 3) | 0; c = c << 21 | c >>> 11; c = c + t | 0;
    this.s = [a, b, c, d];
    return (t >>> 0) / 4294967296;
  }
  entier(n) { return Math.floor(this.suivant() * n); }            // [0, n)
  entre(a, b) { return a + this.suivant() * (b - a); }
  entierEntre(a, b) { return a + this.entier(b - a + 1); }         // [a, b]
  chance(p) { return this.suivant() < p; }
  choix(t) { return t.length ? t[this.entier(t.length)] : undefined; }
  melanger(t) { for (let i = t.length - 1; i > 0; i--) { const j = this.entier(i + 1); [t[i], t[j]] = [t[j], t[i]]; } return t; }
  // Sélection pondérée : poids nuls ou négatifs exclus ; renvoie undefined si la masse est vide.
  pondere(liste, poids) {
    let total = 0; const w = liste.map(x => { const p = Math.max(0, poids(x) || 0); total += p; return p; });
    if (total <= 0) return undefined;
    let r = this.suivant() * total;
    for (let i = 0; i < liste.length; i++) { r -= w[i]; if (r < 0 && w[i] > 0) return liste[i]; }
    for (let i = liste.length - 1; i >= 0; i--) if (w[i] > 0) return liste[i];
    return undefined;
  }
  etat() { return this.s.slice(); }
}

// Codes de mission : 8 caractères sans I, O, 0, 1 (confusions visuelles).
const ALPHABET_CODE = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function codeAleatoire(sourceHasard) {
  let c = ''; for (let i = 0; i < 8; i++) c += ALPHABET_CODE[Math.floor(sourceHasard() * 32)];
  return c;
}
function codeValide(c) { return typeof c === 'string' && c.length === 8 && [...c].every(ch => ALPHABET_CODE.includes(ch)); }
function codeAffiche(c) { return c.slice(0, 4) + ' ' + c.slice(4); }
// Flux séparés : topologie, butin, récompenses, ennemis, combat, cosmétique.
// Chaque flux d'étage dérive de (code, version des données, étage, nom du flux).
function fluxEtage(code, etage, nom) { return new Alea(code + '|' + VERSION_DONNEES + '|' + etage + '|' + nom); }

// ── Registres de données (remplis par les fichiers 1x_donnees_*.js) ─────────
const DON = {
  personnages: [], objets: [], talismans: [], consommables: [], pilules: [],
  ennemis: [], boss: [], salles: [], themes: [], etages: [], routes: [],
  transformations: [], synergies: [], objectifs: [], defis: [], secrets: [],
  champions: [], familiers: [], pools: {}, prix: {},
};
const INDEX = {}; // INDEX[id] → définition (rempli par indexerDonnees)
function indexerDonnees() {
  for (const k of Object.keys(INDEX)) delete INDEX[k];
  const listes = ['personnages', 'objets', 'talismans', 'consommables', 'pilules', 'ennemis', 'boss', 'salles',
    'themes', 'etages', 'routes', 'transformations', 'synergies', 'objectifs', 'defis', 'secrets', 'champions'];
  for (const l of listes) for (const d of DON[l]) {
    if (!d.id) throw new Error('Entrée sans identifiant dans ' + l);
    if (INDEX[d.id]) throw new Error('Identifiant en double : ' + d.id);
    INDEX[d.id] = d;
  }
}
function def(id) { const d = INDEX[id]; if (!d) throw new Error('Identifiant inconnu : ' + id); return d; }

if (typeof module !== 'undefined') module.exports = { DON, INDEX, indexerDonnees, Alea, hacher };
