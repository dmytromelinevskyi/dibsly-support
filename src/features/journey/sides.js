/**
 * How the landing's phone goes left and right between steps, one to one as on Roma's cinema landing (owner,
 * 2026-10-29: «посмотри еще раз, как у него, и сделай один на один… чтобы телефон прыгал влево-право»): on the right
 * at 73.5% of the window, on the left at 26.5%; it travels over the window of scroll before a step's top reaches the
 * top, on his smoother curve, lifted a little, smaller and turned edgewise on the way (runtime.js's pose and travelAt).
 *
 * model: { anchors: [{ top, side }], width, height, centre }: tops are the page's y, side 'left' or 'right', centre the
 * phone's own centre (its place in the layout), which the shift is measured from.
 */
const clamp = (t) => Math.max(0, Math.min(1, t));
/** Roma's smoother step (film-timeline.js). */
const smoother = (start, end, value) => {
  const t = clamp((value - start) / (end - start));
  return t * t * t * (t * (t * 6 - 15) + 10);
};
/** The phone's shift from its place on the right, its lift and size, and its turn (degrees), for the scroll. */
export function phoneAt(model, scroll) {
  const { anchors, height } = model,
    index = Math.max(
      0,
      anchors.findLastIndex((anchor, i) => i > 0 && scroll >= anchor.top - height)
    ),
    enter = index ? smoother(anchors[index].top - height, anchors[index].top, scroll) : 1,
    place = (side) => model.width * (side === 'left' ? 0.265 : 0.735),
    from = place(anchors[Math.max(0, index - 1)].side),
    to = place(anchors[index].side),
    arc = Math.sin(enter * Math.PI),
    direction = anchors[index].side === 'left' ? -1 : 1,
    degrees = 180 / Math.PI;
  return {
    x: from + (to - from) * enter - model.centre,
    y: -arc * height * 0.065,
    scale: 1 - arc * 0.065,
    // three.js turns the other way round x and z than CSS does.
    rotationX: -arc * 0.1 * degrees,
    rotationY: direction * arc * 0.38 * degrees,
    rotationZ: -direction * Math.sin(enter * Math.PI * 2) * 0.065 * degrees,
  };
}
