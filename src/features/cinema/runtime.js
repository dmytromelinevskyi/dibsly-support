import * as THREE from 'three';
import { createPhone } from './phone-scene.js';
import { createStudio } from './studio-scene.js';
import { createReactionField } from './reaction-field.js';
import { createFilmPlayer } from './film-player.js';
import { filmAt, chapterProgress, fittedPhone, travelAt, smoother } from './film-timeline.js';
import { attachScrollDriver } from '../motion/scroll-driver.js';
import { createJourneyLine } from '../motion/journey-line.js';
import { getChapters } from './story.js';
import { clamp, mix, smooth } from './timeline.js';

export function createCinema({
  canvas,
  routeCanvas,
  element,
  lang,
  onReady,
  onChapter,
  onUnsupported,
}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
  } catch {
    onUnsupported();
    return { destroy() {} };
  }
  renderer.setClearColor(0x141513, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const chapters = getChapters(lang),
    sections = [...element.querySelectorAll('.cinema-chapter')],
    hero = element.querySelector('.cinema-hero'),
    heroCopy = element.querySelector('.hero-content');
  const headings = sections.map((s) => s.querySelector('.chapter-heading')),
    captions = sections.map((s) => s.querySelector('.chapter-caption')),
    copies = sections.map((s) => s.querySelector('.chapter-copy'));
  const fields = captions.map((c) => ({
    control: c.querySelector('[data-control]'),
    caption: c.querySelector('[data-caption]'),
    step: c.querySelector('[data-step]'),
    phase: c.querySelector('[data-phase]'),
    previous: c.querySelector('[data-skip="-1"]'),
    next: c.querySelector('[data-skip="1"]'),
  }));
  const offsets = [];
  let total = 0;
  for (const chapter of chapters) {
    offsets.push(total);
    total += chapter.film.steps.length;
  }
  const scene = new THREE.Scene(),
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 3000);
  camera.position.z = 1000;
  const phone = createPhone(renderer),
    studio = createStudio(),
    field = createReactionField({ total, mobile: innerWidth <= 900 }),
    route = createJourneyLine(routeCanvas);
  scene.environment = phone.environment;
  scene.add(phone.object, studio.object, field.object, new THREE.AmbientLight(0xe5e1d6, 1.5));
  const key = new THREE.DirectionalLight(0xffe4c7, 5);
  key.position.set(-300, 600, 600);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xdce7ff, 4);
  rim.position.set(500, 0, 300);
  scene.add(rim);
  const galleryDevice = document.querySelector('.gallery-device'),
    destination = document.querySelector('[data-journey-destination]'),
    energy = element.querySelector('[data-energy]');
  const playButtons = [...element.querySelectorAll('[data-play]')],
    lastOpacity = sections.map(() => -1),
    lastShift = sections.map(() => null),
    posters = new Map();
  let width = 1,
    height = 1,
    mobileLayout = false,
    metrics = [],
    heroHeight = 1,
    raf = 0,
    last = 0,
    elapsed = 0,
    lastRender = 0,
    destroyed = false,
    needsMeasure = true,
    active = -2,
    captionKey = '',
    pressedAction = '',
    override = false,
    // The chapter whose film already started by itself: a film plays once on arrival, not on every scroll.
    autoplayed = -1,
    lastScroll = scrollY,
    ready = false,
    poster = null,
    screenFrames = 0,
    impact = -10,
    lastEnergy = -1;
  const costs = [];
  let sampleCount = 0;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 },
    fine = matchMedia('(hover:hover) and (pointer:fine)');
  const player = createFilmPlayer({
    onFrame: schedule,
    onDecoded({ video, film, time }) {
      if (active < 0 || film !== chapters[active].film) return false;
      if (nativeOn) {
        screenFrames++;
        schedule();
        return true;
      }
      const accepted = phone.present(video, film.src, time);
      if (accepted) screenFrames++;
      schedule();
      return accepted || phone.screenSource === film.src;
    },
    onPlaying(playing) {
      element.dataset.playing = String(playing);
      for (const button of playButtons) {
        button.setAttribute('aria-pressed', String(playing));
        button.querySelector('span').textContent = playing
          ? lang === 'uk'
            ? 'Пауза'
            : 'Pause'
          : lang === 'uk'
            ? 'Дивитися'
            : 'Watch';
      }
      schedule();
    },
    onError() {
      onUnsupported();
      destroy();
    },
  });
  player.video.className = 'cinema-source';
  player.video.setAttribute('aria-hidden', 'true');
  player.video.tabIndex = -1;
  element.append(player.video);
  // Chapters whose film plays as the page's own video under the phone's screen (a trial on step 01).
  const NATIVE = new Set(['auto']);
  let nativeOn = false;
  function setNative(on, film) {
    if (on === nativeOn) return;
    nativeOn = on;
    phone.native(on);
    const video = player.video;
    if (on) {
      canvas.parentElement.insertBefore(video, canvas);
      video.className = 'cinema-screen';
      video.poster = '/' + film.poster;
    } else {
      element.append(video);
      video.className = 'cinema-source';
      video.removeAttribute('poster');
      video.style.transform = '';
    }
  }
  const projected = new THREE.Vector3();
  function placeNative() {
    const video = player.video,
      w = 640,
      h = 1392;
    video.style.visibility = phone.object.visible ? 'visible' : 'hidden';
    if (!phone.object.visible) return;
    const quad = phone.screenCorners().map((corner) => {
      projected.copy(corner).project(camera);
      return [((projected.x + 1) / 2) * width, ((1 - projected.y) / 2) * height];
    });
    video.style.transform = matrixFor(w, h, quad);
  }
  copies.forEach((copy) => (copy.style.opacity = '1'));
  const driver = attachScrollDriver(schedule);
  const image = new Image();
  image.onload = () => {
    poster = image;
    schedule();
  };
  image.onerror = () => {
    if (active < 0 && !phone.hasFrame) {
      onUnsupported();
      destroy();
    }
  };
  image.src = `/assets/cinema/${lang}/main.webp`;
  function loadPoster(index) {
    if (index < 0 || index >= chapters.length || posters.has(index)) return;
    const still = new Image();
    posters.set(index, still);
    still.onload = schedule;
    still.src = chapters[index].film.poster;
  }
  loadPoster(0);
  // The next chapter's film is fetched while this one plays, so it is ready on arrival.
  const prefetched = new Set();
  function prefetch(index) {
    const film = chapters[index]?.film;
    if (!film || prefetched.has(film.src)) return;
    prefetched.add(film.src);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'video';
    link.href = film.src;
    document.head.append(link);
  }
  function schedule() {
    if (!raf && !destroyed && !document.hidden) raf = requestAnimationFrame(tick);
  }
  function measure() {
    width = document.documentElement.clientWidth;
    mobileLayout = innerWidth <= 900;
    height = innerHeight;
    // Phones draw the 3D scene at 1×: a third fewer pixels a frame while a film plays.
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobileLayout ? 1 : 1.6));
    renderer.setSize(width, height, false);
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();
    heroHeight = hero.offsetHeight;
    metrics = sections.map((s) => ({
      top: s.getBoundingClientRect().top + scrollY,
      height: s.offsetHeight,
    }));
    const rect = destination?.getBoundingClientRect();
    route.measure(
      width,
      height,
      document.documentElement.scrollHeight,
      rect
        ? {
            x: rect.x + rect.width / 2,
            y: rect.y + scrollY + rect.height / 2,
            radius: rect.width / 2,
          }
        : null
    );
    needsMeasure = false;
  }
  function pose(index) {
    if (width > height * 1.35 && innerWidth <= 1000 && height < 560)
      return { x: width * 0.75, y: height * 0.55, height: height - 110, rx: 0, ry: 0, rz: 0 };
    let result;
    if (mobileLayout) {
      let top, bottom;
      if (index < 0) {
        top = heroCopy.offsetTop + heroCopy.offsetHeight + 20;
        bottom = height - 92;
      } else {
        const padding = innerWidth <= 390 || height <= 650 ? 86 : 94;
        top = padding + headings[index].offsetHeight + 12;
        bottom =
          height -
          (innerWidth <= 390 || height <= 650 ? 14 : 22) -
          captions[index].offsetHeight -
          12;
      }
      result = fittedPhone(
        width,
        height,
        Math.max(index < 0 ? 210 : 145, top),
        Math.max(top + 120, bottom)
      );
    } else
      result = {
        x: width * (index < 0 || index % 2 === 0 ? 0.735 : 0.265),
        y: height * 0.52,
        height: Math.min(height - 164, width * 0.48 * 2.14, 760),
      };
    return {
      ...result,
      rx: index < 0 ? -0.045 : 0,
      ry: index < 0 ? -0.23 : 0,
      rz: index < 0 ? 0.04 : 0,
    };
  }
  function tick(now) {
    raf = 0;
    if (destroyed || document.hidden) return;
    const tickStart = performance.now();
    const dt = Math.min(50, last ? now - last : 16.7);
    last = now;
    elapsed += dt / 1000;
    if (needsMeasure) measure();
    const scroll = driver.step(dt),
      moved = Math.abs(scroll - lastScroll) > 0.35;
    // A film playing by itself keeps playing while the page scrolls; scrolling seeks only a stopped film.
    if (moved && !(player.playing && autoplayed === active)) {
      player.manual();
      override = false;
    }
    lastScroll = scroll;
    const cinemaBottom = metrics.at(-1).top + metrics.at(-1).height,
      after = smoother(cinemaBottom - height, cinemaBottom, scroll),
      exit = smoother(cinemaBottom - height, cinemaBottom - height * 0.12, scroll);
    element.dataset.visible = String(scroll < cinemaBottom - height * 0.25);
    let index = Math.max(
      -1,
      metrics.findLastIndex((m) => scroll >= m.top - height * 0.5)
    );
    if (index !== active) {
      active = index;
      captionKey = '';
      pressedAction = '';
      override = false;
      sections.forEach((section, i) => {
        section.inert = i !== index;
        section.dataset.active = String(i === index);
      });
      onChapter(index);
      element.dataset.activeChapter = index < 0 ? 'hero' : chapters[index].id;
      if (index >= 0) {
        // Every chapter starts its film from the beginning and plays it (seeking on each scroll stuttered on phones).
        setNative(NATIVE.has(chapters[index].id), chapters[index].film);
        player.setFilm(chapters[index].film, 0);
        autoplayed = -1;
        prefetch(index + 1);
        loadPoster(index);
        loadPoster(index + 1);
        field.completeUntil(offsets[index], elapsed);
      } else {
        setNative(false);
        player.manual();
      }
    }
    let cue = null,
      filmBusy = false;
    if (index >= 0 && after < 1) {
      const film = chapters[index].film;
      if (player.ready && autoplayed !== index && !override) {
        autoplayed = index;
        if (!player.playing) player.toggle();
      }
      if (!override && !player.playing && autoplayed !== index)
        player.target(chapterProgress(metrics[index], scroll, height) * film.duration);
      filmBusy = player.tick(dt);
      if (!phone.hasFrame) {
        const still = posters.get(index);
        if (still?.complete && still.naturalWidth) phone.usePoster(still);
      }
      cue = filmAt(film, player.time);
      phone.cue(player.ready ? cue : null);
      const captionIdentity = `${index}:${cue.index}:${cue.phase}`;
      if (captionIdentity !== captionKey) {
        const f = fields[index];
        f.control.textContent = cue.step.control;
        f.caption.textContent = cue.step.description;
        f.step.textContent = `${String(cue.index + 1).padStart(2, '0')} / ${String(film.steps.length).padStart(2, '0')}`;
        f.phase.textContent = (
          cue.watch
            ? {
                uk: {
                  focus: 'Чекаємо',
                  press: 'Приходить',
                  transition: 'Приходить',
                  result: 'Уже тут',
                },
                en: {
                  focus: 'Waiting',
                  press: 'Arriving',
                  transition: 'Arriving',
                  result: 'Already here',
                },
              }
            : {
                uk: {
                  focus: 'Знайди кнопку',
                  press: 'Натискаємо',
                  transition: 'Відкривається',
                  result: 'Результат',
                },
                en: {
                  focus: 'Find the control',
                  press: 'Tap',
                  transition: 'Opening',
                  result: 'The result',
                },
              }
        )[lang][cue.phase];
        f.previous.disabled = cue.index === 0;
        f.next.disabled = cue.index === film.steps.length - 1;
        captions[index].dataset.phase = cue.phase;
        captionKey = captionIdentity;
      }
      captions[index].style.setProperty('--film-progress', cue.progress);
      canvas.dataset.time = player.time.toFixed(3);
      canvas.dataset.phase = cue.phase;
      canvas.dataset.control = cue.step.control;
    } else {
      phone.cue(null);
      if (index < 0 && poster) phone.usePoster(poster);
    }
    const alpha = 1 - Math.exp(-dt / 150);
    pointer.x += (pointer.tx - pointer.x) * alpha;
    pointer.y += (pointer.ty - pointer.y) * alpha;
    const { index: poseIndex, progress: enter } = travelAt(metrics, scroll, height),
      current = pose(poseIndex),
      previous = pose(poseIndex - 1),
      arc = Math.sin(enter * Math.PI),
      direction = poseIndex % 2 === 0 ? 1 : -1;
    const x = mix(previous.x, current.x, enter) + pointer.x * (mobileLayout ? 4 : 13),
      y =
        mix(previous.y, current.y, enter) -
        arc * height * (mobileLayout ? 0.015 : 0.065) -
        pointer.y * 8 -
        exit * height * 0.88;
    const phoneHeight = mix(previous.height, current.height, enter) * (1 - arc * 0.065);
    phone.object.visible = exit < 1;
    phone.object.scale.setScalar(phoneHeight / 4.5);
    phone.object.position.set(x - width / 2, height / 2 - y, 110 + arc * 30);
    phone.object.rotation.set(
      mix(previous.rx, current.rx, enter) + arc * 0.1 + pointer.y * 0.045,
      mix(previous.ry, current.ry, enter) + direction * arc * 0.38 + pointer.x * 0.085,
      mix(previous.rz, current.rz, enter) +
        direction * Math.sin(enter * Math.PI * 2) * 0.065 +
        pointer.x * 0.014
    );
    if (cue && player.ready && after < 1) {
      const completed = offsets[index] + cue.index;
      field.completeUntil(completed, elapsed);
      if (cue.phase === 'press' && (cue.pulse > 0.02 || cue.watch)) {
        const id = `${index}:${cue.index}`;
        if (pressedAction !== id) {
          pressedAction = id;
          const point = phone.projectTouch(cue.step.target),
            origin = [point.x / width + 0.5, point.y / height + 0.5];
          if (!field.activate(completed, origin, elapsed)) field.pulse(origin, elapsed);
          impact = elapsed;
          captions[index].animate?.([{ filter: 'brightness(1.6)' }, { filter: 'brightness(1)' }], {
            duration: 900,
            easing: 'cubic-bezier(.22,1,.36,1)',
          });
        }
      } else {
        if (cue.phase !== 'press') pressedAction = '';
        if (cue.phase === 'transition' || cue.phase === 'result')
          field.completeUntil(completed + 1, elapsed);
      }
    }
    if (after > 0) field.completeUntil(total, elapsed);
    if (field.completed !== lastEnergy) {
      lastEnergy = field.completed;
      if (energy) energy.textContent = `${String(lastEnergy).padStart(2, '0')} / ${total}`;
      element.style.setProperty('--assembly', lastEnergy / total);
    }
    studio.update({
      width,
      height,
      progress: clamp(scroll / Math.max(1, cinemaBottom - height)),
      x: pointer.x,
      y: pointer.y,
      phoneX: x,
      time: elapsed,
      after,
    });
    field.update({
      width,
      height,
      time: elapsed,
      x: pointer.x,
      y: pointer.y,
      dpr: renderer.getPixelRatio(),
      after,
    });
    key.position.x = -300 + pointer.x * 330;
    key.position.y = 600 + pointer.y * 180;
    rim.position.y = pointer.y * 350;
    rim.intensity = 4 + Math.max(0, 1 - (elapsed - impact) / 1.2) * 1.5;
    const exclusion = phone.object.visible
      ? {
          left: x - phoneHeight * 0.27 - 8,
          top: y - phoneHeight / 2 - 5,
          width: phoneHeight * 0.54 + 16,
          height: phoneHeight + 10,
        }
      : galleryDevice?.getBoundingClientRect();
    route.draw(scroll, exclusion);
    heroCopy.style.opacity = String(
      1 - smooth(heroHeight - height * 0.9, heroHeight - height * 0.15, scroll)
    );
    for (let i = 0; i < sections.length; i++) {
      const m = metrics[i],
        entry = smooth(m.top - height * 0.7, m.top - height * 0.12, scroll),
        leave = 1 - smooth(m.top + m.height - height, m.top + m.height - height * 0.3, scroll),
        opacity = entry * leave;
      if (lastOpacity[i] !== opacity) {
        headings[i].style.opacity = String(opacity);
        captions[i].style.opacity = String(opacity);
        lastOpacity[i] = opacity;
      }
      const shift = `${(1 - entry) * 32 - (1 - leave) * 32}px`;
      if (lastShift[i] !== shift) {
        sections[i].style.setProperty('--copy-shift', shift);
        lastShift[i] = shift;
      }
    }
    const blending = phone.updateScreen(now);
    canvas.dataset.frames = String(screenFrames);
    canvas.dataset.source = phone.screenSource;
    canvas.dataset.assembly = String(field.completed);
    canvas.dataset.phoneX = x.toFixed(2);
    canvas.dataset.phoneY = y.toFixed(2);
    canvas.dataset.phoneHeight = phoneHeight.toFixed(2);
    const interacting =
      moved ||
      filmBusy ||
      blending ||
      Math.abs(pointer.tx - pointer.x) + Math.abs(pointer.ty - pointer.y) > 0.005;
    if (nativeOn) placeNative();
    if (interacting || nativeOn || width > 900 || now - lastRender >= 32) {
      renderer.render(scene, camera);
      lastRender = now;
    }
    if (!ready && phone.hasFrame) {
      ready = true;
      canvas.dataset.ready = 'true';
      onReady();
    }
    costs.push(performance.now() - tickStart);
    if (costs.length > 180) costs.shift();
    if (++sampleCount % 60 === 0) {
      const sorted = [...costs].sort((a, b) => a - b);
      canvas.dataset.costP95 = sorted[Math.floor(sorted.length * 0.95)].toFixed(2);
    }
    schedule();
  }
  const onResize = () => {
    needsMeasure = true;
    schedule();
  };
  const onPointer = (e) => {
    if (!fine.matches) return;
    pointer.tx = (e.clientX / width) * 2 - 1;
    pointer.ty = 1 - (e.clientY / innerHeight) * 2;
    schedule();
  };
  const onLeave = () => {
    pointer.tx = pointer.ty = 0;
  };
  const onVisibility = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
    if (document.hidden) player.manual();
    else {
      // Back on the tab: a film that was playing by itself goes on (not one the person paused or that ended).
      const film = active >= 0 ? chapters[active].film : null;
      if (film && autoplayed === active && !override && player.time < film.duration - 0.2)
        autoplayed = -1;
      schedule();
    }
  };
  const onControl = (e) => {
    const button = e.target.closest('[data-play],[data-skip]');
    if (!button || active < 0) return;
    override = true;
    driver.cancel();
    lastScroll = scrollY;
    if (button.hasAttribute('data-play')) player.toggle();
    else {
      const state = filmAt(chapters[active].film, player.time),
        next = clamp(
          state.index + Number(button.dataset.skip),
          0,
          chapters[active].film.steps.length - 1
        );
      player.jump(chapters[active].film.steps[next].start + 0.05);
    }
    schedule();
  };
  const onLost = (e) => {
    e.preventDefault();
    onUnsupported();
    destroy();
  };
  const resize = new ResizeObserver(onResize);
  resize.observe(element);
  resize.observe(document.body);
  if (destination) resize.observe(destination);
  document.fonts?.ready.then(() => {
    if (!destroyed) onResize();
  });
  addEventListener('resize', onResize, { passive: true });
  addEventListener('pointermove', onPointer, { passive: true });
  document.addEventListener('pointerleave', onLeave);
  document.addEventListener('visibilitychange', onVisibility);
  element.addEventListener('click', onControl);
  canvas.addEventListener('webglcontextlost', onLost);
  schedule();
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    cancelAnimationFrame(raf);
    resize.disconnect();
    driver.destroy();
    player.destroy();
    player.video.remove();
    phone.dispose();
    studio.dispose();
    field.dispose();
    route.destroy();
    renderer.dispose();
    image.onload = image.onerror = null;
    for (const still of posters.values()) still.onload = null;
    delete canvas.dataset.ready;
    removeEventListener('resize', onResize);
    removeEventListener('pointermove', onPointer);
    document.removeEventListener('pointerleave', onLeave);
    document.removeEventListener('visibilitychange', onVisibility);
    element.removeEventListener('click', onControl);
    canvas.removeEventListener('webglcontextlost', onLost);
    copies.forEach((c) => c.style.removeProperty('opacity'));
    sections.forEach((s, i) => {
      s.inert = false;
      s.style.removeProperty('--copy-shift');
      headings[i].style.removeProperty('opacity');
      captions[i].style.removeProperty('opacity');
    });
    heroCopy.style.removeProperty('opacity');
  }
  return { destroy };
}

/** CSS matrix3d that maps a w×h element onto a quad (top-left, top-right, bottom-right, bottom-left), in pixels. */
function matrixFor(w, h, quad) {
  const source = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h],
  ];
  const rows = [],
    values = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = source[i],
      [u, v] = quad[i];
    rows.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    values.push(u);
    rows.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    values.push(v);
  }
  // Gaussian elimination with partial pivoting.
  for (let c = 0; c < 8; c++) {
    let pivot = c;
    for (let r = c + 1; r < 8; r++) if (Math.abs(rows[r][c]) > Math.abs(rows[pivot][c])) pivot = r;
    [rows[c], rows[pivot]] = [rows[pivot], rows[c]];
    [values[c], values[pivot]] = [values[pivot], values[c]];
    for (let r = 0; r < 8; r++) {
      if (r === c || !rows[c][c]) continue;
      const f = rows[r][c] / rows[c][c];
      for (let k = c; k < 8; k++) rows[r][k] -= f * rows[c][k];
      values[r] -= f * values[c];
    }
  }
  const [a, b, c, d, e, f, g, k] = values.map((value, i) => value / rows[i][i]);
  return `matrix3d(${a},${d},0,${g},${b},${e},0,${k},0,0,1,0,${c},${f},0,1)`;
}
