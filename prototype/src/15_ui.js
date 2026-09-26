// Interface : écrans de menu (§B2.3) et écrans de combat (niveau, coffre, rouleau, pause, build, fin).
const UI={scr:'titre',sel:{chr:'CHR_001',map:'MAP_002',mode:'Standard',rang:'C'},scroll:{},tab:{arch:'Personnages',mis:'Tous',archSel:{}},draft:null,conf:null,msg:null,t:0};
let ZONES=[],LISTES=[];
function zone(x,y,w,h,act,hover){ZONES.push({x,y,w,h,act,hover});}
function panel(x,y,w,h,col,fond){ctx.fillStyle=fond||'#141821';ctx.fillRect(x,y,w,h);ctx.strokeStyle=col||'#3a4152';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,w-1,h-1);}
function bouton(label,x,y,w,h,act,hot,off){panel(x,y,w,h,off?'#2a2f3a':hot?'#ffd23f':'#5a6275',off?'#101218':'#171b25');txt(label,x+w/2,y+(h-8)/2,7,off?'#5a6070':'#ffffff','center',1,false);if(!off)zone(x,y,w,h,()=>{sfx('menu');act();});}
function onglets(noms,cur,x,y,w,set){const bw=Math.floor(w/noms.length);noms.forEach((n,i)=>{const on=n===cur;panel(x+i*bw,y,bw-2,13,on?'#ffd23f':'#3a4152',on?'#2a2a18':'#141821');txt(n,x+i*bw+(bw-2)/2,y+3,6,on?'#ffd23f':'#c8ccd4','center',on,false);zone(x+i*bw,y,bw-2,13,()=>{set(n);sfx('menu');});});}
// Liste défilante générique : items [{t, sub, col, id}] ; sélection par clic ; molette et glisser.
function liste(key,x,y,w,h,items,selId,onSel,lh){lh=lh||12;const tot=items.length*lh;let sc=UI.scroll[key]||0;sc=clamp(sc,0,Math.max(0,tot-h));UI.scroll[key]=sc;LISTES.push({key,x,y,w,h,tot});
 panel(x,y,w,h,'#2a303c','#10131a');ctx.save();ctx.beginPath();ctx.rect(x+1,y+1,w-2,h-2);ctx.clip();
 const i0=Math.floor(sc/lh);for(let i=i0;i<Math.min(items.length,i0+Math.ceil(h/lh)+1);i++){const it=items[i],yy=y+i*lh-sc;const on=it.id===selId;if(on){ctx.fillStyle='#2a3044';ctx.fillRect(x+1,yy,w-2,lh);}
  if(it.pre)it.pre(x+3,yy);txt(it.t,x+(it.pre?16:4),yy+2,6,it.col||(on?'#ffffff':'#c8ccd4'),'left',on,false);if(it.sub)txt(it.sub,x+w-4,yy+2,6,it.subCol||'#7a8090','right',false,false);
  if(yy+lh>y&&yy<y+h)zone(x,Math.max(y,yy),w-6,Math.min(lh,y+h-yy),()=>{onSel(it.id,i);sfx('menu');});}
 ctx.restore();if(tot>h){const bh=Math.max(10,h*h/tot),by=y+(h-bh)*(sc/(tot-h));ctx.fillStyle='#3a4152';ctx.fillRect(x+w-4,by,3,bh);}}
function detail(x,y,w,h,lignes){panel(x,y,w,h,'#2a303c','#10131a');const key='det'+UI.scr+(UI.tab.arch||'');let sc=UI.scroll[key]||0;
 ctx.save();ctx.beginPath();ctx.rect(x+1,y+1,w-2,h-2);ctx.clip();let yy=y+5-sc;
 for(const L of lignes){if(!L)continue;if(L.h){yy+=2;txt(L.h,x+6,yy,L.size||8,L.col||'#ffd23f','left',1,false);yy+=(L.size||8)+4;continue;}
  const lab=L.l?L.l+' : ':'';for(const s of wrap(lab+(L.v===undefined||L.v===null||L.v===''?'—':L.v),w-14,L.size||6)){txt(s,x+6,yy,L.size||6,L.col||'#d8dce4','left',false,false);yy+=(L.size||6)+2;}yy+=2;}
 ctx.restore();const tot=yy+sc-y;UI.scroll[key]=clamp(sc,0,Math.max(0,tot-h+6));LISTES.push({key,x,y,w,h,tot:tot+6});}
function entete(titre,sous){ctx.fillStyle='#0d0f14';ctx.fillRect(0,0,W,H);txt(titre,12,8,11,'#f28a1e','left',1);if(sous)txt(sous,12,22,6,'#9aa0aa');txt(`${SAVE.ryo} Ryō`,W-12,10,8,'#ffd23f','right',1);}
function retour(dest){bouton('← Retour',W-80,H-22,70,16,()=>{UI.scr=dest||'village';});}

