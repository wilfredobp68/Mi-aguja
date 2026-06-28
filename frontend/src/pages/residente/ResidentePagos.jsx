// ===================================================================
// ResidentePagos.jsx — Módulo 6 (vista residente): pagos del hogar.
//
// DEMO / VISTA PREVIA: aquí el residente vería sus cuentas del mes (agua, luz,
// cuota del banco y fee del condominio) y podría pagarlas desde la app.
//
// IMPORTANTE: por ahora es una maqueta para el pitch. Los montos son de ejemplo
// y el "pago" es una simulación (no cobra de verdad). Cuando se conecte el banco
// (convenio de recaudación), esta misma pantalla hará el cobro real.
// ===================================================================

import { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Droplets, Zap, Landmark, Building2, Wallet, CheckCircle2,
  CreditCard, ArrowRightLeft, CalendarDays, ShieldCheck, Wifi,
} from "lucide-react";
import { Boton, Tarjeta } from "../../components/UI";
import { Cascada, CascadaItem } from "../../components/Cascada";
import HojaInferior from "../../components/HojaInferior";
import { cordobas, fechaCorta, hoyISO } from "../../utils";

// Cuentas de ejemplo (mock). Más adelante vendrán del backend / del banco.
// `estado`: "pendiente" | "pagado". `pagadoEl`: fecha en que se pagó (solo si pagado).
const CUENTAS_INICIALES = [
  {
    id: "agua",
    nombre: "Agua",
    proveedor: "ENACAL",
    icono: Droplets,
    color: "bg-sky-50 text-sky-600",
    monto: 485.0,
    vence: "2026-07-05",
    estado: "pendiente",
    pagadoEl: null,
  },
  {
    id: "luz",
    nombre: "Luz",
    proveedor: "DISNORTE",
    icono: Zap,
    color: "bg-amber-50 text-amber-600",
    monto: 1850.5,
    vence: "2026-07-08",
    estado: "pendiente",
    pagadoEl: null,
  },
  {
    id: "banco",
    nombre: "Cuota de la casa",
    proveedor: "Banco · préstamo hipotecario",
    icono: Landmark,
    color: "bg-verde/10 text-verde",
    monto: 18500.0,
    vence: "2026-07-10",
    estado: "pendiente",
    pagadoEl: null,
  },
  {
    id: "condominio",
    nombre: "Fee de condominio",
    proveedor: "Administración del residencial",
    icono: Building2,
    color: "bg-oro/15 text-[#9a7d2e]",
    monto: 2500.0,
    vence: "2026-07-01",
    estado: "pendiente",
    pagadoEl: null,
  },
  // --- Ya pagadas este mes (historial de ejemplo) ---
  {
    id: "internet",
    nombre: "Internet",
    proveedor: "Tigo",
    icono: Wifi,
    color: "bg-indigo-50 text-indigo-600",
    monto: 1200.0,
    vence: "2026-06-20",
    estado: "pagado",
    pagadoEl: "2026-06-18",
  },
  {
    id: "basura",
    nombre: "Recolección de basura",
    proveedor: "Alcaldía",
    icono: Building2,
    color: "bg-emerald-50 text-emerald-600",
    monto: 350.0,
    vence: "2026-06-15",
    estado: "pagado",
    pagadoEl: "2026-06-12",
  },
];

