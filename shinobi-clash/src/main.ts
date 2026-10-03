import '@fontsource/pixelify-sans/400.css';
import '@fontsource/pixelify-sans/600.css';
import '@fontsource/press-start-2p/400.css';
import './styles/main.css';
import { audio } from './services/audio';
import { track } from './services/analytics';
import { game } from './services/gameService';
import type { SeasonSettlement } from './core/ranked';
import { button, openModal, rewardLines, toast } from './ui/components';
import { h } from './ui/dom';
import { navigate, registerScreen } from './ui/router';
import { arenasScreen } from './ui/screens/arenas';
import { battleScreen } from './ui/screens/battle';
import { collectionScreen } from './ui/screens/collection';
import { homeScreen } from './ui/screens/home';
import { missionsScreen } from './ui/screens/missions';
import { onboardingScreen } from './ui/screens/onboarding';
import { packsScreen } from './ui/screens/packs';
import { passScreen } from './ui/screens/pass';
import { profileScreen } from './ui/screens/profile';
import { rankingScreen } from './ui/screens/ranking';
import { applySettings, settingsScreen } from './ui/screens/settings';
import { shopScreen } from './ui/screens/shop';
import { teamScreen } from './ui/screens/team';

registerScreen('home', homeScreen);
registerScreen('onboarding', onboardingScreen);
registerScreen('arenas', arenasScreen);
registerScreen('battle', battleScreen);
registerScreen('collection', collectionScreen);
registerScreen('team', teamScreen);
registerScreen('packs', packsScreen);
registerScreen('shop', shopScreen);
registerScreen('missions', missionsScreen);
registerScreen('profile', profileScreen);
registerScreen('ranking', rankingScreen);
registerScreen('settings', settingsScreen);
registerScreen('pass', passScreen);

/** Bilan de fin de saison classée : ligue atteinte, récompenses, nouveau MMR de départ. */
function showSeasonEnd(s: SeasonSettlement): void {
  audio.play('levelup');
  const close = openModal(
    h(
      'div',
      { class: 'result' },
      h('div', { class: 'px-font', style: 'color:var(--text-dim)' }, `FIN DE SAISON — ${s.seasonName}`),
      h('div', { class: 'big win' }, s.league.toUpperCase()),
      h('div', null, s.reward ? rewardLines(s.reward).join(' · ') : 'Aucune récompense pour cette ligue.'),
      h(
        'div',
        { class: 'dim', style: 'font-size:14px;margin-top:8px' },
        `Classement remis à niveau : ${s.mmrBefore} → ${s.mmrAfter}. Le badge de saison est dans ton profil.`,
      ),
      h(
        'div',
        { class: 'actions' },
        button('Nouvelle saison !', () => close(), { variant: 'gold' }),
      ),
    ),
    { dark: true },
  );
}

async function boot(): Promise<void> {
  await game.load();
  applySettings(game.profile.settings);
  track('game_started', { returning: game.profile.tutorial.starterChosen });

  // L'audio ne peut démarrer qu'après un premier geste du joueur.
  const unlockAudio = () => {
    audio.unlock();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio);
  window.addEventListener('keydown', unlockAudio);

  // Sauvegarde immédiate quand l'onglet passe en arrière-plan ou se ferme.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void game.flush();
  });
  window.addEventListener('pagehide', () => void game.flush());

  game.onAchievement((achievement) => {
    audio.play('levelup');
    toast(`🏆 Succès débloqué : ${achievement.name}`, 'good');
  });

  navigate(game.profile.tutorial.starterChosen ? 'home' : 'onboarding');
  document.getElementById('boot')?.remove();
  if (game.seasonSettlement) showSeasonEnd(game.seasonSettlement);

  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    navigator.serviceWorker.register('./sw.js').catch(() => undefined);
  }
}

void boot();
