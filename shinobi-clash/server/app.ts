import { randomUUID } from 'node:crypto';
import http from 'node:http';
import { WebSocketServer, type WebSocket } from 'ws';
import { averageLevel, randomTeam, TRAINING_OPPONENT_NAMES } from '../src/core/opponents';
import { MAX_LEVEL, MAX_STARS } from '../src/core/progression';
import { Rng, randomSeed } from '../src/core/rng';
import type { Side, TeamMemberSpec, TeamSpec } from '../src/core/types';
import { isKnownShinobi } from '../src/data/shinobi';
import {
  decode,
  encode,
  type ClientMessage,
  type MatchEnd,
  type PvpMode,
  type ServerMessage,
} from '../src/net/protocol';
import { Match, type MatchResult, type Seat } from './match';
import { eloDelta } from './mmr';
import { Store, type PlayerRecord } from './store';

/** Fenêtre de MMR acceptée : elle s'élargit avec l'attente. */
export function mmrWindow(waitedMs: number): number {
  return Math.min(600, 50 + 25 * Math.floor(waitedMs / 1000));
}

/** En amical, une IA du serveur remplace l'adversaire introuvable après ce délai. */
export const CASUAL_BOT_AFTER_MS = 12000;

export const PVP_REWARDS = { win: 120, loss: 40, draw: 60 };

interface Session {
  ws: WebSocket;
  player: PlayerRecord | null;
  team: TeamSpec | null;
}

interface QueueEntry {
  playerId: string;
  mode: PvpMode;
  joinedAt: number;
}

export interface PvpServerOptions {
  port: number;
  dataDir: string;
  /** Raccourcis pour les tests. */
  casualBotAfterMs?: number;
  tickMs?: number;
}

/**
 * Valide et normalise une équipe déclarée par le client : 1 à 3 shinobis connus et distincts, niveau et
 * étoiles bornés. Sans comptes serveur, la collection n'est pas encore vérifiée ; avec une base de données,
 * l'équipe sera lue dans l'inventaire du joueur au lieu d'être envoyée par le client.
 */
export function sanitizeTeam(name: string, units: unknown): TeamSpec | null {
  if (!Array.isArray(units) || units.length < 1 || units.length > 3) return null;
  const seen = new Set<string>();
  const clean: TeamMemberSpec[] = [];
  for (const u of units as Partial<TeamMemberSpec>[]) {
    if (!u || typeof u.defId !== 'string' || !isKnownShinobi(u.defId) || seen.has(u.defId)) return null;
    seen.add(u.defId);
    const level = Math.max(1, Math.min(MAX_LEVEL, Math.floor(Number(u.level) || 1)));
    const stars = Math.max(1, Math.min(MAX_STARS, Math.floor(Number(u.stars) || 1)));
    clean.push({ defId: u.defId, level, stars });
  }
  return { name, units: clean };
}

