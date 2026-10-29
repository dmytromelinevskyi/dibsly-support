import { clamp, mix } from '../cinema/timeline.js';
import { smoother } from '../cinema/film-timeline.js';
/**
 * origin (owner, 2026-10-30: «эта точка при скроле начинала лететь и потом в конце становилась точкой дибсли»): the
 * hero kicker's dot. Over the first `flight` of scroll the head leaves it and swoops into the wave; the wave starts
 * below the first screen, so at the top only that dot is seen.
 */
export function createJourneyPath(width, height, total, destination, origin) {
  const goal = destination || { x: width * 0.86, y: total - height * 0.3, radius: 8 },
    finishStart = Math.max(height, goal.y - height * 0.95),
    flight = height * 0.6,
    join = origin ? flight + height * 0.56 : 0,
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
  let introCount = 0,
    introLength = 0;
  if (origin) {
    // Up over the kicker, along above the title to the free lane between the words and the phone (origin.lane),
    // then down it into the wave: the dot never crosses the hero's text or hides behind the phone.
    const end = { x: curveX(join), y: join },
      lane = origin.lane ?? end.x,
      top = Math.min(origin.y - 16, origin.ceiling ?? origin.y - 40),
      turn = { x: lane, y: top + 30 },
      slope = (curveX(join + 1) - curveX(join - 1)) / 2;
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
    add({ x: origin.x, y: origin.y });
    bezier(origin, { x: origin.x - 12, y: top - 46 }, { x: lane - 120, y: top }, turn, 60);
    bezier(
      turn,
      { x: lane, y: turn.y + (join - turn.y) * 0.45 },
      { x: Math.min(end.x - slope * height * 0.3, lane), y: end.y - height * 0.3 },
      end,
      60
    );
    introCount = points.length;
    introLength = length;
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
    introCount,
    goal,
    length,
    sample(scroll) {
      if (origin && scroll < flight) {
        const t = smoother(0, flight, scroll),
          distance = t * introLength,
          point = atDistance(distance);
        return {
          ...point,
          y: point.y - scroll,
          radius: mix(origin.radius, 5, t),
          merge: 0,
          flight: t,
          distance,
          progress: clamp(scroll / maximum),
          target: { x: goal.x, y: goal.y - scroll, radius: goal.radius },
        };
      }
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
      const distance = mix(normal, length, merge),
        point = atDistance(distance);
      return {
        ...point,
        flight: 1,
        distance,
        y: point.y - scroll,
        radius: mix(5, goal.radius, merge),
        merge,
        progress,
        target: { x: goal.x, y: goal.y - scroll, radius: goal.radius },
      };
    },
  };
}
