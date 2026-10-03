import type { BattleUnit, JutsuDef } from '../types';
import type { BattleContext } from './context';
import { DISABLING_STATUSES, DOT_STATUSES, hasStatus } from './state';

/**
 * Crochets d'un passif. Les crochets qui renvoient une chaîne affichent une bulle de passif ;
 * `null` signifie « rien à annoncer ».
 */
export interface PassiveHooks {
  onDamaged?(self: BattleUnit, ctx: BattleContext): string | null;
  onSwitchIn?(self: BattleUnit, ctx: BattleContext): string | null;
  onSwitchOut?(self: BattleUnit): void;
  onTurnEnd?(self: BattleUnit, ctx: BattleContext): string | null;
  onFoeJutsu?(self: BattleUnit, jutsu: JutsuDef, ctx: BattleContext): string | null;
  onHealOther?(self: BattleUnit, ctx: BattleContext): string | null;
  onAllyFaint?(self: BattleUnit): void;
  afterHit?(self: BattleUnit, target: BattleUnit, hit: { crit: boolean }, ctx: BattleContext): string | null;
  afterAttack?(self: BattleUnit): void;
  critBonus?(self: BattleUnit): number;
  critMult?(self: BattleUnit): number;
  healMult?(self: BattleUnit): number;
  speedMult?(self: BattleUnit): number;
  outgoingMult?(self: BattleUnit, target: BattleUnit, jutsu: JutsuDef): number;
  incomingMult?(self: BattleUnit, attacker: BattleUnit): number;
  costDelta?(self: BattleUnit, foe: BattleUnit, jutsu: JutsuDef): number;
  neverMiss?: boolean;
  ignoresClone?: boolean;
  statusTurnsBonus?: number;
  chakraStealOnHit?: number;
  bombMult?: number;
}

export const PASSIVES: Record<string, PassiveHooks> = {
  never_give_up: {
    onDamaged(self, ctx) {
      if (self.flags.ngu || self.hp <= 0 || self.hp / self.maxHp >= 0.3) return null;
      self.flags.ngu = 1;
      ctx.heal(self, 0.2);
      ctx.buff(self, 'attack', 1);
      return 'Je ne renonce jamais !';
    },
  },
  sharingan: { critBonus: () => 0.1, critMult: () => 1.7 },
  perfect_control: {
    healMult: () => 1.4,
    onHealOther(self, ctx) {
      ctx.chakra(self, 1);
      return null;
    },
  },
  copy_ninja: {
    onFoeJutsu(self, jutsu, ctx) {
      if (jutsu.chakraCost < 4) return null;
      self.flags.copied = 1;
      ctx.chakra(self, 1);
      return `${jutsu.name} copié !`;
    },
    outgoingMult: (self, _target, jutsu) => (self.flags.copied && jutsu.power > 0 ? 1.25 : 1),
    afterAttack(self) {
      self.flags.copied = 0;
    },
  },
  sand_armor: { incomingMult: (self) => (self.hp / self.maxHp > 0.5 ? 0.8 : 1) },
  springtime_youth: { outgoingMult: (self) => (self.hp / self.maxHp < 0.5 ? 1.25 : 1) },
  byakugan: { neverMiss: true, ignoresClone: true },
  strategist: { costDelta: (_self, foe) => (DISABLING_STATUSES.some((s) => hasStatus(foe, s)) ? -1 : 0) },
  gentle_heart: {
    onSwitchIn(self, ctx) {
      const hurt = self.statuses.length > 0 || self.hp < self.maxHp;
      ctx.cleanse(self);
      ctx.heal(self, 0.1);
      return hurt ? 'Je ne reculerai pas !' : null;
    },
  },
  genjutsu_master: { statusTurnsBonus: 1 },
  samehada: { chakraStealOnHit: 1 },
  tailwind: {
    speedMult: () => 1.15,
    onSwitchIn(self, ctx) {
      ctx.chakra(self, 1);
      return null;
    },
  },
  expansion: { incomingMult: (self) => (self.stages.attack > 0 ? 0.85 : 1) },
  pack_instinct: { outgoingMult: (_self, target) => (DOT_STATUSES.some((s) => hasStatus(target, s)) ? 1.2 : 1) },
  flower_heart: {
    onSwitchIn(self, ctx) {
      return ctx.healLowestAlly(self, 0.15) > 0 ? 'Tenez bon, tout le monde !' : null;
    },
  },
  puppeteer: { outgoingMult: (self, _target, jutsu) => (self.clone && jutsu.power > 0 ? 1.2 : 1) },
  devotion: {
    onAllyFaint(self) {
      if (!self.flags.devotion) self.flags.devotion = 1;
    },
    onSwitchIn(self, ctx) {
      if (self.flags.devotion !== 1) return null;
      self.flags.devotion = 2;
      ctx.buff(self, 'speed', 2);
      ctx.buff(self, 'attack', 1);
      return 'Je me battrai pour toi.';
    },
  },
  silent_killer: {
    afterHit(self, target, hit, ctx) {
      if (hit.crit) ctx.inflict(self, target, 'bleed', 2);
      return null;
    },
  },
  art_is_explosion: { bombMult: 1.5 },
  sage_mode: {
    onTurnEnd(self, ctx) {
      if (self.flags.sage) return null;
      self.flags.sageTurns = (self.flags.sageTurns ?? 0) + 1;
      if (self.flags.sageTurns < 2) return null;
      self.flags.sage = 1;
      ctx.buff(self, 'attack', 2);
      return 'Mode Ermite !';
    },
    onSwitchOut(self) {
      self.flags.sageTurns = 0;
      self.flags.sage = 0;
    },
  },
};

export function passiveOf(unit: BattleUnit): PassiveHooks {
  return PASSIVES[unit.passive] ?? {};
}
