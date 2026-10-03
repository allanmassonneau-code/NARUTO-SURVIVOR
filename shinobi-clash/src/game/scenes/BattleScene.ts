import Phaser from 'phaser';
import type { Side } from '../../core/types';
import { animationFor, type JutsuAnimation } from '../gfx/animations';
import { buildArena, FIELD_H, FIELD_W, PADS } from '../gfx/backgrounds';
import { spriteCanvas } from '../gfx/sprites';

/** Position des pieds de chaque combattant (camp 0 = joueur en bas à gauche, camp 1 = adversaire). */
const FEET: Record<Side, { x: number; y: number }> = { 0: { x: 64, y: 118 }, 1: { x: 176, y: 62 } };
/** Centre du corps : cible des projectiles et des impacts. */
const CENTER: Record<Side, { x: number; y: number }> = { 0: { x: 64, y: 94 }, 1: { x: 176, y: 38 } };

export interface BattleSceneOptions {
  bg: string;
  /** Multiplicateur de vitesse (réglage « vitesse de combat »). */
  speed: number;
  reduceMotion: boolean;
  reduceShake: boolean;
}

export interface ImpactInfo {
  crit: boolean;
  tier: number;
  hitIndex: number;
  strong: boolean;
  weak: boolean;
}

interface BurstOptions {
  speed?: [number, number];
  angle?: [number, number];
  gravity?: number;
}

type Tween = Phaser.Types.Tweens.TweenBuilderConfig & { duration: number };
type Destroyable = Phaser.GameObjects.GameObject;

/**
 * Terrain de combat 240×160 : décor, sprites, attaques, impacts et effets.
 * La scène ne connaît pas les règles : le présentateur de combat lui demande de jouer chaque événement.
 * Toutes les durées passent par `wait`/`tw` pour respecter la vitesse de combat choisie.
 */
export class BattleScene extends Phaser.Scene {
  private sprites: [Phaser.GameObjects.Image | null, Phaser.GameObjects.Image | null] = [null, null];
  private idle: [Phaser.Time.TimerEvent | null, Phaser.Time.TimerEvent | null] = [null, null];
  private defIds: [string | null, string | null] = [null, null];
  private shadows: [Phaser.GameObjects.Ellipse | null, Phaser.GameObjects.Ellipse | null] = [null, null];
  private auras: [
    Phaser.GameObjects.Particles.ParticleEmitter | null,
    Phaser.GameObjects.Particles.ParticleEmitter | null,
  ] = [null, null];
  private glows: [Phaser.GameObjects.Ellipse | null, Phaser.GameObjects.Ellipse | null] = [null, null];
  private overlays: Destroyable[] = [];
  private pads: Phaser.GameObjects.Image[] = [];
  private introBars: Phaser.GameObjects.Rectangle[] = [];
  private dimRect!: Phaser.GameObjects.Rectangle;
  private readyResolve!: () => void;
  readonly ready: Promise<void>;

  constructor(readonly opts: BattleSceneOptions) {
    super('battle');
    this.ready = new Promise((resolve) => (this.readyResolve = resolve));
  }

  create(): void {
    this.pads = buildArena(this, this.opts.bg).pads;
    const g = this.add.graphics();
    g.fillStyle(0xffffff);
    g.fillRect(0, 0, 2, 2);
    g.generateTexture('px', 2, 2);
    g.clear();
    g.fillCircle(4, 4, 4);
    g.generateTexture('dot', 8, 8);
    g.destroy();
    this.dimRect = this.add.rectangle(0, 0, FIELD_W, FIELD_H, 0, 1).setOrigin(0).setAlpha(0).setDepth(5);
    this.readyResolve();
  }

  wait(ms: number): Promise<void> {
    return new Promise((resolve) => this.time.delayedCall(ms / this.opts.speed, () => resolve()));
  }

