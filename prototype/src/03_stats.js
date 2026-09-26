// Statistiques du joueur (§B4.1) : passifs PAS, équipements EQP, transformations TRF, CPX.
// Les bonus « +X % » s'additionnent dans A ; les « ×X » (évolution, transformation) dans M (§B4.2).
function newST(){return{power:0,cad:0,zone:0,dur:0,qte:0,vproj:0,crit:.05,critd:1.5,move:0,armor:0,regen:0,pickup:0,hpMul:0,hpFlat:0,chakra:0,xp:0,luck:0,red:0,
 lifesteal:0,healMul:0,mult:1,cond:[],tgt:[],flags:{},cloneCap:0,animalCap:0,trapMax:0,trapArm:0,dashCd:0,dashCharges:1,dashDist:0,dashIF:0,ctrlDur:0,
 bossRc:0,stDur:{},stMax:{},shieldMul:0,portee:0,kb:0,rWave:0};}
function matchTok(I,tok){tok=tok.trim();if(tok==='TOUT')return true;if(tok==='JOUEUR')return false;
 if(I.liv===tok||I.fam===tok||I.tags.has(tok)||I.id===tok)return true;
 if(tok==='POISON')return(I.L&&I.L.st||[]).some(s=>s[0]==='STA_08');
 if(tok==='CONTROLE')return I.tags.has('CONTROLE');return false;}
const F=list=>I=>list.some(t=>matchTok(I,t));
const cnt=(l,arr)=>arr.filter(x=>x<=l).length;

