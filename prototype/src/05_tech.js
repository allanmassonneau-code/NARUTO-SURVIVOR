// Techniques : instances, niveaux (fiches 8 niveaux ou barème générique), 12 livraisons (§B5), ciblage (§B1.3).
const DEF_LIV={PROJECTILE:{del:1.5,port:9,vit:12},SALVE:{del:2,port:9,vit:13,ang:25},CONE:{del:3,port:4,ang:60},ONDE:{del:3,port:4},CONTACT:{del:1.2,port:2.5},
 ORBITE:{del:6,port:2,dur:5},ZONE:{del:6,port:8,r:2,dur:3},PIEGE:{del:4,port:6,r:1.5,dur:10},RAYON:{del:3,port:7,w:.5},CHAINE:{del:3,port:7,cibles:3},
 INVOCATION:{del:8,port:10,dur:6},DIFFERE:{del:4,port:8,r:1.5,imp:1}};
const BAREME=[null,{txt:'Base'},{d:1.15,txt:'Dégâts +15 %'},{zone:1.15,txt:'Portée et rayon +15 %'},{q:1,txt:'+1 projectile, unité, coup ou instance'},
 {d:1.2,txt:'Dégâts +20 %'},{del:.85,txt:'Délai −15 %'},{dur:1.25,st:1,txt:'Durée +25 %, états +1 cumul'},{d:1.25,q:1,txt:'Dégâts +25 %, +1 quantité'}];
const HOOKS={JUT_217:'kb',JUT_281:'rasen',JUT_185:'kunai',EVO_069:'kb'};

function sourceTech(id){let d=EVO[id];let g=0;while(d&&g<4){const s=d.src[0];if(T[s])return T[s];d=EVO[s];g++;}return T[id]||null;}
function mkInst(id){const def=T[id]||EVO[id];const src=T[id]?def:sourceTech(id);
 const tags=new Set(src?src.tags:[]);if(EVO[id])for(const s of def.src){const t=T[s]||sourceTech(s);if(t)for(const x of t.tags)tags.add(x);}
 const I={id,def,src,liv:src?src.livraison:'CONTACT',fam:src?src.famille:'TAIJUTSU',tags,cible:src?src.cible:'plus_proche',lv:1,cd:.5,
  evo:EVO[id]?def.type:null,hook:HOOKS[id]||null,units:[],objs:[],nomStat:nomCourt(def.nom),L:null,col:src?techCol(src):'#fff',q:[],
  uInt:+((String(def.val||'').match(/intervalle\s*(\d+(?:,\d+)?)/)||[0,'1'])[1].replace(',','.'))};
 if(I.liv==='INVOCATION'){I.unite=tags.has('CLONE')?'CLONE':tags.has('GEANT')?'GEANT':tags.has('ANIMAL')?'ANIMAL':tags.has('MARIONNETTE')?'MARIONNETTE':'UNITE';}
 computeL(I);return I;}
function normL(p,liv){const d=DEF_LIV[liv]||{};const L={d:p.d||0,n:p.n||1,del:p.del||p.icd||d.del||3,dur:p.dur||d.dur||0,perm:p.perm||0,r:p.r||d.r||0,w:p.w||d.w||0,len:p.len||0,
 port:p.port||d.port||6,vit:p.vit||d.vit||12,ang:p.ang||d.ang||60,kb:p.kb||0,sec:p.sec||0,cibles:p.cibles||d.cibles||0,pics:p.pics||0,max:p.max||0,chute:p.chute||10,
 tick:p.tick||0,imp:p.imp||d.imp||0,st:(p.st||[]).map(s=>s.slice()),perce:p.perce||0,rebond:p.rebond||0,bouclier:p.bouclier||0,soin:p.soin||0,armure:p.armure||0,pct:p.pct||0,q:0,approx:0};
 if(liv==='CONTACT'&&L.port>6)L.port=6;return L;}
