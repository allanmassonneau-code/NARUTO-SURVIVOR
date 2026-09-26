// Base : constantes (registre §R2), utilitaires, affichage, texte, audio.
const W=640,H=360,M=16,DT=1/60,TAU=Math.PI*2;
const cv=document.getElementById('view'),ctx=cv.getContext('2d');
let RS=1;
function resize(){const w=innerWidth,h=innerHeight;let s=Math.min(w/W,h/H);if(s>=1)s=Math.floor(s);const dpr=window.devicePixelRatio||1;
 cv.style.width=Math.round(W*s)+'px';cv.style.height=Math.round(H*s)+'px';RS=Math.max(1,s*dpr);cv.width=Math.round(W*RS);cv.height=Math.round(H*RS);}
addEventListener('resize',resize);resize();

const clamp=(v,a,b)=>v<a?a:v>b?b:v,hyp=Math.hypot,lerp=(a,b,t)=>a+(b-a)*t;
function angDiff(a,b){let d=((a-b)%TAU+TAU)%TAU;return d>Math.PI?TAU-d:d;}
function fr(n,d){d=d===undefined?1:d;let s=(+n).toFixed(d);if(s.includes('.'))s=s.replace(/0+$/,'').replace(/\.$/,'');return s.replace('.',',');}
function pct(x){return Math.round(x*100)+' %';}
function mmss(t){t=Math.max(0,Math.floor(t));return String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');}
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hashStr(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function wpick(obj,r){let tot=0;for(const k in obj)tot+=obj[k];if(tot<=0)return null;let x=r()*tot;for(const k in obj){if((x-=obj[k])<0)return k;}return Object.keys(obj)[0];}
function wItem(pool,r,key){key=key||'w';let tot=0;for(const c of pool)tot+=c[key];if(!pool.length||tot<=0)return null;let x=r()*tot;for(const c of pool){if((x-=c[key])<0)return c;}return pool[pool.length-1];}
function shuffle(a,r){for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function inArc(px,py,cx,cy,dir,half,r){const d=hyp(px-cx,py-cy);return d<=r&&(d<4||angDiff(Math.atan2(py-cy,px-cx),dir)<=half);}
function segDist(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy||1;let t=((px-ax)*dx+(py-ay)*dy)/l2;t=clamp(t,0,1);return hyp(px-(ax+dx*t),py-(ay+dy*t));}
function inLine(px,py,ox,oy,dir,len,hw){const dx=px-ox,dy=py-oy,c=Math.cos(dir),s=Math.sin(dir);const a=dx*c+dy*s,b=-dx*s+dy*c;return a>=-hw&&a<=len&&Math.abs(b)<=hw;}

// ---------- texte
const FONT='ui-monospace,"Cascadia Mono",Menlo,Consolas,"DejaVu Sans Mono",monospace';
function font(size,bold){ctx.font=`${bold?'700 ':''}${size}px ${FONT}`;}
function txt(s,x,y,size,col,align,bold,shadow){font(size,bold);ctx.textAlign=align||'left';ctx.textBaseline='top';if(shadow!==false){ctx.fillStyle='rgba(0,0,0,.75)';ctx.fillText(s,x+.6,y+.6);}ctx.fillStyle=col;ctx.fillText(s,x,y);}
const wrapCache=new Map();
function wrap(s,maxW,size){s=String(s==null?'':s);const k=s+'|'+maxW+'|'+size;const c=wrapCache.get(k);if(c)return c;font(size);const out=[];
 for(const para of s.split('\n')){const words=para.split(' ');let cur='';for(const w of words){const t=cur?cur+' '+w:w;if(ctx.measureText(t).width>maxW&&cur){out.push(cur);cur=w;}else cur=t;}out.push(cur);}
 if(wrapCache.size>4000)wrapCache.clear();wrapCache.set(k,out);return out;}
function para(s,x,y,maxW,size,col,lh,maxLines){const L=wrap(s,maxW,size);let n=0;for(const l of L){if(maxLines&&n>=maxLines){break;}txt(l,x,y,size,col,'left',false,false);y+=lh||size+2;n++;}return y;}
function measure(s,size,bold){font(size,bold);return ctx.measureText(s).width;}

// ---------- audio (créé après interaction)
let AC=null;const sfxLast={};
function initAudio(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){AC=null;}}
function beep(f,dur,type,vol,slide,delay){if(!AC||!OPT.son)return;try{const t=AC.currentTime+(delay||0),o=AC.createOscillator(),g=AC.createGain();o.type=type||'square';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide),t+dur);g.gain.setValueAtTime((vol||.04)*OPT.volume,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g).connect(AC.destination);o.start(t);o.stop(t+dur+.02);}catch(e){}}
function sfx(k){const now=performance.now(),lim={hit:45,pick:30,tir:60,boom:60,poof:80,menu:40}[k]||0;if(lim&&now-(sfxLast[k]||0)<lim)return;sfxLast[k]=now;
 switch(k){case'hit':beep(170,.04,'square',.016);break;case'pick':beep(880+Math.random()*120,.04,'sine',.022);break;case'tir':beep(1300,.05,'triangle',.018,-500);break;
 case'charge':beep(260,.2,'sine',.025,500);break;case'boom':beep(110,.16,'sawtooth',.03,-60);break;case'poof':beep(300,.06,'triangle',.02,-150);break;
 case'lvl':beep(523,.09,'square',.03);beep(659,.09,'square',.03,0,.09);beep(784,.14,'square',.03,0,.18);break;case'hurt':beep(130,.14,'sawtooth',.045,-60);break;
 case'dash':beep(420,.08,'triangle',.03,500);break;case'warn':beep(220,.1,'square',.028);break;case'cue':beep(1560,.22,'sine',.045,-300);break;
 case'slash':beep(600,.08,'sawtooth',.028,-450);break;case'ult':beep(200,.45,'sawtooth',.045,700);break;case'menu':beep(660,.03,'square',.02);break;
 case'coffre':beep(392,.1,'square',.035);beep(523,.1,'square',.035,0,.1);beep(784,.2,'square',.035,0,.2);break;
 case'evo':beep(392,.12,'square',.04);beep(587,.12,'square',.04,0,.12);beep(784,.12,'square',.04,0,.24);beep(1046,.3,'square',.04,0,.36);break;
 case'trf':beep(90,.6,'sawtooth',.05,40);beep(180,.5,'square',.02,60,.1);break;}}

// ---------- options (persistées avec la sauvegarde)
const OPT={son:true,volume:1,clignotement:true,degatsTexte:true,telegraphes:false,ralenti:1,pvAide:false,choixAuto:false,deplSeul:false,toutDebloque:false,compression:1,coffreRapide:false};
