import type { CurrencyId } from './types';

export interface Wallet {
  currencies: Record<CurrencyId, number>;
}

export type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

export function canAfford(wallet: Wallet, currency: CurrencyId, amount: number): boolean {
  return amount >= 0 && wallet.currencies[currency] >= amount;
}

export function addCurrency(wallet: Wallet, currency: CurrencyId, amount: number): void {
  if (!Number.isFinite(amount) || amount < 0) throw Error('Invalid currency amount');
  wallet.currencies[currency] += Math.floor(amount);
}

export function spendCurrency(wallet: Wallet, currency: CurrencyId, amount: number): Result {
  if (!Number.isFinite(amount) || amount < 0) return { ok: false, error: 'Montant invalide' };
  if (!canAfford(wallet, currency, amount)) return { ok: false, error: 'Ressources insuffisantes' };
  wallet.currencies[currency] -= Math.floor(amount);
  return { ok: true };
}
