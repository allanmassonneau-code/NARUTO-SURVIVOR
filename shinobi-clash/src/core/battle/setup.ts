import { DEFAULT_BATTLE_CONFIG } from '../../data/battleConfig';
import { getShinobi } from '../../data/shinobi';
import { activeSynergies, combineBonuses } from '../../data/synergies';
import { statsAt } from '../progression';
import type {
  BattleConfig,
  BattleEvent,
  BattleSide,
  BattleState,
  BattleUnit,
  Side,
  TeamMemberSpec,
  TeamSpec,
  TurnLogEntry,
} from '../types';
import { replaceFainted, resolveTurn, startBattle } from './engine';
import { phaseOf } from './state';

function createUnit(member: TeamMemberSpec, side: Side, index: number, config: BattleConfig): BattleUnit {
  const def = getShinobi(member.defId);
  const level = config.normalizeLevel ?? member.level;
  // En classé, les étoiles d'éveil comptent au plus jusqu'à ★3.
  const stars = config.normalizeLevel ? Math.min(member.stars, 3) : member.stars;
  const stats = statsAt(def, level, stars);
  return {
    uid: `${side}-${index}-${def.id}`,
    defId: def.id,
    name: def.name,
    side,
    level,
    stars,
    maxHp: stats.hp,
    hp: stats.hp,
    attack: stats.attack,
    defense: stats.defense,
    speed: stats.speed,
    critRate: stats.critRate,
    elements: [...def.elements],
    role: def.role,
    passive: def.passive,
    jutsus: [...def.jutsus],
    chakra: config.startChakra,
    statuses: [],
    stages: { attack: 0, defense: 0, speed: 0, crit: 0 },
    shield: 0,
    clone: false,
    protecting: false,
    protectReflect: 0,
    protectedLastTurn: false,
    cooldowns: {},
    ccImmune: 0,
    flags: {},
    fainted: false,
  };
}

function createSide(team: TeamSpec, side: Side, config: BattleConfig): BattleSide {
  if (team.units.length < 1 || team.units.length > 3) throw Error('A team needs 1 to 3 shinobi');
  const synergies = activeSynergies(team.units.map((m) => getShinobi(m.defId)));
  const bonus = combineBonuses(synergies);
  const units = team.units.map((member, index) => {
    const unit = createUnit(member, side, index, config);
    unit.maxHp = Math.round(unit.maxHp * (1 + (bonus.hpPct ?? 0)));
    unit.hp = unit.maxHp;
    unit.attack = Math.round(unit.attack * (1 + (bonus.attackPct ?? 0)));
    unit.defense = Math.round(unit.defense * (1 + (bonus.defensePct ?? 0)));
    unit.speed = Math.round(unit.speed * (1 + (bonus.speedPct ?? 0)));
    unit.critRate += bonus.critRate ?? 0;
    unit.chakra = Math.min(config.chakraMax, config.startChakra + (bonus.startChakra ?? 0));
    return unit;
  });
  return {
    name: team.name,
    units,
    active: 0,
    items: config.itemsAllowed ? { ...(team.items ?? {}) } : {},
    synergies: synergies.map((s) => s.id),
    bonus,
  };
}

export function createBattle(
  team0: TeamSpec,
  team1: TeamSpec,
  seed: number,
  config: BattleConfig = DEFAULT_BATTLE_CONFIG,
): BattleState {
  return {
    turn: 1,
    config,
    sides: [createSide(team0, 0, config), createSide(team1, 1, config)],
    rngState: seed >>> 0,
    seed: seed >>> 0,
    phase: 'choose',
    pendingReplace: [false, false],
    winner: null,
    endReason: null,
    stats: { jutsusUsed: [0, 0], swaps: [0, 0], crits: [0, 0], damageDealt: [0, 0] },
    log: [],
  };
}

export interface ReplayStep {
  events: BattleEvent[];
  state: BattleState;
}

/**
 * Rejoue un combat à partir de sa graine et du journal d'actions.
 * Le combat étant déterministe, le résultat est identique à l'original : c'est ce qui permet au
 * serveur (ou au service local) de recalculer l'issue au lieu de croire le client.
 */
export function* replayBattle(
  team0: TeamSpec,
  team1: TeamSpec,
  seed: number,
  config: BattleConfig,
  log: TurnLogEntry[],
): Generator<ReplayStep> {
  const state = createBattle(team0, team1, seed, config);
  yield { events: startBattle(state), state };
  for (const entry of log) {
    if (state.phase !== 'choose') break;
    yield { events: resolveTurn(state, entry.actions[0], entry.actions[1]), state };
    if (entry.replace) {
      for (const side of [0, 1] as const) {
        const index = entry.replace[side];
        if (index != null && phaseOf(state) === 'replace' && state.pendingReplace[side]) {
          yield { events: replaceFainted(state, side, index), state };
        }
      }
    }
  }
}

export function replayToEnd(
  team0: TeamSpec,
  team1: TeamSpec,
  seed: number,
  config: BattleConfig,
  log: TurnLogEntry[],
): BattleState {
  let last: BattleState | null = null;
  for (const step of replayBattle(team0, team1, seed, config, log)) last = step.state;
  return last ?? createBattle(team0, team1, seed, config);
}
