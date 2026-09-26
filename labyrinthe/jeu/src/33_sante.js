// ═══════════════════════════════════════════════════════════════════════════
// Santé en demi-unités (registre §R9). Ordre d'affichage :
//   [contenants de vitalité][enveloppes osseuses][réserves de chakra][cicatrices]
// Capacité : 12 emplacements. Une réserve de chakra (2 demis) = 1 emplacement.
// Ordre des pertes (dommage reçu) : réserves de chakra (de droite à gauche),
// puis enveloppes osseuses (vitalité contenue, puis rupture d'une enveloppe vide
// qui absorbe le coup entier), puis sceau vital partiel, puis vitalité (droite).
// ═══════════════════════════════════════════════════════════════════════════

const CAPACITE_SANTE = 12;
function santeInit(o) {
  const S = { cont: [], prot: [], cicatrices: 0, partiel: 0 };
  for (let i = 0; i < (o.vitalite || 0); i++) S.cont.push({ t: 'vit', p: 2 });
  for (let i = 0; i < (o.protection || 0) * 2; i++) S.prot.push('b');
  for (let i = 0; i < (o.instable || 0) * 2; i++) S.prot.push('n');
  for (let i = 0; i < (o.os || 0); i++) S.cont.push({ t: 'os', p: 2 });
  if (o.pleins !== undefined) { let reste = o.pleins; for (const c of S.cont) { c.p = Math.min(2, reste); reste = Math.max(0, reste - 2); } }
  trierConteneurs(S); return S;
}
function trierConteneurs(S) { S.cont.sort((a, b) => (a.t === 'vit' ? 0 : 1) - (b.t === 'vit' ? 0 : 1)); }
const nbVit = S => S.cont.filter(c => c.t === 'vit').length;
const nbOs = S => S.cont.filter(c => c.t === 'os').length;
const rougeTotal = S => S.cont.reduce((a, c) => a + c.p, 0);
const rougeMax = S => S.cont.length * 2;
const santeTotale = S => rougeTotal(S) + S.prot.length + S.partiel;
const emplacements = S => S.cont.length + Math.ceil(S.prot.length / 2) + S.cicatrices;
const placeLibre = S => CAPACITE_SANTE - emplacements(S);

// Soin de vitalité : remplit de gauche à droite (vitalité puis enveloppes). Renvoie l'excédent.
function soignerRouge(S, demis) {
  for (const c of S.cont) { while (demis > 0 && c.p < 2) { c.p++; demis--; } }
  return demis;
}
// Nouveau contenant ; à pleine capacité, il est converti en soin d'un cœur (règle affichée)
function ajouterConteneur(S, n = 1, plein = true) {
  let convertis = 0;
  for (let i = 0; i < n; i++) {
    if (placeLibre(S) > 0) { S.cont.push({ t: 'vit', p: plein ? 2 : 0 }); }
    else convertis++;
  }
  trierConteneurs(S);
  if (convertis) soignerRouge(S, convertis * 2);
  return convertis;
}
function retirerConteneur(S, n = 1) { // destruction permanente (contenants de vitalité d'abord)
  let r = 0;
  for (let i = 0; i < n; i++) {
    let k = -1; for (let j = S.cont.length - 1; j >= 0; j--) if (S.cont[j].t === 'vit') { k = j; break; }
    if (k < 0) break; S.cont.splice(k, 1); r++;
  }
  return r;
}
function ajouterOs(S, n = 1) { let a = 0; for (let i = 0; i < n; i++) if (placeLibre(S) > 0) { S.cont.push({ t: 'os', p: 0 }); a++; } trierConteneurs(S); return a; }
// Réserves de chakra protecteur ('b') ou instable ('n'), en demis ; excédent perdu (renvoyé)
function ajouterProtection(S, demis, type = 'b') {
  let perdus = 0;
  for (let i = 0; i < demis; i++) {
    const ouvert = S.prot.length % 2 === 1; // une réserve à moitié pleine accepte un demi sans emplacement
    if (ouvert || placeLibre(S) > 0) S.prot.push(type); else perdus++;
  }
  return perdus;
}
function ajouterCicatrice(S, n = 1) {
  for (let i = 0; i < n; i++) {
    S.cicatrices++;
    while (emplacements(S) > CAPACITE_SANTE) {
      if (S.prot.length) { S.prot.splice(-Math.min(2, S.prot.length)); continue; }
      const vide = S.cont.map((c, j) => [c, j]).reverse().find(([c]) => c.p === 0);
      if (vide) { S.cont.splice(vide[1], 1); continue; }
      if (S.cont.length) { S.cont.pop(); continue; }
      S.cicatrices = CAPACITE_SANTE; break;
    }
  }
}
function retirerCicatrice(S, n = 1) { S.cicatrices = Math.max(0, S.cicatrices - n); }
function ajouterPartiel(S) {
  if (S.partiel) { S.partiel = 0; ajouterConteneur(S, 1, true); return 'contenant'; } // deux sceaux partiels forment un contenant
  S.partiel = 1; return 'partiel';
}

// Dommage reçu (demis). Renvoie { rompusInstables, perduRouge, perduProt, osBrises, mort }
function subirDemis(S, demis) {
  const res = { rompusInstables: 0, perduRouge: 0, perduProt: 0, osBrises: 0, mort: false };
  let reste = demis;
  while (reste > 0 && S.prot.length) {
    const idx = S.prot.length - 1; const type = S.prot[idx];
    S.prot.pop(); reste--; res.perduProt++;
    if (idx % 2 === 0 && type === 'n') res.rompusInstables++; // une réserve instable entièrement vidée
  }
  // enveloppes osseuses (à droite des vitalités)
  while (reste > 0) {
    const k = (() => { for (let j = S.cont.length - 1; j >= 0; j--) if (S.cont[j].t === 'os') return j; return -1; })();
    if (k < 0) break;
    const os = S.cont[k];
    if (os.p > 0) { const x = Math.min(os.p, reste); os.p -= x; reste -= x; res.perduRouge += x; }
    else { S.cont.splice(k, 1); res.osBrises++; reste = 0; } // l'enveloppe vide se rompt et absorbe le coup
  }
  if (reste > 0 && S.partiel) { S.partiel = 0; reste--; }
  while (reste > 0) {
    let k = -1; for (let j = S.cont.length - 1; j >= 0; j--) if (S.cont[j].p > 0) { k = j; break; }
    if (k < 0) break; S.cont[k].p--; reste--; res.perduRouge++;
  }
  res.mort = santeTotale(S) <= 0;
  return res;
}
// Prix en contenants (pactes). Sans contenant de vitalité : 2 réserves de chakra (4 demis) par contenant.
function prixPacteDetail(S, n) {
  const vit = nbVit(S);
  if (vit >= n) return { type: 'contenants', n, mortel: santeApresPrix(S, n, 0) <= 0 };
  if (vit === 0 && S.prot.length >= 4 * n) return { type: 'protection', n: 4 * n, mortel: santeTotale(S) - 4 * n <= 0 };
  if (vit === 0) return { type: 'protection', n: 4 * n, impossible: true, mortel: true };
  return { type: 'contenants', n, impossible: vit < n, mortel: true };
}
function santeApresPrix(S, n) {
  const copie = JSON.parse(JSON.stringify(S)); retirerConteneur(copie, n); return santeTotale(copie);
}
function payerPacte(S, n) {
  const d = prixPacteDetail(S, n); if (d.impossible) return false;
  if (d.type === 'contenants') retirerConteneur(S, n); else S.prot.splice(-d.n);
  return true;
}
function copieSante(S) { return JSON.parse(JSON.stringify(S)); }
