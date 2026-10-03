import { playerXpToNext, type MatchRecord } from '../../core/profile';
import { ACHIEVEMENTS } from '../../data/achievements';
import { COSMETICS } from '../../data/cosmetics';
import { currentSeason } from '../../data/seasons';
import { getShinobi, ROSTER } from '../../data/shinobi';
import { portraitUrl } from '../../game/gfx/sprites';
import profileCss from '../../styles/screens/profile.css?inline';
import { audio } from '../../services/audio';
import { game } from '../../services/gameService';
import { avatarFrame, Bar, button, promptText, titleTag, toast } from '../components';
import { h, type Child } from '../dom';
import { navigate, type Screen } from '../router';
import { topBar } from '../topbar';

/** Où obtenir un cosmétique verrouillé (passe de combat ou succès). */
function cosmeticSource(id: string): string {
  const season = currentSeason(Date.now());
  for (const tier of season.battlePass.tiers) {
    if (tier.free?.cosmetics?.includes(id)) return `Passe de combat, palier ${tier.level}`;
    if (tier.premium?.cosmetics?.includes(id)) return `Passe de combat premium, palier ${tier.level}`;
  }
  const achievement = ACHIEVEMENTS.find((a) => a.reward.cosmetics?.includes(id));
  return achievement ? `Succès « ${achievement.name} »` : 'Bientôt';
}

function appearancePanel(refresh: () => void): HTMLDivElement {
  const profile = game.profile;
  const option = (on: boolean, locked: boolean, text: string, icon: Child, apply: () => void, source = '') =>
    h(
      'button',
      {
        class: `look-opt ${on ? 'on' : ''} ${locked ? 'locked' : ''}`,
        'aria-pressed': String(on),
        title: locked ? `Verrouillé : ${source}` : text,
        onclick: () => {
          if (locked) return toast(`Verrouillé. À obtenir : ${source}`, 'error');
          audio.play('click');
          apply();
          refresh();
        },
      },
      icon,
      text,
    );
  const portraits = ROSTER.filter((s) => profile.collection[s.id]).map((s) =>
    option(profile.avatar === s.id, false, s.name, h('img', { src: portraitUrl(s.id), alt: '' }), () =>
      game.setAvatar(s.id),
    ),
  );
  const frames = [
    option(!profile.cosmetics.frame, false, 'Aucun', null, () => game.equipCosmetic('frame', null)),
    ...COSMETICS.filter((c) => c.kind === 'frame').map((c) =>
      option(
        profile.cosmetics.frame === c.id,
        !profile.cosmetics.owned.includes(c.id),
        c.name.replace('Cadre ', ''),
        h('span', { class: 'look-swatch', style: `--f1:${c.colors![0]};--f2:${c.colors![1]}` }),
        () => game.equipCosmetic('frame', c.id),
        cosmeticSource(c.id),
      ),
    ),
  ];
  const titles = [
    option(!profile.cosmetics.title, false, 'Aucun', null, () => game.equipCosmetic('title', null)),
    ...COSMETICS.filter((c) => c.kind === 'title').map((c) =>
      option(
        profile.cosmetics.title === c.id,
        !profile.cosmetics.owned.includes(c.id),
        c.name,
        null,
        () => game.equipCosmetic('title', c.id),
        cosmeticSource(c.id),
      ),
    ),
  ];
  return h(
    'div',
    { class: 'panel' },
    h('h3', null, 'Portrait'),
    h('div', { class: 'look-row' }, ...portraits),
    h('h3', { style: 'margin-top:14px' }, 'Cadre'),
    h('div', { class: 'look-row' }, ...frames),
    h('h3', { style: 'margin-top:14px' }, 'Titre'),
    h('div', { class: 'look-row' }, ...titles),
    h(
      'p',
      { class: 'dim', style: 'font-size:13px;margin:12px 0 0' },
      'Cadres et titres se gagnent avec le passe de combat et les succès. Purement cosmétiques.',
    ),
  );
}

