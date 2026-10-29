import { createJourneyLine } from '../motion/journey-line.js';
/**
 * The journey line without a world loop: it is drawn on a scroll or a resize and keeps drawing only until its head
 * has caught up with the page. The phones on the screen cut holes in it, so it passes behind them.
 */
export function attachJourney(canvas) {
  const line = createJourneyLine(canvas);
  let raf = 0,
    dirty = true;
  let goal = '';
  /** The footer's period in the page's coordinates: fonts and late layout move it without changing the body's size. */
  function destination() {
    const rect = document.querySelector('[data-journey-destination]')?.getBoundingClientRect();
    return rect
      ? `${(rect.x + scrollX).toFixed(1)},${(rect.y + scrollY).toFixed(1)},${rect.width.toFixed(1)}`
      : '';
  }
  function measure() {
    goal = destination();
    const rect = document.querySelector('[data-journey-destination]')?.getBoundingClientRect();
    // The canvas is as wide as the page without its scroll bar (100% of a fixed box), not innerWidth: drawn 15 px
    // wider and squeezed, the head landed a few pixels left of the period and the two made one lumpy dot (owner,
    // 2026-10-30: «больше похоже на начало мастеркарда»).
    line.measure(
      document.documentElement.clientWidth,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      rect
        ? {
            x: rect.x + rect.width / 2,
            y: rect.y + scrollY + rect.height / 2,
            radius: rect.width / 2,
          }
        : null
    );
    dirty = false;
  }
  let drawn = '';
  function holes() {
    const result = [];
    for (const phone of document.querySelectorAll('[data-journey-hole]')) {
      const rect = phone.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < innerHeight) result.push(rect);
    }
    return result;
  }
  function frame() {
    raf = 0;
    // The head lands on the period itself (owner, 2026-10-29: «кнопка в точку криво встает»).
    if (dirty || destination() !== goal) measure();
    const cut = holes(),
      key = cut.map((rect) => `${rect.left | 0},${rect.top | 0},${rect.width | 0}`).join(';');
    line.draw(scrollY, cut);
    // Keep drawing while the head catches up or a phone still moves (it comes in, lifts, travels by itself).
    const moving = key !== drawn;
    drawn = key;
    if (!line.settled || moving) raf = requestAnimationFrame(frame);
  }
  const schedule = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    },
    remeasure = () => {
      dirty = true;
      schedule();
    };
  // Posters, fonts and the gallery change the page's height after the first paint.
  const resize = new ResizeObserver(remeasure);
  resize.observe(document.body);
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', remeasure, { passive: true });
  // The landing's engine says when it moves the phone without a scroll.
  addEventListener('dibsly:phone', schedule);
  schedule();
  return {
    destroy() {
      cancelAnimationFrame(raf);
      resize.disconnect();
      removeEventListener('scroll', schedule);
      removeEventListener('resize', remeasure);
      removeEventListener('dibsly:phone', schedule);
      line.destroy();
    },
  };
}
