import fs from 'node:fs';
import path from 'node:path';
import type { LeaderboardEntry } from '../src/net/protocol';

export interface PlayerRecord {
  id: string;
  name: string;
  mmr: number;
  wins: number;
  losses: number;
  draws: number;
  /** Saison classée du dernier match ; un changement déclenche la remise à niveau. */
  seasonId?: string;
}

/**
 * Persistance minimale en fichiers JSON (joueurs) et JSONL (journal des matchs).
 * Même interface qu'un futur dépôt PostgreSQL : on remplace cette classe, pas le reste du serveur.
 */
export class Store {
  private players = new Map<string, PlayerRecord>();
  private readonly playersFile: string;
  private readonly matchesFile: string;
  private saveTimer: NodeJS.Timeout | null = null;

  constructor(dir: string) {
    fs.mkdirSync(dir, { recursive: true });
    this.playersFile = path.join(dir, 'players.json');
    this.matchesFile = path.join(dir, 'matches.jsonl');
    if (fs.existsSync(this.playersFile)) {
      const list = JSON.parse(fs.readFileSync(this.playersFile, 'utf8')) as PlayerRecord[];
      for (const p of list) this.players.set(p.id, p);
    }
  }

  get(id: string): PlayerRecord | undefined {
    return this.players.get(id);
  }

  upsert(player: PlayerRecord): void {
    this.players.set(player.id, player);
    this.scheduleSave();
  }

  leaderboard(limit = 20): LeaderboardEntry[] {
    return [...this.players.values()]
      .filter((p) => p.wins + p.losses + p.draws > 0)
      .sort((a, b) => b.mmr - a.mmr)
      .slice(0, limit)
      .map(({ name, mmr, wins, losses }) => ({ name, mmr, wins, losses }));
  }

  /** Journal complet d'un match (actions et résultat) : permet replays et audits. */
  logMatch(entry: object): void {
    fs.appendFileSync(this.matchesFile, `${JSON.stringify(entry)}\n`);
  }

  private scheduleSave(): void {
    if (this.saveTimer) return;
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      this.flush();
    }, 500);
  }

  flush(): void {
    fs.writeFileSync(this.playersFile, JSON.stringify([...this.players.values()], null, 1));
  }
}
