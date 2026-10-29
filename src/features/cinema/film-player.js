import { clamp } from './timeline.js';
/** Publish only complete decoded frames. Loading, seeking and stale callbacks preserve the last display. */
export function createFilmPlayer({
  onFrame = () => {},
  onDecoded = () => true,
  onPlaying = () => {},
  onError = () => {},
} = {}) {
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.disablePictureInPicture = true;
  let film = null,
    desired = 0,
    clock = 0,
    decoded = 0,
    playing = false,
    disposed = false,
    callback = 0,
    loaded = false,
    presented = false,
    generation = 0;
  const publish = (time) => {
    if (disposed || !loaded || video.readyState < 2 || video.seeking || !film) return;
    if (onDecoded({ video, film, time, generation }) === false) return;
    decoded = time;
    presented = true;
    onFrame();
  };
  const requestFrame = () => {
    if (disposed || !video.requestVideoFrameCallback) return;
    const revision = generation;
    callback = video.requestVideoFrameCallback((_, metadata) => {
      if (revision !== generation || disposed) return;
      // Paused seek callbacks can arrive after a newer seeked event. Keep their committed clock stable.
      publish(playing ? metadata.mediaTime : video.currentTime);
      requestFrame();
    });
  };
  const seek = () => {
    if (!loaded || playing || video.seeking) return;
    const target = clamp(
      Math.round(clock * 30) / 30,
      0,
      Math.max(0, (video.duration || film.duration) - 0.035)
    );
    if (Math.abs(video.currentTime - target) < 1 / 65) return;
    video.currentTime = target;
  };
  const onMetadata = () => {
    loaded = true;
    seek();
    onFrame();
  };
  const onLoaded = () => {
    loaded = true;
    if (Math.abs(video.currentTime - clock) < 1 / 65) publish(video.currentTime);
    seek();
    onFrame();
  };
  const onSeeked = () => {
    publish(video.currentTime);
    seek();
    onFrame();
  };
  const onEnded = () => {
    playing = false;
    clock = desired = film?.duration || 0;
    onPlaying(false);
    onFrame();
  };
  const onErrorEvent = () => onError();
  video.addEventListener('loadedmetadata', onMetadata);
  video.addEventListener('loadeddata', onLoaded);
  video.addEventListener('seeked', onSeeked);
  video.addEventListener('ended', onEnded);
  video.addEventListener('error', onErrorEvent);
  return {
    video,
    get film() {
      return film;
    },
    get time() {
      return decoded;
    },
    get ready() {
      return loaded && presented;
    },
    get playing() {
      return playing;
    },
    setFilm(next, initialTime = 0) {
      if (film === next) return;
      video.pause();
      playing = false;
      onPlaying(false);
      generation++;
      if (callback && video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(callback);
      film = next;
      desired = clock = clamp(initialTime, 0, next.duration);
      decoded = 0;
      loaded = presented = false;
      video.src = next.src;
      video.load();
      requestFrame();
    },
    target(time) {
      desired = clamp(time, 0, film?.duration || 0);
    },
    tick(dt) {
      if (!film) return false;
      if (playing) {
        clock = desired = video.currentTime;
        return true;
      }
      const difference = desired - clock;
      clock += Math.sign(difference) * Math.min(Math.abs(difference), (dt / 1000) * 1.3);
      seek();
      return Math.abs(difference) > 0.015 || video.seeking;
    },
    manual() {
      if (playing) {
        video.pause();
        playing = false;
        clock = desired = video.currentTime;
        onPlaying(false);
      }
    },
    toggle() {
      if (!film || !loaded) return;
      playing = !playing;
      if (playing) {
        if (video.currentTime > film.duration - 0.12) {
          clock = desired = 0;
          video.currentTime = 0;
        }
        const revision = generation;
        video.play().catch(() => {
          if (revision !== generation || disposed) return;
          playing = false;
          onPlaying(false);
        });
      } else {
        video.pause();
        clock = desired = video.currentTime;
      }
      onPlaying(playing);
      onFrame();
    },
    jump(time) {
      video.pause();
      playing = false;
      onPlaying(false);
      clock = desired = clamp(time, 0, film.duration);
      seek();
      onFrame();
    },
    destroy() {
      disposed = true;
      generation++;
      video.pause();
      if (callback && video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(callback);
      video.removeEventListener('loadedmetadata', onMetadata);
      video.removeEventListener('loadeddata', onLoaded);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', onErrorEvent);
      video.removeAttribute('src');
      video.load();
    },
  };
}