  tw(config: Tween): Promise<void> {
    return new Promise((resolve) => {
      this.tweens.add({ ...config, duration: config.duration / this.opts.speed, onComplete: () => resolve() });
    });
  }

  /** Texture du sprite (de dos pour le joueur, de face pour l'adversaire), générée à la demande. */
  private texture(defId: string, side: Side, frame = 0): string {
    const view = side === 0 ? 'back' : 'front';
    const key = `sh-${defId}-${view}-${frame}`;
    if (!this.textures.exists(key)) this.textures.addCanvas(key, spriteCanvas(defId, view, frame));
    return key;
  }

  /** Position (en % du terrain) au-dessus de la tête d'un combattant, pour placer les textes DOM. */
  static anchor(side: Side): { x: number; y: number } {
    return { x: (CENTER[side].x / FIELD_W) * 100, y: ((CENTER[side].y - 18) / FIELD_H) * 100 };
  }

  /** Volets d'ouverture puis glissement des estrades, comme à l'entrée d'un combat GBA. */
  async intro(): Promise<void> {
    const [playerPad, enemyPad] = this.pads;
    if (!playerPad || !enemyPad || this.opts.reduceMotion) return;
    const bars = this.introBars;
    for (let i = 0; i < 8; i++) {
      bars.push(
        this.add
          .rectangle(0, i * 20, FIELD_W, 20, 0x14121e)
          .setOrigin(0)
          .setDepth(9),
      );
    }
    playerPad.x = FIELD_W + PADS.player.rx;
    enemyPad.x = -PADS.enemy.rx;
    await this.wait(120);
    await Promise.all(
      bars.map((bar, i) =>
        this.tw({ targets: bar, x: i % 2 ? FIELD_W : -FIELD_W, duration: 340, ease: 'Quad.easeIn' }),
      ),
    );
    bars.forEach((bar) => this.kill(bar));
    bars.length = 0;
    await Promise.all([
      this.tw({ targets: playerPad, x: PADS.player.x, duration: 620, ease: 'Quad.easeOut' }),
      this.tw({ targets: enemyPad, x: PADS.enemy.x, duration: 620, ease: 'Quad.easeOut' }),
    ]);
  }

  /** Termine l'intro immédiatement (combat relancé ou passé). */
  finishIntro(): void {
    this.introBars.forEach((bar) => this.kill(bar));
    this.introBars.length = 0;
    const [playerPad, enemyPad] = this.pads;
    for (const [pad, x] of [
      [playerPad, PADS.player.x],
      [enemyPad, PADS.enemy.x],
    ] as const) {
      if (!pad) continue;
      this.tweens.killTweensOf(pad);
      pad.x = x;
    }
  }

  /** Entrée en scène avec nuage de fumée ; un shinobi éveillé (★5) a une aura dorée. */
  async enter(side: Side, defId: string, stars = 1): Promise<void> {
    const previous = this.sprites[side];
    if (previous) this.kill(previous);
    this.clearDecor(side);
    this.stopIdle(side);
    const sprite = this.add
      .image(FEET[side].x, FEET[side].y, this.texture(defId, side))
      .setOrigin(0.5, 1)
      .setDepth(side === 0 ? 3 : 2);
    this.sprites[side] = sprite;
    this.defIds[side] = defId;
    this.shadows[side] = this.add
      .ellipse(FEET[side].x, FEET[side].y - 1, side === 0 ? 30 : 24, 5, 0, 0.28)
      .setDepth(sprite.depth - 1);
    if (stars >= 5 && !this.opts.reduceMotion) {
      this.auras[side] = this.add
        .particles(0, 0, 'px', {
          follow: sprite,
          followOffset: { x: 0, y: -22 },
          emitZone: {
            type: 'random' as const,
            source: new Phaser.Geom.Ellipse(
              0,
              0,
              30,
              40,
            ) as unknown as Phaser.Types.GameObjects.Particles.RandomZoneSource,
          },
          lifespan: 1000,
          speedY: { min: -24, max: -8 },
          scale: { start: 1.5, end: 0 },
          alpha: { start: 1, end: 0 },
          tint: [0xffe28a, 0xf0b429, 0xffffff],
          frequency: 60,
        })
        .setDepth(sprite.depth + 1);
      const glow = this.add.ellipse(FEET[side].x, FEET[side].y - 22, 36, 50, 0xf0b429, 0.16).setDepth(sprite.depth - 1);
      this.tweens.add({ targets: glow, alpha: 0.32, scaleX: 1.08, duration: 900, yoyo: true, repeat: -1 });
      this.glows[side] = glow;
    }
    this.poof(CENTER[side].x, CENTER[side].y, 0xffffff);
    sprite.setScale(0.2, 1.6).setAlpha(0);
    await this.tw({ targets: sprite, scaleX: 1, scaleY: 1, alpha: 1, duration: 260, ease: 'Back.easeOut' });
    this.startIdle(side);
  }

