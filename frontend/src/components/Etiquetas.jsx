// ===================================================================
// Etiquetas.jsx — "Badges" de colores con ícono + texto.
//
// Regla de accesibilidad importante: el color NUNCA es la única señal.
// Cada etiqueta lleva también un ícono y una palabra, para que se entienda
// aunque la persona no distinga bien los colores.
// ===================================================================

import {
  AlertTriangle, HardHat, PartyPopper, Wrench, Megaphone,
  Clock, CheckCircle2, XCircle,
} from "lucide-react";

// --- Categorías de avisos (Módulo 1) ---
const CATEGORIAS = {
  urgente:       { texto: "Urgente",        icono: AlertTriangle, clase: "bg-urgente/10 text-urgente" },
  construccion:  { texto: "Construcción",   icono: HardHat,       clase: "bg-amber-100 text-amber-800" },
  evento:        { texto: "Evento",         icono: PartyPopper,   clase: "bg-violet-100 text-violet-800" },
  mantenimiento: { texto: "Mantenimiento",  icono: Wrench,        clase: "bg-sky-100 text-sky-800" },
  general:       { texto: "General",        icono: Megaphone,     clase: "bg-stone-100 text-stone-700" },
};

export function EtiquetaCategoria({ categoria }) {
  const info = CATEGORIAS[categoria] || CATEGORIAS.general;
  const Icono = info.icono;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${info.clase}`}>
      <Icono className="w-3.5 h-3.5" />
      {info.texto}
    </span>
  );
}

// --- Estados de reservas y visitantes (Módulos 2 y 3) ---
const ESTADOS = {
  pendiente:  { texto: "Pendiente",  icono: Clock,        clase: "bg-alerta/15 text-alerta" },
  aprobada:   { texto: "Aprobada",   icono: CheckCircle2, clase: "bg-exito/15 text-exito" },
  rechazada:  { texto: "Rechazada",  icono: XCircle,      clase: "bg-urgente/10 text-urgente" },
  autorizado: { texto: "Autorizado", icono: CheckCircle2, clase: "bg-exito/15 text-exito" },
  rechazado:  { texto: "Rechazado",  icono: XCircle,      clase: "bg-urgente/10 text-urgente" },
};

export function EtiquetaEstado({ estado }) {
  const info = ESTADOS[estado] || ESTADOS.pendiente;
  const Icono = info.icono;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${info.clase}`}>
      <Icono className="w-4 h-4" />
      {info.texto}
    </span>
  );
}
