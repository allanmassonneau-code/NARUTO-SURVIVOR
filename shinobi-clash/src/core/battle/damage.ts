/**
 * Formule de dégâts centrale. Tous les coefficients vivent ici pour l'équilibrage.
 *
 * dégâts = puissance × K × (ATK/DEF)^exposant × paliers × élément × affinité × critique × bonus × niveau × variance
 */
export const DAMAGE_CONFIG = {
  K: 2.9,
  /** < 1 : écrase l'écart ATK/DEF pour que les statistiques ne dominent pas les choix tactiques. */
  ratioExponent: 0.6,
  /** Bonus d'affinité quand le jutsu partage un élément du lanceur. */
  stab: 1.1,
  critMult: 1.5,
  varianceMin: 0.9,
  varianceMax: 1,
  stageStep: 0.25,
  critPerStage: 0.1,
  minDamage: 1,
};

/** Multiplicateur d'un palier de buff/debuff (-3..+3). */
export function stageMultiplier(stage: number): number {
  const s = Math.max(-3, Math.min(3, stage));
  return s >= 0 ? 1 + DAMAGE_CONFIG.stageStep * s : 1 / (1 - DAMAGE_CONFIG.stageStep * s);
}

export interface DamageInput {
  power: number;
  attack: number;
  defense: number;
  attackStage: number;
  defenseStage: number;
  elementMult: number;
  stab: boolean;
  crit: boolean;
  critMult?: number;
  extraMult: number;
  levelScale?: number;
  /** Tirage dans [0, 1) pour la variance. */
  roll: number;
}

export function computeDamage(d: DamageInput): number {
  const c = DAMAGE_CONFIG;
  // Un critique ignore les buffs de défense de la cible (mais pas ses débuffs).
  const defStage = d.crit ? Math.min(0, d.defenseStage) : d.defenseStage;
  const ratio = (d.attack / Math.max(1, d.defense)) ** c.ratioExponent;
  const stages = stageMultiplier(d.attackStage) / stageMultiplier(defStage);
  const variance = c.varianceMin + (c.varianceMax - c.varianceMin) * d.roll;
  const raw =
    d.power *
    c.K *
    ratio *
    stages *
    d.elementMult *
    (d.stab ? c.stab : 1) *
    (d.crit ? (d.critMult ?? c.critMult) : 1) *
    d.extraMult *
    (d.levelScale ?? 1) *
    variance;
  return Math.max(c.minDamage, Math.round(raw));
}
