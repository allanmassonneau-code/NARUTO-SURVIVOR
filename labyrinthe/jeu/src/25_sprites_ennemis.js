// ═══════════════════════════════════════════════════════════════════════════
// Sprites des ennemis, boss et familiers. Les silhouettes annoncent la fonction :
// formes animales, marionnettes anguleuses ; les shinobi ennemis sont des personnages
// dessinés à part (25_shinobi.js). Deux frames par créature ; les boss shinobi
// réutilisent le constructeur de chibi des héros (même famille de visages).
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
  papillon_papier: { c: { w: '#f4f0e8', d: '#c8c0b0', k: '#1c1420', r: '#c83a5a' }, f: [
    ['ww.....ww', 'www...www', 'wwww.wwww', '.wwdrdww.', '..wdrdw..', '.ww.k.ww.', 'ww.....ww'],
    ['.........', 'ww.....ww', 'wwww.wwww', '.wwdrdww.', '..wdrdw..', '..w.k.w..', '.........']] },
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
  miroir_glace: { c: { b: '#9ccce8', l: '#eefaff', m: '#c8ecfa', d: '#5a90b8', f: '#3a6488' }, f: [[
    '..dddddddd..', '.dmmmmmmmmd.', '.dmllmmmmbd.', '.dmlmmmmmbd.', '.dmmmmmmbbd.', '.dmmmmmbbbd.', '.dmmmmbbbbd.', '.dmmmbbbbld.',
    '.dmmbbbbbld.', '.dmbbbbbbbd.', '.dbbbbbbbbd.', '.dbbbbblbbd.', '.dbbbbllbbd.', '.dbbbbbbbbd.', '..dddddddd..', '...ff..ff...', '..ffff.ffff.']] },
  // Grand serpent (boss) : tête dressée, anneaux enroulés, ventre clair ; langue animée
  serpent_geant: { c: { s: '#5f8a34', d: '#3f6424', l: '#8cb454', b: '#d8cf98', B: '#b0a670', k: '#1c1420', y: '#f0d040', r: '#c8303a' }, f: [[
    '...................ssss.......',
    '.................sslllss......',
    '................sllllllss.....',
    '................sllykllsss....',
    '................ssllllllssss..',
    '.................sssddssssssrr',
    '..................bbssss....r.',
    '.................bbsss........',
    '................bbss..........',
    '.....sssssss...bbss...........',
    '...sslllllllssbbss............',
    '..sllldsssddllbss.............',
    '.slldsbbbbbsdlllsssssss.......',
    '.slsdbbbbbbbbsdllllllllss.....',
    'sllsbBbbbbbbbbsdssssslllss....',
    'slsdbbBbbbbbbbbddddddsssllss..',
    '.sldsbbbbBBbbbbbbbbbddssslls..',
    '..ssddsbbbbbbbbbbbbbbbdssssl..',
    '....sssddddddddddddddddssss...',
    '.......ssssssssssssssssss.....'], [
    '...................ssss.......',
    '.................sslllss......',
    '................sllllllss.....',
    '................sllykllsss....',
    '................ssllllllssss..',
    '.................sssddsssssss.',
    '..................bbssss......',
    '.................bbsss........',
    '................bbss..........',
    '.....sssssss...bbss...........',
    '...sslllllllssbbss............',
    '..sllldsssddllbss.............',
    '.slldsbbbbbsdlllsssssss.......',
    '.slsdbbbbbbbbsdllllllllss.....',
    'sllsbBbbbbbbbbsdssssslllss....',
    'slsdbbBbbbbbbbbddddddsssllss..',
    '.sldsbbbbBBbbbbbbbbbddssslls..',
    '..ssddsbbbbbbbbbbbbbbbdssssl..',
    '....sssddddddddddddddddssss...',
    '.......ssssssssssssssssss.....']], miroir: true },
  // Empreinte des Dix Queues : masse sombre, œil unique cerclé, queues dressées
  dix_queues: { c: { o: '#2e2238', O: '#1c1424', l: '#54406a', r: '#e03a3a', R: '#ff8a6a', y: '#e8d890', k: '#0a0510', q: '#3a2c48' }, f: [[
    '..q...q....q.....q....q...q...',
    '.qq..qq...qq....qq...qq..qq...',
    '.qq.qq...qq....qq...qq..qq....',
    '..qqq...qq.....qq..qq..qq.....',
    '...qqq.qq.....qq..qq.qqq......',
    '....qqqqq.....qqqqqqqqq.......',
    '.....qqqoooooooooooqqq........',
    '....ooooolllllllloooooo.......',
    '...oooolllooooooollloooo......',
    '..oooollooooyyyoooolllooo.....',
    '..ooolloooyyrrryyoooolloo.....',
    '.oooolloooyrRkRryooooollooo...',
    '.oooollooooyrrryoooooolloooo..',
    '.ooooolloooyyyyyoooooolloooo..',
    'ooooooollooooooooooooloooooo..',
    'oOooooooollloooooollloooooOo..',
    'oOOooooooooolllllllooooooOOo..',
    '.oOOoooooooooooooooooooOOOo...',
    '.oOoOoooOoooooooooOoooOoOoo...',
    '..o.oo.oo.oo..oo.oo.oo.oo.o...'], [
    '...q...q....q....q....q...q...',
    '..qq..qq...qq...qq...qq..qq...',
    '.qq..qq...qq....qq..qq..qq....',
    '.qqq.qq..qq.....qq.qq..qq.....',
    '..qqqqq.qq.....qq.qq..qqq.....',
    '....qqqqqq....qqqqqqqqq.......',
    '.....qqqoooooooooooqqq........',
    '....ooooolllllllloooooo.......',
    '...oooolllooooooollloooo......',
    '..oooollooooyyyoooolllooo.....',
    '..ooolloooyyrrryyoooolloo.....',
    '.oooolloooyrRkRryooooollooo...',
    '.oooollooooyrrryoooooolloooo..',
    '.ooooolloooyyyyyoooooolloooo..',
    'ooooooollooooooooooooloooooo..',
    'oOooooooollloooooollloooooOo..',
    'oOOooooooooolllllllooooooOOo..',
    '.oOOoooooooooooooooooooOOOo...',
    '.oOoOoooOoooooooooOoooOoOoo...',
    '..oo.oo.oo.oo..oo.oo.oo.oo....']] },
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
// Signes distinctifs dessinés sur le visage (tête en (3,0), centre du visage ≈ (16,13))
function dessinerVisage(g, type, cx, cy) {
  const px = (x, y, c) => { g.fillStyle = c; g.fillRect(cx + x, cy + y, 1, 1); };
  if (type === 'spirale') { // masque orange à spirale, un seul trou d'œil
    for (let y = -6; y <= 6; y++) for (let x = -8; x <= 8; x++) {
      const e = (x * x) / 70 + (y * y) / 40; if (e > 1) continue;
      const ex = x - 3, ey = y; const d = Math.hypot(ex, ey), a = Math.atan2(ey, ex);
      const bande = (((d - a * 2.4 / Math.PI) % 2.4) + 2.4) % 2.4;
      px(x, y, e > 0.8 ? '#8a3a0a' : d < 1 ? '#1c1420' : bande < 0.9 ? '#a8480c' : '#ec8a24');
    }
  } else if (type === 'piercings') { for (const [x, y] of [[-5, 3], [5, 3], [-2, 5], [2, 5], [0, -1], [-6, -3], [6, -3]]) px(x, y, '#c8ccd8'); }
  else if (type === 'branchies') { for (const [x, y] of [[-7, 2], [-7, 4], [7, 2], [7, 4]]) { px(x, y, '#2a4a6a'); px(x + (x < 0 ? 1 : -1), y, '#2a4a6a'); } }
}
// Cache par objet « sprite » et par échelle : les copies de définition créées en combat
// (illusions, masques, miroirs) qui gardent le même objet sprite ne le reconstruisent pas.
// Créatures partageant une même forme : l'accessoire annonce l'attaque
function accessoireCreature(d, S) {
  const P = d.params || {}, co = d.comportement;
  const R = (g, x, y, l, h, c) => { g.fillStyle = c; g.fillRect(x, y, l, h); };
  const fils = (g, bx, by, bw, xs) => { R(g, bx + 1, 0, bw - 2, 2, '#6a4a2a'); R(g, bx + 1, 0, bw - 2, 1, '#9a7a4a'); for (const x of xs) R(g, bx + x, 2, 1, by + 2 - 2, 'rgba(235,235,250,0.85)'); };
  switch (S.cle) {
    case 'marionnette':
      if (co === 'chargeur') return (g, bx, by, bw, bh, i, c) => { if (c !== 'face') return; for (let k = 0; k < 6; k++) { R(g, bx + 1 - k, by + 5 + k + i, 1, 1, '#f0f4ff'); R(g, bx + 1 - k, by + 6 + k + i, 1, 1, '#7a8090'); R(g, bx + bw - 2 + k, by + 5 + k + i, 1, 1, '#f0f4ff'); R(g, bx + bw - 2 + k, by + 6 + k + i, 1, 1, '#7a8090'); } };
      if (co === 'tourelle') return (g, bx, by, bw, bh, i, c) => { if (c === 'dos') { for (const x of [bx + 1, bx + bw - 4]) { R(g, x - 1, by - 5, 5, 8, '#1c1420'); R(g, x, by - 4, 3, 7, '#4a4450'); R(g, x, by - 4, 3, 1, '#9a92a8'); } } else { R(g, bx - 1, by + bh - 4, bw + 2, 5, '#1c1420'); R(g, bx, by + bh - 3, bw, 3, '#4a3e36'); for (let x = bx + 2; x < bx + bw - 1; x += 4) R(g, x, by + bh - 2, 1, 1, '#b0a898'); } };
      if (co === 'inerte') return (g, bx, by, bw, bh, i, c) => { if (c === 'dos') fils(g, bx, by, bw, [3, Math.floor(bw / 2), bw - 4]); };
      return null;
    case 'statue':
      if (P.bouclier === 'frontal') return (g, bx, by, bw, bh, i, c) => { if (c !== 'face') return; const x = bx + 2, y = by + bh - 10, w = bw - 4; R(g, x - 1, y - 1, w + 2, 11, '#1c1420'); R(g, x, y, w, 9, '#6a5a4a'); R(g, x, y, w, 1, '#b89a6a'); R(g, x, y, 1, 9, '#b89a6a'); R(g, x + Math.floor(w / 2) - 1, y + 2, 2, 5, '#e8c050'); R(g, x + Math.floor(w / 2) - 3, y + 4, 6, 1, '#e8c050'); };
      if (P.bouclier === 'aura') return (g, bx, by, bw, bh, i, c) => { if (c !== 'face') return; for (const [x, y] of [[3, 4], [bw - 4, 4], [Math.floor(bw / 2), 6], [4, 8], [bw - 5, 8]]) R(g, bx + x, by + y, 1, 1, '#8ae0ff'); for (let k = -1; k <= 1; k++) R(g, bx + Math.floor(bw / 2) + k * 3, by - 3 - (k ? 0 : 1) - (i && !k ? 1 : 0), 2, 2, '#8ae0ff'); };
      if (co === 'lourd') return (g, bx, by, bw, bh, i, c) => { if (c !== 'dos') return; for (let k = 0; k < 8; k++) R(g, bx + bw - 3 + Math.round(k * 0.5), by + bh - 4 - k, 2, 1, '#6a4a2a'); R(g, bx + bw - 1, by - 5, 7, 7, '#1c1420'); R(g, bx + bw, by - 4, 5, 5, '#5a5058'); R(g, bx + bw, by - 4, 5, 1, '#8a8098'); };
      return null;
    case 'crapaud':
      if (co === 'lanceur_arc') return (g, bx, by, bw, bh, i, c) => { if (c !== 'face') return; const x = bx + Math.floor(bw / 2) - 3, y = by + bh - 6; g.drawImage(ellipse(4, 2 + i, '#1c1420'), x - 1, y - 1 - i); g.drawImage(ellipse(3, 1 + i, '#f0c060'), x, y - i); R(g, x + 2, y + 3, 1, 2, '#3a2a1a'); };
      return null;
    case 'momie':
      if (d.mort === 'division') return (g, bx, by, bw, bh, i, c) => { if (c !== 'face') return; const x = bx + Math.floor(bw / 2) - 1; for (let y = by + 2; y < by + bh - 1; y++) { R(g, x, y, 1, 1, '#5a3a3a'); if (y % 2 === 0) R(g, x - 1, y, 3, 1, '#7a4a4a'); } };
      if (co === 'lourd') return (g, bx, by, bw, bh, i, c) => { if (c !== 'face') return; for (const x of [bx - 2, bx + bw - 3]) { R(g, x, by + bh - 7, 5, 5, '#1c1420'); R(g, x + 1, by + bh - 6, 3, 3, '#9a8a6a'); R(g, x + 1, by + bh - 6, 3, 1, '#c8b890'); } };
      return null;
    case 'serpent':
      if (co === 'chargeur') return (g, bx, by, bw, bh, i, c) => { if (c !== 'face') return; for (let k = 0; k < 3; k++) { R(g, bx + 8 + k * 2, by - 2 - (k % 2), 1, 3 + (k % 2), '#f8f4e0'); } R(g, bx + bw - 3, by + 3, 2, 1, '#ffffff'); };
      return null;
    case 'cuve':
      if (co === 'lanceur_arc') return (g, bx, by, bw, bh, i, c) => { if (c !== 'dos') return; const x = bx + Math.floor(bw / 2) - 2; R(g, x - 1, by - 5, 6, 7, '#1c1420'); R(g, x, by - 4, 4, 6, '#4a5058'); R(g, x, by - 4, 4, 1, '#8a929c'); R(g, x + 1, by - 6 - i, 2, 2, '#8af0a0'); };
      if (co === 'invocateur') return (g, bx, by, bw, bh, i, c) => { if (c !== 'dos') return; for (const [dx, dy] of [[3, 0], [Math.floor(bw / 2) - 1, -1 - i], [bw - 6, 0]]) { R(g, bx + dx - 1, by + dy - 3, 5, 4, '#1c1420'); R(g, bx + dx, by + dy - 2, 3, 2, '#e8e4d0'); R(g, bx + dx + 2, by + dy - 2, 1, 1, '#c83a2a'); } };
      return null;
    case 'oiseau_argile':
      if (co === 'kamikaze') return (g, bx, by, bw, bh, i, c) => { if (c !== 'face') return; const x = bx + Math.floor(bw / 2); R(g, x, by - 3, 1, 4, '#3a3040'); R(g, x - 1, by - 5, 3, 2, i ? '#ff7a2a' : '#ffe060'); R(g, x - 1, by + bh - 5, 3, 2, '#c83a2a'); };
      if (co === 'volant') return (g, bx, by, bw, bh, i, c) => { if (c === 'dos') fils(g, bx, by, bw, [1, bw - 2]); };
      return null;
    case 'masque':
      if (P.proj === 'feu') return (g, bx, by, bw, bh, i, c) => { if (c !== 'face') return; for (let k = 0; k < 5; k++) { const x = bx + 1 + k * Math.floor((bw - 2) / 4), h = 3 + ((k + i) % 2) * 2; R(g, x - 1, by + 1 - h, 3, h + 1, '#1c1420'); R(g, x, by + 1 - h, 1, h, (k + i) % 2 ? '#ffd040' : '#ff7a2a'); } };
      if (P.motif === 'rotation') return (g, bx, by, bw, bh, i, c) => { if (c !== 'dos') return; for (const x of [bx - 2, bx + bw]) { R(g, x - 1, by + 1, 4, 9, '#1c1420'); R(g, x, by + 2, 2, 7, '#f0ece0'); R(g, x, by + 4 + i, 2, 1, '#c83a2a'); } };
      return null;
  }
  return null;
}
const _spEnn = new WeakMap(), SPRITE_DEFAUT = { type: 'carte', cle: 'poupee' };
function spriteEnnemi(e) {
  const d = e.def; const S = d.sprite || SPRITE_DEFAUT;
  // taille : les boss sont agrandis par Scale2x (×2, ou ×4 pour les géants) ; les autres restent à l'échelle 1
  const k = d.echelleSprite ? (d.echelleSprite >= 3 ? 4 : d.echelleSprite) : (d.boss && !d.mini ? 2 : 1);
  let cache = _spEnn.get(S); if (!cache) { cache = new Map(); _spEnn.set(S, cache); }
  if (cache.has(k)) return cache.get(k);
  let r;
  const agrandir = c => k >= 4 ? agrandir2x(agrandir2x(c)) : k === 2 ? agrandir2x(c) : c;
  if (S.type === 'carte' && CARTES_CREATURES[S.cle]) {
    const C = CARTES_CREATURES[S.cle]; const col = Object.assign({}, C.c, S.couleurs || {});
    const brut = C.f.map(f => peindre(f.map(l => l.padEnd(Math.max(...f.map(x => x.length)), '.')), col));
    // une créature bien plus petite que sa zone de contact est doublée (Scale2x, comme les boss) : on voit ce qui touche
    const kc = k === 1 ? Math.max(1, Math.min(2, Math.round(2.4 * (d.r || 9) / brut[0].width))) : 1;
    r = { frames: brut.map(b => contourner(avecMarge(kc === 2 ? agrandir2x(b) : agrandir(b)))), miroir: C.miroir, base: 1 };
    const A = k === 1 && accessoireCreature(d, S);
    if (A) r.frames = brut.map((b, i) => { // accessoire posé à l'échelle 1, puis l'ensemble agrandi et contouré d'un trait
      const f = avecMarge(b), M = 6, T = 7, c = toile(f.width + 2 * M, f.height + T), g = ctxDe(c);
      A(g, M, T, f.width, f.height, i, 'dos'); g.drawImage(kc === 2 ? f : contourner(f), M, T); A(g, M, T, f.width, f.height, i, 'face');
      return kc === 2 ? contourner(avecMarge(agrandir2x(c))) : c;
    });
  } else if (S.type === 'shinobi') {
    const B = spriteShinobi(S.perso); r = k > 1 ? Object.assign({}, B, { frames: B.frames.map(agrandir), base: k }) : B;
  } else if (S.type === 'ninja') {
    const M = MASQUES_ENNEMIS[S.masque] || MASQUES_ENNEMIS.bandana;
    const cs = Object.assign({}, M.c, S.cheveux || {}); const peau = S.peau || M.peau; if (peau) { cs.s = peau; cs.d = nuancer(peau, 0.82); cs.l = nuancer(peau, 1.12); }
    const V = { coiffure: S.coiffure || M.coiffure, c: cs, yeux: S.yeux || 'normal', corps: Object.assign({ mode: 'standard', t: '#4a4a58', T: '#34343e', a: '#4a4a58', A: '#34343e', c: '#2a2a34', e: '#2a2a34', p: '#3a3a44', P: '#26262e', f: '#26262e' }, S.corps || {}), nuages: S.nuages, dos: S.dos };
    const cle = 'enn_' + d.id + '_' + d.nom; VISUELS[cle] = V;
    const P = spritesPerso(cle);
    const frame = (i) => { const c = toile(32, 34); const g = ctxDe(c); dessinerPerso(g, cle, 16, 33, { dirCorps: 'bas', frame: i ? 1 : 3, dirTete: 'bas', etatTete: 'normal' }); if (M.bas === 'bandana') { g.fillStyle = M.c.r || '#8a2a2a'; g.fillRect(9, 15, 14, 4); } if (S.arme) { g.fillStyle = '#c8ccd8'; g.fillRect(24, 16, 2, 12); g.fillStyle = '#6a4a2a'; g.fillRect(24, 26, 2, 3); } if (S.visage) dessinerVisage(g, S.visage, 16, 13); return c; };
    r = { frames: [frame(0), frame(1)].map(agrandir), base: k }; // pieds à 1 px du bas, ×k après agrandissement
  } else r = { frames: [contourner(disque(d.r || 8, '#a04a6a'))], base: 0 };
  cache.set(k, r); return r;
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
