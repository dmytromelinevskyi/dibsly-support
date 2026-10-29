import { createJourneyPath } from './journey-path.js';
/** A real document path terminates at the footer period. Its two circles share a liquid neck on arrival. */
export function createJourneyLine(canvas) {
  const context = canvas.getContext('2d');
  let width = 1,
    height = 1,
    path = null,
    shown = null,
    last = 0,
    landed = -1,
    wasHome = false;
  function circle(x, y, r) {
    context.beginPath();
    context.arc(x, y, Math.max(0.1, r), 0, Math.PI * 2);
    context.fill();
  }
  return {
    measure(w, h, total, destination) {
      width = w;
      height = h;
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      path = createJourneyPath(w, h, total, destination);
    },
    draw(scroll, exclude) {
      if (!path) return;
      const now = performance.now(),
        dt = Math.min(0.1, (now - (last || now)) / 1000),
        aim = path.sample(scroll);
      last = now;
      // The head follows the scroll with a soft lag; at home it sits exactly on the period.
      const follow = 1 - Math.exp(-dt * 14);
      shown =
        !shown || aim.merge > 0.999 || Math.hypot(aim.x - shown.x, aim.y - shown.y) > height * 0.5
          ? { x: aim.x, y: aim.y }
          : { x: shown.x + (aim.x - shown.x) * follow, y: shown.y + (aim.y - shown.y) * follow };
      const head = { ...aim, x: shown.x, y: shown.y };
      // Landing: the period answers with a bounce and two rings, once per arrival.
      const home = aim.merge > 0.995;
      if (home && !wasHome) landed = now;
      wasHome = home;
      const landing = landed < 0 ? 1 : Math.min(1, (now - landed) / 1100);
      context.clearRect(0, 0, width, height);
      context.save();
      if (
        exclude && exclude.bottom !== undefined
          ? exclude.bottom > 0 && exclude.top < height
          : exclude
      ) {
        context.beginPath();
        context.rect(0, 0, width, height);
        context.roundRect(
          exclude.left,
          exclude.top,
          exclude.width,
          exclude.height,
          Math.min(25, exclude.width * 0.12)
        );
        context.clip('evenodd');
      }
      context.lineWidth = 1;
      context.strokeStyle = '#d5ccae35';
      context.beginPath();
      let started = false;
      for (const p of path.points) {
        if (p.y < scroll - 12 || p.y > scroll + height + 12) {
          started = false;
          continue;
        }
        if (!started) {
          context.moveTo(p.x, p.y - scroll);
          started = true;
        } else context.lineTo(p.x, p.y - scroll);
      }
      context.stroke();
      const color = `rgb(${Math.round(236 + 4 * head.merge)},${Math.round(193 - 27 * head.merge)},${Math.round(139 - 41 * head.merge)})`;
      context.fillStyle = color;
      if (head.merge > 0.01) {
        const target = head.target,
          dx = target.x - head.x,
          dy = target.y - head.y,
          d = Math.hypot(dx, dy),
          sum = head.radius + target.radius;
        const bounce =
          landing < 1 ? Math.sin(Math.PI * Math.min(1, landing * 1.6)) * (1 - landing) * 0.55 : 0;
        circle(target.x, target.y, target.radius * (1 + bounce));
        if (landing < 1) {
          context.save();
          context.strokeStyle = color;
          for (const delay of [0, 0.22]) {
            const p = Math.max(0, (landing - delay) / (1 - delay));
            if (p <= 0) continue;
            context.globalAlpha = (1 - p) * 0.7;
            context.lineWidth = 1.5 * (1 - p) + 0.5;
            context.beginPath();
            context.arc(target.x, target.y, target.radius * (1 + p * 5.5), 0, Math.PI * 2);
            context.stroke();
          }
          context.restore();
        }
        if (d > 1 && d < sum * 3) {
          const nx = -dy / d,
            ny = dx / d,
            t = 1 - Math.min(1, Math.max(0, (d - sum) / (sum * 2))),
            r1 = head.radius * 0.83,
            r2 = target.radius * 0.83;
          context.globalAlpha = t;
          context.beginPath();
          context.moveTo(head.x + nx * r1, head.y + ny * r1);
          context.bezierCurveTo(
            head.x + dx * 0.46 + nx * r1 * 0.55,
            head.y + dy * 0.46 + ny * r1 * 0.55,
            target.x - dx * 0.38 + nx * r2 * 0.45,
            target.y - dy * 0.38 + ny * r2 * 0.45,
            target.x + nx * r2,
            target.y + ny * r2
          );
          context.lineTo(target.x - nx * r2, target.y - ny * r2);
          context.bezierCurveTo(
            target.x - dx * 0.38 - nx * r2 * 0.45,
            target.y - dy * 0.38 - ny * r2 * 0.45,
            head.x + dx * 0.46 - nx * r1 * 0.55,
            head.y + dy * 0.46 - ny * r1 * 0.55,
            head.x - nx * r1,
            head.y - ny * r1
          );
          context.closePath();
          context.fill();
          context.globalAlpha = 1;
        }
      }
      context.shadowColor = '#e6ad6855';
      context.shadowBlur = 10 * (1 - head.merge);
      circle(head.x, head.y, head.radius);
      context.shadowBlur = 0;
      context.restore();
      canvas.dataset.merge = head.merge.toFixed(4);
      canvas.dataset.headX = head.x.toFixed(2);
      canvas.dataset.headY = head.y.toFixed(2);
    },
    destroy() {
      context.clearRect(0, 0, width, height);
    },
  };
}
