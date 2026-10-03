import { checkAchievements, claimAchievement } from '../core/achievements';
import { replayToEnd } from '../core/battle/setup';
import { buyPremiumPass, claimAllPass, claimPassTier, passView } from '../core/battlePass';
import { addShinobi, markSeen, setTeamMember, starUp } from '../core/collection';
import { addCurrency, type Result } from '../core/economy';
import { buyPack, openPack, type PackOpening } from '../core/gacha';
import { claimMission, refreshMissions } from '../core/missions';
import { averageLevel, randomTeam, TRAINING_OPPONENT_NAMES } from '../core/opponents';
import { MAX_LEVEL, MAX_STARS } from '../core/progression';
import { newProfile, type PlayerProfile, type ReplayData, type Settings } from '../core/profile';
import { isStageUnlocked, recordBattle, recordPvp, type BattleRewards, type PvpResult } from '../core/records';
import { Rng, randomSeed } from '../core/rng';
import { migrateSave, serializeSave } from '../core/save';
import type { BattleMode, BattleState, CurrencyId, Rarity, TeamSpec, Winner } from '../core/types';
import type { AchievementDef } from '../data/achievements';
import { STAGES } from '../data/arenas';
import { configForMode } from '../data/battleConfig';
import { COSMETICS_BY_ID } from '../data/cosmetics';
import { PVE_ITEM_LOADOUT } from '../data/items';
import { track } from './analytics';
import { applyRedemption, createRedemptionLedger, MockChannelProvider } from './channelPoints';
import { JADE_PRODUCTS, MockPurchaseProvider, type PurchaseProvider } from './purchases';
import { LocalStorageRepository, type SaveRepository } from './saveRepository';

export interface BattleSetup {
  stageId: string | null;
  enemyName: string;
  player: TeamSpec;
  enemy: TeamSpec;
  seed: number;
  mode?: BattleMode;
}

export interface DebugOptions {
  forceRarity: Rarity | null;
  forceLegendary: boolean;
  enemyOverride: string[] | null;
}

/**
 * Service de jeu local. Il joue le rôle du futur serveur : l'interface lui demande des actions
 * (ouvrir un parchemin, terminer un combat…) et ne modifie jamais le profil elle-même.
 * Pour un combat, il rejoue la graine et le journal d'actions et calcule lui-même l'issue.
 */
export class GameService {
  profile: PlayerProfile = newProfile(Date.now());
  readonly debug: DebugOptions = { forceRarity: null, forceLegendary: false, enemyOverride: null };
  /** Positionné par le menu dev « gagner instantanément » : le combat n'est alors pas vérifiable. */
  debugWinUsed = false;
  private listeners = new Set<(p: PlayerProfile) => void>();
  private achievementListeners = new Set<(a: AchievementDef) => void>();
  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private rng = new Rng(randomSeed());
  private redemptions = createRedemptionLedger();

  constructor(
    private readonly repo: SaveRepository = new LocalStorageRepository(),
    private readonly purchases: PurchaseProvider = new MockPurchaseProvider(),
    readonly channel: MockChannelProvider = new MockChannelProvider(),
  ) {
    this.channel.onRedemption((r) => {
      const result = applyRedemption(this.redemptions, this.profile, r);
      track('channel_points_redeemed', { ok: result.ok, rewardId: r.rewardId });
      if (result.ok) this.commit();
    });
  }

  async load(): Promise<void> {
    const raw = await this.repo.load();
    if (raw) {
      try {
        this.profile = migrateSave(JSON.parse(raw), Date.now());
      } catch (e) {
        console.warn('Save unreadable, starting fresh', e);
        this.profile = newProfile(Date.now());
      }
    }
    refreshMissions(this.profile, Date.now());
    checkAchievements(this.profile);
    if (this.profile.settings.seedOverride !== null) this.rng = new Rng(this.profile.settings.seedOverride);
    this.emit();
  }

  subscribe(listener: (p: PlayerProfile) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  onAchievement(listener: (a: AchievementDef) => void): () => void {
    this.achievementListeners.add(listener);
    return () => this.achievementListeners.delete(listener);
  }

  private emit(): void {
    for (const listener of this.listeners) listener(this.profile);
  }

  /** Après chaque mutation : succès, notification de l'interface, sauvegarde différée. */
  private commit(): void {
    const unlocked = checkAchievements(this.profile);
    this.emit();
    for (const a of unlocked) for (const listener of this.achievementListeners) listener(a);
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => void this.flush(), 250);
  }

  async flush(): Promise<void> {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = null;
    await this.repo.save(serializeSave(this.profile));
  }

  private nextSeed(): number {
    return this.rng.int(0, 2 ** 31 - 1);
  }

  // ---------- Onboarding ----------

  chooseStarter(defId: string, username: string): void {
    if (this.profile.tutorial.starterChosen) return;
    addShinobi(this.profile, defId, Date.now());
    this.profile.avatar = defId;
    this.profile.username = username.trim().slice(0, 16) || 'Genin';
    this.profile.tutorial.starterChosen = true;
    track('starter_chosen', { defId });
    track('tutorial_started');
    this.commit();
  }