function computeL(I){const p=I.def.p||{};let L=normL(p,I.liv);
 if(I.evo){if(!L.d){const s=I.src?normL(I.src.p||{},I.liv):L;L.d=Math.round((s.d||20)*1.4);}I.evoMul=1;I.L=L;return;}
 const niv=I.src&&I.src.niv;
 for(let l=2;l<=I.lv;l++){const mo=niv?niv[l][1]:BAREME[l];
  if(mo.d_abs)L.d=mo.d_abs;if(mo.d)L.d=L.d*mo.d;if(mo.del_abs)L.del=mo.del_abs;if(mo.del)L.del*=mo.del;if(mo.dur_abs)L.dur=mo.dur_abs;if(mo.dur)L.dur=(L.dur||3)*mo.dur;
  if(mo.zone){L.r*=mo.zone;L.port*=Math.min(mo.zone,1.3);L.w*=mo.zone;L.len*=mo.zone;}if(mo.q)L.q+=mo.q;if(mo.st)for(const s of L.st)if(s[2]==='')s[1]+=1;else if(s[2]==='s')s[1]*=1.25;
  if(mo.approx)L.approx++;}
 L.d=Math.round(L.d*10)/10;I.L=L;}
function niveauTexte(I,l){const niv=I.src&&I.src.niv&&!I.evo?I.src.niv:null;if(niv)return niv[l][0]+(niv[l][1].approx?' (effet approché : dégâts +10 %)':'');return BAREME[l].txt;}
function techSum(I,L){L=L||I.L;const b=[];if(L.d)b.push((L.n>1?L.n+' × ':'')+fr(L.d,0)+' dégâts');if(L.tick)b.push('tick '+fr(L.tick,2)+' s');
 if(!(I.liv==='ORBITE'&&L.perm))b.push('délai '+fr(L.del,1)+' s');if(L.r)b.push('r '+fr(L.r,1)+' m');if(L.dur&&I.liv!=='CONTACT')b.push('durée '+fr(L.dur,1)+' s');
 if(L.q)b.push('+'+L.q+' quantité');for(const s of L.st)b.push((STA_NOM[s[0]]||s[0])+(s[2]==='s'?' '+fr(s[1])+' s':s[2]==='%'?' +'+fr(s[1],0)+' %':' +'+fr(s[1],0)));return b.join(' · ');}
function effDelay(I){const m=mods(I);let d=I.L.del/(1+m.cad)*(1-m.delred);if(G.st.flags.huileBoost)d*=1;return Math.max(.1,d);}
function qte(I){return Math.max(0,Math.round(mods(I).qte+I.L.q));}

// ---------- ciblage
function candidat(e){if(e.dead||e.hidden||e.invuln||e.spawnT>0)return false;const cx=e.x-G.cam.x,cy=e.y-G.cam.y;return cx>-32&&cy>-32&&cx<W+32&&cy<H+32;}
function nearest(x,y,r,excl){let b=null,bd=1e9;for(const e of G.enemies){if(!candidat(e)||(excl&&excl.has(e)))continue;const d=hyp(e.x-x,e.y-y)-e.r;if(d<=r&&d<bd){bd=d;b=e;}}return b;}
function nearestN(x,y,r,n){const a=[];for(const e of G.enemies){if(!candidat(e))continue;const d=hyp(e.x-x,e.y-y)-e.r;if(d<=r)a.push([d,e]);}a.sort((p,q)=>p[0]-q[0]);return a.slice(0,n).map(z=>z[1]);}
function menace(e){return(e.st&&e.tele)?3:e.elite?2:e.boss||e.lieut?1.5:0;}
function plusMenacant(x,y,r){let b=null,bs=-1,bd=1e9;for(const e of G.enemies){if(!candidat(e))continue;const d=hyp(e.x-x,e.y-y)-e.r;if(d>r)continue;let s=menace(e);if(e.tele&&d<4*M)s=4;if(s>bs||s===bs&&d<bd){bs=s;bd=d;b=e;}}return b;}
function densest(x,y,r,sector){const c=[];for(const e of G.enemies){if(!candidat(e))continue;const d=hyp(e.x-x,e.y-y);if(d>r)continue;if(sector&&angDiff(Math.atan2(e.y-y,e.x-x),sector.a)>sector.h)continue;c.push(e);if(c.length>=50)break;}
 let b=null,bs=-1;for(const e of c){let n=0;for(const o of c)if(Math.abs(o.x-e.x)<1.5*M&&Math.abs(o.y-e.y)<1.5*M)n++;if(e.boss||e.elite)n+=2;if(n>bs){bs=n;b=e;}}return b;}
function cible(I,r){switch(I.cible){case'plus_dense':return densest(P.x,P.y,r);case'plus_menacant':return plusMenacant(P.x,P.y,r);
 case'marque':{let b=null,bd=1e9;for(const e of G.enemies)if(candidat(e)&&hasSt(e,'STA_09')){const d=hyp(e.x-P.x,e.y-P.y);if(d<r&&d<bd){bd=d;b=e;}}return b||nearest(P.x,P.y,r);}
 case'aleatoire_pondere':{const a=nearestN(P.x,P.y,r,8);return a.length?a[Math.floor(G.rX()*a.length)]:null;}
 default:return nearest(P.x,P.y,r);}}
