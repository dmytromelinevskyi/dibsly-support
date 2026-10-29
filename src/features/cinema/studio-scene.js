import * as THREE from 'three';
/** A continuous satin-metal strip, shaped and lit as a large studio object. */
export function createStudio() {
  const geometry = new THREE.BufferGeometry(),
    positions = [],
    uvs = [],
    indices = [],
    segments = 260;
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    for (let side = 0; side < 2; side++) {
      const v = side - 0.5,
        twist = t * 1.5 + 0.4;
      const radius = 2.1 + Math.cos(t * 2) * 0.18;
      positions.push(
        Math.cos(t) * radius + v * 0.85 * Math.cos(t) * Math.cos(twist),
        Math.sin(t) * 2.5 + v * 0.85 * Math.sin(t) * Math.cos(twist),
        Math.sin(t * 2) * 0.55 + v * 0.85 * Math.sin(twist)
      );
      uvs.push(i / segments, side);
    }
    if (i < segments) {
      let a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x9c9c91,
    metalness: 0.94,
    roughness: 0.27,
    side: THREE.DoubleSide,
    clearcoat: 0.3,
    clearcoatRoughness: 0.3,
  });
  const ribbon = new THREE.Mesh(geometry, material),
    group = new THREE.Group();
  group.add(ribbon);
  const scrimGeometry = new THREE.PlaneGeometry(1, 1),
    scrimMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: { uSide: { value: 0 }, uMobile: { value: 0 }, uAfter: { value: 0 } },
      vertexShader:
        'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:
        'varying vec2 vUv;uniform float uSide,uMobile,uAfter;void main(){float distance=mix(vUv.x,1.-vUv.x,uSide);float a=(1.-smoothstep(.2,.65,distance))*.94;float floorShade=uMobile*(1.-smoothstep(.13,.30,vUv.y))*.94;gl_FragColor=vec4(.078,.082,.074,max(max(max(a,uMobile*.66),floorShade),uAfter*.70));}',
    }),
    scrim = new THREE.Mesh(scrimGeometry, scrimMaterial);
  scrim.position.z = -100;
  const world = new THREE.Group();
  world.add(group, scrim);
  return {
    object: world,
    update({ width, height, progress, x, y, phoneX, time = 0, after = 0 }) {
      group.scale.setScalar(Math.max(width * 0.18, height * 0.19));
      group.position.set(
        width * 0.08 + x * width * 0.045 + Math.sin(time * 0.16) * 20,
        -height * 0.02 + y * height * 0.035 + Math.cos(time * 0.13) * 16,
        -250
      );
      group.rotation.set(
        0.13 + y * 0.16 + Math.sin(time * 0.17) * 0.055,
        -0.22 + x * 0.27 + Math.cos(time * 0.12) * 0.085,
        progress * 0.32 - 0.3 + Math.sin(time * 0.09) * 0.12
      );
      ribbon.rotation.y = progress * 0.18 + Math.sin(time * 0.14) * 0.1;
      scrim.scale.set(width, height, 1);
      scrimMaterial.uniforms.uSide.value =
        1 - THREE.MathUtils.smoothstep(phoneX / width, 0.28, 0.72);
      scrimMaterial.uniforms.uAfter.value = after;
      scrimMaterial.uniforms.uMobile.value = width <= 900 ? 1 : 0;
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      scrimGeometry.dispose();
      scrimMaterial.dispose();
    },
  };
}
