import { chooseAiAction, chooseAiReplacement } from '../../core/battle/ai';
import { devInstantWin, forfeit, replaceFainted, resolveTurn, startBattle } from '../../core/battle/engine';
import { flipEvents, flipState } from '../../core/battle/perspective';
import { createBattle, replayBattle } from '../../core/battle/setup';
import type { ReplayData } from '../../core/profile';
import type { Rng } from '../../core/rng';
import type { AiLevel, BattleAction, BattleEvent, BattleState } from '../../core/types';
import { configForMode } from '../../data/battleConfig';
import type { MatchEnd, MatchFound, ServerMessage } from '../../net/protocol';
import type { pvp as PvpClientInstance } from '../../net/pvpClient';

/** Ce que l'écran de combat doit faire ensuite. */
export type ControllerStep =
  | { kind: 'events'; events: BattleEvent[]; apply?: () => void }
  | { kind: 'info'; text: string }
  | { kind: 'needAction'; deadline?: number }
  | { kind: 'needReplace'; deadline?: number }
  | { kind: 'ended'; end: MatchEnd | null };

/**
 * Source d'un combat vu par l'écran : moteur local contre l'IA, match serveur ou replay.
 * L'écran consomme les étapes avec `next()` et renvoie les choix du joueur (camp 0).
 */
export interface BattleController {
  readonly state: BattleState;
  readonly online: boolean;
  next(): Promise<ControllerStep>;
  act(action: BattleAction): void;
  replace(index: number): void;
  forfeit(): void;
  dispose(): void;
}

/** File asynchrone : `next()` attend la prochaine étape poussée. */
class StepQueue {
  private items: ControllerStep[] = [];
  private waiter: ((step: ControllerStep) => void) | null = null;

  push(step: ControllerStep): void {
    if (this.waiter) {
      const resolve = this.waiter;
      this.waiter = null;
      resolve(step);
    } else {
      this.items.push(step);
    }
  }

  next(): Promise<ControllerStep> {
    const item = this.items.shift();
    return item ? Promise.resolve(item) : new Promise((resolve) => (this.waiter = resolve));
  }
}

/** Combat local contre l'IA. Le moteur tourne dans le client ; le service rejoue tout à la fin pour valider. */
export class LocalBattleController implements BattleController {
  readonly online = false;
  private queue = new StepQueue();

  constructor(
    readonly state: BattleState,
    private readonly ai: AiLevel,
    private readonly rng: Rng,
  ) {
    this.queue.push({ kind: 'events', events: startBattle(state) });
    this.decide();
  }

  private decide(): void {
    const state = this.state;
    if (state.phase === 'ended') return this.queue.push({ kind: 'ended', end: null });
    if (state.phase === 'replace') {
      if (state.pendingReplace[1]) {
        this.queue.push({ kind: 'events', events: replaceFainted(state, 1, chooseAiReplacement(state, 1)) });
        return this.decide();
      }
      if (state.pendingReplace[0]) return this.queue.push({ kind: 'needReplace' });
    }
    this.queue.push({ kind: 'needAction' });
  }

  next(): Promise<ControllerStep> {
    return this.queue.next();
  }

  act(action: BattleAction): void {
    if (this.state.phase !== 'choose') return;
    const aiAction = chooseAiAction(this.state, 1, this.ai, this.rng);
    this.queue.push({ kind: 'events', events: resolveTurn(this.state, action, aiAction) });
    this.decide();
  }

  replace(index: number): void {
    this.queue.push({ kind: 'events', events: replaceFainted(this.state, 0, index) });
    this.decide();
  }

  forfeit(): void {
    if (this.state.phase === 'ended') return;
    this.queue.push({ kind: 'events', events: forfeit(this.state, 0) });
    this.queue.push({ kind: 'ended', end: null });
  }

  /** Outil développeur : injecte des événements (victoire instantanée) puis termine. */
  inject(events: BattleEvent[]): void {
    this.queue.push({ kind: 'events', events });
    this.queue.push({ kind: 'ended', end: null });
  }

  devWin(): void {
    this.inject(devInstantWin(this.state, 0));
  }

  dispose(): void {}
}

