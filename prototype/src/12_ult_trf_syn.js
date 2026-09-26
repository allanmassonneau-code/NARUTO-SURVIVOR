// Ultimes (§B4.8, §B9.1), transformations (§B9.2), synergies (§B8), effets visuels et compteurs.
function ultDef(){return ULTD[G.chr.ultime]||DATA.ultimes[0];}
function sansTrf(){return!(G.chr.transformations||[]).length;}
function tryUlt(manual){if(G.chakra<100||G.ult)return;if(G.trfT&&G.time-G.trfT<1)return;
 const u=ultDef(),any=G.enemies.some(e=>candidat(e));
 if(!any){if(!manual)return;G.chakra=50;banner(u.nom+' (à vide)',u.vide||'Effet réduit ; jauge ramenée à 50.',2.5);lancerUlt(u,.5);return;}
 G.chakra=G.st.flags.jauge15?15:0;lancerUlt(u,1);}
function autoUlt(){let n=0,big=false;for(const e of G.enemies){if(!candidat(e))continue;const d=hyp(e.x-P.x,e.y-P.y);if(d<=8*M)n++;if((e.boss||e.elite||e.lieut)&&d<=10*M&&e.state!=='trans')big=true;}
 if(n>=6||big||P.hp<.3*P.maxhp)tryUlt(false);}
function lancerUlt(u,mul){G.lastUltT=G.time;CPT_RUN('ultimes',1);G.ultInv=/invulnérabilité ([\d,]+) s/.test(u.val)?+RegExp.$1.replace(',','.'):.4;sfx('ult');banner(u.nom,u.id,1.6);
 const p=u.p,e=u.effet+' '+u.val,second=sansTrf()?2:1,d=p.d*mul,n=Math.max(1,p.n);
 const Iu={id:u.id,def:{nom:u.nom,acces:''},liv:'ZONE',fam:'CLAN',tags:new Set(['ULT']),nomStat:u.nom+' (ultime)',L:{d,st:p.st},col:'#7ff0ff',units:[],objs:[],q:[]};
 G.ult={t:0,u,pts:[],dur:Math.max(1.2,p.dur||1.6),I:Iu};
 if(/clones? apparaissent|clones en cercle/.test(e)||u.id==='ULT_001'){const k=n*(second>1&&u.maitrise&&/clones supplémentaires/.test(u.maitrise)?1.5:1);
  for(let i=0;i<k;i++){const a=i/k*TAU;G.ult.pts.push({a,x:P.x+Math.cos(a)*4*M,y:P.y+Math.sin(a)*4*M,t:.4+i*.1,r:(p.r||1.5)*M,d});smoke(P.x+Math.cos(a)*4*M,P.y+Math.sin(a)*4*M,5);}return;}
 if(/(\d+) (?:frappes|cibles|ennemis les plus|téléportations)|les \d+ cibles|sur (\d+) cibles|successives/.test(e)){const cibles=nearestN(P.x,P.y,14*M,n*second).sort((a,b)=>menace(b)-menace(a));
  cibles.forEach((c,i)=>G.ult.pts.push({cible:c,t:.2+i*.08,r:1*M,d,x:c.x,y:c.y}));return;}
 if(/ligne droite|traverse|tirée en ligne|projetée/.test(e)){const t=plusMenacant(P.x,P.y,14*M)||nearest(P.x,P.y,14*M);const a=t?Math.atan2(t.y-P.y,t.x-P.x):Math.atan2(P.fy,P.fx);
  G.ult.pts.push({ligne:1,a,t:.8,len:14*M,w:2*M,d,r:(p.r||4)*M,expl:/explos/.test(e)?(num(e,/explosion (\d+)/,d)):0});return;}
 if(/bouclier/.test(e)&&p.bouclier)addShield(P.maxhp*p.bouclier/100,3);
 if(/attire/.test(e))for(const q of G.enemies)if(!q.dead&&!q.boss&&hyp(q.x-P.x,q.y-P.y)<10*M){const a=Math.atan2(P.y-q.y,P.x-q.x);q.kvx+=Math.cos(a)*40*M;q.kvy+=Math.sin(a)*40*M;}
 if(/Parasité|Poison|tous les ennemis à l'écran|à l'écran/.test(e)){for(const q of G.enemies)if(candidat(q)){if(p.st.length)for(const s of p.st)applySt(q,s,Iu);if(d)G.ult.pts.push({cible:q,t:.3+G.rL()*.8,r:.8*M,d});}return;}
 const R=num(e,/(?:sur|de|à) (\d+) m/,p.zone||6)*M;if(/vagues|pendant/.test(e)){const vag=n;for(let i=0;i<vag*second;i++)G.ult.pts.push({x:P.x,y:P.y,centre:1,t:.3+i*(p.dur||3)/Math.max(1,vag),r:R,d});return;}
 if(n>1){const cs=nearestN(P.x,P.y,12*M,n*second);for(let i=0;i<n*second;i++){const c=cs[i%Math.max(1,cs.length)];G.ult.pts.push({x:c?c.x:P.x,y:c?c.y:P.y,cible:c,t:.3+i*.08,r:(p.r||1.5)*M,d});}return;}
 G.ult.pts.push({x:P.x,y:P.y,centre:1,t:.4,r:R,d});if(second>1)G.ult.pts.push({x:P.x,y:P.y,centre:1,t:1,r:R,d:d*.5});}
