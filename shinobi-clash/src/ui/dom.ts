export type Child = Node | string | number | null | undefined | false | Child[];
export type Attrs = Record<string, unknown>;

/**
 * Crée un élément. `class`, `style` (chaîne ou objet), `html`, `onXxx` (écouteurs) sont traités à part ;
 * les autres clés deviennent des propriétés DOM si elles existent, sinon des attributs.
 */
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Attrs | null,
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      if (value == null || value === false) continue;
      if (key === 'class') el.className = String(value);
      else if (key === 'style') {
        if (typeof value === 'string') el.setAttribute('style', value);
        else Object.assign(el.style, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        el.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
      } else if (key === 'html') el.innerHTML = String(value);
      else if (key in el && typeof value !== 'string') (el as unknown as Record<string, unknown>)[key] = value;
      else el.setAttribute(key, value === true ? '' : String(value));
    }
  }
  append(el, children);
  return el;
}

export function append(el: Node, children: Child[]): void {
  for (const child of children) {
    if (child == null || child === false) continue;
    if (Array.isArray(child)) append(el, child);
    else
      el.appendChild(
        typeof child === 'string' || typeof child === 'number' ? document.createTextNode(String(child)) : child,
      );
  }
}

export function clear(el: Node): void {
  while (el.firstChild) el.removeChild(el.firstChild);
}

/** Force un reflow : permet de rejouer une animation CSS en retirant/rajoutant une classe. */
export function reflow(el: HTMLElement): void {
  void el.offsetWidth;
}
