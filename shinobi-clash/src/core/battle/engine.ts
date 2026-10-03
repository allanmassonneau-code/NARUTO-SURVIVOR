import { effectivenessOf, elementMultiplier } from '../../data/elements';
import { ITEMS } from '../../data/items';
import { getJutsu } from '../../data/jutsus';
import { getShinobi } from '../../data/shinobi';
import { levelDamageScale } from '../progression';
import type {
  BattleAction,
  BattleEvent,
  BattleSide,
  BattleState,
  BattleUnit,
  EndReason,
  JutsuDef,
  Side,
  Winner,
} from '../types';
import { applyDamage, BattleContext, inflictStatus, lowestAlly } from './context';
import { computeDamage, DAMAGE_CONFIG, stageMultiplier } from './damage';
import { passiveOf } from './passives';
import { activeUnit, aliveCount, hasStatus, opponentOf, phaseOf } from './state';

/** Priorités : la substitution passe avant tout, puis les objets, puis la priorité propre du jutsu. */
export const SWAP_PRIORITY = 6;
export const ITEM_PRIORITY = 5;
export const CONFUSION_SELF_HIT = 0.33;
export const PARALYSIS_SKIP = 0.25;

export type UnusableReason = 'silence' | 'cooldown' | 'chakra' | null;

export interface JutsuOption {
  jutsu: JutsuDef;
  cost: number;
  usable: boolean;
  reason: UnusableReason;
}

export function basicJutsuOf(unit: BattleUnit): JutsuDef {
  return getJutsu(unit.jutsus.find((id) => getJutsu(id).basic) ?? unit.jutsus[0]);
}

/** Coût réel d'un jutsu pour une unité (sceau de chakra, passifs). */
export function jutsuCost(state: BattleState, unit: BattleUnit, jutsu: JutsuDef): number {
  if (jutsu.basic) return 0;
  const foe = activeUnit(state, opponentOf(unit.side));
  let cost = jutsu.chakraCost;
  if (hasStatus(unit, 'chakraSeal')) cost += 1;
  cost += passiveOf(unit).costDelta?.(unit, foe, jutsu) ?? 0;
  return Math.max(0, cost);
}

export function jutsuOptions(state: BattleState, side: Side): JutsuOption[] {
  const unit = activeUnit(state, side);
  return unit.jutsus.map((id) => {
    const jutsu = getJutsu(id);
    const cost = jutsuCost(state, unit, jutsu);
    let reason: UnusableReason = null;
    if (!jutsu.basic && hasStatus(unit, 'silence')) reason = 'silence';
    else if ((unit.cooldowns[id] ?? 0) > 0) reason = 'cooldown';
    else if (unit.chakra < cost) reason = 'chakra';
    return { jutsu, cost, usable: reason === null, reason };
  });
}

/** Index des remplaçants vivants. */
export function benchOptions(state: BattleState, side: Side): number[] {
  const s = state.sides[side];
  return s.units.map((u, i) => (i !== s.active && !u.fainted ? i : -1)).filter((i) => i >= 0);
}

export function legalActions(state: BattleState, side: Side): BattleAction[] {
  const actions: BattleAction[] = jutsuOptions(state, side)
    .filter((o) => o.usable)
    .map((o) => ({ kind: 'jutsu', jutsuId: o.jutsu.id }));
  for (const to of benchOptions(state, side)) actions.push({ kind: 'swap', to });
  for (const [itemId, count] of Object.entries(state.sides[side].items)) {
    if (count > 0) actions.push({ kind: 'item', itemId });
  }
  return actions;
}

export function isLegalAction(state: BattleState, side: Side, action: BattleAction): boolean {
  return legalActions(state, side).some((a) => JSON.stringify(action) === JSON.stringify(a));
}

export function effectiveSpeed(unit: BattleUnit): number {
  let speed = unit.speed * stageMultiplier(unit.stages.speed);
  if (hasStatus(unit, 'paralysis')) speed *= 0.5;
  speed *= passiveOf(unit).speedMult?.(unit) ?? 1;
  return speed;
}

