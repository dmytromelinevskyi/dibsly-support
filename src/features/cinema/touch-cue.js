import * as THREE from 'three';
/** Drawn once; positions and the target outline move in screen space on the actual device. */
export function createTouchCue(width, height) {
  const textureCanvas = document.createElement('canvas');
  textureCanvas.width = 128;
  textureCanvas.height = 160;
  const c = textureCanvas.getContext('2d');
  c.scale(1.5, 1.5);
  c.shadowColor = '#0009';
  c.shadowBlur = 5;
  c.shadowOffsetY = 3;
  c.beginPath();
  c.moveTo(28, 56);
  c.lineTo(28, 16);
  c.bezierCurveTo(28, 5, 42, 5, 42, 16);
  c.lineTo(42, 43);
  c.bezierCurveTo(45, 35, 55, 36, 56, 45);
  c.bezierCurveTo(63, 39, 71, 43, 71, 52);
  c.bezierCurveTo(80, 48, 84, 55, 82, 65);
  c.lineTo(78, 85);
  c.bezierCurveTo(76, 99, 55, 103, 44, 94);
  c.lineTo(17, 68);
  c.bezierCurveTo(8, 57, 18, 49, 28, 61);
  c.closePath();
  c.fillStyle = '#fff';
  c.fill();
  c.shadowBlur = 0;
  c.strokeStyle = '#171715';
  c.lineWidth = 2;
  c.stroke();
  const texture = new THREE.CanvasTexture(textureCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const handMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  });
  const hand = new THREE.Sprite(handMaterial);
  hand.center.set(0.41, 0.91);
  hand.scale.set(0.36, 0.45, 1);
  hand.renderOrder = 10;
  hand.position.z = 0.14;
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uTarget: { value: new THREE.Vector4(0.5, 0.5, 0.2, 0.05) },
      uOpacity: { value: 0 },
      uPulse: { value: 0 },
      uAspect: { value: width / height },
    },
    vertexShader:
      'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `varying vec2 vUv;uniform vec4 uTarget;uniform float uOpacity,uPulse,uAspect;void main(){vec2 p=vec2(vUv.x,1.-vUv.y)-uTarget.xy;p.x*=uAspect;vec2 b=uTarget.zw*.5;b.x*=uAspect;float r=.009;vec2 q=abs(p)-b+r;float d=length(max(q,0.))+min(max(q.x,q.y),0.)-r;float line=1.-smoothstep(.0015,.0035,abs(d));float fill=(1.-smoothstep(0.,.002,d))*.13;float ring=1.-smoothstep(.002,.005,abs(length(p)-(.012+uPulse*.045)));float tap=ring*sin(uPulse*3.14159);float a=max(line*.95+fill,tap)*uOpacity;gl_FragColor=vec4(1.,.69,.32,a);}`,
  });
  const geometry = new THREE.PlaneGeometry(width, height),
    plane = new THREE.Mesh(geometry, material);
  plane.position.z = 0.132;
  plane.renderOrder = 9;
  const group = new THREE.Group();
  group.add(plane, hand);
  return {
    object: group,
    update(cue) {
      const target = cue?.step.target || [0.5, 0.5, 0.1, 0.05];
      material.uniforms.uTarget.value.fromArray(target);
      material.uniforms.uOpacity.value = cue?.opacity || 0;
      material.uniforms.uPulse.value = cue?.pulse || 0;
      handMaterial.opacity = cue?.opacity || 0;
      hand.position.x = ((cue?.pointer[0] || 0) - 0.5) * width;
      hand.position.y = (0.5 - (cue?.pointer[1] || 0)) * height;
      hand.scale.setScalar(1 - (cue?.pulse || 0) * 0.1);
      hand.scale.multiply(new THREE.Vector3(0.36, 0.45, 1));
    },
    dispose() {
      texture.dispose();
      handMaterial.dispose();
      material.dispose();
      geometry.dispose();
    },
  };
}
