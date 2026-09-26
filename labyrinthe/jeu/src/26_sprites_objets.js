// ═══════════════════════════════════════════════════════════════════════════
// Icônes d'objets (formes de base × trois couleurs), ramassables, icônes de HUD.
// a / b / c : couleurs propres à l'objet ; d : ombre de a ; w : éclat ; k : sombre.
// ═══════════════════════════════════════════════════════════════════════════

const FORMES_ICONES = {
  kunai: ['.............ww', '............wab', '...........wab.', '..........wab..', '.........wab...', '........wab....', '.......dab.....', '..c...dab......', '..cc.dd........', '...ccd.........', '..cccc.........', '.cc..cc........', '.c.............', 'bb.............', 'bb.............'],
  shuriken: ['.......w.......', '......wa.......', '......aa.......', '.....dab.......', '.....ab....ww..', '....aab.waaa...', 'wwaaaabcbaaaad.', '.daaaab.bddd...', '...ddddbd......', '......bd.......', '.....dda.......', '.....da........', '.....d.........'],
  fuma: ['......ww......', '.....waa......', '.....aad......', '..w..aad..ww..', '..aa.aad.aaa..', '...aadccdaad...', '....adccda....', '...aadccdaad..', '..aad.daa.aa..', '..dd..daa..d..', '......daa.....', '......dad.....', '.......d......'],
  senbon: ['..........w..w', '.........a..a.', '........a..a..', '.......a..a..w', '......a..a..a.', '.....a..a..a..', '....a..a..a...', '...b..a..a....', '..b..b..a.....', '....b..b......', '.......b......'],
  rouleau: ['..bbbbbbbbbb..', '.bwwwwwwwwwwb.', 'cbwaaaaaaaawbc', 'cbwakkakkkawbc', 'cbwaaaaaaaawbc', 'cbwakkkakkawbc', 'cbwaaaaaaaawbc', '.bwwwwwwwwwwb.', '..bbbbbbbbbb..'],
  tag: ['.wwwwwwww.', '.waaaaaaw.', '.wabbbbaw.', '.waabbaaw.', '.wabbbbaw.', '.waaabaaw.', '.wabbbbaw.', '.waaaaaaw.', '.waabbaaw.', '.waaaaaaw.', '.wwwwwwww.', '....cc....', '...c..c...'],
  oeil: ['....kkkkkk....', '..kkwwwwwwkk..', '.kwwwaaaawwwk.', 'kwwwabbbbawwwk', 'kwwabbccbbawwk', 'kwwabcccbbawwk', 'kwwabbccbbawwk', 'kwwwabbbbawwwk', '.kwwwaaaawwwk.', '..kkwwwwwwkk..', '....kkkkkk....'],
  pilule: ['....aaaa....', '..aawwaaaa..', '.aawaaaaaad.', '.aaaaaaaaad.', 'aaaaaaaaaddb', 'aaaaaaaadbbb', '.dddddbbbbb.', '.ddbbbbbbbb.', '..bbbbbbbb..', '....bbbb....'],
  gourde: ['.....cc.....', '....cbbc....', '....cbbc....', '...aaaaaa...', '..aawaaaad..', '..awaaaaad..', '...aaaaad...', '....cccc....', '..aaaaaaaa..', '.aawaaaaaad.', 'aawaaaaaaaad', 'aaaaaaaaaadd', 'aaaaaaaaaddd', '.aaaaaaaddd.', '..dddddddd..'],
  masque: ['...wwwwwwww...', '..wwwwwwwwww..', '.wwbwwwwwwbww.', '.wwbbwwwwbbww.', '.wkkkwwwwkkkw.', '.wwkkwwwwkkww.', '.wwwwwaawwwww.', '.wbwwwaawwwbw.', '..wbwwwwwwbw..', '..wwwwkkwwww..', '...wwwwwwww...', '....wwwwww....'],
  bandeau: ['..............', 'aaaaaaaaaaaaaa', 'aaaawwwwwwaaaa', 'aaaawbbbbwaaaa', 'aaaawbkkbwaaaa', 'aaaawbbbbwaaaa', 'aaaawwwwwwaaaa', 'aaaaaaaaaaaaaa', 'aa..........aa', '.aa........aa.', '..a........a..'],
  crapaud: ['..aa....aa..', '.awka..akwa.', '.aaaaaaaaaa.', 'aaaaaaaaaaaa', 'abbbbbbbbbba', 'aabkkkkkkbaa', '.aabbbbbbaa.', 'aa.aaaaaa.aa', 'a..a....a..a', 'aa.aa..aa.aa'],
  serpent: ['..........aaa.', '.........awkaa', '.........aaaac', '....aaa...aa..', '...aabaa..aa..', '..aa..baaaa...', '..aa...bbb....', '...aa.........', '....aaaa......', '.......aaaa...', '..........aa..', '.........aa...'],
  limace: ['..a.....a...', '..a.....a...', '..w.....w...', '..aaaaaaa...', '.aaaaaaaaa..', 'aawaaaaaaaa.', 'aaaabbbbaaaa', '.aabbbbbbaaa', '..bbbbbbbbbb', '....bbbbbbb.'],
  chien: ['.aa......aa.', '.aba....aba.', '.aaaaaaaaaa.', 'aaawkaawkaa.', 'aaaaaaaaaaa.', '.aaaakkaaaa.', '..aabbbaa...', '..aaaaaaaa..', '.aaaaaaaaaa.', '.aa.aa.aa.aa'],
  corbeau: ['....kkk.....', '...kkwkk....', '...kkkkcc...', '..kkkkkk....', '.kkkkkkkk...', 'kkkkkkkkkk..', 'kk.kkkkkkkk.', '....kkkkkkkk', '.....kk..kk.', '.....c....c.'],
  insecte: ['.k.......k..', '..k.....k...', '...kaaak....', '..kawkwak...', 'k.kaaaaak.k.', '.kkbbbbbkk..', 'k.kbbbbbk.k.', '..kbbbbbk...', '.k.kbbbk.k..', '....kkk.....'],
  oiseau: ['.....aa.......', '....awka......', '..aaaaaaac....', 'aaaaaaaaaa....', '.aaaaaaaaaaaa.', '..aaaaaaaaaaaa', '...aaaaaaaa...', '....aa..aa....', '....b....b....'],
  marionnette: ['...aaaaaa...', '..aawwaaaa..', '..akkaakka..', '..aaaaaaaa..', '..abbbbbba..', '...aaaaaa...', '.c..cccc..c.', 'cc.cccccc.cc', '...cccccc...', '...cc..cc...', '...c....c...'],
  coeur: ['.aaa...aaa.', 'aawaa.aaaaa', 'awaaaaaaaad', 'aaaaaaaaaad', 'aaaaaaaaadd', '.aaaaaaaad.', '..aaaaaadd.', '...aaaadd..', '....addd...', '.....d.....'],
  os: ['.ww......ww.', 'wwww....wwww', '.wwwwwwwwww.', '..wwwwwwww..', '.wwwwwwwwww.', 'wwww....wwww', '.ww......ww.'],
  sphere: ['....aaaa....', '..aawwaaaa..', '.awwbbbbaaa.', '.awbbccbbad.', 'aabbcwwcbbad', 'aabcwwwwcbad', 'aabbcwwcbbad', '.aabbccbbad.', '.aaabbbbadd.', '..aaaaaddd..', '....dddd....'],
  flamme: ['......a.....', '.....aa.....', '....aab..a..', '...aabba.a..', '..aabbbbaa..', '..abbccbba..', '.aabcccbbaa.', '.abccwwcbba.', '.abcwwwwcba.', '.aabcwwcbaa.', '..aabbbbaa..', '...aaaaaa...'],
  goutte: ['.....a.....', '.....a.....', '....aaa....', '...aawaa...', '..aawaaaa..', '..awaaaaad.', '.aaaaaaaaad', '.aaaaaaaadd', '.aaaaaaaadd', '..aaaaaadd.', '...dddddd..'],
  eclair: ['......aaaa', '.....aaaa.', '....aaaa..', '...aaww...', '..aaaaaaaa', '......aaa.', '.....aaa..', '....aaw...', '...aaa....', '..aaa.....', '.aa.......'],
  tornade: ['aaaaaaaaaaa', '.wwaaaaaaa.', '..aaaaaaa..', '...awwaa...', '...aaaaa...', '....aaa....', '....awa....', '.....aa....', '......a....'],
  rocher: ['....aaaa....', '..aawwaaaa..', '.awwaaaaaad.', 'aawaaaaaaadd', 'aaaaaabaaadd', 'aaaaabbaaddd', '.aaaaaaaddd.', '..dddddddd..'],
  sable: ['.....a......', '...a.aa.a...', '..aaaaaaaa..', '.aawaaaaaaa.', 'aawaaaaaaaad', 'aaaaaaaaaadd', 'aaaaaaaadddd', '.ddddddddd..'],
  lame: ['...........w', '..........wa', '.........wad', '........wad.', '.......wad..', '......wad...', '.....wad....', '..c.wad.....', '..ccad......', '...cc.......', '..ccbb......', '.cc..bb.....', 'cc..........'],
  epee: ['..aaaaaaaaa...', '.awwwwwwwwaa..', '.aaaaaaaaaaad.', '.aaaaaaaaaaadk', '.aaaa..aaaaad.', '..ddd..ddddd..', '.......cc.....', '.......cc.....', '.......bb.....', '.......bb.....'],
  bol: ['.c.c.c.c.c..', '..c.c.c.c...', 'wwwwwwwwwwww', 'aaaaaaaaaaaa', 'abbbbbbbbbba', '.aabbbbbbaa.', '..aaaaaaaa..', '...dddddd...'],
  dango: ['......k....', '.....aa....', '....aaaa...', '....aaaa...', '.....bb....', '....bbbb...', '....bbbb...', '.....cc....', '....cccc...', '....cccc...', '.....k.....', '....k......'],
  onigiri: ['.....ww.....', '....wwww....', '...wwwwww...', '..wwwwwwww..', '.wwwwwwwwww.', 'wwwkkkkkwwww', 'wwkkkkkkkwww', '.wkkkkkkkww.'],
  bourse: ['....aaaa....', '...awkkwa...', '..aaaaaaaa..', '.aabbbbbbaa.', 'aabbbbbbbbaa', 'aabbbccbbbaa', 'aabbbbbbbbaa', '.aabbbbbbaa.', '..aaaaaaaa..'],
  cle: ['..aaa.......', '.a...a......', '.a...a......', '..aaa.......', '...a........', '...aa.......', '...a........', '...aa.......', '...a..bbbb..', '......bccb..', '......bbbb..'],
  livre: ['.aaaaaaaaaa.', 'awwwwwwwwwba', 'awaaaaaaawba', 'awacccccawba', 'awaaaaaaawba', 'awacccaaawba', 'awaaaaaaawba', 'awaaaaaaawba', 'awwwwwwwwwba', '.aaaaaaaaaa.'],
  carte: ['aaaaaaaaaaaa', 'awwwwwwwwwwa', 'awbbwwwbbwwa', 'awbwwbbwbwwa', 'awbbbbwwbbwa', 'awwwbwwwwbwa', 'awcwbbbbwbwa', 'awwwwwwwwwwa', 'aaaaaaaaaaaa'],
  boussole: ['...aaaaaa...', '..awwwwwwa..', '.awwwbbwwwa.', 'awwwwbbwwwwa', 'awwwwccwwwwa', 'awwwwccwwwwa', 'awwwwccwwwwa', '.awwwwwwwwa.', '..awwwwwwa..', '...aaaaaa...'],
  poids: ['aaaa....aaaa', 'awda....awda', 'aadd....aadd', 'aadd....aadd', 'aaddbbbbaadd', 'aaddbbbbaadd', 'aadd....aadd', 'aadd....aadd', 'aaaa....aaaa'],
  sandale: ['............', '.aaaaaaaaa..', 'aawwwwwwwwa.', 'abbbbbbbbbba', 'aaaaaaaaaaaa', '.cc.....cc..'],
  gant: ['.a.a.a......', '.a.a.a.a....', '.aaaaaaa....', '.awaaaaa.aa.', '.aaaaaaaaaa.', '.aaaaaaaaa..', '..bbbbbbb...', '..bbbbbbb...', '..ccccccc...'],
  anneau: ['...aaaa...', '..awwaaa..', '.aw....ad.', '.a......d.', '.a......d.', '.ad....dd.', '..aadddd..', '...dddd...'],
  cloche: ['....cc....', '...aaaa...', '..awwaaa..', '..awaaaa..', '.aaaaaaad.', '.aaaaaaad.', 'aaaaaaaadd', 'dddddddddd', '....bb....'],
  papier: ['aa......aa', 'awa....awa', 'awwa..awwa', 'awwwaawwwa', '.awwwwwwa.', '..awwwwa..', '.awwaawwa.', 'awwa..awwa', 'aa......aa'],
  pinceau: ['........bb', '.......bbb', '......bbb.', '.....ccb..', '....cc....', '...cc.....', '..ac......', '.aaa......', 'aaa.......', 'aa........'],
  feuille: ['.......aa.', '.....aaaa.', '...aaawaa.', '..aaawaaa.', '.aaawaaad.', '.aawaaadd.', '.awaaddd..', '.bddd.....', 'b.........'],
  chaine: ['.aa.......', 'a..a......', 'a..aa.....', '.aa..a....', '....a..a..', '.....aa..a', '.......a.a', '........a.'],
  sceau: ['...aaaaa...', '..a.....a..', '.a..bbb..a.', 'a..b...b..a', 'a..b.c.b..a', 'a..b...b..a', '.a..bbb..a.', '..a.....a..', '...aaaaa...'],
  lune: ['...aaaa...', '..aawaa...', '.aawa.....', '.awa......', '.aaa......', '.aaa......', '.aaaa.....', '..aaaaa.d.', '...aaaaad.', '....dddd..'],
  soleil: ['.a..a..a.', '..a.a.a..', '...aaa...', 'aaawwaaaa', '..awwwa..', '...aaa...', '..a.a.a..', '.a..a..a.'],
  fiole: ['...kk...', '...ww...', '...ww...', '..wbbw..', '.wbbbbw.', 'wbbcbbbw', 'wbbbbbbw', 'wbbbbbbw', '.wwwwww.'],
  plume: ['.......aa', '......aaa', '.....aawa', '....aawa.', '...aawa..', '..aawa...', '.aawa....', '.bwa.....', 'b........'],
  bouclier: ['aaaaaaaaaa', 'awwwwwwwwa', 'awbbbbbbwa', 'awbbccbbwa', 'awbbccbbwa', '.awbbbbwa.', '..awbbwa..', '...awwa...', '....aa....'],
  crane: ['...aaaaa...', '..aaaaaaa..', '.aawaaaaaa.', '.akkkaakkka', '.akkkaakkka', '.aaaakaaaaa', '..aaaaaaaa.', '...akakaka.', '...aaaaaa..'],
  etoile: ['.....a.....', '....aaa....', '....awa....', 'aaaaaaaaaaa', '.aaawaaaaa.', '..aaaaaaa..', '..aaa.aaa..', '.aa.....aa.', '.a.......a.'],
  poing: ['.aaaaaaaa.', 'awaaaaaaaa', 'aaaaaaaaad', 'akakakakad', 'aaaaaaaaad', '.aaaaaaaad', '..bbbbbbb.', '..bbbbbbb.'],
  racine: ['.....aa...', '....aa....', '...aaaa...', '..aa.aaa..', '.aa...aa..', 'aa..a..aa.', 'a..aa...a.', '..aa......', '.aa.......'],
  tete_renard: ['a........a', 'aa......aa', 'aaa.aa.aaa', 'aaaaaaaaaa', 'awkaaaakwa', 'aaaaaaaaaa', '.aaawwaaa.', '..aaaaaa..', '...aaaa...'],
  pieces: ['..aaaa....', '.awwaaa...', '.aakkaa...', '.aakkaa...', '..aaaa.bb.', '......bwwb', '.....bbkkb', '......bbbb'],
};
function hexKey(col) { return col; }
const _icones = {};
function iconeObjet(id) {
  if (_icones[id]) return _icones[id];
  const d = INDEX[id] || {}; const I = d.icone || { forme: 'etoile', a: '#c8c8d0' };
  const map = FORMES_ICONES[I.forme] || FORMES_ICONES.etoile;
  const a = I.a || '#c8c8d0', b = I.b || nuancer(a, 0.7), c = I.c || '#8a6a4a';
  const col = { a, b, c, d: nuancer(a, 0.72), w: I.w || nuancer(a, 1.55), k: '#1c1420' };
  const L = map.map(r => r.padEnd(Math.max(...map.map(x => x.length)), '.'));
  const img = contourner(peindre(L, col));
  const cadre = toile(20, 20); const g = ctxDe(cadre); g.drawImage(img, Math.floor((20 - img.width) / 2), Math.floor((20 - img.height) / 2));
  return (_icones[id] = cadre);
}

