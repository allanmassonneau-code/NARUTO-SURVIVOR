import Phaser from 'phaser';
import { estimateDamage, effectiveSpeed, benchOptions, jutsuOptions, type JutsuOption } from '../../core/battle/engine';
import { createBattle } from '../../core/battle/setup';
import { activeUnit } from '../../core/battle/state';
import type { MatchRecord } from '../../core/profile';
import { xpToNext } from '../../core/progression';
import type { BattleRewards } from '../../core/records';
import { Rng } from '../../core/rng';
import type { AiLevel, BattleAction, BattleEvent, BattleState, BattleUnit, JutsuDef, Side } from '../../core/types';
import { ARENAS, STAGES } from '../../data/arenas';
import { configForMode } from '../../data/battleConfig';
import { effectivenessOf, elementMultiplier, ELEMENTS } from '../../data/elements';
import { ITEMS } from '../../data/items';
import { getJutsu } from '../../data/jutsus';
import { leagueFor } from '../../data/leagues';
import { PASSIVE_INFO } from '../../data/passiveInfo';
import { PASS_XP } from '../../data/seasons';
import { getShinobi } from '../../data/shinobi';
import { STATUSES } from '../../data/statuses';
import {
  LocalBattleController,
  OnlineBattleController,
  ReplayController,
  type BattleController,
} from '../../game/battle/controllers';
import { animationFor, type JutsuAnimation } from '../../game/gfx/animations';
import { FIELD_H, FIELD_W } from '../../game/gfx/backgrounds';
import { portraitUrl, shade } from '../../game/gfx/sprites';
import { BattleScene } from '../../game/scenes/BattleScene';
import type { MatchEnd, MatchFound } from '../../net/protocol';
import { pvp } from '../../net/pvpClient';
import { audio } from '../../services/audio';
import { game, type BattleSetup } from '../../services/gameService';
import { BattleHud, SKIP_TEXT, snapshotUnit, STAT_NAMES, STATUS_INFLICTED, type UnitView } from '../battle/hud';
import { Bar, button, confirmDialog, countUp, flyCurrency, hideTooltip, openModal, tooltip } from '../components';
import { clear, h } from '../dom';
import { sleep, vibrate, waitFrame } from '../frame';
import { navigate, type Screen, type ScreenParams } from '../router';

declare global {
  interface Window {
    /** Outil développeur et tests : gagne le combat local en cours. */
    __battleWin?: () => void;
  }
}

export interface BattleParams extends ScreenParams {
  pending?: BattleSetup;
  ai?: AiLevel;
  tutorial?: boolean;
  online?: { found: MatchFound };
  replay?: { match: MatchRecord };
}

interface MenuState {
  items: HTMLButtonElement[];
  cols: number;
  index: number;
  back?: () => void;
  onFocus?: (index: number) => void;
}

interface JutsuPreview {
  jutsu: JutsuDef;
  me: BattleUnit;
  foe: BattleUnit;
  mult: number;
  eff: 'strong' | 'weak' | 'normal';
  ccBlocked: boolean;
  wakes: boolean;
  tags: string[];
  pct: number;
}

const TUTORIAL_TIPS = [
  'Choisis JUTSU, puis une technique. L’attaque de base (+1) est gratuite et recharge ton chakra ◆.',
  'Les gros jutsus coûtent du chakra ◆. Il se recharge de 2 à chaque fin de tour.',
  'Le panneau de droite détaille le jutsu survolé : coût, type, puissance et dégâts estimés. Flèches + Entrée au clavier.',
];

