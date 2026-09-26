// Ennemis : 9 rôles (§D5.1), variantes lues dans le texte de comportement, 25 modificateurs d'élite (§D5.3),
// mise à l'échelle (§D5.2), apparitions équitables (§D6), fragments (§B6.2).
let UID=1;
const XP_ROLE={poursuivant:1,chargeur:2,tireur:2,controleur:3,soigneur:3,poseur:3,protecteur:4,invocateur:4,assassin:5};
function num(txt,re,d){const m=String(txt||'').match(re);if(!m)return d;const g=m.slice(1).find(x=>x!==undefined);return g===undefined?d:+g.replace(',','.');}
function mkEnemy(id,x,y,opt){opt=opt||{};const D=ENM[id];const minute=G.time/60,rg=G.rang;
 const hpMul=(1+.10*minute)*rg.pv*(G.mode==='Endless'?1+.15*minute:1)*(opt.hpMul||1),dgMul=(1+.04*minute)*rg.dg;
 const c=D.comportement||'';
 const e={uid:UID++,id,D,nom:D.nom,role:D.role,x,y,r:D.elite?9:(/Golem|Colosse|Rhinocéros|Sanglier|Tigre|géant/.test(D.nom)?9:6),hp:D.pv*hpMul,maxhp:D.pv*hpMul,spd:D.vitesse*M,dmg:D.degats*dgMul,
  xp:(D.xp||XP_ROLE[D.role]||1),elite:!!D.elite,kvx:0,kvy:0,flash:0,vulns:[],st:null,cd:1+G.rS()*2,seed:G.rS()*10,walk:0,spawnT:.4,res:0,rc:0,
  pal:palEnnemi(D),s:D.elite?1.5:(/Golem|Colosse|géant|Rhinocéros/.test(D.nom)?1.5:1),bete:estBete(D.nom),c,
  port:(D.p&&D.p.port||(D.role==='tireur'?7:D.role==='soigneur'?7:D.role==='invocateur'?8:6))*M,atkCd:D.p&&D.p.cd||(D.role==='tireur'?2.5:D.role==='controleur'?5:D.role==='invocateur'?7:D.role==='poseur'?3.5:D.role==='soigneur'?3.5:4),
  teleT:D.p&&D.p.tele||(D.role==='chargeur'?.7:.6),minions:[],mods:null};
 if(D.elite&&D.modificateur&&!(G.rangId==='D'&&G.time<600))e.mods=[D.modificateur];
 if(D.elite&&G.rangId==='S'||D.elite&&G.rangId==='S+'){const m2=DATA.ennemis.filter(z=>z.elite&&z.modificateur&&z.modificateur!==D.modificateur);if(m2.length)(e.mods=e.mods||[]).push(m2[Math.floor(G.rS()*m2.length)].modificateur);}
 if(e.mods)initMods(e);
 if(/résiste 20 % au Raiton/.test(c))e.resRaiton=.2;
 if(opt.minion){e.xp=Math.max(1,Math.round(e.xp/2));e.spawnT=.2;}
 G.enemies.push(e);return e;}
function initMods(e){for(const m of e.mods){switch(m){
 case'Contre-attaquant':e.guard=3;e.guardT=5;break;case'Barrière':e.barriere=e.maxhp*.3;break;case'Reconstitution':e.recon=2;break;
 case'Chaîne liée':break;case'Invisible':e.invisible=5*M;break;case'Brasier':e.brasier=1;break;case'Blindé frontal':e.blinde=1;break;
 case'Réflecteur':e.reflecteur=1;break;case'Absorption':e.absorb=5;break;case'Gravité':e.gravite=1;break;}}}
function eliteDefense(e,d,I,o){for(const m of e.mods){
 if(m==='Blindé frontal'){const face=Math.atan2(P.y-e.y,P.x-e.x),src=o.px!==undefined?Math.atan2(o.py-e.y,o.px-e.x):face;if(angDiff(src,face)<Math.PI/3)d*=.3;}
 if(m==='Barrière'&&e.barriere>0){const a=Math.min(e.barriere,d);e.barriere-=a;d-=a;if(I&&I.liv==='CONTACT')e.barriere-=e.maxhp*.1;}
 if(m==='Réflecteur'&&I&&(I.liv==='PROJECTILE'||I.liv==='SALVE'))d*=.4;
 if(m==='Absorption'&&e.absorb>0&&I&&(I.liv==='PROJECTILE'||I.liv==='SALVE')){e.absorb--;d=0;}
 if(m==='Contre-attaquant'&&o.contact&&e.guard>0&&!e.riposte){e.guard--;e.riposte=1;danger({shape:'cercle',x:e.x,y:e.y,r:2.2*M,tele:.3,act:.1,dmg:18*G.rang.dg,cause:'Riposte ('+e.nom+')',owner:e,suitOwner:1,onEnd:()=>{e.riposte=0;}});}}
 if(e.protege)d*=1-e.protege;
 return Math.max(0,d);}
