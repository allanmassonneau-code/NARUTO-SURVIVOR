// Rendu du combat (§C) : terrain, entités, dangers (hachures rouges ; blanc = imminent), effets, HUD.
const hatch=(()=>{const c=document.createElement('canvas');c.width=c.height=8;const g=c.getContext('2d');g.fillStyle='rgba(215,40,40,.30)';g.fillRect(0,0,8,8);g.strokeStyle='rgba(255,80,80,.8)';g.lineWidth=1.5;g.beginPath();g.moveTo(-2,10);g.lineTo(10,-2);g.moveTo(-2,2);g.lineTo(2,-2);g.moveTo(6,10);g.lineTo(10,6);g.stroke();return ctx.createPattern(c,'repeat');})();
function tileHash(x,y){let h=(x*374761393+y*668265263)^0x5bd1e995;h=Math.imul(h^(h>>>13),1274126177);return(h^(h>>>16))>>>0;}
function drawGround(cx,cy){const C=G.map,[c1,c2]=C.col;ctx.fillStyle='#14161b';ctx.fillRect(0,0,W,H);const T_=32,d1=mix(c1,'#000000',.08),l1=mix(c2,'#ffffff',.08);
 for(let ty=Math.floor(cy/T_);ty<=Math.floor((cy+H)/T_);ty++)for(let tx=Math.floor(cx/T_);tx<=Math.floor((cx+W)/T_);tx++){if(tx<0||ty<0||tx*T_>=C.w||ty*T_>=C.h)continue;
  const h=tileHash(tx,ty),X=tx*T_-cx,Y=ty*T_-cy;ctx.fillStyle=(h&3)===0?c1:(h&3)===1?c2:mix(c1,c2,.5);ctx.fillRect(X,Y,T_,T_);
  ctx.fillStyle=d1;ctx.fillRect(X+(h>>>4&31),Y+(h>>>9&31),2,1);ctx.fillRect(X+(h>>>14&31),Y+(h>>>19&31),1,1);ctx.fillStyle=l1;ctx.fillRect(X+(h>>>22&31),Y+(h>>>27&31),1,1);}
 ctx.strokeStyle='#0a0b0e';ctx.lineWidth=4;ctx.strokeRect(-cx,-cy,C.w,C.h);
 ctx.fillStyle='rgba(60,120,170,.55)';for(const e of C.eau){const x=e.x-cx,y=e.y-cy;if(x<-e.r||y<-e.r||x>W+e.r||y>H+e.r)continue;ctx.beginPath();ctx.arc(x,y,e.r,0,TAU);ctx.fill();}
 for(const s of G.surf){const x=s.x-cx,y=s.y-cy;if(x<-s.r||y<-s.r||x>W+s.r||y>H+s.r)continue;ctx.globalAlpha=Math.min(.5,s.t);ctx.fillStyle={HUILE:'#5a4a1a',EAU:'#3a7ab0',SABLE:'#c8a870',OMBRE:'#101018',BOIS:'#5a7a2a',GLACE:'#c8f0ff',CENDRE:'#4a4a4a',PAPIER:'#e8e4dc',LAVE:'#e04a1a'}[s.type]||'#888';
  ctx.beginPath();ctx.arc(x,y,s.r,0,TAU);ctx.fill();ctx.globalAlpha=1;}}
function drawObstacles(cx,cy,avant){for(const o of G.map.obs){const x=Math.round(o.x-cx),y=Math.round(o.y-cy);if(x<-50||y<-60||x>W+50||y>H+50)continue;if(avant!==(o.y>P.y))continue;
 if(o.k==='arbre'){ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(x+2,y+o.r*.5,o.r,o.r*.4,0,0,TAU);ctx.fill();ctx.fillStyle='#4a3420';ctx.fillRect(x-2,y-4,4,8);
  ctx.fillStyle=mix(G.map.col[0],'#0a2a0a',.45);ctx.beginPath();ctx.arc(x,y-o.r*.9,o.r*1.1,0,TAU);ctx.fill();ctx.fillStyle=mix(G.map.col[0],'#2a5a1a',.3);ctx.beginPath();ctx.arc(x-o.r*.3,y-o.r*1.2,o.r*.6,0,TAU);ctx.fill();}
 else if(o.k==='pilier'){ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(x-o.r+2,y-2,o.r*2,o.r);ctx.fillStyle='#6a6660';ctx.fillRect(x-o.r,y-o.r*2.2,o.r*2,o.r*2.4);ctx.fillStyle='#8a8680';ctx.fillRect(x-o.r,y-o.r*2.2,o.r*2,3);}
 else if(o.k==='bloc'){ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(x-o.r+3,y-o.r*.4,o.r*2,o.r*1.2);ctx.fillStyle='#6a5a4a';ctx.fillRect(x-o.r,y-o.r*1.2,o.r*2,o.r*1.6);ctx.fillStyle='#8a3a2a';ctx.fillRect(x-o.r-2,y-o.r*1.5,o.r*2+4,o.r*.5);}
 else{ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(x+2,y+o.r*.55,o.r,o.r*.45,0,0,TAU);ctx.fill();ctx.fillStyle='#43464c';ctx.beginPath();ctx.arc(x,y,o.r,0,TAU);ctx.fill();ctx.fillStyle='#565a61';ctx.beginPath();ctx.arc(x-o.r*.25,y-o.r*.3,o.r*.6,0,TAU);ctx.fill();}}}
