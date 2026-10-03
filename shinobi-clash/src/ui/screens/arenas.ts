import { activeTeamMembers } from '../../core/profile';
import { isStageUnlocked } from '../../core/records';
import type { AiLevel } from '../../core/types';
import { ARENAS } from '../../data/arenas';
import { getShinobi } from '../../data/shinobi';
import { portraitUrl } from '../../game/gfx/sprites';
import { audio } from '../../services/audio';
import { game } from '../../services/gameService';
import { rewardLines, toast } from '../components';
import { clear, h } from '../dom';
import { navigate, type Screen } from '../router';

const MAP_W = 240;
const MAP_H = 160;

/** Position des arènes sur la carte (pixels de la carte 240×160). */
const MAP_MARKERS: Record<string, { x: number; y: number }> = {
  academy: { x: 76, y: 98 },
  forest: { x: 46, y: 80 },
  exam: { x: 112, y: 84 },
  desert: { x: 28, y: 112 },
  valley: { x: 88, y: 40 },
  wave: { x: 124, y: 112 },
  akatsuki: { x: 122, y: 24 },
};

export const AI_LABELS: Record<AiLevel, [string, string]> = {
  easy: ['Facile', '#58a048'],
  normal: ['Normal', '#c89a20'],
  hard: ['Difficile', '#c8403a'],
};

/** Carte du monde dessinée pixel par pixel : océan tramé, îles, désert, forêt, montagnes, rivière, pont. */
function drawWorldMap(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = MAP_W;
  canvas.height = MAP_H;
  const ctx = canvas.getContext('2d')!;
  const rect = (x: number, y: number, w: number, hgt: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, hgt);
  };
  const blob = (cx: number, cy: number, rx: number, ry: number, color: string) => {
    ctx.fillStyle = color;
    for (let dy = -ry; dy <= ry; dy++) {
      const half = Math.round(rx * Math.sqrt(1 - (dy / ry) ** 2));
      ctx.fillRect(Math.round(cx - half), Math.round(cy + dy), half * 2, 1);
    }
  };
  for (let y = 0; y < MAP_H; y++) rect(0, y, MAP_W, 1, y % 2 ? '#4a8ed6' : '#4f94dc');
  for (let i = 0; i < 40; i++) rect((i * 67) % MAP_W, (i * 41) % MAP_H, 3, 1, '#8cc4f4');
  const islands = [
    [70, 80, 74, 66],
    [40, 120, 46, 36],
    [120, 60, 58, 46],
    [118, 116, 40, 26],
    [150, 34, 34, 26],
  ];
  for (const [x, y, rx, ry] of islands) blob(x, y, rx + 2, ry + 2, '#3a6a3a');
  for (const [x, y, rx, ry] of islands) blob(x, y, rx, ry, '#7ec468');
  for (let i = 0; i < 90; i++) {
    const x = (i * 53) % 190;
    const y = 18 + ((i * 37) % 130);
    const px = ctx.getImageData(x, y, 1, 1).data;
    if (px[1] > 180 && px[2] < 140) rect(x, y, 2, 1, '#6ab45a');
  }
  blob(28, 114, 30, 20, '#d8b870');
  blob(28, 114, 27, 17, '#ecd292');
  for (let i = 0; i < 6; i++) rect(12 + i * 8, 108 + (i % 3) * 6, 4, 1, '#d4b474');
  for (let i = 0; i < 16; i++) {
    const x = 26 + (i % 6) * 8;
    const y = 66 + Math.floor(i / 6) * 9;
    ctx.fillStyle = i % 2 ? '#2e6a34' : '#3a7a3c';
    ctx.beginPath();
    ctx.moveTo(x - 4, y + 7);
    ctx.lineTo(x, y - 2);
    ctx.lineTo(x + 4, y + 7);
    ctx.fill();
  }
  for (let i = 0; i < 9; i++) {
    const x = 104 + i * 9;
    const y = 18 + (i % 2) * 6;
    ctx.fillStyle = '#8a7a6a';
    ctx.beginPath();
    ctx.moveTo(x - 8, y + 14);
    ctx.lineTo(x, y);
    ctx.lineTo(x + 8, y + 14);
    ctx.fill();
    rect(x - 1, y + 1, 2, 3, '#f0f0f0');
  }
  ctx.fillStyle = '#5aa0e8';
  let riverX = 86;
  for (let y = 22; y < 70; y++) {
    riverX += Math.sin(y / 6) * 0.6;
    ctx.fillRect(Math.round(riverX), y, 3, 1);
  }
  for (let x = 88; x < 178; x++) ctx.fillRect(x, Math.round(70 + Math.sin(x / 9) * 3), 3, 1);
  blob(176, 120, 22, 12, '#3a6a3a');
  blob(176, 120, 20, 10, '#7ec468');
  for (let x = 132; x < 156; x++) rect(x, 114, 1, 2, x % 3 ? '#a07848' : '#7a5838');
  return canvas;
}

