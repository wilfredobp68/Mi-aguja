// ===================================================================
// AdminReportes.jsx — Módulo 7 (vista admin): dar seguimiento a los reportes.
//
// La administración ve todos los reportes de los residentes y les da
// seguimiento: Recibido → En proceso → Resuelto, con un comentario opcional
// que el residente verá en su pantalla.
// ===================================================================

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Wrench, Lightbulb, TreePine, Droplets, TrafficCone, ShieldAlert,
  CircleDot, Clock, CheckCircle2, MessageSquareText,
} from "lucide-react";
import { api, urlImagen } from "../../api/client";
import { Boton, Tarjeta, SkeletonLista, EstadoVacio } from "../../components/UI";
import HojaInferior from "../../components/HojaInferior";
import { Cascada, CascadaItem } from "../../components/Cascada";
import { haceCuanto } from "../../utils";

const ICONO_CATEGORIA = {
  alumbrado: Lightbulb, jardineria: TreePine, agua: Droplets,
  calles: TrafficCone, seguridad: ShieldAlert, otro: Wrench,
};

const ESTADOS = {
  recibido: { t: "Recibido", clase: "bg-oro/15 text-[#9a7d2e]", icono: CircleDot },
  en_proceso: { t: "En proceso", clase: "bg-sky-100 text-sky-700", icono: Clock },
  resuelto: { t: "Resuelto", clase: "bg-exito/15 text-exito", icono: CheckCircle2 },
};

// Filtros de arriba: qué reportes ver.
const FILTROS = [
  { v: "abiertos", t: "Abiertos" },
  { v: "resuelto", t: "Resueltos" },
  { v: "", t: "Todos" },
];

export default function AdminReportes() {
  const [reportes, setReportes] = useState(null);
  const [filtro, setFiltro] = useState("abiertos");

  // Reporte seleccionado para responder (abre la hoja inferior).
  const [seleccionado, setSeleccionado] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState("en_proceso");
  const [comentario, setComentario] = useState("");
  const [guardando, setGuardando] = useState(false);

  function cargar() {
    setReportes(null);
    const ruta = filtro ? `/reportes?estado=${filtro}` : "/reportes";
    api.get(ruta).then(setReportes).catch(() => setReportes([]));
  }
  useEffect(cargar, [filtro]);

  function abrirGestion(reporte) {
    setSeleccionado(reporte);
    // Sugerimos el siguiente paso natural del flujo.
    setNuevoEstado(reporte.estado === "recibido" ? "en_proceso" : "resuelto");
    setComentario(reporte.comentario_admin || "");
  }

  async function guardar(e) {
    e.preventDefault();
    setGuardando(true);
    try {
      await api.patch(`/reportes/${seleccionado.id}`, {
        estado: nuevoEstado,
        comentario_admin: comentario || null,
      });
      setSeleccionado(null);
      cargar();
      toast.success("Reporte actualizado");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-verde mb-1">Reportes</h1>
      <p className="text-texto-suave mb-4">
        Problemas reportados por los residentes. Deles seguimiento aquí.
      </p>

      {/* ---------- Filtros ---------- */}
      <div className="flex gap-2 mb-5">
        {FILTROS.map((f) => (
          <button
            key={f.v}
            onClick={() => setFiltro(f.v)}
            className={`min-h-10 px-4 rounded-full text-sm font-medium transition ${
              filtro === f.v ? "bg-verde text-white" : "bg-white border border-black/10 text-texto-suave"
            }`}
          >
            {f.t}
          </button>
        ))}
      </div>

      {/* ---------- Lista ---------- */}
      {reportes === null ? (
        <SkeletonLista />
      ) : reportes.length === 0 ? (
        <EstadoVacio
          icono={CheckCircle2}
          titulo={filtro === "abiertos" ? "No hay reportes abiertos" : "No hay reportes aquí"}
          descripcion={filtro === "abiertos" ? "¡Todo el residencial en orden!" : undefined}
        />
      ) : (
        <Cascada className="space-y-3">
          {reportes.map((r) => {
            const Icono = ICONO_CATEGORIA[r.categoria] || Wrench;
            const est = ESTADOS[r.estado] || ESTADOS.recibido;
            return (
              <CascadaItem key={r.id}>
                <Tarjeta className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-verde/10 text-verde grid place-items-center shrink-0">
                      <Icono className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-verde leading-tight">
                          {r.residente.nombre}
                          {r.residente.casa_lote && (
                            <span className="text-texto-suave font-normal"> · {r.residente.casa_lote}</span>
                          )}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 ${est.clase}`}>
                          <est.icono className="w-3.5 h-3.5" />
                          {est.t}
                        </span>
                      </div>
                      <p className="text-texto mt-1">{r.descripcion}</p>
                      <p className="text-xs text-texto-suave mt-1">{haceCuanto(r.created_at)}</p>

                      {r.foto_url && (
                        <img
                          src={urlImagen(r.foto_url)}
                          alt="Foto del reporte"
                          className="mt-2 rounded-xl max-h-40 object-cover"
                        />
                      )}

                      {r.comentario_admin && (
                        <div className="mt-2 bg-verde/5 rounded-xl px-3 py-2 text-sm">
                          <span className="font-semibold text-verde">Su respuesta: </span>
                          {r.comentario_admin}
                        </div>
                      )}

                      {r.estado !== "resuelto" && (
                        <div className="mt-3">
                          <Boton variante="secundario" onClick={() => abrirGestion(r)} className="!min-h-10 text-sm">
                            <MessageSquareText className="w-4 h-4" />
                            Dar seguimiento
                          </Boton>
                        </div>
                      )}
                    </div>
                  </div>
                </Tarjeta>
              </CascadaItem>
            );
          })}
        </Cascada>
      )}

      {/* ---------- Dar seguimiento (panel deslizable) ---------- */}
      <HojaInferior
        abierta={!!seleccionado}
        onCerrar={() => !guardando && setSeleccionado(null)}
        titulo="Dar seguimiento"
      >
        {seleccionado && (
          <form onSubmit={guardar} className="space-y-4">
            <p className="text-sm text-texto-suave bg-black/[0.03] rounded-xl px-3 py-2">
              "{seleccionado.descripcion}"
            </p>

            <div>
              <label className="block text-sm font-medium mb-2">Nuevo estado</label>
              <div className="flex gap-2">
                {Object.entries(ESTADOS).map(([v, e]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setNuevoEstado(v)}
                    className={`flex-1 min-h-11 rounded-xl text-sm font-medium transition ${
                      nuevoEstado === v ? "bg-verde text-white" : "bg-white border border-black/10 text-texto-suave"
                    }`}
                  >
                    {e.t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mensaje para el residente (opcional)</label>
              <input
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Ej: El electricista va mañana por la mañana."
                className="w-full min-h-12 px-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-oro"
              />
            </div>

            <Boton type="submit" cargando={guardando} className="w-full">
              Guardar seguimiento
            </Boton>
          </form>
        )}
      </HojaInferior>
    </div>
  );
}
