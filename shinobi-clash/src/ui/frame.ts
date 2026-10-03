export function vibrate(pattern: number | number[], enabled: boolean): void {
  if (enabled && 'vibrate' in navigator) navigator.vibrate(pattern);
}

/**
 * Prochaine frame, avec repli par minuterie : requestAnimationFrame est suspendu dans les onglets
 * en arrière-plan et certains navigateurs sans affichage. Renvoie une fonction d'annulation.
 */
export function onNextFrame(callback: (time: number) => void): () => void {
  let done = false;
  const run = (time: number) => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    clearTimeout(timer);
    callback(time);
  };
  const raf = requestAnimationFrame(run);
  const timer = setTimeout(() => run(performance.now()), 40);
  return () => {
    done = true;
    cancelAnimationFrame(raf);
    clearTimeout(timer);
  };
}

/** Attend une frame ; résout `false` si aucune frame n'est arrivée avant `timeout` ms. */
export function waitFrame(timeout = 300): Promise<boolean> {
  return new Promise((resolve) => {
    let done = false;
    requestAnimationFrame(() => {
      if (!done) {
        done = true;
        resolve(true);
      }
    });
    setTimeout(() => {
      if (!done) {
        done = true;
        resolve(false);
      }
    }, timeout);
  });
}

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
