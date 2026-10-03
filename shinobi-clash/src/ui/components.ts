import type { CurrencyId, ElementId, Rarity, Reward, Role, StatusId } from '../core/types';
import type { OwnedShinobi } from '../core/profile';
import { COSMETICS_BY_ID } from '../data/cosmetics';
import { CURRENCIES } from '../data/currencies';
import { ELEMENTS } from '../data/elements';
import { PASSIVE_INFO } from '../data/passiveInfo';
import { RARITIES } from '../data/rarities';
import { ROLES } from '../data/roles';
import { getShinobi } from '../data/shinobi';
import { STATUSES } from '../data/statuses';
import { portraitUrl, spriteUrl } from '../game/gfx/sprites';
import { audio, type SoundId } from '../services/audio';
import { h, reflow, type Child } from './dom';
import { onNextFrame, sleep } from './frame';

// ---------- Boutons et puces ----------

export interface ButtonOptions {
  variant?: 'primary' | 'gold' | 'dark' | 'ghost' | 'danger' | string;
  size?: 'small' | 'big' | string;
  cls?: string;
  title?: string;
  disabled?: boolean;
  sfx?: SoundId;
  badge?: string | number;
}

/** Bouton pixel : son, déverrouillage audio et anti double-clic (220 ms). */
export function button(label: Child, onClick: (e: MouseEvent) => void, opts: ButtonOptions = {}): HTMLButtonElement {
  let locked = false;
  const btn: HTMLButtonElement = h(
    'button',
    {
      class: ['btn', opts.variant, opts.size, opts.cls].filter(Boolean).join(' '),
      title: opts.title,
      disabled: opts.disabled,
      onclick: (e: MouseEvent) => {
        if (locked || btn.disabled) return;
        locked = true;
        setTimeout(() => (locked = false), 220);
        audio.unlock();
        audio.play(opts.sfx ?? 'click');
        onClick(e);
      },
      onpointerenter: () => audio.play('hover'),
    },
    ...(Array.isArray(label) ? label : [label]),
  );
  if (opts.badge) btn.appendChild(h('span', { class: 'badge' }, String(opts.badge)));
  return btn;
}

export function elementChip(element: ElementId, withName = true): HTMLSpanElement {
  const def = ELEMENTS[element];
  return h(
    'span',
    { class: 'chip', style: { background: def.color }, title: def.name },
    h('span', { class: 'elem-kanji' }, def.kanji),
    withName ? def.name : null,
  );
}

export function roleChip(role: Role): HTMLSpanElement {
  const def = ROLES[role];
  return h('span', { class: 'chip', style: { background: '#4a3e6a' }, title: def.desc }, def.icon, ' ', def.name);
}

export function rarityChip(rarity: Rarity): HTMLSpanElement {
  const def = RARITIES[rarity];
  return h('span', { class: 'chip', style: { background: def.color, color: '#1a1420', textShadow: 'none' } }, def.name);
}

/** Icône de statut avec durée restante et infobulle explicative. */
export function statusIcon(status: StatusId, turns?: number): HTMLSpanElement {
  const def = STATUSES[status];
  const el = h(
    'span',
    { class: 'status-icon', style: { background: def.color } },
    def.short,
    turns !== undefined && status !== 'stun'
      ? h('span', { style: 'opacity:.75;margin-left:2px' }, String(turns))
      : null,
  );
  tooltip(el, () => `<b>${def.name}</b>${def.description}`);
  return el;
}

export function currencyGem(currency: CurrencyId): HTMLSpanElement {
  return h('span', { class: 'gem', style: { background: CURRENCIES[currency].color } });
}

// ---------- Infobulle ----------

let openTooltip: HTMLElement | null = null;

/** Infobulle : survol à la souris, appui long au toucher. */
export function tooltip(el: HTMLElement, content: () => string): void {
  const show = (x: number, y: number) => {
    hideTooltip();
    openTooltip = h('div', { class: 'tooltip', html: content() });
    document.body.appendChild(openTooltip);
    const box = openTooltip.getBoundingClientRect();
    openTooltip.style.left = `${Math.max(8, Math.min(window.innerWidth - box.width - 8, x - box.width / 2))}px`;
    openTooltip.style.top = `${Math.max(8, y - box.height - 14)}px`;
  };
  el.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') show(e.clientX, el.getBoundingClientRect().top);
  });
  el.addEventListener('pointerleave', hideTooltip);
  let pressTimer: number | null = null;
  el.addEventListener(
    'touchstart',
    () => {
      pressTimer = window.setTimeout(() => {
        const box = el.getBoundingClientRect();
        show(box.left + box.width / 2, box.top);
      }, 350);
    },
    { passive: true },
  );
  el.addEventListener('touchend', () => {
    if (pressTimer) clearTimeout(pressTimer);
    setTimeout(hideTooltip, 1200);
  });
}

