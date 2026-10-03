import { onNextFrame } from '../frame';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  gravity: number;
  drag: number;
}

export interface BurstOptions {
  angle?: number;
  spread?: number;
  speed?: number;
  life?: number;
  size?: number;
  gravity?: number;
}

/**
 * Particules plein écran rendues à 1/3 de la résolution puis agrandies sans lissage : des « pixels »
 * nets comme le reste du jeu. Budget limité (400, 80 en animations réduites) pour rester à 60 FPS sur mobile.
 */
export class PixelParticles {
  readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private cancel: () => void = () => undefined;
  private last = 0;
  private ambient: { color: string; rate: number; acc: number; rise: boolean } | null = null;
  private scale = 1;
  private budget = 400;

  constructor(private readonly reduced = false) {
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
    this.ctx = this.canvas.getContext('2d')!;
    if (reduced) this.budget = 80;
    this.resize();
    window.addEventListener('resize', this.resize);
    this.cancel = onNextFrame(this.tick);
  }

  private resize = () => {
    this.scale = 3;
    this.canvas.width = Math.ceil(window.innerWidth / this.scale);
    this.canvas.height = Math.ceil(window.innerHeight / this.scale);
    this.canvas.style.imageRendering = 'pixelated';
  };

  /** Poussière de fond qui monte (ou flotte) en continu ; `null` l'arrête. */
  setAmbient(color: string | null, rate = 20, rise = true): void {
    this.ambient = color ? { color, rate, acc: 0, rise } : null;
  }

  /** Explosion depuis un point (coordonnées écran). */
  burst(x: number, y: number, colors: string[], count: number, opts: BurstOptions = {}): void {
    const n = Math.min(count, this.budget - this.particles.length);
    const s = this.scale;
    for (let i = 0; i < n; i++) {
      const angle =
        opts.angle === undefined
          ? Math.random() * Math.PI * 2
          : opts.angle + (Math.random() - 0.5) * (opts.spread ?? Math.PI * 2);
      const speed = (opts.speed ?? 120) * (0.3 + Math.random() * 0.9);
      this.particles.push({
        x: x / s,
        y: y / s,
        vx: (Math.cos(angle) * speed) / s,
        vy: (Math.sin(angle) * speed) / s,
        life: 0,
        max: (opts.life ?? 0.9) * (0.6 + Math.random() * 0.6),
        size: opts.size ?? (Math.random() < 0.3 ? 2 : 1),
        color: colors[i % colors.length],
        gravity: (opts.gravity ?? 60) / s,
        drag: 0.96,
      });
    }
  }

  /** Particules aspirées vers un point : le chakra qui se concentre. */
  gather(x: number, y: number, color: string, count: number, radius = 160): void {
    const s = this.scale;
    for (let i = 0; i < Math.min(count, this.budget - this.particles.length); i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = radius * (0.6 + Math.random() * 0.4);
      const sx = x + Math.cos(angle) * dist;
      const sy = y + Math.sin(angle) * dist;
      const life = 0.5 + Math.random() * 0.3;
      this.particles.push({
        x: sx / s,
        y: sy / s,
        vx: (x - sx) / s / life,
        vy: (y - sy) / s / life,
        life: 0,
        max: life,
        size: 1,
        color,
        gravity: 0,
        drag: 1,
      });
    }
  }

  private tick = (now: number) => {
    const dt = Math.min(0.05, (now - (this.last || now)) / 1000);
    this.last = now;
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (this.ambient && this.particles.length < this.budget) {
      for (this.ambient.acc += dt * this.ambient.rate * (this.reduced ? 0.3 : 1); this.ambient.acc >= 1;) {
        this.ambient.acc--;
        this.particles.push({
          x: Math.random() * canvas.width,
          y: this.ambient.rise ? canvas.height + 2 : Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 6,
          vy: this.ambient.rise ? -(10 + Math.random() * 18) : -3,
          life: 0,
          max: 3 + Math.random() * 3,
          size: 1,
          color: this.ambient.color,
          gravity: 0,
          drag: 1,
        });
      }
    }
    const alive: Particle[] = [];
    for (const p of this.particles) {
      p.life += dt;
      if (p.life >= p.max) continue;
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      ctx.globalAlpha = Math.min(1, (1 - p.life / p.max) * 1.5);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      alive.push(p);
    }
    ctx.globalAlpha = 1;
    this.particles = alive;
    this.cancel = onNextFrame(this.tick);
  };

  destroy(): void {
    this.cancel();
    window.removeEventListener('resize', this.resize);
    this.canvas.remove();
  }
}