// ── Ramassables ──
const _ram = {};
function spriteRamassable(type, extra) {
  const cle = type + '|' + (extra ?? ''); if (_ram[cle]) return _ram[cle];
  let c;
  const P = (L, col) => contourner(peindre(L, col));
  switch (type) {
    case 'ryo': c = P(['..yyyy..', '.yyllyy.', 'yyllyyyd', 'yly..ydd', 'yyy..ydd', 'yyyyyydd', '.yyyydd.', '..dddd..'], { y: '#f0c030', l: '#fff0a0', d: '#b08010' }); break;
    case 'ryo5': c = P(['..ssss....', '.sslsss...', 'ssl..ssd..', 'sss..sdd..', '.sssddd.ss', '..dddd.sls', '......ssl.', '.......sdd'], { s: '#c8d0dc', l: '#ffffff', d: '#7a8494' }); break;
    case 'ryo10': c = P(['..yyyyyyyy..', '.ylllllllyd.', 'yllyyyyyyydd', 'yyyyyyyyyddd', '.ddddddddd..'], { y: '#f0c030', l: '#fff0a0', d: '#b08010' }); break;
    case 'cle': case 'cle2': c = P(['.ggg.......', 'g...g......', 'g...g......', '.ggg.......', '..g........', '..gg.pppp..', '..g..prrp..', '..gg.pppp..', '.....p..p..'], { g: '#e8c050', p: '#f0e8d0', r: '#c83a2a' }); if (type === 'cle2') { const d = toile(16, 12); const g = ctxDe(d); g.drawImage(c, 0, 1); g.drawImage(c, 5, 2); c = d; } break;
    case 'explosif': case 'explosif2': c = P(['.pppppp.', '.prrrrp.', '.pprrpp.', '.prrrrp.', '.pprrpp.', '.prrrrp.', '.pppppp.', '...kk...', '..k..k..'], { p: '#e8dcc0', r: '#c82a2a', k: '#6a5a4a' }); if (type === 'explosif2') { const d = toile(14, 12); const g = ctxDe(d); g.drawImage(c, 0, 0); g.drawImage(c, 5, 1); c = d; } break;
    case 'coeur': c = P(['.rr..rr.', 'rlrrrrrr', 'rlrrrrrd', 'rrrrrrrd', '.rrrrrd.', '..rrrd..', '...rd...'], { r: '#d8303a', l: '#ffa0a0', d: '#8a1820' }); break;
    case 'coeur_demi': c = P(['.rr.', 'rlrr', 'rlrr', 'rrrr', '.rrr', '..rr', '...r'], { r: '#d8303a', l: '#ffa0a0' }); break;
    case 'coeur_double': { const h = spriteRamassable('coeur'); c = toile(16, 12); const g = ctxDe(c); g.drawImage(h, 0, 0); g.drawImage(h, 6, 3); break; }
    case 'protection': case 'protection_demi': c = P(['.bb..bb.', 'blbbbbbb', 'blbwbbbd', 'bbwwwbbd', '.bbwbbd.', '..bbbd..', '...bd...'], { b: '#4a8ae8', l: '#c0e0ff', w: '#e0f4ff', d: '#2a4a9a' }); break;
    case 'instable': c = P(['.vv..vv.', 'vlvvvvvv', 'vvkvkvvd', 'vvvkvvvd', '.vvkvvd.', '..vvvd..', '...vd...'], { v: '#5a2a7a', l: '#b080e0', k: '#e060ff', d: '#2a1040' }); break;
    case 'partiel': c = P(['.ww..ww.', 'wwwwwwww', 'wwwkwwww', 'wwwkwwww', '.wwkwww.', '..wwww..', '...ww...'], { w: '#f0ecdc', k: '#c8a040' }); break;
    case 'os': c = P(['.ww..ww.', 'wkkwwkkw', 'wwwwwwww', 'wkwwwwkw', '.wwwwww.', '..wkkw..', '...ww...'], { w: '#e8e0cc', k: '#a89c84' }); break;
    case 'condensateur': case 'condensateur_grand': c = P(['..kk..', '..ww..', '.wbbw.', 'wbllbw', 'wbbbbw', 'wbbbbw', 'wbbbbw', '.wwww.'], { k: '#5a5a60', w: '#d8e8f0', b: '#3aa0f0', l: '#c0f0ff' }); break;
    case 'rouleau': c = P(['.bbbbbbbb.', 'cbwwwwwwbc', 'cbwkwkkwbc', 'cbwwwwwwbc', '.bbbbbbbb.'], { b: '#a87c48', w: '#ece0c4', k: '#5a4a3a', c: (extra && typeof extra === 'string' && extra.startsWith('#')) ? extra : '#c83a2a' }); break;
    case 'sceau_poche': c = P(['..kkkk..', '.kssssk.', 'kssyysk.', 'ksyssyk.', 'ksyssyk.', 'kssyysk.', '.kssssk.', '..kkkk..'], { k: '#3a3040', s: '#8a7a9a', y: '#e8d060' }); break;
    case 'pilule': { const A = APPARENCES_PILULES[extra || 0] || APPARENCES_PILULES[0]; c = P(['..aaaa..', '.alaaaa.', 'aaaaaaab', 'aaaaabbb', '.abbbbb.', '..bbbb..'], { a: A.a, b: A.b, l: '#ffffff' }); break; }
    case 'talisman': c = P(['..kk..', '.kttk.', 'ktlttk', 'ktttdk', 'ktyytk', 'kttttk', 'kttttk', '.kddk.', '..kk..'], { k: '#3a2a20', t: (extra && typeof extra === 'string' && extra.startsWith('#')) ? extra : '#c83a4a', l: '#ffd0d0', d: '#6a1a1a', y: '#f0d060' }); break;
    case 'coffre': c = P(['.bbbbbbbbbbbb.', 'bwwwwwwwwwwwwb', 'bwbbbbbbbbbbwb', 'bbbbbbbbbbbbbb', 'bddddggddddddb', 'bwwwwggwwwwwwb', 'bwbbbbbbbbbbwb', 'bwbbbbbbbbbbwb', 'bddddddddddddb', '.bbbbbbbbbbbb.'], { b: '#6a4a2a', w: '#a87848', d: '#4a3018', g: '#c8b890' }); break;
    case 'coffre_verrouille': c = P(['.bbbbbbbbbbbb.', 'bwwwwwwwwwwwwb', 'bwbbbbbbbbbbwb', 'bbbbbbbbbbbbbb', 'bddddkkddddddb', 'bwwwwkkwwwwwwb', 'bwbbbbbbbbbbwb', 'bwbbbbbbbbbbwb', 'bddddddddddddb', '.bbbbbbbbbbbb.'], { b: '#b08820', w: '#f0d060', d: '#806010', k: '#3a2a10' }); break;
    case 'coffre_piege': c = P(['.bbbbbbbbbbbb.', 'bwwwwwwwwwwwwb', 'bwbbbbbbbbbbwb', 'bbbbbbbbbbbbbb', 'bddddssddddddb', 'bwwwwsswwwwwwb', 'bwbbbbbbbbbbwb', 'bwbbbbbbbbbbwb', 'bddddddddddddb', '.bbbbbbbbbbbb.'], { b: '#8a1a1a', w: '#d84a3a', d: '#5a0a0a', s: '#e8e0d0' }); break;
    case 'coffre_pierre': c = P(['.bbbbbbbbbbbb.', 'bwwwwwwwwwwwwb', 'bwbbbbbbbbbbwb', 'bbbbbbbbbbbbbb', 'bddddddddddddb', 'bwwwkwwwwkwwwb', 'bwbbbbbbbbbbwb', 'bwbbbkbbbbbbwb', 'bddddddddddddb', '.bbbbbbbbbbbb.'], { b: '#6a6a70', w: '#a8a8b0', d: '#4a4a50', k: '#3a3a40' }); break;
    default: c = disque(4, '#ff00ff');
  }
  return (_ram[cle] = c);
}

