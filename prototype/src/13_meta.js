// Méta-progression (§D7) : sauvegarde versionnée (§G9, migrations v1 → v3 reprises de outils/sauvegarde.py),
// Ryō, maîtrise, déblocages, missions (200), secrets (60), boutique.
const CLE_SAVE='nss-sauvegarde',VERSION=3,ENTREES_DEPART=DATA.personnages.filter(p=>p.deblocage.type==='DEPART').map(p=>p.id);
function v1v2(d){return{version:2,profil:{ryo:+(d.ryo||0),entrees:[...new Set([...(d.persos||[]),...ENTREES_DEPART])],maitrise:Object.assign({},d.maitrise||{})},options:Object.assign({},d.options||{})};}
function v2v3(d){const o=d.options||{};return{version:3,profil:Object.assign({},d.profil,{archives:d.profil.archives||[],secrets:d.profil.secrets||[]}),
 reglages:{accessibilite:{reduire_flashs:o.flash===false,secousses:o.secousses??1,particules:o.particules||'normal',sans_clignotement:!!o.sans_clignotement,taille_texte:o.taille_texte||1},commandes:o.commandes||{}},reprise:null};}
function migrer(d){let v=d.version||1;if(v>VERSION)throw new Error('sauvegarde plus récente');while(v<VERSION){d=(v===1?v1v2:v2v3)(d);v=d.version;}return d;}
function profilVide(){return{ryo:0,entrees:ENTREES_DEPART.slice(),maitrise:{},archives:[],secrets:[],cartes:['MAP_001','MAP_002'],missions:{},stats:{runs:0,kills:0,temps:0,victoires:0,coffres:0},
 achats:{relance:0,ban:0,passage:0,quatrieme:0},entr:{pv:0,pow:0,move:0},recettes:[],syn:[],eqp:[],trf:[],boss:{},cpt:{},visites:{},victoiresCarte:{},dernier:null,assist:{},options:{}};}
let DOC=null,SAVE=null;
function chargerSave(){let d=null;for(const k of[CLE_SAVE,CLE_SAVE+'.bak']){try{const s=localStorage.getItem(k);if(s){d=JSON.parse(s);break;}}catch(e){d=null;}}
 try{d=d?migrer(d):null;}catch(e){d=null;}
 if(!d)d={version:3,profil:profilVide(),reglages:{accessibilite:{},commandes:{}},reprise:null};
 const base=profilVide();for(const k in base)if(d.profil[k]===undefined)d.profil[k]=base[k];for(const id of ENTREES_DEPART)if(!d.profil.entrees.includes(id))d.profil.entrees.push(id);
 DOC=d;SAVE=d.profil;Object.assign(OPT,SAVE.options||{});}
function ecrireSave(){SAVE.options=Object.assign({},OPT);try{const s=JSON.stringify(DOC);const old=localStorage.getItem(CLE_SAVE);if(old)localStorage.setItem(CLE_SAVE+'.bak',old);localStorage.setItem(CLE_SAVE,s);}catch(e){}}
chargerSave();
const SAVE_RECETTE=id=>{if(!SAVE.recettes.includes(id))SAVE.recettes.push(id);},SAVE_SYN=id=>{if(!SAVE.syn.includes(id))SAVE.syn.push(id);},
 SAVE_EQP=id=>{if(!SAVE.eqp.includes(id))SAVE.eqp.push(id);},SAVE_TRF=id=>{if(!SAVE.trf.includes(id))SAVE.trf.push(id);},SAVE_BOSS=id=>{const b=SAVE.boss[id]||(SAVE.boss[id]={n:0,rangs:[]});b.n++;if(G.rangId&&!b.rangs.includes(G.rangId))b.rangs.push(G.rangId);};
