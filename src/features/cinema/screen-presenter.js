export function isEmptyScreen(pixels) {
  let sum = 0,
    bright = 0;
  const count = pixels.length / 4;
  for (let i = 0; i < pixels.length; i += 4) {
    const l = 0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2];
    sum += l;
    if (l > 52) bright++;
  }
  return count > 0 && sum / count < 26 && bright / count < 0.018;
}

/** A latched display: decoder resets and seeks can never clear the visible screen. */
export function createScreenPresenter({
  canvas,
  onChange = () => {},
  makeCanvas = () => document.createElement('canvas'),
  now = () => performance.now(),
}) {
  const context = canvas.getContext('2d', { alpha: false });
  const incoming = makeCanvas(),
    outgoing = makeCanvas(),
    probe = makeCanvas();
  probe.width = 32;
  probe.height = 64;
  const probeContext = probe.getContext('2d', { alpha: false, willReadFrequently: true });
  for (const buffer of [incoming, outgoing]) {
    buffer.width = canvas.width;
    buffer.height = canvas.height;
  }
  const next = incoming.getContext('2d', { alpha: false }),
    previous = outgoing.getContext('2d', { alpha: false });
  let source = '',
    frameKey = '',
    hasFrame = false,
    dirty = false,
    start = -Infinity,
    blending = false;
  function accept(image, key, frame) {
    if (!image || (key === source && frame === frameKey)) return false;
    if ('readyState' in image && (image.readyState < 2 || image.seeking || !image.videoWidth))
      return false;
    try {
      if ('readyState' in image && probeContext.getImageData) {
        probeContext.drawImage(
          image,
          0,
          image.videoHeight * 0.1,
          image.videoWidth,
          image.videoHeight * 0.82,
          0,
          0,
          32,
          64
        );
        if (isEmptyScreen(probeContext.getImageData(0, 0, 32, 64).data)) return false;
      }
      if (key !== source && hasFrame) {
        previous.drawImage(canvas, 0, 0);
        start = now();
        blending = true;
      }
      next.drawImage(image, 0, 0, canvas.width, canvas.height);
    } catch {
      return false;
    }
    source = key;
    frameKey = frame;
    hasFrame = true;
    dirty = true;
    return true;
  }
  return {
    get hasFrame() {
      return hasFrame;
    },
    get source() {
      return source;
    },
    accept,
    update(time = now()) {
      if (!hasFrame || (!dirty && !blending)) return false;
      const t = Math.min(1, Math.max(0, (time - start) / 420)),
        blend = t * t * t * (t * (t * 6 - 15) + 10);
      context.globalAlpha = 1;
      if (blending && t < 1) {
        context.drawImage(outgoing, 0, 0);
        context.globalAlpha = blend;
        context.drawImage(incoming, 0, 0);
        context.globalAlpha = 1;
      } else {
        context.drawImage(incoming, 0, 0);
        blending = false;
      }
      dirty = false;
      onChange();
      return blending;
    },
    destroy() {
      for (const buffer of [incoming, outgoing, probe]) {
        buffer.width = buffer.height = 1;
      }
    },
  };
}