// ── Icônes de HUD (cœurs par type et remplissage) ──
const ICONES = {};
function preparerIcones() {
  const P = (L, col) => contourner(peindre(L, col));
  const forme = ['.xx.xx.', 'xxxxxxx', 'xxxxxxx', 'xxxxxxx', '.xxxxx.', '..xxx..', '...x...'];
  const coeur = (plein, demi, col, fond) => { const L = forme.map((r, y) => r.split('').map((ch, x) => ch !== 'x' ? '.' : (plein || (demi && x < 4)) ? (x === 1 && y <= 2 ? 'l' : 'a') : 'f').join('')); return P(L, { a: col, l: nuancer(col, 1.5), f: fond || '#2a1c24' }); };
  ICONES.vit = [coeur(false, false, '#d8303a'), coeur(false, true, '#d8303a'), coeur(true, false, '#d8303a')];
  ICONES.os = [coeur(false, false, '#e8e0cc', '#8a8070'), coeur(false, true, '#d8303a', '#e8e0cc'), coeur(true, false, '#d8303a', '#e8e0cc')];
  ICONES.bleu = [null, coeur(false, true, '#4a8ae8', 'rgba(0,0,0,0)'), coeur(true, false, '#4a8ae8')];
  ICONES.noir = [null, coeur(false, true, '#6a2a8a', 'rgba(0,0,0,0)'), coeur(true, false, '#6a2a8a')];
  ICONES.cicatrice = P(['.xx.xx.', 'xkxxxkx', 'xxkxkxx', 'xxxkxxx', '.xkxkx.', '..kxk..', '...x...'].map(r => r.replace(/x/g, 'g')), { g: '#5a4a50', k: '#1c1420' });
  ICONES.partiel = P(['.ww....', 'wwww...', 'wwkw...', 'wwkw...', '.wkw...', '..ww...', '...w...'], { w: '#f0ecdc', k: '#c8a040' });
  ICONES.ryo = spriteRamassable('ryo'); ICONES.cle = spriteRamassable('cle'); ICONES.explosif = spriteRamassable('explosif');
  ICONES.cadenas = P(['.kkk.', 'k...k', 'k...k', 'yyyyy', 'yykyy', 'yykyy', 'yyyyy'], { k: '#c8c8d0', y: '#e8c050' });
  ICONES.coeurBarre = P(['.rr.rr.', 'rrrrrrk', 'rrrrkrr', 'rrrkrrr', '.rkrrr.', '..rrr..', '...r...'], { r: '#d8303a', k: '#f0f0f0' });
  ICONES.gel = P(['..w..', 'w.w.w', '.www.', 'w.w.w', '..w..'], { w: '#c0e8ff' });
}
