import React from "react";
import "./index.css";
import App from "./App";
import { createRoot } from "react-dom/client";

const reactRoot = createRoot(document.getElementById("root")!);
reactRoot.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
