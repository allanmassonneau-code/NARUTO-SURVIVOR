// Sprites provisoires (PH) : silhouettes procédurales reconnaissables par la couleur et la coiffure.
// hs = coiffure (pic, long, court, chignon, queue, chauve, capuche) ; acc = accessoires.
const PAL_PERSO={
 Naruto:{body:'#f28a1e',leg:'#e27812',sh:'#2a3550',skin:'#f2c79a',hair:'#ffd23f',band:'#2f4f9a',hs:'pic'},
 Sasuke:{body:'#2a3a6a',leg:'#e8e4dc',sh:'#1a2440',skin:'#f0d6b8',hair:'#1a1a2a',band:'#2f4f9a',hs:'pic'},
 Sakura:{body:'#c8303a',leg:'#3a3a4a',sh:'#a02028',skin:'#f4d6bc',hair:'#f4a0c0',band:'#2f4f9a',hs:'long'},
 Kakashi:{body:'#4a5a6a',leg:'#34404e',sh:'#5a7a3a',skin:'#e8d4bc',hair:'#d8dce4',band:'#2f4f9a',hs:'pic',acc:['masque','gilet']},
 Gaara:{body:'#8a3a2a',leg:'#5a2a22',sh:'#6a2a1e',skin:'#f0dcc8',hair:'#c83a2a',hs:'court',acc:['gourde']},
 Rock:{body:'#3a8a3a',leg:'#2e7a2e',sh:'#f28a1e',skin:'#f0d0b0',hair:'#101014',band:'#c83a2a',hs:'court'},
 Neji:{body:'#e8e0d0',leg:'#5a5a6a',sh:'#c8c0b0',skin:'#f0dcc8',hair:'#3a2a20',band:'#2f4f9a',hs:'long',acc:['yeuxblancs']},
 Hinata:{body:'#b8b0d8',leg:'#3a3a5a',sh:'#8a82b0',skin:'#f4e0d0',hair:'#2a2a4a',band:'#2f4f9a',hs:'long',acc:['yeuxblancs']},
 Shikamaru:{body:'#5a6a4a',leg:'#3a4050',sh:'#4a5a3a',skin:'#e8cca8',hair:'#2a2420',band:'#2f4f9a',hs:'queue',acc:['gilet']},
 Shino:{body:'#6a7a5a',leg:'#4a5040',sh:'#4a5a3a',skin:'#e0c8a8',hair:'#2a2a2a',hs:'capuche',acc:['lunettes']},
 Kiba:{body:'#4a4a5a',leg:'#3a3a4a',sh:'#8a6a4a',skin:'#e0bc98',hair:'#3a2a1e',band:'#2f4f9a',hs:'pic',acc:['chien']},
 Kankurō:{body:'#2a2a3a',leg:'#20202a',sh:'#1a1a24',skin:'#e8d0b0',hair:'#2a2a3a',hs:'capuche',acc:['peinture']},
 Temari:{body:'#6a4a8a',leg:'#4a3a6a',sh:'#8a6aa8',skin:'#f0d4b4',hair:'#e8c860',hs:'chignon',acc:['eventail']},
 Jiraiya:{body:'#6a8a4a',leg:'#c83a2a',sh:'#c83a2a',skin:'#e8c8a4',hair:'#e8e8ec',hs:'long'},
 Tsunade:{body:'#6a8a5a',leg:'#3a3a4a',sh:'#e8e4dc',skin:'#f4dcc0',hair:'#f0d060',hs:'queue'},
 Orochimaru:{body:'#e0dcc8',leg:'#6a5a8a',sh:'#8a6aa8',skin:'#e8e4dc',hair:'#1a1a1e',hs:'long'},
 Itachi:{body:'#1a1a22',leg:'#1a1a22',sh:'#c83030',skin:'#f0d8c0',hair:'#1a1a22',band:'#6a6a7a',hs:'queue',acc:['akatsuki']},
 Kisame:{body:'#1a1a22',leg:'#1a1a22',sh:'#c83030',skin:'#6a8ab0',hair:'#3a4a6a',band:'#6a6a7a',hs:'pic',acc:['akatsuki','samehada']},
 Deidara:{body:'#1a1a22',leg:'#1a1a22',sh:'#c83030',skin:'#f0dcc8',hair:'#f0d060',hs:'queue',acc:['akatsuki']},
 Sasori:{body:'#1a1a22',leg:'#1a1a22',sh:'#c83030',skin:'#f0dcc8',hair:'#c83a2a',hs:'court',acc:['akatsuki']},
 Pain:{body:'#1a1a22',leg:'#1a1a22',sh:'#c83030',skin:'#e8d0b8',hair:'#e87a2a',hs:'pic',acc:['akatsuki','percings']},
 Minato:{body:'#e8e4dc',leg:'#3a4a6a',sh:'#c83a2a',skin:'#f4dcc0',hair:'#ffe060',band:'#2f4f9a',hs:'pic',acc:['gilet']},
 Madara:{body:'#8a2a2a',leg:'#4a1a1a',sh:'#6a6a7a',skin:'#f0d8c0',hair:'#1a1a22',hs:'long'},
 Might:{body:'#3a8a3a',leg:'#2e7a2e',sh:'#5a7a3a',skin:'#f0d0b0',hair:'#101014',band:'#c83a2a',hs:'court',acc:['gilet']},
 Ino:{body:'#6a3a8a',leg:'#4a2a6a',sh:'#8a5aa8',skin:'#f4dcc0',hair:'#f0e080',hs:'queue'},
 Chōji:{body:'#c83a2a',leg:'#6a5a3a',sh:'#8a2a1e',skin:'#e8c8a0',hair:'#8a5a2a',hs:'pic',acc:['large']},
 Tenten:{body:'#e8e0d0',leg:'#c83a2a',sh:'#c83a2a',skin:'#f0d4b4',hair:'#5a3a2a',hs:'chignon'},
 Sai:{body:'#2a2a3a',leg:'#2a2a3a',sh:'#1a1a24',skin:'#f4f0ec',hair:'#1a1a22',band:'#2f4f9a',hs:'court'},
 Yamato:{body:'#4a5a6a',leg:'#34404e',sh:'#5a7a3a',skin:'#e8cca8',hair:'#4a3a2a',band:'#b8bcc8',hs:'court',acc:['gilet']},
 Asuma:{body:'#4a5a6a',leg:'#34404e',sh:'#5a7a3a',skin:'#e0c098',hair:'#2a2420',band:'#2f4f9a',hs:'court',acc:['gilet']},
 Haku:{body:'#6a8a6a',leg:'#4a5a4a',sh:'#8aa08a',skin:'#f4e8dc',hair:'#1a1a22',hs:'long',acc:['masquehaku']},
 Zabuza:{body:'#7d8b93',leg:'#4a5760',sh:'#5a6770',skin:'#e3d2bd',hair:'#1c1c20',band:'#6d7a86',hs:'court',acc:['bandages','couperet']},
 Konan:{body:'#1a1a22',leg:'#1a1a22',sh:'#c83030',skin:'#e8dcd8',hair:'#6a5ab0',hs:'chignon',acc:['akatsuki']},
 Hidan:{body:'#1a1a22',leg:'#1a1a22',sh:'#c83030',skin:'#f0e0d0',hair:'#d8dce4',hs:'court',acc:['akatsuki','faux']},
 Kakuzu:{body:'#1a1a22',leg:'#1a1a22',sh:'#c83030',skin:'#8a6a4a',hair:'#3a3a3a',hs:'capuche',acc:['akatsuki','masque']},
 Killer:{body:'#e8e4dc',leg:'#3a3a4a',sh:'#8a6a4a',skin:'#8a5a3a',hair:'#e8e4dc',hs:'chauve',acc:['lunettes']},
 Hashirama:{body:'#c83a2a',leg:'#6a2a1e',sh:'#8a2a1e',skin:'#e0bc98',hair:'#1a1a22',hs:'long'},
 Tobirama:{body:'#3a4a7a',leg:'#2a3a5a',sh:'#e8e4dc',skin:'#f0dcc8',hair:'#e8e8ec',band:'#2f4f9a',hs:'pic'},
 Obito:{body:'#1a1a22',leg:'#1a1a22',sh:'#3a3a4a',skin:'#f08a24',hair:'#1a1a22',hs:'court',acc:['masquetobi']},
 Kabuto:{body:'#6a4a8a',leg:'#4a3a6a',sh:'#8a6aa8',skin:'#e8d4bc',hair:'#d8dce4',hs:'queue',acc:['lunettes']},
 Hiruzen:{body:'#e8e4dc',leg:'#3a3a4a',sh:'#c83a2a',skin:'#e0c098',hair:'#b8b8b8',hs:'capuche'},
 Kurenai:{body:'#e8e0d0',leg:'#c83a3a',sh:'#c83a3a',skin:'#f4dcc8',hair:'#1a1a22',band:'#2f4f9a',hs:'long'},
 Kimimaro:{body:'#e8e4dc',leg:'#6a5a8a',sh:'#8a6aa8',skin:'#f4f0ec',hair:'#e8e8ec',hs:'long'},
 Mei:{body:'#2a4a8a',leg:'#1a2a5a',sh:'#3a5aa8',skin:'#f4dcc8',hair:'#c86a3a',hs:'long'},
 Ōnoki:{body:'#6a8a3a',leg:'#c83a2a',sh:'#c83a2a',skin:'#e8c8a4',hair:'#d8dce4',hs:'chauve'},
 A:{body:'#e8e4dc',leg:'#3a3a4a',sh:'#e8c860',skin:'#8a5a3a',hair:'#e8e8ec',hs:'court',acc:['large']},
 Darui:{body:'#4a5a6a',leg:'#34404e',sh:'#e8e4dc',skin:'#8a5a3a',hair:'#e8e8ec',hs:'court',acc:['gilet']},
 Pakura:{body:'#6a8a5a',leg:'#4a5a3a',sh:'#8a6a4a',skin:'#e8c8a8',hair:'#3a2a2a',hs:'long'},
 Rasa:{body:'#6a8a6a',leg:'#4a5a4a',sh:'#e8e4dc',skin:'#e8c8a8',hair:'#8a3a2a',hs:'court'},
 Chiyo:{body:'#8a6a4a',leg:'#6a5a3a',sh:'#c83a2a',skin:'#d8bca0',hair:'#b8b8b8',hs:'chignon'},
 Karin:{body:'#6a4a8a',leg:'#1a1a22',sh:'#8a6aa8',skin:'#f0dcc8',hair:'#c82a3a',hs:'long',acc:['lunettes']},
 Suigetsu:{body:'#8a6aa8',leg:'#3a3a5a',sh:'#6a4a8a',skin:'#e8e4ec',hair:'#e8e8f0',hs:'court'},
 Kushina:{body:'#e8e4dc',leg:'#3a4a6a',sh:'#c83a2a',skin:'#f4dcc0',hair:'#c82a2a',hs:'long'},
 Shisui:{body:'#1a1a22',leg:'#4a5a6a',sh:'#5a7a3a',skin:'#f0d8c0',hair:'#1a1a22',hs:'pic',acc:['gilet']},
 Konohamaru:{body:'#e8c860',leg:'#3a4a6a',sh:'#c83a2a',skin:'#f0d0b0',hair:'#5a3a2a',band:'#2f4f9a',hs:'pic'},
 Mū:{body:'#e8e4dc',leg:'#e8e4dc',sh:'#b8b8b8',skin:'#f0f0f0',hair:'#f0f0f0',hs:'capuche',acc:['bandages']},
};
function palPerso(nom){const k=String(nom).split(' ')[0].replace(/[—(].*/,'');if(PAL_PERSO[k])return PAL_PERSO[k];
 const h=hashStr(nom);const hue=h%360;return{body:`hsl(${hue},35%,42%)`,leg:`hsl(${hue},25%,28%)`,sh:`hsl(${(hue+40)%360},30%,35%)`,skin:'#e8cca8',hair:`hsl(${(h>>9)%360},30%,${20+(h>>17)%40}%)`,band:'#2f4f9a',hs:['pic','court','long','queue'][h%4]};}
const solid=c=>({body:c,leg:c,sh:c,skin:c,hair:c,band:c,plate:c,mask:c,solid:1,hs:'court'});
const WHITE=solid('#ffffff'),OUT_P=solid('#ffffff'),OUT_C=solid('#9fe0ff'),OUT_E=solid('#ffd84a'),OUT_B=solid('#ff5a5a'),OUT_A=solid('#8fd14f');
function desat(p){const o={};for(const k in p)o[k]=p[k];o.body=mix(p.body,'#b8c4d0',.3);o.leg=mix(p.leg,'#b8c4d0',.3);return o;}
function mix(a,b,t){const pa=hexRgb(a),pb=hexRgb(b);if(!pa||!pb)return a;return'#'+[0,1,2].map(i=>Math.round(lerp(pa[i],pb[i],t)).toString(16).padStart(2,'0')).join('');}
function hexRgb(h){if(typeof h!=='string'||h[0]!=='#'||h.length!==7)return null;return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];}

