import { BOMB_PCT, STATUSES } from '../../data/statuses';
import { Rng } from '../rng';
import type {
  BattleEvent,
  BattleState,
  BattleUnit,
  DamageSource,
  Effectiveness,
  Side,
  StageStat,
  StatusId,
} from '../types';
import { passiveOf } from './passives';
import { hasStatus } from './state';

/**
 * Contexte de résolution : regroupe l'état muté, le RNG et le journal d'événements d'une étape
 * (début de combat, tour, remplacement). `commit()` réécrit l'état du RNG dans le state.
 */
export class BattleContext {
  readonly state: BattleState;
  readonly events: BattleEvent[] = [];
  readonly rng: Rng;

  constructor(state: BattleState) {
    this.state = state;
    this.rng = new Rng(state.rngState);
  }

  commit(): BattleEvent[] {
    this.state.rngState = this.rng.getState();
    return this.events;
  }

  emit(event: BattleEvent): void {
    this.events.push(event);
  }

  heal(unit: BattleUnit, pct: number): void {
    this.healAmount(unit, Math.round(unit.maxHp * pct));
  }

  healAmount(unit: BattleUnit, amount: number): number {
    if (unit.fainted || amount <= 0) return 0;
    const before = unit.hp;
    unit.hp = Math.min(unit.maxHp, unit.hp + amount);
    const healed = unit.hp - before;
    if (healed > 0) {
      this.emit({ t: 'heal', side: unit.side, uid: unit.uid, amount: healed, hp: unit.hp, maxHp: unit.maxHp });
    }
    return healed;
  }

  chakra(unit: BattleUnit, delta: number): void {
    const before = unit.chakra;
    unit.chakra = Math.max(0, Math.min(this.state.config.chakraMax, unit.chakra + delta));
    const change = unit.chakra - before;
    if (change !== 0) this.emit({ t: 'chakra', side: unit.side, uid: unit.uid, delta: change, chakra: unit.chakra });
  }

  buff(unit: BattleUnit, stat: StageStat, stages: number): void {
    const before = unit.stages[stat];
    unit.stages[stat] = Math.max(-3, Math.min(3, before + stages));
    const change = unit.stages[stat] - before;
    if (change !== 0) {
      this.emit({ t: 'buff', side: unit.side, uid: unit.uid, stat, delta: change, total: unit.stages[stat] });
    }
  }

  cleanse(unit: BattleUnit): void {
    for (const s of [...unit.statuses]) this.removeStatus(unit, s.id);
  }

  removeStatus(unit: BattleUnit, status: StatusId): void {
    const index = unit.statuses.findIndex((s) => s.id === status);
    if (index < 0) return;
    unit.statuses.splice(index, 1);
    if (STATUSES[status].hardCC) unit.ccImmune = 2;
    this.emit({ t: 'status', side: unit.side, uid: unit.uid, status, on: false });
  }

  passiveText(unit: BattleUnit, text: string | null | undefined): void {
    if (text) this.emit({ t: 'passive', side: unit.side, uid: unit.uid, passiveId: unit.passive, text });
  }

  inflict(source: BattleUnit, target: BattleUnit, status: StatusId, turns?: number): void {
    inflictStatus(this, source, target, status, turns);
  }

  healLowestAlly(unit: BattleUnit, pct: number): number {
    const ally = lowestAlly(this, unit.side);
    return this.healAmount(ally, Math.round(ally.maxHp * pct));
  }
}

/** Applique des dégâts bruts (après bouclier/clone) et gère K.O., réveil et passifs. */
export function applyDamage(
  ctx: BattleContext,
  target: BattleUnit,
  amount: number,
  crit: boolean,
  eff: Effectiveness,
  hit: number,
  source: DamageSource,
): number {
  if (target.fainted) return 0;
  const dealt = Math.min(target.hp, amount);
  target.hp -= dealt;
  ctx.emit({
    t: 'damage',
    side: target.side,
    uid: target.uid,
    amount: dealt,
    hp: target.hp,
    maxHp: target.maxHp,
    crit,
    eff,
    hit,
    source,
  });
  if (target.hp <= 0) {
    target.fainted = true;
    target.statuses = [];
    ctx.emit({ t: 'faint', side: target.side, uid: target.uid });
    for (const ally of ctx.state.sides[target.side].units) {
      if (ally !== target && !ally.fainted) passiveOf(ally).onAllyFaint?.(ally);
    }
    return dealt;
  }
  if ((source === 'jutsu' || source === 'reflect') && hasStatus(target, 'sleep')) {
    target.statuses = target.statuses.filter((s) => s.id !== 'sleep');
    target.ccImmune = 2;
    ctx.emit({ t: 'wake', side: target.side, uid: target.uid });
    ctx.emit({ t: 'status', side: target.side, uid: target.uid, status: 'sleep', on: false });
  }
  const passive = passiveOf(target);
  if (passive.onDamaged) ctx.passiveText(target, passive.onDamaged(target, ctx));
  return dealt;
}

export function inflictStatus(
  ctx: BattleContext,
  source: BattleUnit,
  target: BattleUnit,
  status: StatusId,
  turns?: number,
): void {
  if (target.fainted) return;
  const def = STATUSES[status];
  if (def.hardCC && (target.ccImmune > 0 || hasStatus(target, 'stun') || hasStatus(target, 'sleep'))) {
    ctx.emit({ t: 'statusResist', side: target.side, uid: target.uid, status });
    return;
  }
  const duration =
    (turns ?? def.defaultTurns) +
    (source.side !== target.side && status !== 'bomb' ? (passiveOf(source).statusTurnsBonus ?? 0) : 0);
  const stacks = status === 'bomb' ? Math.round(BOMB_PCT * 100 * (passiveOf(source).bombMult ?? 1)) : 0;
  const existing = target.statuses.find((s) => s.id === status);
  if (existing) {
    // Une bombe déjà posée ne voit pas son compte à rebours repoussé.
    existing.turns = status === 'bomb' ? Math.min(existing.turns, duration) : Math.max(existing.turns, duration);
    existing.stacks = Math.max(existing.stacks, stacks);
  } else {
    target.statuses.push({ id: status, turns: duration, stacks });
  }
  ctx.emit({ t: 'status', side: target.side, uid: target.uid, status, on: true });
}

/** Allié vivant au plus faible pourcentage de PV, réserve comprise. */
export function lowestAlly(ctx: BattleContext, side: Side): BattleUnit {
  return ctx.state.sides[side].units
    .filter((u) => !u.fainted)
    .reduce((low, u) => (u.hp / u.maxHp < low.hp / low.maxHp ? u : low));
}
