import { filmAt } from '../cinema/film-timeline.js';
let current = null;
/**
 * One chapter's film as the page's own muted video: it loads when the chapter comes near, plays while its phone is
 * at least half on the screen and stops when it leaves; one film plays at a time. The hand, the outline and the tap's
 * ring are DOM over the screen, moved with transform and opacity from the film's steps on each frame it plays.
 */
export function createFilmView({ video, glass, root, film, onStep, onPlaying }) {
  const outline = root.querySelector('[data-cue-outline]'),
    ring = root.querySelector('[data-cue-ring]'),
    hand = root.querySelector('[data-cue-hand]'),
    progress = root.querySelector('[data-cue-progress]');
  let raf = 0,
    visible = false,
    held = false,
    size = { width: 1, height: 1 },
    shownStep = -1,
    shownPhase = '';
  video.muted = true;
  video.defaultMuted = true;
  function placeStep(step) {
    const [x, y, w, h] = step.target;
    outline.style.left = `${(x - w / 2) * 100}%`;
    outline.style.top = `${(y - h / 2) * 100}%`;
    outline.style.width = `${w * 100}%`;
    outline.style.height = `${h * 100}%`;
    ring.style.left = `${x * 100}%`;
    ring.style.top = `${y * 100}%`;
  }
  function render() {
    const cue = filmAt(film, video.currentTime || 0);
    const moved = cue.index !== shownStep;
    if (moved) placeStep(cue.step);
    if (moved || cue.phase !== shownPhase) {
      shownStep = cue.index;
      shownPhase = cue.phase;
      onStep(cue.index, cue.phase, cue.watch);
    }
    outline.style.opacity = cue.opacity.toFixed(3);
    ring.style.opacity = (Math.sin(cue.pulse * Math.PI) * 0.9).toFixed(3);
    ring.style.transform = `translate(-50%, -50%) scale(${(0.4 + cue.pulse * 2.4).toFixed(3)})`;
    hand.style.opacity = cue.hand.toFixed(3);
    hand.style.transform = `translate3d(${(cue.pointer[0] * size.width).toFixed(1)}px, ${(cue.pointer[1] * size.height).toFixed(1)}px, 0) scale(${(1 - cue.pulse * 0.1).toFixed(3)})`;
    progress.style.transform = `scaleX(${cue.progress.toFixed(4)})`;
  }
  function loop() {
    render();
    raf = video.paused ? 0 : requestAnimationFrame(loop);
  }
  async function play() {
    if (current && current !== view) current.pause();
    current = view;
    try {
      await video.play();
    } catch {
      // Low Power Mode or a browser that refuses: the poster stays, «Watch» starts it by hand.
      onPlaying(false);
    }
  }
  const view = {
    play() {
      held = false;
      return play();
    },
    pause() {
      video.pause();
    },
    hold() {
      held = true;
      video.pause();
    },
    seek(index) {
      const step = film.steps[Math.max(0, Math.min(film.steps.length - 1, index))];
      video.currentTime = step.start + 0.001;
      render();
    },
    get step() {
      return shownStep;
    },
  };
  const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || video.getAttribute('src')) return;
        video.src = '/' + film.src;
        video.preload = 'auto';
        near.disconnect();
      },
      { rootMargin: '120% 0px' }
    ),
    seen = new IntersectionObserver(
      ([entry]) => {
        visible = entry.intersectionRatio >= 0.5;
        if (visible && !held) play();
        else if (!visible) video.pause();
      },
      { threshold: [0, 0.5] }
    ),
    resize = new ResizeObserver(() => {
      size = { width: glass.clientWidth, height: glass.clientHeight };
      render();
    });
  const onPlay = () => {
      onPlaying(true);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    },
    onPause = () => onPlaying(false),
    onSeeked = () => render();
  video.addEventListener('play', onPlay);
  video.addEventListener('pause', onPause);
  video.addEventListener('seeked', onSeeked);
  near.observe(root);
  seen.observe(glass);
  resize.observe(glass);
  return Object.assign(view, {
    destroy() {
      cancelAnimationFrame(raf);
      near.disconnect();
      seen.disconnect();
      resize.disconnect();
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('seeked', onSeeked);
      if (current === view) current = null;
    },
  });
}
