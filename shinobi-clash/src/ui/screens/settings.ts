import type { Settings } from '../../core/profile';
import { audio } from '../../services/audio';
import { game } from '../../services/gameService';
import { button } from '../components';
import { h } from '../dom';
import { navigate, type Screen } from '../router';
import { topBar } from '../topbar';

/** Applique les réglages qui touchent tout le document : volumes et classes d'accessibilité. */
export function applySettings(settings: Settings): void {
  audio.setVolumes(settings.sfxVolume, settings.musicVolume);
  document.body.classList.toggle('reduce-motion', settings.reduceMotion);
  document.body.classList.toggle('large-text', settings.largeText);
  document.body.classList.toggle('colorblind', settings.colorblind);
}

type BooleanSetting = 'vibration' | 'reduceShake' | 'reduceMotion' | 'colorblind' | 'largeText';

export function settingsScreen(): Screen {
  const bar = topBar('Paramètres', { back: () => navigate('home'), currencies: false });
  const settings = game.profile.settings;
  const update = (patch: Partial<Settings>) => {
    game.updateSettings(patch);
    applySettings(game.profile.settings);
  };
  const slider = (text: string, key: 'musicVolume' | 'sfxVolume') => {
    const input: HTMLInputElement = h('input', {
      type: 'range',
      min: 0,
      max: 1,
      step: 0.05,
      value: String(settings[key]),
      style: 'flex:1;accent-color:var(--red)',
      oninput: () => update({ [key]: Number(input.value) }),
      onchange: () => audio.play('click'),
    });
    return h('div', { class: 'row', style: 'margin:10px 0' }, h('span', { style: 'min-width:130px' }, text), input);
  };
  const toggle = (text: string, key: BooleanSetting) => {
    const btn: HTMLButtonElement = button(
      settings[key] ? 'OUI' : 'NON',
      () => {
        update({ [key]: !game.profile.settings[key] });
        btn.textContent = game.profile.settings[key] ? 'OUI' : 'NON';
      },
      { size: 'small', variant: 'dark' },
    );
    return h('div', { class: 'row', style: 'margin:10px 0' }, h('span', { style: 'flex:1' }, text), btn);
  };
  const speedRow = h(
    'div',
    { class: 'row', style: 'margin:10px 0' },
    h('span', { style: 'flex:1' }, 'Vitesse de combat'),
  );
  const renderSpeeds = () => {
    speedRow.querySelectorAll('button').forEach((b) => b.remove());
    for (const value of [1, 1.5, 2]) {
      speedRow.appendChild(
        button(
          `×${value}`,
          () => {
            update({ battleSpeed: value });
            renderSpeeds();
          },
          { size: 'small', variant: game.profile.settings.battleSpeed === value ? 'gold' : 'dark' },
        ),
      );
    }
  };
  renderSpeeds();

  return {
    el: h(
      'div',
      null,
      bar.el,
      h(
        'div',
        { class: 'scroll' },
        h(
          'div',
          { class: 'narrow panel' },
          h('h2', null, 'Audio'),
          slider('Musique', 'musicVolume'),
          slider('Effets sonores', 'sfxVolume'),
          h('h2', { style: 'margin-top:16px' }, 'Confort'),
          speedRow,
          toggle('Vibrations', 'vibration'),
          toggle('Réduire les secousses', 'reduceShake'),
          toggle('Réduire les animations', 'reduceMotion'),
          toggle('Mode daltonien', 'colorblind'),
          toggle('Texte agrandi', 'largeText'),
          h(
            'div',
            { class: 'dim', style: 'font-size:13px;margin-top:12px' },
            `Sauvegarde locale automatique. Version de sauvegarde : ${game.profile.saveVersion}`,
          ),
          h(
            'div',
            { class: 'dim', style: 'font-size:13px;margin-top:6px' },
            'Projet de fan non officiel, sans lien avec les ayants droit. Sprites, musiques et sons sont générés par le code du jeu.',
          ),
        ),
      ),
    ),
    destroy: bar.destroy,
  };
}
