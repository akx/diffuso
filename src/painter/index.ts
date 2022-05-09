import { Canvas } from "./types";

export function initCanvas(
  width: number,
  height: number,
  nChannels: number,
): Canvas {
  const data = new Float32Array(width * height * nChannels);
  return { width, height, nChannels, data };
}

export function paintBlob(
  canvas: Canvas,
  cx: number,
  cy: number,
  channel: number,
  radius: number,
  intensity: number,
) {
  const { data, width, nChannels } = canvas;
  const radiusSquared = radius * radius;
  for (let y = cy - radius; y <= cy + radius; y++) {
    for (let x = cx - radius; x <= cx + radius; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const d = dx * dx + dy * dy;
      if (d < radiusSquared) {
        data[(y * width + x) * nChannels + channel] +=
          intensity * (1 - d / radiusSquared);
      }
    }
  }
}
