// Boss (§D4) : les 12 boss détaillés exécutent leurs attaques du dossier (formes analysées) ; les 28 boss « identité »
// reçoivent un kit générique construit à partir de leur mécanique (signalé « kit générique » dans les Archives).
const BOSS_K={Standard:.24,Expedition:.12,Endless:.16,BossRush:.2,Draft:.24,lieut:.2};
function kitGenerique(b){const m=(b.mecanique||'')+' '+b.nom,big=estBete(b.nom)||(b.px||32)>=96,s=big?1.3:1;
 const atk=[{nom:'Frappe',g:{forme:'arc',ang:120,r:3*s},tele:.8,act:.2,d:24,rec:1},{nom:'Assaut',g:{forme:'ligne',w:1.5*s,len:10*s,n:1},tele:.9,act:.3,d:26,rec:1.2},
  {nom:'Impact',g:{forme:'cercle',centre:'joueur',r:2.2*s,n:big?2:1},tele:1,act:.2,d:22,rec:1.2}];
 const sig=/quadrillage|colonnes/.test(m)?{nom:'Quadrillage',g:{forme:'grille'},tele:1.4,act:.3,d:30,rec:1.5}:
  /tentacule|queues|Queues/.test(m)?{nom:'Balayage de queues',g:{forme:'etoile',n:Math.max(4,nbQueues(b.nom)||6),len:9*s,w:1.4},tele:1.2,act:.3,d:30,rec:1.5}:
  /Bijūdama|orbe|rayon|souffle|laser|Chidori|flèche/.test(m)?{nom:/Bijūdama/.test(m)?'Bijūdama':'Tir chargé',g:{forme:'ligne',w:3*s,len:20,n:1},tele:1.4,act:.3,d:40,rec:1.6}:
  /pluie|météore|bombard|Émergences|oiseaux/.test(m)?{nom:'Pluie de coups',g:{forme:'cercle',centre:'joueur',r:2,n:4},tele:1.1,act:.2,d:26,rec:1.4}:
  /mur|vague|marée|dune|mer d'étiquettes/.test(m)?{nom:'Vague',g:{forme:'mur',w:16,len:12,breches:2},tele:1.3,act:1.4,d:30,rec:1.6}:
  /attire|gravité|Alourdissement|cube/.test(m)?{nom:/cube/.test(m)?'Cube':'Attraction',g:{forme:'cercle',centre:'joueur',r:2.5,n:1},tele:2.5,act:.3,d:45,rec:2}:
  /dôme|Dôme|barrière|enferme/.test(m)?{nom:'Dôme',g:{forme:'arene',sures:3,r:2.5},tele:1.6,act:.3,d:34,rec:2}:
  /poison|Nuage/.test(m)?{nom:'Nuage de poison',g:{forme:'cercle',centre:'joueur',r:3,n:1,persist:4},tele:1,act:4,d:6,rec:1.5,eff:{poison:1}}:
  /toile|Toiles/.test(m)?{nom:'Toile',g:{forme:'cercle',centre:'joueur',r:3,n:1},tele:1,act:.2,d:10,rec:1.2,eff:{slow:.4,slowT:2}}:
  {nom:'Technique secrète',g:{forme:'arene',sures:3,r:2.5},tele:1.8,act:.3,d:34,rec:2};
 atk.push(sig);return atk;}