function ninja(x,y,p,face,fm,s,extra){
 s=s||1;x=Math.round(x);y=Math.round(y);
 const r=(dx,dy,w,h,c)=>{if(!c)return;ctx.fillStyle=c;ctx.fillRect(x+(face<0?-dx-w:dx)*s,y+dy*s,w*s,h*s);};
 const lg=fm&1,acc=p.acc||[],large=acc.includes('large')?1:0;
 if(acc.includes('akatsuki')&&!p.solid){r(-5-large,-11,10+2*large,9,p.body);r(-4,-9,2,2,'#c83030');r(2,-6,2,2,'#c83030');r(-5-large,-11,10+2*large,1,'#e8e4dc');}
 r(-3,-4-(lg?1:0),2,4,p.leg);r(1,-4-(lg?0:1),2,4,p.leg);
 r(-4-large,-10,8+2*large,6,p.body);r(-4-large,-10,8+2*large,1,p.sh);
 if(acc.includes('gilet')&&!p.solid)r(-4,-10,8,4,'#5a7a3a');
 r(3+large,-9+(lg?1:0),2,4,p.body);r(-5-large,-9+(lg?0:1),2,3,p.body);
 if(acc.includes('gourde')&&!p.solid){r(-7,-12,4,5,'#b8946a');r(-6,-14,2,2,'#b8946a');}
 if(acc.includes('couperet')&&!p.solid){r(-9,-15,14,3,'#9aa3ad');r(-8,-14,2,1,'#20242b');}
 if(acc.includes('samehada')&&!p.solid)r(-7,-16,3,9,'#4a6a8a');
 if(acc.includes('eventail')&&!p.solid)r(-7,-15,3,8,'#c8b890');
 if(acc.includes('faux')&&!p.solid){r(-7,-18,1,12,'#6a6a6a');r(-10,-18,4,2,'#c83030');}
 r(-3,-15,6,5,p.skin);
 const hs=p.hs||'court';
 if(hs==='capuche'){r(-4,-17,8,3,p.body);r(-4,-15,1,4,p.body);r(3,-15,1,3,p.body);}
 else if(hs!=='chauve'){r(-4,-17,8,2,p.hair);r(-4,-15,1,2,p.hair);}
 if(hs==='pic'){r(-5,-18,2,1,p.hair);r(-1,-19,2,2,p.hair);r(3,-18,2,1,p.hair);r(-5,-16,1,2,p.hair);}
 if(hs==='long'){r(-5,-15,1,7,p.hair);r(-4,-15,1,6,p.hair);}
 if(hs==='queue'){r(-6,-15,2,5,p.hair);}
 if(hs==='chignon'){r(-5,-19,2,2,p.hair);r(3,-19,2,2,p.hair);}
 if(p.band&&hs!=='capuche'){r(-3,-15,6,1,p.band);r(0,-15,2,1,p.plate||'#cfd4dc');}
 if(p.mask)r(-3,-12,6,2,p.mask);
 if(!p.solid){
  if(acc.includes('masque'))r(-3,-12,6,2,'#2a2a3a');
  if(acc.includes('bandages'))r(-3,-12,6,2,'#ebe6dc');
  if(acc.includes('masquetobi')){r(-3,-15,6,5,'#f08a24');r(0,-13,1,1,'#1a1a1a');}
  else if(acc.includes('masquehaku')){r(-3,-15,6,5,'#f4f4f4');r(1,-13,1,1,'#c83030');}
  else r(1,-13,1,1,acc.includes('yeuxblancs')?'#e8e8f8':'#15151a');
  if(acc.includes('lunettes'))r(0,-13,3,1,'#3a3a3a');
  if(acc.includes('peinture'))r(-2,-13,1,2,'#8a4ab0');
  if(acc.includes('chien'))r(-9,-5,4,3,'#e8e4dc');
 }
 if(extra)extra(r,p);
}
function outlined(x,y,p,face,fm,s,op,extra){for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]])ninja(x+dx,y+dy,op,face,fm,s,extra);ninja(x,y,p,face,fm,s,extra);}

