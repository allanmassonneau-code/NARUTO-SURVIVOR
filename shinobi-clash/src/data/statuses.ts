import type { StatusId } from '../core/types';

export interface StatusDef {
  id: StatusId;
  name: string;
  short: string;
  color: string;
  description: string;
  defaultTurns: number;
  /** Contrôle dur : suivi d'une immunité temporaire pour éviter les chaînes infinies. */
  hardCC: boolean;
}

export const STATUSES: Record<StatusId, StatusDef> = {
  burn: {
    id: 'burn',
    name: 'Brûlure',
    short: 'BRU',
    color: '#e8553a',
    description: 'Perd 6% PV max à chaque fin de tour.',
    defaultTurns: 3,
    hardCC: false,
  },
  poison: {
    id: 'poison',
    name: 'Poison',
    short: 'PSN',
    color: '#9a4fd0',
    description: 'Perd 4% PV max, puis +2% chaque tour.',
    defaultTurns: 4,
    hardCC: false,
  },
  paralysis: {
    id: 'paralysis',
    name: 'Paralysie',
    short: 'PAR',
    color: '#f2d04a',
    description: 'VIT ÷2 et 25% de chance de ne pas agir.',
    defaultTurns: 3,
    hardCC: false,
  },
  bleed: {
    id: 'bleed',
    name: 'Saignement',
    short: 'SAI',
    color: '#c0203a',
    description: 'Perd 7% PV max à chaque jutsu utilisé.',
    defaultTurns: 3,
    hardCC: false,
  },
  confusion: {
    id: 'confusion',
    name: 'Confusion',
    short: 'CNF',
    color: '#e87ad0',
    description: "33% de chance de se blesser au lieu d'agir.",
    defaultTurns: 2,
    hardCC: false,
  },
  sleep: {
    id: 'sleep',
    name: 'Sommeil',
    short: 'SOM',
    color: '#7a8ae8',
    description: 'Ne peut pas agir. Se réveille si touché.',
    defaultTurns: 2,
    hardCC: true,
  },
  silence: {
    id: 'silence',
    name: 'Silence',
    short: 'SIL',
    color: '#8aa0b0',
    description: "Seule l'attaque de base est utilisable.",
    defaultTurns: 2,
    hardCC: false,
  },
  stun: {
    id: 'stun',
    name: 'Étourdi',
    short: 'ETD',
    color: '#f0a030',
    description: 'Perd sa prochaine action.',
    defaultTurns: 1,
    hardCC: true,
  },
  bomb: {
    id: 'bomb',
    name: 'Argile explosive',
    short: 'BOM',
    color: '#f08a2c',
    description: 'Explose à la fin du tour suivant (15% PV max). Changer de shinobi la désamorce.',
    defaultTurns: 2,
    hardCC: false,
  },
  chakraSeal: {
    id: 'chakraSeal',
    name: 'Sceau',
    short: 'SCL',
    color: '#3ab0c0',
    description: 'Pas de régénération de chakra, jutsus +1 coût.',
    defaultTurns: 2,
    hardCC: false,
  },
};

/** Dégâts d'argile explosive en % des PV max. */
export const BOMB_PCT = 0.15;
