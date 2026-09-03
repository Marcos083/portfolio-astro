/**
 * Inverter Cursor — Lorenzo Dal Dosso architecture.
 *
 * Mechanic (mirrors lorenzodaldosso.it):
 *   - Hidden by default; appears only while the pointer is over a hover target.
 *   - On each grid-cell change, a NEW <div> dot is spawned at the snapped
 *     position, appended to the stage, and removed when its fade completes.
 *   - The "head" dot stays at full opacity until the next snap change, then
 *     starts fading. Trail dots from previous snaps fade in parallel.
 *   - Movement is grid-locked: between any two snaps that differ on both
 *     axes, an intermediate single-axis dot is inserted (L-path), so the
 *     trail never has diagonal segments — it floats cell by cell.
 *   - Grid size equals dot size → adjacent dots tile perfectly into a
 *     contiguous square shape during fast movement.
 *   - Pure CSS transition handles the fade; no per-frame opacity work in JS.
 */
const HOVER_SELECTOR = '[data-cursor="text"]';
const EXCLUDE_SELECTOR = '[data-cursor="none"]';
const CURSOR_SIZE = 50;     // px — also the grid cell size
const TRAIL_LIFE_MS = 220;  // how long each trail dot stays before removal
const STEP_INTERVAL = 18;   // ms between snap evaluations (~55 Hz)

interface Pos { x: number; y: number }

export function initInvertCursor() {
  const wrapper = document.querySelector('.mc-invert-cursor-wrapper') as HTMLElement | null;
  const stage = document.querySelector('.mc-invert-cursor-stage') as HTMLElement | null;
  if (!wrapper || !stage) return;
  if (!window.matchMedia('(hover: hover)').matches) return;

  // Sync CSS custom property so visual size and JS grid stay in lock-step.
  wrapper.style.setProperty('--mc-cursor-size', `${CURSOR_SIZE}px`);

  const half = CURSOR_SIZE / 2;
  const snap = (v: number) => Math.round(v / CURSOR_SIZE) * CURSOR_SIZE;

  let mouseX = -9999;
  let mouseY = -9999;
  let hasMoved = false;
  let active = false;
  let headDot: HTMLDivElement | null = null;
  let lastSnap: Pos | null = null;

  // -------- Tracking + hover gate (single pointermove handler) --------
  // The cursor is active when the pointer is inside HOVER_SELECTOR AND NOT
  // inside EXCLUDE_SELECTOR. This handles transitions into / out of the
  // hero-name-video without needing separate pointerover listeners on it.
  function setActive(next: boolean) {
    if (next === active) return;
    active = next;
    if (next) {
      lastSnap = null;
      wrapper!.classList.add('is-active');
    } else {
      wrapper!.classList.remove('is-active');
      retireToTrail(headDot);
      headDot = null;
      lastSnap = null;
    }
  }

  window.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    hasMoved = true;

    const target = e.target as Element | null;
    const inHover = !!target?.closest?.(HOVER_SELECTOR);
    const inExclude = !!target?.closest?.(EXCLUDE_SELECTOR);
    setActive(inHover && !inExclude);
  }, { passive: true });

  // Pointer leaving the window entirely → deactivate
  document.addEventListener('pointerleave', () => setActive(false));

  // -------- Spawning / fading --------
  function spawnDot(x: number, y: number): HTMLDivElement {
    const dot = document.createElement('div');
    dot.className = 'mc-invert-cursor-dot';
    dot.style.left = `${x - half}px`;
    dot.style.top = `${y - half}px`;
    stage!.appendChild(dot);
    return dot;
  }

  /** Drop a dot to the trail: it keeps opacity 1, just gets removed after a delay. */
  function retireToTrail(dot: HTMLDivElement | null) {
    if (!dot) return;
    setTimeout(() => dot.remove(), TRAIL_LIFE_MS);
  }

  // -------- Step loop --------
  let lastStepAt = 0;

  function tick(now: DOMHighResTimeStamp) {
    requestAnimationFrame(tick);
    if (!active || !hasMoved) return;
    if (now - lastStepAt < STEP_INTERVAL) return;
    lastStepAt = now;

    const sx = snap(mouseX);
    const sy = snap(mouseY);

    if (lastSnap && sx === lastSnap.x && sy === lastSnap.y) return; // no cell change

    // First step OR moved cells — old head becomes a fading trail dot
    if (headDot) retireToTrail(headDot);

    // L-path: if both axes changed, drop an intermediate dot first
    if (lastSnap && sx !== lastSnap.x && sy !== lastSnap.y) {
      const dx = Math.abs(sx - lastSnap.x);
      const dy = Math.abs(sy - lastSnap.y);
      const ix = dx >= dy ? sx : lastSnap.x;
      const iy = dx >= dy ? lastSnap.y : sy;
      retireToTrail(spawnDot(ix, iy));
    }

    headDot = spawnDot(sx, sy);
    lastSnap = { x: sx, y: sy };
  }

  requestAnimationFrame(tick);
}
