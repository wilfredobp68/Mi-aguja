// ===================================================================
// AdminVisitantes.jsx — Módulo 3 (vista admin): log completo de visitantes.
//
// Tabla/lista con el historial: visitante, a quién visitó, quién lo registró,
// la decisión tomada y las horas. Solo lectura.
// ===================================================================

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { api } from "../../api/client";
import { Tarjeta, SkeletonLista, EstadoVacio } from "../../components/UI";
import { EtiquetaEstado } from "../../components/Etiquetas";
import { fechaHora } from "../../utils";

export default function AdminVisitantes() {
  const [visitantes, setVisitantes] = useState(null);

  useEffect(() => {
    api.get("/visitantes/log").then(setVisitantes).catch(() => setVisitantes([]));
  }, []);

  if (visitantes === null) return <SkeletonLista />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-verde mb-4">Historial de visitantes</h1>

      {visitantes.length === 0 ? (
        <EstadoVacio icono={Users} titulo="Aún no hay registros de visitantes" />
      ) : (
        <Tarjeta className="divide-y divide-black/5">
          {visitantes.map((v) => (
            <div key={v.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <p className="font-semibold text-verde">{v.nombre}</p>
                <p className="text-sm text-texto-suave">
                  Visitaba a {v.visita_a?.nombre}
                  {v.visita_a?.casa_lote ? ` (${v.visita_a.casa_lote})` : ""} · registró {v.guardia?.nombre}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-texto-suave cifras-tabulares">{fechaHora(v.hora_registro)}</span>
                <EtiquetaEstado estado={v.estado} />
              </div>
            </div>
          ))}
        </Tarjeta>
      )}
    </div>
  );
}
