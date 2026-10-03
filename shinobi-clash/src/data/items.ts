export interface ItemDef {
  id: string;
  name: string;
  description: string;
  heal?: number;
  chakra?: number;
  cleanse?: boolean;
}

/** Consommables de combat : PvE uniquement (désactivés en PvP). */
export const ITEMS: Record<string, ItemDef> = {
  onigiri: { id: 'onigiri', name: 'Onigiri', description: 'Soigne 30% des PV du shinobi actif.', heal: 0.3 },
  soldier_pill: {
    id: 'soldier_pill',
    name: 'Pilule du soldat',
    description: '+4 chakra et retire les statuts.',
    chakra: 4,
    cleanse: true,
  },
};

/** Objets emportés à chaque combat PvE. */
export const PVE_ITEM_LOADOUT: Record<string, number> = { onigiri: 1, soldier_pill: 1 };
