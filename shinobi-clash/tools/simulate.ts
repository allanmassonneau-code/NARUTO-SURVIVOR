/**
 * Simulation d'équilibrage : des milliers de combats IA (difficile) contre IA (difficile) entre équipes aléatoires.
 * Usage : npm run simulate -- [nombre de combats] [mode pve|ranked] [graine]
 * Produit un tableau par shinobi (taux de victoire, dégâts, K.O.) et signale les valeurs aberrantes.
 */
import fs from 'node:fs';
import { chooseAiAction, chooseAiReplacement } from '../src/core/battle/ai';
import { replaceFainted, resolveTurn, startBattle } from '../src/core/battle/engine';
import { createBattle } from '../src/core/battle/setup';
import { Rng } from '../src/core/rng';
import type { BattleEvent, TeamSpec } from '../src/core/types';
import { configForMode } from '../src/data/battleConfig';
import { ROSTER } from '../src/data/shinobi';

const battles = Number(process.argv[2] ?? 3000);
const mode = process.argv[3] === 'pve' ? 'pve' : 'ranked';
const seed = Number(process.argv[4] ?? 2026);
const config = configForMode(mode);
const rng = new Rng(seed);

interface Line {
  games: number;
  wins: number;
  damage: number;
  kos: number;
  faints: number;
  firstPicks: number;
}
const stats = new Map<string, Line>(
  ROSTER.map((s) => [s.id, { games: 0, wins: 0, damage: 0, kos: 0, faints: 0, firstPicks: 0 }]),
);
const jutsuUse = new Map<string, number>();
let totalTurns = 0;
let turnLimit = 0;
let draws = 0;
const turnHistogram = new Map<number, number>();

function randomTeam(name: string): TeamSpec {
  const pool = ROSTER.map((s) => s.id);
  const units = [0, 1, 2].map(() => ({ defId: pool.splice(rng.int(0, pool.length - 1), 1)[0], level: 20, stars: 1 }));
  return { name, units };
}

for (let i = 0; i < battles; i++) {
  const teams = [randomTeam('A'), randomTeam('B')] as const;
  const state = createBattle(teams[0], teams[1], rng.int(0, 2 ** 31 - 1), config);
  const ai = [new Rng(rng.int(0, 2 ** 31 - 1)), new Rng(rng.int(0, 2 ** 31 - 1))] as const;
  const events: BattleEvent[] = [...startBattle(state)];
  for (let guard = 0; state.phase !== 'ended' && guard < 100; guard++) {
    if (state.phase === 'replace') {
      for (const side of [0, 1] as const) {
        if (state.pendingReplace[side]) events.push(...replaceFainted(state, side, chooseAiReplacement(state, side)));
      }
      continue;
    }
    events.push(
      ...resolveTurn(state, chooseAiAction(state, 0, 'hard', ai[0]), chooseAiAction(state, 1, 'hard', ai[1])),
    );
  }
  totalTurns += state.turn - 1;
  turnHistogram.set(state.turn - 1, (turnHistogram.get(state.turn - 1) ?? 0) + 1);
  if (state.endReason === 'turnLimit') turnLimit++;
  if (state.winner === 'draw') draws++;

  const uidToDef = new Map(state.sides.flatMap((s) => s.units.map((u) => [u.uid, u.defId] as const)));
  let lastAttacker: string | null = null;
  for (const e of events) {
    if (e.t === 'useJutsu') {
      lastAttacker = uidToDef.get(e.uid) ?? null;
      jutsuUse.set(e.jutsuId, (jutsuUse.get(e.jutsuId) ?? 0) + 1);
    }
    if (e.t === 'damage' && e.source === 'jutsu' && lastAttacker) stats.get(lastAttacker)!.damage += e.amount;
    if (e.t === 'faint') {
      stats.get(uidToDef.get(e.uid)!)!.faints++;
      if (lastAttacker) stats.get(lastAttacker)!.kos++;
    }
  }
  state.sides.forEach((side, index) => {
    side.units.forEach((u, slot) => {
      const line = stats.get(u.defId)!;
      line.games++;
      if (state.winner === index) line.wins++;
      if (slot === 0) line.firstPicks++;
    });
  });
}

const rows = [...stats.entries()]
  .map(([id, s]) => ({
    id,
    name: ROSTER.find((r) => r.id === id)!.name,
    rarity: ROSTER.find((r) => r.id === id)!.rarity,
    winRate: s.games ? (s.wins / s.games) * 100 : 0,
    games: s.games,
    damage: s.games ? s.damage / s.games : 0,
    kos: s.games ? s.kos / s.games : 0,
    faints: s.games ? s.faints / s.games : 0,
  }))
  .sort((a, b) => b.winRate - a.winRate);

const avgDamage = rows.reduce((sum, r) => sum + r.damage, 0) / rows.length;
const flags: string[] = [];
for (const r of rows) {
  if (r.winRate > 58) flags.push(`${r.name} : taux de victoire élevé (${r.winRate.toFixed(1)} %)`);
  if (r.winRate < 42) flags.push(`${r.name} : taux de victoire faible (${r.winRate.toFixed(1)} %)`);
  if (r.damage > avgDamage * 1.5) flags.push(`${r.name} : dégâts excessifs (${r.damage.toFixed(0)} par combat)`);
}
if (turnLimit / battles > 0.15)
  flags.push(`${((turnLimit / battles) * 100).toFixed(1)} % des combats atteignent la limite de tours`);

const pad = (s: string, n: number) => s.padEnd(n);
const lines = [
  `Simulation : ${battles} combats IA difficile contre IA difficile, mode ${mode}, graine ${seed}`,
  `Durée moyenne : ${(totalTurns / battles).toFixed(2)} tours · limite atteinte : ${((turnLimit / battles) * 100).toFixed(1)} % · nuls : ${draws}`,
  '',
  `${pad('Shinobi', 12)}${pad('Rareté', 11)}${pad('Victoires', 11)}${pad('Dégâts/c.', 11)}${pad('K.O./c.', 9)}Tombé/c.`,
  ...rows.map(
    (r) =>
      `${pad(r.name, 12)}${pad(r.rarity, 11)}${pad(`${r.winRate.toFixed(1)} %`, 11)}${pad(r.damage.toFixed(0), 11)}${pad(r.kos.toFixed(2), 9)}${r.faints.toFixed(2)}`,
  ),
  '',
  'Durée des combats (tours : nombre)',
  [...turnHistogram.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([t, n]) => `${t}:${n}`)
    .join('  '),
  '',
  'Jutsus les plus utilisés',
  [...jutsuUse.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id, n]) => `${id} ${n}`)
    .join(' · '),
  '',
  flags.length ? `À surveiller :\n- ${flags.join('\n- ')}` : 'Aucune valeur aberrante.',
];
const report = lines.join('\n');
console.log(report);
fs.writeFileSync('simulation-report.txt', `${report}\n`);