function pointChemin(r){const e=nearest(P.x,P.y,r);if(!e)return null;return{x:lerp(e.x,P.x,.35),y:lerp(e.y,P.y,.35)};}

// ---------- mise à jour et tir
function updTechs(){for(const I of G.techs){if(I.pause>0){I.pause-=DT;continue;}
  if(I.hook){HOOK_UPD[I.hook](I);continue;}
  updObjs(I);
  if(I.liv==='ORBITE'&&I.L.perm){ensureOrbs(I);if(I.L.sec)tickCd(I,()=>orbLaunch(I));continue;}
  if(I.liv==='INVOCATION'&&I.L.perm){if(I.units.length<unitCount(I)&&tickCd(I,()=>summon(I,true)));continue;}
  tickCd(I,()=>fire(I));}}
function tickCd(I,fn){I.cd-=DT;if(I.cd>0)return false;const ok=fn();if(ok===false){I.cd=0;return false;}I.cd=effDelay(I);return true;}
function portee(I){const m=mods(I);return(I.L.port+m.portee)*M*(1+m.zone*.5);}
function fire(I){const L=I.L,m=mods(I),z=1+m.zone;
 if(L.bouclier&&!L.d)addShield(L.bouclier,L.dur||6);if(L.armure){G.buffArm={v:L.armure,t:L.dur||3};}
 switch(I.liv){
 case'PROJECTILE':{const t=cible(I,portee(I));if(!t)return false;const n=Math.max(1,L.n>1&&!L.tick?L.n:1)+qte(I);const a0=Math.atan2(t.y-P.y,t.x-P.x);
  for(let i=0;i<n;i++)projectile(I,P.x,P.y,a0+(i-(n-1)/2)*.17);sfx('tir');return true;}
 case'SALVE':{const t=I.cible==='direction'?null:cible(I,portee(I));if(!t&&I.cible!=='direction')return false;const n=Math.max(2,L.n>1?L.n:(L.pics||3))+qte(I);
  const a0=t?Math.atan2(t.y-P.y,t.x-P.x):Math.atan2(P.fy,P.fx),sp=L.ang*Math.PI/180;
  for(let i=0;i<n;i++)I.q.push({t:i*.06,f:()=>projectile(I,P.x,P.y,a0-sp/2+sp*(n===1?.5:i/(n-1)))});sfx('tir');return true;}
 case'CONE':{const t=I.cible==='direction'?null:cible(I,portee(I)*1.2);if(!t&&I.cible!=='direction')return false;const a=t?Math.atan2(t.y-P.y,t.x-P.x):Math.atan2(P.fy,P.fx);
  const R=(L.port+m.portee)*M*z,half=L.ang*Math.PI/360*(1+m.zone*.5);
  const coup=()=>{for(const e of G.enemies)if(!e.dead&&inArc(e.x,e.y,P.x,P.y,a,half,R+e.r))hit(e,L.d,I,{kb:L.kb,ang:Math.atan2(e.y-P.y,e.x-P.x),st:L.st});G.fx.push({k:'cone',x:P.x,y:P.y,a,half,r:R,t:0,dur:.22,col:I.col});};
  if(L.tick&&L.dur){const k=Math.round(L.dur/L.tick);for(let i=0;i<k;i++)I.q.push({t:i*L.tick,f:coup});}else for(let i=0;i<L.n;i++)I.q.push({t:i*.12,f:coup});return true;}
 case'ONDE':{if(I.cible==='direction'||L.vit&&L.vit<12){const a=Math.atan2(P.fy,P.fx);I.objs.push({k:'mur',x:P.x,y:P.y,a,w:(L.w||4)*M*z,v:(L.vit||6)*M,d:0,max:(L.port+m.portee)*M*z,hits:new Set()});return true;}
  if(I.cible!=='aucune'&&!nearest(P.x,P.y,(L.port+2)*M*z))return false;
  const n=1+qte(I);for(let i=0;i<n;i++)I.objs.push({k:'onde',x:P.x,y:P.y,r:0,max:(L.port+m.portee)*M*z,t:-i*.25,hits:new Set()});return true;}
 case'CONTACT':{const reach=(L.port+m.portee)*M;const t=I.cible==='aucune'?nearest(P.x,P.y,reach):cible(I,reach);if(!t)return false;const a=Math.atan2(t.y-P.y,t.x-P.x);
  if(L.len){const len=L.len*M*z;for(let i=0;i<L.n;i++)I.q.push({t:i*.12,f:()=>{for(const e of G.enemies)if(!e.dead&&inLine(e.x,e.y,P.x,P.y,a,len,(.6*M+e.r)))hit(e,L.d,I,{kb:L.kb,ang:a,st:L.st});G.fx.push({k:'ligne',x:P.x,y:P.y,a,len,w:10,t:0,dur:.15,col:I.col});}});return true;}
  const n=Math.max(1,L.n)+qte(I);
  for(let i=0;i<n;i++)I.q.push({t:i*.12,f:()=>{if(t.dead)return;const hx=t.x,hy=t.y,R=1.2*M*z;
   for(const e of G.enemies)if(!e.dead&&(e===t||inArc(e.x,e.y,hx-Math.cos(a)*R*.6,hy-Math.sin(a)*R*.6,a,50*Math.PI/180,R+e.r)))hit(e,L.d,I,{kb:L.kb,ang:a,st:L.st,contact:1});
   if(L.sec){const r2=1.4*M*z;for(const e of G.enemies)if(!e.dead&&e!==t&&hyp(e.x-hx,e.y-hy)<r2+e.r)hit(e,L.sec,I,{sec:1});fxRing(hx,hy,r2,I.col);}
   G.fx.push({k:'frappe',x:hx,y:hy,a,r:R,t:0,dur:.14,col:I.col});sparks(hx,hy,3,I.col,a);}});sfx('hit');return true;}
 case'ORBITE':{ensureOrbs(I,true);return true;}
 case'ZONE':{let x=P.x,y=P.y;if(I.cible!=='aucune'){const t=I.cible==='direction'?null:cible(I,portee(I));if(!t&&I.cible!=='direction')return false;if(t){x=t.x;y=t.y;}else{x=P.x+P.fx*3*M;y=P.y+P.fy*3*M;}}
  const max=(L.max||3)+qte(I),zs=I.objs.filter(o=>o.k==='zone');if(zs.length>=max)zs[0].t=0;
  I.objs.push({k:'zone',x,y,r:(L.r||2)*M*z,t:(L.dur||3)*(1+m.dur),tick:0,int:L.tick||.5,v:L.vit*M,hits:new Map(),surf:surfaceDe(I)});return true;}
 case'PIEGE':{const pt=I.cible==='chemin'?pointChemin(portee(I)):null;const t=pt||(nearest(P.x,P.y,portee(I)));if(!t)return false;
  const max=(L.max||3)+qte(I)+G.st.trapMax,ps=I.objs.filter(o=>o.k==='piege');if(ps.length>=max)ps[0].t=0;
  I.objs.push({k:'piege',x:t.x,y:t.y,r:(L.r||1.5)*M*z,arm:Math.max(.1,.5-G.st.trapArm),t:(L.dur||10)*(1+m.dur),n:Math.max(1,L.pics||L.n||1),cdT:0});return true;}
 case'RAYON':{const t=I.cible==='direction'?null:cible(I,portee(I)*1.3);if(!t&&I.cible!=='direction')return false;const a=t?Math.atan2(t.y-P.y,t.x-P.x):Math.atan2(P.fy,P.fx);
  const len=(L.len||L.port+m.portee)*M*z,w=Math.max(.3,L.w)*M*z;
  if(L.tick||L.dur){I.objs.push({k:'rayon',a,len,w,t:(L.dur||.6)*(1+m.dur),int:L.tick||.2,tick:0,cible:t});return true;}
  for(let i=0;i<Math.max(1,L.n)+qte(I);i++)I.q.push({t:i*.1,f:()=>{for(const e of G.enemies)if(!e.dead&&inLine(e.x,e.y,P.x,P.y,a,len,w/2+e.r))hit(e,L.d,I,{kb:L.kb,ang:a,st:L.st});G.fx.push({k:'ligne',x:P.x,y:P.y,a,len,w,t:0,dur:.18,col:I.col});}});return true;}
 case'CHAINE':{const t=cible(I,portee(I));if(!t)return false;const n=(L.cibles||3)+qte(I),jump=3*M*z*(1+m.portee/3);const vus=new Set([t]);let cur=t,px=P.x,py=P.y,dm=L.d;
  for(let i=0;i<n&&cur;i++){hit(cur,dm,I,{st:L.st,kb:L.kb});G.fx.push({k:'eclair',x:px,y:py,x2:cur.x,y2:cur.y,t:0,dur:.15,col:I.col});px=cur.x;py=cur.y;dm*=1-L.chute/100;
   let nx=null,nd=1e9;for(const e of G.enemies){if(e.dead||vus.has(e)||!candidat(e))continue;const d=hyp(e.x-cur.x,e.y-cur.y);if(d<jump*(hasSt(e,'STA_03')?2:1)&&d<nd){nd=d;nx=e;}}if(nx)vus.add(nx);cur=nx;}
  sfx('tir');return true;}
 case'INVOCATION':return summon(I,false);
 case'DIFFERE':{const n=Math.max(1,L.n>1?1:1)+qte(I);const cs=[];const t0=cible(I,portee(I));if(!t0&&!L.bouclier&&!L.soin)return false;if(t0)cs.push(t0);
  if(n>1)for(const e of nearestN(t0?t0.x:P.x,t0?t0.y:P.y,6*M,n+2))if(cs.length<n&&!cs.includes(e))cs.push(e);
  for(const e of cs)I.objs.push({k:'diff',x:e.x,y:e.y,suit:e,r:(L.r||1.5)*M*z,t:L.imp||1,d:L.d});return true;}}
 return true;}
