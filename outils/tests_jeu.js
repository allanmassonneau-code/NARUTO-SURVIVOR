// Tests automatiques du jeu (prototype/index.html) dans Chromium via Playwright.
// Exerce tout le contenu : 80 entrées, 320 techniques, 120 recettes, 44 ultimes, 24 transformations, 40 boss, 25 élites, 5 modes.
// Usage : node outils/tests_jeu.js [section…]   (sections : persos techniques evolutions ultimes transfos boss elites modes)
const path=require('path');
let pw;try{pw=require('playwright');}catch(e){pw=require('/opt/node22/lib/node_modules/playwright');}
const PAGE='file://'+path.resolve(__dirname,'..','prototype','index.html');
const sections=process.argv.slice(2);const veut=s=>!sections.length||sections.includes(s);
(async()=>{const exe=process.env.CHROMIUM||'/opt/pw-browsers/chromium-1194/chrome-linux/chrome';let b;try{b=await pw.chromium.launch({executablePath:exe});}catch(e){b=await pw.chromium.launch();}
 const pg=await b.newPage({viewport:{width:960,height:540}});const errs=[];pg.on('pageerror',e=>errs.push(String(e.stack||e).slice(0,300)));
 await pg.goto(PAGE);await pg.waitForTimeout(400);
 await pg.evaluate(()=>{const N=window.__nss;
  window.__bot=function(sec,opt){opt=opt||{};const G0=N.G;let a=0;for(let i=0;i<sec*60;i++){const G=N.G;
   if(G.phase==='niveau'){G.luT=-9;N.choisir(Math.floor(Math.random()*G.cards.length));continue;}if(G.phase==='coffre'){G.luT=-9;N.fermerCoffre();continue;}
   if(G.phase==='rouleau'){G.luT=-9;if(G.choix.remplace!==undefined){G.choix.remplace=undefined;G.choix.remplacer=null;}N.prendreChoix(0);if(G.phase==='rouleau'){G.choix=null;G.phase='jeu';}continue;}
   if(G.phase==='pause')G.phase='jeu';if(G.phase!=='jeu')break;a+=.01;N.IN.bx=Math.cos(a)*.6;N.IN.by=Math.sin(a*1.3)*.6;if(opt.god)N.P.hp=N.P.maxhp;N.tick();if(G.erreur)return G.erreur;}return null;};
  window.__spawn=function(n,d){const G=N.G;const ids=G.map.ennemis.filter(z=>!N.DATA.ennemis.find(e=>e.id===z).elite);for(let i=0;i<n;i++){const a=i/n*Math.PI*2;const e=window.__mk(ids[i%ids.length]||'ENM_001',N.P.x+Math.cos(a)*(d||3)*16,N.P.y+Math.sin(a)*(d||3)*16);e.spawnT=0;}};});
 await pg.evaluate(()=>{window.__mk=(id,x,y)=>{const N=window.__nss;return N.G.enemies.push?window.__mkE(id,x,y):null;};});
 // accès à mkEnemy via une petite porte : spawnElite/mkBoss sont exposés ; mkEnemy est atteint par le directeur
 await pg.evaluate(()=>{window.__mkE=(id,x,y)=>{const N=window.__nss;const before=N.G.enemies.length;N.G.__mkq=[id,x,y];return window.__mkEnemy(id,x,y);};});
 const res={};
 const run=async(label,fn,arg)=>{try{const r=await pg.evaluate(fn,arg);res[label]=r;}catch(e){res[label]={erreur:String(e).slice(0,300)};}};
 await pg.evaluate(()=>{window.__mkEnemy=window.__nss.mkEnemy;});
 if(veut('persos'))await run('persos',()=>{const N=window.__nss,out={ko:[],ok:0};const L=N.DATA.personnages,M=N.DATA.cartes;
  L.forEach((p,i)=>{try{N.newRun({chr:p.id,map:M[i%M.length].id,mode:'Standard',rang:'C'});const e=window.__bot(45,{god:true});if(e)out.ko.push(p.id+' '+e.slice(0,160));else out.ok++;}catch(err){out.ko.push(p.id+' '+String(err.stack||err).slice(0,200));}});return out;});
 if(veut('techniques'))await run('techniques',()=>{const N=window.__nss,out={ko:[],sansDegats:[],ok:0};
  for(const t of N.DATA.techniques){try{N.newRun({chr:'CHR_001',map:'MAP_001',mode:'Standard',rang:'C'});const G=N.G;const I=N.mkInst(t.id);I.lv=1+Math.floor(Math.random()*8);G.techs=[I];N.recalc();
   window.__spawn(12,4);const e=window.__bot(12,{god:true});if(e){out.ko.push(t.id+' '+e.slice(0,160));continue;}
   const dmg=Object.values(G.dmgBy).reduce((a,b)=>a+b,0);if(dmg<=0&&(t.p.d||0)>0)out.sansDegats.push(t.id+' '+t.livraison);else out.ok++;}catch(err){out.ko.push(t.id+' '+String(err.stack||err).slice(0,200));}}return out;});
 if(veut('evolutions'))await run('evolutions',()=>{const N=window.__nss,out={ko:[],sansDegats:[],ok:0};
  for(const r of N.DATA.evolutions){try{N.newRun({chr:'CHR_001',map:'MAP_001',mode:'Standard',rang:'C'});const G=N.G;const I=N.mkInst(r.id);G.techs=[I];N.recalc();window.__spawn(12,4);const e=window.__bot(10,{god:true});
   if(e){out.ko.push(r.id+' '+e.slice(0,160));continue;}const dmg=Object.values(G.dmgBy).reduce((a,b)=>a+b,0);if(dmg<=0)out.sansDegats.push(r.id);else out.ok++;}catch(err){out.ko.push(r.id+' '+String(err.stack||err).slice(0,200));}}
  // chemin complet : évolution admissible appliquée depuis un coffre
  try{N.newRun({chr:'CHR_001',map:'MAP_001',mode:'Standard',rang:'C'});const G=N.G;G.techs[0].lv=8;G.pas.PAS_060=1;G.pasOrder.push('PAS_060');N.recalc();const adm=N.evolutionsAdmissibles().map(r=>r.id);out.admissibleNaruto=adm;}catch(err){out.ko.push('admissible '+err);}
  return out;});
 if(veut('ultimes'))await run('ultimes',()=>{const N=window.__nss,out={ko:[],sansDegats:[],ok:0};
  for(const u of N.DATA.ultimes){const c=N.DATA.personnages.find(p=>p.ultime===u.id);if(!c){out.ko.push(u.id+' sans utilisateur');continue;}
   try{N.newRun({chr:c.id,map:'MAP_001',mode:'Standard',rang:'C'});const G=N.G;window.__spawn(14,4);G.chakra=100;N.IN.ult=true;const e=window.__bot(4,{god:true});if(e){out.ko.push(u.id+' '+e.slice(0,160));continue;}
    const k=Object.keys(G.dmgBy).find(k=>/ultime/.test(k));if(!k)out.sansDegats.push(u.id+' '+u.nom);else out.ok++;}catch(err){out.ko.push(u.id+' '+String(err.stack||err).slice(0,200));}}return out;});
 if(veut('transfos'))await run('transfos',()=>{const N=window.__nss,out={ko:[],ok:0};
  for(const t of N.DATA.transformations){const c=t.acces[0];try{N.newRun({chr:c,map:'MAP_001',mode:'Standard',rang:'C'});const G=N.G;G.trf={def:t,actif:false,cd:0,t:0,uses:0};G.chakra=100;N.IN.trf=true;window.__spawn(14,4);
   const e=window.__bot(t.dur+4,{god:true});if(e){out.ko.push(t.id+' '+e.slice(0,160));continue;}if(!(G.trf.uses>=1))out.ko.push(t.id+' non activée');else out.ok++;}catch(err){out.ko.push(t.id+' '+String(err.stack||err).slice(0,200));}}return out;});
 if(veut('boss'))await run('boss',()=>{const N=window.__nss,out={ko:[],sansDanger:[],intouchable:[],ok:0};
  for(const d of N.DATA.boss){try{N.newRun({chr:'CHR_004',map:(d.cartes&&d.cartes[0])||'MAP_001',mode:'Standard',rang:'C'});const G=N.G;G.time=1190;G.evts=[];const b=N.mkBoss(d.id,N.P.x+6*16,N.P.y,{final:true});
   let dangers=0;for(let s=0;s<40;s++){const e=window.__bot(1,{god:true});if(e){out.ko.push(d.id+' '+e.slice(0,160));break;}dangers+=G.hz.filter(h=>h.owner===b).length;if(G.phase!=='jeu')break;}
   if(!dangers)out.sansDanger.push(d.id);if(b.hp>=b.maxhp&&!b.dead)out.intouchable.push(d.id);else out.ok++;}catch(err){out.ko.push(d.id+' '+String(err.stack||err).slice(0,200));}}return out;});
 if(veut('elites'))await run('elites',()=>{const N=window.__nss,out={ko:[],ok:0};
  for(const e of N.DATA.ennemis.filter(x=>x.elite)){try{N.newRun({chr:'CHR_007',map:'MAP_001',mode:'Standard',rang:'S'});const G=N.G;G.time=600;N.spawnElite(e.id);const r=window.__bot(25,{god:true});if(r)out.ko.push(e.id+' '+r.slice(0,160));else out.ok++;}catch(err){out.ko.push(e.id+' '+String(err.stack||err).slice(0,200));}}return out;});
 if(veut('modes'))await run('modes',()=>{const N=window.__nss,out={ko:[],ok:[]};
  for(const mode of['Standard','Expedition','Endless','BossRush','Draft']){try{N.newRun({chr:'CHR_001',map:'MAP_002',mode,rang:'C',rush:mode==='BossRush'?['BOS_001','BOS_002','BOS_004','BOS_007']:null,draft:mode==='Draft'?['JUT_217','JUT_281','JUT_185']:null});
   const e=window.__bot(mode==='BossRush'?120:240,{god:true});if(e)out.ko.push(mode+' '+e.slice(0,160));else out.ok.push(mode+' t='+Math.round(N.G.time)+' niv='+N.G.level+' boss='+(N.G.bossVaincus.join(',')||'-'));}catch(err){out.ko.push(mode+' '+String(err.stack||err).slice(0,200));}}return out;});
 for(const k in res){const r=res[k];const s=JSON.stringify(r);console.log('== '+k+' : '+s.slice(0,2500));}
 console.log('ERREURS PAGE',errs.length,errs.slice(0,6).join('\n'));await b.close();
 const ko=Object.values(res).some(r=>r&&(r.erreur||(r.ko&&r.ko.length)))||errs.length;process.exit(ko?1:0);})();
