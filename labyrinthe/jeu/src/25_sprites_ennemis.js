// ═══════════════════════════════════════════════════════════════════════════
// Sprites des ennemis, boss et familiers. Les silhouettes annoncent la fonction :
// masques pour les shinobi hostiles, formes animales, marionnettes anguleuses.
// Deux frames par créature ; les shinobi réutilisent le constructeur de chibi.
// ═══════════════════════════════════════════════════════════════════════════

const CARTES_CREATURES = {
  poupee: { c: { p: '#c8a060', d: '#9a7840', r: '#b83a2a', w: '#e8d8b0', k: '#3a2a1a' }, f: [
    ['....pppp....', '...pwwwwp...', '..pwrrrrwp..', '..pwrwwrwp..', '..pwrrrrwp..', '...pwwwwp...', '....dppd....', '.pppppppppp.', '.p.dppppd.p.', '....pppp....', '....p..p....', '...pp..pp...'],
    ['....pppp....', '...pwwwwp...', '..pwrrrrwp..', '..pwrwwrwp..', '..pwrrrrwp..', '...pwwwwp...', '....dppd....', 'p.pppppppp.p', '...dppppd...', '....pppp....', '...pp..p....', '...p...pp...']] },
  rat: { c: { g: '#6a6068', d: '#4a4248', p: '#e0a0a8', k: '#1c1420', w: '#ffffff' }, f: [
    ['..........pp', '.gggggg..gkg', 'gggggggggggp', 'ggdgggggggg.', '.ggggggggg..', '.p..p..p.p..'],
    ['..........pp', '.gggggg..gkg', 'gggggggggggp', 'ggdgggggggg.', 'pggggggggg..', '..p..p.p..p.']], miroir: true },
  chauve_souris: { c: { b: '#3a2a4a', d: '#261a32', r: '#e04a5a', w: '#ffffff' }, f: [
    ['b..........b', 'bb...bb...bb', 'bbb.bbbb.bbb', 'bbbbbrbrbbbb', '.bbbbbbbbbb.', '...bbwwbb...', '....b..b....'],
    ['............', '.....bb.....', '..b.bbbb.b..', '.bbbbrbrbbb.', 'bbbbbbbbbbbb', 'b..bbwwbb..b', '....b..b....']] },
  crapaud: { c: { g: '#6a8a3a', l: '#9ab860', b: '#d8c890', k: '#1c1420', w: '#ffffff' }, f: [
    ['..gg....gg..', '.gwkg..gkwg.', '.gggggggggg.', 'gggggggggggg', 'glbbbbbbbblg', 'ggbbbbbbbbgg', '.gggggggggg.', 'gg.g....g.gg'],
    ['..gg....gg..', '.gwkg..gkwg.', '.gggggggggg.', 'gggggggggggg', 'glbbbbbbbblg', 'ggbkkkkkkbgg', '.gggggggggg.', 'g..gg..gg..g']] },
  serpent: { c: { s: '#7a9a4a', d: '#5a7a3a', b: '#d8d8a0', k: '#1c1420', r: '#c83a2a' }, f: [
    ['........sss.', '.......sksss', '.......sssr.', '..sss...ss..', '.ssbss.ss...', 'ss...sss....', 's...........'],
    ['........sss.', '.......sksss', '.......ssss.', '...sss..ss..', 'ssbs.sss....', 's....ss.....', '............']], miroir: true },
  sangsue: { c: { s: '#5a3a4a', d: '#3a2432', l: '#8a5a6a', k: '#1c1420', r: '#e05a6a' }, f: [
    ['....ssssss....', '..sslllssssss..'.slice(0, 14), '.sslsssssssss.', 'ssssssssssskrs', 'sssssssssssss.', '.ddddddddddd..'],
    ['...ssssssss...', '.sslllsssssss.', 'sslssssssssss.', 'ssssssssssskrs', '.ssssssssssss.', '..ddddddddd...']], miroir: true },
  mille_pattes: { c: { m: '#8a4a2a', d: '#5a3018', l: '#c07a4a', k: '#1c1420', y: '#f0d060' }, f: [
    ['.m.m.m.m....', 'mmmmmmmmmmm.', 'mlmlmlmlmmyk', 'mmmmmmmmmmm.', '.m.m.m.m....'],
    ['m.m.m.m.....', 'mmmmmmmmmmm.', 'mlmlmlmlmmyk', 'mmmmmmmmmmm.', 'm.m.m.m.....']], miroir: true },
  tigre: { c: { o: '#e08a2a', k: '#1c1420', w: '#f8f0e0', d: '#a85a1a' }, f: [
    ['.oo.......oo.', 'owko.....okwo'.slice(0, 13), 'ooooooooooooo', 'okokoooookoko', 'ooooowwwooooo', '.ooooooooooo.', '.oo.oo.oo.oo.', '.o..o...o..o.'],
    ['.oo.......oo.', 'owko.....okwo'.slice(0, 13), 'ooooooooooooo', 'okokoooookoko', 'ooooowwwooooo', '.ooooooooooo.', 'oo.oo...oo.oo', 'o...o...o...o']] },
  moustique: { c: { b: '#4a4a3a', w: '#d8e8f0', r: '#c83a3a' }, f: [['w.w', '.b.', 'rbb'], ['.w.', 'wbw', 'rbb']] },
  araignee: { c: { a: '#3a2a3a', l: '#6a4a6a', r: '#e04a4a', w: '#e8e8f0' }, f: [
    ['a..........a', '.a..aaaa..a.', '..aaalaaaa..', 'aaaarararaaa', '..aaaaaaaa..', '.a..aaaa..a.', 'a..........a'],
    ['............', 'a...aaaa...a', '.aaaalaaaaa.', '.aaararaaaa.', 'a.aaaaaaaa.a', '....aaaa....', '...a....a...']] },
  jarre_hantee: { c: { j: '#b86a44', l: '#e0a07a', d: '#8a4a30', k: '#1c1420', y: '#f0e060' }, f: [
    ['....jjjj....', '...jjjjjj...', '..jjlljjjj..', '.jjlykjykjj.', '.jjjjjjjjjj.', '.jjjkkkkjjd.', '..jjjjjjdd..', '...dddddd...'],
    ['....jjjj....', '...jjjjjj...', '..jjlljjjj..', '.jjlkyjkyjj.', '.jjjjjjjjjj.', '.jjjjkkjjjd.', '..jjjjjjdd..', '...dddddd...']] },
  racine: { c: { r: '#6a4a2a', d: '#4a3018', y: '#f0d060', k: '#1c1420' }, f: [
    ['.r....r.....', '..r..rr.....', '..rrrrr..r..', '.rrykrrrrr..', 'rrrrrrrrrr..', '.rdrrdrrd...', 'rr.r..r.rr..'],
    ['..r....r....', '..rr..r..r..', '.rrrrrrrr...', '.rrykrrrr...', 'rrrrrrrrrr..', '.rdrrdrrdr..', 'r..rr..r..r.']] },
  scorpion: { c: { s: '#a86a2a', d: '#7a4a1a', l: '#d8984a', k: '#1c1420', r: '#c83a2a' }, f: [
    ['.......rr...', '........s...', '.........s..', 'ss...sssss..', '.sssslsssss.', 'ssskssssskss', '.s.s.s.s.s..'],
    ['........rr..', '.........s..', '........s...', '.ss..sssss..', 'sssslsssss..', '.sskssssskss', 's.s.s.s.s...']], miroir: true },
  momie: { c: { w: '#d8c8a0', d: '#a8987a', k: '#1c1420', r: '#c83a2a' }, f: [
    ['...wwwww....', '..wdwwwdw...', '..wkwwwkw...', '...wwdww....', '.wwwwwwwww..', 'wwdwwwwdwww.', '..wwwwwww...', '..ww...ww...'],
    ['...wwwww....', '..wdwwwdw...', '..wkwwwkw...', '...wwdww....', 'wwwwwwwwwww.', '.wdwwwwdww..', '..wwwwwww...', '...ww.ww....']] },
  ver: { c: { v: '#c89a5a', d: '#8a6a3a', k: '#1c1420', r: '#e05a4a' }, f: [
    ['....vvvv....', '...vrrrrv...', '..vrkrrkrv..', '..vvvvvvvv..', '...vdvvdv...', '...vvvvvv...'],
    ['....vvvv....', '...vrrrrv...', '..vrrkkrrv..', '..vvvvvvvv..', '...vdvvdv...', '...vvvvvv...']] },
  esprit_sable: { c: { s: '#e0b870', d: '#b08a4a', k: '#1c1420', w: '#fff0c0' }, f: [
    ['....ssss....', '..sswwwwss..', '.ssskwwkss..', '.sssssssss..', '..sssssss...', '...s.s.s....'],
    ['....ssss....', '..sswwwwss..', '.ssskwwkss..', '.sssssssss..', '..sssssss...', '..s.s.s.s...']] },
  marionnette: { c: { m: '#8a6a4a', d: '#5a4630', w: '#d8c8a8', k: '#1c1420', r: '#c83a4a', b: '#6a6a78' }, f: [
    ['....wwww....', '...wkwwkw...', '...wwrrww...', '....wwww....', '.bbmmmmmmbb.', 'b.mmmmmmmm.b', '...mdmmdm...', '...m....m...', '..mm....mm..'],
    ['....wwww....', '...wkwwkw...', '...wwrrww...', '....wwww....', 'bbbmmmmmmbbb', '..mmmmmmmm..', '...mdmmdm...', '...m....m...', '..m......m..']] },
  araignee_meca: { c: { a: '#6a6a78', d: '#4a4a56', r: '#e0a040', k: '#1c1420' }, f: [['a......a', '.a.aa.a.', '..arra..', 'aaaaaaaa', '.a.aa.a.', 'a......a'], ['........', 'a..aa..a', '.aarraa.', '.aaaaaa.', 'a..aa..a', '........']] },
  cuve: { c: { m: '#5a6068', d: '#3a4048', g: '#6ac08a', l: '#b8f0c8', k: '#1c1420' }, f: [
    ['.mmmmmmmmmm.', 'mggggggggggm', 'mglggkggkggm', 'mgggggggggdm', 'mggggggggddm', 'mmmmmmmmmmmm', '.m..m..m..m.'],
    ['.mmmmmmmmmm.', 'mggggggggggm', 'mglgkggkgggm', 'mgggggggggdm', 'mgggggggdddm', 'mmmmmmmmmmmm', '.m..m..m..m.']] },
  meduse: { c: { m: '#a88ae0', l: '#e0d0ff', y: '#f0f060', k: '#1c1420' }, f: [
    ['...mmmmm...', '..mllmmmm..', '.mmkmmmkmm.', '.mmmmmmmmm.', '..y.m.m.y..', '..m.y.y.m..', '...m...m...'],
    ['...mmmmm...', '..mllmmmm..', '.mmkmmmkmm.', '.mmmmmmmmm.', '.y..m.m..y.', '..m.y.y.m..', '..m.....m..']] },
  requin: { c: { b: '#4a6a8a', d: '#34506a', w: '#e8f0f8', k: '#1c1420' }, f: [
    ['.....b......', '....bbb.....', '...bbbbbbbb.', '.bbbbbbbbkbb', 'bbbbbwwwwwb.', '.b...wkwkw..'],
    ['......b.....', '.....bbb....', '...bbbbbbbb.', '.bbbbbbbbkbb', 'bbbbbwwwwwb.', '..b..wkwkw..']], miroir: true },
  oiseau_argile: { c: { a: '#f0e8d8', d: '#b8ac98', k: '#1c1420', b: '#8a8aa0' }, f: [
    ['a..........a', 'aa........aa', '.aaa.aa.aaa.', '..aaaaaaaa..', '...aakaaa...', '....aaaa....', '.....dd.....'],
    ['............', '............', 'aaaa.aa.aaaa', '.aaaaaaaaaa.', '...aakaaa...', '....aaaa....', '.....dd.....']] },
  araignee_argile: { c: { a: '#f0e8d8', d: '#b8ac98', k: '#1c1420' }, f: [['a......a', '.a.aa.a.', '..akka..', 'aaaaaaaa', '.a.aa.a.', 'a......a'], ['........', 'a..aa..a', '.aakkaa.', '.aaaaaa.', 'a..aa..a', '........']] },
  corbeau: { c: { k: '#1c1420', b: '#2a2a3a', r: '#e02a2a', y: '#d0a040' }, f: [
    ['....bbb.....', '...bbrbb....', '...bbbbyy...', '..bbbbbb....', '.bbbbbbbb...', 'bb.bbbbbbb..', '....bb.bb...'],
    ['bb......bb..', '.bb.bbb.bb..', '..bbbrbbb...', '...bbbbyy...', '...bbbbb....', '....b..b....', '............']] },
  bete: { c: { b: '#7a5a4a', d: '#5a4034', w: '#e8e0d0', k: '#1c1420', r: '#c83a2a' }, f: [
    ['.w.......w..', '.ww.....ww..', '..bbbbbbb...', '.bbkbbbkbb..', 'bbbbbbbbbbb.', 'bbbwwwwwbbb.', '.bbbbbbbbb..', '.bb.bb.bb.bb'],
    ['.w.......w..', '.ww.....ww..', '..bbbbbbb...', '.bbkbbbkbb..', 'bbbbbbbbbbb.', 'bbbwrrrwbbb.', '.bbbbbbbbb..', 'bb.bb..bb.bb']] },
  masque: { c: { m: '#d8d0c0', d: '#a8a090', k: '#1c1420', r: '#c83a2a', f: '#f07a2a' }, f: [
    ['..mmmmmmm..', '.mmmmmmmmm.', 'mmkkmmmkkmm', 'mmkrmmmrkmm', 'mmmmmmmmmmm', '.mmmkkkmmm.', '..mmmmmmm..', '...f.f.f...'],
    ['..mmmmmmm..', '.mmmmmmmmm.', 'mmkkmmmkkmm', 'mmkrmmmrkmm', 'mmmmmmmmmmm', '.mmmkkkmmm.', '..mmmmmmm..', '..f.f.f.f..']] },
  statue: { c: { s: '#8a8a90', d: '#5a5a62', l: '#b8b8c0', k: '#1c1420', y: '#f0d060' }, f: [
    ['...ssssss...', '..slsssssd..', '..skyssyks..', '..ssssssss..', '.ssssssssss.', 'sssssssssssd', 'ssddsssddssd', '.ssssssssss.', '.ss......ss.'],
    ['...ssssss...', '..slsssssd..', '..skssssks..', '..ssssssss..', '.ssssssssss.', 'sssssssssssd', 'ssddsssddssd', '.ssssssssss.', '.ss......ss.']] },
  crapaud_gardien: { c: { g: '#c86a2a', l: '#f0a060', b: '#f0d8a0', k: '#1c1420', w: '#ffffff' }, f: [
    ['...gg......gg...', '..gwkg....gkwg..', '..gggggggggggg..', '.gggggggggggggg.', 'gglbbbbbbbbbblgg', 'ggbbbbbbbbbbbbgg', 'ggbkkkkkkkkkkbgg', '.gggggggggggggg.', 'ggg.gg....gg.ggg'],
    ['...gg......gg...', '..gwkg....gkwg..', '..gggggggggggg..', '.gggggggggggggg.', 'gglbbbbbbbbbblgg', 'ggbbbbbbbbbbbbgg', 'ggbbkkkkkkkkbbgg', '.gggggggggggggg.', 'gg..gg....gg..gg']] },
  ombre: { c: { o: '#2a1a3a', l: '#5a3a7a', r: '#ff4a4a', k: '#0a0510' }, f: [
    ['...oooooo...', '..oolooooo..', '.oorooooroo.', '.oooooooooo.', 'oooooooooooo', 'o.oo.oo.oo.o'],
    ['...oooooo...', '..oolooooo..', '.oorooooroo.', '.oooooooooo.', 'oooooooooooo', '.oo.oo.oo.oo']] },
  queue: { c: { q: '#c83a2a', l: '#f07a4a', d: '#8a1a1a' }, f: [['......qq', '....qqlq', '...qqlq.', '..qqlq..', '.qqqq...', 'qqqq....', 'ddd.....'], ['.......q', '.....qqq', '...qqlq.', '..qqlq..', '.qqlq...', 'qqqq....', 'ddd.....']] },
  serpenteau: { c: { s: '#e8e4d0', d: '#b8b4a0', k: '#1c1420' }, f: [['...ss', '..sks', 'ss.s.', '.ss..'], ['..ss.', '.sks.', 'ss.s.', 's.ss.']], miroir: true },
  papier: { c: { p: '#f4f0e8', d: '#c8c0b0' }, f: [['pp..pp', 'pdp.dp', '.pppp.', 'pdp.dp', 'pp..pp'], ['......', 'pppppp', '.pddp.', 'pppppp', '......']] },
};

