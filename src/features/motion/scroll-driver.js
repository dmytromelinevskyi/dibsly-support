import { clamp } from '../cinema/timeline.js';
/** Same analytic critical damping used by Ramka. Document and scene share one displayed position. */
export function createScrollSmoother(initial = 0) {
  let position = initial,
    destination = initial,
    velocity = 0,
    direction = 0,
    active = false;
  const cancel = (value) => {
    position = destination = value;
    velocity = direction = 0;
    active = false;
  };
  return {
    get active() {
      return active;
    },
    cancel,
    add(delta, actual, maximum) {
      if (!active) cancel(actual);
      const nextDirection = Math.sign(delta);
      if (direction && nextDirection !== direction) {
        destination = position;
        velocity = 0;
      }
      direction = nextDirection;
      destination = clamp(destination + delta, 0, Math.max(0, maximum));
      active = Math.abs(destination - position) > 0.08;
      return active;
    },
    step(milliseconds) {
      if (!active) return position;
      const dt = clamp(milliseconds, 0, 50) / 1000,
        omega = 22,
        d = position - destination,
        impulse = (velocity + omega * d) * dt,
        decay = Math.exp(-omega * dt);
      const next = destination + (d + impulse) * decay;
      velocity = (velocity - omega * impulse) * decay;
      position = clamp(next, Math.min(position, destination), Math.max(position, destination));
      if (Math.abs(position - destination) < 0.08 && Math.abs(velocity) < 1) cancel(destination);
      return position;
    },
  };
}
export function attachScrollDriver(schedule) {
  const smoother = createScrollSmoother(scrollY),
    fine = matchMedia('(hover:hover) and (pointer:fine)');
  let written = scrollY;
  const cancel = () => smoother.cancel(scrollY);
  const onWheel = (event) => {
    if (
      !fine.matches ||
      !event.cancelable ||
      event.defaultPrevented ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
      !event.deltaY
    ) {
      cancel();
      return;
    }
    if (
      event.target.closest('input,textarea,select,[contenteditable],dialog,[data-native-scroll]')
    ) {
      cancel();
      return;
    }
    for (let el = event.target; el && el !== document.body; el = el.parentElement)
      if (
        el.scrollHeight > el.clientHeight + 1 &&
        ['auto', 'scroll'].includes(getComputedStyle(el).overflowY)
      ) {
        cancel();
        return;
      }
    const delta =
      event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    if (smoother.add(delta, scrollY, document.documentElement.scrollHeight - innerHeight)) {
      written = scrollY;
      event.preventDefault();
      schedule();
    }
  };
  const onScroll = () => {
    if (smoother.active && Math.abs(scrollY - written) > 1) cancel();
    schedule();
  };
  const onKey = (event) => {
    if (
      ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ', 'Tab', 'Escape'].includes(
        event.key
      )
    )
      cancel();
  };
  addEventListener('wheel', onWheel, { passive: false });
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('pointerdown', cancel, { capture: true, passive: true });
  addEventListener('touchstart', cancel, { passive: true });
  addEventListener('keydown', onKey);
  return {
    step(dt) {
      if (smoother.active) {
        window.scrollTo({ top: smoother.step(dt), behavior: 'instant' });
        written = scrollY;
      }
      return scrollY;
    },
    get active() {
      return smoother.active;
    },
    cancel,
    destroy() {
      removeEventListener('wheel', onWheel);
      removeEventListener('scroll', onScroll);
      removeEventListener('pointerdown', cancel, true);
      removeEventListener('touchstart', cancel);
      removeEventListener('keydown', onKey);
    },
  };
}