export function actionPriority(action: BattleAction): number {
  return action.kind === 'swap'
    ? SWAP_PRIORITY
    : action.kind === 'item'
      ? ITEM_PRIORITY
      : getJutsu(action.jutsuId).priority;
}

/** Dégâts moyens attendus (sans critique ni aléa) : utilisés par l'IA et l'interface. */
export function estimateDamage(state: BattleState, attacker: BattleUnit, target: BattleUnit, jutsu: JutsuDef): number {
  if (jutsu.power <= 0) return 0;
  const side = state.sides[attacker.side];
  const mult =
    outgoingMultiplier(attacker, target, jutsu, false) * (passiveOf(target).incomingMult?.(target, attacker) ?? 1);
  return (
    computeDamage({
      power: jutsu.power,
      attack: attacker.attack,
      defense: target.defense,
      attackStage: attacker.stages.attack,
      defenseStage: target.stages.defense,
      elementMult: elementMultiplier(jutsu.element, target.elements),
      stab: jutsu.element !== 'neutral' && attacker.elements.includes(jutsu.element),
      crit: false,
      extraMult: mult * (1 + (side.bonus.elementDamage?.[jutsu.element] ?? 0)),
      levelScale: levelDamageScale(attacker.level),
      roll: 0.5,
    }) * (jutsu.hits ?? 1)
  );
}

function outgoingMultiplier(attacker: BattleUnit, target: BattleUnit, jutsu: JutsuDef, cloneConsumed: boolean): number {
  let mult = passiveOf(attacker).outgoingMult?.(attacker, target, jutsu) ?? 1;
  if (jutsu.bonusVsStatus && jutsu.bonusVsStatus.statuses.some((s) => hasStatus(target, s))) {
    mult *= jutsu.bonusVsStatus.mult;
  }
  if (jutsu.execute && target.hp / target.maxHp < jutsu.execute.below) mult *= jutsu.execute.mult;
  if (jutsu.consumesClone && (attacker.clone || cloneConsumed)) mult *= jutsu.consumesClone.mult;
  return mult;
}

/** Entrée en scène des deux shinobis actifs. */
export function startBattle(state: BattleState): BattleEvent[] {
  const ctx = new BattleContext(state);
  for (const side of [0, 1] as const) {
    const unit = activeUnit(state, side);
    ctx.emit({ t: 'swapIn', side, uid: unit.uid, index: state.sides[side].active });
  }
  for (const side of [0, 1] as const) triggerSwitchIn(ctx, activeUnit(state, side));
  return ctx.commit();
}

function triggerSwitchIn(ctx: BattleContext, unit: BattleUnit): void {
  const passive = passiveOf(unit);
  if (passive.onSwitchIn) ctx.passiveText(unit, passive.onSwitchIn(unit, ctx));
}

/** Résout un tour complet à partir des deux actions choisies. Les actions illégales deviennent l'attaque de base. */
export function resolveTurn(state: BattleState, action0: BattleAction, action1: BattleAction): BattleEvent[] {
  if (state.phase !== 'choose') throw Error(`Cannot resolve turn in phase ${state.phase}`);
  const actions: [BattleAction, BattleAction] = [sanitizeAction(state, 0, action0), sanitizeAction(state, 1, action1)];
  state.log.push({ turn: state.turn, actions: [actions[0], actions[1]] });
  const ctx = new BattleContext(state);
  ctx.emit({ t: 'turnStart', turn: state.turn });
  for (const side of turnOrder(ctx, actions)) {
    if (phaseOf(state) === 'ended') break;
    if (activeUnit(state, side).fainted) continue;
    const action = actions[side];
    if (action.kind === 'swap') doSwap(ctx, side, action.to);
    else if (action.kind === 'item') useItem(ctx, side, action.itemId);
    else useJutsu(ctx, side, getJutsu(action.jutsuId));
    checkKo(ctx);
  }
  if (phaseOf(state) !== 'ended') endOfTurn(ctx);
  return ctx.commit();
}

function sanitizeAction(state: BattleState, side: Side, action: BattleAction): BattleAction {
  return isLegalAction(state, side, action)
    ? action
    : { kind: 'jutsu', jutsuId: basicJutsuOf(activeUnit(state, side)).id };
}

