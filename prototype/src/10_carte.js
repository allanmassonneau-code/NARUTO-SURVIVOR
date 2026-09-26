// Cartes (§D2) : taille, palette, obstacles et eau lus dans la fiche de carte ; surfaces de terrain (§B8.3).
function genCarte(id,seed){const D=MAP[id],r=rng(seed^hashStr(id));const m=clamp(D.m||160,100,220),w=Math.round(m*M*.8),h=Math.round(m*M*.8);
 const t=((D.trace||'')+' '+(D.obstacles||'')+' '+(D.palette||'')).toLowerCase();
 const C={id,D,w,h,col:D.col,obs:[],eau:[],grid:new Map(),cell:64};
 const kinds=[];if(/arbre|forêt|tronc|bois|bambou/.test(t))kinds.push('arbre');if(/rocher|pierre|roche|falaise|montagne|rocheux/.test(t))kinds.push('rocher');
 if(/pilier|colonne|statue|stèle|poteau/.test(t))kinds.push('pilier');if(/maison|toit|bâtiment|mur|ruine|tour|entrepôt|laboratoire/.test(t))kinds.push('bloc');if(!kinds.length)kinds.push('rocher');
 const n=Math.round(w*h/(M*M)/260*D.dens);
 for(let i=0;i<n;i++){const x=40+r()*(w-80),y=40+r()*(h-80);if(hyp(x-w/2,y-h/2)<8*M)continue;const k=kinds[Math.floor(r()*kinds.length)];
  const rad=k==='arbre'?8+r()*6:k==='pilier'?7+r()*3:k==='bloc'?14+r()*10:10+r()*14;C.obs.push({x,y,r:rad,k});}
 if(/rivière|fleuve|lac|mer|eau|marais|cascade|pont|étang|pluie/.test(t)){const horiz=r()<.5;const nb=/lac|mer|étang/.test(t)?0:1;
  if(nb){const pos=(horiz?h:w)*(.3+r()*.4);for(let s=0;s<(horiz?w:h);s+=M*1.5){const off=Math.sin(s/(10*M))*3*M;C.eau.push(horiz?{x:s,y:pos+off,r:2.2*M}:{x:pos+off,y:s,r:2.2*M});}}
  else for(let i=0;i<5;i++){const x=w*(.15+r()*.7),y=h*(.15+r()*.7);if(hyp(x-w/2,y-h/2)<10*M)continue;C.eau.push({x,y,r:(4+r()*5)*M});}}
 for(const o of C.obs){const k=Math.floor(o.x/C.cell)*4096+Math.floor(o.y/C.cell);let a=C.grid.get(k);if(!a){a=[];C.grid.set(k,a);}a.push(o);}
 C.ennemis=(D.ennemis||[]).filter(z=>ENM[z]);return C;}
function obsNear(x,y){const C=G.map,cx=Math.floor(x/C.cell),cy=Math.floor(y/C.cell),out=[];for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const a=C.grid.get((cx+i)*4096+cy+j);if(a)for(const o of a)out.push(o);}return out;}
function solidAt(x,y,rad){rad=rad||0;for(const o of obsNear(x,y))if(hyp(x-o.x,y-o.y)<o.r+rad)return true;return false;}
function collide(o){for(const k of obsNear(o.x,o.y)){const dx=o.x-k.x,dy=o.y-k.y,rr=k.r+(o.r||6);if(Math.abs(dx)>rr||Math.abs(dy)>rr)continue;const d=hyp(dx,dy);if(d<rr&&d>.001){o.x=k.x+dx/d*rr;o.y=k.y+dy/d*rr;}}
 o.x=clamp(o.x,o.r||6,G.map.w-(o.r||6));o.y=clamp(o.y,o.r||6,G.map.h-(o.r||6));}
function surEau(x,y){for(const e of G.map.eau)if(hyp(x-e.x,y-e.y)<e.r)return true;for(const s of G.surf)if(s.type==='EAU'&&hyp(x-s.x,y-s.y)<s.r)return true;return false;}
// Surfaces de terrain (§B8.3) : HUILE, EAU, SABLE, OMBRE, BOIS, GLACE, CENDRE, PAPIER, LAVE ; plafond 400
function addSurf(type,x,y,r,dur,ennemie){G.surf.push({type,x,y,r,t:(dur||6)*(1+(G.st.flags.surfDur||0)),ennemie:!!ennemie});if(G.surf.length>400)G.surf.shift();}
function surfAt(x,y,type){for(const s of G.surf)if((!type||s.type===type)&&!s.ennemie&&hyp(x-s.x,y-s.y)<s.r)return s;return null;}
function updSurf(){for(const s of G.surf)s.t-=DT;G.surf=G.surf.filter(s=>s.t>0);}