  async exit(side: Side): Promise<void> {
    const sprite = this.sprites[side];
    if (!sprite) return;
    this.stopIdle(side);
    this.clearDecor(side);
    this.poof(CENTER[side].x, CENTER[side].y, 0xd8d8d8);
    await this.tw({ targets: sprite, scaleX: 0.1, scaleY: 1.4, alpha: 0, duration: 200, ease: 'Quad.easeIn' });
    this.kill(sprite);
    this.sprites[side] = null;
  }

  private clearDecor(side: Side): void {
    this.shadows[side]?.destroy();
    this.shadows[side] = null;
    this.auras[side]?.destroy();
    this.auras[side] = null;
    const glow = this.glows[side];
    if (glow) this.kill(glow);
    this.glows[side] = null;
  }

  /** Respiration : alterne les deux frames du sprite. */
  private startIdle(side: Side): void {
    const sprite = this.sprites[side];
    const defId = this.defIds[side];
    if (!sprite || !defId || this.opts.reduceMotion) return;
    let frame = 0;
    this.idle[side] = this.time.addEvent({
      delay: 520,
      startAt: side * 260,
      loop: true,
      callback: () => {
        frame = frame === 0 ? 1 : 0;
        sprite.setTexture(this.texture(defId, side, frame));
      },
    });
  }

  private stopIdle(side: Side): void {
    this.idle[side]?.remove(false);
    this.idle[side] = null;
    const sprite = this.sprites[side];
    const defId = this.defIds[side];
    if (sprite && defId && sprite.active) sprite.setTexture(this.texture(defId, side, 0));
  }

  private pauseIdle(side: Side, paused: boolean): void {
    const timer = this.idle[side];
    if (timer) timer.paused = paused;
    const sprite = this.sprites[side];
    const defId = this.defIds[side];
    if (paused && sprite && defId) sprite.setTexture(this.texture(defId, side, 0));
    this.shadows[side]?.setVisible(!paused);
    this.glows[side]?.setVisible(!paused);
  }