function tProg(h){return clamp((G.time-h.t0)/h.tele,0,1);}
function drawDanger(h,cx,cy){const p=h.state==='act'?1:tProg(h),x=h.x-cx,y=h.y-cy,edge=p>.82?'#ffffff':'#ff4a4a';ctx.save();ctx.translate(x,y);ctx.lineWidth=1;
 const fillShape=(f)=>{ctx.beginPath();f();ctx.fillStyle=hatch;ctx.fill();ctx.strokeStyle=edge;ctx.stroke();};
 switch(h.shape){
 case'cercle':case'croix':fillShape(()=>ctx.arc(0,0,h.r,0,TAU));ctx.globalAlpha=.35;ctx.fillStyle='#ff3030';ctx.beginPath();ctx.arc(0,0,h.r*p,0,TAU);ctx.fill();ctx.globalAlpha=1;
  if(h.shape==='croix'){ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-6,-6);ctx.lineTo(6,6);ctx.moveTo(6,-6);ctx.lineTo(-6,6);ctx.stroke();}break;
 case'arc':fillShape(()=>{ctx.moveTo(0,0);ctx.arc(0,0,h.r,h.dir-h.half,h.dir+h.half);ctx.closePath();});ctx.globalAlpha=.35;ctx.fillStyle='#ff3030';ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,h.r*p,h.dir-h.half,h.dir+h.half);ctx.fill();ctx.globalAlpha=1;break;
 case'ligne':ctx.rotate(h.dir);fillShape(()=>ctx.rect(0,-h.w/2,h.len,h.w));ctx.globalAlpha=.35;ctx.fillStyle='#ff3030';ctx.fillRect(0,-h.w/2,h.len*p,h.w);ctx.globalAlpha=1;
  if(h.retour&&h.state==='act'){ctx.fillStyle='#aab3bd';ctx.save();ctx.translate(h.prog||0,0);ctx.rotate(G.time*18);ctx.fillRect(-12,-4,24,8);ctx.restore();}break;
 case'etoile':for(let i=0;i<h.n;i++){ctx.save();ctx.rotate(h.dir+i/h.n*TAU);fillShape(()=>ctx.rect(0,-h.w/2,h.len,h.w));ctx.restore();}break;
 case'sinus':{ctx.translate(-x,-y);const pts=[];for(let al=0;al<=h.len;al+=6){const q=sinePt(h,al);pts.push([q[0]-cx,q[1]-cy]);}ctx.lineCap='round';ctx.beginPath();pts.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));
  ctx.strokeStyle=edge;ctx.lineWidth=h.w+2;ctx.stroke();ctx.strokeStyle=hatch;ctx.lineWidth=h.w;ctx.stroke();if(h.state==='act'&&h.head!==undefined)for(let i=6;i>=0;i--){const q=sinePt(h,h.head-i*6);if(!q)continue;ctx.fillStyle=i?'#4f9ad8':'#bfe4ff';ctx.beginPath();ctx.arc(q[0]-cx,q[1]-cy,i?6-i*.5:7,0,TAU);ctx.fill();}break;}
 case'mur':{ctx.rotate(h.dir);const pr=h.state==='act'?h.prog:0;ctx.fillStyle=hatch;ctx.fillRect(0,-h.w/2,h.len,h.w);ctx.strokeStyle=edge;ctx.strokeRect(0,-h.w/2,h.len,h.w);ctx.fillStyle='rgba(255,120,40,.8)';
  ctx.fillRect(pr-6,-h.w/2,12,h.w);ctx.fillStyle='rgba(40,200,80,.6)';for(const b of h.breches)ctx.fillRect(0,b-M,h.len,2*M);break;}
 case'arene':ctx.translate(-x,-y);ctx.fillStyle=hatch;if(h.R){ctx.beginPath();ctx.arc(x,y,h.R,0,TAU);ctx.fill();}else ctx.fillRect(0,0,W,H);ctx.globalCompositeOperation='destination-out';for(const s of h.sures){ctx.beginPath();ctx.arc(s.x-cx,s.y-cy,s.r,0,TAU);ctx.fill();}
  ctx.globalCompositeOperation='source-over';for(const s of h.sures){ctx.strokeStyle='#8fd14f';ctx.lineWidth=2;ctx.beginPath();ctx.arc(s.x-cx,s.y-cy,s.r,0,TAU);ctx.stroke();}ctx.globalAlpha=.25*p;ctx.fillStyle='#ff3030';ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;break;
 case'grille':ctx.translate(-x,-y);for(let gx=-8;gx<8;gx++){if(((gx%2)+2)%2===h.pair)continue;ctx.fillStyle=hatch;ctx.fillRect(x+gx*h.cell,0,h.cell,H);}ctx.strokeStyle=edge;break;}
 ctx.restore();}
