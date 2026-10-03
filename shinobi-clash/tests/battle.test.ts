import { describe, expect, it } from 'vitest';
import { chooseAiAction, chooseAiReplacement } from '../src/core/battle/ai';
import {
  effectiveSpeed,
  jutsuOptions,
  legalActions,
  replaceFainted,
  resolveTurn,
  startBattle,
  tiebreakWinner,
} from '../src/core/battle/engine';
import { flipEvents, flipState } from '../src/core/battle/perspective';
import { replayToEnd } from '../src/core/battle/setup';
import { activeUnit } from '../src/core/battle/state';
import { Rng } from '../src/core/rng';
import type { BattleEvent, BattleState } from '../src/core/types';
import { DEFAULT_BATTLE_CONFIG } from '../src/data/battleConfig';
import { basic, battle, team } from './helpers';

const ofType = <T extends BattleEvent['t']>(events: BattleEvent[], t: T) =>
  events.filter((e): e is Extract<BattleEvent, { t: T }> => e.t === t);

/** Joue un combat complet IA contre IA ; renvoie l'état final et tous les événements. */
function autoplay(state: BattleState, seed: number): BattleEvent[] {
  const events = [...startBattle(state)];
  const rng0 = new Rng(seed ^ 0x1111);
  const rng1 = new Rng(seed ^ 0x2222);
  for (let guard = 0; state.phase !== 'ended' && guard < 80; guard++) {
    if (state.phase === 'replace') {
      for (const side of [0, 1] as const) {
        if (state.pendingReplace[side]) events.push(...replaceFainted(state, side, chooseAiReplacement(state, side)));
      }
      continue;
    }
    events.push(
      ...resolveTurn(state, chooseAiAction(state, 0, 'hard', rng0), chooseAiAction(state, 1, 'normal', rng1)),
    );
  }
  return events;
}

describe('ordre des actions', () => {
  it('le plus rapide agit en premier à priorité égale', () => {
    const state = battle(['rock_lee'], ['gaara']);
    startBattle(state);
    const events = resolveTurn(state, basic('konoha_senpu'), basic('suna_shuriken'));
    const users = ofType(events, 'useJutsu').map((e) => e.side);
    expect(users[0]).toBe(0);
  });

  it('la substitution passe avant une attaque, même d’un shinobi plus rapide', () => {
    const state = battle(['gaara', 'sakura'], ['rock_lee']);
    startBattle(state);
    const events = resolveTurn(state, { kind: 'swap', to: 1 }, basic('konoha_senpu'));
    const swapIndex = events.findIndex((e) => e.t === 'swapIn' && e.side === 0);
    const attackIndex = events.findIndex((e) => e.t === 'useJutsu');
    expect(swapIndex).toBeGreaterThanOrEqual(0);
    expect(swapIndex).toBeLessThan(attackIndex);
    // C'est le remplaçant qui encaisse le coup.
    const hit = ofType(events, 'damage').find((e) => e.side === 0);
    expect(hit?.uid).toBe(state.sides[0].units[1].uid);
  });

  it('la paralysie divise la vitesse par deux', () => {
    const state = battle(['rock_lee'], ['gaara']);
    const lee = activeUnit(state, 0);
    const before = effectiveSpeed(lee);
    lee.statuses.push({ id: 'paralysis', turns: 3, stacks: 0 });
    expect(effectiveSpeed(lee)).toBeCloseTo(before / 2, 5);
  });
});

describe('chakra et jutsus', () => {
  it('une action illégale (chakra insuffisant) devient l’attaque de base', () => {
    const state = battle(['naruto'], ['gaara']);
    startBattle(state);
    const events = resolveTurn(state, basic('rasengan'), basic('suna_shuriken'));
    const used = ofType(events, 'useJutsu').find((e) => e.side === 0);
    expect(used?.jutsuId).toBe('uzumaki_combo');
  });

  it('l’attaque de base rend du chakra et la fin de tour régénère (actif +2, réserve +1)', () => {
    const state = battle(['naruto', 'sakura'], ['gaara']);
    startBattle(state);
    const start = state.config.startChakra;
    resolveTurn(state, basic('uzumaki_combo'), basic('suna_shuriken'));
    const naruto = state.sides[0].units[0];
    const sakura = state.sides[0].units[1];
    expect(naruto.chakra).toBe(start + state.config.basicChakraGain + state.config.regenActive);
    expect(sakura.chakra).toBe(start + state.config.regenBench);
  });

  it('le silence ne laisse que l’attaque de base', () => {
    const state = battle(['naruto'], ['gaara']);
    activeUnit(state, 0).statuses.push({ id: 'silence', turns: 2, stacks: 0 });
    activeUnit(state, 0).chakra = 10;
    const usable = jutsuOptions(state, 0).filter((o) => o.usable);
    expect(usable.map((o) => o.jutsu.id)).toEqual(['uzumaki_combo']);
    expect(jutsuOptions(state, 0).find((o) => o.jutsu.id === 'rasengan')?.reason).toBe('silence');
  });
});

