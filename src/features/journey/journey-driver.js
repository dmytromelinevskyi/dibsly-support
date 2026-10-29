import { createJourneyLine } from '../motion/journey-line.js';
/**
 * The journey line without a world loop: it is drawn on a scroll or a resize and keeps drawing only until its head
 * has caught up with the page. The phones on the screen cut holes in it, so it passes behind them.
 */
export function attachJourney(canvas) {
  const line = createJourneyLine(canvas);
  let raf = 0,
    dirty = true;
  function measure() {
    const rect = document.querySelector('[data-journey-destination]')?.getBoundingClientRect();
    line.measure(
      innerWidth,
      innerHeight,
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
    if (dirty) measure();
    line.draw(scrollY, holes());
    if (!line.settled) raf = requestAnimationFrame(frame);
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
  schedule();
  return {
    destroy() {
      cancelAnimationFrame(raf);
      resize.disconnect();
      removeEventListener('scroll', schedule);
      removeEventListener('resize', remeasure);
      line.destroy();
    },
  };
}
