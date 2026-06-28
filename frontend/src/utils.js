// utils.js — Funciones de ayuda para mostrar fechas y horas de forma bonita.

// Convierte "2026-06-23" o una fecha ISO a algo como "lun 23 jun".
export function fechaCorta(valor) {
  if (!valor) return "";
  const fecha = new Date(valor.length === 10 ? valor + "T00:00:00" : valor);
  return fecha.toLocaleDateString("es-NI", { weekday: "short", day: "numeric", month: "short" });
}

// Convierte una marca de tiempo a "23 jun, 2:30 p.m."
export function fechaHora(valor) {
  if (!valor) return "";
  const fecha = new Date(valor);
  return fecha.toLocaleString("es-NI", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

// "Hace 5 min", "Hace 2 h", etc. — útil para los visitantes recién llegados.
export function haceCuanto(valor) {
  if (!valor) return "";
  const segundos = Math.floor((Date.now() - new Date(valor).getTime()) / 1000);
  if (segundos < 60) return "hace un momento";
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.floor(horas / 24);
  return `hace ${dias} d`;
}

// Devuelve la fecha de hoy como "2026-06-23" (formato que entiende el backend).
export function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

// Formatea un número como córdobas: 1850 -> "C$ 1,850.00".
export function cordobas(valor) {
  return new Intl.NumberFormat("es-NI", {
    style: "currency",
    currency: "NIO",
    minimumFractionDigits: 2,
  }).format(valor || 0);
}