export default function ResidentePagos() {
  const [cuentas, setCuentas] = useState(CUENTAS_INICIALES);
  const [seleccionada, setSeleccionada] = useState(null); // cuenta abierta en la hoja
  const [pagando, setPagando] = useState(false);

  const periodo = new Date().toLocaleDateString("es-NI", { month: "long", year: "numeric" });
  const porPagar = cuentas.filter((c) => c.estado === "pendiente");
  const pagadas = cuentas.filter((c) => c.estado === "pagado");
  const totalPendiente = porPagar.reduce((suma, c) => suma + c.monto, 0);
  const pendientes = porPagar.length;

  // Simula el pago (demo). Cuando se conecte el banco, aquí irá el cobro real.
  function confirmarPago() {
    if (!seleccionada) return;
    setPagando(true);
    // Pequeña espera para que se sienta como un cobro real.
    setTimeout(() => {
      setCuentas((prev) =>
        prev.map((c) =>
          c.id === seleccionada.id ? { ...c, estado: "pagado", pagadoEl: hoyISO() } : c
        )
      );
      setPagando(false);
      setSeleccionada(null);
      toast.success(`${seleccionada.nombre} pagado`);
    }, 900);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-verde mb-1">Pagos</h1>
      <p className="text-texto-suave mb-5 capitalize">{periodo}</p>

      {/* ---------- Resumen: total a pagar este mes ---------- */}
      <div className="rounded-3xl p-5 mb-6 text-white bg-gradient-to-br from-verde to-verde-profundo shadow-md">
        <div className="flex items-center gap-2 text-white/80 text-sm">
          <Wallet className="w-4 h-4" />
          Total pendiente este mes
        </div>
        <p className="text-3xl font-bold cifras-tabulares mt-1">{cordobas(totalPendiente)}</p>
        <p className="text-white/70 text-sm mt-1">
          {pendientes === 0
            ? "¡Todo al día! No tienes cuentas pendientes."
            : `${pendientes} ${pendientes === 1 ? "cuenta pendiente" : "cuentas pendientes"}`}
        </p>
      </div>

      {/* ---------- Por pagar ---------- */}
      <h2 className="text-lg font-bold text-verde mb-3">Por pagar</h2>
      {porPagar.length === 0 ? (
        <Tarjeta className="p-5 flex items-center gap-3 mb-6">
          <CheckCircle2 className="w-6 h-6 text-exito shrink-0" />
          <p className="text-sm text-texto-suave">¡Todo al día! No tienes cuentas pendientes este mes.</p>
        </Tarjeta>
      ) : (
        <Cascada className="space-y-3 mb-6">
          {porPagar.map((c) => {
            const Icono = c.icono;
            return (
              <CascadaItem key={c.id}>
                <Tarjeta className="p-4 flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full grid place-items-center shrink-0 ${c.color}`}>
                    <Icono className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-verde leading-tight">{c.nombre}</p>
                    <p className="text-xs text-texto-suave truncate">{c.proveedor}</p>
                    <p className="text-xs text-texto-suave mt-0.5 inline-flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5" /> Vence {fechaCorta(c.vence)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-verde cifras-tabulares">{cordobas(c.monto)}</p>
                    <button
                      onClick={() => setSeleccionada(c)}
                      className="mt-1 inline-flex items-center justify-center min-h-9 px-4 rounded-full bg-oro text-verde-profundo text-sm font-semibold hover:brightness-95 active:scale-95 transition"
                    >
                      Pagar
                    </button>
                  </div>
                </Tarjeta>
              </CascadaItem>
            );
          })}
        </Cascada>
      )}

      {/* ---------- Pagados este mes ---------- */}
      {pagadas.length > 0 && (
        <>
          <h2 className="text-lg font-bold text-verde mb-3">Pagados este mes</h2>
          <div className="space-y-3">
            {pagadas.map((c) => {
              const Icono = c.icono;
              return (
                <Tarjeta key={c.id} className="p-4 flex items-center gap-3 opacity-75">
                  <div className={`w-12 h-12 rounded-full grid place-items-center shrink-0 ${c.color}`}>
                    <Icono className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-verde leading-tight">{c.nombre}</p>
                    <p className="text-xs text-texto-suave truncate">{c.proveedor}</p>
                    <p className="text-xs text-exito mt-0.5 inline-flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Pagado {fechaCorta(c.pagadoEl)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-texto-suave cifras-tabulares line-through">
                      {cordobas(c.monto)}
                    </p>
                  </div>
                </Tarjeta>
              );
            })}
          </div>
        </>
      )}

      {/* ---------- Hoja de pago (panel deslizable) ---------- */}
      <HojaInferior
        abierta={!!seleccionada}
        onCerrar={() => !pagando && setSeleccionada(null)}
        titulo="Pagar cuenta"
      >
        {seleccionada && (
          <div className="space-y-5">
            {/* Resumen de la cuenta */}
            <div className="text-center">
              <p className="text-texto-suave text-sm">{seleccionada.nombre}</p>
              <p className="text-4xl font-bold text-verde cifras-tabulares mt-1">
                {cordobas(seleccionada.monto)}
              </p>
              <p className="text-xs text-texto-suave mt-1">{seleccionada.proveedor}</p>
            </div>

            {/* Formas de pago (vista previa — se habilitan en la siguiente fase) */}
            <div>
              <p className="text-sm font-medium mb-2">Forma de pago</p>
              <div className="space-y-2">
                {[
                  { icono: CreditCard, t: "Tarjeta de débito / crédito" },
                  { icono: ArrowRightLeft, t: "Transferencia bancaria" },
                ].map((m) => (
                  <div
                    key={m.t}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-black/10 bg-black/[0.02] opacity-70"
                  >
                    <m.icono className="w-5 h-5 text-verde" />
                    <span className="flex-1 text-sm text-texto">{m.t}</span>
                    <span className="text-[11px] font-semibold text-oro bg-oro/15 px-2 py-0.5 rounded-full">
                      Pronto
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-texto-suave mt-2 flex items-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-verde shrink-0 mt-0.5" />
                Vista de demostración. El cobro real se activa al conectar el convenio con el banco.
              </p>
            </div>

            <Boton
              variante="oro"
              className="w-full"
              cargando={pagando}
              onClick={confirmarPago}
            >
              {!pagando && <Wallet className="w-5 h-5" />}
              Confirmar pago
            </Boton>
          </div>
        )}
      </HojaInferior>

      {/* Marca de agua sutil de que es demostración */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center text-xs text-texto-suave mt-6"
      >
        Montos de ejemplo · próximamente con cobro real
      </motion.p>
    </div>
  );
}
