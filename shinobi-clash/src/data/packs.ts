import type { CurrencyId, Rarity } from '../core/types';

export interface PackDef {
  id: string;
  name: string;
  description: string;
  cards: number;
  /** Probabilités par carte, affichées au joueur. */
  odds: Record<Rarity, number>;
  /** Rareté minimale de la dernière carte. */
  lastSlotMin: Rarity;
  /** Pity dur : Épique garantie au N-ième parchemin sans Épique. */
  epicPity: number;
  legendaryPity: number;
  /** Pity doux : à partir de ce parchemin, chance de Légendaire +softPityStep par parchemin. */
  softPityStart: number;
  softPityStep: number;
  /** Nombre minimal de shinobis jamais obtenus (parchemin d'initiation). */
  guaranteeNew?: number;
  /** Pas deux fois le même shinobi dans le parchemin. */
  distinct?: boolean;
  prices: Partial<Record<CurrencyId, number>>;
  color: string;
  accent: string;
  inShop: boolean;
}

export const PACKS: Record<string, PackDef> = {
  starter: {
    id: 'starter',
    name: "Parchemin de l'Académie",
    description: 'Le premier parchemin. Contient au moins 2 nouveaux shinobis.',
    cards: 5,
    odds: { common: 0.6, uncommon: 0.3, rare: 0.1, epic: 0, legendary: 0 },
    lastSlotMin: 'rare',
    epicPity: 999,
    legendaryPity: 999,
    softPityStart: 999,
    softPityStep: 0,
    guaranteeNew: 2,
    distinct: true,
    prices: {},
    color: '#c9a86a',
    accent: '#7a4a2a',
    inShop: false,
  },
  standard: {
    id: 'standard',
    name: 'Parchemin Shinobi',
    description: '5 révélations. Dernière carte Peu commune ou mieux.',
    cards: 5,
    odds: { common: 0.56, uncommon: 0.26, rare: 0.13, epic: 0.04, legendary: 0.01 },
    lastSlotMin: 'uncommon',
    epicPity: 10,
    legendaryPity: 50,
    softPityStart: 35,
    softPityStep: 0.02,
    prices: { ryo: 600, jade: 60, chainPoints: 1000 },
    color: '#d0364a',
    accent: '#f0b429',
    inShop: true,
  },
  elite: {
    id: 'elite',
    name: 'Parchemin Kage',
    description: '5 révélations. Dernière carte Rare ou mieux. Chances améliorées.',
    cards: 5,
    odds: { common: 0.38, uncommon: 0.3, rare: 0.22, epic: 0.08, legendary: 0.02 },
    lastSlotMin: 'rare',
    epicPity: 5,
    legendaryPity: 30,
    softPityStart: 20,
    softPityStep: 0.03,
    prices: { jade: 150, chainPoints: 2500 },
    color: '#2a2a4a',
    accent: '#a34ff0',
    inShop: true,
  },
};

export function getPack(id: string): PackDef {
  const pack = PACKS[id];
  if (!pack) throw Error(`Unknown pack ${id}`);
  return pack;
}
