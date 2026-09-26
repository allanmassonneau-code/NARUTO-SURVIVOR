// Run : initialisation, pool (§B6.3), boucle de simulation, joueur, collecte, niveaux et cartes (§B6.4–B6.7).
let G={phase:'menu',rt:0,st:newST(),modsV:0,techs:[],pas:{},eqp:[],cam:{x:0,y:0},enemies:[]},P={x:0,y:0,r:6,hp:100,maxhp:100};
function needXp(L){return L<=20?5+6*L:L<=40?125+13*(L-20):385+20*(L-40);}
function construirePool(chr,cfg){const apt=aptitudes(chr);if(cfg.eqpKB)apt.add('KB');
 let ids=DATA.techniques.filter(t=>accesOk(t.acces,apt)).map(t=>t.id);
 if(cfg.filtre){ids=ids.filter(id=>cfg.filtre(T[id]));if(!ids.includes(chr.depart))ids.push(chr.depart);}
 let cap=40;if(/Hiruzen/.test(chr.nom))cap=44;if(/Kakashi Hatake$/.test(chr.nom)){const el=(chr.aptitudes||[]).filter(a=>a.startsWith('ELEM_')).length;cap=Math.min(44,40+el);}
 if(ids.length<=cap)return ids;
 const r=rng(G.seed^0xabc),excl=id=>/CHR_|CLAN_|DOJ_|KG_|CTR_/.test(T[id].acces||'')||id===chr.depart;
 const keep=new Set(ids.filter(excl));const rest=shuffle(ids.filter(id=>!keep.has(id)),r);
 for(const el of['KATON','SUITON','RAITON','FUTON','DOTON']){if(!apt.has('ELEM_'+el))continue;let n=0;for(const id of rest){if(n>=3)break;if(T[id].famille===el&&!keep.has(id)){keep.add(id);n++;}}}
 for(const fam of['TAIJUTSU','OUTIL','INVOC','GENJUTSU','SCEAU','CLAN','OCULAIRE','RARE']){let n=0;for(const id of rest){if(n>=2)break;if(T[id].famille===fam&&!keep.has(id)){keep.add(id);n++;}}}
 for(const id of rest){if(keep.size>=cap)break;keep.add(id);}
 return[...keep];}
function newRun(cfg){const chr=CHR[cfg.chr],seed=cfg.seed||((Date.now()^Math.floor(Math.random()*1e9))>>>0);
 const modeD=MODES[cfg.mode]||MODES.Standard;
 G={phase:'jeu',rt:G.rt,cfg,seed,rX:rng(seed^0x1111),rS:rng(seed^0x2222),rL:rng(seed^0x3333),rC:rng(seed^0x4444),mode:cfg.mode,modeD,rangId:cfg.rang||'C',rang:RANGS[cfg.rang||'C'],
  f:modeD.boss?modeD.boss/1200:1,chr,time:0,tick:0,cam:{x:0,y:0},enemies:[],proj:[],eproj:[],gems:[],fx:[],texts:[],hz:[],surf:[],coffres:[],rouleaux:[],rations:[],aimants:[],mines:[],refugies:[],faux:[],
  later:[],relev:[],done:{},dots:[],techs:[],pas:{},pasOrder:[],eqp:[null,null],trf:null,xp:0,level:1,pending:0,cards:[],sel:0,refused:new Set(),banned:new Set(),S:0,
  relances:SAVE.achats.relance||0,bans:SAVE.achats.ban||0,passes:SAVE.achats.passage||0,chakra:0,chakraAcc:0,chakraSec:0,healSec:0,healTot:0,takenAcc:0,lastPerfect:-9,lastKawa:-999,lastIzanagi:-999,
  lastBloc:-9,lastUltT:-99,lastHitT:0,killStacks:0,spawnAcc:0,ev:0,evts:[],banners:[],boss:null,lieutenant:null,bossVaincus:[],ult:null,ultInv:0,dmgBy:{},kills:0,st:newST(),modsV:1,
  cpt:{},synVues:new Set(),synT:{},immobileT:0,epuiseT:0,brume:0,brumeEvt:0,pluie:0,assist:SAVE.assist||{},interditFait:0,fini:false,rushIdx:0,rush:cfg.rush||[],nextBoss:600,nextInterdit:900,
  eqpVus:new Set(),recettes:new Set(),started:false,sceauChakra:0,gravite:0,noRegenT:0,pPoison:0,pPoisonT:0,aveugleT:0,lastEvoAdm:-1,bossId:cfg.boss||null};
 G.map=genCarte(cfg.map,seed);G.vague=vagueScript();
 P={x:G.map.w/2,y:G.map.h/2,r:6,hp:chr.stats.pv,maxhp:chr.stats.pv,fx:1,fy:0,face:1,vx:0,vy:0,kvx:0,kvy:0,inv:0,contactT:0,heavy:false,dashT:0,dashCd:0,dashIf:0,charges:1,dvx:0,dvy:0,root:0,slow:0,slowV:0,walk:0,moving:false,hurtT:0,shield:0,shieldT:0};
 G.pool=construirePool(chr,cfg);G.poolPas=DATA.passifs.filter(p=>accesOk(p.acces,aptitudes(chr))).map(p=>p.id);
 G.poolEqp=DATA.equipements.filter(e=>accesOk(e.acces,aptitudes(chr))).map(e=>e.id);
 const I=mkInst(chr.depart);I.slot=0;G.techs.push(I);
 if(cfg.draft)for(const id of cfg.draft)if(id!==chr.depart&&G.techs.length<6){const J=mkInst(id);G.techs.push(J);}
 recalc();P.hp=P.maxhp;G.started=true;placerStele();G.cam.x=Math.round(P.x-W/2);G.cam.y=Math.round(P.y-H/2);
 const tr=(chr.transformations||[]).map(id=>TRFD[id]).filter(Boolean);
 planifier();
 if(cfg.mode==='BossRush'){for(let i=0;i<29;i++){G.level++;autoCarte();}G.rushPause=2;banner('Boss Rush',G.rush.map(id=>nomCourt(BOS[id].nom)).join(' → '),4);}
 else banner(nomCourt(chr.nom)+' — '+G.map.D.nom,MODES[cfg.mode].desc,5);
 SAVE.stats.runs++;CPT_RUN('runs',1);}