// Tenues des shinobi ennemis : masques et capuches (création originale)
const MASQUES_ENNEMIS = {
  bandana: { coiffure: 'kiba', c: { h: '#3a3440', g: '#5a5268', H: '#221e28', b: '#6a6a78', p: '#8a8a98', P: '#4a4a58', r: '#c83a2a' }, bas: 'bandana' },
  ame: { coiffure: 'kakuzu', c: { h: '#4a5a6a', g: '#6a7a8a', H: '#2a3440', b: '#3a4a5a', p: '#a8b0c0', P: '#5a6070', k: '#6a7078', K: '#4a5058' } },
  suna: { coiffure: 'kankuro', c: { h: '#c8a870', g: '#e0c890', H: '#a08050', b: '#8a7050', p: '#c8c0b0', P: '#6a6050', v: '#8a5a2a' } },
  oto: { coiffure: 'hinata', c: { h: '#6a6a70', g: '#8a8a90', H: '#4a4a50' } },
  kiri: { coiffure: 'kakashi', c: { h: '#3a4a5a', g: '#5a6a7a', H: '#26323e', b: '#6a7a8a', p: '#b8c0c8', P: '#6a7078', k: '#d8dce0', K: '#a8acb0' } },
  zetsu: { coiffure: 'lee', c: { h: '#e8e8e0', g: '#ffffff', H: '#c8c8c0' }, peau: '#ecece4' },
  kabuto: { coiffure: 'sasori', c: { h: '#b8b8c0', g: '#d8d8e0', H: '#8a8a94' } },
  anbu: { coiffure: 'sasuke', c: { h: '#2a2a34', g: '#4a4a58', H: '#18181e', b: '#2a2a34', p: '#e8e4dc', P: '#c83a2a' } },
  alliance: { coiffure: 'naruto', c: { h: '#5a4a3a', g: '#7a6a5a', H: '#3a2e24', b: '#3a3a44', p: '#cfd2de', P: '#6a7088' } },
};
const _spEnn = {};
function spriteEnnemi(e) {
  const d = e.def; const S = d.sprite || { type: 'carte', cle: 'poupee' };
  const cle = d.id; if (_spEnn[cle]) return _spEnn[cle];
  let r;
  if (S.type === 'carte' && CARTES_CREATURES[S.cle]) {
    const C = CARTES_CREATURES[S.cle]; const col = Object.assign({}, C.c, S.couleurs || {});
    r = { frames: C.f.map(f => contourner(peindre(f.map(l => l.padEnd(Math.max(...f.map(x => x.length)), '.')), col))), miroir: C.miroir, base: 1 };
  } else if (S.type === 'ninja') {
    const M = MASQUES_ENNEMIS[S.masque] || MASQUES_ENNEMIS.bandana;
    const V = { coiffure: M.coiffure, c: Object.assign({}, M.c, S.cheveux || {}), yeux: S.yeux || 'normal', corps: Object.assign({ mode: 'standard', t: '#4a4a58', T: '#34343e', a: '#4a4a58', A: '#34343e', c: '#2a2a34', e: '#2a2a34', p: '#3a3a44', P: '#26262e', f: '#26262e' }, S.corps || {}), nuages: S.nuages };
    const k = 'enn_' + d.id; VISUELS[k] = V;
    const P = spritesPerso(k);
    const frame = (i) => { const c = toile(32, 34); const g = ctxDe(c); dessinerPerso(g, k, 16, 33, { dirCorps: 'bas', frame: i ? 1 : 3, dirTete: 'bas', etatTete: 'normal' }); if (M.bas === 'bandana') { g.fillStyle = M.c.r || '#8a2a2a'; g.fillRect(9, 15, 14, 4); } if (S.arme) { g.fillStyle = '#c8ccd8'; g.fillRect(24, 16, 2, 12); g.fillStyle = '#6a4a2a'; g.fillRect(24, 26, 2, 3); } return c; };
    r = { frames: [frame(0), frame(1)], base: 1 };
    if (M.peau) { r.frames = r.frames.map(f => f); }
  } else r = { frames: [contourner(disque(e.r || 8, '#a04a6a'))], base: 0 };
  return (_spEnn[cle] = r);
}
// ── Familiers ──
const _spFam = {};
function spriteFamilier(f) {
  const d = f.def; const cle = d.id + (f.variante || ''); if (_spFam[cle]) return _spFam[cle];
  const S = d.sprite || {};
  let r;
  if (S.carte && CARTES_CREATURES[S.carte]) { const C = CARTES_CREATURES[S.carte]; const col = Object.assign({}, C.c, S.couleurs || {}); r = { frames: C.f.map(x => contourner(peindre(x.map(l => l.padEnd(Math.max(...x.map(y => y.length)), '.')), col))), base: 1 }; }
  else if (S.icone) { r = { frames: [iconeObjet(S.icone)], base: 2 }; }
  else r = { frames: [contourner(disque(5, S.couleur || '#e0e0f0'))], base: 0 };
  return (_spFam[cle] = r);
}
