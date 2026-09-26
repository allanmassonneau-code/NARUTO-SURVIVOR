// Crochets (§G1 : « ≈ 10 % des techniques utilisent des crochets nommés ») : tranche verticale codée sur mesure
// d'après les fiches approfondies JUT_217, JUT_281, JUT_185 et la recette EVO_069.
function lvlTable(base,patches){const out=[null];let cur=Object.assign({},base);for(let i=0;i<8;i++){cur=Object.assign({},cur,patches[i]||{});out.push(Object.assign({},cur));}return out;}
const KBL=lvlTable({n:1,cap:1,dur:4,dmg:18,delay:5,push:0,focus:0},[{},{dur:5},{dmg:23},{n:2,cap:2},{push:1},{delay:4},{focus:1},{n:3,cap:3}]);
const RSL=lvlTable({imp:26,wave:10,r:1.5,kb:1.5,delay:2.2,drill:0,vuln:0},[{},{r:2},{imp:33,wave:12},{delay:1.8},{imp:40,wave:15},{drill:1},{vuln:1},{imp:48,wave:18,kb:2.5}]);
const KUL=lvlTable({n:3,dmg:10,delay:1.0,pierce:0,plant:0,dbl:0},[{},{n:4},{dmg:13},{pierce:1},{n:5},{delay:.8},{plant:1},{dbl:1}]);
const EVO_KB={n:4,cap:4,dur:6,dmg:30,delay:4,push:1,focus:0},COORD_L={imp:50,wave:10,r:1.5,kb:1.5,drill:0,vuln:0};
const HOOK_SUM={kb:I=>{const L=kbL(I);return`${L.n} clone${L.n>1?'s':''} · ${L.dmg}/frappe · ${fr(L.dur)} s · délai ${fr(L.delay)} s`;},
 rasen:I=>{const L=RSL[I.lv];return`Impact ${L.imp} · onde ${L.wave} (r ${fr(L.r)} m) · délai ${fr(L.delay)} s`;},
 kunai:I=>{const L=KUL[I.lv];return`${L.n} × ${L.dmg} · délai ${fr(L.delay)} s${L.pierce?' · perce 1':''}`;}};
const kbL=I=>I.id==='EVO_069'?EVO_KB:KBL[Math.min(8,I.lv)];
const cadB=()=>G.st.cad;
const signatureRasen=()=>/Rasengan à 60/.test(G.chr.signature||'');
function kbI(){return G.techs.find(J=>J.hook==='kb');}
const HOOK_UPD={
 kb(I){const L=kbL(I);I.cd-=DT*(1+cadB());if(I.cd<=0){kbSummon(I,L);I.cd=L.delay;}
  if(I.id==='EVO_069'){I.evoT=(I.evoT??6)-DT*(1+.5*cadB());if(I.evoT<=0){I.evoT=6;const t=plusMenacant(P.x,P.y,10*M)||densest(P.x,P.y,10*M);if(t&&I.units.length)I.coord={t:.5,target:t};}
   if(I.coord){I.coord.t-=DT;if(I.coord.t<=0){const t=I.coord.target;I.coord=null;if(!t.dead){const cl=I.units.filter(c=>!c.extra).slice(0,4);cl.forEach((c,i)=>{const a=i/cl.length*TAU,ox=c.x,oy=c.y;c.x=t.x+Math.cos(a)*(t.r+10);c.y=t.y+Math.sin(a)*(t.r+10);G.fx.push({k:'ligne2',x:ox,y:oy,x2:c.x,y2:c.y,t:0,dur:.18,col:'#9fdcff'});rasenImpact(I,t,COORD_L,1,.75,c.x,c.y,'Rasengan coordonné (EVO_069)');});}}}}
  if(I.focusT>0)I.focusT-=DT;
  updClones(I,L);},
 rasen(I){const L=RSL[I.lv];
  if(I.charge>0){I.charge-=DT;if(I.charge<=0){let t=I.target;if(!t||t.dead||hyp(t.x-P.x,t.y-P.y)>4*M+t.r)t=bestInRange(P.x,P.y,3*M);if(t){G.fx.push({k:'orbe',x:P.x+P.face*6,y:P.y,x2:t.x,y2:t.y,t:0,dur:.07});rasenImpact(I,t,L,1,undefined,P.x,P.y);}else I.cd=0;}}
  else{I.cd-=DT*(1+cadB());if(I.cd<=0){const t=bestInRange(P.x,P.y,3*M);if(t){I.target=t;I.charge=.3;I.cd=L.delay;sfx('charge');}else I.cd=0;}}},
 kunai(I){const L=KUL[I.lv];I.cd-=DT*(1+cadB());if(I.cd<=0){const ts=nearestN(P.x,P.y,9*M,2);if(ts.length){kunaiFan(I,ts[0],L);if(L.dbl&&ts[1])kunaiFan(I,ts[1],L);I.cd=L.delay;sfx('tir');}else I.cd=0;}
  for(const g of I.objs){g.t-=DT;if(g.hits)for(const e of G.enemies){if(e.dead||g.hits.has(e))continue;if(hyp(e.x-g.x,e.y-g.y)<e.r+4){g.hits.add(e);hit(e,5,I,{});}}}
  I.objs=I.objs.filter(g=>g.t>0);},
};
function bestInRange(x,y,r){let b=null,bd=1e9,pr=null;for(const e of G.enemies){if(!candidat(e))continue;const d=hyp(e.x-x,e.y-y)-e.r;if(d>r)continue;if((e.boss||e.elite||e.lieut)&&(!pr||d<hyp(pr.x-x,pr.y-y)-pr.r))pr=e;if(d<bd){bd=d;b=e;}}return pr||b;}
function kunaiFan(I,t,L){const m=mods(I),a0=Math.atan2(t.y-P.y,t.x-P.x),sp=30*Math.PI/180,n=L.n+qte(I);
 for(let i=0;i<n;i++){const a=n===1?a0:a0-sp/2+sp*i/(n-1),v=14*M*(1+m.vproj);
  G.proj.push({I,x:P.x,y:P.y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,a,r:3,life:9*M/v,pierce:L.pierce+m.pierce,rebond:0,hits:new Set(),kunai:1,plant:L.plant,col:'#d8dde6',mul:L.dmg/(I.L.d||L.dmg)});}}
