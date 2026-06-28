// ===================================================================
// UI.jsx — Pequeños componentes visuales reutilizables.
//
// Siguen el tema "Lujo sereno": tarjetas blancas, bordes redondeados, botones
// grandes y legibles, colores con significado y micro-interacciones sutiles.
// ===================================================================

import { Loader2 } from "lucide-react";

/* ---------- Botón ---------- */
// variante: "primario" (verde) | "oro" | "peligro" (rojo) | "secundario" (borde)
export function Boton({ children, variante = "primario", cargando = false, className = "", ...props }) {
  const estilos = {
    primario: "bg-verde text-white hover:bg-verde-profundo",
    oro: "bg-oro text-verde-profundo hover:brightness-95 font-semibold",
    peligro: "bg-urgente text-white hover:brightness-95",
    secundario: "bg-white text-verde border border-verde/30 hover:bg-verde/5",
  };
  return (
    <button
      // min-h-12 = botón alto y fácil de tocar. active:scale = se "hunde" al presionar.
      className={`inline-flex items-center justify-center gap-2 min-h-12 px-5 rounded-2xl text-base
        font-medium transition active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        focus:outline-none focus:ring-2 focus:ring-oro focus:ring-offset-2 ${estilos[variante]} ${className}`}
      disabled={cargando || props.disabled}
      {...props}
    >
      {cargando && <Loader2 className="w-5 h-5 animate-spin" />}
      {children}
    </button>
  );
}

/* ---------- Tarjeta ---------- */
// `interactiva` añade un leve "levantar" al pasar el cursor (para tarjetas clicables).
export function Tarjeta({ children, className = "", interactiva = false }) {
  const hover = interactiva ? "transition hover:shadow-md hover:-translate-y-0.5" : "";
  return (
    <div className={`bg-superficie rounded-2xl shadow-sm border border-black/5 ${hover} ${className}`}>
      {children}
    </div>
  );
}

/* ---------- Pantalla de carga (página completa) ---------- */
export function PantallaCargando({ texto = "Cargando..." }) {
  return (
    <div className="min-h-dvh grid place-items-center text-texto-suave">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-verde" />
        <p>{texto}</p>
      </div>
    </div>
  );
}

/* ---------- Carga pequeña (dentro de una sección) ---------- */
export function CargandoSeccion({ texto = "Cargando..." }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-texto-suave">
      <Loader2 className="w-5 h-5 animate-spin text-verde" />
      <span>{texto}</span>
    </div>
  );
}

/* ---------- Skeletons (placeholders mientras carga) ---------- */
// Un bloque gris que "respira" (animate-pulse). Se ve más premium que un spinner.
export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-black/10 rounded-lg ${className}`} />;
}

// Una tarjeta-placeholder con forma de fila de contenido.
export function SkeletonTarjeta() {
  return (
    <Tarjeta className="p-5">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 !rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    </Tarjeta>
  );
}

// Varias tarjetas-placeholder (para listas/feeds).
export function SkeletonLista({ filas = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: filas }).map((_, i) => (
        <SkeletonTarjeta key={i} />
      ))}
    </div>
  );
}

/* ---------- Estado vacío (cuando no hay datos) ---------- */
// `accion` (opcional): { texto, onClick } muestra un botón que invita a actuar.
// El ícono va dentro de una "ilustración" suave (círculos + detalles dorados)
// para que se sienta más cálido y pulido, no tan vacío.
export function EstadoVacio({ icono: Icono, titulo, descripcion, accion }) {
  return (
    <div className="text-center py-12 px-4 text-texto-suave">
      {Icono && (
        <div className="relative w-24 h-24 mx-auto mb-4">
          {/* Círculo grande suave */}
          <div className="absolute inset-0 rounded-full bg-verde/5" />
          {/* Círculo interior */}
          <div className="absolute inset-3 rounded-full bg-verde/10 grid place-items-center">
            <Icono className="w-9 h-9 text-verde" />
          </div>
          {/* Detalles decorativos dorados */}
          <span className="absolute top-1 right-2 w-2.5 h-2.5 rounded-full bg-oro/70" />
          <span className="absolute bottom-2 left-1 w-1.5 h-1.5 rounded-full bg-oro/50" />
        </div>
      )}
      <p className="font-medium text-texto">{titulo}</p>
      {descripcion && <p className="text-sm mt-1 max-w-xs mx-auto">{descripcion}</p>}
      {accion && (
        <div className="mt-4 flex justify-center">
          <Boton onClick={accion.onClick}>{accion.texto}</Boton>
        </div>
      )}
    </div>
  );
}

/* ---------- Mensaje de error en línea ---------- */
export function MensajeError({ mensaje }) {
  if (!mensaje) return null;
  return (
    <p className="text-sm text-urgente bg-urgente/10 rounded-xl px-3 py-2" role="alert">
      {mensaje}
    </p>
  );
}
