import test from 'node:test';
import assert from 'node:assert/strict';
import { createFilmPlayer } from '../src/features/cinema/film-player.js';
test('video seeking serializes rapid scroll requests and captions retain the last decoded time', () => {
  class Video extends EventTarget {
    current = 0;
    readyState = 4;
    duration = 10;
    seeking = false;
    requests = [];
    frameCallback = null;
    setAttribute() {}
    removeAttribute() {}
    load() {}
    pause() {}
    play() {
      return Promise.resolve();
    }
    get currentTime() {
      return this.current;
    }
    set currentTime(value) {
      this.current = value;
      this.seeking = true;
      this.requests.push(value);
    }
    requestVideoFrameCallback(callback) {
      this.frameCallback = callback;
      return 1;
    }
    cancelVideoFrameCallback() {
      this.frameCallback = null;
    }
    complete(time) {
      this.seeking = false;
      const callback = this.frameCallback;
      this.frameCallback = null;
      callback?.(0, { mediaTime: time });
      this.dispatchEvent(new Event('seeked'));
    }
  }
  const previous = globalThis.document,
    video = new Video();
  globalThis.document = { createElement: () => video };
  try {
    const player = createFilmPlayer();
    player.setFilm({ src: 'native.mp4', duration: 10 });
    video.dispatchEvent(new Event('loadeddata'));
    player.target(8);
    player.tick(1000);
    assert.deepEqual(video.requests, [1.3]);
    assert.equal(player.time, 0);
    player.target(2);
    player.tick(1000);
    player.target(6);
    player.tick(1000);
    assert.equal(video.requests.length, 1);
    video.complete(1.3);
    assert.equal(player.time, 1.3);
    player.tick(0);
    assert.equal(video.requests.at(-1), 3.3);
    assert.equal(player.time, 1.3);
    player.jump(5);
    assert.equal(video.requests.length, 2);
    video.complete(3.3);
    player.tick(0);
    assert.equal(video.requests.at(-1), 5);
    video.complete(5);
    assert.equal(player.time, 5);
    video.frameCallback?.(0, { mediaTime: 4.966667 });
    assert.equal(player.time, 5, 'a late paused callback must not rewind the committed clock');
    const stale = video.frameCallback;
    player.setFilm({ src: 'next.mp4', duration: 7 }, 6);
    stale?.(0, { mediaTime: 9 });
    assert.equal(player.time, 0);
    video.seeking = false;
    video.current = 0;
    video.dispatchEvent(new Event('loadedmetadata'));
    assert.equal(player.ready, false);
    video.dispatchEvent(new Event('loadeddata'));
    assert.equal(video.requests.at(-1), 6);
    assert.equal(player.time, 0);
    video.complete(6);
    assert.equal(player.time, 6);
    video.duration = 7;
    player.target(7);
    player.tick(1000);
    const endRequests = video.requests.length;
    assert.equal(video.requests.at(-1), 6.965);
    video.complete(6.965);
    player.tick(0);
    assert.equal(
      video.requests.length,
      endRequests,
      'the clamped endpoint must not trigger an endless seek loop'
    );
    player.destroy();
    assert.equal(video.frameCallback, null);
  } finally {
    if (previous === undefined) delete globalThis.document;
    else globalThis.document = previous;
  }
});
