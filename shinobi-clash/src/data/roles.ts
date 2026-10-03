import type { Role } from '../core/types';

export const ROLES: Record<Role, { name: string; icon: string; desc: string }> = {
  attacker: { name: 'Attaquant', icon: '⚔', desc: 'Gros dégâts mais fragile.' },
  tank: { name: 'Tank', icon: '⛨', desc: 'Résiste, protège, encaisse.' },
  speedster: { name: 'Rapide', icon: '➹', desc: "Agit en premier, manipule l'initiative." },
  support: { name: 'Soutien', icon: '✚', desc: 'Chakra, soins légers, utilitaire.' },
  controller: { name: 'Contrôle', icon: '◎', desc: 'Étourdit, scelle, entrave.' },
  healer: { name: 'Soigneur', icon: '♥', desc: 'Soigne et nettoie les statuts.' },
  assassin: { name: 'Assassin', icon: '✦', desc: 'Critiques et exécutions.' },
  specialist: { name: 'Spécialiste', icon: '❖', desc: 'Mécanique unique.' },
};