// Palettes d'ennemis selon le village ou la nature (mots du nom).
function palEnnemi(e){const n=e.nom;const h=hashStr(n);
 const base=/Kiri|brume/.test(n)?['#3d5566','#2c3e4d','#b7c2c9']:/Son|Oto/.test(n)?['#6a5a7a','#3a3040','#c8b8d8']:/Suna|désert/.test(n)?['#b39664','#8a7050','#e8d4a8']:
  /Kumo/.test(n)?['#e8e4dc','#4a4a5a','#c8c8d8']:/Iwa|roche|Golem/.test(n)?['#8a6a4a','#5a4a3a','#b8a080']:/Ame|pluie|papier/.test(n)?['#4a5a7a','#2a3a4a','#a8b8c8']:
  /Racine|ANBU/.test(n)?['#2a2a34','#1a1a22','#d8d8e0']:/Uchiha|fantôme|spectral/.test(n)?['#2a2a4a','#1a1a2a','#c83030']:/Zetsu/.test(n)?['#f0f0e8','#d8d8d0','#4a8a3a']:
  /samouraï|Samouraï/.test(n)?['#8a8a9a','#4a4a5a','#c8c8d0']:/Marionnette|marionnet/.test(n)?['#8a6a4a','#6a4a3a','#c8a878']:/Medic|Médecin|guérisseur|Prêtre/.test(n)?['#e8e4dc','#5a6a5a','#7ad04a']:
  /Bandit|Gatō|Brute|Chasseur/.test(n)?['#7a5a3a','#4b3a2a','#b8a07a']:[`hsl(${h%360},30%,40%)`,`hsl(${h%360},25%,25%)`,'#c8c8c8'];
 return{body:base[0],leg:base[1],sh:base[1],skin:/Zetsu/.test(n)?'#f0f0e8':'#e0c9a6',hair:`hsl(${(h>>5)%360},20%,20%)`,band:base[2],hs:['court','pic','capuche'][h%3]};}