// Maîtrise : niveaux 1–10 gagnés en jouant (minutes de jeu cumulées)
const SEUILS_MAITRISE=[0,8,20,36,56,80,110,145,185,230];
function maitrise(chrId){const base=CHR[chrId]&&CHR[chrId].base||chrId;const pts=SAVE.maitrise[base]||0;let n=1;for(let i=0;i<SEUILS_MAITRISE.length;i++)if(pts>=SEUILS_MAITRISE[i])n=i+1;return Math.min(10,n);}
function debloque(chrId){return OPT.toutDebloque||SAVE.entrees.includes(chrId);}
function carteDebloquee(id){return OPT.toutDebloque||SAVE.cartes.includes(id);}
function rangOk(run,min){return RANG_ORDRE.indexOf(run)>=RANG_ORDRE.indexOf(min||'D');}
function progresMission(m){const c=m.crit,cpt=SAVE.cpt;
 if(c.type==='compteur'){const k=c.cle;const v=k==='trf_dist'?SAVE.trf.length:k==='eqp_dist'?SAVE.eqp.length:k==='recettes'?SAVE.recettes.length:k==='secrets'?SAVE.secrets.length:
  k==='maitrise'?Math.max(0,...Object.keys(SAVE.maitrise).map(maitrise)):k==='runs'?SAVE.stats.runs:/^STA_/.test(k)?(cpt['st_'+k]||0):(cpt[k]||0);return[v,c.n];}
 if(/Découvrir (\d+) synergies/.test(m.condition))return[SAVE.syn.length,+RegExp.$1];
 return null;}
function missionSuivie(m){return m.crit.type!=='texte'||/Découvrir (\d+) synergies/.test(m.condition);}
// Évaluation à la fin d'une run (et pour les compteurs cumulés)
function evaluerMissions(win){const faites=[];for(const m of DATA.missions){if(SAVE.missions[m.id])continue;if(!m.dependances.every(d=>SAVE.missions[d]))continue;const c=m.crit;
  if(c.sans_aide&&G.aide)continue;if(c.rang&&!rangOk(G.rangId,c.rang))continue;
  if(m.personnage&&m.personnage!=='TOUS'&&!(G.chr.id===m.personnage||G.chr.base===m.personnage))continue;if(c.avec&&!(G.chr.id===c.avec||G.chr.base===c.avec))continue;
  if(c.maitrise&&maitrise(G.chr.id)<c.maitrise)continue;
  const surCarte=!m.carte||m.carte===G.map.id,bonMode=!m.mode||m.mode==='Standard'||m.mode===G.mode||(m.mode==='Expedition'&&G.mode==='Expedition');
  let ok=false;
  switch(c.type){
  case'vaincre':ok=surCarte&&c.boss.filter(Boolean).length>0&&(c.tous?c.boss.every(b=>SAVE.boss[b]):c.boss.some(b=>G.bossVaincus.includes(b)))&&(!c.min||G.time>=c.min*60*(G.f<1?G.f:1));break;
  case'terminer':ok=win&&surCarte&&bonMode;break;
  case'survivre':ok=surCarte&&G.time>=c.min*60&&(G.mode==='Endless'||win||G.time>=c.min*60);break;
  case'niveau':ok=G.level>=c.n;break;
  default:{const p=progresMission(m);if(p)ok=p[0]>=p[1];}}
  if(ok){SAVE.missions[m.id]=1;faites.push(m);const r=m.recompenses||{};SAVE.ryo+=r.ryo||0;G.ryoMissions=(G.ryoMissions||0)+(r.ryo||0);
   for(const d of r.deblocages||[]){if(/^CHR_/.test(d)&&!SAVE.entrees.includes(d))SAVE.entrees.push(d);if(/^MAP_/.test(d)&&!SAVE.cartes.includes(d))SAVE.cartes.push(d);}}}
 return faites;}