function drawPlayer(cx,cy){const x=P.x-cx,y=P.y-cy,fy=y+5,fm=P.moving?Math.floor(P.walk*8)&1:0,pal=palPerso(G.chr.nom);
 ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,fy,8,3,0,0,TAU);ctx.stroke();
 if(G.trf&&G.trf.actif){ctx.globalAlpha=.35+.15*Math.sin(G.time*10);ctx.fillStyle='#ff7a2a';ctx.beginPath();ctx.ellipse(x,y-4,11,15,0,0,TAU);ctx.fill();ctx.globalAlpha=1;if(G.tick%4===0)G.fx.push({k:'etincelle',x:P.x+(Math.random()-.5)*14,y:P.y,vx:0,vy:-30,t:0,dur:.4,col:'#ff9a3a'});}
 const blink=OPT.clignotement&&(P.inv>0||P.hurtT>0)&&Math.floor(G.time*15)%2===0;if(blink)ctx.globalAlpha=.55;
 outlined(x,fy,pal,P.face,fm,1,OUT_P);ctx.globalAlpha=1;
 if(P.shield>0){ctx.strokeStyle='rgba(160,220,255,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y-4,12,0,TAU);ctx.stroke();}
 const rs=G.techs.find(I=>I.hook==='rasen');if(rs&&rs.charge>0){const ox=Math.round(x+P.face*8),oy=Math.round(fy-8);ctx.fillStyle='#7fcfff';ctx.beginPath();ctx.arc(ox,oy,4,0,TAU);ctx.fill();}
 if(P.root>0){ctx.strokeStyle='#6fb8ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y-4,13,0,TAU);ctx.stroke();txt('Immobilisé',x,y-32,7,'#bfe4ff','center',1);}
 if(P.slow>0)txt('Ralenti',x,y-32,7,'#e8e6e1','center',1);}
function drawUnit(I,u,cx,cy){const x=u.x-cx,y=u.y-cy;if(x<-40||y<-40||x>W+40||y>H+40)return;ctx.globalAlpha=u.life<.3?Math.max(.2,u.life/.3):1;
 if(u.geant){ctx.globalAlpha*=.8;bete(x,y+10,64,I.col==='#e8e6e1'?'#e0a060':I.col,u.face,G.time,0,I.def.nom);ctx.globalAlpha=1;return;}
 if(u.clone||I.unite==='CLONE')outlined(x,y+5,desat(palPerso(G.chr.nom)),u.face,Math.floor(u.walk*8)&1,1,OUT_C);
 else if(I.unite==='ANIMAL'||estBete(I.def.nom+I.def.comp))bete(x,y+4,14,I.col,u.face,G.time,0,I.def.nom);
 else if(I.unite==='MARIONNETTE'){outlined(x,y+5,{body:'#8a6a4a',leg:'#6a4a3a',sh:'#5a3a2a',skin:'#c8a878',hair:'#3a2a1a',hs:'court'},u.face,Math.floor(u.walk*8)&1,1,OUT_A);ctx.strokeStyle='rgba(200,220,255,.3)';ctx.beginPath();ctx.moveTo(P.x-cx,P.y-cy-10);ctx.lineTo(x,y-10);ctx.stroke();}
 else{ctx.fillStyle=I.col;ctx.beginPath();ctx.arc(x,y-4,5,0,TAU);ctx.fill();ctx.strokeStyle='#8fd14f';ctx.stroke();}
 ctx.globalAlpha=1;}
function drawEnemy(e,cx,cy){const x=e.x-cx,y=e.y-cy;if(x<-80||y<-80||x>W+80||y>H+80)return;
 if(e.spawnT>0){ctx.strokeStyle='rgba(255,90,90,.7)';ctx.beginPath();ctx.arc(x,y+4,8*(1-e.spawnT/.4),0,TAU);ctx.stroke();return;}
 if(e.boss||e.lieut)return drawBoss(e,x,y);
 ctx.globalAlpha=e.alpha||1;const s=e.s,fm=Math.floor(e.walk*8)&1,face=P.x>=e.x?1:-1,fy=y+5*s;
 if(e.elite){ctx.strokeStyle='#ffd84a';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x,fy,11,4,0,0,TAU);ctx.stroke();}
 if(e.bete){bete(x,fy,e.elite?22:14,couleurBete(e.nom),face,G.time+e.seed,nbQueues(e.nom),e.nom);if(e.flash>0){ctx.globalAlpha=.6;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,fy-6,7,0,TAU);ctx.fill();}}
 else{ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(Math.round(x-5*s),Math.round(fy-1),Math.round(10*s),2);const p=e.flash>0?WHITE:e.pal;
  if(e.elite&&e.guard>0&&Math.floor(G.time*6)%2===0)outlined(x,fy,p,face,fm,s,OUT_E);else ninja(x,fy,p,face,fm,s);}
 ctx.globalAlpha=1;
 if(e.tele)drawTeleMob(e,cx,cy);
 if(e.elite){const w=26;ctx.fillStyle='#20242b';ctx.fillRect(Math.round(x-w/2),Math.round(fy-36),w,3);ctx.fillStyle='#ffd84a';ctx.fillRect(Math.round(x-w/2),Math.round(fy-36),Math.round(w*Math.max(0,e.hp/e.maxhp)),3);
  if(e.mods)txt(e.mods.join(' + '),x,fy-45,6,'#ffd84a','center',1);if(e.barriere>0){ctx.strokeStyle='#b070ff';ctx.beginPath();ctx.arc(x,fy-10,14,0,TAU);ctx.stroke();}}
 if(e.clochette){ctx.fillStyle='#ffd23f';ctx.beginPath();ctx.arc(x+6,fy-24,3,0,TAU);ctx.fill();}
 if(e.st){let i=0;for(const k in e.st){if(e.st[k].t>0&&i<4){ctx.fillStyle=STA_COL[k]||'#fff';ctx.fillRect(Math.round(x-6+i*4),Math.round(fy-22*s-4),3,3);i++;}}}
 if(e.vulns&&e.vulns.length){ctx.fillStyle='#c77dff';ctx.fillRect(Math.round(x+6),Math.round(fy-22*s-4),2,2);}
 if(e.gel>0){ctx.globalAlpha=.5;ctx.fillStyle='#c8f0ff';ctx.fillRect(Math.round(x-6),Math.round(fy-18),12,18);ctx.globalAlpha=1;}}
function drawTeleMob(e,cx,cy){const t=e.tele;const p=clamp((G.time-t.t0)/t.tele,0,1);ctx.save();ctx.translate(t.x-cx,t.y-cy);
 if(t.shape==='ligne'){ctx.rotate(t.dir);if(t.vise){ctx.setLineDash([2,3]);ctx.strokeStyle=p>.8?'#fff':'#ff5050';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(t.len,0);ctx.stroke();ctx.setLineDash([]);}
  else{ctx.fillStyle=hatch;ctx.fillRect(0,-t.w/2,t.len,t.w);ctx.strokeStyle=p>.8?'#fff':'#ff4a4a';ctx.strokeRect(0,-t.w/2,t.len,t.w);}}
 else if(t.shape==='cercle'){ctx.strokeStyle='#ff4a4a';ctx.beginPath();ctx.arc(0,0,t.r*p,0,TAU);ctx.stroke();}
 else if(t.shape==='arc'){ctx.fillStyle=hatch;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,t.r,t.dir-t.half,t.dir+t.half);ctx.closePath();ctx.fill();}
 ctx.restore();txt('!',e.x-cx,e.y-cy-30,9,'#ff5050','center',1);}
