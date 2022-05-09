import React from "react";
import useInterval from "./useInterval";
import { useControls } from "leva";
import { clampArray, fadeArray, rand, randMinMaxObj } from "./utils";
import { initCanvas, paintBlob } from "./painter";
import { renderCanvas } from "./painter/render";
import { diffuse } from "./painter/diffuse";
import { Canvas } from "./painter/types";

const sizeP = 90;

function getColor(nChannels: number): number[] {
  const color: number[] = [];
  for (let i = 0; i < nChannels; i++) {
    color.push(rand(0, 1));
  }
  return color;
}

function getPrimaryColor(nChannels: number): number[] {
  const color: number[] = [];
  const primaryChannel = Math.floor(rand(0, nChannels));
  for (let i = 0; i < nChannels; i++) {
    color.push(i === primaryChannel ? 1 : 0);
  }
  return color;
}

function translateCoords(
  canvas: Canvas,
  el: HTMLCanvasElement,
  event: { clientX: number; clientY: number },
) {
  const { width, height } = canvas;
  const fx = (event.clientX - el.offsetLeft) / el.offsetWidth;
  const fy = (event.clientY - el.offsetTop) / el.offsetHeight;
  const x = Math.floor(fx * width);
  const y = Math.floor(fy * height);
  return { x, y };
}

function App() {
  const canvasDomRef = React.useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = React.useState<Canvas | null>(null);
  const isPaintingRef = React.useRef(false);
  const values = useControls({
    play: true,
    width: { value: 400, min: 50, max: 1000, step: 10 },
    height: { value: 400, min: 50, max: 1000, step: 10 },
    diffuse: {
      minValue: 0,
      maxValue: 0.05,
    },
    retention: { value: 0, min: 0, max: 1, step: 0.01 },
    drip: {
      x: 0,
      y: 0,
    },
    fade: {
      minValue: 1,
      maxValue: 1,
    },
    paintRadius: {
      minValue: 25,
      maxValue: 45,
    },
    paintIntensity: {
      minValue: 0.4,
      maxValue: 0.6,
    },
    paintPrimaries: false,
  });

  React.useEffect(() => {
    setCanvas(initCanvas(values.width, values.height, 3));
  }, [values.width, values.height]);

  const startPaint = React.useCallback(
    () => (isPaintingRef.current = true),
    [],
  );
  const endPaint = React.useCallback(() => (isPaintingRef.current = false), []);

  const paint = React.useCallback(
    (x: number, y: number, invert: boolean) => {
      if (!canvas) return;
      const { nChannels } = canvas;
      paintBlob(
        canvas,
        x,
        y,
        values.paintPrimaries
          ? getPrimaryColor(nChannels)
          : getColor(nChannels),
        Math.floor(randMinMaxObj(values.paintRadius)),
        randMinMaxObj(values.paintIntensity) * (invert ? -1 : 1),
      );
      clampArray(canvas.data, 0, 1);
    },
    [canvas, values.paintIntensity, values.paintPrimaries, values.paintRadius],
  );

  const handleMouseMove = React.useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      if (!canvas) return;
      if (!isPaintingRef.current) return;
      const { x, y } = translateCoords(canvas, event.currentTarget, event);
      paint(x, y, !!(event.button || event.shiftKey));
    },
    [canvas, paint],
  );
  const handleTouchMove = React.useCallback(
    (event: React.TouchEvent<HTMLCanvasElement>) => {
      if (!canvas) return;
      if (!isPaintingRef.current) return;
      const touch = event.touches[0];
      if (!touch) return;
      const { x, y } = translateCoords(canvas, event.currentTarget, touch);
      paint(x, y, false);
    },
    [canvas, paint],
  );

  useInterval(() => {
    if (!(canvas && canvasDomRef.current)) {
      return;
    }
    if (values.play) {
      const { data } = canvas;
      fadeArray(data, values.fade.minValue, values.fade.maxValue);
      diffuse(
        canvas,
        values.diffuse.minValue,
        values.diffuse.maxValue,
        values.drip.x,
        values.drip.y,
        values.retention,
      );
      clampArray(data);
    }
    if (canvasDomRef.current) {
      const ctx = canvasDomRef.current.getContext("2d");
      if (ctx) renderCanvas(ctx, canvas);
    }
  }, 20);
  if (!canvas) return null;

  const ar = canvas.width / canvas.height;
  const [width, height] = ar > 1 ? [sizeP, sizeP / ar] : [sizeP * ar, sizeP];
  return (
    <canvas
      width={canvas.width}
      height={canvas.height}
      ref={canvasDomRef}
      onMouseDown={startPaint}
      onMouseUp={endPaint}
      onTouchStart={startPaint}
      onTouchEnd={endPaint}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      style={{
        border: "1px solid black",
        height: `${height}vmin`,
        width: `${width}vmin`,
      }}
    />
  );
}

export default App;
