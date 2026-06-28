// main.jsx — El punto de entrada del frontend.
// Aquí React "monta" toda la aplicación dentro del <div id="root"> del index.html.

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