function mkBoss(id,x,y,opt){opt=opt||{};const D=BOS[id];const lieut=opt.lieut||/lieutenant/.test(D.role_carte||'')&&!opt.final;
 const K=lieut?BOSS_K.lieut:(BOSS_K[G.mode]||.24),hp=Math.max(800,D.pv*K*G.rang.pv*(opt.hpMul||1)*(G.mode==='Endless'?1+G.time/600:1));
 const atk=(D.atk&&D.atk.length)?D.atk.map(a=>Object.assign({},a)):kitGenerique(D);
 const b={uid:UID++,id,D,nom:D.nom,boss:!lieut,lieut,x,y,r:clamp((D.hit||.9)*M,10,40),hp,maxhp:hp,res:D.resistance||.2,rc:20,st:null,vulns:[],kvx:0,kvy:0,flash:0,walk:0,
  atk,generique:!(D.atk&&D.atk.length),phase:1,phases:parsePhases(D),state:'enter',t:clamp(num(D.entree,/([\d,]+) s/,2),1,2.5),invuln:true,n:0,last:null,face:1,
  bete:estBete(D.nom),px:D.px||32,keep:num(D.deplacement,/(\d+)(?:–\d+)? m/,6)*M,fixe:/^Fixe|Immobile|immobile en phase 1/.test(D.deplacement||''),
  tp:/brume en brume|corbeaux|se fond dans le sol|Téléport|Substitution|disperse|spirale/.test(D.deplacement||''),xp:0,spawnT:0,recMul:1,adds:[]};
 b.vulnTxt=D.vulnerabilites||'';G.enemies.push(b);if(!lieut)G.boss=b;else G.lieutenant=b;smoke(x,y,18);sfx('warn');
 banner(D.nom,lieut?'Lieutenant':(b.generique?'Boss (kit générique d’après sa fiche d’identité)':'Boss'),3.5);return b;}
function parsePhases(D){const out=[];for(const p of D.phases||[]){const m=String(p.seuil).match(/(\d+)\s*[–-]\s*(\d+)/);out.push({hi:m?+m[1]:100,lo:m?+m[2]:0,txt:p.changements});}return out;}
function bossPhase(e){if(e.hp<=0&&!e.dying){e.hp=0;e.dying=true;e.invuln=true;e.state='mort';e.t=1.2;for(const h of G.hz)if(h.owner===e)h.fin=1;for(const a of e.adds)if(!a.dead){a.dead=true;smoke(a.x,a.y,6);}
  banner(e.nom+' est vaincu',e.D.conclusion||'',2.5);sfx('coffre');CPT_RUN('kills_boss',1);SAVE_BOSS(e.id);return;}
 const ph=e.phases[e.phase];if(ph&&e.hp/e.maxhp*100<=ph.hi){e.hp=Math.min(e.hp,e.maxhp*ph.hi/100);e.phase++;entrerPhase(e,ph.txt);}}
