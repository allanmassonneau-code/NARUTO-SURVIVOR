// Combat : états (§R7), dégâts infligés (§B4.2), dégâts subis (§B4.4), contrôle des boss (§B4.10).
const ST_BASE={STA_01:{d:3,max:5},STA_02:{d:5,max:1},STA_03:{d:2,max:1},STA_04:{d:.2,max:1,ctrl:1},STA_05:{d:3,max:3},STA_06:{d:3,max:3},STA_07:{d:2,max:1,ctrl:1},
 STA_08:{d:5,max:10},STA_09:{d:6,max:1},STA_10:{d:2,max:1,ctrl:1},STA_11:{d:1,max:1,ctrl:1},STA_12:{d:2,max:1},STA_14:{d:6,max:10},STA_15:{d:1.5,max:3},
 STA_16:{d:2,max:1,ctrl:1},STA_17:{d:4,max:1},STA_18:{d:4,max:3},STA_19:{d:1.5,max:1,ctrl:1},STA_20:{d:6,max:1},STA_21:{d:3,max:1},STA_22:{d:3,max:1},STA_23:{d:3,max:1}};
const hasSt=(e,c)=>!!(e.st&&e.st[c]&&e.st[c].t>0);
function stN(e,c){return e.st&&e.st[c]&&e.st[c].t>0?e.st[c].n:0;}
function applySt(e,spec,I,x,y){if(!e||e.dead)return;const[code,v,u]=spec;const b=ST_BASE[code];if(!b)return;const S=G.st;
 if(code==='STA_12'){addVuln(e,(u==='%'?v:5)/100,u==='s'?v:2);return;}
 let dur=u==='s'?v:b.d,stacks=u===''&&v>=1?Math.round(v):1;
 const m=I?mods(I):null;dur*=1+(m?m.dur:0)+(S.stDur[code]||0)/Math.max(.5,b.d);
 if(b.ctrl)dur*=1+S.ctrlDur;
 if(b.ctrl&&(e.boss||e.lieut)){dur*=1-e.rc/100;e.rc=Math.min(80,e.rc+Math.max(0,20-S.bossRc));if(dur<.2){addVuln(e,.05,2);return;}}
 if((code==='STA_05'||code==='STA_06')&&e.immun&&e.immun[code]>0)return;
 e.st=e.st||{};const o=e.st[code]||(e.st[code]={n:0,t:0,src:null,acc:0});
 const max=S.stMax[code]||b.max;o.n=Math.min(max,(o.t>0?o.n:0)+stacks);o.t=Math.max(o.t,dur);o.src=I;
 if(code==='STA_01'||code==='STA_08'||code==='STA_14')o.a=I?mods(I).A:1+S.power;
 if(code==='STA_15'){o.dmg=I?(I.L.d||20):20;o.boom=1.5;}
 if(code==='STA_22'){o.px=x===undefined?P.x:x;o.py=y===undefined?P.y:y;}
 if(code==='STA_05'&&o.n>=3&&!(e.gel>0)){e.gel=(e.boss?1-e.rc/100:1);o.n=0;o.t=0;e.immun=e.immun||{};e.immun.STA_05=3;}
 if(code==='STA_06'&&o.n>=3&&!(e.ensev>0)){e.ensev=(e.boss?1.2*(1-e.rc/100):1.2);o.n=0;o.t=0;e.immun=e.immun||{};e.immun.STA_06=3.2;}
 if(code==='STA_04')e.micro=Math.max(e.micro||0,e.boss?.1:.2);
 if(code==='STA_18')o.ox=e.x,o.oy=e.y;
 if(I)CPT_RUN('st_'+code,stacks);if(b.ctrl&&I&&I.fam==='GENJUTSU')CPT_RUN('ctrl_gen',1);}
function addVuln(e,a,t){(e.vulns||(e.vulns=[])).push({a,t});}
function vulnOf(e){let v=0;if(e.vulns)for(const x of e.vulns)v+=x.a;return Math.min(.5,v);}
function slowOf(e){let s=0;if(!e.st)return 0;s+=hasSt(e,'STA_03')?.1:0;s+=.1*stN(e,'STA_05');s+=.08*stN(e,'STA_06');s+=.02*stN(e,'STA_14');s+=hasSt(e,'STA_21')?.15:0;
 return e.boss||e.lieut?Math.min(.3,s):Math.min(.8,s);}
