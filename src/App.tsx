import React from "react";
import useInterval from "./useInterval";
import { useControls } from "leva";
import { clampArray, fadeArray, rand } from "./utils";
import { initCanvas, paintBlob } from "./painter";
import { renderCanvas } from "./painter/render";
import { diffuse } from "./painter/diffuse";
import { Canvas } from "./painter/types";

const sizeP = 90;

function App() {
  const canvasDomRef = React.useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = React.useState<Canvas | null>(null);
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
  });

  React.useEffect(() => {
    setCanvas(initCanvas(values.width, values.height, 3));
  }, [values.width, values.height]);

  const setBlob = React.useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      if (!canvas) return;
      const { width, height, nChannels } = canvas;
      const el = event.currentTarget;
      const fx = (event.clientX - el.offsetLeft) / el.offsetWidth;
      const fy = (event.clientY - el.offsetTop) / el.offsetHeight;
      const x = Math.floor(fx * width);
      const y = Math.floor(fy * height);
      const chan = Math.floor(Math.random() * nChannels);
      paintBlob(
        canvas,
        x,
        y,
        chan,
        Math.floor(rand(25, 45)),
        0.7 * event.button || event.shiftKey ? -1 : 1,
      );
      clampArray(canvas.data, 0, 1);
    },
    [canvas],
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
      onMouseDown={setBlob}
      style={{
        border: "1px solid black",
        height: `${height}vmin`,
        width: `${width}vmin`,
      }}
    />
  );
}

export default App;
