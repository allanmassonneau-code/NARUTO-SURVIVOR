import { ELEMENTS } from '../../data/elements';
import { getJutsu } from '../../data/jutsus';
import { PASSIVE_INFO } from '../../data/passiveInfo';
import { ROLES } from '../../data/roles';
import { getShinobi } from '../../data/shinobi';
import { STARTERS } from '../../data/starters';
import { spriteUrl } from '../../game/gfx/sprites';
import onboardingCss from '../../styles/screens/onboarding.css?inline';
import { audio } from '../../services/audio';
import { game } from '../../services/gameService';
import { button, elementChip, roleChip, toast } from '../components';
import { clear, h } from '../dom';
import { navigate, type Screen } from '../router';

/** Première expérience : un nom, un starter parmi trois philosophies, puis directement le duel tutoriel. */
export function onboardingScreen(): Screen {
  let chosen: string | null = null;
  const nameInput = h('input', { class: 'field', maxlength: 16, placeholder: 'Ton nom de ninja', value: '' });
  const starters = h('div', { class: 'starters' });
  const start = button(
    'Commencer mon aventure',
    () => {
      if (!chosen) {
        toast('Choisis ton premier shinobi !', 'error');
        return;
      }
      game.chooseStarter(chosen, nameInput.value);
      audio.play('levelup');
      const setup = game.prepareStageBattle('academy_1', true);
      if (setup) navigate('battle', { pending: setup, ai: 'easy', tutorial: true }, { replace: true });
    },
    { variant: 'primary', size: 'big', disabled: true },
  );

  function render(): void {
    clear(starters);
    for (const starter of STARTERS) {
      const def = getShinobi(starter.id);
      starters.appendChild(
        h(
          'div',
          {
            class: `panel starter ${chosen === starter.id ? 'sel' : ''}`,
            onclick: () => {
              chosen = starter.id;
              audio.play('reveal');
              start.disabled = false;
              render();
            },
          },
          h('div', { class: 'ph' }, starter.philosophy.toUpperCase()),
          h('img', { src: spriteUrl(starter.id), alt: def.name }),
          h('h2', null, def.name),
          h(
            'div',
            { class: 'row', style: 'justify-content:center;gap:6px' },
            ...def.elements.map((e) => elementChip(e)),
            roleChip(def.role),
          ),
          h('p', { style: 'font-size:15px;margin:8px 0' }, starter.blurb),
          h(
            'div',
            { class: 'px-font', style: 'font-size:8px;text-align:left' },
            `✦ ${PASSIVE_INFO[def.passive]?.name}`,
          ),
          h(
            'ul',
            null,
            ...def.jutsus.map((id) => {
              const jutsu = getJutsu(id);
              return h(
                'li',
                null,
                jutsu.name,
                h(
                  'span',
                  { style: `color:${ELEMENTS[jutsu.element].color};font-weight:bold` },
                  ` ${ELEMENTS[jutsu.element].kanji}`,
                ),
              );
            }),
          ),
          h('div', { class: 'dim', style: 'font-size:13px;margin-top:6px' }, ROLES[def.role].desc),
        ),
      );
    }
  }

  render();
  return {
    el: h(
      'div',
      null,
      h('style', null, onboardingCss),
      h('div', { class: 'topbar' }, h('h1', null, 'Académie Ninja')),
      h(
        'div',
        { class: 'scroll' },
        h(
          'div',
          { class: 'intro-scroll' },
          h(
            'div',
            { class: 'panel', style: 'margin-top:6px' },
            h('h2', null, 'Bienvenue, jeune ninja !'),
            h(
              'p',
              { style: 'margin:0;font-size:16px' },
              "Choisis ton premier shinobi. Tous les trois sont viables : c'est une question de style. Ensuite, un duel d'entraînement t'attend, puis ton premier parchemin.",
            ),
          ),
          h('div', { class: 'section-title' }, '1 · Ton nom'),
          nameInput,
          h('div', { class: 'section-title' }, '2 · Ton premier shinobi'),
          starters,
          h('div', { class: 'center', style: 'margin:10px 0 30px' }, start),
        ),
      ),
    ),
  };
}
