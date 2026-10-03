import { addCurrency, type Result } from '../core/economy';
import type { PlayerProfile } from '../core/profile';

/** Récompenses de chaîne (Twitch) échangeables contre des points de chaîne. */
export const CHANNEL_REWARDS: Record<string, { label: string; chainPoints: number }> = {
  sc_points_small: { label: 'Petite bourse de points de chaîne', chainPoints: 250 },
  sc_points_large: { label: 'Grande bourse de points de chaîne', chainPoints: 1000 },
};

/** Plafond quotidien par compte, pour qu'un stream ne déséquilibre pas l'économie. */
export const CHANNEL_DAILY_CAP = 3000;

export interface Redemption {
  id: string;
  twitchUserId: string;
  rewardId: string;
  redeemedAt: number;
}

export interface RedemptionLedger {
  processed: Set<string>;
  daily: Map<string, number>;
}

export function createRedemptionLedger(): RedemptionLedger {
  return { processed: new Set(), daily: new Map() };
}

/** Idempotent : une même rédemption n'est créditée qu'une fois, et dans la limite du plafond. */
export function applyRedemption(
  ledger: RedemptionLedger,
  profile: PlayerProfile,
  redemption: Redemption,
): Result<{ granted: number }> {
  if (ledger.processed.has(redemption.id)) return { ok: false, error: 'Déjà traité' };
  const reward = CHANNEL_REWARDS[redemption.rewardId];
  if (!reward) return { ok: false, error: 'Récompense inconnue' };
  const key = `${profile.id}:${new Date(redemption.redeemedAt).toISOString().slice(0, 10)}`;
  const today = ledger.daily.get(key) ?? 0;
  const granted = Math.max(0, Math.min(reward.chainPoints, CHANNEL_DAILY_CAP - today));
  ledger.processed.add(redemption.id);
  if (granted === 0) return { ok: false, error: 'Plafond quotidien atteint' };
  ledger.daily.set(key, today + granted);
  addCurrency(profile, 'chainPoints', granted);
  return { ok: true, granted };
}

export interface LinkedAccount {
  twitchUserId: string;
  login: string;
}

/** Intégration de chaîne : la version réelle passera par EventSub côté serveur. */
export interface ChannelProvider {
  readonly name: string;
  readonly available: boolean;
  link(): Promise<LinkedAccount>;
  unlink(): Promise<void>;
  current(): LinkedAccount | null;
  onRedemption(listener: (r: Redemption) => void): () => void;
}

/** Simulation locale : le menu développeur déclenche des rédemptions. */
export class MockChannelProvider implements ChannelProvider {
  readonly name = 'mock';
  readonly available = true;
  private linked: LinkedAccount | null = null;
  private listeners = new Set<(r: Redemption) => void>();
  private seq = 0;

  async link(): Promise<LinkedAccount> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    this.linked = { twitchUserId: 'mock-viewer', login: 'spectateur_demo' };
    return this.linked;
  }

  async unlink(): Promise<void> {
    this.linked = null;
  }

  current(): LinkedAccount | null {
    return this.linked;
  }

  onRedemption(listener: (r: Redemption) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  simulate(rewardId: string): void {
    if (!this.linked) return;
    const redemption = {
      id: `mock-${Date.now()}-${this.seq++}`,
      twitchUserId: this.linked.twitchUserId,
      rewardId,
      redeemedAt: Date.now(),
    };
    for (const listener of this.listeners) listener(redemption);
  }
}
