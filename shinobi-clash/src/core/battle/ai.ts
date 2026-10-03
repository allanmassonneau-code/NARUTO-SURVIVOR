import { elementMultiplier } from '../../data/elements';
import { getJutsu } from '../../data/jutsus';
import type { Rng } from '../rng';
import type { AiLevel, BattleAction, BattleState, BattleUnit, JutsuDef, Side } from '../types';
import { benchOptions, effectiveSpeed, estimateDamage, jutsuOptions, legalActions } from './engine';
import { activeUnit, hasStatus, opponentOf } from './state';

/**
 * IA de combat. Elle ne lit que l'information publique (équipes, PV, chakra, statuts) :
 * jamais l'action choisie par l'adversaire ni le RNG du combat.
 */
export function chooseAiAction(state: BattleState, side: Side, level: AiLevel, rng: Rng): BattleAction {
  const legal = legalActions(state, side);
  return level === 'easy' ? chooseEasy(legal, rng) : chooseScored(state, side, level, rng);
}

/** Facile : presque au hasard, avec une préférence pour les attaques. */
function chooseEasy(legal: BattleAction[], rng: Rng): BattleAction {
  const jutsus = legal.filter((a) => a.kind === 'jutsu');
  const attacks = jutsus.filter((a) => a.kind === 'jutsu' && getJutsu(a.jutsuId).power > 0);
  const pool = attacks.length > 0 && rng.chance(0.75) ? attacks : jutsus;
  return rng.pick(pool.length ? pool : legal);
}

interface Candidate {
  action: BattleAction;
  score: number;
}

/** Normal : efficacité, soins, danger, chakra. Difficile : en plus substitutions, prédiction, préparation. */
function chooseScored(state: BattleState, side: Side, level: AiLevel, rng: Rng): BattleAction {
  const self = activeUnit(state, side);
  const foe = activeUnit(state, opponentOf(side));
  const hard = level === 'hard';
  const candidates: Candidate[] = [];
  const threat = threatFrom(state, foe, self);
  const outspeeds = effectiveSpeed(self) >= effectiveSpeed(foe);

  for (const option of jutsuOptions(state, side)) {
    if (!option.usable) continue;
    candidates.push({
      action: { kind: 'jutsu', jutsuId: option.jutsu.id },
      score: scoreJutsu(state, self, foe, option.jutsu, option.cost, hard, threat, outspeeds),
    });
  }
  if (hard) {
    for (const to of benchOptions(state, side)) {
      const candidate = state.sides[side].units[to];
      candidates.push({ action: { kind: 'swap', to }, score: scoreSwap(state, self, candidate, foe, threat) });
    }
  }
  const items = state.sides[side].items;
  if ((items.onigiri ?? 0) > 0 && self.hp / self.maxHp < 0.35 && threat < self.hp + self.maxHp * 0.3) {
    candidates.push({ action: { kind: 'item', itemId: 'onigiri' }, score: 55 });
  }
  if ((items.soldier_pill ?? 0) > 0 && (self.chakra <= 1 || self.statuses.length >= 2)) {
    candidates.push({ action: { kind: 'item', itemId: 'soldier_pill' }, score: 30 });
  }

  const noise = level === 'normal' ? 12 : 4;
  let best = candidates[0];
  let bestScore = -Infinity;
  for (const c of candidates) {
    const s = c.score + rng.range(0, noise);
    if (s > bestScore) {
      best = c;
      bestScore = s;
    }
  }
  return best?.action ?? legalActions(state, side)[0];
}

/** Plus gros coup que `attacker` peut raisonnablement lancer sur `target` au prochain tour. */
function threatFrom(state: BattleState, attacker: BattleUnit, target: BattleUnit): number {
  let max = 0;
  for (const id of attacker.jutsus) {
    const jutsu = getJutsu(id);
    if (jutsu.chakraCost > attacker.chakra + 2) continue;
    max = Math.max(max, estimateDamage(state, attacker, target, jutsu));
  }
  return max;
}

