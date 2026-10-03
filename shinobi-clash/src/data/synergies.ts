import type { ElementId, Role, ShinobiDef, StatusId, TeamBonus } from '../core/types';

export type SynergyRequirement =
  | { kind: 'tagCount'; tag: string; count: number }
  | { kind: 'elements'; elements: ElementId[] }
  | { kind: 'distinctElements'; count: number }
  | { kind: 'roles'; roles: Role[] };

export interface SynergyDef {
  id: string;
  name: string;
  description: string;
  requirement: SynergyRequirement;
  bonus: TeamBonus;
}

/**
 * Synergies d'équipe : clans et équipes, mais aussi combinaisons d'éléments et de rôles
 * pour que les compositions hybrides restent intéressantes.
 */
export const SYNERGIES: SynergyDef[] = [
  {
    id: 'team7',
    name: 'Équipe 7',
    description: "2 membres de l'Équipe 7 : ATK +8%.",
    requirement: { kind: 'tagCount', tag: 'team7', count: 2 },
    bonus: { attackPct: 0.08 },
  },
  {
    id: 'uchiha',
    name: 'Sang Uchiha',
    description: '2 Uchiha : critique +8%, brûlure +15% de chance.',
    requirement: { kind: 'tagCount', tag: 'uchiha', count: 2 },
    bonus: { critRate: 0.08, statusChanceBonus: { burn: 0.15 } },
  },
  {
    id: 'hyuga',
    name: 'Clan Hyûga',
    description: '2 Hyûga : +1 chakra de départ, sceau +20%.',
    requirement: { kind: 'tagCount', tag: 'hyuga', count: 2 },
    bonus: { startChakra: 1, statusChanceBonus: { chakraSeal: 0.2 } },
  },
  {
    id: 'suna',
    name: 'Fratrie de Suna',
    description: '2 ninjas de Suna : DEF +10%.',
    requirement: { kind: 'tagCount', tag: 'suna', count: 2 },
    bonus: { defensePct: 0.1 },
  },
  {
    id: 'akatsuki',
    name: 'Akatsuki',
    description: '2 membres : +1 régénération de chakra.',
    requirement: { kind: 'tagCount', tag: 'akatsuki', count: 2 },
    bonus: { chakraRegen: 1 },
  },
  {
    id: 'team_gai',
    name: 'Équipe Gai',
    description: '2 membres : VIT +10%.',
    requirement: { kind: 'tagCount', tag: 'team_gai', count: 2 },
    bonus: { speedPct: 0.1 },
  },
  {
    id: 'suna_full',
    name: 'Fratrie au complet',
    description: 'Gaara, Kankurô et Temari ensemble : +1 chakra de départ (en plus de la Fratrie de Suna).',
    requirement: { kind: 'tagCount', tag: 'suna', count: 3 },
    bonus: { startChakra: 1 },
  },
  {
    id: 'ino_shika_cho',
    name: 'Formation Ino-Shika-Chô',
    description: 'Ino, Shikamaru et Chôji : ATK +10%, DEF +10%, contrôles +15%.',
    requirement: { kind: 'tagCount', tag: 'ino_shika_cho', count: 3 },
    bonus: {
      attackPct: 0.1,
      defensePct: 0.1,
      statusChanceBonus: { stun: 0.15, paralysis: 0.15, confusion: 0.15 },
    },
  },
  {
    id: 'team8',
    name: 'Équipe 8',
    description: '2 membres : VIT +8%, critique +4%.',
    requirement: { kind: 'tagCount', tag: 'team8', count: 2 },
    bonus: { speedPct: 0.08, critRate: 0.04 },
  },
  {
    id: 'kiri',
    name: 'Brume de Kiri',
    description: '2 ninjas de Kiri : critique +6%, saignement +20%.',
    requirement: { kind: 'tagCount', tag: 'kiri', count: 2 },
    bonus: { critRate: 0.06, statusChanceBonus: { bleed: 0.2 } },
  },
  {
    id: 'swordsmen',
    name: 'Épéistes de la Brume',
    description: '2 des Sept Épéistes : ATK +10%.',
    requirement: { kind: 'tagCount', tag: 'swordsman', count: 2 },
    bonus: { attackPct: 0.1 },
  },
  {
    id: 'myoboku',
    name: 'Mont Myôboku',
    description: 'Le maître et son disciple : dégâts Fûton et Katon +10%.',
    requirement: { kind: 'tagCount', tag: 'myoboku', count: 2 },
    bonus: { elementDamage: { futon: 0.1, katon: 0.1 } },
  },
  {
    id: 'firestorm',
    name: 'Tempête de feu',
    description: 'Katon + Fûton : dégâts Katon +15%.',
    requirement: { kind: 'elements', elements: ['katon', 'futon'] },
    bonus: { elementDamage: { katon: 0.15 } },
  },
  {
    id: 'storm_conductor',
    name: 'Orage conducteur',
    description: 'Suiton + Raiton : paralysie +20%, dégâts Raiton +10%.',
    requirement: { kind: 'elements', elements: ['suiton', 'raiton'] },
    bonus: {
      statusChanceBonus: { paralysis: 0.2 },
      elementDamage: { raiton: 0.1 },
    },
  },
  {
    id: 'mudslide',
    name: 'Coulée de boue',
    description: 'Doton + Suiton : PV +8%.',
    requirement: { kind: 'elements', elements: ['doton', 'suiton'] },
    bonus: { hpPct: 0.08 },
  },
  {
    id: 'versatile',
    name: 'Polyvalence',
    description: '3 éléments différents : critique +5%.',
    requirement: { kind: 'distinctElements', count: 3 },
    bonus: { critRate: 0.05 },
  },
  {
    id: 'frontline',
    name: 'Ligne de front',
    description: 'Un Tank + un Soigneur : soins et boucliers +20%.',
    requirement: { kind: 'roles', roles: ['tank', 'healer'] },
    bonus: { healingPct: 0.2, shieldPct: 0.2 },
  },
];

