// ===================================================================
// ResidenteReportes.jsx — Módulo 7 (vista residente): reportar problemas.
//
// El residente reporta un problema en las áreas comunes (una lámpara quebrada,
// una fuga...) con foto opcional, y aquí mismo ve el avance de sus reportes:
// Recibido → En proceso → Resuelto (con la respuesta de la administración).
// ===================================================================

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Wrench, Plus, Camera, Lightbulb, TreePine, Droplets, TrafficCone, ShieldAlert,
  CircleDot, Clock, CheckCircle2,
} from "lucide-react";
import { api, subirImagen, urlImagen } from "../../api/client";
import { Boton, Tarjeta, MensajeError, SkeletonLista, EstadoVacio } from "../../components/UI";
import HojaInferior from "../../components/HojaInferior";
import { Cascada, CascadaItem } from "../../components/Cascada";
import { haceCuanto } from "../../utils";

// Categorías del reporte, con su ícono (coinciden con el backend).
const CATEGORIAS = [
  { v: "alumbrado", t: "Alumbrado", icono: Lightbulb },
  { v: "jardineria", t: "Jardinería", icono: TreePine },
  { v: "agua", t: "Agua", icono: Droplets },
  { v: "calles", t: "Calles", icono: TrafficCone },
  { v: "seguridad", t: "Seguridad", icono: ShieldAlert },
  { v: "otro", t: "Otro", icono: Wrench },
];

// Cómo se ve cada estado (texto, color e ícono).
const ESTADOS = {
  recibido: { t: "Recibido", clase: "bg-oro/15 text-[#9a7d2e]", icono: CircleDot },
  en_proceso: { t: "En proceso", clase: "bg-sky-100 text-sky-700", icono: Clock },
  resuelto: { t: "Resuelto", clase: "bg-exito/15 text-exito", icono: CheckCircle2 },
};

export default function ResidenteReportes() {
  const [reportes, setReportes] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [categoria, setCategoria] = useState("otro");
  const [descripcion, setDescripcion] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  function cargar() {
    api.get("/reportes/mios").then(setReportes).catch(() => setReportes([]));
  }
  useEffect(cargar, []);

  async function crear(e) {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      // Si adjuntó foto, primero la subimos y usamos la URL que devuelve.
      let foto_url = null;
      if (archivo) {
        const subida = await subirImagen(archivo);
        foto_url = subida.url;
      }
      await api.post("/reportes", { categoria, descripcion, foto_url });
      setDescripcion("");
      setArchivo(null);
      setCategoria("otro");
      cargar();
      setMostrarForm(false);
      toast.success("Reporte enviado. ¡Gracias por avisar!");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-verde">Reportes</h1>
        <Boton onClick={() => setMostrarForm(true)}>
          <Plus className="w-5 h-5" />
          Reportar
        </Boton>
      </div>
      <p className="text-texto-suave mb-5">
        ¿Viste algo dañado en el residencial? Repórtalo y sigue el avance aquí.
      </p>

      {/* ---------- Crear un reporte (panel deslizable) ---------- */}
      <HojaInferior abierta={mostrarForm} onCerrar={() => setMostrarForm(false)} titulo="Nuevo reporte">
        <form onSubmit={crear} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">¿De qué tipo es?</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIAS.map((c) => (
                <button
                  key={c.v}
                  type="button"
                  onClick={() => setCategoria(c.v)}
                  className={`min-h-16 rounded-2xl text-xs font-medium flex flex-col items-center justify-center gap-1 transition ${
                    categoria === c.v
                      ? "bg-verde text-white"
                      : "bg-white border border-black/10 text-texto-suave"
                  }`}
                >
                  <c.icono className="w-5 h-5" />
                  {c.t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">¿Qué pasó y dónde?</label>
            <textarea
              required
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: La lámpara del parque central está parpadeando."
              className="w-full px-3 py-2.5 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-oro resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Foto (opcional)</label>
            <label className="flex items-center gap-2 min-h-12 px-3 rounded-2xl border border-dashed border-black/20 text-texto-suave cursor-pointer hover:border-oro transition">
              <Camera className="w-5 h-5" />
              <span className="text-sm truncate">
                {archivo ? archivo.name : "Tocar para adjuntar una foto"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setArchivo(e.target.files?.[0] || null)}
              />
            </label>
          </div>

          <MensajeError mensaje={error} />
          <Boton type="submit" cargando={guardando}>
            <Wrench className="w-5 h-5" />
            Enviar reporte
          </Boton>
        </form>
      </HojaInferior>

      {/* ---------- Mis reportes ---------- */}
      <h2 className="text-lg font-bold text-verde mb-3">Mis reportes</h2>
      {reportes === null ? (
        <SkeletonLista />
      ) : reportes.length === 0 ? (
        <EstadoVacio
          icono={Wrench}
          titulo="No has hecho reportes"
          descripcion="Si algo está dañado en el residencial, repórtalo aquí."
          accion={{ texto: "Reportar", onClick: () => setMostrarForm(true) }}
        />
      ) : (
        <Cascada className="space-y-3">
          {reportes.map((r) => {
            const cat = CATEGORIAS.find((c) => c.v === r.categoria) || CATEGORIAS[5];
            const est = ESTADOS[r.estado] || ESTADOS.recibido;
            return (
              <CascadaItem key={r.id}>
                <Tarjeta className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-verde/10 text-verde grid place-items-center shrink-0">
                      <cat.icono className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-oro">{cat.t}</p>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${est.clase}`}>
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

                      {/* Respuesta de la administración */}
                      {r.comentario_admin && (
                        <div className="mt-2 bg-verde/5 rounded-xl px-3 py-2 text-sm">
                          <span className="font-semibold text-verde">Administración: </span>
                          {r.comentario_admin}
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
    </div>
  );
}