// ---------- boucle
function tick(){G.time+=DT;G.tick++;G.chakraSecT=(G.chakraSecT||0)+DT;if(G.chakraSecT>=1){G.chakraSecT=0;G.chakraSec=0;G.healSec=0;}
 if(G.tick%60===0)recalc();
 G.sceauChakra=Math.max(0,G.sceauChakra-DT);G.gravite=0;
 director();updPlayer();updTechs();
 for(const e of G.enemies){if(e.dead)continue;if(e.boss||e.lieut)updBoss(e);else updEnemy(e);e.x+=e.kvx*DT;e.y+=e.kvy*DT;const k=Math.exp(-10*DT);e.kvx*=k;e.kvy*=k;e.enZoneAlliee=0;collide(e);}
 separate();updProj();updEProj();updDangers();updPickups();updUlt();updTrf();updSurf();updFx();updRunMisc();
 G.enemies=G.enemies.filter(e=>!e.dead);
 if(G.phase==='jeu'&&G.pending>0)ouvrirNiveau();}
function separate(){const cs=24,grid=new Map();
 for(const e of G.enemies){if(e.dead||e.hidden)continue;const k=Math.floor(e.x/cs)*8192+Math.floor(e.y/cs);let a=grid.get(k);if(!a){a=[];grid.set(k,a);}a.push(e);}
 for(const e of G.enemies){if(e.dead||e.boss||e.hidden)continue;const cx=Math.floor(e.x/cs),cy=Math.floor(e.y/cs);
  for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const a=grid.get((cx+i)*8192+cy+j);if(!a)continue;for(const o of a){if(o===e)continue;const dx=e.x-o.x,dy=e.y-o.y,rr=e.r+o.r,d2=dx*dx+dy*dy;if(d2<rr*rr&&d2>1e-4){const d=Math.sqrt(d2),p=(rr-d)*(o.boss?1:.5);e.x+=dx/d*p;e.y+=dy/d*p;}}}}
 // protecteurs : aura de réduction (−30 %) et frontaux
 for(const e of G.enemies)e.protege=0;for(const p of G.enemies){if(p.dead||p.role!=='protecteur')continue;const aura=/Aura de 3 m|−30 %/.test(p.c)?.3:/dôme|Dôme/.test(p.c)&&p.durci>0?.6:0;
  if(p.durci>0&&/Durcissement/.test(p.c))p.protege=Math.max(p.protege,.6);if(aura)for(const e of G.enemies)if(e!==p&&!e.dead&&hyp(e.x-p.x,e.y-p.y)<3*M)e.protege=Math.max(e.protege,aura);}}
