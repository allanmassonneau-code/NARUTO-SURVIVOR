import type { Rarity } from '../../core/types';
import { STAGES } from '../../data/arenas';
import { PACKS } from '../../data/packs';
import { RARITIES, RARITY_ORDER } from '../../data/rarities';
import { ROSTER } from '../../data/shinobi';
import { analytics } from '../../services/analytics';
import { MockChannelProvider } from '../../services/channelPoints';
import { game } from '../../services/gameService';
import { button, confirmDialog, openModal, toast } from '../components';
import { h, type Child } from '../dom';
import { currentScreen, navigate } from '../router';

/** Menu développeur : monnaies, stream simulé, parchemins, raretés forcées, combats, graine RNG, reset. */
export function openDevMenu(): void {
  const debug = game.debug;
  const shinobiSelect: HTMLSelectElement = h(
    'select',
    { class: 'field' },
    ...ROSTER.map((s) => h('option', { value: s.id }, `${s.name} (${RARITIES[s.rarity].name})`)),
  );
  const raritySelect: HTMLSelectElement = h(
    'select',
    {
      class: 'field',
      onchange: () => {
        debug.forceRarity = (raritySelect.value || null) as Rarity | null;
        toast(`Rareté forcée : ${raritySelect.value || 'aucune'}`);
      },
    },
    h('option', { value: '' }, 'Aucune rareté forcée'),
    ...RARITY_ORDER.map((r) => h('option', { value: r, selected: debug.forceRarity === r }, RARITIES[r].name)),
  );
  const enemySelect: HTMLSelectElement = h(
    'select',
    { class: 'field', multiple: true, size: 4, style: 'min-height:90px' },
    ...ROSTER.map((s) => h('option', { value: s.id, selected: debug.enemyOverride?.includes(s.id) }, s.name)),
  );
  const seedInput: HTMLInputElement = h('input', {
    class: 'field',
    type: 'number',
    placeholder: 'Seed RNG (vide = aléatoire)',
    value: game.profile.settings.seedOverride ?? '',
  });
  const row = (...children: Child[]) => h('div', { class: 'row wrap-r', style: 'margin:8px 0' }, ...children);
  const linked = game.channel.current();

  const close = openModal(
    h(
      'div',
      null,
      h('h2', null, '🛠 Menu développeur'),
      h('h3', null, 'Monnaies'),
      row(
        button('+1000 Ryō', () => game.debugAdd('ryo', 1000), { size: 'small' }),
        button('+500 Jade', () => game.debugAdd('jade', 500), { size: 'small' }),
        button(
          '+1000 Points de chaîne',
          () => {
            game.debugAdd('chainPoints', 1000);
            toast('+1000 points de chaîne (simulation stream)');
          },
          { size: 'small', variant: 'blue' },
        ),
      ),
      h('h3', null, 'Stream (Twitch simulé)'),
      row(
        button(
          linked ? `Lié : ${linked.login}` : 'Lier un compte (simulation)',
          async () => {
            toast(`Compte lié : ${(await game.channel.link()).login}`, 'good');
          },
          { size: 'small', variant: 'dark' },
        ),
        ...['sc_points_small', 'sc_points_large'].map((rewardId) =>
          button(
            rewardId === 'sc_points_small' ? 'Échange 250 PC' : 'Échange 1000 PC',
            () => {
              if (!(game.channel instanceof MockChannelProvider) || !game.channel.current()) {
                return toast('Lie d’abord un compte.', 'error');
              }
              const before = game.profile.currencies.chainPoints;
              game.channel.simulate(rewardId);
              const gained = game.profile.currencies.chainPoints - before;
              toast(gained ? `+${gained} points de chaîne` : 'Plafond quotidien atteint', gained ? 'good' : 'error');
            },
            { size: 'small', variant: 'blue' },
          ),
        ),
      ),
      h('h3', null, 'Parchemins'),
      row(
        ...Object.keys(PACKS).map((packId) =>
          button(
            `+1 ${PACKS[packId].name}`,
            () => {
              game.debugGivePack(packId);
              toast('Parchemin ajouté');
            },
            { size: 'small' },
          ),
        ),
      ),
      row(raritySelect),
      row(
        button(
          debug.forceLegendary ? 'Légendaire forcée : ON' : 'Légendaire forcée : OFF',
          () => {
            debug.forceLegendary = !debug.forceLegendary;
            close();
            openDevMenu();
          },
          { size: 'small', variant: debug.forceLegendary ? 'gold' : 'dark' },
        ),
      ),
      h('h3', null, 'Shinobis'),
      row(
        shinobiSelect,
        button(
          'Donner',
          () => {
            game.debugGiveShinobi(shinobiSelect.value);
            toast('Shinobi ajouté');
          },
          { size: 'small' },
        ),
        button(
          'Tous',
          () => {
            ROSTER.forEach((s) => game.debugGiveShinobi(s.id));
            toast('Collection complète');
          },
          { size: 'small', variant: 'dark' },
        ),
        button(
          'Nv30 ★5',
          () => {
            game.debugMaxOut(shinobiSelect.value);
            toast('Shinobi niveau 30, éveillé ★5');
          },
          { size: 'small', variant: 'gold' },
        ),
      ),
      h('h3', null, 'Combat'),
      row(
        button(
          'Victoire instantanée',
          () => {
            const win = window.__battleWin;
            if (win && currentScreen() === 'battle') {
              close();
              win();
            } else {
              toast('Aucun combat en cours', 'error');
            }
          },
          { size: 'small', variant: 'primary' },
        ),
        button(
          'Débloquer toutes les arènes',
          () => {
            game.debugUnlockAll();
            toast('Arènes débloquées');
          },
          { size: 'small' },
        ),
      ),
      h('div', { class: 'dim', style: 'font-size:13px' }, 'Adversaire forcé (Ctrl/⌘ pour plusieurs, max 3) :'),
      row(
        enemySelect,
        button(
          'Appliquer',
          () => {
            const ids = [...enemySelect.selectedOptions].map((o) => o.value).slice(0, 3);
            debug.enemyOverride = ids.length ? ids : null;
            toast(ids.length ? `Adversaire : ${ids.join(', ')}` : 'Adversaire par défaut');
          },
          { size: 'small' },
        ),
      ),
      row(
        seedInput,
        button(
          'Seed',
          () => {
            const value = seedInput.value.trim();
            game.debugSetSeed(value === '' ? null : Number(value) >>> 0);
            toast(`Seed : ${value || 'aléatoire'}`);
          },
          { size: 'small' },
        ),
      ),
      h('h3', null, 'Divers'),
      row(
        button(
          'Tester un combat rapide',
          () => {
            close();
            const setup = game.prepareStageBattle(Object.keys(STAGES)[0]);
            if (setup) navigate('battle', { pending: setup, ai: 'normal' });
          },
          { size: 'small' },
        ),
        button(
          'Analytics (console)',
          () => console.table(analytics.buffer.map((r) => ({ event: r.event, props: JSON.stringify(r.props) }))),
          { size: 'small', variant: 'dark' },
        ),
      ),
      row(
        button(
          '⚠ Réinitialiser la sauvegarde',
          async () => {
            if (
              await confirmDialog(
                'Réinitialiser ?',
                'Effacer toute la progression ? Cette action est définitive.',
                'Effacer',
              )
            ) {
              await game.resetSave();
              close();
              navigate('onboarding', {}, { replace: true });
            }
          },
          { size: 'small', variant: 'primary' },
        ),
      ),
    ),
  );
}
