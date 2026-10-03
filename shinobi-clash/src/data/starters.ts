export interface StarterDef {
  id: string;
  philosophy: string;
  blurb: string;
}

/** Trois starters, trois philosophies ; tous viables. */
export const STARTERS: StarterDef[] = [
  { id: 'naruto', philosophy: 'Attaque', blurb: 'Agressif et direct. Clones, combos et Rasengan dévastateur.' },
  { id: 'gaara', philosophy: 'Défense', blurb: 'Increvable. Bloque, immobilise puis écrase.' },
  { id: 'shikamaru', philosophy: 'Technique', blurb: "Contrôle et préparation. Piège l'ennemi dans son ombre." },
];
