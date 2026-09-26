// Aides de test injectées dans la page (pilote automatique, pas à pas).
// Utilisées par tests_jeu.mjs ; ne font pas partie du jeu.
window.__T = {
  L: () => window.LDS,
  pas(n, touches, boutons) { const L = window.LDS; const E = L.Entrees; for (let i = 0; i < n; i++) {
      E.touches = new Set(touches || []); E.ordreFleches = [...E.touches].filter(c => c.startsWith('Arrow'));
      if (boutons) { window.__pad = boutons; }
      try { E.maj(1/60); L.Scenes.maj(1/60); this.n = (this.n || 0) + 1; if (this.rendu && this.n % this.rendu === 0) L.Scenes.rendre(L.Rendu.gi); } catch (err) { E.finPas(); return String(err.stack || err).replace(/file:[^)]*index.html/g, '').slice(0, 300); } E.finPas(); if (L.G.derniereErreur) { const e = L.G.derniereErreur; L.G.derniereErreur = null; return e; } } return null; },
  // Pilote : BFS sur les tuiles praticables, s'aligne sur la cible (tir cardinal)
  // ou s'en approche (corps-à-corps), relâche les tirs chargés, se décoince.
  chemin(s, J, choisir) { const L = window.LDS, P = L.PROP; const W = s.W, H = s.H; const d = new Int16Array(W * H).fill(-1), par = new Int32Array(W * H).fill(-1);
    const ok = i => { const t = s.tuiles[i]; const pr = P[t] || {}; return !pr.solide && !pr.fosse && !pr.blessant || (J.vol && !pr.mur); };
    const x0 = Math.floor(J.x / 32), y0 = Math.floor(J.y / 32); const i0 = y0 * W + x0; if (i0 < 0 || i0 >= W * H) return null; d[i0] = 0; const f = [i0]; let meilleur = null, mv = 1e9;
    for (let k = 0; k < f.length; k++) { const i = f[k]; const x = i % W, y = (i / W) | 0; const v = choisir(x, y, d[i]); if (v < mv) { mv = v; meilleur = i; }
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const j = ny * W + nx; if (d[j] >= 0 || !ok(j)) continue; d[j] = d[i] + 1; par[j] = i; f.push(j); } }
    if (meilleur === null) return null; let i = meilleur; while (par[i] >= 0 && par[i] !== i0) i = par[i];
    return { x: (i % W) * 32 + 16, y: ((i / W) | 0) * 32 + 16, but: meilleur, depart: i0 }; },
  ligneLibre(s, x0, y0, x1, y1) { const L = window.LDS, P = L.PROP; const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let k = 1; k < n; k++) { const x = Math.round(x0 + (x1 - x0) * k / n), y = Math.round(y0 + (y1 - y0) * k / n); const pr = P[s.tuiles[y * s.W + x]] || {}; if (pr.bloqueTir) return false; } return true; },
  bot(sec, o = {}) { const L = window.LDS, G = L.G; let a = Math.random() * 6, bloque = 0, px = 0, py = 0, fuite = 0;
    for (let i = 0; i < sec * 60; i++) { const J = G.joueur; if (!J || !G.salle || !G.partie) return 'pas de partie';
      if (o.dieu) { J.invuln = 1; if (J.etat === 'mort') return 'mort malgré dieu'; }
      if (G.enAnimationObjet) { const e = this.pas(1, ['Enter']); if (e) return e; continue; }
      const s = G.salle; const P = J.profil || {}; const melee = ['lame', 'lame_longue', 'frappe', 'rotation'].includes(P.forme); const charge = ['orbe', 'rayon', 'charge_libre'].includes(P.forme) || P.chargeable;
      const cibles = G.ennemis.filter(x => !x.mort && !x.cache && !x.intangible && !(x.statuts && x.statuts.charme) && !x.allie && !x.miroirInvuln);
      const prio = x => x.boss ? 2 : ['invocateur', 'guerisseur'].includes(x.def.comportement) ? 1 : 0;
      const e = cibles.sort((p, q) => prio(q) - prio(p) || Math.hypot(p.x - J.x, p.y - J.y) - Math.hypot(q.x - J.x, q.y - J.y))[0];
      const t = []; a += 0.05; let mx = 0, my = 0;
      if (e) {
        const ex = Math.floor(e.x / 32), ey = Math.floor((e.y - 4) / 32); const bouclier = e.def.params && e.def.params.bouclier === 'frontal'; const portee = melee ? 1 : Math.max(2, Math.min(5, Math.floor((J.stats.portee || 6) * 0.7)));
        const c = this.chemin(s, J, (x, y, d) => { const ddx = Math.abs(x - ex), ddy = Math.abs(y - ey);
          if (melee) return Math.max(ddx, ddy) <= 1 && (ddx + ddy) > 0 ? d : 1e6 + ddx + ddy;
          const aligne = (ddx === 0 && ddy >= 2 && ddy <= portee + 1) || (ddy === 0 && ddx >= 2 && ddx <= portee + 1);
          if (aligne && bouclier) { const cote = ddx === 0 ? (y < ey ? 'haut' : 'bas') : (x < ex ? 'gauche' : 'droite'); if (cote === e.dir) return 1e5 + d; }
          if (aligne && this.ligneLibre(s, x, y, ex, ey)) return d + (ddx + ddy < 3 ? 2 : 0); return 1e6 + d * 0.1 + Math.min(ddx, ddy) * 3 + Math.abs(ddx + ddy - 3); });
        if (c) { const bx = c.x - J.x, by = c.y - J.y, n = Math.hypot(bx, by); if (c.but === c.depart) { mx = Math.cos(a) * 0.35; my = Math.sin(a * 1.3) * 0.35; } else if (n > 0.1) { mx = bx / n; my = by / n; } }
        // origine de la visée : sphère contrôlée, réticule de frappe, sinon le joueur
        let ox = J.x, oy = J.y - 12; const orbe = P.forme === 'controle' && G.orbes.find(x => x.attache === J); const ret = P.forme === 'frappe' && J.tir.reticule && J.tir.reticule.actif && J.tir.reticule;
        if (orbe) { ox = orbe.x; oy = orbe.y; } else if (ret) { ox = ret.x; oy = ret.y; }
        const dx = e.x - ox, dy = (e.y - 8) - oy; t.push(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft') : (dy > 0 ? 'ArrowDown' : 'ArrowUp'));
        if (P.forme === 'frappe') { if (ret && Math.hypot(dx, dy) < 18) t.pop(); }
        else if (P.forme === 'controle') { if (Math.hypot(dx, dy) < 6) t.pop(); }
        else if (charge && J.tir && J.tir.charge >= 0.99) t.pop(); else if (o.relacher && i % 50 > 44) t.pop();
      } else if (o.cible) { const d = Math.hypot(o.cible.x - J.x, o.cible.y - J.y) || 1; mx = (o.cible.x - J.x) / d; my = (o.cible.y - J.y) / d; }
      else { mx = Math.cos(a); my = Math.sin(a * 1.3); }
      // décoincement
      if (Math.hypot(J.x - px, J.y - py) < 0.2 && (Math.abs(mx) + Math.abs(my)) > 0.3) bloque++; else bloque = 0; px = J.x; py = J.y;
      if (bloque > 30) { fuite = 25; a = Math.random() * 6.28; bloque = 0; }
      if (fuite > 0) { fuite--; mx = Math.cos(a); my = Math.sin(a); }
      if (mx > 0.3) t.push('KeyD'); if (mx < -0.3) t.push('KeyA'); if (my > 0.3) t.push('KeyS'); if (my < -0.3) t.push('KeyW');
      if (o.actif && i % 120 === 0) t.push('Space');
      if (o.bombes && i % 240 === 100) t.push('KeyE');
      const err = this.pas(1, t); if (err) return err;
      if (L.Scenes.courante() !== L.SceneJeu) { if (o.fermerMenus) L.Scenes.aller(L.SceneJeu); else return 'scene ' + (L.Scenes.courante() === window.LDS.SceneTitre ? 'titre' : 'autre'); }
      if (o.jusquaNettoyage && !G.salle.combat && !G.ennemis.length) return null;
    }
    return null; },
  prendreTout() { const L = window.LDS, G = L.G, J = G.joueur; let n = 0;
    for (const p of G.salle.piedestaux) { if (!p.id || p.prix) continue; J.x = p.x; J.y = p.y + 6; const e = this.pas(40, []); if (e) return e; n++; }
    for (const r of G.salle.ramassables.slice()) { J.x = r.x; J.y = r.y; const e = this.pas(3, []); if (e) return e; }
    return n; },
  // Scénario : nouvelle partie, une salle de combat reprend le gabarit demandé (ennemis du gabarit ou imposés)
  scenario(perso, gabId, ennemis, code) { const L = window.LDS, G = L.G; L.nouvellePartie({ perso, code: code || 'SCEN2345' }); L.Scenes.aller(L.SceneJeu); this.pas(5);
    const gab = L.DON.salles.find(g => g.id === gabId); if (!gab) return null;
    const s = Object.values(G.etage.salles).find(x => x.type === 'combat' && x.forme === (gab.forme || '1x1') && !x.visitee); if (!s) return null;
    for (let k = 0; k < s.tuiles.length; k++) if (![L.T.MUR, L.T.VIDE, L.T.PORTE].includes(s.tuiles[k])) s.tuiles[k] = L.T.SOL;
    s.pvTuiles = {}; L.appliquerGabarit(s, gab, null);
    if (ennemis) { s.visitee = true; s.ennemisDef = ennemis.map(e => ({ id: e.id, x: e.tx * 32 + 16, y: e.ty * 32 + 16 })); }
    this.allerA(s.id); return s; },
  allerA(id, dir) { const L = window.LDS; const s = L.G.etage.salles[id]; if (!dir && s) { const p = s.portes.find(q => q.etat !== 'secrete') || s.portes[0]; if (p) dir = { haut: 'bas', bas: 'haut', gauche: 'droite', droite: 'gauche' }[p.dir]; } L.demarrerTransition(dir || 'droite', id); return this.pas(30, []); },
};
