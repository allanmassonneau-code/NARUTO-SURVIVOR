// ═══════════════════════════════════════════════════════════════════════════
// Effets visuels et télégraphes (anticipation → émission → contact → réaction →
// disparition). Les particules décoratives n'ont aucun effet de jeu ; leur
// quantité baisse avec la densité et le mode confort (jamais les dangers).
// ═══════════════════════════════════════════════════════════════════════════

function majEffets(dt) {
  const J = G.joueur;
  for (const e of G.effets) {
    e.age += dt;
    if (e.type === 'frappe_sol' && !e.fait && e.age >= e.duree * 0.95) {
      e.fait = true;
      if (e.proprio === 'joueur') { for (const x of G.ennemis) if (!x.mort && !x.cache && dist(x.x, x.y, e.x, e.y) < e.r + x.r) infligerDegats(x, e.deg, { proprio: 'joueur', type: 'frappe', x: x.x, y: x.y, vx: x.x - e.x, vy: x.y - e.y, recul: 40 }); if (!e.petite) { secousse(5, null); Son.jouer('explosion'); exploserDecor(e.x, e.y, e.r * 0.8); } else Son.jouer('impact'); G.effets.push({ type: e.arme ? 'impact_sol' : 'explosion', x: e.x, y: e.y, r: e.r, age: 0, duree: 0.35 }); }
    }
    if (e.type === 'anneau_expansif') {
      e.r += e.v * dt;
      if (!e.touche && !J.intangible) { const d = dist(e.x, e.y, J.x, J.y); if (Math.abs(d - e.r) < 7) { const a = angleVers(e.x, e.y, J.x, J.y); if (Math.abs(diffAngle(a, e.trou)) > e.largeurTrou / 2) { e.touche = true; blesserJoueur(G.degatsEnnemis, { type: 'onde', x: e.x, y: e.y }); } } }
    }
    if (e.attache) { e.x = J.x; e.y = J.y; }
  }
  G.effets = G.effets.filter(e => e.age < e.duree);
  const maxP = G.reglages.confort ? 120 : 260;
  if (G.particules.length > maxP) G.particules.splice(0, G.particules.length - maxP);
  for (const p of G.particules) { p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; if (p.g) p.vy += p.g * dt; }
  G.particules = G.particules.filter(p => p.age < p.duree);
  for (const t of G.textes) t.age += dt;
  G.textes = G.textes.filter(t => t.age < t.duree);
}
function effetImpact(x, y, app, force, elements) {
  const n = G.reglages.confort ? 2 : 4; const col = app === 'ennemi' ? '#ff9ac0' : app === 'sable' ? '#e0c080' : app === 'poing' ? '#ffb0d0' : app === 'orbe' ? '#c0e8ff' : '#fff4d0';
  for (let i = 0; i < n * force; i++) { const a = Math.random() * Math.PI * 2, v = 30 + Math.random() * 50; G.particules.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, age: 0, duree: 0.18 + Math.random() * 0.1, couleur: col, taille: 1 + (Math.random() < 0.3 ? 1 : 0) }); }
  if (app === 'orbe') G.effets.push({ type: 'anneau_impact', x, y, age: 0, duree: 0.2, r: 10 });
}
function dessinerEffet(g, e, X, Y) {
  const k = Math.min(1, e.age / e.duree); const x = X(e.x || 0), y = Y(e.y || 0);
  switch (e.type) {
    case 'explosion': {
      // papier et argile : silhouette en éclats ; feu : volume rond ; cœur clair
      const r = Math.round(e.r * (0.5 + k * 0.6));
      if (k < 0.18 && !G.reglages.sansFlash) { g.drawImage(disque(r, '#fff8e0'), x - r, y - r); break; }
      g.globalAlpha = 1 - k; g.drawImage(disque(r, '#f07a2a'), x - r, y - r); g.drawImage(disque(Math.round(r * 0.65), '#ffd060'), x - Math.round(r * 0.65), y - Math.round(r * 0.65));
      g.globalAlpha = (1 - k) * 0.8; for (let i = 0; i < 8; i++) { const a = i * 0.785 + e.x; const d = r * (0.8 + k * 0.6); g.fillStyle = '#3a3036'; g.fillRect(Math.round(x + Math.cos(a) * d), Math.round(y + Math.sin(a) * d * 0.8), 3, 3); g.fillStyle = '#e8dcc0'; g.fillRect(Math.round(x + Math.cos(a + 0.4) * d * 0.9), Math.round(y + Math.sin(a + 0.4) * d * 0.7), 2, 3); }
      g.globalAlpha = 1; break;
    }
    case 'explosion_petite': { const r = Math.round(e.r * (0.4 + k * 0.6)); g.globalAlpha = 1 - k; g.drawImage(disque(r, '#ffb050'), x - r, y - r); g.drawImage(disque(Math.max(1, Math.round(r * 0.5)), '#fff0c0'), x - Math.round(r * 0.5), y - Math.round(r * 0.5)); g.globalAlpha = 1; break; }
    case 'onde': case 'onde_ennemie': case 'onde_noire': { const r = Math.round(e.r * (0.3 + k * 0.7)); g.globalAlpha = 1 - k; g.drawImage(anneau(r, 2, e.type === 'onde_ennemie' ? '#ff5a7a' : e.type === 'onde_noire' ? '#b060ff' : (e.couleur || '#f0e0c0')), x - r - 1, y - r - 1); g.globalAlpha = 1; break; }
    case 'anneau_impact': { const r = Math.round(4 + e.r * k); g.globalAlpha = 1 - k; g.drawImage(anneau(r, 1, '#e0f4ff'), x - r - 1, y - r - 1); g.globalAlpha = 1; break; }
    case 'eclair': { g.strokeStyle = '#e0f0ff'; const x0 = X(e.x0), y0 = Y(e.y0), x1 = X(e.x1), y1 = Y(e.y1); let px = x0, py = y0; for (let i = 1; i <= 5; i++) { const nx = lerp(x0, x1, i / 5) + (i < 5 ? (Math.random() - 0.5) * 10 : 0), ny = lerp(y0, y1, i / 5) + (i < 5 ? (Math.random() - 0.5) * 10 : 0); lignePixel(g, px, py, nx, ny, i % 2 ? '#ffffff' : '#9ad0ff', 1); px = nx; py = ny; } break; }
    case 'fumee': { const n = 5; for (let i = 0; i < n; i++) { const a = i * 1.26 + (e.x % 3); const d = 3 + k * 10 * (e.taille || 1); const r = Math.max(1, Math.round((4 + i % 2 * 2) * (e.taille || 1) * (1 - k * 0.6))); g.globalAlpha = 0.8 * (1 - k); g.drawImage(disque(r, i % 2 ? '#e8e4f0' : '#b8b4c8'), Math.round(x + Math.cos(a) * d - r), Math.round(y + Math.sin(a) * d * 0.7 - r - k * 6)); } g.globalAlpha = 1; break; }
    case 'debris': { const n = e.n || 8; for (let i = 0; i < n; i++) { const a = i * 6.28 / n + 0.3; const d = k * 18; g.fillStyle = e.couleur || '#8a8078'; g.fillRect(Math.round(x + Math.cos(a) * d), Math.round(y + Math.sin(a) * d * 0.6 + k * k * 10 - 4), 2, 2); } break; }
    case 'etincelle': g.fillStyle = '#fff4c0'; g.fillRect(x - 1, y - 1, 3, 3); break;
    case 'etincelle_ramassage': { const r = Math.round(3 + 8 * k); g.globalAlpha = 1 - k; g.drawImage(anneau(r, 1, '#fff8d0'), x - r - 1, y - r - 1); g.globalAlpha = 1; break; }
    case 'immunite': Police.ecrire(g, 'immunisé', x, y - k * 6, '#c0c0ff', { a: 'c' }); break;
    case 'frappe_sol': { const r = Math.round(e.r); g.globalAlpha = 0.5 + 0.4 * k; g.drawImage(anneau(r, 1, e.proprio === 'joueur' ? '#ffb060' : '#ff4a4a'), x - r - 1, y - r - 1); g.drawImage(anneau(Math.max(1, Math.round(r * k)), 1, '#ffe0a0'), x - Math.round(r * k) - 1, y - Math.round(r * k) - 1); g.globalAlpha = 1; if (!e.petite) { const h = Math.round((1 - k) * 120); g.fillStyle = '#6a3a2a'; g.fillRect(x - 5, y - h - 10, 10, 10); g.fillStyle = '#ffb040'; g.fillRect(x - 3, y - h - 16, 6, 6); } break; }
    case 'marque_sol': { const r = Math.round(e.r); g.globalAlpha = 0.35 + 0.4 * k; g.drawImage(ellipse(r, Math.round(r * 0.55), e.danger ? 'rgba(255,60,60,0.5)' : 'rgba(0,0,0,0.4)'), x - r, y - Math.round(r * 0.55)); g.globalAlpha = 1; break; }
    case 'cercle_danger': { const r = Math.round(e.r); const cl = Math.floor(e.age * 10) % 2; g.globalAlpha = 0.25 + 0.35 * k; g.drawImage(disque(r, 'rgba(255,40,40,0.35)'), x - r, y - r); g.globalAlpha = 0.8; g.drawImage(anneau(r, cl ? 2 : 1, '#ff5040'), x - r - 1, y - r - 1); g.globalAlpha = 1; break; }
    case 'ligne_danger': { g.save(); g.translate(x, y); g.rotate(e.a); g.globalAlpha = 0.2 + 0.4 * k; g.fillStyle = '#ff3a3a'; g.fillRect(0, -e.largeur / 2, e.l, e.largeur); g.globalAlpha = 0.9; g.fillStyle = '#ffb0a0'; for (let i = 0; i < e.l; i += 16) g.fillRect(i + ((e.age * 120) % 16), -1, 6, 2); g.restore(); g.globalAlpha = 1; break; }
    case 'arc_danger': case 'balayage': { g.save(); g.globalAlpha = e.type === 'balayage' ? 1 - k : 0.3 + 0.4 * k; g.fillStyle = e.type === 'balayage' ? '#f0f0ff' : 'rgba(255,50,50,0.5)'; g.beginPath(); g.moveTo(x, y); g.arc(x, y, e.r, e.a - e.arc / 2, e.a + e.arc / 2); g.closePath(); g.fill(); g.restore(); g.globalAlpha = 1; break; }
    case 'aura_sage': { const r = Math.round(8 + 18 * k); g.globalAlpha = 1 - k; g.drawImage(anneau(r, 2, '#f08a24'), x - r - 1, y - 12 - r - 1); g.globalAlpha = 1; break; }
    case 'aura_tele': { const r = Math.round(e.r + 4 * Math.sin(e.age * 20)); g.globalAlpha = 0.6; g.drawImage(anneau(r, 2, '#ffd040'), x - r - 1, y - r - 1); g.globalAlpha = 1; break; }
    case 'impact_sol': { const r = Math.round(e.r * (0.6 + 0.4 * k)); g.globalAlpha = 1 - k; g.drawImage(anneau(r, 3, '#c8b8a0'), x - r - 1, y - r - 1); g.globalAlpha = 1; break; }
    case 'meteore': { const r = Math.round(e.r * (0.5 + 0.5 * k)); g.globalAlpha = 1 - k; g.drawImage(disque(r, '#ff7a2a'), x - r, y - r); g.drawImage(anneau(r + 4, 3, '#3a2a2a'), x - r - 5, y - r - 5); g.globalAlpha = 1; break; }
    case 'anneau_expansif': { const r = Math.round(e.r); if (r < 2) break; g.save(); g.strokeStyle = '#ff4a6a'; g.lineWidth = 3; g.beginPath(); g.arc(x, y, r, e.trou + e.largeurTrou / 2, e.trou - e.largeurTrou / 2 + Math.PI * 2); g.stroke(); g.strokeStyle = '#ffd0e0'; g.lineWidth = 1; g.stroke(); g.restore(); break; }
    case 'cercle_sceau': case 'cercle_soin': { const r = Math.round(e.r * (e.type === 'cercle_soin' ? 1 : 0.6 + 0.4 * k)); g.globalAlpha = 0.7; g.drawImage(anneau(r, 1, e.type === 'cercle_soin' ? '#6ae07a' : '#e0d060'), x - r - 1, y - r - 1); g.globalAlpha = 1; break; }
    case 'soin_ennemi': case 'soin': Police.ecrire(g, '+', x, y - k * 8, '#6ae07a', { a: 'c' }); break;
    case 'fissure': { g.fillStyle = 'rgba(30,20,15,0.7)'; const n = Math.round(3 + k * 6); for (let i = 0; i < n; i++) { const a = i * 2.4; g.fillRect(Math.round(x + Math.cos(a) * i * 1.6), Math.round(y + Math.sin(a) * i * 0.8), 2, 1); } break; }
    case 'mort_boss': { const r = Math.round(10 + k * 70); g.globalAlpha = 1 - k; g.drawImage(anneau(r, 3, '#ffffff'), x - r - 1, y - r - 1); g.globalAlpha = 1; if (Math.random() < 0.6) G.particules.push({ x: e.x + (Math.random() - 0.5) * 40, y: e.y + (Math.random() - 0.5) * 30, vx: 0, vy: -30, age: 0, duree: 0.5, couleur: '#f0e8ff', taille: 3 }); break; }
    case 'mue': { g.globalAlpha = 1 - k; g.drawImage(contourner(peindre(['..ww..', '.w..w.', 'w....w', 'w....w', '.w..w.', '..ww..'], { w: '#e8e4d0' })), x - 3, y - 20); g.globalAlpha = 1; break; }
    case 'transformation': case 'resurrection': { for (let i = 0; i < 3; i++) { const r = Math.round((k * 60 + i * 12) % 60) + 4; g.globalAlpha = 1 - k; g.drawImage(anneau(r, 2, i % 2 ? '#ffe080' : '#ffffff'), x - r - 1, y - r - 1); } g.globalAlpha = 1; break; }
    case 'buche': { g.drawImage(contourner(peindre(['.bbbbbb.', 'bwbbbbbb', 'bbbbbbbb', '.bbbbbb.'], { b: '#8a5a30', w: '#c89a60' })), x - 4, y - 10); break; }
    case 'bouclier_sable': { const r = Math.round(12 + k * 10); g.globalAlpha = 1 - k; g.drawImage(anneau(r, 3, '#d8b070'), x - r - 1, y - r - 1); g.globalAlpha = 1; break; }
    case 'sceau_soin': { g.globalAlpha = 1 - k; g.drawImage(anneau(10, 1, '#ff9ac0'), x - 11, y - 11); g.fillStyle = '#ff9ac0'; g.fillRect(x - 1, y - 6, 2, 12); g.fillRect(x - 6, y - 1, 12, 2); g.globalAlpha = 1; break; }
    case 'indice_secret': { g.globalAlpha = 0.5 + 0.5 * Math.sin(e.age * 10); dessinerPerso; g.drawImage(contourner(peindre(['.w.w.', 'wwwww', 'wkwkw', 'wwwww', '.www.'], { w: '#d8c8a8', k: '#1c1420' })), x - 3, y - 14); Police.ecrire(g, '!', x, y - 26, '#ffe080', { a: 'c' }); g.globalAlpha = 1; break; }
    case 'reecriture': { g.globalAlpha = 1 - k; for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#e8dcc0' : '#3a3040'; g.fillRect(x - 10 + i * 4, y - 4 + Math.round(Math.sin(e.age * 20 + i) * 4), 3, 3); } g.globalAlpha = 1; break; }
    case 'coffre_ouvert': { g.globalAlpha = 1 - k; g.drawImage(anneau(Math.round(6 + k * 14), 1, '#fff0c0'), x - Math.round(7 + k * 14), y - Math.round(13 + k * 14)); g.globalAlpha = 1; break; }
    case 'pics_coffre': { g.fillStyle = '#e0e0e8'; for (let i = 0; i < 5; i++) g.fillRect(x - 10 + i * 5, y - 8 - Math.round((1 - k) * 6), 2, 6); break; }
    case 'vapeur': case 'eclaboussure': { g.globalAlpha = 1 - k; g.drawImage(anneau(Math.round(4 + k * 14), 1, '#d0e8ff'), x - Math.round(5 + k * 14), y - Math.round(5 + k * 14)); g.globalAlpha = 1; break; }
    case 'chiens': { const n = 2; for (let i = 0; i < n; i++) { g.fillStyle = '#8a7a60'; g.fillRect(x - 8 + i * 12, y - 2, 6, 4); g.fillStyle = '#1c1420'; g.fillRect(x - 7 + i * 12, y - 3, 1, 1); } break; }
    case 'lien_ombre': { const c = e.cible; if (!c || c.mort) break; lignePixel(g, X(G.joueur.x), Y(G.joueur.y), X(c.x), Y(c.y), '#1c1428', 2); break; }
    case 'cercueil': { const r = Math.round(10 + (1 - k) * 8); g.drawImage(disque(r, 'rgba(210,170,100,0.8)'), X(e.cible.x) - r, Y(e.cible.y - 10) - r); break; }
    case 'kuroari': { if (e.cible.mort) break; g.fillStyle = '#2a2a30'; g.fillRect(X(e.cible.x) - 9, Y(e.cible.y) - 24, 18, 24); g.fillStyle = '#5a5a64'; g.fillRect(X(e.cible.x) - 7, Y(e.cible.y) - 22, 14, 2); break; }
    case 'fils': { for (let i = 0; i < 6; i++) { const a = i * 1.05; lignePixel(g, x, y - 10, Math.round(x + Math.cos(a) * 60 * k), Math.round(y - 10 + Math.sin(a) * 40 * k), '#2a2a2a', 1); } break; }
    case 'ombre_geante': { const r = Math.round(20 + k * 30); g.drawImage(ellipse(r, Math.round(r * 0.5), 'rgba(0,0,0,0.45)'), x - r, y + 60 - Math.round(r * 0.5)); break; }
    case 'crapaud_geant': { const img = contourner(peindre(['..aa......aa..', '.awka....akwa.', '.aaaaaaaaaaaa.', 'aaaaaaaaaaaaaa', 'aabbbbbbbbbbaa', 'aabkkkkkkkkbaa', '.aabbbbbbbbaa.', 'aa.aaaaaaaa.aa', 'aa..aa..aa..aa'], { a: '#d86a2a', b: '#f0b070', w: '#ffffff', k: '#3a1a10' })); const s = 5; g.globalAlpha = 1 - Math.max(0, k - 0.7) / 0.3; g.drawImage(img, x - img.width * s / 2, y + 60 - img.height * s, img.width * s, img.height * s); g.globalAlpha = 1; break; }
    case 'flammes_noires': case 'tsukuyomi': { g.globalAlpha = 0.4 * (1 - k); g.fillStyle = e.type === 'tsukuyomi' ? '#a00020' : '#1a0a1a'; g.fillRect(0, 0, ECRAN_L, ECRAN_H); g.globalAlpha = 1; break; }
    case 'sphere_noire': { const r = Math.round(6 + 10 * Math.sin(k * Math.PI)); g.drawImage(disque(r, '#141018'), x - r, y - r - 20); break; }
    case 'spirale': { for (let i = 0; i < 12; i++) { const a = i * 0.5 + e.age * 10; const d = i * 1.5 * (1 - k); g.fillStyle = '#8a7ab0'; g.fillRect(Math.round(x + Math.cos(a) * d), Math.round(y + Math.sin(a) * d), 2, 2); } break; }
    case 'racines': { g.fillStyle = '#6a4a2a'; for (let i = 0; i < 5; i++) g.fillRect(x - 10 + i * 5, y - Math.round(12 * Math.min(1, e.age * 4)), 2, Math.round(12 * Math.min(1, e.age * 4))); break; }
    case 'sceau_scellement': { const r = Math.round(16 * (1 - k)) + 2; g.drawImage(anneau(r, 2, '#e8d060'), x - r - 1, y - r - 11); break; }
    case 'coeur_charme': Police.ecrire(g, '♥', x, y - k * 10, '#ff7ab0', { a: 'c' }); break;
    case 'lotus': { g.globalAlpha = 1 - k; g.drawImage(anneau(Math.round(8 + k * 20), 2, '#6ae07a'), x - Math.round(9 + k * 20), y - Math.round(9 + k * 20) - 10); g.globalAlpha = 1; break; }
    case 'horloge': { g.globalAlpha = 0.25 * (1 - k); g.fillStyle = '#6080c0'; g.fillRect(0, 0, ECRAN_L, ECRAN_H); g.globalAlpha = 1; break; }
    case 'aura_verte': { if (Math.random() < 0.4) G.particules.push({ x: G.joueur.x + (Math.random() - 0.5) * 16, y: G.joueur.y - Math.random() * 20, vx: 0, vy: -30, age: 0, duree: 0.4, couleur: '#8af07a', taille: 2 }); break; }
    case 'lien_ombre_zone': break;
  }
}
