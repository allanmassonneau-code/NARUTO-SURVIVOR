import { randomUUID } from 'node:crypto';
import { chooseAiAction, chooseAiReplacement } from '../src/core/battle/ai';
import {
  basicJutsuOf,
  benchOptions,
  forfeit,
  isLegalAction,
  replaceFainted,
  resolveTurn,
  startBattle,
} from '../src/core/battle/engine';
import { createBattle } from '../src/core/battle/setup';
import { activeUnit, phaseOf } from '../src/core/battle/state';
import { Rng, randomSeed } from '../src/core/rng';
import type { BattleAction, BattleEvent, BattleState, Side, TeamSpec } from '../src/core/types';
import { configForMode } from '../src/data/battleConfig';
import type { MatchEnd, PvpMode, ServerMessage } from '../src/net/protocol';

export const ACTION_TIMEOUT_MS = 30000;
export const REPLACE_TIMEOUT_MS = 20000;
export const RECONNECT_GRACE_MS = 30000;

/** Un camp : un joueur connecté (ou en reconnexion), ou l'IA du serveur. */
export interface Seat {
  playerId: string | null;
  name: string;
  team: TeamSpec;
  send: ((m: ServerMessage) => void) | null;
}

export interface MatchResult {
  match: Match;
  winner: Side | 'draw';
}

/**
 * Match autoritaire : le serveur seul tient l'état, tire les dés et résout les tours.
 * Les clients n'envoient que des intentions (action, remplacement, abandon), validées ici.
 */
export class Match {
  readonly id = randomUUID();
  readonly state: BattleState;
  readonly seed = randomSeed();
  private readonly pending: [BattleAction | null, BattleAction | null] = [null, null];
  private deadline = 0;
  private timer: NodeJS.Timeout | null = null;
  private readonly graceTimers: [NodeJS.Timeout | null, NodeJS.Timeout | null] = [null, null];
  private readonly botRng: Rng;
  private ended = false;

  constructor(
    readonly mode: PvpMode,
    readonly seats: [Seat, Seat],
    private readonly onEnd: (result: MatchResult) => MatchEnd[],
  ) {
    this.state = createBattle(seats[0].team, seats[1].team, this.seed, configForMode(mode));
    this.botRng = new Rng(this.seed ^ 0x5eed);
  }

  get vsBot(): boolean {
    return this.seats.some((s) => s.playerId === null);
  }

  isBot(side: Side): boolean {
    return this.seats[side].playerId === null;
  }

  seatOf(playerId: string): Side | null {
    if (this.seats[0].playerId === playerId) return 0;
    if (this.seats[1].playerId === playerId) return 1;
    return null;
  }

  start(): void {
    for (const side of [0, 1] as const) this.sendMatchFound(side, false);
    this.broadcast(startBattle(this.state));
    this.prompt();
  }

  private sendMatchFound(side: Side, resumed: boolean): void {
    this.seats[side].send?.({
      t: 'matchFound',
      matchId: this.id,
      mode: this.mode,
      you: side,
      state: this.state,
      opponent: this.seats[side === 0 ? 1 : 0].name,
      vsBot: this.vsBot,
      resumed,
    });
  }

  private broadcast(events: BattleEvent[]): void {
    for (const seat of this.seats) seat.send?.({ t: 'events', matchId: this.id, events, state: this.state });
  }

  /** Demande la suite à chaque camp : action, remplacement, ou fin. */
  private prompt(): void {
    if (this.ended) return;
    if (this.state.phase === 'ended') return this.finish();
    this.clearTimer();
    if (this.state.phase === 'replace') {
      for (const side of [0, 1] as const) {
        if (this.state.pendingReplace[side] && this.isBot(side)) {
          this.broadcast(replaceFainted(this.state, side, chooseAiReplacement(this.state, side)));
        }
      }
      if (phaseOf(this.state) !== 'replace') return this.prompt();
      this.deadline = Date.now() + REPLACE_TIMEOUT_MS;
      for (const side of [0, 1] as const) {
        if (this.state.pendingReplace[side]) {
          this.seats[side].send?.({ t: 'awaitReplace', matchId: this.id, deadline: this.deadline });
        }
      }
      this.timer = setTimeout(() => this.autoReplace(), REPLACE_TIMEOUT_MS);
      return;
    }
    this.pending[0] = this.pending[1] = null;
    this.deadline = Date.now() + ACTION_TIMEOUT_MS;
    for (const side of [0, 1] as const) {
      if (this.isBot(side)) this.pending[side] = chooseAiAction(this.state, side, 'hard', this.botRng);
      else
        this.seats[side].send?.({ t: 'awaitAction', matchId: this.id, turn: this.state.turn, deadline: this.deadline });
    }
    // Délai dépassé : le serveur joue l'attaque de base à la place du joueur.
    this.timer = setTimeout(() => this.autoAct(), ACTION_TIMEOUT_MS);
    this.tryResolve();
  }