function surfaceDe(I){if(!I.tags.has('TERRAIN'))return null;const t=I.tags;return t.has('E_MOKUTON')?'BOIS':t.has('E_SUITON')?'EAU':t.has('E_SABLE')?'SABLE':t.has('E_HYOTON')?'GLACE':
 /ombre/i.test(I.def.nom+I.def.comp)?'OMBRE':/huile/i.test(I.def.comp)?'HUILE':t.has('E_DOTON')?'SABLE':t.has('E_KATON')?'CENDRE':'EAU';}
function projectile(I,x,y,a){const L=I.L,m=mods(I),sp=(L.vit||12)*M*(1+m.vproj),r=(L.tick&&L.r?L.r:.3)*M*(1+m.zone);
 const pierce=(I.tags.has('PERCANT')?3:0)+m.pierce+(L.perce&&!I.tags.has('PERCANT')?1:0);
 G.proj.push({I,x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,a,r,life:(L.port+m.portee)*M*(1+m.zone*.5)/sp,pierce,rebond:L.rebond?3:0,hits:new Set(),aura:L.tick?{int:L.tick,t:0}:null,
  expl:(I.tags.has('EXPLOSIF')||L.sec)?((L.r&&!L.tick?L.r:1.5)*M*(1+m.zone)):0,col:I.col});}
