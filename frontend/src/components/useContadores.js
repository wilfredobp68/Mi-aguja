// ===================================================================
// useContadores.js — Cuenta los "pendientes" para mostrarlos como badges.
//
// Lo usan tanto la pantalla de Inicio (burbujas) como la barra inferior.
// Consulta cada 15 segundos según el rol:
//   - admin   -> reservas pendientes de aprobar.
//   - guardia -> encomiendas esperadas (deliveries anunciados).
// ===================================================================

import { useEffect, useState } from "react";
import { api } from "../api/client";

export function useContadores(rol) {
  const [contadores, setContadores] = useState({});

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        if (rol === "admin") {
          const pendientes = await api.get("/reservas?estado=pendiente");
          if (activo) setContadores({ reservasPendientes: pendientes.length });
        } else if (rol === "guardia") {
          const esperadas = await api.get("/encomiendas/esperadas");
          if (activo) setContadores({ encomiendasEsperadas: esperadas.length });
        }
      } catch {
        /* si falla, reintenta en el próximo ciclo */
      }
    }
    cargar();
    const intervalo = setInterval(cargar, 15000);
    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, [rol]);

  return contadores;
}