// Effets des 60 passifs (texte : DATA.passifs[].txt). l = niveau 1–5.
const PASFX={
 PAS_001:(S,l)=>{S.power+=.10*l;},
 PAS_002:(S,l)=>{S.cad+=.07*l;},
 PAS_003:(S,l)=>{S.cond.push({f:F(['CONE','ONDE','ZONE','PIEGE','RAYON','ORBITE','DIFFERE','CONTACT','PROJECTILE']),zone:.08*l});},
 PAS_004:(S,l)=>{S.cond.push({f:F(['CONTACT','ONDE']),dmg:.05*l});},
 PAS_005:(S,l)=>{S.cond.push({f:F(['ZONE','ORBITE','PIEGE','INVOCATION','RAYON']),dur:.08*l});},
 PAS_006:(S,l)=>{const f=F(['PROJECTILE','SALVE','ONDE','ZONE','PIEGE','ORBITE','INVOCATION','DIFFERE','CHAINE']);S.cond.push({f,qte:(l>=2?1:0)+(l>=4?1:0),dmg:.04*cnt(l,[1,3,5])});},
 PAS_007:(S,l)=>{S.vproj+=.12*l;},
 PAS_008:(S,l)=>{S.crit+=.04*l;},
 PAS_009:(S,l)=>{S.critd+=.12*l;},
 PAS_010:(S,l)=>{S.move+=.06*l;},
 PAS_011:(S,l)=>{S.armor+=l;},
 PAS_012:(S,l)=>{S.cond.push({f:F(['SCEAU','PIEGE']),delred:.04*l});},
 PAS_013:(S,l)=>{S.regen+=.2*l;},
 PAS_014:(S,l)=>{S.pickup+=.2*l;},
 PAS_015:(S,l)=>{S.hpMul+=.1*l;},
 PAS_016:(S,l)=>{S.chakra+=.1*l;},
 PAS_017:(S,l)=>{S.xp+=.06*l;},
 PAS_018:(S,l)=>{S.luck+=.1*l;},
 PAS_019:(S,l)=>{S.red+=.03*l;},
 PAS_020:(S,l)=>{S.cond.push({f:F(['PROJECTILE','SALVE']),pierce:cnt(l,[3,5]),dmg:.03*cnt(l,[1,2,4])});},
 PAS_021:(S,l)=>{S.cond.push({f:F(['E_KATON']),dmg:.06*l});S.stDur.STA_01=(S.stDur.STA_01||0)+.3*l;},
 PAS_022:(S,l)=>{S.cond.push({f:F(['E_SUITON']),dmg:.06*l});S.stDur.STA_03=(S.stDur.STA_03||0)+.3*l;},
 PAS_023:(S,l)=>{S.cond.push({f:F(['E_RAITON']),dmg:.06*l});S.flags.elecIcd=Math.max(.5,1-.1*l);},
 PAS_024:(S,l)=>{S.cond.push({f:F(['E_FUTON']),dmg:.06*l});if(l>=5)S.stMax.STA_18=4;},
 PAS_025:(S,l)=>{S.cond.push({f:F(['E_DOTON']),dmg:.06*l});},
 PAS_026:(S,l)=>{S.cond.push({f:F(['RARE']),dmg:.06*l});},
 PAS_027:(S,l)=>{S.cond.push({f:F(['CONTACT']),dmg:.05*l,kb:.1*l});},
 PAS_028:(S,l)=>{S.cond.push({f:F(['OUTIL']),dmg:.05*l,qte:l>=5?1:0});},
 PAS_029:(S,l)=>{S.cond.push({f:F(['UNITE_ALLIEE']),dur:.1*l,dmg:.04*l});},
 PAS_030:(S,l)=>{S.cond.push({f:F(['CLONE']),dmg:.06*l});if(l>=5)S.cloneCap+=1;},
 PAS_031:(S,l)=>{S.dashCd-=.06*l;if(l>=3)S.dashCharges+=1;},
 PAS_032:(S,l)=>{S.cond.push({f:F(['GENJUTSU']),dur:.08*l});},
 PAS_033:(S,l)=>{S.cond.push({f:F(['SCEAU']),dmg:.06*l});S.stDur.STA_09=(S.stDur.STA_09||0)+l;},
 PAS_034:(S,l)=>{S.cond.push({f:F(['CLAN']),dmg:.06*l});},
 PAS_035:(S,l)=>{S.cond.push({f:F(['OCULAIRE']),delred:.04*l});},
 PAS_036:(S,l)=>{S.flags.huile=10-l;},
 PAS_037:(S,l)=>{S.stDur.STA_03=(S.stDur.STA_03||0)+.2*l;if(l>=5)S.flags.arcs3=1;},
 PAS_038:(S,l)=>{S.cond.push({f:F(['E_FUTON']),portee:.3*l});if(l>=3)S.flags.rasenFuton=1;},
 PAS_039:(S,l)=>{S.flags.kawarimi=[90,80,70,60,50][l-1];},
 PAS_040:(S,l)=>{S.flags.bouclierPer=.05*l;},
 PAS_041:(S,l)=>{S.lifesteal+=.002*l;},
 PAS_042:(S,l)=>{S.flags.killCad=.10*l;},
 PAS_043:(S,l)=>{S.tgt.push({f:(I,e)=>e.elite||e.boss||e.lieut,dmg:.08*l});},
 PAS_044:(S,l)=>{S.tgt.push({f:(I,e)=>!e.elite&&!e.boss&&!e.lieut,dmg:.06*l});},
 PAS_045:(S,l)=>{S.stMax.STA_08=10+2*l;S.flags.poisonDmg=.05*l;},
 PAS_046:(S,l)=>{S.cond.push({f:F(['MARIONNETTE']),dmg:.05*l,portee:1*l});},
 PAS_047:(S,l)=>{S.tgt.push({f:(I,e)=>hasSt(e,'STA_09'),crit:.03*l});S.flags.detect=2*l;},
 PAS_048:(S,l)=>{S.flags.surfDur=.15*l;},
 PAS_049:(S,l)=>{S.cond.push({f:F(['EXPLOSIF']),dmg:.06*l,zone:.05*l});},
 PAS_050:(S,l)=>{S.ctrlDur+=.06*l;S.bossRc+=.8*l;},
 PAS_051:(S,l)=>{S.shieldMul+=.1*l;},
 PAS_052:(S,l)=>{S.flags.postUlt=.04*l;},
 PAS_053:(S,l)=>{S.cond.push({f:F(['ANIMAL']),dmg:.06*l});},
 PAS_054:(S,l)=>{S.flags.defCond=l;},
 PAS_055:(S,l)=>{S.flags.senjutsu=.04*l;},
 PAS_056:(S,l)=>{S.regen+=.3*l;S.chakra+=.06*l;},
 PAS_057:(S,l)=>{S.hpMul+=.06*l;},
 PAS_058:(S,l)=>{S.cond.push({f:I=>I.fam==='OUTIL'&&I.liv==='CONTACT',dmg:.06*l});},
 PAS_059:(S,l)=>{S.healMul+=.1*l;},
 PAS_060:(S,l)=>{const f=I=>I.def.acces&&String(I.def.acces).includes('APT_RASEN');S.cond.push({f,dmg:.05*l});S.rWave+=.3*l;},
};
function passifSansEffet(id){ // §B5.1 : poids ×0,3 si aucun effet sur une technique possédée
 const S=newST();PASFX[id](S,1);if(!S.cond.length)return false;
 return!G.techs.some(I=>S.cond.some(c=>c.f(I)));}

