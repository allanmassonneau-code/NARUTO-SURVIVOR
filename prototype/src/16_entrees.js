// Entrées (§B1.1) : clavier (ZQSD/WASD par position physique), souris, tactile, manette ; boucle à pas fixe.
const IN={dash:false,ult:false,trf:false,joy:null,touch:false,padX:0,padY:0,bx:0,by:0,mx:0,my:0};
const keys=new Set();
function retourEcran(){const back={selection:'village',carte:'selection',draft:'carte',archives:'village',missions:'village',secrets:'village',boutique:'village',options:'village',village:'titre'};if(back[UI.scr])UI.scr=back[UI.scr];}
addEventListener('keydown',e=>{const c=e.code,k=(e.key||'').toLowerCase();
 if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(c))e.preventDefault();
 initAudio();keys.add(c);if(e.repeat&&!/Arrow/.test(c))return;
 if(k==='m'){OPT.son=!OPT.son;return;}
 if(UI.conf){if(c==='Enter'){const f=UI.conf.ok;UI.conf=null;f();}if(c==='Escape')UI.conf=null;return;}
 if(UI.scr!=='jeu'){
  if(UI.scr==='titre'){if(c==='Enter'||c==='Space')UI.scr='village';return;}
  if(c==='Escape'){retourEcran();return;}
  if(UI.scr==='selection'){const L=DATA.personnages,i=L.findIndex(p=>p.id===UI.sel.chr);let j=i;if(c==='ArrowRight')j++;if(c==='ArrowLeft')j--;if(c==='ArrowDown')j+=16;if(c==='ArrowUp')j-=16;j=clamp(j,0,L.length-1);UI.sel.chr=L[j].id;if(c==='Enter'&&debloque(UI.sel.chr))UI.scr='carte';}
  else if(UI.scr==='carte'){const L=DATA.cartes,i=L.findIndex(m=>m.id===UI.sel.map);let j=i;if(c==='ArrowDown')j++;if(c==='ArrowUp')j--;UI.sel.map=L[clamp(j,0,L.length-1)].id;if(c==='Enter'){if(UI.sel.mode==='Draft')preparerDraft();else lancer();}}
  else if(UI.scr==='village'&&c==='Enter')UI.scr='selection';
  return;}
 switch(G.phase){
 case'jeu':if(c==='Space')IN.dash=true;if(k==='e')IN.ult=true;if(k==='r')IN.trf=true;if(c==='Escape'||k==='p'){G.phase='pause';UI.build=false;}if(c==='Tab'){G.phase='pause';UI.build=true;}break;
 case'pause':if(c==='Escape'||k==='p'||c==='Tab'){G.phase='jeu';UI.build=false;}break;
 case'niveau':if(c==='ArrowLeft'||c==='KeyA')G.sel=(G.sel+G.cards.length-1)%G.cards.length;else if(c==='ArrowRight'||c==='KeyD')G.sel=(G.sel+1)%G.cards.length;
  else if(c==='Enter'||c==='Space'||c==='NumpadEnter')choisir(G.sel);else if(c==='Digit1'||c==='Numpad1')relancer();else if(c==='Digit2'||c==='Numpad2')bannir();else if(c==='Digit3'||c==='Numpad3')passer();break;
 case'coffre':if(c==='Enter'||c==='Space')fermerCoffre();break;
 case'rouleau':{const ch=G.choix;if(ch.remplace!==undefined){if(c==='Digit1')remplacerEqp(0);if(c==='Digit2')remplacerEqp(1);if(c==='Escape'){ch.remplace=undefined;ch.remplacer=null;}break;}
  if(c==='ArrowLeft')ch.sel=(ch.sel+ch.items.length-1)%ch.items.length;if(c==='ArrowRight')ch.sel=(ch.sel+1)%ch.items.length;if(c==='Enter'||c==='Space')prendreChoix(ch.sel);break;}
 case'fin':if(c==='Enter'&&G.rt-G.endT>.8){newRun(Object.assign({},G.cfg,{seed:0}));}if(c==='Escape')UI.scr='village';break;}});
addEventListener('keyup',e=>keys.delete(e.code));
function pauseOnBlur(){keys.clear();IN.joy=null;if(UI.scr==='jeu'&&G.phase==='jeu')G.phase='pause';}
addEventListener('blur',pauseOnBlur);document.addEventListener('visibilitychange',()=>{if(document.hidden){pauseOnBlur();ecrireSave();}});
function toLogical(e){const r=cv.getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*H];}
const inC=(x,y,b)=>hyp(x-b[0],y-b[1])<=b[2];
let drag=null;
cv.addEventListener('pointerdown',e=>{initAudio();cv.focus();const[x,y]=toLogical(e);if(e.pointerType==='touch'||e.pointerType==='pen')IN.touch=true;
 if(UI.scr==='jeu'&&G.phase==='jeu'&&!UI.conf){if(IN.touch){if(inC(x,y,BTN.dash)){IN.dash=true;return;}if(inC(x,y,BTN.ult)){IN.ult=true;return;}if(inC(x,y,BTN.pause)){G.phase='pause';return;}if(G.trf&&inC(x,y,BTN.trf)){IN.trf=true;return;}}
  IN.joy={id:e.pointerId,ox:x,oy:y,x,y};try{cv.setPointerCapture(e.pointerId);}catch(_){}return;}
 const L=LISTES.find(l=>x>=l.x&&x<=l.x+l.w&&y>=l.y&&y<=l.y+l.h);drag=L?{key:L.key,y0:y,s0:UI.scroll[L.key]||0,moved:false,x,y}:null;
 if(!L)clicZone(x,y);});