function inputVec(){let x=0,y=0;
 if(keys.has('KeyA')||keys.has('ArrowLeft'))x--;if(keys.has('KeyD')||keys.has('ArrowRight'))x++;if(keys.has('KeyW')||keys.has('ArrowUp'))y--;if(keys.has('KeyS')||keys.has('ArrowDown'))y++;
 x+=IN.padX+IN.bx;y+=IN.padY+IN.by;
 if(IN.joy){const dx=IN.joy.x-IN.joy.ox,dy=IN.joy.y-IN.joy.oy,d=hyp(dx,dy);if(d>3){const m=Math.min(1,d/24);x+=dx/d*m;y+=dy/d*m;}}
 const m=hyp(x,y);if(m>1){x/=m;y/=m;}return[x,y,Math.min(1,m)];}
function updPlayer(){const[ix,iy,m]=inputVec(),S=G.st;
 if(m>.05){P.fx=ix/m;P.fy=iy/m;if(Math.abs(ix)>.1)P.face=ix>0?1:-1;}
 P.inv=Math.max(0,P.inv-DT);P.contactT-=DT;P.dashIf-=DT;P.root-=DT;P.slow-=DT;if(P.slow<=0)P.slowV=0;P.hurtT-=DT;G.ultInv-=DT;G.epuiseT-=DT;G.noRegenT-=DT;G.aveugleT-=DT;
 const dashCdMax=4*(1+S.dashCd)+(S.flags.dashPlus||0);if(P.charges<S.dashCharges){P.dashCd-=DT;if(P.dashCd<=0){P.charges++;P.dashCd=P.charges<S.dashCharges?dashCdMax:0;}}else P.dashCd=0;
 if(IN.dash){IN.dash=false;if(P.charges>0&&P.root<=0){const dx=m>.05?ix/m:P.fx,dy=m>.05?iy/m:P.fy,dist=(3+S.dashDist)*M;P.dashT=.18;P.dashIf=.25+S.dashIF;P.charges--;if(P.dashCd<=0)P.dashCd=dashCdMax;
   P.dvx=dx*dist/.18;P.dvy=dy*dist/.18;smoke(P.x,P.y,5);sfx('dash');if(S.flags.kunaiEsquive)for(const e of G.enemies)if(!e.dead&&hyp(e.x-P.x,e.y-P.y)<2*M)applySt(e,['STA_09',6,'s'],null);
   if(/leurre qui provoque/.test(G.chr.signature||''))G.leurre={x:P.x,y:P.y,t:1.5};}}
 if(IN.trf){IN.trf=false;activerTrf(true);}
 if(IN.ult){IN.ult=false;tryUlt(true);}else if(G.chakra>=100)autoUlt();
 let vx,vy;
 if(P.dashT>0){P.dashT-=DT;vx=P.dvx;vy=P.dvy;if(G.tick%2===0)G.fx.push({k:'ghost',x:P.x,y:P.y,face:P.face,t:0,dur:.2});}
 else{const surGlace=surfAt(P.x,P.y,'GLACE');const sp=G.chr.stats.depl*M*(1+S.move)*(P.slow>0?1-(P.slowV||.4):1)*(P.root>0?0:1)*(G.assist.ralenti?1:1);
  const tx=ix*sp,ty=iy*sp,acc=m>.05?DT/.06:DT/.08;P.vx=lerp(P.vx,tx,Math.min(1,acc*(surGlace?.3:1)));P.vy=lerp(P.vy,ty,Math.min(1,acc*(surGlace?.3:1)));vx=P.vx;vy=P.vy;}
 P.x+=(vx+P.kvx)*DT;P.y+=(vy+P.kvy)*DT;const k=Math.exp(-8*DT);P.kvx*=k;P.kvy*=k;collide(P);
 if(G.arene&&G.boss){const cx=G.map.w/2,cy=G.map.h/2;}
 P.moving=m>.05&&P.root<=0;if(P.moving){P.walk+=DT;G.immobileT=0;}else G.immobileT+=DT;
 if(G.noRegenT<=0)P.hp=Math.min(P.maxhp,P.hp+S.regen*DT);
 if(G.pPoisonT>0){G.pPoisonT-=DT;if(G.tick%30===0)hurtPlayer(G.pPoison,'Poison',null,'zone');if(G.pPoisonT<=0)G.pPoison=0;}
 if(S.flags.drain50&&P.hp>P.maxhp*.5)P.hp=Math.max(P.maxhp*.5,P.hp-S.flags.drain50*DT);
 if(S.flags.bouclierPer&&G.time-(G.lastShield||-99)>=12){G.lastShield=G.time;addShield(P.maxhp*S.flags.bouclierPer,6);}
 if(P.shieldT>0){P.shieldT-=DT;}else if(P.shield>0)P.shield=Math.max(0,P.shield-P.maxhp*.05*DT);
 if(S.flags.flaque&&G.time-(G.lastFlaque||-99)>=8){G.lastFlaque=G.time;addSurf('EAU',P.x,P.y,1.5*M,6);}
 if(G.buffArm){G.buffArm.t-=DT;if(G.buffArm.t<=0)G.buffArm=null;}
 if(G.killT>0){G.killT-=DT;if(G.killT<=0)G.killStacks=0;}
 if(G.leurre){G.leurre.t-=DT;if(G.leurre.t<=0)G.leurre=null;}}