  submitAction(side: Side, turn: number, action: BattleAction): void {
    if (this.ended || this.state.phase !== 'choose' || turn !== this.state.turn || this.pending[side]) return;
    this.pending[side] = isLegalAction(this.state, side, action) ? action : this.fallbackAction(side);
    this.tryResolve();
  }

  submitReplace(side: Side, index: number): void {
    if (this.ended || this.state.phase !== 'replace' || !this.state.pendingReplace[side]) return;
    const valid = this.state.sides[side].units[index] && !this.state.sides[side].units[index].fainted;
    this.broadcast(replaceFainted(this.state, side, valid ? index : benchOptions(this.state, side)[0]));
    if (phaseOf(this.state) === 'choose') this.prompt();
  }

  private fallbackAction(side: Side): BattleAction {
    return { kind: 'jutsu', jutsuId: basicJutsuOf(activeUnit(this.state, side)).id };
  }

  private tryResolve(): void {
    const [a0, a1] = this.pending;
    if (!a0 || !a1) return;
    this.pending[0] = this.pending[1] = null;
    this.clearTimer();
    this.broadcast(resolveTurn(this.state, a0, a1));
    this.prompt();
  }

  private autoAct(): void {
    for (const side of [0, 1] as const) this.pending[side] ??= this.fallbackAction(side);
    this.tryResolve();
  }

  private autoReplace(): void {
    for (const side of [0, 1] as const) {
      if (this.state.phase === 'replace' && this.state.pendingReplace[side]) {
        this.broadcast(replaceFainted(this.state, side, benchOptions(this.state, side)[0]));
      }
    }
    this.prompt();
  }

  forfeit(side: Side): void {
    if (this.ended || this.state.phase === 'ended') return;
    this.broadcast(forfeit(this.state, side));
    this.finish();
  }

  /** Déconnexion : l'adversaire est prévenu ; sans retour avant la fin du délai, c'est une défaite. */
  disconnect(side: Side): void {
    if (this.ended) return;
    this.seats[side].send = null;
    const other: Side = side === 0 ? 1 : 0;
    this.seats[other].send?.({ t: 'opponentDisconnected', matchId: this.id, graceMs: RECONNECT_GRACE_MS });
    this.graceTimers[side] = setTimeout(() => this.forfeit(side), RECONNECT_GRACE_MS);
  }

  reconnect(side: Side, send: (m: ServerMessage) => void): void {
    if (this.ended) return;
    const grace = this.graceTimers[side];
    if (grace) clearTimeout(grace);
    this.graceTimers[side] = null;
    this.seats[side].send = send;
    this.sendMatchFound(side, true);
    const other: Side = side === 0 ? 1 : 0;
    this.seats[other].send?.({ t: 'opponentReconnected', matchId: this.id });
    if (this.state.phase === 'choose' && !this.pending[side]) {
      send({ t: 'awaitAction', matchId: this.id, turn: this.state.turn, deadline: this.deadline });
    } else if (this.state.phase === 'replace' && this.state.pendingReplace[side]) {
      send({ t: 'awaitReplace', matchId: this.id, deadline: this.deadline });
    }
  }

  private finish(): void {
    if (this.ended) return;
    this.ended = true;
    this.clearTimer();
    for (const t of this.graceTimers) if (t) clearTimeout(t);
    const winner = this.state.winner ?? 'draw';
    const ends = this.onEnd({ match: this, winner });
    ends.forEach((end, side) => this.seats[side].send?.(end));
  }

  private clearTimer(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  dispose(): void {
    this.ended = true;
    this.clearTimer();
    for (const t of this.graceTimers) if (t) clearTimeout(t);
  }
}