export function createPvpServer(opts: PvpServerOptions) {
  const store = new Store(opts.dataDir);
  const sessions = new Map<string, Session>();
  const matches = new Map<string, Match>();
  const matchOf = new Map<string, Match>();
  const queue: QueueEntry[] = [];
  const botAfter = opts.casualBotAfterMs ?? CASUAL_BOT_AFTER_MS;

  const httpServer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.url === '/leaderboard') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(store.leaderboard()));
    } else if (req.url === '/health') {
      res.end(JSON.stringify({ ok: true, players: sessions.size, matches: matches.size, queued: queue.length }));
    } else {
      res.statusCode = 404;
      res.end();
    }
  });
  const wss = new WebSocketServer({ server: httpServer });

  const sendTo = (playerId: string) => (m: ServerMessage) => {
    const ws = sessions.get(playerId)?.ws;
    if (ws && ws.readyState === ws.OPEN) ws.send(encode(m));
  };

  function leaveQueue(playerId: string): void {
    const index = queue.findIndex((q) => q.playerId === playerId);
    if (index >= 0) queue.splice(index, 1);
  }

  function seatFor(playerId: string): Seat {
    const session = sessions.get(playerId)!;
    return { playerId, name: session.player!.name, team: session.team!, send: sendTo(playerId) };
  }

  function botSeat(against: TeamSpec): Seat {
    const rng = new Rng(randomSeed());
    const name = `${rng.pick(TRAINING_OPPONENT_NAMES)} (IA)`;
    return { playerId: null, name, team: { name, units: randomTeam(rng, averageLevel(against.units)) }, send: null };
  }

  function startMatch(mode: PvpMode, a: Seat, b: Seat): void {
    const match = new Match(mode, [a, b], settle);
    matches.set(match.id, match);
    for (const seat of match.seats) if (seat.playerId) matchOf.set(seat.playerId, match);
    match.start();
  }

  /** Fin de match : MMR (classé entre humains), récompenses, historique — tout est décidé ici. */
  function settle({ match, winner }: MatchResult): MatchEnd[] {
    const ranked = match.mode === 'ranked' && !match.vsBot;
    const players = match.seats.map((s) => (s.playerId ? store.get(s.playerId) : undefined));
    const deltas: [number, number] = [0, 0];
    if (ranked && players[0] && players[1]) {
      const score = (side: Side): 0 | 0.5 | 1 => (winner === 'draw' ? 0.5 : winner === side ? 1 : 0);
      const games = (p: PlayerRecord) => p.wins + p.losses + p.draws;
      deltas[0] = eloDelta(players[0].mmr, players[1].mmr, score(0), games(players[0]));
      deltas[1] = eloDelta(players[1].mmr, players[0].mmr, score(1), games(players[1]));
    }
    const ends = ([0, 1] as const).map((side): MatchEnd => {
      const p = players[side];
      const result = winner === 'draw' ? 'draw' : winner === side ? 'win' : 'loss';
      if (p) {
        if (ranked) {
          p.mmr = Math.max(0, p.mmr + deltas[side]);
          if (result === 'win') p.wins++;
          else if (result === 'loss') p.losses++;
          else p.draws++;
        }
        store.upsert(p);
      }
      return {
        t: 'end',
        matchId: match.id,
        winner,
        reason: match.state.endReason ?? 'ko',
        mmr: p?.mmr ?? 1000,
        mmrDelta: deltas[side],
        rewards: { ryo: PVP_REWARDS[result] },
        replay: { seed: match.seed, teams: [match.seats[0].team, match.seats[1].team], log: match.state.log },
      };
    });
    store.logMatch({
      id: match.id,
      mode: match.mode,
      at: Date.now(),
      players: match.seats.map((s) => s.playerId ?? 'bot'),
      winner,
      reason: match.state.endReason,
      turns: match.state.turn,
      seed: match.seed,
      teams: match.seats.map((s) => s.team),
      log: match.state.log,
    });
    for (const seat of match.seats) if (seat.playerId) matchOf.delete(seat.playerId);
    matches.delete(match.id);
    return ends;
  }

  /** Appariement : même mode, MMR dans la fenêtre des deux joueurs ; IA en amical après attente. */
  function tick(): void {
    const now = Date.now();
    for (let i = 0; i < queue.length; i++) {
      const a = queue[i];
      const pa = store.get(a.playerId);
      if (!pa) continue;
      for (let j = i + 1; j < queue.length; j++) {
        const b = queue[j];
        const pb = store.get(b.playerId);
        if (!pb || a.mode !== b.mode) continue;
        const gap = Math.abs(pa.mmr - pb.mmr);
        if (gap <= mmrWindow(now - a.joinedAt) && gap <= mmrWindow(now - b.joinedAt)) {
          queue.splice(j, 1);
          queue.splice(i, 1);
          startMatch(a.mode, seatFor(a.playerId), seatFor(b.playerId));
          return tick();
        }
      }
      if (a.mode === 'casual' && now - a.joinedAt >= botAfter) {
        queue.splice(i, 1);
        const seat = seatFor(a.playerId);
        startMatch('casual', seat, botSeat(seat.team));
        return tick();
      }
    }
  }
  const ticker = setInterval(tick, opts.tickMs ?? 500);

  function handle(sessionKey: { id: string | null }, ws: WebSocket, m: ClientMessage): void {
    if (m.t === 'ping') return void ws.send(encode({ t: 'pong' }));
    if (m.t === 'hello') {
      const name =
        String(m.name ?? '')
          .trim()
          .slice(0, 16) || 'Genin';
      const team = sanitizeTeam(name, m.team);
      const id = typeof m.playerId === 'string' && m.playerId.length <= 64 ? m.playerId : randomUUID();
      const player = store.get(id) ?? { id, name, mmr: 1000, wins: 0, losses: 0, draws: 0 };
      player.name = name;
      store.upsert(player);
      sessionKey.id = id;
      sessions.set(id, { ws, player, team });
      ws.send(encode({ t: 'welcome', playerId: id, mmr: player.mmr }));
      // Reconnexion à un match en cours.
      const match = matchOf.get(id);
      const side = match?.seatOf(id);
      if (match && side !== null && side !== undefined) match.reconnect(side, sendTo(id));
      return;
    }
    const id = sessionKey.id;
    const session = id ? sessions.get(id) : undefined;
    if (!id || !session) return void ws.send(encode({ t: 'error', message: 'Présente-toi d’abord (hello).' }));
    switch (m.t) {
      case 'queue':
        if (matchOf.has(id)) return;
        if (!session.team) return void ws.send(encode({ t: 'error', message: 'Équipe invalide.' }));
        leaveQueue(id);
        queue.push({ playerId: id, mode: m.mode === 'ranked' ? 'ranked' : 'casual', joinedAt: Date.now() });
        tick();
        break;
      case 'cancelQueue':
        leaveQueue(id);
        break;
      case 'action':
      case 'replace':
      case 'forfeit': {
        const match = matches.get(m.matchId);
        const side = match?.seatOf(id);
        if (!match || side === null || side === undefined) return;
        if (m.t === 'action') match.submitAction(side, m.turn, m.action);
        else if (m.t === 'replace') match.submitReplace(side, m.index);
        else match.forfeit(side);
        break;
      }
    }
  }

  wss.on('connection', (ws) => {
    const sessionKey: { id: string | null } = { id: null };
    ws.on('message', (raw) => {
      const message = decode<ClientMessage>(String(raw));
      if (message) handle(sessionKey, ws, message);
    });
    ws.on('close', () => {
      const id = sessionKey.id;
      if (!id || sessions.get(id)?.ws !== ws) return;
      sessions.delete(id);
      leaveQueue(id);
      const match = matchOf.get(id);
      const side = match?.seatOf(id);
      if (match && side !== null && side !== undefined) match.disconnect(side);
    });
  });

  return new Promise<{ port: number; close: () => Promise<void> }>((resolve) => {
    httpServer.listen(opts.port, () => {
      const address = httpServer.address();
      const port = typeof address === 'object' && address ? address.port : opts.port;
      resolve({
        port,
        close: () =>
          new Promise<void>((done) => {
            clearInterval(ticker);
            for (const match of matches.values()) match.dispose();
            store.flush();
            for (const client of wss.clients) client.terminate();
            wss.close();
            httpServer.close(() => done());
          }),
      });
    });
  });
}
