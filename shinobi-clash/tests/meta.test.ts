import { describe, expect, it } from 'vitest';
import { checkAchievements, claimAchievement } from '../src/core/achievements';
import { buyPremiumPass, claimPassTier, passView } from '../src/core/battlePass';
import { claimMission, dayKey, listMissions, refreshMissions, trackMetric, weekKey } from '../src/core/missions';
import { newProfile } from '../src/core/profile';
import { isStageUnlocked, recordBattle } from '../src/core/records';
import { applyRedemption, CHANNEL_DAILY_CAP, createRedemptionLedger } from '../src/services/channelPoints';
import { activeSynergies, combineBonuses, synergiesGainedBy } from '../src/data/synergies';
import { getShinobi } from '../src/data/shinobi';
import { SEASONS } from '../src/data/seasons';
import { seasonReset, settleRankedSeason } from '../src/core/ranked';

const NOW = new Date('2026-10-01T10:00:00').getTime();

describe('missions', () => {
  it('se réinitialisent chaque jour et chaque semaine', () => {
    const p = newProfile(NOW);
    refreshMissions(p, NOW);
    trackMetric(p, 'wins', 2);
    expect(listMissions(p).find((m) => m.def.id === 'd_wins')?.done).toBe(true);
    const nextDay = NOW + 24 * 3600 * 1000;
    expect(dayKey(nextDay)).not.toBe(dayKey(NOW));
    refreshMissions(p, nextDay);
    expect(p.missions.daily.progress.wins).toBeUndefined();
    expect(weekKey(NOW)).toBe(weekKey(NOW + 24 * 3600 * 1000));
  });

  it('se réclament une seule fois, avec XP de passe', () => {
    const p = newProfile(NOW);
    refreshMissions(p, NOW);
    expect(claimMission(p, 'd_wins', NOW).ok).toBe(false);
    trackMetric(p, 'wins', 2);
    const claimed = claimMission(p, 'd_wins', NOW);
    expect(claimed.ok && claimed.passXp).toBe(50);
    expect(p.currencies.ryo).toBe(800);
    expect(claimMission(p, 'd_wins', NOW)).toEqual({ ok: false, error: 'Déjà réclamée' });
  });
});

describe('passe de combat', () => {
  it('voie gratuite récupérable, voie premium après achat', () => {
    const p = newProfile(NOW);
    p.pass.xp = 400 * 2;
    expect(passView(p, NOW).level).toBe(2);
    expect(claimPassTier(p, 1, 'free', NOW).ok).toBe(true);
    expect(claimPassTier(p, 1, 'premium', NOW)).toEqual({ ok: false, error: 'Passe premium requis' });
    expect(claimPassTier(p, 3, 'free', NOW)).toEqual({ ok: false, error: 'Palier pas encore atteint' });
    expect(buyPremiumPass(p, NOW).ok).toBe(false);
    p.currencies.jade = 1000;
    expect(buyPremiumPass(p, NOW).ok).toBe(true);
    expect(claimPassTier(p, 1, 'premium', NOW).ok).toBe(true);
  });
});

describe('succès, aventure et points de chaîne', () => {
  it('débloque puis réclame un succès', () => {
    const p = newProfile(NOW);
    p.lifetime.wins = 1;
    expect(checkAchievements(p).map((a) => a.id)).toContain('first_win');
    expect(claimAchievement(p, 'first_win').ok).toBe(true);
    expect(claimAchievement(p, 'first_win').ok).toBe(false);
  });

  it('chaque étape se débloque en gagnant la précédente ; la première victoire paie une fois', () => {
    const p = newProfile(NOW);
    expect(isStageUnlocked(p, 'academy_1')).toBe(true);
    expect(isStageUnlocked(p, 'academy_2')).toBe(false);
    const summary = {
      stageId: 'academy_1',
      training: false,
      won: true,
      draw: false,
      team: [],
      enemyTeam: [],
      enemyName: 'X',
      turns: 3,
      seed: 1,
      stats: { jutsus: 3, swaps: 0, crits: 0 },
    };
    expect(recordBattle(p, summary, NOW).firstClear?.packs?.starter).toBe(1);
    expect(isStageUnlocked(p, 'academy_2')).toBe(true);
    expect(recordBattle(p, summary, NOW).firstClear).toBeNull();
  });

  it('les rédemptions sont idempotentes et plafonnées par jour', () => {
    const p = newProfile(NOW);
    const ledger = createRedemptionLedger();
    const r = (id: string) => ({ id, twitchUserId: 'v', rewardId: 'sc_points_large', redeemedAt: NOW });
    expect(applyRedemption(ledger, p, r('a')).ok).toBe(true);
    expect(applyRedemption(ledger, p, r('a')).ok).toBe(false);
    for (let i = 0; i < 5; i++) applyRedemption(ledger, p, r(`b${i}`));
    expect(p.currencies.chainPoints).toBe(CHANNEL_DAILY_CAP);
  });
});

describe('synergies', () => {
  it('détecte clans, éléments complémentaires et rôles', () => {
    const team = ['naruto', 'sasuke', 'sakura'].map(getShinobi);
    const ids = activeSynergies(team).map((s) => s.id);
    expect(ids).toContain('team7');
    expect(ids).toContain('firestorm');
    const bonus = combineBonuses(activeSynergies(team));
    expect(bonus.attackPct).toBeGreaterThan(0);
    const gained = synergiesGainedBy([getShinobi('gaara')], getShinobi('temari')).map((s) => s.id);
    expect(gained).toContain('suna');
  });
});

describe('saisons classées', () => {
  const seasons = [
    { ...SEASONS[0], id: 's0', name: 'Saison 0', startDate: '2020-01-01', endDate: '2020-12-31' },
    ...SEASONS,
  ];

  it('récompense la ligue atteinte, garde un badge et remet le MMR à niveau', () => {
    const p = newProfile(NOW);
    p.rank = { mmr: 1300, seasonId: 's0', wins: 8, losses: 3, history: [] };
    const jade = p.currencies.jade;
    const settled = settleRankedSeason(p, NOW, seasons);
    expect(settled?.league).toBe('Or');
    expect(p.currencies.jade).toBe(jade + 50);
    expect(p.packs.standard).toBe(2);
    expect(p.rank).toMatchObject({ mmr: seasonReset(1300), seasonId: 's1', wins: 0, losses: 0 });
    expect(p.rank.history).toEqual([{ seasonId: 's0', league: 'Or', mmr: 1300 }]);
    expect(settleRankedSeason(p, NOW, seasons)).toBeNull();
  });

  it('sans match classé : pas de récompense ni de badge', () => {
    const p = newProfile(NOW);
    p.rank = { mmr: 1000, seasonId: 's0', wins: 0, losses: 0, history: [] };
    expect(settleRankedSeason(p, NOW, seasons)).toBeNull();
    expect(p.rank.seasonId).toBe('s1');
    expect(p.rank.history).toEqual([]);
  });
});