function updPickups(){const S=G.st,rad=1.5*M*(1+S.pickup);
 for(const g of G.gems){const dx=P.x-g.x,dy=P.y-g.y,d=hyp(dx,dy);g.t+=DT;if(d<rad||G.aimantT>0)g.att=true;if(S.flags.derive&&d<6*M&&!g.att){g.x+=dx/d*.5*M*DT;g.y+=dy/d*.5*M*DT;}
  if(g.att&&!(G.trf&&G.trf.actif&&/ne ramasse|ne peut pas ramasser/.test(G.trf.def.cout+G.trf.def.stats))){g.sp=Math.min(14*M,g.sp+14*M/.25*DT);g.x+=dx/(d||1)*g.sp*DT;g.y+=dy/(d||1)*g.sp*DT;}
  if(d<P.r+4){g.dead=true;G.xp+=g.v;sfx('pick');while(G.xp>=needXp(G.level)){G.xp-=needXp(G.level);G.level++;G.pending++;}}}
 G.gems=G.gems.filter(g=>!g.dead);if(G.aimantT>0)G.aimantT-=DT;
 for(const r of G.rations){r.t+=DT;if(hyp(P.x-r.x,P.y-r.y)<12){r.dead=1;const v=20*(S.flags.rations?1.5:1)*(/Rations de soldat soignent \+50/.test(G.chr.cpx.effet)?1.5:1);heal(v,true);CPT_RUN('rations',1);if(/\+10 chakra/.test(G.chr.cpx.effet))G.chakra=Math.min(100,G.chakra+10);}}G.rations=G.rations.filter(r=>!r.dead&&r.t<60);
 for(const a of G.aimants){a.t+=DT;if(hyp(P.x-a.x,P.y-a.y)<12){a.dead=1;G.aimantT=.8;banner('Sceau d’attraction','',1.2);}}G.aimants=G.aimants.filter(a=>!a.dead);
 for(const c of G.coffres){c.t+=DT;if(hyp(P.x-c.x,P.y-c.y)<14){c.dead=1;ouvrirCoffre(c.type);}}G.coffres=G.coffres.filter(c=>!c.dead);
 for(const r of G.rouleaux){r.t+=DT;if(hyp(P.x-r.x,P.y-r.y)<14){r.dead=1;if(r.interdit)ouvrirInterdit();else ouvrirRouleau();}}G.rouleaux=G.rouleaux.filter(r=>!r.dead);
 for(const r of G.refugies){r.t+=DT;if(hyp(P.x-r.x,P.y-r.y)<14){r.dead=1;G.sauves=(G.sauves||0)+1;CPT_RUN('refugies',1);if(G.sauves===10){G.coffres.push({x:P.x+20,y:P.y,t:0,type:'lieutenant'});banner('Réfugiés sauvés','Coffre de lieutenant.',2.5);}}}G.refugies=G.refugies.filter(r=>!r.dead);
 for(const m of G.mines){m.t-=DT;for(const e of G.enemies)if(!e.dead&&hyp(e.x-m.x,e.y-m.y)<m.r+e.r){for(const q of G.enemies)if(!q.dead&&hyp(q.x-m.x,q.y-m.y)<m.r*1.5+q.r)hit(q,15,null,{sec:1});fxRing(m.x,m.y,m.r*1.5,'#ffd070');m.t=0;break;}}G.mines=G.mines.filter(m=>m.t>0);
 if(G.stele&&!G.stele.trouve&&hyp(P.x-G.stele.x,P.y-G.stele.y)<14){G.stele.tenu=(G.stele.tenu||0)+DT;if(G.stele.tenu>=2){G.stele.trouve=1;decouvrirSecret(G.stele.sec);}}else if(G.stele)G.stele.tenu=0;}
