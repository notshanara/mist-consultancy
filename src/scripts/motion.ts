// Scroll-linked and in-view behaviour shared by every page.
// All of it is progressive enhancement: with no JavaScript, or with reduced motion requested,
// the content is all present and the CSS falls back to its finished state.

const root = document.documentElement;
export const motionOk = root.classList.contains('motion');

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

type Mode = 'pin' | 'through' | 'leave';

interface ScrubOptions {
  mode?: Mode;
  /** For "through": where in the viewport (0 top, 1 bottom) the element's top sits when progress starts. */
  from?: number;
  /** For "through": where in the viewport the element's bottom sits when progress ends. */
  to?: number;
  onUpdate?: (progress: number) => void;
}

interface Scrub extends ScrubOptions {
  el: HTMLElement;
  start: number;
  end: number;
  current: number;
  fresh: boolean;
}

const scrubs: Scrub[] = [];
let ticking = false;

const navHeight = () => document.querySelector('[data-site-header]')?.getBoundingClientRect().height ?? 0;

const apply = (scrub: Scrub) => {
  scrub.el.style.setProperty('--p', scrub.current.toFixed(4));
  scrub.onUpdate?.(scrub.current);
};

const tick = () => {
  ticking = false;
  const y = window.scrollY;
  for (const scrub of scrubs) {
    const target = clamp((y - scrub.start) / Math.max(1, scrub.end - scrub.start));
    const delta = target - scrub.current;
    if (scrub.fresh) {
      // Landing part-way down a page should not replay the animation from the start.
      scrub.fresh = false;
      scrub.current = target;
      apply(scrub);
    } else if (delta !== 0) {
      scrub.current = Math.abs(delta) < 0.001 ? target : scrub.current + delta * 0.18;
      apply(scrub);
      if (scrub.current !== target) request();
    }
  }
};

const request = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(tick);
};

const measure = () => {
  const viewport = window.innerHeight;
  const y = window.scrollY;
  const nav = navHeight();
  for (const scrub of scrubs) {
    const rect = scrub.el.getBoundingClientRect();
    const top = rect.top + y;
    if (scrub.mode === 'pin') {
      scrub.start = top - nav;
      scrub.end = top + rect.height - viewport;
    } else if (scrub.mode === 'leave') {
      scrub.start = top - nav;
      scrub.end = top + rect.height - nav;
    } else {
      scrub.start = top - viewport * (scrub.from ?? 0.9);
      scrub.end = top + rect.height - viewport * (scrub.to ?? 0.5);
    }
  }
  request();
};

/** Drives `--p` (0 to 1) on an element from scroll position, and calls onUpdate as it changes. */
export const scrub = (el: HTMLElement, options: ScrubOptions = {}) => {
  if (!motionOk) return;
  scrubs.push({ ...options, el, start: 0, end: 1, current: 0, fresh: true });
  measure();
};

const wrapWords = (el: Element) => {
  const words: HTMLElement[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);
  for (const node of nodes) {
    const fragment = document.createDocumentFragment();
    for (const part of (node.textContent ?? '').split(/(\s+)/)) {
      if (!part.trim()) {
        fragment.append(part);
      } else {
        const word = document.createElement('span');
        word.className = 'w';
        word.textContent = part;
        words.push(word);
        fragment.append(word);
      }
    }
    node.replaceWith(fragment);
  }
  return words;
};

const countUp = (el: HTMLElement) => {
  const target = Number(el.dataset.count);
  const started = performance.now();
  const step = (now: number) => {
    const t = clamp((now - started) / 1100);
    el.textContent = String(Math.round(target * (1 - (1 - t) ** 3)));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};

const init = () => {
  // Children of a group appear one after another.
  document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
    group.querySelectorAll<HTMLElement>('[data-reveal]').forEach((item, index) => {
      item.style.setProperty('--i', String(index));
    });
  });

  if (!motionOk) return;

  const revealer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        el.classList.add('is-in');
        if (el.dataset.count) countUp(el);
        revealer.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
  );
  document.querySelectorAll('[data-reveal], [data-count]').forEach((el) => revealer.observe(el));

  // Looping diagrams pause while they are off screen.
  const watcher = new IntersectionObserver((entries) => {
    for (const entry of entries) entry.target.toggleAttribute('data-offscreen', !entry.isIntersecting);
  });
  document.querySelectorAll('[data-loop]').forEach((el) => watcher.observe(el));

  document.querySelectorAll<HTMLElement>('[data-scrub]').forEach((el) => {
    scrub(el, {
      mode: el.dataset.scrub as Mode,
      from: el.dataset.scrubFrom ? Number(el.dataset.scrubFrom) : undefined,
      to: el.dataset.scrubTo ? Number(el.dataset.scrubTo) : undefined,
    });
  });

  // Large statements clear one word at a time as they are scrolled past.
  document.querySelectorAll<HTMLElement>('[data-words]').forEach((el) => {
    const words = wrapWords(el);
    let lit = 0;
    scrub(el, {
      mode: 'through',
      from: Number(el.dataset.wordsFrom ?? 0.85),
      to: Number(el.dataset.wordsTo ?? 0.55),
      onUpdate: (progress) => {
        const next = Math.round(progress * words.length);
        for (let i = Math.min(lit, next); i < Math.max(lit, next); i++) words[i].classList.toggle('on', next > lit);
        lit = next;
      },
    });
  });

  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  document.fonts?.ready.then(measure);
  new ResizeObserver(measure).observe(document.body);

  root.setAttribute('data-motion-ready', '');
};

init();