/** Ordre déterministe : priorité, puis vitesse effective, puis pile ou face sur le RNG du combat. */
function turnOrder(ctx: BattleContext, actions: [BattleAction, BattleAction]): [Side, Side] {
  const state = ctx.state;
  const p0 = actionPriority(actions[0]);
  const p1 = actionPriority(actions[1]);
  if (p0 !== p1) return p0 > p1 ? [0, 1] : [1, 0];
  const s0 = effectiveSpeed(activeUnit(state, 0));
  const s1 = effectiveSpeed(activeUnit(state, 1));
  if (s0 === s1) return ctx.rng.chance(0.5) ? [0, 1] : [1, 0];
  return s0 > s1 ? [0, 1] : [1, 0];
}

function explodeBomb(ctx: BattleContext, unit: BattleUnit): void {
  const bomb = unit.statuses.find((s) => s.id === 'bomb');
  if (!bomb || unit.fainted) return;
  const amount = Math.max(1, Math.round((unit.maxHp * bomb.stacks) / 100));
  ctx.removeStatus(unit, 'bomb');
  ctx.emit({ t: 'message', text: `L'argile explose sur ${unit.name} !` });
  applyDamage(ctx, unit, amount, false, 'normal', 0, 'explosion');
}

/** Ce qu'un shinobi perd en quittant le terrain. */
function resetOnSwitchOut(unit: BattleUnit): void {
  unit.stages = { attack: 0, defense: 0, speed: 0, crit: 0 };
  unit.shield = 0;
  unit.clone = false;
  unit.protecting = false;
  unit.protectedLastTurn = false;
  unit.flags.copied = 0;
  unit.statuses = unit.statuses.filter((s) => s.id !== 'stun');
}

function doSwap(ctx: BattleContext, side: Side, to: number): void {
  const team = ctx.state.sides[side];
  const leaving = team.units[team.active];
  if (hasStatus(leaving, 'bomb')) {
    ctx.removeStatus(leaving, 'bomb');
    ctx.emit({ t: 'message', text: `${leaving.name} se débarrasse de l'argile explosive !` });
  }
  passiveOf(leaving).onSwitchOut?.(leaving);
  resetOnSwitchOut(leaving);
  ctx.emit({ t: 'swapOut', side, uid: leaving.uid });
  team.active = to;
  const entering = team.units[to];
  ctx.emit({ t: 'swapIn', side, uid: entering.uid, index: to });
  ctx.state.stats.swaps[side]++;
  triggerSwitchIn(ctx, entering);
}

function useItem(ctx: BattleContext, side: Side, itemId: string): void {
  const team = ctx.state.sides[side];
  const item = ITEMS[itemId];
  const unit = activeUnit(ctx.state, side);
  if (!item || (team.items[itemId] ?? 0) <= 0) return;
  team.items[itemId]--;
  ctx.emit({ t: 'useItem', side, uid: unit.uid, itemId });
  if (item.heal) ctx.heal(unit, item.heal);
  if (item.chakra) ctx.chakra(unit, item.chakra);
  if (item.cleanse) ctx.cleanse(unit);
}

/** Vrai si le shinobi perd son action (sommeil, étourdissement, paralysie). */
function checkSkip(ctx: BattleContext, unit: BattleUnit): boolean {
  if (hasStatus(unit, 'sleep')) {
    ctx.emit({ t: 'skip', side: unit.side, uid: unit.uid, reason: 'sleep' });
    return true;
  }
  if (hasStatus(unit, 'stun')) {
    ctx.emit({ t: 'skip', side: unit.side, uid: unit.uid, reason: 'stun' });
    ctx.removeStatus(unit, 'stun');
    return true;
  }
  if (hasStatus(unit, 'paralysis') && ctx.rng.chance(PARALYSIS_SKIP)) {
    ctx.emit({ t: 'skip', side: unit.side, uid: unit.uid, reason: 'paralysis' });
    return true;
  }
  return false;
}

