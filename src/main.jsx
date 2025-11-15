import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Buffer } from "buffer";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import store from "./store";

if (!globalThis.Buffer) {
  globalThis.Buffer = Buffer;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>
);