  /**
   * Anticipation (écrasement), concentration éventuelle, puis livraison selon l'animation :
   * ruée au contact, projectiles, rayon, ombre rampante… Renvoie l'animation pour l'impact.
   */
  async attack(side: Side, animationId: string, tier: number, hasTarget: boolean): Promise<JutsuAnimation> {
    const anim = animationFor(animationId);
    const sprite = this.sprites[side];
    const foe: Side = side === 0 ? 1 : 0;
    if (!sprite) return anim;
    this.pauseIdle(side, true);
    if (tier === 2 && anim.screenTint !== undefined) await this.dim(0.55, anim.screenTint);
    const dir = side === 0 ? 1 : -1;
    await this.tw({
      targets: sprite,
      scaleX: 1.12,
      scaleY: 0.88,
      x: FEET[side].x - dir * 3,
      duration: 110,
      ease: 'Quad.easeOut',
    });
    if (anim.charge) await this.charge(side, anim, tier === 2 ? 650 : 380);
    await this.tw({ targets: sprite, scaleX: 1, scaleY: 1, duration: 70 });
    if (!hasTarget || anim.delivery === 'self') {
      await this.selfFx(side, anim);
      return anim;
    }
    const from = CENTER[side];
    const to = CENTER[foe];
    switch (anim.delivery) {
      case 'melee': {
        const destX = to.x - dir * 22;
        const destY = FEET[foe].y + (side === 0 ? 4 : -4);
        this.trail(sprite, anim.color2);
        await this.tw({ targets: sprite, x: destX, y: destY, duration: 150, ease: 'Quad.easeIn' });
        if (anim.special === 'lightning') this.bolt(destX, destY - 24, to.x, to.y, anim.color);
        break;
      }
      case 'projectile': {
        const size = anim.size ?? 3;
        const count = animationId === 'fireballs' ? 4 : 1;
        const flights: Promise<void>[] = [];
        for (let k = 0; k < count; k++) {
          const orb = this.add.circle(from.x + dir * 10, from.y - 6, size, anim.color).setDepth(4);
          const core = this.add.circle(from.x + dir * 10, from.y - 6, Math.max(1, size / 2), anim.color2).setDepth(4);
          const trail = this.add
            .particles(0, 0, 'px', {
              follow: orb,
              lifespan: 260,
              speed: 10,
              scale: { start: 1, end: 0 },
              tint: [anim.color, anim.color2],
              frequency: 18,
            })
            .setDepth(3);
          flights.push(
            (async () => {
              await this.wait(k * 90);
              await this.tw({
                targets: [orb, core],
                x: to.x + (k - 1.5) * 4 * (count > 1 ? 1 : 0),
                y: to.y - 2,
                duration: 260 + size * 12,
                ease: 'Sine.easeIn',
              });
              trail.stopFollow();
              trail.stop();
              this.kill(orb);
              this.kill(core);
              this.time.delayedCall(300, () => trail.destroy());
            })(),
          );
        }
        await flights[0];
        break;
      }
      case 'beam':
        this.bolt(from.x + dir * 10, from.y - 6, to.x, to.y, anim.color);
        await this.wait(90);
        break;
      case 'ground':
        if (anim.special === 'shadow') {
          const shadow = this.add
            .rectangle(from.x, FEET[side].y - 2, 2, 3, anim.color)
            .setOrigin(side === 0 ? 0 : 1, 0.5)
            .setDepth(1);
          const length = Math.hypot(to.x - from.x, FEET[foe].y - FEET[side].y);
          shadow.setRotation(Math.atan2(FEET[foe].y - FEET[side].y, to.x - from.x) + (side === 0 ? 0 : Math.PI));
          await this.tw({ targets: shadow, displayWidth: length, duration: 320, ease: 'Quad.easeOut' });
          this.overlays.push(shadow);
          this.time.delayedCall(900 / this.opts.speed, () => shadow.destroy());
        } else {
          await this.wait(120);
        }
        this.burst(to.x, FEET[foe].y - 4, anim.color, anim.color2, anim.burst ?? 16, {
          speed: [30, 90],
          angle: [240, 300],
          gravity: 160,
        });
        break;
      case 'onTarget':
        await this.wait(80);
        break;
    }
    return anim;
  }

