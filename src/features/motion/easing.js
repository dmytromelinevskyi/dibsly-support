/** The few curves the landing's motion uses (kept from the former cinema landing's timeline, 2026-10-30). */
export const clamp = (value, min = 0, max = 1) =>
  Math.max(min, Math.min(max, Number.isFinite(value) ? value : min));
export const mix = (a, b, t) => a + (b - a) * t;
/** Roma's smoother step: zero velocity and acceleration at both ends. */
export function smoother(start, end, value) {
  const t = clamp((value - start) / (end - start));
  return t * t * t * (t * (t * 6 - 15) + 10);
}