function immobile(e){return e.gel>0||e.ensev>0||e.micro>0||hasSt(e,'STA_07')||hasSt(e,'STA_11')||hasSt(e,'STA_19');}
function peutAgir(e){return!(e.gel>0||e.ensev>0||e.micro>0||hasSt(e,'STA_07')||hasSt(e,'STA_11'));}
function updStates(e){if(e.vulns&&e.vulns.length){for(const v of e.vulns)v.t-=DT;e.vulns=e.vulns.filter(v=>v.t>0);}
 if(e.gel>0)e.gel-=DT;if(e.ensev>0)e.ensev-=DT;if(e.micro>0)e.micro-=DT;if(e.rc>0)e.rc=Math.max(0,e.rc-5*DT);
 if(e.immun)for(const k in e.immun)e.immun[k]-=DT;
 if(!e.st)return;e.dotT=(e.dotT||0)+DT;const tickDot=e.dotT>=.5;if(tickDot)e.dotT-=.5;
 for(const k in e.st){const o=e.st[k];if(o.t<=0)continue;o.t-=DT;
  if(tickDot&&o.n>0){if(k==='STA_01')hitDot(e,1.5*o.n*o.a,o.src,false,'Brûlure');else if(k==='STA_08')hitDot(e,1*o.n*(o.a||1)*(1+(G.st.flags.poisonDmg||0)),o.src,true,'Poison');else if(k==='STA_14')hitDot(e,.5*o.n,o.src,false,'Parasité');}
  if(k==='STA_18'&&o.n>0){const d=hyp(e.x-o.ox,e.y-o.oy)/M;if(d>=.25){hitDot(e,4*o.n*d*(G.synPlaies&&hasSt(e,'STA_01')?1.5:1),o.src,false,'Entaillé');o.ox=e.x;o.oy=e.y;}}
  if(k==='STA_15'&&o.n>0){o.boom-=DT;if(o.boom<=0){const r=1.5*M;for(const q of G.enemies)if(!q.dead&&hyp(q.x-e.x,q.y-e.y)<r+q.r)hit(q,o.dmg*.8,o.src,{sec:1});fxRing(e.x,e.y,r,'#e8c090');o.n=0;o.t=0;}}
  if(k==='STA_22'&&!e.boss){const dx=o.px-e.x,dy=o.py-e.y,d=hyp(dx,dy);if(d>4){e.x+=dx/d*.5*M*DT;e.y+=dy/d*.5*M*DT;}}}}
function hitDot(e,d,I,ignoreRes,nom){if(e.dead||e.invuln)return;let v=d*(1+vulnOf(e));if(!ignoreRes)v*=1-Math.min(.5,Math.max(0,(e.res||0)-(hasSt(e,'STA_17')?.15:0)));
 v=Math.max(1,Math.round(v));e.hp-=v;statDmg(I,v,nom);if(OPT.degatsTexte&&G.texts.length<40&&Math.random()<.3)G.texts.push({x:e.x,y:e.y-14,v,t:0,col:'#b8e08a'});
 if(e.boss||e.lieut)bossPhase(e);else if(e.hp<=0)kill(e,I);}
function statDmg(I,v,nom){const k=I?I.nomStat:(nom||'Autre');G.dmgBy[k]=(G.dmgBy[k]||0)+v;}

// Dégâts infligés : Final = max(1, arrondi(B × A × M × C × V × R))
function hit(e,B,I,o){o=o||{};if(!e||e.dead||e.invuln||e.hidden||e.spawnT>0)return 0;
 const S=G.st,m=I?mods(I):{A:1+S.power,M:S.mult,crit:S.crit,critd:S.critd};
 let A=m.A+(o.addA||0),crit=m.crit;for(const t of S.tgt)if(t.f(I,e)){A+=t.dmg||0;crit+=t.crit||0;}
 if(G.synA)A+=synBonus(I,e);
 const sec=o.sec||0,M_=sec?1:m.M*(o.mul||1),isCrit=!sec&&!o.noCrit&&G.rX()<crit,C=isCrit?(m.critd+(G.synCritd&&hasSt(e,'STA_09')&&vulnOf(e)>=.2?.3:0)):1;
 let pre=B*A*M_*C;if(hasSt(e,'STA_23')&&false)pre*=1;
 let fin=pre*(1+vulnOf(e)+(hasSt(e,'STA_17')&&!e.boss?.1:0));
 if(!o.poison)fin*=1-Math.min(.5,Math.max(0,(e.res||0)-(hasSt(e,'STA_17')?.15:0)));
 if(e.mods)fin=eliteDefense(e,fin,I,o);
 fin=Math.max(1,Math.round(fin));
 e.hp-=fin;e.flash=.08;statDmg(I,fin);if(e.soin)e.dmgPendant=(e.dmgPendant||0)+fin;G.chakraAcc+=pre;while(G.chakraAcc>=150){G.chakraAcc-=150;addChakra(1);}
 if(S.lifesteal&&!sec){const h=Math.min(fin*S.lifesteal,2*DT*30);heal(h,true);}
 if(isCrit&&S.flags.critMarque)applySt(e,['STA_09',3,'s'],I);
 if(I&&I.liv==='CONTACT'&&S.flags.chakraContact&&!sec)addChakra(1);
 if(o.kb){const a=o.ang!==undefined?o.ang:Math.atan2(e.y-P.y,e.x-P.x),k=o.kb*(1+(m.kb||0));
  if(e.boss||e.lieut){if(!o.noCtrlKb)controlBoss(e);}else{const f=k*M*(e.elite?.5:1)*(e.enZoneAlliee?.3:1)*10;e.kvx+=Math.cos(a)*f;e.kvy+=Math.sin(a)*f;}}
 if(o.st)for(const s of o.st)applySt(e,s,I,o.px,o.py);
 if(OPT.degatsTexte&&G.texts.length<45)G.texts.push({x:e.x+(G.rX()-.5)*8,y:e.y-14,v:fin,t:0,crit:isCrit});
 if(!sec&&I)synergies(I,e,B,o);
 if(e.onHit)e.onHit(e,fin,I,o);
 if(e.boss||e.lieut)bossPhase(e);else if(e.hp<=0)kill(e,I);
 return fin;}
