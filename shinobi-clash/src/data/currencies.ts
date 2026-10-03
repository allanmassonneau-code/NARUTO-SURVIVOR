import type { CurrencyId } from '../core/types';

/** Trois monnaies seulement : gratuite, premium, communauté. */
export const CURRENCIES: Record<CurrencyId, { name: string; short: string; color: string }> = {
  ryo: { name: 'Ryō', short: 'Ryō', color: '#f0c050' },
  jade: { name: 'Jade', short: 'Jade', color: '#4ad0a0' },
  chainPoints: { name: 'Points de chaîne', short: 'PC', color: '#b07af0' },
};