function updUlt(){const u=G.ult;if(!u)return;u.t+=DT;const I=u.I;
 for(const p of u.pts){if(p.done||u.t<p.t)continue;p.done=1;
  if(p.ligne){const x2=P.x+Math.cos(p.a)*p.len,y2=P.y+Math.sin(p.a)*p.len;for(const e of G.enemies)if(!e.dead&&inLine(e.x,e.y,P.x,P.y,p.a,p.len,p.w/2+e.r))hit(e,p.d,I,{st:I.L.st});
   G.fx.push({k:'ligne',x:P.x,y:P.y,a:p.a,len:p.len,w:p.w,t:0,dur:.3,col:'#bfe8ff'});if(p.expl){for(const e of G.enemies)if(!e.dead&&hyp(e.x-x2,e.y-y2)<p.r+e.r)hit(e,p.expl,I,{});fxRing(x2,y2,p.r,'#ffffff');}sfx('boom');continue;}
  let x=p.x,y=p.y;if(p.centre){x=P.x;y=P.y;}else if(p.cible&&!p.cible.dead){x=p.cible.x;y=p.cible.y;}else if(p.a!==undefined){const t=densest(P.x,P.y,10*M,{a:p.a,h:Math.PI/8})||nearestTo(p.x,p.y,12*M);if(t){x=t.x;y=t.y;}}
  for(const e of G.enemies)if(!e.dead&&hyp(e.x-x,e.y-y)<p.r*(1+G.st.zone)+e.r)hit(e,p.d,I,{kb:1,ang:Math.atan2(e.y-y,e.x-x),st:I.L.st});
  fxRing(x,y,p.r,'#ffffff');fxRing(x,y,p.r*.6,'#bfe8ff');if(p.x!==undefined&&!p.centre)G.fx.push({k:'ligne2',x:p.x,y:p.y,x2:x,y2:y,t:0,dur:.2,col:'#bfe8ff'});sfx('boom');}
 if(u.t>=Math.max(u.dur,...u.pts.map(p=>p.t+.2)))G.ult=null;}

// ---------- transformations
function verifierTrfObtention(){const c=G.chr;for(const id of c.transformations||[]){const t=TRFD[id];if(!t||G.trf&&G.trf.def.id===id)continue;const o=t.obt;
 let ok=false;const niv=o.match(/niveau (\d+)/);if(niv&&G.level>=+niv[1]&&!/Rouleau interdit uniquement/.test(o))ok=true;
 if(/temps ≥ 15:00/.test(o)&&G.time<900*G.f)ok=false;if(/TRF_003 déjà utilisée 3 fois/.test(o))ok=G.trf&&G.trf.def.id==='TRF_003'&&G.trf.uses>=3&&G.time>=900*G.f;
 if(/Porte 7 déjà ouverte/.test(o))ok=false;
 if(ok&&(!G.trf||/Éveil/.test(o))){G.trf={def:t,actif:false,cd:3,t:0,uses:0};banner('Transformation obtenue',t.nom+' — déclenchement : '+t.auto,4);}}
 if(G.trf&&G.trf.def.id==='TRF_009')G.portes=Math.min(7,1+Math.floor(Math.max(0,G.level-10)/5));}