  /** Impact : particules, effet spécial, secousse, flash et « hit stop » blanc sur la cible. */
  async impact(side: Side, anim: JutsuAnimation, info: ImpactInfo): Promise<void> {
    const sprite = this.sprites[side];
    const center = CENTER[side];
    const heavy = info.crit || info.tier === 2;
    const particles = Math.round((anim.burst ?? 10) * (info.hitIndex > 0 ? 0.5 : 1) * (heavy ? 1.4 : 1));
    this.burst(center.x, center.y, anim.color, anim.color2, particles, { speed: [40, heavy ? 150 : 100] });
    this.special(side, anim);
    if (!this.opts.reduceShake) {
      const intensity = info.crit ? 0.03 : info.strong ? 0.02 : info.weak ? 0.006 : 0.012;
      this.cameras.main.shake((heavy ? 260 : 140) / this.opts.speed, intensity);
    }
    if (heavy) this.cameras.main.flash(90, 255, 255, 255);
    if (sprite) {
      sprite.setTintFill(0xffffff);
      await this.wait(heavy ? 110 : 60);
      sprite.clearTint();
      const recoil = side === 0 ? -1 : 1;
      await this.tw({ targets: sprite, x: FEET[side].x + recoil * 4, duration: 50, yoyo: true, repeat: 1 });
      sprite.x = FEET[side].x;
    }
  }

  async returnHome(side: Side): Promise<void> {
    const sprite = this.sprites[side];
    if (!sprite) return;
    await this.tw({
      targets: sprite,
      x: FEET[side].x,
      y: FEET[side].y,
      scaleX: 1,
      scaleY: 1,
      duration: 180,
      ease: 'Quad.easeOut',
    });
    this.pauseIdle(side, false);
    await this.dim(0);
  }

  /** Esquive : pas de côté translucide. */
  async miss(side: Side): Promise<void> {
    const sprite = this.sprites[side];
    if (!sprite) return;
    const dir = side === 0 ? -1 : 1;
    await this.tw({ targets: sprite, x: FEET[side].x + dir * 12, alpha: 0.5, duration: 90, yoyo: true });
    sprite.alpha = 1;
  }

  async faint(side: Side): Promise<void> {
    const sprite = this.sprites[side];
    if (!sprite) return;
    this.stopIdle(side);
    this.clearDecor(side);
    sprite.setTintFill(0xffffff);
    await this.wait(80);
    sprite.clearTint();
    await this.tw({ targets: sprite, y: FEET[side].y + 30, alpha: 0, duration: 420, ease: 'Quad.easeIn' });
    this.kill(sprite);
    this.sprites[side] = null;
  }

  heal(side: Side): void {
    const c = CENTER[side];
    this.burst(c.x, c.y + 10, 0x78f078, 0xe0ffe0, 14, { speed: [10, 40], angle: [250, 290], gravity: -60 });
  }

  /** Gain (vers le haut, bleu) ou perte (vers le bas, violet) de chakra. */
  chakra(side: Side, gain: boolean): void {
    const c = CENTER[side];
    this.burst(c.x, c.y, gain ? 0x4ab0ff : 0x9a4fd0, 0xffffff, 8, {
      speed: [15, 45],
      angle: gain ? [250, 290] : [70, 110],
      gravity: gain ? -40 : 60,
    });
  }

  explosion(side: Side): void {
    const sprite = this.sprites[side];
    const c = CENTER[side];
    this.burst(c.x, c.y, 0xf8a030, 0xfff0a0, 34, { speed: [50, 160] });
    this.burst(c.x, c.y + 6, 0x5a4a4a, 0x8a7a6a, 14, { speed: [10, 40], angle: [240, 300], gravity: -30 });
    if (!this.opts.reduceShake) this.cameras.main.shake(300 / this.opts.speed, 0.028);
    this.cameras.main.flash(120, 255, 200, 120);
    if (sprite) {
      sprite.setTintFill(0xffd080);
      this.time.delayedCall(140 / this.opts.speed, () => sprite.clearTint());
    }
  }

  statusPulse(side: Side, color: number): void {
    const sprite = this.sprites[side];
    const c = CENTER[side];
    this.burst(c.x, c.y, color, 0xffffff, 10, { speed: [20, 50] });
    if (sprite) {
      sprite.setTint(color);
      this.time.delayedCall(260 / this.opts.speed, () => sprite.clearTint());
    }
  }