function updProj(){for(const k of G.proj){k.x+=k.vx*DT;k.y+=k.vy*DT;k.life-=DT;const I=k.I,L=I.L;
  if(k.aura){k.aura.t-=DT;if(k.aura.t<=0){k.aura.t=k.aura.int;for(const e of G.enemies)if(!e.dead&&hyp(e.x-k.x,e.y-k.y)<k.r+e.r)hit(e,L.d,I,{st:L.st});}}
  else for(const e of G.enemies){if(e.dead||k.hits.has(e)||e.spawnT>0)continue;if(Math.abs(e.x-k.x)>e.r+k.r+2||Math.abs(e.y-k.y)>e.r+k.r+2)continue;
   if(hyp(e.x-k.x,e.y-k.y)<e.r+k.r){if(e.reflect&&G.time<e.reflect){k.vx*=-1;k.vy*=-1;k.enemy=1;k.hits.add(e);continue;}
    hit(e,L.d*(k.mul||1),I,{kb:L.kb,ang:k.a,st:L.st});k.hits.add(e);if(k.expl)explode(I,k.x,k.y,k.expl,L.sec||L.d*.5);
    if(k.rebond>0){k.rebond--;const n=nearest(e.x,e.y,5*M,k.hits);if(n){const a=Math.atan2(n.y-k.y,n.x-k.x),sp=hyp(k.vx,k.vy);k.vx=Math.cos(a)*sp;k.vy=Math.sin(a)*sp;k.a=a;k.life=Math.max(k.life,.6);continue;}}
    if(k.pierce>0)k.pierce--;else{k.dead=true;break;}}}
  if(k.enemy&&!k.hitP&&hyp(P.x-k.x,P.y-k.y)<P.r+k.r){k.hitP=1;hurtPlayer(L.d*.3,'Projectile renvoyé',null,'proj');k.dead=true;}
  if(!k.dead&&solidAt(k.x,k.y))k.life=-1;
  if(k.life<=0&&!k.dead){if(k.expl)explode(I,k.x,k.y,k.expl,L.sec||L.d*.5);if(k.kunai&&!k.hits.size)I.objs.push({x:k.x,y:k.y,a:k.a,t:k.plant?2:.3,hits:k.plant?new Set():null});k.dead=true;}}
 G.proj=G.proj.filter(k=>!k.dead);}