function deblocagesMaitrise(){const out=[];for(const p of DATA.personnages){if(SAVE.entrees.includes(p.id))continue;const d=p.deblocage;
  if(d.type==='MAITRISE'&&p.base&&maitrise(p.base)>=d.niveau){SAVE.entrees.push(p.id);out.push(p);}
  if(d.type==='PREMIERE_RUN'&&SAVE.stats.runs>=1&&SAVE.stats.longue){SAVE.entrees.push(p.id);out.push(p);}}return out;}
// Secrets : suivi automatique quand la condition est vérifiable par le jeu (sinon « suivi non disponible »).
function secretSuivi(s){const c=s.condition;return /EVO_\d{3}/.test(c)&&/Réaliser/.test(c)||/^Terminer (MAP_\d{3}|Suna|le Sommet|MAP_011)/.test(c)||/Sauver 10 réfugiés/.test(c)||/Ouvrir (\d+) coffres/.test(c)||
 /Vaincre un boss final en moins de 90 s/.test(c)||/posséder 3 techniques CLONE/.test(c)||/découvrir (\d+) synergies/.test(c)||/Terminer MIS_100/.test(c)||/Terminer (\d+) cartes différentes au rang A/.test(c)||(s.carte&&s.type==='guide'&&/^SEC_0[01]\d|SEC_020/.test(s.id));}