function clicZone(x,y){for(let i=ZONES.length-1;i>=0;i--){const u=ZONES[i];if(x>=u.x&&x<=u.x+u.w&&y>=u.y&&y<=u.y+u.h){u.act();return true;}}return false;}
cv.addEventListener('pointermove',e=>{const[x,y]=toLogical(e);IN.mx=x;IN.my=y;if(IN.joy&&IN.joy.id===e.pointerId){IN.joy.x=x;IN.joy.y=y;}
 if(drag&&e.buttons){if(Math.abs(y-drag.y0)>4)drag.moved=true;if(drag.moved)UI.scroll[drag.key]=Math.max(0,drag.s0-(y-drag.y0));}
 for(const u of ZONES)if(u.hover&&x>=u.x&&x<=u.x+u.w&&y>=u.y&&y<=u.y+u.h)u.hover();});
const endPtr=e=>{if(IN.joy&&IN.joy.id===e.pointerId)IN.joy=null;if(drag&&!drag.moved)clicZone(drag.x,drag.y);drag=null;};
cv.addEventListener('pointerup',endPtr);cv.addEventListener('pointercancel',e=>{if(IN.joy&&IN.joy.id===e.pointerId)IN.joy=null;drag=null;});
cv.addEventListener('wheel',e=>{const[x,y]=toLogical(e);const L=LISTES.find(l=>x>=l.x&&x<=l.x+l.w&&y>=l.y&&y<=l.y+l.h);if(L){UI.scroll[L.key]=Math.max(0,(UI.scroll[L.key]||0)+e.deltaY*.5);e.preventDefault();}},{passive:false});
cv.addEventListener('contextmenu',e=>e.preventDefault());
let padPrev=[];
function pollPad(){let gp=null;try{const ps=navigator.getGamepads?navigator.getGamepads():[];for(const p of ps)if(p){gp=p;break;}}catch(e){}if(!gp){IN.padX=IN.padY=0;return;}
 let x=gp.axes[0]||0,y=gp.axes[1]||0;const m=hyp(x,y);if(m<.18){x=y=0;}else{const a=Math.min(1,(m-.18)/(.95-.18));x=x/m*a;y=y/m*a;}
 const b=i=>!!(gp.buttons[i]&&gp.buttons[i].pressed),ed=i=>b(i)&&!padPrev[i];if(b(14))x=-1;if(b(15))x=1;if(b(12))y=-1;if(b(13))y=1;
 const jeu=UI.scr==='jeu'&&G.phase==='jeu';IN.padX=jeu?x:0;IN.padY=jeu?y:0;
 if(UI.scr==='jeu'){switch(G.phase){case'jeu':if(ed(0))IN.dash=true;if(ed(3))IN.ult=true;if(ed(1))IN.trf=true;if(ed(9))G.phase='pause';if(ed(8)){G.phase='pause';UI.build=true;}break;
  case'pause':if(ed(9)||ed(8))G.phase='jeu';break;case'niveau':if(ed(14))G.sel=(G.sel+G.cards.length-1)%G.cards.length;if(ed(15))G.sel=(G.sel+1)%G.cards.length;if(ed(0))choisir(G.sel);if(ed(2))relancer();if(ed(5))bannir();if(ed(4))passer();break;
  case'coffre':if(ed(0))fermerCoffre();break;case'rouleau':if(ed(14))G.choix.sel=(G.choix.sel+G.choix.items.length-1)%G.choix.items.length;if(ed(15))G.choix.sel=(G.choix.sel+1)%G.choix.items.length;if(ed(0))prendreChoix(G.choix.sel);break;
  case'fin':if(ed(0)&&G.rt-G.endT>.8)newRun(Object.assign({},G.cfg,{seed:0}));break;}}
 else{if(UI.scr==='titre'&&(ed(0)||ed(9)))UI.scr='village';if(ed(1))retourEcran();}
 padPrev=gp.buttons.map(q=>q.pressed);}
let last=performance.now(),acc=0;
function frame(now){let dt=(now-last)/1000;last=now;if(dt>.25)dt=.25;G.rt=(G.rt||0)+dt;pollPad();
 if(UI.scr==='jeu'&&G.phase==='jeu'){acc+=dt*(SAVE.assist.ralenti?.8:1);let n=0;while(acc>=DT&&n<6){try{tick();}catch(err){console.error(err);G.erreur=String(err&&err.stack||err);}acc-=DT;n++;if(G.phase!=='jeu'){acc=0;break;}}if(n>=6)acc=0;}else acc=0;
 try{render();}catch(err){console.error(err);}requestAnimationFrame(frame);}
requestAnimationFrame(frame);
window.__nss={get G(){return G;},get P(){return P;},get UI(){return UI;},tick,newRun,choisir,prendreChoix,fermerCoffre,IN,DATA,recalc,mkInst,evolutionsAdmissibles,appliquerEvolution,finRun,mkBoss,mkEnemy,spawnElite,SAVE:()=>SAVE};