function bossScale(e){return e.px>=160?4:e.px>=96?3:e.px>=48?2.5:2;}
function drawBoss(e,x,y){if(e.hidden)return;const s=bossScale(e),fy=y+5*s,face=e.face,fm=Math.floor(e.walk*6)&1;ctx.globalAlpha=e.alpha||(e.clone?.78:1);
 if(e.bete||e.px>=96){bete(x,fy,e.px>=160?96:e.px>=96?72:48,couleurBete(e.nom),face,G.time,nbQueues(e.nom),e.nom);if(e.flash>0){ctx.globalAlpha=.5;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,fy-20,16,0,TAU);ctx.fill();}}
 else{const pal=e.flash>0?WHITE:(e.clone?{body:'#6fa8d8',leg:'#5b92c2',sh:'#5b92c2',skin:'#9cc8ec',hair:'#4f82b4',hs:'court'}:palPerso(e.nom));ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x,fy,6*s,2*s,0,0,TAU);ctx.fill();
  if(e.state==='mort')ninja(x,fy+6,pal,face,0,s);else outlined(x,fy,pal,face,fm,s,e.lieut?OUT_E:OUT_B);}
 ctx.globalAlpha=1;if(e.state==='fige')txt('Figé',x,fy-24*s-6,7,'#c77dff','center',1);if(vulnOf(e)>0)txt('Vulnérable +'+Math.round(vulnOf(e)*100)+' %',x,fy-24*s-14,6,'#c77dff','center',1);
 if(e.state==='trans'||e.state==='enter'){ctx.strokeStyle='rgba(255,255,255,.6)';ctx.beginPath();ctx.arc(x,fy-10*s,12*s+Math.sin(G.time*10)*2,0,TAU);ctx.stroke();}
 if(e.soin){txt('Mue : infligez 2 % de PV pour interrompre',x,fy-24*s-22,6,'#7ad04a','center',1);}
 if(e.lieut&&!e.clone){const w=60;ctx.fillStyle='#20242b';ctx.fillRect(Math.round(x-w/2),Math.round(fy-24*s-6),w,4);ctx.fillStyle='#ffb040';ctx.fillRect(Math.round(x-w/2),Math.round(fy-24*s-6),Math.round(w*Math.max(0,e.hp/e.maxhp)),4);}}
function drawTechObjs(cx,cy){for(const I of G.techs){for(const o of I.objs){const x=o.x-cx,y=o.y-cy;switch(o.k){
  case'zone':ctx.globalAlpha=.28;ctx.fillStyle=I.col;ctx.beginPath();ctx.arc(x,y,o.r,0,TAU);ctx.fill();ctx.globalAlpha=.7;ctx.strokeStyle=I.col;ctx.lineWidth=1;ctx.stroke();ctx.globalAlpha=1;break;
  case'piege':ctx.strokeStyle=o.arm>0?'rgba(255,255,255,.4)':I.col;ctx.setLineDash([2,2]);ctx.beginPath();ctx.arc(x,y,o.r,0,TAU);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle=I.col;ctx.fillRect(Math.round(x-2),Math.round(y-2),4,4);break;
  case'diff':ctx.strokeStyle='#7fcfff';ctx.setLineDash([3,3]);ctx.beginPath();ctx.arc(x,y,o.r,0,TAU);ctx.stroke();ctx.setLineDash([]);break;
  case'onde':if(o.t>=0){ctx.globalAlpha=.7;ctx.strokeStyle=I.col;ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,o.r,0,TAU);ctx.stroke();ctx.globalAlpha=1;ctx.lineWidth=1;}break;
  case'mur':{ctx.save();ctx.translate(o.cx-cx,o.cy-cy);ctx.rotate(o.a+Math.PI/2);ctx.fillStyle=I.col;ctx.globalAlpha=.6;ctx.fillRect(-o.w/2,-4,o.w,8);ctx.restore();ctx.globalAlpha=1;break;}
  case'rayon':{ctx.save();ctx.translate(P.x-cx,P.y-cy);ctx.rotate(o.a);ctx.globalAlpha=.7;ctx.fillStyle=I.col;ctx.fillRect(0,-o.w/2,o.len,o.w);ctx.fillStyle='#fff';ctx.fillRect(0,-1,o.len,2);ctx.restore();ctx.globalAlpha=1;break;}
  default:if(o.hits!==undefined&&o.a!==undefined){ctx.save();ctx.translate(Math.round(x),Math.round(y));ctx.rotate(o.a);ctx.globalAlpha=o.hits?.9:.6;ctx.fillStyle='#15161a';ctx.fillRect(-2,-1,5,2);ctx.restore();ctx.globalAlpha=1;}}}
  if(I.orbs){const L=I.L,m=mods(I),R=(L.port+m.portee)*M*(1+m.zone);for(let i=0;i<I.orbs.n;i++){const a=I.orbs.ang+i/I.orbs.n*TAU;ctx.fillStyle=I.col;ctx.beginPath();ctx.arc(P.x-cx+Math.cos(a)*R,P.y-cy+Math.sin(a)*R,4,0,TAU);ctx.fill();ctx.strokeStyle='#fff';ctx.stroke();}}
  if(I.coord){const t=I.coord.target;if(t&&!t.dead){ctx.strokeStyle='#7fcfff';ctx.beginPath();ctx.ellipse(t.x-cx,t.y-cy+6,t.r+6,(t.r+6)*.45,0,0,TAU);ctx.stroke();}}}}