function spawnPos(dmin){const cam=G.cam;for(let i=0;i<10;i++){const a=G.rS()*TAU,d=(dmin||23+G.rS()*5)*M,x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d;
  if(x<20||y<20||x>G.map.w-20||y>G.map.h-20||solidAt(x,y,8))continue;const sx=x-cam.x,sy=y-cam.y;if(sx>-2*M&&sy>-2*M&&sx<W+2*M&&sy<H+2*M)continue;return[x,y];}return null;}

// ---------- comportement par rôle
function updEnemy(e){const dx=P.x-e.x,dy=P.y-e.y,d=hyp(dx,dy)||1,ux=dx/d,uy=dy/d;
 if(e.spawnT>0){e.spawnT-=DT;return;}
 updStates(e);if(e.dead)return;
 if(e.flash>0)e.flash-=DT;
 if(d>42*M&&!e.elite&&!e.lieut&&!e.boss){const p=spawnPos();if(p){e.x=p[0];e.y=p[1];}return;}
 if(!peutAgir(e)){e.tele=null;return;}
 const sp=e.spd*(1-slowOf(e))*(e.enrage||1)*(G.resonT&&e.resonT>0?1.2:1),confus=hasSt(e,'STA_10');
 if(confus){const o=nearestOther(e);if(o){const a=Math.atan2(o.y-e.y,o.x-e.x);moveE(e,Math.cos(a)*sp,Math.sin(a)*sp);if(hyp(o.x-e.x,o.y-e.y)<e.r+o.r+2&&G.time-(e.lastConf||0)>1){e.lastConf=G.time;hit(o,e.dmg*.5*3,null,{sec:1});if(o.dead)CPT_RUN('kills_confus',1);}}return;}
 if(hasSt(e,'STA_16')&&e.role==='poursuivant'&&G.rS()<.02){e.perdu=.8;}
 if(e.perdu>0){e.perdu-=DT;moveE(e,Math.cos(e.seed+G.time)*sp*.5,Math.sin(e.seed+G.time)*sp*.5);return;}
 const bloque=hasSt(e,'STA_19')||immobile(e);
 if(e.mods)updMods(e,d);
 switch(e.role){
 case'poursuivant':{if(bloque)break;let vx=ux,vy=uy;if(/dispersion|ondulante/.test(e.c)){const s=Math.sin(G.time*2+e.seed)*(/ondulante/.test(e.c)?.7:.35);vx+=-uy*s;vy+=ux*s;}
  if(e.cibleClone){const c=cloneProche(e);if(c){const a=Math.atan2(c.y-e.y,c.x-e.x);vx=Math.cos(a);vy=Math.sin(a);}}
  moveE(e,vx*sp,vy*sp);break;}
 case'chargeur':{if(e.st2==='tele'){e.t-=DT;if(e.t<=0){e.st2='dash';e.t=e.chLen/e.chV;e.tele=null;}}
  else if(e.st2==='dash'){e.t-=DT;if(!bloque)moveE(e,Math.cos(e.dir)*e.chV,Math.sin(e.dir)*e.chV);if(solidAt(e.x+Math.cos(e.dir)*e.r,e.y+Math.sin(e.dir)*e.r)&&/étourdi 1 s/.test(e.c)){e.st2=null;e.cd=4;applySt(e,['STA_11',1,'s'],null);}if(e.t<=0){e.st2=null;e.cd=4;}}
  else{if(!bloque)moveE(e,ux*sp,uy*sp);e.cd-=DT;const len=num(e.c,/(\d+) m(?! à)/,6)*M;if(e.cd<=0&&d<len+2*M){e.st2='tele';e.t=e.teleT;e.dir=Math.atan2(dy,dx);e.chLen=len;e.chV=num(e.c,/à (\d+) m\/s/,12)*M;
   e.tele={shape:'ligne',x:e.x,y:e.y,dir:e.dir,len,w:1.2*M,t0:G.time,tele:e.teleT};}}break;}
 case'tireur':case'controleur':case'poseur':case'soigneur':case'invocateur':{
  const keep=e.role==='poseur'?5*M:e.port;if(!bloque){if(d>keep+M)moveE(e,ux*sp,uy*sp);else if(d<keep-M)moveE(e,-ux*sp,-uy*sp);else moveE(e,-uy*sp*.4,ux*sp*.4);}
  e.cd-=DT;if(e.cd<=0&&d<keep+4*M&&!e.tele){e.cd=e.atkCd;attaqueRole(e,d);}
  if(e.tele&&G.time-e.tele.t0>=e.tele.tele){const f=e.teleFn;e.tele=null;if(f)f();}break;}
 case'protecteur':{if(!bloque)moveE(e,ux*sp*.85,uy*sp*.85);e.front=/frontal/.test(e.c);
  if(e.cd<=0){e.cd=8;if(/Durcissement|dôme/.test(e.c))e.durci=3;}e.cd-=DT;if(e.durci>0)e.durci-=DT;break;}
 case'assassin':{if(e.st2==='cache'){e.t-=DT;if(e.t<=0){const bx=P.x-P.fx*3*M,by=P.y-P.fy*3*M;e.x=clamp(bx,20,G.map.w-20);e.y=clamp(by,20,G.map.h-20);e.hidden=false;e.st2='frappe';
    danger({shape:/croissant/.test(e.c)?'arc':'cercle',x:e.x,y:e.y,r:(/croissant de (\d)/.test(e.c)?3:1.6)*M,dir:Math.atan2(P.y-e.y,P.x-e.x),half:1.1,tele:.7,act:.15,dmg:e.dmg*1.5,cause:e.nom,owner:e,onEnd:()=>{e.st2=null;}});}}
  else if(e.st2==='frappe'){}
  else{if(!bloque)moveE(e,ux*sp,uy*sp);e.cd-=DT;const vise=/PV bas|sous 50/.test(e.c)?P.hp<P.maxhp*.5:true;
   if(e.cd<=0&&d<9*M&&vise){e.cd=4.5;if(/senbon/.test(e.c)){for(let i=-1;i<=1;i++){const a=Math.atan2(P.y+P.fy*M-e.y,P.x+P.fx*M-e.x)+i*.12;e.tele={shape:'ligne',x:e.x,y:e.y,dir:a,len:8*M,w:.3*M,t0:G.time,tele:.5};}e.teleFn=()=>{for(let i=-1;i<=1;i++)eTir(e.x,e.y,Math.atan2(P.y-e.y,P.x-e.x)+i*.12,{dmg:e.dmg,v:12,cause:e.nom});};}
    else if(/croissant de 3 m/.test(e.c))danger({shape:'arc',x:e.x,y:e.y,r:3*M,dir:Math.atan2(dy,dx),half:1.2,tele:.6,act:.15,dmg:e.dmg*1.3,cause:e.nom,owner:e,suitOwner:1});
    else{e.st2='cache';e.t=.5;e.hidden=true;smoke(e.x,e.y,6);}}}
  if(e.tele&&G.time-e.tele.t0>=e.tele.tele){const f=e.teleFn;e.tele=null;if(f)f();}break;}}
 if(e.invisible)e.alpha=d<e.invisible||G.time-(e.lastAtk||-9)<2?1:.15;
 if(!e.hidden&&d<e.r+P.r&&!hasSt(e,'STA_11')){e.x-=ux*(e.r+P.r-d);e.y-=uy*(e.r+P.r-d);
  if(hurtPlayer(e.dmg*(e.st2==='dash'?1.3:1)*(hasSt(e,'STA_23')?.8:1)*(e.parasiteBonus||1),e.nom,e,'contact')){e.lastAtk=G.time;
   if(/Empoisonné \+1 au contact/.test(e.c))effetJoueur({poison:1},{});if(e.mods&&e.mods.includes('Vampire')){e.hp=Math.min(e.maxhp,e.hp+e.dmg*(hasSt(e,'STA_01')||hasSt(e,'STA_08')?.5:1));}
   if(/vol(?:ent)? 1 chakra|vole 3 chakra/.test(e.c))G.chakra=Math.max(0,G.chakra-(/3 chakra/.test(e.c)?3:1));if(/Aveuglent/.test(e.c))effetJoueur({aveugle:1.5},{});}}}
