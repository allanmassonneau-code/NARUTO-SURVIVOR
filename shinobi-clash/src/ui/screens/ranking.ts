import { LEAGUES, leagueFor } from '../../data/leagues';
import { currentSeason } from '../../data/seasons';
import { getShinobi } from '../../data/shinobi';
import { portraitUrl } from '../../game/gfx/sprites';
import type { LeaderboardEntry, PvpMode } from '../../net/protocol';
import { pvp, type ConnectionStatus } from '../../net/pvpClient';
import rankingCss from '../../styles/screens/ranking.css?inline';
import { audio } from '../../services/audio';
import { game } from '../../services/gameService';
import { button, toast } from '../components';
import { clear, h } from '../dom';
import { navigate, type Screen, type ScreenParams } from '../router';
import { topBar } from '../topbar';

const STATUS_LABELS: Record<ConnectionStatus, string> = {
  offline: 'Hors ligne',
  connecting: 'Connexion…',
  online: 'Connecté au serveur',
  reconnecting: 'Reconnexion…',
};

const leagueChip = (mmr: number) => {
  const league = leagueFor(mmr);
  return h(
    'span',
    { class: 'chip', style: { background: league.color, color: '#1a1420', textShadow: 'none' } },
    league.name,
  );
};

export function rankingScreen(params: ScreenParams): Screen {
  const bar = topBar('Arène PvP', { back: () => navigate('home') });
  let mode: PvpMode = (params.autoQueue as PvpMode | undefined) ?? 'casual';
  let queueStart = 0;
  let queueTimer: number | null = null;
  let queued = false;

  const server = h('div', { class: 'srv' });
  const renderStatus = (status: ConnectionStatus) => {
    clear(server);
    server.append(h('span', { class: `dot ${status}` }), STATUS_LABELS[status]);
  };
  renderStatus(pvp.status);

  const modes = h('div', { class: 'pvp-modes' });
  const renderModes = () => {
    clear(modes);
    for (const [id, title, text] of [
      ['casual', 'Amical', 'Sans enjeu. Un adversaire IA vous rejoint si personne n’est trouvé.'],
      ['ranked', 'Classé', 'MMR et ligues. Niveaux normalisés à 30, étoiles ≤ ★3, sans objets.'],
    ] as const) {
      modes.appendChild(
        h(
          'div',
          {
            class: `panel pvp-mode ${mode === id ? 'sel' : ''}`,
            onclick: () => {
              mode = id;
              audio.play('click');
              renderModes();
            },
          },
          h('h3', null, title),
          h('p', null, text),
        ),
      );
    }
  };
  renderModes();

  const team = game.playerTeamSpec();
  const teamPanel = h(
    'div',
    { class: 'panel dark' },
    h(
      'div',
      { class: 'row' },
      h('span', { class: 'px-font', style: 'flex:1' }, `Équipe : ${game.profile.teams[game.profile.activeTeam]?.name}`),
      button('Modifier', () => navigate('team'), { size: 'small' }),
    ),
    h(
      'div',
      { class: 'team-mini', style: 'margin-top:8px' },
      ...(team?.units ?? []).map((m) =>
        h('img', { src: portraitUrl(m.defId), title: `${getShinobi(m.defId).name} Nv${m.level}` }),
      ),
      team ? null : h('span', { class: 'dim' }, 'Équipe vide !'),
    ),
  );

  const actions = h('div', { class: 'center', style: 'margin:14px 0' });
  const showIdle = () => {
    stopQueueTimer();
    clear(actions);
    actions.append(
      button('⚔ Chercher un adversaire', () => void startQueue(), { variant: 'primary', size: 'big' }),
      h('div', { style: 'margin-top:10px' }, button('Entraînement contre l’IA', startTraining, { variant: 'blue' })),
      h(
        'div',
        { class: 'dim', style: 'font-size:13px;margin-top:6px' },
        'Hors ligne : une équipe rivale jouée par l’IA difficile, avec les règles du mode choisi. Sans MMR.',
      ),
    );
  };

  function startTraining(): void {
    const setup = game.prepareTraining(mode);
    if (!setup) {
      toast('Ton équipe est vide.', 'error');
      return;
    }
    navigate('battle', { pending: setup, ai: 'hard' });
  }

  const showSearching = () => {
    clear(actions);
    const spin = h('div', { class: 'spin' }, 'Recherche… 0 s');
    actions.appendChild(
      h(
        'div',
        { class: 'panel dark queue-box' },
        h('div', null, mode === 'ranked' ? 'Recherche en Classé' : 'Recherche en Amical'),
        spin,
        h('div', { class: 'dim', style: 'font-size:13px' }, 'La fenêtre de MMR s’élargit avec l’attente.'),
        h(
          'div',
          { style: 'margin-top:10px' },
          button('Annuler', cancelQueue, { size: 'small', variant: 'dark', sfx: 'back' }),
        ),
      ),
    );
    queueStart = Date.now();
    queueTimer = window.setInterval(
      () => (spin.textContent = `Recherche… ${Math.floor((Date.now() - queueStart) / 1000)} s`),
      250,
    );
  };

  function stopQueueTimer(): void {
    if (queueTimer) window.clearInterval(queueTimer);
    queueTimer = null;
  }

  async function startQueue(): Promise<void> {
    const spec = game.playerTeamSpec();
    if (!spec) {
      toast('Ton équipe est vide.', 'error');
      return;
    }
    try {
      await pvp.connect(
        game.profile.username,
        spec.units.map((m) => ({ defId: m.defId, level: m.level, stars: m.stars })),
      );
    } catch {
      toast('Serveur PvP injoignable. Entraîne-toi contre l’IA en attendant !', 'error');
      showIdle();
      return;
    }
    queued = true;
    pvp.send({ t: 'queue', mode });
    showSearching();
  }

  function cancelQueue(): void {
    if (queued) pvp.send({ t: 'cancelQueue' });
    queued = false;
    showIdle();
  }

  const unsubscribe = pvp.on((m) => {
    if (m.t === 'matchFound') {
      queued = false;
      stopQueueTimer();
      audio.play('reveal');
      navigate('battle', { online: { found: m } });
    } else if (m.t === 'error') {
      toast(m.message, 'error');
    }
  });
  const unsubscribeStatus = pvp.onStatus(renderStatus);

  const profile = game.profile;
  const league = leagueFor(profile.rank.mmr);
  const leaderboard = h('div', { class: 'panel' });
  const renderLeaderboard = (entries: LeaderboardEntry[] | null) => {
    clear(leaderboard);
    leaderboard.appendChild(h('h3', null, 'Classement du serveur'));
    if (!entries) {
      leaderboard.appendChild(
        h('div', { class: 'dim', style: 'font-size:14px' }, 'Serveur hors ligne : classement indisponible.'),
      );
    } else if (!entries.length) {
      leaderboard.appendChild(
        h('div', { class: 'dim', style: 'font-size:14px' }, 'Aucun match classé pour le moment. Sois le premier !'),
      );
    } else {
      leaderboard.appendChild(
        h(
          'table',
          { class: 'lb' },
          ...entries.map((entry, i) =>
            h(
              'tr',
              null,
              h('td', { class: 'px-font', style: 'font-size:9px' }, `#${i + 1}`),
              h('td', null, entry.name),
              h('td', null, leagueChip(entry.mmr)),
              h('td', { style: 'text-align:right' }, `${entry.wins} V · ${entry.losses} D`),
            ),
          ),
        ),
      );
    }
  };
  const loadLeaderboard = () => {
    clear(leaderboard);
    leaderboard.append(h('h3', null, 'Classement du serveur'), h('div', { class: 'dim' }, 'Chargement…'));
    void pvp.leaderboard().then(renderLeaderboard);
  };
  // Hors connexion, on n'interroge le serveur qu'à la demande (pas de requête vouée à l'échec à chaque visite).
  if (pvp.status === 'online') loadLeaderboard();
  else {
    leaderboard.append(
      h('h3', null, 'Classement du serveur'),
      button('Afficher le classement', loadLeaderboard, { size: 'small', variant: 'dark' }),
    );
  }

  const season = currentSeason(Date.now());
  const pass = game.passView();
  const el = h(
    'div',
    null,
    h('style', null, rankingCss),
    bar.el,
    h(
      'div',
      { class: 'scroll' },
      h(
        'div',
        { class: 'narrow', style: 'max-width:680px' },
        h(
          'div',
          { class: 'panel dark center' },
          h('div', { class: 'px-font', style: 'color:var(--text-dim)' }, season.name),
          h(
            'div',
            {
              style: `font-family:var(--font-pixel);font-size:22px;margin:14px 0;color:${league.color};text-shadow:3px 3px 0 #000`,
            },
            league.name,
          ),
          h('div', { style: 'font-size:15px' }, `${profile.rank.wins} V · ${profile.rank.losses} D en classé`),
        ),
        h('div', { style: 'margin-top:12px' }, server),
        modes,
        teamPanel,
        actions,
        leaderboard,
        h('div', { class: 'section-title' }, 'Ligues'),
        h(
          'div',
          { class: 'panel' },
          h(
            'div',
            { class: 'row wrap-r' },
            ...LEAGUES.map((l) =>
              h(
                'span',
                { class: 'chip', style: { background: l.color, color: '#1a1420', textShadow: 'none' } },
                l.name,
              ),
            ),
          ),
          h(
            'p',
            { style: 'font-size:14px;margin:10px 0 0' },
            'Fin de saison : récompenses selon la ligue atteinte, puis remise à niveau partielle du classement.',
          ),
        ),
        h('div', { class: 'section-title' }, 'Passe de combat'),
        h(
          'div',
          { class: 'panel row' },
          h(
            'div',
            { style: 'flex:1;font-size:15px' },
            `Palier ${pass.level} / ${pass.tiers.length}`,
            pass.claimable ? h('b', { style: 'color:var(--red-dark)' }, ` · ${pass.claimable} à récupérer`) : null,
            h(
              'div',
              { class: 'dim', style: 'font-size:13px' },
              'Chaque combat, classé ou non, fait progresser le passe.',
            ),
          ),
          button('Voir', () => navigate('pass'), { size: 'small', variant: 'gold' }),
        ),
      ),
    ),
  );
  showIdle();
  if (params.autoQueue) void startQueue();
  return {
    el,
    destroy: () => {
      bar.destroy();
      unsubscribe();
      unsubscribeStatus();
      stopQueueTimer();
      if (queued) pvp.send({ t: 'cancelQueue' });
    },
  };
}