function useJutsu(ctx: BattleContext, side: Side, chosen: JutsuDef): void {
  const state = ctx.state;
  const user = activeUnit(state, side);
  if (checkSkip(ctx, user)) return;
  let jutsu = chosen;
  let cost = jutsuCost(state, user, jutsu);
  // Le silence ou un manque de chakra survenu pendant le tour fait retomber sur l'attaque de base.
  if ((!jutsu.basic && hasStatus(user, 'silence')) || user.chakra < cost) {
    jutsu = basicJutsuOf(user);
    cost = 0;
  }
  if (cost > 0) ctx.chakra(user, -cost);
  ctx.emit({ t: 'useJutsu', side, uid: user.uid, jutsuId: jutsu.id });
  state.stats.jutsusUsed[side]++;
  if (jutsu.cooldown > 0) user.cooldowns[jutsu.id] = jutsu.cooldown + 1;

  const foe = activeUnit(state, opponentOf(side));
  if (!foe.fainted) {
    const foePassive = passiveOf(foe);
    if (foePassive.onFoeJutsu) ctx.passiveText(foe, foePassive.onFoeJutsu(foe, jutsu, ctx));
  }

  if (hasStatus(user, 'confusion') && ctx.rng.chance(CONFUSION_SELF_HIT)) {
    const selfHit = computeDamage({
      power: 30,
      attack: user.attack,
      defense: user.defense,
      attackStage: 0,
      defenseStage: 0,
      elementMult: 1,
      stab: false,
      crit: false,
      extraMult: 1,
      roll: ctx.rng.next(),
    });
    ctx.emit({ t: 'message', text: `${user.name} est confus et se blesse !` });
    applyDamage(ctx, user, selfHit, false, 'normal', 0, 'confusion');
    bleedTick(ctx, user);
    return;
  }

  if (jutsu.basic) ctx.chakra(user, state.config.basicChakraGain);
  let connected = true;
  let dealt = 0;
  if (jutsu.target === 'foe' && !foe.fainted) {
    if (foe.protecting && !jutsu.ignoreProtection) {
      ctx.emit({ t: 'blocked', side: foe.side, uid: foe.uid, by: 'protect', absorbed: 0 });
      if (foe.protectReflect > 0 && jutsu.power > 0) {
        const reflected = computeDamage({
          power: foe.protectReflect,
          attack: foe.attack,
          defense: user.defense,
          attackStage: foe.stages.attack,
          defenseStage: user.stages.defense,
          elementMult: 1,
          stab: false,
          crit: false,
          extraMult: 1,
          roll: ctx.rng.next(),
        });
        applyDamage(ctx, user, reflected, false, 'normal', 0, 'reflect');
      }
      connected = false;
    } else if (!passiveOf(user).neverMiss && ctx.rng.next() * 100 >= jutsu.accuracy) {
      ctx.emit({ t: 'miss', side: foe.side, uid: foe.uid });
      connected = false;
    } else if (jutsu.power > 0) {
      const result = strike(ctx, user, foe, jutsu);
      dealt = result.dealt;
      connected = result.connected;
    }
  }
  applyEffects(ctx, user, foe, jutsu, connected, dealt);
  passiveOf(user).afterAttack?.(user);
  bleedTick(ctx, user);
}

/** Le saignement fait perdre des PV à chaque jutsu utilisé. */
function bleedTick(ctx: BattleContext, unit: BattleUnit): void {
  if (!unit.fainted && hasStatus(unit, 'bleed')) {
    applyDamage(ctx, unit, Math.max(1, Math.round(unit.maxHp * 0.07)), false, 'normal', 0, 'status');
  }
}

