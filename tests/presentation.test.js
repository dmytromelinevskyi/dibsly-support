import test from 'node:test';
import assert from 'node:assert/strict';
import { createScreenPresenter, isEmptyScreen } from '../src/features/cinema/screen-presenter.js';
import { createJourneyPath } from '../src/features/motion/journey-path.js';
import { smoother, travelAt } from '../src/features/cinema/film-timeline.js';
function makeCanvas() {
  const canvas = { width: 640, height: 1392, pixel: null };
  const context = {
    globalAlpha: 1,
    drawImage(image) {
      if (this.globalAlpha === 1) canvas.pixel = image.pixel || image.label;
    },
  };
  canvas.getContext = () => context;
  return canvas;
}
test('decoder loading and seeking keep the displayed frame; only source changes crossfade', () => {
  let clock = 0,
    uploads = 0;
  const canvas = makeCanvas(),
    screen = createScreenPresenter({
      canvas,
      makeCanvas,
      now: () => clock,
      onChange: () => uploads++,
    });
  assert.equal(screen.accept({ label: 'main' }, 'hero', 0), true);
  screen.update();
  assert.equal(canvas.pixel, 'main');
  assert.equal(screen.accept({ label: 'black', readyState: 1, videoWidth: 0 }, 'next', 0), false);
  screen.update(1000);
  assert.equal(canvas.pixel, 'main');
  assert.equal(
    screen.accept({ label: 'seek', readyState: 2, videoWidth: 640, seeking: true }, 'next', 1),
    false
  );
  assert.equal(canvas.pixel, 'main');
  clock = 10;
  screen.accept({ label: 'plan', readyState: 4, videoWidth: 640, seeking: false }, 'next', 0);
  assert.equal(screen.update(clock), true);
  assert.equal(canvas.pixel, 'main');
  screen.update(431);
  assert.equal(canvas.pixel, 'plan');
  clock = 500;
  screen.accept({ label: 'editor', readyState: 4, videoWidth: 640, seeking: false }, 'next', 1);
  assert.equal(screen.update(clock), false);
  assert.equal(canvas.pixel, 'editor');
  assert.equal(uploads, 4);
  screen.destroy();
});
test('empty native loading frames are filtered while a dark app with content is retained', () => {
  const pixels = new Uint8ClampedArray(32 * 64 * 4);
  pixels.fill(19);
  assert.equal(isEmptyScreen(pixels), true);
  for (let i = 0; i < pixels.length; i += 40) {
    pixels[i] = pixels[i + 1] = pixels[i + 2] = 230;
  }
  assert.equal(isEmptyScreen(pixels), false);
});
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
test('travel has zero velocity and acceleration at both ends, including the content handover', () => {
  const sections = [
    { top: 1000, height: 2000 },
    { top: 3000, height: 2000 },
  ];
  assert.equal(smoother(0, 1, 0), 0);
  assert.equal(smoother(0, 1, 1), 1);
  assert.ok(smoother(0, 1, 0.001) < 1e-7);
  assert.ok(1 - smoother(0, 1, 0.999) < 1e-7);
  assert.ok(
    Math.abs(travelAt(sections, 2601, 800).progress - travelAt(sections, 2599, 800).progress) <
      0.005
  );
});

test('each action adds to the persistent formation once, while replay can emit another wave', async () => {
  const { createReactionField } = await import('../src/features/cinema/reaction-field.js');
  const field = createReactionField({ total: 24, mobile: true });
  assert.equal(field.activate(0, [0.7, 0.6], 0), true);
  assert.equal(field.activate(0, [0.7, 0.6], 0), false);
  assert.equal(field.completed, 1);
  field.update({ width: 390, height: 844, time: 3, x: 0, y: 0 });
  assert.ok(field.object.children.filter((child) => child.isMesh).every((mesh) => !mesh.visible));
  field.pulse([0.2, 0.4], 4);
  field.update({ width: 390, height: 844, time: 4.2, x: 0, y: 0 });
  assert.ok(field.object.children.some((child) => child.isMesh && child.visible));
  assert.equal(field.completed, 1);
  field.completeUntil(24, 5);
  assert.equal(field.completed, 24);
  field.completeUntil(3, 6);
  assert.equal(field.completed, 24);
  field.dispose();
});