function trfCondition(t){const a=t.auto||'';if(/Jamais automatique/.test(a))return false;let ok=false;
 const pv=a.match(/PV < (\d+) %/);if(pv&&P.hp<P.maxhp*(+pv[1])/100)ok=true;if(/boss présent/.test(a)&&G.boss&&!G.boss.dying)ok=true;if(/élite présente|élite ou boss/.test(a)&&G.enemies.some(e=>e.elite&&candidat(e)))ok=true;
 const n=a.match(/≥ (\d+) ennemis/);if(n){let c=0;for(const e of G.enemies)if(candidat(e))c++;if(c>=+n[1])ok=true;}if(/immobile 1 s/.test(a)&&G.immobileT>=1&&G.enemies.filter(candidat).length>=10)ok=true;
 if(/phase 2 ou plus/.test(a)&&G.boss&&G.boss.phase>=2)ok=true;if(/surface EAU/.test(a)&&surEau(P.x,P.y))ok=true;if(/attaque télégraphiée de boss/.test(a)&&G.hz.some(h=>h.owner&&(h.owner.boss||h.owner.lieut)&&h.state==='tele'&&dansDanger(h,P.x,P.y,P.r)))ok=true;
 if(/et PV < (\d+)/.test(a)){const m=a.match(/et PV < (\d+)/);ok=ok&&P.hp<P.maxhp*(+m[1])/100;}if(/et élite présente/.test(a))ok=ok&&G.enemies.some(e=>e.elite);return ok;}
function activerTrf(manuel){const T_=G.trf;if(!T_||T_.actif||T_.cd>0)return;if(!manuel&&!trfCondition(T_.def))return;const t=T_.def;
 if(/Consomme 100 chakra/.test(t.cout)){if(G.chakra<100)return;G.chakra=0;}
 T_.actif=true;T_.t=t.dur;T_.uses++;G.trfT=G.time;P.inv=Math.max(P.inv,.8);CPT_RUN('trf',1);CPT_RUN('trf_'+t.id,1);SAVE_TRF(t.id);sfx('trf');banner(t.nom,t.stats,2.5);
 const pct=t.cout.match(/(\d+) % des PV max/);if(pct)P.hp=Math.max(1,P.hp-P.maxhp*(+pct[1])/100);recalc();}
function updTrf(){const T_=G.trf;if(!T_)return;if(!T_.actif){T_.cd-=DT;if(T_.cd<=0&&!G.assist.trfManuel)activerTrf(false);return;}
 const t=T_.def;T_.t-=DT;if(T_.pvs=t.pvs||0)P.hp=Math.max(1,P.hp-T_.pvs*DT);const pn=G.portes&&t.id==='TRF_009'?G.portes:0;if(pn)P.hp=Math.max(1,P.hp-P.maxhp*pn/100*DT);
 // comportements chiffrés : attaques périodiques (« 2 × 80 en cône de 8 m / 2 s », « (40) », « 8 × 20 / 1,5 s »…)
 T_.atkT=(T_.atkT||0)-DT;if(T_.atkT<=0){const c=t.comp+' '+t.stats;const m=c.match(/(\d+) × (\d+)[^/]*\/\s*([\d,]+) s/)||c.match(/\((\d+)\)[^/]*/);const every=+(c.match(/\/\s*([\d,]+) s/)||[0,'2'])[1].replace(',','.');
  T_.atkT=every||2;let d=0,n=1;if(m&&m.length===4){n=+m[1];d=+m[2];}else{const mm=c.match(/\((\d+)[^)]*\)|(\d+) aux élites|\+ (\d+)/);d=mm?+(mm[1]||mm[2]||mm[3]):0;}
  if(d){const R=num(c,/(?:cône|arc|balayage) de (\d+) m|à (\d+) m/,5)*M;const tg=plusMenacant(P.x,P.y,R+2*M);if(tg){const a=Math.atan2(tg.y-P.y,tg.x-P.x);const I={id:t.id,def:{nom:t.nom,acces:''},liv:'CONE',fam:'CLAN',tags:new Set(),nomStat:t.nom+' (transformation)',L:{d},col:'#ff9a3a'};
   for(let i=0;i<n;i++)setTimeout0(i*.1,()=>{for(const e of G.enemies)if(!e.dead&&inArc(e.x,e.y,P.x,P.y,a,.7,R+e.r))hit(e,d,I,{kb:.5,ang:a});G.fx.push({k:'cone',x:P.x,y:P.y,a,half:.7,r:R,t:0,dur:.2,col:'#ff9a3a'});});}}}
 if(T_.t<=0){T_.actif=false;T_.cd=t.rech;P.inv=Math.max(P.inv,1);G.epuiseT=/Épuisé/.test(t.fin)?3:0;const pm=t.fin.match(/PV max −(\d+) %/)||t.cout.match(/PV max −(\d+) %/);
  if(pm){G.chr=Object.assign({},G.chr,{stats:Object.assign({},G.chr.stats,{pv:G.chr.stats.pv*(1-(+pm[1])/100)})});}if(/reste à 1 PV/.test(t.cout))P.hp=1;recalc();}}

