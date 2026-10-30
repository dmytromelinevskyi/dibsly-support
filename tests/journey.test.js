import test from 'node:test';
import assert from 'node:assert/strict';
import { createJourneyPath } from '../src/features/motion/journey-path.js';
import { smoother } from '../src/features/motion/easing.js';
test('the journey reaches the actual footer period at the last scroll pixel on desktop and mobile', () => {
  for (const [w, h, total, goal] of [
    [1440, 900, 22000, { x: 1130, y: 21680, radius: 27 }],
    [390, 844, 24000, { x: 326, y: 23700, radius: 7 }],
  ]) {
    const path = createJourneyPath(w, h, total, goal),
      end = path.sample(total - h);
    assert.equal(end.merge, 1);
    assert.ok(Math.abs(end.x - goal.x) < 1e-6);
    assert.ok(Math.abs(end.y - (goal.y - total + h)) < 1e-6);
    assert.equal(end.radius, goal.radius);
    const before = path.sample(total - h - 1);
    assert.ok(Math.hypot(end.x - before.x, end.y - before.y) < 1.1);
  }
});
test('from the hero kicker the line starts at the dot, only goes down and the head stays on the screen', () => {
  const [w, h, total] = [1512, 860, 20000],
    origin = { x: 172, y: 228, radius: 4, left: 168, bottom: 690 },
    path = createJourneyPath(w, h, total, { x: 1300, y: 19700, radius: 8 }, origin);
  assert.deepEqual(path.points[0], { x: origin.x, y: origin.y });
  for (let i = 1; i < path.points.length; i++) assert.ok(path.points[i].y >= path.points[i - 1].y);
  const start = path.sample(0);
  assert.ok(Math.hypot(start.x - origin.x, start.y - origin.y) < 1e-6);
  for (let scroll = 0; scroll <= h; scroll += 20) {
    const head = path.sample(scroll);
    assert.ok(head.y > 0 && head.y < h, `head on screen at ${scroll}: ${head.y}`);
  }
});
test('the smoother step has zero velocity and acceleration at both ends', () => {
  assert.equal(smoother(0, 1, 0), 0);
  assert.equal(smoother(0, 1, 1), 1);
  assert.ok(smoother(0, 1, 0.001) < 1e-7);
  assert.ok(1 - smoother(0, 1, 0.999) < 1e-7);
});