function drawFx(cx,cy){for(const f of G.fx){const p=f.t/f.dur,x=f.x-cx,y=f.y-cy;if(x<-200||y<-200||x>W+200||y>H+200)continue;
 switch(f.k){case'ring':ctx.globalAlpha=1-p;ctx.strokeStyle=f.col;ctx.lineWidth=2-p;ctx.beginPath();ctx.arc(x,y,f.r0+(f.r1-f.r0)*p,0,TAU);ctx.stroke();break;
 case'etincelle':ctx.globalAlpha=1-p;ctx.fillStyle=f.col;ctx.fillRect(Math.round(x),Math.round(y),2,2);break;
 case'fumee':ctx.globalAlpha=(1-p)*.8;ctx.fillStyle='#e9e9e4';ctx.beginPath();ctx.arc(x,y,f.r*(1+p),0,TAU);ctx.fill();break;
 case'frappe':{ctx.globalAlpha=1-p;ctx.strokeStyle=f.big?'#ffdada':f.col;ctx.lineWidth=f.big?3:2;ctx.beginPath();ctx.arc(x-Math.cos(f.a)*f.r*.5,y-Math.sin(f.a)*f.r*.5,f.r*(.7+.3*p),f.a-.9,f.a+.9);ctx.stroke();break;}
 case'cone':ctx.globalAlpha=(1-p)*.5;ctx.fillStyle=f.col;ctx.beginPath();ctx.moveTo(x,y);ctx.arc(x,y,f.r*(.6+.4*p),f.a-f.half,f.a+f.half);ctx.closePath();ctx.fill();break;
 case'ligne':ctx.save();ctx.translate(x,y);ctx.rotate(f.a);ctx.globalAlpha=(1-p)*.8;ctx.fillStyle=f.col;ctx.fillRect(0,-f.w/2,f.len,f.w);ctx.restore();break;
 case'ligne2':ctx.globalAlpha=1-p;ctx.strokeStyle=f.col;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y-6);ctx.lineTo(f.x2-cx,f.y2-cy-6);ctx.stroke();break;
 case'eclair':{ctx.globalAlpha=1-p;ctx.strokeStyle=f.col;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,y);const n=5;for(let i=1;i<=n;i++){const t=i/n;ctx.lineTo(lerp(x,f.x2-cx,t)+(i<n?(Math.random()-.5)*8:0),lerp(y,f.y2-cy,t)+(i<n?(Math.random()-.5)*8:0));}ctx.stroke();break;}
 case'orbe':{const ox=x+(f.x2-f.x)*p,oy=y+(f.y2-f.y)*p;ctx.globalAlpha=1;ctx.fillStyle='#7fcfff';ctx.beginPath();ctx.arc(ox,oy-3,4,0,TAU);ctx.fill();break;}
 case'ghost':ctx.globalAlpha=(1-p)*.45;ninja(x,y+5,solid('#ffd7a0'),f.face,0,1);break;
 case'buche':ctx.globalAlpha=1-p;ctx.fillStyle='#8a5a2a';ctx.fillRect(Math.round(x-6),Math.round(y-3),12,6);break;}}
 ctx.globalAlpha=1;}
function drawProj(cx,cy){for(const k of G.proj){ctx.save();ctx.translate(Math.round(k.x-cx),Math.round(k.y-cy));ctx.rotate(k.a);if(k.kunai){ctx.fillStyle='#15161a';ctx.fillRect(-3,-1,6,2);ctx.fillStyle='#b8c0cc';ctx.fillRect(1,-1,2,1);}
  else if(k.aura){ctx.globalAlpha=.5;ctx.fillStyle=k.col;ctx.beginPath();ctx.arc(0,0,k.r,0,TAU);ctx.fill();ctx.globalAlpha=1;}else{ctx.fillStyle=k.col;ctx.fillRect(-4,-2,8,4);ctx.fillStyle='#fff';ctx.fillRect(1,-1,3,2);}ctx.restore();}
 for(const b of G.eproj){ctx.save();ctx.translate(Math.round(b.x-cx),Math.round(b.y-cy));ctx.rotate(b.a);if(b.k==='orbe'){ctx.fillStyle='#ff5050';ctx.beginPath();ctx.arc(0,0,5,0,TAU);ctx.fill();ctx.fillStyle='#200';ctx.beginPath();ctx.arc(0,0,3,0,TAU);ctx.fill();}
  else if(b.k==='carreau'){ctx.fillStyle='#ff4a4a';ctx.fillRect(-6,-2,12,4);ctx.fillStyle='#6a4a2a';ctx.fillRect(-5,-1,10,2);}else{ctx.fillStyle='#ff4a4a';ctx.fillRect(-4,-2,8,4);ctx.fillStyle='#15161a';ctx.fillRect(-3,-1,6,2);}ctx.restore();}}
