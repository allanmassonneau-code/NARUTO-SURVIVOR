import { listAchievements } from '../../core/achievements';
import { listMissions } from '../../core/missions';
import type { CurrencyId, Reward } from '../../core/types';
import { ACHIEVEMENT_CATEGORIES } from '../../data/achievements';
import { PASS_XP } from '../../data/seasons';
import missionsCss from '../../styles/screens/missions.css?inline';
import { audio } from '../../services/audio';
import { game } from '../../services/gameService';
import { Bar, button, flyCurrency, rewardLines, toast } from '../components';
import { clear, h } from '../dom';
import { navigate, type Screen, type ScreenParams } from '../router';
import { topBar } from '../topbar';

/** Feedback d'une récompense récupérée : son, message, gemmes qui volent vers le compteur. */
function celebrate(reward: Reward, from: HTMLElement): void {
  audio.play('levelup');
  toast(`Récompense : ${rewardLines(reward).join(', ')}`, 'good');
  const currency = Object.keys(reward.currencies ?? {})[0] as CurrencyId | undefined;
  if (currency) void flyCurrency(from, currency, 6);
}

export function missionsScreen(params: ScreenParams): Screen {
  const bar = topBar('Missions', { back: () => navigate('home') });
  let tab: 'missions' | 'achievements' = params.tab === 'achievements' ? 'achievements' : 'missions';
  const tabs = h('div', { class: 'seg', role: 'tablist' });
  const content = h('div');

  function renderTabs(): void {
    clear(tabs);
    const missionsReady = listMissions(game.profile).filter((m) => m.done && !m.claimed).length;
    const achievements = listAchievements(game.profile);
    const achievementsReady = achievements.filter((a) => a.unlocked && !a.claimed).length;
    const unlocked = achievements.filter((a) => a.unlocked).length;
    for (const [id, text] of [
      ['missions', `Missions${missionsReady ? ` (${missionsReady})` : ''}`],
      [
        'achievements',
        `Succès ${unlocked}/${achievements.length}${achievementsReady ? ` (${achievementsReady})` : ''}`,
      ],
    ] as const) {
      tabs.appendChild(
        h(
          'button',
          {
            class: tab === id ? 'on' : '',
            role: 'tab',
            'aria-selected': String(tab === id),
            onclick: () => {
              tab = id;
              audio.play('click');
              render();
            },
          },
          text,
        ),
      );
    }
  }

  function renderMissions(): void {
    for (const period of ['daily', 'weekly'] as const) {
      content.appendChild(
        h(
          'div',
          { class: 'section-title' },
          period === 'daily' ? 'Quotidiennes (réinitialisées chaque jour)' : 'Hebdomadaires',
        ),
      );
      const passXp = period === 'daily' ? PASS_XP.dailyMission : PASS_XP.weeklyMission;
      for (const mission of listMissions(game.profile).filter((m) => m.period === period)) {
        const progress = new Bar(mission.progress / mission.def.target, 'xp');
        const claim: HTMLButtonElement = button(
          mission.claimed ? 'Réclamé ✓' : 'Réclamer',
          () => {
            const result = game.claimMission(mission.def.id);
            if (!result.ok) return toast(result.error, 'error');
            celebrate(result.reward, claim);
            render();
          },
          {
            size: 'small',
            variant: mission.done && !mission.claimed ? 'gold' : 'dark',
            disabled: !mission.done || mission.claimed,
          },
        );
        content.appendChild(
          h(
            'div',
            { class: 'panel', style: 'margin-bottom:10px' },
            h(
              'div',
              { class: 'row' },
              h('b', { class: 'px-font', style: 'font-size:9px;flex:1' }, mission.def.name),
              claim,
            ),
            h(
              'div',
              { class: 'row', style: 'margin-top:8px' },
              h('div', { style: 'flex:1' }, progress.el),
              h('span', { style: 'font-size:14px' }, `${mission.progress}/${mission.def.target}`),
            ),
            h(
              'div',
              { class: 'dim', style: 'font-size:14px;margin-top:4px' },
              [...rewardLines(mission.def.reward), `+${passXp} XP de passe`].join(', '),
            ),
          ),
        );
      }
    }
  }

  function renderAchievements(): void {
    const all = listAchievements(game.profile);
    for (const [category, title] of Object.entries(ACHIEVEMENT_CATEGORIES)) {
      const list = all.filter((a) => a.def.category === category);
      if (!list.length) continue;
      content.appendChild(h('div', { class: 'section-title' }, title));
      content.appendChild(
        h(
          'div',
          { class: 'ach-grid' },
          ...list.map((a) => {
            const claimable = a.unlocked && !a.claimed;
            const action: HTMLElement | null = a.claimed
              ? h('span', { class: 'px-font', style: 'font-size:9px;color:#3a8a3a' }, '✓')
              : claimable
                ? button(
                    'Récupérer',
                    () => {
                      const result = game.claimAchievement(a.def.id);
                      if (!result.ok) return toast(result.error, 'error');
                      celebrate(result.reward, action!);
                      render();
                    },
                    { size: 'small', variant: 'gold' },
                  )
                : null;
            const progress = new Bar(a.progress / a.def.target, 'xp');
            return h(
              'div',
              { class: `panel ach ${a.unlocked ? 'unlocked' : ''} ${a.claimed ? 'claimed' : ''}` },
              h(
                'div',
                { class: 'ach-top' },
                h('span', { class: 'ach-ico', 'aria-hidden': 'true' }, '🏆'),
                h('h3', null, a.def.name),
                action,
              ),
              h('p', null, a.def.description),
              a.unlocked
                ? null
                : h('div', { class: 'ach-bar' }, h('div', null, progress.el), `${a.progress}/${a.def.target}`),
              h('p', { class: 'dim', style: 'font-size:13px' }, rewardLines(a.def.reward).join(', ')),
            );
          }),
        ),
      );
    }
  }

  function render(): void {
    renderTabs();
    clear(content);
    if (tab === 'missions') renderMissions();
    else renderAchievements();
  }

  render();
  return {
    el: h(
      'div',
      null,
      h('style', null, missionsCss),
      bar.el,
      h(
        'div',
        { class: 'scroll' },
        h('div', { class: 'narrow', style: 'max-width:820px' }, h('div', { class: 'center' }, tabs), content),
      ),
    ),
    destroy: bar.destroy,
  };
}