function updRunMisc(){if(G.brumeEvt>0)G.brumeEvt-=DT;if(G.pluie>0){G.pluie-=DT;if(G.tick%30===0)for(const e of G.enemies)if(!e.dead&&candidat(e)&&G.rS()<.2)applySt(e,['STA_03',2,'s'],null);}
 if(G.clochettes){G.clochettes.t-=DT;const rest=G.clochettes.ids.filter(e=>!e.dead);if(!rest.length){G.coffres.push({x:P.x+16,y:P.y,t:0,type:'lieutenant'});banner('Clochettes récupérées','Coffre de lieutenant.',2.5);G.clochettes=null;}else if(G.clochettes.t<=0)G.clochettes=null;}
 if(G.st.flags.clochette&&G.time-(G.lastCloche||0)>=60&&(G.clocheN||0)<3){G.lastCloche=G.time;const e=G.enemies.find(z=>!z.dead&&!z.boss&&candidat(z));if(e){G.clochette=e;G.clocheN=(G.clocheN||0)+1;}}
 for(const f of G.faux)f.t-=DT;G.faux=G.faux.filter(f=>f.t>0);
 // garantie §B6.8 : évolution admissible depuis 90 s sans coffre → élite dans les 20 s
 if(G.tick%60===0){const adm=evolutionsAdmissibles().length>0;if(adm&&G.lastEvoAdm<0)G.lastEvoAdm=G.time;if(!adm)G.lastEvoAdm=-1;
  if(adm&&G.lastEvoAdm>=0&&G.time-G.lastEvoAdm>=90&&!G.coffres.length&&!G.enemies.some(e=>e.elite)){G.lastEvoAdm=G.time;setTimeout0(5,()=>spawnElite());}
  verifierTrfObtention();}
 G.cam.x=Math.round(P.x-W/2);G.cam.y=Math.round(P.y-H/2);}

// ---------- niveaux et cartes
function evolutionsAdmissibles(){const out=[];const has=id=>G.techs.find(I=>I.id===id);const lv8=id=>{const I=has(id);return I&&(I.lv>=8||I.evo);};
 const equipe=c=>G.pas[c]!==undefined||G.eqp.includes(c);
 for(const r of DATA.evolutions){if(has(r.id))continue;if(!r.cata.every(equipe))continue;
  if(r.type==='EVOLUTION'){const I=has(r.src[0]);if(!I||I.evo||I.lv<8)continue;}
  else if(r.type==='FUSION'){if(!r.src.every(s=>{const I=has(s);return I&&I.lv>=8&&!I.evo;}))continue;}
  else if(r.type==='EVEIL'){if(!has(r.src[0]))continue;if(G.time<900*G.f&&G.mode!=='BossRush')continue;const trfOk=G.trf&&G.trf.actif&&(!r.tard||String(r.tard).split('|').some(t=>t===G.trf.def.id||!/TRF_/.test(t)));
   const interdit=G.eqp.some(e=>e&&EQPD[e].rar==='Interdit');if(!trfOk&&!interdit)continue;}
  out.push(r);}return out;}
function appliquerEvolution(r){const src=G.techs.find(I=>I.id===r.src[0]);const J=mkInst(r.id);J.slot=src?src.slot:G.techs.length;
 if(src){J.units=src.units;J.cd=0;const i=G.techs.indexOf(src);G.techs[i]=J;}else G.techs.push(J);
 if(r.type==='FUSION'){const other=G.techs.find(I=>I.id===r.src[1]);if(other)G.techs.splice(G.techs.indexOf(other),1);}
 CPT_RUN(r.type==='FUSION'?'fusions':r.type==='EVEIL'?'eveils':'evolutions',1);CPT_RUN('recettes_'+r.id,1);SAVE_RECETTE(r.id);recalc();sfx('evo');
 banner(r.type==='FUSION'?'FUSION':r.type==='EVEIL'?'ÉVEIL':'ÉVOLUTION',r.nom,3);}