function rasenImpact(I,t,L,mul,pow,fx,fy,nom){const heritage=G.st.rWave,m=1*mul,x=t.x,y=t.y,ang=Math.atan2(y-fy,x-fx);
 const o={mul:m,kb:L.kb,ang,contact:1,st:L.vuln?[['STA_12',5,'%']]:null};const save=I.nomStat;if(nom)I.nomStat=nom;
 if(pow!==undefined)o.addA=-(G.st.power*(1-pow));
 hit(t,L.imp,I,o);const rad=(L.r+heritage)*M*(1+mods(I).zone);
 for(const e of G.enemies){if(e===t||e.dead)continue;if(hyp(e.x-x,e.y-y)<rad+e.r)hit(e,L.wave,I,{mul:m,kb:L.kb,ang:Math.atan2(e.y-y,e.x-x),addA:o.addA,st:o.st});}
 if(L.drill)G.dots.push({e:t,n:4,dmg:6,I,t:.1,mul:m});
 I.nomStat=save;
 for(let i=0;i<3;i++)G.fx.push({k:'ring',x,y,r0:3,r1:rad*(.55+i*.22),t:0,dur:.16+i*.07,col:i?'#bfe8ff':'#ffffff'});sparks(x,y,6,'#9fdcff',ang);sfx('boom');}
function kbSummon(I,L){const cap=Math.min(8,L.cap+(G.chr.id==='CHR_001'&&P.hp<.3*P.maxhp?1:0)+G.st.cloneCap),own=I.units.filter(c=>!c.extra),done=new Set();
 for(let i=0;i<L.n;i++){if(own.length<cap&&alliesCount()<8){const c={clone:1,x:clamp(P.x+(G.rL()-.5)*28,8,G.map.w-8),y:clamp(P.y+(G.rL()-.5)*28,8,G.map.h-8),r:6,life:L.dur*(1+mods(I).dur),born:G.time,atkT:.2,tgt:null,retT:0,face:1,walk:0};I.units.push(c);own.push(c);smoke(c.x,c.y,8);}
  else{let o=null;for(const c of own)if(!done.has(c)&&(!o||c.born<o.born))o=c;if(o){o.life=L.dur;o.born=G.time;done.add(o);smoke(o.x,o.y,4);}}}
 if(L.focus){I.focusT=2;I.focusTarget=plusMenacant(P.x,P.y,10*M);}sfx('poof');}
function updClones(I,L){const ccad=1+.5*cadB(),mm=mods(I);
 for(const c of I.units){c.life-=DT;if(c.life<=0){cloneVanish(I,c,L);continue;}
  c.retT-=DT;if(I.focusT>0&&I.focusTarget&&!I.focusTarget.dead&&!c.extra)c.tgt=I.focusTarget;else if(c.retT<=0||!c.tgt||c.tgt.dead){c.tgt=nearestTo(c.x,c.y,11*M);c.retT=.25;}
  const t=c.tgt;
  if(t){const dx=t.x-c.x,dy=t.y-c.y,d=hyp(dx,dy)||1,reach=1.2*M+t.r-2;c.face=dx>=0?1:-1;if(d>reach){c.x+=dx/d*6*M*DT;c.y+=dy/d*6*M*DT;c.walk+=DT;}
   c.atkT-=DT*ccad;if(d<=reach+4&&c.atkT<=0){c.atkT=.9;const a=Math.atan2(dy,dx);for(const e of G.enemies){if(e.dead)continue;const ex=e.x-c.x,ey=e.y-c.y,dd=hyp(ex,ey);if(dd<=1.2*M*(1+mm.zone)+e.r&&(dd<e.r+2||angDiff(Math.atan2(ey,ex),a)<=50*Math.PI/180))hit(e,L.dmg,I,{mul:c.mul||1});}
    G.fx.push({k:'frappe',x:c.x+Math.cos(a)*8,y:c.y+Math.sin(a)*8,a,r:1.2*M,t:0,dur:.1,col:'#ffffff'});sfx('hit');}}
  else{const dx=P.x-c.x,dy=P.y-c.y,d=hyp(dx,dy);if(d>2*M){c.x+=dx/d*5*M*DT;c.y+=dy/d*5*M*DT;c.walk+=DT;c.face=dx>=0?1:-1;}}
  collide(c);}
 I.units=I.units.filter(c=>c.life>0);}
function cloneVanish(I,c,L){smoke(c.x,c.y,6);
 if(L.push&&!c.extra)for(const e of G.enemies){if(!e.dead&&hyp(e.x-c.x,e.y-c.y)<1.5*M+e.r)hit(e,L.dmg,I,{kb:1.2,ang:Math.atan2(e.y-c.y,e.x-c.x)});}
 const rs=G.techs.find(J=>J.hook==='rasen');
 if(rs&&!c.noCpx&&signatureRasen()){const t=bestInRange(c.x,c.y,3*M);if(t){G.fx.push({k:'orbe',x:c.x,y:c.y,x2:t.x,y2:t.y,t:0,dur:.07});rasenImpact(rs,t,RSL[rs.lv],.6,.75,c.x,c.y,'Rasengan des clones (signature)');}}}
