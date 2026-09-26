// ═══════════════════════════════════════════════════════════════════════════
// Sprites des personnages : grandes têtes expressives (26×22) + petits corps
// procéduraux (14×11), assemblés en toiles 32×32 (ancre aux pieds : 16, 31).
// La tête et le corps sont séparés : on tire dans une direction en marchant
// dans une autre. Coiffures dessinées à la main ; contour automatique.
// Codes des cartes de tête : h/g/H cheveux (base/lumière/ombre), b bandeau,
// p/P plaque, k/K masque, r rouge, v violet, m traits sombres, s peau,
// e/w œil/éclat (surcharge), c/C couleurs propres au personnage.
// ═══════════════════════════════════════════════════════════════════════════

const PEAU = { s: '#f4c8a2', d: '#d69a78', l: '#fde2cc' };
const TETE_RANGS = { 6: [10, 15], 7: [8, 17], 8: [7, 18], 9: [6, 19], 10: [5, 20], 11: [5, 20], 12: [4, 21], 13: [4, 21], 14: [4, 21], 15: [4, 21], 16: [4, 21], 17: [5, 20], 18: [5, 20], 19: [6, 19], 20: [8, 17] };

function carteTeteBase(vue) {
  const L = []; for (let y = 0; y < 22; y++) L.push(Array(26).fill('.'));
  for (const [y, [a, b]] of Object.entries(TETE_RANGS)) for (let x = a; x <= b; x++) {
    let k = 's';
    if (x >= b - 1 && y >= 11) k = 'd';
    if (y >= 19) k = 'd';
    if (y <= 8 && x <= a + 2 && x >= a) k = 'l';
    L[y][x] = k;
  }
  const oeil = (x0) => { L[13][x0] = 'w'; L[13][x0 + 1] = 'e'; L[13][x0 + 2] = 'e'; for (let x = x0; x < x0 + 3; x++) { L[14][x] = 'e'; L[15][x] = 'e'; } L[16][x0 + 1] = 'e'; };
  if (vue === 'face') { oeil(7); oeil(16); L[18][12] = 'm'; L[18][13] = 'm'; }
  else if (vue === 'cote') { oeil(16); L[18][19] = 'm'; L[18][18] = 'm'; L[14][6] = 'd'; L[15][6] = 'd'; L[15][7] = 'd'; }
  return L;
}

