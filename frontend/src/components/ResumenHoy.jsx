// ===================================================================
// ResumenHoy.jsx — La tarjeta de bienvenida en el Inicio.
//
// Muestra un saludo según la hora, la fecha de hoy y, si hay algo pendiente,
// una alerta amable. Da una sensación de "dashboard" moderno al entrar.
// ===================================================================

import { CalendarDays, Bell } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useContadores } from "./useContadores";

function saludoPorHora() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

export default function ResumenHoy() {
  const { usuario } = useAuth();
  const contadores = useContadores(usuario?.rol);
  const primerNombre = usuario?.nombre?.split(" ")[0] || "";
  const fecha = new Date().toLocaleDateString("es-NI", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Alerta según el rol (si hay pendientes)
  let alerta = null;
  if (usuario?.rol === "admin" && contadores.reservasPendientes > 0) {
    const n = contadores.reservasPendientes;
    alerta = `${n} ${n === 1 ? "reserva" : "reservas"} por aprobar`;
  } else if (usuario?.rol === "guardia" && contadores.encomiendasEsperadas > 0) {
    const n = contadores.encomiendasEsperadas;
    alerta = `${n} ${n === 1 ? "encomienda esperada" : "encomiendas esperadas"} hoy`;
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-verde to-verde-profundo text-white p-5 mb-6">
      <p className="text-white/70 text-sm flex items-center gap-1.5 capitalize">
        <CalendarDays className="w-4 h-4" /> {fecha}
      </p>
      <h1 className="font-display text-2xl font-bold mt-0.5">
        {saludoPorHora()}, {primerNombre}
      </h1>
      {alerta ? (
        <p className="mt-3 inline-flex items-center gap-1.5 bg-oro/20 text-oro rounded-full px-3 py-1 text-sm font-medium">
          <Bell className="w-4 h-4" /> {alerta}
        </p>
      ) : (
        <p className="mt-2 text-white/80 text-sm">¿Qué deseas hacer hoy?</p>
      )}
    </div>
  );
}