/** Coups d'un jutsu offensif : critique, élément, clone, bouclier. */
function strike(
  ctx: BattleContext,
  attacker: BattleUnit,
  target: BattleUnit,
  jutsu: JutsuDef,
): { dealt: number; connected: boolean } {
  const state = ctx.state;
  const team = state.sides[attacker.side];
  const passive = passiveOf(attacker);
  const hits = jutsu.hits ?? 1;
  const cloneConsumed = !!jutsu.consumesClone && attacker.clone;
  if (cloneConsumed) {
    attacker.clone = false;
    ctx.emit({ t: 'clone', side: attacker.side, uid: attacker.uid, on: false });
  }
  let dealt = 0;
  let connected = false;
  for (let hit = 0; hit < hits && !target.fainted; hit++) {
    const critChance =
      attacker.critRate +
      (jutsu.critBonus ?? 0) +
      (passive.critBonus?.(attacker) ?? 0) +
      attacker.stages.crit * DAMAGE_CONFIG.critPerStage;
    const crit = ctx.rng.chance(critChance);
    const elementMult = elementMultiplier(jutsu.element, target.elements);
    const mult =
      outgoingMultiplier(attacker, target, jutsu, cloneConsumed) *
      (passiveOf(target).incomingMult?.(target, attacker) ?? 1) *
      (1 + (team.bonus.elementDamage?.[jutsu.element] ?? 0));
    let damage = computeDamage({
      power: jutsu.power,
      attack: attacker.attack,
      defense: target.defense,
      attackStage: attacker.stages.attack,
      defenseStage: target.stages.defense,
      elementMult,
      stab: jutsu.element !== 'neutral' && attacker.elements.includes(jutsu.element),
      crit,
      critMult: passive.critMult?.(attacker),
      extraMult: mult,
      levelScale: levelDamageScale(attacker.level),
      roll: ctx.rng.next(),
    });
    if (target.clone && !passive.ignoresClone) {
      target.clone = false;
      ctx.emit({ t: 'blocked', side: target.side, uid: target.uid, by: 'clone', absorbed: damage });
      ctx.emit({ t: 'clone', side: target.side, uid: target.uid, on: false });
      continue;
    }
    if (target.shield > 0) {
      const absorbed = Math.min(target.shield, damage);
      target.shield -= absorbed;
      damage -= absorbed;
      ctx.emit({ t: 'blocked', side: target.side, uid: target.uid, by: 'shield', absorbed });
      ctx.emit({ t: 'shield', side: target.side, uid: target.uid, amount: target.shield });
      if (damage <= 0) {
        connected = true;
        continue;
      }
    }
    if (crit) state.stats.crits[attacker.side]++;
    connected = true;
    dealt += applyDamage(ctx, target, damage, crit, effectivenessOf(elementMult), hit, 'jutsu');
    state.stats.damageDealt[attacker.side] += damage;
    if (passive.afterHit && !target.fainted) {
      ctx.passiveText(attacker, passive.afterHit(attacker, target, { crit }, ctx));
    }
    if (passive.chakraStealOnHit && !target.fainted && target.chakra > 0) {
      ctx.chakra(target, -passive.chakraStealOnHit);
      ctx.chakra(attacker, passive.chakraStealOnHit);
    }
  }
  if (jutsu.consumesClone && attacker.clone === false && cloneConsumed) {
    ctx.emit({ t: 'message', text: `Le clone de ${attacker.name} renforce l'attaque !` });
  }
  return { dealt, connected };
}