// Chronologie de la run Standard §B2.2, mise à l'échelle par mode (f = arrivée du boss / 20:00).
function roleOuvert(role,t){const f=G.f;const ouv={poursuivant:0,chargeur:90,tireur:180,poseur:G.rangId==='A'||G.rangId==='S'||G.rangId==='S+'?180:480,protecteur:480,soigneur:660,controleur:660,invocateur:930,assassin:G.rangId==='D'?Math.max(930,480):930};
 return t>=(ouv[role]||0)*f;}
function vagueScript(){return DATA.vagues.find(v=>v.carte===G.map.id&&(v.mode===G.modeD.nom||v.mode===G.mode||v.mode==='Standard'&&G.mode==='Draft'));}
function composition(t){const vs=G.vague;if(vs){const seg=vs.segments.find(s=>t>=s.debut*G.f&&t<s.fin*G.f);if(seg)return{comp:seg.composition,taux:seg.taux,plafond:seg.plafond,formation:seg.formation};}
 const comp={};for(const id of G.map.ennemis){const e=ENM[id];if(e.elite)continue;if(!roleOuvert(e.role,t))continue;comp[id]=e.role==='poursuivant'?(t<90*G.f?3:1.5):1;}
 if(!Object.keys(comp).length)comp.ENM_001=1;
 const tn=t/G.f,dens=tn<90?25:tn<180?45:tn<300?65:tn<480?85:tn<600?100:tn<780?115:tn<900?125:tn<1080?140:160;
 return{comp,taux:1+tn/200,plafond:dens,formation:tn>=330&&tn<480?'anneau':'flux'};}
function director(){const t=G.time,mode=G.mode;
 if(G.later.length){for(const l of G.later)l.t-=DT;const now=G.later.filter(l=>l.t<=0);G.later=G.later.filter(l=>l.t>0);for(const l of now)l.f();}
 if(mode==='BossRush'){if(G.rushPause>0){G.rushPause-=DT;if(G.rushPause<=0)spawnBossRush();}return;}
 const bossOn=G.boss&&!G.boss.dying,degage=G.modeD.boss&&t>=G.modeD.boss-20&&t<G.modeD.boss;
 let cp=composition(t);let plafond=cp.plafond*(bossOn?(t>=G.modeD.boss+300*G.f?.6:.25):1)*(degage?.2:1);
 G.spawnAcc=Math.min(6,G.spawnAcc+cp.taux*(1+t/(400*G.f))*DT*(bossOn?.4:1));
 let vivants=0;for(const e of G.enemies)if(!e.dead&&!e.boss&&!e.lieut&&!e.elite)vivants++;
 let dist=0;for(const e of G.enemies)if(!e.dead&&DISTANTS.has(e.role))dist++;const capDist=Math.max(3,Math.round(plafond*.08));
 while(G.spawnAcc>=1){G.spawnAcc--;if(vivants>=plafond||degage)break;let id=wpick(cp.comp,G.rS);if(!id||!ENM[id])break;
  if(DISTANTS.has(ENM[id].role)){if(dist>=capDist){const po=Object.keys(cp.comp).filter(z=>ENM[z]&&!DISTANTS.has(ENM[z].role));id=po.length?po[Math.floor(G.rS()*po.length)]:(G.map.ennemis.find(z=>ENM[z].role==='poursuivant')||'ENM_001');}else dist++;}
  const p=cp.formation==='anneau'&&G.rS()<.3?anneauPos():spawnPos();if(p){mkEnemy(id,p[0],p[1]);vivants++;}}
 if(degage)for(const e of G.enemies)if(!e.boss&&!e.elite&&!e.lieut&&!e.dead&&hyp(e.x-P.x,e.y-P.y)>14*M&&G.rS()<.02){e.dead=true;smoke(e.x,e.y,3);}
 // événements planifiés
 while(G.ev<G.evts.length&&t>=G.evts[G.ev].t){try{G.evts[G.ev].f();}catch(err){console.error(err);}G.ev++;}
 if(G.vague){for(const s of G.vague.segments){if(s.elites)for(const el of s.elites){const k='vel'+el.t;if(!G.done[k]&&t>=el.t*G.f){G.done[k]=1;spawnElite(el.id);}}
  if(s.evenements)for(const ev of s.evenements){const k='vev'+ev.t;if(!G.done[k]&&t>=ev.t*G.f){G.done[k]=1;evenement(ev.id+' ('+ev.duree+' s)',ev.duree);}}}}
 if(mode==='Endless'){if(t>=G.nextBoss){G.nextBoss+=600;const pool=DATA.boss.filter(b=>b.role_carte==='final'&&b.id!==(G.boss&&G.boss.id));const b=pool[Math.floor(G.rL()*pool.length)];const p=spawnPos(8)||[P.x+8*M,P.y];mkBoss(b.id,p[0],p[1],{final:true});}
  if(t>=G.nextInterdit){G.nextInterdit+=900;rouleauInterdit();}}
 if(G.modeD.boss&&t>=G.modeD.fin&&!G.fini){finRun(false,'Retraite forcée (28:00)');}
 if(G.modeD.boss&&!G.rage&&t>=G.modeD.boss+300*G.f&&G.boss){G.rage=true;banner('Prolongation','Le boss passe en rage : motifs plus serrés.',3);}
 if(G.relev.length){for(const r of G.relev){if(r.partner.dead){r.fin=1;continue;}if(t>=r.until){r.fin=1;r.e.dead=false;r.e.hp=r.e.maxhp*.5;r.e.spawnT=1;G.enemies.push(r.e);banner('Chaîne liée','Le frère se relève : tuez les deux à moins de 5 s d’intervalle.',2.5);}}G.relev=G.relev.filter(r=>!r.fin);}}