function explode(I,x,y,r,d){for(const e of G.enemies)if(!e.dead&&hyp(e.x-x,e.y-y)<r+e.r)hit(e,d,I,{sec:1,st:I.L.st});fxRing(x,y,r,'#ffd070');sparks(x,y,5,'#ffb040');sfx('boom');
 if(G.st.flags.mines&&I.tags.has('EXPLOSIF')&&G.mines.length<6)G.mines.push({x,y,t:4,r:1.2*M});}
function updObjs(I){if(I.q.length){for(const q of I.q)q.t-=DT;const now=I.q.filter(q=>q.t<=0);I.q=I.q.filter(q=>q.t>0);for(const q of now)q.f();}
 const L=I.L,m=mods(I);
 for(const o of I.objs){switch(o.k){
  case'onde':o.t+=DT;if(o.t<0)break;o.r=o.max*Math.min(1,o.t/.35);o.x=P.x;o.y=P.y;for(const e of G.enemies){if(e.dead||o.hits.has(e))continue;const d=hyp(e.x-o.x,e.y-o.y);if(Math.abs(d-o.r)<.5*M+e.r&&d<=o.r+e.r){o.hits.add(e);hit(e,L.d,I,{kb:L.kb,ang:Math.atan2(e.y-o.y,e.x-o.x),st:L.st});}}if(o.t>=.35)o.fin=1;break;
  case'mur':o.d+=o.v*DT;const cx=o.x+Math.cos(o.a)*o.d,cy=o.y+Math.sin(o.a)*o.d;for(const e of G.enemies){if(e.dead||o.hits.has(e))continue;if(inLine(e.x,e.y,cx-Math.cos(o.a+Math.PI/2)*o.w/2,cy-Math.sin(o.a+Math.PI/2)*o.w/2,o.a+Math.PI/2,o.w,.6*M+e.r)){o.hits.add(e);hit(e,L.d,I,{kb:L.kb||1,ang:o.a,st:L.st});}}o.cx=cx;o.cy=cy;if(o.d>=o.max)o.fin=1;break;
  case'zone':o.t-=DT;o.tick-=DT;if(o.v){const n=nearest(o.x,o.y,10*M);if(n){const a=Math.atan2(n.y-o.y,n.x-o.x);o.x+=Math.cos(a)*o.v*DT;o.y+=Math.sin(a)*o.v*DT;}}
   if(o.tick<=0){o.tick=o.int;for(const e of G.enemies){if(e.dead||hyp(e.x-o.x,e.y-o.y)>o.r+e.r)continue;e.enZoneAlliee=1;
    if(L.d)hit(e,L.d,I,{st:L.st,kb:L.kb?L.kb*.3:0,ang:Math.atan2(e.y-o.y,e.x-o.x)});else if(!o.hits.has(e)||G.time-o.hits.get(e)>2){o.hits.set(e,G.time);for(const s of L.st)applySt(e,s,I,o.x,o.y);}}}
   if(o.t<=0)o.fin=1;break;
  case'piege':o.t-=DT;if(o.arm>0){o.arm-=DT;break;}o.cdT-=DT;if(o.cdT>0)break;{let trig=false;for(const e of G.enemies)if(!e.dead&&e.spawnT<=0&&hyp(e.x-o.x,e.y-o.y)<o.r+e.r){trig=true;break;}
   if(trig){for(const e of G.enemies)if(!e.dead&&hyp(e.x-o.x,e.y-o.y)<o.r+e.r)hit(e,L.d,I,{st:L.st,kb:L.kb});fxRing(o.x,o.y,o.r,I.col);o.n--;o.cdT=1;if(o.n<=0)o.fin=1;sfx('boom');}}
   if(o.t<=0)o.fin=1;break;
  case'rayon':o.t-=DT;o.tick-=DT;if(o.cible&&!o.cible.dead)o.a=Math.atan2(o.cible.y-P.y,o.cible.x-P.x);if(o.tick<=0){o.tick=o.int;o.n=(o.n||0)+1;const ramp=/augmentent de 25/.test(I.def.comp)?1+.25*o.n*o.int/.3:1;
   for(const e of G.enemies)if(!e.dead&&inLine(e.x,e.y,P.x,P.y,o.a,o.len,o.w/2+e.r))hit(e,L.d*ramp,I,{st:L.st});}if(o.t<=0)o.fin=1;break;
  case'diff':o.t-=DT;if(o.suit&&!o.suit.dead&&(I.cible==='marque'||I.cible==='plus_menacant')){o.x=o.suit.x;o.y=o.suit.y;}
   if(o.t<=0){for(const e of G.enemies)if(!e.dead&&hyp(e.x-o.x,e.y-o.y)<o.r+e.r){if(o.d)hit(e,o.d,I,{st:L.st,kb:L.kb,ang:Math.atan2(e.y-o.y,e.x-o.x)});else for(const s of L.st)applySt(e,s,I);}
    if(L.sec)for(const e of G.enemies)if(!e.dead&&hyp(e.x-o.x,e.y-o.y)<o.r*1.6+e.r)hit(e,L.sec,I,{sec:1});fxRing(o.x,o.y,o.r,I.col);sparks(o.x,o.y,6,I.col);sfx('boom');o.fin=1;}break;
  case'orbe':break;}}
 I.objs=I.objs.filter(o=>!o.fin);
 if(I.liv==='ORBITE')updOrbs(I);
 if(I.liv==='INVOCATION')updUnits(I);}
