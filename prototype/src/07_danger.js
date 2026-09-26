// Dangers ennemis télégraphiés (ennemis et boss) : une zone annoncée (hachures rouges, blanc = imminent)
// puis une phase active. Formes : cercle, arc, ligne, sinus, croix, etoile, mur, arene, grille.
function danger(o){o.t0=G.time;o.tele=(o.tele||.8)*(G.rang.tele)*(OPT.telegraphes?1.3:1);o.act=o.act||.2;o.state='tele';o.hit=false;o.hits=0;G.hz.push(o);return o;}
function dansDanger(h,x,y,r){switch(h.shape){
 case'cercle':return hyp(x-h.x,y-h.y)<=h.r+r*.5;
 case'croix':return hyp(x-h.x,y-h.y)<=h.r+r*.5;
 case'arc':return inArc(x,y,h.x,h.y,h.dir,h.half,h.r+r);
 case'ligne':return inLine(x,y,h.x,h.y,h.dir,h.len,h.w/2+r*.6);
 case'etoile':for(let i=0;i<h.n;i++)if(inLine(x,y,h.x,h.y,h.dir+i/h.n*TAU,h.len,h.w/2+r*.6))return true;return false;
 case'sinus':{if(h.state!=='act')return false;const al=h.head;for(const off of[0,10,20,30]){const q=sinePt(h,al-off);if(q&&hyp(x-q[0],y-q[1])<h.w/2+r)return true;}return false;}
 case'mur':{const c=h.x+Math.cos(h.dir)*h.prog,cy=h.y+Math.sin(h.dir)*h.prog;const px=-Math.sin(h.dir),py=Math.cos(h.dir);const lat=(x-c)*px+(y-cy)*py,front=(x-c)*Math.cos(h.dir)+(y-cy)*Math.sin(h.dir);
  if(Math.abs(front)>.6*M+r||Math.abs(lat)>h.w/2)return false;for(const b of h.breches)if(Math.abs(lat-b)<1*M)return false;return true;}
 case'arene':{if(h.R&&hyp(x-h.x,y-h.y)>h.R)return false;for(const s of h.sures)if(hyp(x-s.x,y-s.y)<s.r-r*.5)return false;return true;}
 case'grille':{const cx=Math.floor((x-h.x)/h.cell);return((cx%2)+2)%2===h.pair?false:hyp(x-h.x,y-h.y)<h.R;}}
 return false;}
function sinePt(a,al){if(al<0||al>a.len)return null;const ux=Math.cos(a.dir),uy=Math.sin(a.dir),off=Math.sin(al/(4*M)*TAU)*a.amp;return[a.x+ux*al-uy*off,a.y+uy*al+ux*off];}
function updDangers(){for(const h of G.hz){
  if(h.owner&&h.owner.dead&&!h.persist&&h.state==='tele'){h.fin=1;continue;}
  if(h.state==='tele'){if(h.suit>0&&G.time-h.t0<h.suit){h.x=P.x;h.y=P.y;}if(h.suitOwner&&h.owner){h.x=h.owner.x;h.y=h.owner.y;}
   if(G.time-h.t0>=h.tele){h.state='act';h.ta=G.time;if(h.onAct)h.onAct(h);}}
  if(h.state==='act'){const p=(G.time-h.ta)/Math.max(.01,h.act);
   if(h.shape==='sinus')h.head=p*h.len;if(h.shape==='mur')h.prog=p*h.len;
   if(h.retour&&h.shape==='ligne'){h.prog=(p<.5?p*2:(1-p)*2)*h.len;}
   const touche=h.retour&&h.shape==='ligne'?hyp(P.x-(h.x+Math.cos(h.dir)*h.prog),P.y-(h.y+Math.sin(h.dir)*h.prog))<h.w/2+P.r+3:dansDanger(h,P.x,P.y,P.r);
   const maxHits=h.retour?2:(h.persist?99:1);
   if(touche&&h.hits<maxHits&&(!h.persist||G.time-(h.lastTick||-9)>=.5)&&!(h.retour&&h.lastHalf===(p<.5))){h.hits++;h.lastTick=G.time;h.lastHalf=p<.5;
    const ok=h.dmg?hurtPlayer(h.dmg,h.cause,h.owner,h.persist?'zone':'tele'):true;
    if(ok&&h.eff)effetJoueur(h.eff,h);}
   if(h.fx&&!h.fxd){h.fxd=1;h.fx(h);}
   if(p>=1){h.fin=1;if(h.onEnd)h.onEnd(h);}}}
 G.hz=G.hz.filter(h=>!h.fin);}
