import { listAchievements } from '../../core/achievements';
import { listMissions } from '../../core/missions';
import { activeTeamMembers, playerXpToNext } from '../../core/profile';
import { spriteCanvas } from '../../game/gfx/sprites';
import { audio } from '../../services/audio';
import { game } from '../../services/gameService';
import { avatarFrame, Bar, titleTag } from '../components';
import { clear, h } from '../dom';
import { navigate, type Screen } from '../router';
import { currencyBar } from '../topbar';
import { openDevMenu } from './devMenu';

const VIEW_W = 240;
const VIEW_H = 160;

/** Vue du village (ciel tramé, falaise des visages, toits colorés) avec l'équipe du joueur au premier plan. */
function drawVillage(team: string[]): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = VIEW_W;
  canvas.height = VIEW_H;
  const ctx = canvas.getContext('2d')!;
  const rect = (x: number, y: number, w: number, hgt: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, hgt);
  };
  const stripes = (from: number, to: number, a: string, b: string) => {
    for (let y = from; y < to; y++) rect(0, y, VIEW_W, 1, y % 2 ? b : a);
  };
  const blob = (cx: number, cy: number, rx: number, ry: number, color: string) => {
    ctx.fillStyle = color;
    for (let dy = -ry; dy <= ry; dy++) {
      const half = Math.round(rx * Math.sqrt(1 - (dy / ry) ** 2));
      ctx.fillRect(cx - half, cy + dy, half * 2, 1);
    }
  };
  stripes(0, 34, '#90d0f4', '#84c8f0');
  stripes(34, 62, '#b4e0f6', '#a8daf4');
  stripes(62, 84, '#d8f0f6', '#cceaf4');
  for (const [x, y, w] of [
    [26, 14, 26],
    [70, 24, 18],
    [196, 12, 22],
  ]) {
    blob(x, y, w / 2, 4, '#f4fbff');
    blob(x + 8, y - 3, w / 3, 4, '#f4fbff');
  }
  // Falaise et visages sculptés.
  ctx.fillStyle = '#c8b498';
  ctx.beginPath();
  ctx.moveTo(4, 84);
  ctx.lineTo(10, 40);
  ctx.lineTo(40, 30);
  ctx.lineTo(150, 34);
  ctx.lineTo(168, 84);
  ctx.fill();
  for (let i = 0; i < 4; i++) {
    const x = 22 + i * 32;
    rect(x, 42, 20, 22, '#b8a286');
    rect(x + 4, 50, 4, 2, '#8a7660');
    rect(x + 12, 50, 4, 2, '#8a7660');
    rect(x + 8, 57, 4, 1, '#8a7660');
  }
  for (let i = 0; i < 7; i++) {
    const x = 160 + i * 13;
    ctx.fillStyle = i % 2 ? '#5a9a50' : '#4a8a44';
    ctx.beginPath();
    ctx.moveTo(x - 9, 92);
    ctx.lineTo(x, 58 + (i % 3) * 6);
    ctx.lineTo(x + 9, 92);
    ctx.fill();
  }
  const roofs = ['#d0503c', '#3a6ab0', '#d0503c', '#4a8a4a', '#c8a03a', '#d0503c', '#3a6ab0', '#8a4ab0'];
  for (let i = 0; i < 9; i++) {
    const x = i * 28 - 8;
    const y = 82 + ((i * 5) % 8);
    rect(x + 2, y + 8, 22, 22, '#f0e4cc');
    rect(x + 2, y + 8, 22, 2, '#d8c8a8');
    ctx.fillStyle = roofs[i % roofs.length];
    ctx.beginPath();
    ctx.moveTo(x - 3, y + 10);
    ctx.lineTo(x + 13, y);
    ctx.lineTo(x + 29, y + 10);
    ctx.fill();
    rect(x + 9, y + 16, 6, 6, '#5a6a8a');
    rect(x + 10, y + 17, 2, 2, '#9ab8e0');
  }
  stripes(110, VIEW_H, '#e8d8a8', '#e0cf9c');
  rect(0, 110, VIEW_W, 2, '#a8c870');
  for (let i = 0; i < 18; i++) rect((i * 37) % VIEW_W, 116 + ((i * 13) % 40), 3, 1, '#cdb986');
  team.slice(0, 3).forEach((defId, i) => {
    const sprite = spriteCanvas(defId, 'front');
    const x = [58, 18, 98][i];
    const y = i === 0 ? 80 : 76;
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.beginPath();
    ctx.ellipse(x + 20, y + 46, 14, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.drawImage(sprite, x, y);
  });
  return canvas;
}

interface MenuEntry {
  label: string;
  desc: string;
  go: () => void;
  cls?: string;
  badge?: number;
}