function controlBoss(e){const d=1-e.rc/100;e.rc=Math.min(80,e.rc+Math.max(0,20-G.st.bossRc));if(d<.2||true)addVuln(e,.05,2);}
function addChakra(n){n*=1+G.st.chakra;if(G.sceauChakra>0)return;const room=12-G.chakraSec;n=Math.min(n,room);if(n<=0)return;G.chakraSec+=n;G.chakra=Math.min(100,G.chakra+n);}
function heal(h,noCap){if(h<=0)return;h*=1+G.st.healMul;if(!noCap){const room=P.maxhp*.08-G.healSec;h=Math.min(h,Math.max(0,room));G.healSec+=h;}P.hp=Math.min(P.maxhp,P.hp+h);G.healTot+=h;}
function addShield(v,dur){const cap=P.maxhp*.5;P.shield=Math.min(cap,P.shield+v*(1+G.st.shieldMul));P.shieldT=dur||5;}

// Dégâts subis §B4.4 (+ fenêtres §B1.5)
function hurtPlayer(d,cause,src,kind){if(G.phase!=='jeu')return false;
 if(G.st.flags.intangible||P.dashIf>0){if(P.dashIf>0&&kind!=='zone'&&G.time-G.lastPerfect>=1){G.lastPerfect=G.time;addChakra(5);CPT_RUN('esq_parf',1);G.texts.push({x:P.x,y:P.y-22,s:'Esquive parfaite',t:0,col:'#7ff0ff'});}return false;}
 if(kind==='contact'&&src&&(P.contactT>0||G.time-(src.lastHit||-9)<.5))return false;
 if(P.inv>0||G.ultInv>0)return false;
 if(kind==='proj'&&G.st.flags.blocProj&&G.time-G.lastBloc>=G.st.flags.blocProj){G.lastBloc=G.time;fxRing(P.x,P.y,10,'#9fe0ff');return false;}
 let r=d*(1-Math.min(.6,G.st.red));r=Math.max(Math.ceil(r*.25),r-G.st.armor);
 if(G.st.flags.sensFeu&&/Katon|feu|Brûl/.test(cause))r*=1.5;
 if(P.shield>0){const a=Math.min(P.shield,r);P.shield-=a;r-=a;}
 if(r>0){P.hp-=r;P.hurtT=.25;G.lastHitT=G.time;CPT_RUN('degats_subis',r);}
 P.heavy=r>=.2*P.maxhp;if(P.heavy)P.inv=.6;if(kind==='contact'&&src){P.contactT=.35;src.lastHit=G.time;}
 G.takenAcc+=r;const step=P.maxhp*.1;while(G.takenAcc>=step){G.takenAcc-=step;addChakra(2);}
 G.lastCause=cause;sfx('hurt');
 if(src&&kind==='contact'&&G.st.flags.epines)hit(src,G.st.flags.epines,null,{sec:1});
 if(src&&P.heavy&&G.st.flags.picLourd)hit(src,G.st.flags.picLourd,null,{sec:1});
 if(G.st.flags.lienMaudit)for(const e of G.enemies)if(hasSt(e,'STA_20'))hit(e,r*(G.trf&&G.trf.actif&&G.trf.def.id==='TRF_019'?3:2),null,{sec:1,noCrit:true});
 if(P.hp<=0){
  if(G.st.flags.kawarimi&&G.time-G.lastKawa>=G.st.flags.kawarimi){G.lastKawa=G.time;P.hp=1;P.inv=1;smoke(P.x,P.y,10);G.fx.push({k:'buche',x:P.x,y:P.y,t:0,dur:1});CPT_RUN('kawarimi',1);return true;}
  if(G.st.flags.izanagi&&G.time-G.lastIzanagi>=G.st.flags.izanagi){G.lastIzanagi=G.time;P.hp=P.maxhp*.3;P.inv=1.5;banner('Izanagi','Le coup fatal est annulé.',2);return true;}
  if(G.st.flags.survie1&&!G.survieUsed){G.survieUsed=1;P.hp=1;P.inv=3;banner('Survie','Un coup fatal laisse à 1 PV.',2);return true;}
  if(G.trf&&G.trf.actif&&G.trf.def.id==='TRF_012'&&!G.trf.survie){G.trf.survie=1;P.hp=1;P.inv=1;return true;}
  P.hp=0;finRun(false,cause);}
 return true;}
