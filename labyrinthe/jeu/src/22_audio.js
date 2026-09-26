// ═══════════════════════════════════════════════════════════════════════════
// Audio original, entièrement synthétisé (WebAudio) : effets à budget de voix,
// priorités et variations ; musique par couches (ambiance + percussions de combat),
// gammes japonaises (in / yo) et motifs générés depuis une graine fixe par thème.
// ═══════════════════════════════════════════════════════════════════════════

const Son = {
  ctx: null, maitre: null, busEffets: null, busMusique: null, bruit: null,
  voix: [], dernier: {}, actif: false,
  reglages: null,
  init(reglages) { this.reglages = reglages; },
  demarrer() { // doit suivre une activation utilisateur (clic / touche)
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    this.ctx = new AC();
    this.maitre = this.ctx.createDynamicsCompressor(); this.maitre.threshold.value = -14; this.maitre.ratio.value = 4; this.maitre.connect(this.ctx.destination);
    this.busEffets = this.ctx.createGain(); this.busEffets.connect(this.maitre);
    this.busMusique = this.ctx.createGain(); this.busMusique.connect(this.maitre);
    this.appliquerVolumes();
    const n = this.ctx.sampleRate * 1.5, b = this.ctx.createBuffer(1, n, this.ctx.sampleRate), d = b.getChannelData(0);
    let s = 12345; for (let i = 0; i < n; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; d[i] = (s / 0x3fffffff) - 1; }
    this.bruit = b; this.actif = true;
    Musique.init(this);
  },
  suspendu() { return !this.ctx || this.ctx.state !== 'running'; },
  appliquerVolumes() {
    if (!this.ctx || !this.reglages) return;
    this.busEffets.gain.value = (this.reglages.volEffets ?? 0.8) * 0.9;
    this.busMusique.gain.value = (this.reglages.volMusique ?? 0.6) * 0.55;
  },
  // ── primitives ──
  osc(type, f0, f1, t0, dur, vol, dest, attaque = 0.004) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f0, t0); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t0 + attaque); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(dest); o.start(t0); o.stop(t0 + dur + 0.02);
    return o;
  },
  souffle(t0, dur, vol, filtre, f0, f1, q, dest) {
    const c = this.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.bruit; s.loop = true; f.type = filtre; f.frequency.setValueAtTime(f0, t0); if (f1) f.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t0 + dur); f.Q.value = q || 0.8;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t0 + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    s.connect(f); f.connect(g); g.connect(dest); s.start(t0, Math.random()); s.stop(t0 + dur + 0.02);
    return s;
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
    const d = this.busEffets, v = vol, h = hauteur * (0.94 + Math.random() * 0.12);
    let duree = 0.2;
    switch (nom) {
      case 'tir': this.souffle(t, 0.07, 0.16 * v, 'bandpass', 2600 * h, 1500 * h, 1.2, d); this.osc('square', 880 * h, 560 * h, t, 0.05, 0.05 * v, d); duree = 0.08; break;
      case 'tir_ennemi': this.osc('triangle', 520 * h, 300 * h, t, 0.09, 0.07 * v, d); this.souffle(t, 0.05, 0.05 * v, 'highpass', 1800, 0, 1, d); duree = 0.1; break;
      case 'impact': this.osc('sine', 190 * h, 80, t, 0.08, 0.22 * v, d); this.souffle(t, 0.04, 0.08 * v, 'lowpass', 1400, 400, 1, d); duree = 0.09; break;
      case 'impact_mur': this.souffle(t, 0.035, 0.06 * v, 'highpass', 2500, 0, 1, d); duree = 0.04; break;
      case 'ennemi_mort': this.osc('sine', 420 * h, 70, t, 0.14, 0.24 * v, d); this.souffle(t, 0.12, 0.12 * v, 'lowpass', 1800, 200, 1, d); duree = 0.15; break;
      case 'degat_joueur': { const o = this.osc('square', 330, 140, t, 0.22, 0.1 * v, d); this.souffle(t, 0.14, 0.12 * v, 'bandpass', 900, 300, 2, d); duree = 0.23; break; }
      case 'explosion': this.souffle(t, 0.55, 0.5 * v, 'lowpass', 1400, 120, 0.7, d); this.osc('sine', 95, 38, t, 0.45, 0.5 * v, d); this.souffle(t, 0.08, 0.3 * v, 'highpass', 3000, 0, 1, d); duree = 0.56; break;
      case 'meche': this.souffle(t, 0.3, 0.05 * v, 'highpass', 4200, 0, 2, d); duree = 0.3; break;
      case 'ryo': this.osc('triangle', 1318, 0, t, 0.07, 0.12 * v, d); this.osc('triangle', 1760, 0, t + 0.06, 0.16, 0.12 * v, d); duree = 0.22; break;
      case 'cle': this.osc('square', 2093, 0, t, 0.05, 0.05 * v, d); this.osc('square', 2637, 0, t + 0.05, 0.12, 0.05 * v, d); this.osc('triangle', 1568, 0, t + 0.1, 0.2, 0.08 * v, d); duree = 0.3; break;
      case 'coeur': this.osc('triangle', 523, 0, t, 0.1, 0.16 * v, d); this.osc('triangle', 784, 0, t + 0.08, 0.22, 0.14 * v, d); duree = 0.3; break;
      case 'protection': this.osc('sine', 880, 1320, t, 0.3, 0.12 * v, d, 0.05); this.osc('sine', 1320, 1760, t + 0.05, 0.3, 0.07 * v, d, 0.05); duree = 0.35; break;
      case 'objet': {
        const n = [523, 659, 784, 1046, 1318];
        n.forEach((f, i) => this.osc('triangle', f, 0, t + i * 0.07, 0.35, 0.13 * v, d));
        this.osc('sine', 261, 0, t, 0.8, 0.12 * v, d, 0.08); this.osc('sine', 392, 0, t + 0.1, 0.7, 0.08 * v, d, 0.08); duree = 0.8; break;
      }
      case 'objet_mineur': this.osc('triangle', 784, 0, t, 0.1, 0.12 * v, d); this.osc('triangle', 1046, 0, t + 0.07, 0.18, 0.12 * v, d); duree = 0.25; break;
      case 'porte_ferme': this.osc('sine', 110, 55, t, 0.25, 0.35 * v, d); this.souffle(t, 0.15, 0.2 * v, 'lowpass', 600, 100, 1, d); duree = 0.26; break;
      case 'porte_ouvre': this.souffle(t, 0.3, 0.12 * v, 'bandpass', 300, 1200, 1.5, d); this.osc('triangle', 392, 523, t, 0.25, 0.06 * v, d); duree = 0.3; break;
      case 'secret': { const n = [587, 698, 880, 1174, 1046]; n.forEach((f, i) => this.osc('triangle', f, 0, t + i * 0.11, 0.4, 0.13 * v, d)); duree = 0.9; break; }
      case 'achat': this.osc('triangle', 1318, 0, t, 0.08, 0.12 * v, d); this.osc('triangle', 1976, 0, t + 0.07, 0.2, 0.12 * v, d); this.osc('sine', 659, 0, t, 0.3, 0.08 * v, d); duree = 0.3; break;
      case 'refus': this.osc('square', 150, 130, t, 0.18, 0.08 * v, d); duree = 0.2; break;
      case 'charge_pleine': this.osc('sine', 1568, 0, t, 0.12, 0.1 * v, d); this.osc('sine', 2093, 0, t + 0.05, 0.15, 0.07 * v, d); duree = 0.2; break;
      case 'charge': this.osc('sine', 220, 660, t, 0.5, 0.05 * v, d, 0.2); duree = 0.5; break;
      case 'actif': this.souffle(t, 0.3, 0.14 * v, 'bandpass', 600, 2400, 1.2, d); this.osc('triangle', 392, 784, t, 0.3, 0.1 * v, d); duree = 0.32; break;
      case 'pilule': this.osc('sine', 260, 520, t, 0.12, 0.15 * v, d); this.osc('sine', 330, 660, t + 0.13, 0.12, 0.12 * v, d); duree = 0.27; break;
      case 'boss_intro': this.taiko(t, 1.0 * v); this.taiko(t + 0.25, 0.8 * v); this.taiko(t + 0.5, 1.1 * v); this.gong(t + 0.5, 0.5 * v); duree = 2; break;
      case 'gong': this.gong(t, 0.5 * v); duree = 2; break;
      case 'boss_mort': this.souffle(t, 1.2, 0.5 * v, 'lowpass', 2000, 80, 0.7, d); this.osc('sine', 120, 30, t, 1.1, 0.5 * v, d); this.gong(t + 0.2, 0.4 * v); duree = 1.3; break;
      case 'rocher': this.souffle(t, 0.18, 0.22 * v, 'lowpass', 900, 200, 1, d); this.osc('sine', 140, 60, t, 0.12, 0.2 * v, d); duree = 0.2; break;
      case 'jarre': this.souffle(t, 0.12, 0.18 * v, 'highpass', 1800, 0, 1, d); this.osc('triangle', 1400 * h, 900, t, 0.1, 0.08 * v, d); duree = 0.15; break;
      case 'coffre': this.osc('square', 180, 240, t, 0.12, 0.06 * v, d); this.osc('triangle', 523, 0, t + 0.12, 0.2, 0.12 * v, d); this.osc('triangle', 784, 0, t + 0.18, 0.25, 0.12 * v, d); duree = 0.45; break;
      case 'menu': this.osc('square', 1046, 0, t, 0.025, 0.04 * v, d); duree = 0.03; break;
      case 'valider': this.osc('triangle', 784, 0, t, 0.06, 0.1 * v, d); this.osc('triangle', 1175, 0, t + 0.05, 0.1, 0.1 * v, d); duree = 0.16; break;
      case 'annuler': this.osc('triangle', 784, 0, t, 0.06, 0.1 * v, d); this.osc('triangle', 523, 0, t + 0.05, 0.1, 0.1 * v, d); duree = 0.16; break;
      case 'transformation': { const n = [392, 523, 659, 784, 1046, 1318, 1568]; n.forEach((f, i) => this.osc('sawtooth', f, 0, t + i * 0.05, 0.6, 0.04 * v, d)); this.souffle(t, 1.0, 0.1 * v, 'bandpass', 800, 5000, 0.8, d); this.gong(t, 0.3 * v); duree = 1.2; break; }
      case 'telegraphe': this.osc('square', 1760, 1760, t, 0.06, 0.05 * v, d); this.osc('square', 1760, 1760, t + 0.09, 0.06, 0.05 * v, d); duree = 0.16; break;
      case 'laser': this.osc('sawtooth', 220 * h, 110, t, 0.3, 0.07 * v, d); this.osc('square', 440 * h, 220, t, 0.3, 0.03 * v, d); duree = 0.3; break;
      case 'eclair': for (let i = 0; i < 4; i++) this.souffle(t + i * 0.025, 0.03, 0.12 * v, 'highpass', 3000 + i * 500, 0, 1, d); this.osc('square', 1200, 300, t, 0.1, 0.04 * v, d); duree = 0.12; break;
      case 'eau': this.souffle(t, 0.18, 0.14 * v, 'lowpass', 1600, 400, 2, d); this.osc('sine', 600, 250, t, 0.1, 0.06 * v, d); duree = 0.2; break;
      case 'feu': this.souffle(t, 0.25, 0.14 * v, 'bandpass', 700, 300, 0.8, d); duree = 0.25; break;
      case 'vent': this.souffle(t, 0.25, 0.12 * v, 'bandpass', 900, 3200, 3, d); duree = 0.25; break;
      case 'sable': this.souffle(t, 0.2, 0.12 * v, 'highpass', 2200, 800, 0.7, d); duree = 0.2; break;
      case 'fumee': case 'invocation': this.souffle(t, 0.3, 0.2 * v, 'lowpass', 2500, 300, 0.7, d); this.osc('sine', 300, 120, t, 0.2, 0.1 * v, d); duree = 0.3; break;
      case 'pics': this.osc('square', 600, 300, t, 0.08, 0.06 * v, d); this.souffle(t, 0.06, 0.1 * v, 'highpass', 3000, 0, 1, d); duree = 0.1; break;
      case 'lame': this.souffle(t, 0.09, 0.14 * v, 'bandpass', 3400 * h, 1200, 2.5, d); duree = 0.1; break;
      case 'pas_lourd': this.osc('sine', 80, 40, t, 0.2, 0.3 * v, d); duree = 0.2; break;
      case 'rire': for (let i = 0; i < 4; i++) this.osc('square', 300 - i * 20, 260 - i * 20, t + i * 0.1, 0.08, 0.04 * v, d); duree = 0.45; break;
      case 'sceau': this.osc('triangle', 440, 880, t, 0.25, 0.1 * v, d); this.osc('sine', 1320, 0, t + 0.2, 0.3, 0.08 * v, d); duree = 0.5; break;
      default: this.osc('sine', 660, 0, t, 0.1, 0.08 * v, d); duree = 0.1;
    }
    this.voix.push({ nom, fin: t + duree, prio: L[2] });
  },
  taiko(t, v, dest) {
    dest = dest || this.busEffets;
    this.osc('sine', 150, 48, t, 0.45, 0.55 * v, dest, 0.003);
    this.souffle(t, 0.07, 0.22 * v, 'lowpass', 900, 200, 1, dest);
  },
  gong(t, v, dest) {
    dest = dest || this.busEffets;
    [110, 164.8, 220.5, 277, 392.4].forEach((f, i) => this.osc('sine', f, f * 0.995, t, 2.2 - i * 0.25, (0.16 - i * 0.025) * v, dest, 0.01));
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
      const dans = s % p.pasParMesure;
      if (p.perc.includes(dans)) A.taiko(t, (dans === 0 ? 0.55 : 0.32) * (p.boss ? 1.2 : 1), this.gPerc);
      if (dans % 2 === 1 && p.boss) A.souffle(t, 0.03, 0.05, 'highpass', 6000, 0, 1, this.gPerc);
      if (dans === 4 || dans === 12) A.souffle(t, 0.04, 0.06, 'highpass', 5000, 0, 1, this.gPerc);
      this.pas++; this.prochain += spb;
    }
  },
  note(deg, t, dur, timbre) {
    const A = this.A, f = this.freq(deg);
    if (timbre === 'koto') { A.osc('triangle', f, f * 0.998, t, Math.min(1.2, dur + 0.5), 0.1, this.gAmb, 0.002); A.osc('sine', f * 2, 0, t, 0.25, 0.03, this.gAmb, 0.002); }
    else if (timbre === 'flute') { A.osc('sine', f, f, t, dur + 0.1, 0.07, this.gAmb, 0.06); A.souffle(t, dur * 0.8, 0.012, 'bandpass', f * 2, 0, 6, this.gAmb); }
    else { A.osc('square', f, f, t, dur * 0.9, 0.035, this.gAmb, 0.01); }
  },
  basse(deg, t, dur) { const f = this.freq(deg - 10); this.A.osc('triangle', f, f, t, dur, 0.09, this.gAmb, 0.05); },
  etatCombat(v) { this.cibleCombat = v ? 1 : 0; },
};
