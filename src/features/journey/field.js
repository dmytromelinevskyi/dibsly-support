// The particle field behind the landing (main's v3/v3.js startField, 2026-10-28; owner, 2026-10-29: «крошек, то фон
// сейчас тупо черный»): grey points with a few orange sparks, like the app's grain, that follow the mouse and the
// scroll. Unchanged but for three.js coming from the bundle and a destroy() for the page's unmount.
export function startField(THREE, canvas, small) {
  if (!canvas) return null;
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch (error) {
    return null;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 9);

  var count = small ? 2600 : 7000;
  var positions = new Float32Array(count * 3);
  var seeds = new Float32Array(count * 4);
  var seed = 11;
  function rnd() {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  }
  for (var i = 0; i < count; i++) {
    var x, y, z;
    if (i % 3 === 0) {
      // A loose sphere of coins.
      var u = rnd() * 2 - 1,
        phi = rnd() * Math.PI * 2,
        r = 2.2 + Math.pow(rnd(), 0.6) * 1.6;
      var s = Math.sqrt(1 - u * u);
      x = r * s * Math.cos(phi);
      y = r * u * 0.85;
      z = r * s * Math.sin(phi);
    } else {
      // A spiral disc around it.
      var arm = i % 2,
        t = rnd(),
        angle = t * Math.PI * 5 + arm * Math.PI,
        radius = 2.6 + t * 6.5;
      x = Math.cos(angle) * radius + (rnd() - 0.5) * 1.4;
      z = Math.sin(angle) * radius + (rnd() - 0.5) * 1.4;
      y = (rnd() - 0.5) * (0.5 + t * 1.2);
    }
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    seeds[i * 4] = rnd();
    seeds[i * 4 + 1] = rnd();
    seeds[i * 4 + 2] = rnd();
    seeds[i * 4 + 3] = rnd() < 0.12 ? 1 : 0;
  }
  var geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('seed', new THREE.BufferAttribute(seeds, 4));
  var uniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uScroll: { value: 0 },
    uSpread: { value: 0 },
    uFade: { value: 1 },
    uPixel: { value: renderer.getPixelRatio() },
  };
  var material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: [
      'attribute vec4 seed;',
      'uniform float uTime; uniform vec2 uMouse; uniform float uScroll; uniform float uSpread; uniform float uPixel;',
      'varying float vWarm; varying float vAlpha;',
      'void main(){',
      '  vec3 p = position;',
      '  float t = uTime * (0.05 + seed.x * 0.08);',
      '  p += vec3(sin(t + seed.y * 6.28), cos(t * 1.3 + seed.z * 6.28), sin(t * 0.7 + seed.x * 6.28)) * (0.08 + seed.z * 0.18);',
      '  p *= 1.0 + uSpread * (0.6 + seed.y * 1.6);',
      '  p.y += uSpread * (seed.z - 0.5) * 6.0;',
      '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
      '  vec4 clip = projectionMatrix * mv;',
      '  vec2 ndc = clip.xy / clip.w;',
      '  vec2 away = ndc - uMouse;',
      '  float d = length(away);',
      '  float push = smoothstep(0.35, 0.0, d) * 0.12;',
      '  clip.xy += normalize(away + 1e-4) * push * clip.w;',
      '  gl_Position = clip;',
      '  gl_PointSize = (1.2 + seed.w * 1.6 + seed.x * 2.2) * uPixel * (7.0 / -mv.z);',
      '  vWarm = seed.w;',
      '  vAlpha = 0.35 + seed.y * 0.65;',
      '}',
    ].join('\n'),
    fragmentShader: [
      'uniform float uFade; varying float vWarm; varying float vAlpha;',
      'void main(){',
      '  float d = length(gl_PointCoord - 0.5);',
      '  float a = smoothstep(0.5, 0.0, d);',
      '  vec3 warm = vec3(1.0, 0.54, 0.24); vec3 cream = vec3(0.96, 0.92, 0.86);',
      '  vec3 c = mix(cream * 0.62, warm * 1.15, vWarm);',
      '  gl_FragColor = vec4(c, a * vAlpha * uFade);',
      '}',
    ].join('\n'),
  });
  var points = new THREE.Points(geometry, material);
  var group = new THREE.Group();
  group.add(points);
  group.rotation.x = 0.42;
  group.position.x = small ? 0 : 2.2;
  scene.add(group);

  var mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  function point(event) {
    mouse.tx = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = -((event.clientY / window.innerHeight) * 2 - 1);
  }
  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('pointermove', point, { passive: true });
  window.addEventListener('resize', resize);

  var state = { spread: 0, fade: 1, shiftX: small ? 0 : 2.2, zoom: 9 };
  var running = true,
    frame = 0;
  function visible() {
    running = !document.hidden;
    if (running) loop();
  }
  document.addEventListener('visibilitychange', visible);
  // The field's pace (owner, 2026-10-28: the stars sped up as the page went on, hard to read over them). On screen
  // it stays within 1.3 times its start: the turn and the drift slow down as much as the spread and the camera
  // make them look faster (a point twice as far from the centre moves twice as far), and the scroll's changes —
  // the spread, the camera, the shift aside — move the points by at most a quarter of the start's speed, so a
  // new section eases in over a minute instead of a second. Time-based, so a 120 Hz screen is no faster.
  // Measured on the page: at the start the points move about 0.7% of the window's height a second; a unit of
  // spread moves them up to 0.6 of it, a unit of camera 0.05, a unit of shift 0.13.
  var last = performance.now(),
    clock = 0,
    START = 0.007;
  function ease(rate, dt) {
    return 1 - Math.pow(1 - rate, dt * 60);
  }
  function loop() {
    if (!running) {
      last = performance.now();
      return;
    }
    var now = performance.now(),
      dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    mouse.x += (mouse.tx - mouse.x) * ease(0.06, dt);
    mouse.y += (mouse.ty - mouse.y) * ease(0.06, dt);
    uniforms.uMouse.value.set(mouse.x, mouse.y);
    uniforms.uFade.value += (state.fade - uniforms.uFade.value) * ease(0.05, dt);
    var ds = (state.spread - uniforms.uSpread.value) * ease(0.025, dt);
    var dz = (state.zoom - camera.position.z) * ease(0.025, dt);
    var dx = (state.shiftX - group.position.x) * ease(0.025, dt);
    var moves = Math.abs(ds) * 0.6 + Math.abs(dz) * 0.05 + Math.abs(dx) * 0.13,
      allowed = START * 0.25 * dt;
    var share = moves > allowed ? allowed / moves : 1;
    uniforms.uSpread.value += ds * share;
    camera.position.z += dz * share;
    group.position.x += dx * share;
    var apparent = ((1 + uniforms.uSpread.value * 1.4) * 9) / camera.position.z;
    var pace = Math.min(apparent, 1.05) / apparent;
    clock += dt * pace;
    uniforms.uTime.value = clock;
    group.rotation.y += 0.021 * dt * pace;
    group.rotation.x = 0.42 + mouse.y * 0.12;
    group.rotation.z = mouse.x * 0.08;
    renderer.render(scene, camera);
    frame = requestAnimationFrame(loop);
  }
  loop();
  canvas.classList.add('on');
  state.destroy = function () {
    running = false;
    cancelAnimationFrame(frame);
    window.removeEventListener('pointermove', point);
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', visible);
    canvas.classList.remove('on');
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };
  return state;
}