export function arenasScreen(): Screen {
  const profile = game.profile;
  const team = activeTeamMembers(profile);
  const nextStage = ARENAS.flatMap((a) => a.stages).find(
    (s) => isStageUnlocked(profile, s.id) && !(profile.pve.cleared[s.id] ?? 0),
  );
  let arenaIndex = Math.max(
    0,
    ARENAS.findIndex((a) => a.stages.some((s) => s.id === nextStage?.id)),
  );
  let stageIndex = 0;
  const arenaUnlocked = (index: number) => isStageUnlocked(profile, ARENAS[index].stages[0].id);
  const arenaCleared = (index: number) => ARENAS[index].stages.every((s) => (profile.pve.cleared[s.id] ?? 0) > 0);

  const markers = ARENAS.map((arena, i) => {
    const pos = MAP_MARKERS[arena.id] ?? { x: 20 + i * 20, y: 80 };
    return h(
      'button',
      {
        class: `map-marker ${arenaUnlocked(i) ? '' : 'locked'} ${arenaCleared(i) ? 'cleared' : ''}`,
        style: { left: `${(pos.x / MAP_W) * 100}%`, top: `${(pos.y / MAP_H) * 100}%` },
        title: arena.name,
        onclick: () => selectArena(i, true),
      },
      h('span', { class: 'pin' }),
      h('span', { class: 'lbl' }, arena.name),
    );
  });
  const head = h('div', { class: 'map-head' });
  const list = h('div', { class: 'menu-grid list' });
  const desc = h('div', { class: 'home-desc map-desc' });
  let stageButtons: HTMLButtonElement[] = [];

  function startStage(stageId: string): void {
    if (team.length === 0) {
      toast("Ton équipe est vide ! Ajoute des shinobis dans l'écran Équipe.", 'error');
      return;
    }
    const stage = ARENAS.flatMap((a) => a.stages).find((s) => s.id === stageId)!;
    // Le tout premier combat sert de tutoriel, en 1 contre 1 avec le starter.
    const tutorial = stage.id === 'academy_1' && !game.profile.tutorial.done;
    const setup = game.prepareStageBattle(stage.id, tutorial);
    if (setup) navigate('battle', { pending: setup, ai: stage.ai, tutorial });
  }

  function selectStage(index: number, withSound = true): void {
    const stage = ARENAS[arenaIndex].stages[index];
    if (!stage) return;
    if (withSound && index !== stageIndex) audio.play('hover');
    stageIndex = index;
    stageButtons.forEach((btn, i) => btn.classList.toggle('cur', i === index));
    const unlocked = isStageUnlocked(profile, stage.id);
    const cleared = (profile.pve.cleared[stage.id] ?? 0) > 0;
    clear(desc);
    desc.append(
      unlocked
        ? cleared
          ? `Déjà gagné. Rejouer rapporte ${rewardLines(stage.reward).join(', ')}.`
          : `Première victoire : ${rewardLines(stage.firstClear).join(', ')}.`
        : 'Verrouillé : remporte d’abord le combat précédent.',
    );
  }

  function selectArena(index: number, withSound = false): void {
    if (withSound && index !== arenaIndex) audio.play('click');
    arenaIndex = index;
    const arena = ARENAS[index];
    markers.forEach((m, i) => m.classList.toggle('cur', i === index));
    clear(head);
    head.append(h('div', { class: 'an' }, arena.name), h('div', { class: 'as' }, arena.subtitle));
    stageButtons = arena.stages.map((stage, i) => {
      const unlocked = isStageUnlocked(profile, stage.id);
      const cleared = (profile.pve.cleared[stage.id] ?? 0) > 0;
      const [aiLabel, aiColor] = AI_LABELS[stage.ai];
      const level = Math.max(...stage.enemy.map((m) => m.level));
      return h(
        'button',
        {
          class: `mitem stage-item ${cleared ? 'cleared' : ''}`,
          disabled: !unlocked,
          onpointerenter: () => selectStage(i, false),
          onclick: () => {
            audio.play('click');
            startStage(stage.id);
          },
        },
        h(
          'div',
          { class: 'st' },
          h(
            'div',
            { class: 'sn' },
            h('span', { class: 'jname' }, stage.name),
            cleared ? h('span', { class: 'ok' }, '✓') : unlocked ? null : h('span', { class: 'ok' }, '🔒'),
          ),
          h(
            'div',
            { class: 'sm' },
            h('span', { class: 'ai-tag', style: { background: aiColor } }, aiLabel),
            h('span', null, `Nv ${level}`),
            h(
              'span',
              { class: 'foes' },
              ...stage.enemy.map((m) =>
                h('img', { src: portraitUrl(m.defId), alt: '', title: `${getShinobi(m.defId).name} Nv${m.level}` }),
              ),
            ),
          ),
        ),
      );
    });
    clear(list);
    list.append(...stageButtons);
    const firstOpen = arena.stages.findIndex(
      (s) => isStageUnlocked(profile, s.id) && !(profile.pve.cleared[s.id] ?? 0),
    );
    selectStage(firstOpen >= 0 ? firstOpen : 0, false);
  }

  const onKey = (e: KeyboardEvent) => {
    if (document.querySelector('.modal-backdrop')) return;
    const arena = ARENAS[arenaIndex];
    if (e.key === 'ArrowRight' || e.key === 'PageDown') selectArena((arenaIndex + 1) % ARENAS.length, true);
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp')
      selectArena((arenaIndex - 1 + ARENAS.length) % ARENAS.length, true);
    else if (e.key === 'ArrowDown') selectStage(Math.min(arena.stages.length - 1, stageIndex + 1));
    else if (e.key === 'ArrowUp') selectStage(Math.max(0, stageIndex - 1));
    else if (e.key === 'Enter' || e.key === ' ' || e.key.toLowerCase() === 'z') {
      const btn = stageButtons[stageIndex];
      if (btn?.disabled) audio.play('error');
      else btn?.click();
    } else if (e.key === 'Escape' || e.key === 'Backspace' || e.key.toLowerCase() === 'x') {
      audio.play('back');
      navigate('home');
    } else return;
    e.preventDefault();
  };
  document.addEventListener('keydown', onKey);

  const teamCard = h(
    'button',
    {
      class: 'home-card map-team',
      title: 'Modifier l’équipe',
      onclick: () => {
        audio.play('click');
        navigate('team');
      },
    },
    h(
      'div',
      { class: 'who' },
      h('div', { class: 'nm' }, profile.teams[profile.activeTeam]?.name ?? 'Équipe'),
      h(
        'div',
        { class: 'mini-team' },
        ...team.map((id) => h('img', { src: portraitUrl(id), alt: '', title: getShinobi(id).name })),
        team.length < 3 ? h('span', { class: 'warn' }, `${team.length}/3`) : null,
      ),
    ),
  );

  const el = h(
    'div',
    { class: 'home-desk' },
    h(
      'div',
      { class: 'home-frame map-frame' },
      drawWorldMap(),
      ...markers,
      teamCard,
      h('div', { class: 'menubox map-panel' }, h('div', { class: 'map-panel-in' }, head, list)),
      desc,
    ),
    h(
      'div',
      { class: 'home-hint' },
      '←→ changer de lieu · ↑↓ choisir un combat · Entrée pour combattre · Échap pour revenir',
    ),
  );
  selectArena(arenaIndex);
  return { el, destroy: () => document.removeEventListener('keydown', onKey) };
}