// ---------- écrans
const ECRANS={
 titre(){ctx.fillStyle='#0d0f14';ctx.fillRect(0,0,W,H);for(let i=0;i<50;i++){ctx.fillStyle='#161a22';ctx.fillRect((i*97)%W,(i*53)%H,2,2);}
  ninja(W/2-150,150,palPerso('Naruto'),1,Math.floor(G.rt*3)&1,4);ninja(W/2-200,140,palPerso('Sasuke'),1,Math.floor(G.rt*3+1)&1,3);ninja(W/2-100,140,palPerso('Sakura'),1,0,3);
  bete(W/2+170,170,96,couleurBete('Kurama'),-1,G.rt,9,'Kurama');
  txt('NARUTO : SHINOBI SURVIVORS',W/2,24,16,'#f28a1e','center',1);txt('Jeu construit à partir du dossier de conception · projet de fans non officiel',W/2,46,7,'#c8ccd4','center');
  txt(`${DATA.personnages.length} entrées jouables · ${DATA.techniques.length} techniques · ${DATA.evolutions.length} évolutions · ${DATA.cartes.length} cartes · ${DATA.boss.length} boss · ${DATA.ennemis.length} ennemis · ${DATA.missions.length} missions`,W/2,60,6,'#9aa0aa','center');
  if(Math.floor(G.rt*2)%2===0)txt('Entrée, Espace, clic ou toucher pour entrer au village',W/2,H-60,8,'#ffd23f','center',1);
  if(innerHeight>innerWidth)txt('Astuce : tournez l’appareil en mode paysage.',W/2,H-44,7,'#7ff0ff','center');
  txt('Sprites provisoires (PH) · valeurs et règles issues du dossier (data/*.yaml)',W/2,H-14,6,'#6a7080','center');zone(0,0,W,H,()=>{UI.scr='village';});},
 village(){entete('Village caché','Hub : choisissez une activité');const c=DATA.couverture;
  const opts=[['Lancement rapide',()=>{const d=SAVE.dernier;if(d&&debloque(d.chr)&&carteDebloquee(d.map)){Object.assign(UI.sel,d);lancer();}else UI.scr='selection';},!SAVE.dernier],
   ['Jouer',()=>{UI.scr='selection';}],['Missions',()=>{UI.scr='missions';}],['Archives',()=>{UI.scr='archives';}],['Boutique et maîtrise',()=>{UI.scr='boutique';}],['Secrets',()=>{UI.scr='secrets';}],['Options',()=>{UI.scr='options';}]];
  opts.forEach(([l,f,off],i)=>bouton(l,16,40+i*24,150,19,f,i===1,off));
  const nb=o=>Object.keys(o).length;const lignes=[{h:'Profil'},{l:'Ryō',v:SAVE.ryo},{l:'Runs',v:SAVE.stats.runs+' (victoires : '+SAVE.stats.victoires+')'},{l:'Temps de jeu',v:mmss(SAVE.stats.temps)},
   {l:'Entrées débloquées',v:(OPT.toutDebloque?DATA.personnages.length:SAVE.entrees.length)+' / '+DATA.personnages.length},{l:'Cartes débloquées',v:(OPT.toutDebloque?20:SAVE.cartes.length)+' / 20'},
   {l:'Missions réussies',v:nb(SAVE.missions)+' / 200'},{l:'Secrets',v:SAVE.secrets.length+' / 60'},{l:'Recettes réalisées',v:SAVE.recettes.length+' / 120'},{l:'Synergies découvertes',v:SAVE.syn.length+' / 80'},
   {h:'Ce que cette version simule'},{v:`Toutes les entrées du catalogue sont jouables. Les 320 techniques passent par 12 comportements de livraison génériques paramétrés par leurs valeurs (${c.techniques.fiche} avec leur table de 8 niveaux, les autres avec un barème générique documenté) ; 4 techniques de la tranche verticale ont un code sur mesure.`},
   {v:`Boss : ${40-c.boss.kit_generique} exécutent leurs attaques du dossier, ${c.boss.kit_generique} (fiches d'identité) reçoivent un kit générique tiré de leur mécanique. Missions suivies automatiquement : ${DATA.missions.filter(missionSuivie).length} / 200.`},
   {v:'Sprites et sons provisoires. Le mode Entraînement, les doctrines, les cosmétiques et le déplacement physique au village ne sont pas implémentés.',col:'#9aa0aa'}];
  detail(180,40,W-196,H-60,lignes);},
 selection(){entete('Sélection du personnage','Flèches ou clic ; Entrée pour choisir la carte');const L=DATA.personnages,cols=16,cw=38,ch=26,x0=8,y0=34;
  L.forEach((p,i)=>{const x=x0+(i%cols)*cw,y=y0+Math.floor(i/cols)*ch,on=UI.sel.chr===p.id,ok=debloque(p.id);panel(x,y,cw-2,ch-2,on?'#ffd23f':p.prioritaire?'#5a6275':'#2a303c',on?'#23283a':'#12151c');
   if(ok)ninja(x+cw/2-1,y+ch-5,palPerso(p.nom),1,0,1);else{ctx.globalAlpha=.35;ninja(x+cw/2-1,y+ch-5,solid('#5a6070'),1,0,1);ctx.globalAlpha=1;txt('🔒',x+cw-10,y+2,6,'#9aa0aa','left',false,false);}
   if(p.type==='VARIANTE')txt('V',x+3,y+2,6,'#b8bcc8','left',1,false);zone(x,y,cw-2,ch-2,()=>{if(UI.sel.chr===p.id&&ok)UI.scr='carte';UI.sel.chr=p.id;sfx('menu');});});
  const p=CHR[UI.sel.chr],ok=debloque(p.id),apt=aptitudes(p),pool=DATA.techniques.filter(t=>accesOk(t.acces,apt)).length;
  const d=p.deblocage,cond=d.type==='DEPART'?'Disponible dès le départ':d.type==='PREMIERE_RUN'?'Terminer une run après 03:00':d.type==='MAITRISE'?`Maîtrise ${d.niveau} avec ${nomCourt(CHR[p.base]?CHR[p.base].nom:'')} (${d.ref})`:`Mission ${d.ref} : ${MIS[d.ref]?MIS[d.ref].condition:''}`;
  detail(8,y0+5*ch+4,W-16,H-(y0+5*ch)-30,[{h:`${p.nom} · ${p.id}${p.prioritaire?' · prioritaire':''}`,size:8},{l:'Identité',v:p.identite},
   {l:'Statistiques',v:`${p.stats.pv} PV · ${fr(p.stats.depl,1)} m/s${p.stats.notes&&p.stats.notes!=='—'?' · '+p.stats.notes:''}`},{l:'Technique de départ',v:T[p.depart]?T[p.depart].nom+' ('+p.depart+')':p.depart},
   {l:'Passif exclusif (CPX)',v:p.cpx.nom+' : '+p.cpx.effet},{l:'Signature',v:p.signature},{l:'Faiblesse',v:p.faiblesse},{l:'Ultime',v:ULTD[p.ultime]?ULTD[p.ultime].nom:p.ultime},
   {l:'Transformations',v:(p.transformations||[]).map(t=>TRFD[t]?TRFD[t].nom:t).join(', ')||'aucune (Maîtrise de l’ultime : chakra +30 %, second effet)'},{l:'Aptitudes',v:(p.aptitudes||[]).join(', ')},
   {l:'Pool',v:`${pool} techniques admissibles (échantillonné à 40 au maximum en run)`},{l:'Maîtrise',v:'niveau '+maitrise(p.id)},{l:'Déblocage',v:ok?'débloqué':cond,col:ok?'#8fd14f':'#ffb040'}]);
  bouton('Choisir la carte →',W-170,H-22,86,16,()=>{UI.scr='carte';},true,!ok);retour();},
 carte(){entete('Carte, mode et rang',CHR[UI.sel.chr].nom);const items=DATA.cartes.map(m=>({id:m.id,t:m.nom,sub:carteDebloquee(m.id)?m.id:'🔒',col:carteDebloquee(m.id)?null:'#6a7080'}));
  liste('cartes',8,34,190,H-60,items,UI.sel.map,id=>{UI.sel.map=id;});const m=MAP[UI.sel.map],ok=carteDebloquee(m.id);
  const sec=DATA.secrets.find(s=>s.carte===m.id&&/^SEC_0[01]\d$|^SEC_020$/.test(s.id));const niv=sec?niveauIndice(sec):0;
  detail(204,34,W-212,H-148,[{h:m.nom+' · '+m.id,size:8},{l:'Tracé',v:m.trace},{l:'Taille',v:m.taille},{l:'Palette',v:m.palette},{l:'Obstacles',v:m.obstacles},{l:'Ressources',v:m.ressources},
   {l:'Ennemis',v:(m.ennemis||[]).map(e=>ENM[e]?ENM[e].nom:e).join(', ')},{l:'Événement',v:m.evenement},{l:'Boss',v:BOS[m.boss]?BOS[m.boss].nom:m.boss},
   {l:'Lieutenants',v:(m.boss_secondaires||[]).map(b=>BOS[b]?BOS[b].nom:b).join(', ')},{l:'Contrainte',v:m.contrainte},
   {l:'Secret',v:sec?(SAVE.secrets.includes(sec.id)?'trouvé : '+sec.nom:niv>=3?sec.condition:niv>=2?'Une stèle scintille quelque part sur la carte.':sec.indices[0]):'—'},{l:'Déblocage',v:ok?'débloquée':'par une mission de scénario',col:ok?'#8fd14f':'#ffb040'}]);
  const my=H-110;txt('Mode',204,my,7,'#ffd23f','left',1);Object.keys(MODES).forEach((k,i)=>{const on=UI.sel.mode===k;bouton(MODES[k].nom,204+i*84,my+10,80,15,()=>{UI.sel.mode=k;},on);});
  txt(MODES[UI.sel.mode].desc,204,my+28,6,'#9aa0aa');txt('Rang',204,my+40,7,'#ffd23f','left',1);RANG_ORDRE.forEach((r,i)=>{bouton(r,240+i*34,my+37,30,14,()=>{UI.sel.rang=r;},UI.sel.rang===r);});
  const R=RANGS[UI.sel.rang];txt(`PV ennemis ×${fr(R.pv,2)} · dégâts ×${fr(R.dg,2)}`,450,my+41,6,'#9aa0aa');
  bouton(UI.sel.mode==='Draft'?'Draft →':'Lancer la run',W-170,H-22,86,16,()=>{if(UI.sel.mode==='Draft')preparerDraft();else lancer();},true,!ok);retour('selection');},
 draft(){entete('Draft','Choisissez 6 techniques parmi 12 (la technique de départ est incluse) ; aucune nouvelle technique en jeu');const d=UI.draft;
  d.ids.forEach((id,i)=>{const t=T[id],x=12+(i%4)*156,y=36+Math.floor(i/4)*84,on=d.pris.includes(id),fixe=id===CHR[UI.sel.chr].depart;panel(x,y,150,78,on?'#ffd23f':techCol(t),on?'#23283a':'#12151c');
   txt(t.nom.slice(0,34),x+5,y+4,6,'#fff','left',1,false);txt(`${id} · ${LIV_NOM[t.livraison]} · ${FAM_NOM[t.famille]}`,x+5,y+13,6,'#9aa0aa','left',false,false);para(t.comportement,x+5,y+23,140,6,'#c8ccd4',8,5);
   if(fixe)txt('départ',x+145,y+4,6,'#ffd23f','right',1,false);zone(x,y,150,78,()=>{if(fixe)return;if(on)d.pris=d.pris.filter(z=>z!==id);else if(d.pris.length<6)d.pris.push(id);sfx('menu');});});
  bouton(`Lancer (${d.pris.length}/6)`,W-170,H-22,86,16,()=>lancer(d.pris),true,d.pris.length<1);retour('carte');},
 archives(){entete('Archives','Tout le catalogue du dossier ; les paramètres lus par le moteur sont indiqués');const tabs=['Personnages','Techniques','Évolutions','Synergies','Passifs','Équipements','Transfo.','Ultimes','Cartes','Boss','Ennemis','Builds','Couverture'];
  onglets(tabs,UI.tab.arch,8,32,W-16,n=>{UI.tab.arch=n;});archivesContenu(UI.tab.arch);retour();},
 missions(){entete('Missions',`${Object.keys(SAVE.missions).length} / 200 réussies · ${DATA.missions.filter(missionSuivie).length} suivies automatiquement`);
  const types=['Tous','scenario','recrutement','expert','defi_clan','defi_element','systeme','maitrise','expedition','boss_rush','draft','endless','hors_chrono'];
  onglets(types.map(t=>t==='Tous'?t:t.replace('defi_','défi ').replace('_',' ').slice(0,10)),UI.tab.mis==='Tous'?'Tous':UI.tab.mis.replace('defi_','défi ').replace('_',' ').slice(0,10),8,32,W-16,n=>{UI.tab.mis=types.find(t=>(t==='Tous'?t:t.replace('defi_','défi ').replace('_',' ').slice(0,10))===n);});
  const L=DATA.missions.filter(m=>UI.tab.mis==='Tous'||m.type===UI.tab.mis);const sel=UI.tab.misSel||L[0].id;
  liste('mis'+UI.tab.mis,8,50,250,H-76,L.map(m=>({id:m.id,t:m.id.slice(4)+' '+m.nom,sub:SAVE.missions[m.id]?'✓':!m.dependances.every(d=>SAVE.missions[d])?'🔒':missionSuivie(m)?'':'·',subCol:SAVE.missions[m.id]?'#8fd14f':'#7a8090',col:SAVE.missions[m.id]?'#8fd14f':null})),sel,id=>{UI.tab.misSel=id;},11);
  const m=MIS[sel]||L[0];if(!m)return;const p=progresMission(m),dep=m.dependances.every(d=>SAVE.missions[d]);
  detail(264,50,W-272,H-100,[{h:m.nom+' · '+m.id,size:8},{l:'Condition',v:m.condition},{l:'Type',v:m.type},{l:'Mode',v:m.mode},{l:'Carte',v:MAP[m.carte]?MAP[m.carte].nom:m.carte||'toutes'},
   {l:'Personnage',v:m.personnage==='TOUS'?'tous':CHR[m.personnage]?CHR[m.personnage].nom:m.personnage},{l:'Rang',v:m.rang},{l:'Récompenses',v:`${m.recompenses.ryo||0} Ryō${(m.recompenses.deblocages||[]).length?' · débloque '+m.recompenses.deblocages.map(d=>CHR[d]?CHR[d].nom:MAP[d]?MAP[d].nom:d).join(', '):''}${m.recompenses.autres&&m.recompenses.autres!=='—'?' · '+m.recompenses.autres:''}`},
   {l:'Dépendances',v:m.dependances.join(', ')||'aucune',col:dep?null:'#ffb040'},{l:'Suivi',v:missionSuivie(m)?(p?`automatique (${Math.min(p[0],p[1])} / ${p[1]})`:'automatique (vérifié en fin de run)'):'non suivi automatiquement dans cette version',col:missionSuivie(m)?'#8fd14f':'#ffb040'},
   {l:'État',v:SAVE.missions[m.id]?'réussie':'à faire',col:SAVE.missions[m.id]?'#8fd14f':null}]);
  bouton('Lancer cette mission',264,H-44,120,16,()=>lancerMission(m),true,!dep);retour();},
 secrets(){entete('Secrets',`${SAVE.secrets.length} / 60 découverts`);const sel=UI.tab.secSel||'SEC_001';
  liste('sec',8,34,250,H-60,DATA.secrets.map(s=>({id:s.id,t:s.id.slice(4)+' '+(SAVE.secrets.includes(s.id)?s.nom:(s.type==='obscur'?'Énigme obscure':'Secret')),sub:SAVE.secrets.includes(s.id)?'✓':secretSuivi(s)?'':'·',col:SAVE.secrets.includes(s.id)?'#8fd14f':null})),sel,id=>{UI.tab.secSel=id;},11);
  const s=SEC[sel],trouve=SAVE.secrets.includes(s.id),niv=s.carte?niveauIndice(s):1;
  detail(264,34,W-272,H-60,[{h:trouve?s.nom:'Secret non découvert',size:8},{l:'Type',v:s.type==='obscur'?'obscur (2 indices, récompense cosmétique)':'guidé (3 indices progressifs)'},{l:'Carte',v:MAP[s.carte]?MAP[s.carte].nom:'—'},
   {l:'Indices',v:(s.indices||[]).slice(0,trouve?3:niv).join(' / ')},{l:'Condition',v:trouve||niv>=3?s.condition:'(révélée après 6 runs sur la carte)'},{l:'Récompense',v:trouve?s.recompense:'?'},
   {l:'Suivi',v:secretSuivi(s)?(s.carte&&/^SEC_0[01]\d$|^SEC_020$/.test(s.id)?'stèle cachée sur la carte : restez 2 s dessus (condition simplifiée)':'automatique'):'non suivi dans cette version',col:secretSuivi(s)?'#8fd14f':'#ffb040'}]);retour();},
 boutique(){entete('Boutique et maîtrise','Achats permanents en Ryō (§D7) ; la maîtrise se gagne en jouant chaque personnage');
  BOUTIQUE.forEach((b,i)=>{const n=niveauAchat(b),y=36+i*30,max=n>=b.couts.length;panel(8,y,W/2-12,26,'#3a4152');txt(b.nom+` (${n}/${b.couts.length})`,14,y+4,7,'#fff','left',1,false);txt(b.desc,14,y+14,6,'#9aa0aa','left',false,false);
   bouton(max?'Maximum':`${b.couts[n]} Ryō`,W/2-80,y+5,64,16,()=>{if(!acheter(b))UI.msg={t:'Ryō insuffisants',u:G.rt};},false,max||SAVE.ryo<b.couts[Math.min(n,b.couts.length-1)]);});
  const L=DATA.personnages.filter(p=>p.type==='BASE').map(p=>({id:p.id,t:nomCourt(p.nom),sub:'maîtrise '+maitrise(p.id)}));liste('mait',W/2+4,36,W/2-12,H-62,L,null,()=>{},11);retour();},
 options(){entete('Options et assistance','Les aides sont signalées dans l’écran de résultat ; les missions expertes les refusent (§B1.6)');const A=SAVE.assist;
  const tg=(l,get,set,y,x)=>{bouton((get()?'☑ ':'☐ ')+l,x||12,y,300,15,()=>{set(!get());ecrireSave();});};
  tg('Son',()=>OPT.son,v=>OPT.son=v,36);tg('Clignotement pendant l’invulnérabilité',()=>OPT.clignotement,v=>OPT.clignotement=v,54);tg('Chiffres de dégâts',()=>OPT.degatsTexte,v=>OPT.degatsTexte=v,72);
  tg('Télégraphes renforcés (+30 %)',()=>OPT.telegraphes,v=>OPT.telegraphes=v,90);tg('PV d’assistance (+50 %)',()=>A.pv,v=>A.pv=v,112);tg('Choix automatique des cartes',()=>A.auto,v=>A.auto=v,130);
  tg('Ralentissement (80 %)',()=>A.ralenti,v=>A.ralenti=v,148);tg('Transformation manuelle uniquement (R)',()=>A.trfManuel,v=>A.trfManuel=v,166);
  tg('Mode découverte : tout débloquer (personnages et cartes)',()=>OPT.toutDebloque,v=>OPT.toutDebloque=v,190);
  bouton('Effacer la sauvegarde',12,H-44,140,16,()=>{UI.conf={t:'Effacer toute la progression ?',ok:()=>{try{localStorage.removeItem(CLE_SAVE);localStorage.removeItem(CLE_SAVE+'.bak');}catch(e){}chargerSave();}};});retour();},
};
function archivesContenu(tab){const x=8,y=48,lw=220,h=H-74;const sel=UI.tab.archSel[tab];let items=[],getD=()=>[];
 const mk=(L,t,sub,det)=>{items=L.map(e=>({id:e.id,t:t(e),sub:sub?sub(e):e.id}));getD=det;};
 switch(tab){
 case'Personnages':mk(DATA.personnages,p=>nomCourt(p.nom)+(p.type==='VARIANTE'?' — '+p.nom.split(' — ')[1]:''),null,p=>[{h:p.nom},{l:'Identité',v:p.identite},{l:'Stats',v:p.stats.pv+' PV, '+p.stats.depl+' m/s, '+(p.stats.notes||'')},{l:'Départ',v:T[p.depart].nom},{l:'CPX',v:p.cpx.nom+' : '+p.cpx.effet},{l:'Signature',v:p.signature},{l:'Faiblesse',v:p.faiblesse},{l:'Aptitudes',v:p.aptitudes.join(', ')},{l:'Ultime',v:ULTD[p.ultime]&&ULTD[p.ultime].nom},{l:'Transformations',v:(p.transformations||[]).join(', ')},{l:'Orientations',v:(p.orientations||[]).join(' ; ')},{l:'Simulation du CPX',v:p.id==='CHR_001'?'codée (clones et Rasengan)':Object.keys(p.scpx||{}).length||Object.keys(p.s||{}).length?'bonus chiffrés appliqués ; le reste est descriptif':'descriptif (non simulé)',col:'#ffb040'}]);break;
 case'Techniques':mk(DATA.techniques,t=>t.nom,t=>t.id.slice(4)+' '+t.famille.slice(0,4),t=>{const I=mkInst(t.id);const lv=[];for(let l=1;l<=8;l++){lv.push({v:`Niv. ${l} : ${niveauTexte(I,l)}`});}
  return[{h:t.nom+' · '+t.id},{l:'Statut',v:{OA:'œuvre adaptée',CO:'création originale',AV:'à vérifier'}[t.statut]||t.statut},{l:'Famille',v:FAM_NOM[t.famille]},{l:'Livraison',v:LIV_NOM[t.livraison]},{l:'Ciblage',v:t.cible},{l:'Tags',v:t.tags.join(', ')},{l:'Accès',v:t.acces},
   {l:'Comportement',v:t.comp},{l:'Valeurs',v:t.val},{l:'Limites',v:t.lim},{h:'Niveaux',size:7},...lv,{h:'Lu par le moteur',size:7},{v:I.hook?'Crochet sur mesure ('+I.hook+')':techSum(I),col:'#7ff0ff'}];});break;
 case'Évolutions':mk(DATA.evolutions,e=>e.nom,e=>e.id.slice(4)+' '+e.type.slice(0,3),e=>[{h:e.nom+' · '+e.id},{l:'Type',v:e.type},{l:'Sources',v:e.src.map(s=>(T[s]||EVO[s]||{nom:s}).nom+' ('+s+')').join(' + ')},{l:'Catalyseurs',v:e.cata.map(c=>(PASD[c]||EQPD[c]||{nom:c}).nom+' ('+c+')').join(', ')||'aucun'},{l:'Condition tardive',v:e.tard},{l:'Comportement',v:e.comp},{l:'Valeurs',v:e.val},{l:'Limites',v:e.lim},{l:'Réalisée',v:SAVE.recettes.includes(e.id)?'oui':'non'}]);break;
 case'Synergies':mk(DATA.synergies,s=>s.nom,null,s=>[{h:s.nom+' · '+s.id},{l:'Références',v:s.references.join(', ')},{l:'Condition',v:s.condition},{l:'Effet',v:s.effet},{l:'Limite',v:s.limite},{l:'Plafond',v:s.plafond},{l:'Compatibilité',v:s.compatibilite},{l:'Contrepartie',v:s.contrepartie},{l:'Manifestation',v:s.manifestation},{l:'Découverte',v:SAVE.syn.includes(s.id)?'oui':'non'},{l:'Simulation',v:'générique : déclenchement selon les références (tags, états, surfaces), effet classé (arcs, explosion, bonus de dégâts, cumuls d’états)',col:'#ffb040'}]);break;
 case'Passifs':mk(DATA.passifs,p=>p.nom,null,p=>[{h:p.nom+' · '+p.id},{l:'Statistique',v:p.stat},{l:'Par niveau',v:p.txt},{l:'S’applique à',v:p.filtre.join(', ')},{l:'Accès',v:p.acces},{l:'Simulation',v:'codée (tableau PASFX)',col:'#8fd14f'}]);break;
 case'Équipements':mk(DATA.equipements,e=>e.nom,e=>e.rar.slice(0,3),e=>[{h:e.nom+' · '+e.id},{l:'Rareté',v:e.rar},{l:'Rôle',v:e.role},{l:'Effet',v:e.txt},{l:'Contrainte',v:e.contr},{l:'Accès',v:e.acces},{l:'Simulation',v:'codée (tableau EQPFX)',col:'#8fd14f'}]);break;
 case'Transfo.':mk(DATA.transformations,t=>t.nom,null,t=>[{h:t.nom+' · '+t.id},{l:'Accès',v:t.acces.join(', ')},{l:'Obtention',v:t.obt},{l:'Durée / recharge',v:t.dur+' s / '+(t.rech>999?'une fois':t.rech+' s')},{l:'Coût',v:t.cout},{l:'Déclenchement',v:t.auto},{l:'Statistiques',v:t.stats},{l:'Comportements',v:t.comp},{l:'Limites',v:t.lim},{l:'Fin',v:t.fin},{l:'Aura',v:t.aura}]);break;
 case'Ultimes':mk(DATA.ultimes,u=>u.nom,null,u=>[{h:u.nom+' · '+u.id},{l:'Utilisateurs',v:u.users.map(c=>CHR[c]?nomCourt(CHR[c].nom):c).join(', ')},{l:'Effet',v:u.effet},{l:'Valeurs',v:u.val},{l:'À vide',v:u.vide},{l:'Maîtrise',v:u.maitrise},{l:'Lu par le moteur',v:`${u.p.n} × ${u.p.d} (r ${u.p.r} m)`,col:'#7ff0ff'}]);break;
 case'Cartes':mk(DATA.cartes,m=>m.nom,null,m=>[{h:m.nom+' · '+m.id},{l:'Tracé',v:m.trace},{l:'Taille',v:m.taille},{l:'Palette',v:m.palette},{l:'Obstacles',v:m.obstacles},{l:'Événement',v:m.evenement},{l:'Boss',v:BOS[m.boss]&&BOS[m.boss].nom},{l:'Ennemis',v:(m.ennemis||[]).map(e=>ENM[e]&&ENM[e].nom).join(', ')},{l:'Contrainte',v:m.contrainte}]);break;
 case'Boss':mk(DATA.boss,b=>b.nom,b=>b.niveau_detail.slice(0,4),b=>[{h:b.nom+' · '+b.id},{l:'Rôle',v:b.role_carte},{l:'PV (dossier)',v:b.pv+' ; en jeu : ×'+BOSS_K.Standard+' en Standard (calibrage de ce moteur)'},{l:'Résistance',v:b.resistance},{l:'Silhouette',v:b.silhouette},{l:'Déplacement',v:b.deplacement},{l:'Mécanique',v:b.mecanique},
  ...(b.phases||[]).map(p=>({l:'Phase '+p.seuil,v:p.changements})),...(b.atk||[]).map(a=>({l:a.nom,v:`${a.g.txt} · avertissement ${a.tele} s · ${a.d} dégâts · lu comme « ${a.g.forme} »`})),{l:'Vulnérabilités',v:b.vulnerabilites},{l:'Contrôle',v:b.controle},{l:'Conclusion',v:b.conclusion},
  {l:'Simulation',v:(b.atk||[]).length?'attaques du dossier':'kit générique d’après la mécanique : '+kitGenerique(b).map(a=>a.nom).join(', '),col:(b.atk||[]).length?'#8fd14f':'#ffb040'}]);break;
 case'Ennemis':mk(DATA.ennemis,e=>e.nom,e=>e.role.slice(0,6)+(e.elite?' ★':''),e=>[{h:e.nom+' · '+e.id},{l:'Rôle',v:e.role},{l:'PV / vitesse / dégâts / XP',v:`${e.pv} / ${e.vitesse} m/s / ${e.degats} / ${e.xp}`},{l:'Comportement',v:e.comportement},{l:'Annonce',v:e.annonce},{l:'Modificateur',v:e.modificateur},{l:'Cartes',v:(e.cartes||[]).join(', ')}]);break;
 case'Builds':mk(DATA.builds,b=>b.nom,b=>b.personnage&&b.personnage.slice(4),b=>[{h:b.nom+' · '+b.id},{l:'Personnage',v:CHR[b.personnage]&&CHR[b.personnage].nom},{l:'Difficulté',v:b.difficulte},{l:'Techniques',v:(b.techniques||[]).map(t=>T[t]?T[t].nom:t).join(', ')},{l:'Passifs',v:(b.passifs||[]).map(p=>PASD[p]?PASD[p].nom:p).join(', ')},{l:'Équipements',v:(b.equipements||[]).join(', ')},{l:'Évolutions',v:(b.evolutions||[]).join(', ')},{l:'Transformation',v:b.transformation},{l:'Ordre',v:b.ordre},{l:'Fenêtre',v:b.fenetre},{l:'Faiblesse',v:b.faiblesse}]);break;
 case'Couverture':{const c=DATA.couverture;items=[{id:'c',t:'Couverture de la simulation'}];getD=()=>[{h:'Ce que le jeu simule, et comment'},{l:'Techniques',v:`320 jouables. 12 comportements génériques (§B5) paramétrés par les valeurs du dossier ; ${c.techniques.fiche} ont leur table de 8 niveaux (fiches), les autres un barème générique (niv. 2 dégâts +15 %, 3 portée +15 %, 4 +1 quantité, 5 dégâts +20 %, 6 délai −15 %, 7 durée +25 % et états +1, 8 dégâts +25 % et +1 quantité). ${c.techniques.sans_degats} techniques sans dégâts (contrôle, bouclier). Crochets sur mesure : Kage Bunshin, Rasengan, Kunai en éventail, EVO_069.`},
  {l:'Évolutions, fusions, éveils',v:'120 recettes vérifiées selon §R11 et obtenues dans les coffres ; la forme évoluée utilise ses propres valeurs.'},{l:'Passifs et équipements',v:'60 + 40 codés un par un (tables PASFX et EQPFX).'},{l:'Transformations',v:'24 : statistiques, durée, recharge, coût, déclenchement automatique et attaques chiffrées lus dans leurs fiches.'},
  {l:'Ultimes',v:'44 : exécuteur générique selon le texte (clones en cercle, frappes ciblées, ligne, zone, vagues, états).'},{l:'Synergies',v:'80 : compatibilité et déclenchement selon leurs références ; effet classé automatiquement.'},{l:'Ennemis',v:'100 : 9 rôles, variantes lues dans le comportement, 25 modificateurs d’élite.'},
  {l:'Boss',v:`${40-c.boss.kit_generique} avec les attaques du dossier (${c.boss.attaques} attaques, ${c.boss.approchees} formes approchées), ${c.boss.kit_generique} avec un kit générique ; PV du dossier ×${BOSS_K.Standard} (calibrage pour ce moteur).`},
  {l:'Méta',v:`Missions suivies : ${DATA.missions.filter(missionSuivie).length} / 200. Secrets suivis : ${DATA.secrets.filter(secretSuivi).length} / 60. Sauvegarde v3 avec migrations v1 → v3 et copie de secours.`},{l:'Non implémenté',v:'Entraînement, doctrines, cosmétiques, reprise de run, déplacement au village, reconfiguration des touches, mutateurs S+ détaillés.',col:'#ffb040'}];break;}}
 const cur=sel||items[0]&&items[0].id;liste('arch'+tab,x,y,lw,h,items,cur,id=>{UI.tab.archSel[tab]=id;UI.scroll['detarchives'+tab]=0;if(!SAVE.archives.includes(id))SAVE.archives.push(id);},11);
 const all={Personnages:CHR,Techniques:T,Évolutions:EVO,Synergies:SYN,Passifs:PASD,Équipements:EQPD,'Transfo.':TRFD,Ultimes:ULTD,Cartes:MAP,Boss:BOS,Ennemis:ENM,Builds:BLD}[tab];
 const e=all?all[cur]:null;detail(x+lw+6,y,W-lw-22,h,e||tab==='Couverture'?getD(e):[]);}