// ---------- synergies (§B8) : compatibilité selon les références ; déclenchement au coup primaire ; ICD ; profondeur ≤ 1
const SYN_ID=/^(JUT_|EVO_|TRF_|DOJ_|APT_|CTR_|CLAN_|KG_|PAS_|CHR_)/;
function synCompat(s){const apt=aptitudes(G.chr);for(const r of s.references){
  if(/^(JUT_|EVO_)/.test(r)){if(!G.techs.some(I=>I.id===r||I.evo&&EVO[I.id].src.includes(r)))return false;}
  else if(/^TRF_/.test(r)){if(!(G.trf&&G.trf.def.id===r))return false;}
  else if(/^(DOJ_|APT_|CTR_|CLAN_|KG_)/.test(r)){if(!apt.has(r))return false;}
  else if(/^PAS_/.test(r)){if(G.pas[r]===undefined)return false;}
  else if(/^STA_/.test(r)){}
  else if(/^SURF_/.test(r)){const t=r.slice(5);if(!G.techs.some(I=>surfaceDe(I)===t))return false;}
  else if(!G.techs.some(I=>matchTok(I,r)||r==='E_SUITON'&&I.tags.has('E_RANTON')||r==='E_RAITON'&&I.tags.has('E_RANTON')))return false;}
 return true;}
function synActives(){if(G._synV===G.modsV)return G._syn;G._synV=G.modsV;G._syn=DATA.synergies.filter(synCompat);G.synA=G._syn.some(s=>/\+\d+ % (?:de )?dégâts|×\s*[\d,]+/.test(s.effet));
 G.synPlaies=G._syn.some(s=>s.id==='SYN_031');G.synCritd=G._syn.some(s=>s.id==='SYN_037');G.synUnitSceau=G._syn.some(s=>s.id==='SYN_046');return G._syn;}
function synDeclenche(s,I,e){const refsTag=s.references.filter(r=>!SYN_ID.test(r)&&!/^STA_|^SURF_/.test(r)),sta=s.references.filter(r=>/^STA_/.test(r)),surf=s.references.filter(r=>/^SURF_/.test(r));
 if(refsTag.length&&!refsTag.some(r=>matchTok(I,r)))return false;
 if(sta.length&&!sta.some(r=>hasSt(e,r)||r==='STA_09'&&hasSt(e,'STA_21')))return false;
 if(surf.length&&!surf.some(r=>surfAt(e.x,e.y,r.slice(5))))return false;return true;}