function nearestOther(e){let b=null,bd=1e9;for(const o of G.enemies){if(o===e||o.dead||o.boss)continue;const d=hyp(o.x-e.x,o.y-e.y);if(d<bd&&d<8*M){bd=d;b=o;}}return b;}
function cloneProche(e){let b=null,bd=5*M;for(const I of G.techs)for(const u of I.units){const d=hyp(u.x-e.x,u.y-e.y);if(d<bd){bd=d;b=u;}}return b;}
function moveE(e,vx,vy){e.x+=vx*DT;e.y+=vy*DT;if(vx||vy)e.walk+=DT;}
function attaqueRole(e,d){const c=e.c,a=Math.atan2(P.y-e.y,P.x-e.x),dmg=e.dmg,nom=e.nom,tt=num(c,/(\d+,\d+|\d+) s(?:\)| avant| d'avertissement| de télégraphe)/,e.teleT);
 const tele=(sh,fn,t)=>{e.tele=Object.assign({t0:G.time,tele:t||tt},sh);e.teleFn=fn;};
 switch(e.role){
 case'tireur':
  if(/arc de (\d+)°/.test(c)){const ang=+RegExp.$1*Math.PI/180;danger({shape:'arc',x:e.x,y:e.y,r:num(c,/à (\d+) m/,6)*M,dir:a,half:ang/2,tele:tt,act:.15,dmg,cause:nom,owner:e,suitOwner:1});}
  else if(/(\d+) aiguilles en cercle/.test(c)){const n=+RegExp.$1;tele({shape:'cercle',x:e.x,y:e.y,r:1.5*M},()=>{for(let i=0;i<n;i++)eTir(e.x,e.y,i/n*TAU,{dmg,v:8,cause:nom,k:'aiguille'});},.8);}
  else if(/[ÉE]ventail de (\d+)/.test(c)){const n=+RegExp.$1;tele({shape:'arc',x:e.x,y:e.y,r:3*M,dir:a,half:.35},()=>{for(let i=0;i<n;i++)eTir(e.x,e.y,a-.35+.7*i/(n-1),{dmg,v:10,cause:nom,k:'aiguille',eff:/empoisonn/.test(c)?{poison:1}:null});});}
  else if(/cloche|ombre au sol/.test(c))danger({shape:'cercle',x:P.x,y:P.y,r:1.5*M,tele:.9,act:.15,dmg:dmg*1.5,cause:nom,owner:e});
  else if(/rafale de (\d+)/.test(c)){const n=+RegExp.$1;tele({shape:'ligne',x:e.x,y:e.y,dir:a,len:6*M,w:.4*M},()=>{for(let i=0;i<n;i++)setTimeout0(i*.12,()=>{if(!e.dead)eTir(e.x,e.y,Math.atan2(P.y-e.y,P.x-e.x),{dmg,v:11,cause:nom,k:'eau'});});});}
  else if(/ligne (\d+) m|[ÉE]clair en ligne (\d+)|Lame de vent/.test(c)){const len=num(c,/(\d+) m/,8)*M;danger({shape:'ligne',x:e.x,y:e.y,dir:a,len,w:1*M,tele:tt,act:.15,dmg:dmg*1.2,cause:nom,owner:e,suitOwner:1});}
  else if(/Vise|visée/.test(c)){tele({shape:'ligne',x:e.x,y:e.y,dir:a,len:10*M,w:.25*M,vise:1},()=>{eTir(e.x,e.y,Math.atan2(P.y-e.y,P.x-e.x),{dmg,v:16,life:10/16,cause:nom,pierce:1,k:'carreau'});},1);}
  else if(/Copie/.test(c)||e.mods&&e.mods.includes('Copie')){const I=G.techs.find(J=>J.liv==='PROJECTILE'||J.liv==='SALVE');tele({shape:'ligne',x:e.x,y:e.y,dir:a,len:8*M,w:.5*M},()=>{for(let i=-1;i<=1;i++)eTir(e.x,e.y,a+i*.15,{dmg,v:11,cause:nom+' (copie de '+(I?I.nomStat:'technique')+')'});});}
  else if(/Kekkei/.test(e.mods||'')){danger({shape:'cercle',x:P.x,y:P.y,r:2*M,tele:2,act:.2,dmg:dmg*2,cause:nom,owner:e});}
  else tele({shape:'ligne',x:e.x,y:e.y,dir:a,len:3*M,w:.3*M},()=>eTir(e.x,e.y,Math.atan2(P.y-e.y,P.x-e.x),{dmg,v:9,cause:nom}),.5);
  break;
 case'controleur':
  if(/fil/i.test(c)&&/ligne|fils? vers|entre deux/.test(c))danger({shape:'ligne',x:e.x,y:e.y,dir:a,len:8*M,w:.6*M,tele:.8,act:.15,dmg:dmg*.5,cause:nom,owner:e,eff:{slow:.3,slowT:2}});
  else if(/filet|cercle 2 m/.test(c))danger({shape:'cercle',x:P.x,y:P.y,r:2*M,tele:1,act:.15,cause:nom,owner:e,eff:{slow:.4,slowT:2}});
  else if(/toile|zone collante/.test(c))danger({shape:'cercle',x:P.x,y:P.y,r:2.5*M,tele:.8,act:4,persist:1,cause:nom,owner:e,eff:{slow:.35,slowT:.6}});
  else if(/Entrave|Sceau au sol|Racines/.test(c))danger({shape:'cercle',x:P.x,y:P.y,r:2*M,tele:1.2,act:.2,cause:nom,owner:e,eff:{root:.8}});
  else if(/Glyphe|alourdissement/.test(c))danger({shape:'cercle',x:P.x,y:P.y,r:1.2*M,tele:2,act:.15,cause:nom,owner:e,suit:1,eff:{slow:.25,slowT:3}});
  else if(/Nuage/.test(c))danger({shape:'cercle',x:P.x,y:P.y,r:3*M,tele:1,act:4,persist:1,cause:nom,owner:e,eff:{noRegen:4}});
  else if(/recharge d'esquive/.test(c))danger({shape:'cercle',x:e.x,y:e.y,r:6*M,tele:1.5,act:.1,cause:nom,owner:e,eff:{dashCd:1}});
  else if(/Regard|faux ennemis/.test(c))danger({shape:'arc',x:e.x,y:e.y,r:6*M,dir:a,half:.5,tele:1,act:.1,cause:nom,owner:e,suitOwner:1,eff:{faux:1}});
  else if(/Sceau anti-chakra|gain de chakra/.test(c))danger({shape:'cercle',x:e.x,y:e.y,r:4*M,tele:.8,act:5,persist:1,cause:nom,owner:e,onAct:h=>{h.sceau=1;}});
  else danger({shape:'ligne',x:e.x,y:e.y,dir:a,len:7*M,w:.6*M,tele:.8,act:.15,dmg,cause:nom,owner:e,eff:{slow:.3,slowT:1.5}});
  break;
 case'poseur':{const px=P.x+P.fx*2*M+(G.rS()-.5)*2*M,py=P.y+P.fy*2*M+(G.rS()-.5)*2*M;
  if(/Fils à kunai|ligne 4 m/.test(c))danger({shape:'ligne',x:px,y:py,dir:G.rS()*TAU,len:4*M,w:.4*M,tele:1,act:6,persist:1,cause:nom,dmg,owner:e,piege:1});
  else if(/cercle \(rayon 3 m\)/.test(c))danger({shape:'cercle',x:px,y:py,r:3*M,tele:1.2,act:.2,dmg:dmg*1.5,cause:nom,owner:e});
  else danger({shape:'cercle',x:px,y:py,r:1.5*M,tele:1,act:6,persist:1,piege:1,dmg:dmg*1.6,cause:nom,owner:e,eff:/gaz|Empoisonné/.test(c)?{poison:2}:null,unique:1});
  break;}
 case'soigneur':{const cibles=G.enemies.filter(o=>!o.dead&&o!==e&&!o.boss&&!o.lieut&&hyp(o.x-e.x,o.y-e.y)<5*M);const v=num(c,/(\d+) %/,15)/100;
  if(/purge/.test(c)){for(const o of cibles.slice(0,1))if(o.st){delete o.st.STA_01;delete o.st.STA_08;}}
  else if(/bouclier de 15/.test(c)){for(const o of cibles)if(o.role==='protecteur')o.barriere=(o.barriere||0)+15;}
  else{const L=/zone|Aura/.test(c)?cibles:cibles.sort((p,q)=>(p.hp/p.maxhp)-(q.hp/q.maxhp)).slice(0,1);for(const o of L){o.hp=Math.min(o.maxhp,o.hp+o.maxhp*v);G.fx.push({k:'ligne2',x:e.x,y:e.y,x2:o.x,y2:o.y,t:0,dur:.5,col:'#7ad04a'});}}
  fxRing(e.x,e.y,5*M,'#7ad04a');break;}
 case'invocateur':{if(e.minions.filter(m=>!m.dead).length>=6)break;const n=num(c,/(\d+) (?:Zetsu|serpents|marionnettes|corbeaux|loups)/,3);
  tele({shape:'cercle',x:e.x,y:e.y,r:1.5*M},()=>{for(let i=0;i<n;i++){const aa=G.rS()*TAU,m=mkEnemy(/Zetsu/.test(c)?'ENM_007':/serpent/.test(c)?'ENM_004':'ENM_001',e.x+Math.cos(aa)*2*M,e.y+Math.sin(aa)*2*M,{minion:1,hpMul:.4});
   m.nom=(/Zetsu/.test(c)?'Zetsu':/serpent/.test(c)?'Serpent':/chien/.test(c)?'Chien de l’enfer':/loup/.test(c)?'Loup des neiges':/corbeau/.test(c)?'Corbeau':/sangsue/.test(c)?'Sangsue':/marionnette/.test(c)?'Marionnette':'Invocation')+' ('+e.nom+')';
   if(/corbeau/.test(c))m.c='Aveuglent';if(/sangsue|Sangsues/.test(c))m.c='vole 1 chakra';m.bete=/chien|loup|corbeau|serpent|sangsue/.test(m.nom.toLowerCase());e.minions.push(m);}},1.2);break;}}}
function setTimeout0(t,f){G.later.push({t,f});}
function updMods(e,d){for(const m of e.mods){switch(m){
 case'Contre-attaquant':e.guardT-=DT;if(e.guardT<=0){e.guard=3;e.guardT=5;}break;
 case'Enragé':e.enrage=1+.1*Math.floor((1-e.hp/e.maxhp)*4);break;
 case'Résonance':break;
 case'Crue':if(G.time-(e.crueT||0)>1){e.crueT=G.time;addSurf('EAU',e.x,e.y,1.5*M,4,true);}break;
 case'Brasier':if(d<1.5*M+P.r&&G.time-(e.brasT||0)>.5){e.brasT=G.time;hurtPlayer(e.dmg*.4,e.nom+' (aura de feu)',null,'zone');}break;
 case'Sceau anti-chakra':G.sceauChakra=d<4*M?.2:G.sceauChakra;break;
 case'Gravité':if(d<4*M)G.gravite=.1;break;
 case'Téléporteur':if(G.time-(e.tpT||0)>4){e.tpT=G.time;const o=G.enemies.find(z=>!z.dead&&!z.elite&&!z.boss&&hyp(z.x-P.x,z.y-P.y)>10*M);if(o){const a=G.rS()*TAU;smoke(o.x,o.y,4);o.x=P.x+Math.cos(a)*4*M;o.y=P.y+Math.sin(a)*4*M;o.spawnT=.8;smoke(o.x,o.y,6);}}break;
 case'Multiplication':if(G.time-(e.multT||0)>6){e.multT=G.time;for(let i=0;i<2;i++){const m2=mkEnemy('ENM_007',e.x+(G.rS()-.5)*3*M,e.y+(G.rS()-.5)*3*M,{minion:1,hpMul:.4});e.minions.push(m2);}}break;
 case'Démon à queues':{const pal=Math.floor((1-e.hp/e.maxhp)*4);if(pal>(e.orbes||0)){e.orbes=pal;danger({shape:'ligne',x:e.x,y:e.y,dir:Math.atan2(P.y-e.y,P.x-e.x),len:10*M,w:1.5*M,tele:1.2,act:.2,dmg:e.dmg*2,cause:'Mini-orbe ('+e.nom+')',owner:e});}break;}
 case'Enracinement':if(G.time-(e.racT||0)>5){e.racT=G.time;danger({shape:'cercle',x:P.x,y:P.y,r:1.8*M,tele:1,act:.15,cause:e.nom,owner:e,eff:{root:.6}});}break;
 case'Parasite':break;case'Mutation':if(!e.mute&&e.hp<e.maxhp*.5){e.mute=1;e.spawnT=1;e.role='tireur';e.c='Onde en arc de 60° à 6 m';e.atkCd=2.5;}break;}}}
function onEnemyDeath(e,I){
 if(e.mods){for(const m of e.mods){
  if(m==='Reconstitution'&&e.recon>0&&!hasSt(e,'STA_09')&&!(I&&I.tags.has('EXPLOSIF'))){e.recon--;e.dead=false;e.hp=e.maxhp*.3;e.spawnT=1;return false;}
  if(m==='Dédoublement'&&!e.split){e.split=1;for(let i=0;i<2;i++){const c=mkEnemy(e.id,e.x+(i?8:-8),e.y,{hpMul:.35});c.mods=null;c.elite=false;c.xp=10;c.nom=e.nom+' (moitié)';}}
  if(m==='Surcharge')danger({shape:'cercle',x:e.x,y:e.y,r:3*M,tele:1,act:.15,dmg:e.dmg*1.5,cause:'Surcharge ('+e.nom+')'});
  }}
 if(/se diviser en 2 petits/.test(e.c)){G.divCpt=(G.divCpt||0)+1;if(G.divCpt%10===0)for(let i=0;i<2;i++){const c=mkEnemy(e.id,e.x+(i?6:-6),e.y,{hpMul:.3,minion:1});c.c='';}}
 if(e.minions&&e.minions.length&&e.role==='invocateur')for(const m of e.minions)if(!m.dead){m.dead=true;smoke(m.x,m.y,4);}
 return true;}
function kill(e,I){if(e.dead)return;e.dead=true;if(!onEnemyDeath(e,I))return;G.kills++;CPT_RUN('kills',1);if(I&&I.liv==='CONTACT')CPT_RUN('kills_contact',1);if(I)I.kills=(I.kills||0)+1;
 if(G.st.flags.killCad)G.killStacks=Math.min(100,G.killStacks+1),G.killT=3;
 const mult=G.mode==='Endless'?1+G.time/600:(G.time<300?1:G.time<600?1+.5*(G.time-300)/300:G.time<900?1.5+.5*(G.time-600)/300:G.time<1200?2+.5*(G.time-900)/300:2.5);
 dropXp(e.x,e.y,(e.elite?60:e.lieut?150:e.xp)*mult*(G.modeD.xp||1));
 if(e.elite){G.coffres.push({x:e.x,y:e.y,t:0,type:'simple'});addChakra(3);CPT_RUN('kills_elite',1);if(G.st.flags.rations)G.rations.push({x:e.x+12,y:e.y,t:0});
  const lien=e.mods&&e.mods.includes('Chaîne liée')?G.enemies.find(o=>o!==e&&o.id===e.id&&!o.dead):null;if(lien)G.relev.push({e,partner:lien,until:G.time+5});}
 if(G.clochette===e){G.clochette=null;G.relances=Math.min(5,G.relances+1);banner('Clochette','+1 Relance.',2);}
 if(G.rS()<.006)G.rations.push({x:e.x,y:e.y,t:0});if(G.rS()<.0015)G.aimants.push({x:e.x,y:e.y,t:0});
 sparks(e.x,e.y,3,'#e8e6e1');}
function dropXp(x,y,v){v=v*(1+G.st.xp);const parts=[];for(const[val,c]of[[100,'or'],[25,'rouge'],[5,'vert'],[1,'bleu']]){while(v>=val&&parts.length<6){parts.push([val,c]);v-=val;}}
 if(v>0.01&&parts.length<6)parts.push([v,'bleu']);for(const[val,c]of parts){const a=G.rS()*TAU,r=parts.length>1?G.rS()*8:0;addGem(x+Math.cos(a)*r,y+Math.sin(a)*r,val,c);}}
function addGem(x,y,v,c){if(G.gems.length>=300){let b=G.gems[0],bd=1e18;for(const g of G.gems){if(!g.dense)continue;const d=hyp(g.x-x,g.y-y);if(d<bd){bd=d;b=g;}}if(!b.dense){b=G.gems[0];b.dense=1;}b.v+=v;return;}
 G.gems.push({x,y,v,c,att:false,sp:0,t:0});}