// ---------- lancement
function lancer(draft){const s=UI.sel;if(!debloque(s.chr)||!carteDebloquee(s.map))return;initAudio();newRun({chr:s.chr,map:s.map,mode:s.mode,rang:s.rang,draft,rush:s.mode==='BossRush'?choisirRush(s.map):null});UI.scr='jeu';G.aide=Object.values(SAVE.assist).some(Boolean)||OPT.telegraphes;}
function choisirRush(map){const r=rng(Date.now()&0xffff);const fin=DATA.boss.filter(b=>b.role_carte==='final').map(b=>b.id);const out=[MAP[map].boss];while(out.length<5){const b=fin[Math.floor(r()*fin.length)];if(!out.includes(b))out.push(b);}return out.filter(b=>BOS[b]);}
function preparerDraft(){const chr=CHR[UI.sel.chr];G.seed=Date.now()>>>0;const pool=construirePool(chr,{});const r=rng(G.seed);const ids=[chr.depart,...shuffle(pool.filter(i=>i!==chr.depart),r).slice(0,11)];UI.draft={ids,pris:[chr.depart]};UI.scr='draft';}
function lancerMission(m){const c=m.crit;let chr=UI.sel.chr;if(m.personnage&&m.personnage!=='TOUS'&&debloque(m.personnage))chr=m.personnage;if(c.avec&&debloque(c.avec))chr=c.avec;
 const map=m.carte&&MAP[m.carte]?m.carte:UI.sel.map;const mode={Expedition:'Expedition',BossRush:'BossRush',Draft:'Draft',Endless:'Endless'}[m.mode]||'Standard';
 const rang=c.rang||(RANG_ORDRE.includes(m.rang)?m.rang:'C');let filtre=null;const pm=m.condition.match(/Pool (\w+)(?: \+ (\w+))?/);
 if(pm){const a=pm[1].toUpperCase().replace('Ū','U').replace('FŪTON','FUTON'),b=pm[2];filtre=t=>t.famille===a||t.tags.includes('E_'+a)||(b&&t.famille===b);}
 let boss=null;if(c.type==='vaincre'&&c.boss&&c.boss[0]&&BOS[c.boss[0]]&&!/lieutenant/.test(BOS[c.boss[0]].role_carte))boss=c.boss[0];
 if(!debloque(chr)){UI.msg={t:'Personnage requis non débloqué',u:G.rt};return;}initAudio();
 newRun({chr,map,mode,rang,filtre,boss,rush:mode==='BossRush'?(c.boss&&c.boss.length>1?c.boss:choisirRush(map)):null,mission:m.id});
 if(/Survivre (\d+) min et vaincre/.test(m.condition)){const t=+RegExp.$1*60;G.modeD=Object.assign({},G.modeD,{boss:t,fin:t+240});G.f=t/1200;planifier();}
 if(/(\d+) % PV\)/.test(m.condition))G.bossHpMul=+RegExp.$1/100;UI.scr='jeu';G.aide=Object.values(SAVE.assist).some(Boolean);banner('Mission '+m.id,m.condition,5);}

