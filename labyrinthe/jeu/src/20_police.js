// ═══════════════════════════════════════════════════════════════════════════
// Police bitmap originale (5×7, bas de casse 5 lignes, accents français et macrons).
// Chaque glyphe : [ligne de départ, [lignes]] ; lignes 0-1 = accents des capitales,
// 2-8 = hauteur de capitale (ligne de base après 8), 9-10 = jambages.
// ═══════════════════════════════════════════════════════════════════════════

const GLYPHES = {
  'A': [2, ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#']],
  'B': [2, ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.']],
  'C': [2, ['.###.', '#...#', '#....', '#....', '#....', '#...#', '.###.']],
  'D': [2, ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.']],
  'E': [2, ['#####', '#....', '#....', '####.', '#....', '#....', '#####']],
  'F': [2, ['#####', '#....', '#....', '####.', '#....', '#....', '#....']],
  'G': [2, ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.####']],
  'H': [2, ['#...#', '#...#', '#...#', '#####', '#...#', '#...#', '#...#']],
  'I': [2, ['###', '.#.', '.#.', '.#.', '.#.', '.#.', '###']],
  'J': [2, ['..###', '...#.', '...#.', '...#.', '#..#.', '#..#.', '.##..']],
  'K': [2, ['#...#', '#..#.', '#.#..', '##...', '#.#..', '#..#.', '#...#']],
  'L': [2, ['#....', '#....', '#....', '#....', '#....', '#....', '#####']],
  'M': [2, ['#...#', '##.##', '#.#.#', '#.#.#', '#...#', '#...#', '#...#']],
  'N': [2, ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#']],
  'O': [2, ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.']],
  'P': [2, ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....']],
  'Q': [2, ['.###.', '#...#', '#...#', '#...#', '#.#.#', '#..#.', '.##.#']],
  'R': [2, ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#']],
  'S': [2, ['.####', '#....', '#....', '.###.', '....#', '....#', '####.']],
  'T': [2, ['#####', '..#..', '..#..', '..#..', '..#..', '..#..', '..#..']],
  'U': [2, ['#...#', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.']],
  'V': [2, ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..']],
  'W': [2, ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '#.#.#', '.#.#.']],
  'X': [2, ['#...#', '#...#', '.#.#.', '..#..', '.#.#.', '#...#', '#...#']],
  'Y': [2, ['#...#', '#...#', '.#.#.', '..#..', '..#..', '..#..', '..#..']],
  'Z': [2, ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####']],
  'a': [4, ['.###.', '....#', '.####', '#...#', '.####']],
  'œ': [4, ['.##.##.', '#..#..#', '#..####', '#..#...', '.##.###']],
  'Œ': [2, ['.######', '#..#...', '#..#...', '#..###.', '#..#...', '#..#...', '.######']],
  'b': [2, ['#....', '#....', '####.', '#...#', '#...#', '#...#', '####.']],
  'c': [4, ['.###.', '#....', '#....', '#....', '.###.']],
  'd': [2, ['....#', '....#', '.####', '#...#', '#...#', '#...#', '.####']],
  'e': [4, ['.###.', '#...#', '#####', '#....', '.###.']],
  'f': [2, ['..##', '.#..', '####', '.#..', '.#..', '.#..', '.#..']],
  'g': [4, ['.####', '#...#', '#...#', '.####', '....#', '....#', '.###.']],
  'h': [2, ['#....', '#....', '####.', '#...#', '#...#', '#...#', '#...#']],
  'i': [2, ['#', '.', '#', '#', '#', '#', '#']],
  'ı': [4, ['.#.', '.#.', '.#.', '.#.', '.#.']],
  'j': [2, ['..#', '...', '..#', '..#', '..#', '..#', '..#', '#.#', '.#.']],
  'k': [2, ['#...', '#...', '#..#', '#.#.', '##..', '#.#.', '#..#']],
  'l': [2, ['#.', '#.', '#.', '#.', '#.', '#.', '.#']],
  'm': [4, ['##.#.', '#.#.#', '#.#.#', '#.#.#', '#.#.#']],
  'n': [4, ['####.', '#...#', '#...#', '#...#', '#...#']],
  'o': [4, ['.###.', '#...#', '#...#', '#...#', '.###.']],
  'p': [4, ['####.', '#...#', '#...#', '#...#', '####.', '#....', '#....']],
  'q': [4, ['.####', '#...#', '#...#', '#...#', '.####', '....#', '....#']],
  'r': [4, ['#.##', '##..', '#...', '#...', '#...']],
  's': [4, ['.####', '#....', '.###.', '....#', '####.']],
  't': [2, ['.#..', '.#..', '####', '.#..', '.#..', '.#..', '..##']],
  'u': [4, ['#...#', '#...#', '#...#', '#...#', '.####']],
  'v': [4, ['#...#', '#...#', '#...#', '.#.#.', '..#..']],
  'w': [4, ['#...#', '#.#.#', '#.#.#', '#.#.#', '.#.#.']],
  'x': [4, ['#...#', '.#.#.', '..#..', '.#.#.', '#...#']],
  'y': [4, ['#...#', '#...#', '#...#', '.####', '....#', '....#', '.###.']],
  'z': [4, ['#####', '...#.', '..#..', '.#...', '#####']],
  '0': [2, ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.']],
  '1': [2, ['.#.', '##.', '.#.', '.#.', '.#.', '.#.', '###']],
  '2': [2, ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####']],
  '3': [2, ['####.', '....#', '....#', '.###.', '....#', '....#', '####.']],
  '4': [2, ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.']],
  '5': [2, ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.']],
  '6': [2, ['.###.', '#....', '#....', '####.', '#...#', '#...#', '.###.']],
  '7': [2, ['#####', '....#', '...#.', '..#..', '..#..', '..#..', '..#..']],
  '8': [2, ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.']],
  '9': [2, ['.###.', '#...#', '#...#', '.####', '....#', '....#', '.###.']],
  '.': [8, ['#']],
  ',': [8, ['.#', '#.']],
  ':': [5, ['#', '.', '.', '#']],
  ';': [5, ['.#', '..', '..', '.#', '#.']],
  '!': [2, ['#', '#', '#', '#', '#', '.', '#']],
  '?': [2, ['.###.', '#...#', '....#', '...#.', '..#..', '.....', '..#..']],
  "'": [2, ['#', '#']],
  '"': [2, ['#.#', '#.#']],
  '-': [5, ['###']],
  '+': [4, ['..#..', '..#..', '#####', '..#..', '..#..']],
  '×': [4, ['#...#', '.#.#.', '..#..', '.#.#.', '#...#']],
  '%': [2, ['##..#', '##.#.', '...#.', '..#..', '.#...', '.#.##', '#..##']],
  '/': [2, ['....#', '...#.', '...#.', '..#..', '.#...', '.#...', '#....']],
  '(': [2, ['.#', '#.', '#.', '#.', '#.', '#.', '.#']],
  ')': [2, ['#.', '.#', '.#', '.#', '.#', '.#', '#.']],
  '[': [2, ['##', '#.', '#.', '#.', '#.', '#.', '##']],
  ']': [2, ['##', '.#', '.#', '.#', '.#', '.#', '##']],
  '<': [2, ['...#', '..#.', '.#..', '#...', '.#..', '..#.', '...#']],
  '>': [2, ['#...', '.#..', '..#.', '...#', '..#.', '.#..', '#...']],
  '=': [4, ['####', '....', '####']],
  '_': [9, ['#####']],
  '#': [2, ['.#.#.', '#####', '.#.#.', '.#.#.', '#####', '.#.#.']],
  '*': [3, ['#.#.#', '.###.', '#####', '.###.', '#.#.#']],
  '°': [2, ['.#.', '#.#', '.#.']],
  '«': [4, ['..#.#', '.#.#.', '#.#..', '.#.#.', '..#.#']],
  '»': [4, ['#.#..', '.#.#.', '..#.#', '.#.#.', '#.#..']],
  '→': [4, ['..#..', '...#.', '#####', '...#.', '..#..']],
  '←': [4, ['..#..', '.#...', '#####', '.#...', '..#..']],
  '↑': [3, ['..#..', '.###.', '#.#.#', '..#..', '..#..', '..#..']],
  '↓': [3, ['..#..', '..#..', '..#..', '#.#.#', '.###.', '..#..']],
  '♥': [3, ['.#.#.', '#####', '#####', '.###.', '..#..']],
  '·': [5, ['#']],
  '|': [2, ['#', '#', '#', '#', '#', '#', '#']],
  '&': [2, ['.##..', '#..#.', '.##..', '.#...', '#.#.#', '#..#.', '.##.#']],
  '@': [2, ['.###.', '#...#', '#.###', '#.#.#', '#.###', '#....', '.###.']],
  '$': [2, ['..#..', '.####', '#.#..', '.###.', '..#.#', '####.', '..#..']],
  '~': [4, ['.#..#', '#.##.']],
  '^': [2, ['..#..', '.#.#.']],
  '✓': [3, ['....#', '...#.', '#.#..', '.#...']],
  '▲': [4, ['..#..', '.###.', '#####']],
  '▼': [4, ['#####', '.###.', '..#..']],
  '★': [3, ['..#..', '.###.', '#####', '.###.', '.#.#.']],
  '∞': [5, ['.#.#.', '#.#.#', '.#.#.']],
};
// Accents : motif de 2 lignes (5 de large), posé au-dessus de la base.
const ACCENTS = {
  aigu: ['...#.', '..#..'], grave: ['.#...', '..#..'], circ: ['..#..', '.#.#.'],
  trema: ['.....', '.#.#.'], macron: ['.....', '.###.'],
};
(function composerAccents() {
  const tbl = [
    ['é', 'e', 'aigu'], ['è', 'e', 'grave'], ['ê', 'e', 'circ'], ['ë', 'e', 'trema'], ['ē', 'e', 'macron'],
    ['à', 'a', 'grave'], ['â', 'a', 'circ'], ['ä', 'a', 'trema'], ['ā', 'a', 'macron'], ['á', 'a', 'aigu'],
    ['î', 'ı', 'circ'], ['ï', 'ı', 'trema'], ['ī', 'ı', 'macron'], ['í', 'ı', 'aigu'],
    ['ô', 'o', 'circ'], ['ö', 'o', 'trema'], ['ō', 'o', 'macron'], ['ó', 'o', 'aigu'],
    ['ù', 'u', 'grave'], ['û', 'u', 'circ'], ['ü', 'u', 'trema'], ['ū', 'u', 'macron'], ['ú', 'u', 'aigu'],
    ['É', 'E', 'aigu'], ['È', 'E', 'grave'], ['Ê', 'E', 'circ'], ['À', 'A', 'grave'], ['Â', 'A', 'circ'],
    ['Ô', 'O', 'circ'], ['Ō', 'O', 'macron'], ['Ū', 'U', 'macron'], ['Û', 'U', 'circ'], ['Î', 'I', 'circ'], ['Ï', 'I', 'trema'],
  ];
  for (const [ch, base, acc] of tbl) {
    const [dep, lignes] = GLYPHES[base];
    const l = lignes[0].length, motif = ACCENTS[acc].map(r => {
      // recentrer le motif de 5 colonnes sur la largeur de la base
      if (l === 5) return r;
      const dec = Math.floor((5 - l) / 2); return r.slice(dec, dec + l);
    });
    const hautDep = dep - 2; // accent posé juste au-dessus
    const vide = '.'.repeat(l);
    const toutes = [...motif];
    for (let i = hautDep + 2; i < dep; i++) toutes.push(vide);
    GLYPHES[ch] = [hautDep, [...toutes, ...lignes]];
  }
  const [dc, lc] = GLYPHES['c']; GLYPHES['ç'] = [dc, [...lc, '..#..', '.#...']];
  const [dC, lC] = GLYPHES['C']; GLYPHES['Ç'] = [dC, [...lC, '..#..', '.#...']];
})();
const SUBSTITUTIONS = { 'æ': 'ae', '’': "'", '‘': "'", '“': '"', '”': '"', '–': '-', '—': '-', '…': '...', ' ': ' ', ' ': ' ' };
const ESPACE_L = 3, INTERLETTRE = 1, HAUTEUR_LIGNE = 11;

const Police = {
  atlas: null, cases: {}, teintes: new Map(), rendus: new Map(),
  preparer() {
    // atlas blanc de tous les glyphes
    const chars = Object.keys(GLYPHES);
    const cw = 7, ch = 12, cols = 32, rows = Math.ceil(chars.length / cols);
    const c = document.createElement('canvas'); c.width = cols * cw; c.height = rows * ch;
    const g = c.getContext('2d'); g.fillStyle = '#fff';
    chars.forEach((k, i) => {
      const [dep, lignes] = GLYPHES[k]; const ox = (i % cols) * cw, oy = Math.floor(i / cols) * ch;
      let larg = 0;
      lignes.forEach((r, y) => { larg = Math.max(larg, r.length); for (let x = 0; x < r.length; x++) if (r[x] === '#') g.fillRect(ox + x, oy + dep + y, 1, 1); });
      this.cases[k] = { x: ox, y: oy, l: larg };
    });
    this.atlas = c;
  },
  teinte(couleur) {
    let t = this.teintes.get(couleur); if (t) return t;
    t = document.createElement('canvas'); t.width = this.atlas.width; t.height = this.atlas.height;
    const g = t.getContext('2d'); g.drawImage(this.atlas, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = couleur; g.fillRect(0, 0, t.width, t.height);
    this.teintes.set(couleur, t); return t;
  },
  normaliser(s) { let o = ''; for (const ch of String(s)) o += SUBSTITUTIONS[ch] !== undefined ? SUBSTITUTIONS[ch] : ch; return o; },
  largeur(s) {
    s = this.normaliser(s); let l = 0;
    for (const ch of s) { if (ch === ' ') { l += ESPACE_L + INTERLETTRE; continue; } const c = this.cases[ch] || this.cases['?']; l += c.l + INTERLETTRE; }
    return Math.max(0, l - INTERLETTRE);
  },
  // Découpe en lignes ne dépassant pas largeurMax (pixels à l'échelle 1).
  couper(s, largeurMax) {
    const lignes = [];
    for (const para of String(s).split('\n')) {
      let cur = '';
      // typographie française : « % : ; ! ? » » restent avec le mot précédent, « « » avec le suivant
      const mots = [];
      for (const m of para.split(' ')) {
        if (mots.length && /^[%:;!?»]+[.,]?$/.test(m)) mots[mots.length - 1] += ' ' + m;
        else if (mots.length && mots[mots.length - 1] === '«') mots[mots.length - 1] += ' ' + m;
        else mots.push(m);
      }
      for (const mot of mots) {
        const essai = cur ? cur + ' ' + mot : mot;
        if (this.largeur(essai) <= largeurMax || !cur) cur = essai; else { lignes.push(cur); cur = mot; }
      }
      lignes.push(cur);
    }
    return lignes;
  },
  // options : { e: échelle entière, a: 'g'|'c'|'d', ombre: couleur|null, contour: couleur|null }
  // Chaque texte (chaîne, couleur, échelle, ombre ou contour) est composé une fois dans une petite toile
  // puis posé d'un seul drawImage : un glyphe par appel coûtait l'essentiel du rendu logiciel.
  ecrire(ctx, s, x, y, couleur = '#f4ecd8', o = {}) {
    if (!this.atlas) this.preparer();
    s = this.normaliser(s); const e = o.e || 1;
    const l = this.largeur(s) * e;
    const px = Math.round(o.a === 'c' ? x - l / 2 : o.a === 'd' ? x - l : x), py = Math.round(y);
    if (!l) return l;
    const cle = s + '\u0001' + couleur + '\u0001' + e + '\u0001' + (o.contour || '') + '\u0001' + (o.ombre === null ? '-' : o.ombre || '');
    let r = this.rendus.get(cle);
    if (!r) {
      r = document.createElement('canvas'); r.width = l + 2 * e; r.height = 14 * e;
      const g = r.getContext('2d'); g.imageSmoothingEnabled = false;
      if (o.contour) { for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]]) this._brut(g, s, e + dx * e, 3 * e + dy * e, o.contour, e); }
      else if (o.ombre !== null) this._brut(g, s, 2 * e, 4 * e, o.ombre || '#14101c', e);
      this._brut(g, s, e, 3 * e, couleur, e);
      if (this.rendus.size >= 900) this.rendus.delete(this.rendus.keys().next().value); // les plus anciens d'abord
      this.rendus.set(cle, r);
    }
    ctx.drawImage(r, px - e, py - 3 * e);
    return l;
  },
  _brut(ctx, s, x, y, couleur, e) {
    const at = this.teinte(couleur);
    for (const ch of s) {
      if (ch === ' ') { x += (ESPACE_L + INTERLETTRE) * e; continue; }
      const c = this.cases[ch] || this.cases['?'];
      ctx.drawImage(at, c.x, c.y, c.l, 12, x, y - 2 * e, c.l * e, 12 * e);
      x += (c.l + INTERLETTRE) * e;
    }
  },
  // Paragraphe coupé ; renvoie la hauteur utilisée.
  paragraphe(ctx, s, x, y, largeurMax, couleur, o = {}) {
    const e = o.e || 1; const lignes = this.couper(s, largeurMax / e);
    lignes.forEach((ln, i) => this.ecrire(ctx, ln, x, y + i * (o.interligne || HAUTEUR_LIGNE) * e, couleur, o));
    return lignes.length * (o.interligne || HAUTEUR_LIGNE) * e;
  },
};