// Coiffures (26 colonnes × 22 lignes ; « . » = rien)
const COIFFURES = {
  naruto: {
    face: [
      '..........................',
      '.......h....h.....h.......',
      '....h..hh..hhh...hh..h....',
      '....hh.hgh.hggh.hhg.hh....',
      '...hhhhhgghhgghhhgghhhh...',
      '..hhhgggggghgggghgggghhh..',
      '.hhhhgggggggggggggggghhhh.',
      '..hhhhhgggggggggggghhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '...hhbbbbbPppppPbbbbbhh...',
      '...hhbbbbbPpPPpPbbbbbhh...',
      '...hh..hh...hh...hh..hh...',
      '...h.........h........h...',
      '...h..................h...',
      '..........................',
      '..........................',
      '....mm..............mm....',
      '....mm..............mm....'],
    cote: [
      '..........................',
      '........h.....h...........',
      '.....h..hh...hhh...h......',
      '....hhh.hgh.hggh..hhg.....',
      '...hhhhhhgghhgghhhhhgh....',
      '..hhhhhhggggggggghhhhhh...',
      '.hhhhhhhgggggggggghhhhhh..',
      '.hhhhhhhhhggggggghhhhhhh..',
      'hhhhhhhhhhhhhhhhhhhhhhh...',
      '.hhhhhhhhhhhhhhhhhhhhhh...',
      'bbhhhhbbbbbbbbbbbbPppP....',
      '.bbhhhbbbbbbbbbbbbPpPP....',
      '.b.hhhhh....h....hh.......',
      '...hhhh.......h...........',
      '...hhh....................',
      '....h.....................',
      '..........................',
      '..........................',
      '...................mm.....',
      '...................mm.....'],
    dos: [
      '..........................',
      '.......h....h.....h.......',
      '....h..hh..hhh...hh..h....',
      '....hh.hgh.hggh.hhg.hh....',
      '...hhhhhgghhgghhhgghhhh...',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '.hhhhhhhhhhhhhhhhhhhhhhhh.',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '...hhbbbbbbbbbbbbbbbbhh...',
      '...hhbbbbbbbbbbbbbbbbhh...',
      '...hhhhhhhhbbbbhhhhhhhh...',
      '...hhhhhhhhbhhbhhhhhhhh...',
      '....hhhhhhbhhhhbhhhhhh....',
      '.....hhhhhhhhhhhhhhhh.....',
      '......hhhhhhhhhhhhhh......'],
  },
  sasuke: {
    face: [
      '..........................',
      '................h..h......',
      '.........hhhhhhhhhhh......',
      '......hhhhhhhhhhhhhhhh....',
      '....hhhhggggggghhhhhhhh...',
      '...hhhhggggggggghhhhhh....',
      '..hhhhgggggggggggghhhhh...',
      '..hhhhhhhhhhhhhhhhhhhhh...',
      '.hhhhhhhhhhhhhhhhhhhhhhh..',
      '.hhhhhhhhhhhhhhhhhhhhhhh..',
      '.hhhhbbbbbPppppPbbbbbhhhh.',
      '.hhhhbbbbbPpPPpPbbbbbhhhh.',
      '.hhhhh..hh...h....hh.hhhh.',
      '..hhh.................hhh.',
      '..hhh.................hhh.',
      '..hhh.................hh..',
      '..hh..................hh..',
      '...h..................h...',
      '...h..................h...'],
    cote: [
      '..........................',
      '.h..h.....................',
      '.hh.hh.hhhhhhh............',
      '..hhhhhhhhhhhhhhh.........',
      'hhhhhhhhhgggggghhhh.......',
      '.hhhhhhhhggggggghhhhh.....',
      'hhhhhhhhggggggggghhhhh....',
      '.hhhhhhhhhhhhhhhhhhhhhh...',
      '..hhhhhhhhhhhhhhhhhhhhh...',
      '..hhhhhhhhhhhhhhhhhhhhh...',
      '..bbhhhbbbbbbbbbbbbPppP...',
      '..bbhhhbbbbbbbbbbbbPpPP...',
      '..b.hhhhhh........hh.hh...',
      '....hhhhh.............h...',
      '....hhhh..............h...',
      '....hhh...................',
      '.....h....................'],
    dos: [
      '..........................',
      '....h..h....h...h..h......',
      '....hh.hh..hhh.hh.hh......',
      '.....hhhhhhhhhhhhhhh......',
      '...hhhhhhhhhhhhhhhhhhh....',
      '..hhhhhhhhhhhhhhhhhhhhh...',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '.hhhhhhhhhhhhhhhhhhhhhhh..',
      '.hhhhhhhhhhhhhhhhhhhhhhh..',
      '.hhhhhhhhhhhhhhhhhhhhhhh..',
      '.hhhhbbbbbbbbbbbbbbbbhhhh.',
      '.hhhhbbbbbbbbbbbbbbbbhhhh.',
      '..hhhhhhhhhbbbbhhhhhhhhh..',
      '..hhhhhhhhhbhhbhhhhhhhhh..',
      '...hhhhhhhbhhhhbhhhhhhh...',
      '....hhhhhhhhhhhhhhhhhh....',
      '.....hhhhhhhhhhhhhhhh.....'],
  },
  sakura: {
    face: [
      '..........................',
      '..........................',
      '..........hhhhhh..........',
      '.......hhhhhhhhhhhh.......',
      '.....hhhhhggggghhhhhh.....',
      '....hhhhggggggggghhhhh....',
      '...hhhbbbbbPppPbbbbbhhh...',
      '...hhbbbbbbPpPPbbbbbbhh...',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhh..hhhhhhhhhhh..',
      '..hhhhhhh......hhhhhhhhh..',
      '.hhhhh...........hh.hhhhh.',
      '.hhhh.................hhh.',
      '.hhhh.................hhh.',
      '.hhh..................hhh.',
      '.hhh..................hhh.',
      '.hhh..................hhh.',
      '..hh..................hh..',
      '..h....................h..'],
    cote: [
      '..........................',
      '..........................',
      '.........hhhhhh...........',
      '......hhhhhhhhhhhh........',
      '....hhhhhhgggggghhhh......',
      '...hhhhhhgggggggghhhh.....',
      '..hhhhbbbbbbbbbbPppPhh....',
      '..hhhbbbbbbbbbbbPpPPhh....',
      '.hhhhhhhhhhhhhhhhhhhhhh...',
      '.hhhhhhhhhhhhhhhhhhhhhh...',
      '.hhhhhhhhhhhhhhhhhh.hhh...',
      '.hhhhhhhhhhhhhhhh.........',
      '.hhhhhhhhh................',
      '.hhhhhhhhh................',
      '.hhhhhhhh.................',
      '.hhhhhhhh.................',
      '.hhhhhhh..................',
      '..hhhhhh..................',
      '..hhhhh...................',
      '...hhh....................'],
    dos: [
      '..........................',
      '..........................',
      '..........hhhhhh..........',
      '.......hhhhhhhhhhhh.......',
      '.....hhhhhhhhhhhhhhhh.....',
      '....hhhhhhhhhhhhhhhhhh....',
      '...hhhbbbbbbbbbbbbbbhhh...',
      '...hhbbbbbbbbbbbbbbbbhh...',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '.hhhhhhhhhhhhhhhhhhhhhhhh.',
      '.hhhhhhhhhhhhhhhhhhhhhhhh.',
      '.hhhhhhhhhhhhhhhhhhhhhhhh.',
      '.hhhhhhhhhhhhhhhhhhhhhhhh.',
      '.hhhhhhhhhhhhhhhhhhhhhhhh.',
      '.hhhhhhhhhhhhhhhhhhhhhhhh.',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '...hhhhhhhhhhhhhhhhhhhh...'],
  },
  kakashi: {
    face: [
      '..h.......................',
      '..hh.....h................',
      '..hgh...hh...h............',
      '..hggh.hgh..hh....h.......',
      '...hgghhgghhgh...hh.......',
      '...hhgggggggghhhhgh.......',
      '..hhhggggggggggghhhh......',
      '..hhhhhggggggggghhhhhh....',
      '..hhhhhhhhhhhhhhhhhhhhh...',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '...hbbbbbbbbPppPbbbbbbh...',
      '...hhbbbbbbbPpPPbbbbbbbh..',
      '...h....hh...bbbbbbbbbbb..',
      '..............bbbbbbbbb...',
      '...............bbbbbbb....',
      '................bbbbb.....',
      '..........................',
      '....kkkkkkkkkkkkkkkkkk....',
      '....kkkkkkkkkkkkkkkkkK....',
      '.....kkkkkkkkkkkkkkkK.....',
      '.......kkkkkkkkkkkK.......'],
    cote: [
      'h.........................',
      'hh....h...................',
      'hgh..hh...h...............',
      'hggh.hgh.hh...............',
      '.hgghhgghhgh..............',
      '.hhhgggggggghhhh..........',
      '..hhhgggggggggghhhh.......',
      '..hhhhhhggggggghhhhhh.....',
      '..hhhhhhhhhhhhhhhhhhhh....',
      '...hhhhhhhhhhhhhhhhhhh....',
      '..bbhhbbbbbbbbbbbbbbPpP...',
      '..bbhhbbbbbbbbbbbbbbPPP...',
      '..b.hhhh......bbbbbbbb....',
      '....hhh.........bbbbb.....',
      '....hh....................',
      '..........................',
      '..........................',
      '....kkkkkkkkkkkkkkkkkk....',
      '....kkkkkkkkkkkkkkkkkkK...',
      '.....kkkkkkkkkkkkkkkkK....',
      '.......kkkkkkkkkkkK.......'],
    dos: [
      '..h.......................',
      '..hh.....h................',
      '..hgh...hh...h............',
      '..hggh.hgh..hh....h.......',
      '...hgghhgghhgh...hh.......',
      '...hhhhhhhhhhhhhhhhh......',
      '..hhhhhhhhhhhhhhhhhhh.....',
      '..hhhhhhhhhhhhhhhhhhhhh...',
      '..hhhhhhhhhhhhhhhhhhhhh...',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '...hbbbbbbbbbbbbbbbbbbh...',
      '...hhbbbbbbbbbbbbbbbbbh...',
      '...hhhhhhhhbbbbhhhhhhhh...',
      '....hhhhhhhbhhbhhhhhhh....',
      '.....hhhhhbhhhhbhhhhh.....',
      '......hhhhhhhhhhhhhhh.....',
      '..........................',
      '....kkkkkkkkkkkkkkkkkk....',
      '....kkkkkkkkkkkkkkkkkk....',
      '.....kkkkkkkkkkkkkkkk.....',
      '.......kkkkkkkkkkkk.......'],
  },
  lee: {
    face: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '........hhhhhhhhhh........',
      '......hhhhhhhhhhhhhh......',
      '.....hhhgggggggggghhh.....',
      '....hhhhhhhhhhhhhhhhhh....',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhh.hhhhh....hhhhh.hhh..',
      '..hhh................hhh..',
      '..hhh................hhh..',
      '...hh................hh...',
      '...h..................h...'],
    cote: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '.......hhhhhhhhhh.........',
      '.....hhhhhhhhhhhhhh.......',
      '....hhhhgggggggggghh......',
      '...hhhhhhhhhhhhhhhhhh.....',
      '..hhhhhhhhhhhhhhhhhhhh....',
      '..hhhhhhhhhhhhhhhhhhhh....',
      '..hhhhhhhhhhhhhhhhhhhhh...',
      '..hhhhhhhhhhhhhhhhhhhhh...',
      '..hhhhhhhh......hhhhh.....',
      '..hhhhhhh.................',
      '..hhhhhh..................',
      '...hhhh...................',
      '....hh....................'],
    dos: [
      '..........................',
      '..........................',
      '..........................',
      '..........................',
      '........hhhhhhhhhh........',
      '......hhhhhhhhhhhhhh......',
      '.....hhhgggggggggghhh.....',
      '....hhhhhhhhhhhhhhhhhh....',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '....hhhhhhhhhhhhhhhhhh....'],
  },
  hinata: {
    face: [
      '..........................',
      '..........................',
      '..........................',
      '........hhhhhhhhh.........',
      '......hhhhgggghhhhh.......',
      '.....hhhggggggggghhhh.....',
      '....hhhhhhhhhhhhhhhhhh....',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhh..............hhhh..',
      '..hhh................hhh..',
      '..hhh................hhh..',
      '..hhh................hhh..',
      '..hhh................hhh..',
      '..hhh................hhh..',
      '..hhh................hhh..',
      '...hh................hh...',
      '...h..................h...'],
    cote: [
      '..........................',
      '..........................',
      '..........................',
      '.......hhhhhhhhh..........',
      '.....hhhhhgggghhhh........',
      '....hhhhhggggggghhhh......',
      '...hhhhhhhhhhhhhhhhhh.....',
      '..hhhhhhhhhhhhhhhhhhhh....',
      '..hhhhhhhhhhhhhhhhhhhh....',
      '.hhhhhhhhhhhhhhhhhhhhhh...',
      '.hhhhhhhhhhhhhhhhhhhhhh...',
      '.hhhhhhhhhhhhhhhhhhhhhh...',
      '.hhhhhhhhhhhhhhh..hhhh....',
      '.hhhhhhhhhhh..............',
      '.hhhhhhhhhh...............',
      '.hhhhhhhhhh...............',
      '.hhhhhhhhh................',
      '.hhhhhhhhh................',
      '.hhhhhhhhh................',
      '..hhhhhhhh................',
      '..hhhhhhh.................',
      '...hhhhh..................'],
    dos: [
      '..........................',
      '..........................',
      '..........................',
      '........hhhhhhhhh.........',
      '......hhhhhhhhhhhhh.......',
      '.....hhhhhhhhhhhhhhhh.....',
      '....hhhhhhhhhhhhhhhhhh....',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '....hhhhhhhhhhhhhhhhhh....'],
  },
  shikamaru: {
    face: [
      '...........h..h...........',
      '..........hhhhhh..........',
      '.........hhghhhhh.........',
      '..........hhhhhh..........',
      '...........hhhh...........',
      '..........hhhhhh..........',
      '.......hhhhhhhhhhhh.......',
      '......hhhhhgggghhhhhh.....',
      '.....hhhhhhhhhhhhhhhhh....',
      '....hhhhhhhhhhhhhhhhhhh...',
      '....hhh............hhh....',
      '....hh..............hh....',
      '....h................h....'],
    cote: [
      '..........................',
      '..h..h....................',
      '..hhhhhh..................',
      '...hhghhh.................',
      '....hhhhh.................',
      '.....hhhhhhhhhhh..........',
      '....hhhhhhhhhhhhhhh.......',
      '...hhhhhhhhgggghhhhhh.....',
      '..hhhhhhhhhhhhhhhhhhhh....',
      '..hhhhhhhhhhhhhhhhhhhh....',
      '..hhhhhhhhhhhhh...........',
      '..hhhhhhhhh...............',
      '...hhhhh..................',
      '....hh....................'],
    dos: [
      '...........h..h...........',
      '..........hhhhhh..........',
      '.........hhghhhhh.........',
      '..........hhhhhh..........',
      '...........hhhh...........',
      '..........hhhhhh..........',
      '.......hhhhhhhhhhhh.......',
      '......hhhhhhhhhhhhhh......',
      '.....hhhhhhhhhhhhhhhh.....',
      '....hhhhhhhhhhhhhhhhhh....',
      '....hhhhhhhhhhhhhhhhhh....',
      '....hhhhhhhhhhhhhhhhhh....',
      '....hhhhhhhhhhhhhhhhhh....',
      '.....hhhhhhhhhhhhhhhh.....',
      '......hhhhhhhhhhhhhh......'],
  },
  gaara: {
    face: [
      '..........................',
      '...........h..............',
      '.......h..hh...h..........',
      '......hh.hhhh.hh...h......',
      '.....hhhhhgghhhh..hh......',
      '....hhhhhggggghhhhhh......',
      '...hhhhhggggggghhhhhh.....',
      '...hhhhhhhhhhhhhhhhhhh....',
      '..hhhhhhhhhhhhhhhhhhhhh...',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhh.hhhhh.hhhh.hhhhhh..',
      '..hhh...hhh...hh...r.hhh..',
      '..hh.....h........rrr.hh..',
      '..h................r......',
      '..h.......................'],
    cote: [
      '..........................',
      '.........h................',
      '.....h..hh...h............',
      '....hh.hhhh.hh............',
      '...hhhhhhgghhhh...........',
      '..hhhhhhggggghhhhh........',
      '.hhhhhhhgggggghhhhhh......',
      '.hhhhhhhhhhhhhhhhhhhhh....',
      '..hhhhhhhhhhhhhhhhhhhhh...',
      '..hhhhhhhhhhhhhhhhhhhhh...',
      '..hhhhhhhhhh.hhhh.hhhh....',
      '..hhhhhhhh...hh.....r.....',
      '..hhhhhh...........rrr....',
      '...hhhh.............r.....',
      '....hh....................'],
    dos: [
      '..........................',
      '...........h..............',
      '.......h..hh...h..........',
      '......hh.hhhh.hh...h......',
      '.....hhhhhhhhhhh..hh......',
      '....hhhhhhhhhhhhhhhh......',
      '...hhhhhhhhhhhhhhhhhh.....',
      '...hhhhhhhhhhhhhhhhhhh....',
      '..hhhhhhhhhhhhhhhhhhhhh...',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '....hhhhhhhhhhhhhhhhhh....',
      '......hhhhhhhhhhhhhh......'],
  },
  kankuro: {
    face: [
      '...h..................h...',
      '...hh................hh...',
      '...hhh..............hhh...',
      '...hhhh............hhhh...',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '...hhhhhggggggggghhhhhh...',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhbbbbbPppPbbbbbhhhh..',
      '..hhhhbbbbbPpPPbbbbbhhhh..',
      '..hhhh..............hhhh..',
      '..hhh....v......v....hhh..',
      '..hhh................hhh..',
      '..hhh................hhh..',
      '..hhh................hhh..',
      '..hhh................hhh..',
      '..hhh..vv........vv..hhh..',
      '..hhh...v...vv...v...hhh..',
      '..hhhh..............hhhh..',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '.....hhhhhhhhhhhhhhhh.....'],
    cote: [
      '......h..........h........',
      '......hh........hh........',
      '......hhh......hhh........',
      '.....hhhhhhhhhhhhhh.......',
      '....hhhhhhhhhhhhhhhhh.....',
      '...hhhhhgggggggggghhhh....',
      '..hhhhhhhhhhhhhhhhhhhhh...',
      '..hhhhhhhhhhhhhhhhhhhhh...',
      '..hhhhhhhhhhhhhhhhhhhhh...',
      '..hhhhhhbbbbbbbbbbbPpPh...',
      '..hhhhhhbbbbbbbbbbbPPPh...',
      '..hhhhhhhhhhh.............',
      '..hhhhhhhhhh.....v........',
      '..hhhhhhhhh...............',
      '..hhhhhhhhh...............',
      '..hhhhhhhhh...............',
      '..hhhhhhhhh...............',
      '..hhhhhhhhh.......vv......',
      '..hhhhhhhhh........v......',
      '..hhhhhhhhhh..............',
      '...hhhhhhhhhhh............',
      '.....hhhhhhhh.............'],
    dos: [
      '...h..................h...',
      '...hh................hh...',
      '...hhh..............hhh...',
      '...hhhh............hhhh...',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhbbbbbbbbbbbbbbhhhh..',
      '..hhhhbbbbbbbbbbbbbbhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '.....hhhhhhhhhhhhhhhh.....'],
  },
  kiba: {
    face: [
      '..........................',
      '.......h.....h.....h......',
      '.....h.hh...hhh...hh.h....',
      '.....hhhhh.hhhhh.hhhhh....',
      '....hhhhhhhhgghhhhhhhhh...',
      '...hhhhhhgggggggghhhhhh...',
      '..hhhhhhggggggggggghhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '...hhbbbbbPppppPbbbbbhh...',
      '...hhbbbbbPpPPpPbbbbbhh...',
      '...hh.h..hh....hh..h.hh...',
      '...h..................h...',
      '..........................',
      '..........................',
      '.....r................r...',
      '.....rr..............rr...',
      '.....r................r...'],
    cote: [
      '..........................',
      '........h.....h...........',
      '......h.hh...hhh..........',
      '.....hhhhhh.hhhhh.........',
      '....hhhhhhhhhgghhhh.......',
      '...hhhhhhhhggggggghhh.....',
      '..hhhhhhhhhgggggggghhh....',
      '..hhhhhhhhhhhhhhhhhhhhh...',
      '..hhhhhhhhhhhhhhhhhhhhh...',
      '...hhhhhhhhhhhhhhhhhhh....',
      '..bbhhhhbbbbbbbbbbbPppP...',
      '..bbhhhhbbbbbbbbbbbPpPP...',
      '..b.hhhhh.....h..h.hh.....',
      '....hhhh..................',
      '....hhh...................',
      '..........................',
      '...................r......',
      '...................rr.....',
      '...................r......'],
    dos: [
      '..........................',
      '.......h.....h.....h......',
      '.....h.hh...hhh...hh.h....',
      '.....hhhhh.hhhhh.hhhhh....',
      '....hhhhhhhhhhhhhhhhhhh...',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '...hhbbbbbbbbbbbbbbbbhh...',
      '...hhbbbbbbbbbbbbbbbbhh...',
      '...hhhhhhhhbbbbhhhhhhhh...',
      '...hhhhhhhhbhhbhhhhhhhh...',
      '....hhhhhhbhhhhbhhhhhh....',
      '.....hhhhhhhhhhhhhhhh.....'],
  },
  sasori: {
    face: [
      '..........................',
      '..........................',
      '..........h....h..........',
      '.......h..hh..hh..h.......',
      '......hhhhhhhhhhhhhh......',
      '.....hhhhhggggghhhhhh.....',
      '....hhhhggggggggghhhhh....',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhh.hhhhh..hhhh.hhhh..',
      '..hhh....hhh....hh...hhh..',
      '..hh.................hhh..',
      '..hh..................hh..',
      '...h..................h...'],
    cote: [
      '..........................',
      '..........................',
      '.........h....h...........',
      '......h..hh..hh...........',
      '.....hhhhhhhhhhhhh........',
      '....hhhhhhhgggghhhhh......',
      '...hhhhhhhggggggghhhhh....',
      '..hhhhhhhhhhhhhhhhhhhhh...',
      '..hhhhhhhhhhhhhhhhhhhhh...',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhh..hhhh.hh...',
      '..hhhhhhhhh.....hh........',
      '..hhhhhhh.................',
      '...hhhhh..................',
      '....hhh...................'],
    dos: [
      '..........................',
      '..........................',
      '..........h....h..........',
      '.......h..hh..hh..h.......',
      '......hhhhhhhhhhhhhh......',
      '.....hhhhhhhhhhhhhhhh.....',
      '....hhhhhhhhhhhhhhhhhh....',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '....hhhhhhhhhhhhhhhhhh....',
      '.....hhhhhhhhhhhhhhhh.....'],
  },
  kakuzu: {
    face: [
      '..........................',
      '..........................',
      '..........................',
      '.........hhhhhhhh.........',
      '.......hhhhhhhhhhhh.......',
      '.....hhhhhhgggghhhhhh.....',
      '....hhhhhhhhhhhhhhhhhh....',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '...hhbbbbbPppppPbbbbbhh...',
      '..hhhbbbbbPpPPpPbbbbbhhh..',
      '..hhhbbbbbbbbbbbbbbbbhhh..',
      '..hhhh..............hhhh..',
      '..hhh................hhh..',
      '..hhh................hhh..',
      '..hhh................hhh..',
      '..hhh................hhh..',
      '..hhhkkkkkkkkkkkkkkkkhhh..',
      '..hhhkkkkkkkkkkkkkkkkhhh..',
      '..hhhkkkkkkkkkkkkkkkkhhh..',
      '...hhhkkkkkkkkkkkkkkhhh...',
      '....hhhhkkkkkkkkkkhhhh....',
      '......hhhhhhhhhhhhhh......'],
    cote: [
      '..........................',
      '..........................',
      '..........................',
      '........hhhhhhhh..........',
      '......hhhhhhhhhhhh........',
      '....hhhhhhhhgggghhhh......',
      '...hhhhhhhhhhhhhhhhhh.....',
      '..hhhhhhhhhhhhhhhhhhhh....',
      '..hhhhhbbbbbbbbbbbPppP....',
      '..hhhhhbbbbbbbbbbbPpPP....',
      '..hhhhhbbbbbbbbbbbbbbb....',
      '..hhhhhhhhhhhhh...........',
      '..hhhhhhhhhhh.............',
      '..hhhhhhhhhhh.............',
      '..hhhhhhhhhhh.............',
      '..hhhhhhhhhhh.............',
      '..hhhhhhhhhhhkkkkkkkkkk...',
      '..hhhhhhhhhhhkkkkkkkkkk...',
      '..hhhhhhhhhhhkkkkkkkkkk...',
      '...hhhhhhhhhhkkkkkkkkk....',
      '....hhhhhhhhhkkkkkkkk.....',
      '......hhhhhhhhhhhh........'],
    dos: [
      '..........................',
      '..........................',
      '..........................',
      '.........hhhhhhhh.........',
      '.......hhhhhhhhhhhh.......',
      '.....hhhhhhhhhhhhhhhh.....',
      '....hhhhhhhhhhhhhhhhhh....',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '...hhbbbbbbbbbbbbbbbbhh...',
      '..hhhbbbbbbbbbbbbbbbbhhh..',
      '..hhhbbbbbbbbbbbbbbbbhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '..hhhhhhhhhhhhhhhhhhhhhh..',
      '...hhhhhhhhhhhhhhhhhhhh...',
      '....hhhhhhhhhhhhhhhhhh....',
      '......hhhhhhhhhhhhhh......'],
  },
};