/** Match PvP : le serveur résout les tours ; le client ne fait qu'afficher et transmettre les choix. */
export class OnlineBattleController implements BattleController {
  readonly online = true;
  readonly state: BattleState;
  private queue = new StepQueue();
  private readonly flip: boolean;
  private turn = 0;
  private promptedTurn = -1;
  private replacePrompted = false;
  private readonly unsubscribe: () => void;

  constructor(
    private readonly client: typeof PvpClientInstance,
    private readonly found: MatchFound,
  ) {
    this.flip = found.you === 1;
    this.state = this.view(found.state);
    this.unsubscribe = client.on((m) => this.handle(m));
  }

  /** Chaque joueur se voit en camp 0. */
  private view(state: BattleState): BattleState {
    return this.flip ? flipState(state) : structuredClone(state);
  }

  private handle(message: ServerMessage): void {
    if ('matchId' in message && message.matchId !== this.found.matchId) return;
    switch (message.t) {
      case 'events': {
        const events = this.flip ? flipEvents(message.events) : message.events;
        const next = this.view(message.state);
        this.replacePrompted = false;
        this.queue.push({ kind: 'events', events, apply: () => Object.assign(this.state, next) });
        break;
      }
      case 'matchFound': {
        if (message === this.found) return;
        // Reconnexion : le serveur renvoie l'état complet du match.
        const next = this.view(message.state);
        this.queue.push({ kind: 'events', events: [], apply: () => Object.assign(this.state, next) });
        this.queue.push({ kind: 'info', text: 'Reconnecté au combat.' });
        this.promptedTurn = -1;
        break;
      }
      case 'awaitAction':
        if (message.turn === this.promptedTurn) return;
        this.promptedTurn = message.turn;
        this.turn = message.turn;
        this.queue.push({ kind: 'needAction', deadline: message.deadline });
        break;
      case 'awaitReplace':
        if (this.replacePrompted) return;
        this.replacePrompted = true;
        this.queue.push({ kind: 'needReplace', deadline: message.deadline });
        break;
      case 'opponentDisconnected':
        this.queue.push({
          kind: 'info',
          text: `L'adversaire s'est déconnecté… (${Math.round(message.graceMs / 1000)} s pour revenir)`,
        });
        break;
      case 'opponentReconnected':
        this.queue.push({ kind: 'info', text: "L'adversaire est de retour !" });
        break;
      case 'end':
        this.queue.push({ kind: 'ended', end: message });
        break;
    }
  }

  next(): Promise<ControllerStep> {
    return this.queue.next();
  }

  act(action: BattleAction): void {
    this.client.send({ t: 'action', matchId: this.found.matchId, turn: this.turn, action });
    if (!this.found.vsBot) this.queue.push({ kind: 'info', text: "En attente de l'adversaire…" });
  }

  replace(index: number): void {
    this.client.send({ t: 'replace', matchId: this.found.matchId, index });
  }

  forfeit(): void {
    this.client.send({ t: 'forfeit', matchId: this.found.matchId });
  }

  dispose(): void {
    this.unsubscribe();
  }
}

/** Replay : le moteur déterministe rejoue la graine et le journal d'actions à l'identique. */
export class ReplayController implements BattleController {
  readonly online = false;
  readonly state: BattleState;
  private queue = new StepQueue();

  constructor(replay: ReplayData) {
    const flip = replay.you === 1;
    const view = (s: BattleState) => (flip ? flipState(s) : structuredClone(s));
    const [team0, team1] = replay.teams;
    const config = configForMode(replay.mode);
    this.state = view(createBattle(team0, team1, replay.seed, config));
    for (const step of replayBattle(team0, team1, replay.seed, config, replay.log)) {
      const next = view(step.state);
      this.queue.push({
        kind: 'events',
        events: flip ? flipEvents(step.events) : step.events,
        apply: () => Object.assign(this.state, next),
      });
    }
    this.queue.push({ kind: 'ended', end: null });
  }

  next(): Promise<ControllerStep> {
    return this.queue.next();
  }

  act(): void {}
  replace(): void {}
  forfeit(): void {}
  dispose(): void {}
}