function evaluerSecrets(win){const out=[];const nomP=nomCourt(G.chr.nom).split(' ')[0];
 if(win){const k=G.map.id;(SAVE.victoiresCarte[k]=SAVE.victoiresCarte[k]||[]);if(!SAVE.victoiresCarte[k].includes(nomP))SAVE.victoiresCarte[k].push(nomP);
  if(G.rangId==='A'||RANG_ORDRE.indexOf(G.rangId)>=3){SAVE.cartesA=SAVE.cartesA||[];if(!SAVE.cartesA.includes(k))SAVE.cartesA.push(k);}}
 for(const s of DATA.secrets){if(SAVE.secrets.includes(s.id))continue;const c=s.condition;let ok=false;
  const evo=c.match(/Réaliser (?:les fusions )?(EVO_\d{3})(?: à (EVO_\d{3}))?/);if(evo){if(evo[2]){const a=+evo[1].slice(4),b=+evo[2].slice(4);ok=true;for(let i=a;i<=b;i++)if(!SAVE.recettes.includes('EVO_'+String(i).padStart(3,'0')))ok=false;}else ok=SAVE.recettes.includes(evo[1]);}
  const tm=c.match(/^Terminer (\S+) avec ([^(]+?)(?: \(|\.|$)/);if(tm&&win){const carte=/^MAP_/.test(tm[1])?tm[1]:s.carte;const noms=tm[2].split(/, | et | puis /).map(x=>x.trim().split(' ')[0]);ok=carte&&noms.every(n=>(SAVE.victoiresCarte[carte]||[]).includes(n));}
  if(/Sauver 10 réfugiés/.test(c))ok=(G.sauves||0)>=10;if(/Ouvrir (\d+) coffres/.test(c))ok=SAVE.stats.coffres>=+RegExp.$1;
  if(/moins de 90 s de combat/.test(c))ok=win&&G.bossDebut&&G.time-G.bossDebut<90;if(/posséder 3 techniques CLONE/.test(c))ok=G.techs.filter(I=>I.tags.has('CLONE')).length>=3;
  if(/découvrir (\d+) synergies/.test(c))ok=SAVE.syn.length>=+RegExp.$1;if(/Terminer MIS_100/.test(c))ok=!!SAVE.missions.MIS_100;if(/Terminer (\d+) cartes différentes au rang A/.test(c))ok=(SAVE.cartesA||[]).length>=+RegExp.$1;
  if(ok){SAVE.secrets.push(s.id);out.push(s);}}
 return out;}
function decouvrirSecret(id){if(SAVE.secrets.includes(id))return;SAVE.secrets.push(id);const s=SEC[id];banner('Secret découvert',s.nom+' — '+s.recompense,4);if(/\+1 Bannissement/.test(s.recompense))G.bans++;sfx('evo');ecrireSave();}
function niveauIndice(s){const v=SAVE.visites[s.carte]||0;return v>=6?3:v>=3?2:1;}
function placerStele(){const s=DATA.secrets.find(x=>x.carte===G.map.id&&x.type==='guide'&&/^SEC_0[01]\d$|^SEC_020$/.test(x.id));if(!s||SAVE.secrets.includes(s.id))return;
 const r=rng(hashStr(s.id));G.stele={x:G.map.w*(.15+r()*.7),y:G.map.h*(.15+r()*.7),sec:s.id,visible:niveauIndice(s)>=2};}
// Boutique §D7
const BOUTIQUE=[
 {id:'relance',nom:'Relance',desc:'Retire les 3 cartes et en tire 3 nouvelles.',couts:[500,1000,1500]},
 {id:'ban',nom:'Bannissement',desc:'Retire un objet du pool pour toute la run.',couts:[600,1200,1800]},
 {id:'passage',nom:'Passage',desc:'Ignore un niveau et donne 15 chakra.',couts:[300,600,900]},
 {id:'quatrieme',nom:'Voie du quatrième sceau',desc:'Quatrième carte aux niveaux multiples de 5 (catégories A ou C).',couts:[1500]},
 {id:'pv',nom:'Entraînement : PV',desc:'+2 % PV max par palier (plafond +10 %).',couts:[200,400,600,900,1200],entr:1},
 {id:'pow',nom:'Entraînement : Puissance',desc:'+2 % Puissance par palier (plafond +10 %).',couts:[200,400,600,900,1200],entr:1},
 {id:'move',nom:'Entraînement : Déplacement',desc:'+2 % déplacement par palier (plafond +10 %).',couts:[200,400,600,900,1200],entr:1}];
function niveauAchat(b){return b.entr?(SAVE.entr[b.id]||0):(SAVE.achats[b.id]||0);}
function acheter(b){const n=niveauAchat(b);if(n>=b.couts.length)return false;const c=b.couts[n];if(SAVE.ryo<c)return false;SAVE.ryo-=c;if(b.entr)SAVE.entr[b.id]=n+1;else SAVE.achats[b.id]=n+1;ecrireSave();sfx('coffre');return true;}
// Fin de run : Ryō, maîtrise, missions, secrets, déblocages
function finRun(win,cause){if(G.fini)return;G.fini=true;G.phase='fin';G.win=win;G.cause=cause;G.endT=G.rt;
 const mulR={D:.8,C:1,B:1.2,A:1.4,S:1.7,'S+':2}[G.rangId]||1;const ryo=Math.round((G.time/60*20+(win?150:0)+(G.ryoBonus||0))*mulR);SAVE.ryo+=ryo;
 const base=G.chr.base||G.chr.id;const avant=maitrise(G.chr.id);SAVE.maitrise[base]=(SAVE.maitrise[base]||0)+G.time/60;
 SAVE.stats.kills+=G.kills;SAVE.stats.temps+=G.time;if(win)SAVE.stats.victoires++;if(G.time>=180)SAVE.stats.longue=1;SAVE.visites[G.map.id]=(SAVE.visites[G.map.id]||0)+1;
 SAVE.stats.coffres+=G.cpt.coffres||0;for(const k in G.cpt)if(!/^recettes_/.test(k))SAVE.cpt[k]=(SAVE.cpt[k]||0)+G.cpt[k];
 if(G.mode!=='Standard'||true)SAVE.dernier={chr:G.chr.id,map:G.map.id,mode:G.mode,rang:G.rangId};
 const miss=evaluerMissions(win),sec=evaluerSecrets(win),deb=deblocagesMaitrise();
 G.bilan={ryo,ryoMissions:G.ryoMissions||0,maitriseAvant:avant,maitriseApres:maitrise(G.chr.id),missions:miss,secrets:sec,deblocages:deb};ecrireSave();}
