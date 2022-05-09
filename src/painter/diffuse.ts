import { Canvas } from "./types";
import { clampValue, EPSILON, rand } from "../utils";

export function diffuse(
  canvas: Canvas,
  min: number,
  max: number,
  dripX: number,
  dripY: number,
  retention: number,
) {
  const { data, width, height, nChannels } = canvas;
  const dataAdd = new Float32Array(data.length);
  const dataSubtract = new Float32Array(data.length);
  function diffuseSingle(x: number, y: number, ch: number) {
    const offInCh0 = (y * width + x) * nChannels;
    const offIn = offInCh0 + ch;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (data[offIn] < EPSILON) {
          return;
        }
        const x2 = Math.round(x + dx + rand(0, dripX));
        const y2 = Math.round(y + dy + rand(0, dripY));
        if (x2 < 0 || x2 >= width || y2 < 0 || y2 >= height) {
          continue;
        }
        const offOutCh0 = (y2 * width + x2) * nChannels;
        const offOut = offOutCh0 + ch;
        const intens = rand(min, max);

        // Paint resists diffusing into canvas where there already is ink
        let ink = 0;
        for (let i = 0; i < nChannels; i++) {
          ink += data[offOutCh0 + i] / nChannels;
        }
        ink = clampValue(ink, 0, 1);
        const resistanceFactor = Math.pow(1 - ink, 2);
        const given = data[offIn] * intens * resistanceFactor;
        dataAdd[offOut] += given;
        dataSubtract[offIn] += given * (1 - retention);
      }
    }
  }

  for (let ch = 0; ch < nChannels; ch++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        diffuseSingle(x, y, ch);
      }
    }
  }
  for (let i = 0; i < data.length; i++) {
    data[i] += dataAdd[i];
    data[i] -= dataSubtract[i];
  }
}
