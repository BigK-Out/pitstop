import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/fraunces/wght.css";
import "@fontsource-variable/fraunces/wght-italic.css";
import "@fontsource-variable/inter/wght.css";
import App from "./App";
import "./styles/global.css";
import "./styles/sections.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
