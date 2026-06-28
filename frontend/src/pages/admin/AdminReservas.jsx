// ===================================================================
// AdminReservas.jsx — Módulo 2 (vista admin): aprobar o rechazar reservas.
//
// Lista todas las reservas, con un filtro por estado. En las pendientes,
// el admin puede aprobar o rechazar, con un mensaje opcional para el residente.
// ===================================================================

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CalendarCheck, Users, Clock } from "lucide-react";
import { api } from "../../api/client";
import { Boton, Tarjeta, SkeletonLista, EstadoVacio } from "../../components/UI";
import { EtiquetaEstado } from "../../components/Etiquetas";
import { fechaCorta } from "../../utils";

const FILTROS = [
  { valor: "pendiente", texto: "Pendientes" },
  { valor: "aprobada", texto: "Aprobadas" },
  { valor: "rechazada", texto: "Rechazadas" },
  { valor: "", texto: "Todas" },
];

// --- Una fila de reserva (con su propio formulario de decisión) ---
function FilaReserva({ reserva, onDecidida }) {
  const [accion, setAccion] = useState(null); // "aprobada" | "rechazada" | null
  const [mensaje, setMensaje] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function confirmar() {
    setGuardando(true);
    try {
      await api.patch(`/reservas/${reserva.id}`, { estado: accion, mensaje_admin: mensaje || null });
      onDecidida();
      toast.success(`Reserva ${accion}`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Tarjeta className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-verde">{reserva.amenidad?.nombre}</h3>
          <p className="text-sm text-texto-suave">
            {reserva.residente?.nombre}
            {reserva.residente?.casa_lote ? ` · ${reserva.residente.casa_lote}` : ""}
          </p>
        </div>
        <EtiquetaEstado estado={reserva.estado} />
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-texto-suave mt-3 cifras-tabulares">
        <span className="inline-flex items-center gap-1">
          <CalendarCheck className="w-4 h-4" /> {fechaCorta(reserva.fecha)}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="w-4 h-4" /> {reserva.hora_inicio}–{reserva.hora_fin}
        </span>
        <span className="inline-flex items-center gap-1">
          <Users className="w-4 h-4" /> {reserva.numero_personas} personas
        </span>
      </div>

      {reserva.mensaje_admin && (
        <p className="text-sm mt-3 bg-fondo rounded-xl px-3 py-2">
          <span className="font-medium">Mensaje:</span> {reserva.mensaje_admin}
        </p>
      )}

      {/* Botones de decisión solo en las pendientes */}
      {reserva.estado === "pendiente" && (
        <div className="mt-4">
          {!accion ? (
            <div className="flex gap-2">
              <Boton variante="primario" onClick={() => setAccion("aprobada")}>
                Aprobar
              </Boton>
              <Boton variante="peligro" onClick={() => setAccion("rechazada")}>
                Rechazar
              </Boton>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                rows={2}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Mensaje para el residente (opcional)"
                className="w-full px-3 py-2 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-oro"
              />
              <div className="flex gap-2">
                <Boton variante={accion === "aprobada" ? "primario" : "peligro"} cargando={guardando} onClick={confirmar}>
                  Confirmar {accion === "aprobada" ? "aprobación" : "rechazo"}
                </Boton>
                <Boton variante="secundario" onClick={() => setAccion(null)}>
                  Cancelar
                </Boton>
              </div>
            </div>
          )}
        </div>
      )}
    </Tarjeta>
  );
}

export default function AdminReservas() {
  const [reservas, setReservas] = useState(null);
  const [filtro, setFiltro] = useState("pendiente");

  function cargar() {
    setReservas(null);
    const ruta = filtro ? `/reservas?estado=${filtro}` : "/reservas";
    api.get(ruta).then(setReservas).catch(() => setReservas([]));
  }
  useEffect(cargar, [filtro]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-verde mb-4">Reservas</h1>

      {/* Filtros */}
      <div className="flex gap-2 mb-5 overflow-x-auto">
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            onClick={() => setFiltro(f.valor)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap min-h-11 transition ${
              filtro === f.valor ? "bg-verde text-white" : "bg-white border border-black/10 text-texto-suave"
            }`}
          >
            {f.texto}
          </button>
        ))}
      </div>

      {reservas === null ? (
        <SkeletonLista />
      ) : reservas.length === 0 ? (
        <EstadoVacio icono={CalendarCheck} titulo="No hay reservas en esta categoría" />
      ) : (
        <div className="space-y-4">
          {reservas.map((r) => (
            <FilaReserva key={r.id} reserva={r} onDecidida={cargar} />
          ))}
        </div>
      )}
    </div>
  );
}
