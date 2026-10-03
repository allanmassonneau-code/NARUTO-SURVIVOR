import { powerRating } from '../../core/progression';
import type { ElementId, Rarity, Role, ShinobiDef } from '../../core/types';
import { ELEMENTS } from '../../data/elements';
import { RARITIES, RARITY_ORDER } from '../../data/rarities';
import { ROLES } from '../../data/roles';
import { ROSTER } from '../../data/shinobi';
import { game } from '../../services/gameService';
import { shinobiCard } from '../components';
import { clear, h } from '../dom';
import { navigate, type Screen } from '../router';
import { topBar } from '../topbar';
import { openShinobiDetail } from './shinobiDetail';

type SortKey = 'rarity' | 'power' | 'level' | 'recent' | 'name';

/** Filtres conservés entre deux visites de l'écran. */
const filters = {
  q: '',
  rarity: '' as Rarity | '',
  element: '' as ElementId | '',
  role: '' as Role | '',
  village: '',
  owned: 'all' as 'all' | 'owned' | 'missing',
  sort: 'rarity' as SortKey,
};

export function selectField(
  title: string,
  value: string,
  options: [string, string][],
  onChange: (v: string) => void,
): HTMLSelectElement {
  const select: HTMLSelectElement = h(
    'select',
    { class: 'field', title, onchange: () => onChange(select.value) },
    ...options.map(([v, label]) => h('option', { value: v, selected: v === value }, label)),
  );
  return select;
}

export function collectionScreen(): Screen {
  const bar = topBar('Collection', { back: () => navigate('home') });
  const grid = h('div', { class: 'grid-cards' });
  const count = h('div', { class: 'px-font', style: 'color:var(--gold)' });
  const villages = [...new Set(ROSTER.map((s) => s.village))];
  const search: HTMLInputElement = h('input', {
    class: 'field',
    placeholder: 'Rechercher…',
    value: filters.q,
    style: 'max-width:220px;min-height:38px;font-size:15px',
    oninput: () => {
      filters.q = search.value;
      render();
    },
  });
  const filterBar = h(
    'div',
    { class: 'filters' },
    search,
    selectField(
      'Rareté',
      filters.rarity,
      [['', 'Toutes raretés'], ...RARITY_ORDER.map((r): [string, string] => [r, RARITIES[r].name])],
      (v) => {
        filters.rarity = v as Rarity | '';
        render();
      },
    ),
    selectField(
      'Élément',
      filters.element,
      [
        ['', 'Tous éléments'],
        ...(Object.keys(ELEMENTS) as ElementId[]).map((e): [string, string] => [e, ELEMENTS[e].name]),
      ],
      (v) => {
        filters.element = v as ElementId | '';
        render();
      },
    ),
    selectField(
      'Rôle',
      filters.role,
      [['', 'Tous rôles'], ...(Object.keys(ROLES) as Role[]).map((r): [string, string] => [r, ROLES[r].name])],
      (v) => {
        filters.role = v as Role | '';
        render();
      },
    ),
    selectField(
      'Village',
      filters.village,
      [['', 'Tous villages'], ...villages.map((v): [string, string] => [v, v])],
      (v) => {
        filters.village = v;
        render();
      },
    ),
    selectField(
      'Possession',
      filters.owned,
      [
        ['all', 'Tous'],
        ['owned', 'Possédés'],
        ['missing', 'Manquants'],
      ],
      (v) => {
        filters.owned = v as typeof filters.owned;
        render();
      },
    ),
    selectField(
      'Tri',
      filters.sort,
      [
        ['rarity', 'Tri : rareté'],
        ['power', 'Tri : puissance'],
        ['level', 'Tri : niveau'],
        ['recent', 'Tri : nouveauté'],
        ['name', 'Tri : A→Z'],
      ],
      (v) => {
        filters.sort = v as SortKey;
        render();
      },
    ),
  );

  /** Les shinobis possédés passent toujours devant, puis le tri choisi. */
  function compare(a: ShinobiDef, b: ShinobiDef): number {
    const collection = game.profile.collection;
    const ownedA = collection[a.id];
    const ownedB = collection[b.id];
    if (!!ownedA !== !!ownedB) return ownedA ? -1 : 1;
    switch (filters.sort) {
      case 'power':
        return (
          powerRating(b, ownedB?.level ?? 1, ownedB?.stars ?? 1) -
          powerRating(a, ownedA?.level ?? 1, ownedA?.stars ?? 1)
        );
      case 'level':
        return (ownedB?.level ?? 0) - (ownedA?.level ?? 0);
      case 'recent':
        return (ownedB?.obtainedAt ?? 0) - (ownedA?.obtainedAt ?? 0);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return RARITIES[b.rarity].order - RARITIES[a.rarity].order || a.name.localeCompare(b.name);
    }
  }

  function render(): void {
    clear(grid);
    const collection = game.profile.collection;
    const q = filters.q.toLowerCase();
    const shown = ROSTER.filter((s) => {
      const owned = !!collection[s.id];
      return (
        (!q || s.name.toLowerCase().includes(q) || s.clan.toLowerCase().includes(q)) &&
        (!filters.rarity || s.rarity === filters.rarity) &&
        (!filters.element || s.elements.includes(filters.element)) &&
        (!filters.role || s.role === filters.role) &&
        (!filters.village || s.village === filters.village) &&
        (filters.owned !== 'owned' || owned) &&
        (filters.owned !== 'missing' || !owned)
      );
    }).sort(compare);
    for (const s of shown) {
      const owned = collection[s.id] ?? null;
      grid.appendChild(shinobiCard(s.id, owned, { locked: !owned, onClick: () => openShinobiDetail(s.id, render) }));
    }
    count.textContent = `${Object.keys(collection).length} / ${ROSTER.length} shinobis`;
    if (!shown.length) grid.appendChild(h('div', { class: 'dim' }, 'Aucun shinobi ne correspond.'));
  }

  render();
  return {
    el: h(
      'div',
      null,
      bar.el,
      h(
        'div',
        { class: 'scroll' },
        h('div', { class: 'wrap' }, h('div', { class: 'row', style: 'margin-bottom:10px' }, count), filterBar, grid),
      ),
    ),
    destroy: bar.destroy,
  };
}
