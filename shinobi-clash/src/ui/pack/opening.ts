import type { PackOpening } from '../../core/gacha';
import type { OwnedShinobi } from '../../core/profile';
import type { Rarity } from '../../core/types';
import { getPack } from '../../data/packs';
import { RARITIES, rarityAtLeast } from '../../data/rarities';
import { getShinobi } from '../../data/shinobi';
import { audio } from '../../services/audio';
import { game } from '../../services/gameService';
import { button, shinobiCard } from '../components';
import { h, reflow } from '../dom';
import { sleep, vibrate } from '../frame';
import { PixelParticles } from './particles';

/** Aura et particules associées à chaque rareté pendant l'ouverture. */
export const RARITY_FX: Record<Rarity, { color: string; o: number; particles: string[] }> = {
  common: { color: 'rgba(230,220,200,.5)', o: 0.25, particles: ['#d8d0c0', '#a8a090'] },
  uncommon: { color: 'rgba(120,230,120,.6)', o: 0.45, particles: ['#a4f0a0', '#5dbb63'] },
  rare: { color: 'rgba(80,160,255,.8)', o: 0.7, particles: ['#8cc4ff', '#3f8ef0', '#ffffff'] },
  epic: { color: 'rgba(170,90,255,.85)', o: 0.85, particles: ['#d59bff', '#a34ff0', '#ffffff'] },
  legendary: { color: 'rgba(255,200,60,.95)', o: 1, particles: ['#ffe28a', '#f0b429', '#ffffff'] },
};

/** Rareté affichée pendant l'anticipation quand on « cache » la vraie (fausse piste vers le bas). */
const UNDERSELL: Record<Rarity, Rarity> = {
  common: 'common',
  uncommon: 'common',
  rare: 'uncommon',
  epic: 'rare',
  legendary: 'epic',
};

/** Le parchemin fermé : deux moitiés, rouleaux, kanji, nom et sceau à déchirer. */
export function packVisual(packId: string): HTMLDivElement {
  const pack = getPack(packId);
  const el = h(
    'div',
    { class: 'pack' },
    h('div', { class: 'half top' }),
    h('div', { class: 'half bottom' }),
    h('div', { class: 'roller t' }),
    h('div', { class: 'roller b' }),
    h('div', { class: 'kanji' }, packId === 'elite' ? '影' : packId === 'starter' ? '学' : '忍'),
    h('div', { class: 'pname' }, pack.name),
    h('div', { class: 'seal' }, h('div', { class: 'cut' }), '封', '印', '封'),
  );
  el.style.setProperty('--pc', pack.color);
  el.style.setProperty('--pa', pack.accent);
  return el;
}

/** La carte révélée montre l'état possédé, sans le badge NEW (le bandeau « NOUVEAU ! » s'en charge). */
function ownedForCard(defId: string): OwnedShinobi | null {
  const owned = game.profile.collection[defId];
  return owned ? { ...owned, isNew: false } : null;
}

export interface OpeningCallbacks {
  onClose: () => void;
  /** Proposé s'il reste des parchemins du même type. */
  onAgain?: () => void;
  /** Bouton supplémentaire dans le résumé (ex. tutoriel) ; il reçoit de quoi fermer l'overlay avant de naviguer. */
  extra?: (close: () => void) => HTMLElement | null;
}

/**
 * Séquence d'ouverture d'un parchemin, en plein écran :
 * 1. le sceau se brise en trois clics (ou un glissé), l'aura trahit la meilleure rareté… ou ment ;
 * 2. le parchemin se déchire, cinq cartes face cachée s'envolent ;
 * 3. chaque carte se révèle au clic, avec une mise en scène qui grandit avec la rareté ;
 * 4. résumé : nouveaux, doublons convertis en fragments, progression de la garantie.
 * Le résultat est déjà décidé (et sauvegardé) avant l'animation : fermer l'écran ne perd rien.
 */