// Effets des 40 équipements (texte : DATA.equipements[].txt).
const EQPFX={
 EQP_001:S=>{S.flags.derive=1;},
 EQP_002:S=>{S.cond.push({f:I=>I.fam==='OUTIL'&&(I.liv==='PROJECTILE'||I.liv==='SALVE'),qte:1});},
 EQP_003:S=>{S.flags.surfDur=(S.flags.surfDur||0)+.3;},
 EQP_004:S=>{S.cond.push({f:F(['UNITE_ALLIEE']),dur:.15});},
 EQP_005:S=>{S.dashDist+=1;S.dashIF+=.05;},
 EQP_006:S=>{S.armor+=2;S.flags.epines=10;},
 EQP_007:S=>{S.flags.mines=1;},
 EQP_008:S=>{S.trapMax+=1;S.trapArm+=.2;},
 EQP_009:S=>{S.flags.regenBas=1;},
 EQP_010:S=>{S.cond.push({f:F(['CONTACT']),dmg:.15});S.move-=.10;},
 EQP_011:S=>{S.crit+=.06;S.flags.critMarque=1;},
 EQP_012:S=>{S.flags.rouleauPlus=1;},
 EQP_013:S=>{S.flags.clochette=1;},
 EQP_014:S=>{S.flags.rations=1;},
 EQP_015:S=>{S.vproj+=.10;S.flags.antiBrume=1;},
 EQP_016:S=>{S.tgt.push({f:(I,e)=>hasSt(e,'STA_10')||e.cibleClone,dmg:.20});},
 EQP_017:S=>{S.flags.flaque=1;},
 EQP_018:S=>{S.stMax.STA_01=6;S.flags.brulurePropag=1;},
 EQP_019:S=>{S.cond.push({f:I=>I.liv==='CHAINE'&&I.tags.has('E_RAITON'),qte:1});},
 EQP_020:S=>{S.cond.push({f:F(['E_FUTON']),portee:.5,kb:.2});},
 EQP_021:S=>{S.cond.push({f:F(['E_DOTON']),dmg:.10});S.flags.picLourd=20;},
 EQP_022:S=>{S.flags.survie1=1;S.regen+=.5;},
 EQP_023:S=>{S.cond.push({f:F(['CONTACT']),dmg:.05});S.flags.chakraContact=1;},
 EQP_024:S=>{S.flags.kunaiEsquive=1;},
 EQP_025:S=>{S.power+=.15;S.chakra+=.10;S.hpMul-=.10;},
 EQP_026:S=>{S.dashIF+=.15;S.dashCd+=.5;},
 EQP_027:S=>{S.hpMul+=.20;S.regen+=.3;},
 EQP_028:S=>{S.cond.push({f:F(['CONTACT']),portee:1});S.flags.lameEntaille=1;},
 EQP_029:S=>{S.flags.huileKaton=1;},
 EQP_030:S=>{S.ctrlDur+=.5/2;S.tgt.push({f:(I,e)=>hasSt(e,'STA_19'),dmg:.10});},
 EQP_031:S=>{S.flags.quatrieme3=1;},
 EQP_032:S=>{S.animalCap+=1;S.cond.push({f:F(['ANIMAL']),dmg:.20});},
 EQP_033:S=>{const el=new Set();for(const I of G.techs)for(const t of I.tags)if(['E_KATON','E_SUITON','E_RAITON','E_FUTON','E_DOTON'].includes(t))el.add(t);S.power+=Math.min(.2,.04*el.size);},
 EQP_034:S=>{S.flags.postUltCad=.30;S.flags.jauge15=1;},
 EQP_035:S=>{S.flags.blocProj=5;},
 EQP_036:S=>{S.cloneCap+=1;S.hpMul-=.20;},
 EQP_037:S=>{S.power+=.40;S.flags.drain50=3;},
 EQP_038:S=>{S.regen+=2;S.healMul-=.5;},
 EQP_039:S=>{S.flags.izanagi=180;S.crit+=.10;S.flags.passifs5=1;},
 EQP_040:S=>{S.flags.lienMaudit=1;S.tgt.push({f:(I,e)=>hasSt(e,'STA_20'),dmg:.25});S.flags.sansRegen=1;},
};