function drawPickups(cx,cy){const COL={bleu:'#5fb8ff',vert:'#8fd14f',rouge:'#e04a4a',or:'#ffd23f'};
 for(const g of G.gems){const x=Math.round(g.x-cx),y=Math.round(g.y-cy);if(x<-8||y<-8||x>W+8||y>H+8)continue;const s=g.dense?4:g.c==='or'?4:g.c==='rouge'?3:2;ctx.fillStyle=g.dense?'#8a2a2a':COL[g.c]||'#5fb8ff';ctx.fillRect(x-s+1,y-s,2*s-2,2*s);ctx.fillRect(x-s,y-s+1,2*s,2*s-2);ctx.fillStyle='#fff';ctx.fillRect(x-1,y-s+1,1,1);}
 for(const r of G.rations){const x=r.x-cx,y=r.y-cy;ctx.fillStyle='#f0f0e8';ctx.beginPath();ctx.moveTo(x,y-5);ctx.lineTo(x+5,y+3);ctx.lineTo(x-5,y+3);ctx.fill();ctx.fillStyle='#1a1a1a';ctx.fillRect(x-3,y,6,3);}
 for(const a of G.aimants){ctx.fillStyle='#c83030';ctx.fillRect(Math.round(a.x-cx-4),Math.round(a.y-cy-5),8,10);ctx.fillStyle='#ffd23f';ctx.fillRect(Math.round(a.x-cx-2),Math.round(a.y-cy-2),4,4);}
 for(const c of G.coffres){const x=Math.round(c.x-cx),y=Math.round(c.y-cy+Math.sin(c.t*4)*1.5),lt=c.type==='lieutenant';ctx.globalAlpha=.3+.2*Math.sin(c.t*6);ctx.fillStyle=lt?'#ffb040':'#ffd84a';ctx.beginPath();ctx.arc(x,y,13,0,TAU);ctx.fill();ctx.globalAlpha=1;
  ctx.fillStyle=lt?'#8a2a1a':'#6a4424';ctx.fillRect(x-7,y-5,14,10);ctx.fillStyle='#ffd84a';ctx.fillRect(x-7,y-2,14,2);ctx.fillRect(x-1,y-3,2,4);}
 for(const r of G.rouleaux){const x=Math.round(r.x-cx),y=Math.round(r.y-cy+Math.sin(r.t*3)*1.5);ctx.globalAlpha=.3+.2*Math.sin(r.t*5);ctx.fillStyle=r.interdit?'#c83030':'#ffe28a';ctx.beginPath();ctx.arc(x,y,12,0,TAU);ctx.fill();ctx.globalAlpha=1;
  ctx.fillStyle=r.interdit?'#1a1a1a':'#e8d8a8';ctx.fillRect(x-6,y-3,12,6);ctx.fillStyle=r.interdit?'#c83030':'#8a6a3a';ctx.fillRect(x-8,y-4,3,8);ctx.fillRect(x+5,y-4,3,8);}
 for(const r of G.refugies){ninja(r.x-cx,r.y-cy+5,{body:'#b8a890',leg:'#6a5a4a',sh:'#8a7a6a',skin:'#e8cca8',hair:'#3a2a1a',hs:'court'},1,Math.floor(r.t*3)&1,1);txt('!',r.x-cx,r.y-cy-24,8,'#8fd14f','center',1);}
 if(G.stele&&!G.stele.trouve){const x=G.stele.x-cx,y=G.stele.y-cy;ctx.fillStyle='#6a6a70';ctx.fillRect(Math.round(x-5),Math.round(y-12),10,14);if(G.stele.visible&&Math.floor(G.time*3)%2===0){ctx.fillStyle='#ffd23f';ctx.fillRect(Math.round(x-1),Math.round(y-16),2,2);}}
 for(const f of G.faux){ctx.globalAlpha=.5;outlined(f.x-cx,f.y-cy+5,solid('#6a4a8a'),1,0,1,solid('#c8a8f0'));ctx.globalAlpha=1;}}
