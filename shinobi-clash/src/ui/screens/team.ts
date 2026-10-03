import type { ElementId } from '../../core/types';
import { ELEMENTS, elementMultiplier } from '../../data/elements';
import { ROLES } from '../../data/roles';
import { getShinobi } from '../../data/shinobi';
import { activeSynergies, synergiesGainedBy } from '../../data/synergies';
import { spriteUrl } from '../../game/gfx/sprites';
import teamCss from '../../styles/screens/team.css?inline';
import { audio } from '../../services/audio';
import { game } from '../../services/gameService';
import { button, elementChip, promptText, shinobiCard, toast } from '../components';
import { clear, h } from '../dom';
import { vibrate } from '../frame';
import { navigate, type Screen } from '../router';
import { topBar } from '../topbar';
import { openShinobiDetail } from './shinobiDetail';

interface DragState {
  id: string;
  /** Emplacement d'origine, ou null si le shinobi vient de la collection. */
  from: number | null;
  ghost: HTMLImageElement;
  startX: number;
  startY: number;
  moved: boolean;
  /** Au toucher, le glisser ne s'arme qu'après un appui long (sinon on laisse défiler la page). */
  armed: boolean;
  timer: number | null;
}

/**
 * Constructeur d'équipe : 3 emplacements, glisser-déposer (souris et tactile) ou clic, plusieurs équipes,
 * synergies actives, synergies que chaque carte ajouterait, et avertissements de composition.
 */
