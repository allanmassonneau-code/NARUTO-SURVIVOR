import type {
  BattleAction,
  BattleEvent,
  BattleState,
  EndReason,
  Side,
  TeamMemberSpec,
  TeamSpec,
  TurnLogEntry,
  Winner,
} from '../core/types';

/** Protocole WebSocket du PvP. Le serveur est autoritaire : le client n'envoie que des intentions. */
export type PvpMode = 'casual' | 'ranked';

export type ClientMessage =
  | { t: 'hello'; playerId?: string; name: string; team: TeamMemberSpec[] }
  | { t: 'ping' }
  | { t: 'queue'; mode: PvpMode }
  | { t: 'cancelQueue' }
  | { t: 'action'; matchId: string; turn: number; action: BattleAction }
  | { t: 'replace'; matchId: string; index: number }
  | { t: 'forfeit'; matchId: string };

export interface MatchFound {
  t: 'matchFound';
  matchId: string;
  mode: PvpMode;
  /** Camp du joueur dans l'état serveur. */
  you: Side;
  state: BattleState;
  opponent: string;
  vsBot?: boolean;
  /** Reconnexion à un match déjà en cours. */
  resumed?: boolean;
}

export interface MatchEnd {
  t: 'end';
  matchId: string;
  winner: Winner;
  reason: EndReason;
  mmr: number;
  mmrDelta: number;
  rewards: { ryo: number };
  replay: { seed: number; teams: [TeamSpec, TeamSpec]; log: TurnLogEntry[] };
}

export type ServerMessage =
  | { t: 'welcome'; playerId: string; mmr: number }
  | { t: 'pong' }
  | MatchFound
  | { t: 'events'; matchId: string; events: BattleEvent[]; state: BattleState }
  | { t: 'awaitAction'; matchId: string; turn: number; deadline: number }
  | { t: 'awaitReplace'; matchId: string; deadline: number }
  | { t: 'opponentDisconnected'; matchId: string; graceMs: number }
  | { t: 'opponentReconnected'; matchId: string }
  | MatchEnd
  | { t: 'error'; message: string };

export interface LeaderboardEntry {
  name: string;
  mmr: number;
  wins: number;
  losses: number;
}

export const PVP_PORT = 8787;

export function encode(message: ClientMessage | ServerMessage): string {
  return JSON.stringify(message);
}

/** Décode un message ; renvoie null si ce n'est pas un objet `{ t: string }`. */
export function decode<T extends { t: string }>(raw: string): T | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === 'object' && typeof (parsed as { t?: unknown }).t === 'string'
      ? (parsed as T)
      : null;
  } catch {
    return null;
  }
}