function ownedIds(){return new Set(G.techs.map(I=>I.id));}
function candidats(){const A=[],B=[],C=[],D=[],sig=G.techs[0];
 for(const I of G.techs){if(I.evo||I.lv>=8||G.banned.has(I.id))continue;A.push({kind:'tech',id:I.id,w:100*(I===sig?1.2:1)*dirFactor(T[I.id]),pert:1});}
 const slotsT=6,slotsP=G.st.flags.passifs5?5:6,own=ownedIds();
 if(G.techs.length<slotsT&&G.mode!=='Draft')for(const id of G.pool)if(!own.has(id)&&!G.banned.has(id)&&!G.techs.some(I=>I.evo&&EVO[I.id].src.includes(id)))B.push({kind:'newtech',id,w:100*dirFactor(T[id])});
 for(const id of G.pasOrder)if(G.pas[id]<5&&!G.banned.has(id))C.push({kind:'pas',id,w:100*(cataDe(id)?1.5:1),pert:1});
 if(G.pasOrder.length<slotsP)for(const id of G.poolPas)if(G.pas[id]===undefined&&!G.banned.has(id)){let w=100;const ca=cataDe(id);if(ca)w*=1.5;if(passifSansEffet(id))w*=.3;D.push({kind:'newpas',id,w,cata:ca,pert:ca});}
 for(const L of[A,B,C,D])for(const c of L)if(G.refused.has(c.id))c.w*=.7;
 return{A,B,C,D};}
function dirFactor(t){if(!t)return 1;const el=t.tags.filter(x=>x.startsWith('E_')&&x!=='E_NEUTRE');let n=0;for(const I of G.techs){if(I.id===t.id)continue;if(I.liv===t.livraison||el.some(e=>I.tags.has(e)))n++;}return n>=2?1.3:1;}
function cataDe(pid){for(const r of DATA.evolutions){if(!r.cata.includes(pid))continue;const I=G.techs.find(J=>J.id===r.src[0]);if(I&&!I.evo&&I.lv>=5)return true;}return false;}
function tirerCartes(){const C=candidats(),out=[],used=new Set();let pert=false;const n=3+((SAVE.achats.quatrieme&&G.level%5===0)||(G.st.flags.quatrieme3&&G.level%3===0)?1:0);
 for(let i=0;i<n;i++){let c=null;const quat=i===3;
  if(i===0&&G.S>=2)c=wItem([...C.A,...C.C,...C.D.filter(x=>x.cata)].filter(x=>!used.has(x.id)),G.rC);
  if(!c){const cats=(quat?[['A',.4],['C',.15]]:[['A',.4],['B',.3],['C',.15],['D',.15]]).map(([k,p])=>[k,p,C[k].filter(x=>!used.has(x.id))]).filter(z=>z[2].length);if(!cats.length)break;
   let x=G.rC()*cats.reduce((s,z)=>s+z[1],0),z=cats[cats.length-1];for(const q of cats){if((x-=q[1])<0){z=q;break;}}c=wItem(z[2],G.rC);}
  if(!c)break;used.add(c.id);out.push(c);if(c.pert)pert=true;}
 G.S=pert?0:G.S+1;
 const secours=[{kind:'heal',id:'HEAL'},{kind:'ryo',id:'RYO'},{kind:'chk',id:'CHK'}];for(const f of secours)if(out.length<3)out.push(f);
 return out.map(carteInfo);}
function carteInfo(c){const k={c,lines:[]};
 switch(c.kind){
 case'tech':{const I=G.techs.find(J=>J.id===c.id);const old=Object.assign({},I.L);k.cat='Amélioration';k.col='#f28a1e';k.title=I.def.nom;k.sub=`${c.id} · niv. ${I.lv} → ${I.lv+1}`;
  k.lines.push(niveauTexte(I,I.lv+1));const J=mkInst(c.id);J.lv=I.lv+1;computeL(J);k.before=I.hook?HOOK_SUM[I.hook](I):techSum(I,old);k.after=I.hook?HOOK_SUM[I.hook](J):techSum(J);
  if(I.lv+1===8){const r=DATA.evolutions.find(e=>e.src[0]===c.id&&e.type==='EVOLUTION');if(r)k.lines.push('Évolution '+r.id+' : '+r.nom+' (catalyseur '+r.cata.join(', ')+').');}break;}
 case'newtech':{const J=mkInst(c.id);k.cat='Nouvelle technique';k.col='#ffd23f';k.title=J.def.nom;k.sub=`${c.id} · ${LIV_NOM[J.liv]} · ${FAM_NOM[J.fam]}`;k.lines.push(J.def.comp);k.after=J.hook?HOOK_SUM[J.hook](J):techSum(J);break;}
 case'pas':{const d=PASD[c.id],l=G.pas[c.id];k.cat='Passif';k.col='#6ab0f0';k.title=d.nom;k.sub=`${c.id} · niv. ${l} → ${l+1}`;k.lines.push(d.txt+' (par niveau)');k.before=`Niveau ${l}`;k.after=`Niveau ${l+1}`;break;}
 case'newpas':{const d=PASD[c.id];k.cat='Nouveau passif';k.col='#5fd0b0';k.title=d.nom;k.sub=`${c.id} · ${d.stat}`;k.lines.push(d.txt+' (par niveau)');if(c.cata)k.lines.push('Catalyseur d’une évolution de votre build.');if(passifSansEffet(c.id))k.lines.push('Aucun effet actuel sur vos techniques.');break;}
 case'heal':k.cat='Secours';k.col='#9aa0aa';k.title='Ration de soldat';k.sub='Aucune carte admissible';k.lines.push('+30 PV.');break;
 case'ryo':k.cat='Secours';k.col='#9aa0aa';k.title='Bourse';k.sub='Aucune carte admissible';k.lines.push('+30 Ryō.');break;
 case'chk':k.cat='Secours';k.col='#9aa0aa';k.title='Concentration';k.sub='Aucune carte admissible';k.lines.push('+25 chakra.');break;}
 return k;}
