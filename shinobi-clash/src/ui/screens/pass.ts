import type { PassTierView } from '../../core/battlePass';
import type { CurrencyId, Reward } from '../../core/types';
import { COSMETICS_BY_ID } from '../../data/cosmetics';
import { PACKS } from '../../data/packs';
import { PASS_XP } from '../../data/seasons';
import passCss from '../../styles/screens/pass.css?inline';
import { audio } from '../../services/audio';
import { game } from '../../services/gameService';
import { Bar, button, confirmDialog, currencyGem, flyCurrency, rewardLines, toast, tooltip } from '../components';
import { clear, h } from '../dom';
import { navigate, type Screen } from '../router';
import { topBar } from '../topbar';

const formatNumber = (n: number) => n.toLocaleString('fr-FR');

/** Icônes compactes d'une récompense de palier. */
function rewardIcons(reward: Reward): HTMLElement[] {
  const items: HTMLElement[] = [];
  for (const [currency, amount] of Object.entries(reward.currencies ?? {})) {
    items.push(
      h('div', { class: 'bp-item' }, currencyGem(currency as CurrencyId), h('b', null, formatNumber(amount ?? 0))),
    );
  }
  for (const [packId, count] of Object.entries(reward.packs ?? {})) {
    const pack = PACKS[packId];
    items.push(
      h(
        'div',
        { class: 'bp-item' },
        h('span', { class: 'bp-pack', style: `--pc:${pack?.color ?? '#888'};--pa:${pack?.accent ?? '#fff'}` }),
        h('span', null, `${packId === 'elite' ? 'Kage' : 'Shinobi'}${count > 1 ? ` ×${count}` : ''}`),
      ),
    );
  }
  for (const id of reward.cosmetics ?? []) {
    const def = COSMETICS_BY_ID[id];
    if (!def) continue;
    items.push(
      def.kind === 'frame'
        ? h(
            'div',
            { class: 'bp-item' },
            h('span', { class: 'bp-frame', style: `--f1:${def.colors![0]};--f2:${def.colors![1]}` }),
            h('span', null, 'Cadre'),
          )
        : h('div', { class: 'bp-item' }, h('span', { class: 'bp-title' }, 'TITRE')),
    );
  }
  return items;
}

