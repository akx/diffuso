import { Canvas } from "./types";

const channelColors = [
  [240, 0, 0],
  [0, 240, 0],
  [0, 0, 240],
];

export function renderCanvas(ctx: CanvasRenderingContext2D, canvas: Canvas) {
  const { width, height, data, nChannels } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  for (let i = 0, p = 0; i < data.length; i += nChannels, p += 4) {
    const color = [255, 255, 255];
    for (let ch = 0; ch < nChannels; ch++) {
      const chInt = data[i + ch];
      color[0] -= channelColors[ch][0] * chInt;
      color[1] -= channelColors[ch][1] * chInt;
      color[2] -= channelColors[ch][2] * chInt;
    }
    pixels[p] = color[0];
    pixels[p + 1] = color[1];
    pixels[p + 2] = color[2];
    pixels[p + 3] = 255;
  }
  ctx.putImageData(imageData, 0, 0);
}