// Corps procéduraux (14 × 11) : modes standard / combinaison / veste / manteau
function carteCorps(vue, frame, mode) {
  const vide = () => Array(14).fill('.');
  const L = []; for (let y = 0; y < 11; y++) L.push(vide());
  const set = (y, s) => { for (let x = 0; x < s.length; x++) if (s[x] !== '.') L[y][x] = s[x]; };
  const pas = frame % 2 === 1; const cotePas = frame === 1 ? 1 : frame === 3 ? -1 : 0;
  if (vue === 'face' || vue === 'dos') {
    set(0, '....cccccc....');
    set(1, '..tttttttttt..');
    set(2, '.atttttttttTA.');
    set(3, '.atttttttttTA.');
    set(4, '.atttttttttTA.');
    set(5, vue === 'face' ? '.kttttttttttk.' : '.kTTTTTTTTTTk.');
    set(6, '..eeeeeeeeee..');
    if (mode === 'manteau') {
      for (let y = 1; y <= 9; y++) for (let x = 2; x <= 11; x++) L[y][x] = (x >= 10 ? 'T' : 't');
      set(5, '.kttttttttttk.'); for (let x = 2; x <= 11; x++) L[6][x] = 't';
      set(9, pas ? '..tttttttttt..' : '..tttttttttt..');
      set(10, cotePas > 0 ? '...ff....fff..' : cotePas < 0 ? '..fff....ff...' : '..fff....fff..');
      return L;
    }
    const jambe = (x0, leve) => { const y0 = leve ? 6 : 7; for (let y = y0; y <= y0 + 2; y++) for (let x = x0; x < x0 + 4; x++) L[y][x] = (x === x0 + 3 ? 'P' : 'p'); for (let x = x0; x < x0 + 4; x++) L[y0 + 3][x] = 'f'; };
    jambe(2, cotePas === 1); jambe(8, cotePas === -1);
    if (mode === 'veste') { for (const y of [1, 2, 3, 4]) { L[y][2] = 'v'; L[y][3] = 'v'; L[y][10] = 'v'; L[y][11] = 'V'; } L[1][4] = 'v'; L[1][9] = 'v'; }
  } else { // côté, tourné vers la droite
    set(0, '.....cccc.....');
    set(1, '....tttttt....');
    set(2, '....tttttTT...');
    set(3, '....ttttttT...');
    set(4, '....ttttttT...');
    set(5, '....tttttTT...');
    set(6, '....eeeeeee...');
    if (mode === 'manteau') {
      for (let y = 1; y <= 9; y++) for (let x = 4; x <= 10; x++) L[y][x] = x >= 9 ? 'T' : 't';
      set(10, pas ? '...ff....ff...' : '....fffff.....');
      const bx = pas ? (frame === 1 ? 8 : 5) : 7; L[3][bx] = 'a'; L[4][bx] = 'a'; L[5][bx] = 'k';
      return L;
    }
    if (!pas) { set(7, '.....ppppP....'); set(8, '.....ppppP....'); set(9, '.....ppppP....'); set(10, '.....fffff....'); }
    else { set(7, '....pP..pP....'); set(8, '...pP....pP...'); set(9, '..pP......pP..'); set(10, '..ff......fff.'); }
    const bx = pas ? (frame === 1 ? 9 : 5) : 7; const by = pas ? 2 : 3;
    L[by][bx] = 'a'; L[by + 1][bx] = 'a'; L[by + 2][bx] = 'a'; L[Math.min(6, by + 3)][bx] = 'k';
    if (mode === 'veste') { for (const y of [1, 2, 3, 4, 5]) { L[y][4] = 'v'; L[y][9] = 'V'; } }
  }
  return L;
}

