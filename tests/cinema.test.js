import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import {
  filmAt,
  chapterProgress,
  fittedPhone,
  travelAt,
} from '../src/features/cinema/film-timeline.js';
import { createScrollSmoother } from '../src/features/motion/scroll-driver.js';
const films = JSON.parse(await readFile(new URL('../src/content/films.json', import.meta.url)));
test('every native action has a visible target, a press before native motion, and time to read the result', async () => {
  const paths = new Set();
  for (const lang of ['uk', 'en']) {
    assert.equal(Object.keys(films.languages[lang]).length, 9);
    for (const [id, film] of Object.entries(films.languages[lang])) {
      assert.equal(film.source, 'native-ios-edited-film');
      paths.add(film.src);
      paths.add(film.poster);
      let end = 0;
      for (const step of film.steps) {
        assert.ok(
          Math.abs(step.start - end) < 0.001,
          `${lang}/${id}: no unexplained timeline gaps`
        );
        assert.ok(step.press - step.start >= 1.3);
        assert.ok(step.transition - step.press >= 0.4);
        assert.ok(step.settle > step.transition);
        assert.ok(step.end - step.settle >= 1.4);
        const [x, y, w, h] = step.target;
        assert.ok(
          x - w / 2 >= 0 && x + w / 2 <= 1 && y - h / 2 >= 0 && y + h / 2 <= 1,
          `${lang}/${id}: target must be visible`
        );
        for (const [time, phase] of [
          [step.start, 'focus'],
          [step.press + 0.01, 'press'],
          [step.transition + 0.01, 'transition'],
          [step.settle + 0.01, 'result'],
        ])
          assert.equal(filmAt(film, time).phase, phase);
        const press = filmAt(film, step.press + 0.01);
        assert.ok(Math.hypot(press.pointer[0] - x, press.pointer[1] - y) < 1e-9);
        assert.ok(press.opacity > 0.95);
        assert.ok(step.control && step.description);
        paths.add(step.before);
        paths.add(step.after);
        end = step.end;
      }
      assert.ok(film.duration >= end + 1);
      assert.equal(filmAt(film, film.duration).phase, 'result');
      for (const time of [0, film.duration * 0.8, film.duration * 0.2, film.duration])
        assert.deepEqual(filmAt(film, time), filmAt(film, time));
    }
  }
  await Promise.all(
    [...paths].map((path) => access(new URL('../public/' + path, import.meta.url)))
  );
});
test('phone fits the measured free space on small, large and landscape mobile viewports', () => {
  for (const [w, h, top, bottom] of [
    [320, 568, 169, 400],
    [375, 667, 169, 497],
    [390, 844, 183, 674],
    [768, 1024, 209, 854],
    [844, 390, 137, 300],
  ]) {
    const p = fittedPhone(w, h, top, bottom);
    assert.ok(p.y - p.height / 2 >= top);
    assert.ok(p.y + p.height / 2 <= bottom + 0.01);
    assert.ok(p.height / 2.14 <= w - 64);
  }
  assert.equal(chapterProgress({ top: 1000, height: 2000 }, 500, 800), 0);
  assert.equal(chapterProgress({ top: 1000, height: 2000 }, 2200, 800), 1);
});
test('Ramka scroll damping stays monotonic, cancels immediately and reverses without a forward jump', () => {
  const smoother = createScrollSmoother(100);
  smoother.add(500, 100, 3000);
  let previous = 100;
  for (let i = 0; i < 12; i++) {
    const next = smoother.step(16.67);
    assert.ok(next >= previous && next <= 600);
    previous = next;
  }
  smoother.add(-250, previous, 3000);
  assert.ok(smoother.step(16.67) < previous);
  smoother.cancel(42);
  assert.equal(smoother.active, false);
  assert.equal(smoother.step(16), 42);
  smoother.add(-100, 42, 3000);
  for (let i = 0; i < 120; i++) smoother.step(16.67);
  assert.equal(smoother.step(16), 0);
});

test('device travel is continuous through the chapter switch and stops exactly at either side', () => {
  const sections = [
    { top: 1000, height: 2000 },
    { top: 3000, height: 2000 },
  ];
  const position = (scroll) => {
    const t = travelAt(sections, scroll, 800);
    const current = t.index % 2 === 0 ? 0.75 : 0.25,
      previous = t.index <= 0 ? 0.75 : 0.75;
    return previous + (current - previous) * t.progress;
  };
  assert.equal(travelAt(sections, 2199, 800).index, 0);
  assert.equal(travelAt(sections, 2200, 800).progress, 0);
  assert.ok(Math.abs(position(2601) - position(2599)) < 0.003);
  assert.equal(position(3000), 0.25);
});