  completeTutorial(): void {
    if (this.profile.tutorial.done) return;
    this.profile.tutorial.done = true;
    track('tutorial_completed');
    this.commit();
  }

  // ---------- Collection et équipes ----------

  setTeamMember(teamIndex: number, slot: number, defId: string | null): Result {
    const result = setTeamMember(this.profile, teamIndex, slot, defId);
    if (result.ok) {
      track('team_changed', { teamIndex, slot, defId });
      this.commit();
    }
    return result;
  }

  setActiveTeam(index: number): void {
    if (!this.profile.teams[index]) return;
    this.profile.activeTeam = index;
    this.commit();
  }

  renameTeam(index: number, name: string): void {
    const team = this.profile.teams[index];
    if (!team) return;
    team.name = name.trim().slice(0, 14) || team.name;
    this.commit();
  }

  starUp(defId: string): Result<{ stars: number }> {
    const result = starUp(this.profile, defId);
    if (result.ok) {
      track('star_up', { defId, stars: result.stars });
      this.commit();
    }
    return result;
  }

  markSeen(defId: string): void {
    if (!this.profile.collection[defId]?.isNew) return;
    markSeen(this.profile, defId);
    this.commit();
  }

  // ---------- Parchemins ----------

  buyPack(packId: string, currency: CurrencyId): Result {
    const result = buyPack(this.profile, packId, currency);
    if (result.ok) {
      track('pack_purchased', { packId, currency });
      this.commit();
    }
    return result;
  }

  openPack(packId: string): Result<{ opening: PackOpening }> {
    const result = openPack(this.profile, packId, this.rng, Date.now(), {
      forceRarity: this.debug.forceRarity,
      forceLegendary: this.debug.forceLegendary,
    });
    if (result.ok) {
      track('pack_opened', { packId, cards: result.opening.cards.map((c) => c.defId) });
      if (result.opening.cards.some((c) => c.rarity === 'legendary')) track('legendary_pulled', { packId });
      this.commit();
    }
    return result;
  }

  // ---------- Missions, succès, passe ----------

  claimMission(id: string) {
    const result = claimMission(this.profile, id, Date.now());
    if (result.ok) {
      track('daily_mission_completed', { id });
      this.commit();
    }
    return result;
  }

  claimAchievement(id: string) {
    const result = claimAchievement(this.profile, id);
    if (result.ok) this.commit();
    return result;
  }

  passView() {
    return passView(this.profile, Date.now());
  }

  claimPassTier(level: number, track: 'free' | 'premium') {
    const result = claimPassTier(this.profile, level, track, Date.now());
    if (result.ok) this.commit();
    return result;
  }

  claimAllPass() {
    const rewards = claimAllPass(this.profile, Date.now());
    if (rewards.length) this.commit();
    return rewards;
  }

  buyPremiumPass(): Result {
    const result = buyPremiumPass(this.profile, Date.now());
    if (result.ok) {
      track('purchase_completed', { productId: 'battle_pass_premium', currency: 'jade' });
      this.commit();
    }
    return result;
  }

  // ---------- Profil et boutique ----------

  setAvatar(defId: string): void {
    if (!this.profile.collection[defId]) return;
    this.profile.avatar = defId;
    this.commit();
  }

  equipCosmetic(kind: 'frame' | 'title', id: string | null): void {
    if (id && (COSMETICS_BY_ID[id]?.kind !== kind || !this.profile.cosmetics.owned.includes(id))) return;
    this.profile.cosmetics[kind] = id;
    this.commit();
  }

  async buyProduct(productId: string): Promise<Result<{ jade: number }>> {
    const product = JADE_PRODUCTS.find((p) => p.id === productId);
    if (!product) return { ok: false, error: 'Produit inconnu' };
    const receipt = await this.purchases.purchase(productId);
    const jade = product.jade + product.bonus;
    addCurrency(this.profile, 'jade', jade);
    track('purchase_completed', { productId, tx: receipt.transactionId });
    this.commit();
    return { ok: true, jade };
  }

  updateSettings(patch: Partial<Settings>): void {
    Object.assign(this.profile.settings, patch);
    this.commit();
  }

  rename(name: string): void {
    const trimmed = name.trim().slice(0, 16);
    if (!trimmed) return;
    this.profile.username = trimmed;
    this.commit();
  }

  // ---------- Combats ----------

  playerTeamSpec(): TeamSpec | null {
    const members = (this.profile.teams[this.profile.activeTeam]?.members ?? []).filter(
      (id): id is string => !!id && !!this.profile.collection[id],
    );
    if (members.length === 0) return null;
    return {
      name: this.profile.username,
      units: members.map((defId) => {
        const owned = this.profile.collection[defId];
        return { defId, level: owned.level, stars: owned.stars };
      }),
      items: { ...PVE_ITEM_LOADOUT },
    };
  }