// Transformations : statistiques extraites (s) + comportements codés quand ils ont un effet direct.
function trfStats(S,t){const s=t.s||{};
 if(s.mult)S.mult*=s.mult;if(s.pow)S.power+=s.pow;if(s.move)S.move+=s.move;if(s.armor)S.armor+=s.armor;if(s.regen)S.regen+=s.regen;if(s.cad)S.cad+=s.cad;
 if(s.chakra)S.chakra+=s.chakra;if(s.red)S.red+=s.red;if(s.zone)S.zone+=s.zone;
 const txt=t.stats+' '+t.comp;
 const m=txt.match(/[Rr]éduction des dégâts \+(\d+)/);if(m)S.red+=(+m[1])/100;
 if(/Intangible/.test(txt))S.flags.intangible=1;
 if(/Suiton ×1,3/.test(txt))S.cond.push({f:F(['E_SUITON']),dmg:.3});
 if(/taijutsu \+30/.test(txt))S.cond.push({f:F(['TAIJUTSU','CONTACT']),dmg:.3});
 if(/Mokuton : \+50 % Zone/.test(txt))S.cond.push({f:F(['E_MOKUTON']),zone:.5});
 if(t.id==='TRF_009'){const n=G.portes||1;S.cad+=.08*n;S.move+=.05*n;S.cond.push({f:F(['CONTACT']),dmg:.06*n});}
 if(/\+1,5 m de portée/.test(txt))S.portee+=1.5;}

// CPX et notes de statistiques des personnages : bonus inconditionnels extraits + conditions reconnues.
function cpxStats(S,c){const n=c.s||{};for(const k in n)applyStatKey(S,k,n[k]);
 const e=(c.cpx&&c.cpx.effet)||'';
 let m=e.match(/Sous (\d+) % (?:de )?PV : \+(\d+) % (Cadence|Puissance)/);if(m&&P.hp<P.maxhp*(+m[1])/100){if(m[3]==='Cadence')S.cad+=(+m[2])/100;else S.power+=(+m[2])/100;}
 if(c.id==='CHR_001'&&P.hp<P.maxhp*.3)S.cloneCap+=1;
 m=e.match(/^Les techniques (\w+) (?:ont|gagnent) \+(\d+) % (?:de )?dégâts/);if(m)S.cond.push({f:F([m[1]]),dmg:(+m[2])/100});
 m=e.match(/Après (\d+) s sans être touché, \+(\d+) % Puissance/);if(m&&G.time-(G.lastHitT||0)>=+m[1])S.power+=(+m[2])/100;
 if(/[Pp]lus (?:la|leur) cible est proche|à moins de (\d+) m/.test(e)){}}
function applyStatKey(S,k,v){switch(k){case'pow':S.power+=v;break;case'cad':S.cad+=v;break;case'zone':S.zone+=v;break;case'dur':S.dur+=v;break;case'crit':S.crit+=v;break;
 case'critd':S.critd+=v;break;case'move':S.move+=v;break;case'armor':S.armor+=v;break;case'regen':S.regen+=v;break;case'pickup':S.pickup+=v;break;case'hp':S.hpMul+=v;break;
 case'chakra':S.chakra+=v;break;case'xp':S.xp+=v;break;case'luck':S.luck+=v;break;case'red':S.red+=v;break;case'mult':S.mult*=v;break;}}