  /** Flèches qui montent (buff) ou descendent (débuff). */
  buff(side: Side, up: boolean): void {
    const c = CENTER[side];
    const color = up ? 0xf8d048 : 0x6a8aff;
    for (let i = 0; i < 3; i++) {
      const arrow = this.add
        .triangle(c.x - 10 + i * 10, c.y + (up ? 10 : -14), 0, up ? 6 : 0, 3, up ? 0 : 6, 6, up ? 6 : 0, color)
        .setDepth(4);
      this.tweens.add({
        targets: arrow,
        y: arrow.y + (up ? -18 : 18),
        alpha: 0,
        duration: 600 / this.opts.speed,
        delay: i * 80,
        onComplete: () => arrow.destroy(),
      });
    }
  }

  shield(side: Side, raised: boolean): void {
    if (!raised) return;
    const c = CENTER[side];
    const ring = this.add.ellipse(c.x, c.y, 44, 54).setStrokeStyle(2, 0xd8b070).setDepth(4);
    this.tweens.add({
      targets: ring,
      alpha: 0,
      scale: 1.2,
      duration: 500 / this.opts.speed,
      onComplete: () => ring.destroy(),
    });
  }

  clone(side: Side, created: boolean): void {
    const c = CENTER[side];
    this.poof(c.x + (side === 0 ? 14 : -14), c.y, 0xffffff);
    if (!created) return;
    const sprite = this.sprites[side];
    if (!sprite) return;
    const ghost = this.add
      .image(sprite.x + (side === 0 ? 16 : -16), sprite.y, sprite.texture.key)
      .setOrigin(0.5, 1)
      .setAlpha(0.5)
      .setDepth(sprite.depth - 1);
    this.tweens.add({
      targets: ghost,
      alpha: 0,
      x: sprite.x,
      duration: 700 / this.opts.speed,
      onComplete: () => ghost.destroy(),
    });
  }

  blocked(side: Side, by: 'protect' | 'clone' | 'shield'): void {
    const c = CENTER[side];
    if (by === 'clone') {
      this.poof(c.x, c.y, 0xffffff);
      return;
    }
    const ring = this.add
      .ellipse(c.x, c.y, 46, 58)
      .setStrokeStyle(3, by === 'protect' ? 0xf0e0a0 : 0xd8b070)
      .setDepth(4);
    this.tweens.add({
      targets: ring,
      alpha: 0,
      scale: 1.25,
      duration: 380 / this.opts.speed,
      onComplete: () => ring.destroy(),
    });
    this.burst(c.x, c.y, 0xffffff, 0xf0e0a0, 8, { speed: [40, 80] });
  }

  /** Tour perdu : le sprite tremble sur place. */
  skip(side: Side): void {
    const sprite = this.sprites[side];
    if (!sprite) return;
    this.tweens.add({
      targets: sprite,
      angle: { from: -4, to: 4 },
      duration: 70 / this.opts.speed,
      yoyo: true,
      repeat: 3,
      onComplete: () => sprite.setAngle(0),
    });
  }

  /** Assombrit le terrain (techniques majeures). */
  async dim(alpha: number, color = 0): Promise<void> {
    if (this.dimRect.alpha === alpha) return;
    this.dimRect.setFillStyle(color, 1);
    await this.tw({ targets: this.dimRect, alpha, duration: 160 });
  }

  private kill(obj: Destroyable): void {
    this.tweens.killTweensOf(obj);
    obj.destroy();
  }

