import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { WebSocket } from 'ws';
import type { BattleState } from '../src/core/types';
import { decode, encode, type ClientMessage, type ServerMessage } from '../src/net/protocol';
import { createPvpServer, mmrWindow, sanitizeTeam } from '../server/app';
import { eloDelta } from '../server/mmr';

type Server = Awaited<ReturnType<typeof createPvpServer>>;
let server: Server | null = null;
afterEach(async () => {
  await server?.close();
  server = null;
});

/** Client de test : joue toujours l'attaque de base et remplace par le premier shinobi debout. */
function bot(
  port: number,
  name: string,
  team: { defId: string; level: number; stars: number }[],
  mode: 'casual' | 'ranked',
) {
  const ws = new WebSocket(`ws://localhost:${port}`);
  const send = (m: ClientMessage) => ws.send(encode(m));
  let matchId = '';
  let you = 0;
  let state: BattleState | null = null;
  const done = new Promise<Extract<ServerMessage, { t: 'end' }>>((resolve, reject) => {
    ws.on('open', () => send({ t: 'hello', name, team }));
    ws.on('error', reject);
    ws.on('message', (raw) => {
      const m = decode<ServerMessage>(String(raw));
      if (!m) return;
      if (m.t === 'welcome') send({ t: 'queue', mode });
      if (m.t === 'matchFound') {
        matchId = m.matchId;
        you = m.you;
        state = m.state;
      }
      if (m.t === 'events') state = m.state;
      if (m.t === 'awaitAction' && state) {
        const unit = state.sides[you].units[state.sides[you].active];
        send({ t: 'action', matchId, turn: m.turn, action: { kind: 'jutsu', jutsuId: unit.jutsus[0] } });
      }
      if (m.t === 'awaitReplace' && state) {
        const index = state.sides[you].units.findIndex((u) => !u.fainted);
        send({ t: 'replace', matchId, index });
      }
      if (m.t === 'end') {
        ws.close();
        resolve(m);
      }
    });
  });
  return done;
}

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'shinobi-pvp-'));

describe('serveur PvP', () => {
  it('apparie deux joueurs classés, résout le match et met à jour le MMR', async () => {
    server = await createPvpServer({ port: 0, dataDir: tmp(), tickMs: 20 });
    const team = [
      { defId: 'naruto', level: 30, stars: 5 },
      { defId: 'sakura', level: 1, stars: 1 },
    ];
    const [a, b] = await Promise.all([
      bot(server.port, 'Alpha', team, 'ranked'),
      bot(server.port, 'Bravo', [{ defId: 'gaara', level: 5, stars: 1 }], 'ranked'),
    ]);
    expect(a.matchId).toBe(b.matchId);
    expect(a.winner).toBe(b.winner);
    expect(a.mmrDelta + b.mmrDelta).toBe(0);
    expect(a.replay.log.length).toBeGreaterThan(0);
    const leaderboard = await (await fetch(`http://localhost:${server.port}/leaderboard`)).json();
    expect(leaderboard).toHaveLength(2);
  }, 30000);

  it('en amical, une IA du serveur remplace l’adversaire introuvable', async () => {
    server = await createPvpServer({ port: 0, dataDir: tmp(), tickMs: 20, casualBotAfterMs: 50 });
    const end = await bot(server.port, 'Solo', [{ defId: 'rock_lee', level: 10, stars: 1 }], 'casual');
    expect(end.mmrDelta).toBe(0);
    expect(end.rewards.ryo).toBeGreaterThan(0);
  }, 30000);

  it('valide les équipes déclarées et élargit la fenêtre de MMR avec l’attente', () => {
    expect(sanitizeTeam('x', [{ defId: 'naruto', level: 99, stars: 9 }])?.units[0]).toEqual({
      defId: 'naruto',
      level: 30,
      stars: 5,
    });
    expect(sanitizeTeam('x', [{ defId: 'inconnu', level: 1, stars: 1 }])).toBeNull();
    expect(sanitizeTeam('x', [{ defId: 'naruto' }, { defId: 'naruto' }])).toBeNull();
    expect(sanitizeTeam('x', [])).toBeNull();
    expect(mmrWindow(0)).toBe(50);
    expect(mmrWindow(10000)).toBe(300);
    expect(mmrWindow(600000)).toBe(600);
    expect(eloDelta(1000, 1000, 1, 20)).toBe(16);
    expect(eloDelta(1000, 1000, 0, 20)).toBe(-16);
  });
});
