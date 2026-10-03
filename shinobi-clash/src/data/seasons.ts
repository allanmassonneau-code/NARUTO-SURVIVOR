import type { Reward } from '../core/types';

/** XP de passe de combat gagnée par source. */
export const PASS_XP = { win: 60, loss: 20, dailyMission: 50, weeklyMission: 150 };

const ryo = (n: number): Reward => ({ currencies: { ryo: n } });
const jade = (n: number): Reward => ({ currencies: { jade: n } });
const pack = (id: string, n = 1): Reward => ({ packs: { [id]: n } });
const cosmetic = (id: string, extra: Reward = {}): Reward => ({ ...extra, cosmetics: [id] });

// prettier-ignore
const FREE_TRACK: Reward[] = [
  ryo(300), pack('standard'), ryo(400), jade(10), cosmetic('title_genin'),
  ryo(500), pack('standard'), jade(15), ryo(600), cosmetic('frame_leaf', pack('standard')),
  ryo(600), jade(20), pack('standard'), ryo(700), pack('elite'),
  ryo(700), jade(20), pack('standard'), ryo(800), cosmetic('title_chunin', jade(25)),
  ryo(800), pack('standard'), jade(25), ryo(900), pack('elite'),
  ryo(1000), jade(30), pack('standard'), ryo(1000), cosmetic('frame_moon', pack('elite')),
];

// prettier-ignore
const PREMIUM_TRACK: Reward[] = [
  jade(40), ryo(500), cosmetic('frame_sand'), pack('standard'), jade(30),
  ryo(700), pack('standard'), jade(30), cosmetic('title_elite'), pack('elite'),
  jade(40), ryo(800), pack('standard'), jade(40), cosmetic('frame_lightning', jade(20)),
  ryo(900), pack('standard'), jade(40), pack('elite'), cosmetic('title_sannin', jade(30)),
  ryo(1000), jade(40), pack('standard'), jade(50), pack('elite'),
  ryo(1200), jade(50), pack('elite'), jade(60), cosmetic('title_kage_s1', pack('elite', 2)),
];

export interface PassTier {
  level: number;
  free: Reward;
  premium: Reward | null;
}

export interface SeasonDef {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  rankRewards: Record<string, Reward>;
  battlePass: { xpPerTier: number; premiumPrice: number; tiers: PassTier[] };
  events: { id: string; name: string; description: string }[];
}

export const SEASONS: SeasonDef[] = [
  {
    id: 's1',
    name: "Saison 1 — L'Éveil",
    startDate: '2026-09-01',
    endDate: '2026-11-30',
    rankRewards: {
      Bronze: { currencies: { ryo: 1000 } },
      Argent: { currencies: { ryo: 1500, jade: 30 } },
      Or: { packs: { standard: 2 }, currencies: { jade: 50 } },
      Platine: { packs: { elite: 1 }, currencies: { jade: 80 } },
      Diamant: { packs: { elite: 2 }, currencies: { jade: 120 } },
      Maître: { packs: { elite: 3 }, currencies: { jade: 160 } },
      Kage: { packs: { elite: 4 }, currencies: { jade: 250 } },
    },
    battlePass: {
      xpPerTier: 400,
      premiumPrice: 450,
      tiers: FREE_TRACK.map((free, i) => ({ level: i + 1, free, premium: PREMIUM_TRACK[i] ?? null })),
    },
    events: [{ id: 'ev_exam', name: "Tournoi de l'Examen", description: 'Week-end à règles spéciales (bientôt).' }],
  },
];

export function currentSeason(now: number): SeasonDef {
  const day = new Date(now).toISOString().slice(0, 10);
  return SEASONS.find((s) => s.startDate <= day && day <= s.endDate) ?? SEASONS[SEASONS.length - 1];
}