// ---------- écrans de combat
function ecranNiveau(){ctx.fillStyle='rgba(8,10,14,.8)';ctx.fillRect(0,0,W,H);txt('MONTÉE DE NIVEAU'+(G.pending>1?` (+${G.pending})`:''),W/2,16,12,'#ffd23f','center',1);
 txt(`Niveau ${G.level-G.pending+1} · clic, ou ← → puis Entrée · 1 Relance · 2 Bannir la carte choisie · 3 Passer`,W/2,32,6,'#c8ccd4','center');
 const n=G.cards.length,cw=n>3?148:190,gap=8,x0=(W-(cw*n+gap*(n-1)))/2,y0=44,ch=252;
 G.cards.forEach((k,i)=>{const x=x0+i*(cw+gap),on=i===G.sel;panel(x,y0,cw,ch,on?'#ffffff':k.col);if(on){ctx.strokeStyle=k.col;ctx.strokeRect(x+2.5,y0+2.5,cw-5,ch-5);}
  ctx.fillStyle=k.col;ctx.fillRect(x+1,y0+1,cw-2,12);txt(k.cat.toUpperCase(),x+5,y0+3,6,'#10131a','left',1,false);
  let y=y0+18;for(const l of wrap(k.title,cw-10,8).slice(0,2)){txt(l,x+5,y,8,'#fff','left',1,false);y+=10;}txt(k.sub,x+5,y,6,'#9aa0aa','left',false,false);y+=10;ctx.fillStyle='#2a303c';ctx.fillRect(x+5,y,cw-10,1);y+=4;
  for(const s of k.lines)y=para(s,x+5,y,cw-10,6,'#e8e6e1',8,9)+2;
  if(k.before){txt('Avant',x+5,y,6,'#9aa0aa','left',1,false);y+=8;y=para(k.before,x+5,y,cw-10,6,'#b8bcc6',8,4)+2;}
  if(k.after){txt(k.before?'Après':'Valeurs',x+5,y,6,'#8fd14f','left',1,false);y+=8;y=para(k.after,x+5,y,cw-10,6,'#c7f09a',8,5);}
  zone(x,y0,cw,ch,()=>choisir(i),()=>{G.sel=i;});});
 const by=y0+ch+6;bouton(`1 · Relance (${G.relances})`,W/2-186,by,120,14,relancer,false,G.relances<=0);bouton(`2 · Bannir (${G.bans})`,W/2-60,by,120,14,bannir,false,G.bans<=0);bouton(`3 · Passer (${G.passes})`,W/2+66,by,120,14,passer,false,G.passes<=0);
 if(G.autoT>0){G.autoT-=1/60;txt(`Choix automatique dans ${fr(G.autoT,0)} s`,W/2,by+18,6,'#7ff0ff','center');if(G.autoT<=0){G.luT=-9;choisir(0);}}}
