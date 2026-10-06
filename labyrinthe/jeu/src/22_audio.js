// ═══════════════════════════════════════════════════════════════════════════
// Audio original, entièrement synthétisé (WebAudio) : effets à budget de voix,
// priorités et variations ; musique par couches (ambiance + percussions de combat),
// gammes japonaises (in / yo) et motifs générés depuis une graine fixe par thème.
// Chaque effet est une petite partition de couches : attaque (clic, craquement),
// corps (ton qui glisse, bruit filtré qui balaie), queue (crépitement, réverbération).
// Timbres : cordes pincées (Karplus-Strong, façon koto), cloches et métaux (partiels
// inharmoniques, FM), chocs passés dans une saturation douce, voix à formants.
// Pack de sons personnel (facultatif) : un fichier sons_perso.js posé à côté du jeu,
// fabriqué avec outils/pack_sons.html à partir de ses propres fichiers, remplace les
// effets qu'il nomme. Il reste sur la machine du joueur : jamais publié avec le jeu.
// ═══════════════════════════════════════════════════════════════════════════

const Son = {
  ctx: null, maitre: null, busEffets: null, busMusique: null, bruit: null,
  voix: [], dernier: {}, actif: false,
  reglages: null,
  init(reglages) { this.reglages = reglages; },
  // Les navigateurs n'autorisent le son qu'après un clic ou une touche : un bouton de manette ne
  // compte pas. Le jeu retente à chaque appui et affiche une invite tant que le son attend.
  demarrer() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    try { this.ctx = new AC({ latencyHint: 'interactive' }); } catch (e) { return; }
    const c = this.ctx;
    // bus → gain maître → compresseur de cohésion → limiteur → sortie ; réverbération partagée
    this.maitre = c.createGain(); this.maitre.gain.value = 3.4;
    const cohesion = c.createDynamicsCompressor(); cohesion.threshold.value = -20; cohesion.knee.value = 10; cohesion.ratio.value = 3; cohesion.attack.value = 0.004; cohesion.release.value = 0.2;
    const limiteur = c.createDynamicsCompressor(); limiteur.threshold.value = -4; limiteur.knee.value = 0; limiteur.ratio.value = 20; limiteur.attack.value = 0.001; limiteur.release.value = 0.12;
    this.maitre.connect(cohesion); cohesion.connect(limiteur); limiteur.connect(c.destination);
    this.reverb = c.createConvolver(); this.reverb.buffer = this.reponseSalle(2.6, 3); this.reverb.connect(this.maitre);
    this.busEffets = c.createGain(); this.busEffets.connect(this.maitre);
    this.busMusique = c.createGain(); this.busMusique.connect(this.maitre);
    for (const [bus, k] of [[this.busEffets, 0.14], [this.busMusique, 0.42]]) { const e = c.createGain(); e.gain.value = k; bus.connect(e); e.connect(this.reverb); }
    if (c.state === 'suspended') c.resume().catch(() => {});
    this.appliquerVolumes();
    const n = this.ctx.sampleRate * 1.5, b = this.ctx.createBuffer(1, n, this.ctx.sampleRate), d = b.getChannelData(0);
    let s = 12345; for (let i = 0; i < n; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; d[i] = (s / 0x3fffffff) - 1; }
    this.bruit = b; this.brun = this.bruitBrun(); this.actif = true;
    // saturation douce (tanh) pour le corps des chocs : du mordant sans écrêter
    this.busSat = c.createWaveShaper(); const k = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; k[i] = Math.tanh(2.6 * x) / Math.tanh(2.6); } this.busSat.curve = k; this.busSat.oversample = '2x';
    const gs = c.createGain(); gs.gain.value = 0.7; this.busSat.connect(gs); gs.connect(this.busEffets);
    this.chargerPack();
    Musique.init(this);
  },
  // window.SONS_PERSO = { nom: 'data:audio/…;base64,…' | [variantes…], _volume: { nom: 0…2 } }
  pack: null, packVol: {},
  chargerPack() {
    const P = window.SONS_PERSO; if (!P || typeof P !== 'object' || !this.ctx) return;
    this.pack = {}; this.packVol = P._volume || {};
    for (const [nom, v] of Object.entries(P)) {
      if (nom[0] === '_') continue; const L = this.pack[nom] = [];
      for (const src of (Array.isArray(v) ? v : [v])) {
        try { const bin = atob(String(src).slice(String(src).indexOf(',') + 1)), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); this.ctx.decodeAudioData(u.buffer).then(b => L.push(b)).catch(() => {}); } catch (e) { /* entrée illisible : son synthétisé */ }
      }
    }
  },
  suspendu() { return !this.ctx || this.ctx.state !== 'running'; },
  appliquerVolumes() {
    if (!this.ctx || !this.reglages) return;
    this.busEffets.gain.value = (this.reglages.volEffets ?? 0.8) * 1.1;
    this.busMusique.gain.value = (this.reglages.volMusique ?? 0.6) * 1.0;
  },
  // Réponse impulsionnelle synthétique (bruit stéréo à décroissance) : une salle de pierre
  reponseSalle(duree, pente) {
    const c = this.ctx, n = Math.floor(c.sampleRate * duree), b = c.createBuffer(2, n, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); let s = 777 + ch * 131; for (let i = 0; i < n; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; d[i] = ((s / 0x3fffffff) - 1) * Math.pow(1 - i / n, pente) * (i < 60 ? i / 60 : 1); } }
    return b;
  },
  // ── primitives anciennes (musique) ──
  osc(type, f0, f1, t0, dur, vol, dest, attaque = 0.004) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t0); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
    g.gain.value = 0.0001; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t0 + attaque); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(dest); o.start(t0); o.stop(t0 + dur + 0.02);
    return o;
  },
  souffle(t0, dur, vol, filtre, f0, f1, q, dest) {
    const c = this.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.bruit; s.loop = true; f.type = filtre; f.frequency.setValueAtTime(f0, t0); if (f1) f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t0 + dur); f.Q.value = q || 0.8;
    g.gain.value = 0.0001; g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t0 + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t0, Math.random()); s.stop(t0 + dur + 0.02);
    return s;
  },
  // bruit brun (marche aléatoire amortie) : grondements, souffles graves, feu
  bruitBrun() {
    const c = this.ctx, n = c.sampleRate * 2, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0); let s = 98765, v = 0, m = 0;
    for (let i = 0; i < n; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; v = (v + 0.02 * ((s / 0x3fffffff) - 1)) * 0.998; d[i] = v; m = Math.max(m, Math.abs(v)); }
    for (let i = 0; i < n; i++) d[i] /= m; return b;
  },
  // ── primitives des effets : source → [filtre] → enveloppe → destination ──
  // enveloppe : montée linéaire en a secondes, puis décroissance exponentielle (≈ 1 % au bout de dur)
  env(t, a, dur, vol) { const g = this.ctx.createGain(); g.gain.value = 0; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + a); g.gain.setTargetAtTime(0, t + a, Math.max(0.004, (dur - a) / 4.6)); return g; },
  // ton qui glisse de f0 à f1 ; o.a attaque, o.glisse durée du glissé, o.vib [fréquence, profondeur Hz], o.filtre [type, f, Q]
  ton(type, f0, f1, t, dur, vol, dest, o = {}) {
    const c = this.ctx, s = c.createOscillator(), g = this.env(t, o.a ?? 0.002, dur, vol);
    s.type = type; s.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) s.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + (o.glisse ?? dur));
    if (o.vib) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = o.vib[0]; lg.gain.value = o.vib[1]; l.connect(lg); lg.connect(s.frequency); l.start(t); l.stop(t + dur + 0.1); }
    let n = s; if (o.filtre) { const f = c.createBiquadFilter(); f.type = o.filtre[0]; f.frequency.value = o.filtre[1]; f.Q.value = o.filtre[2] ?? 0.7; s.connect(f); n = f; }
    n.connect(g); g.connect(dest); s.start(t); s.stop(t + dur * 1.8 + 0.05);
  },
  // bruit filtré qui balaie f0 → f1 (o.type lowpass/highpass/bandpass, o.q, o.a, o.brun)
  bruitF(t, dur, vol, dest, o = {}) {
    const c = this.ctx, s = c.createBufferSource(), g = this.env(t, o.a ?? 0.002, dur, vol);
    s.buffer = o.brun ? this.brun : this.bruit; s.loop = true; let n = s;
    if (o.type) { const f = c.createBiquadFilter(); f.type = o.type; f.frequency.setValueAtTime(o.f0, t); if (o.f1) f.frequency.exponentialRampToValueAtTime(Math.max(30, o.f1), t + (o.glisse ?? dur)); f.Q.value = o.q ?? 0.8; n.connect(f); n = f; }
    n.connect(g); g.connect(dest); s.start(t, Math.random() * 1.2); s.stop(t + dur * 1.8 + 0.05);
  },
  // métal en modulation de fréquence : rapport inharmonique = timbre de lame, de clé, de pic
  fm(t, fc, ratio, indice, dur, vol, dest) {
    const c = this.ctx, car = c.createOscillator(), mod = c.createOscillator(), mg = c.createGain(), g = this.env(t, 0.001, dur, vol);
    car.frequency.value = fc; mod.frequency.value = fc * ratio; mg.gain.setValueAtTime(indice * fc * ratio, t); mg.gain.setTargetAtTime(0, t, dur / 4);
    mod.connect(mg); mg.connect(car.frequency); car.connect(g); g.connect(dest); car.start(t); mod.start(t); car.stop(t + dur * 1.8 + 0.05); mod.stop(t + dur * 1.8 + 0.05);
  },
  // cloche : partiels inharmoniques qui s'éteignent à leur rythme (pièces, clés, carillons)
  cloche(t, f, dur, vol, dest, P = [[1, 1, 1], [2.76, 0.42, 0.55], [5.4, 0.2, 0.3], [8.93, 0.08, 0.18]]) { for (const [r, a, k] of P) this.ton('sine', f * r, 0, t, dur * k, vol * a, dest, { a: 0.001 }); },
  // corde pincée (Karplus-Strong) : tampon calculé une fois par note, façon koto
  _cordes: {},
  corde(f, clair = 0.5) {
    const sr = this.ctx.sampleRate, cle = Math.round(f * 2) + '|' + clair + '|' + sr; let b = this._cordes[cle]; if (b) return b;
    const n = Math.floor(sr * 1.6), P = Math.max(2, Math.round(sr / f)), L = new Float32Array(P); b = this.ctx.createBuffer(1, n, sr); const d = b.getChannelData(0);
    let s = 4242 + Math.round(f * 7); for (let i = 0; i < P; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; L[i] = (s / 0x3fffffff) - 1; }
    for (let k = 0; k < Math.round((1 - clair) * 4); k++) for (let i = 0; i < P; i++) L[i] = 0.5 * (L[i] + L[(i + 1) % P]); // excitation adoucie
    const amort = Math.min(0.9995, 0.9965 + f / 200000); let j = 0, m = 0;
    for (let i = 0; i < n; i++) { const k2 = (j + 1) % P, v = L[j]; d[i] = v; L[j] = amort * 0.5 * (v + L[k2]); j = k2; m = Math.max(m, Math.abs(v)); }
    for (let i = 0; i < n; i++) d[i] /= m || 1; return (this._cordes[cle] = b);
  },
  pincer(t, f, dur, vol, dest, clair = 0.5) {
    const c = this.ctx, s = c.createBufferSource(), g = c.createGain(); s.buffer = this.corde(f, clair);
    g.gain.value = vol; g.gain.setValueAtTime(vol, t); g.gain.setTargetAtTime(0, t + dur * 0.6, dur / 6); s.connect(g); g.connect(dest); s.start(t); s.stop(t + Math.min(1.6, dur + 0.3));
  },
  clic(t, vol, dest, f = 3000) { this.bruitF(t, 0.012, vol, dest, { type: 'bandpass', f0: f, q: 0.9, a: 0.0005 }); },
  // crépitement : grains de bruit très courts semés sur la durée (feu, débris, mèche, sable)
  crepiter(t, dur, n, vol, dest, f = 2500) { for (let i = 0; i < n; i++) { const u = Math.random(); this.bruitF(t + u * dur, 0.008 + Math.random() * 0.012, vol * (0.45 + Math.random() * 0.55) * (1 - u * 0.5), dest, { type: 'bandpass', f0: f * (0.6 + Math.random() * 0.9), q: 2.2, a: 0.0005 }); } },
  // voix à formants (« ha ») : dent de scie filtrée par les résonances d'une voyelle a
  syllabe(t, p, dur, vol, dest) {
    const c = this.ctx, s = c.createOscillator(), g = this.env(t, 0.012, dur, vol); s.type = 'sawtooth'; s.frequency.setValueAtTime(p * 1.12, t); s.frequency.exponentialRampToValueAtTime(p * 0.82, t + dur);
    for (const [fq, q, a] of [[760, 5, 1.6], [1180, 6, 1], [2550, 7, 0.45]]) { const f = c.createBiquadFilter(), ga = c.createGain(); f.type = 'bandpass'; f.frequency.value = fq; f.Q.value = q; ga.gain.value = a; s.connect(f); f.connect(ga); ga.connect(g); }
    g.connect(dest); s.start(t); s.stop(t + dur + 0.1);
  },
  // ── effets nommés ──
  // limites : [intervalle minimal (s), voix simultanées max, priorité]
  LIMITES: {
    tir: [0.045, 3, 1], impact: [0.03, 4, 1], impact_mur: [0.05, 2, 0], ennemi_mort: [0.03, 4, 2], degat_joueur: [0.2, 1, 5],
    explosion: [0.06, 3, 4], ryo: [0.05, 2, 2], cle: [0.08, 1, 2], coeur: [0.08, 1, 2], protection: [0.08, 1, 2], objet: [0.3, 1, 5],
    objet_mineur: [0.1, 1, 3], porte_ferme: [0.2, 1, 3], porte_ouvre: [0.2, 1, 3], secret: [0.5, 1, 5], achat: [0.1, 1, 4], refus: [0.15, 1, 3],
    charge_pleine: [0.2, 1, 2], actif: [0.2, 1, 4], pilule: [0.2, 1, 3], boss_intro: [1, 1, 6], boss_mort: [1, 1, 6], rocher: [0.05, 2, 1],
    jarre: [0.05, 2, 1], coffre: [0.15, 1, 3], menu: [0.03, 2, 2], valider: [0.05, 1, 3], annuler: [0.05, 1, 3], transformation: [1, 1, 6],
    telegraphe: [0.12, 2, 5], laser: [0.08, 2, 2], eclair: [0.05, 2, 2], eau: [0.06, 2, 1], feu: [0.06, 2, 1], vent: [0.08, 2, 1],
    sable: [0.06, 2, 1], fumee: [0.08, 2, 1], invocation: [0.2, 1, 3], meche: [0.15, 2, 1], pics: [0.2, 1, 3], tir_ennemi: [0.06, 3, 1],
    charge: [0.3, 1, 2], lame: [0.05, 2, 1], pas_lourd: [0.12, 1, 1], rire: [0.5, 1, 3], gong: [0.8, 1, 5], sceau: [0.3, 1, 4],
    nettoyee: [0.5, 1, 4], battement: [0.6, 1, 1], pacte: [0.8, 1, 5],
  },
  jouer(nom, vol = 1, hauteur = 1) {
    if (!this.actif || !this.ctx || this.ctx.state !== 'running') return;
    const L = this.LIMITES[nom] || [0.03, 3, 1];
    const t = this.ctx.currentTime;
    if (t - (this.dernier[nom] || -1) < L[0]) return;
    this.voix = this.voix.filter(v => v.fin > t);
    if (this.voix.filter(v => v.nom === nom).length >= L[1]) return;
    if (this.voix.length >= 22) { // budget global : on n'écrase jamais une voix plus prioritaire
      const moins = this.voix.reduce((a, v) => (!a || v.prio < a.prio ? v : a), null);
      if (!moins || moins.prio > L[2]) return;
    }
    this.dernier[nom] = t;
    const d = this.busEffets, h = hauteur * (0.95 + Math.random() * 0.1);
    const Pk = this.pack && this.pack[nom];
    if (Pk && Pk.length) { // son du pack personnel
      const b = Pk[(Math.random() * Pk.length) | 0], s = this.ctx.createBufferSource(), g = this.ctx.createGain();
      s.buffer = b; s.playbackRate.value = h; g.gain.value = 0.22 * vol * (this.packVol[nom] ?? 1); s.connect(g); g.connect(d); s.start(t);
      this.voix.push({ nom, fin: t + b.duration / h, prio: L[2] }); return;
    }
    const duree = this.synth(nom, t, vol, h, d);
    this.voix.push({ nom, fin: t + duree, prio: L[2] });
  },
  // Partition de chaque effet ; renvoie sa durée (budget de voix). d : bus des effets, S : bus saturé (chocs).
  synth(nom, t, v, h, d) {
    const S = this.busSat || d, R = Math.random;
    switch (nom) {
      // ── combat ──
      case 'tir': // kunai lancé : souffle bref qui monte, éclat de métal
        this.bruitF(t, 0.09, 0.55 * v, d, { type: 'bandpass', f0: 1700 * h, f1: 5200 * h, q: 2, a: 0.006 });
        this.fm(t, 2900 * h, 1.47, 2.2, 0.07, 0.07 * v, d); return 0.1;
      case 'lame': // tranchant : sifflement aigu qui balaie, lame qui chante
        this.bruitF(t, 0.13, 0.55 * v, d, { type: 'bandpass', f0: 2400 * h, f1: 7000 * h, q: 2.6, a: 0.005 });
        this.fm(t + 0.015, 3600 * h, 1.51, 1.2, 0.16, 0.06 * v, d); return 0.16;
      case 'tir_ennemi': // projectile ennemi : « fwip » plus sourd
        this.bruitF(t, 0.1, 0.34 * v, d, { type: 'bandpass', f0: 800 * h, f1: 2300 * h, q: 1.8, a: 0.005 });
        this.ton('triangle', 460 * h, 250 * h, t, 0.09, 0.1 * v, d); return 0.1;
      case 'impact': // coup qui porte : bosse grave saturée, craquement, clic
        this.ton('sine', 190 * h, 52, t, 0.13, 0.4 * v, S, { glisse: 0.09 });
        this.bruitF(t, 0.06, 0.24 * v, d, { type: 'lowpass', f0: 3800, f1: 700, q: 0.9, a: 0.001 });
        this.bruitF(t, 0.05, 0.15 * v, d, { type: 'bandpass', f0: 450 * h, q: 1.2, a: 0.001 });
        this.clic(t, 0.16 * v, d, 2400 * h); return 0.13;
      case 'impact_mur': // « toc » sur la pierre
        this.bruitF(t, 0.045, 0.26 * v, d, { type: 'bandpass', f0: 1300 * h, q: 2.8, a: 0.001 });
        this.ton('sine', 560 * h, 290, t, 0.04, 0.1 * v, d); return 0.05;
      case 'ennemi_mort': // « pouf » de fumée, petite détonation qui retombe
        this.bruitF(t, 0.34, 0.38 * v, d, { type: 'lowpass', f0: 4200 * h, f1: 320, q: 0.7, a: 0.004 });
        this.ton('sine', 620 * h, 170, t, 0.1, 0.22 * v, S, { glisse: 0.08 });
        this.bruitF(t + 0.02, 0.2, 0.1 * v, d, { type: 'bandpass', f0: 1100, f1: 500, q: 1 }); return 0.35;
      case 'degat_joueur': // le héros encaisse : choc sourd saturé, souffle coupé, petit sifflement
        this.ton('sine', 230, 62, t, 0.2, 0.62 * v, S, { glisse: 0.14 });
        this.ton('triangle', 150, 95, t, 0.18, 0.12 * v, d, { filtre: ['lowpass', 900] });
        this.bruitF(t, 0.14, 0.26 * v, d, { type: 'lowpass', f0: 2600, f1: 380, q: 0.8, a: 0.001 });
        this.ton('sine', 2350, 2300, t + 0.03, 0.32, 0.018 * v, d, { a: 0.02 }); return 0.36;
      case 'explosion': // détonation : grave qui s'effondre, souffle large saturé, débris qui crépitent
        this.ton('sine', 115 * h, 30, t, 0.75, 0.64 * v, S, { glisse: 0.5 });
        this.bruitF(t, 0.95, 0.55 * v, S, { type: 'lowpass', f0: 5200, f1: 150, q: 0.6, a: 0.003 });
        this.bruitF(t, 1.1, 0.42 * v, d, { type: 'lowpass', f0: 900, f1: 120, q: 0.7, a: 0.01, brun: true });
        this.bruitF(t, 0.22, 0.2 * v, d, { type: 'bandpass', f0: 950, q: 0.8, a: 0.001 });
        this.crepiter(t + 0.08, 0.65, 14, 0.07 * v, d, 2400); return 1.1;
      case 'meche': // mèche qui grésille
        this.bruitF(t, 0.36, 0.07 * v, d, { type: 'highpass', f0: 4200, q: 0.8, a: 0.01 });
        this.crepiter(t, 0.34, 9, 0.05 * v, d, 6000); return 0.36;
      case 'telegraphe': // alerte : double tintement métallique net
        this.fm(t, 1760, 2, 1.4, 0.08, 0.16 * v, d); this.fm(t + 0.095, 1760, 2, 1.4, 0.09, 0.16 * v, d); return 0.2;
      case 'pics': // pics qui jaillissent : raclement métallique
        this.fm(t, 1700 * h, 2.41, 3.5, 0.14, 0.07 * v, d);
        this.bruitF(t, 0.07, 0.12 * v, d, { type: 'highpass', f0: 3800, q: 0.8, a: 0.001 }); return 0.14;
      case 'pas_lourd': // pas de géant, choc au sol
        this.ton('sine', 105, 38, t, 0.24, 0.55 * v, S, { glisse: 0.15 });
        this.bruitF(t, 0.1, 0.26 * v, d, { type: 'bandpass', f0: 260, q: 1, a: 0.001 });
        this.bruitF(t, 0.12, 0.18 * v, d, { type: 'lowpass', f0: 600, f1: 200, q: 0.8, brun: true }); return 0.25;
      case 'rocher': // roche qui éclate : choc, craquement, gravats
        this.ton('sine', 160 * h, 55, t, 0.16, 0.45 * v, S, { glisse: 0.1 });
        this.bruitF(t, 0.22, 0.34 * v, d, { type: 'lowpass', f0: 2400, f1: 300, q: 0.9, a: 0.001 });
        this.crepiter(t + 0.04, 0.26, 8, 0.07 * v, d, 1300); return 0.3;
      case 'jarre': // poterie qui vole en éclats : fracas clair et tessons qui tintent
        this.ton('sine', 230 * h, 120, t, 0.06, 0.18 * v, d);
        this.bruitF(t, 0.17, 0.3 * v, d, { type: 'bandpass', f0: 3200, q: 0.6, a: 0.001 });
        for (let i = 0; i < 4; i++) this.cloche(t + 0.02 + R() * 0.15, (2300 + R() * 1500) * h, 0.09, 0.045 * v, d, [[1, 1, 1], [2.32, 0.5, 0.6]]); return 0.25;
      // ── natures et techniques ──
      case 'feu': // flamme : souffle grave qui gronde et crépite
        this.bruitF(t, 0.36, 0.42 * v, d, { type: 'lowpass', f0: 1900 * h, f1: 600, q: 0.8, a: 0.04, brun: true });
        this.bruitF(t, 0.3, 0.1 * v, d, { type: 'bandpass', f0: 1200, q: 1, a: 0.03 });
        this.crepiter(t + 0.02, 0.3, 7, 0.06 * v, d, 3200); return 0.36;
      case 'eau': // gerbe d'eau et bulles
        this.bruitF(t, 0.22, 0.42 * v, d, { type: 'bandpass', f0: 1500 * h, f1: 520, q: 1.3, a: 0.003 });
        for (let i = 0; i < 3; i++) { const u = 0.04 + R() * 0.14; this.ton('sine', (520 + R() * 300) * h, (1000 + R() * 400) * h, t + u, 0.04, 0.09 * v, d, { a: 0.002 }); } return 0.24;
      case 'vent': // rafale : deux bandes de souffle qui balaient
        this.bruitF(t, 0.38, 0.6 * v, d, { type: 'bandpass', f0: 600 * h, f1: 2600 * h, q: 3.5, a: 0.06 });
        this.bruitF(t + 0.03, 0.32, 0.26 * v, d, { type: 'bandpass', f0: 1300 * h, f1: 3800 * h, q: 6, a: 0.05 }); return 0.4;
      case 'sable': // sable qui file : chuintement granuleux
        this.bruitF(t, 0.3, 0.17 * v, d, { type: 'highpass', f0: 3200, f1: 1500, q: 0.7, a: 0.03 });
        this.crepiter(t, 0.28, 12, 0.03 * v, d, 7000); return 0.3;
      case 'eclair': // foudre : claquements secs en rafale, roulement grave
        for (const u of [0, 0.028, 0.065]) this.bruitF(t + u, 0.05, 0.32 * v, d, { type: 'highpass', f0: 1800 + R() * 1400, q: 0.7, a: 0.0008 });
        this.fm(t, 900 * h, 3.3, 6, 0.08, 0.05 * v, d);
        this.bruitF(t + 0.02, 0.65, 0.22 * v, S, { type: 'lowpass', f0: 380, f1: 90, q: 0.7, a: 0.02, brun: true }); return 0.65;
      case 'laser': // rayon : bourdon qui vibre, souffle aigu
        this.ton('sawtooth', 1150 * h, 720 * h, t, 0.32, 0.08 * v, d, { vib: [28, 45], filtre: ['lowpass', 3200] });
        this.ton('square', 220 * h, 200 * h, t, 0.3, 0.03 * v, d, { filtre: ['lowpass', 800] });
        this.bruitF(t, 0.26, 0.05 * v, d, { type: 'highpass', f0: 4200, q: 0.7, a: 0.01 }); return 0.33;
      case 'fumee': // nuage de fumée
        this.bruitF(t, 0.36, 0.32 * v, d, { type: 'lowpass', f0: 3200 * h, f1: 260, q: 0.7, a: 0.006 }); return 0.36;
      case 'invocation': // invocation : « boum » grave, nuage, tintement
        this.ton('sine', 130 * h, 48, t, 0.34, 0.5 * v, S, { glisse: 0.22 });
        this.bruitF(t, 0.48, 0.36 * v, d, { type: 'lowpass', f0: 3600, f1: 240, q: 0.7, a: 0.006 });
        this.cloche(t + 0.06, 784 * h, 0.6, 0.05 * v, d); return 0.6;
      case 'actif': // technique : « voum » qui monte, sous-grave
        this.bruitF(t, 0.36, 0.26 * v, d, { type: 'bandpass', f0: 320 * h, f1: 2800 * h, q: 1.5, a: 0.025 });
        this.ton('sine', 170 * h, 440 * h, t, 0.32, 0.18 * v, d, { a: 0.02 });
        this.ton('sine', 92, 48, t, 0.22, 0.35 * v, S); return 0.4;
      case 'charge': // le chakra se concentre : ton qui monte en vibrant, souffle qui s'ouvre
        this.ton('sine', 220, 880, t, 0.55, 0.12 * v, d, { a: 0.15, vib: [9, 12] });
        this.bruitF(t, 0.55, 0.12 * v, d, { type: 'bandpass', f0: 400, f1: 2600, q: 3, a: 0.3 }); return 0.55;
      case 'charge_pleine': // charge prête : tintement clair
        this.cloche(t, 1568, 0.35, 0.11 * v, d); this.cloche(t + 0.04, 2349, 0.3, 0.06 * v, d);
        this.bruitF(t, 0.15, 0.03 * v, d, { type: 'highpass', f0: 6500, q: 0.7 }); return 0.36;
      case 'sceau': // sceau : papier qui claque, double tintement
        this.bruitF(t, 0.12, 0.16 * v, d, { type: 'bandpass', f0: 1900, f1: 5200, q: 1.5, a: 0.004 });
        this.cloche(t + 0.08, 1046, 0.55, 0.08 * v, d); this.cloche(t + 0.15, 1568, 0.5, 0.06 * v, d); return 0.6;
      case 'pilule': // gorgée et petites bulles
        this.ton('sine', 380 * h, 190 * h, t, 0.08, 0.22 * v, d); this.ton('sine', 310 * h, 160 * h, t + 0.1, 0.08, 0.18 * v, d);
        this.ton('sine', 900 * h, 1350 * h, t + 0.2, 0.05, 0.06 * v, d); return 0.27;
      // ── ramassages, économie ──
      case 'ryo': // pièces : deux tintements de métal
        this.clic(t, 0.05 * v, d, 5000); this.cloche(t, 1568 * h, 0.26, 0.12 * v, d); this.cloche(t + 0.055, 2093 * h, 0.34, 0.12 * v, d); return 0.36;
      case 'cle': // clés qui tintent
        for (const [u, f] of [[0, 2637], [0.045, 3136], [0.09, 2349]]) this.cloche(t + u, f * h, 0.22, 0.07 * v, d, [[1, 1, 1], [2.3, 0.45, 0.5], [3.9, 0.25, 0.3]]);
        this.bruitF(t, 0.08, 0.05 * v, d, { type: 'highpass', f0: 6500, q: 0.7 }); return 0.32;
      case 'coeur': // cœur : deux cordes pincées et un halo doux
        this.pincer(t, 523, 0.5, 0.26 * v, d, 0.55); this.pincer(t + 0.075, 784, 0.6, 0.24 * v, d, 0.6);
        this.ton('sine', 1046, 0, t + 0.07, 0.42, 0.05 * v, d, { a: 0.04 }); return 0.6;
      case 'protection': // bouclier : accord qui monte en scintillant
        this.ton('sine', 660, 990, t, 0.32, 0.13 * v, d, { a: 0.02, vib: [7, 6] }); this.ton('sine', 990, 1485, t + 0.05, 0.32, 0.07 * v, d, { a: 0.02 });
        this.bruitF(t, 0.28, 0.035 * v, d, { type: 'highpass', f0: 5200, q: 0.7, a: 0.04 }); return 0.38;
      case 'objet': { // objet majeur : arpège de koto, cloches, nappe douce, scintillement
        [392, 523, 587, 784, 880].forEach((f, i) => this.pincer(t + i * 0.07, f, 0.9, 0.28 * v, d, 0.6));
        this.cloche(t + 0.36, 1046, 1.1, 0.09 * v, d); this.cloche(t + 0.36, 1568, 1.0, 0.06 * v, d);
        this.ton('sine', 262, 0, t, 1.2, 0.09 * v, d, { a: 0.12 }); this.ton('sine', 392, 0, t + 0.1, 1.1, 0.06 * v, d, { a: 0.12 });
        this.bruitF(t + 0.3, 0.6, 0.025 * v, d, { type: 'highpass', f0: 7000, q: 0.7, a: 0.1 }); return 1.3;
      }
      case 'objet_mineur': this.pincer(t, 784, 0.4, 0.25 * v, d, 0.6); this.pincer(t + 0.06, 1046, 0.45, 0.23 * v, d, 0.6); return 0.4;
      case 'achat': // « ka-ching » : déclic, cloches, pièces
        this.clic(t, 0.1 * v, d, 2200); this.cloche(t + 0.03, 2093, 0.3, 0.11 * v, d); this.cloche(t + 0.09, 2637, 0.42, 0.11 * v, d);
        this.crepiter(t + 0.05, 0.18, 6, 0.03 * v, d, 6500); return 0.45;
      case 'refus': // « non » : deux bourdons graves
        this.ton('triangle', 165, 120, t, 0.11, 0.22 * v, d, { filtre: ['lowpass', 1200] }); this.ton('triangle', 150, 110, t + 0.13, 0.13, 0.22 * v, d, { filtre: ['lowpass', 1200] }); return 0.27;
      case 'coffre': // coffre : grincement, choc du couvercle, carillon
        this.ton('sawtooth', 190, 270, t, 0.24, 0.035 * v, d, { vib: [11, 18], filtre: ['lowpass', 1300] });
        this.ton('sine', 125, 68, t + 0.2, 0.14, 0.32 * v, S); this.bruitF(t + 0.2, 0.08, 0.12 * v, d, { type: 'lowpass', f0: 1200, q: 0.8 });
        this.cloche(t + 0.26, 1318, 0.5, 0.08 * v, d); this.cloche(t + 0.33, 1760, 0.5, 0.07 * v, d); return 0.8;
      // ── salles et portes ──
      case 'porte_ferme': // battants qui retombent : choc lourd, cliquetis
        this.ton('sine', 98, 42, t, 0.32, 0.55 * v, S, { glisse: 0.2 });
        this.bruitF(t, 0.08, 0.22 * v, d, { type: 'bandpass', f0: 300, q: 1, a: 0.001 });
        this.bruitF(t, 0.2, 0.36 * v, d, { type: 'lowpass', f0: 1000, f1: 160, q: 0.8, a: 0.001, brun: true }); this.clic(t, 0.1 * v, d, 1500);
        this.crepiter(t + 0.03, 0.16, 5, 0.05 * v, d, 1200); return 0.34;
      case 'porte_ouvre': // glissement de pierre, petit choc
        this.bruitF(t, 0.42, 0.3 * v, d, { type: 'bandpass', f0: 340, f1: 1100, q: 2, a: 0.06 });
        this.ton('sine', 146, 82, t + 0.33, 0.1, 0.22 * v, S); return 0.45;
      case 'secret': // passage secret : arpège mystérieux et cloche
        [659, 698, 880, 988, 1319].forEach((f, i) => this.pincer(t + i * 0.11, f, 0.8, 0.22 * v, d, 0.5));
        this.cloche(t + 0.56, 1319, 1.2, 0.07 * v, d); return 1.3;
      case 'nettoyee': // salle nettoyée : trois cordes qui s'élèvent, tintement
        [659, 880, 1319].forEach((f, i) => this.pincer(t + i * 0.08, f, 0.8, 0.22 * v, d, 0.6));
        this.cloche(t + 0.25, 1976, 0.7, 0.04 * v, d); return 0.9;
      case 'battement': // vie basse : « boum-boum »
        this.ton('sine', 92, 54, t, 0.14, 0.5 * v, d, { a: 0.006, filtre: ['lowpass', 260] }); this.ton('sine', 82, 50, t + 0.19, 0.13, 0.36 * v, d, { a: 0.006, filtre: ['lowpass', 260] });
        this.bruitF(t, 0.05, 0.12 * v, d, { type: 'lowpass', f0: 420, q: 0.8, a: 0.002 }); this.bruitF(t + 0.19, 0.05, 0.09 * v, d, { type: 'lowpass', f0: 420, q: 0.8, a: 0.002 }); return 0.34;
      // ── interface ──
      case 'menu': this.ton('sine', 1500 * h, 1150 * h, t, 0.035, 0.08 * v, d); this.clic(t, 0.03 * v, d, 4000); return 0.04;
      case 'valider': this.pincer(t, 880, 0.3, 0.2 * v, d, 0.65); this.pincer(t + 0.05, 1319, 0.35, 0.18 * v, d, 0.65); return 0.3;
      case 'annuler': this.pincer(t, 784, 0.3, 0.2 * v, d, 0.55); this.pincer(t + 0.05, 587, 0.35, 0.18 * v, d, 0.55); return 0.3;
      // ── grands moments ──
      case 'transformation': // tourbillon qui monte, arpège, accord, gong
        this.bruitF(t, 1.0, 0.16 * v, d, { type: 'bandpass', f0: 300, f1: 4200, q: 1.2, a: 0.35 });
        [392, 440, 523, 587, 659, 784, 880].forEach((f, i) => this.pincer(t + i * 0.06, f, 0.9, 0.2 * v, d, 0.65));
        this.cloche(t + 0.45, 1046, 1.4, 0.08 * v, d); this.cloche(t + 0.45, 1319, 1.3, 0.06 * v, d); this.gong(t + 0.45, 0.32 * v, d); return 1.8;
      case 'boss_intro': // trois taiko, gong et bourdon grave
        this.taiko(t, 1.0 * v, d); this.taiko(t + 0.25, 0.8 * v, d); this.taiko(t + 0.5, 1.1 * v, d); this.gong(t + 0.5, 0.5 * v, d);
        this.ton('sawtooth', 55, 52, t + 0.5, 1.8, 0.07 * v, d, { a: 0.3, filtre: ['lowpass', 380] }); return 2.2;
      case 'gong': this.gong(t, 0.5 * v, d); return 2.2;
      case 'boss_mort': // la masse s'effondre : détonation, gong, glissando qui retombe
        this.synth('explosion', t, v * 1.1, 0.8, d); this.gong(t + 0.2, 0.42 * v, d);
        this.ton('sine', 420, 60, t + 0.1, 1.3, 0.12 * v, d, { a: 0.05 }); return 1.8;
      case 'rire': for (let i = 0; i < 4; i++) this.syllabe(t + i * 0.13, (195 - i * 13) * h, 0.11, 0.5 * v, d); return 0.6; // rire du boss : « ha ha ha ha »
      case 'pacte': // pacte scellé : accord sombre, gong voilé, souffle
        for (const f of [110, 131, 155]) this.ton('sawtooth', f, f * 0.99, t, 1.4, 0.05 * v, d, { a: 0.25, filtre: ['lowpass', 600] });
        this.gong(t + 0.1, 0.3 * v, d); this.bruitF(t, 1.2, 0.08 * v, d, { type: 'lowpass', f0: 500, f1: 150, q: 0.8, a: 0.3, brun: true }); return 1.5;
      default: this.ton('sine', 660, 0, t, 0.1, 0.08 * v, d); return 0.1;
    }
  },
  // Taiko : peau grave qui chute, claquement de la frappe, corps du fût
  taiko(t, v, dest) {
    dest = dest || this.busEffets;
    this.ton('sine', 155, 50, t, 0.5, 0.62 * v, dest, { a: 0.002, glisse: 0.12 });
    this.ton('sine', 92, 70, t, 0.38, 0.22 * v, dest, { a: 0.003 });
    this.bruitF(t, 0.08, 0.22 * v, dest, { type: 'bandpass', f0: 220, q: 1.5, a: 0.001 });
    this.bruitF(t, 0.06, 0.28 * v, dest, { type: 'lowpass', f0: 1400, f1: 300, q: 0.8, a: 0.0008, brun: true });
  },
  // Gong : partiels inharmoniques qui battent lentement, frappe feutrée
  gong(t, v, dest) {
    dest = dest || this.busEffets;
    for (const [r, a, dur] of [[1, 0.16, 2.6], [1.004, 0.1, 2.4], [1.48, 0.11, 2.1], [1.96, 0.08, 1.8], [2.57, 0.06, 1.4], [3.11, 0.045, 1.1], [4.2, 0.03, 0.8]]) this.ton('sine', 98 * r, 98 * r * 0.996, t, dur, a * v, dest, { a: 0.012 });
    this.bruitF(t, 0.12, 0.12 * v, dest, { type: 'lowpass', f0: 1500, f1: 400, q: 0.8, a: 0.002 });
  },
};