export function playPackOpening(opening: PackOpening, callbacks: OpeningCallbacks): void {
  const settings = game.profile.settings;
  const root = h('div', { class: 'opening' });
  const particles = new PixelParticles(settings.reduceMotion);
  root.append(particles.canvas, h('div', { class: 'vignette' }));
  document.body.appendChild(root);
  audio.playMusic('pack');
  particles.setAmbient('#8a7ac0', 14);

  const best = opening.cards.reduce<Rarity>(
    (top, c) => (RARITIES[c.rarity].order > RARITIES[top].order ? c.rarity : top),
    'common',
  );
  // Fausses pistes : parfois l'aura sous-estime un bon tirage (surprise positive), parfois elle promet un Rare de trop.
  const undersell = rarityAtLeast(best, 'rare') && Math.random() < 0.3;
  const oversell = !rarityAtLeast(best, 'rare') && Math.random() < 0.12;
  const teased: Rarity = undersell ? UNDERSELL[best] : oversell ? 'rare' : best;

  const packCenter = () => {
    const box = stagePack.getBoundingClientRect();
    return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  };
  const stagePack = h('div', { class: 'stage-pack' }, h('div', { class: 'aura' }), packVisual(opening.packId));
  const hint = h('div', { class: 'hint' }, 'Clique 3 fois sur le sceau (ou Espace) — ou glisse pour le déchirer');
  const skip = button('Tout révéler ⏭', () => void revealAll(true), { size: 'small', variant: 'dark', cls: 'skip' });
  root.append(stagePack, hint, skip);

  let taps = 0;
  let torn = false;
  const aura = stagePack.querySelector<HTMLElement>('.aura')!;
  const cut = stagePack.querySelector<HTMLElement>('.seal .cut')!;

  function glow(rarity: Rarity, intensity: number): void {
    aura.style.setProperty('--glow', RARITY_FX[rarity].color);
    aura.style.setProperty('--glow-o', String(RARITY_FX[rarity].o * intensity));
    cut.style.setProperty('--glow', RARITY_FX[rarity].color);
  }

  function shake(level: 1 | 2 | 3): void {
    stagePack.classList.remove('shake-1', 'shake-2', 'shake-3');
    reflow(stagePack);
    stagePack.classList.add(`shake-${level}`);
  }

  async function tapSeal(): Promise<void> {
    if (torn) return;
    audio.unlock();
    taps++;
    const c = packCenter();
    if (taps === 1) {
      shake(1);
      audio.play('flip');
      glow(teased, 0.4);
      cut.style.width = '30%';
      particles.burst(c.x, c.y, RARITY_FX[teased].particles, 12, { speed: 90 });
    } else if (taps === 2) {
      shake(2);
      audio.play('flip');
      glow(teased, 0.8);
      cut.style.width = '65%';
      particles.gather(c.x, c.y, RARITY_FX[teased].particles[0], 40);
      vibrate(15, settings.vibration);
    } else {
      await tear();
    }
  }

  async function tear(): Promise<void> {
    if (torn) return;
    torn = true;
    hint.remove();
    const c = packCenter();
    if (oversell) {
      // La promesse s'éteint dans un nuage gris.
      particles.burst(c.x, c.y, ['#8a8a8a', '#6a6a6a'], 20, { speed: 40, gravity: 120 });
      audio.play('poof');
      glow(best, 0.5);
      await sleep(350);
    }
    if (best === 'legendary') {
      audio.playMusic(null);
      root.classList.add('blackout');
      shake(3);
      await sleep(300);
      audio.play('heartbeat');
      vibrate([40, 120, 40], settings.vibration);
      await sleep(550);
      audio.play('heartbeat');
      await sleep(450);
    }
    if (undersell) {
      // L'aura change brusquement de couleur : c'était mieux que prévu !
      glow(best, 1);
      flash(RARITY_FX[best].color);
      audio.play(best === 'legendary' ? 'legendary' : 'epic');
      particles.burst(c.x, c.y, RARITY_FX[best].particles, 60, { speed: 220 });
      shake(3);
      await sleep(450);
    }
    cut.style.width = '100%';
    audio.play('tear');
    shake(3);
    await sleep(160);
    stagePack.classList.add('torn');
    flash(RARITY_FX[best].color);
    particles.burst(c.x, c.y, RARITY_FX[best].particles, rarityAtLeast(best, 'epic') ? 120 : 60, {
      speed: 260,
      life: 1.2,
    });
    particles.setAmbient(RARITY_FX[best].particles[0], rarityAtLeast(best, 'rare') ? 30 : 12);
    root.classList.remove('blackout');
    if (!settings.reduceShake) root.classList.add('screen-shake');
    await sleep(500);
    stagePack.remove();
    dealCards();
  }

  // Glisser horizontalement sur le sceau le découpe progressivement.
  let dragStart: { x: number } | null = null;
  stagePack.addEventListener('pointerdown', (e) => {
    dragStart = { x: e.clientX };
  });
  stagePack.addEventListener('pointermove', (e) => {
    if (!dragStart || torn) return;
    const dist = Math.abs(e.clientX - dragStart.x);
    cut.style.width = `${Math.min(100, (dist / 140) * 100)}%`;
    if (dist > 140) {
      dragStart = null;
      glow(teased, 0.9);
      void tear();
    }
  });
  stagePack.addEventListener('pointerup', (e) => {
    const dist = dragStart ? Math.abs(e.clientX - dragStart.x) : 0;
    dragStart = null;
    if (dist < 12) void tapSeal();
  });

  function flash(color: string): void {
    const el = h('div', { class: 'flash' });
    el.style.setProperty('--fc', color);
    root.appendChild(el);
    setTimeout(() => el.remove(), 600);
  }

  const row = h('div', { class: 'reveal-row' });
  const revealed = new Set<number>();
  const cardEls: HTMLDivElement[] = [];
  let revealing = false;

  /** Cinq cartes face cachée ; les rares et mieux laissent filtrer une lueur colorée. */
  function dealCards(): void {
    root.appendChild(row);
    opening.cards.forEach((card, i) => {
      const hintColor =
        card.rarity === 'legendary'
          ? '#ffd050'
          : card.rarity === 'epic'
            ? '#b060ff'
            : card.rarity === 'rare'
              ? '#50a0ff'
              : null;
      const el = h(
        'div',
        { class: `fcard ${card.rarity === 'legendary' ? 'wobble' : ''}`, style: { animationDelay: `${i * 90}ms` } },
        h(
          'div',
          { class: 'inner' },
          h('div', { class: 'face back' }, '忍'),
          h('div', { class: 'face front' }, shinobiCard(card.defId, ownedForCard(card.defId), { compact: true })),
        ),
      );
      el.style.setProperty('--rot', `${(i - 2) * 8}deg`);
      if (hintColor) {
        el.style.setProperty('--hint', hintColor);
        el.style.setProperty('--hint-blur', card.rarity === 'rare' ? '10px' : '20px');
        el.style.setProperty('--hint-spread', card.rarity === 'legendary' ? '6px' : '2px');
      }
      el.addEventListener('click', () => void revealCard(i));
      cardEls.push(el);
      row.appendChild(el);
      setTimeout(() => audio.play('whoosh'), i * 90);
    });
    skip.textContent = 'Tout révéler ⏭';
    const tapHint = h('div', { class: 'hint' }, 'Clique sur une carte pour la révéler');
    root.appendChild(tapHint);
    setTimeout(() => tapHint.remove(), 2600);
  }

  async function revealCard(index: number, fast = false): Promise<void> {
    if (revealed.has(index) || revealing) return;
    revealing = true;
    revealed.add(index);
    const card = opening.cards[index];
    const el = cardEls[index];
    const box = el.getBoundingClientRect();
    const cx = box.left + box.width / 2;
    const cy = box.top + box.height / 2;
    if (card.rarity === 'legendary') {
      await legendaryReveal(index);
    } else {
      audio.play('flip');
      el.classList.add('flipped', 'pop');
      await sleep(fast ? 120 : 260);
      if (card.rarity === 'epic') {
        audio.play('epic');
        flash('rgba(170,90,255,.6)');
        const rays = h('div', { class: 'rays epic' });
        root.appendChild(rays);
        setTimeout(() => rays.remove(), 1600);
        particles.burst(cx, cy, RARITY_FX.epic.particles, 70, { speed: 200 });
        vibrate(40, settings.vibration);
        if (!settings.reduceShake) {
          root.classList.remove('screen-shake');
          reflow(root);
          root.classList.add('screen-shake');
        }
      } else if (card.rarity === 'rare') {
        audio.play('rare');
        particles.burst(cx, cy, RARITY_FX.rare.particles, 40, { speed: 160 });
      } else {
        audio.play('reveal');
        particles.burst(cx, cy, RARITY_FX[card.rarity].particles, 14, { speed: 90 });
      }
    }
    el.appendChild(
      h(
        'div',
        { class: `tagline ${card.isNew ? 'new' : 'dupe'}` },
        card.isNew ? 'NOUVEAU !' : ['DOUBLON', h('br'), `+${card.fragments} fragments`],
      ),
    );
    revealing = false;
    if (revealed.size === opening.cards.length) void showSummary();
  }

  /** Silence, écran noir, deux battements de cœur, flash, rayons dorés, puis la carte en grand. */
  async function legendaryReveal(index: number): Promise<void> {
    const card = opening.cards[index];
    const el = cardEls[index];
    const def = getShinobi(card.defId);
    audio.playMusic(null);
    root.classList.add('blackout');
    el.style.zIndex = '10';
    await sleep(300);
    audio.play('heartbeat');
    el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], { duration: 380 });
    await sleep(480);
    audio.play('heartbeat');
    el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.2)' }, { transform: 'scale(1)' }], { duration: 380 });
    vibrate([60, 60, 120], settings.vibration);
    await sleep(520);
    flash('#fff6d0');
    audio.play('legendary');
    el.classList.remove('wobble');
    el.classList.add('flipped', 'pop');
    root.classList.remove('blackout');
    const rays = h('div', { class: 'rays' });
    root.appendChild(rays);
    const box = el.getBoundingClientRect();
    particles.burst(box.left + box.width / 2, box.top + box.height / 2, RARITY_FX.legendary.particles, 160, {
      speed: 300,
      life: 1.6,
    });
    particles.setAmbient('#ffe28a', 40);
    if (!settings.reduceShake) {
      root.classList.remove('screen-shake');
      reflow(root);
      root.classList.add('screen-shake');
    }
    await sleep(350);
    const big = h(
      'div',
      { class: 'big-reveal' },
      h('div', { class: 'rtitle', style: { color: RARITIES.legendary.color } }, '★ LÉGENDAIRE ★'),
      shinobiCard(card.defId, ownedForCard(card.defId)),
      h('div', { class: 'rname' }, `${def.name} — ${def.variant}`),
      h('div', { class: 'dim', style: 'font-size:14px' }, 'Cliquez pour continuer'),
    );
    root.appendChild(big);
    await new Promise<void>((resolve) => big.addEventListener('click', () => resolve(), { once: true }));
    big.remove();
    setTimeout(() => rays.remove(), 300);
    el.style.zIndex = '';
    audio.playMusic('pack');
  }

  async function revealAll(tearFirst: boolean): Promise<void> {
    if (!torn) {
      if (!tearFirst) return;
      await tear();
    }
    for (let i = 0; i < opening.cards.length; i++) {
      while (revealing) await sleep(50);
      if (!revealed.has(i)) {
        await revealCard(i, true);
        await sleep(opening.cards[i].rarity === 'common' ? 120 : 260);
      }
    }
  }

  let summaryShown = false;
  async function showSummary(): Promise<void> {
    if (summaryShown) return;
    summaryShown = true;
    skip.remove();
    await sleep(500);
    const pack = getPack(opening.packId);
    const pity = opening.pityAfter;
    const newCount = opening.cards.filter((c) => c.isNew).length;
    const fragments = opening.cards.reduce((sum, c) => sum + c.fragments, 0);
    root.appendChild(
      h(
        'div',
        { class: 'pity-note' },
        `${newCount} nouveau${newCount > 1 ? 'x' : ''} · ${fragments} fragments`,
        pack.epicPity < 999
          ? h(
              'div',
              null,
              `Épique garanti dans ${pack.epicPity - pity.sinceEpic} · Légendaire garanti dans ${pack.legendaryPity - pity.sinceLegendary}`,
            )
          : null,
        opening.pityTriggered
          ? h(
              'div',
              { style: 'color:var(--gold)' },
              `Garantie ${opening.pityTriggered === 'legendary' ? 'Légendaire' : 'Épique'} activée !`,
            )
          : null,
      ),
    );
    const canAgain = callbacks.onAgain && (game.profile.packs[opening.packId] ?? 0) > 0;
    root.appendChild(
      h(
        'div',
        { class: 'summary' },
        canAgain
          ? button(
              `Ouvrir un autre (${game.profile.packs[opening.packId]})`,
              () => {
                close();
                callbacks.onAgain!();
              },
              { variant: 'gold', size: 'big' },
            )
          : null,
        callbacks.extra?.(close) ?? null,
        button(
          'Terminer',
          () => {
            close();
            callbacks.onClose();
          },
          { variant: canAgain ? 'dark' : 'blue' },
        ),
      ),
    );
  }

  function close(): void {
    particles.destroy();
    root.remove();
    document.removeEventListener('keydown', onKey);
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.key !== ' ' && e.key !== 'Enter') return;
    if (!torn) void tapSeal();
    else {
      const next = opening.cards.findIndex((_, i) => !revealed.has(i));
      if (next >= 0) void revealCard(next);
    }
  };
  document.addEventListener('keydown', onKey);
}