function drawFog(cx,cy){const r=G.brume||((G.brumeEvt>0)?9*M:0);if(!r||G.st.flags.antiBrume)return;const px=P.x-cx,py=P.y-cy,g=ctx.createRadialGradient(px,py,r-28,px,py,r+12);
 g.addColorStop(0,'rgba(196,206,216,0)');g.addColorStop(1,'rgba(196,206,216,.94)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 for(const e of G.enemies){if(!(e.boss||e.lieut)||e.hidden||e.dead)continue;const x=e.x-cx,y=e.y-cy;if(hyp(x-px,y-py)<r-20)continue;ctx.globalAlpha=.6;outlined(x,y+10,solid('#4a5a66'),e.face,0,2,OUT_B);ctx.globalAlpha=1;}}
function drawIndicators(cx,cy){const list=[];for(const e of G.enemies)if((e.boss||e.elite||e.lieut)&&!e.dead&&!e.hidden)list.push([e.x,e.y,e.boss?'#ff5050':e.lieut?'#ffb040':'#ffd84a']);
 for(const c of G.coffres)list.push([c.x,c.y,'#ffb040']);for(const r of G.rouleaux)list.push([r.x,r.y,r.interdit?'#c83030':'#ffe28a']);for(const r of G.refugies)list.push([r.x,r.y,'#8fd14f']);
 if(G.st.flags.rouleauPlus&&G.stele&&!G.stele.trouve)list.push([G.stele.x,G.stele.y,'#b8b8c8']);
 for(const b of G.eproj){const x=b.x-cx,y=b.y-cy;if(x<-4||y<-4||x>W+4||y>H+4)list.push([b.x,b.y,'#ff4a4a',1]);}
 for(const[wx,wy,col,petit]of list){const x=wx-cx,y=wy-cy;if(x>8&&y>8&&x<W-8&&y<H-8)continue;const a=Math.atan2(y-H/2,x-W/2),ex=clamp(x,14,W-14),ey=clamp(y,64,H-26);
  ctx.save();ctx.translate(ex,ey);ctx.rotate(a);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(petit?5:7,0);ctx.lineTo(-4,petit?-3:-5);ctx.lineTo(-4,petit?3:5);ctx.closePath();ctx.fill();ctx.restore();}}
function drawTexts(cx,cy){for(const t of G.texts){const x=t.x-cx,y=t.y-cy;const a=t.t<0?0:1-t.t/(t.s?1.6:.6);if(a<=0)continue;ctx.globalAlpha=Math.min(1,a*1.5);
 if(t.s)txt(t.s,x,y,7,t.col,'center',1);else txt(String(t.v),x,y,t.crit?9:7,t.col||(t.crit?'#ffd23f':'#ffffff'),'center',t.crit);}ctx.globalAlpha=1;}
function icone(I,x,y,s){ctx.fillStyle='#1a1e27';ctx.fillRect(x,y,s,s);ctx.fillStyle=I.col;ctx.fillRect(x+1,y+1,s-2,3);ctx.globalAlpha=.25;ctx.fillRect(x+1,y+4,s-2,s-5);ctx.globalAlpha=1;
 txt(I.nomStat.replace(/^(Katon|Suiton|Raiton|Fūton|Doton|Kage|Jiton|Ninpō|Hijutsu|Hiden)\s*[—:-]?\s*/,'').slice(0,3),x+s/2,y+5,Math.max(5,s*.36),'#ffffff','center',1,false);
 ctx.strokeStyle=I.evo?'#ffd23f':'#3a4152';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,s-1,s-1);}
function drawHUD(){const need=needXp(G.level),xr=clamp(G.xp/need,0,1);ctx.fillStyle='#10131a';ctx.fillRect(0,0,W,5);ctx.fillStyle='#5fb8ff';ctx.fillRect(0,0,Math.round(W*xr),5);ctx.fillStyle='#bfe4ff';ctx.fillRect(0,0,Math.round(W*xr),1);
 txt(`Niv. ${G.level}`,W-6,8,8,'#e8e6e1','right',1);txt(`${G.kills} éliminés`,W-6,19,7,'#9aa0aa','right');txt(`Rang ${G.rangId}`,W-6,29,6,'#9aa0aa','right');
 txt(mmss(G.time),W/2,8,11,'#ffffff','center',1);const bt=G.modeD.boss;if(bt&&G.time<bt&&G.mode!=='BossRush')txt(`Boss dans ${mmss(bt-G.time)}`,W/2,21,6,'#9aa0aa','center');
 if(bt&&G.time>=bt+300*G.f&&G.boss)txt(`Retraite forcée dans ${mmss(G.modeD.fin-G.time)}`,W/2,21,6,'#ff8080','center');
 const px=20,py=26,full=G.chakra>=100,pulse=Math.floor(G.rt*4)%2===0;ctx.fillStyle='#1a1e27';ctx.beginPath();ctx.arc(px,py,13,0,TAU);ctx.fill();ctx.strokeStyle='#23303a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(px,py,14.5,0,TAU);ctx.stroke();
 ctx.strokeStyle=full?(pulse?'#ffffff':'#7ff0ff'):'#3fc8e0';ctx.beginPath();ctx.arc(px,py,14.5,-Math.PI/2,-Math.PI/2+TAU*G.chakra/100);ctx.stroke();ninja(px,py+9,palPerso(G.chr.nom),1,0,1);
 const hx=38,hy=12,hw=112,hr=clamp(P.hp/P.maxhp,0,1);ctx.fillStyle='#3a1d1d';ctx.fillRect(hx,hy,hw,8);ctx.fillStyle=P.hp<P.maxhp*.3?'#ff9a3a':'#d8433a';ctx.fillRect(hx,hy,Math.round(hw*hr),8);
 if(P.shield>0){ctx.fillStyle='rgba(160,220,255,.8)';ctx.fillRect(hx,hy+6,Math.round(hw*clamp(P.shield/P.maxhp,0,1)),2);}
 txt(`${Math.ceil(P.hp)} / ${Math.round(P.maxhp)} PV`,hx+3,hy+1,6,'#ffffff','left',1);
 txt(full?'ULTIME PRÊT : E':`Chakra ${Math.floor(G.chakra)}`,hx,hy+10,6,full?'#7ff0ff':'#6fb8c8','left',full);
 if(G.trf){const t=G.trf;txt(t.actif?`${nomCourt(t.def.nom)} ${fr(t.t,0)} s`:t.cd>0?`Transfo. ${fr(t.cd,0)} s`:'Transfo. prête : R',hx+62,hy+10,6,t.actif?'#ff9a3a':'#c8a070','left',1);}
 for(let i=0;i<6;i++){const I=G.techs[i],x=38+i*19,y=32;if(I){icone(I,x,y,17);txt(I.evo?'É':String(I.lv),x+15,y+10,6,I.evo?'#ffd23f':'#ffffff','right',1);}else{ctx.strokeStyle='#2a303c';ctx.strokeRect(x+.5,y+.5,16,16);}}
 const slotsP=G.st.flags.passifs5?5:6;for(let i=0;i<6;i++){const id=G.pasOrder[i],x=38+i*19,y=52;if(i>=slotsP){ctx.fillStyle='#3a1a1a';ctx.fillRect(x,y,17,11);continue;}if(id){const d=PASD[id];ctx.fillStyle='#1a1e27';ctx.fillRect(x,y,17,11);ctx.fillStyle='#6ab0f0';ctx.fillRect(x,y,2,11);txt(d.stat.slice(0,2).toUpperCase(),x+4,y+2,6,'#bfe0ff','left',1);txt(String(G.pas[id]),x+16,y+2,6,'#ffffff','right');}else{ctx.strokeStyle='#2a303c';ctx.strokeRect(x+.5,y+.5,16,10);}}
 for(let i=0;i<2;i++){const id=G.eqp[i],x=38+i*19,y=66;if(id){const d=EQPD[id];ctx.fillStyle=d.rar==='Interdit'?'#2a0a0a':d.rar==='Rare'?'#1a2a3a':'#2a2418';ctx.fillRect(x,y,17,9);txt(d.nom.slice(0,3),x+8.5,y+1,6,d.rar==='Interdit'?'#ff6060':'#e8d8a8','center',1,false);}else{ctx.strokeStyle='#2a303c';ctx.strokeRect(x+.5,y+.5,16,8);}}
 const dx=20,dy=H-22,S=G.st;const dr=P.charges>=S.dashCharges?1:clamp(1-P.dashCd/(4*(1+S.dashCd)),0,1);if(!IN.touch){ctx.fillStyle='#1a1e27';ctx.beginPath();ctx.arc(dx,dy,10,0,TAU);ctx.fill();ctx.strokeStyle=P.charges>0?'#ffffff':'#6a7080';ctx.lineWidth=2;ctx.beginPath();ctx.arc(dx,dy,10,-Math.PI/2,-Math.PI/2+TAU*dr);ctx.stroke();txt(P.charges>1?'×'+P.charges:'ESQ',dx,dy-3,6,P.charges>0?'#fff':'#8a90a0','center',1);}
 if(G.time<25&&!IN.touch)txt('Espace : esquive · E : ultime · R : transformation · Tab : build · Échap : pause',34,H-25,6,'#c8ccd4');
 const b=G.boss&&!G.boss.dead?G.boss:null;if(b){const bw=380,bx=(W-bw)/2,by=H-20,r=clamp(b.hp/b.maxhp,0,1);txt(`${nomCourt(b.nom)} · phase ${b.phase}${b.generique?' · kit générique':''}`,W/2,by-11,7,'#ffd0d0','center',1);
  ctx.fillStyle='#2a1414';ctx.fillRect(bx,by,bw,7);ctx.fillStyle='#c83a3a';ctx.fillRect(bx,by,Math.round(bw*r),7);ctx.fillStyle='#fff';for(const ph of b.phases.slice(1))ctx.fillRect(Math.round(bx+bw*ph.hi/100),by-1,1,9);
  const v=vulnOf(b);if(v>0)txt(`Vulnérable +${Math.round(v*100)} %`,bx+bw,by-11,6,'#c77dff','right',1);}
 const bn=G.banners[0];if(bn){const a=Math.min(1,bn.t/.4,(bn.dur-bn.t)/.25+.2);ctx.globalAlpha=clamp(a,0,1);txt(bn.title,W/2,74,12,'#ffffff','center',1);if(bn.sub){let y=90;for(const l of wrap(bn.sub,W-120,7).slice(0,3)){txt(l,W/2,y,7,'#d8dce4','center');y+=9;}}ctx.globalAlpha=1;}
 if(P.hurtT>0){ctx.globalAlpha=P.hurtT*2;const g=ctx.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.8);g.addColorStop(0,'rgba(200,0,0,0)');g.addColorStop(1,'rgba(200,0,0,.5)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.globalAlpha=1;}
 if(G.aveugleT>0){ctx.fillStyle='rgba(20,20,30,.5)';ctx.fillRect(0,0,W,H);}
 txt('Sprites provisoires (PH)',W-4,H-9,6,'rgba(232,230,225,.4)','right',false,false);
 if(IN.touch){btn(W-40,H-46,20,'ESQ',P.charges>0);btn(W-88,H-30,15,'ULT',full);btn(W-18,42,10,'II',true);if(G.trf)btn(W-40,H-92,13,'TRF',!G.trf.actif&&G.trf.cd<=0);
  if(IN.joy){ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(IN.joy.ox,IN.joy.oy,24,0,TAU);ctx.stroke();const dx2=IN.joy.x-IN.joy.ox,dy2=IN.joy.y-IN.joy.oy,d=hyp(dx2,dy2),m=Math.min(d,24)/(d||1);ctx.fillStyle='rgba(255,255,255,.4)';ctx.beginPath();ctx.arc(IN.joy.ox+dx2*m,IN.joy.oy+dy2*m,9,0,TAU);ctx.fill();}}}
const BTN={dash:[W-40,H-46,24],ult:[W-88,H-30,19],pause:[W-18,42,14],trf:[W-40,H-92,16]};
function btn(x,y,r,l,on){ctx.fillStyle=on?'rgba(255,255,255,.22)':'rgba(255,255,255,.08)';ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fill();ctx.strokeStyle=on?'rgba(255,255,255,.7)':'rgba(255,255,255,.25)';ctx.lineWidth=1;ctx.stroke();txt(l,x,y-3,6,'#ffffff','center',1,false);}
function renderJeu(){const cx=G.cam.x,cy=G.cam.y;drawGround(cx,cy);drawPickups(cx,cy);drawTechObjs(cx,cy);for(const h of G.hz)if(h.shape!=='arene')drawDanger(h,cx,cy);
 drawObstacles(cx,cy,false);
 const list=[];for(const e of G.enemies)if(!e.dead&&!e.hidden)list.push(['e',e,e.y]);for(const I of G.techs)for(const u of I.units)list.push(['u',u,u.y,I]);list.push(['p',P,P.y]);list.sort((a,b)=>a[2]-b[2]);
 for(const[k,o,,I]of list){if(k==='p')drawPlayer(cx,cy);else if(k==='u')drawUnit(I,o,cx,cy);else drawEnemy(o,cx,cy);}
 drawObstacles(cx,cy,true);drawProj(cx,cy);drawFx(cx,cy);if(G.ult)for(const p of G.ult.pts)if(p.a!==undefined&&!p.done)outlined(p.x-cx,p.y-cy+5,desat(palPerso(G.chr.nom)),Math.cos(p.a)>=0?1:-1,0,1,OUT_C);
 for(const h of G.hz)if(h.shape==='arene')drawDanger(h,cx,cy);drawFog(cx,cy);if(G.brume||G.brumeEvt>0)for(const h of G.hz)drawDanger(h,cx,cy);
 drawTexts(cx,cy);drawIndicators(cx,cy);drawHUD();}
