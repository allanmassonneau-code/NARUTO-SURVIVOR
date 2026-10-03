import { effectiveOdds, pityOf } from '../../core/gacha';
import type { CurrencyId } from '../../core/types';
import { CURRENCIES } from '../../data/currencies';
import { getPack, PACKS } from '../../data/packs';
import { RARITIES, RARITY_ORDER } from '../../data/rarities';
import { ROSTER } from '../../data/shinobi';
import { game } from '../../services/gameService';
import { Bar, button, currencyGem, openModal, toast } from '../components';
import { clear, h } from '../dom';
import { packVisual, playPackOpening } from '../pack/opening';
import { navigate, type Screen, type ScreenParams } from '../router';
import { topBar } from '../topbar';

/** Probabilités affichées clairement, pity doux compris. */
export function openOddsModal(packId: string): void {
  const pack = getPack(packId);
  const odds = effectiveOdds(pack, pityOf(game.profile, packId));
  const total = RARITY_ORDER.reduce((sum, r) => sum + odds[r], 0);
  openModal(
    h(
      'div',
      null,
      h('h2', null, `Probabilités — ${pack.name}`),
      h(
        'p',
        { style: 'font-size:14px;margin-top:0' },
        `Chances par carte (${pack.cards} cartes). La dernière carte est au minimum ${RARITIES[pack.lastSlotMin].name}.`,
      ),
      h(
        'table',
        { class: 'odds-table' },
        ...RARITY_ORDER.filter((r) => pack.odds[r] > 0).map((r) =>
          h(
            'tr',
            null,
            h(
              'td',
              null,
              h(
                'span',
                { class: 'chip', style: { background: RARITIES[r].color, color: '#1a1420', textShadow: 'none' } },
                RARITIES[r].name,
              ),
            ),
            h('td', { style: 'text-align:right' }, `${((odds[r] / total) * 100).toFixed(2)}%`),
            h(
              'td',
              { class: 'dim', style: 'font-size:13px' },
              ROSTER.filter((s) => s.rarity === r)
                .map((s) => s.name)
                .join(', '),
            ),
          ),
        ),
      ),
      pack.epicPity < 999
        ? h(
            'p',
            { style: 'font-size:14px' },
            `Garanties : un Épique ou mieux au plus tard tous les ${pack.epicPity} parchemins, un Légendaire au plus tard tous les ${pack.legendaryPity}. À partir du ${pack.softPityStart}e parchemin sans Légendaire, sa chance augmente de ${(pack.softPityStep * 100).toFixed(0)}% par parchemin.`,
          )
        : null,
      h(
        'p',
        { class: 'dim', style: 'font-size:13px' },
        'Les doublons sont convertis en fragments du shinobi pour l’éveiller.',
      ),
    ),
  );
}

/** Jauges de garantie (pity) visibles en permanence. */
export function pityMeter(packId: string): HTMLDivElement | null {
  const pack = getPack(packId);
  if (pack.epicPity >= 999) return null;
  const pity = pityOf(game.profile, packId);
  const epic = new Bar(pity.sinceEpic / pack.epicPity, 'xp');
  const legendary = new Bar(pity.sinceLegendary / pack.legendaryPity, 'xp');
  epic.el.querySelector<HTMLElement>('.fill')!.style.background = RARITIES.epic.color;
  legendary.el.querySelector<HTMLElement>('.fill')!.style.background = RARITIES.legendary.color;
  return h(
    'div',
    { class: 'pity' },
    h('div', null, `Épique garanti : ${pity.sinceEpic}/${pack.epicPity}`),
    epic.el,
    h('div', null, `Légendaire garanti : ${pity.sinceLegendary}/${pack.legendaryPity}`),
    legendary.el,
  );
}

export function priceButtons(packId: string, onBought: () => void): HTMLDivElement {
  const pack = getPack(packId);
  return h(
    'div',
    { class: 'row wrap-r', style: 'justify-content:center' },
    ...Object.entries(pack.prices).map(([currency, price]) =>
      button(
        [currencyGem(currency as CurrencyId), `${price} ${CURRENCIES[currency as CurrencyId].short}`],
        () => {
          const result = game.buyPack(packId, currency as CurrencyId);
          if (result.ok) {
            toast(`${pack.name} acheté !`, 'good');
            onBought();
          } else {
            toast(result.error, 'error');
          }
        },
        { size: 'small', disabled: game.profile.currencies[currency as CurrencyId] < price!, sfx: 'coin' },
      ),
    ),
  );
}

export function packsScreen(params: ScreenParams): Screen {
  const bar = topBar('Parchemins', { back: () => navigate('home') });
  const tiles = h('div', { class: 'pack-tiles' });

  function open(packId: string): void {
    const result = game.openPack(packId);
    if (!result.ok) {
      toast(result.error, 'error');
      return;
    }
    playPackOpening(result.opening, {
      onClose: render,
      onAgain: () => open(packId),
      // Pendant l'onboarding, enchaîner directement sur le second combat.
      extra: (close) =>
        game.profile.tutorial.done && !(game.profile.pve.cleared.academy_2 ?? 0)
          ? button(
              '⚔ Combat suivant',
              () => {
                const setup = game.prepareStageBattle('academy_2');
                if (!setup) return;
                close();
                navigate('battle', { pending: setup, ai: 'easy' });
              },
              { variant: 'primary', size: 'big' },
            )
          : button(
              'Voir l’équipe',
              () => {
                close();
                navigate('team');
              },
              { variant: 'dark' },
            ),
    });
  }

  function render(): void {
    clear(tiles);
    const shown = Object.keys(PACKS).filter((id) => (game.profile.packs[id] ?? 0) > 0 || PACKS[id].inShop);
    for (const packId of shown) {
      const count = game.profile.packs[packId] ?? 0;
      const visual = packVisual(packId);
      if (count > 0) visual.appendChild(h('div', { class: 'count' }, `×${count}`));
      tiles.appendChild(
        h(
          'div',
          { class: 'panel pack-tile' },
          visual,
          h('h3', { style: 'margin:0' }, getPack(packId).name),
          h('div', { style: 'font-size:14px' }, getPack(packId).description),
          count > 0
            ? button('Ouvrir !', () => open(packId), { variant: 'gold', size: 'big', sfx: 'tear' })
            : h('div', { class: 'dim', style: 'font-size:14px' }, 'Aucun en réserve'),
          priceButtons(packId, render),
          pityMeter(packId),
          button('Probabilités', () => openOddsModal(packId), { size: 'small', variant: 'dark' }),
        ),
      );
    }
  }

  render();
  const autoOpen = params.autoOpen as string | undefined;
  if (autoOpen && (game.profile.packs[autoOpen] ?? 0) > 0) setTimeout(() => open(autoOpen), 350);
  return {
    el: h('div', null, bar.el, h('div', { class: 'scroll' }, h('div', { class: 'wrap' }, tiles))),
    destroy: bar.destroy,
    music: 'menu',
  };
}
