export interface JadeProduct {
  id: string;
  name: string;
  jade: number;
  bonus: number;
  priceLabel: string;
}

export const JADE_PRODUCTS: JadeProduct[] = [
  { id: 'jade_small', name: 'Bourse de Jade', jade: 100, bonus: 0, priceLabel: '0,99 €' },
  { id: 'jade_medium', name: 'Coffret de Jade', jade: 550, bonus: 50, priceLabel: '4,99 €' },
  { id: 'jade_large', name: 'Trésor de Jade', jade: 1200, bonus: 200, priceLabel: '9,99 €' },
];

export interface PurchaseReceipt {
  productId: string;
  transactionId: string;
}

/** Abstraction de paiement : remplaçable par Stripe, App Store ou Google Play. */
export interface PurchaseProvider {
  readonly name: string;
  purchase(productId: string): Promise<PurchaseReceipt>;
}

/** Fournisseur de développement : aucun paiement réel. */
export class MockPurchaseProvider implements PurchaseProvider {
  readonly name = 'mock';

  async purchase(productId: string): Promise<PurchaseReceipt> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { productId, transactionId: `mock-${Date.now()}` };
  }
}