export function teamScreen(): Screen {
  const bar = topBar('Équipe', { back: () => navigate('home') });
  let selected: string | null = null;
  const tabs = h('div', { class: 'team-tabs' });
  const slots = h('div', { class: 'slots' });
  const analysis = h('div');
  const grid = h('div', { class: 'grid-cards' });
  const helpText = h('div', { class: 'dim', style: 'font-size:14px;margin:8px 0' });
  const team = () => game.profile.teams[game.profile.activeTeam];
  const members = () =>
    team()
      .members.filter((id): id is string => !!id)
      .map(getShinobi);

  function place(slot: number, defId: string | null): void {
    const result = game.setTeamMember(game.profile.activeTeam, slot, defId);
    if (result.ok) audio.play(defId ? 'reveal' : 'back');
    else toast(result.error, 'error');
    selected = null;
    render();
  }

  // ---------- Glisser-déposer ----------
  let drag: DragState | null = null;
  /** Empêche le clic qui suit un dépôt de déclencher une seconde action. */
  let justDropped = false;

  function startDrag(e: PointerEvent, id: string, from: number | null): void {
    const touch = e.pointerType !== 'mouse';
    const state: DragState = {
      id,
      from,
      ghost: h('img', { class: 'drag-ghost hidden', src: spriteUrl(id) }),
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      armed: !touch,
      timer: null,
    };
    if (touch) {
      state.timer = window.setTimeout(() => {
        state.armed = true;
        state.ghost.classList.remove('hidden');
        state.ghost.style.left = `${state.startX}px`;
        state.ghost.style.top = `${state.startY}px`;
        vibrate(15, game.profile.settings.vibration);
        audio.play('hover');
      }, 280);
    }
    drag = state;
    document.body.appendChild(state.ghost);
  }

  function cancelDrag(): void {
    if (!drag) return;
    if (drag.timer) window.clearTimeout(drag.timer);
    drag.ghost.remove();
    drag = null;
    [...slots.children].forEach((s) => s.classList.remove('hot'));
  }

  const blockScroll = (e: TouchEvent) => {
    if (drag?.armed) e.preventDefault();
  };
  document.addEventListener('touchmove', blockScroll, { passive: false });

  const slotAt = (x: number, y: number): number | null => {
    const index = [...slots.children].findIndex((s) => {
      const box = s.getBoundingClientRect();
      return x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
    });
    return index >= 0 ? index : null;
  };

  const onMove = (e: PointerEvent) => {
    if (!drag) return;
    const dist = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY);
    if (!drag.armed) {
      if (dist > 10) cancelDrag();
      return;
    }
    if (!drag.moved && dist < 8) return;
    drag.moved = true;
    drag.ghost.classList.remove('hidden');
    drag.ghost.style.left = `${e.clientX}px`;
    drag.ghost.style.top = `${e.clientY}px`;
    const hot = slotAt(e.clientX, e.clientY);
    [...slots.children].forEach((s, i) => s.classList.toggle('hot', i === hot));
  };

  const onUp = (e: PointerEvent) => {
    if (!drag) return;
    const state = drag;
    if (state.timer) window.clearTimeout(state.timer);
    drag = null;
    state.ghost.remove();
    [...slots.children].forEach((s) => s.classList.remove('hot'));
    if (!state.moved) return;
    const target = slotAt(e.clientX, e.clientY);
    // Lâché hors des emplacements : un membre de l'équipe est retiré.
    if (target === null) {
      if (state.from !== null) place(state.from, null);
    } else {
      place(target, state.id);
    }
    justDropped = true;
    setTimeout(() => (justDropped = false), 50);
  };
  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerup', onUp);
  document.addEventListener('pointercancel', cancelDrag);

  // ---------- Rendu ----------
  function renderTabs(): void {
    clear(tabs);
    game.profile.teams.forEach((t, i) =>
      tabs.appendChild(
        button(
          t.name,
          () => {
            game.setActiveTeam(i);
            render();
          },
          { size: 'small', variant: i === game.profile.activeTeam ? 'gold' : 'dark' },
        ),
      ),
    );
    tabs.appendChild(
      button(
        '✎',
        () => {
          void promptText("Nom de l'équipe", team().name, 14).then((name) => {
            if (!name) return;
            game.renameTeam(game.profile.activeTeam, name);
            render();
          });
        },
        { size: 'small', variant: 'dark', title: 'Renommer' },
      ),
    );
  }

  function renderSlots(): void {
    clear(slots);
    team().members.forEach((id, i) => {
      const def = id ? getShinobi(id) : null;
      slots.appendChild(
        h(
          'div',
          {
            class: `slot ${def ? 'filled' : ''}`,
            onclick: () => {
              if (justDropped) return;
              if (selected) place(i, selected);
              else if (def) openShinobiDetail(def.id, render);
            },
            onpointerdown: (e: PointerEvent) => {
              if (def) startDrag(e, def.id, i);
            },
          },
          h('span', { class: 'idx' }, String(i + 1)),
          i === 0 ? h('span', { class: 'lead' }, 'EN TÊTE') : null,
          def ? h('img', { src: spriteUrl(def.id), draggable: false }) : h('span', { class: 'plus' }, '+'),
          def ? h('span', { class: 'sn' }, def.name) : h('span', { class: 'sn dim' }, 'Vide'),
          def
            ? h(
                'div',
                { class: 'row', style: 'gap:3px;margin-top:3px' },
                ...def.elements.map((e) => elementChip(e, false)),
                h('span', { style: 'font-size:12px' }, ROLES[def.role].icon),
              )
            : null,
          def
            ? button(
                '✕',
                (e) => {
                  e.stopPropagation();
                  place(i, null);
                },
                { size: 'small', variant: 'dark', cls: 'rm' },
              )
            : null,
        ),
      );
    });
  }

  function renderAnalysis(): void {
    clear(analysis);
    const current = members();
    const synergies = activeSynergies(current);
    const warnings: string[] = [];
    if (current.length < 3) warnings.push(`Équipe incomplète (${current.length}/3).`);
    if (current.length >= 2 && !current.some((s) => s.role === 'healer' || s.role === 'support' || s.role === 'tank')) {
      warnings.push('Aucun tank ni soutien : attention à l’usure.');
    }
    const elements = (Object.keys(ELEMENTS) as ElementId[]).filter((e) => e !== 'neutral');
    for (const element of elements) {
      const weak = current.filter((s) => elementMultiplier(element, s.elements) > 1).length;
      if (weak >= 2) warnings.push(`${weak} membres vulnérables au ${ELEMENTS[element].name}.`);
    }
    analysis.appendChild(
      h(
        'div',
        null,
        h('div', { class: 'section-title' }, 'Synergies actives'),
        synergies.length
          ? h(
              'div',
              { class: 'syn' },
              ...synergies.map((s) =>
                h('span', { class: 's on', title: s.description }, `✓ ${s.name} — ${s.description}`),
              ),
            )
          : h(
              'div',
              { class: 'dim', style: 'font-size:14px' },
              'Aucune. Essaie de combiner clans, équipes ou éléments complémentaires (ex. Katon + Fûton).',
            ),
        warnings.length
          ? h('div', { style: 'margin-top:8px' }, ...warnings.map((w) => h('div', { class: 'warn' }, `⚠ ${w}`)))
          : null,
      ),
    );
  }

  function renderCollection(): void {
    clear(grid);
    const inTeam = new Set(team().members.filter(Boolean));
    const current = members();
    const owned = Object.values(game.profile.collection).sort((a, b) => b.level - a.level);
    for (const unit of owned) {
      const def = getShinobi(unit.defId);
      const card = shinobiCard(unit.defId, unit, {
        selected: selected === unit.defId,
        compact: true,
        onClick: () => {
          if (justDropped) return;
          selected = selected === unit.defId ? null : unit.defId;
          audio.play('click');
          const free = team().members.indexOf(null);
          if (selected && free >= 0 && !inTeam.has(unit.defId)) place(free, unit.defId);
          else render();
        },
      });
      card.addEventListener('pointerdown', (e) => startDrag(e, unit.defId, null));
      if (inTeam.has(unit.defId)) {
        card.classList.add('in-team');
      } else {
        // « Et si je mettais lui avec lui ? » : la carte annonce les synergies qu'elle activerait.
        const gained = synergiesGainedBy(current.length >= 3 ? current.slice(0, 2) : current, def);
        if (gained.length) {
          card.appendChild(
            h(
              'div',
              { class: 'near-tag', title: gained.map((s) => s.description).join('\n') },
              `+ ${gained.map((s) => s.name).join(', ')}`,
            ),
          );
        }
      }
      grid.appendChild(card);
    }
  }

  function render(): void {
    renderTabs();
    renderSlots();
    renderAnalysis();
    renderCollection();
    helpText.textContent = selected
      ? `${getShinobi(selected).name} sélectionné : clique sur un emplacement pour le placer.`
      : 'Glisse un shinobi sur un emplacement, ou clique dessus pour l’ajouter. Le premier emplacement entre en combat en premier.';
  }

  render();
  return {
    el: h(
      'div',
      null,
      h('style', null, teamCss),
      bar.el,
      h(
        'div',
        { class: 'scroll' },
        h(
          'div',
          { class: 'wrap team-layout' },
          h(
            'div',
            { class: 'team-left' },
            tabs,
            slots,
            helpText,
            analysis,
            h(
              'div',
              { class: 'center', style: 'margin-top:16px' },
              button('⚔ Combattre', () => navigate('arenas'), { variant: 'primary' }),
            ),
          ),
          h(
            'div',
            { class: 'team-right' },
            h('div', { class: 'section-title', style: 'margin-top:0' }, 'Tes shinobis'),
            grid,
          ),
        ),
      ),
    ),
    destroy: () => {
      bar.destroy();
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', cancelDrag);
      document.removeEventListener('touchmove', blockScroll);
      cancelDrag();
    },
  };
}