export function homeScreen(): Screen {
  const profile = game.profile;
  const team = activeTeamMembers(profile);
  const currencies = currencyBar();
  const unopened = Object.values(profile.packs).reduce((sum, n) => sum + n, 0);
  const toClaim =
    listMissions(profile).filter((m) => m.done && !m.claimed).length +
    listAchievements(profile).filter((a) => a.unlocked && !a.claimed).length;
  const passClaimable = game.passView().claimable;
  const xpBar = new Bar(profile.xp / playerXpToNext(profile.level), 'xp');
  const devMode = location.search.includes('dev') || location.hash === '#dev';

  const entries: MenuEntry[] = [
    {
      label: 'JOUER',
      desc: 'Affronte les arènes de l’histoire et gagne des parchemins.',
      go: () => navigate('arenas'),
      cls: 'play',
    },
    {
      label: 'COLLECTION',
      desc: 'Tous tes shinobis : statistiques, jutsus, étoiles et fragments.',
      go: () => navigate('collection'),
    },
    { label: 'ÉQUIPE', desc: 'Compose tes équipes de 3 et active des synergies.', go: () => navigate('team') },
    {
      label: 'PARCHEMINS',
      desc: 'Ouvre tes parchemins pour recruter de nouveaux shinobis.',
      go: () => navigate('packs'),
      badge: unopened,
    },
    {
      label: 'BOUTIQUE',
      desc: 'Achète des parchemins avec tes Ryō, ton Jade ou tes points de chaîne.',
      go: () => navigate('shop'),
    },
    {
      label: 'MISSIONS',
      desc: 'Missions du jour, de la semaine et succès à récupérer.',
      go: () => navigate('missions'),
      badge: toClaim,
    },
    {
      label: 'PASSE',
      desc: 'Le passe de combat de la saison : paliers, récompenses et cosmétiques.',
      go: () => navigate('pass'),
      badge: passClaimable,
    },
    { label: 'DUELS', desc: 'PvP en ligne, classement, et entraînement contre l’IA.', go: () => navigate('ranking') },
    { label: 'OPTIONS', desc: 'Son, vitesse des combats, accessibilité.', go: () => navigate('settings') },
  ];
  if (devMode)
    entries.push({ label: 'DEV', desc: 'Outils de test : monnaies, parchemins, shinobis…', go: () => openDevMenu() });

  const desc = h('div', { class: 'home-desc' });
  const items = entries.map((entry, i) =>
    h(
      'button',
      {
        class: `mitem ${entry.cls ?? ''}`,
        onpointerenter: () => select(i, false),
        onclick: () => {
          audio.play('click');
          entry.go();
        },
      },
      h('span', { class: 'jname' }, entry.label),
      entry.badge ? h('span', { class: 'mbadge' }, String(entry.badge)) : null,
    ),
  );
  let selected = 0;
  function select(index: number, withSound = true): void {
    if (withSound && index !== selected) audio.play('hover');
    selected = index;
    items.forEach((item, i) => item.classList.toggle('cur', i === index));
    clear(desc);
    desc.append(entries[index].desc);
  }
  select(0, false);

  const onKey = (e: KeyboardEvent) => {
    if (document.querySelector('.modal-backdrop')) return;
    if (e.key === 'ArrowDown') select((selected + 1) % items.length);
    else if (e.key === 'ArrowUp') select((selected - 1 + items.length) % items.length);
    else if (e.key === 'Enter' || e.key === ' ' || e.key.toLowerCase() === 'z') items[selected].click();
    else return;
    e.preventDefault();
  };
  document.addEventListener('keydown', onKey);

  return {
    el: h(
      'div',
      { class: 'home-desk' },
      h(
        'div',
        { class: 'home-frame' },
        drawVillage(team.length ? team : ['naruto']),
        h('div', { class: 'home-logo' }, 'SHINOBI CLASH'),
        h(
          'button',
          {
            class: 'home-card',
            title: 'Profil : historique, replays, cadre et titre',
            onclick: () => {
              audio.play('click');
              navigate('profile');
            },
          },
          avatarFrame(profile.avatar, profile.cosmetics.frame),
          h(
            'div',
            { class: 'who' },
            h('div', { class: 'nm' }, profile.username),
            titleTag(profile.cosmetics.title),
            h('div', { class: 'lvrow' }, h('span', { class: 'lv' }, `Nv ${profile.level}`), xpBar.el),
          ),
        ),
        h('div', { class: 'home-money' }, currencies.el),
        h('div', { class: 'start-menu menubox' }, h('div', { class: 'menu-grid list' }, ...items)),
        desc,
      ),
      h('div', { class: 'home-hint' }, '↑↓ pour choisir · Entrée pour valider · Échap pour revenir dans les menus'),
    ),
    destroy: () => {
      currencies.destroy();
      document.removeEventListener('keydown', onKey);
    },
  };
}
