import type { BaseStats, Rarity, ShinobiDef } from './types';

export const MAX_LEVEL = 30;
export const MAX_STARS = 5;

/** Croissance par niveau (PV, ATK, DEF ; VIT très modérée pour ne pas casser l'initiative). */
export const LEVEL_GROWTH = { hp: 0.03, attack: 0.025, defense: 0.025, speed: 0.006 };
/** Bonus par étoile d'éveil : progression horizontale volontairement faible (+16% max). */
export const STAR_BONUS = 0.04;

const clampLevel = (level: number) => Math.max(1, Math.min(MAX_LEVEL, level));
const clampStars = (stars: number) => Math.max(1, Math.min(MAX_STARS, stars));

export function statsAt(def: ShinobiDef, level: number, stars: number): BaseStats {
  const lv = clampLevel(level) - 1;
  const starMult = 1 + STAR_BONUS * (clampStars(stars) - 1);
  const s = def.stats;
  return {
    hp: Math.round(s.hp * (1 + LEVEL_GROWTH.hp * lv) * starMult),
    attack: Math.round(s.attack * (1 + LEVEL_GROWTH.attack * lv) * starMult),
    defense: Math.round(s.defense * (1 + LEVEL_GROWTH.defense * lv) * starMult),
    speed: Math.round(s.speed * (1 + LEVEL_GROWTH.speed * lv)),
    critRate: s.critRate,
  };
}

/**
 * Les PV croissent avec le niveau mais l'ATK seule ne suit pas assez vite pour garder des combats courts :
 * les dégâts sont donc multipliés par la même croissance que les PV.
 */
export function levelDamageScale(level: number): number {
  return 1 + LEVEL_GROWTH.hp * (clampLevel(level) - 1);
}

/** Indice de puissance affiché dans la collection. */
export function powerRating(def: ShinobiDef, level: number, stars: number): number {
  const s = statsAt(def, level, stars);
  return Math.round(s.hp * 0.5 + s.attack * 3 + s.defense * 2.5 + s.speed * 2);
}

export function xpToNext(level: number): number {
  return 30 + level * 15;
}

export function addXp(unit: { level: number; xp: number }, amount: number): { levelsGained: number; newLevel: number } {
  const before = unit.level;
  unit.xp += Math.max(0, Math.floor(amount));
  while (unit.level < MAX_LEVEL && unit.xp >= xpToNext(unit.level)) {
    unit.xp -= xpToNext(unit.level);
    unit.level++;
  }
  if (unit.level >= MAX_LEVEL) unit.xp = 0;
  return { levelsGained: unit.level - before, newLevel: unit.level };
}

/** Fragments nécessaires pour passer de `stars` à `stars + 1`. */
export function starUpCost(rarity: Rarity, stars: number): number {
  return { common: 10, uncommon: 15, rare: 20, epic: 30, legendary: 40 }[rarity] * stars;
}
