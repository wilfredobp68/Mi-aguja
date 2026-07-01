// ===================================================================
// ResidenteEncuestas.jsx — Módulo 9 (vista residente): votar en encuestas.
//
// El residente ve las encuestas de la comunidad. Si está abierta y no ha
// votado, toca una opción para votar. Después (o si ya cerró) ve los
// resultados con barras animadas.
// ===================================================================

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Vote, CheckCircle2, CalendarDays, Lock } from "lucide-react";
import { api } from "../../api/client";
import { Tarjeta, SkeletonLista, EstadoVacio } from "../../components/UI";
import { Cascada, CascadaItem } from "../../components/Cascada";
import { fechaCorta } from "../../utils";

export default function ResidenteEncuestas() {
  const [encuestas, setEncuestas] = useState(null);
  const [votando, setVotando] = useState(null); // id de la opción que se está votando

  function cargar() {
    api.get("/encuestas").then(setEncuestas).catch(() => setEncuestas([]));
  }
  useEffect(cargar, []);

  async function votar(encuesta, opcion) {
    setVotando(opcion.id);
    try {
      const actualizada = await api.post(`/encuestas/${encuesta.id}/votar`, { opcion_id: opcion.id });
      // Reemplazamos la encuesta por la versión con mi voto y el nuevo conteo.
      setEncuestas((lista) => lista.map((e) => (e.id === actualizada.id ? actualizada : e)));
      toast.success("¡Voto registrado!");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setVotando(null);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-verde mb-1">Encuestas</h1>
      <p className="text-texto-suave mb-5">Su voz cuenta: vote en las decisiones de la comunidad.</p>

      {encuestas === null ? (
        <SkeletonLista />
      ) : encuestas.length === 0 ? (
        <EstadoVacio
          icono={Vote}
          titulo="No hay encuestas por ahora"
          descripcion="Cuando la administración abra una votación, aparecerá aquí."
        />
      ) : (
        <Cascada className="space-y-4">
          {encuestas.map((e) => {
            const yaVote = e.mi_voto !== null;
            const muestraResultados = yaVote || !e.abierta;
            return (
              <CascadaItem key={e.id}>
                <Tarjeta className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-lg font-bold text-verde leading-snug">{e.pregunta}</h2>
                    {!e.abierta && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/5 text-texto-suave text-xs font-semibold shrink-0">
                        <Lock className="w-3 h-3" /> Cerrada
                      </span>
                    )}
                  </div>
                  {e.descripcion && <p className="text-sm text-texto-suave mt-1">{e.descripcion}</p>}
                  <p className="text-xs text-texto-suave mt-1 inline-flex items-center gap-1">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {e.abierta ? `Vota hasta el ${fechaCorta(e.cierra_el)}` : `Cerró el ${fechaCorta(e.cierra_el)}`}
                    {" · "}{e.total_votos} {e.total_votos === 1 ? "voto" : "votos"}
                  </p>

                  <div className="mt-4 space-y-2">
                    {muestraResultados
                      ? /* ---------- Resultados con barras animadas ---------- */
                        e.opciones.map((o) => {
                          const pct = e.total_votos > 0 ? Math.round((o.votos / e.total_votos) * 100) : 0;
                          const esMiVoto = e.mi_voto === o.id;
                          return (
                            <div key={o.id} className="relative rounded-xl border border-black/5 overflow-hidden">
                              {/* La barra que crece */}
                              <motion.div
                                className={`absolute inset-y-0 left-0 ${esMiVoto ? "bg-oro/30" : "bg-verde/10"}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                              />
                              <div className="relative flex items-center justify-between px-3 py-2.5 text-sm">
                                <span className="font-medium text-texto inline-flex items-center gap-1.5">
                                  {esMiVoto && <CheckCircle2 className="w-4 h-4 text-oro" />}
                                  {o.texto}
                                </span>
                                <span className="font-bold text-verde cifras-tabulares">{pct}%</span>
                              </div>
                            </div>
                          );
                        })
                      : /* ---------- Botones para votar ---------- */
                        e.opciones.map((o) => (
                          <button
                            key={o.id}
                            disabled={votando !== null}
                            onClick={() => votar(e, o)}
                            className="w-full min-h-12 px-4 rounded-xl border border-verde/25 text-verde font-medium text-left hover:bg-verde/5 active:scale-[0.99] transition disabled:opacity-60"
                          >
                            {votando === o.id ? "Registrando voto..." : o.texto}
                          </button>
                        ))}
                  </div>

                  {yaVote && e.abierta && (
                    <p className="text-xs text-exito font-medium mt-3 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ya votaste en esta encuesta
                    </p>
                  )}
                </Tarjeta>
              </CascadaItem>
            );
          })}
        </Cascada>
      )}
    </div>
  );
}
