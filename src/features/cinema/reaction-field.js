import * as THREE from 'three';
import { clamp, smooth } from './timeline.js';
/** Every action contributes one permanent band of a sculptural D. Particles fly from its real touch point. */
export function createReactionField({ total = 24, mobile = false }) {
  const count = mobile ? 2400 : 6200,
    positions = [],
    seeds = [],
    batches = [];
  let randomState = 71823;
  const random = () => {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
    return randomState / 4294967296;
  };
  for (let i = 0; i < count; i++) {
    const a = random(),
      b = random(),
      c = random(),
      angle = (a - 0.5) * Math.PI;
    const bar = i % 5 === 0;
    positions.push(
      bar ? -1.08 + (b - 0.5) * 0.3 : -1.08 + Math.cos(angle) * (2.34 + (b - 0.5) * 0.32),
      bar ? (a - 0.5) * 3.55 : Math.sin(angle) * (1.77 + (b - 0.5) * 0.3),
      (c - 0.5) * 0.27 + Math.sin(angle * 2) * 0.12
    );
    seeds.push(random(), random(), random());
    batches.push(Math.floor(random() * total));
  }
  const launches = Array.from({ length: 32 }, () => new THREE.Vector4(0.5, 0.5, -1000, 0)),
    launched = new Set();
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 3));
  geometry.setAttribute('aBatch', new THREE.Float32BufferAttribute(batches, 1));
  const uniforms = {
    uLaunches: { value: launches },
    uTime: { value: 0 },
    uViewport: { value: new THREE.Vector2(1, 1) },
    uPointer: { value: new THREE.Vector2(0, 0) },
    uScale: { value: 200 },
    uDpr: { value: 1 },
    uOpacity: { value: 0.7 },
    uAfter: { value: 0 },
  };
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms,
    vertexShader: `
 attribute vec3 aSeed;attribute float aBatch;uniform vec4 uLaunches[32];uniform float uTime,uScale,uDpr,uOpacity,uAfter;uniform vec2 uViewport,uPointer;varying float vAlpha,vHeat,vLight;
 void main(){vec4 launch=uLaunches[int(aBatch)];float age=uTime-launch.z;float flight=clamp(age/(1.6+aSeed.x*.75),0.,1.);float q=flight*flight*flight*(flight*(flight*6.-15.)+10.);vec3 p=position;float angle=sin(uTime*.13)*.10+uPointer.x*.18;float oldX=p.x;p.x=oldX*cos(angle)+p.z*sin(angle);p.z=p.z*cos(angle)-oldX*sin(angle);p.xy*=uScale;p.xy+=vec2(sin(uTime*.14)*16.,cos(uTime*.11)*13.);p.z=p.z*uScale-190.;vec2 mouse=uPointer*uViewport*.5;vec2 away=p.xy-mouse;float force=exp(-dot(away,away)/32000.);p.xy+=normalize(away+vec2(.001))*force*55.;p.z+=force*75.;vec3 origin=vec3((launch.xy-.5)*uViewport,128.);vec3 bend=vec3(sin(aSeed.y*6.283)*uScale*.65,cos(aSeed.z*6.283)*uScale*.45,120.);vec3 world=mix(origin,p,q)+bend*sin(flight*3.14159);gl_Position=projectionMatrix*modelViewMatrix*vec4(world,1.);gl_PointSize=(1.25+aSeed.z*1.6+(1.-flight)*1.7)*uDpr;vAlpha=launch.w*step(-.001,age)*smoothstep(0.,.12,age)*uOpacity;vHeat=1.-smoothstep(.5,2.4,age);vLight=.55+aSeed.y*.45+force*.3;}
 `,
    fragmentShader: `varying float vAlpha,vHeat,vLight;void main(){float d=length(gl_PointCoord-.5)*2.;float a=(1.-smoothstep(.35,1.,d))*vAlpha;if(a<.005)discard;vec3 color=mix(vec3(.65,.70,.58),vec3(1.,.64,.27),vHeat)*vLight;gl_FragColor=vec4(color,a);}`,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  const group = new THREE.Group();
  group.add(points);
  const ringGeometry = new THREE.RingGeometry(0.96, 1, 96),
    waves = [];
  for (let i = 0; i < 4; i++) {
    const wave = { start: -100, origin: new THREE.Vector2(), rings: [] };
    for (let j = 0; j < 3; j++) {
      const m = new THREE.MeshBasicMaterial({
          color: 0xe7b477,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          side: THREE.DoubleSide,
        }),
        mesh = new THREE.Mesh(ringGeometry, m);
      mesh.visible = false;
      mesh.position.z = 135;
      group.add(mesh);
      wave.rings.push(mesh);
    }
    waves.push(wave);
  }
  let waveIndex = 0;
  function pulse(origin, time) {
    const wave = waves[waveIndex++ % waves.length];
    wave.start = time;
    wave.origin.set(...origin);
  }
  function activate(index, origin, time, visible = true) {
    if (index < 0 || index >= total || launched.has(index)) return false;
    launched.add(index);
    launches[index].set(origin[0], origin[1], time, 1);
    if (visible) pulse(origin, time);
    return true;
  }
  return {
    object: group,
    get completed() {
      return launched.size;
    },
    activate,
    pulse,
    completeUntil(amount, time) {
      for (let i = 0; i < Math.min(total, amount); i++)
        activate(i, [0.5, 0.18], time + i * 0.025, false);
    },
    update({ width, height, time, x, y, dpr = 1, after = 0 }) {
      uniforms.uTime.value = time;
      uniforms.uViewport.value.set(width, height);
      uniforms.uPointer.value.set(x, y);
      uniforms.uScale.value = Math.min(height * 0.32, width * 0.3);
      uniforms.uDpr.value = dpr;
      uniforms.uOpacity.value = width <= 900 ? 0.65 : 0.76;
      uniforms.uAfter.value = after;
      for (const wave of waves)
        for (let j = 0; j < wave.rings.length; j++) {
          const ring = wave.rings[j],
            age = time - wave.start - j * 0.13,
            p = clamp(age / 1.65),
            radius = 8 + (1 - (1 - p) ** 3) * Math.min(width, height) * (0.23 + j * 0.04);
          ring.visible = age >= 0 && age < 1.65;
          ring.position.x = (wave.origin.x - 0.5) * width;
          ring.position.y = (wave.origin.y - 0.5) * height;
          ring.scale.setScalar(radius);
          ring.material.opacity = (1 - smooth(0, 1, p)) * (j === 0 ? 0.6 : 0.32);
        }
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      ringGeometry.dispose();
      for (const w of waves) for (const r of w.rings) r.material.dispose();
    },
  };
}