function applyEffects(
  ctx: BattleContext,
  user: BattleUnit,
  foe: BattleUnit,
  jutsu: JutsuDef,
  connected: boolean,
  dealt: number,
): void {
  const bonus = ctx.state.sides[user.side].bonus;
  const foeReachable = connected && !foe.fainted;
  for (const effect of jutsu.effects) {
    switch (effect.kind) {
      case 'status': {
        const target = effect.target === 'self' ? user : foe;
        if (target === foe && !foeReachable) break;
        const chance = effect.chance + (bonus.statusChanceBonus?.[effect.status] ?? 0);
        if (ctx.rng.chance(chance)) inflictStatus(ctx, user, target, effect.status, effect.turns);
        break;
      }
      case 'buff': {
        const target = effect.target === 'self' ? user : foe;
        if (target === foe && !foeReachable) break;
        if (effect.chance === undefined || ctx.rng.chance(effect.chance)) ctx.buff(target, effect.stat, effect.stages);
        break;
      }
      case 'heal': {
        const target = effect.target === 'self' ? user : lowestAlly(ctx, user.side);
        const mult = (passiveOf(user).healMult?.(user) ?? 1) * (1 + (bonus.healingPct ?? 0));
        ctx.healAmount(target, Math.round(target.maxHp * effect.pct * mult));
        const passive = passiveOf(user);
        if (passive.onHealOther) ctx.passiveText(user, passive.onHealOther(user, ctx));
        break;
      }
      case 'shield':
        user.shield += Math.round(user.maxHp * effect.pct * (1 + (bonus.shieldPct ?? 0)));
        ctx.emit({ t: 'shield', side: user.side, uid: user.uid, amount: user.shield });
        break;
      case 'clone':
        user.clone = true;
        ctx.emit({ t: 'clone', side: user.side, uid: user.uid, on: true });
        break;
      case 'protect': {
        // Deux protections d'affilée échouent toujours.
        const failed = user.protectedLastTurn;
        if (!failed) {
          user.protecting = true;
          user.protectReflect = effect.reflectPower ?? 0;
        }
        ctx.emit({ t: 'protect', side: user.side, uid: user.uid, failed });
        break;
      }
      case 'chakra':
        if (effect.target === 'self') ctx.chakra(user, effect.amount);
        else if (effect.target === 'foe') {
          if (foeReachable) ctx.chakra(foe, effect.amount);
        } else {
          ctx.state.sides[user.side].units.filter((u) => !u.fainted).forEach((u) => ctx.chakra(u, effect.amount));
        }
        break;
      case 'cleanse':
        if (effect.target === 'self') ctx.cleanse(user);
        else ctx.state.sides[user.side].units.forEach((u) => ctx.cleanse(u));
        break;
      case 'dispel': {
        if (!foeReachable) break;
        let removed = false;
        for (const stat of ['attack', 'defense', 'speed', 'crit'] as const) {
          if (foe.stages[stat] > 0) {
            ctx.buff(foe, stat, -foe.stages[stat]);
            removed = true;
          }
        }
        if (foe.shield > 0) {
          foe.shield = 0;
          ctx.emit({ t: 'shield', side: foe.side, uid: foe.uid, amount: 0 });
          removed = true;
        }
        if (foe.clone) {
          foe.clone = false;
          ctx.emit({ t: 'clone', side: foe.side, uid: foe.uid, on: false });
          removed = true;
        }
        if (removed) ctx.emit({ t: 'dispel', side: foe.side, uid: foe.uid });
        break;
      }
      case 'selfDamage': {
        const amount = Math.min(user.hp - 1, Math.round(user.maxHp * effect.pct));
        if (amount > 0) applyDamage(ctx, user, amount, false, 'normal', 0, 'recoil');
        break;
      }
      case 'drain':
        if (dealt > 0) ctx.healAmount(user, Math.round(dealt * effect.pct));
        break;
      case 'detonate':
        if (foeReachable && hasStatus(foe, 'bomb')) explodeBomb(ctx, foe);
        break;
    }
  }
}

/** Fin de tour : dégâts sur la durée, passifs, durées, recharges, chakra, limite de tours. */
function endOfTurn(ctx: BattleContext): void {
  const state = ctx.state;
  for (const side of [0, 1] as const) {
    const unit = activeUnit(state, side);
    if (unit.fainted) continue;
    for (const status of [...unit.statuses]) {
      if (status.id === 'burn') {
        applyDamage(ctx, unit, Math.max(1, Math.round(unit.maxHp * 0.06)), false, 'normal', 0, 'status');
      }
      if (status.id === 'poison') {
        applyDamage(
          ctx,
          unit,
          Math.max(1, Math.round(unit.maxHp * (0.04 + 0.02 * status.stacks))),
          false,
          'normal',
          0,
          'status',
        );
        status.stacks++;
      }
      if (status.id === 'bomb' && status.turns <= 1) explodeBomb(ctx, unit);
      if (unit.fainted) break;
    }
    if (!unit.fainted) {
      const passive = passiveOf(unit);
      if (passive.onTurnEnd) ctx.passiveText(unit, passive.onTurnEnd(unit, ctx));
    }
  }
  checkKo(ctx);
  if (state.phase === 'ended') return;

  for (const side of [0, 1] as const) {
    const team = state.sides[side];
    team.units.forEach((unit, index) => {
      if (unit.fainted) return;
      const isActive = index === team.active;
      if (unit.ccImmune > 0) unit.ccImmune--;
      for (const status of [...unit.statuses]) {
        if (status.id === 'stun') continue;
        status.turns--;
        if (status.turns <= 0) ctx.removeStatus(unit, status.id);
      }
      for (const id of Object.keys(unit.cooldowns)) {
        if (unit.cooldowns[id] > 0) unit.cooldowns[id]--;
      }
      if (!hasStatus(unit, 'chakraSeal')) {
        const regen = isActive
          ? state.config.regenActive + (team.bonus.chakraRegen ?? 0) + (getShinobi(unit.defId).chakraRegenBonus ?? 0)
          : state.config.regenBench;
        ctx.chakra(unit, regen);
      }
      unit.protectedLastTurn = unit.protecting;
      unit.protecting = false;
    });
  }

  ctx.emit({ t: 'turnEnd', turn: state.turn });
  state.turn++;
  if (state.turn > state.config.maxTurns) {
    endBattle(ctx, tiebreakWinner(state), 'turnLimit');
    return;
  }
  for (const side of [0, 1] as const) state.pendingReplace[side] = activeUnit(state, side).fainted;
  state.phase = state.pendingReplace[0] || state.pendingReplace[1] ? 'replace' : 'choose';
}