function ecranCoffre(){ctx.fillStyle='rgba(8,10,14,.8)';ctx.fillRect(0,0,W,H);const r=G.coffreRes,w=460,h=190,x=(W-w)/2,y=70;panel(x,y,w,h,r.evo?'#ffd23f':'#ffb040');
 txt(r.titre,W/2,y+10,13,r.evo?'#ffd23f':'#ffb040','center',1);let ty=y+32;for(const s of r.lignes)ty=para(s,x+14,ty,w-28,7,'#e8e6e1',9,4)+3;
 bouton('Continuer (Entrée)',W/2-70,y+h-24,140,16,fermerCoffre,true);}
function fermerCoffre(){if(G.rt-G.luT<.35)return;G.phase='jeu';G.coffreRes=null;P.inv=Math.max(P.inv,.5);CPT_RUN('coffres',1);}
function ecranRouleau(){ctx.fillStyle='rgba(8,10,14,.8)';ctx.fillRect(0,0,W,H);const c=G.choix,inter=c.type==='interdit';
 txt(inter?'ROULEAU INTERDIT':'ROULEAU : choisissez un équipement',W/2,20,12,inter?'#ff6060':'#ffe28a','center',1);
 if(c.remplace!==undefined){txt('Emplacements pleins : quel équipement remplacer ? (l’ancien est perdu)',W/2,40,7,'#ffb040','center');G.eqp.forEach((id,i)=>bouton(`${i+1} · ${EQPD[id].nom}`,W/2-160+i*165,60,155,18,()=>remplacerEqp(i),false));bouton('Annuler',W/2-40,90,80,16,()=>{c.remplace=undefined;c.remplacer=null;});return;}
 const n=c.items.length,cw=180,gap=10,x0=(W-(cw*n+gap*(n-1)))/2,y0=44;
 c.items.forEach((it,i)=>{const x=x0+i*(cw+gap),on=c.sel===i;let titre,lignes=[],col='#e8d8a8',cout='';
  if(it.kind==='eqp'){const d=EQPD[it.id];titre=d.nom;col=d.rar==='Interdit'?'#ff6060':d.rar==='Rare'?'#6ab0f0':'#c8a870';lignes=[d.rar+' · '+d.role,d.txt];cout=d.contr&&d.contr!=='—'?d.contr:'';}
  else if(it.kind==='trf'){const d=TRFD[it.id];titre=d.nom;col='#ff9a3a';lignes=['Transformation · '+d.dur+' s, recharge '+(d.rech>999?'une fois':d.rech+' s'),d.stats,d.comp,'Déclenchement : '+d.auto];cout=d.cout;}
  else{titre='Refuser';col='#9aa0aa';lignes=['Ne rien prendre.'];}
  panel(x,y0,cw,250,on?'#fff':col);ctx.fillStyle=col;ctx.fillRect(x+1,y0+1,cw-2,3);let y=y0+10;for(const l of wrap(titre,cw-10,8).slice(0,2)){txt(l,x+5,y,8,'#fff','left',1,false);y+=10;}y+=4;
  for(const s of lignes)y=para(s,x+5,y,cw-10,6,'#d8dce4',8,7)+3;if(cout){txt('Coût / contrainte',x+5,y+2,6,'#ff6060','left',1,false);para(cout,x+5,y+11,cw-10,6,'#ff9090',8,6);}
  zone(x,y0,cw,250,()=>prendreChoix(i),()=>{c.sel=i;});});}
