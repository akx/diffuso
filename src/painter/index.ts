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
  colors: number[],
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
        for (
          let channel = 0;
          channel < Math.min(colors.length, nChannels);
          channel++
        ) {
          data[(y * width + x) * nChannels + channel] +=
            colors[channel] * intensity * (1 - d / radiusSquared);
        }
      }
    }
  }
}