// Définitions visuelles des personnages (couleurs + coiffure + corps + options)
const VISUELS = {
  naruto: { coiffure: 'naruto', c: { h: '#f6cf3e', g: '#fff19c', H: '#c99a26', b: '#28407c', p: '#cfd2de', P: '#6a7088', m: '#6a3424' },
    corps: { mode: 'combinaison', t: '#f28a22', T: '#c8661a', a: '#f28a22', A: '#c8661a', c: '#243458', e: '#243458', p: '#f28a22', P: '#c8661a', f: '#28407c' } },
  sasuke: { coiffure: 'sasuke', c: { h: '#2c2e4a', g: '#505a8a', H: '#191a2c', b: '#28407c', p: '#cfd2de', P: '#6a7088' },
    corps: { mode: 'standard', t: '#34406e', T: '#262f54', a: '#34406e', A: '#262f54', c: '#34406e', e: '#e6e1d4', p: '#e6e1d4', P: '#b8b2a4', f: '#28407c' } },
  sakura: { coiffure: 'sakura', c: { h: '#f39ab8', g: '#ffcadb', H: '#cf6a90', b: '#28407c', p: '#cfd2de', P: '#6a7088' },
    corps: { mode: 'standard', t: '#c83442', T: '#96222e', a: '#c83442', A: '#96222e', c: '#f0e8e0', e: '#3a3a4a', p: '#3a3a4a', P: '#26262f', f: '#28407c' } },
  kakashi: { coiffure: 'kakashi', c: { h: '#d9dde6', g: '#f6f7fb', H: '#9aa1b0', b: '#28407c', p: '#cfd2de', P: '#6a7088', k: '#2c3346', K: '#1c2231' }, yeux: 'etroit',
    corps: { mode: 'veste', t: '#2c3450', T: '#1f253b', a: '#2c3450', A: '#1f253b', c: '#2c3346', e: '#1f253b', p: '#2c3450', P: '#1f253b', f: '#1f253b', v: '#5e7e3e', V: '#46612c' } },
  lee: { coiffure: 'lee', c: { h: '#16161c', g: '#4e4e68', H: '#08080c' }, sourcils: true, yeux: 'rond',
    corps: { mode: 'combinaison', t: '#3c9a3c', T: '#2a782a', a: '#3c9a3c', A: '#2a782a', c: '#3c9a3c', e: '#c83442', p: '#3c9a3c', P: '#2a782a', f: '#f28a22' } },
  hinata: { coiffure: 'hinata', c: { h: '#2e2e62', g: '#4c4c90', H: '#1a1a3c' }, yeux: 'byakugan',
    corps: { mode: 'standard', t: '#d6cce8', T: '#a89cc8', a: '#d6cce8', A: '#a89cc8', c: '#28407c', e: '#a89cc8', p: '#2c3050', P: '#1e2238', f: '#28407c' } },
  shikamaru: { coiffure: 'shikamaru', c: { h: '#2a2420', g: '#4c4038', H: '#15110e' }, yeux: 'etroit',
    corps: { mode: 'veste', t: '#3e4a5a', T: '#2e3846', a: '#3e4a5a', A: '#2e3846', c: '#5e7e3e', e: '#2e3846', p: '#2c3450', P: '#1f253b', f: '#1f253b', v: '#5e7e3e', V: '#46612c' } },
  gaara: { coiffure: 'gaara', c: { h: '#c63a2a', g: '#ea6a4c', H: '#8a2418', r: '#a0202a' }, yeux: 'cerne',
    corps: { mode: 'manteau', t: '#7c3a2c', T: '#5a2a20', a: '#7c3a2c', A: '#5a2a20', c: '#a8a090', e: '#a8a090', p: '#5a2a20', P: '#3e1c16', f: '#3a2a22' }, dos: 'gourde' },
  kankuro: { coiffure: 'kankuro', c: { h: '#27272f', g: '#3e3e50', H: '#16161c', b: '#28407c', p: '#cfd2de', P: '#6a7088', v: '#9a3ab8' },
    corps: { mode: 'combinaison', t: '#27272f', T: '#18181e', a: '#27272f', A: '#18181e', c: '#27272f', e: '#6a5a40', p: '#27272f', P: '#18181e', f: '#28407c' }, dos: 'marionnette' },
  kiba: { coiffure: 'kiba', c: { h: '#5c3a26', g: '#7e5838', H: '#3a2418', b: '#28407c', p: '#cfd2de', P: '#6a7088', r: '#c8303a' }, yeux: 'fente',
    corps: { mode: 'standard', t: '#6c6c7a', T: '#50505c', a: '#6c6c7a', A: '#50505c', c: '#d8d0c0', e: '#3a3a48', p: '#2c3450', P: '#1f253b', f: '#1f253b' } },
  sasori: { coiffure: 'sasori', c: { h: '#c63a2a', g: '#e86048', H: '#8a2418' }, yeux: 'etroit',
    corps: { mode: 'manteau', t: '#1e1e28', T: '#121218', a: '#1e1e28', A: '#121218', c: '#d8d4cc', e: '#1e1e28', p: '#1e1e28', P: '#121218', f: '#3a2a4a' }, nuages: true },
  kakuzu: { coiffure: 'kakuzu', c: { h: '#3a3a4e', g: '#56566e', H: '#26263a', b: '#30303e', p: '#b8bcc8', P: '#5a6070', k: '#2c3040', K: '#1c2030' }, yeux: 'kakuzu',
    corps: { mode: 'manteau', t: '#1e1e28', T: '#121218', a: '#1e1e28', A: '#121218', c: '#d8d4cc', e: '#1e1e28', p: '#1e1e28', P: '#121218', f: '#3a2a4a' }, nuages: true },
};