function ecranPause(){ctx.fillStyle='rgba(8,10,14,.88)';ctx.fillRect(0,0,W,H);txt(UI.build?'BUILD':'PAUSE',W/2,10,13,'#fff','center',1);
 const S=G.st,c=S.cad;const L=[{h:'Techniques'}];for(const I of G.techs)L.push({v:`${I.def.nom} ${I.evo?'('+I.evo.toLowerCase()+')':'niv. '+I.lv} — ${I.hook?HOOK_SUM[I.hook](I):techSum(I)}`});
 L.push({h:'Passifs'});for(const id of G.pasOrder)L.push({v:`${PASD[id].nom} niv. ${G.pas[id]} — ${PASD[id].txt}`});L.push({h:'Équipements'});for(const id of G.eqp)if(id)L.push({v:`${EQPD[id].nom} — ${EQPD[id].txt}`});
 if(G.trf)L.push({h:'Transformation'},{v:G.trf.def.nom+' — '+G.trf.def.stats});L.push({h:'Synergies compatibles'});const sy=synActives();L.push({v:sy.length?sy.map(s=>s.nom+(G.synVues.has(s.id)?' ✓':'')).join(' · '):'aucune'});
 L.push({h:'Évolutions'});const adm=evolutionsAdmissibles();L.push({v:adm.length?'Admissibles (prochain coffre) : '+adm.map(r=>r.nom).join(', '):'Aucune admissible pour l’instant.'});
 for(const r of DATA.evolutions)if(r.type==='EVOLUTION'&&G.techs.some(I=>I.id===r.src[0]&&!I.evo)){const I=G.techs.find(J=>J.id===r.src[0]);L.push({v:`${I.nomStat} niv. ${I.lv}/8 + ${r.cata.map(x=>(PASD[x]||EQPD[x]||{nom:x}).nom+(G.pas[x]!==undefined||G.eqp.includes(x)?' ✓':' ✗')).join(', ')} → ${r.nom}`});}
 L.push({h:'Statistiques'},{v:`Puissance +${pct(S.power)} · ×${fr(S.mult,2)} · Cadence +${pct(c)} (délai −${Math.round(100-100/(1+c))} %) · Zone +${pct(S.zone)} · Durée +${pct(S.dur)} · Critique ${pct(S.crit)} ×${fr(S.critd,2)}`},
  {v:`Armure ${S.armor} · Réduction ${pct(S.red)} · Régén ${fr(S.regen,1)} PV/s · Déplacement ${fr(G.chr.stats.depl*(1+S.move),2)} m/s · Collecte ${fr(1.5*(1+S.pickup),2)} m · Chakra +${pct(S.chakra)} · XP +${pct(S.xp)}`},
  {h:'Commandes'},{v:'Déplacement : ZQSD / WASD / flèches · stick · glisser au doigt. Esquive : Espace / A. Ultime : E / Y. Transformation : R / B. Build : Tab. Pause : Échap / P / Start. M : son.'});
 detail(12,26,W-24,H-58,L);bouton('Reprendre (Échap)',W/2-190,H-26,120,16,()=>{G.phase='jeu';UI.build=false;},true);bouton('Abandonner la run',W/2-60,H-26,120,16,()=>{UI.conf={t:'Abandonner ? (Ryō et maîtrise acquis conservés)',ok:()=>finRun(false,'Abandon')};});
 bouton((OPT.son?'Son : oui':'Son : non'),W/2+70,H-26,120,16,()=>{OPT.son=!OPT.son;});}
