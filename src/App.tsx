import React from "react";
import useInterval from "./useInterval";
import { useControls } from "leva";
import { clampArray, fadeArray, rand } from "./utils";
import { initCanvas, paintBlob } from "./painter";
import { renderCanvas } from "./painter/render";
import { diffuse } from "./painter/diffuse";

const canvas = initCanvas(400, 400, 3);

function App() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const values = useControls({
    play: true,
    diffuse: {
      min: 0,
      max: 0.05,
    },
    fade: {
      min: 1,
      max: 1,
    },
  });

  const setBlob = React.useCallback(
    (event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
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
    },
    [],
  );

  useInterval(() => {
    if (canvasRef.current) {
      if (values.play) {
        const { data } = canvas;
        fadeArray(data, values.fade.min, values.fade.max);
        diffuse(canvas, values.diffuse.min, values.diffuse.max, 1);
        clampArray(data);
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) renderCanvas(ctx, canvas);
      }
    }
  }, 20);

  return (
    <canvas
      width={canvas.width}
      height={canvas.height}
      ref={canvasRef}
      onMouseDown={setBlob}
      style={{ border: "1px solid black", height: "90vh", width: "90vh" }}
    ></canvas>
  );
}

export default App;
