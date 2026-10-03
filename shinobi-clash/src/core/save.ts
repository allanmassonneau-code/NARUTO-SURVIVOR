import { DEFAULT_SETTINGS, newProfile, SAVE_VERSION, type PlayerProfile } from './profile';

type RawSave = Record<string, unknown>;

/** Migrations successives : MIGRATIONS[n] transforme une sauvegarde v n en v n+1. */
const MIGRATIONS: Record<number, (save: RawSave) => RawSave> = {
  1: (save) => ({
    ...save,
    lifetime: save.lifetime ?? { battles: 0, wins: 0, legendaries: 0 },
    rank: save.rank ?? { mmr: 1000, seasonId: 's1', wins: 0, losses: 0 },
    saveVersion: 2,
  }),
  2: (save) => ({
    ...save,
    achievementsClaimed: save.achievementsClaimed ?? [],
    pass: save.pass ?? { seasonId: 's1', xp: 0, premium: false, claimedFree: [], claimedPremium: [] },
    cosmetics: save.cosmetics ?? { owned: [], frame: null, title: null },
    lifetime: { jutsus: 0, crits: 0, trainingWins: 0, pvpWins: 0, ...(save.lifetime as object) },
    saveVersion: 3,
  }),
};

/** Valide, migre et complète une sauvegarde lue sur disque. */
export function migrateSave(raw: unknown, now: number): PlayerProfile {
  if (!raw || typeof raw !== 'object') throw Error('Invalid save');
  let save = raw as RawSave;
  let version = typeof save.saveVersion === 'number' ? save.saveVersion : 1;
  if (version > SAVE_VERSION) throw Error(`Save version ${version} is newer than supported ${SAVE_VERSION}`);
  while (version < SAVE_VERSION) {
    const migrate = MIGRATIONS[version];
    if (!migrate) throw Error(`Missing migration from v${version}`);
    save = migrate(save);
    version++;
  }
  const defaults = newProfile(now);
  const profile = { ...defaults, ...save } as PlayerProfile;
  profile.settings = { ...DEFAULT_SETTINGS, ...(profile.settings ?? {}) };
  profile.tutorial = { ...defaults.tutorial, ...(profile.tutorial ?? {}) };
  profile.currencies = { ...defaults.currencies, ...(profile.currencies ?? {}) };
  return profile;
}

export function serializeSave(profile: PlayerProfile): string {
  return JSON.stringify(profile);
}