// ---------- orbites
function ensureOrbs(I,renew){const L=I.L,m=mods(I),k=Math.max(1,L.pics||(L.n>1?L.n:3))+qte(I);
 if(renew||!I.orbs){I.orbs={n:k,t:L.perm?1e9:(L.dur||5)*(1+m.dur),ang:I.orbs?I.orbs.ang:0,hit:new Map()};}else I.orbs.n=k;}
function updOrbs(I){const o=I.orbs;if(!o)return;const L=I.L,m=mods(I);o.t-=DT;if(o.t<=0){I.orbs=null;return;}
 o.ang+=TAU/(2.5/(1+m.cad))*DT;const R=(L.port+m.portee)*M*(1+m.zone),rr=.45*M*(1+m.zone);
 for(let i=0;i<o.n;i++){const a=o.ang+i/o.n*TAU,x=P.x+Math.cos(a)*R,y=P.y+Math.sin(a)*R;
  for(const e of G.enemies){if(e.dead||hyp(e.x-x,e.y-y)>rr+e.r)continue;const k=e.uid*16+i;if(G.time-(o.hit.get(k)||-9)<.5)continue;o.hit.set(k,G.time);if(L.d)hit(e,L.d,I,{st:L.st,kb:L.kb,ang:a});else for(const s of L.st)applySt(e,s,I);}}
 if(L.bouclier&&G.time-(o.shT||-9)>2){o.shT=G.time;addShield(L.bouclier,3);}}
function orbLaunch(I){const t=cible(I,8*M);if(!t||!I.orbs)return false;const a=Math.atan2(t.y-P.y,t.x-P.x);projectileSec(I,P.x,P.y,a,I.L.sec);return true;}
function projectileSec(I,x,y,a,d){const sp=12*M;G.proj.push({I,x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,a,r:.4*M,life:.8,pierce:0,rebond:0,hits:new Set(),mul:d/(I.L.d||d),col:I.col});}

// ---------- invocations (unités alliées §R3 : plafond global 8, géant 1)
function unitCount(I){const L=I.L,base=I.hook?1:Math.max(1,L.n>1?Math.min(L.n,6):(L.pics&&L.pics<=6?L.pics:1));let c=base+qte(I);
 if(I.unite==='CLONE')c+=G.st.cloneCap;if(I.unite==='ANIMAL')c=Math.min(c,base+1+G.st.animalCap);if(I.unite==='GEANT')c=1;return c;}