export function battleScreen(params: ScreenParams): Screen {
  const { pending, ai = 'normal', tutorial, online, replay } = params as BattleParams;
  const settings = game.profile.settings;
  const stageId = pending?.stageId ?? replay?.match.stageId ?? null;
  const stage = stageId ? STAGES[stageId] : undefined;
  const trainingMode = pending?.mode && pending.mode !== 'pve' ? pending.mode : null;
  const arena =
    online || trainingMode || (replay && !stage)
      ? ARENAS.find((a) => a.bg === 'exam')!
      : (ARENAS.find((a) => a.id === stage?.arenaId) ?? ARENAS[0]);

  let controller: BattleController;
  let state: BattleState;
  if (online) {
    controller = new OnlineBattleController(pvp, online.found);
    state = controller.state;
  } else if (replay) {
    controller = new ReplayController(replay.match.replay!);
    state = controller.state;
  } else {
    if (!pending) throw Error('PvE battle without a pending battle');
    state = createBattle(pending.player, pending.enemy, pending.seed, configForMode(pending.mode ?? 'pve'));
    controller = new LocalBattleController(state, ai, new Rng(pending.seed ^ 1540483477));
  }

  // Vues affichées, mises à jour au fil des événements.
  const views = new Map<string, UnitView>();
  for (const team of state.sides) for (const unit of team.units) views.set(unit.uid, snapshotUnit(unit));
  const viewOf = (uid: string) => views.get(uid)!;
  /** Shinobi actuellement dessiné de chaque côté. */
  const shown: [string | null, string | null] = [null, null];

  const enemyName = state.sides[1].name;
  const title = replay
    ? `▶ Replay — vs ${enemyName}`
    : online
      ? `PvP ${online.found.mode === 'ranked' ? 'Classé' : 'Amical'} — vs ${enemyName}`
      : trainingMode
        ? `Entraînement ${trainingMode === 'ranked' ? 'Classé' : 'Amical'} — vs ${enemyName}`
        : `${arena.name} — ${stage?.name ?? 'Combat'}`;
  let replaySpeed = replay ? 1.5 : 1;

  // ---------- Structure ----------
  const phaserHost = h('div', { class: 'phaser-host' });
  const overlay = h('div', { class: 'overlay' });
  const huds: [BattleHud, BattleHud] = [
    new BattleHud(0, state.config.chakraMax),
    new BattleHud(1, state.config.chakraMax),
  ];
  const stageEl = h('div', { class: 'battle-stage' }, phaserHost, overlay, huds[1].el, huds[0].el);
  const msgText = h('span', { class: 'msg-text' });
  const caret = h('span', { class: 'caret hidden' });
  const msgBox = h('div', { class: 'msgbox' }, msgText, caret);
  const menuBox = h('div', { class: 'menubox' });
  const dock = h('div', { class: 'dock', 'data-mode': 'message' }, msgBox, menuBox);
  // Terrain et boîte de commandes partagent un cadre : surimpression façon GBA sur grand écran, empilés en portrait.
  const frame = h('div', { class: 'battle-frame' }, stageEl, dock);
  const tip = h('div', { class: 'tip hidden' });
  const teamStrip = h('div', { class: 'team-strip' });
  const replayBar = h('div', { class: 'replay-bar hidden' });
  const turnCounter = h('div', { class: 'turn-counter' });
  const below = h('div', { class: 'battle-below' }, teamStrip, tip, replayBar);
  const root = h(
    'div',
    { class: 'battle-screen' },
    h(
      'div',
      { class: 'battle-top' },
      button('☰', () => openPauseMenu(), { size: 'small', variant: 'dark', title: 'Menu' }),
      h('div', { class: 'title' }, title),
      turnCounter,
    ),
    h('div', { class: 'battle-body' }, frame, below),
  );
  if (settings.colorblind) root.classList.add('colorblind');

  // ---------- Phaser ----------
  const scene = new BattleScene({
    bg: arena.bg,
    speed: settings.battleSpeed * replaySpeed,
    reduceShake: settings.reduceShake,
    reduceMotion: settings.reduceMotion,
  });
  let phaserGame: Phaser.Game | null = null;
  let disposed = false;
  let lastStep = performance.now();
  // Filet de sécurité : si requestAnimationFrame est bridé (onglet en arrière-plan, certains navigateurs
  // sans affichage), on fait avancer la boucle Phaser à la main pour que les animations se terminent.
  const tickTimer = window.setInterval(() => {
    if (phaserGame && document.visibilityState === 'visible' && performance.now() - lastStep > 100) {
      phaserGame.loop.tick();
    }
  }, 33);
  void waitFrame().then((hasRaf) => {
    if (disposed) return;
    phaserGame = new Phaser.Game({
      fps: hasRaf ? undefined : { forceSetTimeOut: true, target: 60 },
      type: Phaser.AUTO,
      parent: phaserHost,
      width: FIELD_W,
      height: FIELD_H,
      pixelArt: true,
      roundPixels: true,
      backgroundColor: '#000000',
      banner: false,
      audio: { noAudio: true },
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      scene,
    });
    phaserGame.events.on(Phaser.Core.Events.POST_STEP, () => (lastStep = performance.now()));
  });

  // ---------- Boîte de message ----------
  let skipMessage: (() => void) | null = null;
  const speed = () => settings.battleSpeed * replaySpeed;

  /** Texte qui s'écrit lettre à lettre ; un clic accélère puis passe au message suivant. */
  async function say(text: string, hold = 650): Promise<void> {
    if (disposed) return;
    msgText.textContent = '';
    caret.classList.add('hidden');
    let hurried = false;
    skipMessage = () => (hurried = true);
    for (let i = 0; i < text.length; i++) {
      if (disposed) return;
      msgText.textContent = text.slice(0, i + 1);
      if (!hurried && i % 2 === 0) await sleep(14 / speed());
    }
    caret.classList.remove('hidden');
    await Promise.race([
      sleep(hurried ? 120 : hold / speed()),
      new Promise<void>((resolve) => (skipMessage = resolve)),
    ]);
    skipMessage = null;
  }
  msgBox.addEventListener('click', () => skipMessage?.());

  function floatText(side: Side, text: string, cls: string, dy = 0): void {
    const anchor = BattleScene.anchor(side);
    const el = h(
      'div',
      { class: `float ${cls}`, style: { left: `${anchor.x + (Math.random() - 0.5) * 6}%`, top: `${anchor.y + dy}%` } },
      text,
    );
    overlay.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  function banner(text: string, cls = ''): void {
    const el = h('div', { class: `banner ${cls}` }, text);
    overlay.appendChild(el);
    setTimeout(() => el.remove(), 950);
  }

  /** Bandeau de portrait avant une technique majeure. */
  async function cutIn(side: Side, defId: string, jutsu: JutsuDef): Promise<void> {
    if (settings.reduceMotion) return;
    const el = h(
      'div',
      { class: `cutin ${side === 1 ? 'right' : ''}` },
      h('img', { src: portraitUrl(defId) }),
      h('div', { class: 'jn' }, jutsu.name),
    );
    el.style.setProperty('--cc', ELEMENTS[jutsu.element].color);
    overlay.appendChild(el);
    audio.play('charge');
    await sleep(700 / speed());
    setTimeout(() => el.remove(), 400);
  }

  const activeIndex: [number, number] = [state.sides[0].active, state.sides[1].active];
  const activeUid = (side: Side) => state.sides[side].units[activeIndex[side]].uid;

  function renderTeamStrip(): void {
    clear(teamStrip);
    for (const side of [0, 1] as const) {
      const team = state.sides[side];
      const balls = team.units.map((unit) => {
        const view = viewOf(unit.uid);
        return h('span', {
          class: `ball ${view.fainted ? 'ko' : ''} ${views.get(activeUid(side))?.uid === unit.uid && !view.fainted ? 'active' : ''}`,
          title: unit.name,
        });
      });
      teamStrip.appendChild(
        h('div', { class: 'side' }, side === 0 ? 'Vous' : null, ...balls, side === 1 ? team.name : null),
      );
    }
  }

  function renderTurn(): void {
    turnCounter.textContent = `Tour ${String(Math.min(state.turn, state.config.maxTurns)).padStart(2, '0')}/${state.config.maxTurns}`;
    turnCounter.classList.toggle('last', state.turn >= state.config.maxTurns - 1);
  }

  /** Indique qui agira en premier (hors priorité). */
  function renderSpeedHint(): void {
    const first = effectiveSpeed(activeUnit(state, 0)) >= effectiveSpeed(activeUnit(state, 1));
    huds[0].speed.textContent = first ? '» 1er' : '« 2e';
    huds[0].speed.title = first
      ? 'Plus rapide : agit en premier (hors priorité)'
      : "Plus lent : l'adversaire agit en premier";
    huds[0].speed.style.color = first ? '#3a8a3a' : '#b04a3a';
  }

  /** Une animation ne doit jamais bloquer le combat : au-delà du délai, on continue. */
  function withTimeout<T>(promise: Promise<T>, fallback: T, ms = 3000): Promise<T> {
    return Promise.race([promise, sleep(ms).then(() => fallback)]);
  }

  // ---------- Déroulé des événements ----------
  let attackerSide: Side | null = null;
  let currentAnim: JutsuAnimation | null = null;
  let currentTier = 0;
  let pendingEff: 'strong' | 'weak' | null = null;
  let pendingCrit = false;

  /** Retour à la place de l'attaquant, puis commentaires « critique » / « super efficace ». */
  async function finishAttack(): Promise<void> {
    if (attackerSide === null) return;
    const side = attackerSide;
    attackerSide = null;
    await withTimeout(scene.returnHome(side), undefined);
    if (pendingCrit) await say('Coup critique !', 400);
    if (pendingEff === 'strong') await say("C'est super efficace !", 500);
    else if (pendingEff === 'weak') await say('Ce n’est pas très efficace…', 450);
    pendingEff = null;
    pendingCrit = false;
  }

  function label(side: Side, uid: string): string {
    const name = viewOf(uid).name;
    return side === 1 ? `${name} ennemi` : name;
  }

  async function playEvents(events: BattleEvent[]): Promise<void> {
    for (let i = 0; i < events.length; i++) {
      if (disposed) return;
      const e = events[i];
      if (
        e.t === 'useJutsu' ||
        e.t === 'swapOut' ||
        e.t === 'useItem' ||
        e.t === 'turnEnd' ||
        e.t === 'skip' ||
        e.t === 'end' ||
        (e.t === 'damage' && e.source === 'status')
      ) {
        await finishAttack();
      }
      await playEvent(e, events, i);
    }
    await finishAttack();
  }

  async function playEvent(e: BattleEvent, events: BattleEvent[], index: number): Promise<void> {
    switch (e.t) {
      case 'turnStart':
        renderTurn();
        if (e.turn > 1) banner(`TOUR ${e.turn}`);
        await sleep(250 / speed());
        break;
      case 'swapIn': {
        const side = e.side;
        activeIndex[side] = e.index;
        const view = viewOf(e.uid);
        if (state.turn > 1 || index > 1) {
          await say(side === 0 ? `À toi, ${view.name} !` : `${state.sides[1].name} envoie ${view.name} !`, 350);
        }
        audio.play('poof');
        await withTimeout(scene.enter(side, view.defId, state.sides[side].units[e.index]?.stars ?? 1), undefined);
        shown[side] = view.defId;
        huds[side].bind(view);
        renderTeamStrip();
        renderSpeedHint();
        break;
      }
      case 'swapOut': {
        const view = viewOf(e.uid);
        view.statuses = view.statuses.filter((s) => s.id !== 'stun');
        view.stages = { attack: 0, defense: 0, speed: 0, crit: 0 };
        view.shield = 0;
        view.clone = false;
        await say(e.side === 0 ? `Reviens, ${view.name} !` : `L'adversaire rappelle ${view.name}.`, 350);
        huds[e.side].hide();
        await withTimeout(scene.exit(e.side), undefined);
        shown[e.side] = null;
        break;
      }
      case 'useItem':
        audio.play('heal');
        await say(
          `${e.side === 0 ? 'Vous utilisez' : "L'adversaire utilise"} ${ITEMS[e.itemId]?.name ?? e.itemId} !`,
          400,
        );
        break;
      case 'useJutsu': {
        const jutsu = getJutsu(e.jutsuId);
        const view = viewOf(e.uid);
        await say(`${label(e.side, e.uid)} utilise ${jutsu.name}${jutsu.name.endsWith('!') ? '' : ' !'}`, 250);
        if (jutsu.tier === 2) await cutIn(e.side, view.defId, jutsu);
        // L'animation ne vise la cible que si le coup l'atteint vraiment (dégâts, blocage ou esquive).
        let hitsFoe = false;
        for (let k = index + 1; k < events.length; k++) {
          const next = events[k];
          if (next.t === 'useJutsu' || next.t === 'turnEnd' || next.t === 'swapOut' || next.t === 'end') break;
          if ((next.t === 'damage' || next.t === 'blocked' || next.t === 'miss') && next.side !== e.side)
            hitsFoe = true;
        }
        if (jutsu.target !== 'foe') hitsFoe = false;
        audio.play(jutsu.tier === 2 ? 'charge' : 'jutsu');
        attackerSide = e.side;
        currentTier = jutsu.tier;
        currentAnim = await withTimeout(
          scene.attack(e.side, jutsu.animationId, jutsu.tier, hitsFoe),
          animationFor(jutsu.animationId),
          4000,
        );
        if (!hitsFoe && jutsu.effects.some((fx) => fx.kind === 'heal')) audio.play('heal');
        else if (!hitsFoe) audio.play(jutsu.animationId === 'clone' ? 'poof' : 'buff');
        break;
      }
      case 'damage': {
        const view = viewOf(e.uid);
        view.hp = e.hp;
        if (e.source === 'jutsu' && currentAnim) {
          audio.play(e.crit ? 'crit' : e.eff === 'weak' ? 'weak' : 'impact');
          if (e.crit || currentTier === 2) vibrate(e.crit ? [30, 20, 40] : 25, settings.vibration);
          floatText(
            e.side,
            `-${e.amount}`,
            e.crit ? 'crit' : e.eff === 'strong' ? 'strong' : e.eff === 'weak' ? 'weak' : '',
            e.hit * -4,
          );
          if (e.crit) floatText(e.side, 'CRITIQUE !', 'info', -12);
          huds[e.side].updateHp();
          await withTimeout(
            scene.impact(e.side, currentAnim, {
              crit: e.crit,
              strong: e.eff === 'strong',
              weak: e.eff === 'weak',
              tier: currentTier,
              hitIndex: e.hit,
            }),
            undefined,
          );
          if (e.eff !== 'normal') pendingEff = e.eff;
          if (e.crit) pendingCrit = true;
        } else if (e.source === 'explosion') {
          audio.play('crit');
          vibrate([40, 30, 60], settings.vibration);
          scene.explosion(e.side);
          floatText(e.side, `-${e.amount}`, 'crit');
          huds[e.side].updateHp();
          await sleep(420 / speed());
        } else {
          audio.play('impact');
          floatText(e.side, `-${e.amount}`, 'weak');
          huds[e.side].updateHp();
          scene.statusPulse(e.side, e.source === 'status' ? 0xe8553a : 0xffffff);
          if (e.source === 'reflect') await say(`L'onde renvoie ${e.amount} dégâts !`, 350);
          else if (e.source === 'recoil') await say(`${label(e.side, e.uid)} subit le contrecoup.`, 300);
          else await sleep(280 / speed());
        }
        break;
      }
      case 'miss':
        audio.play('miss');
        floatText(e.side, 'RATÉ', 'info');
        await withTimeout(scene.miss(e.side), undefined);
        await say("L'attaque rate !", 350);
        break;
      case 'blocked':
        scene.blocked(e.side, e.by);
        audio.play(e.by === 'clone' ? 'poof' : 'buff');
        if (e.by === 'protect') await say(`${label(e.side, e.uid)} bloque l'attaque !`, 400);
        else if (e.by === 'clone') await say('Le clone encaisse le coup !', 400);
        else floatText(e.side, `⛨ -${e.absorbed}`, 'chakra');
        break;
      case 'heal': {
        const view = viewOf(e.uid);
        view.hp = e.hp;
        audio.play('heal');
        if (activeUid(e.side) === e.uid) {
          scene.heal(e.side);
          floatText(e.side, `+${e.amount}`, 'heal');
          huds[e.side].updateHp();
          await sleep(260 / speed());
        } else {
          renderTeamStrip();
          await say(`${label(e.side, e.uid)} récupère ${e.amount} PV.`, 350);
        }
        break;
      }
      case 'chakra': {
        const view = viewOf(e.uid);
        view.chakra = e.chakra;
        if (activeUid(e.side) === e.uid) {
          huds[e.side].updateChakra();
          // La régénération de fin de tour reste discrète ; les gains et vols en cours d'action s'affichent.
          if (!events.slice(index).every((n) => n.t === 'chakra' || n.t === 'turnEnd' || n.t === 'status')) {
            floatText(e.side, `${e.delta > 0 ? '+' : ''}${e.delta}◆`, 'chakra', 8);
            scene.chakra(e.side, e.delta > 0);
          }
        }
        break;
      }
      case 'status': {
        const view = viewOf(e.uid);
        if (e.on) {
          if (!view.statuses.some((s) => s.id === e.status)) {
            view.statuses.push({ id: e.status, turns: STATUSES[e.status].defaultTurns, stacks: 0 });
          }
          if (activeUid(e.side) === e.uid) {
            huds[e.side].renderFx();
            audio.play('status');
            scene.statusPulse(e.side, parseInt(STATUSES[e.status].color.slice(1), 16));
            await say(`${label(e.side, e.uid)} ${STATUS_INFLICTED[e.status]}`, 450);
          }
        } else {
          view.statuses = view.statuses.filter((s) => s.id !== e.status);
          if (activeUid(e.side) === e.uid) huds[e.side].renderFx();
        }
        break;
      }
      case 'statusResist':
        floatText(e.side, 'IMMUNISÉ', 'info');
        await say(`${label(e.side, e.uid)} résiste au contrôle (immunité temporaire).`, 450);
        break;
      case 'buff': {
        const view = viewOf(e.uid);
        view.stages[e.stat] = e.total;
        huds[e.side].renderFx();
        audio.play(e.delta > 0 ? 'buff' : 'debuff');
        scene.buff(e.side, e.delta > 0);
        await say(
          `${STAT_NAMES[e.stat]} de ${label(e.side, e.uid)} ${e.delta > 0 ? 'augmente' : 'baisse'}${Math.abs(e.delta) > 1 ? ' beaucoup' : ''} !`,
          380,
        );
        break;
      }
      case 'shield': {
        const view = viewOf(e.uid);
        const raised = e.amount > view.shield;
        view.shield = e.amount;
        huds[e.side].renderFx();
        if (raised) {
          scene.shield(e.side, true);
          await say(`${label(e.side, e.uid)} s'entoure d'un bouclier !`, 380);
        }
        break;
      }
      case 'clone': {
        const view = viewOf(e.uid);
        view.clone = e.on;
        huds[e.side].renderFx();
        if (e.on) {
          scene.clone(e.side, true);
          await say('Un clone apparaît !', 350);
        }
        break;
      }
      case 'protect':
        if (e.failed) await say('Mais cela échoue !', 400);
        else await say(`${label(e.side, e.uid)} se met en garde !`, 350);
        break;
      case 'dispel':
        await say(`Les protections de ${label(e.side, e.uid)} sont balayées !`, 400);
        break;
      case 'skip':
        scene.skip(e.side);
        await say(`${label(e.side, e.uid)} ${SKIP_TEXT[e.reason] ?? 'ne peut pas agir !'}`, 500);
        break;
      case 'wake':
        await say(`${label(e.side, e.uid)} se réveille !`, 350);
        break;
      case 'faint': {
        const view = viewOf(e.uid);
        view.fainted = true;
        view.statuses = [];
        audio.play('faint');
        vibrate(60, settings.vibration);
        await withTimeout(scene.faint(e.side), undefined);
        shown[e.side] = null;
        huds[e.side].hide();
        renderTeamStrip();
        await say(`${label(e.side, e.uid)} est K.O. !`, 550);
        break;
      }
      case 'passive': {
        const info = PASSIVE_INFO[e.passiveId];
        banner(`✦ ${info?.name ?? e.passiveId}`, 'passive');
        audio.play('buff');
        await say(`${label(e.side, e.uid)} : « ${e.text} »`, 500);
        break;
      }
      case 'message':
        await say(e.text, 450);
        break;
      case 'turnEnd':
      case 'end':
        break;
    }
  }

  /** Après un lot d'événements, s'assure que les sprites affichés correspondent à l'état. */
  async function syncSprites(): Promise<void> {
    for (const side of [0, 1] as const) {
      const unit = activeUnit(state, side);
      if (!unit.fainted && shown[side] !== unit.defId) {
        await withTimeout(scene.enter(side, unit.defId, unit.stars), undefined);
        shown[side] = unit.defId;
        huds[side].bind(viewOf(unit.uid));
      }
    }
    renderTeamStrip();
  }

  /** Recale les vues sur l'état du moteur (durées de statuts exactes, etc.). */
  function syncFromState(): void {
    for (const team of state.sides) for (const unit of team.units) views.set(unit.uid, snapshotUnit(unit));
    for (const side of [0, 1] as const) {
      activeIndex[side] = state.sides[side].active;
      const view = viewOf(activeUid(side));
      if (view.fainted) continue;
      huds[side].view = view;
      huds[side].updateHp();
      huds[side].updateChakra();
      huds[side].renderFx();
    }
    renderTeamStrip();
    renderTurn();
    renderSpeedHint();
  }

  // ---------- Menus de commande ----------
  let actionResolver: ((action: BattleAction | null) => void) | null = null;
  let menu: MenuState | null = null;
  let mainIndex = 0;
  let moveIndex = 0;

  function setMenu(
    items: HTMLButtonElement[],
    cols: number,
    opts: { back?: () => void; onFocus?: (i: number) => void; start?: number } = {},
  ): void {
    menu = { items, cols, index: 0, back: opts.back, onFocus: opts.onFocus };
    items.forEach((item, i) => item.addEventListener('pointerenter', () => focus(i, false)));
    focus(Math.max(0, Math.min(items.length - 1, opts.start ?? 0)), false);
  }

  function focus(index: number, withSound = true): void {
    if (!menu || !menu.items[index]) return;
    if (withSound && index !== menu.index) audio.play('hover');
    menu.index = index;
    menu.items.forEach((item, i) => item.classList.toggle('cur', i === index));
    menu.onFocus?.(index);
  }

  function setDockMode(mode: string, cls = ''): void {
    dock.dataset.mode = mode;
    menuBox.className = `menubox ${cls}`;
  }

  function menuItem(text: string, onClick: () => void, disabled = false): HTMLButtonElement {
    return h(
      'button',
      {
        class: 'mitem',
        disabled,
        onclick: () => {
          if (disabled) return;
          audio.play('click');
          onClick();
        },
      },
      text,
    );
  }

  function showMainMenu(): void {
    hideTooltip();
    huds[0].previewCost(0);
    msgText.textContent = `Que doit faire ${activeUnit(state, 0).name} ?`;
    caret.classList.add('hidden');
    const items = Object.values(state.sides[0].items).reduce((sum, n) => sum + n, 0);
    const entries = [
      menuItem('JUTSU', () => {
        mainIndex = 0;
        showJutsuMenu();
      }),
      menuItem(
        `OBJETS${items ? ` ×${items}` : ''}`,
        () => {
          mainIndex = 1;
          showItemMenu();
        },
        items === 0,
      ),
      menuItem(
        'SHINOBI',
        () => {
          mainIndex = 2;
          showPartyMenu(false);
        },
        benchOptions(state, 0).length === 0,
      ),
      menuItem(online ? 'ABANDON' : 'FUIR', () => void confirmForfeit()),
    ];
    clear(menuBox);
    menuBox.append(h('div', { class: 'menu-grid' }, ...entries));
    setDockMode('split', 'main');
    setMenu(entries, 2, { start: mainIndex });
  }

  async function confirmForfeit(): Promise<void> {
    const ok = await confirmDialog(
      online ? 'Abandonner le match ?' : 'Fuir le combat ?',
      online
        ? 'Le match sera compté comme une défaite (et vous perdrez des points en classé).'
        : 'Le combat sera compté comme une défaite.',
      online ? 'Abandonner' : 'Fuir',
    );
    if (ok && state.phase !== 'ended' && !ending) {
      controller.forfeit();
      cancelPrompts();
    }
  }

  /** Tout ce qu'il faut savoir avant de lancer un jutsu : efficacité, effets, dégâts estimés. */
  function describeJutsu(option: JutsuOption): JutsuPreview {
    const jutsu = option.jutsu;
    const me = activeUnit(state, 0);
    const foe = activeUnit(state, 1);
    const mult = jutsu.target === 'foe' && jutsu.power > 0 ? elementMultiplier(jutsu.element, foe.elements) : 1;
    const eff = effectivenessOf(mult);
    const ccBlocked =
      jutsu.effects.some(
        (fx) => fx.kind === 'status' && (fx.status === 'stun' || fx.status === 'sleep') && fx.target !== 'self',
      ) &&
      (foe.ccImmune > 0 || foe.statuses.some((s) => s.id === 'stun' || s.id === 'sleep'));
    const wakes = jutsu.power > 0 && jutsu.target === 'foe' && foe.statuses.some((s) => s.id === 'sleep');
    const tags: string[] = [];
    for (const fx of jutsu.effects) {
      if (fx.kind === 'status')
        tags.push(STATUSES[fx.status].name + (fx.chance < 1 ? ` ${Math.round(fx.chance * 100)}%` : ''));
      else if (fx.kind === 'heal') tags.push('Soin');
      else if (fx.kind === 'shield') tags.push('Bouclier');
      else if (fx.kind === 'protect') tags.push('Garde');
      else if (fx.kind === 'clone') tags.push('Clone');
      else if (fx.kind === 'detonate') tags.push('Explosion');
      else if (fx.kind === 'buff' && fx.target === 'self') {
        const stat = fx.stat === 'attack' ? 'ATK' : fx.stat === 'defense' ? 'DEF' : fx.stat === 'speed' ? 'VIT' : 'CRT';
        tags.push(`${stat}+${fx.stages}`);
      }
    }
    if (jutsu.priority > 0) tags.push(`Prio +${jutsu.priority}`);
    const estimate = estimateDamage(state, me, foe, jutsu);
    return {
      jutsu,
      me,
      foe,
      mult,
      eff,
      ccBlocked,
      wakes,
      tags,
      pct: estimate > 0 ? Math.round((Math.min(estimate, foe.hp) / foe.maxHp) * 100) : 0,
    };
  }

  function jutsuButton(option: JutsuOption, index: number): HTMLButtonElement {
    const { jutsu, eff } = describeJutsu(option);
    const btn = h(
      'button',
      {
        class: `mitem jitem ${eff}`,
        disabled: !option.usable,
        onclick: () => {
          if (!option.usable) return;
          moveIndex = index;
          audio.play('click');
          submitAction({ kind: 'jutsu', jutsuId: jutsu.id });
        },
        onpointerenter: () => huds[0].previewCost(option.cost),
        onpointerleave: () => huds[0].previewCost(0),
      },
      h('span', { class: 'elem-dot', style: { background: ELEMENTS[jutsu.element].color } }),
      h('span', { class: 'jname' }, jutsu.name),
      h('span', { class: 'jcost' }, jutsu.basic ? '+1' : `◆${option.cost}`),
    );
    tooltip(btn, () => `<b>${jutsu.name}</b>${jutsu.description}`);
    return btn;
  }

  function renderJutsuInfo(el: HTMLElement, option: JutsuOption): void {
    const { jutsu, me, mult, eff, ccBlocked, wakes, tags, pct } = describeJutsu(option);
    huds[0].previewCost(option.cost);
    clear(el);
    el.append(
      h(
        'div',
        { class: 'irow' },
        h('span', { class: 'ik' }, 'COÛT'),
        h('b', { class: 'ck' }, jutsu.basic ? '+1 ◆' : `◆${option.cost}`),
        h('span', { class: 'pct' }, `réserve ◆${me.chakra}`),
      ),
      h(
        'div',
        { class: 'irow' },
        h('span', { class: 'ik' }, 'TYPE/'),
        // Assombri : les couleurs claires (Taijutsu, Raiton) seraient illisibles sur le fond blanc du menu.
        h(
          'b',
          { style: { color: shade(ELEMENTS[jutsu.element].color, -0.35) } },
          ELEMENTS[jutsu.element].name.toUpperCase(),
        ),
      ),
      h(
        'div',
        { class: 'irow' },
        h('span', { class: 'ik' }, 'PUI'),
        h('b', null, jutsu.power > 0 ? `${jutsu.power}${jutsu.hits ? ` ×${jutsu.hits}` : ''}` : '—'),
        pct > 0 ? h('span', { class: 'pct' }, `≈${pct}% PV`) : null,
      ),
      h('div', { class: 'itags' }, tags.join(' · ')),
      h(
        'div',
        { class: 'ibadges' },
        eff === 'normal'
          ? null
          : h(
              'span',
              { class: `eff ${eff}` },
              eff === 'strong' ? `▲ EFFICACE ×${mult.toFixed(1)}` : `▼ FAIBLE ×${mult.toFixed(1)}`,
            ),
        ccBlocked ? h('span', { class: 'eff weak' }, 'IMMUNISÉ') : null,
        wakes ? h('span', { class: 'eff weak' }, 'RÉVEILLE') : null,
        option.usable
          ? null
          : h(
              'span',
              { class: 'eff bad' },
              option.reason === 'chakra'
                ? 'CHAKRA INSUFFISANT'
                : option.reason === 'silence'
                  ? 'SILENCE'
                  : 'EN RECHARGE',
            ),
      ),
    );
  }

  function showJutsuMenu(): void {
    hideTooltip();
    msgText.textContent = 'Quel jutsu ? Le coût en chakra ◆ est à droite.';
    const options = jutsuOptions(state, 0);
    const buttons = options.map((option, i) => jutsuButton(option, i));
    const info = h('div', { class: 'jinfo' });
    clear(menuBox);
    menuBox.append(h('div', { class: 'menu-grid moves' }, ...buttons), info);
    setDockMode('full', 'moves');
    setMenu(buttons, 2, { back: showMainMenu, onFocus: (i) => renderJutsuInfo(info, options[i]), start: moveIndex });
  }

  /** Choix d'un shinobi : volontaire (consomme le tour) ou forcé après un K.O. */
  function showPartyMenu(forced: boolean): void {
    hideTooltip();
    msgText.textContent = forced ? 'Qui envoyer au combat ?' : `Remplacer ${activeUnit(state, 0).name} par…`;
    huds[0].previewCost(0);
    const foe = activeUnit(state, 1);
    const entries: HTMLButtonElement[] = [];
    state.sides[0].units.forEach((unit, i) => {
      if (i === state.sides[0].active && !forced) return;
      const available = !unit.fainted && i !== state.sides[0].active;
      const threat = Math.max(...foe.elements.map((e) => elementMultiplier(e, unit.elements)));
      const offense = Math.max(
        ...unit.jutsus
          .map((id) => getJutsu(id))
          .filter((j) => j.power > 0)
          .map((j) => elementMultiplier(j.element, foe.elements)),
      );
      const hint =
        threat < 1
          ? { t: 'Résiste à l’ennemi', bad: false }
          : threat > 1
            ? { t: 'Vulnérable !', bad: true }
            : offense > 1
              ? { t: 'Avantage offensif', bad: false }
              : null;
      const hp = new Bar(unit.hp / unit.maxHp);
      entries.push(
        h(
          'button',
          {
            class: 'swap-opt',
            disabled: !available,
            onclick: () => {
              if (!available) return;
              audio.play('click');
              if (forced) submitReplace(i);
              else submitAction({ kind: 'swap', to: i });
            },
          },
          h('img', { src: portraitUrl(unit.defId), alt: '' }),
          h(
            'div',
            { class: 'info' },
            h('span', { class: 'n' }, `${unit.name} Nv${unit.level}`),
            hp.el,
            h('span', { class: 'sub' }, unit.fainted ? 'K.O.' : `${unit.hp}/${unit.maxHp} PV · ◆${unit.chakra}`),
            hint && !unit.fainted ? h('span', { class: `hint ${hint.bad ? 'bad' : ''}` }, hint.t) : null,
          ),
        ),
      );
    });
    const info = h(
      'div',
      { class: 'jinfo' },
      h('div', { class: 'itags' }, forced ? 'Choisis ton prochain shinobi.' : 'Changer de shinobi utilise ton tour.'),
    );
    const navItems = [...entries];
    if (!forced) {
      const back = menuItem('RETOUR', showMainMenu);
      back.classList.add('back');
      info.appendChild(back);
      navItems.push(back);
    }
    clear(menuBox);
    menuBox.append(h('div', { class: 'menu-grid swaps' }, ...entries), info);
    setDockMode('full', 'party');
    setMenu(navItems, navItems.length, { back: forced ? undefined : showMainMenu });
  }

  function showItemMenu(): void {
    hideTooltip();
    msgText.textContent = 'Quel objet utiliser ?';
    const info = h('div', { class: 'jinfo' });
    const items = Object.entries(state.sides[0].items).filter(([id, count]) => ITEMS[id] && count > 0);
    const entries = items.map(([id, count]) =>
      menuItem(`${ITEMS[id].name.toUpperCase()}  ×${count}`, () => submitAction({ kind: 'item', itemId: id })),
    );
    const back = menuItem('RETOUR', showMainMenu);
    back.classList.add('back');
    clear(menuBox);
    menuBox.append(h('div', { class: 'menu-grid list' }, ...entries, back), info);
    setDockMode('full', 'bag');
    setMenu([...entries, back], 1, {
      back: showMainMenu,
      onFocus: (i) => {
        clear(info);
        const item = items[i];
        info.appendChild(h('div', { class: 'itags' }, item ? ITEMS[item[0]].description : 'Revenir au menu.'));
      },
    });
  }

  function clearMenu(): void {
    menu = null;
    clear(menuBox);
    setDockMode('message');
    huds[0].previewCost(0);
    hideTooltip();
  }

  function submitAction(action: BattleAction | null): void {
    if (!actionResolver) return;
    const resolve = actionResolver;
    actionResolver = null;
    stopDeadline();
    clearMenu();
    resolve(action);
  }

  let replaceResolver: ((index: number) => void) | null = null;

  function submitReplace(index: number): void {
    if (!replaceResolver) return;
    const resolve = replaceResolver;
    replaceResolver = null;
    stopDeadline();
    clearMenu();
    resolve(index);
  }

  /** Annule une demande en cours (abandon, fin de match, fermeture de l'écran). */
  function cancelPrompts(): void {
    if (actionResolver) submitAction(null);
    if (replaceResolver) submitReplace(-1);
  }

  let deadlineTimer: number | null = null;

  /** Compte à rebours du tour en PvP (le serveur joue l'attaque de base à l'échéance). */
  function startDeadline(deadline?: number): void {
    stopDeadline();
    if (!deadline) return;
    const update = () => {
      const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      turnCounter.textContent = `⏱ ${left}s`;
      turnCounter.classList.toggle('last', left <= 8);
    };
    update();
    deadlineTimer = window.setInterval(update, 250);
  }

  function stopDeadline(): void {
    if (deadlineTimer) window.clearInterval(deadlineTimer);
    deadlineTimer = null;
    renderTurn();
  }

  function promptAction(deadline?: number): Promise<BattleAction | null> {
    showMainMenu();
    startDeadline(deadline);
    return new Promise((resolve) => (actionResolver = resolve));
  }

  /** Clavier : flèches, Entrée/Espace/Z pour valider, Échap/X pour revenir, 1-4 pour les jutsus, S et I. */
  const onKey = (e: KeyboardEvent) => {
    if (document.querySelector('.modal-backdrop')) return;
    const key = e.key;
    const lower = key.toLowerCase();
    if (!menu) {
      if (key === ' ' || key === 'Enter' || lower === 'z') {
        skipMessage?.();
        e.preventDefault();
      }
      return;
    }
    if (actionResolver) {
      const digit = Number(key);
      if (digit >= 1 && digit <= 4) {
        const option = jutsuOptions(state, 0)[digit - 1];
        if (option?.usable) {
          moveIndex = digit - 1;
          audio.play('click');
          submitAction({ kind: 'jutsu', jutsuId: option.jutsu.id });
        } else {
          audio.play('error');
        }
        e.preventDefault();
        return;
      }
      if (lower === 's' && benchOptions(state, 0).length) return showPartyMenu(false);
      if (lower === 'i' && Object.values(state.sides[0].items).some((n) => n > 0)) return showItemMenu();
    }
    const { cols, index, items } = menu;
    let next: number;
    if (key === 'ArrowRight') next = index % cols < cols - 1 && index + 1 < items.length ? index + 1 : index;
    else if (key === 'ArrowLeft') next = index % cols > 0 ? index - 1 : index;
    else if (key === 'ArrowDown') next = index + cols < items.length ? index + cols : index;
    else if (key === 'ArrowUp') next = index - cols >= 0 ? index - cols : index;
    else if (key === 'Enter' || key === ' ' || lower === 'z') {
      const item = items[index];
      if (item?.disabled) audio.play('error');
      else item?.click();
      e.preventDefault();
      return;
    } else if (key === 'Escape' || key === 'Backspace' || lower === 'x') {
      if (menu.back) {
        audio.play('back');
        menu.back();
      }
      e.preventDefault();
      return;
    } else return;
    e.preventDefault();
    focus(next);
  };
  document.addEventListener('keydown', onKey);

  function showTutorialTip(): void {
    if (!tutorial) return;
    const text = TUTORIAL_TIPS[state.turn - 1];
    tip.classList.toggle('hidden', !text);
    if (text) tip.textContent = `💡 ${text}`;
  }

  function openPauseMenu(): void {
    const close = openModal(
      h(
        'div',
        { class: 'narrow' },
        h('h2', null, 'Pause'),
        h(
          'div',
          { class: 'row wrap-r', style: 'margin:10px 0' },
          'Vitesse :',
          ...[1, 1.5, 2].map((value) =>
            button(
              `×${value}`,
              () => {
                game.updateSettings({ battleSpeed: value });
                scene.opts.speed = value;
                close();
              },
              { size: 'small', variant: settings.battleSpeed === value ? 'gold' : '' },
            ),
          ),
        ),
        h(
          'div',
          { class: 'row wrap-r', style: 'margin-top:14px' },
          button('Reprendre', () => close(), { variant: 'blue' }),
          button(
            replay ? 'Quitter le replay' : 'Abandonner',
            () => {
              close();
              if (replay) return navigate('profile', {}, { replace: true });
              if (state.phase !== 'ended' && !ending) {
                controller.forfeit();
                cancelPrompts();
              }
            },
            { variant: 'primary' },
          ),
        ),
      ),
    );
  }

  // ---------- Fin de combat ----------
  let ending = false;

  async function finish(end: MatchEnd | null): Promise<void> {
    if (ending) return;
    ending = true;
    stopDeadline();
    clearMenu();
    const winner = end ? (end.winner === 'draw' ? 'draw' : end.winner === online!.found.you ? 0 : 1) : state.winner;
    const reason = end?.reason ?? state.endReason;
    const won = winner === 0;
    if (reason === 'turnLimit') await say('Limite de tours atteinte ! Départage : shinobis restants puis PV.', 900);
    if (reason === 'forfeit') await say(won ? "L'adversaire abandonne !" : 'Vous abandonnez le combat.', 500);
    audio.playMusic(null);
    audio.play(won ? 'victory' : 'defeat');
    await say(won ? 'Victoire !' : winner === 'draw' ? 'Match nul.' : 'Défaite…', 600);
    if (end) return showPvpResult(won, winner === 'draw', end);
    if (replay) return showReplayEnd(won, winner === 'draw', state.phase !== 'ended');
    const rewards = game.completeBattle(pending!, state);
    if (won && tutorial) game.completeTutorial();
    showPveResult(won, rewards);
  }

  function showPveResult(won: boolean, rewards: BattleRewards): void {
    const ryoEl = h('span', null, '0');
    const units = rewards.unitXp.map((gain) => {
      const owned = game.profile.collection[gain.defId];
      const xpBar = new Bar(0, 'xp');
      const row = h(
        'div',
        { class: 'unit' },
        h('img', { src: portraitUrl(gain.defId) }),
        h(
          'div',
          null,
          h(
            'div',
            { class: 'row' },
            h('b', { class: 'px-font', style: 'font-size:9px' }, getShinobi(gain.defId).name),
            h('span', { class: 'spacer' }),
            h('span', { style: 'font-size:13px' }, `Nv ${gain.newLevel} · +${gain.xp} XP`),
            gain.levelsGained > 0 ? h('span', { class: 'lvup' }, 'NIVEAU +!') : null,
          ),
          xpBar.el,
        ),
      );
      setTimeout(() => xpBar.set(owned.xp / xpToNext(owned.level)), 500);
      return row;
    });
    const firstClear = rewards.firstClear;
    const packs = Object.entries(firstClear?.packs ?? {});
    const close = openModal(
      h(
        'div',
        { class: 'result' },
        h(
          'div',
          { class: `big ${won ? 'win' : 'lose'}` },
          won ? 'VICTOIRE !' : state.winner === 'draw' ? 'ÉGALITÉ' : 'DÉFAITE',
        ),
        h(
          'div',
          { class: 'rw' },
          h('span', {
            class: 'gem',
            style:
              'width:14px;height:14px;display:inline-block;background:#f0c050;clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%)',
          }),
          '+',
          ryoEl,
          ' Ryō',
        ),
        rewards.passXp
          ? h(
              'div',
              { class: 'dim', style: 'font-size:14px;margin-top:-4px' },
              `+${rewards.passXp} XP de passe de combat`,
            )
          : null,
        h('div', { class: 'units' }, ...units),
        firstClear
          ? h(
              'div',
              { class: 'first-clear' },
              h('div', { class: 'px-font', style: 'color:var(--gold);margin-bottom:6px' }, '★ PREMIÈRE VICTOIRE ★'),
              ...Object.entries(firstClear.currencies ?? {}).map(([currency, amount]) =>
                h(
                  'div',
                  null,
                  `+${amount} ${currency === 'ryo' ? 'Ryō' : currency === 'jade' ? 'Jade' : 'Points de chaîne'}`,
                ),
              ),
              ...packs.map(([packId, count]) =>
                h(
                  'div',
                  null,
                  `+${count} parchemin ${packId === 'elite' ? 'Kage' : packId === 'starter' ? "de l'Académie" : 'Shinobi'} !`,
                ),
              ),
            )
          : null,
        h(
          'div',
          { class: 'actions' },
          packs.length
            ? button(
                'Ouvrir le parchemin !',
                () => {
                  close();
                  navigate('packs', { autoOpen: packs[0][0] });
                },
                { variant: 'gold', size: 'big' },
              )
            : null,
          trainingMode
            ? button(
                'Nouveau rival',
                () => {
                  close();
                  const setup = game.prepareTraining(trainingMode);
                  if (setup) navigate('battle', { pending: setup, ai }, { replace: true });
                },
                { variant: 'primary' },
              )
            : null,
          !won && pending?.stageId
            ? button(
                'Réessayer',
                () => {
                  close();
                  const setup = game.prepareStageBattle(pending.stageId!);
                  if (setup) navigate('battle', { pending: setup, ai }, { replace: true });
                },
                { variant: 'primary' },
              )
            : null,
          button(
            tutorial && won ? 'Continuer' : 'Retour',
            () => {
              close();
              navigate(tutorial ? 'home' : trainingMode ? 'ranking' : 'arenas');
            },
            { variant: packs.length ? '' : 'blue' },
          ),
        ),
      ),
      { dark: true, closable: false },
    );
    setTimeout(() => {
      void countUp(ryoEl, 0, rewards.ryo, 800);
      void flyCurrency(ryoEl, 'ryo', 5);
      if (rewards.unitXp.some((u) => u.levelsGained > 0)) setTimeout(() => audio.play('levelup'), 700);
    }, 400);
  }

  function showPvpResult(won: boolean, draw: boolean, end: MatchEnd): void {
    const found = online!.found;
    const ranked = found.mode === 'ranked';
    game.recordPvp({
      mode: found.mode,
      result: draw ? 'draw' : won ? 'win' : 'loss',
      opponent: enemyName,
      team: state.sides[0].units.map((u) => u.defId),
      enemyTeam: state.sides[1].units.map((u) => u.defId),
      turns: state.turn,
      mmrDelta: end.mmrDelta,
      mmr: end.mmr,
      ryo: end.rewards.ryo,
      stats: { jutsus: state.stats.jutsusUsed[0], swaps: state.stats.swaps[0], crits: state.stats.crits[0] },
      replay: { v: 1, mode: found.mode, you: found.you, ...end.replay },
    });
    const ryoEl = h('span', null, '0');
    const league = leagueFor(end.mmr);
    const close = openModal(
      h(
        'div',
        { class: 'result' },
        h('div', { class: `big ${won ? 'win' : 'lose'}` }, draw ? 'ÉGALITÉ' : won ? 'VICTOIRE !' : 'DÉFAITE'),
        h('div', { class: 'rw' }, h('span', { class: 'gem', style: 'background:#f0c050' }), '+', ryoEl, ' Ryō'),
        h(
          'div',
          { class: 'dim', style: 'font-size:14px;margin-top:-4px' },
          `+${won ? PASS_XP.win : PASS_XP.loss} XP de passe de combat`,
        ),
        ranked
          ? h(
              'div',
              { class: 'rw' },
              h(
                'span',
                { class: 'chip', style: { background: league.color, color: '#1a1420', textShadow: 'none' } },
                league.name,
              ),
              `${end.mmrDelta >= 0 ? '+' : ''}${end.mmrDelta} points`,
            )
          : h(
              'div',
              { class: 'dim', style: 'font-size:14px' },
              found.vsBot ? 'Match amical contre une IA du serveur.' : 'Match amical : pas de classement.',
            ),
        h(
          'div',
          { class: 'actions' },
          button(
            'Rejouer',
            () => {
              close();
              navigate('ranking', { autoQueue: found.mode }, { replace: true });
            },
            { variant: 'primary' },
          ),
          button(
            'Retour',
            () => {
              close();
              navigate('ranking', {}, { replace: true });
            },
            { variant: 'blue' },
          ),
        ),
      ),
      { dark: true, closable: false },
    );
    setTimeout(() => {
      void countUp(ryoEl, 0, end.rewards.ryo, 800);
      void flyCurrency(ryoEl, 'ryo', 5);
    }, 400);
  }

  function showReplayEnd(won: boolean, draw: boolean, forfeited: boolean): void {
    const close = openModal(
      h(
        'div',
        { class: 'result' },
        h('div', { class: 'px-font', style: 'color:var(--text-dim)' }, 'FIN DU REPLAY'),
        h('div', { class: `big ${won ? 'win' : 'lose'}` }, draw ? 'ÉGALITÉ' : won ? 'VICTOIRE' : 'DÉFAITE'),
        forfeited
          ? h('div', { class: 'dim', style: 'font-size:14px' }, 'Le combat s’est terminé par un abandon.')
          : null,
        h(
          'div',
          { class: 'actions' },
          button(
            '▶ Revoir',
            () => {
              close();
              navigate('battle', { replay }, { replace: true });
            },
            { variant: 'blue' },
          ),
          button(
            'Retour',
            () => {
              close();
              navigate('profile', {}, { replace: true });
            },
            {},
          ),
        ),
      ),
      { dark: true, closable: false },
    );
  }

  function renderReplayBar(): void {
    clear(replayBar);
    replayBar.classList.remove('hidden');
    const speeds = [1, 1.5, 3];
    const speedBtn = button(
      `⏩ ×${replaySpeed}`,
      () => {
        replaySpeed = speeds[(speeds.indexOf(replaySpeed) + 1) % speeds.length];
        scene.opts.speed = settings.battleSpeed * replaySpeed;
        speedBtn.textContent = `⏩ ×${replaySpeed}`;
      },
      { variant: 'blue' },
    );
    replayBar.append(
      h('span', { class: 'rb-label' }, 'REPLAY — rejoué à l’identique par le moteur déterministe'),
      speedBtn,
      button('✕ Quitter', () => navigate('profile', {}, { replace: true }), {
        variant: 'dark',
        sfx: 'back',
        size: 'small',
      }),
    );
  }

  // ---------- Boucle principale ----------
  async function run(): Promise<void> {
    await scene.ready;
    renderTurn();
    renderTeamStrip();
    if (replay) renderReplayBar();
    if (online?.found.resumed) {
      await syncSprites();
      await say('Reprise du combat en cours…', 500);
    } else {
      await withTimeout(scene.intro(), undefined, 3000);
      scene.finishIntro();
      await say(online ? `${enemyName} relève le défi !` : `${enemyName} vous défie !`, 500);
    }
    while (!disposed) {
      const step = await controller.next();
      if (disposed) return;
      switch (step.kind) {
        case 'events':
          await playEvents(step.events);
          step.apply?.();
          syncFromState();
          await syncSprites();
          break;
        case 'info':
          await say(step.text, 450);
          break;
        case 'needAction': {
          if (ending) break;
          showTutorialTip();
          const action = await promptAction(step.deadline);
          tip.classList.add('hidden');
          if (action && !disposed && !ending) controller.act(action);
          break;
        }
        case 'needReplace': {
          if (ending) break;
          showPartyMenu(true);
          startDeadline(step.deadline);
          const index = await new Promise<number>((resolve) => (replaceResolver = resolve));
          if (index >= 0 && !disposed && !ending) controller.replace(index);
          break;
        }
        case 'ended':
          await finish(step.end);
          return;
      }
    }
  }

  // En PvP, le serveur peut résoudre le tour sans nous (délai dépassé) : on ferme alors le menu.
  const unsubscribe = online
    ? pvp.on((m) => {
        if (!('matchId' in m) || m.matchId !== online.found.matchId) return;
        if (m.t === 'end') return cancelPrompts();
        if (m.t === 'events') {
          if (actionResolver && m.events.some((ev) => ev.t === 'turnStart')) submitAction(null);
          if (replaceResolver && m.events.some((ev) => ev.t === 'swapIn' && ev.side === online.found.you))
            submitReplace(-1);
        }
      })
    : () => undefined;

  if (controller instanceof LocalBattleController) {
    const local = controller;
    window.__battleWin = () => {
      if (state.phase === 'ended' || ending) return;
      game.debugWinUsed = true;
      local.devWin();
      cancelPrompts();
    };
  }

  void run();
  return {
    el: root,
    music: 'battle',
    destroy: () => {
      if (online && !ending) controller.forfeit();
      disposed = true;
      stopDeadline();
      unsubscribe();
      controller.dispose();
      window.clearInterval(tickTimer);
      document.removeEventListener('keydown', onKey);
      delete window.__battleWin;
      skipMessage?.();
      cancelPrompts();
      phaserGame?.destroy(true);
    },
  };
}