function effetJoueur(e,h){if(e.slow){P.slow=Math.max(P.slow,e.slowT||2);P.slowV=Math.max(P.slowV||0,e.slow);}if(e.root){P.root=Math.max(P.root,e.root*(1-(G.resCtrl||0)));P.dashT=0;}
 if(e.pull){const a=Math.atan2(h.owner?h.owner.y-P.y:h.y-P.y,h.owner?h.owner.x-P.x:h.x-P.x);P.kvx=(P.kvx||0)+Math.cos(a)*e.pull*M*6;P.kvy=(P.kvy||0)+Math.sin(a)*e.pull*M*6;}
 if(e.push){const a=Math.atan2(P.y-h.y,P.x-h.x);P.kvx=(P.kvx||0)+Math.cos(a)*e.push*M*6;P.kvy=(P.kvy||0)+Math.sin(a)*e.push*M*6;}
 if(e.poison){G.pPoison=Math.min(10,(G.pPoison||0)+e.poison);G.pPoisonT=5;}
 if(e.noRegen)G.noRegenT=Math.max(G.noRegenT||0,e.noRegen);if(e.dashCd)P.dashCd+=e.dashCd;if(e.chakra)G.chakra=Math.max(0,G.chakra-e.chakra);
 if(e.aveugle)G.aveugleT=Math.max(G.aveugleT||0,e.aveugle);if(e.faux)for(let i=0;i<3;i++)G.faux.push({x:P.x+(G.rL()-.5)*10*M,y:P.y+(G.rL()-.5)*8*M,t:3});}
// Projectiles ennemis (§D6 : vitesse ordinaire ≤ 12 m/s, chevron d'annonce au bord)
function eTir(x,y,a,o){G.eproj.push(Object.assign({x,y,vx:Math.cos(a)*(o.v||9)*M,vy:Math.sin(a)*(o.v||9)*M,a,r:o.r||3,dmg:o.dmg,life:o.life||1.4,cause:o.cause,pierce:o.pierce,expl:o.expl,homing:o.homing,eff:o.eff,k:o.k||'kunai'},{}));}
function updEProj(){for(const b of G.eproj){if(b.homing){const a=Math.atan2(P.y-b.y,P.x-b.x);let d=a-b.a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;b.a+=clamp(d,-b.homing*DT,b.homing*DT);const sp=hyp(b.vx,b.vy);b.vx=Math.cos(b.a)*sp;b.vy=Math.sin(b.a)*sp;}
  if(G.gravite&&hyp(b.x-P.x,b.y-P.y)<4*M){}
  b.x+=b.vx*DT;b.y+=b.vy*DT;b.life-=DT;
  if(!b.hitP&&hyp(P.x-b.x,P.y-b.y)<P.r+b.r){b.hitP=true;if(b.expl){b.life=0;}else{if(hurtPlayer(b.dmg,b.cause,null,'proj')&&b.eff)effetJoueur(b.eff,b);if(!b.pierce)b.life=0;}}
  if(solidAt(b.x,b.y))b.life=0;
  if(b.life<=0&&b.expl&&!b.boom){b.boom=1;const h=danger({shape:'cercle',x:b.x,y:b.y,r:b.expl,tele:.01,act:.1,dmg:b.dmg,cause:b.cause});fxRing(b.x,b.y,b.expl,'#ff8040');}}
 G.eproj=G.eproj.filter(b=>b.life>0);}
