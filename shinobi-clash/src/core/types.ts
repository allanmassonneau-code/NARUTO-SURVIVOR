// Types partagés par le client, le serveur PvP et les outils.
// Aucune dépendance au DOM : ce module doit rester importable côté Node.

export type ElementId = 'katon' | 'futon' | 'raiton' | 'doton' | 'suiton' | 'neutral';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type Role = 'attacker' | 'tank' | 'speedster' | 'support' | 'controller' | 'healer' | 'assassin' | 'specialist';
export type StatusId =
  'burn' | 'poison' | 'paralysis' | 'bleed' | 'confusion' | 'sleep' | 'silence' | 'stun' | 'bomb' | 'chakraSeal';
export type StageStat = 'attack' | 'defense' | 'speed' | 'crit';
export type Side = 0 | 1;
export type Winner = Side | 'draw';
export type AiLevel = 'easy' | 'normal' | 'hard';
export type BattleMode = 'pve' | 'casual' | 'ranked' | 'training';

// ---------- Jutsus ----------

export type JutsuEffect =
  | { kind: 'status'; status: StatusId; chance: number; turns?: number; target?: 'self' | 'foe' }
  | { kind: 'buff'; stat: StageStat; stages: number; target: 'self' | 'foe'; chance?: number }
  | { kind: 'heal'; pct: number; target: 'self' | 'lowestAlly' }
  | { kind: 'shield'; pct: number }
  | { kind: 'clone' }
  | { kind: 'protect'; reflectPower?: number }
  | { kind: 'chakra'; amount: number; target: 'self' | 'foe' | 'team' }
  | { kind: 'cleanse'; target: 'self' | 'team' }
  | { kind: 'dispel' }
  | { kind: 'selfDamage'; pct: number }
  | { kind: 'drain'; pct: number }
  | { kind: 'detonate' };

export interface JutsuDef {
  id: string;
  name: string;
  description: string;
  element: ElementId;
  power: number;
  accuracy: number;
  chakraCost: number;
  priority: number;
  cooldown: number;
  target: 'foe' | 'self' | 'team';
  effects: JutsuEffect[];
  /** 0 = attaque de base, 1 = technique, 2 = technique majeure (cinématique). */
  tier: 0 | 1 | 2;
  animationId: string;
  soundId: string;
  /** Attaque de base : gratuite, utilisable sous silence, rend du chakra. */
  basic?: boolean;
  hits?: number;
  critBonus?: number;
  consumesClone?: { mult: number };
  bonusVsStatus?: { statuses: StatusId[]; mult: number };
  execute?: { below: number; mult: number };
  ignoreProtection?: boolean;
}

// ---------- Shinobis ----------

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  critRate: number;
}

export interface ShinobiLook {
  skin: string;
  hair: string;
  hairStyle: string;
  outfit: string;
  outfitAlt: string;
  accent: string;
  eyes: string;
  headband: 'forehead' | 'tilted' | 'none' | 'neck';
  outfitStyle?: string;
  features?: string[];
  mask?: boolean;
  gourd?: boolean;
  cloak?: boolean;
  bigWeapon?: boolean;
}

export interface ShinobiDef {
  id: string;
  name: string;
  variant: string;
  village: string;
  clan: string;
  rarity: Rarity;
  role: Role;
  elements: ElementId[];
  stats: BaseStats;
  passive: string;
  jutsus: string[];
  tags: string[];
  lore: string;
  look: ShinobiLook;
  chakraRegenBonus?: number;
}

// ---------- Récompenses ----------

export type CurrencyId = 'ryo' | 'jade' | 'chainPoints';

export interface Reward {
  currencies?: Partial<Record<CurrencyId, number>>;
  packs?: Record<string, number>;
  cosmetics?: string[];
  /** XP de joueur. */
  xp?: number;
}

// ---------- Combat ----------

export interface TeamMemberSpec {
  defId: string;
  level: number;
  stars: number;
}

export interface TeamSpec {
  name: string;
  units: TeamMemberSpec[];
  items?: Record<string, number>;
}

export interface BattleConfig {
  maxTurns: number;
  chakraMax: number;
  startChakra: number;
  regenActive: number;
  regenBench: number;
  basicChakraGain: number;
  itemsAllowed: boolean;
  /** Niveau imposé à toutes les unités (classé) ; null = niveaux réels. */
  normalizeLevel: number | null;
}

export interface StatusInstance {
  id: StatusId;
  turns: number;
  stacks: number;
}