// ── Musique : séquenceur à anticipation, couches dynamiques ──
const GAMMES = {
  in: [0, 1, 5, 7, 8],        // miyako-bushi : étrange, tendu
  yo: [0, 2, 5, 7, 9],        // plus ouvert
  ryukyu: [0, 4, 5, 7, 11],
  sombre: [0, 1, 3, 7, 8],
};
const Musique = {
  A: null, piste: null, pas: 0, prochain: 0, minuteur: null, couches: null, combat: 0, cibleCombat: 0,
  init(A) {
    this.A = A; if (this.piste) this.prochain = A.ctx.currentTime + 0.1;
    const c = A.ctx;
    this.gAmb = c.createGain(); this.gPerc = c.createGain(); this.gAmb.gain.value = 1; this.gPerc.gain.value = 0;
    this.gAmb.connect(A.busMusique); this.gPerc.connect(A.busMusique);
    this.minuteur = setInterval(() => this.planifier(), 25);
  },
  // Une piste est générée de façon déterministe depuis son nom : mélodie originale.
  jouerPiste(nom, opts = {}) {
    if (this.piste && this.piste.nom === nom) return;
    const r = new Alea('musique|' + nom);
    const gamme = GAMMES[opts.gamme || 'in'];
    const racine = opts.racine || 50; // MIDI
    const tempo = opts.tempo || 84;
    const mesures = 8, pasParMesure = 16;
    // motif rythmique et mélodie en marche aléatoire bornée
    const melodie = [];
    let deg = 7;
    for (let m = 0; m < mesures; m++) {
      const rythme = r.choix([[0, 4, 6, 8, 12], [0, 3, 6, 10, 12, 14], [0, 8, 10, 12], [0, 2, 4, 8, 11, 12], [0, 6, 8, 14]]);
      for (const p of rythme) {
        if (m % 4 === 3 && p > 8) continue; // respiration en fin de phrase
        deg = borne(deg + r.choix([-2, -1, -1, 1, 1, 2, 0, 3, -3]), 2, 13);
        melodie.push({ pas: m * pasParMesure + p, deg, dur: r.choix([2, 2, 3, 4, 6]) });
      }
    }
    const basse = []; for (let m = 0; m < mesures; m++) basse.push({ pas: m * pasParMesure, deg: r.choix([0, 0, 3, 4, 1]) , dur: 14 });
    const perc = opts.perc || [0, 6, 8, 11]; // taiko
    this.piste = { nom, gamme, racine, tempo, mesures, pasParMesure, melodie, basse, perc, timbre: opts.timbre || 'koto', intensite: opts.intensite || 1, boss: !!opts.boss };
    this.pas = 0; if (this.A && this.A.ctx) this.prochain = this.A.ctx.currentTime + 0.1;
  },
  arreter() { this.piste = null; },
  freq(deg) { const p = this.piste; const g = p.gamme; const oct = Math.floor(deg / g.length), i = ((deg % g.length) + g.length) % g.length; return 440 * Math.pow(2, (p.racine + 12 * oct + g[i] - 69) / 12); },
  planifier() {
    const A = this.A; if (!A || !A.ctx || !this.piste || A.ctx.state !== 'running') return;
    const p = this.piste, spb = 60 / p.tempo / 4; // secondes par double-croche
    // fondu des percussions selon l'état de combat
    const cible = this.cibleCombat, g = this.gPerc.gain;
    this.combat = approche(this.combat, cible, 0.02);
    g.setTargetAtTime(this.combat * p.intensite, A.ctx.currentTime, 0.3);
    while (this.prochain < A.ctx.currentTime + 0.15) {
      const t = this.prochain, total = p.mesures * p.pasParMesure, s = this.pas % total;
      for (const n of p.melodie) if (n.pas === s) this.note(n.deg, t, n.dur * spb, p.timbre);
      for (const n of p.basse) if (n.pas === s) this.basse(n.deg, t, n.dur * spb);
      if (s % (p.pasParMesure * 2) === 0) this.nappe(t, p.pasParMesure * 2 * spb);
      const dans = s % p.pasParMesure;
      if (p.perc.includes(dans)) A.taiko(t, (dans === 0 ? 0.55 : 0.32) * (p.boss ? 1.2 : 1), this.gPerc);
      if (dans % 2 === 1 && p.boss) A.souffle(t, 0.03, 0.05, 'highpass', 6000, 0, 1, this.gPerc);
      if (dans === 4 || dans === 12) A.souffle(t, 0.04, 0.06, 'highpass', 5000, 0, 1, this.gPerc);
      this.pas++; this.prochain += spb;
    }
  },
  note(deg, t, dur, timbre) {
    const A = this.A, f = this.freq(deg);
    if (timbre === 'koto') { A.pincer(t, f, Math.min(1.3, dur + 0.6), 0.2, this.gAmb, 0.55); A.osc('sine', f, f * 0.998, t, Math.min(1.1, dur + 0.4), 0.03, this.gAmb, 0.01); }
    else if (timbre === 'flute') { A.ton('sine', f * 0.99, f, t, dur + 0.15, 0.07, this.gAmb, { a: 0.07, glisse: 0.06, vib: [5.2, f * 0.008] }); A.souffle(t, dur * 0.8, 0.012, 'bandpass', f * 2, 0, 6, this.gAmb); }
    else { A.osc('square', f, f, t, dur * 0.9, 0.035, this.gAmb, 0.01); }
  },
  basse(deg, t, dur) { const f = this.freq(deg - 10); this.A.osc('triangle', f, f, t, dur, 0.09, this.gAmb, 0.05); },
  // nappe tenue (fondamentale et quinte, attaque lente) : remplit l'espace sous la mélodie
  nappe(t, dur) { for (const [d, v] of [[-5, 0.045], [-2, 0.03], [0, 0.018]]) { const f = this.freq(d); this.A.osc('sine', f, f * 1.002, t, dur, v, this.gAmb, Math.min(0.8, dur * 0.3)); } },
  etatCombat(v) { this.cibleCombat = v ? 1 : 0; },
};