function synBonus(I,e){if(!I||!G._syn)return 0;let a=0;for(const s of G._syn){const m=s.effet.match(/^\+(\d+) % (?:de )?dégâts|: \+(\d+) % dégâts|gagne \+(\d+) % dégâts/);if(!m)continue;if(!synDeclenche(s,I,e))continue;a+=(+(m[1]||m[2]||m[3]))/100;}return a;}
function synergies(I,e,B,o){const L=synActives();if(!L.length||!I||!I.tags)return;
 for(const s of L){if(!synDeclenche(s,I,e))continue;const icd=num(s.limite,/([\d,]+) s/,.6);const k=s.id;if(G.time-(G.synT[k]||-9)<icd)continue;G.synT[k]=G.time;
  if(!G.synVues.has(k)){G.synVues.add(k);SAVE_SYN(k);G.texts.push({x:P.x,y:P.y-30,s:'Synergie : '+s.nom,t:-.3,col:'#e8d27a'});}CPT_RUN(k,1);
  const ef=s.effet;
  if(/arcs?\b|voisin|propag|rebondi/.test(ef)){const n=/3 arcs/.test(ef)||G.st.flags.arcs3?3:2;const cs=nearestN(e.x,e.y,4*M,n+1).filter(q=>q!==e).slice(0,n);for(const q of cs){hit(q,B*.3,I,{sec:1});G.fx.push({k:'eclair',x:e.x,y:e.y,x2:q.x,y2:q.y,t:0,dur:.12,col:'#cfe6ff'});}
   if(/Trempé/.test(ef)&&/[Cc]onsomme/.test(ef)&&e.st&&e.st.STA_03)e.st.STA_03.t=0;}
  else if(/explos|détone|onde|pic jaillit|nuage|jaillit/.test(ef)){const r=num(ef,/r ([\d,]+) m|([\d,]+) m/,1.5)*M;const dd=num(ef,/(\d+) × A/,0)||B*.4;for(const q of G.enemies)if(!q.dead&&q!==e&&hyp(q.x-e.x,q.y-e.y)<r+q.r)hit(q,dd,I,{sec:1});fxRing(e.x,e.y,r,'#e8d27a');
   if(/Vapeur/.test(ef))for(const q of G.enemies)if(!q.dead&&hyp(q.x-e.x,q.y-e.y)<r+q.r)applySt(q,['STA_23',3,'s'],I);}
  const cu=ef.match(/\+(\d+) cumuls? (?:de |d')?(\w+)/);if(cu){const nm=cu[2];const code=Object.keys(STA_NOM).find(c=>STA_NOM[c].startsWith(nm.slice(0,5)));if(code)applySt(e,[code,+cu[1],''],I);}
  if(/Électrise/.test(ef))applySt(e,['STA_04',1,''],I);if(/Étourdi ([\d,]+) s/.test(ef))applySt(e,['STA_11',+RegExp.$1.replace(',','.'),'s'],I);}}

// ---------- effets visuels et compteurs
function smoke(x,y,n){for(let i=0;i<n;i++){const a=Math.random()*TAU,s=10+Math.random()*25;G.fx.push({k:'fumee',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-6,t:0,dur:.3+Math.random()*.2,r:2+Math.random()*3});}}
function sparks(x,y,n,col,dir){for(let i=0;i<n;i++){const a=(dir===undefined?Math.random()*TAU:dir+(Math.random()-.5)*1.4),s=40+Math.random()*60;G.fx.push({k:'etincelle',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,t:0,dur:.25,col});}}
function fxRing(x,y,r,col){G.fx.push({k:'ring',x,y,r0:3,r1:r,t:0,dur:.22,col});}
function banner(title,sub,dur){G.banners=[{title,sub,t:dur||3,dur:dur||3}];}
function updFx(){for(const f of G.fx){f.t+=DT;if(f.vx!==undefined){f.x+=f.vx*DT;f.y+=f.vy*DT;}}G.fx=G.fx.filter(f=>f.t<f.dur);if(G.fx.length>600)G.fx.splice(0,G.fx.length-600);
 for(const t of G.texts){t.t+=DT;t.y-=14*DT;}G.texts=G.texts.filter(t=>t.t<(t.s?1.6:.6));
 for(const d of G.dots||[]){d.t-=DT;if(d.t<=0){if(!d.e.dead)hit(d.e,d.dmg,d.I,{mul:d.mul,sec:1});d.n--;d.t=.1;}}if(G.dots)G.dots=G.dots.filter(d=>d.n>0);
 for(const b of G.banners)b.t-=DT;G.banners=G.banners.filter(b=>b.t>0);}
function CPT_RUN(k,n){G.cpt[k]=(G.cpt[k]||0)+n;}