const DISTANTS=new Set(['tireur','controleur','poseur','soigneur','invocateur']); // plafond de rôles à distance (équité, lisibilité)
function anneauPos(){const a=G.rS()*TAU,x=P.x+Math.cos(a)*15*M,y=P.y+Math.sin(a)*15*M;if(x<20||y<20||x>G.map.w-20||y>G.map.h-20||solidAt(x,y,8))return null;return[x,y];}
function eliteDeCarte(id){if(id&&ENM[id])return id;const L=G.map.ennemis.filter(z=>ENM[z].elite);if(L.length)return L[Math.floor(G.rL()*L.length)];
 const all=DATA.ennemis.filter(e=>e.elite);return all[Math.floor(G.rL()*all.length)].id;}
function spawnElite(id){id=eliteDeCarte(id);const p=spawnPos()||[P.x+20*M,P.y];const e=mkEnemy(id,clamp(p[0],40,G.map.w-40),clamp(p[1],40,G.map.h-40));
 if(e.mods&&e.mods.includes('Chaîne liée')){const e2=mkEnemy(id,e.x+2*M,e.y);e2.mods=e.mods.slice();}
 if(G.rangId==='S'||G.rangId==='S+'){const e3=mkEnemy(eliteDeCarte(),e.x-2*M,e.y);}
 banner('Élite : '+e.nom,e.mods?'Modificateur : '+e.mods.join(', '):'',3);return e;}
function planifier(){const f=G.f,ev=[];const add=(t,fn)=>ev.push({t:t*f,f:fn});
 if(G.mode!=='BossRush'){
  add(150,()=>poserRouleau(true));add(G.map.D.evt_t?Math.min(1100,G.map.D.evt_t*60):420,()=>evenement(G.map.D.evenement||'Événement de carte',45));
  add(270,()=>spawnElite());add(570,()=>spawnLieutenant());add(720,()=>rouleauInterdit());add(780,()=>poserRouleau(false));
  add(870,()=>{spawnElite();spawnElite();});add(990,()=>evenement(G.map.D.evenement||'Événement majeur',60,true));add(1140,()=>spawnElite());
  if(G.modeD.boss)add(G.modeD.boss/f,()=>spawnBossFinal());
  if(G.rangId==='B')add(640,()=>evenement('Événement supplémentaire (rang B)',30));}
 if(G.st.flags.rouleauPlus)add(450,()=>poserRouleau(false));
 ev.sort((a,b)=>a.t-b.t);G.evts=ev;}
