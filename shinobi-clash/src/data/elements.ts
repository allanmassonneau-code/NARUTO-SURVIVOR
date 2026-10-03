import type { Effectiveness, ElementId } from '../core/types';

export interface ElementDef {
  id: ElementId;
  name: string;
  kanji: string;
  color: string;
  /** Élément contre lequel celui-ci est efficace (cycle Katon > Fûton > Raiton > Doton > Suiton > Katon). */
  beats: ElementId | null;
}

export const ELEMENTS: Record<ElementId, ElementDef> = {
  katon: { id: 'katon', name: 'Katon', kanji: '火', color: '#e8553a', beats: 'futon' },
  futon: { id: 'futon', name: 'Fûton', kanji: '風', color: '#6cc47a', beats: 'raiton' },
  raiton: { id: 'raiton', name: 'Raiton', kanji: '雷', color: '#f2d04a', beats: 'doton' },
  doton: { id: 'doton', name: 'Doton', kanji: '土', color: '#b5834a', beats: 'suiton' },
  suiton: { id: 'suiton', name: 'Suiton', kanji: '水', color: '#4a8fe8', beats: 'katon' },
  neutral: { id: 'neutral', name: 'Taijutsu', kanji: '体', color: '#c9c2b0', beats: null },
};

export const STRONG_MULT = 1.5;
export const WEAK_MULT = 0.7;

/** Multiplicateur d'un jutsu d'élément `attack` contre une cible d'éléments `defender`. */
export function elementMultiplier(attack: ElementId, defender: ElementId[]): number {
  let mult = 1;
  for (const d of defender) {
    if (ELEMENTS[attack].beats === d) mult *= STRONG_MULT;
    else if (ELEMENTS[d].beats === attack) mult *= WEAK_MULT;
  }
  return Math.max(0.5, Math.min(2, mult));
}

export function effectivenessOf(mult: number): Effectiveness {
  return mult > 1.01 ? 'strong' : mult < 0.99 ? 'weak' : 'normal';
}
