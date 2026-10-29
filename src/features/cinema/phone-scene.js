import * as THREE from 'three';
import { createScreenPresenter } from './screen-presenter.js';
import { createTouchCue } from './touch-cue.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
function roundedShape(width, height, radius) {
  const s = new THREE.Shape(),
    x = -width / 2,
    y = -height / 2;
  s.moveTo(x + radius, y);
  s.lineTo(x + width - radius, y);
  s.quadraticCurveTo(x + width, y, x + width, y + radius);
  s.lineTo(x + width, y + height - radius);
  s.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  s.lineTo(x + radius, y + height);
  s.quadraticCurveTo(x, y + height, x, y + height - radius);
  s.lineTo(x, y + radius);
  s.quadraticCurveTo(x, y, x + radius, y);
  return s;
}
export function createPhone(renderer) {
  const group = new THREE.Group(),
    resources = [];
  // Keep the large iPhone corner radius independent of its thin side profile.
  const bodyGeometry = new THREE.ExtrudeGeometry(roundedShape(2.09, 4.5, 0.28), {
    depth: 0.18,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: 0.018,
    bevelThickness: 0.02,
    curveSegments: 20,
  });
  bodyGeometry.translate(0, 0, -0.09);
  const metal = new THREE.MeshStandardMaterial({ color: 0x53504a, metalness: 1, roughness: 0.23 });
  const body = new THREE.Mesh(bodyGeometry, metal);
  group.add(body);
  resources.push(bodyGeometry, metal);
  const frontGeometry = new THREE.ShapeGeometry(roundedShape(2.048, 4.458, 0.265), 20);
  const black = new THREE.MeshBasicMaterial({ color: 0x060606 });
  const face = new THREE.Mesh(frontGeometry, black);
  face.position.z = 0.113;
  group.add(face);
  resources.push(frontGeometry, black);
  const screenWidth = 1.974,
    screenHeight = (screenWidth * 1631) / 750;
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 1392;
  const context = canvas.getContext('2d', { alpha: false });
  context.fillStyle = '#151412';
  context.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
  const screenGeometry = new THREE.ShapeGeometry(roundedShape(screenWidth, screenHeight, 0.24), 20);
  const uv = screenGeometry.getAttribute('uv'),
    positions = screenGeometry.getAttribute('position');
  for (let index = 0; index < uv.count; index++)
    uv.setXY(
      index,
      positions.getX(index) / screenWidth + 0.5,
      positions.getY(index) / screenHeight + 0.5
    );
  uv.needsUpdate = true;
  const screenMaterial = new THREE.MeshBasicMaterial({ map: texture, toneMapped: false });
  const screen = new THREE.Mesh(screenGeometry, screenMaterial);
  screen.position.z = 0.117;
  group.add(screen);
  resources.push(screenGeometry, screenMaterial, texture);
  const cue = createTouchCue(screenWidth, screenHeight);
  group.add(cue.object);
  const presenter = createScreenPresenter({
    canvas,
    onChange: () => {
      texture.needsUpdate = true;
    },
  });
  const buttonMaterial = new THREE.MeshStandardMaterial({
    color: 0x8e8980,
    metalness: 1,
    roughness: 0.22,
  });
  resources.push(buttonMaterial);
  [
    [-1.052, 1.02, 0.035, 0.35],
    [-1.052, 0.5, 0.035, 0.35],
    [1.052, 0.6, 0.035, 0.56],
  ].forEach(([x, y, w, h]) => {
    const geometry = new RoundedBoxGeometry(w, h, 0.085, 2, 0.014),
      button = new THREE.Mesh(geometry, buttonMaterial);
    button.position.set(x, y, 0);
    group.add(button);
    resources.push(geometry);
  });
  const pmrem = new THREE.PMREMGenerator(renderer),
    environmentScene = new RoomEnvironment();
  const environment = pmrem.fromScene(environmentScene, 0.04);
  environmentScene.dispose();
  pmrem.dispose();
  const touchPoint = new THREE.Vector3();
  return {
    object: group,
    environment: environment.texture,
    canvas,
    context,
    cue: cue.update,
    get hasFrame() {
      return presenter.hasFrame;
    },
    get screenSource() {
      return presenter.source;
    },
    present(video, source, time) {
      return presenter.accept(video, source, time);
    },
    usePoster(image) {
      return presenter.accept(image, image.src, 'poster');
    },
    updateScreen: presenter.update,
    projectTouch(target) {
      group.updateMatrixWorld();
      return touchPoint
        .set((target[0] - 0.5) * screenWidth, (0.5 - target[1]) * screenHeight, 0.15)
        .applyMatrix4(group.matrixWorld);
    },
    dispose() {
      cue.dispose();
      presenter.destroy();
      resources.forEach((item) => item.dispose());
      environment.dispose();
    },
  };
}