function matchRow(match: MatchRecord): HTMLDivElement {
  const resultColor = match.result === 'win' ? '#2a7a2a' : match.result === 'loss' ? '#a03030' : '#6a6a6a';
  const mode = match.training
    ? 'Entraînement'
    : match.mode === 'pve'
      ? 'PvE'
      : match.mode === 'ranked'
        ? 'Classé'
        : 'Amical';
  const mini = (defId: string) =>
    h('img', { src: portraitUrl(defId), width: 28, height: 26, title: getShinobi(defId).name });
  return h(
    'div',
    { class: 'panel', style: 'margin-bottom:8px;padding:10px' },
    h(
      'div',
      { class: 'row' },
      h(
        'b',
        { class: 'px-font', style: `font-size:9px;color:${resultColor}` },
        match.result === 'win' ? 'VICTOIRE' : match.result === 'loss' ? 'DÉFAITE' : 'NUL',
      ),
      h('span', { style: 'font-size:14px' }, `vs ${match.opponent}`),
      h('span', { class: 'spacer' }),
      h(
        'span',
        { class: 'dim', style: 'font-size:12px' },
        new Date(match.date).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }),
      ),
    ),
    h(
      'div',
      { class: 'row', style: 'margin-top:6px;gap:3px' },
      ...match.team.map(mini),
      h('span', { style: 'margin:0 8px' }, 'vs'),
      ...match.enemyTeam.map(mini),
      h('span', { class: 'spacer' }),
      h(
        'span',
        { class: 'dim', style: 'font-size:12px' },
        `${mode} · ${match.turns} tours${match.mmrDelta ? ` · ${match.mmrDelta > 0 ? '+' : ''}${match.mmrDelta}` : ''}`,
      ),
    ),
    match.replay
      ? h(
          'div',
          { style: 'margin-top:8px;text-align:right' },
          button('▶ Revoir', () => navigate('battle', { replay: { match } }), { size: 'small', variant: 'blue' }),
        )
      : null,
  );
}

export function profileScreen(): Screen {
  const profile = game.profile;
  const bar = topBar('Profil', { back: () => navigate('home') });
  const xpBar = new Bar(profile.xp / playerXpToNext(profile.level), 'xp');
  const owned = Object.keys(profile.collection).length;
  const refresh = () => navigate('profile', {}, { replace: true });
  const history = profile.matchHistory.length
    ? profile.matchHistory.map(matchRow)
    : [h('div', { class: 'dim' }, 'Aucun combat pour le moment.')];

  return {
    el: h(
      'div',
      null,
      h('style', null, profileCss),
      bar.el,
      h(
        'div',
        { class: 'scroll' },
        h(
          'div',
          { class: 'narrow' },
          h(
            'div',
            { class: 'panel' },
            h(
              'div',
              { class: 'row' },
              avatarFrame(profile.avatar, profile.cosmetics.frame, 'big'),
              h(
                'div',
                { style: 'flex:1;min-width:0' },
                h(
                  'div',
                  { class: 'row' },
                  h('h2', { style: 'margin:0' }, profile.username),
                  button(
                    '✎',
                    () => {
                      void promptText('Ton nom de ninja', profile.username).then((name) => {
                        if (!name) return;
                        game.rename(name);
                        refresh();
                      });
                    },
                    { size: 'small', variant: 'dark', title: 'Changer de nom' },
                  ),
                ),
                titleTag(profile.cosmetics.title),
                h('div', { class: 'px-font', style: 'margin-top:6px' }, `Niveau ${profile.level}`),
                xpBar.el,
              ),
            ),
            h(
              'div',
              { style: 'margin-top:10px;font-size:15px' },
              `Combats : ${profile.lifetime.battles} · Victoires : ${profile.lifetime.wins} · Collection : ${owned}/${ROSTER.length} · Parchemins ouverts : ${profile.totalPacksOpened} · Légendaires : ${profile.lifetime.legendaries} · Succès : ${profile.achievements.length}/${ACHIEVEMENTS.length}`,
            ),
          ),
          h('div', { class: 'section-title' }, 'Apparence'),
          appearancePanel(refresh),
          h('div', { class: 'section-title' }, 'Historique des combats'),
          ...history,
        ),
      ),
    ),
    destroy: bar.destroy,
  };
}