describe('statuts', () => {
  it('la brûlure retire 6 % des PV max en fin de tour', () => {
    const state = battle(['naruto'], ['gaara']);
    startBattle(state);
    const gaara = activeUnit(state, 1);
    gaara.statuses.push({ id: 'burn', turns: 3, stacks: 0 });
    const events = resolveTurn(state, { kind: 'item', itemId: 'none' }, basic('suna_tate'));
    const burn = ofType(events, 'damage').find((e) => e.side === 1 && e.source === 'status');
    expect(burn?.amount).toBe(Math.round(gaara.maxHp * 0.06));
  });

  it('un contrôle dur est suivi d’une immunité temporaire', () => {
    const state = battle(['shikamaru'], ['naruto']);
    startBattle(state);
    const naruto = activeUnit(state, 1);
    naruto.ccImmune = 2;
    activeUnit(state, 0).chakra = 10;
    const events = resolveTurn(state, basic('kagemane'), basic('uzumaki_combo'));
    const stunned = ofType(events, 'status').some((e) => e.side === 1 && e.status === 'stun' && e.on);
    expect(stunned).toBe(false);
  });

  it('un étourdissement fait perdre l’action', () => {
    const state = battle(['rock_lee'], ['gaara']);
    startBattle(state);
    activeUnit(state, 1).statuses.push({ id: 'stun', turns: 1, stacks: 0 });
    const events = resolveTurn(state, basic('konoha_senpu'), basic('suna_shuriken'));
    expect(ofType(events, 'skip').some((e) => e.side === 1 && e.reason === 'stun')).toBe(true);
    expect(ofType(events, 'useJutsu').some((e) => e.side === 1)).toBe(false);
  });
});

describe('K.O., remplacement et fin de combat', () => {
  it('un K.O. ouvre la phase de remplacement gratuite', () => {
    const state = battle(['rock_lee'], ['gaara', 'sakura']);
    startBattle(state);
    activeUnit(state, 1).hp = 1;
    const events = resolveTurn(state, basic('konoha_senpu'), basic('suna_shuriken'));
    expect(ofType(events, 'faint').some((e) => e.side === 1)).toBe(true);
    expect(state.phase).toBe('replace');
    expect(state.pendingReplace).toEqual([false, true]);
    replaceFainted(state, 1, 1);
    expect(state.phase).toBe('choose');
    expect(activeUnit(state, 1).defId).toBe('sakura');
  });

  it('la défaite survient quand toute l’équipe est K.O.', () => {
    const state = battle(['rock_lee'], ['gaara']);
    startBattle(state);
    activeUnit(state, 1).hp = 1;
    const events = resolveTurn(state, basic('konoha_senpu'), basic('suna_shuriken'));
    expect(state.phase).toBe('ended');
    expect(state.winner).toBe(0);
    expect(ofType(events, 'end')[0]).toMatchObject({ winner: 0, reason: 'ko' });
  });

  it('la substitution remet à zéro les buffs de celui qui sort', () => {
    const state = battle(['naruto', 'sakura'], ['gaara']);
    startBattle(state);
    activeUnit(state, 0).stages.attack = 2;
    resolveTurn(state, { kind: 'swap', to: 1 }, basic('suna_shuriken'));
    expect(state.sides[0].units[0].stages.attack).toBe(0);
  });

  it('limite de tours : départage par shinobis debout puis par PV restants', () => {
    const state = battle(['naruto', 'sakura'], ['gaara', 'temari'], 3, { maxTurns: 1 });
    startBattle(state);
    state.sides[1].units[1].fainted = true;
    state.sides[1].units[1].hp = 0;
    const events = resolveTurn(state, basic('uzumaki_combo'), basic('suna_shuriken'));
    expect(state.phase).toBe('ended');
    expect(ofType(events, 'end')[0]).toMatchObject({ winner: 0, reason: 'turnLimit' });

    const tie = battle(['naruto'], ['gaara']);
    tie.sides[0].units[0].hp = tie.sides[0].units[0].maxHp / 2;
    expect(tiebreakWinner(tie)).toBe(1);
  });
});

describe('déterminisme, replays et perspective', () => {
  it('même graine et mêmes choix donnent exactement le même combat', () => {
    const a = battle(['naruto', 'sasuke', 'sakura'], ['gaara', 'temari', 'kisame'], 42);
    const b = battle(['naruto', 'sasuke', 'sakura'], ['gaara', 'temari', 'kisame'], 42);
    expect(autoplay(a, 7)).toEqual(autoplay(b, 7));
    expect(a).toEqual(b);
  });

  it('le replay depuis le journal retrouve l’issue réelle', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const state = battle(['itachi', 'kakashi', 'hinata'], ['jiraiya', 'deidara', 'neji'], seed);
      autoplay(state, seed);
      const replayed = replayToEnd(
        team('A', 'itachi', 'kakashi', 'hinata'),
        team('B', 'jiraiya', 'deidara', 'neji'),
        seed,
        DEFAULT_BATTLE_CONFIG,
        state.log,
      );
      expect(replayed.winner).toBe(state.winner);
      expect(replayed.turn).toBe(state.turn);
    }
  });

  it('chaque joueur PvP se voit en camp 0', () => {
    const state = battle(['naruto'], ['gaara']);
    const flipped = flipState(state);
    expect(flipped.sides[0].units[0].defId).toBe('gaara');
    expect(flipped.sides[0].units[0].side).toBe(0);
    const events = flipEvents(startBattle(state));
    expect(events.find((e) => e.t === 'swapIn' && e.side === 0 && 'uid' in e && e.uid.endsWith('gaara'))).toBeTruthy();
  });

  it('l’IA ne propose que des actions légales', () => {
    const rng = new Rng(9);
    for (let seed = 1; seed <= 20; seed++) {
      const state = battle(['naruto', 'kisame', 'ino'], ['gaara', 'sasuke', 'hinata'], seed);
      startBattle(state);
      for (const level of ['easy', 'normal', 'hard'] as const) {
        const action = chooseAiAction(state, 1, level, rng);
        expect(legalActions(state, 1)).toContainEqual(action);
      }
    }
  });
});
