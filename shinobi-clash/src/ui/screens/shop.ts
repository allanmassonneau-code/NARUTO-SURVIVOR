import { PACKS } from '../../data/packs';
import { game } from '../../services/gameService';
import { JADE_PRODUCTS } from '../../services/purchases';
import { button, currencyGem, flyCurrency, toast } from '../components';
import { clear, h } from '../dom';
import { packVisual } from '../pack/opening';
import { navigate, type Screen } from '../router';
import { topBar } from '../topbar';
import { openOddsModal, pityMeter, priceButtons } from './packs';

export function shopScreen(): Screen {
  const bar = topBar('Boutique', { back: () => navigate('home') });
  const content = h('div');

  function render(): void {
    clear(content);
    content.append(
      h('div', { class: 'section-title' }, 'Parchemins'),
      h(
        'div',
        { class: 'pack-tiles' },
        ...Object.values(PACKS)
          .filter((p) => p.inShop)
          .map((pack) =>
            h(
              'div',
              { class: 'panel pack-tile' },
              packVisual(pack.id),
              h('h3', { style: 'margin:0' }, pack.name),
              h('div', { style: 'font-size:14px' }, pack.description),
              priceButtons(pack.id, render),
              pityMeter(pack.id),
              h(
                'div',
                { class: 'row' },
                button('Probabilités', () => openOddsModal(pack.id), { size: 'small', variant: 'dark' }),
                (game.profile.packs[pack.id] ?? 0) > 0
                  ? button(`Ouvrir (${game.profile.packs[pack.id]})`, () => navigate('packs', { autoOpen: pack.id }), {
                      size: 'small',
                      variant: 'gold',
                    })
                  : null,
              ),
            ),
          ),
      ),
      h('div', { class: 'section-title' }, 'Jade'),
      h(
        'div',
        { class: 'panel dark', style: 'font-size:14px;margin-bottom:10px' },
        'Achats simulés (MockPurchaseProvider) — aucun paiement réel. Tous les shinobis restent obtenables gratuitement.',
      ),
      h(
        'div',
        { class: 'pack-tiles' },
        ...JADE_PRODUCTS.map((product) => {
          const buy: HTMLButtonElement = button(
            product.priceLabel,
            async () => {
              buy.disabled = true;
              const result = await game.buyProduct(product.id);
              buy.disabled = false;
              if (result.ok) {
                toast(`+${result.jade} Jade`, 'good');
                void flyCurrency(buy, 'jade', 8);
              }
            },
            { variant: 'blue' },
          );
          return h(
            'div',
            { class: 'panel pack-tile' },
            h('div', { class: 'row' }, currencyGem('jade'), h('h3', { style: 'margin:0' }, product.name)),
            h('div', { class: 'px-font' }, `${product.jade} Jade${product.bonus ? ` + ${product.bonus} bonus` : ''}`),
            buy,
          );
        }),
      ),
      h('div', { class: 'section-title' }, 'Points de chaîne'),
      h(
        'div',
        { class: 'panel', style: 'font-size:15px' },
        'Les points de chaîne se gagneront en regardant les streams partenaires : lie ton compte Twitch, échange tes points de chaîne contre des points en jeu, puis contre des parchemins ci-dessus. La liaison des comptes arrive bientôt.',
      ),
    );
  }

  render();
  return {
    el: h('div', null, bar.el, h('div', { class: 'scroll' }, h('div', { class: 'wrap' }, content))),
    destroy: bar.destroy,
  };
}
