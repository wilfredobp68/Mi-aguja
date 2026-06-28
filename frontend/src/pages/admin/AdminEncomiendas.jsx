// ===================================================================
// AdminEncomiendas.jsx — Módulo 5 (vista admin): historial de encomiendas.
//
// Lista todas las encomiendas anunciadas: empresa, residente, estado y horas.
// Solo lectura.
// ===================================================================

import { useEffect, useState } from "react";
import { Package } from "lucide-react";
import { api } from "../../api/client";
import { Tarjeta, SkeletonLista, EstadoVacio } from "../../components/UI";
import { fechaHora } from "../../utils";

export default function AdminEncomiendas() {
  const [encomiendas, setEncomiendas] = useState(null);

  useEffect(() => {
    api.get("/encomiendas/log").then(setEncomiendas).catch(() => setEncomiendas([]));
  }, []);

  if (encomiendas === null) return <SkeletonLista />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-verde mb-4">Historial de encomiendas</h1>

      {encomiendas.length === 0 ? (
        <EstadoVacio icono={Package} titulo="Aún no hay encomiendas registradas" />
      ) : (
        <Tarjeta className="divide-y divide-black/5">
          {encomiendas.map((e) => {
            const enCamino = e.estado === "en_camino";
            return (
              <div key={e.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-verde">{e.empresa || "Encomienda"}</p>
                  <p className="text-sm text-texto-suave">
                    {e.descripcion ? `${e.descripcion} · ` : ""}Para {e.residente?.nombre}
                    {e.residente?.casa_lote ? ` (${e.residente.casa_lote})` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-texto-suave cifras-tabulares">
                    {e.hora_ingreso ? `Ingresó: ${fechaHora(e.hora_ingreso)}` : `Anunciada: ${fechaHora(e.created_at)}`}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      enCamino ? "bg-alerta/15 text-alerta" : "bg-exito/15 text-exito"
                    }`}
                  >
                    {enCamino ? "En camino" : "Ingresó"}
                  </span>
                </div>
              </div>
            );
          })}
        </Tarjeta>
      )}
    </div>
  );
}