  /** Techniques sur soi : fumée, dôme protecteur ou mur de terre. */
  private async selfFx(side: Side, anim: JutsuAnimation): Promise<void> {
    const c = CENTER[side];
    if (anim.special === 'poof') {
      this.poof(c.x, c.y, anim.color);
    } else if (anim.special === 'dome') {
      const dome = this.add.ellipse(c.x, c.y, 10, 12).setStrokeStyle(3, anim.color).setDepth(4);
      await this.tw({ targets: dome, displayWidth: 52, displayHeight: 62, duration: 260, ease: 'Back.easeOut' });
      this.tweens.add({ targets: dome, alpha: 0, duration: 500 / this.opts.speed, onComplete: () => dome.destroy() });
    } else if (anim.special === 'wall') {
      const dir = side === 0 ? 1 : -1;
      const wall = this.add
        .rectangle(c.x + dir * 22, FEET[side].y, 10, 0, anim.color)
        .setOrigin(0.5, 1)
        .setStrokeStyle(1, anim.color2)
        .setDepth(4);
      await this.tw({ targets: wall, height: 40, displayHeight: 40, duration: 220, ease: 'Back.easeOut' });
      this.cameras.main.shake(100, this.opts.reduceShake ? 0 : 0.008);
      this.tweens.add({
        targets: wall,
        alpha: 0,
        delay: 500 / this.opts.speed,
        duration: 300 / this.opts.speed,
        onComplete: () => wall.destroy(),
      });
    }
    this.burst(c.x, c.y + 12, anim.color, anim.color2, anim.burst ?? 12, {
      speed: [20, 60],
      angle: [240, 300],
      gravity: -80,
    });
    await this.wait(260);
  }

  /** Concentration : particules aspirées vers les mains et sphère qui grossit. */
  private async charge(side: Side, anim: JutsuAnimation, ms: number): Promise<void> {
    const c = CENTER[side];
    const dir = side === 0 ? 1 : -1;
    const x = c.x + dir * 12;
    const y = c.y;
    const gather = this.add
      .particles(0, 0, 'px', {
        x,
        y,
        lifespan: 300,
        speed: 0,
        emitZone: { type: 'edge' as const, source: new Phaser.Geom.Circle(0, 0, 16), quantity: 16 },
        moveToX: x,
        moveToY: y,
        scale: { start: 1.2, end: 0.2 },
        tint: [anim.color, anim.color2],
        frequency: 14,
      })
      .setDepth(4);
    const orb = this.add.circle(x, y, 1, anim.color2).setDepth(4);
    this.tweens.add({
      targets: orb,
      radius: anim.special === 'spiral' ? 6 : 4,
      duration: ms / this.opts.speed,
      ease: 'Quad.easeIn',
    });
    await this.wait(ms);
    gather.stop();
    this.time.delayedCall(320, () => gather.destroy());
    this.kill(orb);
  }

  /** Images rémanentes pendant une ruée. */
  private trail(sprite: Phaser.GameObjects.Image, color: number): void {
    for (let i = 1; i <= 3; i++) {
      this.time.delayedCall((i * 40) / this.opts.speed, () => {
        const ghost = this.add
          .image(sprite.x, sprite.y, sprite.texture.key)
          .setOrigin(0.5, 1)
          .setTintFill(color)
          .setAlpha(0.35)
          .setDepth(sprite.depth - 1);
        this.tweens.add({ targets: ghost, alpha: 0, duration: 200, onComplete: () => ghost.destroy() });
      });
    }
  }