  /** `soloLead` : le tutoriel se joue avec le seul premier shinobi. */
  prepareStageBattle(stageId: string, soloLead = false): BattleSetup | null {
    const stage = STAGES[stageId];
    if (!stage || !isStageUnlocked(this.profile, stageId)) return null;
    let player = this.playerTeamSpec();
    if (!player) return null;
    if (soloLead) player = { ...player, units: player.units.slice(0, 1) };
    const units = this.debug.enemyOverride
      ? this.debug.enemyOverride.map((defId) => ({ defId, level: stage.enemy[0].level, stars: 1 }))
      : stage.enemy;
    const seed = this.profile.settings.seedOverride ?? this.nextSeed();
    track('battle_started', { stageId, seed });
    return { stageId, enemyName: stage.enemyName, player, enemy: { name: stage.enemyName, units }, seed };
  }

  prepareTraining(mode: BattleMode): BattleSetup | null {
    const player = this.playerTeamSpec();
    if (!player) return null;
    const seed = this.profile.settings.seedOverride ?? this.nextSeed();
    const rng = new Rng(seed ^ 625341585);
    const enemyName = rng.pick(TRAINING_OPPONENT_NAMES);
    track('battle_started', { mode, training: true, seed });
    return {
      stageId: null,
      enemyName,
      player,
      enemy: { name: enemyName, units: randomTeam(rng, averageLevel(player.units)) },
      seed,
      mode,
    };
  }

  /**
   * Termine un combat local. Le résultat n'est pas lu dans l'état du client : il est recalculé en
   * rejouant la graine et les actions. Un client modifié ne peut donc pas s'attribuer une victoire.
   */
  completeBattle(setup: BattleSetup, final: BattleState): BattleRewards {
    const mode = setup.mode ?? 'pve';
    const replay: ReplayData | undefined = this.debugWinUsed
      ? undefined
      : { v: 1, seed: setup.seed, mode, teams: [setup.player, setup.enemy], log: final.log, you: 0 };
    let winner: Winner | null = final.winner;
    if (final.endReason === 'forfeit') winner = 1;
    else if (!this.debugWinUsed) {
      const verified = replayToEnd(setup.player, setup.enemy, setup.seed, configForMode(mode), final.log);
      if (verified.winner !== final.winner) console.warn('Battle verification mismatch, using replayed result');
      winner = verified.phase === 'ended' ? verified.winner : 1;
    }
    this.debugWinUsed = false;
    const won = winner === 0;
    const rewards = recordBattle(
      this.profile,
      {
        stageId: setup.stageId,
        training: mode !== 'pve',
        won,
        draw: winner === 'draw',
        team: setup.player.units.map((u) => u.defId),
        enemyTeam: setup.enemy.units.map((u) => u.defId),
        enemyName: setup.enemyName,
        turns: final.turn,
        seed: setup.seed,
        stats: { jutsus: final.stats.jutsusUsed[0], swaps: final.stats.swaps[0], crits: final.stats.crits[0] },
        replay,
      },
      Date.now(),
    );
    track(won ? 'battle_won' : 'battle_lost', { stageId: setup.stageId, turns: final.turn });
    if (rewards.firstClear?.packs) track('pack_received', { packs: rewards.firstClear.packs });
    this.commit();
    return rewards;
  }

  /** Enregistre un match PvP dont le serveur a décidé l'issue et les gains. */
  recordPvp(result: PvpResult): void {
    recordPvp(this.profile, result, Date.now());
    track(result.result === 'win' ? 'battle_won' : 'battle_lost', { mode: result.mode, mmrDelta: result.mmrDelta });
    this.commit();
  }

  // ---------- Outils développeur ----------

  debugAdd(currency: CurrencyId, amount: number): void {
    addCurrency(this.profile, currency, amount);
    this.commit();
  }

  debugGivePack(packId: string, count = 1): void {
    this.profile.packs[packId] = (this.profile.packs[packId] ?? 0) + count;
    track('pack_received', { packId, n: count, debug: true });
    this.commit();
  }

  debugGiveShinobi(defId: string): void {
    addShinobi(this.profile, defId, Date.now());
    this.commit();
  }

  debugMaxOut(defId: string): void {
    if (!this.profile.collection[defId]) addShinobi(this.profile, defId, Date.now());
    const owned = this.profile.collection[defId];
    owned.stars = MAX_STARS;
    owned.level = MAX_LEVEL;
    owned.xp = 0;
    this.commit();
  }

  debugSetSeed(seed: number | null): void {
    this.profile.settings.seedOverride = seed;
    this.rng = new Rng(seed ?? randomSeed());
    this.commit();
  }

  debugUnlockAll(): void {
    for (const id of Object.keys(STAGES)) {
      this.profile.pve.cleared[id] = Math.max(1, this.profile.pve.cleared[id] ?? 0);
    }
    this.commit();
  }

  async resetSave(): Promise<void> {
    await this.repo.clear();
    this.profile = newProfile(Date.now());
    refreshMissions(this.profile, Date.now());
    await this.flush();
    this.emit();
  }
}

export const game = new GameService();