// Couleurs d'yeux par style
function couleursYeux(style) {
  switch (style) {
    case 'byakugan': return { e: '#c9c2e6', w: '#ffffff' };
    case 'cerne': return { e: '#2a8a84', w: '#d8fff4' };
    case 'kakuzu': return { e: '#3aa060', w: '#c8303a' };
    case 'sharingan': return { e: '#c81e28', w: '#ffd0d0' };
    case 'rinnegan': return { e: '#8a78c8', w: '#e8e0ff' };
    default: return { e: '#1c1420', w: '#ffffff' };
  }
}

// Assemble une tête (vue, état) → toile 26×22 contournée
function construireTete(V, vue, etat) {
  const base = carteTeteBase(vue === 'dos' ? 'dos' : vue);
  const co = COIFFURES[V.coiffure][vue];
  for (let y = 0; y < co.length; y++) for (let x = 0; x < co[y].length && x < 26; x++) { const k = co[y][x]; if (k !== '.') base[y][x] = k; }
  // Style des yeux (avant clignement)
  if (vue !== 'dos') {
    const st = V.yeux || 'normal';
    if (st === 'etroit') for (let y = 13; y <= 14; y++) for (let x = 0; x < 26; x++) if (base[y][x] === 'e' || base[y][x] === 'w') base[y][x] = y === 13 ? 'm' : 's';
    if (st === 'cerne') { for (let y = 12; y <= 17; y++) for (let x = 0; x < 26; x++) if ((base[y][x] === 's' || base[y][x] === 'd') && [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => { const q = (base[y + dy] || [])[x + dx]; return q === 'e' || q === 'w'; })) base[y][x] = 'C'; }
    if (st === 'fente') for (let y = 13; y <= 16; y++) for (let x = 0; x < 26; x++) if (base[y][x] === 'e' && (x === 7 || x === 9 || x === 16 || x === 18)) base[y][x] = 'Y';
    if (V.sourcils) { for (const [x0, x1] of [[6, 10], [15, 19]]) for (let x = x0; x <= x1; x++) { if (vue === 'cote' && x < 14) continue; base[12][x] = 'h'; base[11][x] = x === x0 || x === x1 ? base[11][x] : 'h'; } }
  }
  if (etat === 'cligne' || etat === 'tir') {
    // yeux fermés : on garde la ligne la plus basse de chaque œil
    for (let x = 0; x < 26; x++) {
      let bas = -1; for (let y = 12; y <= 17; y++) if (['e', 'w', 'Y'].includes(base[y][x])) bas = y;
      if (bas < 0) continue;
      for (let y = 12; y <= 17; y++) if (['e', 'w', 'Y'].includes(base[y][x])) base[y][x] = (etat === 'tir' ? y === bas - 1 : y === bas) ? 'e' : 's';
    }
    if (etat === 'tir' && vue === 'face') { base[18][12] = 'm'; base[18][13] = 'm'; base[19][12] = 'M'; base[19][13] = 'M'; }
  }
  const yeux = couleursYeux(V.yeux);
  const couleurs = Object.assign({ s: PEAU.s, d: PEAU.d, l: PEAU.l, m: '#6a3424', M: '#a04040', C: '#1c1420', Y: '#e8e0d0' }, yeux, V.c);
  if (V.yeux === 'fente') couleurs.Y = '#f0e6c8';
  return contourner(peindre(base.map(r => r.join('')), couleurs, 26, 22));
}
function construireCorps(V, vue, frame) {
  const P = V.corps; const L = carteCorps(vue, frame, P.mode);
  const couleurs = Object.assign({ k: PEAU.s }, P);
  if (V.nuages) { couleurs.n = '#c8303a'; couleurs.N = '#f0ece4'; // nuages rouges bordés de blanc sur le manteau
    const pos = vue === 'cote' ? [[5, 3], [7, 7]] : [[3, 3], [9, 6], [5, 8]];
    for (const [x, y] of pos) if (L[y] && (L[y][x] === 't' || L[y][x] === 'T')) { L[y][x] = 'n'; if (L[y][x + 1] === 't') L[y][x + 1] = 'N'; }
  }
  return contourner(peindre(L.map(r => r.join('')), couleurs, 14, 11));
}
function construireDos(V, vue) {
  if (!V.dos) return null;
  if (V.dos === 'gourde') {
    const face = ['...oo...', '..oppo..', '.oppppo.', '.opppPo.', '..oPPo..', '.oppppo.', 'oppppppo', 'opppppPo', 'oppppPPo', '.oPPPPo.', '..oooo..'];
    return contourner(peindre(face, { o: '#8a6a3a', p: '#d0a868', P: '#a8844a' }, 8, 11));
  }
  if (V.dos === 'marionnette') {
    const m = ['..wwww..', '.wWwwWw.', '.wwwwww.', 'wWwwwwWw', 'wwwwwwww', 'wwWwwWww', '.wwwwww.', '.wWwwWw.', '..wwww..'];
    return contourner(peindre(m, { w: '#e6dcc4', W: '#b8a888' }, 8, 9));
  }
  return null;
}