function scoreJutsu(
  state: BattleState,
  self: BattleUnit,
  foe: BattleUnit,
  jutsu: JutsuDef,
  cost: number,
  hard: boolean,
  threat: number,
  outspeeds: boolean,
): number {
  let score = 0;
  const damage = estimateDamage(state, self, foe, jutsu);
  const foeEffectiveHp = foe.hp + foe.shield;

  if (jutsu.power > 0) {
    score += (Math.min(damage, foeEffectiveHp) / foe.maxHp) * 100;
    if (damage >= foeEffectiveHp && !foe.clone) score += outspeeds || jutsu.priority > 0 ? 60 : 35;
    if (foe.clone && (jutsu.hits ?? 1) === 1 && self.passive !== 'byakugan') score -= 25;
    if (jutsu.hits && jutsu.hits > 1 && foe.clone) score += 15;
    // Difficile : anticipe une protection sur son gros jutsu.
    if (
      hard &&
      jutsu.tier === 2 &&
      !foe.protectedLastTurn &&
      foe.jutsus.some(
        (id) => getJutsu(id).effects.some((e) => e.kind === 'protect') && foe.chakra >= getJutsu(id).chakraCost,
      )
    ) {
      score -= 18;
    }
  }

  for (const effect of jutsu.effects) {
    switch (effect.kind) {
      case 'status': {
        const target = effect.target === 'self' ? self : foe;
        const hardControl = effect.status === 'stun' || effect.status === 'sleep';
        if (target === foe && !hasStatus(foe, effect.status) && !(foe.ccImmune > 0 && hardControl)) {
          const value = hardControl
            ? 30
            : effect.status === 'chakraSeal'
              ? foe.chakra >= 4
                ? 22
                : 10
              : effect.status === 'bomb'
                ? 22
                : 14;
          score += value * effect.chance;
        }
        break;
      }
      case 'buff':
        if (effect.target === 'self') {
          score += self.stages[effect.stat] < 2 && self.hp / self.maxHp > 0.45 ? 14 * effect.stages : 2;
        } else {
          score += 6 * Math.abs(effect.stages);
        }
        break;
      case 'heal': {
        const allies = state.sides[self.side].units.filter((u) => !u.fainted);
        const target =
          effect.target === 'self' ? self : allies.reduce((low, u) => (u.hp / u.maxHp < low.hp / low.maxHp ? u : low));
        const missing = 1 - target.hp / target.maxHp;
        score += missing > 0.3 ? missing * 90 : -10;
        break;
      }
      case 'shield':
        score += threat > self.maxHp * 0.2 ? 28 : 8;
        break;
      case 'clone':
        score += self.clone ? -30 : threat > self.maxHp * 0.15 ? 26 : 12;
        break;
      case 'protect':
        if (self.protectedLastTurn) score -= 80;
        else score += hard && foe.chakra >= 6 && threat > self.hp * 0.5 ? 55 : threat > self.hp ? 40 : -5;
        break;
      case 'chakra':
        if (effect.target === 'foe') score += foe.chakra > 0 ? 5 * Math.min(-effect.amount, foe.chakra) : 0;
        else score += self.chakra < 6 ? 5 * effect.amount : 0;
        break;
      case 'cleanse':
        score += self.statuses.length * 16;
        break;
      case 'dispel': {
        const buffs = Object.values(foe.stages).reduce((sum, s) => sum + Math.max(0, s), 0);
        score += buffs * 12 + (foe.shield > 0 ? 18 : 0) + (foe.clone ? 22 : 0);
        break;
      }
      case 'selfDamage':
        score -= self.hp / self.maxHp < 0.3 ? 30 : 5;
        break;
      case 'drain':
        score += 3;
        break;
      case 'detonate': {
        const bomb = foe.statuses.find((s) => s.id === 'bomb');
        score += bomb ? bomb.stacks * 1.3 + (hard ? 10 : 0) : -6;
        break;
      }
    }
  }

  // Frapper une cible endormie la réveille : à éviter si le coup ne l'achève pas.
  if (
    jutsu.power > 0 &&
    hasStatus(foe, 'sleep') &&
    damage < foeEffectiveHp &&
    !jutsu.bonusVsStatus?.statuses.includes('sleep')
  ) {
    score -= hard ? 25 : 12;
  }
  if (jutsu.consumesClone && self.clone) score += 20;
  if (jutsu.bonusVsStatus && jutsu.bonusVsStatus.statuses.some((s) => hasStatus(foe, s))) score += 15;

  if (hard) {
    // Optimisation du chakra : ne pas gaspiller ce qui permettrait le gros jutsu au tour suivant.
    const finisher = self.jutsus.map(getJutsu).find((j) => j.tier === 2 && j.id !== jutsu.id);
    if (
      finisher &&
      cost > 0 &&
      jutsu.tier < 2 &&
      self.chakra - cost < finisher.chakraCost &&
      self.chakra + 2 >= finisher.chakraCost
    ) {
      score -= 10;
    }
    if (jutsu.basic && self.chakra <= 3) score += 8;
  } else if (jutsu.basic) {
    score -= 4;
  }
  return score;
}

function scoreSwap(
  state: BattleState,
  self: BattleUnit,
  candidate: BattleUnit,
  foe: BattleUnit,
  threat: number,
): number {
  const weaknessNow = Math.max(1, ...foe.elements.map((e) => elementMultiplier(e, self.elements)));
  const weaknessThen = Math.max(1, ...foe.elements.map((e) => elementMultiplier(e, candidate.elements)));
  const bestNow = Math.max(...self.jutsus.map((id) => estimateDamage(state, self, foe, getJutsu(id))));
  const bestThen = Math.max(...candidate.jutsus.map((id) => estimateDamage(state, candidate, foe, getJutsu(id))));
  let score = -20;
  if (weaknessNow > weaknessThen) score += 20;
  if (bestThen > bestNow * 1.3) score += 15;
  if (threat >= self.hp && candidate.hp / candidate.maxHp > 0.6 && self.hp / self.maxHp < 0.4) score += 20;
  if (self.statuses.some((s) => s.id === 'chakraSeal' || s.id === 'silence' || s.id === 'poison')) score += 18;
  const bomb = self.statuses.find((s) => s.id === 'bomb');
  if (bomb) score += bomb.turns <= 1 ? 16 + bomb.stacks : 10;
  if (candidate.hp / candidate.maxHp < 0.35) score -= 30;
  return score;
}

/** Choix du remplaçant après un K.O. : meilleur échange dégâts infligés / subis. */
export function chooseAiReplacement(state: BattleState, side: Side): number {
  const foe = activeUnit(state, opponentOf(side));
  const alive = state.sides[side].units.map((u, i) => ({ u, i })).filter(({ u }) => !u.fainted);
  let best = alive[0];
  let bestScore = -Infinity;
  for (const c of alive) {
    const score =
      Math.max(...c.u.jutsus.map((id) => estimateDamage(state, c.u, foe, getJutsu(id)))) -
      threatFrom(state, foe, c.u) * 0.8 +
      (c.u.hp / c.u.maxHp) * 50;
    if (score > bestScore) {
      best = c;
      bestScore = score;
    }
  }
  return best.i;
}
