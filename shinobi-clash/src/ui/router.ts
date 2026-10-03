import { audio, type MusicTrack } from '../services/audio';
import { hideTooltip } from './components';

export interface Screen {
  el: HTMLElement;
  destroy?: () => void;
  /** Musique de l'écran ; `undefined` = musique de menu, `null` = silence. */
  music?: MusicTrack | null;
}

export type ScreenParams = Record<string, unknown>;
type ScreenFactory = (params: ScreenParams) => Screen;

const screens = new Map<string, ScreenFactory>();
let current: { name: string; inst: Screen } | null = null;
const history: { name: string; params: ScreenParams }[] = [];

export function registerScreen(name: string, factory: ScreenFactory): void {
  screens.set(name, factory);
}

export function navigate(name: string, params: ScreenParams = {}, opts: { replace?: boolean } = {}): void {
  const factory = screens.get(name);
  if (!factory) throw Error(`Unknown screen ${name}`);
  const root = document.getElementById('app')!;
  hideTooltip();
  if (current) {
    const leaving = current;
    leaving.inst.destroy?.();
    leaving.inst.el.classList.add('screen-leave');
    setTimeout(() => leaving.inst.el.remove(), 180);
  }
  if (opts.replace) history[history.length - 1] = { name, params };
  else history.push({ name, params });
  const inst = factory(params);
  inst.el.classList.add('screen', 'screen-enter');
  root.appendChild(inst.el);
  current = { name, inst };
  audio.playMusic(inst.music === undefined ? 'menu' : inst.music);
}

export function goBack(fallback = 'home'): void {
  history.pop();
  const previous = history.pop();
  navigate(previous?.name ?? fallback, previous?.params ?? {});
}

/** Écrans où Échap/Retour arrière ne doivent pas revenir en arrière. */
const NO_KEYBOARD_BACK = new Set(['battle', 'home', 'arenas', 'onboarding']);

document.addEventListener('keydown', (e) => {
  if ((e.key !== 'Escape' && e.key !== 'Backspace') || !current || NO_KEYBOARD_BACK.has(current.name)) return;
  if (document.querySelector('.modal-backdrop')) return;
  const target = e.target as HTMLElement | null;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) return;
  const back = current.inst.el.querySelector<HTMLElement>('.back-btn');
  if (back) {
    e.preventDefault();
    back.click();
  }
});

export function currentScreen(): string | null {
  return current?.name ?? null;
}