export function passScreen(): Screen {
  const bar = topBar('Passe de combat', { back: () => navigate('home'), currencies: ['ryo', 'jade'] });
  const content = h('div');
  let firstRender = true;

  function claim(view: PassTierView, track: 'free' | 'premium', cell: HTMLElement): void {
    const result = game.claimPassTier(view.tier.level, track);
    if (!result.ok) return toast(result.error, 'error');
    audio.play('levelup');
    toast(`Palier ${view.tier.level} : ${rewardLines(result.reward).join(', ')}`, 'good');
    const currency = Object.keys(result.reward.currencies ?? {})[0] as CurrencyId | undefined;
    if (currency) void flyCurrency(cell, currency, 6);
    render();
  }

  async function buyPremium(): Promise<void> {
    const price = game.passView().season.battlePass.premiumPrice;
    const ok = await confirmDialog(
      'Passe premium',
      `Activer la voie premium pour ${price} Jade ? Les paliers déjà atteints deviennent récupérables tout de suite.`,
      'Activer',
    );
    if (!ok) return;
    const result = game.buyPremiumPass();
    if (!result.ok) {
      toast(
        result.error === 'Ressources insuffisantes' ? 'Pas assez de Jade (Boutique, missions, succès).' : result.error,
        'error',
      );
      return;
    }
    audio.play('reveal');
    toast('Passe premium activé !', 'good');
    render();
  }

  function cell(view: PassTierView, track: 'free' | 'premium', premiumOwned: boolean): HTMLElement {
    const reward = track === 'free' ? view.tier.free : view.tier.premium;
    const cls = track === 'free' ? 'free' : 'prem';
    if (!reward) return h('div', { class: `bp-cell ${cls} empty` });
    const claimed = track === 'free' ? view.freeClaimed : view.premiumClaimed;
    const accessible = track === 'free' || premiumOwned;
    const claimable = view.reached && accessible && !claimed;
    const el = h(
      'div',
      {
        class: `bp-cell ${cls} ${claimed ? 'claimed' : ''} ${claimable ? 'claimable' : ''} ${!view.reached || !accessible ? 'locked' : ''}`,
        tabindex: claimable ? 0 : undefined,
        role: claimable ? 'button' : undefined,
        'aria-label': `Palier ${view.tier.level} ${track === 'free' ? 'gratuit' : 'premium'} : ${rewardLines(reward).join(', ')}`,
      },
      ...rewardIcons(reward),
      accessible ? null : h('span', { class: 'lock' }, '🔒'),
    );
    tooltip(el, () =>
      [
        `<b>Palier ${view.tier.level} · ${track === 'free' ? 'Gratuit' : 'Premium'}</b>`,
        ...rewardLines(reward),
        claimed
          ? '✓ Récupéré'
          : claimable
            ? 'Cliquez pour récupérer'
            : view.reached
              ? 'Passe premium requis'
              : 'Palier pas encore atteint',
      ].join('<br>'),
    );
    if (claimable) {
      el.addEventListener('click', () => claim(view, track, el));
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') claim(view, track, el);
      });
    } else if (view.reached && !accessible) {
      el.addEventListener('click', () => void buyPremium());
    }
    return el;
  }

  function render(): void {
    const { season, level, xpInTier, xpPerTier, premium, tiers, claimable } = game.passView();
    const total = tiers.length;
    const xpBar = new Bar(level >= total ? 1 : xpInTier / xpPerTier, 'xp');
    const endDate = new Date(`${season.endDate}T12:00:00`).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
    });
    const track = h(
      'div',
      { class: 'bp-track' },
      h('div'),
      h('div', { class: 'bp-label' }, 'GRATUIT'),
      h('div', { class: 'bp-label prem' }, 'PREMIUM ★'),
    );
    let currentNum: HTMLElement | null = null;
    for (const view of tiers) {
      const isCurrent = view.tier.level === Math.min(total, level + 1);
      const num = h(
        'div',
        { class: `bp-num ${view.reached ? 'reached' : ''} ${isCurrent ? 'current' : ''}` },
        String(view.tier.level),
      );
      if (isCurrent) currentNum = num;
      track.append(num, cell(view, 'free', premium), cell(view, 'premium', premium));
    }
    clear(content);
    content.append(
      h(
        'div',
        { class: 'panel dark' },
        h('div', { class: 'px-font', style: 'color:var(--text-dim);margin-bottom:12px' }, season.name),
        h(
          'div',
          { class: 'bp-head' },
          h('div', { class: 'bp-lvl' }, `${level}`, h('small', null, `PALIER / ${total}`)),
          h(
            'div',
            { class: 'bp-xp' },
            xpBar.el,
            h(
              'div',
              { class: 'row' },
              h('span', null, level >= total ? 'Passe terminé !' : `${xpInTier} / ${xpPerTier} XP`),
              h('span', { class: 'dim' }, `Fin : ${endDate}`),
            ),
          ),
        ),
      ),
      h(
        'div',
        { class: 'bp-actions' },
        claimable
          ? button(
              `Tout récupérer (${claimable})`,
              () => {
                const rewards = game.claimAllPass();
                if (!rewards.length) return;
                audio.play('levelup');
                const s = rewards.length > 1 ? 's' : '';
                toast(`${rewards.length} récompense${s} récupérée${s} !`, 'good');
                render();
              },
              { variant: 'gold' },
            )
          : null,
        premium
          ? h('span', { class: 'bp-prem-on' }, '★ PREMIUM ACTIF')
          : button(`★ Premium · ${season.battlePass.premiumPrice} Jade`, () => void buyPremium(), { variant: 'blue' }),
      ),
      track,
      h(
        'div',
        { class: 'panel', style: 'margin-top:8px' },
        h('h3', null, 'Gagner de l’XP de passe'),
        h(
          'div',
          { class: 'bp-xp-list' },
          h('span', null, 'Victoire (arène, entraînement, PvP)'),
          h('b', null, `+${PASS_XP.win}`),
          h('span', null, 'Défaite'),
          h('b', null, `+${PASS_XP.loss}`),
          h('span', null, 'Mission quotidienne récupérée'),
          h('b', null, `+${PASS_XP.dailyMission}`),
          h('span', null, 'Mission hebdomadaire récupérée'),
          h('b', null, `+${PASS_XP.weeklyMission}`),
        ),
        h(
          'p',
          { class: 'dim', style: 'font-size:13px;margin:10px 0 0' },
          'La voie premium ajoute du Jade, des parchemins et des cosmétiques. Aucun shinobi n’y est réservé : tout se gagne en jouant.',
        ),
      ),
    );
    // À la première ouverture, centrer la piste sur le palier en cours.
    if (firstRender && currentNum) {
      firstRender = false;
      const target: HTMLElement = currentNum;
      setTimeout(() => {
        track.scrollLeft = Math.max(0, target.offsetLeft - track.clientWidth / 2 + target.clientWidth / 2);
      }, 60);
    }
  }

  render();
  return {
    el: h(
      'div',
      null,
      h('style', null, passCss),
      bar.el,
      h('div', { class: 'scroll' }, h('div', { class: 'narrow', style: 'max-width:760px' }, content)),
    ),
    destroy: bar.destroy,
  };
}