const BETE=/Shukaku|Kurama|Queues|Hachibi|Sanbi|Manda|Isobu|Gyūki|bête|Serpent de la forêt|Tigre|Sanglier|Rhinocéros|Araignée|Sangsue|Renard|Scorpion|chiens|loups/;
function estBete(nom){return BETE.test(nom);}
// Créature (bêtes, invocations) : corps, tête, oreilles, queues.
function bete(x,y,sz,col,face,t,queues,nom){x=Math.round(x);y=Math.round(y);const s=sz/32;
 ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(x,y,14*s,4*s,0,0,TAU);ctx.fill();
 const dark=mix(col,'#000000',.35),light=mix(col,'#ffffff',.3);
 for(let i=0;i<(queues||0);i++){const a=Math.PI+(i-(queues-1)/2)*.28+Math.sin(t*3+i)*.08;ctx.strokeStyle=dark;ctx.lineWidth=Math.max(2,3*s);ctx.beginPath();ctx.moveTo(x-face*6*s,y-10*s);ctx.quadraticCurveTo(x-face*(16*s)+Math.cos(a)*6*s,y-22*s+Math.sin(a)*4*s,x-face*(20*s)+Math.cos(a)*10*s,y-30*s+Math.sin(a)*10*s);ctx.stroke();}
 ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x,y-10*s,12*s,9*s,0,0,TAU);ctx.fill();
 ctx.fillStyle=light;ctx.beginPath();ctx.ellipse(x,y-7*s,7*s,5*s,0,0,TAU);ctx.fill();
 ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(x+face*10*s,y-19*s,7*s,6*s,0,0,TAU);ctx.fill();
 ctx.fillStyle=dark;ctx.fillRect(Math.round(x+face*5*s),Math.round(y-28*s),Math.round(3*s),Math.round(5*s));ctx.fillRect(Math.round(x+face*12*s),Math.round(y-28*s),Math.round(3*s),Math.round(5*s));
 ctx.fillStyle='#ffe060';ctx.fillRect(Math.round(x+face*13*s),Math.round(y-21*s),Math.max(1,Math.round(2*s)),Math.max(1,Math.round(2*s)));
 ctx.fillStyle=dark;ctx.fillRect(Math.round(x-8*s),Math.round(y-3*s),Math.round(4*s),Math.round(4*s));ctx.fillRect(Math.round(x+4*s),Math.round(y-3*s),Math.round(4*s),Math.round(4*s));}
function couleurBete(nom){return /Shukaku|sable|Scorpion/.test(nom)?'#c8a870':/Kurama|Renard/.test(nom)?'#e8702a':/Dix-Queues/.test(nom)?'#6a6a8a':/Hachibi|Gyūki/.test(nom)?'#8a5a4a':
 /Sanbi|Isobu/.test(nom)?'#7a9aa0':/Manda|Serpent|serpents/.test(nom)?'#8a6ab0':/Tigre/.test(nom)?'#e0a040':/Sanglier/.test(nom)?'#6a4a3a':/Araignée/.test(nom)?'#3a3a3a':/Sangsue/.test(nom)?'#5a3a4a':'#8a8a7a';}
function nbQueues(nom){const m=nom.match(/(Dix|Huit|Trois|une|Neuf)/);if(/Dix-Queues|Dix/.test(nom))return 10;if(/Kurama/.test(nom))return 9;if(/Hachibi|Gyūki/.test(nom))return 8;if(/Sanbi|Isobu/.test(nom))return 3;if(/Shukaku/.test(nom))return 1;if(/Renard/.test(nom))return 1;return 0;}