function appliquerCarte(c){switch(c.kind){
 case'tech':{const I=G.techs.find(J=>J.id===c.id);I.lv++;computeL(I);break;}
 case'newtech':{const J=mkInst(c.id);J.slot=G.techs.length;G.techs.push(J);break;}
 case'pas':G.pas[c.id]++;break;
 case'newpas':G.pas[c.id]=1;G.pasOrder.push(c.id);break;
 case'heal':heal(30,true);break;case'ryo':G.ryoBonus=(G.ryoBonus||0)+30;break;case'chk':G.chakra=Math.min(100,G.chakra+25);break;}
 recalc();}
function autoCarte(){const cs=tirerCartes();const best=cs.slice().sort((a,b)=>(b.c.kind==='tech'?3:b.c.kind==='newtech'?2.5:b.c.kind==='pas'?2:1)-(a.c.kind==='tech'?3:a.c.kind==='newtech'?2.5:a.c.kind==='pas'?2:1))[0];if(best)appliquerCarte(best.c);}
function ouvrirNiveau(){G.phase='niveau';G.cards=tirerCartes();G.sel=0;G.luT=G.rt;sfx('lvl');if(OPT.choixAuto||G.assist.auto){G.autoT=3;}}
function choisir(i){if(G.phase!=='niveau'||G.rt-G.luT<.35)return;const k=G.cards[i];if(!k)return;appliquerCarte(k.c);G.refused=new Set(G.cards.filter(x=>x!==k).map(x=>x.c.id));G.pending--;suiteNiveau();}
function suiteNiveau(){if(G.pending>0){G.cards=tirerCartes();G.sel=0;G.luT=G.rt;sfx('lvl');}else{G.phase='jeu';P.inv=Math.max(P.inv,.5);}}
function relancer(){if(G.phase!=='niveau'||G.relances<=0||G.rt-G.luT<.35)return;G.relances--;G.cards=tirerCartes();G.sel=0;}
function bannir(){if(G.phase!=='niveau'||G.bans<=0||G.rt-G.luT<.35)return;const k=G.cards[G.sel];if(!k||!['tech','newtech','pas','newpas'].includes(k.c.kind))return;
 if(G.techs[0]&&k.c.id===G.techs[0].id)return;G.bans--;G.banned.add(k.c.id);G.cards=tirerCartes();G.sel=0;}
function passer(){if(G.phase!=='niveau'||G.passes<=0||G.rt-G.luT<.35)return;G.passes--;G.chakra=Math.min(100,G.chakra+15);G.pending--;suiteNiveau();}

