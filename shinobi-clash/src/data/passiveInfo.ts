export interface PassiveInfo {
  id: string;
  name: string;
  description: string;
}

/** Textes des passifs (la logique vit dans core/battle/passives.ts). */
export const PASSIVE_INFO: Record<string, PassiveInfo> = Object.fromEntries(
  [
    {
      id: 'never_give_up',
      name: 'Volonté inébranlable',
      description: 'La première fois que ses PV passent sous 30% : soigne 20% et ATK +1.',
    },
    {
      id: 'sharingan',
      name: 'Sharingan',
      description: 'Critique +10%. Ses critiques infligent ×1.7 au lieu de ×1.5.',
    },
    {
      id: 'perfect_control',
      name: 'Contrôle parfait',
      description: "Soins +40%. Gagne 1 chakra chaque fois qu'elle soigne.",
    },
    {
      id: 'copy_ninja',
      name: 'Ninja copieur',
      description: "Quand l'adversaire utilise un jutsu à 4+ chakra : +1 chakra et sa prochaine attaque +25%.",
    },
    {
      id: 'sand_armor',
      name: 'Armure de sable',
      description: 'Subit 20% de dégâts en moins tant que ses PV sont au-dessus de 50%.',
    },
    {
      id: 'springtime_youth',
      name: 'Fougue de la jeunesse',
      description: 'Sous 50% PV, inflige +25% de dégâts.',
    },
    {
      id: 'byakugan',
      name: 'Byakugan',
      description: 'Ses attaques ne ratent jamais et ignorent les clones.',
    },
    {
      id: 'strategist',
      name: 'Stratège',
      description: "Si l'ennemi est étourdi, paralysé ou endormi, ses jutsus coûtent 1 chakra de moins.",
    },
    {
      id: 'gentle_heart',
      name: 'Cœur doux',
      description: 'En entrant en combat : retire ses statuts et soigne 10%.',
    },
    {
      id: 'genjutsu_master',
      name: 'Maître du genjutsu',
      description: "Les statuts qu'il inflige durent 1 tour de plus.",
    },
    {
      id: 'samehada',
      name: 'Samehada',
      description: 'Chaque coup qui touche vole 1 chakra à la cible.',
    },
    {
      id: 'tailwind',
      name: 'Vent arrière',
      description: 'VIT +15% permanente. +1 chakra en entrant en combat.',
    },
    {
      id: 'expansion',
      name: 'Corpulence',
      description: 'Tant que son ATK est augmentée, il subit 15% de dégâts en moins.',
    },
    {
      id: 'pack_instinct',
      name: 'Flair des Inuzuka',
      description: 'Inflige +20% de dégâts aux cibles brûlées, empoisonnées ou qui saignent.',
    },
    {
      id: 'flower_heart',
      name: 'Langage des fleurs',
      description: 'En entrant en combat : soigne de 15% l’allié le plus blessé, même en réserve.',
    },
    {
      id: 'puppeteer',
      name: 'Marionnettiste',
      description: 'Tant qu’un leurre le protège, ses attaques infligent +20% de dégâts.',
    },
    {
      id: 'devotion',
      name: 'Dévouement',
      description: 'Si un allié tombe K.O., Haku entre ensuite en combat avec VIT +2 et ATK +1.',
    },
    {
      id: 'silent_killer',
      name: 'Démon de la Brume',
      description: 'Ses coups critiques infligent Saignement (2 tours).',
    },
    {
      id: 'art_is_explosion',
      name: 'L’art est une explosion',
      description: 'Son argile explosive inflige 50% de dégâts en plus (23% des PV max au lieu de 15%).',
    },
    {
      id: 'sage_mode',
      name: 'Mode Ermite',
      description: 'Après 2 tours en combat sans être remplacé : ATK +2.',
    },
  ].map((e): [string, PassiveInfo] => [e.id, e]),
);