// Construit toutes les images d'un personnage : tetes[vue][etat], corps[vue][frame]
const _cachePersos = {};
function spritesPerso(cle) {
  if (_cachePersos[cle]) return _cachePersos[cle];
  const V = VISUELS[cle] || VISUELS.naruto; const S = { tetes: {}, corps: {}, dos: {} };
  for (const vue of ['face', 'cote', 'dos']) {
    S.tetes[vue] = {}; for (const e of ['normal', 'cligne', 'tir']) S.tetes[vue][e] = construireTete(V, vue, e);
    S.corps[vue] = []; for (let f = 0; f < 4; f++) S.corps[vue].push(construireCorps(V, vue, f));
  }
  S.tetes.gauche = {}; for (const e of ['normal', 'cligne', 'tir']) S.tetes.gauche[e] = miroir(S.tetes.cote[e]);
  S.corps.gauche = S.corps.cote.map(miroir);
  S.dosAcc = construireDos(V, 'dos');
  _cachePersos[cle] = S; return S;
}
// Dessine un personnage : dirCorps / dirTete ∈ haut|bas|gauche|droite
function dessinerPerso(g, cle, x, y, o = {}) {
  const S = spritesPerso(cle);
  const vueDe = d => d === 'haut' ? 'dos' : d === 'bas' ? 'face' : d === 'gauche' ? 'gauche' : 'cote';
  const vc = vueDe(o.dirCorps || 'bas'), vt = vueDe(o.dirTete || o.dirCorps || 'bas');
  const f = o.frame || 0; const bob = (f % 2 === 1) ? -1 : 0;
  const corps = S.corps[vc][f], tete = S.tetes[vt][o.etatTete || 'normal'];
  const X = Math.round(x), Y = Math.round(y);
  // accessoire de dos : derrière le corps sauf vue de dos
  if (S.dosAcc && vc !== 'dos') g.drawImage(S.dosAcc, X - 4 + (vc === 'cote' ? -5 : vc === 'gauche' ? 5 : 5), Y - 16);
  g.drawImage(corps, X - 7, Y - 11 + (o.dy || 0));
  if (S.dosAcc && vc === 'dos') g.drawImage(S.dosAcc, X - 4, Y - 13);
  g.drawImage(tete, X - 13, Y - 32 + bob + (o.etatTete === 'tir' ? 1 : 0) + (o.dy || 0));
}