function ecranFin(){ctx.fillStyle='rgba(8,10,14,.9)';ctx.fillRect(0,0,W,H);const b=G.bilan||{};txt(G.win?'VICTOIRE':'DÉFAITE',W/2,10,16,G.win?'#ffd23f':'#ff5a5a','center',1);
 txt(G.win?`${G.map.D.nom} terminée à ${mmss(G.time)}`:`${G.cause||'—'} · à ${mmss(G.time)}`,W/2,30,8,'#e8e6e1','center');
 const tot=Object.values(G.dmgBy).reduce((a,c)=>a+c,0);txt(`${nomCourt(G.chr.nom)} · niveau ${G.level} · ${G.kills} éliminés · ${Math.round(tot).toLocaleString('fr-FR')} dégâts · rang ${G.rangId}${G.aide?' · Assisté':''}`,W/2,44,6,'#9aa0aa','center');
 let y=58;txt('Top 5 des sources de dégâts',24,y,7,'#ffd23f','left',1);y+=12;const top=Object.entries(G.dmgBy).sort((a,c)=>c[1]-a[1]).slice(0,5);
 for(const[k,v]of top){const r=tot?v/tot:0,dps=v/Math.max(1,G.time);txt(k.slice(0,38),24,y,6,'#e8e6e1');ctx.fillStyle='#2a303c';ctx.fillRect(250,y+1,120,5);ctx.fillStyle='#f28a1e';ctx.fillRect(250,y+1,Math.round(120*r),5);txt(`${Math.round(v).toLocaleString('fr-FR')} (${Math.round(r*100)} %) · ${fr(dps,1)}/s`,378,y,6,'#c8ccd4');y+=10;}
 y+=6;txt('Progression',24,y,7,'#ffd23f','left',1);y+=12;const pr=[`+${b.ryo||0} Ryō${b.ryoMissions?' (+'+b.ryoMissions+' par les missions)':''} · total ${SAVE.ryo}`,`Maîtrise de ${nomCourt(G.chr.nom)} : niveau ${b.maitriseApres||1}${b.maitriseApres>b.maitriseAvant?' (+'+(b.maitriseApres-b.maitriseAvant)+')':''}`];
 for(const m of b.missions||[])pr.push('Mission réussie : '+m.nom+' ('+m.id+')');for(const s of b.secrets||[])pr.push('Secret : '+s.nom);for(const p of b.deblocages||[])pr.push('Débloqué : '+p.nom);
 const deb=(b.missions||[]).flatMap(m=>m.recompenses.deblocages||[]);for(const d of deb)pr.push('Débloqué : '+(CHR[d]?CHR[d].nom:MAP[d]?MAP[d].nom:d));
 for(const s of pr.slice(0,12)){txt(s,24,y,6,'#c8ccd4');y+=9;}
 bouton('Rejouer (Entrée)',W/2-190,H-26,120,16,()=>{if(G.rt-G.endT>.5){const c=G.cfg;newRun(Object.assign({},c,{seed:0}));G.aide=Object.values(SAVE.assist).some(Boolean);}},true);
 bouton('Changer de personnage',W/2-60,H-26,120,16,()=>{UI.scr='selection';});bouton('Village',W/2+70,H-26,120,16,()=>{UI.scr='village';});}
function ecranConfirmation(){const c=UI.conf;ctx.fillStyle='rgba(0,0,0,.7)';ctx.fillRect(0,0,W,H);panel(W/2-150,H/2-40,300,80,'#ffb040');para(c.t,W/2-140,H/2-30,280,7,'#fff',9,3);
 bouton('Confirmer',W/2-130,H/2+14,110,16,()=>{const f=c.ok;UI.conf=null;f();},true);bouton('Annuler',W/2+20,H/2+14,110,16,()=>{UI.conf=null;});}
function render(){ctx.setTransform(RS,0,0,RS,0,0);ctx.imageSmoothingEnabled=false;ZONES=[];LISTES=[];
 if(UI.scr==='jeu'){renderJeu();if(G.phase==='niveau')ecranNiveau();else if(G.phase==='coffre')ecranCoffre();else if(G.phase==='rouleau')ecranRouleau();else if(G.phase==='pause')ecranPause();else if(G.phase==='fin')ecranFin();}
 else ECRANS[UI.scr]();
 if(UI.conf){ZONES=[];ecranConfirmation();}
 if(UI.msg&&G.rt-UI.msg.u<2){txt(UI.msg.t,W/2,H-40,8,'#ffb040','center',1);}}
