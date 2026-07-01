// ===================================================================
// AdminEncuestas.jsx — Módulo 9 (vista admin): crear encuestas y ver resultados.
//
// El admin crea una encuesta con 2 a 5 opciones y una fecha de cierre.
// Aquí mismo ve los resultados en vivo y puede borrar encuestas viejas.
// ===================================================================

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Vote, Plus, Trash2, CalendarDays, Lock, X } from "lucide-react";
import { api } from "../../api/client";
import { Boton, Tarjeta, MensajeError, SkeletonLista, EstadoVacio } from "../../components/UI";
import HojaInferior from "../../components/HojaInferior";
import { Cascada, CascadaItem } from "../../components/Cascada";
import { fechaCorta, hoyISO } from "../../utils";

// Fecha por defecto para el cierre: dentro de una semana.
function enUnaSemanaISO() {
  const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

export default function AdminEncuestas() {
  const [encuestas, setEncuestas] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);

  const [pregunta, setPregunta] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [cierraEl, setCierraEl] = useState(enUnaSemanaISO());
  const [opciones, setOpciones] = useState(["Sí", "No"]);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  function cargar() {
    api.get("/encuestas").then(setEncuestas).catch(() => setEncuestas([]));
  }
  useEffect(cargar, []);

  function cambiarOpcion(i, valor) {
    setOpciones((prev) => prev.map((o, idx) => (idx === i ? valor : o)));
  }
  function agregarOpcion() {
    if (opciones.length < 5) setOpciones((prev) => [...prev, ""]);
  }
  function quitarOpcion(i) {
    if (opciones.length > 2) setOpciones((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function crear(e) {
    e.preventDefault();
    setError("");
    setGuardando(true);
    try {
      await api.post("/encuestas", {
        pregunta,
        descripcion: descripcion || null,
        cierra_el: cierraEl,
        opciones,
      });
      setPregunta("");
      setDescripcion("");
      setOpciones(["Sí", "No"]);
      setCierraEl(enUnaSemanaISO());
      cargar();
      setMostrarForm(false);
      toast.success("Encuesta publicada");
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
  }

  async function borrar(encuesta) {
    if (!confirm(`¿Borrar la encuesta "${encuesta.pregunta}"? Se pierden sus votos.`)) return;
    try {
      await api.borrar(`/encuestas/${encuesta.id}`);
      cargar();
      toast.success("Encuesta borrada");
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-verde">Encuestas</h1>
        <Boton onClick={() => setMostrarForm(true)}>
          <Plus className="w-5 h-5" />
          Nueva encuesta
        </Boton>
      </div>
      <p className="text-texto-suave mb-5">
        Consulte a la comunidad y vea los resultados en vivo.
      </p>

      {/* ---------- Crear encuesta (panel deslizable) ---------- */}
      <HojaInferior abierta={mostrarForm} onCerrar={() => setMostrarForm(false)} titulo="Nueva encuesta">
        <form onSubmit={crear} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Pregunta</label>
            <input
              required
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              placeholder="Ej: ¿Aprobamos repintar el portón principal?"
              className="w-full min-h-12 px-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-oro"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contexto (opcional)</label>
            <input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: El presupuesto ya está aprobado por la junta."
              className="w-full min-h-12 px-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-oro"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Opciones (2 a 5)</label>
            <div className="space-y-2">
              {opciones.map((o, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    required
                    value={o}
                    onChange={(e) => cambiarOpcion(i, e.target.value)}
                    placeholder={`Opción ${i + 1}`}
                    className="flex-1 min-w-0 min-h-12 px-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-oro"
                  />
                  {opciones.length > 2 && (
                    <button
                      type="button"
                      onClick={() => quitarOpcion(i)}
                      aria-label={`Quitar opción ${i + 1}`}
                      className="w-12 rounded-2xl border border-black/10 text-texto-suave hover:text-urgente transition grid place-items-center"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {opciones.length < 5 && (
              <button
                type="button"
                onClick={agregarOpcion}
                className="mt-2 text-sm text-verde font-medium hover:text-verde-profundo inline-flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Agregar opción
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Se puede votar hasta</label>
            <input
              type="date"
              required
              min={hoyISO()}
              value={cierraEl}
              onChange={(e) => setCierraEl(e.target.value)}
              className="w-full min-h-12 px-3 rounded-2xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-oro"
            />
          </div>

          <MensajeError mensaje={error} />
          <Boton type="submit" cargando={guardando}>
            <Vote className="w-5 h-5" />
            Publicar encuesta
          </Boton>
        </form>
      </HojaInferior>

      {/* ---------- Lista con resultados en vivo ---------- */}
      {encuestas === null ? (
        <SkeletonLista />
      ) : encuestas.length === 0 ? (
        <EstadoVacio
          icono={Vote}
          titulo="Aún no hay encuestas"
          descripcion="Cree la primera votación para la comunidad."
          accion={{ texto: "Nueva encuesta", onClick: () => setMostrarForm(true) }}
        />
      ) : (
        <Cascada className="space-y-4">
          {encuestas.map((e) => (
            <CascadaItem key={e.id}>
              <Tarjeta className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-verde leading-snug">{e.pregunta}</h2>
                    <p className="text-xs text-texto-suave mt-1 inline-flex items-center gap-1">
                      {e.abierta ? (
                        <>
                          <CalendarDays className="w-3.5 h-3.5" /> Abierta hasta el {fechaCorta(e.cierra_el)}
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" /> Cerrada el {fechaCorta(e.cierra_el)}
                        </>
                      )}
                      {" · "}{e.total_votos} {e.total_votos === 1 ? "voto" : "votos"}
                    </p>
                  </div>
                  <button
                    onClick={() => borrar(e)}
                    className="text-texto-suave hover:text-urgente transition p-1 shrink-0"
                    aria-label="Borrar encuesta"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {e.opciones.map((o) => {
                    const pct = e.total_votos > 0 ? Math.round((o.votos / e.total_votos) * 100) : 0;
                    return (
                      <div key={o.id} className="relative rounded-xl border border-black/5 overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 left-0 bg-verde/10"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                        />
                        <div className="relative flex items-center justify-between px-3 py-2 text-sm">
                          <span className="font-medium text-texto">{o.texto}</span>
                          <span className="text-texto-suave cifras-tabulares">
                            {o.votos} · <span className="font-bold text-verde">{pct}%</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Tarjeta>
            </CascadaItem>
          ))}
        </Cascada>
      )}
    </div>
  );
}
