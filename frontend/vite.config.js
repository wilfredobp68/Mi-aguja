// vite.config.js — Configuración de Vite (la herramienta que sirve y compila el frontend).
//
// Usamos dos plugins:
//   - @vitejs/plugin-react : para que Vite entienda React (JSX).
//   - @tailwindcss/vite    : para que Tailwind CSS funcione (versión 4, sin postcss aparte).

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173, // la web correrá en http://localhost:5173
  },
  // Forzamos UNA sola copia de React en toda la app. Sin esto, librerías como
  // framer-motion pueden recibir su propia copia de React y romperse con el
  // error "Invalid hook call".
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "framer-motion", "react-hot-toast"],
  },
});