// ---------- coffres, rouleaux, rouleau interdit (§B6.8)
function ouvrirCoffre(type){const res={titre:type==='lieutenant'?'Coffre de lieutenant':'Coffre',lignes:[],evo:false};const n=type==='lieutenant'?(G.rL()<.3+G.st.luck*.5?3:1):1;
 if(type==='lieutenant'){G.relances=Math.min(5,G.relances+1);res.lignes.push('+1 Relance');}
 for(let i=0;i<n;i++){const adm=evolutionsAdmissibles();if(adm.length){const r=adm[0];appliquerEvolution(r);res.evo=true;res.lignes.push(`${r.type==='FUSION'?'Fusion':r.type==='EVEIL'?'Éveil':'Évolution'} : ${r.nom} (${r.id})`);res.lignes.push(r.comp);continue;}
  const opts=[];for(const I of G.techs)if(!I.evo&&I.lv<8)opts.push(['t',I]);for(const id of G.pasOrder)if(G.pas[id]<5)opts.push(['p',id]);
  if(opts.length){const[k,x]=opts[Math.floor(G.rL()*opts.length)];if(k==='t'){x.lv++;computeL(x);res.lignes.push(`+1 niveau : ${x.nomStat} (niv. ${x.lv})`);}else{G.pas[x]++;res.lignes.push(`+1 niveau : ${PASD[x].nom} (niv. ${G.pas[x]})`);}}
  else{heal(P.maxhp*.3,true);res.lignes.push('Soins : +30 % des PV max');}}
 recalc();const pistes=DATA.evolutions.filter(r=>r.type==='EVOLUTION'&&G.techs.some(I=>I.id===r.src[0]&&!I.evo)).slice(0,2);
 for(const r of pistes){const I=G.techs.find(J=>J.id===r.src[0]);res.lignes.push(`Piste : ${I.nomStat} niv. 8 (${I.lv}/8) + ${r.cata.map(c=>(PASD[c]||EQPD[c]||{nom:c}).nom).join(', ')} → ${r.nom}`);}
 G.coffreRes=res;G.phase='coffre';G.luT=G.rt;sfx(res.evo?'evo':'coffre');}
function ouvrirRouleau(){const pool=G.poolEqp.filter(id=>EQPD[id].rar!=='Interdit'&&!G.eqp.includes(id));const rare=.28+G.st.luck*.34;const out=[];
 for(let i=0;i<3&&pool.length;i++){const r=G.rL()<rare?'Rare':'Ordinaire';let L=pool.filter(id=>EQPD[id].rar===r&&!out.includes(id));if(!L.length)L=pool.filter(id=>!out.includes(id));if(!L.length)break;out.push(L[Math.floor(G.rL()*L.length)]);}
 G.choix={type:'rouleau',items:out.map(id=>({kind:'eqp',id})),sel:0};G.phase='rouleau';G.luT=G.rt;sfx('coffre');}
function ouvrirInterdit(){const trf=(G.chr.transformations||[]).map(id=>TRFD[id]).filter(t=>t&&/Rouleau interdit/.test(t.obt)&&!(G.trf&&G.trf.def.id===t.id)&&(!/≥ 15:00/.test(t.obt)||G.time>=900*G.f));
 const interdits=G.poolEqp.filter(id=>EQPD[id].rar==='Interdit'&&!G.eqp.includes(id));const items=[];
 if(trf.length)items.push({kind:'trf',id:trf[0].id});const sh=shuffle(interdits.slice(),G.rL);for(const id of sh){if(items.length>=2)break;items.push({kind:'eqp',id});}
 items.push({kind:'refus',id:'REFUS'});G.choix={type:'interdit',items,sel:0};G.phase='rouleau';G.luT=G.rt;sfx('warn');}
function prendreChoix(i){if(G.rt-G.luT<.35)return;const it=G.choix.items[i];if(!it)return;
 if(it.kind==='eqp'){let slot=G.eqp.indexOf(null);if(slot<0){if(G.choix.remplace===undefined){G.choix.remplacer=it;G.choix.remplace=-1;G.choix.sel=0;return;}}
  if(slot>=0){G.eqp[slot]=it.id;G.eqpVus.add(it.id);SAVE_EQP(it.id);}}
 if(it.kind==='trf'){G.trf={def:TRFD[it.id],actif:false,cd:5,t:0,uses:0};banner('Transformation obtenue',TRFD[it.id].nom+' — '+TRFD[it.id].auto,3.5);}
 if(it.id==='EQP_039'&&G.pasOrder.length>5){const low=G.pasOrder.reduce((a,b)=>G.pas[a]<=G.pas[b]?a:b);G.st.power+=.03*G.pas[low];delete G.pas[low];G.pasOrder=G.pasOrder.filter(x=>x!==low);}
 G.choix=null;G.phase='jeu';P.inv=Math.max(P.inv,.5);recalc();}
function remplacerEqp(slot){const it=G.choix.remplacer;if(!it)return;G.eqp[slot]=it.id;G.eqpVus.add(it.id);SAVE_EQP(it.id);G.choix=null;G.phase='jeu';recalc();}
