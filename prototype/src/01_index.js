// Index des catalogues et règles de référence (registre §R5, §R6, dossier §D8, §D9).
const byId=a=>Object.fromEntries(a.map(x=>[x.id,x]));
const T=byId(DATA.techniques),EVO=byId(DATA.evolutions),CHR=byId(DATA.personnages),PASD=byId(DATA.passifs),EQPD=byId(DATA.equipements),
 TRFD=byId(DATA.transformations),ULTD=byId(DATA.ultimes),ENM=byId(DATA.ennemis),BOS=byId(DATA.boss),MAP=byId(DATA.cartes),
 MIS=byId(DATA.missions),SEC=byId(DATA.secrets),SYN=byId(DATA.synergies),BLD=byId(DATA.builds);

// Expression d'accès §R5 : « A+B|C » (+ prioritaire sur |).
function accesOk(expr,apt){if(!expr||expr==='LIBRE')return true;
 return String(expr).split('|').some(alt=>alt.split('+').every(tok=>{tok=tok.trim();return tok==='LIBRE'||apt.has(tok);}));}
function aptitudes(chr){const s=new Set(chr.aptitudes||[]);s.add(chr.id);if(chr.base)s.add(chr.base);return s;}

const FAM_COL={KATON:'#ff6a2a',SUITON:'#3f9be0',RAITON:'#b8d8ff',FUTON:'#8ee07a',DOTON:'#b58a4a',RARE:'#d07aff',TAIJUTSU:'#f0c060',OUTIL:'#a8b0bc',
 INVOC:'#f08a24',GENJUTSU:'#c04ad0',SCEAU:'#e8d27a',CLAN:'#7ff0ff',OCULAIRE:'#e04040'};
const ELEM_COL={E_KATON:'#ff6a2a',E_SUITON:'#3f9be0',E_RAITON:'#cfe6ff',E_FUTON:'#9fe88c',E_DOTON:'#b58a4a',E_MOKUTON:'#6a9a3a',E_HYOTON:'#c8f0ff',
 E_SABLE:'#d8b878',E_JITON:'#5a5a6a',E_SHAKUTON:'#ffb040',E_YOTON:'#ff4a2a',E_BAKUTON:'#ffe070',E_RANTON:'#80a0ff',E_ENTON:'#303030',E_FUTTON:'#e0e0e0',
 E_JINTON:'#f0f0ff',E_NEUTRE:'#e8e6e1'};
function techCol(t){const e=(t.tags||[]).find(x=>x.startsWith('E_')&&x!=='E_NEUTRE');return e?ELEM_COL[e]:(FAM_COL[t.famille]||'#e8e6e1');}
const FAM_NOM={KATON:'Katon',SUITON:'Suiton',RAITON:'Raiton',FUTON:'Fūton',DOTON:'Doton',RARE:'Affinités rares',TAIJUTSU:'Taijutsu',OUTIL:'Armes et outils',
 INVOC:'Invocations et clones',GENJUTSU:'Genjutsu',SCEAU:'Sceaux',CLAN:'Clan et héritage',OCULAIRE:'Oculaire'};
const LIV_NOM={PROJECTILE:'Projectile',SALVE:'Salve',CONE:'Cône',ONDE:'Onde',CONTACT:'Contact',ORBITE:'Orbite',ZONE:'Zone',PIEGE:'Piège',RAYON:'Rayon',
 CHAINE:'Chaîne',INVOCATION:'Invocation',DIFFERE:'Différé'};
const STA_NOM={STA_01:'Brûlure',STA_02:'Imbibé d’huile',STA_03:'Trempé',STA_04:'Électrisé',STA_05:'Refroidi',STA_06:'Ensablé',STA_07:'Lié par l’ombre',
 STA_08:'Empoisonné',STA_09:'Marqué',STA_10:'Confus',STA_11:'Étourdi',STA_12:'Vulnérable',STA_13:'Repoussé',STA_14:'Parasité',STA_15:'Charge d’argile',
 STA_16:'Aveuglé',STA_17:'Corrodé',STA_18:'Entaillé',STA_19:'Entravé',STA_20:'Lien maudit',STA_21:'Encré',STA_22:'Aimanté',STA_23:'Vapeur'};
const STA_COL={STA_01:'#ff7a2a',STA_02:'#8a7a30',STA_03:'#4aa8f0',STA_04:'#e0f0ff',STA_05:'#a8e8ff',STA_06:'#d8b878',STA_07:'#303040',STA_08:'#7ad04a',
 STA_09:'#f0d060',STA_10:'#d060e0',STA_11:'#ffff80',STA_12:'#c77dff',STA_14:'#6a8a3a',STA_15:'#c89a6a',STA_16:'#f0f0f0',STA_17:'#9ac040',STA_18:'#d03030',
 STA_19:'#6a9a3a',STA_20:'#a01010',STA_21:'#202020',STA_22:'#6a6a8a',STA_23:'#e0e0e0'};

// Rangs §D8 : [PV, dégâts]
const RANGS={D:{pv:.8,dg:.7,tele:1.5},C:{pv:1,dg:1,tele:1},B:{pv:1.15,dg:1.1,tele:1},A:{pv:1.3,dg:1.2,tele:1},S:{pv:1.45,dg:1.3,tele:1},'S+':{pv:1.6,dg:1.4,tele:1}};
const RANG_ORDRE=['D','C','B','A','S','S+'];
// Modes §D9 (boss = arrivée du boss final en secondes ; fin = retraite forcée)
const MODES={
 Standard:{nom:'Standard',boss:1200,fin:1680,xp:1,desc:'25 min, boss à 20:00, prolongation jusqu’à 28:00.'},
 Expedition:{nom:'Expédition courte',boss:600,fin:840,xp:1.6,desc:'12 min, boss à 10:00 (lieutenant promu), XP ×1,6.'},
 Endless:{nom:'Endless',boss:0,fin:0,xp:1,desc:'Sans fin : boss tournant toutes les 10 min, PV ×(1 + 0,15 × minute).'},
 BossRush:{nom:'Boss Rush',boss:0,fin:0,xp:1,desc:'4 à 6 boss enchaînés, départ au niveau 30, 3 cartes entre chaque boss.'},
 Draft:{nom:'Draft',boss:1200,fin:1680,xp:1,desc:'6 techniques choisies parmi 12 avant la run ; aucune nouvelle technique en jeu.'},
};
const ENTREES=DATA.personnages;
const nomCourt=n=>String(n).split(' — ')[0].split(' (')[0];