  private special(side: Side, anim: JutsuAnimation): void {
    const c = CENTER[side];
    switch (anim.special) {
      case 'slashes':
        for (let i = 0; i < 3; i++) {
          const slash = this.add
            .rectangle(c.x - 8 + i * 8, c.y, 2, 30, 0xffffff)
            .setRotation(0.7)
            .setDepth(4);
          this.tweens.add({
            targets: slash,
            alpha: 0,
            scaleY: 1.4,
            duration: 220,
            delay: i * 50,
            onComplete: () => slash.destroy(),
          });
        }
        break;
      case 'flames':
        for (let i = 0; i < 6; i++) {
          const flame = this.add
            .triangle(c.x - 15 + i * 6, c.y + 22, 0, 12, 3, 0, 6, 12, i % 2 ? 0x100010 : 0x5a1a6a)
            .setDepth(4);
          this.tweens.add({
            targets: flame,
            y: flame.y - 10,
            scaleY: 1.6,
            alpha: 0,
            duration: 700,
            delay: i * 40,
            onComplete: () => flame.destroy(),
          });
        }
        break;
      case 'water':
      case 'dome': {
        const ring = this.add.circle(c.x, c.y, 6, anim.color, 0.55).setStrokeStyle(2, anim.color2).setDepth(4);
        this.tweens.add({ targets: ring, radius: 26, alpha: 0, duration: 450, onComplete: () => ring.destroy() });
        break;
      }
      case 'spiral':
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          const spark = this.add.image(c.x, c.y, 'px').setTint(anim.color).setDepth(4);
          this.tweens.add({
            targets: spark,
            x: c.x + Math.cos(angle) * 28,
            y: c.y + Math.sin(angle) * 28,
            alpha: 0,
            duration: 380,
            onComplete: () => spark.destroy(),
          });
        }
        break;
      case 'lightning':
        this.bolt(c.x, 0, c.x, c.y, 0xffffff);
        break;
      case 'poof':
        this.poof(c.x, c.y, anim.color);
        break;
      case 'blast': {
        const blast = this.add.circle(c.x, c.y, 4, anim.color2, 0.9).setDepth(4);
        this.tweens.add({
          targets: blast,
          radius: 30,
          alpha: 0,
          duration: 380,
          ease: 'Quad.easeOut',
          onComplete: () => blast.destroy(),
        });
        for (let i = 0; i < 5; i++) {
          this.time.delayedCall(i * 40, () => this.poof(c.x - 12 + i * 6, c.y + 6 - (i % 2) * 8, 0x8a7a6a));
        }
        break;
      }
    }
  }

  /** Éclair en zigzag redessiné plusieurs fois pour crépiter. */
  private bolt(x1: number, y1: number, x2: number, y2: number, color: number): void {
    const g = this.add.graphics().setDepth(4);
    const draw = () => {
      g.clear();
      g.lineStyle(2, color, 1);
      g.beginPath();
      g.moveTo(x1, y1);
      for (let i = 1; i < 6; i++) {
        const t = i / 6;
        g.lineTo(x1 + (x2 - x1) * t + Phaser.Math.Between(-5, 5), y1 + (y2 - y1) * t + Phaser.Math.Between(-5, 5));
      }
      g.lineTo(x2, y2);
      g.strokePath();
    };
    draw();
    const flicker = this.time.addEvent({ delay: 40, repeat: 4, callback: draw });
    this.time.delayedCall(220, () => {
      flicker.remove();
      g.destroy();
    });
  }

  private poof(x: number, y: number, color: number): void {
    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const puff = this.add.image(x, y, 'dot').setTint(color).setScale(1.2).setDepth(4);
      this.tweens.add({
        targets: puff,
        x: x + Math.cos(angle) * 14,
        y: y + Math.sin(angle) * 10,
        scale: 0.2,
        alpha: 0,
        duration: 380,
        ease: 'Quad.easeOut',
        onComplete: () => puff.destroy(),
      });
    }
  }

  private burst(x: number, y: number, color: number, color2: number, count: number, opts: BurstOptions = {}): void {
    if (count <= 0) return;
    const emitter = this.add
      .particles(x, y, 'px', {
        lifespan: { min: 250, max: 520 },
        speed: { min: opts.speed?.[0] ?? 30, max: opts.speed?.[1] ?? 90 },
        angle: { min: opts.angle?.[0] ?? 0, max: opts.angle?.[1] ?? 360 },
        gravityY: opts.gravity ?? 0,
        scale: { start: 1.3, end: 0 },
        tint: [color, color2],
        emitting: false,
      })
      .setDepth(4);
    emitter.explode(Math.min(count, 40));
    this.time.delayedCall(700, () => emitter.destroy());
  }
}