export function activeSynergies(team: ShinobiDef[]): SynergyDef[] {
  const elements = new Set<ElementId>();
  team.forEach((s) => s.elements.forEach((e) => e !== 'neutral' && elements.add(e)));
  return SYNERGIES.filter((syn) => {
    const r = syn.requirement;
    switch (r.kind) {
      case 'tagCount':
        return team.filter((s) => s.tags.includes(r.tag)).length >= r.count;
      case 'elements':
        return r.elements.every((e) => elements.has(e));
      case 'distinctElements':
        return elements.size >= r.count;
      case 'roles':
        return r.roles.every((role) => team.some((s) => s.role === role));
    }
  });
}

/** Synergies qu'activerait l'ajout de `candidate` (aperçu dans le constructeur d'équipe). */
export function synergiesGainedBy(team: ShinobiDef[], candidate: ShinobiDef): SynergyDef[] {
  const current = new Set(activeSynergies(team).map((s) => s.id));
  return activeSynergies([...team, candidate]).filter((s) => !current.has(s.id));
}

const SUMMED_KEYS = [
  'attackPct',
  'defensePct',
  'speedPct',
  'hpPct',
  'critRate',
  'chakraRegen',
  'startChakra',
  'healingPct',
  'shieldPct',
] as const;

export function combineBonuses(synergies: SynergyDef[]): TeamBonus {
  const total: TeamBonus = {};
  for (const syn of synergies) {
    for (const key of SUMMED_KEYS) {
      const value = syn.bonus[key];
      if (value) total[key] = (total[key] ?? 0) + value;
    }
    for (const [status, value] of Object.entries(syn.bonus.statusChanceBonus ?? {})) {
      total.statusChanceBonus ??= {};
      const id = status as StatusId;
      total.statusChanceBonus[id] = (total.statusChanceBonus[id] ?? 0) + (value ?? 0);
    }
    for (const [element, value] of Object.entries(syn.bonus.elementDamage ?? {})) {
      total.elementDamage ??= {};
      const id = element as ElementId;
      total.elementDamage[id] = (total.elementDamage[id] ?? 0) + (value ?? 0);
    }
  }
  return total;
}
