import type { BattleUnit, ElementId, SkipReason, Side, StageStat, StatusId, StatusInstance } from '../../core/types';
import { Bar, ChakraPips, elementChip, statusIcon } from '../components';
import { clear, h } from '../dom';

/**
 * Copie de l'unité telle qu'affichée. L'écran la met à jour événement par événement, pendant que
 * l'état du moteur est déjà à la fin du tour : c'est ce décalage qui permet d'animer chaque étape.
 */
export interface UnitView {
  uid: string;
  defId: string;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  chakra: number;
  statuses: StatusInstance[];
  stages: Record<StageStat, number>;
  shield: number;
  clone: boolean;
  fainted: boolean;
  elements: ElementId[];
  ccImmune: number;
}

export function snapshotUnit(unit: BattleUnit): UnitView {
  return {
    uid: unit.uid,
    defId: unit.defId,
    name: unit.name,
    level: unit.level,
    hp: unit.hp,
    maxHp: unit.maxHp,
    chakra: unit.chakra,
    statuses: unit.statuses.map((s) => ({ ...s })),
    stages: { ...unit.stages },
    shield: unit.shield,
    clone: unit.clone,
    fainted: unit.fainted,
    elements: [...unit.elements],
    ccImmune: unit.ccImmune,
  };
}

const STAT_SHORT: Record<StageStat, string> = { attack: 'ATK', defense: 'DEF', speed: 'VIT', crit: 'CRT' };

export const STATUS_INFLICTED: Record<StatusId, string> = {
  burn: 'est brûlé !',
  poison: 'est empoisonné !',
  paralysis: 'est paralysé !',
  bleed: 'saigne !',
  confusion: 'est confus !',
  sleep: "s'endort !",
  silence: 'est réduit au silence !',
  stun: 'est étourdi !',
  chakraSeal: 'voit son chakra scellé !',
  bomb: "est couvert d'argile explosive !",
};

export const SKIP_TEXT: Record<SkipReason, string> = {
  sleep: 'dort profondément…',
  stun: 'est étourdi et ne peut pas agir !',
  paralysis: 'est paralysé ! Il ne peut pas bouger !',
};

export const STAT_NAMES: Record<StageStat, string> = {
  attack: "L'Attaque",
  defense: 'La Défense',
  speed: 'La Vitesse',
  crit: 'Le taux critique',
};

/** Plaque d'information d'un combattant : nom, niveau, éléments, PV, chakra, statuts. */
export class BattleHud {
  readonly el: HTMLDivElement;
  readonly speed = h('span', { class: 'speed' });
  view: UnitView | null = null;
  private readonly nameEl = h('span', { class: 'nm' });
  private readonly levelEl = h('span', { class: 'lv' });
  private readonly hp = new Bar(1);
  private readonly hpNum = h('div', { class: 'hpnum' });
  private readonly chakra: ChakraPips;
  private readonly fx = h('div', { class: 'fx' });
  private readonly elems = h('div', { class: 'elems' });

  constructor(side: Side, chakraMax: number) {
    this.chakra = new ChakraPips(chakraMax, 0);
    this.el = h(
      'div',
      { class: `hud ${side === 0 ? 'player' : 'enemy'} hidden-hud` },
      h(
        'div',
        { class: 'plate' },
        h('div', { class: 'top' }, this.nameEl, this.elems, this.levelEl),
        h('div', { class: 'hprow' }, h('span', { class: 'lbl' }, 'PV'), this.hp.el),
        side === 0 ? this.hpNum : null,
        h(
          'div',
          { class: 'ckrow' },
          h('span', { class: 'lbl ck' }, 'CK'),
          this.chakra.el,
          side === 0 ? this.speed : null,
        ),
      ),
      this.fx,
    );
  }

  bind(view: UnitView): void {
    this.view = view;
    this.nameEl.textContent = view.name;
    this.levelEl.textContent = `Nv${view.level}`;
    clear(this.elems);
    view.elements.forEach((e) => this.elems.appendChild(elementChip(e, false)));
    this.hp.set(view.hp / view.maxHp, true);
    this.chakra.set(view.chakra, true);
    this.renderHp();
    this.renderFx();
    this.el.classList.remove('hidden-hud');
  }

  hide(): void {
    this.el.classList.add('hidden-hud');
  }

  updateHp(): void {
    if (!this.view) return;
    this.hp.set(this.view.hp / this.view.maxHp);
    this.renderHp();
  }

  updateChakra(): void {
    if (this.view) this.chakra.set(this.view.chakra);
  }

  previewCost(cost: number): void {
    this.chakra.preview(cost);
  }

  private renderHp(): void {
    if (this.view) this.hpNum.textContent = `${Math.max(0, this.view.hp)}/ ${this.view.maxHp}`;
  }

  renderFx(): void {
    clear(this.fx);
    const view = this.view;
    if (!view) return;
    view.statuses.forEach((s) => this.fx.appendChild(statusIcon(s.id, s.turns)));
    (Object.keys(view.stages) as StageStat[]).forEach((stat) => {
      const stage = view.stages[stat];
      if (stage === 0) return;
      this.fx.appendChild(
        h(
          'span',
          { class: 'fx-tag', style: { background: stage > 0 ? '#f8e070' : '#a8b8f0' } },
          `${STAT_SHORT[stat]}${stage > 0 ? '▲' : '▼'}${Math.abs(stage)}`,
        ),
      );
    });
    if (view.shield > 0) {
      this.fx.appendChild(
        h('span', { class: 'fx-tag', style: { background: '#e0c080' }, title: 'Bouclier' }, `⛨${view.shield}`),
      );
    }
    if (view.clone) {
      this.fx.appendChild(h('span', { class: 'fx-tag', style: { background: '#fff' }, title: 'Clone' }, 'CLONE'));
    }
    if (view.ccImmune > 0) {
      this.fx.appendChild(
        h(
          'span',
          {
            class: 'fx-tag',
            style: { background: '#c8f0ff' },
            title: `Immunisé aux contrôles (étourdi, sommeil) pendant ${view.ccImmune} tour(s)`,
          },
          `IMMUN ${view.ccImmune}`,
        ),
      );
    }
  }
}
