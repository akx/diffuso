import React from "react";
import useInterval from "./useInterval";
import { useControls } from "leva";

const width = 200;
const height = 200;
const nChannels = 3;

const data = new Float32Array(width * height * nChannels);

function paintBlob(
  data: Float32Array,
  cx: number,
  cy: number,
  channel: number,
  radius: number,
  intensity: number,
) {
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

const channelColors = [
  [240, 0, 0],
  [0, 240, 0],
  [0, 0, 240],
];

function renderCanvas(canvas: HTMLCanvasElement, data: Float32Array) {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
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

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function fade(data: Float32Array, min: number, max: number) {
  for (let i = 0; i < data.length; i++) {
    data[i] *= rand(min, max);
  }
}

function clamp(data: Float32Array, min = 0, max = 1) {
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.max(min, Math.min(max, data[i]));
  }
}

function lerp(a: number, b: number, alpha: number) {
  return a + (b - a) * alpha;
}

function diffuse(data: Float32Array, min: number, max: number, rad: number) {
  const dataCopy = new Float32Array(data.length);
  for (let ch = 0; ch < nChannels; ch++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const offIn = (y * width + x) * nChannels + ch;
        for (let dx = -rad; dx <= rad; dx++) {
          for (let dy = -rad; dy <= rad; dy++) {
            if (dx === 0 && dy === 0) {
              continue;
            }
            const x2 = x + dx;
            const y2 = y + dy;
            if (x2 < 0 || x2 >= width || y2 < 0 || y2 >= height) {
              continue;
            }
            const offOut = (y2 * width + x2) * nChannels + ch;
            dataCopy[offOut] += data[offIn] * rand(min, max);
          }
        }
      }
    }
  }
  data.set(dataCopy);
}

function App() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const values = useControls({
    play: true,
    diffuse: {
      min: 0,
      max: 0.25,
    },
    fade: {
      min: 0.9,
      max: 0.99,
    },
  });

  const setBlob = React.useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      const el = event.currentTarget;
      const fx = (event.clientX - el.offsetLeft) / el.offsetWidth;
      const fy = (event.clientY - el.offsetTop) / el.offsetHeight;
      const x = Math.floor(fx * width);
      const y = Math.floor(fy * height);
      const chan = Math.floor(Math.random() * nChannels);
      paintBlob(
        data,
        x,
        y,
        chan,
        25,
        0.7 * event.button || event.shiftKey ? -1 : 1,
      );
    },
    [],
  );

  useInterval(() => {
    if (canvasRef.current) {
      if (values.play) {
        fade(data, values.fade.min, values.fade.max);
        diffuse(data, values.diffuse.min, values.diffuse.max, 1);
        clamp(data);
      }
      renderCanvas(canvasRef.current, data);
    }
  }, 20);

  return (
    <canvas
      width={width}
      height={height}
      ref={canvasRef}
      onMouseDown={setBlob}
      style={{ border: "1px solid black", height: "90vh", width: "90vh" }}
    ></canvas>
  );
}

export default App;