function checkKo(ctx: BattleContext): void {
  const state = ctx.state;
  if (state.phase === 'ended') return;
  const alive0 = aliveCount(state.sides[0]);
  const alive1 = aliveCount(state.sides[1]);
  if (alive0 === 0 && alive1 === 0) endBattle(ctx, 'draw', 'ko');
  else if (alive0 === 0) endBattle(ctx, 1, 'ko');
  else if (alive1 === 0) endBattle(ctx, 0, 'ko');
}

/** Somme des fractions de PV des shinobis encore debout. */
export function teamHpScore(side: BattleSide): number {
  return side.units.reduce((sum, u) => sum + (u.fainted ? 0 : u.hp / u.maxHp), 0);
}

/** Départage à la limite de tours : shinobis debout, puis PV restants en pourcentage. */
export function tiebreakWinner(state: BattleState): Winner {
  const [a, b] = state.sides;
  const aliveA = aliveCount(a);
  const aliveB = aliveCount(b);
  if (aliveA !== aliveB) return aliveA > aliveB ? 0 : 1;
  const hpA = teamHpScore(a);
  const hpB = teamHpScore(b);
  return Math.abs(hpA - hpB) > 1e-9 ? (hpA > hpB ? 0 : 1) : 'draw';
}

function endBattle(ctx: BattleContext, winner: Winner, reason: EndReason): void {
  ctx.state.phase = 'ended';
  ctx.state.winner = winner;
  ctx.state.endReason = reason;
  ctx.emit({ t: 'end', winner, reason });
}

/** Remplacement gratuit d'un shinobi K.O. (ne consomme pas de tour). */
export function replaceFainted(state: BattleState, side: Side, index: number): BattleEvent[] {
  if (state.phase !== 'replace' || !state.pendingReplace[side]) throw Error('No replacement pending');
  const team = state.sides[side];
  const unit = team.units[index];
  if (!unit || unit.fainted) throw Error('Invalid replacement');
  const ctx = new BattleContext(state);
  team.active = index;
  ctx.emit({ t: 'swapIn', side, uid: unit.uid, index });
  triggerSwitchIn(ctx, unit);
  state.pendingReplace[side] = false;
  const last = state.log[state.log.length - 1];
  if (last) {
    last.replace ??= [null, null];
    last.replace[side] = index;
  }
  if (!state.pendingReplace[0] && !state.pendingReplace[1]) state.phase = 'choose';
  return ctx.commit();
}

export function forfeit(state: BattleState, side: Side): BattleEvent[] {
  const ctx = new BattleContext(state);
  endBattle(ctx, opponentOf(side), 'forfeit');
  return ctx.commit();
}

/** Outil développeur : met K.O. toute l'équipe adverse. */
export function devInstantWin(state: BattleState, side: Side): BattleEvent[] {
  const ctx = new BattleContext(state);
  for (const unit of state.sides[opponentOf(side)].units) {
    if (!unit.fainted) applyDamage(ctx, unit, unit.hp, false, 'normal', 0, 'jutsu');
  }
  checkKo(ctx);
  return ctx.commit();
}