export interface BattleUnit {
  uid: string;
  defId: string;
  name: string;
  side: Side;
  level: number;
  stars: number;
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  critRate: number;
  elements: ElementId[];
  role: Role;
  passive: string;
  jutsus: string[];
  chakra: number;
  statuses: StatusInstance[];
  stages: Record<StageStat, number>;
  shield: number;
  clone: boolean;
  protecting: boolean;
  protectReflect: number;
  protectedLastTurn: boolean;
  cooldowns: Record<string, number>;
  /** Tours d'immunité aux contrôles durs (étourdi, sommeil) après en avoir subi un. */
  ccImmune: number;
  flags: Record<string, number>;
  fainted: boolean;
}

export interface TeamBonus {
  attackPct?: number;
  defensePct?: number;
  speedPct?: number;
  hpPct?: number;
  critRate?: number;
  chakraRegen?: number;
  startChakra?: number;
  healingPct?: number;
  shieldPct?: number;
  statusChanceBonus?: Partial<Record<StatusId, number>>;
  elementDamage?: Partial<Record<ElementId, number>>;
}

export interface BattleSide {
  name: string;
  units: BattleUnit[];
  active: number;
  items: Record<string, number>;
  synergies: string[];
  bonus: TeamBonus;
}

export type BattleAction =
  { kind: 'jutsu'; jutsuId: string } | { kind: 'swap'; to: number } | { kind: 'item'; itemId: string };

export interface TurnLogEntry {
  turn: number;
  actions: [BattleAction, BattleAction];
  replace?: [number | null, number | null];
}

export interface BattleStats {
  jutsusUsed: [number, number];
  swaps: [number, number];
  crits: [number, number];
  damageDealt: [number, number];
}

export type BattlePhase = 'choose' | 'replace' | 'ended';
export type EndReason = 'ko' | 'turnLimit' | 'forfeit';

export interface BattleState {
  turn: number;
  config: BattleConfig;
  sides: [BattleSide, BattleSide];
  rngState: number;
  seed: number;
  phase: BattlePhase;
  pendingReplace: [boolean, boolean];
  winner: Winner | null;
  endReason: EndReason | null;
  stats: BattleStats;
  log: TurnLogEntry[];
}

export type Effectiveness = 'strong' | 'weak' | 'normal';
export type DamageSource = 'jutsu' | 'status' | 'recoil' | 'reflect' | 'confusion' | 'explosion';
export type SkipReason = 'sleep' | 'stun' | 'paralysis';

interface UnitRef {
  side: Side;
  uid: string;
}

export type BattleEvent =
  | { t: 'turnStart'; turn: number }
  | { t: 'turnEnd'; turn: number }
  | ({ t: 'swapIn'; index: number } & UnitRef)
  | ({ t: 'swapOut' } & UnitRef)
  | ({ t: 'useJutsu'; jutsuId: string } & UnitRef)
  | ({ t: 'useItem'; itemId: string } & UnitRef)
  | ({ t: 'skip'; reason: SkipReason } & UnitRef)
  | ({ t: 'miss' } & UnitRef)
  | ({
      t: 'damage';
      amount: number;
      hp: number;
      maxHp: number;
      crit: boolean;
      eff: Effectiveness;
      hit: number;
      source: DamageSource;
    } & UnitRef)
  | ({ t: 'heal'; amount: number; hp: number; maxHp: number } & UnitRef)
  | ({ t: 'chakra'; delta: number; chakra: number } & UnitRef)
  | ({ t: 'buff'; stat: StageStat; delta: number; total: number } & UnitRef)
  | ({ t: 'status'; status: StatusId; on: boolean } & UnitRef)
  | ({ t: 'statusResist'; status: StatusId } & UnitRef)
  | ({ t: 'wake' } & UnitRef)
  | ({ t: 'faint' } & UnitRef)
  | ({ t: 'blocked'; by: 'protect' | 'clone' | 'shield'; absorbed: number } & UnitRef)
  | ({ t: 'shield'; amount: number } & UnitRef)
  | ({ t: 'clone'; on: boolean } & UnitRef)
  | ({ t: 'protect'; failed: boolean } & UnitRef)
  | ({ t: 'dispel' } & UnitRef)
  | ({ t: 'passive'; passiveId: string; text: string } & UnitRef)
  | { t: 'message'; text: string }
  | { t: 'end'; winner: Winner; reason: EndReason };
