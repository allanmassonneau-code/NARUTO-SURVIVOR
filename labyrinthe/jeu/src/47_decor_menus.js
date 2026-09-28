// ═══════════════════════════════════════════════════════════════════════════
// Décor des menus (création originale) : ciel de crépuscule tramé, lune,
// chaînes de montagnes et toits d'un village imaginaire, nuages, feuilles et
// pétales, brume, logo en dégradé. Le même fond, assombri, habille tous les
// menus. Tout le statique est pré-rendu une fois ; seule l'animation est
// redessinée à chaque image.
// ═══════════════════════════════════════════════════════════════════════════

const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
// Dégradé vertical en bandes tramées (Bayer 4×4) : le ciel reste « pixel »
function cielTrame(g, l, h, cles, bandes = 24) {
  const img = g.createImageData(l, h), d = img.data, pal = [];
  for (let k = 0; k < bandes; k++) { const u = k / (bandes - 1) * (cles.length - 1), i = Math.min(cles.length - 2, Math.floor(u)); pal.push(hexRgb(melange(cles[i], cles[i + 1], u - i))); }
  for (let y = 0; y < h; y++) {
    const f = y / (h - 1) * (bandes - 1), b = Math.floor(f), fr = (f - b) * 16;
    for (let x = 0; x < l; x++) { const c = pal[Math.min(bandes - 1, b + (fr > BAYER4[(y & 3) * 4 + (x & 3)] ? 1 : 0))], i = (y * l + x) * 4; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255; }
  }
  g.putImageData(img, 0, 0);
}
// Crête de montagnes : somme de sinus, arête supérieure éclairée
function crete(g, y0, amp, freq, graine, corps, arete, dents = 0) {
  for (let x = 0; x < ECRAN_L; x++) {
    const h = Math.round(y0 - amp * (0.55 * Math.sin(x * freq + graine) + 0.3 * Math.sin(x * freq * 2.3 + graine * 1.7) + 0.15 * Math.sin(x * freq * 5.1 + graine * 3.1)) - Math.abs(Math.sin(x * freq * 6.3 + graine)) * dents);
    g.fillStyle = corps; g.fillRect(x, h, 1, ECRAN_H - h); g.fillStyle = arete; g.fillRect(x, h, 1, 1);
  }
}
let _fondTitre = null, _fenetres = [];
function fondTitre() {
  if (_fondTitre) return _fondTitre;
  const c = toile(ECRAN_L, ECRAN_H), g = ctxDe(c); const al = new Alea('titre|village');
  cielTrame(g, ECRAN_L, ECRAN_H, ['#070820', '#141438', '#2c1c4c', '#5a2a58', '#a0444e', '#e07a48', '#f0a860']);
  // lune et son halo
  g.save(); g.globalCompositeOperation = 'lighter'; g.imageSmoothingEnabled = true; g.globalAlpha = 0.42; g.drawImage(halo('#ffe0b0'), 512 - 120, 72 - 120, 240, 240); g.globalAlpha = 0.25; g.drawImage(halo('#ffd8a0'), 512 - 50, 72 - 50, 100, 100); g.restore();
  g.drawImage(disque(30, '#fff4dc'), 482, 42); g.drawImage(disque(27, '#fffaf0'), 482, 43);
  for (const [x, y, r] of [[500, 58, 5], [520, 80, 7], [496, 84, 3], [528, 58, 3], [510, 94, 4]]) g.drawImage(disque(r, '#ecdcc0'), x - r, y - r);
  // montagnes en trois plans (perspective atmosphérique)
  crete(g, 214, 34, 0.011, 1.3, '#3a2a58', '#6a4a7a', 8);
  crete(g, 246, 28, 0.017, 4.1, '#281c40', '#4a3458', 5);
  crete(g, 272, 18, 0.026, 2.2, '#1a1230', '#2e2244', 3);
  // village imaginaire : maisons à toits relevés, pagodes, fenêtres chaudes
  _fenetres = [];
  const base = 316; let x = -12;
  while (x < ECRAN_L + 12) {
    const w = 34 + al.entier(38), h = 16 + al.entier(26), t = 7 + al.entier(5), pagode = al.chance(0.22);
    g.fillStyle = '#120c1c'; g.fillRect(x + 3, base - h, w - 6, ECRAN_H - base + h);
    const toit = (x0, w0, y0, n) => { for (let k = 0; k < n; k++) { const d = Math.round(k * 1.7); g.fillStyle = k === n - 1 ? '#2a1e36' : '#0c0814'; g.fillRect(x0 - 5 + d, y0 - k, w0 + 10 - 2 * d, 1); } g.fillStyle = '#0c0814'; g.fillRect(x0 - 8, y0 - 2, 3, 1); g.fillRect(x0 + w0 + 5, y0 - 2, 3, 1); g.fillRect(x0 - 9, y0 - 3, 1, 1); g.fillRect(x0 + w0 + 8, y0 - 3, 1, 1); g.fillStyle = '#3a2a40'; g.fillRect(x0 - 5, y0 + 1, w0 + 10, 1); };
    toit(x, w, base - h, t);
    if (pagode) { g.fillStyle = '#120c1c'; g.fillRect(x + 10, base - h - t - 12, w - 20, 12); toit(x + 8, w - 16, base - h - t - 1, t - 2); }
    for (let k = 0; k < 1 + al.entier(3); k++) { if (!al.chance(0.7)) continue; const fx = x + 8 + al.entier(Math.max(1, w - 18)), fy = base - h + 6 + al.entier(Math.max(1, h - 10)); g.fillStyle = '#ffcf70'; g.fillRect(fx, fy, 3, 3); g.fillStyle = '#fff0b0'; g.fillRect(fx, fy, 1, 1); _fenetres.push([fx + 1, fy + 1]); }
    if (al.chance(0.35)) { g.fillStyle = '#0c0814'; g.fillRect(x + w, base - h - 4, 1, 8); g.fillStyle = '#d84a2a'; g.fillRect(x + w - 1, base - h + 4, 3, 4); _fenetres.push([x + w, base - h + 6, 1]); }
    x += w + al.entier(6);
  }
  // faîtage où se tiennent les personnages
  g.fillStyle = '#0a0710'; g.fillRect(0, 332, ECRAN_L, 28); g.fillStyle = '#1e1628'; g.fillRect(0, 332, ECRAN_L, 1);
  g.fillStyle = '#151020'; for (let y = 336; y < ECRAN_H; y += 5) for (let x2 = (y / 5 % 2) * 4; x2 < ECRAN_L; x2 += 8) g.fillRect(x2, y, 6, 1);
  return (_fondTitre = c);
}
// Animation par-dessus le fond : étoiles, nuages, lueurs de fenêtres, brume, feuilles et pétales
function animerFond(g, t, n = 26) {
  const h = (i, k) => { const v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return v - Math.floor(v); };
  const mod = (v, m) => ((v % m) + m) % m;
  for (let i = 0; i < 80; i++) { const x = Math.floor(h(i, 1) * ECRAN_L), y = Math.floor(h(i, 2) * 190); if (Math.hypot(x - 512, y - 72) < 44) continue; const a = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.6 + h(i, 3)) + i)); g.globalAlpha = a * (1 - y / 230); g.fillStyle = h(i, 4) > 0.8 ? '#ffe8c0' : '#e8e8ff'; g.fillRect(x, y, 1, 1); if (h(i, 5) > 0.93 && a > 0.8) { g.fillRect(x - 1, y, 3, 1); g.fillRect(x, y - 1, 1, 3); } }
  g.globalAlpha = 1;
  for (let i = 0; i < 4; i++) { const w = 70 + h(i, 6) * 90, x = mod(h(i, 7) * 800 + t * (3 + i * 1.5), 800 + w) - w, y = 40 + i * 34 + Math.floor(h(i, 8) * 16); g.fillStyle = '#2a1e44'; g.fillRect(Math.round(x), y, Math.round(w), 4); g.fillRect(Math.round(x + 10), y - 3, Math.round(w - 24), 3); g.fillStyle = '#4a3a66'; g.fillRect(Math.round(x + 12), y - 3, Math.round(w - 28), 1); g.fillStyle = '#a05a6a'; g.fillRect(Math.round(x + 4), y + 4, Math.round(w - 8), 1); }
  g.save(); g.globalCompositeOperation = 'lighter'; g.imageSmoothingEnabled = true;
  _fenetres.forEach(([x, y, lanterne], i) => { g.globalAlpha = (lanterne ? 0.5 : 0.3) * (0.8 + 0.2 * Math.sin(t * 3 + i * 1.7)); g.drawImage(halo(lanterne ? '#ff6a30' : '#ffb850', false, 18), x - 9, y - 9, 18, 18); });
  g.globalCompositeOperation = 'screen'; for (let i = 0; i < 3; i++) { g.globalAlpha = 0.14; g.drawImage(halo('#c8a8d8'), mod(i * 260 + t * (6 + i * 3), 900) - 260, 272 + i * 14, 300, 50); }
  g.restore();
  for (let i = 0; i < n; i++) {
    const x = mod(h(i, 9) * 700 + t * (18 + h(i, 10) * 26) + Math.sin(t * 1.5 + i) * 12, 700) - 30, y = mod(h(i, 11) * 400 + t * (12 + h(i, 12) * 14), 400) - 20; const petale = h(i, 13) > 0.55, f = Math.floor(t * 4 + i) % 3;
    g.fillStyle = petale ? (i % 2 ? '#f4a8c8' : '#ffd8e8') : (i % 2 ? '#5a9a3a' : '#9ac858'); g.fillRect(Math.round(x), Math.round(y), f === 1 ? 1 : 2, f === 2 ? 1 : 2);
  }
}
// Logo : lettres en dégradé orangé, reflet haut, double contour, ombre portée
let _logo = null;
function logoTitre() {
  if (_logo) return _logo;
  const e = 4, l = Police.largeur('NARUTO') * e + 16, h = 12 * e + 12; let c = toile(l, h); const g = ctxDe(c);
  Police.ecrire(g, 'NARUTO', l / 2, 14, '#ffffff', { a: 'c', e, ombre: null });
  g.globalCompositeOperation = 'source-in'; const gr = g.createLinearGradient(0, 8, 0, 8 + 10 * e); gr.addColorStop(0, '#fff0a0'); gr.addColorStop(0.4, '#ffb038'); gr.addColorStop(0.75, '#f07820'); gr.addColorStop(1, '#c84a18'); g.fillStyle = gr; g.fillRect(0, 0, l, h); g.globalCompositeOperation = 'source-over';
  const img = g.getImageData(0, 0, l, h), d = img.data; // reflet : premier pixel opaque de chaque colonne
  for (let x = 0; x < l; x++) for (let y = 1; y < h; y++) { const i = (y * l + x) * 4; if (d[i + 3] > 40) { if (d[i - l * 4 + 3] < 40) { d[i] = 255; d[i + 1] = 250; d[i + 2] = 220; } } }
  g.putImageData(img, 0, 0);
  c = contourner(contourner(avecMarge(c, 2), '#5a1a08', true), '#1c0c0a');
  const o = toile(c.width + 4, c.height + 4), go = ctxDe(o); go.drawImage(silhouette(c, 'rgba(10,4,14,0.7)'), 3, 4); go.drawImage(c, 0, 0);
  return (_logo = o);
}
function titreOrne(g, texte, x, y, couleur, e = 2) {
  Police.ecrire(g, texte, x, y, couleur, { a: 'c', e, contour: '#1c1420' });
  const w = Police.largeur(texte) * e; for (const s of [-1, 1]) { const cx = x + s * (w / 2 + 14); losange(g, cx, y + 5 * e / 2 + 1, '#e0b870', 2); g.fillStyle = '#b08850'; g.fillRect(s < 0 ? cx - 34 : cx + 4, y + 5 * e / 2 + 1, 30, 1); }
}
// Fond commun des autres menus : décor assombri et quelques feuilles
function fondMenu(g) {
  const t = performance.now() / 1000; g.drawImage(fondTitre(), 0, 0);
  g.fillStyle = 'rgba(8,6,14,0.74)'; g.fillRect(0, 0, ECRAN_L, ECRAN_H);
  g.globalAlpha = 0.6; animerFond(g, t, 12); g.globalAlpha = 1;
  g.fillStyle = 'rgba(8,6,14,0.35)'; g.fillRect(0, 0, ECRAN_L, ECRAN_H);
}