function entrerPhase(e,txt){e.state='trans';e.t=1.5;e.invuln=true;for(const h of G.hz)if(h.owner===e)h.fin=1;banner(e.nom+' — phase '+e.phase,txt,3.5);smoke(e.x,e.y,14);sfx('warn');
 const v=txt.match(/visibilit[ée] (\d+) m/);if(v||/[Bb]rume/.test(txt)&&!/partielle/.test(txt))G.brume=(v?+v[1]:9)*M;
 if(/clones? d'eau|(\d+) clones/.test(txt)){const n=+(txt.match(/(\d+) clones/)||[0,2])[1];for(let i=0;i<n;i++){const a=G.rL()*TAU,c=mkBossClone(e,e.x+Math.cos(a)*3*M,e.y+Math.sin(a)*3*M);}}
 if(/récupérations plus courtes|plus rapide|rage|enchaîne/.test(txt))e.recMul=.75;if(/plus lentes/.test(txt))e.recMul=1.15;
 if(/réanimé|élites réanimées|Cent marionnettes|nuées|vagues d'ennemis|ressuscite|Zetsu/.test(txt))for(let i=0;i<(/3 élites/.test(txt)?3:6);i++){const p=spawnPos(12);if(!p)continue;
  const pool=G.map.ennemis.filter(z=>ENM[z]&&(/3 élites/.test(txt)?ENM[z].elite:!ENM[z].elite));const id=pool.length?pool[Math.floor(G.rL()*pool.length)]:'ENM_001';e.adds.push(mkEnemy(id,p[0],p[1]));}
 if(G.rangId==='A'||G.rangId==='S'||G.rangId==='S+')e.double=.25;}
function mkBossClone(e,x,y){const c={uid:UID++,id:e.id,D:e.D,nom:'Clone de '+nomCourt(e.nom),boss:false,lieut:true,clone:1,x:clamp(x,40,G.map.w-40),y:clamp(y,40,G.map.h-40),r:e.r,hp:e.maxhp*.03,maxhp:e.maxhp*.03,res:.2,rc:20,st:null,vulns:[],kvx:0,kvy:0,flash:0,walk:0,
 atk:[e.atk[0]],phase:1,phases:[],state:'enter',t:.6,invuln:true,n:0,face:1,bete:e.bete,px:e.px,keep:2*M,xp:0,spawnT:0,recMul:1,adds:[],dmgMul:.7,alpha:.75,vulnTxt:''};G.enemies.push(c);e.adds.push(c);smoke(c.x,c.y,8);return c;}
function updBoss(e){const dx=P.x-e.x,dy=P.y-e.y,d=hyp(dx,dy)||1,rec=e.recMul*(G.rangId==='B'?.9:1)*(G.rage?.8:1);
 updStates(e);if(e.flash>0)e.flash-=DT;if(e.state!=='mort')e.face=dx>=0?1:-1;
 switch(e.state){
 case'enter':e.t-=DT;if(e.t<=0){e.invuln=false;e.state='idle';e.t=.5;}break;
 case'trans':e.t-=DT;if(e.t<=0){e.invuln=false;e.state='idle';e.t=.4;}break;
 case'mort':e.t-=DT;if(e.t<=0){e.dead=true;finBoss(e);}break;
 case'cache':e.t-=DT;if(e.t<=0){let x=e.x,y=e.y;for(let k=0;k<10;k++){const a=G.rL()*TAU;x=P.x+Math.cos(a)*6*M;y=P.y+Math.sin(a)*6*M;if(x>40&&y>40&&x<G.map.w-40&&y<G.map.h-40&&!solidAt(x,y,14))break;}
  e.x=x;e.y=y;e.hidden=false;e.invuln=false;e.state='fige';e.t=1;const v=e.vulnTxt.match(/(?:sortant|réappar|après chaque)[^+]*\+(\d+) %/);addVuln(e,v?+v[1]/100:.1,1);smoke(x,y,12);}break;
 case'fige':e.t-=DT;if(e.t<=0){e.state='idle';e.t=.3;}break;
 case'idle':if(!e.fixe&&peutAgir(e)){const sp=3.5*M*(1-slowOf(e));let vx=0,vy=0;if(d>e.keep+M){vx=dx/d;vy=dy/d;}else if(d<e.keep-M){vx=-dx/d;vy=-dy/d;}else{vx=-dy/d*.6;vy=dx/d*.6;}e.x+=vx*sp*DT;e.y+=vy*sp*DT;if(vx||vy)e.walk+=DT;}
  e.t-=DT;if(e.t<=0&&peutAgir(e))lancerAttaque(e,d);break;
 case'approche':{const sp=7*M;e.x+=dx/d*sp*DT;e.y+=dy/d*sp*DT;e.walk+=DT;e.t-=DT;if(d<3*M||e.t<=0)executer(e);break;}
 case'attaque':e.t-=DT;if(e.soin&&(e.maxhp*.02<=e.dmgPendant)){e.soin=0;e.state='fige';e.t=1.5;addVuln(e,.2,1.5);banner('Interrompu !','',1.2);break;}
  if(e.t<=0){if(e.soin){e.hp=Math.min(e.maxhp,e.hp+e.maxhp*e.soin/100);e.soin=0;}e.state='recup';e.t=e.cur.rec*rec;}break;
 case'recup':e.t-=DT;if(e.t<=0){e.n++;if(e.tp&&e.n%2===0&&!e.clone){e.state='cache';e.t=.6;e.hidden=true;e.invuln=true;smoke(e.x,e.y,12);sfx('poof');}else{e.state='idle';e.t=.5*rec;}}break;}
 if(!e.hidden&&d<e.r+P.r){P.x=e.x+dx/d*(e.r+P.r);P.y=e.y+dy/d*(e.r+P.r);}}
function lancerAttaque(e,d){let pool=e.atk.filter(a=>a!==e.last||e.atk.length===1);
 if(G.rangId==='D'){const app=pool.filter(a=>a.info==='apprise');if(app.length>1)pool=pool.filter(a=>a.info!=='apprise'||a===app[0]);}
 const a=pool[Math.floor(G.rL()*pool.length)];e.last=a;e.cur=a;
 if(a.g.forme==='arc'&&a.g.r<5&&d>a.g.r*M+M&&!e.fixe){e.state='approche';e.t=1.6;return;}
 executer(e);if(e.double&&G.rL()<e.double){const b=e.atk.filter(x=>x!==a&&x.g.forme!=='soi');if(b.length){const s=e.cur;e.cur=b[Math.floor(G.rL()*b.length)];executer(e,true);e.cur=s;}}}
function executer(e,second){const a=e.cur,g=a.g,dmg=a.d*G.rang.dg*(e.dmgMul||1)*(G.rage?1.1:1),dir=Math.atan2(P.y-e.y,P.x-e.x),cause=a.nom+' ('+nomCourt(e.nom)+')',tele=a.tele||.8,act=Math.max(.12,a.act||.2);
 const txt=(g.txt||'')+' '+a.nom+' '+(a.rep||'');const eff={};
 if(/attire/.test(txt))eff.pull=4;if(/repousse/.test(txt))eff.push=g.repousse||3;const po=txt.match(/Empoisonné \+(\d)/);if(po)eff.poison=+po[1];
 const sl=txt.match(/ralentit (\d+) %/);if(sl){eff.slow=+sl[1]/100;eff.slowT=3;}if(/prison|immobil|saisi|Tsukuyomi|illusion|enferm/.test(txt))eff.root=1.5;
 const ch=txt.match(/(?:vole|scelle|draine) (\d+) chakra/);if(ch)eff.chakra=+ch[1];if(/Aveugl|encre/.test(txt))eff.aveugle=2;
 if(a.eff)Object.assign(eff,a.eff);
 const base={dmg,cause,owner:e,tele,act,eff:Object.keys(eff).length?eff:null};
 switch(g.forme){
 case'arc':danger(Object.assign({shape:'arc',x:e.x,y:e.y,dir,half:(g.ang||120)*Math.PI/360,r:(g.r||3)*M,suitOwner:1,fx:h=>G.fx.push({k:'frappe',x:h.x,y:h.y,a:h.dir,r:h.r,t:0,dur:.2,col:'#ffdada',big:1})},base));sfx('slash');break;
 case'ligne':{const n=g.n||1;if(n>1&&/miroirs|depuis/.test(g.txt||'')){for(let i=0;i<n;i++){const aa=i/n*TAU,sx=P.x+Math.cos(aa)*7*M,sy=P.y+Math.sin(aa)*7*M;danger(Object.assign({shape:'ligne',x:sx,y:sy,dir:Math.atan2(P.y-sy,P.x-sx),len:14*M,w:(g.w||1)*M},base));}}
  else for(let i=0;i<n;i++){const off=n>1?(i-(n-1)/2)*.35:0;danger(Object.assign({shape:'ligne',x:e.x,y:e.y,dir:dir+off,len:(g.len||12)*M,w:(g.w||1.2)*M,retour:g.retour},base));}break;}
 case'sinus':danger(Object.assign({shape:'sinus',x:e.x,y:e.y,dir,len:(g.len||14)*M,w:(g.w||1)*M,amp:(g.amp||1)*M},base,{act:Math.max(1.2,act)}));break;
 case'cercle':{const n=g.n||1;for(let i=0;i<n;i++){const cx=g.centre==='boss'?e.x:P.x+(i?(G.rL()-.5)*7*M:0),cy=g.centre==='boss'?e.y:P.y+(i?(G.rL()-.5)*7*M:0);
  const derriere=/derrière le joueur/.test(g.txt||'');danger(Object.assign({shape:derriere?'croix':'cercle',x:derriere?P.x-P.fx*1.5*M:cx,y:derriere?P.y-P.fy*1.5*M:cy,r:(g.r||2)*M,suit:g.suit||0,suitOwner:g.centre==='boss',persist:g.persist?1:0},base,
   {tele:tele+(g.grandit||0)*.5+i*.25,act:g.persist||act,onAct:derriere?h=>{smoke(e.x,e.y,6);e.x=h.x;e.y=h.y;smoke(e.x,e.y,6);}:null}));}if(/derrière/.test(g.txt||''))sfx('cue');break;}
 case'tir':{const n=g.n||1;for(let i=0;i<n;i++){const aa=dir+(n>1?(i-(n-1)/2)*.4:0);setTimeout0(tele*.6+i*.08,()=>{if(!e.dead)eTir(e.x,e.y,n>1?aa:Math.atan2(P.y-e.y,P.x-e.x),{dmg,v:g.vit||8,life:2.2,cause,expl:(g.r||2)*M,homing:g.chercheur?Math.PI/2:0,k:'orbe'});});}
  danger({shape:'ligne',x:e.x,y:e.y,dir,len:4*M,w:1.2*M,tele:tele*.6,act:.05,cause,owner:e});break;}
 case'eventail':{const n=g.n||5,ang=(g.ang||60)*Math.PI/180;danger({shape:'arc',x:e.x,y:e.y,dir,half:ang/2,r:(g.port||9)*M,tele,act:.05,cause,owner:e,onAct:()=>{for(let i=0;i<n;i++)eTir(e.x,e.y,dir-ang/2+ang*i/Math.max(1,n-1),{dmg,v:11,life:(g.port||9)/11,cause,k:'aiguille',eff:base.eff});}});break;}
 case'etoile':{const cx=/au-dessus du joueur|Sphère/.test(g.txt||'')?P.x:e.x,cy=/au-dessus du joueur|Sphère/.test(g.txt||'')?P.y:e.y;danger(Object.assign({shape:'etoile',x:cx,y:cy,dir:G.rL()*TAU,n:g.n||8,len:(g.len||7)*M,w:(g.w||1)*M},base));break;}
 case'mur':{const br=[];for(let i=0;i<(g.breches||2);i++)br.push((G.rL()-.5)*((g.w||16)-4)*M);danger(Object.assign({shape:'mur',x:e.x,y:e.y,dir,w:(g.w||16)*M,len:(g.len||12)*M,breches:br},base,{act:Math.max(1.2,act)}));break;}
 case'arene':{const n=g.sures||3,s=[];for(let i=0;i<n;i++){const aa=G.rL()*TAU,r=3*M+G.rL()*2.5*M;s.push({x:clamp(P.x+Math.cos(aa)*r,30,G.map.w-30),y:clamp(P.y+Math.sin(aa)*r,30,G.map.h-30),r:(g.r||2.5)*M});}
  danger(Object.assign({shape:'arene',x:P.x,y:P.y,R:g.R?g.R*M:0,sures:s},base,{tele:Math.max(tele,1.5)}));break;}
 case'grille':danger(Object.assign({shape:'grille',x:P.x,y:P.y,cell:2*M,pair:G.rL()<.5?0:1,R:14*M},base,{tele:Math.max(tele,1.4)}));break;
 case'soi':if(g.soin){e.soin=g.soin;e.dmgPendant=0;}if(g.renvoi)e.reflect=G.time+tele+1.5;fxRing(e.x,e.y,2*M,g.soin?'#7ad04a':'#ffffff');break;}
 if(!second){e.state='attaque';e.t=tele+act;}
 const v=a.nom&&e.vulnTxt.match(new RegExp(a.nom.split(/[ —(]/)[0].slice(0,6)+'[^+]*\\+(\\d+) %\\s*(\\d+(?:,\\d+)?)?','i'));
 if(v&&/lancer|recharge|toux|canalis|désarm/i.test(e.vulnTxt))setTimeout0(tele,()=>addVuln(e,+v[1]/100,v[2]?+v[2].replace(',','.'):2));}
function finBoss(e){for(const a of e.adds)if(!a.dead)a.dead=true;
 if(e.lieut&&!e.clone){G.coffres.push({x:e.x,y:e.y,t:0,type:'lieutenant'});G.lieutenant=null;return;}
 if(e.clone)return;G.bossVaincus.push(e.id);G.boss=null;G.brume=0;
 if(G.mode==='BossRush'){G.rushIdx++;if(G.rushIdx>=G.rush.length){finRun(true,'');}else{G.rushPause=3;G.pending+=3;}return;}
 if(G.mode==='Endless'){G.coffres.push({x:e.x,y:e.y,t:0,type:'lieutenant'});return;}
 finRun(true,'');}