export function hideTooltip(): void {
  openTooltip?.remove();
  openTooltip = null;
}

// ---------- Barres ----------

export function hpColor(ratio: number): string {
  return ratio > 0.5 ? 'var(--hp-hi)' : ratio > 0.2 ? 'var(--hp-mid)' : 'var(--hp-lo)';
}

/** Barre de PV (ou d'XP avec la classe `xp`) avec traînée « fantôme » qui suit en retard. */
export class Bar {
  readonly el: HTMLDivElement;
  private readonly fill: HTMLDivElement;
  private readonly ghost: HTMLDivElement;

  constructor(ratio = 1, cls = '') {
    this.fill = h('div', { class: 'fill' });
    this.ghost = h('div', { class: 'ghost' });
    this.el = h('div', { class: `bar ${cls}` }, this.ghost, this.fill);
    this.set(ratio, true);
  }

  set(ratio: number, instant = false): void {
    const width = `${Math.max(0, Math.min(1, ratio)) * 100}%`;
    if (instant) {
      this.fill.style.transition = this.ghost.style.transition = 'none';
      reflow(this.fill);
    }
    this.fill.style.width = width;
    this.ghost.style.width = width;
    this.fill.style.backgroundColor = this.el.classList.contains('xp') ? '' : hpColor(ratio);
    if (instant) {
      reflow(this.fill);
      this.fill.style.transition = this.ghost.style.transition = '';
    }
  }
}

/** Jauge de chakra en pips ; `preview` surligne le coût du jutsu survolé. */
export class ChakraPips {
  readonly el: HTMLDivElement;
  private readonly pips: HTMLDivElement[] = [];
  private value = 0;

  constructor(
    private readonly max = 10,
    value = 0,
  ) {
    this.el = h('div', { class: 'pips', title: 'Chakra' });
    for (let i = 0; i < max; i++) {
      const pip = h('div', { class: 'pip' });
      this.pips.push(pip);
      this.el.appendChild(pip);
    }
    this.set(value, true);
  }

  set(value: number, instant = false): void {
    const before = this.value;
    this.value = value;
    this.pips.forEach((pip, i) => {
      pip.classList.toggle('on', i < value);
      pip.classList.remove('cost');
      if (!instant && i >= before && i < value) {
        pip.classList.remove('gain');
        reflow(pip);
        pip.classList.add('gain');
      }
    });
  }

  preview(cost: number): void {
    this.pips.forEach((pip, i) => pip.classList.toggle('cost', cost > 0 && i < this.value && i >= this.value - cost));
  }

  get maxPips(): number {
    return this.max;
  }
}

export function starsText(stars: number): string {
  return '★'.repeat(stars) + '☆'.repeat(Math.max(0, 5 - stars));
}

// ---------- Carte de shinobi ----------

export interface CardOptions {
  locked?: boolean;
  selected?: boolean;
  compact?: boolean;
  onClick?: (e: MouseEvent) => void;
}

export function shinobiCard(
  defId: string,
  owned: OwnedShinobi | null | undefined,
  opts: CardOptions = {},
): HTMLDivElement {
  const def = getShinobi(defId);
  const rarity = RARITIES[def.rarity];
  const card = h(
    'div',
    {
      class: `card r-${def.rarity} ${opts.locked ? 'locked' : ''} ${opts.selected ? 'selected' : ''} ${(owned?.stars ?? 0) >= 5 ? 'awakened' : ''}`,
      onclick: opts.onClick,
      'data-id': defId,
    },
    h('div', { class: 'rarity-gem', title: rarity.name }),
    h('div', { class: 'elem-corner' }, ...def.elements.map((e) => elementChip(e, false))),
    owned?.isNew ? h('div', { class: 'new-tag' }, 'NEW') : null,
    h('div', { class: 'art' }, h('img', { src: spriteUrl(defId, 'front'), alt: def.name, draggable: false })),
    h(
      'div',
      { class: 'meta' },
      h('div', { class: 'name' }, opts.locked ? '???' : def.name),
      h(
        'div',
        { class: 'row' },
        h('span', { class: 'lvl' }, owned ? `Nv.${owned.level}` : rarity.name),
        owned ? h('span', { class: 'stars' }, '★'.repeat(owned.stars)) : null,
      ),
      opts.compact
        ? null
        : h('div', { class: 'row' }, h('span', null, `${ROLES[def.role].icon} ${ROLES[def.role].name}`)),
    ),
  );
  card.style.setProperty('--rc', rarity.color);
  card.style.setProperty('--ec', ELEMENTS[def.elements[0]].color);
  return card;
}