function spawnLieutenant(){if(G.mode==='Endless'&&G.time>600)return;const D=G.map.D;let id=(D.boss_secondaires||[]).find(b=>BOS[b]);
 if(!id){const L=DATA.boss.filter(b=>/lieutenant/.test(b.role_carte)&&(b.cartes||[]).includes(G.map.id));id=L.length?L[0].id:null;}
 if(!id){const L=DATA.boss.filter(b=>/lieutenant/.test(b.role_carte));id=L[Math.floor(G.rL()*L.length)].id;}
 if(G.mode==='Expedition'&&G.time<300)return;const p=spawnPos(10)||[P.x+10*M,P.y];mkBoss(id,p[0],p[1],{lieut:true});}
function bossFinalId(){let id=G.bossId||G.map.D.boss;if(G.mode==='Expedition'){const L=(G.map.D.boss_secondaires||[]).filter(b=>BOS[b]);if(L.length)id=L[0];}
 if(G.chr&&/Sasuke/.test(G.chr.nom)&&BOS[id]&&/Sasuke/.test(BOS[id].nom))id='BOS_026';return BOS[id]?id:'BOS_001';}
function spawnBossFinal(){const id=bossFinalId();for(const e of G.enemies)if(!e.elite&&!e.lieut&&!e.boss&&hyp(e.x-P.x,e.y-P.y)>12*M)e.dead=true;
 let x,y,k=0;do{const a=G.rL()*TAU;x=P.x+Math.cos(a)*8*M;y=P.y+Math.sin(a)*8*M;k++;}while((x<60||y<60||x>G.map.w-60||y>G.map.h-60||solidAt(x,y,16))&&k<12);
 mkBoss(id,x,y,{final:true,hpMul:G.bossHpMul||1});G.bossDebut=G.time;if(G.rangId==='S+')G.arene=.8;}
function spawnBossRush(){const id=G.rush[G.rushIdx];const p=spawnPos(8)||[P.x+8*M,P.y];mkBoss(id,p[0],p[1],{final:true});}
function poserRouleau(visible){for(let k=0;k<20;k++){const a=G.rL()*TAU,d=(10+G.rL()*18)*M,x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d;if(x<40||y<40||x>G.map.w-40||y>G.map.h-40||solidAt(x,y,10))continue;
 G.rouleaux.push({x,y,t:0,interdit:false});if(visible)banner('Rouleau','Un rouleau est apparu sur la carte (flèche jaune).',3);return;}}
function rouleauInterdit(){if(G.interditFait&&G.mode!=='Endless')return;if(G.rangId==='S+'&&G.mode!=='Endless')return;G.interditFait=1;
 for(let k=0;k<20;k++){const a=G.rL()*TAU,d=(8+G.rL()*10)*M,x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d;if(x<40||y<40||x>G.map.w-40||y>G.map.h-40||solidAt(x,y,10))continue;
  G.rouleaux.push({x,y,t:0,interdit:true});banner('Rouleau interdit','Transformation ou objet interdit : le coût est annoncé avant de choisir.',3.5);return;}}
function evenement(txt,dur,majeur){const t=String(txt);banner(majeur?'Événement majeur':'Événement',t.length>110?t.slice(0,108)+'…':t,4);
 if(/clochette/i.test(t)){const L=G.enemies.filter(e=>!e.dead&&!e.boss&&!e.lieut).slice(0,3);G.clochettes={ids:L,t:60};for(const e of L)e.clochette=1;return;}
 if(/[Bb]rume|brouillard/.test(t)){G.brumeEvt=dur||45;return;}
 if(/réfugié/i.test(t)){for(let i=0;i<10;i++){const p=spawnPos(8);if(p)G.refugies.push({x:p[0],y:p[1],t:0});}return;}
 if(/pluie|orage|tempête/i.test(t)){G.pluie=dur||45;return;}
 for(let i=0;i<24;i++){const p=anneauPos();if(p){const pool=G.map.ennemis.filter(z=>!ENM[z].elite);mkEnemy(pool[Math.floor(G.rS()*pool.length)]||'ENM_001',p[0],p[1]);}}
 if(majeur)spawnElite();}