function alliesCount(){let n=0;for(const I of G.techs)n+=I.units.filter(u=>!u.extra&&!u.geant).length;return n;}
function summon(I,perm){const L=I.L,m=mods(I),n=unitCount(I);const ranged=/lance|crache|tire|jet|souffle|projette|aiguilles|flèche|balles/i.test(I.def.comp);
 if(I.unite==='GEANT'){if(G.techs.some(J=>J.units.some(u=>u.geant)))return false;}
 const t=nearest(P.x,P.y,12*M);if(!t&&!perm&&I.unite!=='CLONE')return false;
 const dur=perm?1e9:(L.dur||6)*(1+m.dur);let spawned=0;
 for(let i=0;i<n;i++){if(I.units.length>=n){const o=I.units.reduce((a,b)=>a.born<b.born?a:b);o.life=dur;o.born=G.time;smoke(o.x,o.y,3);continue;}
  if(I.unite!=='GEANT'&&alliesCount()>=8)break;
  const a=G.rL()*TAU,x=P.x+Math.cos(a)*(I.unite==='GEANT'?6*M:1.2*M),y=P.y+Math.sin(a)*(I.unite==='GEANT'?6*M:1.2*M);
  I.units.push({x:clamp(x,8,G.map.w-8),y:clamp(y,8,G.map.h-8),r:I.unite==='GEANT'?24:6,life:dur,born:G.time,atkT:.3,face:1,walk:0,ranged,geant:I.unite==='GEANT',tgt:null,retT:0});smoke(x,y,6);spawned++;}
 if(spawned&&G.synUnitSceau)for(const u of I.units.slice(-spawned)){for(const e of G.enemies)if(!e.dead&&hyp(e.x-u.x,e.y-u.y)<1.5*M+e.r)hit(e,15,I,{sec:1});fxRing(u.x,u.y,1.5*M,'#e8d27a');}
 if(L.soin)heal(L.soin,false);return true;}
function updUnits(I){const L=I.L,m=mods(I),cad=1+m.cad;
 for(const u of I.units){u.life-=DT;if(u.life<=0){smoke(u.x,u.y,5);continue;}
  u.retT-=DT;if(u.retT<=0||!u.tgt||u.tgt.dead){u.tgt=nearestTo(u.x,u.y,12*M);u.retT=.3;}
  const t=u.tgt;
  if(u.geant){u.atkT-=DT;if(u.atkT<=0&&t){u.atkT=2/Math.max(.5,cad);const a=Math.atan2(t.y-u.y,t.x-u.x),R=8*M*(1+m.zone);for(const e of G.enemies)if(!e.dead&&inArc(e.x,e.y,u.x,u.y,a,.6,R+e.r))hit(e,Math.max(L.d,40),I,{kb:1.5,ang:a,st:L.st});G.fx.push({k:'cone',x:u.x,y:u.y,a,half:.6,r:R,t:0,dur:.3,col:I.col});sfx('boom');}
   const dx=P.x-u.x,dy=P.y-u.y,d=hyp(dx,dy);if(d>12*M){u.x=P.x-dx/d*6*M;u.y=P.y-dy/d*6*M;smoke(u.x,u.y,10);}continue;}
  if(t){const dx=t.x-u.x,dy=t.y-u.y,d=hyp(dx,dy)||1;u.face=dx>=0?1:-1;const reach=u.ranged?5*M:1.1*M+t.r;
   if(d>reach){u.x+=dx/d*(I.unite==='ANIMAL'?6.5:5.5)*M*DT;u.y+=dy/d*(I.unite==='ANIMAL'?6.5:5.5)*M*DT;u.walk+=DT;}
   u.atkT-=DT*cad;if(d<=reach+4&&u.atkT<=0){u.atkT=I.uInt;
    if(u.ranged){const a=Math.atan2(dy,dx);projectileSec(I,u.x,u.y,a,L.d);}else{const a=Math.atan2(dy,dx);for(const e of G.enemies)if(!e.dead&&inArc(e.x,e.y,u.x,u.y,a,50*Math.PI/180,1.2*M*(1+m.zone)+e.r))hit(e,L.d,I,{st:L.st,kb:L.kb});G.fx.push({k:'frappe',x:u.x+Math.cos(a)*8,y:u.y+Math.sin(a)*8,a,r:1.2*M,t:0,dur:.1,col:I.col});}}}
  else{const dx=P.x-u.x,dy=P.y-u.y,d=hyp(dx,dy);if(d>2*M){u.x+=dx/d*5*M*DT;u.y+=dy/d*5*M*DT;u.walk+=DT;u.face=dx>=0?1:-1;}}
  collide(u);}
 I.units=I.units.filter(u=>u.life>0);}
function nearestTo(x,y,leash){let b=null,bd=1e9;for(const e of G.enemies){if(!candidat(e))continue;if(hyp(e.x-P.x,e.y-P.y)>leash)continue;const d=hyp(e.x-x,e.y-y);if(d<bd){bd=d;b=e;}}return b;}
