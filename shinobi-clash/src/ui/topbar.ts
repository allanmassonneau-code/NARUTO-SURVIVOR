import type { CurrencyId } from '../core/types';
import { game } from '../services/gameService';
import { button, countUp, currencyGem } from './components';
import { h, reflow, type Child } from './dom';
import { goBack } from './router';

/** Compteurs de monnaies qui défilent et rebondissent à chaque gain. */
export function currencyBar(currencies: CurrencyId[] = ['ryo', 'jade', 'chainPoints']) {
  const entries = new Map<CurrencyId, { box: HTMLElement; num: HTMLElement; value: number }>();
  const el = h('div', { class: 'currencies' });
  for (const currency of currencies) {
    const num = h('span', null, game.profile.currencies[currency].toLocaleString('fr-FR'));
    const box = h('div', { class: 'currency', 'data-c': currency, title: currency }, currencyGem(currency), num);
    entries.set(currency, { box, num, value: game.profile.currencies[currency] });
    el.appendChild(box);
  }
  return {
    el,
    destroy: game.subscribe((profile) => {
      for (const [currency, entry] of entries) {
        const value = profile.currencies[currency];
        if (value === entry.value) continue;
        void countUp(entry.num, entry.value, value, 600);
        entry.value = value;
        entry.box.classList.remove('bump');
        reflow(entry.box);
        entry.box.classList.add('bump');
      }
    }),
  };
}

export interface TopBarOptions {
  back?: false | (() => void);
  currencies?: false | CurrencyId[];
  extra?: Child[];
}

export function topBar(title: string, opts: TopBarOptions = {}) {
  const bar = opts.currencies === false ? null : currencyBar(opts.currencies);
  return {
    el: h(
      'div',
      { class: 'topbar' },
      opts.back === false
        ? null
        : button('◀', typeof opts.back === 'function' ? opts.back : () => goBack(), {
            size: 'small',
            variant: 'dark',
            sfx: 'back',
            cls: 'back-btn',
            title: 'Retour',
          }),
      h('h1', null, title),
      ...(opts.extra ?? []),
      bar?.el,
    ),
    destroy: () => bar?.destroy(),
  };
}