// Recalcul complet (appelé à chaque changement de build et chaque seconde pour les conditions).
function recalc(){const S=newST(),c=G.chr;
 for(const id in G.pas)if(PASFX[id])PASFX[id](S,G.pas[id]);
 for(const id of G.eqp)if(id&&EQPFX[id])EQPFX[id](S);
 if(G.trf&&G.trf.actif)trfStats(S,G.trf.def);
 cpxStats(S,c);
 // méta : entraînement plafonné (+10 % max) §D7
 S.hpMul+=Math.min(.1,(SAVE.entr.pv||0)*.02);S.power+=Math.min(.1,(SAVE.entr.pow||0)*.02);S.move+=Math.min(.1,(SAVE.entr.move||0)*.02);
 // états dynamiques
 const f=S.flags;
 if(f.defCond&&P.hp<P.maxhp*.5){S.red+=.04*f.defCond;S.power+=.03*f.defCond;}
 if(f.senjutsu&&G.immobileT>=1)S.power+=f.senjutsu;
 if(f.postUlt&&G.time-G.lastUltT<10)S.power+=f.postUlt;
 if(f.postUltCad&&G.time-G.lastUltT<6)S.cad+=f.postUltCad;
 if(f.killCad)S.cad+=Math.min(f.killCad,G.killStacks*.01);
 if(f.regenBas&&P.hp<P.maxhp*.3)S.regen+=1;
 if(f.sansRegen)S.regen=0;
 if(G.epuiseT>0)S.move-=.3;
 if(G.assist.pv)S.hpMul+=.5;
 // plafonds §B4.1
 S.power=Math.min(S.power,3);S.cad=clamp(S.cad,-.5,1.5);S.zone=Math.min(S.zone,1);S.dur=Math.min(S.dur,1);S.crit=Math.min(S.crit,.6);S.critd=Math.min(S.critd,3);
 S.move=clamp(S.move,-.4,.6);S.armor=Math.min(S.armor,15);S.regen=Math.min(S.regen,3);S.pickup=Math.min(S.pickup,2);S.red=Math.min(S.red,.6);S.chakra=Math.min(S.chakra,.6);S.xp=Math.min(S.xp,.5);S.luck=Math.min(S.luck,.5);
 const old=P.maxhp;P.maxhp=Math.min(400,Math.floor(c.stats.pv*(1+S.hpMul)+S.hpFlat));if(P.maxhp>old&&G.started)P.hp+=P.maxhp-old;P.hp=Math.min(P.hp,P.maxhp);
 G.st=S;G.modsV++;if(G.techs&&G.chr)synActives();}

// Modificateurs par technique (§B5.1 : applicabilité par catégorie), mis en cache par version.
const APPLI={PROJECTILE:{dur:0},SALVE:{dur:0},CONE:{dur:0,qte:0},ONDE:{dur:0},CONTACT:{dur:0},ORBITE:{},ZONE:{},PIEGE:{},RAYON:{},CHAINE:{dur:0},INVOCATION:{},DIFFERE:{dur:0}};
function mods(I){if(I._mv===G.modsV)return I._m;const S=G.st,a=APPLI[I.liv]||{};
 const m={A:1+S.power,M:S.mult*(I.evoMul||1),cad:S.cad,zone:S.zone,dur:S.dur,qte:S.qte,vproj:S.vproj,crit:S.crit,critd:S.critd,delred:0,pierce:0,kb:S.kb,portee:S.portee};
 for(const c of S.cond)if(c.f(I)){m.A+=c.dmg||0;m.zone+=c.zone||0;m.dur+=c.dur||0;m.qte+=c.qte||0;m.cad+=c.cad||0;m.delred+=c.delred||0;m.pierce+=c.pierce||0;m.kb+=c.kb||0;m.portee+=c.portee||0;}
 if(I.unite){const h=HERIT[I.unite]||HERIT.CLONE;m.A=1+(m.A-1)*h.pow;m.cad*=h.cad;m.zone*=h.zone;m.crit*=h.crit;m.critd=1+(m.critd-1)*h.critd;}
 if(a.dur===0)m.dur=0;if(a.qte===0)m.qte=0;
 m.delred=Math.min(.4,m.delred);m.zone=Math.min(1,m.zone);
 I._m=m;I._mv=G.modsV;return m;}
// Héritage des unités alliées §R9
const HERIT={CLONE:{pow:.75,crit:1,critd:1,cad:.5,zone:.5},ANIMAL:{pow:1,crit:.5,critd:.5,cad:.25,zone:1},MARIONNETTE:{pow:1,crit:1,critd:1,cad:1,zone:1},GEANT:{pow:.5,crit:0,critd:0,cad:0,zone:.25},UNITE:{pow:1,crit:.5,critd:.5,cad:.5,zone:1}};
