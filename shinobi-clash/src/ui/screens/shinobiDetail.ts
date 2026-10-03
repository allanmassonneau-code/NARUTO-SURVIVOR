import { statsAt, starUpCost, xpToNext, MAX_LEVEL, MAX_STARS } from '../../core/progression';
import { ELEMENTS } from '../../data/elements';
import { getJutsu } from '../../data/jutsus';
import { RARITIES } from '../../data/rarities';
import { getShinobi } from '../../data/shinobi';
import { STATUSES } from '../../data/statuses';
import { SYNERGIES } from '../../data/synergies';
import { spriteUrl } from '../../game/gfx/sprites';
import detailCss from '../../styles/screens/detail.css?inline';
import { audio } from '../../services/audio';
import { game } from '../../services/gameService';
import {
  Bar,
  button,
  elementChip,
  openModal,
  passiveBlock,
  rarityChip,
  roleChip,
  starsText,
  toast,
} from '../components';
import { clear, h } from '../dom';

/** Échelle des barres de statistiques (valeurs proches du maximum du roster au niveau 30). */
const STAT_SCALE = { hp: 1100, attack: 190, defense: 190, speed: 120 };

/** Fiche détaillée d'un shinobi : stats, passif, jutsus dépliables, synergies et éveil. */
export function openShinobiDetail(defId: string, onChange?: () => void): void {
  const def = getShinobi(defId);
  game.markSeen(defId);
  const body = h('div');

  const render = () => {
    clear(body);
    const owned = game.profile.collection[defId] ?? null;
    const level = owned?.level ?? 1;
    const stars = owned?.stars ?? 1;
    const stats = statsAt(def, level, stars);
    const art = h('div', { class: 'detail-art' }, h('img', { src: spriteUrl(defId) }));
    art.style.setProperty('--ec', ELEMENTS[def.elements[0]].color);
    const statRow = (labelText: string, value: number, scale: number) => {
      const bar = new Bar(value / scale);
      bar.el.querySelector<HTMLElement>('.fill')!.style.backgroundColor = 'var(--chakra)';
      return [h('span', { class: 'px-font', style: 'font-size:8px' }, labelText), bar.el, h('b', null, String(value))];
    };
    const xpBar = new Bar(owned ? owned.xp / xpToNext(owned.level) : 0, 'xp');
    const nextStarCost = owned && owned.stars < MAX_STARS ? starUpCost(def.rarity, owned.stars) : null;
    const synergies = SYNERGIES.filter(
      (s) =>
        (s.requirement.kind === 'tagCount' && def.tags.includes(s.requirement.tag)) ||
        (s.requirement.kind === 'elements' && s.requirement.elements.some((e) => def.elements.includes(e))) ||
        (s.requirement.kind === 'roles' && s.requirement.roles.includes(def.role)),
    );

    body.appendChild(
      h(
        'div',
        null,
        h(
          'div',
          { class: 'detail-head' },
          art,
          h(
            'div',
            null,
            h(
              'h2',
              null,
              def.name,
              h('span', { class: 'dim', style: 'font-family:var(--font-body);font-size:13px' }, ` ${def.variant}`),
            ),
            h(
              'div',
              { class: 'row wrap-r' },
              rarityChip(def.rarity),
              roleChip(def.role),
              ...def.elements.map((e) => elementChip(e)),
            ),
            h('div', { style: 'font-size:14px;margin-top:6px' }, `${def.village} · Clan ${def.clan}`),
            owned
              ? h('div', { class: 'stars-big' }, starsText(owned.stars))
              : h('div', { class: 'dim' }, 'Non possédé'),
          ),
        ),
        h('p', { style: 'font-size:15px;font-style:italic' }, def.lore),
        owned
          ? h(
              'div',
              null,
              h(
                'div',
                { class: 'row' },
                h('span', { class: 'px-font' }, `Niveau ${owned.level}${owned.level >= MAX_LEVEL ? ' (MAX)' : ''}`),
                h('span', { class: 'spacer' }),
                h(
                  'span',
                  { style: 'font-size:13px' },
                  owned.level < MAX_LEVEL ? `${owned.xp}/${xpToNext(owned.level)} XP` : '',
                ),
              ),
              xpBar.el,
            )
          : null,
        h('h3', { style: 'margin-top:14px' }, 'Statistiques'),
        h(
          'div',
          { class: 'stat-grid' },
          ...statRow('PV', stats.hp, STAT_SCALE.hp),
          ...statRow('ATK', stats.attack, STAT_SCALE.attack),
          ...statRow('DEF', stats.defense, STAT_SCALE.defense),
          ...statRow('VIT', stats.speed, STAT_SCALE.speed),
        ),
        h('div', { style: 'font-size:13px;margin-top:4px' }, `Critique ${Math.round(stats.critRate * 100)}%`),
        h('h3', { style: 'margin-top:14px' }, 'Passif'),
        passiveBlock(def.passive),
        h('h3', { style: 'margin-top:14px' }, 'Jutsus (survolez pour les détails)'),
        ...def.jutsus.map((id) => {
          const jutsu = getJutsu(id);
          const details: string[] = [];
          if (jutsu.power) details.push(`Puissance ${jutsu.power}${jutsu.hits ? ` × ${jutsu.hits} coups` : ''}`);
          details.push(`Précision ${jutsu.accuracy}%`);
          if (jutsu.priority) details.push(`Priorité ${jutsu.priority > 0 ? '+' : ''}${jutsu.priority}`);
          for (const fx of jutsu.effects) {
            if (fx.kind === 'status') {
              details.push(
                `${STATUSES[fx.status].name} ${Math.round(fx.chance * 100)}% (${STATUSES[fx.status].description})`,
              );
            }
          }
          const row: HTMLDivElement = h(
            'div',
            {
              class: 'jutsu-row',
              onclick: () => {
                row.classList.toggle('open');
                audio.play('click');
              },
            },
            h(
              'span',
              { class: 'jn' },
              jutsu.name,
              ' ',
              h('span', { style: `color:${ELEMENTS[jutsu.element].color}` }, ELEMENTS[jutsu.element].kanji),
            ),
            jutsu.basic
              ? h('span', { class: 'cost', style: 'color:#3a8a3a' }, '+1')
              : h('span', { class: 'cost' }, String(jutsu.chakraCost)),
            h('span', { class: 'jd' }, jutsu.description),
            h('div', { class: 'jutsu-detail', style: 'grid-column:1/-1' }, details.join(' · ')),
          );
          return row;
        }),
        synergies.length ? h('h3', { style: 'margin-top:14px' }, 'Synergies possibles') : null,
        ...synergies.map((s) => h('div', { style: 'font-size:14px' }, h('b', null, s.name), ` — ${s.description}`)),
        owned
          ? h(
              'div',
              { class: 'panel dark', style: 'margin-top:14px' },
              h('h3', null, 'Éveil (fragments)'),
              h(
                'div',
                { class: 'frag' },
                h('span', null, `Fragments : ${owned.fragments}`),
                nextStarCost === null
                  ? h('span', { class: 'dim' }, 'Éveil maximal !')
                  : h('span', { class: 'dim' }, `→ ${nextStarCost} pour ★${owned.stars + 1} (+4% stats)`),
                h('span', { class: 'spacer' }),
                nextStarCost === null
                  ? null
                  : button(
                      'Éveiller',
                      () => {
                        const result = game.starUp(defId);
                        if (result.ok) {
                          audio.play('levelup');
                          toast(`${def.name} passe à ★${result.stars} !`, 'good');
                          render();
                          onChange?.();
                        } else {
                          toast(result.error, 'error');
                        }
                      },
                      { variant: 'gold', size: 'small', disabled: owned.fragments < nextStarCost },
                    ),
              ),
              h(
                'div',
                { class: 'dim', style: 'font-size:13px;margin-top:6px' },
                `Chaque doublon ${RARITIES[def.rarity].name.toLowerCase()} donne ${RARITIES[def.rarity].dupeFragments} fragments. Bonus plafonné à +16% pour garder le PvP équitable.`,
              ),
            )
          : null,
      ),
    );
  };

  render();
  openModal(h('div', null, h('style', null, detailCss), body), { onClose: onChange });
}
