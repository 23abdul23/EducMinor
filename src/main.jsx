import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Buffer } from "buffer";
import App from "./App.jsx";
import "./index.css";

if (!globalThis.Buffer) {
  globalThis.Buffer = Buffer;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