export function passiveBlock(passiveId: string): HTMLDivElement {
  const info = PASSIVE_INFO[passiveId];
  return h(
    'div',
    null,
    h('b', { class: 'px-font', style: 'font-size:9px' }, info?.name ?? passiveId),
    h('div', { style: 'font-size:15px' }, info?.description ?? ''),
  );
}

// ---------- Modales et notifications ----------

export interface ModalOptions {
  dark?: boolean;
  closable?: boolean;
  onClose?: () => void;
}

/** Ouvre une modale ; renvoie la fonction de fermeture. Échap et clic extérieur ferment si `closable`. */
export function openModal(content: Node, opts: ModalOptions = {}): () => void {
  const panel = h('div', { class: `panel modal ${opts.dark ? 'dark' : ''}` });
  const close = () => {
    backdrop.remove();
    hideTooltip();
    document.removeEventListener('keydown', onKey);
    opts.onClose?.();
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && opts.closable !== false) {
      audio.play('back');
      close();
    }
  };
  if (opts.closable !== false) {
    panel.appendChild(button('✕', close, { size: 'small', variant: 'dark', cls: 'close', sfx: 'back' }));
  }
  panel.appendChild(content);
  const backdrop: HTMLDivElement = h(
    'div',
    {
      class: 'modal-backdrop',
      onclick: (e: MouseEvent) => {
        if (e.target === backdrop && opts.closable !== false) close();
      },
    },
    panel,
  );
  document.body.appendChild(backdrop);
  document.addEventListener('keydown', onKey);
  return close;
}

export function promptText(title: string, initial: string, maxLength = 16): Promise<string | null> {
  return new Promise((resolve) => {
    let done = false;
    const input = h('input', { class: 'field', value: initial, maxlength: maxLength });
    const finish = (value: string | null) => {
      if (done) return;
      done = true;
      close();
      resolve(value);
    };
    const submit = () => {
      const value = input.value.trim();
      if (value) finish(value);
      else {
        toast('Le nom ne peut pas être vide.', 'error');
        input.focus();
      }
    };
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submit();
    });
    const close = openModal(
      h(
        'div',
        null,
        h('h2', null, title),
        input,
        h(
          'div',
          { class: 'row', style: 'margin-top:12px;justify-content:flex-end' },
          button('Annuler', () => finish(null), { variant: 'dark', sfx: 'back' }),
          button('Valider', submit, { variant: 'gold' }),
        ),
      ),
      { onClose: () => finish(null) },
    );
    setTimeout(() => {
      input.focus();
      input.select();
    }, 60);
  });
}

export function confirmDialog(title: string, message: string, confirmLabel = 'Confirmer'): Promise<boolean> {
  return new Promise((resolve) => {
    let done = false;
    const finish = (value: boolean) => {
      if (done) return;
      done = true;
      close();
      resolve(value);
    };
    const close = openModal(
      h(
        'div',
        null,
        h('h2', null, title),
        h('p', { style: 'margin:8px 0 0' }, message),
        h(
          'div',
          { class: 'row', style: 'margin-top:14px;justify-content:flex-end' },
          button('Annuler', () => finish(false), { variant: 'dark', sfx: 'back' }),
          button(confirmLabel, () => finish(true), { variant: 'primary' }),
        ),
      ),
      { onClose: () => finish(false) },
    );
  });
}

let toastHost: HTMLDivElement | null = null;

