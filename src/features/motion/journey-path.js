import { clamp, mix } from '../cinema/timeline.js';
import { smoother } from '../cinema/film-timeline.js';
export function createJourneyPath(width, height, total, destination) {
  const goal = destination || { x: width * 0.86, y: total - height * 0.3, radius: 8 },
    finishStart = Math.max(height, goal.y - height * 0.95),
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
  for (let y = 0; y < finishStart; y += 10) add({ x: curveX(y), y });
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
    goal,
    length,
    sample(scroll) {
      const progress = clamp(scroll / maximum),
        merge = smoother(maximum - height * 0.65, maximum, scroll),
        headY = Math.min(goal.y, scroll + height * 0.56);
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
      const point = atDistance(mix(normal, length, merge));
      return {
        ...point,
        y: point.y - scroll,
        radius: mix(5, goal.radius, merge),
        merge,
        progress,
        target: { x: goal.x, y: goal.y - scroll, radius: goal.radius },
      };
    },
  };
}
