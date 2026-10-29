import { clamp, mix, smooth } from './timeline.js';
export function filmAt(film, time) {
  const t = clamp(time, 0, film.duration),
    index = Math.max(
      0,
      film.steps.findLastIndex((step) => t >= step.start)
    ),
    step = film.steps[index];
  const previous = film.steps[Math.max(0, index - 1)].target;
  const arrival = smooth(step.start, step.press - 0.15, t);
  const phase =
    t < step.press
      ? 'focus'
      : t < step.transition
        ? 'press'
        : t < step.settle
          ? 'transition'
          : 'result';
  const opacity =
    phase === 'focus'
      ? 0.65 + 0.35 * smooth(step.start, step.start + 0.12, t)
      : phase === 'press'
        ? 1
        : 1 - smooth(step.transition, step.transition + 0.25, t);
  const pulse = phase === 'press' ? clamp((t - step.press) / (step.transition - step.press)) : 0;
  return {
    index,
    step,
    phase,
    pointer: [
      mix(index ? previous[0] : step.target[0] - 0.12, step.target[0], arrival),
      mix(index ? previous[1] : step.target[1] + 0.08, step.target[1], arrival),
    ],
    opacity,
    pulse,
    emphasis: opacity * 0.8,
    progress: clamp(t / film.duration),
  };
}
export function chapterProgress(section, scroll, height) {
  return clamp((scroll - section.top) / Math.max(1, section.height - height));
}
export function fittedPhone(width, height, top, bottom) {
  const h = Math.max(150, Math.min(bottom - top, (width - 64) * 2.14));
  return { height: h, x: width / 2, y: top + h / 2 };
}

export function smoother(start, end, value) {
  const t = clamp((value - start) / (end - start));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/** The travel interval starts a full viewport before a chapter; content changes at its midpoint. */
export function travelAt(sections, scroll, height) {
  const index = sections.findLastIndex((section) => scroll >= section.top - height);
  return {
    index,
    progress: index < 0 ? 1 : smoother(sections[index].top - height, sections[index].top, scroll),
  };
}