export function toast(message: Child, kind: '' | 'error' | 'success' | 'gold' | string = ''): void {
  if (!toastHost) {
    toastHost = h('div', { class: 'toasts' });
    document.body.appendChild(toastHost);
  }
  if (kind === 'error') audio.play('error');
  const el = h('div', { class: `toast ${kind}` }, message);
  toastHost.appendChild(el);
  setTimeout(() => {
    el.classList.add('out');
    setTimeout(() => el.remove(), 300);
  }, 2400);
}

// ---------- Récompenses animées ----------

/** Compteur qui défile de `from` à `to` (ease-out cubique). */
export async function countUp(
  el: HTMLElement,
  from: number,
  to: number,
  duration = 700,
  format: (n: number) => string = (n) => n.toLocaleString('fr-FR'),
): Promise<void> {
  const start = performance.now();
  return new Promise((resolve) => {
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      el.textContent = format(Math.round(from + (to - from) * eased));
      if (t < 1) onNextFrame(step);
      else resolve();
    };
    onNextFrame(step);
  });
}

/** Des gemmes s'envolent depuis `from` jusqu'au compteur de monnaie de la barre du haut. */
export async function flyCurrency(
  from: HTMLElement | { x: number; y: number },
  currency: CurrencyId,
  count = 6,
): Promise<void> {
  const target = document.querySelector<HTMLElement>(`.currency[data-c="${currency}"]`);
  const origin =
    from instanceof HTMLElement ? from.getBoundingClientRect() : { left: from.x, top: from.y, width: 0, height: 0 };
  const x0 = origin.left + origin.width / 2;
  const y0 = origin.top + origin.height / 2;
  const box = target?.getBoundingClientRect();
  const x1 = box ? box.left + 10 : window.innerWidth - 40;
  const y1 = box ? box.top + box.height / 2 : 20;
  for (let i = 0; i < count; i++) {
    const flyer = h('div', { class: 'flyer' }, currencyGem(currency));
    flyer.style.left = `${x0}px`;
    flyer.style.top = `${y0}px`;
    document.body.appendChild(flyer);
    const dx = (Math.random() - 0.5) * 80;
    const dy = -30 - Math.random() * 50;
    flyer.animate(
      [
        { transform: 'translate(0,0) scale(0.6)', opacity: 0 },
        { transform: `translate(${dx}px, ${dy}px) scale(1.2)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${x1 - x0}px, ${y1 - y0}px) scale(0.8)`, opacity: 1 },
      ],
      { duration: 700 + i * 60, easing: 'cubic-bezier(.5,0,.8,.4)' },
    ).onfinish = () => {
      flyer.remove();
      if (i % 2 === 0) audio.play('coin');
      if (target) {
        target.classList.remove('bump');
        reflow(target);
        target.classList.add('bump');
      }
    };
    await sleep(45);
  }
}

export function rewardLines(reward: Reward): string[] {
  const lines: string[] = [];
  for (const [currency, amount] of Object.entries(reward.currencies ?? {})) {
    lines.push(`+${amount} ${CURRENCIES[currency as CurrencyId].name}`);
  }
  for (const [packId, count] of Object.entries(reward.packs ?? {})) {
    const name = packId === 'elite' ? 'Kage' : packId === 'starter' ? 'Académie' : 'Shinobi';
    lines.push(`+${count} parchemin${count > 1 ? 's' : ''} (${name})`);
  }
  if (reward.xp) lines.push(`+${reward.xp} XP`);
  for (const id of reward.cosmetics ?? []) lines.push(cosmeticLabel(id));
  return lines;
}

export function cosmeticLabel(id: string): string {
  const def = COSMETICS_BY_ID[id];
  if (!def) return id;
  return def.kind === 'title' ? `Titre « ${def.name} »` : def.name;
}

export function avatarFrame(defId: string, frameId: string | null, cls = ''): HTMLSpanElement {
  const frame = frameId ? COSMETICS_BY_ID[frameId] : undefined;
  return h(
    'span',
    {
      class: `avatar-frame ${frame?.animated ? 'animated' : ''} ${cls}`,
      style: frame?.colors ? `--f1:${frame.colors[0]};--f2:${frame.colors[1]}` : '',
    },
    h('img', { src: portraitUrl(defId), alt: '' }),
  );
}

export function titleTag(titleId: string | null): HTMLSpanElement | null {
  const def = titleId ? COSMETICS_BY_ID[titleId] : undefined;
  return def ? h('span', { class: 'title-tag' }, def.name) : null;
}
