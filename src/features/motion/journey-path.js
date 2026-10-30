import { clamp, mix } from '../cinema/timeline.js';
import { smoother } from '../cinema/film-timeline.js';
/**
 * origin (owner, 2026-10-30: «линию прям с точки в заголовке начинать, тогда не будет ни разрыва ни острых углов»):
 * the hero kicker's dot. The line starts there and comes down the gutter left of the hero's words, under them it
 * bends into the wave; every point lies lower than the one before, so the head follows the scroll on it as it does on
 * the wave, and leaves the dot as the page starts to move.
 */
export function createJourneyPath(width, height, total, destination, origin) {
  const goal = destination || { x: width * 0.86, y: total - height * 0.3, radius: 8 },
    finishStart = Math.max(height, goal.y - height * 0.95),
    flightScroll = height * 0.6,
    join = origin ? flightScroll + height * 0.56 : 0,
    points = [],
    lengths = [];
  let length = 0;
  const curveX = (y) =>
    width *
    (0.5 +
      0.39 * Math.cos(((y / Math.max(650, height * 1.15)) * Math.PI) / 2.2) +
      0.025 * Math.sin(((y / Math.max(650, height * 1.15)) * Math.PI * 2) / 0.8));
  const add = (p) => {
    const prev = points.at(-1);
    if (prev) length += Math.hypot(p.x - prev.x, p.y - prev.y);
    points.push(p);
    lengths.push(length);
  };
  const bezier = (a, b, c, d, steps) => {
    for (let i = 1; i <= steps; i++) {
      const t = i / steps,
        u = 1 - t;
      add({
        x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
        y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
      });
    }
  };
  if (origin) {
    const end = { x: curveX(join), y: join },
      gutter = Math.max(24, Math.min(origin.x - 18, (origin.left ?? origin.x) - 26)),
      under = {
        x: gutter,
        y: Math.min(Math.max(origin.y + 80, origin.bottom ?? origin.y + 80), join - 140),
      },
      slope = (curveX(join + 1) - curveX(join - 1)) / 2,
      rise = end.y - under.y;
    add({ x: origin.x, y: origin.y });
    // Down from the dot into the gutter, straight down past the words.
    bezier(
      origin,
      { x: origin.x, y: origin.y + 40 },
      { x: gutter, y: origin.y + 70 },
      { x: gutter, y: origin.y + 110 },
      24
    );
    if (under.y > origin.y + 120) add(under);
    // Under the words it bends right and meets the wave along the wave's own direction.
    bezier(
      points.at(-1),
      { x: gutter, y: points.at(-1).y + rise * 0.45 },
      { x: end.x - slope * rise * 0.4, y: end.y - rise * 0.4 },
      end,
      60
    );
  }
  for (let y = Math.ceil((join + 1) / 10) * 10; y < finishStart; y += 10) add({ x: curveX(y), y });
  // The finish leaves the wave along the wave's own direction, so the line has no corner there.
  const slope = (curveX(finishStart + 1) - curveX(finishStart - 1)) / 2,
    start = { x: curveX(finishStart), y: finishStart },
    c1 = { x: start.x + slope * height * 0.45, y: start.y + height * 0.45 },
    c2 = { x: goal.x, y: goal.y - height * 0.44 };
  for (let i = 0; i <= 100; i++) {
    const t = i / 100,
      u = 1 - t;
    add({
      x: u * u * u * start.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * goal.x,
      y: u * u * u * start.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * goal.y,
    });
  }
  const maximum = Math.max(1, total - height);
  function atDistance(distance) {
    let hi = lengths.findIndex((l) => l >= distance);
    if (hi < 1) hi = 1;
    const a = points[hi - 1],
      b = points[hi],
      t = clamp((distance - lengths[hi - 1]) / Math.max(0.0001, lengths[hi] - lengths[hi - 1]));
    return { x: mix(a.x, b.x, t), y: mix(a.y, b.y, t) };
  }
  return {
    points,
    lengths,
    goal,
    length,
    sample(scroll) {
      const progress = clamp(scroll / maximum),
        merge = smoother(maximum - height * 0.65, maximum, scroll),
        // From the dot at the top the head eases down to its usual place, 56 % down the window.
        flight = origin ? smoother(0, flightScroll, scroll) : 1,
        headY = Math.min(
          goal.y,
          origin ? mix(origin.y, scroll + height * 0.56, flight) : scroll + height * 0.56
        );
      let index = points.findIndex((p) => p.y >= headY);
      if (index < 0) index = points.length - 1;
      // Between two samples, not on them: the head moves continuously with the scroll.
      const previous = points[index - 1],
        normal =
          previous && points[index].y > previous.y
            ? mix(
                lengths[index - 1],
                lengths[index],
                clamp((headY - previous.y) / (points[index].y - previous.y))
              )
            : lengths[index];
      const distance = mix(normal, length, merge),
        point = atDistance(distance);
      return {
        ...point,
        flight,
        distance,
        y: point.y - scroll,
        radius: mix(origin ? mix(origin.radius, 5, flight) : 5, goal.radius, merge),
        merge,
        progress,
        target: { x: goal.x, y: goal.y - scroll, radius: goal.radius },
      };
    },
  };
}
